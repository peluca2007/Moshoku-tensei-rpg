/**
 * A arte do alto da página de abertura de cada capítulo — só no livro
 * folheado (no contínuo a abertura continua sem arte).
 *
 * Provisória: são artes que o projeto já tinha, escolhidas olhando cada uma
 * (nunca pelo nome do arquivo). As definitivas estão pedidas em
 * `ARTE-PARA-O-LIVRO.md`; quando chegarem, troca-se só o `src` aqui.
 * Capítulo sem entrada abre sem arte, só com o título.
 */
export const ARTE_DAS_ABERTURAS: Record<string, { src: string; alt: string }> = {
  // 2026-09-25: as primeiras artes de Mushoku Tensei de verdade, trazidas
  // pelo autor (antes eram fotos genéricas de fantasia).
  cap0: {
    src: "/livro/capitulos/abertura-cap0.webp",
    alt: "O grupo de Mushoku Tensei avançando junto num campo aberto, armas e magias em punho.",
  },
  // 2026-09-26: as ilustrações de volume da light novel que o autor trouxe
  // (catalogadas e recortadas uma a uma; ver ARTE-PARA-O-LIVRO.md).
  cap1: {
    src: "/livro/capitulos/abertura-cap1.webp",
    alt: "Paul, Norn pequena, Rudeus e Eris diante da catedral de Millis.",
  },
  cap2: {
    src: "/livro/capitulos/abertura-cap2.webp",
    alt: "Na Universidade de Ranoa, Rudeus modela uma estatueta por magia enquanto os colegas olham.",
  },
  cap3: {
    src: "/livro/capitulos/abertura-cap3.webp",
    alt: "Os Presas do Lobo Negro reunidos, cada um com o seu estilo: Roxy, Talhand, Geese, Paul, Elinalise, Lilia e Rudeus.",
  },
  cap4: {
    src: "/livro/capitulos/abertura-cap4.webp",
    alt: "O grupo inteiro em combate sobre um círculo mágico azul, Paul gritando de espada em punho.",
  },
  cap5: {
    src: "/livro/capitulos/abertura-cap5.webp",
    alt: "Rudeus e Sylphie na feira da cidade, com Nanahoshi, Cliff e Elinalise ao fundo.",
  },
  apendices: {
    src: "/livro/capitulos/abertura-apendices.webp",
    alt: "Um jantar em família à luz de velas na casa dos Greyrat.",
  },
};

/**
 * A CAPA (2026-09-25, trazida pelo autor): a primeira página do livro. A arte
 * é mais estreita que a página, então entra inteira (a moldura dourada não
 * pode ser cortada), com uma cópia desfocada dela preenchendo as laterais.
 */
export const CAPA = {
  src: "/livro/capa/capa.webp",
  alt: "A capa: o título Mushoku Tensei RPG numa moldura dourada, e o grupo correndo num trigal ao pôr do sol.",
};

/** A arte da folha de rosto do livro. */
export const ARTE_DA_FOLHA_DE_ROSTO = {
  src: "/livro/capa/guarda.webp",
  alt: "Um vale com um lago e uma vila, cercado de montanhas nevadas.",
};
