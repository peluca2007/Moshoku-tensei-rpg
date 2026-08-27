"use client";

import { useSearchParams } from "next/navigation";
import { Sparkles, Gem } from "lucide-react";
import { useActiveCharacter } from "@/store/useCharacterStore";
import { getPaSpent } from "@/store/selectors";
import DestinyBoard from "./DestinyBoard";

export default function TreeBrowser() {
  const character = useActiveCharacter();
  const paSpent = getPaSpent(character);
  const searchParams = useSearchParams();
  const initialFocusTreeId = searchParams.get("arvore") ?? undefined;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <Sparkles className="h-6 w-6 text-wine-500" /> Árvores de Progressão
        </h1>
        <span
          title="Só informativo — quem controla quanto PA você tem é o Mestre."
          className="flex items-center gap-1 rounded-full bg-gold-500/10 px-3 py-1 text-sm font-medium text-gold-600 ring-1 ring-gold-500/30 dark:text-gold-400"
        >
          <Gem className="h-4 w-4" /> {paSpent} PA gastos
        </span>
      </header>

      <DestinyBoard initialFocusTreeId={initialFocusTreeId} />
    </div>
  );
}
