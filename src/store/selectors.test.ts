import { describe, expect, it } from "vitest";
import {
  getArmorClass,
  getAttributePaCost,
  getMaxHp,
  getMaxMp,
  getPaSpent,
  getPtPool,
  getSaveAdvantagePaCost,
  getSpellDC,
  getAttackBonus,
  getTrainedBody,
} from "./selectors";
import {
  attributePaCostTotal,
  ATTRIBUTE_CREATION_POINTS,
  AttributeKey,
  CharacterData,
  getVigorFactor,
  PV_BASE,
  saveAdvantagePaCostTotal,
} from "@/lib/types";

/**
 * Testes das fórmulas do Cap. 4 e do Cap. 1.
 *
 * Por que existem (2026-09-03): `selectors.ts` tem 35 funções puras que
 * calculam TODO número da ficha — PV, PM, PT, PP, CA, BC e o PA gasto — e não
 * tinha um único teste. Duas das correções desta sessão foram exatamente do
 * tipo que um teste pega e uma revisão humana não: a ficha imprimia
 * `count × 2 PA` enquanto o motor cobrava a escada progressiva, e
 * `perfectRecitationBonus` lia um campo (`ability.rank`) que nunca existiu no
 * tipo.
 *
 * O que estes testes travam não é "o número está certo" — é **o número está no
 * mesmo lugar em que o livro diz que está**. Cada `expect` abaixo carrega a
 * seção do livro que o justifica, então quando um deles quebrar o autor sabe
 * imediatamente se quebrou o código ou mudou a regra.
 */

const ZERO_ATTRS: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

function ficha(patch: Partial<CharacterData> = {}): CharacterData {
  return {
    id: "t",
    name: "Teste",
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { ...ZERO_ATTRS },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: null,
    unlockedRanks: [],
    purchasedAbilities: [],
    gold: 0,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
    overrides: {},
    ...patch,
  };
}

describe("PV Máximos (Cap. 4, §1)", () => {
  it("sem nenhum patamar, o corpo é só a constante de base", () => {
    expect(getTrainedBody(ficha())).toBe(PV_BASE);
    expect(getMaxHp(ficha())).toBe(PV_BASE);
  });

  it("Vigor multiplica o corpo treinado, e o fator vem da tabela do livro", () => {
    const comVigor = ficha({ attributeBase: { ...ZERO_ATTRS, vigor: 3 } });
    expect(getMaxHp(comVigor)).toBe(Math.floor(PV_BASE * getVigorFactor(3)));
  });

  it("a escala negativa do Vigor é assimétrica de propósito", () => {
    // Cap. 1, §1, "Antes de largar o Vigor": -1 tira um quarto, -2 quase metade
    // do que sobrou. Se algum dia isto virar linear, o aviso do livro vira mentira.
    expect(getVigorFactor(-1)).toBe(0.75);
    expect(getVigorFactor(-2)).toBe(0.4);
    expect(getVigorFactor(1) - getVigorFactor(0)).toBeCloseTo(0.2, 5);
  });

  it("PV comprados com PA ficam FORA do Fator de Vigor", () => {
    // A regra que impede 1 PA de valer 2,6× mais numa ficha de Vigor 8.
    const a = getMaxHp(ficha({ attributeBase: { ...ZERO_ATTRS, vigor: 8 }, bonusHp: 10 }));
    const b = getMaxHp(ficha({ attributeBase: { ...ZERO_ATTRS, vigor: 8 } }));
    expect(a - b).toBe(10);
  });

  it("um override substitui o valor calculado por inteiro", () => {
    expect(getMaxHp(ficha({ overrides: { maxHp: 999 } }))).toBe(999);
  });
});

describe("PM Máximos (Cap. 4, §1)", () => {
  it("sem patamar de magia, sobra só a base de 8", () => {
    expect(getMaxMp(ficha())).toBe(8);
  });

  it("o piso de Espírito 4 mantém o cirurgião jogável", () => {
    // Cap. 1, §1: sem esse piso, um Imperador de Espírito 2 teria menos PM que
    // o custo da assinatura da própria escola.
    const espirito2 = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 2 },
      unlockedRanks: [{ treeId: "agua", rank: "Principiante" }],
    });
    const espirito4 = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 4 },
      unlockedRanks: [{ treeId: "agua", rank: "Principiante" }],
    });
    expect(getMaxMp(espirito2)).toBe(getMaxMp(espirito4));
  });

  it("PA avulso é cortado pelo cap nos dois primeiros patamares", () => {
    const semPa = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 4 },
      unlockedRanks: [{ treeId: "agua", rank: "Principiante" }],
    });
    const comPa = ficha({ ...semPa, bonusMp: 20 });
    expect(getMaxMp(comPa)).toBe(getMaxMp(semPa));
  });

  it("acima do 2º patamar o cap some e o PA avulso volta a contar", () => {
    const base = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 4 },
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "agua", rank: "Intermediário" },
        { treeId: "agua", rank: "Avançado" },
      ],
    });
    expect(getMaxMp({ ...base, bonusMp: 10 })).toBe(getMaxMp(base) + 10);
  });

  it("árvore do Corpo não concede PM nenhum, em patamar nenhum", () => {
    const guerreiro = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 6 },
      unlockedRanks: [{ treeId: "deus-da-espada", rank: "Imperador" }],
    });
    expect(getMaxMp(guerreiro)).toBe(8);
  });
});

