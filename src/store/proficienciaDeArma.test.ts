import { describe, expect, it } from "vitest";
import {
  getArmorClass,
  getPendingWeaponGroupChoices,
  getWeaponGroupChoiceBudget,
  getWeaponGroups,
  isProficientWithWeapon,
} from "./selectors";
import { GRUPO_BASE, GRUPOS_ESCOLHIVEIS, grupoDaArma } from "@/data/weaponGroups";
import { TREES } from "@/data/trees";
import { WEAPON_PRESETS } from "@/lib/weaponDie";
import { AttributeKey, CharacterData, RankName } from "@/lib/types";

/**
 * Proficiência por GRUPO DE ARMA — Cap. 1, §4 (0.1.52).
 *
 * ## O que estes testes travam
 *
 * A regra antiga media proficiência pelo **dado**: "arma simples é até d6, e
 * todo mundo é proficiente". Isso produzia três coisas que o livro não queria
 * dizer e ninguém tinha percebido:
 *
 * - a **Rapieira** (d6) era livre pra qualquer um, e a **Espada Longa** (d8)
 *   não — o mesmo ofício, dois tratamentos, decididos pelo tamanho do dado;
 * - o **Arco Curto** (d6) e a **Espada Curta** (d6) caíam na mesma categoria,
 *   como se puxar corda e trocar golpe fossem o mesmo treino;
 * - **não existia** "proficiente em espada mas não em adaga". A categoria não
 *   existia: proficiência de arma era uma faixa de dano.
 *
 * Os testes abaixo são o que impede a régua de voltar a ser o dado.
 */

const ZERO: Record<AttributeKey, number> = {
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
    attributeBase: { ...ZERO },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: null,
    unlockedRanks: [],
    purchasedAbilities: [],
    purchasedCombinedSpells: [],
    gold: 0,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
    weaponGroupChoices: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
    currentCalor: null,
    overrides: {},
    ...patch,
  } as CharacterData;
}

/** Abre uma árvore no 1º patamar, que é tudo que a proficiência exige. */
function comArvore(treeId: string, patch: Partial<CharacterData> = {}): CharacterData {
  return ficha({
    startingTreeId: treeId,
    unlockedRanks: [{ treeId, rank: "Principiante" as RankName }],
    ...patch,
  });
}

describe("O piso: com o que todo personagem nasce", () => {
  it("Desarmado e Improvisado vem de graça, sem árvore nenhuma", () => {
    expect(getWeaponGroups(ficha())).toEqual([GRUPO_BASE]);
    expect(isProficientWithWeapon(ficha(), "Objeto Improvisado")).toBe(true);
  });

  /*
   * O teste que mata a régua antiga. Sob "arma simples é até d6", estas quatro
   * eram livres pra um personagem que nunca abriu árvore nenhuma.
   */
  it("o que o dado d6 dava de graça, agora não dá", () => {
    const zé = ficha();
    for (const arma of ["Rapieira", "Espada Curta", "Arco Curto", "Adaga / Punhal"]) {
      expect(isProficientWithWeapon(zé, arma), `${arma} devia exigir treino`).toBe(false);
    }
  });

  it("todo personagem tem UMA escolha livre, mesmo sem árvore", () => {
    expect(getWeaponGroupChoiceBudget(ficha())).toBe(1);
    const comAdaga = ficha({ weaponGroupChoices: ["laminas-curtas"] });
    expect(isProficientWithWeapon(comAdaga, "Adaga / Punhal")).toBe(true);
    expect(isProficientWithWeapon(comAdaga, "Espada Longa")).toBe(false);
  });

  it("Escudos não está entre os grupos que se escolhe de graça", () => {
    expect(GRUPOS_ESCOLHIVEIS).not.toContain("escudos");
    expect(GRUPOS_ESCOLHIVEIS).not.toContain(GRUPO_BASE);
  });
});

describe("O exemplo do autor: espada sim, adaga não", () => {
  /*
   * A frase que abriu esta versão: "vc ser prof em espada mas n ser em adaga".
   * Sob a regra antiga era impossível de representar — a adaga (d4) estava
   * ABAIXO da faixa livre, então quem tinha espada tinha adaga por tabela.
   */
  it("o Deus da Espada empunha espadão e não empunha punhal", () => {
    const vex = comArvore("deus-da-espada");
    expect(isProficientWithWeapon(vex, "Espada Longa")).toBe(true);
    expect(isProficientWithWeapon(vex, "Espadão / Montante")).toBe(true);
    expect(isProficientWithWeapon(vex, "Katana")).toBe(true);
    expect(isProficientWithWeapon(vex, "Adaga / Punhal")).toBe(false);
  });

  it("e a adaga entra se ELE escolher que entre", () => {
    const vex = comArvore("deus-da-espada", { weaponGroupChoices: ["laminas-curtas"] });
    expect(isProficientWithWeapon(vex, "Adaga / Punhal")).toBe(true);
  });

  it("o Ladino é o contrário: punhal sim, espadão não", () => {
    const ladino = comArvore("furtividade-e-armadilhas");
    expect(isProficientWithWeapon(ladino, "Adaga / Punhal")).toBe(true);
    expect(isProficientWithWeapon(ladino, "Besta")).toBe(true);
    expect(isProficientWithWeapon(ladino, "Espadão / Montante")).toBe(false);
  });
});

