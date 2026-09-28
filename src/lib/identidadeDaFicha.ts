import { getTreeById } from "@/data/trees";
import { origemNaturalDoSimbolo } from "@/lib/simbolosTeoricos";
import { CharacterData } from "@/lib/types";
import { getRankUnlockPaCost } from "@/store/selectors";

export interface PesoDeArvoreNaFicha {
  treeId: string;
  pa: number;
  peso: number;
  inicial: boolean;
}

export type FichaParaIdentidade = Pick<
  CharacterData,
  "startingTreeId" | "unlockedRanks" | "purchasedAbilities"
>;

function somar(custos: Map<string, number>, treeId: string, pa: number) {
  if (pa <= 0) return;
  custos.set(treeId, (custos.get(treeId) ?? 0) + pa);
}

/**
 * Divide o PA que pertence a árvores. Compras globais (atributo, reserva,
 * perícia, raça e magia combinada) não vestem uma árvore específica.
 */
export function identidadeDaFicha(ficha: FichaParaIdentidade): PesoDeArvoreNaFicha[] {
  const custos = new Map<string, number>();
  const abertas = new Set<string>();

  // A ordem é parte da regra: 1ª abertura grátis, 2ª custa 1 PA, 3ª custa 2…
  for (const desbloqueio of ficha.unlockedRanks) {
    if (desbloqueio.rank === "Principiante" && !abertas.has(desbloqueio.treeId)) {
      abertas.add(desbloqueio.treeId);
      somar(custos, desbloqueio.treeId, Math.max(0, abertas.size - 1));
      continue;
    }
    somar(custos, desbloqueio.treeId, getRankUnlockPaCost(desbloqueio.treeId, desbloqueio.rank));
  }

  for (const compra of ficha.purchasedAbilities) {
    // O símbolo nativo de Magia Teórica é gratuito também em getPaSpent.
    if (
      compra.treeId === "teorica" &&
      origemNaturalDoSimbolo(ficha as CharacterData, compra.id)
    ) continue;
    const rank = getTreeById(compra.treeId)?.ranks.find((item) => item.rank === compra.rank);
    const definicao = compra.kind === "ability"
      ? rank?.abilities.find((item) => item.id === compra.id)
      : rank?.talents.find((item) => item.id === compra.id);
    somar(custos, compra.treeId, definicao?.paCost ?? 0);
  }

  const total = Array.from(custos.values()).reduce((soma, pa) => soma + pa, 0);
  if (total === 0) return [];

  return Array.from(custos, ([treeId, pa]) => ({
    treeId,
    pa,
    peso: pa / total,
    inicial: treeId === ficha.startingTreeId,
  })).sort((a, b) => b.pa - a.pa || Number(b.inicial) - Number(a.inicial) || a.treeId.localeCompare(b.treeId));
}