describe("Pontos de Touki (Cap. 3)", () => {
  it("sem patamar do Corpo, não existe PT", () => {
    expect(getPtPool(ficha({ attributeBase: { ...ZERO_ATTRS, vigor: 5 } }))).toBe(0);
  });

  it("PT Menor antes do Pleno é o Vigor, com mínimo 1", () => {
    const semVigor = ficha({ unlockedRanks: [{ treeId: "deus-do-norte", rank: "Principiante" }] });
    expect(getPtPool(semVigor)).toBe(1);
  });

  it("magia e utilidade nunca dão PT, por mais alto que seja o rank", () => {
    const mago = ficha({
      attributeBase: { ...ZERO_ATTRS, vigor: 6, espirito: 6 },
      unlockedRanks: [{ treeId: "terra", rank: "Imperador" }],
    });
    expect(getPtPool(mago)).toBe(0);
  });
});

describe("Custos de PA (Cap. 1, §2)", () => {
  it("a compra de atributo é progressiva: 1, 1, 2, 2, 3, 3…", () => {
    expect([1, 2, 3, 4, 5, 6].map(attributePaCostTotal)).toEqual([1, 2, 4, 6, 9, 12]);
  });

  it("a Vantagem em Resistência é 2, 3, 4, 4, 4 — 17 PA pelas cinco", () => {
    expect([1, 2, 3, 4, 5].map(saveAdvantagePaCostTotal)).toEqual([2, 5, 9, 13, 17]);
  });

  it("o motor cobra exatamente a escada que o livro imprime", () => {
    // A regressão de 2026-09-03: a ficha mostrava `count × 2` e o motor cobrava
    // a escada. Este teste é o que impede as duas de divergirem de novo.
    const cinco = ficha({ saveAdvantages: ["forca", "agilidade", "vigor", "intelecto", "espirito"] });
    expect(getSaveAdvantagePaCost(cinco)).toBe(saveAdvantagePaCostTotal(5));
    expect(getSaveAdvantagePaCost(cinco)).toBe(17);
  });

  it("atributo dentro do orçamento da criação não custa PA", () => {
    const noOrcamento = ficha({
      attributeBase: { ...ZERO_ATTRS, forca: ATTRIBUTE_CREATION_POINTS },
    });
    expect(getAttributePaCost(noOrcamento)).toBe(0);
  });

  it("o Sistema de Defeitos não cria pontos: a soma é que conta", () => {
    // Cap. 1, §1: com os dois defeitos a soma dos cinco fecha em 2 de qualquer
    // jeito, então nada é cobrado.
    const comDefeitos = ficha({
      attributeBase: { forca: 4, agilidade: 1, vigor: 0, intelecto: -1, espirito: -2 },
    });
    expect(getAttributePaCost(comDefeitos)).toBe(0);
  });
});

describe("Custo de Abertura de árvore (Cap. 1, §8)", () => {
  it("a primeira árvore é grátis e cada nova custa uma a mais", () => {
    // 1ª = 0 PA extra, 2ª = 1, 3ª = 2 — o que impede abrir cinco árvores
    // por 5 PA só pra colecionar Maestrias de 1º patamar.
    const uma = ficha({ unlockedRanks: [{ treeId: "agua", rank: "Principiante" }] });
    const duas = ficha({
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "fogo", rank: "Principiante" },
      ],
    });
    const tres = ficha({
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "fogo", rank: "Principiante" },
        { treeId: "vento", rank: "Principiante" },
      ],
    });
    expect(getPaSpent(uma)).toBe(0);
    expect(getPaSpent(duas)).toBe(1);
    expect(getPaSpent(tres)).toBe(3);
  });
});

describe("BC e CD (Cap. 1, §7)", () => {
  it("CD é sempre 8 + BC, e BC é o atributo mais o Rank daquela árvore", () => {
    const mago = ficha({
      attributeBase: { ...ZERO_ATTRS, intelecto: 5 },
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "agua", rank: "Intermediário" },
      ],
    });
    const bc = getAttackBonus(mago, "agua", "intelecto");
    expect(bc).toBe(5 + 2); // Intelecto 5 + Bônus do Intermediário
    expect(getSpellDC(mago, "agua", "intelecto")).toBe(8 + bc);
  });

  it("o Bônus é da árvore em uso, não o maior da ficha", () => {
    // Cap. 1, §7, "O Bônus Depende da Ação".
    const multi = ficha({
      attributeBase: { ...ZERO_ATTRS, intelecto: 4, espirito: 4 },
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "agua", rank: "Intermediário" },
        { treeId: "agua", rank: "Avançado" },
        { treeId: "cura", rank: "Principiante" },
      ],
    });
    expect(getAttackBonus(multi, "agua", "intelecto")).toBe(4 + 3);
    expect(getAttackBonus(multi, "cura", "espirito")).toBe(4 + 1);
  });
});

describe("Classe de Armadura (Cap. 4, §1)", () => {
  it("base 10 + Agilidade", () => {
    expect(getArmorClass(ficha({ attributeBase: { ...ZERO_ATTRS, agilidade: 3 } }))).toBe(13);
  });

  it("só armadura equipada conta", () => {
    const item = {
      id: "i1",
      name: "Cota",
      type: "armadura" as const,
      acBonus: 4,
      equipped: false,
    };
    expect(getArmorClass(ficha({ inventory: [item] }))).toBe(10);
    expect(getArmorClass(ficha({ inventory: [{ ...item, equipped: true }] }))).toBe(14);
  });
});
