import { describe, expect, it } from "vitest";
import { CharacterData } from "./types";
import { montarFicha, novoEstado } from "./combatSim";
import { aplicarReservasIniciais } from "./combatScenario";
import { criaturaDoMolde, simularEncontro } from "./encounterSim";

/**
 * A luta que começa de onde a anterior parou (Tarefa 14d, 2026-10-08).
 *
 * O que estes testes travam: sem reservas, nada muda; com reservas, o grupo
 * chega ferido e sem recurso, o morto continua morto, e o estado final de uma
 * batalha serve de entrada da próxima sem perder nada no caminho.
 */
function personagem(patch: Partial<CharacterData> = {}): CharacterData {
  return {
    id: "heroi", name: "Ari", lore: "", raceId: null, backgroundId: null, subtableEntryId: null,
    attributeBase: { forca: 4, agilidade: 2, vigor: 3, intelecto: 1, espirito: 2 },
    raceAttributeChoices: [], racialUpgrades: [], saveAdvantages: [], startingTreeId: "deus-da-espada",
    unlockedRanks: [{ treeId: "deus-da-espada", rank: "Principiante" }, { treeId: "deus-da-espada", rank: "Intermediário" }],
    purchasedAbilities: [], purchasedCombinedSpells: [], gold: 0,
    inventory: [{ id: "espada", name: "Espada Longa", baseDie: "d8", type: "arma", equipped: true }],
    skills: [], treeSkillChoices: [], proficiencies: [], weaponGroupChoices: [], bonusHp: 0, bonusMp: 0,
    currentHp: null, currentMp: null, currentPt: null, currentPp: null, overrides: {}, ...patch,
  };
}

const goblins = () => [{ ...criaturaDoMolde(1, "padrao", "Goblin", "g"), quantidade: 2 }];

describe("reservas iniciais", () => {
  it("chega ferido e sem recurso, sem mudar os máximos", () => {
    const e = novoEstado(montarFicha(personagem()));
    const { pvMax, ptMax } = e.ficha;
    aplicarReservasIniciais(e, { pv: 7, pt: 0, exaustao: 2 });
    expect(e.pv).toBe(7);
    expect(e.pt).toBe(0);
    expect(e.exaustao).toBe(2);
    expect(e.ficha.pvMax).toBe(pvMax);
    expect(e.ficha.ptMax).toBe(ptMax);
    expect(e.vivo).toBe(true);
  });

  it("nunca passa do máximo nem fica negativo", () => {
    const e = novoEstado(montarFicha(personagem()));
    aplicarReservasIniciais(e, { pv: 9999, pt: -4 });
    expect(e.pv).toBe(e.ficha.pvMax);
    expect(e.pt).toBe(0);
  });

  it("a 0 PV entra caído e estabilizado, com as Marcas que trouxe", () => {
    const e = novoEstado(montarFicha(personagem()));
    aplicarReservasIniciais(e, { pv: 0, marcasDaMorte: 1 });
    expect(e.vivo).toBe(false);
    expect(e.inconsciente).toBe(true);
    expect(e.estabilizado).toBe(true);
    expect(e.marcasDaMorte).toBe(1);
  });

  it("três Marcas, ou morto, entra morto", () => {
    const a = novoEstado(montarFicha(personagem()));
    aplicarReservasIniciais(a, { pv: 0, marcasDaMorte: 3 });
    expect(a.morto).toBe(true);
    const b = novoEstado(montarFicha(personagem()));
    aplicarReservasIniciais(b, { morto: true, pv: 30 });
    expect(b.morto).toBe(true);
    expect(b.pv).toBe(0);
  });
});

describe("simularEncontro com o dia de aventura", () => {
  it("sem reservas, o resultado é o mesmo de antes", () => {
    const grupo = [personagem()];
    const antes = simularEncontro(grupo, goblins(), { batalhas: 40, semente: 7 });
    const depois = simularEncontro(grupo, goblins(), { batalhas: 40, semente: 7, reservasIniciais: {} });
    expect(depois).toEqual(antes);
  });

  it("chegar ferido piora a luta", () => {
    const grupo = [personagem()];
    const descansado = simularEncontro(grupo, goblins(), { batalhas: 200, semente: 3 });
    const ferido = simularEncontro(grupo, goblins(), { batalhas: 200, semente: 3, reservasIniciais: { heroi: { pv: 5, pt: 0 } } });
    expect(ferido.vitorias).toBeLessThan(descansado.vitorias);
  });

  it("devolve o estado final de cada um, e ele encadeia na luta seguinte", () => {
    const grupo = [personagem()];
    const primeira = simularEncontro(grupo, goblins(), { batalhas: 1, semente: 11, registrarEstados: true });
    const fim = primeira.estadosPorBatalha![0].personagens[0];
    expect(fim.id).toBe("heroi");
    expect(fim.pv).toBeGreaterThanOrEqual(0);
    const segunda = simularEncontro(grupo, goblins(), { batalhas: 1, semente: 12, registrarEstados: true, reservasIniciais: { heroi: fim } });
    const depois = segunda.estadosPorBatalha![0].personagens[0];
    // PT e PV só descem entre duas lutas sem descanso.
    expect(depois.pt).toBeLessThanOrEqual(fim.pt);
    if (!fim.morto) expect(depois.pv).toBeLessThanOrEqual(fim.pv);
  });

  it("o morto não volta e o grupo todo morto perde", () => {
    const r = simularEncontro([personagem()], goblins(), {
      batalhas: 3, semente: 5, registrarEstados: true, reservasIniciais: { heroi: { morto: true } },
    });
    expect(r.tpk).toBe(1);
    for (const b of r.estadosPorBatalha!) {
      expect(b.personagens[0].morto).toBe(true);
      expect(b.personagens[0].caiu).toBe(false);
    }
  });

  it("recusa reservas pra quem não está no grupo", () => {
    expect(() => simularEncontro([personagem()], goblins(), { reservasIniciais: { fantasma: { pv: 1 } } })).toThrow("não está no grupo");
  });
});
