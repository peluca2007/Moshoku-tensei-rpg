import { describe, expect, it } from "vitest";
import { CRIATURAS_PRONTAS } from "@/data/bestiary";
import { TREES } from "@/data/trees";
import { CharacterData, RANKS } from "@/lib/types";
import { criaturaDoMolde, CriaturaEncontro, simularEncontro } from "./encounterSim";

/** As seis do Apêndice G, montadas como a tela monta. */
function prontas(): CriaturaEncontro[] {
  return CRIATURAS_PRONTAS.map((p) => ({
    ...criaturaDoMolde(p.patamar, p.papel, p.nome, `sim_${p.id}`),
    perigo: p.perigo,
    acoes: p.acoes.map((a, i) => ({ ...a, id: `sim_${p.id}_${i}` })),
  }));
}

function heroi(qtdArvores: number, ateORank: number): CharacterData {
  const arvores = TREES.filter((t) => t.category === "corpo").slice(0, qtdArvores);
  const ranks = RANKS.slice(0, ateORank);
  return {
    id: "h",
    name: "Herói",
    lore: "",
    raceId: "humano",
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { forca: 4, agilidade: 3, vigor: 4, intelecto: 1, espirito: 1 },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: arvores[0]?.id ?? null,
    unlockedRanks: arvores.flatMap((t) => ranks.map((rank) => ({ treeId: t.id, rank }))),
    purchasedAbilities: [],
    purchasedCombinedSpells: [],
    gold: 0,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
    currentCalor: null,
    condicoes: [],
    overrides: {},
  };
}

const OPCOES = { batalhas: 300, semente: 20260910 };

describe("as seis criaturas do Apêndice G viram encontro simulável", () => {
  it("nenhuma delas quebra a simulação", () => {
    for (const c of prontas()) {
      expect(() => simularEncontro([heroi(1, 2)], [c], OPCOES), c.nome).not.toThrow();
    }
  });

  it("todas têm ação de dano — senão a simulação cai no orçamento fixo sem ninguém perceber", () => {
    for (const c of prontas()) {
      expect(c.acoes.some((a) => a.dano), c.nome).toBe(true);
    }
  });
});

/*
 * A semente fixa é o que faz o número servir pra alguma coisa.
 *
 * Sem ela, o mesmo personagem contra a mesma criatura devolveria um número
 * diferente a cada clique, e comparar duas builds — que é o motivo inteiro
 * desta tela existir — viraria comparar duas amostras de ruído.
 */
describe("o resultado é reproduzível", () => {
  it("duas execuções iguais dão o mesmo número", () => {
    const sapo = prontas()[0];
    const a = simularEncontro([heroi(1, 2)], [sapo], OPCOES);
    const b = simularEncontro([heroi(1, 2)], [sapo], OPCOES);
    expect(a.vitorias).toBe(b.vitorias);
    expect(a.rodadasMedia).toBe(b.rodadasMedia);
  });
});

describe("o resultado responde à pergunta que a tela faz", () => {
  const sapo = prontas()[0];

  it("mais inimigos iguais pioram a chance de vitória", () => {
    const contraUm = simularEncontro([heroi(1, 3)], [{ ...sapo, quantidade: 1 }], OPCOES);
    const contraSeis = simularEncontro([heroi(1, 3)], [{ ...sapo, quantidade: 6 }], OPCOES);
    expect(contraSeis.vitorias).toBeLessThan(contraUm.vitorias);
  });

  it("um personagem mais avançado se sai melhor contra a mesma criatura", () => {
    const fraco = simularEncontro([heroi(1, 1)], [{ ...sapo, quantidade: 3 }], OPCOES);
    const forte = simularEncontro([heroi(1, 5)], [{ ...sapo, quantidade: 3 }], OPCOES);
    expect(forte.vitorias).toBeGreaterThan(fraco.vitorias);
  });

  it("as frações somam o todo — vitória, TPK e empate cobrem as batalhas", () => {
    const r = simularEncontro([heroi(1, 3)], [sapo], OPCOES);
    expect(r.vitorias + r.tpk + r.empates).toBeCloseTo(1, 5);
    expect(r.pvRestante).toBeGreaterThanOrEqual(0);
    expect(r.pvRestante).toBeLessThanOrEqual(1);
  });
});
