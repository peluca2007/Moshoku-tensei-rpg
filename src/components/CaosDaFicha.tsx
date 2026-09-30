import { CSSProperties, memo } from "react";
import { identidadeVisualDaArvore } from "@/data/identidadeDasArvores";
import { PesoDeArvoreNaFicha } from "@/lib/identidadeDaFicha";
import styles from "./CaosDaFicha.module.css";

type VariaveisCss = CSSProperties & Record<`--${string}`, string | number>;

export interface PulsoDoCaos {
  treeId: string;
  sequencia: number;
}

const VARIANTES = ["0%", "50%", "100%"] as const;

/** Cada árvore conserva a mesma das três páginas do SVG entre renderizações. */
function varianteDaArvore(treeId: string) {
  const soma = Array.from(treeId).reduce((total, caractere) => total + caractere.codePointAt(0)!, 0);
  return VARIANTES[soma % VARIANTES.length];
}

function estiloDaCamada(treeId: string, peso: number): VariaveisCss {
  const identidade = identidadeVisualDaArvore(treeId);
  return {
    "--caos": `url("/livro/caos/${treeId}.svg")`,
    "--cor-caos-dia": identidade?.corDia ?? "transparent",
    "--cor-caos-noite": identidade?.corNoite ?? "transparent",
    "--densidade": `${Math.round(Math.min(48, 15 + peso * 33))}%`,
    "--variante": varianteDaArvore(treeId),
  };
}

function tintaDaZona({
  treeId,
  peso,
  classe,
  pulso,
  style,
}: {
  treeId: string;
  peso: number;
  classe: string;
  pulso?: PulsoDoCaos | null;
  style?: VariaveisCss;
}) {
  const pulsa = pulso?.treeId === treeId;
  return (
    <span
      key={`${treeId}-${classe}-${pulsa ? pulso.sequencia : 0}`}
      className={`${styles.zona} ${classe}`}
      style={{ ...estiloDaCamada(treeId, peso), ...style }}
    >
      <span className={`${styles.tinta} ${pulsa ? styles.pulso : ""}`} />
    </span>
  );
}

function CaosDaFicha({
  identidades,
  pulso,
}: {
  identidades: PesoDeArvoreNaFicha[];
  pulso?: PulsoDoCaos | null;
}) {
  const dominante = identidades[0];
  const identidadeDominante = dominante ? identidadeVisualDaArvore(dominante.treeId) : undefined;
  if (!dominante || !identidadeDominante) return null;

  return (
    <div className={styles.caos} aria-hidden="true" data-caos-da-ficha={dominante.treeId}>
      {tintaDaZona({
        ...dominante,
        classe: `${styles.dominante} ${styles.dominanteEsquerda}`,
        pulso,
      })}
      {tintaDaZona({
        ...dominante,
        classe: `${styles.dominante} ${styles.dominanteDireita}`,
        pulso,
      })}
      {identidades.slice(1, 2).map(({ treeId, peso }) =>
        tintaDaZona({ treeId, peso, classe: styles.secundaria, pulso })
      )}
      {identidades.slice(2).map(({ treeId, peso }, indice) =>
        tintaDaZona({
          treeId,
          peso,
          classe: `${styles.respingo} ${indice % 2 ? styles.respingoEsquerdo : styles.respingoDireito}`,
          pulso,
          style: {
            "--topo": `${1.25 + (indice % 3) * 4.25}rem`,
            "--recuo": `${0.5 + Math.floor(indice / 3) * 2.75}rem`,
          },
        })
      )}
      <span
        className={styles.selo}
        style={{
          "--selo-cor-dia": identidadeDominante.corDia,
          "--selo-cor-noite": identidadeDominante.corNoite,
        } as VariaveisCss}
      >
        {identidadeDominante.selo}
      </span>
    </div>
  );
}

export default memo(CaosDaFicha);
