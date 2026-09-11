import { describe, expect, it } from "vitest";
import {
  getArmorClass,
  getPaSpent,
  getWeaponDamage,
  getWeaponGroupPaCost,
  getWeaponGroups,
  isProficientWithWeapon,
} from "./selectors";
import {
  ARVORE_QUE_ESCALA_IMPROVISADO,
  GRUPO_BASE,
  GRUPOS_COMPRAVEIS,
  grupoDaArma,
  PA_POR_GRUPO,
} from "@/data/weaponGroups";
import { TREES } from "@/data/trees";
import { WEAPON_PRESETS } from "@/lib/weaponDie";
import { AttributeKey, CharacterData, RankName } from "@/lib/types";

/**
 * Proficiência por GRUPO DE ARMA — Cap. 1, §4.
 *
 * ## O que estes testes travam
 *
 * A régua original media proficiência pelo **dado**: "arma simples é até d6, e
 * todo mundo é proficiente". Isso tornava impossível o caso mais óbvio de
 * todos — ser proficiente em espada e não em adaga —, porque a adaga (d4)
 * estava ABAIXO da faixa livre.
 *
 * ## A economia, que mudou em 0.1.62
 *
 * A primeira versão dos grupos era generosa: um grupo livre na criação, mais um
 * por árvore do Corpo, e a regra geral de "1 PA compra **três** proficiências"
 * valendo pra eles. Um personagem colecionava três famílias inteiras de arma
 * pelo preço de metade de uma perícia.
 *
 * Agora é uma linha só: **você empunha o que estudou, ou o que pagou** — e
 * pagar custa `PA_POR_GRUPO`, fora do pacote de três.
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
  it("Desarmado e Improvisado, e SÓ isso", () => {
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

  /*
   * O que a 0.1.62 tirou. Sem isto, um personagem recém-criado já chegava com
   * uma família inteira de arma escolhida de graça.
   */
  it("não existe mais escolha livre na criação", () => {
    // Uma ficha zerada não tem grupo nenhum além do piso, e nada está "pendente".
    expect(getWeaponGroups(ficha())).toHaveLength(1);
    expect(getWeaponGroupPaCost(ficha())).toBe(0);
  });
});

describe("Improvisado é de graça, e é ruim de propósito", () => {
  const cadeira = "Objeto Improvisado";

  /*
   * A regra que impede o piso gratuito de virar a melhor arma do jogo. Sem ela,
   * um Imperador pega um banco de taverna e rola 3d10 sem ter estudado nada —
   * contra o espadachim que pagou por cada degrau.
   */
  it("a arma improvisada trava em d6, mesmo num Imperador", () => {
    const imperador = ficha({
      startingTreeId: "deus-da-espada",
      unlockedRanks: [
        { treeId: "deus-da-espada", rank: "Principiante" as RankName },
        { treeId: "deus-da-espada", rank: "Intermediário" as RankName },
        { treeId: "deus-da-espada", rank: "Avançado" as RankName },
        { treeId: "deus-da-espada", rank: "Santo" as RankName },
        { treeId: "deus-da-espada", rank: "Rei" as RankName },
        { treeId: "deus-da-espada", rank: "Imperador" as RankName },
      ],
    });
    const comCadeira = getWeaponDamage(imperador, "d6", "forca", cadeira)!;
    expect(comCadeira.steps, "improvisado não ganha degrau nenhum").toBe(0);
    expect(comCadeira.escalatedDie).toBe("d6");

    // A mesma ficha, com uma espada, escala normalmente — a trava é da ARMA.
    const comEspada = getWeaponDamage(imperador, "d6", "forca", "Espada Curta")!;
    expect(comEspada.steps).toBeGreaterThan(0);
  });

  /*
   * A exceção, e ela é a identidade da árvore: "se dá pra empunhar, você é
   * proficiente" deixa de ser prosa e vira número.
   */
  it("o Deus do Norte é o único que escala improvisado", () => {
    const norte = comArvore(ARVORE_QUE_ESCALA_IMPROVISADO, {
      unlockedRanks: [
        { treeId: ARVORE_QUE_ESCALA_IMPROVISADO, rank: "Principiante" as RankName },
        { treeId: ARVORE_QUE_ESCALA_IMPROVISADO, rank: "Intermediário" as RankName },
      ],
    });
    const info = getWeaponDamage(norte, "d6", "forca", cadeira)!;
    expect(info.steps, "o Norte escala improvisado").toBeGreaterThan(0);
    expect(info.escalatedDie).not.toBe("d6");
  });

  it("sem nome de arma, o motor não adivinha e escala normal", () => {
    // A maior parte dos chamadores passa só o dado. Travar por suspeita seria
    // pior que não travar: cortaria o dado de toda arma sem nome.
    const vex = comArvore("deus-da-espada");
    expect(getWeaponDamage(vex, "d6")!.steps).toBeGreaterThan(0);
  });
});

