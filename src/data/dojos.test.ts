import { describe, expect, it } from "vitest";
import {
  LIMITES,
  MARCA_DO_MESTRE,
  PROVACOES,
  RECOMPENSA_POR_PATAMAR,
  REQUISITO_DE_PATAMAR,
} from "@/data/dojos";
import { RANK_REQUIREMENTS, RANKS } from "@/lib/types";

/**
 * O Sistema de Dojo — Cap. 5, §5 (0.1.54).
 *
 * ## Por que a economia daqui precisa de teste
 *
 * O livro nunca disse quanto PA se ganha por quê: só que o personagem começa com
 * **3** e que "PA vem de jogar a campanha". O Dojo é a **primeira fonte de PA
 * declarada em número** do sistema inteiro — e por isso estes valores viram, na
 * prática, a régua com que qualquer concessão futura vai ser comparada.
 *
 * Uma régua que ninguém confere é uma régua que entorta. Os testes abaixo
 * travam as três decisões que sustentam o dilema: a razão entre as duas moedas,
 * o fato de ela escalar com o patamar, e o teto que impede o PA travado de
 * comprar sozinho meia árvore.
 */

/** Quanto PA um personagem tem, por patamar — os números que o playtest usa. */
const PATRIMONIO = { Avançado: 12, Santo: 18, Rei: 24 } as const;

describe("A razão entre as duas moedas", () => {
  /*
   * A proposta original era 3 travados contra 1 livre. Isso não é dilema: é uma
   * conta com resposta óbvia pra qualquer um que pretenda usar a árvore nova.
   * A 2:1 o PA livre volta a competir — ele vale mais por unidade, e vale onde
   * o personagem já tem Bônus de Rank.
   */
  it("nunca passa de 2 travados por 1 livre", () => {
    for (const faixa of RECOMPENSA_POR_PATAMAR) {
      const razao = faixa.travados / faixa.livre;
      expect(razao, `${faixa.patamares[0]}: ${faixa.travados}:${faixa.livre}`).toBeLessThanOrEqual(2);
    }
  });

  it("o travado é sempre maior que o livre — senão não há escolha nenhuma", () => {
    for (const faixa of RECOMPENSA_POR_PATAMAR) {
      expect(faixa.travados, faixa.patamares[0]).toBeGreaterThan(faixa.livre);
    }
  });
});

describe("A escala por patamar", () => {
  /*
   * Um valor fixo vale 25% do patrimônio de um personagem de 3º patamar e 12%
   * do de um de 5º — a mesma provação valendo o dobro pra quem menos precisa
   * dela, e deixando de ser notícia exatamente quando a ficção quer que um
   * mestre seja um evento.
   */
  it("a recompensa cresce com o patamar, nunca encolhe", () => {
    for (let i = 1; i < RECOMPENSA_POR_PATAMAR.length; i++) {
      const antes = RECOMPENSA_POR_PATAMAR[i - 1];
      const agora = RECOMPENSA_POR_PATAMAR[i];
      expect(agora.travados).toBeGreaterThanOrEqual(antes.travados);
      expect(agora.livre).toBeGreaterThanOrEqual(antes.livre);
    }
  });

  it("as faixas cobrem os sete patamares do livro, sem buraco nem repetição", () => {
    const cobertos = RECOMPENSA_POR_PATAMAR.flatMap((r) => r.patamares);
    expect([...cobertos].sort()).toEqual([...RANKS].sort());
    expect(new Set(cobertos).size, "um patamar em duas faixas").toBe(cobertos.length);
  });

  /*
   * O teto que importa: o PA travado não pode, sozinho, comprar uma fatia da
   * árvore nova maior do que quem a escolheu de verdade teve que pagar.
   * Desbloquear Intermediário custa 1 e Avançado 2 — 4 PA travados já são os
   * dois, mais uma habilidade. Acima disso, a provação passaria a valer mais
   * que a decisão de criação de ficha de outro jogador.
   */
  it("o travado nunca compra mais que os três primeiros desbloqueios de rank", () => {
    const tresPrimeiros =
      RANK_REQUIREMENTS.Principiante.paCost +
      RANK_REQUIREMENTS.Intermediário.paCost +
      RANK_REQUIREMENTS.Avançado.paCost;
    for (const faixa of RECOMPENSA_POR_PATAMAR) {
      expect(faixa.travados, faixa.patamares[0]).toBeLessThanOrEqual(tresPrimeiros);
    }
  });

  it("e nunca passa de um quinto do patrimônio de quem a recebe", () => {
    // 12 PA no 3º patamar, 18 no 4º, 24 no 5º. Uma recompensa que passe disso
    // faz a provação valer mais que um patamar inteiro de progressão normal.
    const faixaDe = (r: keyof typeof PATRIMONIO) =>
      RECOMPENSA_POR_PATAMAR.find((f) => (f.patamares as string[]).includes(r))!;
    for (const [rank, pa] of Object.entries(PATRIMONIO)) {
      const f = faixaDe(rank as keyof typeof PATRIMONIO);
      expect(f.travados / pa, `${rank}: ${f.travados} de ${pa} PA`).toBeLessThanOrEqual(0.25);
    }
  });
});

