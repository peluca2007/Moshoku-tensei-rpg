import { RankName, Tree } from "./types";

export const RANK_COLORS: Record<RankName, string> = {
  Principiante: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  Intermediário: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  Avançado: "bg-violet-500/15 text-violet-400 ring-violet-500/30",
  Santo: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  Rei: "bg-rose-500/15 text-rose-400 ring-rose-500/30",
  Imperador: "bg-fuchsia-500/15 text-fuchsia-400 ring-fuchsia-500/30",
};

/** Classes estáticas (Tailwind precisa ver o literal completo) para o grafo visual da árvore. */
export const RANK_ACCENT: Record<
  RankName,
  { solidBg: string; ringActive: string; borderActive: string; stroke: string; text: string; glow: string }
> = {
  Principiante: {
    solidBg: "bg-emerald-500",
    ringActive: "ring-emerald-400",
    borderActive: "border-emerald-400",
    stroke: "stroke-emerald-500",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/50",
  },
  Intermediário: {
    solidBg: "bg-sky-500",
    ringActive: "ring-sky-400",
    borderActive: "border-sky-400",
    stroke: "stroke-sky-500",
    text: "text-sky-400",
    glow: "shadow-sky-500/50",
  },
  Avançado: {
    solidBg: "bg-violet-500",
    ringActive: "ring-violet-400",
    borderActive: "border-violet-400",
    stroke: "stroke-violet-500",
    text: "text-violet-400",
    glow: "shadow-violet-500/50",
  },
  Santo: {
    solidBg: "bg-amber-500",
    ringActive: "ring-amber-400",
    borderActive: "border-amber-400",
    stroke: "stroke-amber-500",
    text: "text-amber-400",
    glow: "shadow-amber-500/50",
  },
  Rei: {
    solidBg: "bg-rose-500",
    ringActive: "ring-rose-400",
    borderActive: "border-rose-400",
    stroke: "stroke-rose-500",
    text: "text-rose-400",
    glow: "shadow-rose-500/50",
  },
  Imperador: {
    solidBg: "bg-fuchsia-500",
    ringActive: "ring-fuchsia-400",
    borderActive: "border-fuchsia-400",
    stroke: "stroke-fuchsia-500",
    text: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/50",
  },
};

/** Identidade visual de cada grande ramo do Destiny Board (raiz → categoria → subgrupo → árvore). */
export const CATEGORY_ACCENT: Record<
  Tree["category"],
  { solidBg: string; stroke: string; text: string; border: string }
> = {
  magia: { solidBg: "bg-sky-600", stroke: "stroke-sky-600", text: "text-sky-400", border: "border-sky-500" },
  corpo: { solidBg: "bg-rose-600", stroke: "stroke-rose-600", text: "text-rose-400", border: "border-rose-500" },
  utilidade: {
    solidBg: "bg-emerald-600",
    stroke: "stroke-emerald-600",
    text: "text-emerald-400",
    border: "border-emerald-500",
  },
};
