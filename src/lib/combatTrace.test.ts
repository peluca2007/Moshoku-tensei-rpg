import { describe, expect, it, vi } from "vitest";
import {
  EventoAtaque,
  formatarEventoAtaque,
  formatarRolagemDados,
  rolarComRegistro,
  rolarCriticoComRegistro,
  rolarD20ComRegistro,
} from "./combatTrace";

describe("registro dos dados efetivamente usados", () => {
  it("preserva cada resultado, grupos de dados e modificadores na soma", () => {
    const rng = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.99).mockReturnValueOnce(0.5);
    const rolagem = rolarComRegistro("2d6 + 1d4 + 5 - 2", rng);
    expect(rolagem).toEqual({
      formula: "2d6 + 1d4 + 5 - 2",
      grupos: [{ faces: 6, resultados: [1, 6] }, { faces: 4, resultados: [3] }],
      fixo: 3,
      total: 13,
    });
    expect(rng).toHaveBeenCalledTimes(3);
    expect(formatarRolagemDados(rolagem)).toBe("2d6 [1, 6] + 1d4 [3] + 3 = 13");
    expect(rng).toHaveBeenCalledTimes(3);
  });

  it("rola três dados de arma independentes em vez de multiplicar um único resultado", () => {
    const rng = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(0.99);
    expect(rolarComRegistro("1d6 + 2", rng, 3)).toEqual({
      formula: "3 × (1d6 + 2)",
      grupos: [{ faces: 6, resultados: [1, 4, 6] }],
      fixo: 6,
      total: 17,
    });
    expect(rng).toHaveBeenCalledTimes(3);
  });

  it("não conta quantidades de armas, ações e distâncias como bônus fixo", () => {
    const rolagem = rolarComRegistro("1d6 + 2 Dados de Arma + 1 Ação + 3m + 4", () => 0);
    expect(rolagem.fixo).toBe(4);
    expect(rolagem.total).toBe(5);
  });

  it("aceita o dado de arma sem quantidade e uma fórmula apenas com dano fixo", () => {
    expect(rolarComRegistro("d8", () => 0.99).total).toBe(8);
    const rng = vi.fn();
    expect(rolarComRegistro("5", rng).total).toBe(5);
    expect(rolarComRegistro("- 2", rng).total).toBe(-2);
    expect(rng).not.toHaveBeenCalled();
  });

  it("o adicional crítico não repete o modificador fixo", () => {
    const rng = vi.fn(() => 0.5);
    const normal = rolarComRegistro("2d6 + 5", rng);
    const critico = rolarCriticoComRegistro("2d6 + 5", rng);
    expect(normal.total).toBe(13);
    expect(critico).toEqual({ formula: "2d6", grupos: [{ faces: 6, resultados: [4, 4] }], fixo: 0, total: 8 });
    expect(normal.total + critico.total).toBe(21);
    expect(rng).toHaveBeenCalledTimes(4);
  });

  it("zero repetições não sorteia nem aplica bônus", () => {
    const rng = vi.fn();
    expect(rolarComRegistro("1d8 + 5", rng, 0).total).toBe(0);
    expect(rng).not.toHaveBeenCalled();
  });
});

describe("registro do teste de d20", () => {
  it.each([
    { vantagem: true, desvantagem: false, ajuste: "vantagem", natural: 20 },
    { vantagem: false, desvantagem: true, ajuste: "desvantagem", natural: 1 },
  ])("conserva os dois dados com $ajuste", ({ vantagem, desvantagem, ajuste, natural }) => {
    const rng = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.99);
    expect(rolarD20ComRegistro(rng, vantagem, desvantagem)).toEqual({ dados: [1, 20], natural, ajuste });
    expect(rng).toHaveBeenCalledTimes(2);
  });

  it.each([false, true])("vantagem e desvantagem iguais (%s) usam apenas um dado", (ambos) => {
    const rng = vi.fn(() => 0.5);
    expect(rolarD20ComRegistro(rng, ambos, ambos)).toEqual({ dados: [11], natural: 11, ajuste: "normal" });
    expect(rng).toHaveBeenCalledTimes(1);
  });
});

describe("texto auditável do ataque", () => {
  const evento: EventoAtaque = {
    atacante: "Ari", alvo: "Ogro", acao: "Ataque comum",
    teste: { tipo: "ataque", dados: [14], natural: 14, ajuste: "normal", bonus: 3, total: 17, defesa: 15 },
    acertou: true, critico: false,
    parcelas: [{ origem: "Arma", rolagem: { formula: "1d8", grupos: [{ faces: 8, resultados: [6] }], fixo: 0, total: 6 } }],
    bonusDano: 5, bruto: 11, aposModificadores: 11,
    aplicacao: { aposResistencia: 5, absorvidoTemporario: 2, perdaPv: 3, danoEfetivo: 5 },
    arma: { nome: "Espada", baseDie: "d6", escalatedDie: "d8", steps: 1 },
    notas: ["Resistência ao dano cortante: metade, arredondada para baixo."],
  };

  it("expõe o teste, o degrau, a soma do dano e o destino dos pontos", () => {
    const texto = formatarEventoAtaque(evento);
    expect(texto).toContain("d20 [14] + 3 = 17 contra CA 15: acertou");
    expect(texto).toContain("Espada, d6 → d8 (1 degrau)");
    expect(texto).toContain("Arma: 1d8 [6] = 6");
    expect(texto).toContain("Dano bruto: 6 + 5 de bônus = 11");
    expect(texto).toContain("PV temporários absorveram 2; perda de PV: 3");
    expect(texto).toContain(evento.notas[0]);
  });

  it("registra um erro sem inventar dados de dano", () => {
    const texto = formatarEventoAtaque({
      ...evento,
      teste: { tipo: "ataque", dados: [1], natural: 1, ajuste: "normal", bonus: 20, total: 21, defesa: 15 },
      acertou: false, parcelas: [], bonusDano: 0, bruto: 0, aposModificadores: 0, aplicacao: undefined,
    });
    expect(texto).toContain("21 contra CA 15: errou");
    expect(texto).toContain("Dano bruto: 0");
    expect(texto).not.toContain("1d8 [");
  });

  it("explica a resistência bem-sucedida mesmo quando o efeito ainda causa metade do dano", () => {
    const texto = formatarEventoAtaque({
      ...evento,
      teste: { tipo: "resistencia", dados: [12, 17], natural: 17, ajuste: "vantagem", bonus: 1, total: 18, defesa: 15 },
      aposModificadores: 5,
    });
    expect(texto).toContain("Resistência do alvo: d20 [12, 17] (vantagem; escolhido 17) + 1 = 18 contra CD 15: alvo passou");
    expect(texto).toContain("Após modificadores: 5");
  });
});
