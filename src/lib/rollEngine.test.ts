import { afterEach, describe, expect, it, vi } from "vitest";
import { ADVANTAGE_LABELS, AdvantageMode, nextRollId, rollD20, rollFormula } from "./rollEngine";

/**
 * O sorteio, viciado.
 *
 * `rollDie` chama `Math.random()` direto, então testar rolagem exigia injetar o
 * aleatório ou fixar semente — era essa a objeção anotada no `O-QUE-FALTA`, e
 * era ela que mantinha o motor que decide TODA rolagem da mesa sem um teste,
 * enquanto o `selectors.ts` ao lado tem 570 linhas travando fórmulas.
 *
 * A saída é viciar o `Math.random` em vez de abrir uma costura no motor: o
 * código de produção continua exatamente como está — nenhum parâmetro novo,
 * nenhum gerador injetado, nenhum caminho que só existe em teste — e ainda
 * assim cada dado cai no valor que o teste mandou. `rollDie` faz
 * `floor(random * lados) + 1`, então o valor `v` sai de `(v - 1) / lados`.
 *
 * A fila que ESTOURA quando acaba é metade do valor deste helper: ela transforma
 * "o motor rolou mais dados do que devia" — Vantagem pedindo três, uma fórmula
 * rolando o dado a mais — em falha de teste com nome, em vez de um número
 * plausível que ninguém confere.
 */
