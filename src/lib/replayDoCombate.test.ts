import { describe, expect, it } from "vitest";
import type { CharacterData } from "./types";
import { criaturaDoMolde, simularEncontro } from "./encounterSim";

function personagem(patch: Partial<CharacterData> = {}): CharacterData {
  return {
    id: "heroi", name: "Ari", lore: "", raceId: null, backgroundId: null, subtableEntryId: null,
    attributeBase: { forca: 4, agilidade: 7, vigor: 3, intelecto: 9, espirito: 2 },
    raceAttributeChoices: [], racialUpgrades: [], saveAdvantages: [], startingTreeId: "deus-da-espada",
    unlockedRanks: [{ treeId: "deus-da-espada", rank: "Principiante" }], purchasedAbilities: [],
    purchasedCombinedSpells: [], gold: 0,
    inventory: [{ id: "espada", name: "Espada Longa", baseDie: "d8", type: "arma", equipped: true }],
    skills: [], treeSkillChoices: [], proficiencies: [], weaponGroupChoices: [], bonusHp: 0, bonusMp: 0,
    currentHp: null, currentMp: null, currentPt: null, currentPp: null, overrides: {}, ...patch,
  };
}

describe("replay em 2.5D das batalhas notáveis", () => {
  const criatura = { ...criaturaDoMolde(1, "padrao", "Lobo", "lobo"), quantidade: 2 };
  const resultado = simularEncontro([personagem()], [criatura], { batalhas: 6, semente: 42, gerarLogs: true });
  const log = resultado.logsExtremos![0];
  const replay = log.replay!;

  it("grava um quadro por linha do log, com os atores dos dois lados", () => {
    expect(replay.quadros).toHaveLength(log.linhas.length);
    expect(replay.atores.map((a) => [a.nome, a.lado, a.origem])).toEqual([
      ["Ari", "grupo", "heroi"], ["Lobo 1", "criaturas", "lobo"], ["Lobo 2", "criaturas", "lobo"],
    ]);
  });

  it("o PV do quadro de um ataque já desconta a perda do recibo", () => {
    const i = replay.quadros.findIndex((q) => q.evento !== undefined && (log.eventos![q.evento].aplicacao?.perdaPv ?? 0) > 0);
    const quadro = replay.quadros[i];
    const evento = log.eventos![quadro.evento!];
    const alvo = replay.atores.findIndex((a) => a.nome === evento.alvo);
    expect(replay.quadros[i - 1].pv[alvo] - quadro.pv[alvo]).toBe(evento.aplicacao!.perdaPv);
  });

  it("o último quadro bate com o resultado da batalha", () => {
    const fim = replay.quadros.at(-1)!;
    const vivos = (lado: "grupo" | "criaturas") => replay.atores.filter((a, i) => a.lado === lado && fim.vivo[i]).length;
    if (log.resumo.resultado === "vitoria") expect(vivos("criaturas")).toBe(0);
    if (log.resumo.resultado === "tpk") expect(vivos("grupo")).toBe(0);
  });

  it("só grava posição quando o cenário tem distância", () => {
    expect(replay.quadros.every((q) => q.posicao === undefined)).toBe(true);
    const comLinha = simularEncontro([personagem()], [criatura], { batalhas: 2, semente: 42, gerarLogs: true, cenario: { distancia: 9 } });
    const primeiro = comLinha.logsExtremos![0].replay!.quadros[0];
    expect(primeiro.posicao).toEqual([0, 9, 9]);
  });
});
