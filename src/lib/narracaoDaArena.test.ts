import { describe, expect, it } from "vitest";
import type { EventoAtaque } from "./combatTrace";
import type { CharacterData } from "./types";
import { criaturaDoMolde, simularEncontro } from "./encounterSim";
import { narrarArea, narrarGolpe, narrarLinha } from "./narracaoDaArena";

function recibo(patch: Partial<EventoAtaque> = {}): EventoAtaque {
  return { atacante: "Eris", acao: "golpe comum", alvo: "Lobo", acertou: true, critico: false, parcelas: [], bonusDano: 0, bruto: 0, aposModificadores: 0, notas: [], ...patch };
}

describe("narração da arena", () => {
  it("troca a conta do motor por frase de mesa e guarda a conta", () => {
    expect(narrarLinha("[Eris] paga 1 PT por Devolver: 1 + 4, escala 1; metade = 2.")).toEqual({
      frase: "Eris gasta 1 PT e devolve o golpe: +2 no Fluxo.",
      conta: "[Eris] paga 1 PT por Devolver: 1 + 4, escala 1; metade = 2.",
    });
    expect(narrarLinha("[Eris] usa Aparar: CA 12 + Rank 2 = 14.").frase).toBe("Eris apara o golpe: a CA sobe para 14.");
    expect(narrarLinha("[Ari] gasta 1 Ação para se aproximar (7.5 m do alvo).").frase).toBe("Ari avança e fica a 7,5 m do alvo.");
    expect(narrarLinha("\n--- Rodada 2 ---").frase).toBe("Começa a rodada 2.");
    expect(narrarLinha("[Lobo] gasta 1 Ação para se aproximar.")).toEqual({ frase: "Lobo avança." });
  });

  it("frase desconhecida só perde os colchetes, nunca some", () => {
    expect(narrarLinha("[Ari] faz algo que o motor inventou amanhã.")).toEqual({ frase: "Ari faz algo que o motor inventou amanhã." });
  });

  it("ataque, crítico, erro e resistência viram frase", () => {
    const d20 = { dados: [15], natural: 15, ajuste: "normal" as const, bonus: 5, total: 20, defesa: 12 };
    const aplicacao = { aposResistencia: 11, absorvidoTemporario: 0, perdaPv: 11, danoEfetivo: 11 };
    expect(narrarGolpe(recibo({ teste: { ...d20, tipo: "ataque" }, aplicacao }))).toEqual({
      frase: "Eris acerta Lobo com golpe comum: −11 PV.", conta: "Ataque: 20 contra CA 12.",
    });
    expect(narrarGolpe(recibo({ critico: true, aplicacao })).frase).toContain("crítico");
    expect(narrarGolpe(recibo({ acertou: false })).frase).toBe("Eris erra Lobo com golpe comum.");
    expect(narrarGolpe(recibo({ acao: "Bola de Fogo", acertou: false, teste: { ...d20, tipo: "resistencia" } })).frase).toBe("Lobo resiste a Bola de Fogo de Eris.");
    expect(narrarArea([recibo({ aplicacao }), recibo({ alvo: "Lobo 2", acertou: false })]).frase).toBe("Eris usa golpe comum em 2 alvos: Lobo −11, Lobo 2 escapa.");
  });

  it("numa batalha de verdade, nenhuma linha fica com o nome entre colchetes", () => {
    const heroi: CharacterData = {
      id: "h", name: "Ari", lore: "", raceId: null, backgroundId: null, subtableEntryId: null,
      attributeBase: { forca: 4, agilidade: 7, vigor: 3, intelecto: 9, espirito: 2 },
      raceAttributeChoices: [], racialUpgrades: [], saveAdvantages: [], startingTreeId: "deus-da-agua-corpo",
      unlockedRanks: [{ treeId: "deus-da-agua-corpo", rank: "Principiante" }, { treeId: "deus-da-agua-corpo", rank: "Intermediário" }],
      purchasedAbilities: ["aparar", "devolver", "guarda-do-corpo"].map((id) => ({ treeId: "deus-da-agua-corpo", rank: id === "devolver" ? "Intermediário" as const : "Principiante" as const, kind: "ability" as const, id })),
      purchasedCombinedSpells: [], gold: 0,
      inventory: [{ id: "espada", name: "Espada Longa", baseDie: "d8", type: "arma", equipped: true }],
      skills: [], treeSkillChoices: [], proficiencies: [], weaponGroupChoices: [], bonusHp: 20, bonusMp: 0,
      currentHp: null, currentMp: null, currentPt: null, currentPp: null, overrides: {},
    };
    const lobos = { ...criaturaDoMolde(1, "padrao", "Lobo", "lobo"), quantidade: 3 };
    const { logsExtremos } = simularEncontro([heroi], [lobos], { batalhas: 4, semente: 7, gerarLogs: true, cenario: { distancia: 9 } });
    const linhas = (logsExtremos ?? []).flatMap((l) => l.linhas).filter((l) => /^\[/.test(l.trim()) && !l.includes("→"));
    expect(linhas.length).toBeGreaterThan(0);
    for (const l of linhas) expect(narrarLinha(l).frase.startsWith("["), l).toBe(false);
  });
});
