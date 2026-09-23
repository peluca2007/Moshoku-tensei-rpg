import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * O botão do site (2026-09-23).
 *
 * Mesma história do `Surface`: eram 181 `<button>` no JSX, cada um com a sua
 * combinação de `rounded-* border-parchment-300 px-3.5 py-1.5 text-xs
 * font-semibold …`. O resultado na tela até parecia uniforme — o custo era que
 * todo botão novo nascia de um copiar-colar, e mudar a cara dos botões
 * significava mudar quarenta arquivos, que é exatamente por que ela nunca
 * mudava.
 *
 * As três variantes são gramática, não paleta:
 *
 *   primario    O QUE A TELA QUER que você faça. Um por bloco — dois botões
 *               vinho lado a lado é a tela não sabendo o que ela quer.
 *   secundario  As outras saídas. É o padrão.
 *   confirmado  Só para o RETORNO de uma ação ("Link copiado", "Enviado"),
 *               nunca para um botão em repouso. Verde aqui quer dizer
 *               "aconteceu", e é a única cor do site fora de pergaminho, vinho
 *               e dourado — gastá-la em outra coisa apaga esse significado.
 */
export type ButtonVariant = "primario" | "secundario" | "confirmado";

const VARIANTE: Record<ButtonVariant, string> = {
  primario: "bg-wine-600 text-white shadow-sm hover:bg-wine-500",
  secundario:
    "border border-parchment-300 text-parchment-600 shadow-sm hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900",
  confirmado:
    "border border-emerald-400 bg-emerald-500/10 text-emerald-700 shadow-sm dark:border-emerald-600 dark:text-emerald-300",
};

const TAMANHO = {
  sm: "gap-1.5 px-3.5 py-1.5 text-xs",
  md: "gap-2 px-4 py-2 text-sm",
} as const;

export default function Button({
  variante = "secundario",
  tamanho = "sm",
  /** `caixa` (canto de 8px) para botão em formulário e grade; `pilula` para barra de ações. */
  forma = "pilula",
  className = "",
  children,
  ...rest
}: {
  variante?: ButtonVariant;
  tamanho?: keyof typeof TAMANHO;
  forma?: "pilula" | "caixa";
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      // `type="button"` como padrão, e não como detalhe: o default do HTML é
      // `submit`, e um botão de ação dentro de um <form> que ninguém pretendia
      // submeter recarrega a página inteira — perdendo o que estava sendo
      // editado na ficha.
      type="button"
      className={`flex shrink-0 items-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        forma === "pilula" ? "rounded-full" : "rounded-lg"
      } ${TAMANHO[tamanho]} ${VARIANTE[variante]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
