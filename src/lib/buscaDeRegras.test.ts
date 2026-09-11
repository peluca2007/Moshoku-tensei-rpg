import { describe, expect, it } from "vitest";
import { buscar, INDICE_BUSCA } from "./busca";
import { SUMARIO_DO_LIVRO } from "@/data/sumarioDoLivro";

/**
 * As regras que não são ficha de nada — 0.1.60.
 *
 * ## O buraco
 *
 * O índice da busca cobria habilidade, talento, maestria, magia combinada,
 * árvore, item, raça, antecedente, perícia e criatura. Ou seja: tudo que é
 * **ficha de alguma coisa**.
 *
 * As regras que não são ficha de nada — o Dado de Arma, o Touki, a Preparação
 * em Etapas, os Grupos de Arma, os Dojos, o Fio da Vida — eram invisíveis. E
 * são metade do livro.
 *
 * O sintoma que achou isto foi concreto: procurar **"Dojo"** devolvia *"Nada no
 * livro fala em Dojo"*, com a §5 do Cap. 5 inteira falando nisso.
 *
 * ## O que estes testes travam
 *
 * Não o ranking — esse é de gosto e muda. O que eles travam é a **cobertura**:
 * que toda seção do sumário esteja no índice, e que as regras grandes do livro
 * sejam achaveis pelo nome com que a mesa as chama.
 */

/** Achata o sumário: capítulos e seções, na mesma lista. */
function todasAsSecoes() {
  return SUMARIO_DO_LIVRO.flatMap((cap) => [cap, ...(cap.children ?? [])]);
}

describe("Cobertura", () => {
  it("toda seção do sumário virou um documento de busca", () => {
    const indexadas = new Set(
      INDICE_BUSCA.filter((d) => d.tipo === "secao").map((d) => d.chave.replace("secao:", ""))
    );
    const faltando = todasAsSecoes()
      .map((s) => s.id)
      .filter((id) => !indexadas.has(id));
    expect(faltando, `seções fora do índice: ${faltando.join(", ")}`).toEqual([]);
  });

  it("cada uma aponta pro trecho certo do livro", () => {
    for (const d of INDICE_BUSCA.filter((x) => x.tipo === "secao")) {
      expect(d.href, d.nome).toBe(`/livro#${d.chave.replace("secao:", "")}`);
    }
  });

  /*
   * O travessão abre os sub-subtítulos no sumário ("— Quem pode ensinar"). Ali
   * ele é marca de indentação; num resultado de busca seria ruído.
   */
  it("o travessão de indentação não vaza pro nome do resultado", () => {
    for (const d of INDICE_BUSCA.filter((x) => x.tipo === "secao")) {
      expect(d.nome.startsWith("—"), d.nome).toBe(false);
    }
  });
});

describe("O que a mesa procura", () => {
  /*
   * O caso que abriu esta versão. "Dojo" dava zero, e o Dojo é uma seção
   * inteira do Cap. 5.
   */
  it('"Dojo" acha os Dojos e Mestres', () => {
    const r = buscar("Dojo");
    expect(r.length, "não pode dar zero").toBeGreaterThan(0);
    expect(r.some((x) => x.doc.tipo === "secao" && /Dojos e Mestres/i.test(x.doc.nome))).toBe(true);
  });

  /*
   * Estes seis são os sistemas que o livro explica em prosa e que nenhuma
   * habilidade "é". Se um deles sumir daqui, a regra voltou a ser invisível.
   */
  it.each([
    ["Dojos", /Dojos e Mestres/i],
    ["Tiro Perfeito", /Tiro Perfeito/i],
    ["Dado de Arma", /Dado de Arma/i],
    ["Touki", /Touki/i],
    ["Proficiências", /Profici[êe]ncias/i],
    ["Triângulo dos Estilos", /Tri[âa]ngulo/i],
  ])("a regra '%s' é achável pelo nome", (termo, esperado) => {
    const achou = buscar(termo).some((x) => x.doc.tipo === "secao" && esperado.test(x.doc.nome));
    expect(achou, `"${termo}" não achou a seção`).toBe(true);
  });
});

describe("Sem regressão no que já funcionava", () => {
  /*
   * Acrescentar ~70 documentos ao índice pode empurrar pra baixo o que já era
   * achado. Estes três são os casos mais usados da mesa, e eles precisam
   * continuar vindo do tipo certo.
   */
  it("uma magia continua achando a magia, e não só a seção", () => {
    expect(buscar("Sol Menor").some((x) => x.doc.tipo === "habilidade")).toBe(true);
  });

  it("um item continua achando o item", () => {
    expect(buscar("Katana").some((x) => x.doc.tipo === "item")).toBe(true);
  });

  it("uma condição continua achando quem a aplica", () => {
    expect(buscar("Envenenado").some((x) => x.doc.tipo === "habilidade")).toBe(true);
  });
});