function dadosViciados(valores: number[], lados: number) {
  const fila = valores.map((v) => (v - 1) / lados);
  let i = 0;
  vi.spyOn(Math, "random").mockImplementation(() => {
    if (i >= fila.length) throw new Error(`o motor pediu ${i + 1} dados e o teste preparou ${fila.length}`);
    return fila[i++];
  });
  return () => i;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("rollD20 — quantos dados cada modo rola", () => {
  const casos: [AdvantageMode, number][] = [
    ["normal", 1],
    ["vantagem", 2],
    ["desvantagem", 2],
    ["vantagemAbsoluta", 3],
    ["desvantagemAbsoluta", 3],
  ];

  for (const [modo, esperado] of casos) {
    it(`${modo} rola ${esperado}`, () => {
      const usados = dadosViciados(Array(esperado).fill(7), 20);
      const r = rollD20(modo, 0);
      expect(usados()).toBe(esperado);
      expect(r.rolls).toHaveLength(esperado);
    });
  }

  it("todo modo tem rótulo", () => {
    for (const [modo] of casos) expect(ADVANTAGE_LABELS[modo]).toBeTruthy();
  });
});

describe("rollD20 — qual dado fica", () => {
  it("Vantagem guarda o maior", () => {
    dadosViciados([3, 17], 20);
    expect(rollD20("vantagem", 0).kept).toBe(17);
  });

  it("Desvantagem guarda o menor", () => {
    dadosViciados([3, 17], 20);
    expect(rollD20("desvantagem", 0).kept).toBe(3);
  });

  it("Vantagem Absoluta guarda o maior dos três", () => {
    dadosViciados([4, 19, 11], 20);
    expect(rollD20("vantagemAbsoluta", 0).kept).toBe(19);
  });

  it("Desvantagem Absoluta guarda o menor dos três", () => {
    dadosViciados([4, 19, 11], 20);
    expect(rollD20("desvantagemAbsoluta", 0).kept).toBe(4);
  });

  it("guarda todos os dados rolados, não só o escolhido", () => {
    dadosViciados([4, 19, 11], 20);
    expect(rollD20("vantagemAbsoluta", 0).rolls).toEqual([4, 19, 11]);
  });
});

/*
 * Cap. 4: o crítico é sempre no dado ESCOLHIDO.
 *
 * É a regra que um motor errado acerta em 90% dos casos e erra justamente nos
 * que decidem a mesa: um 20 rolado sob Desvantagem NÃO é crítico, e um 1 rolado
 * sob Vantagem não é falha crítica — o dado que vale é o que ficou.
 */
describe("rollD20 — crítico é no dado que ficou", () => {
  it("20 no dado escolhido é crítico de sucesso", () => {
    dadosViciados([20], 20);
    expect(rollD20("normal", 0).critical).toBe("sucesso");
  });

  it("1 no dado escolhido é falha crítica", () => {
    dadosViciados([1], 20);
    expect(rollD20("normal", 0).critical).toBe("falha");
  });

  it("20 DESCARTADO pela Desvantagem não é crítico", () => {
    dadosViciados([20, 9], 20);
    const r = rollD20("desvantagem", 0);
    expect(r.kept).toBe(9);
    expect(r.critical).toBeNull();
  });

  it("1 DESCARTADO pela Vantagem não é falha crítica", () => {
    dadosViciados([1, 12], 20);
    const r = rollD20("vantagem", 0);
    expect(r.kept).toBe(12);
    expect(r.critical).toBeNull();
  });

  it("1 mantido pela Desvantagem continua sendo falha", () => {
    dadosViciados([1, 20], 20);
    expect(rollD20("desvantagem", 0).critical).toBe("falha");
  });

  it("o modificador não cria nem apaga crítico", () => {
    dadosViciados([20], 20);
    const alto = rollD20("normal", -15);
    expect(alto.critical).toBe("sucesso");
    expect(alto.total).toBe(5);

    dadosViciados([1], 20);
    const baixo = rollD20("normal", 30);
    expect(baixo.critical).toBe("falha");
    expect(baixo.total).toBe(31);
  });
});

describe("rollD20 — o total", () => {
  it("soma o modificador ao dado escolhido", () => {
    dadosViciados([14], 20);
    const r = rollD20("normal", 5);
    expect(r.modifier).toBe(5);
    expect(r.total).toBe(19);
  });

  it("aceita modificador negativo", () => {
    dadosViciados([14], 20);
    expect(rollD20("normal", -3).total).toBe(11);
  });

  it("nunca sai da faixa de 1 a 20 no dado, com o Math.random de verdade", () => {
    for (let i = 0; i < 2000; i++) {
      for (const r of rollD20("vantagemAbsoluta", 0).rolls) {
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(20);
      }
    }
  });
});

describe("rollFormula — o parser", () => {
  it("NdM rola N dados de M lados", () => {
    const usados = dadosViciados([2, 5], 6);
    const r = rollFormula("2d6");
    expect(usados()).toBe(2);
    expect(r.count).toBe(2);
    expect(r.sides).toBe(6);
    expect(r.rolls).toEqual([2, 5]);
    expect(r.total).toBe(7);
  });

  it("dM sem contagem vale 1 dado — é a notação da Escada de Dados do Cap. 3", () => {
    dadosViciados([7], 10);
    const r = rollFormula("d10");
    expect(r.count).toBe(1);
    expect(r.rolls).toEqual([7]);
  });

  it("lê o modificador embutido", () => {
    dadosViciados([3, 3], 6);
    const r = rollFormula("2d6+4");
    expect(r.modifier).toBe(4);
    expect(r.total).toBe(10);
  });

  it("lê modificador embutido negativo", () => {
    dadosViciados([3, 3], 6);
    expect(rollFormula("2d6-2").total).toBe(4);
  });

  it("soma o modificador embutido com o passado à parte", () => {
    dadosViciados([3, 3], 6);
    const r = rollFormula("2d6+4", 2);
    expect(r.modifier).toBe(6);
    expect(r.total).toBe(12);
  });

  it("ignora espaço no meio da fórmula", () => {
    dadosViciados([4, 4], 6);
    expect(rollFormula(" 2 d 6 ").total).toBe(8);
  });

  it("aceita o D maiúsculo", () => {
    dadosViciados([6], 8);
    expect(rollFormula("D8").rolls).toEqual([6]);
  });

  /*
   * O caminho silencioso, e o mais perigoso do arquivo: fórmula que o parser
   * não entende NÃO lança — devolve zero dados e o modificador extra como
   * total. Isso é deliberado (o campo de dano é texto livre, e um throw ali
   * derrubaria o rolador no meio do turno), mas significa que um erro de
   * digitação vira "dano 0" em vez de erro. O teste existe pra que a decisão
   * seja explícita, e não um acidente que ninguém releu.
   */
  it("fórmula inválida devolve zero dados, sem lançar", () => {
    for (const ruim of ["", "espada", "2x6", "d", "2d", "1d6+", "--"]) {
      const r = rollFormula(ruim, 3);
      expect(r.rolls, ruim).toEqual([]);
      expect(r.count, ruim).toBe(0);
      expect(r.sides, ruim).toBe(0);
      expect(r.total, ruim).toBe(3);
      expect(r.formula, ruim).toBe(ruim);
    }
  });

  it("cada dado da fórmula fica na faixa do próprio lado", () => {
    for (const [formula, lados] of [
      ["3d4", 4],
      ["2d8", 8],
      ["4d12", 12],
    ] as const) {
      for (let i = 0; i < 500; i++) {
        for (const d of rollFormula(formula).rolls) {
          expect(d, formula).toBeGreaterThanOrEqual(1);
          expect(d, formula).toBeLessThanOrEqual(lados);
        }
      }
    }
  });

  it("o total é sempre a soma dos dados mais o modificador", () => {
    for (let i = 0; i < 300; i++) {
      const r = rollFormula("3d6+2", 1);
      expect(r.total).toBe(r.rolls.reduce((a, b) => a + b, 0) + 3);
    }
  });
});

describe("nextRollId", () => {
  it("não repete, nem quando chamado no mesmo milissegundo", () => {
    const ids = Array.from({ length: 500 }, () => nextRollId());
    expect(new Set(ids).size).toBe(ids.length);
  });
});
