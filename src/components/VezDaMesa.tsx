"use client";

import Link from "next/link";
import { ChevronRight, SkipForward } from "lucide-react";
import { useInitiativeStore } from "@/store/useInitiativeStore";

/**
 * De quem é a vez, dentro da ficha — herdado do Modo Mesa (0.1.36).
 *
 * ## Por que isto existe fora do /iniciativa
 *
 * Durante um turno a pessoa olha a ficha: é onde estão as reservas, as
 * condições e o que ela pode fazer. O contexto que faltava ali era o único que
 * não é dela — de quem é a vez —, e buscá-lo custava uma troca de rota e a
 * perda do lugar onde ela estava na ficha. Esta faixa era a razão de existir do
 * Modo Mesa; ela sobreviveu à tela.
 *
 * ## Por que ela DESAPARECE fora de combate
 *
 * O Modo Mesa mostrava "Nenhum combate rolando" porque a tela inteira era
 * daquilo. Aqui não: numa ficha, uma faixa permanente anunciando ausência de
 * combate seria ruído no topo de tudo que se lê pra montar personagem. Sem
 * ordem montada, o componente não rende nada — e volta sozinho no instante em
 * que alguém monta a iniciativa.
 */
export default function VezDaMesa() {
  const combatants = useInitiativeStore((s) => s.combatants);
  const round = useInitiativeStore((s) => s.round);
  const currentTurnId = useInitiativeStore((s) => s.currentTurnId);

  const ordem = [...combatants].sort((a, b) => b.initiative - a.initiative);
  if (ordem.length === 0) return null;

  const vez = ordem.find((c) => c.id === currentTurnId);
  const proximo = vez ? ordem[(ordem.indexOf(vez) + 1) % ordem.length] : ordem[0];

  return (
    <section className="print-hide rounded-2xl border border-parchment-300 bg-parchment-100/70 p-3 dark:border-parchment-800 dark:bg-parchment-900/60">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
            Rodada {round} · agora é a vez de
          </p>
          {/*
            Região viva: quem só ouve precisa saber que a vez passou sem ter que
            caçar o foco de volta. `atomic` porque o nome sozinho não diz nada —
            o que importa é "a vez agora é de X".
          */}
          <p
            aria-live="polite"
            aria-atomic="true"
            className="truncate font-display text-lg font-black text-wine-700 dark:text-wine-300"
          >
            {vez?.name ?? "—"}
          </p>
          {proximo && proximo.id !== vez?.id && (
            <p className="flex items-center gap-1 text-2xs text-parchment-600 dark:text-parchment-400">
              <ChevronRight className="h-3 w-3" aria-hidden /> depois: {proximo.name}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => useInitiativeStore.getState().nextTurn()}
            className="flex min-h-[2.75rem] items-center gap-1.5 rounded-full bg-wine-600 px-4 text-sm font-bold text-white hover:bg-wine-500"
          >
            <SkipForward className="h-4 w-4" aria-hidden /> Passar
          </button>
          {/*
            Alvo de toque de verdade, e não um link de 16px: é link solto (os que
            vivem dentro de frase o critério 2.5.8 isenta), e foi assim que o
            `check:mobile` pegou o equivalente dele no Modo Mesa.
          */}
          <Link
            href="/iniciativa"
            className="flex min-h-[2rem] items-center rounded-full px-2 text-2xs font-semibold text-parchment-600 underline-offset-2 hover:text-wine-600 hover:underline dark:text-parchment-400"
          >
            A ordem toda →
          </Link>
        </div>
      </div>
    </section>
  );
}
