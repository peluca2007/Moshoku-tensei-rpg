import { Barlow, Barlow_Condensed } from "next/font/google";

/**
 * As letras do livro.
 *
 * ## Por que não mais fontes japonesas (2026-09-25)
 *
 * Os títulos eram Shippori Mincho e os rótulos Zen Kaku Gothic. As duas são
 * fontes japonesas, e o Google as serve fatiadas em centenas de pedaços por
 * faixa de caractere: o livro chegava a baixar 366 arquivos de fonte (medido)
 * só pra desenhar travessões, aspas e meia dúzia de kanji — segundos de
 * carregamento antes da primeira página aparecer.
 *
 * Agora:
 * - a voz GRITADA (números, títulos de seção, carimbos, tabelas) é a Barlow
 *   Condensed, e os rótulos miúdos a Barlow, da mesma família;
 * - a voz ELEGANTE (subtítulos, nomes de habilidade) é a Fraunces, que o
 *   site já carrega (--font-fraunces, no layout) — custo zero;
 * - o corpo continua em Literata, também já carregada pelo site;
 * - os kanji (selos, capítulos na vertical, marcas d'água) usam a fonte
 *   japonesa do próprio sistema (Yu Mincho no Windows, Hiragino no iPhone,
 *   Noto no Android), ver --font-livro-kanji no folhear.css.
 */
const rotulos = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
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

/** As variáveis das fontes do livro, pra entrar no `className` da raiz. */
export const FONTES_DO_LIVRO = [rotulos, grito].map((f) => f.variable).join(" ");
