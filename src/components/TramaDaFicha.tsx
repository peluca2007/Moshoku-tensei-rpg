import type { CSSProperties } from "react";
import { getTreeById } from "@/data/trees";
import { identidadeVisualDaArvore } from "@/data/identidadeDasArvores";
import type { PesoDeArvoreNaFicha } from "@/lib/identidadeDaFicha";
import TreeCrest from "./TreeCrest";
import styles from "./TramaDaFicha.module.css";

export function coresDaEscola(id: string): CSSProperties {
  const identidade = identidadeVisualDaArvore(id);
  return {
    "--escola-dia": identidade?.corDia,
    "--escola-noite": identidade?.corNoite,
  } as CSSProperties;
}

/** As compras compõem o brasão; nomes e pesos vêm da própria ficha. */
export default function TramaDaFicha({ identidades }: { identidades: PesoDeArvoreNaFicha[] }) {
  if (!identidades.length) return null;
  return (
    <div className={styles.trama} data-trama-da-ficha>
      <div className={styles.filete} aria-hidden="true">
        {identidades.map(({ treeId, peso }) => (
          <span key={treeId} style={{ ...coresDaEscola(treeId), flexGrow: peso }} />
        ))}
      </div>
      <p className={styles.rotulo}>Seu caminho</p>
      <ul className={styles.escolas} aria-label="Árvores que compõem seu personagem">
        {identidades.slice(0, 3).map(({ treeId }, i) => {
          const arvore = getTreeById(treeId);
          const identidade = identidadeVisualDaArvore(treeId);
          if (!arvore || !identidade) return null;
          return (
            <li key={treeId} className={`${styles.escola} ${i === 0 ? styles.dominante : ""}`} style={coresDaEscola(treeId)}>
              {i === 0 ? <TreeCrest tree={arvore} size={32} rounded="rounded-full" /> : <span className={styles.selo} aria-hidden="true">{identidade.selo}</span>}
              <span>{arvore.name}</span>
            </li>
          );
        })}
      </ul>
      {identidades.length > 3 && (
        <details className={styles.outras}>
          <summary>Mais {identidades.length - 3} escolas no seu caminho</summary>
          <ul className={styles.escolas} aria-label="Demais árvores do personagem">
            {identidades.slice(3).map(({ treeId }) => (
              <li key={treeId} className={styles.escola} style={coresDaEscola(treeId)}>
                <span className={styles.selo} aria-hidden>{identidadeVisualDaArvore(treeId)?.selo}</span>
                <span>{getTreeById(treeId)?.name}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
