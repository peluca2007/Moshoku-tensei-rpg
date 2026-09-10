import { AbilityDef, RankName, TalentDef } from "@/lib/types";
import { CastingBreakdown, IncantationBlock, RitualBadge } from "../AbilityDetail";

export function isAbility(def: AbilityDef | TalentDef): def is AbilityDef {
  return "actions" in def;
}

export function costLabel(def: AbilityDef | TalentDef) {
  const parts = [`${def.paCost} PA`];
  if (isAbility(def)) {
    if (def.pmCost) parts.push(`${def.pmCost} PM`);
    if (def.ptCost) parts.push(`${def.ptCost} PT`);
    if (def.ppCost) parts.push(`${def.ppCost} PP`);
  }
  return parts.join(" | ");
}

/**
 * O card de UMA entrada de árvore — talento, técnica ou magia — com tudo que a
 * mesa precisa ler no meio do turno: custo, alcance, efeito, dano, as três
 * formas de conjurar e o cântico.
 *
 * Ele morava dentro do `TreeCatalog` até 0.1.17, quando a busca global passou a
 * precisar do mesmo card fora do livro. Copiar teria criado a única coisa pior
 * que um card feio: dois cards que divergem — um mostrando a Recitação Perfeita
 * e o outro não, pra mesma magia, em duas telas do mesmo site.
 */
export default function EntryCard({
  kind,
  def,
  rank,
}: {
  kind: "ability" | "talent";
  def: AbilityDef | TalentDef;
  rank: RankName;
}) {
  const ability = isAbility(def) ? def : null;
  const description = isAbility(def) ? def.effect : def.description;
  return (
    <div className="print-avoid-break rounded-lg border border-parchment-300 bg-parchment-50/80 p-3 text-sm dark:border-parchment-800 dark:bg-parchment-950/40">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-bold text-parchment-900 dark:text-parchment-50">
          {ability?.signature && <span className="text-gold-600 dark:text-gold-400">◆ </span>}
          {def.name}
          <span className="ml-1 text-xs font-normal text-parchment-600 dark:text-parchment-400">
            — {kind === "talent" ? "Talento" : "Técnica/Magia"} · {costLabel(def)}
          </span>
        </p>
        {ability && <RitualBadge ability={ability} />}
      </div>
      {ability?.range && <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">Alcance: {ability.range}</p>}
      <p className="mt-1 leading-relaxed text-parchment-700 dark:text-parchment-300">{description}</p>
      {ability?.damage && (
        <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
          <b>Dano:</b> {ability.damage.normal}
          {ability.damage.encurtada && <> · Encurtada: {ability.damage.encurtada}</>}
        </p>
      )}
      {ability && <CastingBreakdown ability={ability} />}
      {ability && <IncantationBlock ability={ability} rank={rank} />}
    </div>
  );
}
