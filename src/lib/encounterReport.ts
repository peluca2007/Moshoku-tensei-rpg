import type { CharacterData } from "./types";
import type { CenarioCombate } from "./combatScenario";
import type { VozDeCombate } from "./sonsDaArena";
import { simularEncontro, type CriaturaEncontro, type ResultadoEncontro } from "./encounterSim";
import { ajustarParaEquilibrio, aplicarEscalaAoEncontro, avaliar, type AjusteSugerido, type Veredito } from "./encounterBalance";

export const BATALHAS_ENCONTRO = 300;
export const SEMENTE_ENCONTRO = 20260903;

export interface ConfiguracaoEncontro {
  cenario?: CenarioCombate;
  /** `manual` ausente com orçamento 0: a conta do Apêndice G (2026-10-07); com orçamento acima de 0, o valor que o Mestre escreveu antes disso. */
  recompensa?: { orcamento: number; semente: number; manual?: boolean };
  semente: number;
  armasPorPersonagem: Record<string, string | null>;
  /**
   * A voz de cada personagem no grito do crítico da arena. Só som: a
   * simulação não lê, e a ausência (o padrão) é "não grita".
   */
  vozes?: Record<string, VozDeCombate>;
}

export interface PedidoRelatorio {
  grupo: CharacterData[];
  criaturas: CriaturaEncontro[];
  configuracao: ConfiguracaoEncontro;
}

export interface RelatorioEncontro {
  entrada: PedidoRelatorio;
  resultado: ResultadoEncontro;
  veredito: Veredito;
  ajuste: AjusteSugerido | null;
  criaturas: CriaturaEncontro[];
  tamanhoDoGrupo: number;
  semente: number;
}

export type RespostaSimulacao =
  | { tipo: "progresso"; mensagem: string }
  | { tipo: "resultado"; relatorio: RelatorioEncontro }
  | { tipo: "erro"; mensagem: string };

/** Executada no worker: o mesmo instantâneo e a mesma semente valem para todos os ajustes. */
export function gerarRelatorioEncontro(
  pedido: PedidoRelatorio,
  progresso?: (mensagem: string) => void,
): RelatorioEncontro {
  const { grupo, criaturas, configuracao } = pedido;
  progresso?.(`Simulando ${BATALHAS_ENCONTRO} batalhas…`);
  const resultado = simularEncontro(grupo, criaturas, {
    ...configuracao, batalhas: BATALHAS_ENCONTRO, gerarLogs: true,
  });
  const veredito = avaliar(resultado);
  let ajuste: AjusteSugerido | null = null;
  if (veredito.faixa !== "equilibrado") {
    progresso?.("Batalhas concluídas. Conferindo os ajustes de dificuldade…");
    const medir = (escala: number) => simularEncontro(grupo, aplicarEscalaAoEncontro(criaturas, escala), {
      ...configuracao, batalhas: 120, gerarLogs: false,
    });
    ajuste = ajustarParaEquilibrio(medir);
    if (ajuste) ajuste.faixaProjetada = avaliar(medir(ajuste.escala)).faixa;
  }
  return { entrada: pedido, resultado, veredito, ajuste, criaturas, tamanhoDoGrupo: grupo.length, semente: configuracao.semente };
}
