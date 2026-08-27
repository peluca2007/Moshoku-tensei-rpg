import { AbilityDef, RANK_BONUS, TalentDef, Tree } from "@/lib/types";
import { CastingBreakdown, IncantationBlock, RitualBadge } from "../AbilityDetail";
import { SubTitle } from "./BookUI";

function isAbility(def: AbilityDef | TalentDef): def is AbilityDef {
  return "actions" in def;
}

function costLabel(def: AbilityDef | TalentDef) {
  const parts = [`${def.paCost} PA`];
  if (isAbility(def)) {
    if (def.pmCost) parts.push(`${def.pmCost} PM`);
    if (def.ptCost) parts.push(`${def.ptCost} PT`);
    if (def.ppCost) parts.push(`${def.ppCost} PP`);
  }
  return parts.join(" | ");
}

function EntryCard({ kind, def }: { kind: "ability" | "talent"; def: AbilityDef | TalentDef }) {
  const ability = isAbility(def) ? def : null;
  const description = isAbility(def) ? def.effect : def.description;
  return (
    <div className="rounded-lg border border-parchment-300 bg-parchment-50/80 p-3 text-sm dark:border-parchment-800 dark:bg-parchment-950/40">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-bold text-parchment-900 dark:text-parchment-50">
          {ability?.signature && <span className="text-gold-600 dark:text-gold-400">◆ </span>}
          {def.name}
          <span className="ml-1 text-xs font-normal text-parchment-500 dark:text-parchment-400">
            — {kind === "talent" ? "Talento" : "Técnica/Magia"} · {costLabel(def)}
          </span>
        </p>
        {ability && <RitualBadge ability={ability} />}
      </div>
      {ability?.range && <p className="mt-1 text-xs text-parchment-500 dark:text-parchment-400">Alcance: {ability.range}</p>}
      <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">{description}</p>
      {ability?.damage && (
        <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
          <b>Dano:</b> {ability.damage.normal}
          {ability.damage.encurtada && <> · Encurtada: {ability.damage.encurtada}</>}
        </p>
      )}
      {ability && <CastingBreakdown ability={ability} />}
      {ability && <IncantationBlock ability={ability} />}
    </div>
  );
}

/** Catálogo completo de uma árvore — todo Rank, toda Maestria, todo Talento/Técnica/Magia, direto da mesma fonte que alimenta a ficha (nunca diverge). */
export default function TreeCatalog({ tree }: { tree: Tree }) {
  const nonEmptyRanks = tree.ranks.filter((r) => r.mastery || r.talents.length > 0 || r.abilities.length > 0);
  if (nonEmptyRanks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-parchment-300 p-3 text-sm text-parchment-500 dark:border-parchment-700 dark:text-parchment-400">
        Em breve — conteúdo desta árvore ainda não foi escrito.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {nonEmptyRanks.map((rankDef) => {
        const label = tree.rankLabels?.[rankDef.rank] ?? rankDef.rank;
        return (
          <div key={rankDef.rank} className="space-y-2">
            <SubTitle id={`${tree.id}-${rankDef.rank}`}>
              {label} <span className="font-normal text-parchment-500 dark:text-parchment-400">(Bônus +{RANK_BONUS[rankDef.rank]})</span>
            </SubTitle>
            {rankDef.mastery && (
              <div className="rounded-lg border border-gold-300 bg-gold-50/60 p-3 text-sm dark:border-gold-900 dark:bg-gold-950/30">
                <p className="font-bold text-gold-700 dark:text-gold-400">◈ Maestria: {rankDef.mastery.name}</p>
                <p className="mt-1 text-gold-900/80 dark:text-gold-200/80">{rankDef.mastery.description}</p>
              </div>
            )}
            {rankDef.talents.map((t) => (
              <EntryCard key={t.id} kind="talent" def={t} />
            ))}
            {rankDef.abilities.map((a) => (
              <EntryCard key={a.id} kind="ability" def={a} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
