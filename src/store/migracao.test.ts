import { describe, expect, it } from "vitest";
import { migrarRoster } from "./useCharacterStore";
import { CharacterData } from "@/lib/types";

/**
 * A migração do roster nunca teve teste, e é o código mais perigoso do projeto.
 *
 * "Ficha salva nunca é resetada" é a terceira regra da base de código, e esta
 * função é a única coisa entre uma ficha de campanha e o formato novo. Ela já
 * atravessou da `version: 4` até a 15 — só nesta sessão foram duas —, enquanto
 * o `selectors.ts` ao lado tem centenas de linhas travando fórmulas que, se
 * errarem, no máximo mostram um número torto na tela.
 *
 * O que cada teste aqui protege é uma sessão de alguém.
 */

/** Uma ficha como o `localStorage` a guardava na version 13, com campanha em cima. */
function fichaSalvaV13() {
  return {
    id: "char_real",
    name: "Rudeus Greyrat",
    lore: "Nasceu de novo, e desta vez com as mãos.",
    raceId: "humano",
    backgroundId: "nobre",
    subtableEntryId: null,
    attributeBase: { forca: 2, agilidade: 3, vigor: 3, intelecto: 6, espirito: 5 },
    raceAttributeChoices: ["intelecto"],
    racialUpgrades: [],
    saveAdvantages: ["intelecto"],
    startingTreeId: "agua",
    unlockedRanks: [
      { treeId: "agua", rank: "Principiante" },
      { treeId: "agua", rank: "Intermediário" },
      { treeId: "fogo", rank: "Principiante" },
    ],
    purchasedAbilities: [
      { treeId: "agua", rank: "Principiante", kind: "ability", id: "jato-de-agua" },
      { treeId: "fogo", rank: "Principiante", kind: "talent", id: "chama-interior" },
    ],
    purchasedCombinedSpells: ["barreira-incandescente"],
    gold: 340,
    inventory: [{ id: "pocao_menor_cura", name: "Poção Menor de Cura", type: "pocao", equipped: false }],
    skills: ["Arcanismo", "Percepção"],
    treeSkillChoices: ["Natureza"],
    proficiencies: ["Língua Élfica"],
    weaponGroupChoices: [],
    bonusHp: 4,
    bonusMp: 2,
    currentHp: 17,
    currentMp: 9,
    currentPt: null,
    currentPp: null,
    currentCalor: null,
    overrides: { armorClass: 14 },
  } as unknown as CharacterData;
}

function roster(ficha: CharacterData) {
  return { characters: { [ficha.id]: ficha }, order: [ficha.id], activeId: ficha.id };
}

describe("uma ficha de campanha sobrevive à migração", () => {
  const migrada = migrarRoster(roster(fichaSalvaV13()), 13).characters["char_real"];
  const original = fichaSalvaV13();

  it("não perde nada do que o jogador construiu", () => {
    expect(migrada.name).toBe(original.name);
    expect(migrada.lore).toBe(original.lore);
    expect(migrada.raceId).toBe(original.raceId);
    expect(migrada.backgroundId).toBe(original.backgroundId);
    expect(migrada.attributeBase).toEqual(original.attributeBase);
    expect(migrada.raceAttributeChoices).toEqual(original.raceAttributeChoices);
    expect(migrada.saveAdvantages).toEqual(original.saveAdvantages);
    expect(migrada.startingTreeId).toBe(original.startingTreeId);
    expect(migrada.unlockedRanks).toEqual(original.unlockedRanks);
    expect(migrada.purchasedCombinedSpells).toEqual(original.purchasedCombinedSpells);
    expect(migrada.skills).toEqual(original.skills);
    expect(migrada.treeSkillChoices).toEqual(original.treeSkillChoices);
    expect(migrada.proficiencies).toEqual(original.proficiencies);
  });

  it("não perde as habilidades compradas — que são PA gasto", () => {
    expect(migrada.purchasedAbilities).toEqual(original.purchasedAbilities);
  });

  it("não perde ouro, inventário nem os PV/PM do meio da sessão", () => {
    expect(migrada.gold).toBe(340);
    expect(migrada.inventory).toEqual(original.inventory);
    expect(migrada.currentHp).toBe(17);
    expect(migrada.currentMp).toBe(9);
  });

  it("não perde os bônus comprados nem o override manual de CA", () => {
    expect(migrada.bonusHp).toBe(4);
    expect(migrada.bonusMp).toBe(2);
    expect(migrada.overrides).toEqual({ armorClass: 14 });
  });

  it("o roster em volta continua inteiro", () => {
    const r = migrarRoster(roster(fichaSalvaV13()), 13);
    expect(r.order).toEqual(["char_real"]);
    expect(r.activeId).toBe("char_real");
  });
});

