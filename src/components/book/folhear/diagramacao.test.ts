import { describe, expect, it } from "vitest";
import { ESCALAS, calcularGeometria, numeralDoCapitulo, rotuloDoCapitulo } from "./diagramacao";

/*
 * O princípio 1 do plano do livro digital, em teste: se faltar espaço, o livro
 * mostra MENOS PÁGINAS — nunca letra menor. A geometria é a única peça do
 * livro folheado que dá pra verificar sem navegador, e é justamente a que
 * decide se ele é legível.
 */

const TELAS = [
  { nome: "monitor 1920×1080", w: 1920, h: 984 },
  { nome: "notebook 1440×900", w: 1440, h: 804 },
  { nome: "notebook baixo 1280×680", w: 1280, h: 584 },
  { nome: "tablet deitado 1024×768", w: 1024, h: 672 },
  { nome: "tablet em pé 820×1180", w: 820, h: 1084 },
  { nome: "celular 390×844", w: 390, h: 748 },
];

describe("calcularGeometria", () => {
  it.each(TELAS)("$nome: corpo nunca abaixo de 16px na escala padrão", ({ w, h }) => {
    expect(calcularGeometria(w, h, 1).fonte).toBeGreaterThanOrEqual(16);
  });

  it.each(TELAS)("$nome: o livro cabe no palco", ({ w, h }) => {
    const g = calcularGeometria(w, h, 1);
    expect(g.pagina * g.porDupla).toBeLessThanOrEqual(w);
    expect(g.altura).toBeLessThanOrEqual(h);
  });

  it.each(TELAS)("$nome: a linha tem medida de livro (38 a 70 caracteres)", ({ w, h }) => {
    const g = calcularGeometria(w, h, 1);
    // Literata: ~0,5em por caractere em média.
    const caracteres = (g.pagina - g.margem * 2) / (g.fonte * 0.5);
    expect(caracteres).toBeGreaterThanOrEqual(38);
    expect(caracteres).toBeLessThanOrEqual(70);
  });

  it("duas páginas no desktop, uma no tablet em pé e no celular", () => {
    expect(calcularGeometria(1440, 804, 1).porDupla).toBe(2);
    expect(calcularGeometria(1280, 584, 1).porDupla).toBe(2);
    expect(calcularGeometria(820, 1084, 1).porDupla).toBe(1);
    expect(calcularGeometria(390, 748, 1).porDupla).toBe(1);
  });

  it("tudo em pixel inteiro: as colunas repetem o passo centenas de vezes", () => {
    for (const { w, h } of TELAS) {
      const g = calcularGeometria(w, h, 1);
      for (const v of [g.pagina, g.altura, g.margem, g.topo, g.pe]) expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("o A+ aumenta a letra, e quem aumentou a raiz do navegador ganha livro maior", () => {
    const base = calcularGeometria(1440, 804, 1);
    expect(calcularGeometria(1440, 804, ESCALAS[ESCALAS.length - 1]).fonte).toBeGreaterThan(base.fonte);
    expect(calcularGeometria(1440, 804, 1, 20).fonte).toBeGreaterThan(base.fonte);
  });
});

describe("rótulos do capítulo", () => {
  it("numera em romano e separa o título", () => {
    expect(numeralDoCapitulo("Cap. 4 — Combate e Sobrevivência")).toBe("IV");
    expect(rotuloDoCapitulo("Cap. 4 — Combate e Sobrevivência", true)).toBe("Capítulo 4 · Combate e Sobrevivência");
    expect(rotuloDoCapitulo("Cap. 4 — Combate e Sobrevivência", false)).toBe("Combate e Sobrevivência");
  });

  it("capítulo sem número fica com o losango e o nome inteiro", () => {
    expect(numeralDoCapitulo("Comece Aqui")).toBe("◆");
    expect(rotuloDoCapitulo("Apêndices", true)).toBe("Apêndices");
  });
});
