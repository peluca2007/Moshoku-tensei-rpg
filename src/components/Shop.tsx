"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Backpack, Check, Coins, FlaskConical, Lock, Shield, Skull, Sparkles, Store, Swords, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getGuildRank, isGuildRankEstimated } from "@/store/selectors";
import { GUILD_RANK_ORDER, GuildRank, meetsGuildRank } from "@/lib/types";
import { GUILD_RANK_COLORS } from "@/lib/rankColors";
import {
  SHOP_CATEGORY_ICONS,
  SHOP_CATEGORY_LABELS,
  SHOP_CATEGORY_ORDER,
  SHOP_ITEMS,
  ShopCategory,
  ShopItem,
  toInventoryItem,
} from "@/data/shopItems";
import Crest from "./Crest";
import PageHeader from "./ui/PageHeader";
import Surface from "./ui/Surface";
import CountingNumber from "./ui/CountingNumber";

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

  /**
   * Os itens em grupos de categoria, cada um já sabendo qual descrição é
   * BOILERPLATE dele.
   *
   * "Boilerplate" aqui tem definição operacional, não uma lista fixa: é uma
   * descrição que dois ou mais itens do grupo repetem palavra por palavra. Se
   * dois itens dizem a mesma coisa, aquilo não descreve nenhum dos dois — é
   * regra da categoria, e o lugar dela é no cabeçalho, uma vez. A regra é
   * genérica de propósito: ela pega as doze armas mundanas de hoje e pega
   * sozinha o próximo bloco de itens que nascer do mesmo molde.
   */
  const grupos = useMemo(() => {
    return SHOP_CATEGORY_ORDER.map((categoria) => {
      const itens = items.filter((i) => i.category === categoria);
      const contagem = new Map<string, number>();
      for (const i of itens) contagem.set(i.description, (contagem.get(i.description) ?? 0) + 1);
      let notaComum: string | null = null;
      let maior = 1;
      for (const [texto, n] of contagem) {
        if (n > maior) {
          maior = n;
          notaComum = texto;
        }
      }
      return { categoria, itens, notaComum };
    }).filter((g) => g.itens.length > 0);
  }, [items]);

  function handleBuy(item: ShopItem) {
    const ok = useCharacterStore.getState().buyItem(toInventoryItem(item), item.price, item.guildRankRequired);
    if (!ok) return;
    if (boughtTimeoutRef.current) clearTimeout(boughtTimeoutRef.current);
    setBoughtId(item.id);
    boughtTimeoutRef.current = setTimeout(() => setBoughtId(null), 1400);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <PageHeader
        icon={Store}
        title="Loja da Guilda"
        faixa="/faixas/loja.jpg"
        faixaPosition="center 35%"
        actions={
          <>
            {/*
              A bolsa e o Rank saíram de baixo do parágrafo e vieram pro canto
              do cabeçalho: são os dois números que decidem se você PODE comprar
              cada card da página, então eles precisam estar no lugar onde o
              olho volta, e não no fim de um texto de apoio.
            */}
            <span className="flex items-center gap-1 rounded-full bg-gold-500/15 px-3 py-1 text-sm font-bold text-gold-700 ring-1 ring-gold-500/40 backdrop-blur-sm dark:text-gold-300">
              <Coins className="h-3.5 w-3.5" /> <CountingNumber value={character.gold} /> PO
            </span>
            <span className="flex items-center gap-1 rounded-full bg-wine-600/15 px-3 py-1 text-sm font-bold text-wine-700 ring-1 ring-wine-500/40 backdrop-blur-sm dark:text-wine-200">
              Rank {guildRank} na Guilda
              {guildRankEstimated && <span className="text-[10px] uppercase tracking-wide">(estimado)</span>}
            </span>
          </>
        }
      >
        <p>
          Comprar aqui debita o PO e manda o item direto pro inventário de{" "}
          <b className="text-parchment-800 dark:text-parchment-200">{character.name || "Sem nome"}</b>. Preço
          completo e o que cada Rank libera também estão no{" "}
          <Link href="/livro#cap5-2" className="text-wine-700 underline hover:text-wine-500 dark:text-wine-200">
            Livro de Regras
          </Link>
          .
        </p>
      </PageHeader>

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
        <p className="rounded-xl border border-dashed border-parchment-300 p-6 text-center text-sm text-parchment-600 dark:border-parchment-700 dark:text-parchment-400">
          Nenhum item nesse Tipo + Rank. Tente afrouxar um dos dois filtros.
        </p>
      )}

      {grupos.map(({ categoria, itens, notaComum }) => {
        const Icon = CATEGORY_ICONS[categoria];
        const arte = SHOP_CATEGORY_ICONS[categoria];
        return (
          <section key={categoria}>
            <div className="mb-3 flex items-center gap-3 border-b border-parchment-300 pb-2 dark:border-parchment-800">
              {arte ? (
                <Crest src={arte} size={44} />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-parchment-100 text-wine-500 ring-1 ring-parchment-300 dark:ring-parchment-700">
                  <Icon className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-parchment-900 dark:text-parchment-50">
                  {SHOP_CATEGORY_LABELS[categoria]}
                  <span className="ml-2 text-xs font-normal text-parchment-600 dark:text-parchment-400">
                    {itens.length} {itens.length === 1 ? "item" : "itens"}
                  </span>
                </h2>
                {notaComum && (
                  <p className="text-xs text-parchment-600 dark:text-parchment-400">{notaComum}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {itens.map((item) => {
                const rankOk = meetsGuildRank(guildRank, item.guildRankRequired);
                const goldOk = character.gold >= item.price;
                const canBuy = rankOk && goldOk;
                const justBought = boughtId === item.id;
                // A descrição que virou nota do grupo não se repete no card: ela
                // já está escrita a poucos pixels dali, no cabeçalho.
                const descricaoPropria = item.description === notaComum ? null : item.description;
                return (
                  <Surface
                    key={item.id}
                    /*
                      Item que você NÃO pode comprar fica de fato mais apagado
                      (`opacity-70`) em vez de só ter o botão desligado: numa
                      grade de 21 armas, "o que dá pra comprar agora" tem que
                      ser legível de longe, sem ler letra nenhuma.
                    */
                    className={`flex flex-col p-4 transition-all ${
                      justBought
                        ? "animate-ganho-flash !border-emerald-400 !bg-emerald-50 dark:!border-emerald-600 dark:!bg-emerald-950/40"
                        : rankOk
                          ? ""
                          : "opacity-70 saturate-50"
                    }`}
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <h3 className="flex items-center gap-1.5 font-display font-bold text-parchment-900 dark:text-parchment-50">
                        <Icon className="h-4 w-4 shrink-0 text-wine-500" /> {item.name}
                      </h3>
                      <span className="tabular shrink-0 rounded-full bg-gold-500/15 px-2 py-0.5 text-xs font-bold text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300">
                        {item.price} PO
                      </span>
                    </div>
                    <p className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 font-bold ring-1 ${GUILD_RANK_COLORS[item.guildRankRequired]}`}
                      >
                        Rank {item.guildRankRequired}
                      </span>
                      {(item.baseDie || item.acBonus) && (
                        <span className="font-semibold text-wine-600 dark:text-wine-300">
                          {item.baseDie ? `Dado ${item.baseDie}` : `+${item.acBonus} CA`}
                        </span>
                      )}
                    </p>
                    {descricaoPropria && (
                      <p className="mb-3 flex-1 text-xs text-parchment-600 dark:text-parchment-400">
                        {descricaoPropria}
                      </p>
                    )}
                    {/*
                      Item bloqueado não ganha mais um botão cinza do tamanho do
                      card. A grade da loja tinha 21 barras cinzas mortas, uma
                      por arma, e elas eram o elemento mais pesado da tela —
                      a página inteira lia como "nada aqui funciona". Bloqueio
                      virou uma linha de estado; botão é só pra quem pode agir.
                    */}
                    {!rankOk ? (
                      <p
                        className={`flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-parchment-400/60 py-2 text-xs font-semibold text-parchment-600 dark:border-parchment-700 dark:text-parchment-400 ${descricaoPropria ? "" : "mt-auto"}`}
                      >
                        <Lock className="h-3.5 w-3.5" /> Precisa de Rank {item.guildRankRequired} na Guilda
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuy(item)}
                        disabled={!canBuy}
                        title={!goldOk ? "PO insuficiente" : undefined}
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold shadow-sm transition-all ${
                          justBought
                            ? "bg-emerald-600 text-white"
                            : goldOk
                              ? "bg-wine-600 text-white ring-1 ring-gold-400/30 hover:-translate-y-0.5 hover:bg-wine-500 hover:shadow-md"
                              : "cursor-not-allowed border border-parchment-300 text-parchment-600 dark:border-parchment-700 dark:text-parchment-400"
                        } ${descricaoPropria ? "" : "mt-auto"}`}
                      >
                        {justBought ? (
                          <>
                            <Check className="h-4 w-4" /> Comprado!
                          </>
                        ) : goldOk ? (
                          "Comprar"
                        ) : (
                          `Faltam ${item.price - character.gold} PO`
                        )}
                      </button>
                    )}
                  </Surface>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
