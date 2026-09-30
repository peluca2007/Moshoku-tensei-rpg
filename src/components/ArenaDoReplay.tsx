"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronsRight, Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import type { CharacterData } from "@/lib/types";
import type { AtorDoReplay, CriaturaEncontro, LogCombate, QuadroDoReplay } from "@/lib/encounterSim";
import type { EventoAtaque } from "@/lib/combatTrace";
import { getRaceById } from "@/data/races";
import { CRIATURAS_PRONTAS } from "@/data/bestiary";
import {
  FORMAS_A_DISTANCIA, formaDoGolpe, montarPassos, partesDoNome, placarDaBatalha, reacoesDoPasso,
  type FormaDoGolpe, type PlacarDaBatalha, type TipoDeReacao,
} from "@/lib/passosDoReplay";
import { sonsDoPasso, type Toque } from "@/lib/sonsDaArena";
import { tocar, useSomDaArena } from "@/lib/tocadorDaArena";
import { narrarArea, narrarGolpe, narrarLinha } from "@/lib/narracaoDaArena";
import { useBestiaryStore } from "@/store/useBestiaryStore";
import estilo from "./ArenaDoReplay.module.css";

/**
 * O replay em 2.5D de uma batalha notável.
 *
 * Não simula nada: só toca os quadros que `replayBatalha` gravou (PV, queda e
 * posição depois de cada linha do log). A profundidade da cena É a linha de
 * combate do livro — o grupo na frente, as criaturas ao fundo, e a distância
 * em metros entre as duas. Não há grid, porque o livro não tem grid.
 */

const VELOCIDADES = [1, 2, 4] as const;
/** Acima disto, o lado vai para duas fileiras: dez cartões numa só escondem o PV. */
const POR_FILEIRA = 6;

interface Posto {
  x: number;
  /** 0 = colado na câmera, 1 = fundo da arena. */
  profundidade: number;
}

