"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Backpack, Check, Coins, FlaskConical, Lock, Shield, Skull, Sparkles, Store, Swords, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getGuildRank, isGuildRankEstimated } from "@/store/selectors";
import { GUILD_RANK_ORDER, GuildRank, meetsGuildRank } from "@/lib/types";
import { SHOP_CATEGORY_LABELS, SHOP_CATEGORY_ORDER, SHOP_ITEMS, ShopCategory, ShopItem, toInventoryItem } from "@/data/shopItems";

const CATEGORY_ICONS: Record<ShopCategory, LucideIcon> = {
  arma: Swords,
  armadura: Shield,
  aventura: Backpack,
  pocao: FlaskConical,
  veneno: Skull,
  "ferramenta-magica": Wand2,
  encantamento: Sparkles,
};

type FilterCategory = "todos" | ShopCategory;
type FilterRank = "todos" | GuildRank;

export default function Shop() {
  const character = useActiveCharacter();
  const guildRank = getGuildRank(character);
  const guildRankEstimated = isGuildRankEstimated(character);
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("todos");
  const [rankFilter, setRankFilter] = useState<FilterRank>("todos");
  const [boughtId, setBoughtId] = useState<string | null>(null);
  const boughtTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (boughtTimeoutRef.current) clearTimeout(boughtTimeoutRef.current);
    },
    []
  );

  const items = useMemo(
    () =>
      SHOP_ITEMS.filter(
        (i) =>
          (categoryFilter === "todos" || i.category === categoryFilter) &&
          (rankFilter === "todos" || i.guildRankRequired === rankFilter)
      ),
    [categoryFilter, rankFilter]
  );

  function handleBuy(item: ShopItem) {
    const ok = useCharacterStore.getState().buyItem(toInventoryItem(item), item.price, item.guildRankRequired);
    if (!ok) return;
    if (boughtTimeoutRef.current) clearTimeout(boughtTimeoutRef.current);
    setBoughtId(item.id);
    boughtTimeoutRef.current = setTimeout(() => setBoughtId(null), 1400);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header className="space-y-3">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <Store className="h-6 w-6 text-wine-500" /> Loja da Guilda
        </h1>
        <p className="text-sm text-parchment-500 dark:text-parchment-400">
          Comprar aqui debita o PO e manda o item direto pro inventário de{" "}
          <b className="text-parchment-700 dark:text-parchment-300">{character.name || "Sem nome"}</b>. Preço
          completo e o que cada Rank libera também estão no{" "}
          <Link href="/livro#cap5-2" className="text-wine-600 underline hover:text-wine-500 dark:text-wine-400">
            Livro de Regras
          </Link>
          .
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 font-medium text-amber-600 ring-1 ring-amber-500/30 dark:text-amber-400">
            <Coins className="h-3.5 w-3.5" /> {character.gold} PO
          </span>
          <span className="flex items-center gap-1 rounded-full bg-wine-500/10 px-3 py-1 font-medium text-wine-600 ring-1 ring-wine-500/30 dark:text-wine-300">
            Rank {guildRank} na Guilda
            {guildRankEstimated && <span className="text-[10px] uppercase tracking-wide">(estimado)</span>}
          </span>
        </div>
      </header>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-parchment-400 dark:text-parchment-500">
            Tipo
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter("todos")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === "todos"
                ? "bg-wine-600 text-white"
                : "bg-parchment-100 text-parchment-600 hover:bg-parchment-200 dark:bg-parchment-900 dark:text-parchment-300"
            }`}
          >
            Todos
          </button>
          {SHOP_CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-wine-600 text-white"
                  : "bg-parchment-100 text-parchment-600 hover:bg-parchment-200 dark:bg-parchment-900 dark:text-parchment-300"
              }`}
            >
              {SHOP_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-parchment-400 dark:text-parchment-500">
            Rank
          </span>
          <button
            type="button"
            onClick={() => setRankFilter("todos")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              rankFilter === "todos"
                ? "bg-gold-500 text-parchment-950"
                : "bg-parchment-100 text-parchment-600 hover:bg-parchment-200 dark:bg-parchment-900 dark:text-parchment-300"
            }`}
          >
            Todos
          </button>
          {GUILD_RANK_ORDER.map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => setRankFilter(rank)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                rankFilter === rank
                  ? "bg-gold-500 text-parchment-950"
                  : "bg-parchment-100 text-parchment-600 hover:bg-parchment-200 dark:bg-parchment-900 dark:text-parchment-300"
              }`}
            >
              {rank}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-parchment-300 p-6 text-center text-sm text-parchment-500 dark:border-parchment-700 dark:text-parchment-400">
          Nenhum item nesse Tipo + Rank. Tente afrouxar um dos dois filtros.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const rankOk = meetsGuildRank(guildRank, item.guildRankRequired);
          const goldOk = character.gold >= item.price;
          const canBuy = rankOk && goldOk;
          const justBought = boughtId === item.id;
          const Icon = CATEGORY_ICONS[item.category];
          return (
            <div
              key={item.id}
              className={`flex flex-col rounded-2xl border p-4 shadow-sm transition-colors ${
                justBought
                  ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                  : "border-parchment-300 bg-parchment-50 dark:border-parchment-800 dark:bg-parchment-900/60"
              }`}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <h2 className="flex items-center gap-1.5 font-bold text-parchment-900 dark:text-parchment-50">
                  <Icon className="h-4 w-4 shrink-0 text-wine-500" /> {item.name}
                </h2>
                <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {item.price} PO
                </span>
              </div>
              <p className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="rounded-full bg-wine-500/10 px-2 py-0.5 font-semibold text-wine-600 dark:text-wine-300">
                  Rank {item.guildRankRequired} mínimo
                </span>
                {(item.baseDie || item.acBonus) && (
                  <span className="font-semibold text-wine-600 dark:text-wine-300">
                    {item.baseDie ? `Dado ${item.baseDie}` : `+${item.acBonus} CA`}
                  </span>
                )}
              </p>
              <p className="mb-3 flex-1 text-xs text-parchment-500 dark:text-parchment-400">{item.description}</p>
              <button
                type="button"
                onClick={() => handleBuy(item)}
                disabled={!canBuy}
                title={!rankOk ? `Precisa de Rank ${item.guildRankRequired} na Guilda` : !goldOk ? "PO insuficiente" : undefined}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-wine-600 py-2 text-sm font-bold text-white transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:bg-parchment-300 disabled:text-parchment-500 dark:disabled:bg-parchment-800 dark:disabled:text-parchment-500"
              >
                {justBought ? (
                  <>
                    <Check className="h-4 w-4" /> Comprado!
                  </>
                ) : !rankOk ? (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Rank {item.guildRankRequired}
                  </>
                ) : (
                  "Comprar"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