describe("A terceira porta", () => {
  /*
   * Duas quantidades da mesma moeda fazem uma conta, não uma escolha. A Marca
   * existe pra que a terceira porta seja de outra NATUREZA: ela não acelera a
   * ficha, ela muda o que o personagem é no mundo.
   */
  it("a Marca não concede PA nenhum", () => {
    expect(MARCA_DO_MESTRE.texto).toMatch(/Nenhum PA/i);
  });

  it("e paga com uma porta que continua aberta", () => {
    expect(MARCA_DO_MESTRE.texto).toMatch(/voltar ao dojo|segunda provação/i);
  });
});

describe("As travas", () => {
  it("uma provação por árvore, uma vez na vida — senão o Dojo vira farm", () => {
    expect(LIMITES.join(" ")).toMatch(/uma vez na vida/i);
  });

  it("PA travado não destrava", () => {
    expect(LIMITES.join(" ")).toMatch(/nunca destrava/i);
  });

  it("dois patamares de distância, no mínimo", () => {
    expect(REQUISITO_DE_PATAMAR).toBeGreaterThanOrEqual(2);
  });
});

describe("As provações prontas", () => {
  /*
   * O critério do que faz uma provação ser boa, virado em teste: ela tem que
   * TIRAR dos jogadores aquilo em que eles são bons. O Deus do Arco não pediu
   * que o arqueiro atirasse melhor — obrigou o espadachim e o mago a atirar.
   */
  it("toda provação declara o que ela PROÍBE", () => {
    for (const p of PROVACOES) {
      expect(p.quebra.length, p.nome).toBeGreaterThan(40);
      expect(p.quebra, `${p.nome}: a quebra precisa ser uma proibição`).toMatch(
        /não |nenhum|nenhuma|proibid|ninguém|sem /i
      );
    }
  });

  it("nenhum critério de aprovação é 'matou o monstro'", () => {
    for (const p of PROVACOES) {
      expect(p.criterio, p.nome).not.toMatch(/matar|matou|derrotar|derrotou|venceu/i);
    }
  });

  it("toda provação traz uma regra da casa que só vale nela", () => {
    for (const p of PROVACOES) {
      expect(p.regraDaCasa.length, p.nome).toBeGreaterThan(40);
    }
  });

  it("cada uma abre uma coisa diferente", () => {
    const abre = PROVACOES.map((p) => p.abre);
    expect(new Set(abre).size).toBe(abre.length);
  });

  it("o Deus do Arco deixa a Leitura ser rolada com Intuição", () => {
    // A regra da casa dele é exatamente o que ele ensina: não a mira, a
    // previsão — e Intuição é a perícia que o Cap. 1 define como "prever
    // intenção".
    const arco = PROVACOES.find((p) => p.id === "deus-do-arco")!;
    expect(arco.regraDaCasa).toMatch(/INTUIÇÃO/i);
    expect(arco.provacao).toMatch(/Tiro Perfeito/);
  });
});
