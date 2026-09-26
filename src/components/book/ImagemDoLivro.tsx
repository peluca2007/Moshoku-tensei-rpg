import type { Arte } from "./arteDasRacas";

/**
 * Uma arte do livro dentro do quadro dela (2026-09-25).
 *
 * "cheia" preenche o quadro. "inteira" põe a arte inteira no meio, com uma
 * cópia desfocada e escurecida dela por trás preenchendo as sobras — o jeito
 * de uma arte em pé caber num quadro deitado sem cortar a cabeça de ninguém,
 * e de uma arte pequena não ser esticada até borrar (ver `enquadrar`).
 */
export default function ImagemDoLivro({
  arte,
  alt,
  modo,
  className = "",
  posicao,
}: {
  arte: Arte;
  alt: string;
  modo: "cheia" | "inteira";
  className?: string;
  /** `object-position` da arte cheia (onde está o rosto). */
  posicao?: string;
}) {
  if (modo === "cheia") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arte impressa no papel; o tamanho vem do quadro.
      <img
        src={arte.src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
        style={posicao ? { objectPosition: posicao } : undefined}
      />
    );
  }
  return (
    <span className="livro-imagem-inteira" data-moldura="inteira">
      {/* eslint-disable-next-line @next/next/no-img-element -- o fundo desfocado da mesma arte. */}
      <img src={arte.src} alt="" aria-hidden loading="lazy" decoding="async" className="livro-imagem-fundo" />
      {/* eslint-disable-next-line @next/next/no-img-element -- a arte inteira. */}
      <img src={arte.src} alt={alt} loading="lazy" decoding="async" className="livro-imagem-frente" />
    </span>
  );
}
