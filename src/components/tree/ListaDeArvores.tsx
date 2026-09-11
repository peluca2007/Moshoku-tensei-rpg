"use client";

import { useState } from "react";
import { ChevronRight, Gem, Lock, CheckCircle2 } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { canUnlockRank, getRankUnlockPaCost } from "@/store/selectors";
import { CATEGORY_LABELS, getTreeGroups, isTreeEmpty } from "@/data/trees";
import { CharacterData, RankName, Tree } from "@/lib/types";
import { RANK_ACCENT } from "@/lib/rankColors";
import TreeCrest from "@/components/TreeCrest";
import AbilityListItem from "./AbilityListItem";

/**
 * As árvores em LISTA — a navegação do celular (0.1.43).
 *
 * ## Por que ela existe
 *
 * O `DestinyBoard` é um mapa radial com pan e zoom, e é a identidade visual do
 * projeto. Ele também era a **única** forma de navegar as árvores, em qualquer
 * tela. Num celular isso quer dizer dezenove árvores e seis patamares cada,
 * espremidos em 390px, alcançados por pinça e arrasto.
 *
 * O relato que gerou esta tela foi do autor, num aparelho de verdade: *"achei
 * bem ruim navegar pelas árvores"*. Nenhum script tinha como dizer isso — o
 * `check:mobile` mede transbordo e alvo de toque, e os dois passavam. O que ele
 * não mede é quantos gestos custa chegar numa habilidade.
 *
 * ## O que ela é
 *
 * Três toques até qualquer habilidade do livro, sem gesto nenhum: **pilar →
 * árvore → patamar**. Um acordeão, que é o idioma que um polegar já conhece.
 *
 * ## O que ela NÃO é
 *
 * Uma substituta do mapa. O mapa mostra o que a lista não mostra — as pontes
 * entre árvores híbridas, a distância entre um ramo e outro, o desenho do
 * destino. Por isso as duas convivem e o botão de troca fica no topo, com o
 * mapa continuando o padrão no desktop e a lista no celular.
 */

const ORDEM_DE_RANK: RankName[] = [
  "Principiante",
  "Intermediário",
  "Avançado",
  "Santo",
  "Rei",
  "Imperador",
  "Deus",
];

function ranksDaArvore(tree: Tree): RankName[] {
  return ORDEM_DE_RANK.filter((r) => tree.ranks.some((x) => x.rank === r));
}

function compradasNaArvore(c: CharacterData, treeId: string): number {
  return c.purchasedAbilities.filter((a) => a.treeId === treeId).length;
}

function totalDaArvore(tree: Tree): number {
  return tree.ranks.reduce((n, r) => n + (r.abilities?.length ?? 0) + (r.talents?.length ?? 0), 0);
}

function rankDestravado(c: CharacterData, treeId: string, rank: RankName): boolean {
  return c.unlockedRanks.some((u) => u.treeId === treeId && u.rank === rank);
}

