"use client";

import { Check, Swords } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import {
  getPendingWeaponGroupChoices,
  getWeaponGroupChoiceBudget,
  getWeaponGroups,
} from "@/store/selectors";
import { getTreeById } from "@/data/trees";
import {
  GRUPO_BASE,
  GRUPOS_ESCOLHIVEIS,
  WEAPON_GROUPS,
  WeaponGroupId,
} from "@/data/weaponGroups";

/**
 * Os grupos de arma da ficha — Cap. 1, §4 (0.1.52).
 *
 * ## Por que é uma seção própria, e não mais uma linha em Proficiências
 *
 * Proficiência de ferramenta e de língua é texto livre: ninguém calcula nada
 * com "Língua Élfica". Grupo de arma **entra numa conta** — decide Vantagem e
 * Desvantagem no acerto, e decide se o escudo rende +1 ou +2 de CA. Coisa que
 * entra em conta precisa de lista fechada, de origem visível ("isto veio da sua
 * árvore, aquilo você escolheu") e de um aviso quando falta escolher.
 *
 * ## Mobile
 *
 * Os grupos são cartões de toque, não um `<select>`: num celular, escolher uma
 * proficiência é uma decisão que a pessoa quer VER antes de tomar — o que cada
 * grupo cobre está escrito no cartão. Uma coluna no telefone, duas no tablet.
 */
export default function GruposDeArmaSection() {
  const character = useActiveCharacter();
  if (!character) return null;

  const meus = getWeaponGroups(character);
  const orcamento = getWeaponGroupChoiceBudget(character);
  const faltam = getPendingWeaponGroupChoices(character);
  const escolhidos = character.weaponGroupChoices ?? [];

  /** De onde veio este grupo: do piso, de uma árvore, ou da escolha do jogador. */
  function origem(id: WeaponGroupId): string | null {
    if (id === GRUPO_BASE) return "Todo personagem tem";
    const arvores = new Set(character!.unlockedRanks.map((u) => u.treeId));
    const nomes: string[] = [];
    for (const treeId of arvores) {
      const tree = getTreeById(treeId);
      if ((tree?.proficiencies?.gruposDeArma ?? []).includes(id)) nomes.push(tree!.name);
    }
    if (nomes.length) return nomes.join(" · ");
    if (escolhidos.includes(id)) return "Sua escolha";
    return null;
  }

  function alternar(id: WeaponGroupId) {
    const atual = escolhidos.indexOf(id);
    const store = useCharacterStore.getState();
    if (atual >= 0) {
      store.setWeaponGroupChoice(atual, null);
      return;
    }
    // Sem espaço no orçamento, a escolha mais antiga sai pra a nova entrar —
    // é o que a pessoa quer dizer ao tocar num grupo novo com o orçamento cheio,
    // e é menos hostil que um toque que simplesmente não faz nada.
    const cheio = escolhidos.length >= orcamento;
    store.setWeaponGroupChoice(cheio ? 0 : escolhidos.length, id);
  }

  return (
    <section className="rounded-xl border border-parchment-300 bg-parchment-100/60 p-4 dark:border-parchment-800 dark:bg-parchment-900/40">
      <h3 className="mb-1 flex flex-wrap items-center gap-x-1.5 text-sm font-bold text-parchment-900 dark:text-parchment-50">
        <Swords className="h-4 w-4 text-wine-500" /> Grupos de Arma
        <span className="text-xs font-normal text-parchment-600 dark:text-parchment-400">
          (Cap. 1, §4)
        </span>
      </h3>
      <p className="mb-3 text-xs leading-relaxed text-parchment-600 dark:text-parchment-400">
        Arma fora dos seus grupos ataca com <b>Desvantagem</b> — o dano nunca muda. Escudo sem o grupo
        Escudos rende <b>+1 de CA em vez de +2</b>.
      </p>

      {faltam > 0 && (
        <p
          role="status"
          className="mb-3 rounded-lg bg-gold-500/10 px-3 py-2 text-xs font-medium text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300"
        >
          {faltam === 1
            ? "Falta escolher 1 grupo livre."
            : `Faltam escolher ${faltam} grupos livres.`}{" "}
          Toque num cartão abaixo.
        </p>
      )}

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {WEAPON_GROUPS.map((g) => {
          const tem = meus.includes(g.id);
          const deOrigem = origem(g.id);
          const escolhivel = GRUPOS_ESCOLHIVEIS.includes(g.id);
          // Um grupo que já vem da árvore não é botão: tocar nele não muda nada,
          // e um botão que não faz nada é pior que um rótulo.
          const podeTocar = escolhivel && (escolhidos.includes(g.id) || !deOrigem || faltam > 0);

          const conteudo = (
            <>
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">{g.name}</span>
                {tem && <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-parchment-600 dark:text-parchment-400">
                {g.examples.join(" · ")}
              </span>
              {deOrigem && (
                <span className="mt-1 block text-[11px] font-medium text-wine-600 dark:text-wine-300">
                  {deOrigem}
                </span>
              )}
              {/* parchment-500 em 11px dava 2,86:1 no tema claro, abaixo do mínimo
                  de 4,5 do WCAG AA. O 600 sobe pra 4,7:1 sem mudar a hierarquia. */}
              {!tem && g.id === "escudos" && (
                <span className="mt-1 block text-[11px] leading-snug text-parchment-600 dark:text-parchment-400">
                  Só por árvore ou 1 PA — não entra na escolha livre.
                </span>
              )}
            </>
          );

          const base =
            "block w-full rounded-lg border p-2.5 text-left transition-colors min-h-11 " +
            (tem
              ? "border-emerald-500/40 bg-emerald-500/10 text-parchment-900 dark:text-parchment-50"
              : "border-parchment-300 bg-parchment-50/60 text-parchment-700 dark:border-parchment-700 dark:bg-parchment-900/40 dark:text-parchment-300");

          return (
            <li key={g.id}>
              {podeTocar ? (
                <button
                  type="button"
                  onClick={() => alternar(g.id)}
                  aria-pressed={escolhidos.includes(g.id)}
                  className={`${base} hover:border-wine-400 active:scale-[0.99]`}
                >
                  {conteudo}
                </button>
              ) : (
                <div className={base}>{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
