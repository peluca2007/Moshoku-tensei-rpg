import type { CharacterData } from "./types";
import { simularEncontro, type CriaturaEncontro, type ResultadoEncontro } from "./encounterSim";

export const BATALHAS_COMPARADOR = 400;
export const SEMENTE_COMPARADOR = 20260910;

export interface PedidoComparacao {
  primeira: CharacterData;
  segunda: CharacterData;
  alvo: CriaturaEncontro;
  semente: number;
}

export interface ResultadoComparacao {
  primeira: ResultadoEncontro;
  segunda: ResultadoEncontro;
}

export type RespostaComparacao =
  | { tipo: "resultado"; resultado: ResultadoComparacao }
  | { tipo: "erro"; mensagem: string };

/** Mesmo alvo e mesma semente; executado fora da thread da interface. */
export function compararBuilds(pedido: PedidoComparacao): ResultadoComparacao {
  const opcoes = { batalhas: BATALHAS_COMPARADOR, semente: pedido.semente, gerarLogs: false };
  return {
    primeira: simularEncontro([pedido.primeira], [pedido.alvo], opcoes),
    segunda: simularEncontro([pedido.segunda], [pedido.alvo], opcoes),
  };
}
