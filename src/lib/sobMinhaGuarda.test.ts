import { describe, expect, it } from "vitest";
import { aoIniciarRodada, makeRng, montarFicha, novoEstado, type EstadoPersonagem } from "./combatSim";
import { sobMinhaGuarda } from "./combatReactions";
import { getTreeById } from "@/data/trees";
import { RANKS, type CharacterData } from "./types";

/**
 * Sob Minha Guarda (Cavalaria e Escudos, Cap. 3) — 2026-10-05.
 *
 * Até aqui o motor não conhecia a Maestria que define a árvore, e o
 * `balancear` chamava de "contribui pouco" quem gasta o próprio recurso no
 * dano dos outros. Estes casos travam a carta como o livro escreve.
 */
function personagem(id: string, treeId: string, patamar: number, compras: string[] = []): CharacterData {
  const tree = getTreeById(treeId)!;
  const ranks = RANKS.slice(0, patamar);
  return {
    id, name: id, lore: "", raceId: null, backgroundId: null, subtableEntryId: null,
    attributeBase: { forca: 2, agilidade: 1, vigor: 4, intelecto: 2, espirito: 2 },
    raceAttributeChoices: [], racialUpgrades: [], saveAdvantages: [],
    startingTreeId: treeId,
    unlockedRanks: ranks.map((rank) => ({ treeId, rank })),
    purchasedAbilities: tree.ranks
      .filter((r) => ranks.includes(r.rank))
      .flatMap((r) => [...r.abilities, ...r.talents].filter((a) => compras.includes(a.id))
        .map((a) => ({ kind: r.abilities.includes(a as never) ? "ability" as const : "talent" as const, treeId, rank: r.rank, id: a.id }))),
    purchasedCombinedSpells: [], gold: 0, inventory: [], skills: [], treeSkillChoices: [], proficiencies: [],
    bonusHp: 0, bonusMp: 0, currentHp: null, currentMp: null, currentPt: null, currentPp: null,
    condicoes: [], descansosCurtos: 0, overrides: {},
  } as unknown as CharacterData;
}

function mesa(patamar: number, compras: string[] = []): { mara: EstadoPersonagem; mago: EstadoPersonagem; grupo: EstadoPersonagem[] } {
  const mara = novoEstado(montarFicha(personagem("mara", "cavalaria-e-escudos", patamar, compras)));
  const mago = novoEstado(montarFicha(personagem("mago", "fogo", 1)));
  const grupo = [mago, mara];
  for (const e of grupo) aoIniciarRodada(e, true);
  return { mara, mago, grupo };
}

describe("Sob Minha Guarda", () => {
  it("o golpe que derrubaria o protegido vai inteiro pro Escudeiro, por 1 Reação", () => {
    const { mara, mago, grupo } = mesa(1);
    const golpe = mago.pv;
    const r = sobMinhaGuarda(mago, golpe, grupo, makeRng(1));
    expect(r.interceptado).toBe(true);
    expect(r.alvo).toBe(mara);
    expect(r.dano).toBe(golpe);
    expect(mara.reacaoDisponivel).toBe(false);
    // Sem Reação, o segundo golpe passa — e o Escudeiro recupera o PT.
    const segundo = sobMinhaGuarda(mago, golpe, grupo, makeRng(1));
    expect(segundo.interceptado).toBe(false);
    expect(segundo.recupera).toBe(mara);
  });

  it("não intercepta o golpe que derrubaria o próprio Escudeiro", () => {
    const { mara, mago, grupo } = mesa(1);
    const r = sobMinhaGuarda(mago, mara.pv + 1, grupo, makeRng(1));
    expect(r.interceptado).toBe(false);
  });

  it("Aguentar o Baque gasta 1 PT e reduz o dano interceptado", () => {
    const { mara, mago, grupo } = mesa(2, ["aguentar"]);
    const pt = mara.pt;
    const r = sobMinhaGuarda(mago, mago.pv, grupo, makeRng(1));
    expect(r.interceptado).toBe(true);
    expect(mara.pt).toBe(pt - 1);
    // 1d10 + Vigor (4) + Bônus de Rank (2): reduz pelo menos 7.
    expect(r.dano).toBeLessThanOrEqual(mago.pv - 7);
  });

  it("Escudo Estendido: do Avançado em diante, uma interceptação por rodada sai sem Reação", () => {
    const { mara, mago, grupo } = mesa(3);
    expect(sobMinhaGuarda(mago, mago.pv, grupo, makeRng(1)).interceptado).toBe(true);
    expect(mara.reacaoDisponivel).toBe(true);
    expect(sobMinhaGuarda(mago, mago.pv, grupo, makeRng(1)).interceptado).toBe(true);
    expect(mara.reacaoDisponivel).toBe(false);
  });

  it("Aegis: do Santo em diante, o protegido sofre METADE do Bônus de Rank a menos (0.1.134)", () => {
    const { mago, grupo } = mesa(4);
    // Bônus de Rank 4 no Santo: −2, não −4.
    expect(sobMinhaGuarda(mago, 2, grupo, makeRng(1)).dano).toBe(0);
    expect(sobMinhaGuarda(mesa(4).mago, 3, mesa(4).grupo, makeRng(1)).dano).toBeGreaterThan(0);
  });

  it("Aguentar o Baque vale uma vez por rodada (0.1.134)", () => {
    const { mara, mago, grupo } = mesa(3, ["aguentar"]);
    const pt = mara.pt;
    sobMinhaGuarda(mago, mago.pv, grupo, makeRng(1));
    sobMinhaGuarda(mago, mago.pv, grupo, makeRng(1));
    expect(mara.pt).toBe(pt - 1);
  });

  it("Ninguém Passa: sem Reação uma vez por aliado protegido por rodada, não quantas quiser (0.1.134)", () => {
    const { mara, mago, grupo } = mesa(5);
    const golpe = () => sobMinhaGuarda(mago, mago.pv, grupo, makeRng(1)).interceptado;
    // Ninguém Passa, Escudo Estendido e a Reação: três; o quarto passa.
    expect([golpe(), golpe(), golpe(), golpe()]).toEqual([true, true, true, false]);
    expect(mara.reacaoDisponivel).toBe(false);
  });

  it("o limite de protegidos é 1, 2 e 3, e não ilimitado do Santo em diante", () => {
    const limite = (patamar: number) => montarFicha(personagem("m", "cavalaria-e-escudos", patamar)).protegidosMax;
    expect([1, 2, 3, 4, 5, 6].map(limite)).toEqual([1, 2, 3, 3, 3, 3]);
  });
});
