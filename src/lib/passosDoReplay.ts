import type { EventoAtaque } from "./combatTrace";
import type { LogCombate, QuadroDoReplay } from "./encounterSim";
import { grupoDaArma, type WeaponGroupId } from "@/data/weaponGroups";

/**
 * Um passo do replay da arena. Quase sempre é um quadro só; um golpe em área
 * que gera vários recibos seguidos (mesmo atacante, mesma ação, alvos
 * diferentes) vira um passo único: uma investida, os efeitos em todos os alvos
 * ao mesmo tempo.
 *
 * Dois golpes seguidos no MESMO alvo continuam dois passos: é o personagem
 * gastando duas Ações, e a mesa precisa ver as duas. E o recibo não diz "área":
 * o sinal é o teste. Área faz cada alvo RESISTIR; dois ataques com rolagem de
 * acerto em alvos diferentes são duas Ações, não uma explosão.
 */
export interface PassoDoReplay {
  de: number;
  ate: number;
  eventos: EventoAtaque[];
}

export function montarPassos(quadros: QuadroDoReplay[], eventos: EventoAtaque[] = []): PassoDoReplay[] {
  const passos: PassoDoReplay[] = [];
  quadros.forEach((q, i) => {
    const evento = q.evento !== undefined ? eventos[q.evento] : undefined;
    const atual = passos.at(-1);
    const primeiro = atual?.eventos[0];
    const emArea = (e: EventoAtaque) => e.teste?.tipo !== "ataque";
    if (evento && atual && primeiro && atual.ate === i - 1 && primeiro.atacante === evento.atacante
      && primeiro.acao === evento.acao && emArea(primeiro) && emArea(evento)
      && !atual.eventos.some((e) => e.alvo === evento.alvo)) {
      atual.ate = i;
      atual.eventos.push(evento);
      return;
    }
    passos.push({ de: i, ate: i, eventos: evento ? [evento] : [] });
  });
  return passos;
}

/** "Sapo-Lodo Gigante 2" → base e número, para o número sobreviver ao corte. */
export function partesDoNome(nome: string): { base: string; numero?: string } {
  const m = nome.match(/^(.*\S)\s+(\d+)$/);
  return m ? { base: m[1], numero: m[2] } : { base: nome };
}

/* ─── Que animação o golpe ganha ─────────────────────────────────────── */

/**
 * A forma do golpe na arena. Só visual: sai da arma do recibo (pelo grupo de
 * arma do livro, Cap. 1) e, sem arma, do nome da ação. Nunca decide regra.
 */
export type FormaDoGolpe =
  | "espada" | "martelo" | "lanca" | "soco" | "mordida" | "garra"
  | "flecha" | "arremesso" | "magia" | "golpe";

/** As formas que viajam do atacante até o alvo, em vez de nascerem no alvo. */
export const FORMAS_A_DISTANCIA: ReadonlySet<FormaDoGolpe> = new Set(["flecha", "arremesso", "magia"]);

const FORMA_DO_GRUPO: Record<WeaponGroupId, FormaDoGolpe> = {
  "espadas": "espada",
  "laminas-curtas": "espada",
  "machados-e-marretas": "martelo",
  "hastes": "lanca",
  "arcos-e-bestas": "flecha",
  "arremesso": "arremesso",
  "flexiveis": "espada",
  "desarmado-e-improvisado": "soco",
  "escudos": "martelo",
};

const PISTAS_DO_NOME: [FormaDoGolpe, RegExp][] = [
  ["soco", /soco|punho|murro|chute|joelhad|cotovel|desarmad/],
  ["mordida", /mordida|morde|presa|picada/],
  ["garra", /garra|arranh|unha|rasga/],
  ["flecha", /flecha|arco|besta|tiro|disparo|dardo/],
  ["arremesso", /arremess/],
  ["lanca", /lança|lanca|estoc|haste|chifre|ferrão|ferrao/],
  ["martelo", /martelo|marreta|machad|clava|maça|pancada|esmag|cabeçada|investida/],
  ["espada", /espada|lâmina|lamina|corte|talho|golpe|cutil/],
];

