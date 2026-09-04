import { GuildRank, RankName, Tree } from "./types";

export const RANK_COLORS: Record<RankName, string> = {
  Principiante: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  Intermediário: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  Avançado: "bg-violet-500/15 text-violet-400 ring-violet-500/30",
  Santo: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  Rei: "bg-rose-500/15 text-rose-400 ring-rose-500/30",
  Imperador: "bg-fuchsia-500/15 text-fuchsia-400 ring-fuchsia-500/30",
  Deus: "bg-yellow-500/15 text-yellow-300 ring-yellow-500/30",
};

/** Classes estáticas (Tailwind precisa ver o literal completo) para o grafo visual da árvore. */
export const RANK_ACCENT: Record<
  RankName,
  {
    solidBg: string;
    ringActive: string;
    borderActive: string;
    stroke: string;
    text: string;
    /** Sombra colorida do NÓ (box-shadow via Tailwind). */
    glow: string;
    /**
     * Brilho da LINHA do galho já comprado (0.1.6).
     *
     * É `drop-shadow`, e não o `shadow-*` do `glow` acima: a aresta é um
     * `<path>` de SVG, e `box-shadow` não existe pra geometria SVG — ele
     * desenharia a sombra do retângulo do elemento, não do traço.
     */
    glowLine: string;
  }
> = {
  Principiante: {
    solidBg: "bg-emerald-500",
    ringActive: "ring-emerald-400",
    borderActive: "border-emerald-400",
    stroke: "stroke-emerald-500",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/50",
    glowLine: "drop-shadow-[0_0_5px_var(--color-emerald-500)]",
  },
  Intermediário: {
    solidBg: "bg-sky-500",
    ringActive: "ring-sky-400",
    borderActive: "border-sky-400",
    stroke: "stroke-sky-500",
    text: "text-sky-400",
    glow: "shadow-sky-500/50",
    glowLine: "drop-shadow-[0_0_5px_var(--color-sky-500)]",
  },
  Avançado: {
    solidBg: "bg-violet-500",
    ringActive: "ring-violet-400",
    borderActive: "border-violet-400",
    stroke: "stroke-violet-500",
    text: "text-violet-400",
    glow: "shadow-violet-500/50",
    glowLine: "drop-shadow-[0_0_5px_var(--color-violet-500)]",
  },
  Santo: {
    solidBg: "bg-amber-500",
    ringActive: "ring-amber-400",
    borderActive: "border-amber-400",
    stroke: "stroke-amber-500",
    text: "text-amber-400",
    glow: "shadow-amber-500/50",
    glowLine: "drop-shadow-[0_0_5px_var(--color-amber-500)]",
  },
  Rei: {
    solidBg: "bg-rose-500",
    ringActive: "ring-rose-400",
    borderActive: "border-rose-400",
    stroke: "stroke-rose-500",
    text: "text-rose-400",
    glow: "shadow-rose-500/50",
    glowLine: "drop-shadow-[0_0_5px_var(--color-rose-500)]",
  },
  Imperador: {
    solidBg: "bg-fuchsia-500",
    ringActive: "ring-fuchsia-400",
    borderActive: "border-fuchsia-400",
    stroke: "stroke-fuchsia-500",
    text: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/50",
    glowLine: "drop-shadow-[0_0_5px_var(--color-fuchsia-500)]",
  },
  Deus: {
    solidBg: "bg-yellow-500",
    ringActive: "ring-yellow-300",
    borderActive: "border-yellow-300",
    stroke: "stroke-yellow-500",
    text: "text-yellow-300",
    glow: "shadow-yellow-500/50",
    glowLine: "drop-shadow-[0_0_5px_var(--color-yellow-500)]",
  },
};

