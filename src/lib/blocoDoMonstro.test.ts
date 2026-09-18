import { describe, expect, it } from "vitest";
import {
  ARQUETIPOS_CRIATURA,
  MOLDES_CRIATURA,
  atributosDaCriatura,
  fichaDeAtributos,
  getArquetipo,
  percepcaoPassiva,
  periciasDaCriatura,
  sinal,
} from "@/data/bestiary";
import { aplicarDano, novoAlvo } from "@/lib/combatSim";

/**
 * O BLOCO DO MONSTRO — Apêndice G (0.1.90).
 *
 * ## O que ele é
 *
 * Duas escolhas montam um monstro inteiro: o PATAMAR dá todos os números, o
 * ARQUÉTIPO diz em qual atributo cada um aparece. Nada é digitado duas vezes.
 *
 * ## Por que ele tem teste
 *
 * Porque a promessa do bloco é "derivado, nunca guardado", e essa é exatamente
 * a promessa que apodrece calada. No dia em que alguém escrever o atributo à
 * mão numa criatura pronta, ou mudar a coluna de Bônus de Ataque sem olhar os
 * atributos, o Apêndice G volta a ter duas fontes de verdade — que é como a
 * tabela de PV do Cap. 4 e a régua do Apêndice C já envelheceram antes.
 */

describe("Os atributos saem do patamar, e não de uma tabela paralela", () => {
  /*
   * A âncora do bloco inteiro. Se esta linha quebrar, é porque alguém mudou a
   * coluna de Bônus de Ataque da tabela de moldes sem perceber que ela É o
   * atributo Principal da criatura.
   */
  it("Principal = Bônus de Ataque − patamar, em todos os seis", () => {
    for (const m of MOLDES_CRIATURA) {
      expect(atributosDaCriatura(m.patamar).principal, `${m.patamar}º`).toBe(
        m.bonusAtaque - m.patamar
      );
    }
  });

  it("os quatro degraus descem, e o Fraco é −1 em todo patamar", () => {
    for (const m of MOLDES_CRIATURA) {
      const a = atributosDaCriatura(m.patamar);
      expect(a.principal, `${m.patamar}º principal ≥ bom`).toBeGreaterThanOrEqual(a.bom);
      expect(a.bom, `${m.patamar}º bom ≥ comum`).toBeGreaterThanOrEqual(a.comum);
      // Uma Lenda continua sendo burra se o arquétipo dela disser que é: o
      // Fraco NÃO escala com o patamar, e é isso que faz o ogro de 6º ser
      // enganável e o íncubo de 1º não ser.
      expect(a.fraco, `${m.patamar}º fraco`).toBe(-1);
    }
  });

  it("o Principal cresce do 1º ao 6º — senão o arquétipo não significaria nada", () => {
    const primeiro = atributosDaCriatura(1).principal;
    const ultimo = atributosDaCriatura(6).principal;
    expect(ultimo).toBeGreaterThan(primeiro);
  });
});

describe("O arquétipo distribui, e só", () => {
  it("todo arquétipo põe o Principal e o Bom em atributos diferentes", () => {
    for (const a of ARQUETIPOS_CRIATURA) {
      expect(a.principal, a.nome).not.toBe(a.bom);
    }
  });

  it("os cinco atributos sempre existem, com ou sem arquétipo", () => {
    const semArquetipo = fichaDeAtributos(3);
    expect(Object.keys(semArquetipo)).toHaveLength(5);
    // Sem arquétipo é o monstro genérico: tudo Comum. Ele funciona, e é
    // exatamente por não ter identidade que o arquétipo vale a escolha.
    expect(new Set(Object.values(semArquetipo)).size).toBe(1);
  });

  it("com arquétipo, o Principal vai pro atributo que o arquétipo nomeia", () => {
    const d = atributosDaCriatura(6);
    expect(fichaDeAtributos(6, "bruto").forca).toBe(d.principal);
    expect(fichaDeAtributos(6, "agil").agilidade).toBe(d.principal);
    expect(fichaDeAtributos(6, "fortaleza").vigor).toBe(d.principal);
    expect(fichaDeAtributos(6, "conjurador").intelecto).toBe(d.principal);
    expect(fichaDeAtributos(6, "mente").espirito).toBe(d.principal);
  });

  it("o bruto é burro numa Lenda, e a mente é fraca num Comum", () => {
    expect(fichaDeAtributos(6, "bruto").intelecto).toBe(-1);
    expect(fichaDeAtributos(1, "mente").forca).toBe(-1);
  });
});

