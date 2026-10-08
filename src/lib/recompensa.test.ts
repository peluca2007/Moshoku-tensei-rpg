import { describe, expect, it } from "vitest";
import { ARQUETIPOS_CRIATURA, SUBARQUETIPOS_CRIATURA, recompensaDaCriatura } from "@/data/bestiary";
import { SHOP_ITEMS } from "@/data/shopItems";
import { BESTIARIO, subArquetipoDoMonstro } from "@/data/preMadeMonsters";
import { gerarRecompensaDoEncontro } from "./lootGenerator";

/** Apêndice G, "A recompensa" (2026-10-07). */
describe("a recompensa do Apêndice G", () => {
  it("a base dobra a cada patamar, e o papel pesa como no Orçamento de Encontro", () => {
    const padrao = (patamar: number) => recompensaDaCriatura({ patamar, papel: "padrao", arquetipo: "bruto", subArquetipo: "besta" });
    expect([1, 2, 3, 4, 5, 6].map(padrao)).toEqual([10, 20, 40, 80, 160, 320]);
    expect(recompensaDaCriatura({ patamar: 3, papel: "lacaio", arquetipo: "bruto", subArquetipo: "besta" })).toBe(20);
    expect(recompensaDaCriatura({ patamar: 3, papel: "chefe", arquetipo: "bruto", subArquetipo: "besta" })).toBe(160);
  });

  it("a imunidade conta um patamar acima, e o arquétipo e o sub-arquétipo multiplicam", () => {
    expect(recompensaDaCriatura({ patamar: 2, papel: "padrao", arquetipo: "bruto", subArquetipo: "besta", temImunidade: true })).toBe(40);
    // Conjurador ×1,5 e Dragônico ×2 no 4º: 80 × 1,5 × 2.
    expect(recompensaDaCriatura({ patamar: 4, papel: "padrao", arquetipo: "conjurador", subArquetipo: "dragonico" })).toBe(240);
  });

  it("todo arquétipo e sub-arquétipo tem fator, e todo espólio listado existe na loja", () => {
    for (const a of ARQUETIPOS_CRIATURA) expect(a.perigoNaRecompensa).toBeGreaterThan(0);
    const ids = new Set(SHOP_ITEMS.map((i) => i.id));
    for (const s of SUBARQUETIPOS_CRIATURA) {
      expect(s.riqueza).toBeGreaterThan(0);
      expect(s.partesValiosas.nome).toBeTruthy();
      for (const id of s.espolios) expect(ids.has(id), `${s.nome}: ${id}`).toBe(true);
    }
  });

  it("o valor aparece inteiro, e a besta não carrega moeda nem equipamento", () => {
    const lobos = Array.from({ length: 4 }, () => ({ valor: 25, subArquetipo: "besta" }));
    const r = gerarRecompensaDoEncontro(lobos, 11);
    expect(r.valorTotal).toBe(100);
    expect(r.moedas).toBe(0);
    expect(r.itens).toHaveLength(0);
    expect(r.tralhas.reduce((s, i) => s + i.price, 0)).toBe(100);

    const bandidos = gerarRecompensaDoEncontro([{ valor: 100, subArquetipo: "humanoide" }], 11);
    expect(bandidos.moedas).toBe(60);
    expect(bandidos.moedas + [...bandidos.tralhas, ...bandidos.itens].reduce((s, i) => s + i.price, 0)).toBe(100);
  });

  it("todo monstro do catálogo tem um sub-arquétipo que existe", () => {
    const subs = new Set(SUBARQUETIPOS_CRIATURA.map((s) => s.id));
    for (const m of BESTIARIO) expect(subs.has(subArquetipoDoMonstro(m)), m.nome).toBe(true);
  });
});
