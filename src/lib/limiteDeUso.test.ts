import { describe, expect, it } from "vitest";
import { limiteDeUso } from "./combatSim";

describe("o limite de uso escrito no começo da carta", () => {
  it("lê 'uma vez por turno' e 'uma vez por combate' no começo do efeito", () => {
    expect(limiteDeUso("Uma vez por turno. Truque da escola…")).toBe("turno");
    expect(limiteDeUso("Uma vez por combate: acerta automaticamente…")).toBe("combate");
    expect(limiteDeUso("Uma vez por combate. Acerta automaticamente…")).toBe("combate");
  });

  it("não lê o limite de um efeito secundário no meio da carta", () => {
    expect(limiteDeUso("Muralha de gelo. Uma vez por combate, você pode erguê-la como Reação.")).toBeUndefined();
    expect(limiteDeUso("Ataque normal.")).toBeUndefined();
  });
});
