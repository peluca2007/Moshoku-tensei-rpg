import type { CSSProperties } from "react";
import { identidadeVisualDaArvore } from "@/data/identidadeDasArvores";
import styles from "./Carimbo.module.css";

/**
 * O carimbo de uma árvore (2026-10-07): o selo de `identidadeDasArvores.ts`
 * escrito a pincel numa moldura de hanko, desenhado em `public/livro/carimbos.svg`
 * por `scripts/gerar-carimbos.mjs`. Um arquivo só pra todas as árvores (~22 KB
 * comprimido), guardado em cache depois da primeira vez.
 *
 * A moldura diz o pilar: Magia redonda, Corpo quadrada, Utilidade comprida.
 * A cor é a da árvore — a noturna no papel escuro, a de tinta no claro e na
 * impressão. É o substituto dos ícones de banco de imagem, que tinham outro
 * estilo do resto do livro.
 */
export default function Carimbo({
  treeId,
  tamanho = 48,
  titulo,
  className = "",
}: {
  treeId: string;
  tamanho?: number;
  /** Com título, o carimbo é imagem; sem, é enfeite e o leitor de tela pula. */
  titulo?: string;
  className?: string;
}) {
  const identidade = identidadeVisualDaArvore(treeId);
  const estilo = {
    "--cor-noite": identidade?.corNoite ?? "currentColor",
    "--cor-dia": identidade?.corDia ?? "currentColor",
  } as CSSProperties;
  return (
    <svg
      viewBox="0 0 100 100"
      width={tamanho}
      height={tamanho}
      className={`${styles.carimbo} ${className}`}
      style={estilo}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      <use href={`/livro/carimbos.svg#carimbo-${treeId}`} />
    </svg>
  );
}
