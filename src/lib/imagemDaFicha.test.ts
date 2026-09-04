import { describe, it, expect } from "vitest";
import {
  bytesNoArmazenamento,
  dimensoesReduzidas,
  LIMITES_DE_IMAGEM,
  DEGRAUS_DE_QUALIDADE,
} from "./imagemDaFicha";

describe("dimensoesReduzidas", () => {
  it("cabe no lado maior mantendo a proporção", () => {
    expect(dimensoesReduzidas(4000, 3000, 512)).toEqual({ largura: 512, altura: 384 });
    expect(dimensoesReduzidas(3000, 4000, 512)).toEqual({ largura: 384, altura: 512 });
  });

  it("NUNCA aumenta: ampliar não cria detalhe, só bytes", () => {
    expect(dimensoesReduzidas(200, 150, 512)).toEqual({ largura: 200, altura: 150 });
    expect(dimensoesReduzidas(512, 512, 512)).toEqual({ largura: 512, altura: 512 });
  });

  it("não deixa nenhum lado virar zero numa imagem muito estreita", () => {
    const r = dimensoesReduzidas(4000, 3, 512);
    expect(r.largura).toBe(512);
    expect(r.altura).toBeGreaterThanOrEqual(1);
  });
});

describe("bytesNoArmazenamento", () => {
  it("conta UTF-16, porque é assim que o localStorage guarda", () => {
    // Medir por caractere subestimaria o consumo pela metade — que é
    // exatamente o erro que faz a cota estourar antes da conta acusar.
    expect(bytesNoArmazenamento("abcd")).toBe(8);
    expect(bytesNoArmazenamento("")).toBe(0);
  });
});

describe("os tetos", () => {
  it("a capa é maior que a foto nos dois eixos, porque atravessa o cabeçalho", () => {
    expect(LIMITES_DE_IMAGEM.cover.ladoMaior).toBeGreaterThan(LIMITES_DE_IMAGEM.portrait.ladoMaior);
    expect(LIMITES_DE_IMAGEM.cover.maxBytes).toBeGreaterThan(LIMITES_DE_IMAGEM.portrait.maxBytes);
  });

  it("cinco fichas com foto e capa cabem no orçamento do localStorage", () => {
    const porFicha = LIMITES_DE_IMAGEM.portrait.maxBytes + LIMITES_DE_IMAGEM.cover.maxBytes;
    // 4 MB de orçamento, e a mesa de referência do projeto tem cinco jogadores.
    expect(porFicha * 5).toBeLessThan(4 * 1024 * 1024);
  });

  it("a escada de qualidade só desce", () => {
    for (let i = 1; i < DEGRAUS_DE_QUALIDADE.length; i++) {
      expect(DEGRAUS_DE_QUALIDADE[i]).toBeLessThan(DEGRAUS_DE_QUALIDADE[i - 1]);
    }
  });
});
