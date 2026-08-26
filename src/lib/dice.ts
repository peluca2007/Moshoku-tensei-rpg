/** Parseia fórmulas simples do livro, tipo "1d4+1" ou "2d6+5". */
function parseDice(formula: string): { count: number; sides: number; mod: number } {
  const match = formula.replace(/\s/g, "").match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) return { count: 0, sides: 0, mod: 0 };
  return { count: Number(match[1]), sides: Number(match[2]), mod: match[3] ? Number(match[3]) : 0 };
}

/** Valor máximo possível da fórmula (Cap. 4: PV iniciais sempre usam o máximo do dado da Árvore Inicial). */
export function diceMax(formula: string): number {
  const { count, sides, mod } = parseDice(formula);
  return count * sides + mod;
}

/** Média (arredondada) da fórmula — usada pra progressão de PV nos ranks seguintes, fora da criação. */
export function diceAverage(formula: string): number {
  const { count, sides, mod } = parseDice(formula);
  return Math.round((count * (sides + 1)) / 2 + mod);
}
