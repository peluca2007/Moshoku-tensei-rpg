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
  cap0: {
    src: "/faixas/convite.jpg",
    alt: "Um grupo de aventureiros entrando numa masmorra à luz de tocha.",
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

/** A arte da folha de rosto do livro. */
export const ARTE_DA_FOLHA_DE_ROSTO = {
  src: "/paisagem.jpg",
  alt: "Um vale com um lago e uma vila, cercado de montanhas nevadas.",
};
