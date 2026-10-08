import type { CSSProperties, ReactNode } from "react";
import { TREES } from "@/data/trees";
import CarimboQueCai from "./CarimboQueCai";
import styles from "./Pilar.module.css";

const PILARES = {
  magia: { titulo: "A Árvore da Magia", nome: "Magia", recurso: "PM", jp: "魔" },
  corpo: { titulo: "A Árvore do Corpo", nome: "Corpo", recurso: "PT", jp: "闘" },
  utilidade: { titulo: "A Árvore de Utilidade", nome: "Utilidade", recurso: "PP", jp: "道" },
} as const;

export type IdDoPilar = keyof typeof PILARES;

/**
 * A ENTRADA DE UM PILAR no Cap. 3 (2026-10-08, pedido do autor: "melhore o
 * cap 3 visualmente; o principal é a indentação").
 *
 * "A Árvore do Corpo — Sistemas Compartilhados" era um título de seção igual a
 * "Como Ler uma Árvore": no folheado, do tamanho de um subtítulo. O leitor
 * passava de um pilar pro outro sem perceber. Agora cada pilar abre com o
 * kanji dele a pincel (魔 · 闘 · 道), os carimbos das árvores que ele junta e o
 * índice numerado dos sistemas — os mesmos números que os blocos de
 * `Sistema`, logo abaixo, carregam na margem.
 */
export function AberturaDoPilar({
  pilar,
  id,
  sistemas,
  children,
}: {
  pilar: IdDoPilar;
  id: string;
  /** O índice da seção. `n` troca o número (os da Magia seguem os parágrafos do Cap. 2). */
  sistemas: { id: string; nome: string; n?: string }[];
  children?: ReactNode;
}) {
  const p = PILARES[pilar];
  const arvores = TREES.filter((t) => t.category === pilar);
  return (
    <header
      className={`livro-pilar ${styles.abertura}`}
      data-pilar={pilar}
      style={{ "--kanji": `url("/livro/kanji/pilar-${pilar}.svg")` } as CSSProperties}
    >
      <span className={styles.kanji} aria-hidden="true" />
      <p className={styles.rotulo}>
        Pilar · {arvores.length} árvores · recurso {p.recurso}
      </p>
      <h3 id={id} className={`livro-secao-titulo livro-pilar-titulo scroll-mt-24 ${styles.titulo}`}>
        {p.titulo}
        <span className={styles.sub}> — Sistemas Compartilhados</span>
      </h3>
      <div className={styles.carimbos}>
        {arvores.map((t, i) => (
          <CarimboQueCai
            key={t.id}
            treeId={t.id}
            tamanho={30}
            giro={i % 2 ? 9 : -8}
            atraso={i * 60}
            href={`#arvore-${t.id}`}
            nome={t.name}
            mecanica={t.mechanic?.tag}
            frase={t.mechanic?.hook}
          />
        ))}
      </div>
      {children}
      {sistemas.length > 0 && (
        <ol className={`livro-pilar-indice ${styles.indice}`}>
          {sistemas.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                <span className={styles.n}>{s.n ?? i + 1}</span>
                {s.nome}
              </a>
            </li>
          ))}
        </ol>
      )}
    </header>
  );
}

/**
 * UM SISTEMA de um pilar: o número grande na margem e o conteúdo recuado
 * atrás de uma régua da cor do capítulo, até o próximo sistema. É o recuo que
 * diz, de relance, "isto ainda é o Touki" quando a página já virou duas vezes.
 */
export function Sistema({ n, id, titulo, children }: { n: number; id: string; titulo: string; children: ReactNode }) {
  return (
    <div className={`livro-sistema ${styles.sistema}`}>
      <h4 id={id} className={`livro-sistema-titulo scroll-mt-24 ${styles.sistemaTitulo}`}>
        <span className={`livro-sistema-n ${styles.sistemaN}`}>{n}.</span> {titulo}
      </h4>
      <div className={`livro-sistema-corpo ${styles.corpo}`}>{children}</div>
    </div>
  );
}
