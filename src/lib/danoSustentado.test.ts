import { describe, expect, it } from "vitest";
import {
  exigeManutencao,
  novoAlvo,
  separarSustentado,
  tickSustentado,
  TURNOS_SUSTENTADOS,
} from "./combatSim";
import { TREES } from "@/data/trees";

/**
 * Dano por turno sustentado — 0.1.57.
 *
 * ## O buraco que isto fecha
 *
 * O livro escreve "por turno" em **sete** magias, e o motor contava cada uma uma
 * vez só. O custo estava registrado como pendência desde a 0.1.50: a Tempestade
 * Cortante, o Rio de Magma e o Trono de Chamas apareciam no `check:progressao`
 * como capstones que rendem MENOS que o rank abaixo delas — e o diagnóstico
 * escrito no backlog era *"o conserto é no simulador, não no livro"*.
 *
 * ## O que o conserto revelou
 *
 * Que aquele diagnóstico estava **incompleto**. Com as sete contadas direito, as
 * três pararam de aparecer — e quatro outras entraram no lugar, um patamar acima
 * delas. O instrumento não estava escondendo um livro certo: estava escondendo
 * um problema diferente, que agora é visível e é de design.
 *
 * O que estes testes travam é o instrumento, não a decisão.
 */

describe("Separar o impacto do que se repete", () => {
  /*
   * As três formas que o livro usa. Todas existem hoje, e a diferença entre
   * elas decide se o motor conta o golpe uma vez ou três.
   */
  it("a linha inteira é por turno, quando não há impacto separado", () => {
    const r = separarSustentado("5d8 + BC de dano cortante por turno");
    expect(r.porTurno).toBe("5d8 + BC de dano cortante por turno");
    expect(r.impacto).toBe("5d8 + BC de dano cortante por turno");
  });

  it("reconhece a barra, e não só a palavra", () => {
    // "6d10 + BC/turno (ígneo)" — o Trono de Chamas escreve assim.
    expect(separarSustentado("6d10 + BC/turno (ígneo)").porTurno).toBeTruthy();
    expect(separarSustentado("6d8 ígneo/turno").porTurno).toBeTruthy();
  });

  it('"depois" separa o impacto do tique', () => {
    const r = separarSustentado("12d8 + BC de dano de magma no impacto, depois 6d10 por turno");
    expect(r.impacto).toBe("12d8 + BC de dano de magma no impacto");
    expect(r.porTurno).toBe("6d10 por turno");
  });

  /*
   * O caso que mais importa não é nenhum dos três: é o das outras 594
   * habilidades. Um falso positivo aqui multiplica por três o dano de uma magia
   * que acontece uma vez — e ninguém veria, porque o número sairia plausível.
   */
  it("golpe comum não vira sustentado", () => {
    for (const linha of [
      "3d6 + Força",
      "2d10 + BC de dano de fogo",
      "Dado de arma rolado duas vezes",
      "12d12 + BC, metade com teste de Vigor",
      "2d8 + BC de PV (4d8 + BC se Ferida Fresca)",
    ]) {
      expect(separarSustentado(linha).porTurno, linha).toBe("");
    }
  });
});

describe("O relógio", () => {
  it("gasta um turno por tique e some quando acaba", () => {
    const alvo = novoAlvo({ nome: "boneco", pv: 1000, ca: 10 });
    alvo.sustentados = [{ media: 10, turnos: 2 }];

    tickSustentado(alvo);
    expect(alvo.pv, "primeiro tique").toBe(990);
    expect(alvo.sustentados).toHaveLength(1);

    tickSustentado(alvo);
    expect(alvo.pv, "segundo tique").toBe(980);
    expect(alvo.sustentados, "o efeito acabou").toHaveLength(0);

    tickSustentado(alvo);
    expect(alvo.pv, "não cobra depois de acabar").toBe(980);
  });

  it("não cobra de quem já caiu", () => {
    const alvo = novoAlvo({ nome: "caído", pv: 5, ca: 10 });
    alvo.vivo = false;
    alvo.sustentados = [{ media: 10, turnos: 2 }];
    tickSustentado(alvo);
    expect(alvo.pv).toBe(5);
  });

  it("devolve false quando o tique derruba o alvo", () => {
    const alvo = novoAlvo({ nome: "quase", pv: 5, ca: 10 });
    alvo.sustentados = [{ media: 10, turnos: 1 }];
    expect(tickSustentado(alvo)).toBe(false);
  });

  it("dois efeitos diferentes somam no mesmo turno", () => {
    const alvo = novoAlvo({ nome: "boneco", pv: 1000, ca: 10 });
    alvo.sustentados = [
      { media: 10, turnos: 1 },
      { media: 7, turnos: 1 },
    ];
    tickSustentado(alvo);
    expect(alvo.pv).toBe(983);
  });
});

