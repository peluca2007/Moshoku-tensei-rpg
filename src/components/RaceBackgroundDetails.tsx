import { Sparkle } from "lucide-react";
import { Background, Race, SubtableEntry } from "@/lib/types";

function TraitList({ traits }: { traits: string[] }) {
  return (
    <ul className="space-y-1 text-sm text-parchment-700 dark:text-parchment-300">
      {traits.map((trait) => (
        <li key={trait} className="flex gap-2">
          <Sparkle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wine-500" />
          <span>{trait}</span>
        </li>
      ))}
    </ul>
  );
}

function Block({
  title,
  description,
  traits,
  fixedSkills,
  bonusSkillChoices,
  extra,
}: {
  title: string;
  description?: string;
  traits: string[];
  fixedSkills?: string[];
  bonusSkillChoices?: number;
  extra?: string;
}) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-bold text-parchment-900 dark:text-parchment-50">{title}</h3>
      {description && <p className="mb-2 text-xs text-parchment-600 dark:text-parchment-400">{description}</p>}
      {traits.length > 0 && <TraitList traits={traits} />}
      {(fixedSkills?.length || bonusSkillChoices || extra) && (
        <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
          {fixedSkills?.length ? `Perícia(s) fixa(s): ${fixedSkills.join(", ")}. ` : ""}
          {bonusSkillChoices ? `+${bonusSkillChoices} perícia(s) à escolha. ` : ""}
          {extra ?? ""}
        </p>
      )}
    </div>
  );
}

export default function RaceBackgroundDetails({
  race,
  background,
  subtable,
}: {
  race?: Race;
  background?: Background;
  subtable?: SubtableEntry;
}) {
  if (!race && !background) return null;

  return (
    <section className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
        Passivas de Raça &amp; Antecedente
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {race && (
          <Block
            title={race.name}
            description={race.description}
            traits={race.traits}
            fixedSkills={race.fixedSkills}
            bonusSkillChoices={race.bonusSkillChoices}
          />
        )}
        {background && (
          <Block
            title={background.name}
            traits={background.traits}
            fixedSkills={background.fixedSkills}
            bonusSkillChoices={background.bonusSkillChoices}
            extra={`Dinheiro inicial: ${background.startingGold} PO.`}
          />
        )}
      </div>
      {subtable && (
        <div className="mt-3 border-t border-parchment-300 pt-3 dark:border-parchment-800">
          <Block title={subtable.name} traits={subtable.traits} />
        </div>
      )}
    </section>
  );
}
