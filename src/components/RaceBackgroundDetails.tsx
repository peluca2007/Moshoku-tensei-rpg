import { Sparkle } from "lucide-react";
import { Background, Race, SubtableEntry } from "@/lib/types";

function TraitList({ traits }: { traits: string[] }) {
  return (
    <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
      {traits.map((trait) => (
        <li key={trait} className="flex gap-2">
          <Sparkle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
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
      <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-slate-50">{title}</h3>
      {description && <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      {traits.length > 0 && <TraitList traits={traits} />}
      {(fixedSkills?.length || bonusSkillChoices || extra) && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
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
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <Block title={subtable.name} traits={subtable.traits} />
        </div>
      )}
    </section>
  );
}
