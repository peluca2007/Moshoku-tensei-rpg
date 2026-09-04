import { describe, expect, it } from "vitest";
import {
  INTERVIEW_OPTION_COUNT,
  INTERVIEW_QUESTION_COUNT,
  INTERVIEW_QUESTIONS,
  drawInterviewQuestions,
} from "./interview";

/**
 * O sorteio da Entrevista.
 *
 * Estes testes existem porque o sorteio é a única parte do site cujo defeito é
 * INVISÍVEL: uma Entrevista que sempre mostra as mesmas quatro respostas parece
 * perfeitamente normal em qualquer print, e só quem fizer a Via 3 duas vezes
 * percebe. Um print não pega isso; rodar cem vezes, pega.
 */
describe("banco de perguntas", () => {
  it("tem 20 perguntas com 6 respostas cada", () => {
    expect(INTERVIEW_QUESTIONS).toHaveLength(20);
    for (const pergunta of INTERVIEW_QUESTIONS) {
      expect(pergunta.options, `pergunta "${pergunta.id}"`).toHaveLength(6);
    }
  });

  it("não repete id de pergunta nem de resposta dentro da pergunta", () => {
    const ids = INTERVIEW_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const pergunta of INTERVIEW_QUESTIONS) {
      const opcoes = pergunta.options.map((o) => o.id);
      expect(new Set(opcoes).size, `pergunta "${pergunta.id}"`).toBe(opcoes.length);
    }
  });

  it("só empurra ids de raça e antecedente que existem", async () => {
    const { RACES } = await import("./races");
    const { BACKGROUNDS } = await import("./backgrounds");
    const racas = new Set(RACES.map((r) => r.id));
    const antecedentes = new Set(BACKGROUNDS.map((b) => b.id));
    for (const pergunta of INTERVIEW_QUESTIONS) {
      for (const opcao of pergunta.options) {
        for (const id of opcao.raceIds ?? []) {
          expect(racas.has(id), `raça "${id}" em ${pergunta.id}/${opcao.id}`).toBe(true);
        }
        for (const id of opcao.backgroundIds ?? []) {
          expect(antecedentes.has(id), `antecedente "${id}" em ${pergunta.id}/${opcao.id}`).toBe(true);
        }
      }
    }
  });
});

describe("drawInterviewQuestions", () => {
  it("entrega 10 perguntas distintas, com 4 respostas cada", () => {
    for (let i = 0; i < 50; i++) {
      const sorteadas = drawInterviewQuestions();
      expect(sorteadas).toHaveLength(INTERVIEW_QUESTION_COUNT);
      expect(new Set(sorteadas.map((q) => q.id)).size).toBe(INTERVIEW_QUESTION_COUNT);
      for (const pergunta of sorteadas) {
        expect(pergunta.options).toHaveLength(INTERVIEW_OPTION_COUNT);
        expect(new Set(pergunta.options.map((o) => o.id)).size).toBe(INTERVIEW_OPTION_COUNT);
      }
    }
  });

  it("mantém as respostas na ordem original do banco", () => {
    // O sorteio decide QUAIS respostas aparecem, não em que ordem: embaralhar a
    // posição faria a lista parecer trocada sem motivo a cada pergunta.
    for (let i = 0; i < 20; i++) {
      for (const pergunta of drawInterviewQuestions()) {
        const original = INTERVIEW_QUESTIONS.find((q) => q.id === pergunta.id)!;
        const posicoes = pergunta.options.map((o) => original.options.findIndex((x) => x.id === o.id));
        expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
      }
    }
  });

  it("ao longo de muitas entrevistas, TODAS as 6 respostas de uma pergunta aparecem", () => {
    // O defeito que este teste pega: um sorteio que sempre entrega as mesmas
    // quatro. Com 4 de 6 e 200 rodadas, cada resposta tem chance esmagadora de
    // sair pelo menos uma vez — se alguma nunca sai, o sorteio não sorteia.
    const vistas = new Map<string, Set<string>>();
    for (let i = 0; i < 200; i++) {
      for (const pergunta of drawInterviewQuestions()) {
        const set = vistas.get(pergunta.id) ?? new Set<string>();
        for (const o of pergunta.options) set.add(o.id);
        vistas.set(pergunta.id, set);
      }
    }
    for (const pergunta of INTERVIEW_QUESTIONS) {
      expect(vistas.get(pergunta.id)?.size, `pergunta "${pergunta.id}"`).toBe(6);
    }
  });

  it("ao longo de muitas entrevistas, TODAS as 20 perguntas aparecem", () => {
    const vistas = new Set<string>();
    for (let i = 0; i < 100; i++) for (const q of drawInterviewQuestions()) vistas.add(q.id);
    expect(vistas.size).toBe(INTERVIEW_QUESTIONS.length);
  });
});