export default function ArenaDoReplay({ log, grupo, criaturas, tocarAoAbrir = false }: {
  log: LogCombate;
  grupo: CharacterData[];
  criaturas: CriaturaEncontro[];
  /** A batalha nova já começa tocando: quem pediu quer assistir. */
  tocarAoAbrir?: boolean;
}) {
  const replay = log.replay!;
  const { atores, quadros } = replay;
  const passos = useMemo(() => montarPassos(quadros, log.eventos), [quadros, log.eventos]);
  const placar = useMemo(() => placarDaBatalha(log), [log]);
  // `animar` só é verdadeiro quando o passo chegou andando UM para frente:
  // pular na linha do tempo ou voltar mostra a cena pronta.
  const [{ indice, animar: avancouUm }, setPasso] = useState({ indice: 0, animar: false });
  const [pediuTocar, setTocando] = useState(tocarAoAbrir);
  const [velocidade, setVelocidade] = useState<(typeof VELOCIDADES)[number]>(1);
  const irPara = (i: number, animar = false) => setPasso({ indice: Math.max(0, Math.min(passos.length - 1, i)), animar });

  const passo = passos[indice];
  const quadro = quadros[passo.ate];
  const quadroAnterior = passo.de > 0 ? quadros[passo.de - 1] : undefined;
  const eventos = passo.eventos;
  const evento = eventos[0];
  const texto = (log.linhas[quadro.linha] ?? "").trim();
  const ehRodada = /^--- Rodada/.test(texto);
  const ultimo = indice === passos.length - 1;
  const tocando = pediuTocar && !ultimo;
  const proximaRodada = passos.findIndex((p, i) => i > indice && quadros[p.ate].rodada > quadro.rodada);
  const reacoes = useMemo(() => reacoesDoPasso(texto, eventos), [texto, eventos]);
  // Aparar e Fluxo são o "clang" da árvore da Água: a cena prende o fôlego um instante.
  const congela = reacoes.some((r) => r.tipo === "aparar" || r.tipo === "fluxo" || r.tipo === "devolver");

  useEffect(() => {
    if (!tocando) return;
    const pausa = (congela ? 1500 : reacoes.length ? 1300 : evento ? 1150 : ehRodada ? 950 : 600) / velocidade;
    const t = setTimeout(() => setPasso((p) => ({ indice: Math.min(p.indice + 1, passos.length - 1), animar: true })), pausa);
    return () => clearTimeout(t);
  }, [tocando, indice, velocidade, evento, ehRodada, passos.length, congela, reacoes.length]);

  // A proporção do palco, para a flecha apontar para onde voa.
  const palco = useRef<HTMLDivElement>(null);
  const [proporcao, setProporcao] = useState(1.6);
  useEffect(() => {
    const el = palco.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const medir = () => { if (el.clientHeight) setProporcao(el.clientWidth / el.clientHeight); };
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const imagens = useMemo(() => imagensDosAtores(atores, grupo, criaturas), [atores, grupo, criaturas]);
  const vaoInicial = useMemo(() => vaoDaLinha(quadros), [quadros]);
  const postos = postosDaCena(atores, quadro, vaoInicial);
  const fundo = grupo.find((c) => c.cover)?.cover;

  const indiceDoNome = (nome?: string) => (nome === undefined ? -1 : atores.findIndex((a) => a.nome === nome));
  const quemAge = indiceDoNome(evento?.atacante);
  const atacante = avancouUm ? quemAge : -1;
  // O recibo de cada alvo do passo, por índice de ator.
  const golpeEm = new Map<number, EventoAtaque>();
  if (avancouUm) for (const e of eventos) golpeEm.set(indiceDoNome(e.alvo), e);
  golpeEm.delete(-1);
  // A investida vai até o meio dos alvos: num golpe em área, ninguém é favorito.
  const destinos = [...golpeEm.keys()].map((i) => postos[i]).filter((p): p is Posto => !!p);
  const centro = destinos.length ? {
    x: media(destinos.map((p) => p.x))!,
    profundidade: media(destinos.map((p) => p.profundidade))!,
  } : undefined;
  const fileira = Math.max(3, ...contagemPorLado(atores, quadro).map(tamanhoDaFileira));
  const distancia = distanciaEntreLados(atores, quadro);
  const elemento = evento ? elementoDoGolpe(evento) : undefined;
  const narracao = eventos.length > 1 ? narrarArea(eventos) : evento ? narrarGolpe(evento) : narrarLinha(texto);
  // "Brasa" não diz "ígneo" na fórmula, mas o efeito já sabe que é fogo pelo
  // nome: sem arma e com elemento mágico, o golpe é feitiço, e feitiço voa.
  const formaBruta = evento ? formaDoGolpe(evento) : undefined;
  const forma = formaBruta === "golpe" && elemento && !evento?.arma && !ELEMENTOS_FISICOS.has(elemento) ? "magia" : formaBruta;
  const aDistancia = !!forma && FORMAS_A_DISTANCIA.has(forma);
  const reacoesDe = (i: number) => reacoes.filter((r) => indiceDoNome(r.quem) === i);
  const protegidoPor = (i: number) => reacoes.filter((r) => r.alvos.some((a) => indiceDoNome(a) === i));
  // Guarda do Corpo: quem reage corre até o aliado que protege.
  const guarda = avancouUm ? reacoes.find((r) => r.tipo === "guarda") : undefined;
  const guardiao = guarda ? indiceDoNome(guarda.quem) : -1;
  const protegidoDaGuarda = guarda ? postos[indiceDoNome(guarda.alvos[0])] : undefined;
  // Projéteis: o golpe a distância e o Fluxo que devolve água em quem errou.
  const projeteis: { de: Posto; para: Posto; forma: FormaDoGolpe; cor: string; chave: string }[] = [];
  if (avancouUm && aDistancia && atacante >= 0 && postos[atacante]) {
    for (const [i, e] of golpeEm) {
      if (postos[i]) projeteis.push({ de: postos[atacante]!, para: postos[i]!, forma: forma!, cor: ELEMENTOS[elementoDoGolpe(e)].cor, chave: `p${i}` });
    }
  }
  const [somLigado, alternarSom] = useSomDaArena();
  const vozes = useBestiaryStore((s) => s.configuracao.vozes);
  const origemDoAtacante = evento ? atores[quemAge]?.origem : undefined;
  const curou = !evento && !!quadroAnterior && quadro.pv.some((pv, i) => (quadroAnterior.pv[i] ?? pv) < pv);
  // Em texto, para o efeito só disparar quando o passo muda de verdade (um
  // array novo a cada render tocaria o mesmo golpe de novo a cada clique).
  const partitura = JSON.stringify(sonsDoPasso({
    forma, elemento, eventos, reacoes, linha: texto, curou, semente: indice,
    vozDoAtacante: origemDoAtacante && atores[quemAge]?.lado === "grupo" ? vozes?.[origemDoAtacante] : undefined,
  }));
  // Só toca quando o passo chegou andando: pular na linha do tempo fica mudo.
  useEffect(() => {
    if (!somLigado || !avancouUm) return;
    return tocar(JSON.parse(partitura) as Toque[], velocidade);
  }, [somLigado, avancouUm, partitura, velocidade, indice]);

  if (avancouUm) {
    for (const r of reacoes.filter((x) => x.tipo === "fluxo")) {
      const de = postos[indiceDoNome(r.quem)];
      const para = postos[indiceDoNome(r.alvos[0])];
      if (de && para) projeteis.push({ de, para, forma: "magia", cor: ELEMENTOS.agua.cor, chave: `f${r.quem}` });
    }
  }

  function teclado(e: React.KeyboardEvent<HTMLDivElement>) {
    // Só o palco em foco responde; o botão e o controle deslizante têm teclas próprias.
    if (e.target !== e.currentTarget) return;
    const acoes: Record<string, () => void> = {
      " ": () => { if (ultimo) irPara(0); setTocando(!tocando); },
      ArrowRight: () => { setTocando(false); irPara(indice + 1, true); },
      ArrowLeft: () => { setTocando(false); irPara(indice - 1); },
      PageDown: () => { if (proximaRodada >= 0) { setTocando(false); irPara(proximaRodada); } },
      Home: () => { setTocando(false); irPara(0); },
      End: () => { setTocando(false); irPara(passos.length - 1); },
    };
    const acao = acoes[e.key];
    if (!acao) return;
    e.preventDefault();
    acao();
  }

  return <div className="space-y-2">
    <div
      ref={palco}
      className={`${estilo.palco} ${avancouUm && congela ? estilo.congela : ""} aspect-[4/5] w-full sm:aspect-[16/10]`}
      tabIndex={0}
      role="group"
      aria-roledescription="arena"
      aria-label="Arena da batalha. Espaço toca ou pausa; setas passam um passo; Page Down pula para a próxima rodada."
      aria-keyshortcuts="Space ArrowRight ArrowLeft PageDown Home End"
      onKeyDown={teclado}
    >
      {fundo && <div className={estilo.fundo} style={{ backgroundImage: `url(${fundo})` }} aria-hidden />}
      <div className={estilo.chao} aria-hidden><div className={estilo.linha} /></div>
      {distancia !== undefined && <span className={estilo.distancia} style={{ top: `${topo(0.5)}%` }}>{formatarMetros(distancia)}</span>}

      {atores.map((ator, i) => {
        const posto = postos[i];
        if (!posto) return null;
        const pv = quadro.pv[i];
        const caido = !quadro.vivo[i];
        const golpe = golpeEm.get(i);
        const rumo = i === atacante && centro && !aDistancia ? centro : i === guardiao ? protegidoDaGuarda : undefined;
        const lunge = rumo ? {
          "--dx": `${(rumo.x - posto.x) * 0.45}cqw`,
          "--dy": `${(topo(rumo.profundidade) - topo(posto.profundidade)) * 0.45}cqh`,
        } : {};
        // O golpe a distância só "chega" quando o projétil chega.
        const atraso = golpe && aDistancia ? { "--atraso": "440ms" } : {};
        // De que lado vem a arma: a espada varre e o soco entra a partir do atacante.
        const de = atacante >= 0 && postos[atacante] ? { "--de": postos[atacante]!.x <= posto.x ? 1 : -1 } : {};
        const minhasReacoes = reacoesDe(i);
        const aneis: TipoDeReacao[] = avancouUm ? [...minhasReacoes.map((r) => r.tipo), ...protegidoPor(i).map((r) => r.tipo)] : [];
        const pct = Math.max(0, Math.min(1, pv / ator.pvMax));
        const escala = 1.05 - posto.profundidade * 0.45;
        const { base, numero } = partesDoNome(ator.nome);
        // Quem avança leva o standee inteiro (nome e PV junto); a chave nova
        // por passo é o que faz a investida tocar de novo a cada golpe.
        const avanca = i === atacante ? (aDistancia ? estilo.dispara : estilo.investida) : i === guardiao ? estilo.investida : "";
        return <div
          key={avanca ? `${i}-${indice}` : i}
          className={`${estilo.standee} ${estilo[ator.lado]} ${caido ? estilo.caido : ""} ${i === quemAge ? estilo.agindo : ""} ${avanca}`}
          style={{
            left: `${posto.x}%`, top: `${topo(posto.profundidade)}%`,
            "--elemento": elemento ? ELEMENTOS[elemento].cor : undefined,
            zIndex: Math.round((1 - posto.profundidade) * 40) + 2,
            "--tamanho": `min(${ator.invocado ? 80 : 110}px, ${(ator.invocado ? 52 : 70) / fileira}cqw)`, "--escala": escala,
            ...lunge, ...atraso, ...de,
          } as unknown as CSSProperties}
        >
          <div className={estilo.corpo}>
            <div key={golpe || aneis.length ? `a${indice}` : "parado"} className={[
              golpe ? (golpe.acertou ? estilo.apanha : estilo.esquiva) : "",
              avancouUm && minhasReacoes.length ? estilo.reagindo : "",
            ].join(" ")}>
              <div className={estilo.cartao}>
                {imagens[i]
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={imagens[i]} alt="" draggable={false} />
                  : <span className={estilo.inicial}>{ator.nome.charAt(0).toUpperCase()}</span>}
                {ator.invocado && <span className={estilo.selo} title="Invocação">✦</span>}
              </div>
              <div className={estilo.base} />
            </div>
            {golpe?.acertou && <Efeito key={`e${indice}`} elemento={elementoDoGolpe(golpe)} />}
            {golpe && forma && !aDistancia && forma !== "golpe" && <ArmaNoAlvo key={`w${indice}`} forma={forma} />}
            {aneis.map((tipo, n) => <span key={`${tipo}${n}${indice}`} className={estilo.anel} data-tipo={tipo} aria-hidden>
              {tipo === "aparar" && <SvgDaArma forma="espada" />}
              {tipo === "refrao" && <><i>♪</i><i>♫</i><i>♪</i></>}
            </span>)}
          </div>
          {minhasReacoes.map((r, n) => <span key={`s${n}${indice}`} className={estilo.seloReacao} data-tipo={r.tipo}>{r.nome}!</span>)}
          {/* O número da cópia nunca some: "Sapo-Lodo Gi… 2" continua distinguível. */}
          <p className={estilo.nome} title={ator.nome}><span>{base}</span>{numero && <b>{numero}</b>}</p>
          <div className={estilo.barra} title={`${pv}/${ator.pvMax} PV`}>
            <span style={{ width: `${pct * 100}%` }} data-nivel={pct > 0.5 ? "alto" : pct > 0.25 ? "meio" : "baixo"} />
          </div>
          {avancouUm && <Numero key={`n${indice}`} ator={i} quadro={quadro} anterior={quadroAnterior} evento={golpe} />}
        </div>;
      })}

      {projeteis.map((p) => <Projetil key={`${p.chave}${indice}`} {...p} proporcao={proporcao} />)}

      {avancouUm && ehRodada && <div key={`r${indice}`} className={estilo.faixa}>Rodada {quadro.rodada}</div>}
      {ultimo && <div className={estilo.fim}>{log.categoria}</div>}
    </div>

    <div className="min-h-[2.75rem] rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-xs text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-200" aria-live={tocando ? "off" : "polite"}>
      <span className="mr-2 font-bold text-wine-700 dark:text-wine-300">R{quadro.rodada || 0}</span>
      {eventos.length > 0 && reacoes.map((r, n) => <span key={n} className="mr-1.5 inline-block rounded-full bg-sky-700 px-1.5 text-2xs font-bold text-white">Reação: {r.nome}</span>)}
      {elemento && eventos.some((e) => e.acertou) && <span className="mr-1.5 inline-block rounded-full px-1.5 text-2xs font-bold text-white" style={{ background: ELEMENTOS[elemento].cor }}>{ELEMENTOS[elemento].nome}</span>}
      {narracao.frase}
      {/* A conta do motor continua a um toque: a frase é para a mesa, a conta é para quem confere. */}
      {narracao.conta && <details className="mt-1">
        <summary className="cursor-pointer text-2xs font-semibold text-parchment-600 dark:text-parchment-400">ver a conta</summary>
        <p className="mt-1 whitespace-pre-wrap break-words font-mono text-2xs text-parchment-700 dark:text-parchment-300">{narracao.conta}</p>
      </details>}
    </div>

    {ultimo && <Placar placar={placar} />}

    <div className="flex flex-wrap items-center gap-2">
      <BotaoArena rotulo="Recomeçar" onClick={() => { setTocando(false); irPara(0); }}><RotateCcw className="h-4 w-4" /></BotaoArena>
      <BotaoArena rotulo="Voltar um passo" onClick={() => { setTocando(false); irPara(indice - 1); }}><SkipBack className="h-4 w-4" /></BotaoArena>
      <button
        type="button"
        onClick={() => { if (ultimo) irPara(0); setTocando(!tocando); }}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-wine-700 px-4 text-sm font-bold text-parchment-50 hover:bg-wine-800"
      >
        {tocando ? <><Pause className="h-4 w-4" /> Pausar</> : <><Play className="h-4 w-4" /> {ultimo ? "Ver de novo" : "Assistir"}</>}
      </button>
      <BotaoArena rotulo="Avançar um passo" onClick={() => { setTocando(false); irPara(indice + 1, true); }}><SkipForward className="h-4 w-4" /></BotaoArena>
      <BotaoArena rotulo={somLigado ? "Desligar o som da arena" : "Ligar o som da arena"} ativo={somLigado} onClick={alternarSom}>
        {somLigado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </BotaoArena>
      <BotaoArena rotulo="Próxima rodada" desativado={proximaRodada < 0} onClick={() => { setTocando(false); irPara(proximaRodada); }}><ChevronsRight className="h-4 w-4" /></BotaoArena>
      <button
        type="button"
        onClick={() => setVelocidade(VELOCIDADES[(VELOCIDADES.indexOf(velocidade) + 1) % VELOCIDADES.length])}
        className="min-h-11 rounded-lg border border-parchment-300 px-3 text-sm font-semibold dark:border-parchment-700"
        aria-label={`Velocidade ${velocidade}x; tocar para mudar`}
      >{velocidade}×</button>
      <input
        type="range" min={0} max={passos.length - 1} value={indice}
        onChange={(e) => { setTocando(false); irPara(Number(e.target.value)); }}
        aria-label="Linha do tempo da batalha"
        aria-valuetext={`Rodada ${quadro.rodada || 0}, passo ${indice + 1} de ${passos.length}`}
        className="min-w-0 flex-1 basis-40 accent-wine-700"
      />
    </div>
    <p className="hidden text-2xs text-parchment-600 sm:block dark:text-parchment-400">
      Clique na arena para usar o teclado: <kbd>Espaço</kbd> toca ou pausa, <kbd>←</kbd> <kbd>→</kbd> passam um passo, <kbd>Page Down</kbd> pula para a próxima rodada.
    </p>
  </div>;
}

/** O que a mesa comenta quando a luta acaba. Aparece no último passo. */
function Placar({ placar }: { placar: PlacarDaBatalha }) {
  const { destaque, maiorGolpe, quedas } = placar;
  const caixa = "rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 dark:border-parchment-700 dark:bg-parchment-950";
  const rotulo = "block text-2xs font-bold uppercase tracking-wider text-wine-700 dark:text-wine-300";
  return <section aria-label="Placar da batalha" className="grid gap-2 text-xs text-parchment-800 sm:grid-cols-3 dark:text-parchment-200">
    <div className={caixa}>
      <span className={rotulo}>Destaque do grupo</span>
      {destaque ? <><b>{destaque.nome}</b> · {destaque.dano} PV tirados dos inimigos</> : "Ninguém do grupo tirou PV."}
    </div>
    <div className={caixa}>
      <span className={rotulo}>Maior golpe</span>
      {maiorGolpe
        ? <><b>{maiorGolpe.atacante}</b>, {maiorGolpe.acao} em {maiorGolpe.alvo}: <b>{maiorGolpe.dano} PV</b>{maiorGolpe.critico ? " (crítico)" : ""}</>
        : "Nenhum golpe tirou PV."}
    </div>
    <div className={caixa}>
      <span className={rotulo}>Quedas</span>
      {quedas.length
        ? quedas.map((q, i) => <span key={q.nome} className={q.lado === "grupo" ? "text-rose-700 dark:text-rose-300" : ""}>
            {i > 0 && ", "}{q.nome} (R{q.rodada})
          </span>)
        : "Ninguém caiu."}
    </div>
    {placar.porPersonagem.length > 0 && <div className={`${caixa} overflow-x-auto sm:col-span-3`}>
      <span className={rotulo}>O grupo, um por um</span>
      <table className="mt-1 w-full text-left">
        <thead className="text-2xs uppercase text-parchment-600 dark:text-parchment-400">
          <tr>
            <th className="py-0.5 pr-2 font-semibold">Personagem</th>
            <th className="py-0.5 pr-2 text-right font-semibold">Dano</th>
            <th className="py-0.5 pr-2 text-right font-semibold">Acertos</th>
            <th className="hidden py-0.5 pr-2 text-right font-semibold sm:table-cell">Cura</th>
            <th className="hidden py-0.5 pr-2 text-right font-semibold sm:table-cell">Reações</th>
            <th className="py-0.5 pr-2 text-right font-semibold">Perdeu</th>
            <th className="py-0.5 text-right font-semibold">Fim</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {placar.porPersonagem.map((l) => <tr key={l.nome} className="border-t border-parchment-300 dark:border-parchment-800">
            <td className="py-1 pr-2 font-sans font-semibold">{l.nome}</td>
            <td className="py-1 pr-2 text-right">{l.dano}</td>
            <td className="py-1 pr-2 text-right">{l.acertos}/{l.tentativas}</td>
            <td className="hidden py-1 pr-2 text-right sm:table-cell">{l.cura || "—"}</td>
            <td className="hidden py-1 pr-2 text-right sm:table-cell">{l.reacoes || "—"}</td>
            <td className="py-1 pr-2 text-right">{l.recebido}</td>
            <td className={`py-1 text-right font-sans ${l.caiuNaRodada ? "text-rose-700 dark:text-rose-300" : ""}`}>{l.caiuNaRodada ? `caiu R${l.caiuNaRodada}` : "de pé"}</td>
          </tr>)}
        </tbody>
      </table>
    </div>}
  </section>;
}

function BotaoArena({ rotulo, onClick, desativado = false, ativo, children }: {
  rotulo: string; onClick: () => void; desativado?: boolean; ativo?: boolean; children: React.ReactNode;
}) {
  return <button type="button" onClick={onClick} aria-label={rotulo} title={rotulo} disabled={desativado} aria-pressed={ativo}
    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-parchment-300 disabled:opacity-40 aria-pressed:border-wine-600 aria-pressed:text-wine-700 dark:border-parchment-700 dark:aria-pressed:text-wine-300">
    {children}
  </button>;
}

/**
 * O efeito de impacto por tipo de dano. Só visual: lê o texto de tipo que o
 * recibo carrega (e, na falta, o nome da ação) e nunca decide regra nenhuma.
 */
const ELEMENTOS = {
  fogo: { nome: "Fogo", cor: "#e8620f", particulas: 9 },
  gelo: { nome: "Gelo", cor: "#3a9fd6", particulas: 8 },
  agua: { nome: "Água", cor: "#2f7fd0", particulas: 8 },
  raio: { nome: "Raio", cor: "#c79a00", particulas: 6 },
  veneno: { nome: "Veneno", cor: "#4f8f25", particulas: 7 },
  som: { nome: "Som", cor: "#8f5fd6", particulas: 3 },
  luz: { nome: "Luz", cor: "#b8860b", particulas: 8 },
  arcano: { nome: "Arcano", cor: "#8446bf", particulas: 7 },
  terra: { nome: "Terra", cor: "#8a5a2b", particulas: 7 },
  corte: { nome: "Corte", cor: "#5f6570", particulas: 1 },
  impacto: { nome: "Impacto", cor: "#8f5a24", particulas: 6 },
} as const;
type Elemento = keyof typeof ELEMENTOS;
const ELEMENTOS_FISICOS: ReadonlySet<Elemento> = new Set(["corte", "impacto"]);

const PISTAS: [Elemento, RegExp][] = [
  ["fogo", /ígne|igne|fogo|chama|brasa|incend|lava|calor|queima/],
  ["gelo", /frio|gelo|congel|neve|glacial/],
  ["raio", /elétr|eletr|raio|trov|relâmp|relamp/],
  ["veneno", /veneno|ácid|acid|tóxic|toxic|dose|peçonh|inverter/],
  ["som", /sônic|sonic|canç|canc|grito|refrão|refrao|melodia|insulto/],
  ["luz", /radiant|sagrad|divin|luz/],
  ["arcano", /psíq|psiq|arcan|mágic|magic|teóric|teoric/],
  ["agua", /água|agua|onda|maré|mare|jato|torrente|fluxo/],
  ["terra", /terra|pedra|barro|rocha|lama|lodo/],
  ["impacto", /contundente|martelo|soco|punho|clava|pancada|mordida|investida/],
];

function elementoDoGolpe(e: EventoAtaque): Elemento {
  const tipo = (e.tipoDeDano ?? "").toLowerCase();
  const nome = e.acao.toLowerCase();
  // O tipo declarado manda; o nome da ação só desempata quando não há tipo.
  for (const texto of [tipo, nome]) {
    const achado = PISTAS.find(([, re]) => re.test(texto));
    if (achado) return achado[0];
  }
  return "corte";
}

function Efeito({ elemento }: { elemento: Elemento }) {
  const { particulas } = ELEMENTOS[elemento];
  return <div className={estilo.efeito} data-elemento={elemento} aria-hidden>
    <span className={estilo.tinta} />
    {Array.from({ length: particulas }, (_, i) => <i key={i} style={{
      "--a": `${(i * 360) / particulas + ((i * 37) % 23) - 11}deg`,
      "--i": i,
    } as CSSProperties} />)}
    {elemento === "raio" && <svg viewBox="0 0 20 60" className={estilo.relampago}><path d="M12 0 4 26h7L6 60l12-36h-7z" /></svg>}
  </div>;
}

/**
 * A arma desenhada. SVG simples e chapado, no espírito dos standees de papel:
 * a mesa reconhece a espada, o martelo e o punho de relance.
 */
function SvgDaArma({ forma }: { forma: FormaDoGolpe }) {
  switch (forma) {
    case "espada":
      return <svg viewBox="0 0 20 100" aria-hidden><path d="M10 0 14 68H6z" fill="#eef3f8" stroke="#8a97a6" strokeWidth="1.5" /><rect x="1" y="68" width="18" height="5" rx="2" fill="#c9a24a" /><rect x="7.5" y="73" width="5" height="19" fill="#6b4a2b" /><circle cx="10" cy="95" r="4" fill="#c9a24a" /></svg>;
    case "martelo":
      return <svg viewBox="0 0 60 100" aria-hidden><rect x="26" y="20" width="8" height="80" rx="3" fill="#7a5230" /><rect x="4" y="2" width="52" height="26" rx="4" fill="#9aa3ad" stroke="#5d6570" strokeWidth="2" /></svg>;
    case "lanca":
      return <svg viewBox="0 0 120 20" aria-hidden><rect x="0" y="8" width="96" height="4" rx="2" fill="#7a5230" /><path d="M94 2 120 10 94 18z" fill="#dfe6ee" stroke="#8a97a6" strokeWidth="1.5" /></svg>;
    case "soco":
      return <svg viewBox="0 0 44 36" aria-hidden><rect x="2" y="4" width="32" height="28" rx="10" fill="#f1c9a0" stroke="#7a4a2a" strokeWidth="2.5" /><path d="M12 6v11M20 5v12M28 6v11" stroke="#7a4a2a" strokeWidth="2" strokeLinecap="round" /><rect x="31" y="12" width="10" height="14" rx="5" fill="#f1c9a0" stroke="#7a4a2a" strokeWidth="2.5" /></svg>;
    case "mordida":
      return <svg viewBox="0 0 60 60" aria-hidden>
        <g><path d="M4 26Q30 0 56 26z" fill="#5a1a1a" /><path d="M10 25l4 9 4-9 4 9 4-9 4 9 4-9 4 9 4-9 4 9 4-9z" fill="#fff8e8" /></g>
        <g><path d="M4 34Q30 60 56 34z" fill="#5a1a1a" /><path d="M10 35l4-9 4 9 4-9 4 9 4-9 4 9 4-9 4 9 4-9 4 9z" fill="#fff8e8" /></g>
      </svg>;
    case "garra":
      return <svg viewBox="0 0 60 60" aria-hidden><path d="M8 6q14 26 6 50M24 4q14 26 6 52M40 6q14 26 6 50" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" /></svg>;
    case "flecha":
      return <svg viewBox="0 0 60 12" aria-hidden><rect x="6" y="5" width="44" height="2" fill="#7a5230" /><path d="M48 1 60 6 48 11z" fill="#cfd6de" /><path d="M0 1h10l-4 5 4 5H0l3-5z" fill="#c94040" /></svg>;
    case "arremesso":
      return <svg viewBox="0 0 30 30" aria-hidden><path d="M15 0 18 18h-6z" fill="#dfe6ee" stroke="#8a97a6" /><rect x="11" y="18" width="8" height="3" fill="#c9a24a" /><rect x="13.5" y="21" width="3" height="8" fill="#6b4a2b" /></svg>;
    default:
      return null;
  }
}

/** A arma aparecendo sobre quem apanha, no golpe corpo a corpo. */
function ArmaNoAlvo({ forma }: { forma: FormaDoGolpe }) {
  return <div className={estilo.arma} data-forma={forma} aria-hidden><SvgDaArma forma={forma} /></div>;
}

/**
 * O que atravessa a arena: flecha, faca girando, feitiço, ou a água do Fluxo.
 * Sai do peito de quem lança e para no peito de quem recebe.
 */
function Projetil({ de, para, forma, cor, proporcao }: {
  de: Posto; para: Posto; forma: FormaDoGolpe; cor: string; proporcao: number;
}) {
  const peito = (p: Posto) => topo(p.profundidade) - 9 * (1.05 - p.profundidade * 0.45);
  const dx = para.x - de.x;
  const dy = peito(para) - peito(de);
  const angulo = (Math.atan2(dy, dx * proporcao) * 180) / Math.PI;
  return <div className={estilo.projetil} data-forma={forma} aria-hidden style={{
    left: `${de.x}%`, top: `${peito(de)}%`,
    "--px": `${dx}cqw`, "--py": `${dy}cqh`, "--ang": `${angulo}deg`, "--cor": cor,
  } as CSSProperties}>
    {forma === "magia" ? <span /> : <SvgDaArma forma={forma} />}
  </div>;
}

/** O número que sobe da cabeça: dano, cura, "Errou" ou crítico. */
function Numero({ ator, quadro, anterior, evento }: {
  ator: number; quadro: QuadroDoReplay; anterior?: QuadroDoReplay; evento?: EventoAtaque;
}) {
  const antes = anterior?.pv[ator];
  const agora = quadro.pv[ator];
  if (evento && !evento.acertou) return <span className={estilo.numero} data-tipo="erro">Errou</span>;
  if (antes === undefined || antes === agora) return null;
  const delta = agora - antes;
  if (delta > 0) return <span className={estilo.numero} data-tipo="cura">+{delta}</span>;
  return <span className={estilo.numero} data-tipo={evento?.critico ? "critico" : "dano"}>
    {evento?.critico ? "Crítico! " : ""}−{-delta}
  </span>;
}


function tamanhoDaFileira(n: number): number {
  // Em duas fileiras o cartão encolhe o bastante para a de trás aparecer nos vãos da da frente.
  return n > POR_FILEIRA ? n * 0.75 : n;
}

/** Retrato da ficha; sem ele, a arte da raça (ou do Apêndice G); sem ela, a inicial. */
function imagensDosAtores(atores: AtorDoReplay[], grupo: CharacterData[], criaturas: CriaturaEncontro[]): (string | undefined)[] {
  return atores.map((ator) => {
    if (ator.lado === "grupo") {
      const ficha = grupo.find((c) => c.id === ator.origem);
      return ficha?.portrait ?? getRaceById(ficha?.raceId ?? null)?.icon;
    }
    const criatura = criaturas.find((c) => c.id === ator.origem);
    // Criaturas prontas montadas antes do retrato vir junto: acha pela arte do Apêndice G.
    return criatura?.portrait ?? CRIATURAS_PRONTAS.find((p) => p.nome === criatura?.nome)?.icon;
  });
}

function contagemPorLado(atores: AtorDoReplay[], quadro: QuadroDoReplay): number[] {
  const presentes = atores.filter((_, i) => quadro.pv[i] !== undefined);
  return [presentes.filter((a) => a.lado === "grupo").length, presentes.filter((a) => a.lado === "criaturas").length];
}

/** O comprimento da linha no começo da luta: dá a escala da profundidade. */
function vaoDaLinha(quadros: QuadroDoReplay[]): number {
  const primeiro = quadros.find((q) => q.posicao)?.posicao;
  const conhecidas = (primeiro ?? []).filter((p): p is number => p !== null);
  return conhecidas.length ? Math.max(1.5, Math.max(...conhecidas) - Math.min(...conhecidas)) : 0;
}

function media(valores: number[]): number | undefined {
  return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : undefined;
}

function mediasDosLados(atores: AtorDoReplay[], quadro: QuadroDoReplay) {
  const doLado = (lado: AtorDoReplay["lado"]) => atores
    .map((a, i) => (a.lado === lado && quadro.vivo[i] ? quadro.posicao?.[i] : null))
    .filter((p): p is number => p !== null && p !== undefined);
  return { grupo: media(doLado("grupo")), criaturas: media(doLado("criaturas")) };
}

/** A menor distância entre inimigos de pé: é ela que decide alcance na mesa. */
function distanciaEntreLados(atores: AtorDoReplay[], quadro: QuadroDoReplay): number | undefined {
  const posicoes = (lado: AtorDoReplay["lado"]) => atores
    .map((a, i) => (a.lado === lado && quadro.vivo[i] ? quadro.posicao?.[i] : null))
    .filter((p): p is number => p !== null && p !== undefined);
  const grupo = posicoes("grupo");
  const criaturas = posicoes("criaturas");
  if (!grupo.length || !criaturas.length) return undefined;
  return Math.min(...grupo.flatMap((g) => criaturas.map((c) => Math.abs(c - g))));
}

/**
 * Onde cada standee fica. Sem posições no cenário, grupo e criaturas ficam em
 * duas fileiras fixas. Com posições, a distância real até o meio da luta vira
 * profundidade — mas nunca abaixo de uma folga mínima, para os dois lados não
 * se sobreporem quando estão corpo a corpo.
 */
function postosDaCena(atores: AtorDoReplay[], quadro: QuadroDoReplay, vao: number): (Posto | undefined)[] {
  const { grupo, criaturas } = mediasDosLados(atores, quadro);
  const meio = grupo !== undefined && criaturas !== undefined ? (grupo + criaturas) / 2 : undefined;
  const porLado = { grupo: [] as number[], criaturas: [] as number[] };
  atores.forEach((a, i) => { if (quadro.pv[i] !== undefined) porLado[a.lado].push(i); });
  const postos: (Posto | undefined)[] = [];
  for (const lado of ["grupo", "criaturas"] as const) {
    const sinal = lado === "grupo" ? -1 : 1;
    const total = porLado[lado].length;
    const duasFileiras = total > POR_FILEIRA;
    porLado[lado].forEach((i, ordem) => {
      const pos = quadro.posicao?.[i];
      const afastamento = pos !== null && pos !== undefined && meio !== undefined && vao > 0
        ? 0.13 + 0.3 * Math.min(1, Math.abs(pos - meio) / (vao / 2))
        : 0.3;
      // Com muita gente, metade recua uma fileira (para longe do centro) e as
      // duas se intercalam: ninguém cobre a barra de PV de ninguém.
      const fileira = duasFileiras ? ordem % 2 : 0;
      const naFileira = duasFileiras ? Math.floor(ordem / 2) : ordem;
      const daFileira = duasFileiras ? Math.ceil((total - fileira) / 2) : total;
      const profundidade = Math.max(-0.02, Math.min(1.02, 0.5 + sinal * (afastamento + fileira * 0.14)));
      const base = ((naFileira + 1 + (fileira ? 0.5 : 0) - (duasFileiras ? 0.25 : 0)) / (daFileira + 1)) * 100;
      // O fundo é mais estreito: a perspectiva aperta a fileira de trás.
      const x = 50 + (base - 50) * (0.8 + 0.2 * (1 - profundidade));
      postos[i] = { x, profundidade };
    });
  }
  return postos;
}

/** Topo (em % da altura do palco) do pé de um standee nesta profundidade. */
function topo(profundidade: number): number {
  return 94 - profundidade * 60;
}

function formatarMetros(m: number): string {
  return `${Number.isInteger(m) ? m : m.toFixed(1).replace(".", ",")} m`;
}
