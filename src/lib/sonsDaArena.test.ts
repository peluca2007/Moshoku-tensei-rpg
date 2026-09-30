import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { EventoAtaque } from "./combatTrace";
import { FRASES_DE_BUFF, SONS, caminhoDoSom, sonsDoPasso, type PassoSonoro } from "./sonsDaArena";

function recibo(patch: Partial<EventoAtaque> = {}): EventoAtaque {
  return { atacante: "Eris", acao: "Golpe", alvo: "Lobo", acertou: true, critico: false, parcelas: [], bonusDano: 0, bruto: 0, aposModificadores: 0, notas: [], ...patch };
}

function passo(patch: Partial<PassoSonoro>): PassoSonoro {
  return { eventos: [], reacoes: [], linha: "", curou: false, semente: 0, ...patch };
}

describe("sons da arena", () => {
  it("todo som listado existe em public/sons/arena", () => {
    for (const som of SONS) expect(existsSync(path.join(process.cwd(), "public", caminhoDoSom(som))), som).toBe(true);
  });

  it("espada que acerta soa no impacto; que erra, assobia", () => {
    expect(sonsDoPasso(passo({ forma: "espada", eventos: [recibo()] })).map((t) => t.som)[0]).toMatch(/^espada-/);
    expect(sonsDoPasso(passo({ forma: "espada", eventos: [recibo({ acertou: false })] })).map((t) => t.som)).toEqual(["assobio"]);
  });

  it("feitiço de fogo soa ao sair e ao chegar, e o impacto espera o projétil", () => {
    const toques = sonsDoPasso(passo({ forma: "magia", elemento: "fogo", eventos: [recibo()] }));
    expect(toques.map((t) => t.som)).toEqual(["fogo", "fogo-impacto"]);
    expect(toques[1].atraso).toBeGreaterThan(400);
  });

  it("só grita no crítico, e só com a voz que o jogador escolheu", () => {
    expect(sonsDoPasso(passo({ forma: "soco", eventos: [recibo({ critico: true })] })).some((t) => t.som.startsWith("grito"))).toBe(false);
    expect(sonsDoPasso(passo({ forma: "soco", eventos: [recibo({ critico: true })], vozDoAtacante: "feminina" }))[0].som).toBe("grito-feminino");
    expect(sonsDoPasso(passo({ forma: "soco", eventos: [recibo()], vozDoAtacante: "feminina" })).some((t) => t.som.startsWith("grito"))).toBe(false);
  });

  it("golpe em área soa uma vez só", () => {
    const toques = sonsDoPasso(passo({ forma: "magia", elemento: "gelo", eventos: [recibo(), recibo({ alvo: "Lobo 2" }), recibo({ alvo: "Lobo 3" })] }));
    expect(toques.filter((t) => t.atraso > 400)).toHaveLength(1);
  });

  it("Aparar toca o parry; buff do Tático e do Bardo toca o gooo; cura toca a cura", () => {
    expect(sonsDoPasso(passo({ reacoes: [{ tipo: "aparar", quem: "Eris", nome: "Aparar", alvos: [] }] }))[0].som).toBe("aparar");
    expect(sonsDoPasso(passo({ linha: "[Ghislaine] aponta Lobo: o primeiro acerto recebe +2d6." }))[0].som).toBe("buff");
    expect(sonsDoPasso(passo({ linha: "[Bardo] inspira Eris: 1d6 para somar depois de ver um teste." }))[0].som).toBe("buff");
    expect(sonsDoPasso(passo({ curou: true }))[0].som).toMatch(/^cura-/);
  });

  it("as frases de buff continuam escritas no motor", () => {
    const motor = readFileSync(path.join(__dirname, "combatSim.ts"), "utf8");
    for (const frase of FRASES_DE_BUFF) expect(motor.includes(frase), frase).toBe(true);
  });
});
