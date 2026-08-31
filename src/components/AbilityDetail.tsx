import { AbilityDef } from "@/lib/types";

function actionText(n: number) {
  return n === 0 ? "Passivo" : `${n} Ação${n > 1 ? "ões" : ""}`;
}

/**
 * Cap. 2, seção 2-3: toda magia pode ser conjurada de três formas (Padrão,
 * Encurtada, Silenciosa), cada uma com seu próprio custo de Ações. Isso só
 * se aplica a magias (actions.encurtada/silenciosa vêm de MAGIC_ACTIONS) —
 * técnicas marciais e de Utilidade só têm a coluna "Padrão".
 */
export function CastingBreakdown({ ability }: { ability: AbilityDef }) {
  const { actions } = ability;
  const hasCasting = actions.encurtada !== undefined || actions.silenciosa !== undefined;
  if (ability.reaction || !hasCasting) return null;

  return (
    <dl className="mt-1.5 grid grid-cols-1 gap-x-3 gap-y-0.5 border-t border-dashed border-parchment-300 pt-1.5 text-[11px] text-parchment-600 dark:border-parchment-800 dark:text-parchment-400 sm:grid-cols-3">
      <div>
        <dt className="inline font-semibold text-parchment-600 dark:text-parchment-300">Padrão </dt>
        <dd className="inline">{actionText(actions.normal)} · dano cheio</dd>
      </div>
      <div>
        <dt className="inline font-semibold text-parchment-600 dark:text-parchment-300">Encurtada </dt>
        <dd className="inline">
          {ability.ritual
            ? "Ritual — impossível"
            : actions.encurtada !== undefined
              ? `${actionText(actions.encurtada)} · metade dos dados, área -1/3`
              : "Impossível (rank Imperador)"}
        </dd>
      </div>
      {actions.silenciosa !== undefined && (
        <div>
          <dt className="inline font-semibold text-parchment-600 dark:text-parchment-300">Silenciosa </dt>
          <dd className="inline">
            {typeof actions.silenciosa === "number" ? actionText(actions.silenciosa) : "1 Reação"} · dano da
            Encurtada + 1 benefício (dobrar alcance, mudar forma, ou segurar até 1 turno)
          </dd>
        </div>
      )}
    </dl>
  );
}

/** Cap. 2: o verso recitado ao conjurar. Puramente de sabor — não afeta a mecânica. */
export function IncantationBlock({ ability }: { ability: AbilityDef }) {
  if (!ability.incantation) return null;
  return (
    <p className="mt-1.5 border-l-2 border-wine-300/70 pl-2 text-[11px] italic text-parchment-600 dark:border-wine-800 dark:text-parchment-400">
      “{ability.incantation}”
    </p>
  );
}

/** Selo curto pra Ritual, quando a magia não puder ser encurtada nem interrompida pela metade sem consequência. */
export function RitualBadge({ ability }: { ability: AbilityDef }) {
  if (!ability.ritual) return null;
  return (
    <span className="shrink-0 rounded-full bg-gold-500/10 px-2 py-0.5 text-[10px] font-semibold text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300">
      Ritual
    </span>
  );
}
