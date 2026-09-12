import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as mapa from "./midiaDeHabilidade";
import { ehVideo, MIDIA_DE_HABILIDADE, midiaDaHabilidade } from "./midiaDeHabilidade";
import { TREES } from "./trees";

/**
 * A arte das habilidades — 0.1.68.
 *
 * ## Por que este arquivo existe
 *
 * Um mapa de string pra string é o tipo de dado que apodrece em silêncio: o
 * arquivo é renomeado, a habilidade muda de id num balanceamento, e a arte
 * simplesmente para de aparecer. Ninguém vê um erro — vê uma página sem imagem,
 * que é exatamente como a página era antes.
 *
 * Estes testes fecham as duas pontas: **todo arquivo citado existe em disco**, e
 * **toda habilidade citada existe no livro**.
 */

const PUBLIC = path.join(process.cwd(), "public");

describe("Os arquivos", () => {
  /*
   * O teste que mais importa. Um caminho errado aqui não quebra nada — só
   * apaga a arte, e ninguém nota até alguém perguntar "cadê a imagem".
   */
  it("todo arquivo citado existe em public/", () => {
    const faltando: string[] = [];
    for (const [chave, m] of Object.entries(MIDIA_DE_HABILIDADE)) {
      // O `src` começa com "/" e é relativo a public/.
      if (!existsSync(path.join(PUBLIC, decodeURIComponent(m.src)))) {
        faltando.push(`${chave} → ${m.src}`);
      }
    }
    expect(faltando, `arquivos que não existem:\n${faltando.join("\n")}`).toEqual([]);
  });

  /*
   * O disco espelha o livro — 0.1.74.
   *
   * O caminho canônico é `/arte/<treeId>/<abilityId>.<ext>`, o mesmo par que
   * forma a chave. Sem este teste a organização dura até o próximo arquivo
   * salvo às pressas na raiz: nada quebra, a imagem aparece igual, e em três
   * meses `public/arte/` está do jeito que estava antes da arrumação.
   *
   * A exceção são os arquivos COMPARTILHADOS por duas habilidades de árvores
   * diferentes (a provocação de Cavalaria que serve também ao Deus da Água):
   * o arquivo mora na pasta de quem o trouxe primeiro, e duplicá-lo só pra
   * fazer o caminho bater seria pagar dois downloads pelo mesmo gif. Cada
   * entrada aqui é uma decisão, e o `src` dela tem que ser citado por outra
   * chave — se deixar de ser, o teste cobra.
   */
  const COMPARTILHADOS = new Set(["deus-da-agua-corpo/provocar"]);

  it("todo arquivo está na pasta da própria árvore", () => {
    const fora = Object.entries(MIDIA_DE_HABILIDADE)
      .filter(([chave]) => !COMPARTILHADOS.has(chave))
      .filter(([chave, m]) => m.src !== `/arte/${chave}${path.extname(m.src)}`)
      .map(([chave, m]) => `${chave} → ${m.src}`);
    expect(fora, `esperado /arte/<árvore>/<habilidade>.<ext>:\n${fora.join("\n")}`).toEqual([]);
  });

  it("todo compartilhado aponta pra um arquivo que outra chave também usa", () => {
    for (const chave of COMPARTILHADOS) {
      const alvo = MIDIA_DE_HABILIDADE[chave]?.src;
      expect(alvo, `${chave} está na lista de compartilhados e não existe no mapa`).toBeDefined();
      const donos = Object.entries(MIDIA_DE_HABILIDADE).filter(([, m]) => m.src === alvo);
      expect(donos.length, `${chave} aponta pra ${alvo}, que nenhuma outra chave usa`).toBeGreaterThan(1);
    }
  });

  it("todo caminho começa com barra", () => {
    for (const [chave, m] of Object.entries(MIDIA_DE_HABILIDADE)) {
      expect(m.src.startsWith("/"), chave).toBe(true);
    }
  });

  /*
   * Acento em caminho de URL falha CALADO — 0.1.69.
   *
   * `armadilha de caça.gif` existe em disco, o teste acima passa, e a imagem
   * simplesmente não aparece em parte dos servidores estáticos: o arquivo é
   * gravado em NFC e pedido em NFD (ou o contrário), e os dois nomes não batem
   * byte a byte. Espaço tudo bem — o navegador escapa sozinho, e `/water
   * cannion.webm` funciona desde a 0.1.68. Acento e símbolo, não.
   */
  it("nenhum nome de arquivo tem caractere fora do ASCII", () => {
    const comAcento = Object.entries(MIDIA_DE_HABILIDADE)
      .filter(([, m]) => /[^\x20-\x7E]/.test(m.src))
      .map(([chave, m]) => `${chave} → ${m.src}`);
    expect(comAcento, `renomeie em disco:\n${comAcento.join("\n")}`).toEqual([]);
  });

  /*
   * As artes de SEÇÃO são exports soltos (`ARTE_DO_DOJO`, `ARTE_DO_TOUKI`,
   * `ARTE_LAMINA_DE_TOUKI`, …) porque não ilustram habilidade nenhuma. Listá-las
   * uma a uma neste teste garantiria esquecer a próxima — que é justamente o
   * caso em que o arquivo some e ninguém vê erro. O teste varre o módulo.
   */
  it("toda arte de seção existe em disco", () => {
    const secoes = Object.entries(mapa).filter(
      ([nome, v]) => nome.startsWith("ARTE_") && v && typeof v === "object" && "src" in v
    ) as [string, { src: string; alt: string }][];

    expect(secoes.length, "nenhuma arte de seção encontrada — o prefixo mudou?").toBeGreaterThan(0);

    for (const [nome, arte] of secoes) {
      expect(existsSync(path.join(PUBLIC, arte.src)), `${nome} → ${arte.src}`).toBe(true);
      expect(arte.src.startsWith("/"), nome).toBe(true);
      expect(/[^ -~]/.test(arte.src), `${nome}: acento no caminho`).toBe(false);
      expect(arte.alt.length, `${nome}: alt curto demais`).toBeGreaterThan(20);
    }
  });
});

