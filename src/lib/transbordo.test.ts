import { describe, expect, it } from "vitest";
import { novoAlvo, transbordarDoses } from "./combatSim";

/**
 * Transbordo (Dose, Cap. 4 §2) — 2026-10-05: quem cai a 0 PV com Dose passa
 * as Doses pro aliado dele mais próximo, sem teste. Sem isso o veneno num alvo
 * que o grupo derrubou se perdia, e o ciclo Dose → Inverter não pagava.
 */
describe("Transbordo", () => {
  const grupo = () => {
    const caido = novoAlvo({ nome: "caído", pv: 0, ca: 10, doses: 2 });
    caido.vivo = false;
    const perto = novoAlvo({ nome: "perto", pv: 30, ca: 10, posicao: 3 });
    const longe = novoAlvo({ nome: "longe", pv: 30, ca: 10, posicao: 20 });
    caido.posicao = 0;
    return { caido, perto, longe };
  };

  it("as Doses de quem caiu passam ao aliado mais próximo, e só uma vez", () => {
    const { caido, perto, longe } = grupo();
    transbordarDoses([caido, longe, perto]);
    expect(perto.doses).toBe(2);
    expect(perto.envenenado).toBe(true);
    expect(longe.doses).toBe(0);
    expect(caido.doses).toBe(0);
    transbordarDoses([caido, longe, perto]);
    expect(perto.doses).toBe(2);
  });

  it("chegar a 3 Doses pelo Transbordo é o Colapso", () => {
    const { caido, perto, longe } = grupo();
    perto.doses = 1;
    transbordarDoses([caido, longe, perto]);
    expect(perto.doses).toBe(0);
    expect(perto.atordoadoTurnos).toBe(1);
  });

  it("ninguém a até 9 m: as Doses se perdem", () => {
    const { caido, longe } = grupo();
    transbordarDoses([caido, longe]);
    expect(longe.doses).toBe(0);
  });
});