/**
 * Identidade visual de cada grande ramo do Destiny Board (raiz → categoria →
 * subgrupo → árvore).
 *
 * Reafinado em 0.1.6 pra dentro da paleta. Até 0.1.5 os três ramos eram
 * `sky-600`, `rose-600` e `emerald-600` — três primárias saturadas de biblioteca
 * num site inteiro de pergaminho, vinho e ouro. O mapa é a página mais bonita do
 * projeto e era a única que parecia ter vindo de outro.
 *
 * O que mudou é a TEMPERATURA, não a distinção: os três continuam separáveis à
 * primeira vista (é isso que a cor faz aqui — dizer de que pilar é o galho), mas
 * agora em tons terrosos que convivem com o fundo de pergaminho e com o dourado
 * dos nós. `cyan/rose/emerald` viraram `teal fundo / vinho / oliva`, que são
 * água, sangue e mata — o vocabulário do mundo, não o do Tailwind.
 *
 * Corpo puxa pro vinho de propósito: é a cor primária do projeto, e a Árvore do
 * Corpo é a que a maioria das mesas abre primeiro.
 */
export const CATEGORY_ACCENT: Record<
  Tree["category"],
  { solidBg: string; stroke: string; text: string; border: string; glow: string }
> = {
  magia: {
    solidBg: "bg-teal-700",
    stroke: "stroke-teal-600",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-600",
    glow: "drop-shadow-[0_0_6px_rgba(20,184,166,0.55)]",
  },
  corpo: {
    solidBg: "bg-wine-500",
    stroke: "stroke-wine-500",
    text: "text-wine-600 dark:text-wine-300",
    border: "border-wine-500",
    glow: "drop-shadow-[0_0_6px_rgba(142,47,85,0.65)]",
  },
  utilidade: {
    solidBg: "bg-olive-600",
    stroke: "stroke-olive-600",
    text: "text-olive-700 dark:text-olive-300",
    border: "border-olive-600",
    glow: "drop-shadow-[0_0_6px_rgba(124,132,64,0.6)]",
  },
};

/**
 * Cor por Rank de Guilda (F→S), para a etiqueta dos itens da Loja (0.1.5).
 *
 * A loja mostrava "Rank F mínimo" e "Rank S mínimo" na MESMA etiqueta vinho: 21
 * cards de armas em fileira, todos com a mesma faixa da mesma cor, e a única
 * informação que separava uma adaga de 6 PO de um artefato de Rank S era a
 * letra. Cor faz essa leitura acontecer antes da leitura.
 *
 * A escala vai do frio ao quente de propósito — é a mesma direção da escala de
 * Rank das árvores em `RANK_COLORS`, então quem já leu o mapa de progressão
 * não precisa aprender um segundo código de cores aqui.
 *
 * Classes literais e completas: o Tailwind lê o texto do arquivo, então
 * `bg-${cor}-500/15` montado em template literal não geraria regra nenhuma.
 */
/*
 * O degrau do TEXTO no tema claro é 800, e não 700 (0.1.12).
 *
 * A etiqueta tem 12px em negrito sobre um fundo da própria cor a 15% — que, em
 * cima do pergaminho, não é claro o bastante pra sustentar o 700. Medido na
 * varredura de contraste: amber-700 sobre a etiqueta âmbar dava 3,80:1 e
 * rose-700 dava 4,07:1, os dois abaixo dos 4,5:1 do WCAG AA. É a etiqueta que
 * responde "posso comprar isto?" em 21 cards de uma vez, então é o texto que
 * menos pode exigir esforço pra ler.
 *
 * O escuro fica onde estava: lá o mesmo 15% cai sobre parchment-950 e os tons
 * 300 já passam com folga.
 */
export const GUILD_RANK_COLORS: Record<GuildRank, string> = {
  F: "bg-parchment-500/15 text-parchment-700 ring-parchment-500/30 dark:text-parchment-300",
  E: "bg-emerald-500/15 text-emerald-800 ring-emerald-500/30 dark:text-emerald-300",
  D: "bg-sky-500/15 text-sky-800 ring-sky-500/30 dark:text-sky-300",
  C: "bg-violet-500/15 text-violet-800 ring-violet-500/30 dark:text-violet-300",
  B: "bg-amber-500/15 text-amber-800 ring-amber-500/30 dark:text-amber-300",
  A: "bg-rose-500/15 text-rose-800 ring-rose-500/30 dark:text-rose-300",
  S: "bg-yellow-400/20 text-yellow-900 ring-yellow-500/40 dark:text-yellow-200",
};
