import { describe, expect, it } from "vitest";
import { resolverArmaCombate } from "./combatWeapon";
import { CharacterData, InventoryItem } from "./types";

function ficha(patch: Partial<CharacterData> = {}): CharacterData {
  return {
    id: "arma-teste", name: "Espadachim", lore: "", raceId: null, backgroundId: null,
    subtableEntryId: null, attributeBase: { forca: 4, agilidade: 7, vigor: 2, intelecto: 9, espirito: 2 },
    raceAttributeChoices: [], racialUpgrades: [], saveAdvantages: [], startingTreeId: "deus-da-espada",
    unlockedRanks: [{ treeId: "deus-da-espada", rank: "Principiante" }], purchasedAbilities: [],
    purchasedCombinedSpells: [], gold: 0, inventory: [], skills: [], treeSkillChoices: [], proficiencies: [],
    weaponGroupChoices: [], bonusHp: 0, bonusMp: 0, currentHp: null, currentMp: null, currentPt: null,
    currentPp: null, overrides: {}, ...patch,
  };
}

const adaga: InventoryItem = { id: "adaga", type: "arma", name: "Adaga / Punhal", baseDie: "d4", equipped: true };
const espadao: InventoryItem = { id: "espadao", type: "arma", name: "Espadão / Montante", baseDie: "d10", equipped: false };

