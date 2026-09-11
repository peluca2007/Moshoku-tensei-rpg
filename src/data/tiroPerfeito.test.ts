import { describe, expect, it } from "vitest";
import { TREES } from "@/data/trees";
import { AbilityDef, TalentDef, Tree } from "@/lib/types";

/**
 * O Tiro Perfeito — a Preparação em etapas da Arquearia (0.1.53).
 *
 * ## O que ele é
 *
 * A única técnica do livro que compra potência com **tempo** em vez de recurso:
 * quatro Ações num turno de três, então ela sempre atravessa turnos. Cada etapa
 * é um teste CD 12 que concede uma coisa distinta, e **falhar não interrompe** —
 * você perde o bônus daquela etapa e segue.
 *
 * ## Por que ele tem teste
 *
 * Porque é um sistema, e não uma habilidade: sete entradas espalhadas por cinco
 * patamares (a base, quatro talentos e a habilidade do Rei) que só fazem sentido
 * juntas. O risco real não é alguém quebrar o dano — é alguém mexer numa das
 * sete e deixar as outras seis descrevendo um sistema que mudou. Foi exatamente
 * o que aconteceu com a Maestria do Rei, que prometia em letra que *"não existe
 * segunda forma"* de furar o Manto de Touki no mesmo dia em que a Preparação
 * Perfeita passou a ser a segunda.
 */

const arquearia = TREES.find((t) => t.id === "arquearia") as Tree;

function habilidade(id: string): AbilityDef {
  for (const r of arquearia.ranks) {
    const a = (r.abilities ?? []).find((x) => x.id === id);
    if (a) return a;
  }
  throw new Error(`habilidade não encontrada: ${id}`);
}

function talento(id: string): TalentDef {
  for (const r of arquearia.ranks) {
    const t = (r.talents ?? []).find((x) => x.id === id);
    if (t) return t;
  }
  throw new Error(`talento não encontrado: ${id}`);
}

/** Em que patamar mora cada entrada — a ordem da escada importa. */
function patamarDe(id: string): string {
  for (const r of arquearia.ranks) {
    if ((r.abilities ?? []).some((a) => a.id === id)) return r.rank;
    if ((r.talents ?? []).some((t) => t.id === id)) return r.rank;
  }
  throw new Error(id);
}