describe("As árvores", () => {
  it("o Deus do Norte é proficiente em TUDO — é a identidade dele", () => {
    const norte = comArvore("deus-do-norte");
    for (const preset of WEAPON_PRESETS) {
      expect(isProficientWithWeapon(norte, preset.name), preset.name).toBe(true);
    }
    expect(getWeaponGroups(norte)).toContain("escudos");
  });

  it("e por já ter tudo, não ganha escolha nenhuma além da inicial", () => {
    expect(getWeaponGroupChoiceBudget(comArvore("deus-do-norte"))).toBe(1);
    expect(getWeaponGroupChoiceBudget(comArvore("deus-da-espada"))).toBe(2);
  });

  /*
   * Proficiência de arma vale por árvore ABERTA, não só pela Inicial — ao
   * contrário de `grantedSkills`. Perícia é hábito e você já era alguém quando
   * chegou na segunda árvore; empunhar arma é treino, e é o que a árvore ensina
   * em qualquer ordem que você a abra.
   */
  it("vale por árvore aberta, não só pela Inicial", () => {
    const misto = ficha({
      startingTreeId: "fogo",
      unlockedRanks: [
        { treeId: "fogo", rank: "Principiante" as RankName },
        { treeId: "arquearia", rank: "Principiante" as RankName },
      ],
    });
    expect(isProficientWithWeapon(misto, "Arco Longo")).toBe(true);
  });

  it("as oito escolas de magia não concedem grupo nenhum", () => {
    for (const id of ["fogo", "agua", "cura", "barreira"]) {
      const tree = TREES.find((t) => t.id === id);
      expect(tree?.proficiencies?.gruposDeArma, id).toEqual([]);
      expect(tree?.proficiencies?.escolhaDeGrupo, id).toBeUndefined();
    }
  });

  it("toda árvore do livro declara os grupos dela — nenhuma ficou em prosa só", () => {
    for (const tree of TREES) {
      expect(tree.proficiencies?.gruposDeArma, tree.name).toBeDefined();
    }
  });
});

describe("O orçamento de escolhas", () => {
  it("uma escolha que a árvore já cobriu volta pra mão do jogador", () => {
    // Escolheu Espadas e DEPOIS abriu o Deus da Espada: a escolha não pode
    // virar PA jogado fora só porque a ordem foi essa.
    const vex = comArvore("deus-da-espada", { weaponGroupChoices: ["espadas"] });
    expect(getPendingWeaponGroupChoices(vex)).toBe(2);
  });

  it("escolhas além do orçamento não contam", () => {
    const zé = ficha({ weaponGroupChoices: ["espadas", "hastes", "flexiveis"] });
    expect(getWeaponGroups(zé)).toEqual(["espadas", GRUPO_BASE]);
  });
});

describe("Escudo (Cap. 1, §4)", () => {
  const escudo = { id: "e", name: "Escudo", type: "armadura" as const, acBonus: 2, equipped: true, quantity: 1 };

  it("com proficiência, o escudo rende os +2 cheios", () => {
    const vex = comArvore("cavalaria-e-escudos", { inventory: [escudo] });
    expect(getWeaponGroups(vex)).toContain("escudos");
    expect(getArmorClass(vex)).toBe(12);
  });

  /*
   * A regra que o livro escrevia e o código nunca cobrou: até 0.1.51,
   * `getArmorClass` somava o `acBonus` de qualquer coisa equipada, e um mago
   * com escudo ganhava os +2 inteiros. Agora rende +1 — erguer uma tábua na
   * frente do corpo ajuda um pouco mesmo sem treino, só não é defender.
   */
  it("sem proficiência, rende +1 em vez de +2", () => {
    const sera = comArvore("cura", { inventory: [escudo] });
    expect(getWeaponGroups(sera)).not.toContain("escudos");
    expect(getArmorClass(sera)).toBe(11);
  });

  it("armadura vestida não passa pela regra do escudo", () => {
    // A penalidade de armadura é Desvantagem em Furtividade/Acrobacia e −3m de
    // Deslocamento, nunca CA menor. Um peitoral rende o que promete.
    const couraça = { id: "c", name: "Armadura Pesada (placas)", type: "armadura" as const, acBonus: 6, equipped: true, quantity: 1 };
    const sera = comArvore("cura", { inventory: [couraça] });
    expect(getArmorClass(sera)).toBe(16);
  });
});

describe("O catálogo", () => {
  it("toda arma do catálogo pertence a um grupo conhecido", () => {
    for (const preset of WEAPON_PRESETS) {
      expect(grupoDaArma(preset.name), preset.name).toBe(preset.group);
    }
  });

  /*
   * Grupo com uma arma só não é grupo: é a arma com um nome comprido. Foi por
   * isso que 0.1.52 acrescentou seis armas ao catálogo.
   */
  it("nenhum grupo de arma ficou com menos de duas armas", () => {
    const porGrupo = new Map<string, number>();
    for (const p of WEAPON_PRESETS) porGrupo.set(p.group, (porGrupo.get(p.group) ?? 0) + 1);
    for (const [grupo, n] of porGrupo) {
      // Desarmado e Improvisado é a exceção legítima: o punho não é item de
      // inventário nem de loja, então o grupo tem uma entrada só no catálogo
      // ("Objeto Improvisado"). Ele não precisa de massa — todo personagem já
      // nasce proficiente nele.
      if (grupo === GRUPO_BASE) continue;
      expect(n, grupo).toBeGreaterThanOrEqual(2);
    }
  });

  it("arma que o catálogo não conhece não dá Desvantagem calada", () => {
    // Loot de campanha é do Mestre. Um sistema que penaliza por não reconhecer
    // um nome é pior que um que não penaliza.
    expect(grupoDaArma("Lâmina do Deus Dragão")).toBeNull();
    expect(isProficientWithWeapon(ficha(), "Lâmina do Deus Dragão")).toBe(true);
  });
});
