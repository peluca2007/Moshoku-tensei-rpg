import type { ElementType, ReactNode } from "react";

/**
 * O card do site, em três níveis (0.1.5).
 *
 * Antes daqui a string `rounded-2xl border border-parchment-300 bg-parchment-100/70
 * p-4 shadow-sm dark:…` estava copiada 23 vezes no JSX, e mudar a cara de um
 * card significava mudar 23 arquivos — que é exatamente por que a cara nunca
 * mudava. Aqui ela mora num lugar só.
 *
 * O nível não é decoração, é gramática:
 *
 *   raised  ANUNCIA — cabeçalho de rota, hero, o total de uma conta. Ganha o
 *           fio dourado na aresta de cima e a sombra longa.
 *   normal  CONTÉM  — o card comum, o padrão.
 *   sunken  ESPERA  — campo, poço, estado vazio. Sombra pra dentro.
 *
 * Uma tela com tudo no mesmo nível é a tela que o print de 0.1.4 mostrava: uma
 * lista cinza de coisas igualmente importantes.
 */
export type SurfaceLevel = "raised" | "normal" | "sunken";

const NIVEL: Record<SurfaceLevel, string> = {
  raised: "surface-raised border-parchment-300/90 bg-parchment-50/90 dark:border-parchment-700/80 dark:bg-parchment-900/80",
  normal: "surface border-parchment-300 bg-parchment-50/70 dark:border-parchment-800 dark:bg-parchment-900/60",
  sunken: "surface-sunken border-parchment-300/70 bg-parchment-200/40 dark:border-parchment-800/70 dark:bg-parchment-950/50",
};

export default function Surface({
  as: Tag = "div",
  level = "normal",
  interactive = false,
  className = "",
  children,
  ...rest
}: {
  /** `section`, `li`, `article`… O default `div` serve pra card solto. */
  as?: ElementType;
  level?: SurfaceLevel;
  /** Só em card CLICÁVEL: acende a borda e levanta 2px no hover. */
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag
      className={`rounded-2xl border ${NIVEL[level]} ${
        interactive ? "lift cursor-pointer hover:border-wine-400 dark:hover:border-wine-600" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
