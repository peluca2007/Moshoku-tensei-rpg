"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { COMBINED_SPELLS } from "@/data/combinedSpells";
import { getTreeById } from "@/data/trees";
import { useActiveCharacter } from "@/store/useCharacterStore";

/**
 * As Magias Combinadas compradas, na ficha (Cap. 2, §4) — 2026-09-03.
 *
 * O painel de /arvores é onde elas se COMPRAM: lá o jogador vê as nove, as
 * portas que faltam e o caminho até cada uma. Aqui é onde elas se USAM, e por
 * isso a informação é outra — só as que ele tem, com PM, Ações, alcance, dano e
 * efeito, do jeito que o resto do Grimório mostra.
 *
 * Elas ficam numa seção separada das árvores de propósito. Uma Combinada não
 * pertence a nenhuma das duas escolas que a geraram: listá-la dentro de Fogo
 * faria o jogador procurar o Meteoro em Terra na metade das vezes.
 */
export default function CombinedSpellsSection({ query }: { query: string }) {
  const character = useActiveCharacter();
  const compradas = character.purchasedCombinedSpells ?? [];
  if (compradas.length === 0) return null;

  const busca = query.trim().toLowerCase();
  const minhas = COMBINED_SPELLS.filter((s) => compradas.includes(s.id)).filter(
    (s) =>
      !busca ||
      s.name.toLowerCase().includes(busca) ||
      "magia combinada".includes(busca) ||
      s.requires.some((r) => (getTreeById(r.treeId)?.name ?? "").toLowerCase().includes(busca))
  );
  if (minhas.length === 0) return null;

  return (
    <section className="rounded-xl border-2 border-wine-400 bg-wine-50/50 p-3 dark:border-wine-800 dark:bg-wine-950/30">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-parchment-900 dark:text-parchment-50">
          <Sparkles className="h-4 w-4 text-wine-500" /> Magias Combinadas
          <span className="rounded-full bg-wine-600/10 px-2 py-0.5 text-[11px] font-semibold text-wine-700 ring-1 ring-wine-500/30 dark:text-wine-300">
            {minhas.length}
          </span>
        </h3>
        <Link
          href="/arvores"
          className="text-xs font-medium text-wine-600 underline decoration-dotted hover:text-wine-500 dark:text-wine-300"
        >
          Comprar mais em Árvores
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {minhas.map((spell) => (
          <div
            key={spell.id}
            className="rounded-lg border border-parchment-300 bg-parchment-50/80 p-3 dark:border-parchment-800 dark:bg-parchment-950/50"
          >
            <p className="font-semibold text-parchment-900 dark:text-parchment-50">{spell.name}</p>
            <p className="mt-0.5 text-xs text-parchment-600 dark:text-parchment-400">
              {spell.paCost} PA · {spell.pmCost} PM · {spell.actions} Ações · {spell.range}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {spell.requires.map((r) => (
                <span
                  key={r.treeId}
                  className="rounded-full bg-parchment-500/10 px-2 py-0.5 text-[10px] font-semibold text-parchment-600 ring-1 ring-parchment-400/40 dark:text-parchment-400"
                >
                  {getTreeById(r.treeId)?.name ?? r.treeId} {r.rank}
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-parchment-700 dark:text-parchment-300">
              {spell.damage !== "—" && <span className="font-medium">{spell.damage}. </span>}
              {spell.effect}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
