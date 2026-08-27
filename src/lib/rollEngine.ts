/**
 * Motor de rolagem do rolador de dados. Cap. 4, "Vantagem é binária": Vantagem
 * = 2d20 escolhe o maior, Desvantagem = 2d20 escolhe o menor, Absoluta = 3d20.
 * 20 Natural = Crítico, 1 Natural = Falha Crítica — sempre no dado *escolhido*.
 */

export type AdvantageMode = "normal" | "vantagem" | "desvantagem" | "vantagemAbsoluta" | "desvantagemAbsoluta";

export const ADVANTAGE_LABELS: Record<AdvantageMode, string> = {
  normal: "Normal",
  vantagem: "Vantagem",
  desvantagem: "Desvantagem",
  vantagemAbsoluta: "Vantagem Absoluta",
  desvantagemAbsoluta: "Desvantagem Absoluta",
};

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export interface D20RollResult {
  mode: AdvantageMode;
  rolls: number[];
  kept: number;
  modifier: number;
  total: number;
  critical: "sucesso" | "falha" | null;
}

export function rollD20(mode: AdvantageMode, modifier: number): D20RollResult {
  const diceCount = mode === "normal" ? 1 : mode === "vantagem" || mode === "desvantagem" ? 2 : 3;
  const wantHigh = mode === "normal" || mode === "vantagem" || mode === "vantagemAbsoluta";
  const rolls = Array.from({ length: diceCount }, () => rollDie(20));
  const kept = wantHigh ? Math.max(...rolls) : Math.min(...rolls);
  const critical = kept === 20 ? "sucesso" : kept === 1 ? "falha" : null;
  return { mode, rolls, kept, modifier, total: kept + modifier, critical };
}

export interface DiceRollResult {
  formula: string;
  rolls: number[];
  sides: number;
  count: number;
  modifier: number;
  total: number;
}

/** Aceita "NdM", "dM" (conta implícita 1) e um modificador fixo opcional embutido ("2d6+3") ou passado à parte. */
export function rollFormula(formula: string, extraModifier = 0): DiceRollResult {
  const match = formula.replace(/\s/g, "").match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) return { formula, rolls: [], sides: 0, count: 0, modifier: extraModifier, total: extraModifier };
  const count = match[1] ? Number(match[1]) : 1;
  const sides = Number(match[2]);
  const embeddedModifier = match[3] ? Number(match[3]) : 0;
  const rolls = Array.from({ length: count }, () => rollDie(sides));
  const modifier = embeddedModifier + extraModifier;
  const total = rolls.reduce((a, b) => a + b, 0) + modifier;
  return { formula, rolls, sides, count, modifier, total };
}

export interface RollLogEntry {
  id: string;
  label: string;
  detail: string;
  total: number;
  critical?: "sucesso" | "falha" | null;
  timestamp: number;
}

let idCounter = 0;
export function nextRollId(): string {
  idCounter += 1;
  return `roll-${Date.now()}-${idCounter}`;
}
