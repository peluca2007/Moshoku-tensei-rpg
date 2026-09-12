import { ehVideo, midiaDaHabilidade, type MidiaDeHabilidade } from "@/data/midiaDeHabilidade";

/**
 * A arte de uma habilidade, quando existe — 0.1.68.
 *
 * ## As três decisões
 *
 * **Devolve `null` quando não há arte.** A ausência é o caso comum — dezessete
 * das 601 habilidades têm arquivo hoje — e não pode custar layout nenhum: nada
 * de moldura vazia, espaço reservado ou "imagem em breve".
 *
 * **Vídeo entra sem controles, em loop, mudo.** `autoplay muted loop
 * playsinline` é o que faz um `.webm` se comportar como GIF — inclusive no
 * iOS, onde sem o `playsinline` ele abriria em tela cheia sozinho no meio da
 * leitura. Mudo não é escolha estética: navegador nenhum dá autoplay com som, e
 * um vídeo que não toca é um retângulo preto.
 *
 * **`loading="lazy"` e `preload="none"`.** O `/livro` tem 87 mil pixels de
 * rolagem; baixar dezessete arquivos de mídia na abertura pra mostrar um deles
 * três capítulos abaixo é o oposto de um site que funciona offline numa mesa.
 */
export default function ArteDaHabilidade({
  treeId,
  abilityId,
  /** Quando quem chama já tem a mídia (a Maestria), passa direto. */
  midia: midiaDireta,
}: {
  treeId?: string;
  abilityId?: string;
  midia?: MidiaDeHabilidade;
}) {
  const midia = midiaDireta ?? (treeId && abilityId ? midiaDaHabilidade(treeId, abilityId) : undefined);
  if (!midia) return null;

  return (
    /*
     * A ALTURA É FIXA, e não `max-h` — 0.1.69.
     *
     * `loading="lazy"` sem dimensão declarada dá ao `<img>` altura ZERO até o
     * arquivo chegar. Com dezessete artes isso passava; com sessenta, o `/livro`
     * virou um documento que PULA durante a rolagem — o leitor está no meio de
     * um parágrafo e ele salta 280px porque uma imagem três blocos acima acabou
     * de carregar. É o layout shift clássico, e a cura é reservar o espaço antes.
     *
     * Fixa em `h-64` (256px) em vez de um `aspect-ratio` por arquivo porque a
     * lista tem sessenta arquivos de proporção variada e nenhum deles declara
     * dimensão. Uma altura só, com `object-contain` centralizado, reserva certo
     * pra todos e ainda alinha as artes entre si.
     */
    <figure className="relative mt-2 flex h-64 items-center justify-center overflow-hidden rounded-lg border border-gold-500/25 bg-parchment-950">
      {ehVideo(midia.src) ? (
        <video
          src={midia.src}
          aria-label={midia.alt}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="relative z-10 block h-full w-full object-contain"
        />
      ) : (
        <>
          {/*
            O FUNDO É A PRÓPRIA ARTE, BORRADA — 0.1.69.

            `object-contain` numa moldura de altura fixa deixa barras vazias dos
            lados de toda arte que não é panorâmica — e num retrato, como o do
            Escudeiro, as barras ficam maiores que a imagem. Chapadas, elas leem
            como erro de carregamento.

            A mesma imagem em `object-cover`, borrada e escurecida, preenche as
            barras com a cor da própria cena. É o mesmo `src`, então o navegador
            reaproveita o arquivo já baixado: não custa um byte a mais.

            `alt=""` e `aria-hidden` porque é decoração pura — quem usa leitor de
            tela já ouviu a descrição na imagem de cima, e ouvi-la duas vezes é
            pior que não ouvir.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element -- ver abaixo. */}
          <img
            src={midia.src}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- arquivos de
              dimensão desconhecida e variada; o `next/image` exigiria
              width/height declarados por arquivo, e a lista cresce a cada arte
              nova. */}
          <img
            src={midia.src}
            alt={midia.alt}
            loading="lazy"
            decoding="async"
            /*
             * `object-contain`, e não `cover` — 0.1.68.
             *
             * `cover` corta a cena pra preencher a moldura, e o que ele corta é
             * justamente o que a arte tem de interessante: a magia costuma estar
             * no centro alto do quadro, e o recorte comia a metade de cima. A
             * queixa foi "a qualidade tá ruim", e metade disso era enquadramento,
             * não resolução.
             */
            className="relative z-10 block h-full w-full object-contain"
          />
        </>
      )}
    </figure>
  );
}
