import { describe, expect, it } from "vitest";
import { PA_INICIAIS, PA_TIPICO_POR_PATAMAR, sessoesAtePatamar } from "./ritmoDePa";

describe("O ritmo de PA (Cap. 1, §2)", () => {
  it("o PA típico cresce a cada patamar e começa acima dos iniciais", () => {
    expect(PA_TIPICO_POR_PATAMAR[0]).toBeGreaterThan(PA_INICIAIS);
    for (let i = 1; i < PA_TIPICO_POR_PATAMAR.length; i++) {
      expect(PA_TIPICO_POR_PATAMAR[i]).toBeGreaterThan(PA_TIPICO_POR_PATAMAR[i - 1]);
    }
  });

  it("uma campanha chega ao 5º patamar por volta de duas dúzias de sessões", () => {
    // A decisão do autor (2026-09-27): o 5º patamar é o tamanho de uma
    // campanha, não de uma vida. Se o ritmo ou a régua mudarem e isto sair
    // da faixa, a mudança foi maior do que parece.
    expect(sessoesAtePatamar(3)).toBeGreaterThanOrEqual(8);
    expect(sessoesAtePatamar(3)).toBeLessThanOrEqual(12);
    expect(sessoesAtePatamar(5)).toBeGreaterThanOrEqual(20);
    expect(sessoesAtePatamar(5)).toBeLessThanOrEqual(28);
  });
});
