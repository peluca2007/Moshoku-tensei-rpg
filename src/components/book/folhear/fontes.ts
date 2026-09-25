import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";

/**
 * As letras do livro — a voz de um volume de light novel.
 *
 * Mushoku Tensei nasceu light novel, e a identidade do livro vem de lá, não do
 * livro de RPG ocidental: títulos em Shippori Mincho (um mincho japonês, com o
 * contraste fino dos títulos de volume) e rótulos, tabelas e números em Zen
 * Kaku Gothic (o gótico que acompanha o mincho nos livros japoneses). O corpo
 * continua em Literata, que o site já carrega e que foi desenhada pra ler em
 * tela.
 *
 * Carregadas aqui, e não no layout, pra que só o livro folheado pague por
 * elas. O next/font hospeda os arquivos com o site, então funcionam offline.
 */
const titulos = Shippori_Mincho({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800"],
  variable: "--font-livro-titulo",
  display: "swap",
});

const rotulos = Zen_Kaku_Gothic_New({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-livro-rotulo",
  display: "swap",
});

/** As variáveis das duas, pra entrar no `className` da raiz do livro. */
export const FONTES_DO_LIVRO = [titulos, rotulos].map((f) => f.variable).join(" ");
