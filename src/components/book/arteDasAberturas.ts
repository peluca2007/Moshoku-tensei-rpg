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
  cap1: {
    src: "/livro/capitulos/abertura-cap1.webp",
    alt: "Eris avançando de espada contra Rudeus num salão da mansão.",
  },
  // Era a foto de uma pena desenhando um círculo mágico em pergaminho — o
  // visual do livro antigo, que o autor não quer mais (2026-09-25). O livro
  // mágico aberto, com as runas roxas acesas, é da cor do capítulo.
  cap2: {
    src: "/faixas/livro.jpg",
    alt: "Um livro de magia aberto entre velas, com runas roxas acesas nas páginas.",
  },
  cap4: {
    src: "/faixas/iniciativa.jpg",
    alt: "Cavaleiros em combate numa floresta de inverno.",
  },
  cap5: {
    src: "/faixas/personagens.jpg",
    alt: "O salão de uma taverna à luz de velas, com barris e mesas.",
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
  src: "/paisagem.jpg",
  alt: "Um vale com um lago e uma vila, cercado de montanhas nevadas.",
};
