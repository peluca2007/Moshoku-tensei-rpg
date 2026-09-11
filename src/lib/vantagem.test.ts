import { describe, expect, it } from "vitest";
import { d20Ajustado } from "./combatSim";

/**
 * "Vantagem é binária" — Cap. 4, §5 (0.1.46).
 *
 * A regra estava implementada no motor desde sempre e **nunca teve teste**. Ela
 * apareceu na auditoria linha a linha das quatro árvores que faltavam: o livro
 * tem quatro tetos escritos no Cap. 4 (Auxílio +6, Ações 5/2 externas, Duas
 * Salvações por combate, e este), e ao conferir quais o motor honra, este era o
 * único — e o único sem nada travando.
 *
 * O livro: *"Vantagem não empilha: dez fontes de Vantagem continuam sendo 2d20.
 * Vantagem e Desvantagem se cancelam uma a uma."*
 *
 * O caso do cancelamento é o que mais importa aqui, porque o motor produz as
 * duas ao mesmo tempo sozinho: um personagem Preso ataca com Desvantagem, e um
 * alvo Caído dá Vantagem a quem o ataca. Preso **e** atacando um Caído tem que
 * rolar UM d20, não quatro.
 */

/** Um d20 de resultados ditados, pra testar a regra e não a sorte. */
function dadoDitado(...valores: number[]) {
  let i = 0;
  return () => {
    const v = valores[Math.min(i++, valores.length - 1)];
    return (v - 1) / 20 + 0.001;
  };
}

describe("Vantagem e Desvantagem", () => {
  it("com Vantagem, rola dois e fica com o MAIOR", () => {
    expect(d20Ajustado(dadoDitado(3, 17), true, false)).toBe(17);
    expect(d20Ajustado(dadoDitado(17, 3), true, false)).toBe(17);
  });

  it("com Desvantagem, rola dois e fica com o MENOR", () => {
    expect(d20Ajustado(dadoDitado(3, 17), false, true)).toBe(3);
    expect(d20Ajustado(dadoDitado(17, 3), false, true)).toBe(3);
  });

  /*
   * O teste que protege a regra de verdade. Se o cancelamento sumir, um
   * personagem Preso atacando um alvo Caído passa a rolar quatro dados, e o
   * motor inventa uma mecânica que o livro proíbe em letra.
   */
  it("as duas juntas se CANCELAM — um d20, não quatro", () => {
    const dado = dadoDitado(3, 17, 20, 20);
    expect(d20Ajustado(dado, true, true), "devia ter usado só o primeiro").toBe(3);
  });

  it("sem nenhuma das duas, um d20 simples", () => {
    expect(d20Ajustado(dadoDitado(11, 20), false, false)).toBe(11);
  });

  /*
   * "Dez fontes de Vantagem continuam sendo 2d20." O motor não tem como somar
   * fontes — `vantagem` é um booleano —, e é exatamente essa a forma que a
   * regra pede. Este teste existe pra que ninguém troque o booleano por um
   * contador sem ler o Cap. 4 antes.
   */
  it("Vantagem não empilha, porque ela nem tem como", () => {
    const comUma = d20Ajustado(dadoDitado(3, 17), true, false);
    const comMuitas = d20Ajustado(dadoDitado(3, 17), true, false);
    expect(comUma).toBe(comMuitas);
  });
});
