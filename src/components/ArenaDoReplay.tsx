"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ChevronsRight, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import type { CharacterData } from "@/lib/types";
import type { AtorDoReplay, CriaturaEncontro, LogCombate, QuadroDoReplay } from "@/lib/encounterSim";
import type { EventoAtaque } from "@/lib/combatTrace";
import { getRaceById } from "@/data/races";
import { CRIATURAS_PRONTAS } from "@/data/bestiary";
import { montarPassos, partesDoNome } from "@/lib/passosDoReplay";
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

  useEffect(() => {
    if (!tocando) return;
    const pausa = (evento ? 1150 : ehRodada ? 950 : 600) / velocidade;
    const t = setTimeout(() => setPasso((p) => ({ indice: Math.min(p.indice + 1, passos.length - 1), animar: true })), pausa);
    return () => clearTimeout(t);
  }, [tocando, indice, velocidade, evento, ehRodada, passos.length]);

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
      className={`${estilo.palco} aspect-[4/5] w-full sm:aspect-[16/10]`}
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
        const lunge = i === atacante && centro ? {
          "--dx": `${(centro.x - posto.x) * 0.45}cqw`,
          "--dy": `${(topo(centro.profundidade) - topo(posto.profundidade)) * 0.45}cqh`,
        } : {};
        const pct = Math.max(0, Math.min(1, pv / ator.pvMax));
        const escala = 1.05 - posto.profundidade * 0.45;
        const { base, numero } = partesDoNome(ator.nome);
        return <div
          key={i}
          className={`${estilo.standee} ${estilo[ator.lado]} ${caido ? estilo.caido : ""} ${i === quemAge ? estilo.agindo : ""}`}
          style={{
            left: `${posto.x}%`, top: `${topo(posto.profundidade)}%`,
            "--elemento": elemento ? ELEMENTOS[elemento].cor : undefined,
            zIndex: Math.round((1 - posto.profundidade) * 40) + 2,
            "--tamanho": `min(${ator.invocado ? 80 : 110}px, ${(ator.invocado ? 52 : 70) / fileira}cqw)`, "--escala": escala,
            ...lunge,
          } as unknown as CSSProperties}
        >
          <div className={estilo.corpo}>
            <div key={i === atacante || golpe ? `a${indice}` : "parado"} className={
              i === atacante ? estilo.investida : golpe ? (golpe.acertou ? estilo.apanha : estilo.esquiva) : undefined
            }>
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
          </div>
          {/* O número da cópia nunca some: "Sapo-Lodo Gi… 2" continua distinguível. */}
          <p className={estilo.nome} title={ator.nome}><span>{base}</span>{numero && <b>{numero}</b>}</p>
          <div className={estilo.barra} title={`${pv}/${ator.pvMax} PV`}>
            <span style={{ width: `${pct * 100}%` }} data-nivel={pct > 0.5 ? "alto" : pct > 0.25 ? "meio" : "baixo"} />
          </div>
          {avancouUm && <Numero key={`n${indice}`} ator={i} quadro={quadro} anterior={quadroAnterior} evento={golpe} />}
        </div>;
      })}

      {avancouUm && ehRodada && <div key={`r${indice}`} className={estilo.faixa}>Rodada {quadro.rodada}</div>}
      {ultimo && <div className={estilo.fim}>{log.categoria}</div>}
    </div>

    <p className="min-h-[2.75rem] rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-xs text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-200" aria-live={tocando ? "off" : "polite"}>
      <span className="mr-2 font-bold text-wine-700 dark:text-wine-300">R{quadro.rodada || 0}</span>
      {elemento && eventos.some((e) => e.acertou) && <span className="mr-1.5 inline-block rounded-full px-1.5 text-2xs font-bold text-white" style={{ background: ELEMENTOS[elemento].cor }}>{ELEMENTOS[elemento].nome}</span>}
      {eventos.length > 1 ? resumirEmArea(eventos) : evento ? resumirEvento(evento) : texto.split("\n")[0] || "Preparação da cena."}
    </p>

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

function BotaoArena({ rotulo, onClick, desativado = false, children }: {
  rotulo: string; onClick: () => void; desativado?: boolean; children: React.ReactNode;
}) {
  return <button type="button" onClick={onClick} aria-label={rotulo} title={rotulo} disabled={desativado}
    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-parchment-300 disabled:opacity-40 dark:border-parchment-700">
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

function resumirEmArea(eventos: EventoAtaque[]): string {
  const alvos = eventos.map((e) => `${e.alvo} (${!e.acertou ? "errou" : `${e.critico ? "crítico, " : ""}−${e.aplicacao?.perdaPv ?? 0} PV`})`);
  return `${eventos[0].atacante} usa ${eventos[0].acao} em ${eventos.length} alvos: ${alvos.join(", ")}.`;
}

function tamanhoDaFileira(n: number): number {
  // Em duas fileiras o cartão encolhe o bastante para a de trás aparecer nos vãos da da frente.
  return n > POR_FILEIRA ? n * 0.75 : n;
}

function resumirEvento(e: EventoAtaque): string {
  const resultado = !e.acertou ? "errou" : `${e.critico ? "crítico, " : ""}${e.aplicacao?.perdaPv ?? 0} PV perdidos`;
  const teste = e.teste ? ` (${e.teste.total} contra ${e.teste.tipo === "ataque" ? "CA" : "CD"} ${e.teste.defesa})` : "";
  return `${e.atacante} usa ${e.acao} em ${e.alvo}${teste}: ${resultado}.`;
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
