"use client";

import { Check, Sparkle } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getPendingRaceAttributeChoices, hasRacialUpgrade } from "@/store/selectors";
import { ATTRIBUTES, AttributeKey, Background, Race, SubtableEntry } from "@/lib/types";
import RaceCrest from "./RaceCrest";

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
  crest,
}: {
  title: string;
  description?: string;
  traits: string[];
  fixedSkills?: string[];
  bonusSkillChoices?: number;
  extra?: string;
  /** Retrato, quando o bloco descreve uma raça. Antecedente não tem arte. */
  crest?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        {crest}
        <h3 className="text-sm font-bold text-parchment-900 dark:text-parchment-50">{title}</h3>
      </div>
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

/**
 * Duas escolhas raciais que não são texto: o +1 livre do Humano e a compra de
 * 3 PA do Povo Pequeno (2026-08-29). Ficam aqui, e não no assistente de criação,
 * porque este bloco é o único que as quatro vias (Manual, Roleta, Entrevista e a
 * própria ficha) já renderizam — um jogador que caiu de Humano na Roleta precisa
 * conseguir escolher o atributo sem voltar pro assistente.
 */
function RaceChoices({ race }: { race: Race }) {
  const character = useActiveCharacter();
  const setChoice = useCharacterStore((s) => s.setRaceAttributeChoice);
  const toggleUpgrade = useCharacterStore((s) => s.toggleRacialUpgrade);

  const total = race.attributeChoices ?? 0;
  const pendentes = getPendingRaceAttributeChoices(character);
  const escolhas = character.raceAttributeChoices ?? [];
  const upgrades = race.upgrades ?? [];

  if (total === 0 && upgrades.length === 0) return null;

  return (
    <div className="mt-3 space-y-3 border-t border-parchment-300 pt-3 dark:border-parchment-800">
      {total > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
            Bônus livre de raça
            {pendentes > 0 && (
              <span className="ml-2 rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-bold normal-case text-gold-600 dark:text-gold-400">
                {pendentes} ponto(s) a distribuir
              </span>
            )}
          </p>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-parchment-600 dark:text-parchment-400">+1 em</span>
              {ATTRIBUTES.map(({ key, label, short }) => {
                const ativo = escolhas[i] === key;
                return (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    onClick={() => setChoice(i, ativo ? null : (key as AttributeKey))}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                      ativo
                        ? "bg-wine-600 text-white"
                        : "bg-parchment-200 text-parchment-700 hover:bg-parchment-300 dark:bg-parchment-800 dark:text-parchment-200 dark:hover:bg-parchment-700"
                    }`}
                  >
                    {short}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {upgrades.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
            Melhoria racial (custa PA)
          </p>
          {upgrades.map((u) => {
            const comprado = hasRacialUpgrade(character, u.id);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleUpgrade(u.id)}
                className={`flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                  comprado
                    ? "border-wine-500 bg-wine-500/10 text-parchment-800 dark:text-parchment-100"
                    : "border-parchment-300 text-parchment-600 hover:border-wine-400 dark:border-parchment-700 dark:text-parchment-400"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    comprado ? "border-wine-500 bg-wine-600 text-white" : "border-parchment-400"
                  }`}
                >
                  {comprado && <Check className="h-3 w-3" />}
                </span>
                <span>
                  <b>{u.name}</b> <span className="text-gold-600 dark:text-gold-400">({u.paCost} PA)</span> —{" "}
                  {u.description}
                </span>
              </button>
            );
          })}
        </div>
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
            crest={<RaceCrest race={race} size={40} />}
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
      {race && <RaceChoices race={race} />}
      {subtable && (
        <div className="mt-3 border-t border-parchment-300 pt-3 dark:border-parchment-800">
          <Block title={subtable.name} traits={subtable.traits} />
        </div>
      )}
    </section>
  );
}
