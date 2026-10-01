"use client";

import { useEffect, useRef, useState } from "react";

/**
 * O vídeo de uma arte que só baixa e toca perto da tela — 2026-09-30.
 *
 * `autoplay` passa por cima de `preload="none"`: com ele, o navegador baixava
 * os seis vídeos do livro (4,9 MB) assim que o folhear abria, mesmo estando a
 * oitenta páginas dali. Aqui o `src` só entra quando o quadro chega a uma tela
 * de distância (no folhear, quando a página vira; no contínuo, na rolagem), e
 * o vídeo pausa quando sai — não gasta dado nem bateria fora de vista.
 */
export default function VideoDaArte({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [perto, setPerto] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver === "undefined") { setPerto(true); return; }
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        setPerto(true);
        video.play().catch(() => { /* o navegador pode adiar o autoplay; o próximo quadro tenta de novo */ });
      } else if (!video.paused) {
        video.pause();
      }
    }, { rootMargin: "100% 100%" });
    observador.observe(video);
    return () => observador.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={perto ? src : undefined}
      aria-label={alt}
      muted
      loop
      playsInline
      autoPlay={perto}
      preload="none"
      className={className}
    />
  );
}
