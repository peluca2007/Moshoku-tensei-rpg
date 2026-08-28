"use client";

import { ScrollText } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";

export default function LoreSection({ lore }: { lore: string }) {
  return (
    <section className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-parchment-900 dark:text-parchment-50">
        <ScrollText className="h-5 w-5 text-wine-500" /> Lore & Anotações
      </h2>
      <p className="mb-3 text-xs text-parchment-500 dark:text-parchment-400">
        História de fundo, anotações de mesa, o que quiser — sai também no PDF exportado.
      </p>
      <textarea
        value={lore}
        onChange={(e) => useCharacterStore.getState().setLore(e.target.value)}
        placeholder="Ex: infância, como chegou na Guilda, cicatrizes que carrega, promessas que fez..."
        rows={8}
        className="w-full resize-y rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
      />
    </section>
  );
}
