import { Alegreya, Alegreya_SC, Alegreya_Sans, UnifrakturMaguntia } from "next/font/google";

/**
 * As letras do livro impresso.
 *
 * O Livro do Jogador usa três vozes: uma serifada de livro no corpo, versalete
 * nos títulos e uma sem serifa nas caixas laterais e tabelas. A família
 * Alegreya tem as três desenhadas juntas (serifada, SC e Sans), com um traço
 * de pena que combina com fantasia sem virar fonte "de fantasia". A gótica
 * fica só na capitular.
 *
 * Carregadas aqui, e não no layout, pra que só o livro folheado pague por
 * elas. O next/font hospeda os arquivos com o site, então funcionam offline.
 */
const corpo = Alegreya({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-livro",
  display: "swap",
});

const versalete = Alegreya_SC({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-livro-sc",
  display: "swap",
});

const semSerifa = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-livro-sans",
  display: "swap",
});

const gotica = UnifrakturMaguntia({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-livro-gotica",
  display: "swap",
});

/** As variáveis das quatro, pra entrar no `className` da raiz do livro. */
export const FONTES_DO_LIVRO = [corpo, versalete, semSerifa, gotica].map((f) => f.variable).join(" ");
