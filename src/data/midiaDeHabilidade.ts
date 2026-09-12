/**
 * A ARTE DE CADA HABILIDADE — 0.1.68.
 *
 * ## O que é
 *
 * Um mapa de `treeId/abilityId` para um arquivo em `public/`. Quando existe
 * arte, a habilidade a mostra — no livro, no catálogo de árvores e no detalhe
 * da ficha. Quando não existe, nada muda: a ausência é o caso comum e não pode
 * custar layout nenhum.
 *
 * ## Por que um mapa, e não um campo na habilidade
 *
 * Porque arte **não é regra**. `src/data/trees/*.ts` é a fonte de verdade do
 * sistema — o que o `check:livro`, o `check:texto` e o simulador leem. Um campo
 * `imagem` ali misturaria "o que esta magia faz" com "que arquivo ilustra ela",
 * e as duas coisas mudam por motivos completamente diferentes: a regra muda num
 * balanceamento, a arte muda quando alguém acha um arquivo melhor.
 *
 * Separado, este arquivo pode crescer até as 601 habilidades sem tocar numa
 * linha de regra.
 *
 * ## Vídeo, GIF e imagem
 *
 * Os três convivem. O tipo é decidido pela extensão, e não por um campo: `.webm`
 * vira `<video>` com `autoplay muted loop playsinline`, o resto vira `<img>`.
 * Um `.gif` é imagem pro navegador e anima sozinho.
 */

export interface MidiaDeHabilidade {
  /** O caminho em `public/`, com a barra inicial. */
  src: string;
  /**
   * O que a arte mostra, pra quem não a vê.
   *
   * Não é o nome da magia — esse já está ao lado, e repeti-lo faz o leitor de
   * tela dizer a mesma coisa duas vezes. É a CENA.
   */
  alt: string;
}

/**
 * A chave é `treeId/abilityId`.
 *
 * As duas partes juntas porque `id` de habilidade só é único dentro da árvore:
 * há mais de uma "Investida" no livro, em árvores diferentes.
 */
export const MIDIA_DE_HABILIDADE: Record<string, MidiaDeHabilidade> = {
  /*
   * A MAESTRIA de uma árvore usa a chave `treeId/maestria` — 0.1.68.
   *
   * A maestria não tem `id` próprio no livro (ela é um campo do patamar, não
   * uma entrada comprável), então a chave é fixa. Ela é o melhor lugar pra arte
   * que representa a ESCOLA inteira em vez de uma magia específica: é o que o
   * leitor vê primeiro ao abrir a árvore.
   */
  "agua/maestria": {
    src: "/waterfall.webm",
    alt: "Água caindo em volume, movendo-se sozinha — a escola inteira em uma cena.",
  },

  // --- Magia de Água -------------------------------------------------------
  "agua/bola-de-agua": {
    src: "/Bola-de-agua.webp",
    alt: "Uma esfera de água comprimida girando sobre a palma da mão.",
  },
  "agua/escudo-de-agua": {
    src: "/escudo-de-agua.webp",
    alt: "Uma parede curva de água erguida na frente do conjurador.",
  },
  "agua/canhao-de-agua": {
    src: "/water cannion.webm",
    alt: "Um jato de água comprimida disparado em linha reta.",
  },
  "agua/pilar-de-gelo": {
    src: "/ice pilar.webm",
    alt: "Uma coluna de gelo irrompendo do chão.",
  },
  "agua/respingos-de-agua": {
    src: "/water splash.webp",
    alt: "Água espalhando em todas as direções ao redor do ponto de impacto.",
  },
  "agua/enxurrada": {
    src: "/Flood-Flush.webp",
    alt: "Uma corrente de água varrendo o terreno à frente.",
  },
  "agua/quebra-de-gelo": {
    src: "/ice-smash.webp",
    alt: "Uma massa de gelo estilhaçando em cacos afiados.",
  },
  "agua/corte-de-gelo": {
    src: "/Icicle-Edge.webp",
    alt: "Uma lâmina de gelo atravessando o ar.",
  },
  "agua/campo-de-gelo": {
    src: "/Icicle-Field.webp",
    alt: "Estalactites de gelo brotando do solo por toda uma área.",
  },
  "agua/lanca-de-gelo": {
    src: "/Icicle-Break.webp",
    alt: "Uma lança de gelo perfurando e se partindo no impacto.",
  },
  "agua/nevasca": {
    src: "/Blizzard-Storm.webp",
    alt: "Uma tempestade de neve fechando a visão.",
  },
  "agua/tempestade": {
    src: "/squall.webm",
    alt: "Vento e chuva girando numa rajada fechada.",
  },
  "agua/cumulonimbus": {
    src: "/Cumulonimbus.webp",
    alt: "Uma nuvem de tempestade carregada, formando-se acima do campo.",
  },
  "agua/relampago": {
    src: "/Lightning.webp",
    alt: "Um raio caindo do céu carregado.",
  },
  "agua/zero-absoluto": {
    src: "/absolute-zero.gif",
    alt: "Tudo ao redor congelando de uma vez, até o ar parar.",
  },
};

/** A arte desta habilidade, se houver. */
export function midiaDaHabilidade(treeId: string, abilityId: string): MidiaDeHabilidade | undefined {
  return MIDIA_DE_HABILIDADE[`${treeId}/${abilityId}`];
}

/** A arte que representa a ESCOLA inteira, mostrada na Maestria de 1º patamar. */
export function midiaDaMaestria(treeId: string): MidiaDeHabilidade | undefined {
  return MIDIA_DE_HABILIDADE[`${treeId}/maestria`];
}

/** `.webm` e `.mp4` são vídeo; o resto (incluindo `.gif`) é imagem. */
export function ehVideo(src: string): boolean {
  return /\.(webm|mp4)$/i.test(src);
}
