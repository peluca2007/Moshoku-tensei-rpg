import { describe, expect, it } from "vitest";
import { ARQUETIPOS_CRIATURA, acoesSugeridas, aplicarPapel } from "@/data/bestiary";
import { mediaFormula } from "@/lib/combatSim";
import type { PapelCriatura } from "@/data/bestiary";

/**
 * AÇÕES SUGERIDAS — Apêndice G (0.1.90).
 *
 * ## O que elas prometem
 *
 * Que o Mestre não precise inventar fórmula de dado. Ele escolhe patamar,
 * papel e arquétipo; o botão devolve ações cujo melhor turno bate a coluna
 * "Dano por turno" da tabela de moldes.
 *
 * ## Por que têm teste
 *
 * Porque a promessa é numérica e invisível. Uma sugestão 50% acima da régua
 * não parece errada na tela — ela parece uma criatura, e mata a mesa três
 * sessões depois. O teste mede o que a criatura REALMENTE faz num turno de três
 * Ações, e não o que a fórmula parece dizer.
 */

const PAPEIS: PapelCriatura[] = ["lacaio", "padrao", "chefe"];

/** O melhor turno de 3 Ações que a lista permite. É assim que a mesa joga. */
function melhorTurno(acoes: ReturnType<typeof acoesSugeridas>): number {
  const uma = acoes.find((a) => a.acoes === 1 && a.dano);
  const duas = acoes.find((a) => a.acoes === 2 && a.dano);
  const soRepetindo = uma ? mediaFormula(uma.dano) * 3 : 0;
  const combo = (duas ? mediaFormula(duas.dano) : 0) + (uma ? mediaFormula(uma.dano) : 0);
  return Math.max(soRepetindo, combo);
}

describe("A régua: o turno sugerido bate o Dano por turno do patamar", () => {
  it("nenhuma combinação passa de 110% do orçamento", () => {
    for (const arq of ARQUETIPOS_CRIATURA) {
      for (const papel of PAPEIS) {
        for (let p = 1; p <= 6; p++) {
          const { danoPorTurno } = aplicarPapel(p, papel);
          const razao = melhorTurno(acoesSugeridas(p, papel, arq.id)) / danoPorTurno;
          expect(razao, `${arq.nome} ${papel} ${p}º`).toBeLessThanOrEqual(1.1);
        }
      }
    }
  });

  /*
   * Errar pra BAIXO é aceitável e errar pra cima não é, e não por simetria:
   * uma criatura fraca demais desperdiça uma cena, uma forte demais mata um
   * personagem. O piso é 65% porque o lacaio de 1º patamar esbarra na
   * granularidade do d4 — três ataques do menor dado do livro já passariam o
   * orçamento inteiro dele, então ele ganha UM golpe por turno, de propósito.
   */
  it("e nenhuma fica abaixo de 65%", () => {
    for (const arq of ARQUETIPOS_CRIATURA) {
      for (const papel of PAPEIS) {
        for (let p = 1; p <= 6; p++) {
          const { danoPorTurno } = aplicarPapel(p, papel);
          const razao = melhorTurno(acoesSugeridas(p, papel, arq.id)) / danoPorTurno;
          expect(razao, `${arq.nome} ${papel} ${p}º`).toBeGreaterThan(0.65);
        }
      }
    }
  });
});

describe("Cada arquétipo sugere o que ele é", () => {
  it("todos devolvem pelo menos uma ação, em todo patamar e papel", () => {
    for (const arq of ARQUETIPOS_CRIATURA) {
      for (const papel of PAPEIS) {
        for (let p = 1; p <= 6; p++) {
          expect(acoesSugeridas(p, papel, arq.id).length, `${arq.nome} ${papel} ${p}º`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("toda ação sugerida vem com nota — o Mestre lê a frase, não o dado", () => {
    for (const arq of ARQUETIPOS_CRIATURA) {
      for (const acao of acoesSugeridas(4, "padrao", arq.id)) {
        expect(acao.nota.length, `${arq.nome}/${acao.nome}`).toBeGreaterThan(15);
        expect(acao.nome, arq.nome).toBeTruthy();
        expect(acao.acoes, `${arq.nome}/${acao.nome}`).toBeGreaterThan(0);
      }
    }
  });

  it("o Conjurador e a Mente têm área; o Bruto não", () => {
    expect(acoesSugeridas(4, "padrao", "conjurador").some((a) => a.area)).toBe(true);
    expect(acoesSugeridas(4, "padrao", "mente").some((a) => a.area)).toBe(true);
    expect(acoesSugeridas(4, "padrao", "bruto").some((a) => a.area)).toBe(false);
  });

  it("a área é teste de resistência, e não ataque — é o que o Cap. 2 pede", () => {
    for (const acao of acoesSugeridas(4, "padrao", "conjurador")) {
      if (acao.area) expect(acao.tipo).toBe("resistencia");
    }
  });

  it("sem arquétipo, cai no Bruto em vez de devolver lista vazia", () => {
    expect(acoesSugeridas(3, "padrao").length).toBeGreaterThan(0);
    expect(acoesSugeridas(3, "padrao")).toEqual(acoesSugeridas(3, "padrao", "bruto"));
  });

  it("o lacaio de 1º ganha UM golpe por turno, e a nota explica por quê", () => {
    // O piso do d4: três ataques do menor dado do livro passariam o orçamento
    // inteiro dele. A saída é de ficção — lacaio não tem economia de ação.
    const acoes = acoesSugeridas(1, "lacaio", "bruto");
    expect(acoes).toHaveLength(1);
    expect(acoes[0].acoes).toBe(2);
    expect(acoes[0].nota).toMatch(/número de corpos/i);
  });
});

describe("As fórmulas são legíveis pela mesa e pelo motor", () => {
  it("toda fórmula de dano casa com NdX, NdX+F ou NdX-F", () => {
    for (const arq of ARQUETIPOS_CRIATURA) {
      for (let p = 1; p <= 6; p++) {
        for (const acao of acoesSugeridas(p, "padrao", arq.id)) {
          if (!acao.dano) continue;
          expect(acao.dano, `${arq.nome} ${p}º ${acao.nome}`).toMatch(/^\d+d(4|6|8|10|12)([+-]\d+)?$/);
          expect(mediaFormula(acao.dano), `${arq.nome} ${p}º ${acao.nome}`).toBeGreaterThan(0);
        }
      }
    }
  });
});
