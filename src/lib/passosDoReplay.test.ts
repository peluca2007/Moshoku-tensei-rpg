import { describe, expect, it } from "vitest";
import type { EventoAtaque } from "./combatTrace";
import type { QuadroDoReplay } from "./encounterSim";
import { montarPassos, partesDoNome } from "./passosDoReplay";

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

  it("uma linha no meio separa os recibos", () => {
    const eventos = [recibo("Ari", "Onda", "Lobo 1"), recibo("Ari", "Onda", "Lobo 2")];
    expect(montarPassos([quadro(0), quadro(), quadro(1)], eventos)).toHaveLength(3);
  });

  it("separa o número da cópia do nome", () => {
    expect(partesDoNome("Sapo-Lodo Gigante 2")).toEqual({ base: "Sapo-Lodo Gigante", numero: "2" });
    expect(partesDoNome("Eris Boreas")).toEqual({ base: "Eris Boreas" });
  });
});
