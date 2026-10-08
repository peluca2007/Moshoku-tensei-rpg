import type { Alvo } from "./combatSim";

export interface EstadoInicialCombate {
  posicao?: number;
  alcanceArma?: number;
  escondido?: boolean;
  surpreso?: boolean;
  postura?: boolean;
  molhado?: boolean;
  caido?: boolean;
  preso?: boolean;
  envenenado?: boolean;
  /** Preparações sustentadas que já estavam ativas quando a cena começou. */
  efeitosAtivos?: string[];
}

export interface CenarioCombate {
  invocadosPreparados?: Record<string, string[]>;
  cobertura?: boolean;
  criaturasUmPv?: string[];
  /** Distância em metros entre as duas linhas. Ausente conserva o cenário abstrato antigo. */
  distancia?: number;
  terrenoDificil?: boolean;
  /** Há objeto, desnível ou estrutura que uma técnica [Improviso] possa usar. */
  cenarioUtilizavel?: boolean;
  participantes?: Record<string, EstadoInicialCombate>;
}

export function distanciaEntre(a: Alvo, b: Alvo): number | undefined {
  return a.posicao === undefined || b.posicao === undefined ? undefined : Math.abs(a.posicao - b.posicao);
}

export function adjacentes(a: Alvo, b: Alvo): boolean {
  const distancia = distanciaEntre(a, b);
  return distancia !== undefined && distancia <= 1.5;
}

export function alcanceEmMetros(alcance?: string): number {
  if (!alcance || /corpo a corpo|toque/i.test(alcance)) return 1.5;
  const numeros = [...alcance.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:metros?|m\b)/gi)].map((m) => Number(m[1].replace(",", ".")));
  return numeros.length ? Math.max(...numeros) : 1.5;
}

/** Retorna true quando gastou uma Ação para chegar ao alcance; nunca inventa posição. */
export function aproximar(a: Alvo, alvo: Alvo, alcance: number, deslocamento: number): boolean {
  const distancia = distanciaEntre(a, alvo);
  if (distancia === undefined || distancia <= alcance || a.preso || deslocamento <= 0) return false;
  const passo = Math.min(distancia - alcance, deslocamento / (a.terrenoDificil ? 2 : 1));
  a.posicao! += Math.sign(alvo.posicao! - a.posicao!) * passo;
  a.escondido = false;
  return true;
}

export function aplicarEstadoInicial(alvo: Alvo, id: string, lado: "grupo" | "criaturas", cenario?: CenarioCombate): void {
  if (!cenario) return;
  const inicio = cenario.participantes?.[id] ?? {};
  if (cenario.distancia !== undefined) alvo.posicao = inicio.posicao ?? (lado === "grupo" ? 0 : cenario.distancia);
  alvo.terrenoDificil = cenario.terrenoDificil ?? false;
  alvo.cenarioUtilizavel = cenario.cenarioUtilizavel ?? !!(cenario.terrenoDificil || cenario.cobertura);
  for (const chave of ["escondido", "surpreso", "molhado", "caido", "preso", "envenenado"] as const) {
    if (inicio[chave] !== undefined) alvo[chave] = inicio[chave];
  }
  const comPreparacoes = alvo as Alvo & { efeitosAtivos?: Set<string> };
  for (const efeito of inicio.efeitosAtivos ?? []) comPreparacoes.efeitosAtivos?.add(efeito.toLowerCase());
}

/**
 * COMO O PERSONAGEM CHEGA NA LUTA (2026-10-08, Tarefa 14d).
 *
 * Até aqui toda batalha começava com o grupo descansado: PV, PM, PT e PP no
 * máximo. Isso mede uma luta, não um dia. A pergunta que o livro precisa
 * responder — o mago chega na quarta luta do dia com alguma coisa? — pede que
 * o encontro comece de onde o anterior terminou.
 *
 * Cada campo ausente fica no máximo da ficha (o comportamento antigo). Os
 * máximos não mudam: chegar ferido não encolhe a reserva.
 */
export interface ReservasIniciais {
  pv?: number;
  pm?: number;
  pt?: number;
  pp?: number;
  /** 0 a 6. A partir de 3, Desvantagem nos ataques (como já acontece na luta). */
  exaustao?: number;
  /** A 0 PV: as Marcas da Morte que ele traz da luta anterior. */
  marcasDaMorte?: number;
  /**
   * A 0 PV: estabilizado não rola o Fio da Vida. Padrão `true` — quem chega
   * caído numa luta nova foi, quase sempre, estabilizado depois da anterior.
   */
  estabilizado?: boolean;
  /** Morto não volta: não age, não é alvo de cura, conta como caído. */
  morto?: boolean;
}

/** O retrato de um personagem no fim de uma batalha: a entrada da próxima. */
export interface EstadoFinalDoPersonagem extends Required<ReservasIniciais> {
  id: string;
  /** Chegou a 0 PV em algum momento desta batalha, mesmo que tenha sido levantado. */
  caiu: boolean;
  /** Está a 0 PV no fim (inconsciente, estabilizado ou não). */
  inconsciente: boolean;
}

interface EstadoComReservas extends Alvo {
  ficha: { pvMax: number; pmMax: number; ptMax: number; ppMax?: number };
  pm: number;
  pt: number;
  pp: number;
  exaustao: number;
}

const limitar = (valor: number | undefined, maximo: number) =>
  valor === undefined || !Number.isFinite(valor) ? maximo : Math.max(0, Math.min(maximo, Math.floor(valor)));

/**
 * Aplica as reservas de chegada a um personagem recém-criado (`novoEstado`).
 * A 0 PV ele entra como o Fio da Vida o deixaria: caído e fora da luta, com as
 * Marcas que trouxe; com 3 Marcas, ou `morto`, entra morto.
 */
export function aplicarReservasIniciais(e: EstadoComReservas, r: ReservasIniciais | undefined): void {
  if (!r) return;
  e.pv = limitar(r.pv, e.ficha.pvMax);
  e.pm = limitar(r.pm, e.ficha.pmMax);
  e.pt = limitar(r.pt, e.ficha.ptMax);
  e.pp = limitar(r.pp, e.ficha.ppMax ?? 0);
  e.exaustao = limitar(r.exaustao ?? 0, 6);
  e.marcasDaMorte = limitar(r.marcasDaMorte ?? 0, 3);
  if (r.morto || e.marcasDaMorte >= 3) {
    e.pv = 0;
    e.vivo = false;
    e.inconsciente = false;
    e.morto = true;
    return;
  }
  if (e.pv <= 0) {
    e.pv = 0;
    e.vivo = false;
    e.inconsciente = true;
    e.estabilizado = r.estabilizado ?? true;
  } else {
    // De pé, as Marcas não existem: qualquer cura as apaga, e acordar também.
    e.marcasDaMorte = 0;
  }
}

/** Lê o estado final de um personagem, no formato que a próxima luta aceita. */
export function estadoFinal(id: string, e: EstadoComReservas, caiu: boolean): EstadoFinalDoPersonagem {
  return {
    id,
    pv: Math.max(0, e.pv),
    pm: e.pm,
    pt: e.pt,
    pp: e.pp,
    exaustao: e.exaustao,
    marcasDaMorte: e.marcasDaMorte,
    estabilizado: e.estabilizado,
    morto: e.morto,
    inconsciente: e.inconsciente,
    caiu,
  };
}
