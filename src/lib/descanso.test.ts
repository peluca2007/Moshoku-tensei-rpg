import { describe, expect, it } from "vitest";
import { CURTOS_POR_DIA, descansoCurto, descansoLongo, DOWNTIME, ouroDeTrabalhar } from "./descanso";

const MAX = { pv: 40, pm: 16, pt: 10, pp: 6 };

describe("Descanso Curto (Cap. 4, §7)", () => {
  /*
   * A regra mais importante do capítulo inteiro: "a carne não fecha sozinha".
   * Um Curto que devolvesse PV apagaria a promessa de que um grupo sem
   * curandeiro sangra na segunda luta — que é a premissa de que o Cap. 4
   * depende.
   */
  it("NÃO devolve PV. Nenhum.", () => {
    expect(descansoCurto(MAX).pv).toBe(0);
    expect(descansoCurto({ pv: 999, pm: 0, pt: 0, pp: 0 }).pv).toBe(0);
  });

  it("devolve 25% de PM e PP, arredondando pra baixo", () => {
    const g = descansoCurto(MAX);
    expect(g.pm).toBe(4); // 25% de 16
    expect(g.pp).toBe(1); // 25% de 6 = 1,5 → 1
  });

  /*
   * A tabela do Cap. 4 lista PT junto dos 25%, e o aviso logo abaixo dela diz
   * que isso está errado: "PT são a exceção, e voltam inteiros em qualquer
   * Descanso Curto — é o que o Capítulo 3 já dizia, e a tabela acima
   * contradizia". Dois trechos corrigem um; o site segue os dois.
   */
  it("devolve os PT INTEIROS — a tabela está errada e o próprio livro diz isso", () => {
    expect(descansoCurto(MAX).pt).toBe(MAX.pt);
    expect(descansoCurto({ ...MAX, pt: 27 }).pt).toBe(27);
  });

  it("o teto é dois por dia, como o aviso manda", () => {
    expect(CURTOS_POR_DIA).toBe(2);
  });

  it("reserva zerada não vira número negativo nem NaN", () => {
    const g = descansoCurto({ pv: 0, pm: 0, pt: 0, pp: 0 });
    expect([g.pv, g.pm, g.pt, g.pp]).toEqual([0, 0, 0, 0]);
  });
});

describe("Descanso Longo (Cap. 4, §7)", () => {
  it("devolve 50% de PM, PT e PP", () => {
    const g = descansoLongo(MAX, 10);
    expect(g.pm).toBe(8);
    expect(g.pt).toBe(5);
    expect(g.pp).toBe(3);
  });

  it("PV = 25% do máximo mais o percentual rolado no Vigor", () => {
    // 25% de 40 = 10; 20% de 40 = 8.
    expect(descansoLongo(MAX, 20).pv).toBe(18);
  });

  /* O piso de 5% existe pra que um Vigor baixo com sorte ruim ainda durma alguma coisa. */
  it("o percentual rolado tem piso de 5%", () => {
    expect(descansoLongo(MAX, 1).pv).toBe(descansoLongo(MAX, 5).pv);
    expect(descansoLongo(MAX, 0).pv).toBe(10 + 2); // 25% de 40, mais 5% de 40
  });

  it("percentual alto continua sendo somado, sem teto artificial", () => {
    expect(descansoLongo(MAX, 60).pv).toBe(10 + 24);
  });

  it("mostra a conta de cada número, e não só o resultado", () => {
    const g = descansoLongo(MAX, 20);
    expect(g.detalhe.join(" ")).toContain("25% de 40");
    expect(g.detalhe.join(" ")).toContain("20% rolado no Vigor");
  });
});

describe("Downtime (Cap. 5, §1)", () => {
  it("são as seis atividades do livro, e nenhuma concede progressão", () => {
    expect(DOWNTIME).toHaveLength(6);
    for (const a of DOWNTIME) {
      expect(a.efeito.length, a.id).toBeGreaterThan(30);
      // A regra é explícita: Downtime não compra PA, magia, talento nem Rank.
      expect(a.efeito, a.id).not.toMatch(/\bganhe? \d+ PA\b/i);
    }
  });

  it("só duas atividades o site aplica sozinho — o resto é combinação de mesa", () => {
    expect(DOWNTIME.filter((a) => a.aplica).map((a) => a.id)).toEqual(["recuperar", "trabalhar"]);
  });

  it("Trabalhar: 2d6 × maior Bônus de Rank", () => {
    expect(ouroDeTrabalhar(7, 3)).toBe(21);
    expect(ouroDeTrabalhar(12, 6)).toBe(72);
  });

  /*
   * O piso do próprio 2d6 existe pra quem não abriu patamar nenhum: multiplicar
   * por zero daria zero moeda por uma semana inteira de trabalho, que é pior do
   * que o "trabalho comum da cidade" que a regra descreve.
   */
  it("Trabalhar sem nenhum patamar aberto ainda paga o 2d6", () => {
    expect(ouroDeTrabalhar(9, 0)).toBe(9);
    expect(ouroDeTrabalhar(9, 1)).toBe(9);
  });
});
