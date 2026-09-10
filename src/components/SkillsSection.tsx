"use client";

import { useState } from "react";
import { GraduationCap, Languages, Plus, X } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { useDiceRollerStore } from "@/store/useDiceRollerStore";
import { getBonusDePericia, getPendingTreeSkillChoices, getTreeGrantedSkills } from "@/store/selectors";
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

/**
 * Uma perícia da ficha, clicável — tocar nela abre o rolador já montado.
 *
 * O rótulo mostra o TOTAL já somado (atributo + Bônus de Rank quando a árvore
 * de Utilidade cobre aquela perícia), porque é o número que a mesa vai falar em
 * voz alta. A sigla do atributo continua ali pra dizer de onde ele vem.
 */
function BotaoDePericia({ nome, origem, semAnel }: { nome: string; origem: string; semAnel?: boolean }) {
  const character = useActiveCharacter();
  const bonus = getBonusDePericia(character, nome);
  const requestSkillRoll = useDiceRollerStore((s) => s.requestSkillRoll);
  const descricao = getSkillByName(nome)?.description;

  return (
    <button
      type="button"
      onClick={() =>
        requestSkillRoll({ nome, modificador: bonus?.total ?? 0, treinada: true })
      }
      title={[descricao, `Perícia ${origem}. Toque para rolar.`].filter(Boolean).join(" — ")}
      className={`flex min-h-[1.75rem] items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-wine-500/15 hover:text-wine-700 dark:hover:text-wine-300 ${
        semAnel
          ? "text-parchment-700 dark:text-parchment-200"
          : "bg-wine-500/10 text-wine-600 ring-1 ring-wine-500/30 dark:text-wine-300"
      }`}
    >
      {nome}
      {bonus && (
        <span className="text-3xs font-bold tabular-nums text-parchment-700 dark:text-parchment-400">
          {ATTRIBUTE_SHORT[bonus.atributo]} {bonus.total >= 0 ? "+" : ""}
          {bonus.total}
        </span>
      )}
    </button>
  );
}

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
    <section className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 dark:border-parchment-800 dark:bg-parchment-900/60">
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

      {/*
        Tocar numa perícia ROLA a perícia (0.1.32).
        
        Até aqui não existia lugar nenhum no site onde se rolasse uma perícia —
        provavelmente a rolagem mais frequente da mesa. O chip vira botão, e o
        rolador abre com a conta do Cap. 1, §4 já montada: atributo + Bônus de
        Rank da árvore de Utilidade que cobre aquela perícia, quando há.
      */}
      <div className="mb-3 flex flex-wrap gap-2">
        {fixedSkills.map((skill) => (
          <BotaoDePericia key={skill} nome={skill} origem="automática (raça/antecedente)" />
        ))}
        {manualSkills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1 rounded-full bg-parchment-900/5 px-1 py-0.5 text-xs font-medium text-parchment-700 ring-1 ring-parchment-900/10 dark:bg-white/5 dark:text-parchment-200 dark:ring-white/10"
          >
            <BotaoDePericia nome={skill} origem="comprada com PA" semAnel />
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
          <p className="text-sm italic text-parchment-600 dark:text-parchment-400">Nenhuma perícia ainda — some as fixas da raça e do antecedente aqui assim que escolher.</p>
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
          className="min-w-0 flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
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
          className="flex shrink-0 items-center gap-1 rounded-lg bg-wine-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500"
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
