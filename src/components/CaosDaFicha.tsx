import { CSSProperties, memo } from "react";
import { identidadeVisualDaArvore } from "@/data/identidadeDasArvores";
import { PesoDeArvoreNaFicha } from "@/lib/identidadeDaFicha";
import styles from "./CaosDaFicha.module.css";

type VariaveisCss = CSSProperties & Record<`--${string}`, string | number>;

function estiloDaCamada(treeId: string, peso: number, indice: number): VariaveisCss {
  return {
    "--caos": `url("/livro/caos/${treeId}.svg")`,
    "--opacidade": Math.min(0.38, 0.035 + peso * 0.34).toFixed(3),
    "--escala": `${Math.round(480 - Math.min(1, peso) * 120)}px`,
    "--deslocamento": `${indice * 43}px`,
  };
}

function CaosDaFicha({ identidades }: { identidades: PesoDeArvoreNaFicha[] }) {
  const dominante = identidades[0];
  const identidadeDominante = dominante ? identidadeVisualDaArvore(dominante.treeId) : undefined;
  if (!dominante || !identidadeDominante) return null;

  return (
    <div className={styles.caos} aria-hidden="true" data-caos-da-ficha={dominante.treeId}>
      {identidades.map(({ treeId, peso }, indice) => (
        <div key={treeId}>
          <span
            className={`${styles.borda} ${styles.bordaEsquerda}`}
            style={estiloDaCamada(treeId, peso, indice)}
          />
          <span
            className={`${styles.borda} ${styles.bordaDireita}`}
            style={estiloDaCamada(treeId, peso, indice + 1)}
          />
          <span className={styles.cabecalho} style={estiloDaCamada(treeId, peso, indice)} />
        </div>
      ))}
      <span className={styles.selo}>{identidadeDominante.selo}</span>
    </div>
  );
}

export default memo(CaosDaFicha);
