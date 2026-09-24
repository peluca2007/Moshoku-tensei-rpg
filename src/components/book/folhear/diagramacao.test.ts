import { describe, expect, it } from "vitest";
import { CAPA, PAGINA, calcularGeometria, larguraDaColuna, numeralDoCapitulo, rotuloDoCapitulo } from "./diagramacao";

/*
 * O livro folheado tem página de tamanho FIXO: a diagramação é uma só, e quem
 * se adapta à tela é a escala (e o zoom). Estes testes guardam as duas
 * promessas que dependem disso: o livro sempre cabe no palco, e a página só
 * vira dupla quando a dupla ainda sai grande o bastante pra ler.
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
  it.each(TELAS)("$nome: o livro inteiro cabe no palco", ({ w, h }) => {
    const g = calcularGeometria(w, h);
    expect(g.larguraDoLivro * g.escala).toBeLessThanOrEqual(w);
    expect(g.alturaDoLivro * g.escala).toBeLessThanOrEqual(h);
  });

  it.each(TELAS)("$nome: a página não muda com a tela", ({ w, h }) => {
    const g = calcularGeometria(w, h);
    expect([g.pagina, g.altura, g.fonte]).toEqual([PAGINA.largura, PAGINA.altura, PAGINA.fonte]);
    expect(g.larguraDoLivro).toBe(g.porDupla * PAGINA.largura + CAPA * 2);
  });

  it("dupla no desktop, no notebook baixo e no tablet deitado; uma página em pé", () => {
    expect(calcularGeometria(1920, 984).porDupla).toBe(2);
    expect(calcularGeometria(1440, 804).porDupla).toBe(2);
    expect(calcularGeometria(1280, 584).porDupla).toBe(2);
    expect(calcularGeometria(1024, 672).porDupla).toBe(2);
    expect(calcularGeometria(820, 1084).porDupla).toBe(1);
    expect(calcularGeometria(390, 748).porDupla).toBe(1);
  });

  it("a dupla nunca encolhe o livro mais de 20% em relação a uma página só", () => {
    for (const { w, h } of TELAS) {
      const g = calcularGeometria(w, h);
      const umaSo = Math.min((w - 2 * (w >= 1100 ? 72 : w >= 768 ? 48 : 8)) / (PAGINA.largura + CAPA * 2), (h - 16) / (PAGINA.altura + CAPA * 2));
      if (g.porDupla === 2) expect(g.escala).toBeGreaterThanOrEqual(umaSo * 0.8 - 0.001);
    }
  });

  it("no tablet em pé a página sai perto do tamanho real (letra ~12px)", () => {
    expect(calcularGeometria(820, 1084).escala).toBeGreaterThan(0.85);
  });

  it("a coluna tem medida de livro impresso (45 a 60 caracteres)", () => {
    // Alegreya: ~0,5em por caractere em média.
    const caracteres = larguraDaColuna(calcularGeometria(1440, 804)) / (PAGINA.fonte * 0.5);
    expect(caracteres).toBeGreaterThanOrEqual(45);
    expect(caracteres).toBeLessThanOrEqual(60);
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
