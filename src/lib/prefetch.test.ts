import { describe, expect, it } from "vitest";
import { prefetchDe } from "./prefetch";

describe("prefetchDe", () => {
  it("o livro, as novidades e a capa não são pré-baixados", () => {
    for (const h of ["/", "/livro", "/livro#cap5-2", "/livro/folhear", "/livro?x=1", "/novidades"]) {
      expect(prefetchDe(h)).toBe(false);
    }
  });

  it("o resto fica no padrão do Next", () => {
    for (const h of ["/ficha", "/arvores", "/livros-antigos", "/loja", "/busca?q=livro"]) {
      expect(prefetchDe(h)).toBeUndefined();
    }
  });
});