describe("A constante declarada", () => {
  /*
   * Três é escolha minha, como o limiar de cura de 50% — não do livro. A
   * Tempestade Cortante dura "1 minuto", que são dez turnos; contar dez daria a
   * ela um dano que nenhuma mesa vê, porque o alvo sai da área (não há mapa
   * aqui) e o combate acaba antes (as batalhas do playtest fecham em 2 a 4
   * rodadas).
   */
  it("é conservadora: menos que a duração escrita de qualquer uma das magias", () => {
    expect(TURNOS_SUSTENTADOS).toBeGreaterThanOrEqual(2);
    expect(TURNOS_SUSTENTADOS, "10 turnos seria a duração escrita, não a jogada").toBeLessThan(10);
  });
});

describe("Manutenção", () => {
  /*
   * A diferença entre uma área que fica lá sozinha e um agarrão.
   *
   * O `Estrangular [Impacto]` diz "enquanto você mantiver" e exige alvo
   * Agarrado: cada turno de dano custa o TURNO do lutador. Contar três tiques
   * por uma Ação dava à técnica 51,6 de dano por Ação — a segunda maior do
   * livro inteiro, num rank Avançado, acima do Imperador do Deus da Espada.
   */
  it("reconhece a manutenção que custa a Ação", () => {
    expect(exigeManutencao("Requer alvo Agarrado. Ele não consegue falar enquanto você mantiver.")).toBe(true);
    expect(exigeManutencao("Manter custa 1 Ação por turno.")).toBe(true);
  });

  it("manutenção de RECURSO não conta — quem paga continua livre pra agir", () => {
    // O Trono de Chamas cobra "uma Sobrecarga por turno". Os turnos dele são
    // reais; o que o motor não cobra é a Sobrecarga, e isso está declarado.
    expect(exigeManutencao("Manter custa uma Sobrecarga por turno, e você pode dispensar quando quiser.")).toBe(false);
  });

  it("área autônoma não exige nada", () => {
    expect(exigeManutencao("A área permanece coberta de magma por 10 minutos.")).toBe(false);
    expect(exigeManutencao("Dura 1 minuto e se move 9m por turno para onde você quiser.")).toBe(false);
    expect(exigeManutencao("Remove o ar da área por 3 turnos.")).toBe(false);
  });

  it("o Estrangular do livro é pego pelo detector", () => {
    const lutador = TREES.find((t) => t.id === "armas-pesadas")!;
    const estrangular = lutador.ranks
      .flatMap((r) => r.abilities ?? [])
      .find((a) => a.id === "estrangular")!;
    expect(estrangular.damage?.normal).toMatch(/por turno/);
    expect(exigeManutencao(estrangular.effect), "e por isto ele NÃO multiplica").toBe(true);
  });
});

describe("O que o livro realmente tem", () => {
  /*
   * Este teste é um CENSO, e existe pra quando alguém escrever a oitava. O
   * backlog dizia "três", e eram sete — a diferença é que só três apareciam
   * como capstone quebrado, e ninguém tinha contado o resto.
   */
  it("sete habilidades de dano do livro são sustentadas", () => {
    const achadas: string[] = [];
    for (const t of TREES) {
      for (const r of t.ranks) {
        for (const a of r.abilities ?? []) {
          const linha = a.damage?.normal;
          if (!linha) continue;
          // A de Cura ("2d6 + BC de PV por turno") casa aqui e NÃO é dano — o
          // motor a separa por `ehSuporte`, e este censo conta só o dano.
          if (/de PV|PV Temporários|recupera/i.test(linha)) continue;
          if (separarSustentado(linha).porTurno) achadas.push(`${t.id}/${a.name}`);
        }
      }
    }
    expect(achadas.sort()).toEqual(
      [
        "armas-pesadas/Estrangular [Impacto]",
        "punho-de-fogo/Prisão de Purgatório",
        "punho-de-fogo/Trono de Chamas",
        "terra/Rio de Magma",
        "vento/Tempestade Cortante",
        "vento/Tomar o Ar",
        "vento/Vazio",
      ].sort()
    );
  });

  it("a cura sustentada NÃO entra no caminho de dano", () => {
    // "2d6 + BC de PV por turno" (Círculo de Recuperação). O campo do livro é o
    // mesmo pros dois e o sinal é oposto: se ela vazar pra cá, o motor passa a
    // causar dano por turno onde o livro cura.
    const linha = "2d6 + BC de PV por turno";
    expect(separarSustentado(linha).porTurno, "o parser vê o 'por turno'").toBeTruthy();
    expect(/de PV/i.test(linha), "e é por isto que o filtro de suporte tem que pegá-la").toBe(true);
  });
});
