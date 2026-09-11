import { describe, expect, it } from "vitest";
import { TREES } from "./trees";
import { getRankDeusForTree } from "./rankDeus";

/*
 * A ausência silenciosa que este teste existe pra impedir.
 *
 * O `PROGRESS.md` registrou, em 2026-09-09, que o Vendaval não tinha quadro de
 * Rank Deus. Tinha. Depois disso, um levantamento de tarefas afirmou que o
 * critério das Três Grandes Escolas do Corpo vivia "só como comentário em
 * rankDeus.ts" e precisava ser escrito no livro. Também não era verdade: os três
 * estão em `GODHOOD_PATH`, com as chaves batendo com os ids das árvores, e o
 * livro os imprime desde sempre.
 *
 * Duas afirmações erradas sobre a mesma coisa, em dois documentos, em dois dias.
 * A causa é a mesma nas duas: dava pra olhar o arquivo e não ver, porque a
 * informação mora em DOIS mapas e o acessor os une. Este teste torna a pergunta
 * "esta árvore tem patamar Divino escrito?" respondível por execução, e não por
 * leitura atenta.
 */
describe("todo patamar Divino está escrito em algum lugar", () => {
  it("as dezenove árvores têm quadro de Rank Deus ou caminho de ascensão", () => {
    const semNada = TREES.filter((t) => !getRankDeusForTree(t.id)).map((t) => t.id);
    expect(semNada).toEqual([]);
  });

  it("cada um tem título e corpo de verdade, não uma casca", () => {
    for (const t of TREES) {
      const entrada = getRankDeusForTree(t.id)!;
      expect(entrada.title.trim().length, t.id).toBeGreaterThan(3);
      expect(entrada.body.length, t.id).toBeGreaterThan(0);
      for (const paragrafo of entrada.body) {
        // O piso é baixo de propósito: o que este teste pega é parágrafo VAZIO
        // ou reticências de rascunho, não prosa curta. A Desintoxicação tem uma
        // frase de 32 caracteres que é exatamente o que ela quer dizer, e um
        // limiar maior reprovaria escrita boa por ser econômica.
        expect(paragrafo.trim().length, `${t.id}: parágrafo vazio`).toBeGreaterThan(15);
      }
    }
  });

  /*
   * As três do Corpo recebem um CAMINHO ("como se toma o título"), não um quadro
   * ("o que o patamar faz"), e isso é deliberado: nelas o Deus é um cargo com
   * um titular vivo, não um nível de poder pessoal. O teste trava a distinção
   * pra que uma delas não ganhe silenciosamente um quadro comum.
   */
  it("as Três Grandes Escolas do Corpo descrevem o caminho até o título", () => {
    for (const id of ["deus-da-espada", "deus-da-agua-corpo", "deus-do-norte"]) {
      const entrada = getRankDeusForTree(id);
      expect(entrada, `${id} perdeu o caminho de ascensão`).toBeTruthy();
      const texto = entrada!.body.join(" ").toLowerCase();
      expect(texto.includes("título") || texto.includes("titular") || texto.includes("cargo"), id).toBe(true);
    }
  });
});
