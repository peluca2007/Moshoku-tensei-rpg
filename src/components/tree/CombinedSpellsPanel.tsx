"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { COMBINED_SPELLS } from "@/data/combinedSpells";
import { getTreeById } from "@/data/trees";
import { RANKS } from "@/lib/types";
import {
  canPurchaseCombinedSpell,
  getHighestUnlockedRank,
} from "@/store/selectors";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";

/**
 * Cap. 2, §4 — as Magias Combinadas, no mapa de árvores.
 *
 * Até 2026-09-03 elas eram uma tabela impressa no livro e nada mais: não havia
 * onde comprá-las, a ficha não as guardava, e o PA que o texto dizia que elas
 * custavam nunca saía de lugar nenhum. Este painel é o lugar delas — e fica em
 * /arvores, e não na ficha, porque uma Combinada não pertence a UMA árvore: ela
 * nasce do encontro de duas, e é olhando o mapa que o jogador entende por que
 * ela apareceu.
 *
 * O painel mostra as três situações ao mesmo tempo, de propósito:
 *
 * - **Comprada** — já está na ficha.
 * - **Disponível** — as duas portas abriram; dá pra comprar agora.
 * - **Trancada** — mostra QUAIS portas faltam e quanto falta em cada uma. É a
 *   parte que faz o painel valer: ele não esconde o que você ainda não alcançou,
 *   ele diz o caminho.
 */
export default function CombinedSpellsPanel() {
  const character = useActiveCharacter();
  const comprar = useCharacterStore((s) => s.purchaseCombinedSpell);
  const remover = useCharacterStore((s) => s.removeCombinedSpell);
  const compradas = character.purchasedCombinedSpells ?? [];

  const linhas = COMBINED_SPELLS.map((spell) => {
    const comprada = compradas.includes(spell.id);
    const portas = spell.requires.map((req) => {
      const atual = getHighestUnlockedRank(character, req.treeId);
      const ok = !!atual && RANKS.indexOf(atual) >= RANKS.indexOf(req.rank);
      return {
        ok,
        nome: getTreeById(req.treeId)?.name ?? req.treeId,
        exigido: req.rank,
        atual: atual ?? "nenhum patamar",
      };
    });
    return { spell, comprada, portas, disponivel: portas.every((p) => p.ok) };
  });

  // Disponível primeiro, depois comprada, depois trancada — o que dá pra fazer
  // agora fica no topo.
  linhas.sort((a, b) => {
    const peso = (l: typeof a) => (l.comprada ? 1 : l.disponivel ? 0 : 2);
    return peso(a) - peso(b);
  });

  const abertas = linhas.filter((l) => l.disponivel && !l.comprada).length;

  return (
    <section className="mt-6 rounded-2xl border border-parchment-300 bg-parchment-100/60 p-4 dark:border-parchment-800 dark:bg-parchment-900/40">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-black text-parchment-900 dark:text-parchment-50">
          <Sparkles className="h-5 w-5 text-wine-500" /> Magias Combinadas
        </h2>
        <span className="text-xs text-parchment-600 dark:text-parchment-400">
          {abertas > 0
            ? `${abertas} disponível(is) para comprar`
            : "Abra as duas portas de uma combinação para desbloqueá-la"}
        </span>
      </header>

      <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">
        Cada uma exige <b>duas árvores em ranks específicos</b> — não basta o Avançado genérico. Elas custam
        PA como qualquer conhecimento, e entram na ficha ao serem compradas.
      </p>

      <ul className="space-y-2">
        {linhas.map(({ spell, comprada, portas, disponivel }) => (
          <li
            key={spell.id}
            className={`rounded-xl border p-3 ${
              comprada
                ? "border-emerald-400/60 bg-emerald-500/5 dark:border-emerald-800"
                : disponivel
                  ? "border-gold-400 bg-gold-500/5 dark:border-gold-700"
                  : /*
                       Trancada NÃO usa `opacity`, e essa é a diferença que a
                       varredura de contraste de 0.1.12 obrigou.

                       `opacity-70` no <li> desbota a linha INTEIRA contra o
                       pergaminho da página: texto e fundo do botão andam juntos
                       na direção do fundo, e o par que dava 4,65:1 sozinho caía
                       pra 2,6:1 dentro da linha desbotada. O pior é o que ele
                       apaga — a linha trancada é justamente a que o leitor
                       precisa LER, porque é ela que diz quais duas portas
                       faltam.

                       O recuo agora é de cor, não de opacidade: fundo mais
                       fundo que a página e nada mais. A linha continua lendo
                       como "não é pra agora" sem levar o texto junto.
                    */
                    "border-parchment-300 bg-parchment-200/50 dark:border-parchment-800 dark:bg-parchment-950/30"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-parchment-900 dark:text-parchment-50">
                  {comprada && <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-500" />}
                  {spell.name}
                  <span className="ml-2 text-xs font-normal text-parchment-600 dark:text-parchment-400">
                    {spell.paCost} PA · {spell.pmCost} PM · {spell.actions} Ações · {spell.range}
                  </span>
                </p>

                <div className="mt-1 flex flex-wrap gap-1.5">
                  {portas.map((p) => (
                    <span
                      key={p.nome}
                      title={p.ok ? `Você tem ${p.nome} no ${p.atual}` : `Você tem: ${p.atual}`}
                      className={`rounded-full px-2 py-0.5 text-2xs font-semibold ring-1 ${
                        p.ok
                          ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300"
                          : "bg-parchment-500/10 text-parchment-600 ring-parchment-400/40 dark:text-parchment-400"
                      }`}
                    >
                      {p.ok ? "✓" : "✕"} {p.nome} {p.exigido}
                    </span>
                  ))}
                </div>

                <p className="mt-1.5 text-sm leading-relaxed text-parchment-700 dark:text-parchment-300">
                  {spell.damage !== "—" && <b>{spell.damage}. </b>}
                  {spell.effect}
                </p>
              </div>

              <button
                type="button"
                disabled={!comprada && !canPurchaseCombinedSpell(character, spell.id).ok}
                onClick={() => (comprada ? remover(spell.id) : comprar(spell.id))}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  comprada
                    ? "bg-parchment-200 text-parchment-700 hover:bg-parchment-300 dark:bg-parchment-800 dark:text-parchment-300"
                    : disponivel
                      ? "bg-gold-600 text-white hover:bg-gold-500"
                      : "cursor-not-allowed bg-parchment-200 text-parchment-600 dark:bg-parchment-800 dark:text-parchment-400"
                }`}
              >
                {comprada ? "Remover" : disponivel ? `Comprar (${spell.paCost} PA)` : "Trancada"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