describe("arma do cenário de combate", () => {
  it("usa a única arma equipada, sem trocar a adaga pela arma maior da mochila", () => {
    const arma = resolverArmaCombate(ficha({ inventory: [adaga, espadao] }));
    expect(arma).toMatchObject({ id: "adaga", baseDie: "d4", escalatedDie: "d6", steps: 1, origem: "equipada", attributeKey: "agilidade", attributeValue: 7, rankBonus: 1, attackBonus: 8, damageBonus: 8 });
  });

  it("a seleção explícita vence o equipamento e respeita d10", () => {
    const arma = resolverArmaCombate(ficha({ inventory: [adaga, espadao] }), "espadao");
    expect(arma).toMatchObject({ id: "espadao", baseDie: "d10", escalatedDie: "d12", origem: "selecionada", attributeKey: "forca", attackBonus: 5 });
  });

  it("null escolhe referência e ID apagado avisa sem escolher outra arma", () => {
    const c = ficha({ inventory: [adaga, espadao] });
    expect(resolverArmaCombate(c, null)).toMatchObject({ id: null, baseDie: "d6", escalatedDie: "d8", origem: "referencia" });
    const removida = resolverArmaCombate(c, "removida");
    expect(removida.id).toBeNull();
    expect(removida.aviso).toMatch(/não existe/);
  });

  it("nenhuma ou várias armas equipadas tornam a referência explícita", () => {
    expect(resolverArmaCombate(ficha({ inventory: [espadao] }))).toMatchObject({ id: null, origem: "referencia", aviso: expect.stringContaining("Nenhuma") });
    expect(resolverArmaCombate(ficha({ inventory: [adaga, { ...espadao, equipped: true }] }))).toMatchObject({ id: null, origem: "referencia", aviso: expect.stringContaining("mais de uma") });
  });

  it("arma sem dado válido não produz dano zero nem esconde outra equipada", () => {
    const invalida = { ...adaga, baseDie: "sem dano" };
    expect(resolverArmaCombate(ficha({ inventory: [invalida] }))).toMatchObject({ baseDie: "d6", origem: "referencia", aviso: expect.stringContaining("dado válido") });
    expect(resolverArmaCombate(ficha({ inventory: [invalida, { ...espadao, equipped: true }] }))).toMatchObject({ id: null, aviso: expect.stringContaining("mais de uma") });
  });

  it("referência d6 mantém builds sem inventário e Água usa Agilidade", () => {
    const agua = ficha({ startingTreeId: "deus-da-agua-corpo", unlockedRanks: [{ treeId: "deus-da-agua-corpo", rank: "Principiante" }] });
    expect(resolverArmaCombate(agua)).toMatchObject({ baseDie: "d6", escalatedDie: "d8", attributeKey: "agilidade", attackBonus: 8, damageBonus: 8 });
    expect(resolverArmaCombate({ ...agua, inventory: [{ ...espadao, equipped: true }] })).toMatchObject({ attributeKey: "agilidade", escalatedDie: "d12" });
  });

  it("respeita o atributo declarado no inventário", () => {
    expect(resolverArmaCombate(ficha({ inventory: [{ ...adaga, damageAttribute: "forca" }] }))).toMatchObject({ attributeKey: "forca", attributeValue: 4 });
  });

  it("multiclasse usa o maior Rank do Corpo, sem somar árvores nem usar Rank mágico", () => {
    const arma = resolverArmaCombate(ficha({
      startingTreeId: "agua", inventory: [{ ...espadao, equipped: true }],
      unlockedRanks: [
        { treeId: "agua", rank: "Imperador" },
        { treeId: "deus-da-espada", rank: "Principiante" },
        { treeId: "deus-do-norte", rank: "Santo" },
      ],
    }));
    expect(arma).toMatchObject({ treeId: "deus-do-norte", rankBonus: 4, steps: 4, escalatedDie: "2d12", attributeKey: "agilidade", damageBonus: 11 });
  });

  it("sem Corpo não recebe degraus nem Rank mágico em acerto ou dano", () => {
    const arma = resolverArmaCombate(ficha({ startingTreeId: "agua", unlockedRanks: [{ treeId: "agua", rank: "Imperador" }], inventory: [{ ...espadao, equipped: true }] }));
    expect(arma).toMatchObject({ escalatedDie: "d10", steps: 0, rankBonus: 0, attributeKey: "forca", attackBonus: 4, damageBonus: 4, treeId: null });
  });

  it("proficiência vem dos grupos e nunca reduz o dano", () => {
    const c = ficha({ startingTreeId: "agua", unlockedRanks: [{ treeId: "agua", rank: "Principiante" }], inventory: [adaga] });
    const semTreino = resolverArmaCombate(c);
    const treinada = resolverArmaCombate({ ...c, weaponGroupChoices: ["laminas-curtas"] });
    expect(semTreino.proficiente).toBe(false);
    expect(treinada.proficiente).toBe(true);
    expect(semTreino.damageBonus).toBe(treinada.damageBonus);
    expect(semTreino.escalatedDie).toBe(treinada.escalatedDie);
  });

  it("improvisado só escala quando os degraus vêm do Norte", () => {
    const improvisada: InventoryItem = { id: "cadeira", name: "Objeto Improvisado", baseDie: "d6", equipped: true, type: "arma" };
    expect(resolverArmaCombate(ficha({ inventory: [improvisada] }))).toMatchObject({ steps: 0, escalatedDie: "d6" });
    expect(resolverArmaCombate(ficha({ inventory: [improvisada], unlockedRanks: [{ treeId: "deus-do-norte", rank: "Principiante" }] }))).toMatchObject({ steps: 1, escalatedDie: "d8" });
  });

  it("preserva múltiplos dados e fixo de degraus acima do teto", () => {
    const c = ficha({ unlockedRanks: [{ treeId: "deus-da-espada", rank: "Imperador" }], inventory: [{ ...adaga, baseDie: "4d12" }] });
    expect(resolverArmaCombate(c)).toMatchObject({ baseDie: "4d12", steps: 9, escalatedDie: "5d12+14" });
  });

  it("Quebrantado fica separado do bônus para o motor descontá-lo uma única vez", () => {
    expect(resolverArmaCombate(ficha({ condicoes: [{ id: "quebrantado", acumulos: 2 }] }))).toMatchObject({ damageBonus: 5, penalidadeQuebrantado: 2 });
  });
});