describe("As habilidades", () => {
  /*
   * A outra ponta: a arte pode sobreviver a uma habilidade que foi renomeada
   * ou removida num ajuste de regra, e aí ela nunca mais aparece.
   */
  it("toda habilidade citada existe no livro", () => {
    const existentes = new Set<string>([
      ...TREES.flatMap((t) => t.ranks.flatMap((r) => (r.abilities ?? []).map((a) => `${t.id}/${a.id}`))),
      // Talento também pode ter arte desde a 0.1.69 — Marcha Forçada é o caso.
      ...TREES.flatMap((t) => t.ranks.flatMap((r) => (r.talents ?? []).map((a) => `${t.id}/${a.id}`))),
    ]);
    /*
     * A chave `treeId/maestria` é legítima e não aponta pra uma habilidade: a
     * Maestria é um campo do patamar, não uma entrada comprável. Ela entra na
     * lista de existentes por outro caminho — a árvore precisa TER maestria no
     * 1º patamar, senão a arte não teria onde aparecer.
     */
    for (const t of TREES) {
      if (t.ranks[0]?.mastery) existentes.add(`${t.id}/maestria`);
    }
    const orfas = Object.keys(MIDIA_DE_HABILIDADE).filter((k) => !existentes.has(k));
    expect(orfas, `arte sem habilidade: ${orfas.join(", ")}`).toEqual([]);
  });

  /*
   * A chave é `treeId/id`, e desde a 0.1.69 o `id` pode ser de talento OU de
   * habilidade. Isso só é seguro enquanto os dois namespaces não colidirem
   * dentro da mesma árvore — se colidirem, a arte de um apareceria no outro, e
   * nada no site diria que está errado.
   */
  it("nenhuma árvore tem talento e habilidade com o mesmo id", () => {
    const colisoes: string[] = [];
    for (const t of TREES) {
      const habilidades = new Set(t.ranks.flatMap((r) => (r.abilities ?? []).map((a) => a.id)));
      for (const r of t.ranks) {
        for (const tal of r.talents ?? []) {
          if (habilidades.has(tal.id)) colisoes.push(`${t.id}/${tal.id}`);
        }
      }
    }
    expect(colisoes, `id disputado por talento e habilidade: ${colisoes.join(", ")}`).toEqual([]);
  });

  it("a busca devolve a arte pela dupla árvore + habilidade", () => {
    expect(midiaDaHabilidade("agua", "bola-de-agua")).toBeDefined();
    expect(midiaDaHabilidade("agua", "nao-existe")).toBeUndefined();
    // A árvore errada NÃO devolve a arte de outra: `id` de habilidade só é
    // único dentro da árvore, e mostrar a arte errada é pior que não mostrar.
    expect(midiaDaHabilidade("fogo", "bola-de-agua")).toBeUndefined();
  });
});

describe("O texto alternativo", () => {
  /*
   * O `alt` descreve a CENA, e não a magia — o nome dela já está ao lado, e
   * repeti-lo faz o leitor de tela dizer a mesma coisa duas vezes seguidas.
   */
  it("nenhum alt é só o nome da habilidade", () => {
    const nomePorChave = new Map<string, string>([
      ...TREES.flatMap((t) =>
        t.ranks.flatMap((r) => (r.abilities ?? []).map((a) => [`${t.id}/${a.id}`, a.name] as const))
      ),
      ...TREES.flatMap((t) =>
        t.ranks.flatMap((r) => (r.talents ?? []).map((a) => [`${t.id}/${a.id}`, a.name] as const))
      ),
    ]);
    for (const [chave, m] of Object.entries(MIDIA_DE_HABILIDADE)) {
      const nome = nomePorChave.get(chave);
      expect(m.alt.trim().toLowerCase(), chave).not.toBe(nome?.toLowerCase());
      expect(m.alt.length, `${chave}: alt curto demais pra descrever a cena`).toBeGreaterThan(20);
    }
  });
});

describe("Vídeo e imagem", () => {
  it(".webm e .mp4 são vídeo; o resto é imagem", () => {
    expect(ehVideo("/x.webm")).toBe(true);
    expect(ehVideo("/x.mp4")).toBe(true);
    // GIF anima sozinho e é imagem pro navegador — pôr num <video> não tocaria.
    expect(ehVideo("/x.gif")).toBe(false);
    expect(ehVideo("/x.webp")).toBe(false);
    expect(ehVideo("/x.png")).toBe(false);
  });
});