export default function ListaDeArvores({
  showToast,
}: {
  showToast: (msg: string, type?: "info" | "success" | "warning") => void;
}) {
  const character = useActiveCharacter();
  const [arvoreAberta, setArvoreAberta] = useState<string | null>(null);
  const [rankAberto, setRankAberto] = useState<string | null>(null);
  const grupos = getTreeGroups();

  return (
    <div className="space-y-5">
      {grupos.map((grupo) => {
        const arvores = grupo.trees.filter((t) => !isTreeEmpty(t));
        if (arvores.length === 0) return null;
        return (
          <section key={grupo.category}>
            <h2 className="mb-2 font-display text-sm font-black uppercase tracking-widest text-parchment-600 dark:text-parchment-400">
              {CATEGORY_LABELS[grupo.category] ?? grupo.category}
            </h2>

            <ul className="space-y-2">
              {arvores.map((tree) => {
                const aberta = arvoreAberta === tree.id;
                const compradas = compradasNaArvore(character, tree.id);
                const total = totalDaArvore(tree);
                return (
                  <li
                    key={tree.id}
                    className="surface overflow-hidden rounded-2xl border border-parchment-300 bg-parchment-100/70 dark:border-parchment-800 dark:bg-parchment-900/60"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setArvoreAberta(aberta ? null : tree.id);
                        setRankAberto(null);
                      }}
                      aria-expanded={aberta}
                      className="flex w-full items-center gap-3 p-3 text-left"
                    >
                      <TreeCrest tree={tree} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-base font-black text-parchment-900 dark:text-parchment-50">
                          {tree.name}
                        </span>
                        <span className="block text-2xs text-parchment-600 dark:text-parchment-400">
                          {compradas > 0 ? `${compradas} de ${total} conhecimentos` : `${total} conhecimentos`}
                        </span>
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 text-parchment-500 transition-transform ${aberta ? "rotate-90" : ""}`}
                        aria-hidden
                      />
                    </button>

                    {aberta && (
                      <div className="border-t border-parchment-300 p-3 dark:border-parchment-800">
                        {tree.prerequisiteNote && (
                          <p className="mb-2 text-2xs italic text-parchment-600 dark:text-parchment-400">
                            {tree.prerequisiteNote}
                          </p>
                        )}
                        <ul className="space-y-1.5">
                          {ranksDaArvore(tree).map((rank) => {
                            const chave = `${tree.id}/${rank}`;
                            const abertoAqui = rankAberto === chave;
                            const destravado = rankDestravado(character, tree.id, rank);
                            const rd = tree.ranks.find((r) => r.rank === rank)!;
                            const podeDestravar = canUnlockRank(character, tree.id, rank);
                            return (
                              <li key={rank}>
                                <button
                                  type="button"
                                  onClick={() => setRankAberto(abertoAqui ? null : chave)}
                                  aria-expanded={abertoAqui}
                                  className={`flex min-h-[2.75rem] w-full items-center gap-2 rounded-lg px-3 text-left text-sm ${
                                    destravado
                                      ? "bg-parchment-200/70 font-semibold text-parchment-900 dark:bg-parchment-800/60 dark:text-parchment-50"
                                      : "text-parchment-600 dark:text-parchment-400"
                                  }`}
                                >
                                  <span
                                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${RANK_ACCENT[rank]?.solidBg ?? "bg-parchment-400"}`}
                                    aria-hidden
                                  />
                                  <span className="min-w-0 flex-1 truncate">{rank}</span>
                                  {destravado ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
                                  ) : (
                                    <Lock className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
                                  )}
                                  <ChevronRight
                                    className={`h-3.5 w-3.5 shrink-0 transition-transform ${abertoAqui ? "rotate-90" : ""}`}
                                    aria-hidden
                                  />
                                </button>

                                {abertoAqui && (
                                  <div className="mt-1.5 space-y-2 pl-1">
                                    {!destravado && (
                                      <button
                                        type="button"
                                        disabled={!podeDestravar.ok}
                                        onClick={() => {
                                          useCharacterStore.getState().unlockRank(tree.id, rank);
                                          showToast(`${tree.name} — ${rank} destravado!`, "success");
                                        }}
                                        aria-label={`Destravar ${rank} de ${tree.name} por ${getRankUnlockPaCost(tree.id, rank)} PA`}
                                        className="flex min-h-[2.5rem] w-full items-center justify-center gap-1.5 rounded-lg bg-gold-600 px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        <Gem className="h-3.5 w-3.5" aria-hidden />
                                        Destravar ({getRankUnlockPaCost(tree.id, rank)} PA)
                                      </button>
                                    )}
                                    {!podeDestravar.ok && !destravado && podeDestravar.reason && (
                                      <p className="text-2xs text-rose-500">{podeDestravar.reason}</p>
                                    )}

                                    {/*
                                      As habilidades saem do MESMO componente que
                                      o mapa usa. Duas telas que compram a mesma
                                      coisa por caminhos diferentes divergem em
                                      silêncio, e o que divergiria é o custo em
                                      PA e o motivo de o botão estar desligado.
                                    */}
                                    {(rd.abilities ?? []).map((def) => (
                                      <AbilityListItem
                                        key={def.id}
                                        character={character}
                                        treeId={tree.id}
                                        rank={rank}
                                        kind="ability"
                                        def={def}
                                        showToast={showToast}
                                      />
                                    ))}
                                    {(rd.talents ?? []).map((def) => (
                                      <AbilityListItem
                                        key={def.id}
                                        character={character}
                                        treeId={tree.id}
                                        rank={rank}
                                        kind="talent"
                                        def={def}
                                        showToast={showToast}
                                      />
                                    ))}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
