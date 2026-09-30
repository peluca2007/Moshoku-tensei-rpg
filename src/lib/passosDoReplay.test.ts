import { describe, expect, it } from "vitest";
import type { EventoAtaque } from "./combatTrace";
import type { QuadroDoReplay } from "./encounterSim";
import { readFileSync } from "node:fs";
import path from "node:path";
import { FRASES_DE_REACAO, formaDoGolpe, montarPassos, partesDoNome, reacoesDoPasso } from "./passosDoReplay";

function recibo(atacante: string, acao: string, alvo: string): EventoAtaque {
  return { atacante, acao, alvo, acertou: true, critico: false, parcelas: [], bonusDano: 0, bruto: 0, aposModificadores: 0, notas: [] };
}

function quadro(evento?: number): QuadroDoReplay {
  return { rodada: 1, linha: 0, evento, pv: [], vivo: [] };
}

describe("passos do replay da arena", () => {
  it("junta os recibos seguidos de um golpe em área num passo só", () => {
    const eventos = [recibo("Ari", "Bola de Fogo", "Lobo 1"), recibo("Ari", "Bola de Fogo", "Lobo 2"), recibo("Ari", "Bola de Fogo", "Lobo 3")];
    const passos = montarPassos([quadro(), quadro(0), quadro(1), quadro(2), quadro()], eventos);
    expect(passos.map((p) => [p.de, p.ate, p.eventos.length])).toEqual([[0, 0, 0], [1, 3, 3], [4, 4, 0]]);
  });

  it("dois golpes seguidos no mesmo alvo continuam dois passos", () => {
    const eventos = [recibo("Ari", "Golpe", "Lobo"), recibo("Ari", "Golpe", "Lobo")];
    expect(montarPassos([quadro(0), quadro(1)], eventos)).toHaveLength(2);
  });

  it("dois ataques com rolagem de acerto em alvos diferentes são duas Ações, não área", () => {
    const d20 = { tipo: "ataque" as const, dados: [12], ajuste: "normal" as const, natural: 12, bonus: 4, total: 16, defesa: 12 };
    const eventos = [{ ...recibo("Serpente", "Picada", "Eris"), teste: d20 }, { ...recibo("Serpente", "Picada", "Ari"), teste: d20 }];
    expect(montarPassos([quadro(0), quadro(1)], eventos)).toHaveLength(2);
  });

  it("uma linha no meio separa os recibos", () => {
    const eventos = [recibo("Ari", "Onda", "Lobo 1"), recibo("Ari", "Onda", "Lobo 2")];
    expect(montarPassos([quadro(0), quadro(), quadro(1)], eventos)).toHaveLength(3);
  });

  it("separa o número da cópia do nome", () => {
    expect(partesDoNome("Sapo-Lodo Gigante 2")).toEqual({ base: "Sapo-Lodo Gigante", numero: "2" });
    expect(partesDoNome("Eris Boreas")).toEqual({ base: "Eris Boreas" });
  });
});

describe("forma do golpe na arena", () => {
  it("a arma do recibo manda, pelo grupo de arma do livro", () => {
    const e = { ...recibo("Ari", "Golpe comum", "Lobo"), arma: { nome: "Espada Longa", baseDie: "d8", escalatedDie: "d8", steps: 0 } };
    expect(formaDoGolpe(e)).toBe("espada");
  });

  it("sem arma, o nome da ação decide; sem pista, feitiço com elemento viaja", () => {
    expect(formaDoGolpe(recibo("Eris", "Soco", "Lobo"))).toBe("soco");
    expect(formaDoGolpe(recibo("Sapo", "Mordida Babosa", "Ari"))).toBe("mordida");
    expect(formaDoGolpe(recibo("Urso", "Garras", "Ari"))).toBe("garra");
    expect(formaDoGolpe({ ...recibo("Ari", "Bola Flamejante", "Lobo"), tipoDeDano: "3d6 ígneo" })).toBe("magia");
    expect(formaDoGolpe(recibo("Lobo", "Ataque", "Ari"))).toBe("golpe");
  });
});

describe("reações na arena", () => {
  it("lê as reações das linhas do log", () => {
    expect(reacoesDoPasso("[Ari] usa Aparar: CA 14 + Rank 2 = 16.", [])).toEqual([{ tipo: "aparar", quem: "Ari", nome: "Aparar", alvos: [] }]);
    expect(reacoesDoPasso("[Ari] usa Fluxo após o erro corpo a corpo de Lobo 2.", [])[0]).toMatchObject({ tipo: "fluxo", alvos: ["Lobo 2"] });
    expect(reacoesDoPasso("[Ari] usa Guarda do Corpo e intercepta Lobo no lugar de Eris.", [])[0]).toMatchObject({ tipo: "guarda", quem: "Ari", alvos: ["Eris"] });
    expect(reacoesDoPasso("[Dragão] reage!", [])[0]).toMatchObject({ tipo: "chefe", quem: "Dragão" });
    expect(reacoesDoPasso("[Ari] ataca.", [])).toEqual([]);
  });

  it("lê as reações que vêm nas notas do recibo", () => {
    const e = { ...recibo("Lobo", "Mordida", "Ari"), notas: ["Couraça de Barro: dado 4 + BC 2; absorve 6, custa 2 PM e 1 Reação."] };
    expect(reacoesDoPasso("", [e])).toEqual([{ tipo: "couraca", quem: "Ari", nome: "Couraça de Barro", alvos: [] }]);
  });

  it("as frases de reação continuam escritas no motor", () => {
    const motor = ["combatSim.ts", "encounterSim.ts", "combatReactions.ts"]
      .map((f) => readFileSync(path.join(__dirname, f), "utf8")).join("\n");
    for (const [chave, frase] of Object.entries(FRASES_DE_REACAO)) {
      expect(motor.includes(frase), `a frase de "${chave}" sumiu do motor: ${frase}`).toBe(true);
    }
  });
});
