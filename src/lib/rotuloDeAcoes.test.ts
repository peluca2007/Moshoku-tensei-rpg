import { describe, expect, it } from "vitest";
import { rotuloDeAcoes } from "./rotuloDeAcoes";

/**
 * O plural de "Ação" — 0.1.43.
 *
 * A conta estava copiada em cinco arquivos e as cinco cópias grudavam o sufixo
 * na palavra inteira em vez de substituí-la: `Ação` + `ões` = **"Açãoões"**. O
 * erro saía na ficha, na busca global, no detalhe de habilidade, na lista de
 * árvores — e no `buildFichaPayload`, que vira PDF. Dava pra levar "2 Açãoões"
 * impresso pra mesa.
 */
describe("o rótulo de custo em Ações", () => {
  it("faz o plural irregular certo — o erro que existiu em cinco arquivos", () => {
    expect(rotuloDeAcoes(2)).toBe("2 Ações");
    expect(rotuloDeAcoes(6)).toBe("6 Ações");
    expect(rotuloDeAcoes(2)).not.toContain("Açãoões");
  });

  it("o singular fica no singular", () => {
    expect(rotuloDeAcoes(1)).toBe("1 Ação");
  });

  it("zero Ações é Passivo, e não “0 Ações”", () => {
    expect(rotuloDeAcoes(0)).toBe("Passivo");
  });
});