describe("Comprar um grupo", () => {
  it(`custa ${PA_POR_GRUPO} PA, e entra no PA gasto da ficha`, () => {
    const semNada = ficha();
    const comAdaga = ficha({ weaponGroupChoices: ["laminas-curtas"] });
    expect(getWeaponGroupPaCost(comAdaga)).toBe(PA_POR_GRUPO);
    expect(getPaSpent(comAdaga) - getPaSpent(semNada)).toBe(PA_POR_GRUPO);
    expect(isProficientWithWeapon(comAdaga, "Adaga / Punhal")).toBe(true);
  });

  it("dois grupos custam o dobro", () => {
    const dois = ficha({ weaponGroupChoices: ["laminas-curtas", "hastes"] });
    expect(getWeaponGroupPaCost(dois)).toBe(PA_POR_GRUPO * 2);
  });

  /*
   * O refund. Quem comprou Espadas e DEPOIS abriu o Deus da Espada não pode
   * continuar pagando por uma coisa que passou a vir de graça.
   */
  it("o que a árvore passa a dar de graça deixa de ser cobrado", () => {
    const antes = ficha({ weaponGroupChoices: ["espadas"] });
    expect(getWeaponGroupPaCost(antes)).toBe(PA_POR_GRUPO);

    const depois = comArvore("deus-da-espada", { weaponGroupChoices: ["espadas"] });
    expect(getWeaponGroupPaCost(depois), "o PA volta pra mão dele").toBe(0);
    expect(isProficientWithWeapon(depois, "Espada Longa")).toBe(true);
  });

  it("Escudos é comprável como qualquer outro", () => {
    // Ele era proibido enquanto a escolha era GRATUITA — o que fazia dele um
    // caso especial era o preço zero. Pagando 2 PA, não há razão pra proibir.
    expect(GRUPOS_COMPRAVEIS).toContain("escudos");
    const comEscudo = ficha({ weaponGroupChoices: ["escudos"] });
    expect(getWeaponGroups(comEscudo)).toContain("escudos");
  });

  it("o piso não é comprável — ele já veio", () => {
    expect(GRUPOS_COMPRAVEIS).not.toContain(GRUPO_BASE);
  });
});

describe("O exemplo do autor: espada sim, adaga não", () => {
  it("o Deus da Espada empunha espadão e não empunha punhal", () => {
    const vex = comArvore("deus-da-espada");
    expect(isProficientWithWeapon(vex, "Espada Longa")).toBe(true);
    expect(isProficientWithWeapon(vex, "Espadão / Montante")).toBe(true);
    expect(isProficientWithWeapon(vex, "Katana")).toBe(true);
    expect(isProficientWithWeapon(vex, "Adaga / Punhal")).toBe(false);
  });

  it("e a adaga entra se ele PAGAR por ela", () => {
    const vex = comArvore("deus-da-espada", { weaponGroupChoices: ["laminas-curtas"] });
    expect(isProficientWithWeapon(vex, "Adaga / Punhal")).toBe(true);
    expect(getWeaponGroupPaCost(vex)).toBe(PA_POR_GRUPO);
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
    }
  });

  it("toda árvore do livro declara os grupos dela — nenhuma ficou em prosa só", () => {
    for (const tree of TREES) {
      expect(tree.proficiencies?.gruposDeArma, tree.name).toBeDefined();
    }
  });

  /*
   * O grupo livre que cada árvore do Corpo dava saiu em 0.1.62. Este teste
   * existe pra que ele não volte por descuido junto com uma árvore nova.
   */
  it("nenhuma árvore dá grupo livre — isso acabou", () => {
    for (const tree of TREES) {
      const prof = tree.proficiencies as { escolhaDeGrupo?: number } | undefined;
      expect(prof?.escolhaDeGrupo, tree.name).toBeUndefined();
    }
  });
});

describe("Escudo (Cap. 1, §4)", () => {
  const escudo = { id: "e", name: "Escudo", type: "armadura" as const, acBonus: 2, equipped: true, quantity: 1 };

  it("com proficiência, o escudo rende os +2 cheios", () => {
    const vex = comArvore("cavalaria-e-escudos", { inventory: [escudo] });
    expect(getWeaponGroups(vex)).toContain("escudos");
    expect(getArmorClass(vex)).toBe(12);
  });

  it("sem proficiência, rende +1 em vez de +2", () => {
    const sera = comArvore("cura", { inventory: [escudo] });
    expect(getWeaponGroups(sera)).not.toContain("escudos");
    expect(getArmorClass(sera)).toBe(11);
  });

  it("armadura vestida não passa pela regra do escudo", () => {
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

  it("nenhum grupo de arma ficou com menos de duas armas", () => {
    const porGrupo = new Map<string, number>();
    for (const p of WEAPON_PRESETS) porGrupo.set(p.group, (porGrupo.get(p.group) ?? 0) + 1);
    for (const [grupo, n] of porGrupo) {
      // Desarmado e Improvisado é a exceção legítima: o punho não é item de
      // inventário nem de loja, então o grupo tem uma entrada só no catálogo.
      if (grupo === GRUPO_BASE) continue;
      expect(n, grupo).toBeGreaterThanOrEqual(2);
    }
  });

  it("arma que o catálogo não conhece não dá Desvantagem calada", () => {
    expect(grupoDaArma("Lâmina do Deus Dragão")).toBeNull();
    expect(isProficientWithWeapon(ficha(), "Lâmina do Deus Dragão")).toBe(true);
  });
});
