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
}

export interface CenarioCombate {
  invocadosPreparados?: Record<string, string[]>;
  cobertura?: boolean;
  criaturasUmPv?: string[];
  /** Distância em metros entre as duas linhas. Ausente conserva o cenário abstrato antigo. */
  distancia?: number;
  terrenoDificil?: boolean;
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
  for (const chave of ["escondido", "surpreso", "molhado", "caido", "preso", "envenenado"] as const) {
    if (inicio[chave] !== undefined) alvo[chave] = inicio[chave];
  }
}