/*
 * Os campos que ESTA sessão adicionou (0.1.24 e 0.1.25). Uma ficha salva antes
 * deles não os tem, e todo cálculo que os lê precisa de um valor — o que a
 * migração dá.
 */
describe("os campos novos ganham valor, em vez de ficarem indefinidos", () => {
  it("condições e descansos nascem zerados numa ficha antiga", () => {
    const m = migrarRoster(roster(fichaSalvaV13()), 13).characters["char_real"];
    expect(m.condicoes).toEqual([]);
    expect(m.descansosCurtos).toBe(0);
  });

  it("mas não sobrescrevem o que a ficha já tinha", () => {
    const comEstado = {
      ...fichaSalvaV13(),
      condicoes: [{ id: "envenenado" }],
      descansosCurtos: 2,
    } as unknown as CharacterData;
    const m = migrarRoster(roster(comEstado), 14).characters["char_real"];
    expect(m.condicoes).toEqual([{ id: "envenenado" }]);
    expect(m.descansosCurtos).toBe(2);
  });
});

/*
 * As correções de conteúdo que a migração carrega há versões. Elas existem
 * porque um id órfão não some com alarde: ele vira PA gasto que desapareceu da
 * ficha, ou um item de inventário sem nome nem preço.
 */
describe("as correções de id continuam valendo", () => {
  it("renomeia a técnica que trocou de id na Desintoxicação", () => {
    const ficha = {
      ...fichaSalvaV13(),
      purchasedAbilities: [
        { treeId: "desintoxicacao", rank: "Avançado", kind: "ability", id: "a-mao-que-nao-erra" },
      ],
    } as unknown as CharacterData;
    const m = migrarRoster(roster(ficha), 8).characters["char_real"];
    expect(m.purchasedAbilities[0].id).toBe("maos-limpas");
    // O resto da entrada não pode ser perdido junto com a renomeação.
    expect(m.purchasedAbilities[0].treeId).toBe("desintoxicacao");
    expect(m.purchasedAbilities[0].rank).toBe("Avançado");
  });

  it("tira o patamar Deus do Punho do Fogo, que deixou de existir", () => {
    const ficha = {
      ...fichaSalvaV13(),
      unlockedRanks: [
        { treeId: "punho-de-fogo", rank: "Rei" },
        { treeId: "punho-de-fogo", rank: "Deus" },
      ],
    } as unknown as CharacterData;
    const m = migrarRoster(roster(ficha), 10).characters["char_real"];
    expect(m.unlockedRanks).toEqual([{ treeId: "punho-de-fogo", rank: "Rei" }]);
  });
});

/*
 * O caso que dói: `version < 4` APAGA o roster inteiro. É deliberado e antigo —
 * aquele formato não tinha como ser convertido —, mas é a única linha do projeto
 * que descarta ficha de propósito, e ela merece estar escrita num teste em vez
 * de escondida numa condição.
 */
describe("o corte da version 4", () => {
  it("um roster anterior à version 4 é descartado, e isso é intencional", () => {
    expect(migrarRoster(roster(fichaSalvaV13()), 3)).toEqual({ characters: {}, order: [], activeId: null });
  });

  it("da version 4 em diante, nada é descartado", () => {
    for (const versao of [4, 8, 12, 13, 14]) {
      const r = migrarRoster(roster(fichaSalvaV13()), versao);
      expect(Object.keys(r.characters), `version ${versao}`).toEqual(["char_real"]);
    }
  });
});

/*
 * Uma ficha salva pode ter chegado de um `.mtficha` gerado por uma versão
 * ANTERIOR do site, com campos que ainda não existiam. A migração não pode
 * quebrar diante do que ela não reconhece.
 */
describe("robustez diante do inesperado", () => {
  it("ficha sem os arrays opcionais não quebra — eles nascem vazios", () => {
    const crua = { id: "x", name: "Cru", attributeBase: { forca: 0 } } as unknown as CharacterData;
    const m = migrarRoster(roster(crua), 5).characters["x"];
    expect(m.lore).toBe("");
    expect(m.purchasedAbilities).toEqual([]);
    expect(m.inventory).toEqual([]);
    expect(m.unlockedRanks).toEqual([]);
    expect(m.proficiencies).toEqual([]);
  });

  it("roster vazio atravessa sem exceção", () => {
    expect(migrarRoster({ characters: {}, order: [], activeId: null }, 13)).toEqual({
      characters: {},
      order: [],
      activeId: null,
    });
  });

  it("campo desconhecido de uma versão futura é preservado, não descartado", () => {
    const doFuturo = { ...fichaSalvaV13(), campoQueAindaNaoExiste: "guarde-me" } as unknown as CharacterData;
    const m = migrarRoster(roster(doFuturo), 13).characters["char_real"] as unknown as Record<string, unknown>;
    expect(m.campoQueAindaNaoExiste).toBe("guarde-me");
  });
});
