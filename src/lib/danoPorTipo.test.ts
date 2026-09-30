import { describe, expect, it } from "vitest";
import { aplicarDano, fracaoFria, novoAlvo, partesDoDano } from "./combatSim";

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
