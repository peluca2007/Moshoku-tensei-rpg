import { describe, expect, it } from "vitest";
import { compararBuilds, SEMENTE_COMPARADOR } from "./buildComparison";
import { criaturaDoMolde } from "./encounterSim";
import type { CharacterData } from "./types";

const ficha: CharacterData = {
  id: "comparada", name: "Comparada", lore: "", raceId: null, backgroundId: null, subtableEntryId: null,
  attributeBase: { forca: 5, agilidade: 4, vigor: 4, intelecto: 1, espirito: 1 },
  raceAttributeChoices: [], racialUpgrades: [], saveAdvantages: [], startingTreeId: "deus-da-espada",
  unlockedRanks: [{ treeId: "deus-da-espada", rank: "Principiante" }], purchasedAbilities: [],
  purchasedCombinedSpells: [], gold: 0, inventory: [], skills: [], treeSkillChoices: [],
  proficiencies: [], weaponGroupChoices: [], bonusHp: 0, bonusMp: 0,
  currentHp: null, currentMp: null, currentPt: null, currentPp: null, overrides: {},
};

describe("comparador de builds", () => {
  it("mede fichas idênticas contra a mesma criatura sem alterar o alvo", () => {
    const alvo = { ...criaturaDoMolde(2, "padrao", "Rival salvo", "rival"), quantidade: 1 };
    const original = JSON.stringify(alvo);
    const resultado = compararBuilds({ primeira: ficha, segunda: { ...ficha }, alvo, semente: SEMENTE_COMPARADOR });
    expect(resultado.primeira).toEqual(resultado.segunda);
    expect(JSON.stringify(alvo)).toBe(original);
  });
});
