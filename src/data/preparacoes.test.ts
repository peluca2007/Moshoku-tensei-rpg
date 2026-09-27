import { describe, expect, it } from "vitest";
import { PREPARACOES } from "./preparacoes";
import { TREES } from "./trees";
import { RANKS } from "@/lib/types";

describe("o menu de Preparações (Cap. 3)", () => {
  it("as três árvores de Utilidade têm de 6 a 8 Preparações, e só elas", () => {
    const utilidade = TREES.filter((t) => t.category === "utilidade").map((t) => t.id).sort();
    expect(Object.keys(PREPARACOES).sort()).toEqual(utilidade);
    for (const lista of Object.values(PREPARACOES)) {
      expect(lista.length).toBeGreaterThanOrEqual(6);
      expect(lista.length).toBeLessThanOrEqual(8);
    }
  });

  it("toda Preparação custa 1 ou 2 PP, entra num patamar que existe e tem id único", () => {
    const ids = new Set<string>();
    for (const lista of Object.values(PREPARACOES)) {
      for (const p of lista) {
        expect([1, 2]).toContain(p.pp);
        expect(RANKS).toContain(p.desde);
        expect(ids.has(p.id), p.id).toBe(false);
        ids.add(p.id);
      }
      // O Principiante sempre tem o que fazer com PP.
      expect(lista.filter((p) => p.desde === "Principiante").length).toBeGreaterThanOrEqual(2);
    }
  });
});
