import { expect, it } from "vitest";
import { PALETAS_DA_FICHA_PDF, temaDaFichaPdf } from "./temaDaFichaPdf";
import { TEMAS, TEMA_PADRAO } from "./temas";

const luminancia = (hex: string) => {
  const canais = hex.match(/../g)!.map(c => parseInt(c, 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return canais[0] * 0.2126 + canais[1] * 0.7152 + canais[2] * 0.0722;
};
const contraste = (a: string, b: string) => {
  const valores = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (valores[0] + 0.05) / (valores[1] + 0.05);
};

it("aceita só os temas conhecidos, migra os antigos e recebe payloads antigos", () => {
  for (const t of TEMAS) expect(temaDaFichaPdf(t.id)).toBe(t.id);
  expect(temaDaFichaPdf("dark")).toBe("pergaminho-noite");
  expect(temaDaFichaPdf("light")).toBe("pergaminho");
  for (const tema of [undefined, null, 5, {}, 'x")\n#read("segredo")'])
    expect(temaDaFichaPdf(tema)).toBe(TEMA_PADRAO);
});

it.each(TEMAS)("$nome: texto e valores são legíveis em papel, caixas e faixas", ({ id }) => {
  const c = PALETAS_DA_FICHA_PDF[id];
  for (const fundo of [c.papel, c.caixa]) {
    for (const tinta of [c.texto, c.principal, c.secundaria])
      expect(contraste(tinta, fundo), `${id}: ${tinta}/${fundo}`).toBeGreaterThanOrEqual(4.5);
  }
  expect(contraste(c.titulo, c.faixa)).toBeGreaterThanOrEqual(4.5);
});
