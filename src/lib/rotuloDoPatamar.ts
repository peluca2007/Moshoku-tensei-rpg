import type { RankName, Tree } from "./types";

/**
 * O nome de um patamar numa árvore — UM nome só no livro inteiro (Etapa 3c do
 * PLANO-DO-DESIGNER, 2026-09-26).
 *
 * Sete árvores tinham escada própria ("Atirador, Caçador, Franco-Atirador…"), e
 * a mesa precisava decorar três escadas a mais além de Rank, patamar e tier.
 * Agora o nome é sempre o do Rank (Principiante → Imperador), e o temático vem
 * depois, como subtítulo: "Intermediário · Caçador". O sabor fica; a tradução
 * sai da cabeça do jogador.
 */
export function rotuloDoPatamar(tree: Pick<Tree, "rankLabels">, rank: RankName): string {
  const tematico = tree.rankLabels?.[rank];
  return tematico && tematico !== rank ? `${rank} · ${tematico}` : rank;
}

/** Só o nome temático, quando a árvore tem um diferente do Rank. */
export function nomeTematico(tree: Pick<Tree, "rankLabels">, rank: RankName): string | null {
  const tematico = tree.rankLabels?.[rank];
  return tematico && tematico !== rank ? tematico : null;
}