const TIPOS_MAGICOS = /ígne|igne|fogo|frio|gelo|elétr|eletr|raio|sônic|sonic|radiant|psíq|psiq|arcan|mágic|magic|ácid|acid/;

export function formaDoGolpe(e: EventoAtaque): FormaDoGolpe {
  if (e.arma) {
    const grupo = grupoDaArma(e.arma.nome);
    if (grupo) return FORMA_DO_GRUPO[grupo];
  }
  const nome = e.acao.toLowerCase();
  const pelaAcao = PISTAS_DO_NOME.find(([, re]) => re.test(nome));
  if (pelaAcao) return pelaAcao[0];
  if (e.arma) return "espada";
  // Sem arma e com dano de elemento: é feitiço, e feitiço viaja.
  if (TIPOS_MAGICOS.test((e.tipoDeDano ?? "").toLowerCase())) return "magia";
  return "golpe";
}

/* ─── As reações ─────────────────────────────────────────────────────── */

export type TipoDeReacao =
  | "aparar" | "fluxo" | "devolver" | "guarda" | "prever"
  | "couraca" | "parede" | "refrao" | "chefe" | "outra";

export interface ReacaoNaArena {
  tipo: TipoDeReacao;
  /** Quem reagiu. */
  quem: string;
  /** O nome que aparece no selo. */
  nome: string;
  /** Quem a reação protege ou atinge, quando há. */
  alvos: string[];
}

/**
 * As frases que o motor escreve quando alguém reage. Elas são o contrato entre
 * o motor e a arena: `passosDoReplay.test.ts` confere que cada uma continua
 * existindo no código do motor, então mudar o texto lá quebra o teste aqui em
 * vez de a animação sumir calada.
 */
export const FRASES_DE_REACAO = {
  aparar: "usa Aparar: CA",
  fluxo: "usa Fluxo após o erro corpo a corpo de",
  devolver: "paga 1 PT por Devolver",
  guarda: "usa Guarda do Corpo e intercepta",
  prever: "usa Prever o Golpe: a CA de",
  outra: "reage com",
  chefe: "reage!",
  couraca: "Couraça de Barro:",
  parede: "Parede de Emergência de",
  refrao: "Refrão da Retomada de",
  preverRetroativo: "Prever o Golpe: ${protetor.nome} concede",
} as const;

