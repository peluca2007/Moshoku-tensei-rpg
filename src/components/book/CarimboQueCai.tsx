"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Carimbo from "../Carimbo";
import styles from "./CarimboQueCai.module.css";

/** O gesto do carimbo no hover: o elemento que a árvore domina, em 0,5 s. */
const GESTO: Record<string, string> = {
  fogo: "chama",
  "punho-de-fogo": "chama",
  agua: "onda",
  "deus-da-agua-corpo": "onda",
  vento: "rajada",
  vendaval: "rajada",
  terra: "tremor",
  "armas-pesadas": "tremor",
  "cavalaria-e-escudos": "tremor",
  "deus-da-espada": "corte",
  "deus-do-norte": "corte",
  arquearia: "corte",
  "furtividade-e-armadilhas": "sombra",
};

const FORA_DO_FLUXO: CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" };

/** Cada carimbo cai uma vez por visita, não a cada vez que volta à tela. */
const jaCairam = new Set<string>();

/**
 * Um carimbo que cai na página quando ela aparece (2026-10-07, Cap. 3).
 *
 * A carimbada é Web Animations sobre `transform` e `opacity` do miolo — nada
 * de atributo nem de tamanho, então a diagramação do modo Livro e o diário
 * dela não sentem nada (mesma regra de `movimentoDoLivro.ts`). Quem pede
 * movimento reduzido, e a impressão, veem o carimbo já no papel.
 *
 * No hover, no foco do teclado ou no toque, ele se endireita, faz o gesto do
 * elemento da árvore e abre o cartão: o nome e a mecânica central, pra o
 * carimbo lembrar o que representa. O texto vem pronto do componente do livro,
 * pra que as 19 árvores não viagem inteiras pro navegador.
 */
export default function CarimboQueCai({
  treeId,
  tamanho = 56,
  giro = 0,
  atraso = 0,
  href,
  nome,
  mecanica,
  frase,
  className = "",
}: {
  treeId: string;
  tamanho?: number;
  /** A inclinação em repouso, em graus: o carimbo nunca cai reto. */
  giro?: number;
  /** Milissegundos depois de aparecer, pra os carimbos de um mural caírem em sequência. */
  atraso?: number;
  href?: string;
  nome?: string;
  mecanica?: string;
  frase?: string;
  className?: string;
}) {
  const miolo = useRef<HTMLSpanElement>(null);
  const tinta = useRef<HTMLSpanElement>(null);
  const chave = `${treeId}-${atraso}-${tamanho}`;

  useEffect(() => {
    const el = miolo.current;
    if (!el || typeof IntersectionObserver === "undefined" || typeof el.animate !== "function") return;
    if (jaCairam.has(chave) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada?.isIntersecting) return;
        io.disconnect();
        jaCairam.add(chave);
        el.animate(
          [
            { opacity: 0, transform: "rotate(14deg) scale(1.75)" },
            { opacity: 1, transform: "rotate(-3deg) scale(.9)", offset: 0.55 },
            { opacity: 1, transform: "rotate(0) scale(1)" },
          ],
          { duration: 460, delay: atraso, easing: "cubic-bezier(.3,.9,.4,1.15)", fill: "backwards" }
        );
        tinta.current?.animate(
          [
            { opacity: 0, transform: "scale(.5)" },
            { opacity: 0.5, transform: "scale(1.4)", offset: 0.35 },
            { opacity: 0, transform: "scale(1.9)" },
          ],
          { duration: 560, delay: atraso + 230, easing: "ease-out", fill: "backwards" }
        );
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [chave, atraso]);

  const estilo = { "--giro": `${giro}deg`, "--tamanho": `${tamanho}px` } as CSSProperties;
  const conteudo = (
    <>
      {/* O lugar do cartão e da tinta vai inline: o livro folheado mede o mural ao
          diagramar, e sem isto, se o CSS chegasse depois, o texto do cartão
          ocuparia espaço e o mural sumiria por "não caber". */}
      <span ref={tinta} className={styles.tinta} style={FORA_DO_FLUXO} aria-hidden="true" />
      <span ref={miolo} className={styles.miolo}>
        <span className={`${styles.gesto} ${styles[GESTO[treeId] ?? "pulso"]}`}>
          <Carimbo treeId={treeId} tamanho={tamanho} titulo={href ? undefined : nome} />
        </span>
      </span>
      {nome && (mecanica || frase) && (
        <span className={styles.cartao} style={{ ...FORA_DO_FLUXO, top: "auto", bottom: "100%", opacity: 0 }} role="tooltip">
          <b>{nome}</b>
          {mecanica && <span className={styles.mecanica}>{mecanica}</span>}
          {frase && <span className={styles.frase}>{frase}</span>}
        </span>
      )}
    </>
  );

  return href ? (
    <a href={href} className={`${styles.carimbo} ${className}`} style={estilo} aria-label={nome}>
      {conteudo}
    </a>
  ) : (
    <span className={`${styles.carimbo} ${className}`} style={estilo} tabIndex={nome && mecanica ? 0 : undefined}>
      {conteudo}
    </span>
  );
}
