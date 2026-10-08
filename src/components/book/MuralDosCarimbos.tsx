import type { CSSProperties } from "react";
import { TREES } from "@/data/trees";
import CarimboQueCai from "./CarimboQueCai";
import styles from "./MuralDosCarimbos.module.css";

const PILARES = [
  { id: "magia", nome: "Magia", recurso: "PM" },
  { id: "corpo", nome: "Corpo", recurso: "PT" },
  { id: "utilidade", nome: "Utilidade", recurso: "PP" },
] as const;

/** Um número fixo por árvore, pra o mural sair igual em toda visita e na impressão. */
function sorte(texto: string, salto: number): number {
  let h = 2166136261 ^ salto;
  for (const c of texto) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * O MURAL DOS CARIMBOS (Cap. 3, "O Mapa Completo das Árvores") — 2026-10-07.
 *
 * Pedido do autor: "bem caótico visualmente na parte que aparece as 19 árvores…
 * caos, mas foda e não tão caos assim; estamos num site, aproveita animação".
 *
 * As 19 árvores como carimbos batidos às pressas numa folha: tortos, um por
 * cima do outro, agrupados por pilar sobre o caos da família (o mesmo desenho
 * das bordas das páginas, já em cache). Quando o mural aparece, os carimbos
 * caem um a um. Cada um leva ao catálogo da árvore e, no hover, mostra o que
 * representa. A ordem de leitura continua sendo a da tabela logo abaixo, que
 * diz tudo em texto: o mural é a porta, não a fonte.
 */
export default function MuralDosCarimbos() {
  let ordem = 0;
  return (
    <nav className={`livro-vitrine livro-vitrine-arvores ${styles.moldura}`} aria-label="As 19 árvores, por pilar">
    <div className={styles.mural} role="list">
      {PILARES.map((pilar) => {
        const arvores = TREES.filter((t) => t.category === pilar.id);
        return (
          <div
            key={pilar.id}
            role="listitem"
            className={styles.pilar}
            style={{ "--caos": `url("/livro/caos/familia-${pilar.id}.svg")` } as CSSProperties}
          >
            <span className={styles.rotulo}>
              {pilar.nome} <small>{arvores.length} · {pilar.recurso}</small>
            </span>
            <div className={styles.carimbos}>
              {arvores.map((t) => {
                const i = ordem++;
                const giro = Math.round((sorte(t.id, 1) - 0.5) * 44);
                const tamanho = 54 + Math.round(sorte(t.id, 2) * 22);
                const desce = Math.round((sorte(t.id, 3) - 0.5) * 26);
                return (
                  <span key={t.id} className={styles.lugar} style={{ marginTop: `${desce}px` }}>
                    <CarimboQueCai
                      treeId={t.id}
                      tamanho={tamanho}
                      giro={giro}
                      atraso={i * 55}
                      href={`#arvore-${t.id}`}
                      nome={t.name}
                      mecanica={t.mechanic?.tag}
                      frase={t.mechanic?.hook}
                    />
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
    </nav>
  );
}