describe("Percepção passiva usa a MESMA fórmula do Escondido", () => {
  /*
   * Cap. 4, §3: ficar Escondido é Furtividade contra "10 + Espírito de cada
   * inimigo". Monstro não ganha exceção — se ganhasse, existiriam duas regras
   * de furtividade no livro, e a mesa aplicaria a errada.
   */
  it("é 10 + o Espírito da criatura, sem bônus de patamar", () => {
    for (const arq of ARQUETIPOS_CRIATURA) {
      for (let p = 1; p <= 6; p++) {
        expect(percepcaoPassiva(p, arq.id), `${arq.nome} ${p}º`).toBe(
          10 + fichaDeAtributos(p, arq.id).espirito
        );
      }
    }
  });

  it("esconder-se de um bruto é fácil em qualquer patamar; de uma mente, não", () => {
    // O bruto tem Espírito Fraco (−1) sempre, então a CD dele é 9 do 1º ao 6º.
    expect(percepcaoPassiva(1, "bruto")).toBe(percepcaoPassiva(6, "bruto"));
    // A mente sobe junto com o patamar, e é o que a torna assustadora.
    expect(percepcaoPassiva(6, "mente")).toBeGreaterThan(percepcaoPassiva(1, "mente"));
    expect(percepcaoPassiva(6, "mente")).toBeGreaterThan(percepcaoPassiva(6, "bruto"));
  });

  it("quem é cego de Espírito compensa com sentido, e o sentido está escrito", () => {
    // O Ágil tem Espírito Fraco (Percepção 9) mas fura o Escondido pelo faro:
    // sem essa linha, o lobo seria o monstro mais fácil de enganar do livro.
    expect(getArquetipo("agil")?.sentido).toBeTruthy();
    expect(getArquetipo("mente")?.sentido).toBeTruthy();
  });
});

describe("Perícias: Vantagem, e uma conta só", () => {
  it("é metade do patamar, arredondado pra cima", () => {
    expect([1, 2, 3, 4, 5, 6].map(periciasDaCriatura)).toEqual([1, 1, 2, 2, 3, 3]);
  });
});

describe("Resistência e Imunidade chegam ao dano de verdade", () => {
  /*
   * O motivo deste bloco existir: o Cap. 4, §6 definiu as três palavras na
   * revisão do livro, e o motor continuou ignorando as três por várias
   * versões. Um campo de ficha que não muda número nenhum é o pior tipo de
   * campo — ele mente pro Mestre que calibrou o encontro com ele.
   */
  const alvo = (extra: Partial<Parameters<typeof novoAlvo>[0]> = {}) =>
    novoAlvo({ nome: "bicho", pv: 100, ca: 15, ...extra });

  it("Resistência corta o dano pela metade, arredondando pra baixo", () => {
    const a = alvo({ resistencias: ["ígneo"] });
    aplicarDano(a, 21, 2, undefined, false, "6d6 (ígneo)");
    expect(a.pv).toBe(90); // 21 → 10
  });

  it("Imunidade zera, e não gasta os PV Temporários da casca", () => {
    const a = alvo({ imunidades: ["ígneo"], pvTemp: 8 });
    aplicarDano(a, 30, 2, undefined, false, "10d6 (ígneo)");
    expect(a.pv).toBe(100);
    expect(a.pvTemp, "não se gasta escudo contra o que não machuca").toBe(8);
  });

  it("o tipo errado passa inteiro — Resistência é a um tipo, não a tudo", () => {
    const a = alvo({ resistencias: ["ígneo"] });
    aplicarDano(a, 20, 2, undefined, false, "5d8 (cortante)");
    expect(a.pv).toBe(80);
  });

  it("sem tipo declarado, nada se aplica: é o orçamento genérico por turno", () => {
    const a = alvo({ imunidades: ["ígneo"] });
    aplicarDano(a, 20);
    expect(a.pv).toBe(80);
  });

  it("Em Chamas é ígneo: o elemental de fogo não queima", () => {
    // `tickChamas` passa "ígneo" à mão, e este teste é o que impede alguém de
    // tirar esse argumento achando que é redundante.
    const a = alvo({ imunidades: ["ígneo"], emChamas: 6 });
    aplicarDano(a, 6, 2, undefined, false, "ígneo");
    expect(a.pv).toBe(100);
  });
});

describe("O sinal impresso", () => {
  it("imprime como o livro imprime", () => {
    expect(sinal(3)).toBe("+3");
    expect(sinal(0)).toBe("0");
    expect(sinal(-1)).toBe("−1");
  });
});
