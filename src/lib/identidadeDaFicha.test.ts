import { describe, expect, it } from "vitest";
import { PurchasedAbility, UnlockedRank } from "@/lib/types";
import { FichaParaIdentidade } from "./identidadeDaFicha";
import { identidadeDaFicha } from "./identidadeDaFicha";

function ficha({
  inicial = null,
  ranks = [],
  compras = [],
}: {
  inicial?: string | null;
  ranks?: UnlockedRank[];
  compras?: PurchasedAbility[];
} = {}): FichaParaIdentidade {
  return {
    startingTreeId: inicial,
    unlockedRanks: ranks,
    purchasedAbilities: compras,
  };
}

const talento = (treeId: string, id: string): PurchasedAbility => ({
  treeId,
  rank: "Principiante",
  kind: "talent",
  id,
});

describe("identidadeDaFicha", () => {
  it("mantém neutra a ficha sem PA em árvore", () => {
    expect(identidadeDaFicha(ficha())).toEqual([]);
  });

  it("dá peso inteiro quando só uma árvore recebeu PA", () => {
    const resultado = identidadeDaFicha(ficha({
      inicial: "deus-da-espada",
      compras: [talento("deus-da-espada", "braco-de-ferro")],
    }));
    expect(resultado).toEqual([
      { treeId: "deus-da-espada", pa: 1, peso: 1, inicial: true },
    ]);
  });

  it("preserva a proporção 80/20 do PA das árvores", () => {
    const resultado = identidadeDaFicha(ficha({
      inicial: "deus-da-espada",
      compras: [
        talento("deus-da-espada", "braco-de-ferro"),
        talento("deus-da-espada", "fio-perfeito"),
        talento("deus-da-espada", "pavio-curto-espada"),
        talento("deus-da-espada", "postura-do-espadachim"),
        talento("agua", "condutor-de-gelo"),
      ],
    }));
    expect(resultado.map(({ treeId, peso }) => [treeId, peso])).toEqual([
      ["deus-da-espada", 0.8],
      ["agua", 0.2],
    ]);
  });

  it("desempata em favor da Árvore Inicial", () => {
    const resultado = identidadeDaFicha(ficha({
      inicial: "agua",
      compras: [
        talento("deus-da-espada", "braco-de-ferro"),
        talento("agua", "condutor-de-gelo"),
      ],
    }));
    expect(resultado.map(({ treeId }) => treeId)).toEqual(["agua", "deus-da-espada"]);
  });

  it("inclui abertura por ordem e custos de rank sem duplicar a tabela", () => {
    const resultado = identidadeDaFicha(ficha({
      inicial: "fogo",
      ranks: [
        { treeId: "fogo", rank: "Principiante" },
        { treeId: "fogo", rank: "Intermediário" },
        { treeId: "agua", rank: "Principiante" },
      ],
    }));
    expect(resultado.map(({ treeId, pa }) => [treeId, pa])).toEqual([
      ["fogo", 1],
      ["agua", 1],
    ]);
    expect(resultado[0].inicial).toBe(true);
  });
});
