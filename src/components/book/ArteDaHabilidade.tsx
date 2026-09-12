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
    <figure className="mt-2 overflow-hidden rounded-lg border border-gold-500/25 bg-parchment-950/40">
      {ehVideo(midia.src) ? (
        <video
          src={midia.src}
          aria-label={midia.alt}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="block max-h-72 w-full object-contain"
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- arquivos de
           dimensão desconhecida e variada; o `next/image` exigiria width/height
           declarados por arquivo, e a lista cresce a cada arte nova. */
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
          className="block max-h-72 w-full object-contain"
        />
      )}
    </figure>
  );
}
