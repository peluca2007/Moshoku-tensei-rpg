import { CharacterData } from "@/lib/types";
import { FORMAS, FormulaEscolha, RANKS_TEORICOS, type RankTeorico } from "@/lib/magiaTeorica";

const ORIGENS: Record<string, string> = {
  "simbolo-fogo": "fogo",
  "simbolo-agua": "agua",
  "simbolo-vento": "vento",
  "simbolo-terra": "terra",
  "simbolo-som": "bardo-e-interacao",
  "simbolo-vida": "cura",
};

/** Uma escola ensina sua essência ao abrir o primeiro patamar; as cartas da escola seguem separadas. */
export function origemNaturalDoSimbolo(c: CharacterData, id: string): string | null {
  const treeId = ORIGENS[id];
  return treeId && c.unlockedRanks.some((u) => u.treeId === treeId && u.rank === "Principiante")
    ? treeId
    : null;
}

export function conheceSimboloTeorico(c: CharacterData, id: string): boolean {
  return Boolean(origemNaturalDoSimbolo(c, id))
    || c.purchasedAbilities.some((a) => a.treeId === "teorica" && a.id === id);
}

/**
 * A oficina é livre pra aprender; esta verificação diz se a FICHA pode usar o
 * desenho em jogo: o rank na Teórica e a essência. Verbos e formas vêm com as
 * Maestrias (Cap. 2, §8), então basta o rank.
 */
export function avaliarFormulaNaFicha(c: CharacterData, escolha: FormulaEscolha): string[] {
  const problemas: string[] = [];
  const rank = c.unlockedRanks.filter((u) => u.treeId === "teorica")
    .reduce((maior, u) => Math.max(maior, RANKS_TEORICOS.indexOf(u.rank as RankTeorico)), -1);
  if (rank < 0) return ["Abra a Magia Teórica pra desenhar fórmulas. Qualquer personagem com PM ainda pode alimentar uma fórmula pronta."];
  if (rank < RANKS_TEORICOS.indexOf(escolha.rank)) problemas.push(`Sua Magia Teórica ainda não chegou ao ${escolha.rank}.`);
  if (escolha.essencia !== "mana" && !conheceSimboloTeorico(c, `simbolo-${escolha.essencia}`)) {
    problemas.push(`A essência ${escolha.essencia} vem com o Principiante da escola dela, ou por 1 PA na Teórica.`);
  }
  const forma = FORMAS[escolha.forma];
  if (rank < RANKS_TEORICOS.indexOf(forma.desde as RankTeorico)) problemas.push(`${forma.nome} se aprende no ${forma.desde}.`);
  if (escolha.verbos.length > 1 && rank < 2) problemas.push("Dois verbos só a partir do Avançado.");
  if ((escolha.armada || escolha.meio === "pedra") && rank < 3) problemas.push("Pedra e armar se aprendem no Santo.");
  return problemas;
}
