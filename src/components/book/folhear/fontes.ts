import { Barlow_Condensed, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";

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

/*
 * A voz GRITADA: números de capítulo, títulos de seção, carimbos, cabeçalho
 * de tabela. Condensada e pesada, em caixa alta — a coragem gráfica dos
 * livros de Vampiro e Mörk Borg, que o autor pôs como referência de livro
 * com identidade.
 */
const grito = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-livro-grito",
  display: "swap",
});

/** As variáveis das três, pra entrar no `className` da raiz do livro. */
export const FONTES_DO_LIVRO = [titulos, rotulos, grito].map((f) => f.variable).join(" ");
