import { describe, expect, it } from "vitest";
import { canPurchaseAbility } from "./selectors";
import { TREES } from "@/data/trees";
import type { CharacterData, RankName } from "@/lib/types";

/**
 * PRÉ-REQUISITO EM OUTRA ÁRVORE — 0.1.91.
 *
 * ## O que é
 *
 * Quatro habilidades do livro são PONTES entre escolas, e dizem isso na prosa:
 * Vapor Seco (Fogo, pede Vento), Nova Congelante (Vento, pede Água), Explosão
 * Silenciosa (Vento, pede Fogo) e Dedos de Mana (Ladino, pede qualquer escola
 * de magia). O que elas vendem é a mistura.
 *
 * ## Por que tem teste
 *
 * Porque a ficha deixava comprar as quatro sem o outro lado — `requires` só
 * sabia olhar a própria árvore —, e o livro estava certo o tempo todo. Um erro
 * que vive na distância entre a prosa e o código não aparece em lugar nenhum:
 * o jogador monta a ficha, o site deixa, e só na mesa alguém lê a carta em voz
 * alta e descobre.
 */

function comPatamares(pares: [treeId: string, rank: RankName][]): CharacterData {
  return {
    id: "teste",
    unlockedRanks: pares.map(([treeId, rank]) => ({ treeId, rank })),
    purchasedAbilities: [],
  } as unknown as CharacterData;
}

/** Onde cada uma mora, pra não repetir a busca em todo teste. */
function ondeMora(id: string): { treeId: string; rank: RankName; kind: "ability" | "talent" } {
  for (const t of TREES) {
    for (const r of t.ranks) {
      if (r.abilities.some((a) => a.id === id)) return { treeId: t.id, rank: r.rank, kind: "ability" };
      if (r.talents.some((a) => a.id === id)) return { treeId: t.id, rank: r.rank, kind: "talent" };
    }
  }
  throw new Error(`não achei ${id}`);
}

const PONTES: [id: string, precisaDe: string][] = [
  ["vapor-seco", "vento"],
  ["nova-congelante", "agua"],
  ["explosao-silenciosa", "fogo"],
];

describe("As pontes entre escolas cobram o outro lado", () => {
  it.each(PONTES)("%s não se compra sem patamar em %s", (id, precisaDe) => {
    const { treeId, rank, kind } = ondeMora(id);
    const semAOutra = comPatamares(TREES.find((t) => t.id === treeId)!.ranks.map((r) => [treeId, r.rank]));
    const check = canPurchaseAbility(semAOutra, treeId, rank, kind, id);
    expect(check.ok, `${id} deveria exigir ${precisaDe}`).toBe(false);
    expect(check.reason).toMatch(/exige o patamar/i);
  });

  it.each(PONTES)("%s se compra com um patamar em %s", (id, precisaDe) => {
    const { treeId, rank, kind } = ondeMora(id);
    const comAOutra = comPatamares([
      ...TREES.find((t) => t.id === treeId)!.ranks.map((r) => [treeId, r.rank] as [string, RankName]),
      [precisaDe, "Principiante"],
    ]);
    expect(canPurchaseAbility(comAOutra, treeId, rank, kind, id).ok, id).toBe(true);
  });
});

describe("Dedos de Mana aceita QUALQUER escola de magia", () => {
  const { treeId, rank, kind } = ondeMora("dedos-de-mana");
  const doLadino = TREES.find((t) => t.id === treeId)!.ranks.map(
    (r) => [treeId, r.rank] as [string, RankName]
  );

  it("um ladino sem magia nenhuma não compra", () => {
    const check = canPurchaseAbility(comPatamares(doLadino), treeId, rank, kind, "dedos-de-mana");
    expect(check.ok).toBe(false);
    expect(check.reason, "a mensagem fala da categoria, e não de uma árvore").toMatch(
      /alguma escola de magia/i
    );
  });

  it("e compra com qualquer uma das oito", () => {
    for (const escola of TREES.filter((t) => t.category === "magia")) {
      const c = comPatamares([...doLadino, [escola.id, "Principiante"]]);
      expect(canPurchaseAbility(c, treeId, rank, kind, "dedos-de-mana").ok, escola.name).toBe(true);
    }
  });

  it("mas não com uma árvore do Corpo", () => {
    const c = comPatamares([...doLadino, ["deus-da-espada", "Imperador"]]);
    expect(canPurchaseAbility(c, treeId, rank, kind, "dedos-de-mana").ok).toBe(false);
  });
});

describe("A regra não atrapalha o resto", () => {
  it("habilidade sem `requiresRank` continua comprável com o rank aberto", () => {
    const fogo = TREES.find((t) => t.id === "fogo")!;
    const bola = fogo.ranks.find((r) => r.rank === "Principiante")!.abilities[0];
    const c = comPatamares([["fogo", "Principiante"]]);
    expect(canPurchaseAbility(c, "fogo", "Principiante", "ability", bola.id).ok).toBe(true);
  });

  /*
   * Um patamar ACIMA do exigido também serve. A exigência é um piso ("1 patamar
   * em Água"), e ler como igualdade exata faria o Imperador de Água perder o
   * direito que o Principiante tem.
   */
  it("um patamar acima do exigido vale como o exigido", () => {
    const { treeId, rank, kind } = ondeMora("nova-congelante");
    const c = comPatamares([
      ...TREES.find((t) => t.id === treeId)!.ranks.map((r) => [treeId, r.rank] as [string, RankName]),
      ["agua", "Imperador"],
    ]);
    expect(canPurchaseAbility(c, treeId, rank, kind, "nova-congelante").ok).toBe(true);
  });
});