const LINHAS: [TipoDeReacao, RegExp, (m: RegExpMatchArray) => Omit<ReacaoNaArena, "tipo">][] = [
  ["aparar", /^\[(.+?)\] usa Aparar:/, (m) => ({ quem: m[1], nome: "Aparar", alvos: [] })],
  ["fluxo", /^\[(.+?)\] usa Fluxo após o erro corpo a corpo de (.+?)\.$/, (m) => ({ quem: m[1], nome: "Fluxo", alvos: [m[2]] })],
  ["devolver", /^\[(.+?)\] paga 1 PT por Devolver/, (m) => ({ quem: m[1], nome: "Devolver", alvos: [] })],
  ["guarda", /^\[(.+?)\] usa Guarda do Corpo e intercepta .+? no lugar de (.+?)\.$/, (m) => ({ quem: m[1], nome: "Guarda do Corpo", alvos: [m[2]] })],
  ["prever", /^\[(.+?)\] usa Prever o Golpe: a CA de (.+?) sobe/, (m) => ({ quem: m[1], nome: "Prever o Golpe", alvos: [m[2]] })],
  ["outra", /^\[(.+?)\] reage com (.+?) \(/, (m) => ({ quem: m[1], nome: m[2], alvos: [] })],
  ["chefe", /^\[(.+?)\] reage!$/, (m) => ({ quem: m[1], nome: "Reação", alvos: [] })],
];

/** As reações de um passo: as que o log escreveu na linha e as que vieram nas notas dos recibos. */
export function reacoesDoPasso(linha: string, eventos: EventoAtaque[]): ReacaoNaArena[] {
  const achadas: ReacaoNaArena[] = [];
  const texto = linha.trim();
  for (const [tipo, re, montar] of LINHAS) {
    const m = texto.match(re);
    if (m) { achadas.push({ tipo, ...montar(m) }); break; }
  }
  for (const e of eventos) {
    for (const nota of e.notas) {
      let m: RegExpMatchArray | null;
      if (nota.startsWith("Couraça de Barro:")) achadas.push({ tipo: "couraca", quem: e.alvo, nome: "Couraça de Barro", alvos: [] });
      else if ((m = nota.match(/^Parede de Emergência de (.+?): .* antes de (.+?)\.$/))) achadas.push({ tipo: "parede", quem: m[1], nome: "Parede de Emergência", alvos: [m[2]] });
      else if ((m = nota.match(/^Refrão da Retomada de (.+?):.* para (.+)\.$/))) achadas.push({ tipo: "refrao", quem: m[1], nome: "Refrão da Retomada", alvos: m[2].split(", ") });
      else if ((m = nota.match(/^Prever o Golpe: (.+?) concede/))) achadas.push({ tipo: "prever", quem: m[1], nome: "Prever o Golpe", alvos: [e.alvo] });
    }
  }
  return achadas;
}

/* ─── O placar do fim da batalha ─────────────────────────────────────── */

export interface PlacarDaBatalha {
  /** Quem do grupo mais tirou PV dos inimigos (dano real, depois de resistência e PV temporário). */
  destaque?: { nome: string; dano: number };
  /** O golpe que mais tirou PV de uma vez só, de qualquer lado. */
  maiorGolpe?: { atacante: string; acao: string; alvo: string; dano: number; critico: boolean };
  /** Quem caiu, na ordem, e em que rodada. */
  quedas: { nome: string; rodada: number; lado: "grupo" | "criaturas" }[];
}

/**
 * O que a mesa comenta quando a luta acaba. Lê só o que o replay gravou: os
 * recibos (dano real) e os quadros (quem caiu e quando). Nenhum número novo.
 */
export function placarDaBatalha(log: LogCombate): PlacarDaBatalha {
  const replay = log.replay;
  const eventos = log.eventos ?? [];
  const lado = new Map(replay?.atores.map((a) => [a.nome, a.lado]) ?? []);
  // Invocações somam para quem as chamou: o Pacto é a mão do invocador.
  const dono = new Map(replay?.atores.filter((a) => a.invocado && a.lado === "grupo")
    .map((a) => [a.nome, replay.atores.find((b) => !b.invocado && b.lado === "grupo" && b.origem === a.origem)?.nome ?? a.nome]) ?? []);

  const danoPorHeroi = new Map<string, number>();
  let maiorGolpe: PlacarDaBatalha["maiorGolpe"];
  for (const e of eventos) {
    const dano = e.aplicacao?.perdaPv ?? 0;
    if (dano <= 0) continue;
    if (lado.get(e.atacante) === "grupo") {
      const autor = dono.get(e.atacante) ?? e.atacante;
      danoPorHeroi.set(autor, (danoPorHeroi.get(autor) ?? 0) + dano);
    }
    if (!maiorGolpe || dano > maiorGolpe.dano) maiorGolpe = { atacante: e.atacante, acao: e.acao, alvo: e.alvo, dano, critico: e.critico };
  }
  const [nome, dano] = [...danoPorHeroi].sort((a, b) => b[1] - a[1])[0] ?? [];

  const quedas: PlacarDaBatalha["quedas"] = [];
  if (replay) {
    const jaCaiu = new Set<number>();
    for (const q of replay.quadros) {
      q.vivo.forEach((vivo, i) => {
        if (vivo === false && !jaCaiu.has(i)) {
          jaCaiu.add(i);
          quedas.push({ nome: replay.atores[i].nome, rodada: q.rodada, lado: replay.atores[i].lado });
        }
      });
    }
  }
  return { destaque: nome ? { nome, dano: dano! } : undefined, maiorGolpe, quedas };
}
