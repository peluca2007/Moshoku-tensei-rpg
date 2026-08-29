"use client";

import { useState } from "react";
import { GraduationCap, Languages, Plus, X } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getPendingTreeSkillChoices, getTreeGrantedSkills } from "@/store/selectors";
import { getTreeById } from "@/data/trees";
import { Background, Race } from "@/lib/types";
import { SKILLS, getSkillByName } from "@/data/skills";
import { PROFICIENCY_SUGGESTIONS } from "@/data/proficiencies";

const ATTRIBUTE_SHORT: Record<string, string> = {
  forca: "FOR",
  agilidade: "AGI",
  vigor: "VIG",
  intelecto: "INT",
  espirito: "ESP",
};

export default function SkillsSection({
  race,
  background,
  skills,
}: {
  race?: Race;
  background?: Background;
  skills: string[];
}) {
  const [draft, setDraft] = useState("");
  const [profDraft, setProfDraft] = useState("");
  const character = useActiveCharacter();

  // Cap. 1, §4: perícia automática vem de TRÊS fontes — raça, antecedente e a
  // ÁRVORE INICIAL (mais a exceção da Maestria do Ladino, que ensina a quem
  // chegou depois). Nenhuma delas gasta PA.
  const treeSkills = getTreeGrantedSkills(character);
  const fixedSkills = Array.from(
    new Set([...(race?.fixedSkills ?? []), ...(background?.fixedSkills ?? []), ...treeSkills])
  );
  const bonusChoices = (race?.bonusSkillChoices ?? 0) + (background?.bonusSkillChoices ?? 0);
  const manualSkills = skills.filter((s) => !fixedSkills.includes(s));

  const arvoreInicial = getTreeById(character.startingTreeId);
  const escolhaArvore = arvoreInicial?.grantedSkills?.choose;
  const pendentesArvore = getPendingTreeSkillChoices(character);
  const proficiencias = character.proficiencies ?? [];

  function addProficiency() {
    if (!profDraft.trim()) return;
    useCharacterStore.getState().addProficiency(profDraft.trim());
    setProfDraft("");
  }

  function addSkill() {
    if (!draft.trim()) return;
    useCharacterStore.getState().addSkill(draft.trim());
    setDraft("");
  }

  return (
    <section className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-parchment-900 dark:text-parchment-50">
        <GraduationCap className="h-5 w-5 text-wine-500" /> Perícias
      </h2>

      {bonusChoices > manualSkills.length && (
        <p className="mb-2 text-xs text-gold-700 dark:text-gold-300">
          Você ainda pode escolher {bonusChoices - manualSkills.length} perícia(s) de raça/antecedente.
        </p>
      )}

      {escolhaArvore && (
        <div className="mb-3 rounded-lg border border-gold-500/40 bg-gold-500/5 p-2.5">
          <p className="mb-1.5 text-xs font-semibold text-gold-700 dark:text-gold-300">
            {arvoreInicial?.name} ensina {escolhaArvore.count} perícia(s) à sua escolha
            {pendentesArvore > 0 && <span className="ml-1 font-bold">— falta(m) {pendentesArvore}</span>}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {escolhaArvore.from.map((nome) => {
              const idx = (character.treeSkillChoices ?? []).indexOf(nome);
              const ativo = idx !== -1;
              return (
                <button
                  key={nome}
                  type="button"
                  title={getSkillByName(nome)?.description}
                  onClick={() =>
                    useCharacterStore
                      .getState()
                      .setTreeSkillChoice(
                        ativo ? idx : (character.treeSkillChoices ?? []).length,
                        ativo ? null : nome
                      )
                  }
                  disabled={!ativo && pendentesArvore === 0}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    ativo
                      ? "bg-wine-600 text-white"
                      : "bg-parchment-200 text-parchment-700 hover:bg-parchment-300 disabled:opacity-40 dark:bg-parchment-800 dark:text-parchment-200"
                  }`}
                >
                  {nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {fixedSkills.map((skill) => (
          <span
            key={skill}
            title="Automática (raça/antecedente)"
            className="rounded-full bg-wine-500/10 px-2.5 py-1 text-xs font-medium text-wine-600 ring-1 ring-wine-500/30 dark:text-wine-300"
          >
            {skill}
          </span>
        ))}
        {manualSkills.map((skill) => (
          <span
            key={skill}
            title={getSkillByName(skill)?.description}
            className="flex items-center gap-1 rounded-full bg-parchment-900/5 px-2.5 py-1 text-xs font-medium text-parchment-700 ring-1 ring-parchment-900/10 dark:bg-white/5 dark:text-parchment-200 dark:ring-white/10"
          >
            {skill}
            {getSkillByName(skill) && (
              <span className="text-[10px] font-bold text-parchment-400 dark:text-parchment-500">
                {ATTRIBUTE_SHORT[getSkillByName(skill)!.attribute]}
              </span>
            )}
            <button
              type="button"
              onClick={() => useCharacterStore.getState().removeSkill(skill)}
              aria-label={`Remover perícia ${skill}`}
              className="text-parchment-400 hover:text-rose-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {fixedSkills.length === 0 && manualSkills.length === 0 && (
          <p className="text-sm text-parchment-600 dark:text-parchment-400">Nenhuma perícia ainda.</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          list="skill-master-list"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          placeholder="Ex: Arcanismo"
          title="Escolha da Lista Mestre (Cap. 1) ou digite uma perícia de homebrew"
          aria-label="Nova perícia"
          className="flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
        />
        <datalist id="skill-master-list">
          {SKILLS.map((s) => (
            <option key={s.name} value={s.name}>
              {ATTRIBUTE_SHORT[s.attribute]} — {s.description}
            </option>
          ))}
        </datalist>
        <button
          type="button"
          onClick={addSkill}
          className="flex items-center gap-1 rounded-lg bg-wine-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>

      {/* Cap. 1, §4: proficiência e língua são coisa diferente de perícia — mais
          estreitas, e por isso mais baratas (1 PA compra três, contra 2 perícias). */}
      <div className="mt-4 border-t border-parchment-300 pt-3 dark:border-parchment-800">
        <h3 className="mb-2 flex flex-wrap items-center gap-x-1.5 text-sm font-bold text-parchment-900 dark:text-parchment-50">
          <Languages className="h-4 w-4 text-wine-500" /> Proficiências e Línguas
          <span className="text-xs font-normal text-parchment-600 dark:text-parchment-400">
            (1 PA compra 3)
          </span>
        </h3>
        <div className="mb-2 flex flex-wrap gap-2">
          {proficiencias.map((nome) => (
            <span
              key={nome}
              className="flex items-center gap-1 rounded-full bg-gold-500/10 px-2.5 py-1 text-xs font-medium text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300"
            >
              {nome}
              <button
                type="button"
                onClick={() => useCharacterStore.getState().removeProficiency(nome)}
                aria-label={`Remover ${nome}`}
                className="text-parchment-400 hover:text-rose-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {proficiencias.length === 0 && (
            <p className="text-sm text-parchment-600 dark:text-parchment-400">
              Nenhuma proficiência ou língua ainda.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            list="proficiency-list"
            value={profDraft}
            onChange={(e) => setProfDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProficiency()}
            placeholder="Ex: Língua Élfica, Ferramentas de Ladrão"
            aria-label="Nova proficiência ou língua"
            className="min-w-0 flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
          />
          <datalist id="proficiency-list">
            {PROFICIENCY_SUGGESTIONS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.kind}
              </option>
            ))}
          </datalist>
          <button
            type="button"
            onClick={addProficiency}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-gold-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-gold-500"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
      </div>
    </section>
  );
}
