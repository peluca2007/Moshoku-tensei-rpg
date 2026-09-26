import { describe, expect, it } from "vitest";
import { TEMPERATURAS, orcamentoDeEncontro, pesoNoOrcamento } from "@/data/bestiary";

/**
 * O ORÇAMENTO DE ENCONTRO — Apêndice G (0.1.90).
 *
 * ## O que ele é
 *
 * A resposta para a primeira pergunta de todo Mestre montando a primeira
 * sessão: quantas criaturas, e de qual patamar. A regra é uma só —
 * **um encontro equilibrado é uma criatura do patamar do grupo POR JOGADOR** —
 * e o resto é câmbio.
 *
 * ## Por que ele tem teste
 *
 * Porque a curva é geométrica e a intuição não é. Um Mestre que "arredonde"
 * mentalmente o câmbio para uma escada aritmética (um acima vale 1,5; um abaixo
 * vale 0,75) monta encontros que parecem justos e matam a mesa — e como o
 * orçamento é a peça que o simulador NÃO verifica (ele mede o resultado, não a
 * conta), nada avisaria.
 */

const padrao = (patamar: number, quantidade = 1) =>
  ({ patamar, papel: "padrao" as const, quantidade });

describe("A régua: uma criatura do patamar do grupo por jogador", () => {
  it("quatro criaturas do patamar do grupo, num grupo de quatro, é exatamente 1,00×", () => {
    const r = orcamentoDeEncontro([padrao(3, 4)], 4, 3)!;
    expect(r.razao).toBe(1);
    expect(r.temperatura).toBe("equilibrado");
  });

  it("vale pra qualquer tamanho de grupo e qualquer patamar", () => {
    for (let jogadores = 2; jogadores <= 6; jogadores++) {
      for (let p = 1; p <= 6; p++) {
        expect(orcamentoDeEncontro([padrao(p, jogadores)], jogadores, p)!.razao, `${jogadores}j ${p}º`).toBe(1);
      }
    }
  });
});

describe("O câmbio dobra a cada patamar — e é de propósito", () => {
  /*
   * A tabela de moldes multiplica o PV por 16 e o dano por 12 do 1º ao 6º.
   * Uma escada aritmética diria que dois lacaios de 1º equivalem a uma Lenda,
   * e a mesa descobriria o contrário na pior hora possível.
   */
  it("uma acima vale duas; uma abaixo, meia; duas abaixo, um quarto", () => {
    expect(pesoNoOrcamento(4, "padrao", 3)).toBe(2);
    expect(pesoNoOrcamento(3, "padrao", 3)).toBe(1);
    expect(pesoNoOrcamento(2, "padrao", 3)).toBe(0.5);
    expect(pesoNoOrcamento(1, "padrao", 3)).toBe(0.25);
  });

  it("nunca chega a zero: mil ratos ainda são um problema, só que pequeno", () => {
    expect(pesoNoOrcamento(1, "lacaio", 6)).toBeGreaterThan(0);
  });

  it("o lacaio vale meia criatura, e o chefe vale cinco", () => {
    expect(pesoNoOrcamento(3, "lacaio", 3)).toBe(0.5);
    expect(pesoNoOrcamento(3, "padrao", 3)).toBe(1);
    // Cinco (desde 2026-09-26; eram três): o chefe tem PV dobrado MAIS uma rodada inteira a cada
    // dois personagens (Apêndice G), e com três ele dizimava o grupo em 1 de 4 batalhas "fáceis".
    expect(pesoNoOrcamento(3, "chefe", 3)).toBe(5);
  });

  it("oito lacaios do patamar do grupo pesam o mesmo que quatro padrões", () => {
    const lacaios = orcamentoDeEncontro([{ patamar: 3, papel: "lacaio", quantidade: 8 }], 4, 3)!;
    const padroes = orcamentoDeEncontro([padrao(3, 4)], 4, 3)!;
    expect(lacaios.peso).toBe(padroes.peso);
  });
});

describe("Imunidade custa um patamar", () => {
  /*
   * O preço declarado no Apêndice G. Imunidade não é "resistência grande": ela
   * apaga a jogada de alguém da mesa — o mago de Fogo que passou a campanha
   * inteira investindo numa escola descobre que não existe naquele combate.
   */
  it("uma criatura imune pesa o dobro da mesma criatura sem imunidade", () => {
    expect(pesoNoOrcamento(3, "padrao", 3, true)).toBe(pesoNoOrcamento(3, "padrao", 3) * 2);
  });

  it("e é o bastante pra levar um encontro equilibrado a mortal", () => {
    const limpo = orcamentoDeEncontro([padrao(3, 4)], 4, 3)!;
    const imune = orcamentoDeEncontro(
      [{ patamar: 3, papel: "padrao", quantidade: 4, temImunidade: true }],
      4,
      3
    )!;
    expect(limpo.temperatura).toBe("equilibrado");
    expect(imune.temperatura).toBe("mortal");
  });
});

describe("As temperaturas", () => {
  it("sobem, não se sobrepõem, e a última não tem teto", () => {
    const tetos = TEMPERATURAS.map((t) => t.ate);
    for (let i = 1; i < tetos.length; i++) {
      expect(tetos[i], TEMPERATURAS[i].nome).toBeGreaterThan(tetos[i - 1]);
    }
    expect(tetos[tetos.length - 1]).toBe(Infinity);
  });

  it("toda temperatura tem nome e descrição — o Mestre lê a frase, não o número", () => {
    for (const t of TEMPERATURAS) {
      expect(t.nome, t.id).toBeTruthy();
      expect(t.descricao.length, t.id).toBeGreaterThan(20);
    }
  });

  it("um encontro que dobra o orçamento é mortal", () => {
    expect(orcamentoDeEncontro([padrao(4, 4)], 4, 3)!.temperatura).toBe("mortal");
  });

  it("metade do orçamento é fácil", () => {
    expect(orcamentoDeEncontro([padrao(3, 2)], 4, 3)!.temperatura).toBe("facil");
  });
});

describe("Os casos vazios não explodem", () => {
  it("sem criaturas, não há orçamento", () => {
    expect(orcamentoDeEncontro([], 4, 3)).toBeNull();
  });

  it("sem grupo, não há contra quem medir", () => {
    expect(orcamentoDeEncontro([padrao(3, 4)], 0, 3)).toBeNull();
  });
});
