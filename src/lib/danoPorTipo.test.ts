import { describe, expect, it } from "vitest";
import { aplicarDano, executarAtaquePersonagem, fracaoFria, makeRng, montarFicha, novoAlvo, novoEstado, partesDoDano } from "./combatSim";
import type { CharacterData } from "./types";

/**
 * Cap. 4, §6: "Resistência: você sofre metade do dano DAQUELE tipo". Dano
 * misto se separa por tipo; dano de dois tipos ao mesmo tempo só é defendido
 * por quem tem a defesa contra os dois.
 */
describe("dano de mais de um tipo", () => {
  it("separa parcela física e parcela fria", () => {
    expect(partesDoDano("1d8 + bc (cortante) + 1d4 de frio", 10, 3)).toEqual([
      { tipos: ["cortante"], valor: 7 }, { tipos: ["frio"], valor: 3 },
    ]);
    // Impacto de Gelo: os dados são frios e o BC é o contundente.
    expect(partesDoDano("1d8 de frio + bc (contundente); o frio dobra contra molhado", 9, 6)).toEqual([
      { tipos: ["contundente"], valor: 3 }, { tipos: ["frio"], valor: 6 },
    ]);
  });

  it("divide em partes iguais quando a carta manda, e junta os dois tipos quando o dano é dos dois", () => {
    expect(partesDoDano("16d12 dividido igualmente entre ígneo, sônico e contundente", 100, 0)).toEqual([
      { tipos: ["ígneo"], valor: 34 }, { tipos: ["sônico"], valor: 33 }, { tipos: ["contundente"], valor: 33 },
    ]);
    expect(partesDoDano("4d8 + bc (ígneo e contundente)", 20, 0)).toEqual([{ tipos: ["contundente", "ígneo"], valor: 20 }]);
    expect(partesDoDano("2d6 + bc (cortante)", 12, 0)).toBeUndefined();
  });

  it("Imunidade a frio anula só a parcela fria (o exemplo do livro)", () => {
    const elemental = novoAlvo({ nome: "Elemental de Gelo", pv: 50, ca: 10, imunidades: ["frio"] });
    aplicarDano(elemental, 10, 2, undefined, false, "1d8 + bc (cortante) + 1d4 de frio", undefined, partesDoDano("1d8 + bc (cortante) + 1d4 de frio", 10, 3));
    expect(elemental.pv).toBe(43);
  });

  it("dois tipos ao mesmo tempo: resistir a um só não basta; a Resistência aos dois corta pela metade", () => {
    const soFogo = novoAlvo({ nome: "Salamandra", pv: 50, ca: 10, resistencias: ["ígneo"] });
    aplicarDano(soFogo, 20, 2, undefined, false, "4d8 + bc (ígneo e contundente)", undefined, partesDoDano("4d8 + bc (ígneo e contundente)", 20, 0));
    expect(soFogo.pv).toBe(30);
    const osDois = novoAlvo({ nome: "Golem de Magma", pv: 50, ca: 10, resistencias: ["ígneo", "contundente"] });
    aplicarDano(osDois, 20, 2, undefined, false, "4d8 + bc (ígneo e contundente)", undefined, partesDoDano("4d8 + bc (ígneo e contundente)", 20, 0));
    expect(osDois.pv).toBe(40);
  });

  it("sem partes, o caminho de um tipo só continua igual", () => {
    const alvo = novoAlvo({ nome: "Lobo de Fogo", pv: 30, ca: 10, resistencias: ["ígneo"] });
    aplicarDano(alvo, 11, 2, undefined, false, "ígneo");
    expect(alvo.pv).toBe(25);
  });
});

describe("dano misto das criaturas (inclusive montadas de ficha)", () => {
  it("estima a parte fria pela média dos dados", () => {
    expect(fracaoFria("1d8 + bc (cortante) + 1d4 de frio")).toBeCloseTo(2.5 / 7, 5);
    expect(fracaoFria("2d6 cortante")).toBe(0);
  });
});

describe("a carta de verdade, com o tipo que o caso base apaga", () => {
  it("Quebra de Gelo contra Imune a frio: o perfurante entra, o frio some", () => {
    const mago: CharacterData = {
      id: "m", name: "Maga", lore: "", raceId: null, backgroundId: null, subtableEntryId: null,
      attributeBase: { forca: 1, agilidade: 1, vigor: 1, intelecto: 4, espirito: 2 }, raceAttributeChoices: [], racialUpgrades: [], saveAdvantages: [],
      startingTreeId: "agua", unlockedRanks: (["Principiante", "Intermediário", "Avançado"] as const).map((rank) => ({ treeId: "agua", rank })),
      purchasedAbilities: [{ treeId: "agua", rank: "Avançado", kind: "ability", id: "quebra-de-gelo" }],
      purchasedCombinedSpells: [], gold: 0, inventory: [], skills: [], treeSkillChoices: [], proficiencies: [], weaponGroupChoices: [],
      bonusHp: 0, bonusMp: 50, currentHp: null, currentMp: null, currentPt: null, currentPp: null, overrides: {},
    };
    const e = novoEstado(montarFicha(mago));
    const quebra = e.ficha.acoes.find((a) => a.nome === "Quebra de Gelo")!;
    expect(quebra.tipagem).toMatch(/perfurante/);
    const elemental = novoAlvo({ nome: "Elemental de Gelo", pv: 500, ca: 1, imunidades: ["frio"] });
    let notas: string[] = [];
    const rng = makeRng(3);
    for (let i = 0; i < 6 && !notas.length; i++) {
      executarAtaquePersonagem(e, quebra, elemental, rng, { log: () => {}, ataque: (ev) => { notas = ev.notas.filter((n) => n.startsWith("Dano por tipo")); } });
      e.pm = 50;
    }
    expect(notas[0]).toMatch(/frio com Imunidade/);
    expect(elemental.pv).toBeLessThan(500);
  });
});
