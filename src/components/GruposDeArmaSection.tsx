"use client";

import { Check, Lock, Swords } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getWeaponGroupPaCost, getWeaponGroups } from "@/store/selectors";
import { getTreeById } from "@/data/trees";
import {
  ARVORE_QUE_ESCALA_IMPROVISADO,
  GRUPO_BASE,
  GRUPOS_COMPRAVEIS,
  PA_POR_GRUPO,
  WEAPON_GROUPS,
  WeaponGroupId,
} from "@/data/weaponGroups";

/**
 * Os grupos de arma da ficha — Cap. 1, §4.
 *
 * ## Por que é uma seção própria, e não mais uma linha em Proficiências
 *
 * Proficiência de ferramenta e de língua é texto livre: ninguém calcula nada
 * com "Língua Élfica". Grupo de arma **entra numa conta** — decide Vantagem e
 * Desvantagem no acerto, decide se o escudo rende +1 ou +2 de CA, e agora
 * **custa PA**. Coisa que entra em conta precisa de lista fechada, de origem
 * visível e de um preço na cara.
 *
 * ## O que mudou em 0.1.62
 *
 * Era uma tela de ESCOLHA gratuita: um grupo livre na criação, mais um por
 * árvore do Corpo. A mesa julgou frouxo, e estava — com a regra geral de "1 PA
 * compra três proficiências" valendo aqui, dava pra colecionar três famílias
 * inteiras de arma pelo preço de metade de uma perícia.
 *
 * Agora é uma tela de COMPRA. Cada grupo custa {@link PA_POR_GRUPO} PA, e o que
 * a árvore dá continua vindo de graça — e aparece marcado como tal.
 */
export default function GruposDeArmaSection() {
  const character = useActiveCharacter();
  if (!character) return null;

  const meus = getWeaponGroups(character);
  const comprados = character.weaponGroupChoices ?? [];
  const custoTotal = getWeaponGroupPaCost(character);

  /** De onde veio este grupo: do piso, de uma árvore, ou do bolso do jogador. */
  function origem(id: WeaponGroupId): string | null {
    if (id === GRUPO_BASE) return "Todo personagem tem";
    const nomes: string[] = [];
    for (const treeId of new Set(character!.unlockedRanks.map((u) => u.treeId))) {
      const tree = getTreeById(treeId);
      if ((tree?.proficiencies?.gruposDeArma ?? []).includes(id)) nomes.push(tree!.name);
    }
    if (nomes.length) return nomes.join(" · ");
    if (comprados.includes(id)) return `Comprado — ${PA_POR_GRUPO} PA`;
    return null;
  }

  /** O grupo vem de graça de alguma árvore aberta? Aí comprar não faz sentido. */
  function vemDeArvore(id: WeaponGroupId): boolean {
    for (const treeId of new Set(character!.unlockedRanks.map((u) => u.treeId))) {
      if ((getTreeById(treeId)?.proficiencies?.gruposDeArma ?? []).includes(id)) return true;
    }
    return false;
  }

  function alternar(id: WeaponGroupId) {
    const store = useCharacterStore.getState();
    const i = comprados.indexOf(id);
    store.setWeaponGroupChoice(i >= 0 ? i : comprados.length, i >= 0 ? null : id);
  }

  const temONorte = character.unlockedRanks.some((u) => u.treeId === ARVORE_QUE_ESCALA_IMPROVISADO);

  return (
    <section className="rounded-xl border border-parchment-300 bg-parchment-100/60 p-4 dark:border-parchment-800 dark:bg-parchment-900/40">
      <h3 className="mb-1 flex flex-wrap items-center gap-x-1.5 text-sm font-bold text-parchment-900 dark:text-parchment-50">
        <Swords className="h-4 w-4 text-wine-500" /> Grupos de Arma
        <span className="text-xs font-normal text-parchment-600 dark:text-parchment-400">
          ({PA_POR_GRUPO} PA cada · Cap. 1, §4)
        </span>
        {custoTotal > 0 && (
          <span className="ml-auto rounded-full bg-wine-500/10 px-2 py-0.5 text-xs font-bold text-wine-700 dark:text-wine-300">
            {custoTotal} PA gastos
          </span>
        )}
      </h3>
      <p className="mb-3 text-xs leading-relaxed text-parchment-600 dark:text-parchment-400">
        Você empunha o que estudou. Arma fora dos seus grupos ataca com <b>Desvantagem</b> — o dano nunca
        muda. Escudo sem o grupo Escudos rende <b>+1 de CA em vez de +2</b>.
      </p>

      {/*
        A trava do improvisado tem que estar na TELA, não só no livro: ela é a
        razão de o grupo gratuito não ser o melhor do jogo, e um jogador que não
        a conhece acha que o site errou a conta do dado.
      */}
      <p className="mb-3 rounded-lg bg-parchment-200/40 px-3 py-2 text-xs leading-relaxed text-parchment-700 dark:bg-parchment-950/40 dark:text-parchment-300">
        Arma <b>improvisada</b> trava em <b>d6</b> e nunca sobe na Escada de Dados
        {temONorte ? (
          <>
            {" "}
            — mas você tem o <b>Estilo Deus do Norte</b>, a única árvore que escala improvisado como arma
            de verdade.
          </>
        ) : (
          <>. Só o Estilo Deus do Norte escapa disso.</>
        )}
      </p>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {WEAPON_GROUPS.map((g) => {
          const tem = meus.includes(g.id);
          const deOrigem = origem(g.id);
          const daArvore = vemDeArvore(g.id);
          const comprado = comprados.includes(g.id);
          // Comprável = não é o piso e a árvore ainda não deu. Um botão que
          // cobra PA por algo que já veio de graça é uma armadilha.
          const podeComprar = GRUPOS_COMPRAVEIS.includes(g.id) && !daArvore;

          const conteudo = (
            <>
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">{g.name}</span>
                {tem ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  // parchment-600, e não 500: em 11px o 500 dá 2,86:1 no tema
                  // claro, abaixo do mínimo de 4,5 do WCAG AA. É a segunda vez
                  // que este componente cai nisso — o 500 é bonito e reprova.
                  <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[11px] font-bold text-parchment-600 dark:text-parchment-400">
                    <Lock className="h-3 w-3" /> {PA_POR_GRUPO} PA
                  </span>
                )}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-parchment-600 dark:text-parchment-400">
                {g.examples.join(" · ")}
              </span>
              {deOrigem && (
                <span className="mt-1 block text-[11px] font-medium text-wine-600 dark:text-wine-300">
                  {deOrigem}
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
              {podeComprar ? (
                <button
                  type="button"
                  onClick={() => alternar(g.id)}
                  aria-pressed={comprado}
                  title={comprado ? `Devolver ${PA_POR_GRUPO} PA` : `Comprar por ${PA_POR_GRUPO} PA`}
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
