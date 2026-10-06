import { describe, expect, it } from "vitest";
import { comGolpeDeArma } from "./combatSim";
import { TREES } from "@/data/trees";
import type { AbilityDef } from "./types";

const carta = (arvore: string, nome: string) =>
  TREES.find((t) => t.id === arvore)!.ranks.flatMap((r) => r.abilities ?? []).find((a) => a.name === nome) as AbilityDef;

describe("o golpe de arma que a carta não escreve na linha de dano", () => {
  it("'Ataque.' sem linha de dano rola o Dado de Arma uma vez", () => {
    expect(comGolpeDeArma(carta("deus-da-espada", "Corte de Braço")).damage?.normal).toBe("Dano de arma normal");
  });
  it("dois golpes rolam duas vezes", () => {
    expect(comGolpeDeArma(carta("deus-da-espada", "Dois Cortes")).damage?.normal).toBe("Dado de arma rolado duas vezes");
  });
  it("o extra sem condição soma; o extra com condição fica fora", () => {
    expect(comGolpeDeArma(carta("deus-do-norte", "Forma Quadrúpede")).damage?.normal).toBe("Dano de arma normal +1d6");
    expect(comGolpeDeArma(carta("deus-do-norte", "Corte Reverso")).damage?.normal).toBe("Dano de arma normal");
  });
  it("não mexe em magia nem em carta que já escreve o dano da arma", () => {
    const bola = carta("fogo", "Bola de Fogo");
    expect(comGolpeDeArma(bola)).toBe(bola);
    const silencio = carta("deus-da-espada", "Espada do Silêncio");
    expect(comGolpeDeArma(silencio)).toBe(silencio);
  });
});
