import { describe, expect, it } from "vitest";
import { CharacterData } from "@/lib/types";
import { avaliarFormulaNaFicha, conheceSimboloTeorico } from "./simbolosTeoricos";
import { canPurchaseAbility, getPaSpent } from "@/store/selectors";
import { FormulaEscolha } from "./magiaTeorica";

const formula: FormulaEscolha = {
  rank: "Principiante", potencia: "Principiante", essencia: "fogo",
  operadores: ["projetar"], forma: "circulo", meio: "ar", gatilho: false, condicao: "entrada",
};
const ficha = {
  id: "teste", startingTreeId: "teorica",
  unlockedRanks: [{ treeId: "teorica", rank: "Principiante" }],
  purchasedAbilities: [],
  attributeBase: { forca: 0, agilidade: 0, vigor: 0, intelecto: 0, espirito: 0 },
  racialUpgrades: [], saveAdvantages: [], purchasedCombinedSpells: [], inventory: [],
  skills: [], proficiencies: [], weaponGroupChoices: [], bonusHp: 0, bonusMp: 0, overrides: {},
} as unknown as CharacterData;

describe("vocabulário da Magia Teórica", () => {
  it("exige uma fonte para o símbolo de Fogo", () => {
    expect(avaliarFormulaNaFicha(ficha, formula).join(" ")).toContain("fogo");
    const comFogo = { ...ficha, unlockedRanks: [...ficha.unlockedRanks, { treeId: "fogo", rank: "Principiante" as const }] };
    expect(conheceSimboloTeorico(comFogo, "simbolo-fogo")).toBe(true);
    expect(avaliarFormulaNaFicha(comFogo, formula)).toEqual([]);
    expect(canPurchaseAbility(comFogo, "teorica", "Principiante", "talent", "simbolo-fogo").ok).toBe(false);
  });

  it("devolve o PA de um símbolo comprado quando a escola de origem é aberta", () => {
    const comprado = { ...ficha, purchasedAbilities: [{ treeId: "teorica", rank: "Principiante" as const, kind: "talent" as const, id: "simbolo-fogo" }] };
    const comFogo = { ...comprado, unlockedRanks: [...ficha.unlockedRanks, { treeId: "fogo", rank: "Principiante" as const }] };
    expect(getPaSpent(comprado)).toBe(1);
    expect(getPaSpent(comFogo)).toBe(1); // a segunda árvore custa 1 PA; o símbolo passa a ser gratuito
  });

  it("Rejeitar é uma compra própria mesmo para quem já conhece outra essência", () => {
    const comFogo = { ...ficha, unlockedRanks: [...ficha.unlockedRanks, { treeId: "fogo", rank: "Principiante" as const }] };
    expect(avaliarFormulaNaFicha(comFogo, { ...formula, operadores: ["rejeitar"] })).toContain("Aprenda Rejeitar por 1 PA.");
  });

  it("Bardo ensina Som sem exigir a compra avulsa", () => {
    const comBardo = { ...ficha, unlockedRanks: [...ficha.unlockedRanks, { treeId: "bardo-e-interacao", rank: "Principiante" as const }] };
    expect(conheceSimboloTeorico(comBardo, "simbolo-som")).toBe(true);
    expect(avaliarFormulaNaFicha(comBardo, { ...formula, essencia: "som" })).toEqual([]);
  });
});
