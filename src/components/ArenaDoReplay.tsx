"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import type { CharacterData } from "@/lib/types";
import type { AtorDoReplay, CriaturaEncontro, LogCombate, QuadroDoReplay } from "@/lib/encounterSim";
import type { EventoAtaque } from "@/lib/combatTrace";
import { getRaceById } from "@/data/races";
import { CRIATURAS_PRONTAS } from "@/data/bestiary";
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
  // `animar` só é verdadeiro quando o quadro chegou andando UM passo para
  // frente: pular na linha do tempo ou voltar mostra a cena pronta.
  const [{ indice, animar: avancouUm }, setPasso] = useState({ indice: 0, animar: false });
  const [pediuTocar, setTocando] = useState(tocarAoAbrir);
  const [velocidade, setVelocidade] = useState<(typeof VELOCIDADES)[number]>(1);
  const irPara = (i: number, animar = false) => setPasso({ indice: Math.max(0, Math.min(quadros.length - 1, i)), animar });

  const quadro = quadros[indice];
  const quadroAnterior = indice > 0 ? quadros[indice - 1] : undefined;
  const evento = quadro.evento !== undefined ? log.eventos?.[quadro.evento] : undefined;
  const texto = (log.linhas[quadro.linha] ?? "").trim();
  const ehRodada = /^--- Rodada/.test(texto);
  const ultimo = indice === quadros.length - 1;
  const tocando = pediuTocar && !ultimo;

  useEffect(() => {
    if (!tocando) return;
    const pausa = (evento ? 1150 : ehRodada ? 950 : 600) / velocidade;
    const t = setTimeout(() => setPasso((p) => ({ indice: Math.min(p.indice + 1, quadros.length - 1), animar: true })), pausa);
    return () => clearTimeout(t);
  }, [tocando, indice, velocidade, evento, ehRodada, quadros.length]);

  const imagens = useMemo(() => imagensDosAtores(atores, grupo, criaturas), [atores, grupo, criaturas]);
  const vaoInicial = useMemo(() => vaoDaLinha(quadros), [quadros]);
  const postos = postosDaCena(atores, quadro, vaoInicial);
  const fundo = grupo.find((c) => c.cover)?.cover;

  const indiceDoNome = (nome?: string) => (nome === undefined ? -1 : atores.findIndex((a) => a.nome === nome));
  const atacante = avancouUm ? indiceDoNome(evento?.atacante) : -1;
  const alvo = avancouUm ? indiceDoNome(evento?.alvo) : -1;
  // O cartão encolhe com a fileira mais cheia, medido na largura do palco.
  const fileira = Math.max(3, ...contagemPorLado(atores, quadro));
  const distancia = distanciaEntreLados(atores, quadro);
  const elemento = evento ? elementoDoGolpe(evento) : undefined;

  return <div className="space-y-2">
    <div className={`${estilo.palco} aspect-[4/5] w-full sm:aspect-[16/10]`}>
      {fundo && <div className={estilo.fundo} style={{ backgroundImage: `url(${fundo})` }} aria-hidden />}
      <div className={estilo.chao} aria-hidden><div className={estilo.linha} /></div>
      {distancia !== undefined && <span className={estilo.distancia} style={{ top: `${topo(0.5)}%` }}>{formatarMetros(distancia)}</span>}

      {atores.map((ator, i) => {
        const posto = postos[i];
        if (!posto) return null;
        const pv = quadro.pv[i];
        const caido = !quadro.vivo[i];
        const alvoDoEvento = i === alvo && evento;
        const lunge = i === atacante && alvo >= 0 && postos[alvo] ? {
          "--dx": `${(postos[alvo].x - posto.x) * 0.45}cqw`,
          "--dy": `${(topo(postos[alvo].profundidade) - topo(posto.profundidade)) * 0.45}cqh`,
        } : {};
        const pct = Math.max(0, Math.min(1, pv / ator.pvMax));
        const escala = 1.05 - posto.profundidade * 0.45;
        return <div
          key={i}
          className={`${estilo.standee} ${estilo[ator.lado]} ${caido ? estilo.caido : ""} ${i === indiceDoNome(evento?.atacante) ? estilo.agindo : ""}`}
          style={{
            left: `${posto.x}%`, top: `${topo(posto.profundidade)}%`,
            "--elemento": elemento ? ELEMENTOS[elemento].cor : undefined,
            zIndex: Math.round((1 - posto.profundidade) * 40) + 2,
            "--tamanho": `min(${ator.invocado ? 80 : 110}px, ${(ator.invocado ? 52 : 70) / fileira}cqw)`, "--escala": escala,
            ...lunge,
          } as unknown as CSSProperties}
        >
          <div className={estilo.corpo}>
            <div key={i === atacante || alvoDoEvento ? `a${indice}` : "parado"} className={
              i === atacante ? estilo.investida : alvoDoEvento ? (evento.acertou ? estilo.apanha : estilo.esquiva) : undefined
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
            {alvoDoEvento && evento.acertou && elemento && <Efeito key={`e${indice}`} elemento={elemento} />}
          </div>
          <p className={estilo.nome}>{ator.nome}</p>
          <div className={estilo.barra} title={`${pv}/${ator.pvMax} PV`}>
            <span style={{ width: `${pct * 100}%` }} data-nivel={pct > 0.5 ? "alto" : pct > 0.25 ? "meio" : "baixo"} />
          </div>
          {avancouUm && <Numero key={`n${indice}`} ator={i} quadro={quadro} anterior={quadroAnterior} evento={alvoDoEvento ? evento : undefined} />}
        </div>;
      })}

      {avancouUm && ehRodada && <div key={`r${indice}`} className={estilo.faixa}>Rodada {quadro.rodada}</div>}
      {ultimo && <div className={estilo.fim}>{log.categoria}</div>}
    </div>

    <p className="min-h-[2.75rem] rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-xs text-parchment-800 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-200" aria-live={tocando ? "off" : "polite"}>
      <span className="mr-2 font-bold text-wine-700 dark:text-wine-300">R{quadro.rodada || 0}</span>
      {elemento && evento?.acertou && <span className="mr-1.5 inline-block rounded-full px-1.5 text-2xs font-bold text-white" style={{ background: ELEMENTOS[elemento].cor }}>{ELEMENTOS[elemento].nome}</span>}
      {evento ? resumirEvento(evento) : texto.split("\n")[0] || "Preparação da cena."}
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
      <button
        type="button"
        onClick={() => setVelocidade(VELOCIDADES[(VELOCIDADES.indexOf(velocidade) + 1) % VELOCIDADES.length])}
        className="min-h-11 rounded-lg border border-parchment-300 px-3 text-sm font-semibold dark:border-parchment-700"
        aria-label={`Velocidade ${velocidade}x; tocar para mudar`}
      >{velocidade}×</button>
      <input
        type="range" min={0} max={quadros.length - 1} value={indice}
        onChange={(e) => { setTocando(false); irPara(Number(e.target.value)); }}
        aria-label="Linha do tempo da batalha"
        className="min-w-0 flex-1 basis-40 accent-wine-700"
      />
    </div>
  </div>;
}

function BotaoArena({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-label={rotulo} title={rotulo}
    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-parchment-300 dark:border-parchment-700">
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
    porLado[lado].forEach((i, ordem) => {
      const pos = quadro.posicao?.[i];
      const afastamento = pos !== null && pos !== undefined && meio !== undefined && vao > 0
        ? 0.13 + 0.3 * Math.min(1, Math.abs(pos - meio) / (vao / 2))
        : 0.3;
      const profundidade = 0.5 + sinal * afastamento;
      const base = ((ordem + 1) / (porLado[lado].length + 1)) * 100;
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