describe("A base", () => {
  const tiro = habilidade("tiro-perfeito");

  /*
   * Quatro Ações num turno de três NÃO é um erro de digitação — é o desenho
   * inteiro. Se alguém "consertar" isso pra 3, o Tiro Perfeito deixa de
   * atravessar turnos e vira mais uma técnica de um turno só, que é justamente
   * o que a árvore já tem de sobra.
   */
  it("custa 4 Ações de propósito, e explica por quê", () => {
    expect(tiro.actions.normal).toBe(4);
    expect(tiro.costNote, "desvio de custo sem costNote é indistinguível de erro").toBeTruthy();
    expect(tiro.costNote).toMatch(/atravessa turnos/i);
  });

  it("as quatro etapas estão todas escritas, na ordem", () => {
    const ordem = ["A Corda", "Os Dedos", "A Leitura", "A Solta"];
    let cursor = -1;
    for (const etapa of ordem) {
      const onde = tiro.effect.indexOf(etapa);
      expect(onde, `${etapa} não aparece no efeito`).toBeGreaterThan(-1);
      expect(onde, `${etapa} está fora de ordem`).toBeGreaterThan(cursor);
      cursor = onde;
    }
  });

  it("cada etapa nomeia o atributo ou a perícia que ela testa", () => {
    for (const teste of ["Força", "Agilidade", "Intelecto ou Espírito", "Medicina", "Sobrevivência"]) {
      expect(tiro.effect, teste).toContain(teste);
    }
  });

  /*
   * A regra que dá identidade ao sistema. Sem ela, o Tiro Perfeito vira uma
   * corrente de quatro testes onde um 7 no d20 joga fora um turno inteiro — e
   * ninguém aposta dois turnos num tiro que uma rolagem ruim anula.
   */
  it("falhar numa etapa NÃO interrompe a Preparação", () => {
    expect(tiro.effect).toMatch(/FALHAR NÃO INTERROMPE/);
  });

  it("a CD é fixa em 12, e não a escada de 8 + atributo + Rank", () => {
    // CD fixa porque a dificuldade é da TÉCNICA, não de um alvo resistindo: não
    // há ninguém do outro lado desses três testes. A escada do livro mede
    // oposição, e aqui não existe oposição pra medir.
    expect((tiro.effect.match(/CD 12/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(tiro.effect).not.toMatch(/CD 8 \+/);
  });

  it("sofrer dano no meio cobra Concentração, como toda técnica de vários turnos", () => {
    expect(tiro.effect).toMatch(/Concentração/);
  });
});

describe("A escada em torno dele", () => {
  /*
   * Sete entradas, cinco patamares. Este teste é o que impede a linha de virar
   * uma habilidade solta com quatro talentos órfãos: toda entrada tem que citar
   * o sistema pelo nome de alguma etapa ou da própria técnica.
   */
  const linha = [
    "tiro-perfeito",
    "respiracao-contada",
    "etapa-encurtada",
    "olho-que-ja-viu",
    "ponto-vital-lido",
    "preparacao-perfeita",
  ];

  it("toda entrada da linha fala do sistema pelo nome", () => {
    for (const id of linha) {
      let texto: string;
      try {
        texto = habilidade(id).effect;
      } catch {
        texto = talento(id).description;
      }
      expect(texto, id).toMatch(/Tiro Perfeito|Preparação|A Corda|Os Dedos|Leitura|O Ponto/);
    }
  });

  it("a escada sobe: base no Principiante, fecho no Rei", () => {
    expect(patamarDe("tiro-perfeito")).toBe("Principiante");
    expect(patamarDe("respiracao-contada")).toBe("Principiante");
    expect(patamarDe("etapa-encurtada")).toBe("Intermediário");
    expect(patamarDe("olho-que-ja-viu")).toBe("Avançado");
    expect(patamarDe("ponto-vital-lido")).toBe("Santo");
    expect(patamarDe("preparacao-perfeita")).toBe("Rei");
  });

  it("Etapa Encurtada é o que faz o tiro caber num turno", () => {
    expect(talento("etapa-encurtada").description).toMatch(/4 Ações para 3|de 4 para 3/);
  });

  it("Preparação Perfeita não cobra Ações de novo pelo mesmo tiro", () => {
    const p = habilidade("preparacao-perfeita");
    expect(p.actions.normal).toBe(0);
    expect(p.costNote, "0 Ações num disparo precisa de explicação").toBeTruthy();
  });
});

describe("O Manto de Touki, que é o custo declarado da árvore", () => {
  /*
   * O `mechanic.cost` da Arquearia diz que o Manto é o preço da árvore, e a
   * Maestria do Rei dizia, em letra, que a Flecha de Touki é a única forma de
   * furá-lo. A Preparação Perfeita virou a segunda — e este teste existe pra
   * que as duas frases nunca mais se contradigam sem alguém perceber.
   */
  it("a Maestria do Rei reconhece a segunda forma", () => {
    const rei = arquearia.ranks.find((r) => r.rank === "Rei")!;
    expect(rei.mastery).toBeDefined();
    expect(rei.mastery!.description).toMatch(/Preparação Perfeita/);
    expect(rei.mastery!.description, "a promessa antiga tinha que sair").not.toMatch(
      /não existe segunda forma/i
    );
  });

  it("e as duas formas moram no MESMO patamar", () => {
    // Furar o Manto é o capstone do Rei. Uma segunda forma num patamar mais
    // baixo não seria alternativa: seria o capstone chegando cedo.
    expect(patamarDe("preparacao-perfeita")).toBe("Rei");
  });

  it("a segunda forma cobra turnos, não PT", () => {
    const p = habilidade("preparacao-perfeita");
    expect(p.ptCost ?? 0).toBe(0);
    expect(p.effect).toMatch(/sem gastar PT/);
    expect(p.effect).toMatch(/todas as etapas|TODAS as etapas/i);
  });
});
