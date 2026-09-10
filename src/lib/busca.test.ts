import { describe, expect, it } from "vitest";
import { buscar, contarPorTipo, INDICE_BUSCA, termosDe, TIPO_ORDEM, trechoQueCasa } from "./busca";

describe("índice", () => {
  it("cobre os dez tipos", () => {
    for (const tipo of TIPO_ORDEM) {
      expect(INDICE_BUSCA.some((d) => d.tipo === tipo), `nenhum documento do tipo ${tipo}`).toBe(true);
    }
  });

  it("não tem chave repetida", () => {
    const chaves = INDICE_BUSCA.map((d) => d.chave);
    expect(new Set(chaves).size).toBe(chaves.length);
  });

  it("todo documento tem nome, contexto e destino", () => {
    for (const d of INDICE_BUSCA) {
      expect(d.nome.trim().length, d.chave).toBeGreaterThan(0);
      expect(d.contexto.trim().length, d.chave).toBeGreaterThan(0);
      expect(d.href.startsWith("/"), d.chave).toBe(true);
    }
  });

  /*
   * A régua do item 10 do O-QUE-FALTA: "601 habilidades". O número exato vai
   * mudar quando o livro crescer — o que este teste trava é a ORDEM de grandeza,
   * pra que um erro de import (uma árvore que sumiu do TREES, um data/ vazio)
   * não passe como uma busca que simplesmente não acha nada.
   */
  it("indexa o livro inteiro, não um pedaço", () => {
    expect(INDICE_BUSCA.length).toBeGreaterThan(600);
  });
});

describe("buscar", () => {
  it("ignora acento e caixa nos dois lados", () => {
    const comAcento = buscar("Perícia").map((r) => r.doc.chave);
    const sem = buscar("pericia").map((r) => r.doc.chave);
    expect(sem).toEqual(comAcento);
    expect(sem.length).toBeGreaterThan(0);
  });

  it("acha pelo nome exato antes de qualquer outra coisa", () => {
    const primeiro = buscar("Furtividade")[0];
    expect(primeiro.doc.nome).toBe("Furtividade");
    expect(primeiro.doc.tipo).toBe("pericia");
  });

  it("acha pelo TEXTO da regra, e não só pelo título", () => {
    // O caso escrito no O-QUE-FALTA: "qual magia aplica Envenenado".
    const envenenado = buscar("envenenado");
    expect(envenenado.length).toBeGreaterThan(0);
    // Se todos os resultados tivessem a palavra no nome, a busca por texto não
    // estaria acontecendo — estaria só filtrando títulos, que é o que já existia.
    expect(envenenado.some((r) => r.soNoCorpo)).toBe(true);
  });

  it("dois termos estreitam em vez de somar", () => {
    const um = buscar("fogo");
    const dois = buscar("fogo cura");
    expect(dois.length).toBeLessThan(um.length);
    for (const r of dois) {
      const texto = `${r.doc.nomeNorm} ${r.doc.contextoNorm} ${r.doc.corpoNorm}`;
      expect(texto).toContain("fogo");
      expect(texto).toContain("cura");
    }
  });

  it("consulta vazia não devolve o índice inteiro", () => {
    expect(buscar("")).toEqual([]);
    expect(buscar("   ")).toEqual([]);
  });

  it("o filtro de tipo corta o resto", () => {
    const so = buscar("fogo", new Set(["item" as const]));
    expect(so.length).toBeGreaterThan(0);
    expect(so.every((r) => r.doc.tipo === "item")).toBe(true);
  });

  it("nome vale mais que menção no texto", () => {
    const r = buscar("peçonha");
    expect(r.length).toBeGreaterThan(1);
    // O primeiro tem que ser algo CHAMADO Peçonha, não algo que a cita de passagem.
    expect(r[0].doc.nomeNorm).toContain("peconha");
    expect(r[0].pontos).toBeGreaterThan(r[r.length - 1].pontos);
  });

  it("vem ordenado do mais forte pro mais fraco", () => {
    const pontos = buscar("fogo").map((r) => r.pontos);
    expect([...pontos].sort((a, b) => b - a)).toEqual(pontos);
  });
});

describe("contarPorTipo", () => {
  it("as contagens somam o total da busca sem filtro", () => {
    const contagem = contarPorTipo("fogo");
    const soma = TIPO_ORDEM.reduce((t, tipo) => t + contagem[tipo], 0);
    expect(soma).toBe(buscar("fogo").length);
  });
});

describe("trechoQueCasa", () => {
  it("devolve a frase onde o termo está, e não o começo do texto", () => {
    const corpo = "Uma primeira frase qualquer. A segunda fala em Envenenado. Uma terceira.";
    expect(trechoQueCasa(corpo, termosDe("envenenado"))).toBe("A segunda fala em Envenenado.");
  });

  it("acha mesmo com acento no texto e sem acento na consulta", () => {
    expect(trechoQueCasa("A Peçonha se acumula.", termosDe("peconha"))).toBe("A Peçonha se acumula.");
  });

  it("não corta a frase numa abreviação", () => {
    const corpo = "Peçonha de Serpente-do-Pântano (Cap. 4, §8). Outra frase.";
    expect(trechoQueCasa(corpo, termosDe("peconha"))).toBe("Peçonha de Serpente-do-Pântano (Cap. 4, §8).");
  });

  it("devolve null quando nada casa", () => {
    expect(trechoQueCasa("Nada a ver.", termosDe("dragão"))).toBeNull();
    expect(trechoQueCasa("", termosDe("dragão"))).toBeNull();
  });

  it("corta frase longa demais pra caber numa linha de resultado", () => {
    const longa = `${"palavra ".repeat(60)}alvo.`;
    const trecho = trechoQueCasa(longa, termosDe("alvo"));
    expect(trecho).not.toBeNull();
    expect(trecho!.length).toBeLessThanOrEqual(220);
    expect(trecho!.endsWith("…")).toBe(true);
  });
});
