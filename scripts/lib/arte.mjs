/**
 * ONDE MORA A ARTE — 0.1.74.
 *
 * ## Por que existe
 *
 * Até a 0.1.73 os ~120 arquivos de arte ficavam soltos na raiz de `public/`,
 * misturados com o cromo do site (ícone do PWA, logo, capa da home, service
 * worker). Achar "a arte do Deus do Norte" era ler a pasta inteira de cima a
 * baixo, e todo script que varria `public/` precisava de uma lista de exceções
 * escrita à mão (`NAO_E_ARTE`, `IGNORAR`) pra não tratar o ícone do PWA como
 * arte esquecida — lista que, esquecida, produz aviso falso.
 *
 * Agora a arte mora em `public/arte/<arvore>/<habilidade>.<ext>`, espelhando o
 * livro: a pasta de uma árvore é o catálogo visual dela. A arte que ilustra uma
 * SEÇÃO do livro (o Dojo, o Touki, o Fio da Vida) fica em `public/arte/livro/`,
 * porque não pertence a árvore nenhuma.
 *
 * A raiz de `public/arte/` é a **caixa de entrada**: arquivo recém-baixado cai
 * ali e o `check:midia` o lista como sem destino até alguém mapeá-lo — e o mapa
 * é o que decide em qual pasta de árvore ele vai morar.
 *
 * O cromo do site continua na raiz de `public/`, onde o manifesto e o
 * `<Logo>` o procuram. Por isso nenhum script daqui precisa mais de lista de
 * exceção: o que está em `public/arte/` é arte, e ponto.
 */
import { readdirSync } from "node:fs";
import path from "node:path";

export const PUBLIC = path.join(process.cwd(), "public");
export const PASTA_DA_ARTE = path.join(PUBLIC, "arte");

export const EXTENSOES_DE_ARTE = /\.(webp|gif|webm|mp4|png|jpe?g|avif)$/i;

/**
 * Todo arquivo de arte, como caminho relativo a `public/arte/` com a barra
 * interna sempre `/` — `agua/bola-de-agua.webp`, `livro/dojo.webp`. É a forma
 * que vira URL (`/arte/` + isto) e a que vira caminho em disco sem conversão
 * nenhuma no Windows, porque `path.join` aceita as duas barras.
 */
export function listarArte(pasta = PASTA_DA_ARTE, prefixo = "") {
  const fora = [];
  for (const entrada of readdirSync(pasta, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relativo = prefixo ? `${prefixo}/${entrada.name}` : entrada.name;
    if (entrada.isDirectory()) fora.push(...listarArte(path.join(pasta, entrada.name), relativo));
    else if (EXTENSOES_DE_ARTE.test(entrada.name)) fora.push(relativo);
  }
  return fora;
}

/** A URL pública de um arquivo listado por `listarArte`. */
export function urlDaArte(relativo) {
  return `/arte/${relativo}`;
}
