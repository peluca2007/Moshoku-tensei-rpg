import { describe, expect, it } from "vitest";
import { limiteDeAlvosNaArea } from "./combatSim";

/** Quantos alvos o motor põe numa área, pela descrição da carta (2026-10-08). */
describe("alvos na área", () => {
  it("a linha é estreita: o comprimento não vira raio", () => {
    expect(limiteDeAlvosNaArea("Linha de 27 metros")).toBe(2);
    expect(limiteDeAlvosNaArea("Linha de 18m × 1,5m")).toBe(2);
  });
  it("esfera e cone continuam crescendo com a medida", () => {
    expect(limiteDeAlvosNaArea("Esfera de 6m de raio")).toBe(3);
    expect(limiteDeAlvosNaArea("Esfera de 12m de raio")).toBe(5);
    expect(limiteDeAlvosNaArea("Cone de 9 metros")).toBe(4);
  });
  it("o número escrito na carta manda", () => {
    expect(limiteDeAlvosNaArea("atinge até 3 criaturas")).toBe(3);
  });
});
