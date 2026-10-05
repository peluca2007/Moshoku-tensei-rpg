/**
 * A medição do molde, comum ao `check:molde` e ao teste `moldeCalibrado`
 * (2026-10-05). O porquê está no cabeçalho de `scripts/check-molde.mts`.
 */
import { GRUPO, montar } from "./grupoDoKit";
import { criaturaDoMolde, simularEncontro } from "@/lib/encounterSim";

export const TOLERANCIA = 8;

/**
 * Vitória (%) medida em 2026-10-05, 300 batalhas, depois da recalibragem do 2º
 * ao 4º. O 5º e o 6º ficam fora da faixa do livro de propósito (ver
 * bestiary.ts): nenhum PV põe as 5 criaturas e o Chefe na faixa ao mesmo tempo.
 */
export const REFERENCIA: Record<number, Medida> = {
  1: { quatro: 99, cinco: 78, chefe: 98 },
  2: { quatro: 100, cinco: 73, chefe: 99 },
  3: { quatro: 97, cinco: 67, chefe: 90 },
  4: { quatro: 96, cinco: 71, chefe: 90 },
  5: { quatro: 97, cinco: 88, chefe: 72 },
  // 6º atualizado no mesmo dia: o golpe do molde passou a ser arredondado
  // (50/3 = 16,67 → 17), e as 5 criaturas foram de 78% a 69% — mais perto do Difícil.
  6: { quatro: 98, cinco: 69, chefe: 53 },
};

export interface Medida { quatro: number; cinco: number; chefe: number }

const NOMES: Record<keyof Medida, string> = { quatro: "4 criaturas", cinco: "5 criaturas", chefe: "Chefe" };

/** Mede um patamar e devolve, junto, o que saiu da tolerância. */
export function medirPatamar(patamar: number, batalhas = 300): { medido: Medida; falhas: string[] } {
  const grupo = GRUPO.map((g) => montar(g, patamar));
  const vitoria = (papel: "padrao" | "chefe", quantidade: number) => {
    const c = { ...criaturaDoMolde(patamar, papel, "Criatura", `c${patamar}`), tatica: "aleatorio" as const, quantidade };
    return Math.round(simularEncontro(grupo, [c], { batalhas }).vitorias * 100);
  };
  const medido = { quatro: vitoria("padrao", 4), cinco: vitoria("padrao", 5), chefe: vitoria("chefe", 1) };
  const falhas = (Object.keys(NOMES) as (keyof Medida)[])
    .filter((k) => Math.abs(medido[k] - REFERENCIA[patamar][k]) > TOLERANCIA)
    .map((k) => `${patamar}º, ${NOMES[k]}: ${medido[k]}% (referência ${REFERENCIA[patamar][k]}%)`);
  return { medido, falhas };
}
