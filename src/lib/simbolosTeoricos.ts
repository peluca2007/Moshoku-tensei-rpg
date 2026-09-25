import { CharacterData } from "@/lib/types";
import { FormulaEscolha, RANKS_TEORICOS } from "@/lib/magiaTeorica";

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

/** A oficina é livre para aprender; esta verificação diz se a ficha pode usar o desenho em jogo. */
export function avaliarFormulaNaFicha(c: CharacterData, escolha: FormulaEscolha): string[] {
  const problemas: string[] = [];
  const rank = c.unlockedRanks.filter((u) => u.treeId === "teorica")
    .reduce((maior, u) => Math.max(maior, RANKS_TEORICOS.indexOf(u.rank as typeof RANKS_TEORICOS[number])), -1);
  if (rank < 0) return ["Abra Magia Teórica para construir fórmulas. Qualquer personagem com PM ainda pode alimentar um circuito pronto."];
  if (rank < RANKS_TEORICOS.indexOf(escolha.rank)) problemas.push(`Sua Magia Teórica ainda não alcançou ${escolha.rank}.`);
  if (escolha.essencia !== "mana" && !conheceSimboloTeorico(c, `simbolo-${escolha.essencia}`)) {
    problemas.push(`Aprenda o símbolo de ${escolha.essencia} na árvore de origem ou por 1 PA na Teórica.`);
  }
  for (const operador of escolha.operadores) {
    if (operador === "rejeitar" && !conheceSimboloTeorico(c, "simbolo-rejeitar")) problemas.push("Aprenda Rejeitar por 1 PA.");
    if (operador === "repetir" && !conheceSimboloTeorico(c, "simbolo-repetir")) problemas.push("Aprenda Repetir no Intermediário.");
    if (operador === "expandir" && rank < 1) problemas.push("Expandir exige Teórica Intermediária.");
  }
  if (escolha.forma === "triangulo" && rank < 1) problemas.push("Triângulo exige Teórica Intermediária.");
  if (escolha.forma === "estrela" && rank < 2) problemas.push("Estrela exige Teórica Avançada.");
  if (escolha.forma === "espiral" && rank < 3) problemas.push("Espiral exige Teórica Santa.");
  if (escolha.gatilho && rank < 2) problemas.push("Gatilho exige Teórica Avançada.");
  if (escolha.meio === "pedra" && rank < 3) problemas.push("Pedra gravada exige Teórica Santa.");
  return problemas;
}
