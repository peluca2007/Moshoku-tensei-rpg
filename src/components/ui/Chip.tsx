import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * O chip de filtro e de escolha (2026-09-23).
 *
 * É o segundo padrão de botão do site, e não é o `Button`: um botão DISPARA
 * uma ação e volta ao repouso; um chip fica LIGADO ou DESLIGADO e é sempre um
 * de uma fileira. Por isso ele tem estado aceso e o `Button` não, e por isso
 * enfiar os dois no mesmo componente obrigaria a inventar variantes que só uma
 * tela usa.
 *
 * A mesma string (`rounded-full px-3 py-1.5 text-xs font-medium`, com
 * `bg-wine-600 text-white` quando aceso) estava copiada em seis arquivos, com
 * divergências de padding que não queriam dizer nada. Usam este componente os
 * filtros de Tipo e Rank da loja e as perícias de árvore; os outros migram
 * quando alguém encostar neles.
 *
 * O que NÃO é chip, apesar de parecer: o seletor Mapa/Lista das árvores. Ali
 * os dois botões vivem dentro de uma moldura com fundo próprio, e o apagado é
 * transparente de propósito — dar fundo a ele viraria caixa dentro de caixa.
 * Aquilo é um seletor de um-entre-dois, não uma fileira de filtros.
 *
 * O `aria-pressed` vai junto porque é o que um chip É pra quem não enxerga a
 * cor: um botão de dois estados. Metade das fileiras declarava, metade não —
 * e as que não declaravam anunciavam sete "Todos, botão" idênticos.
 */
export default function Chip({
  aceso = false,
  /** `gold` para escala e patamar (Rank de Guilda, dados), `wine` para o resto. */
  cor = "wine",
  /**
   * Um degrau mais escuro quando apagado — para fileira que mora DENTRO de um
   * card claro, onde o tom padrão encostaria no fundo e o chip sumiria.
   *
   * É prop, e não `className`: duas classes de fundo no mesmo elemento são
   * decididas pela ordem no CSS gerado, não pela ordem na string. Um
   * `bg-parchment-200` vindo de fora podia vencer o `bg-wine-600` do estado
   * aceso e apagar justamente o chip que está ligado.
   */
  sobreCard = false,
  className = "",
  children,
  ...rest
}: {
  aceso?: boolean;
  cor?: "wine" | "gold";
  sobreCard?: boolean;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const ligado = cor === "gold" ? "bg-gold-500 text-parchment-950" : "bg-wine-600 text-white";
  const apagado = sobreCard
    ? "bg-parchment-200 text-parchment-700 hover:bg-parchment-300 dark:bg-parchment-800 dark:text-parchment-200 dark:hover:bg-parchment-700"
    : "bg-parchment-100 text-parchment-600 hover:bg-parchment-200 dark:bg-parchment-900 dark:text-parchment-300 dark:hover:bg-parchment-800";

  return (
    <button
      type="button"
      aria-pressed={aceso}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        aceso ? ligado : apagado
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
