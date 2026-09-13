import { describe, expect, it } from "vitest";
import { TREES } from "./trees";
import { diceAverage } from "@/lib/dice";
import { PV_BASE } from "@/lib/types";

/*
 * A auditoria de 2026-09-13 mediu os PV das dezenove árvores pela primeira vez
 * e achou o que ninguém tinha como ver: as faixas dos três pilares se cruzavam.
 * Terra fechava o Imperador com 99 PV e Barreira com 92, contra 100 da
 * Arquearia — a árvore de CORPO mais frágil do livro. O mago que escolhesse a
 * escola certa tinha corpo de guerreiro, e corpo é a única coisa que o livro
 * cobra em troca de alcance, área e condição.
 *
 * O nerf de PV dos magos (ver `TreeRankDef.hpDiceFormula`) separou as faixas.
 * Nada guardava essa separação — nenhum dos 529 testes de então tocava num
 * Dado de PV, e as oito escadas de magia foram editadas sem que um único teste
 * mudasse de cor. Qualquer +1 futuro num modificador de Dado de PV pode
 * recolar as faixas em silêncio, e é isso que este arquivo impede.
 *
 * Ele testa a ORDEM entre os pilares, não os valores: um rebalanceamento que
 * suba ou desça o livro inteiro continua passando. Só volta a falhar quando um
 * mago alcançar um guerreiro.
 */

/** Os seis patamares compráveis. O Rank Deus é quadro à parte e não tem Dado de PV. */
const PATAMARES = [1, 2, 3, 4, 5, 6];

/**
 * O "corpo treinado" puro do Cap. 4, sem Vigor, raça, talento nem PA.
 *
 * O Fator de Vigor é multiplicativo e igual pra todo mundo, então ele não muda
 * a ordem entre as árvores — deixá-lo de fora mede a escada de Dados de PV, que
 * é o único dado que cada árvore escreve por conta própria.
 */
function pvNuAte(treeId: string, patamares: number): number {
  const tree = TREES.find((t) => t.id === treeId)!;
  const dados = tree.ranks
    .slice(0, patamares)
    .reduce((soma, r) => soma + diceAverage(r.hpDiceFormula), 0);
  return Math.floor(PV_BASE + dados * 1.67);
}

const porPilar = (categoria: string) => TREES.filter((t) => t.category === categoria);

const faixa = (categoria: string, patamares: number) => {
  const vs = porPilar(categoria).map((t) => pvNuAte(t.id, patamares));
  return { min: Math.min(...vs), max: Math.max(...vs) };
};

describe("as três faixas de PV não se cruzam", () => {
  it.each(PATAMARES)("no %iº patamar, o mago mais duro fica abaixo do guerreiro mais frágil", (n) => {
    const magia = faixa("magia", n);
    const corpo = faixa("corpo", n);
    expect(magia.max, `${n}º: magia chega a ${magia.max} PV, corpo começa em ${corpo.min}`).toBeLessThan(
      corpo.min
    );
  });

  it.each(PATAMARES)("no %iº patamar, a Utilidade fica entre os dois", (n) => {
    const magia = faixa("magia", n);
    const utilidade = faixa("utilidade", n);
    const corpo = faixa("corpo", n);
    // Sobrepor a magia é permitido (as faixas se encostam por baixo); o que a
    // Utilidade não pode é TER O TETO de um guerreiro nem o PISO de um mago.
    expect(utilidade.max, `${n}º`).toBeLessThan(corpo.min);
    expect(utilidade.min, `${n}º`).toBeGreaterThanOrEqual(magia.min);
  });
});

describe("nenhuma escola de magia rola dado de guerreiro", () => {
  it("o Dado de PV de toda árvore de magia para no d8", () => {
    const acima = porPilar("magia").flatMap((t) =>
      t.ranks
        .filter((r) => Number(r.hpDiceFormula.split("d")[1].split("+")[0]) > 8)
        .map((r) => `${t.id}/${r.rank} = ${r.hpDiceFormula}`)
    );
    expect(acima).toEqual([]);
  });

  it("toda árvore de magia rola UM dado por patamar — 2dX é escada de Corpo", () => {
    const multiplos = porPilar("magia").flatMap((t) =>
      t.ranks.filter((r) => !r.hpDiceFormula.startsWith("1d")).map((r) => `${t.id}/${r.rank}`)
    );
    expect(multiplos).toEqual([]);
  });
});

describe("a escada de PV de cada árvore nunca desce", () => {
  it.each(TREES.map((t) => t.id))("%s ganha PV a cada patamar", (id) => {
    const escada = PATAMARES.map((n) => pvNuAte(id, n));
    for (let i = 1; i < escada.length; i++) {
      expect(escada[i], `${id}: ${escada.join("/")}`).toBeGreaterThan(escada[i - 1]);
    }
  });
});
