"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Sparkles, Check } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { RACES, getRaceById } from "@/data/races";
import { BACKGROUNDS, SUBTABLES, getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import { getTreeById } from "@/data/trees";
import { getStartingKit } from "@/data/startingKits";
import { ATTRIBUTES, ATTRIBUTE_CREATION_MAX, ATTRIBUTE_FLOOR, AttributeKey, getVigorFactor } from "@/lib/types";
import RaceBackgroundDetails from "./RaceBackgroundDetails";
import SkillsSection from "./SkillsSection";
import TreePicker from "./TreePicker";

const STEPS = ["Nome", "Raça", "Antecedente", "Atributos", "Árvore Inicial", "Perícias", "Equipamento", "Pronto"];

function attributeBudget(base: Record<AttributeKey, number>) {
  const values = Object.values(base);
  const hasMinusOne = values.some((v) => v === -1);
  const hasMinusTwo = values.some((v) => v === -2);
  const budget = 4 + (hasMinusOne ? 1 : 0) + (hasMinusTwo ? 2 : 0);
  const spent = values.reduce((sum, v) => sum + Math.max(0, v), 0);
  return { budget, spent, remaining: budget - spent };
}

export default function CreationWizard() {
  const router = useRouter();
  const startedCreation = useRef(false);

  useEffect(() => {
    if (startedCreation.current) return;
    startedCreation.current = true;
    useCharacterStore.getState().createCharacter();
  }, []);

  const character = useActiveCharacter();
  const [step, setStep] = useState(0);

  const race = getRaceById(character.raceId);
  const background = getBackgroundById(character.backgroundId);
  const subtableOptions =
    background?.requiresSubtable ? SUBTABLES[background.requiresSubtable].entries : null;
  const chosenSubtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, character.subtableEntryId)
    : undefined;
  const startingTree = getTreeById(character.startingTreeId);
  const startingKit = startingTree ? getStartingKit(startingTree.subgroup) : undefined;
  const { budget, remaining } = attributeBudget(character.attributeBase);

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function adjustAttribute(key: AttributeKey, delta: number) {
    const current = character.attributeBase[key] ?? 0;
    const nextValue = current + delta;
    if (nextValue < ATTRIBUTE_FLOOR || nextValue > ATTRIBUTE_CREATION_MAX) return;
    if (nextValue === -1 && Object.entries(character.attributeBase).some(([k, v]) => k !== key && v === -1)) return;
    if (nextValue === -2 && Object.entries(character.attributeBase).some(([k, v]) => k !== key && v === -2)) return;
    if (delta > 0 && remaining <= 0) return;
    useCharacterStore.getState().setAttribute(key, nextValue);
  }

  function selectStartingTree(treeId: string) {
    useCharacterStore.getState().setStartingTree(treeId);
  }

  function addKit() {
    if (!startingKit) return;
    for (const item of startingKit.items) useCharacterStore.getState().addItem(item);
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <Sparkles className="h-6 w-6 text-wine-500" /> Criação Guiada
        </h1>
        <div className="mt-3 flex items-center gap-1">
          {STEPS.map((label, i) => (
            <div
              key={label}
              title={label}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-wine-500" : "bg-parchment-300 dark:bg-parchment-800"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-medium text-parchment-600 dark:text-parchment-400">
          Passo {step + 1} de {STEPS.length} — {STEPS[step]}
        </p>
      </header>

      <div className="min-h-[22rem] rounded-2xl border border-parchment-300 bg-parchment-100/70 p-5 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
        {step === 0 && (
          <div>
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Qual é o nome do seu personagem?</h2>
            <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">Pode trocar depois, a qualquer momento, na ficha.</p>
            <input
              autoFocus
              value={character.name}
              onChange={(e) => useCharacterStore.getState().setName(e.target.value)}
              placeholder="Nome do personagem"
              className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-lg outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Escolha uma raça</h2>
              <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">Cap. 1, seção 5 — cada raça dá perícias e traços próprios.</p>
              <select
                value={character.raceId ?? ""}
                onChange={(e) => useCharacterStore.getState().setRace(e.target.value || null)}
                className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
              >
                <option value="">Escolha...</option>
                {RACES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            {race && <RaceBackgroundDetails race={race} />}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Escolha um antecedente</h2>
              <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">Cap. 1, seção 6 — o Destino e a Infância. Define dinheiro inicial e perícias extras.</p>
              <select
                value={character.backgroundId ?? ""}
                onChange={(e) => useCharacterStore.getState().setBackground(e.target.value || null)}
                className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
              >
                <option value="">Escolha...</option>
                {BACKGROUNDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            {subtableOptions && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-gold-600 dark:text-gold-400">Resultado da subtabela</label>
                <select
                  value={character.subtableEntryId ?? ""}
                  onChange={(e) => useCharacterStore.getState().setSubtableEntry(e.target.value || null)}
                  className="w-full rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-gold-700 outline-none dark:text-gold-300"
                >
                  <option value="">Escolher resultado...</option>
                  {subtableOptions.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.roll}. {entry.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {background && <RaceBackgroundDetails background={background} subtable={chosenSubtable} />}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Distribua seus atributos</h2>
            <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">
              Cap. 1, seção 1 — 4 pontos pra distribuir, máximo {ATTRIBUTE_CREATION_MAX} por atributo na criação. Reduzir um atributo a -1 dá +1
              ponto extra; reduzir um (outro) a -2 dá +2 pontos extras. Depois da criação, cada ponto novo custa 2 PA —
              inclusive pra desfazer um defeito.
            </p>
            {/* Vigor não governa perícia nenhuma (Cap. 1, §4), então era o dump stat ótimo de toda ficha. A Escala do Vigor (Cap. 4) é o contrapeso, e o jogador precisa vê-la ANTES de largar o atributo, não depois. */}
            {(character.attributeBase.vigor ?? 0) < 0 && (
              <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
                <b>Vigor {character.attributeBase.vigor}</b> — a Escala do Vigor (Cap. 4) multiplica seus PV Máximos por{" "}
                <b>×{getVigorFactor(character.attributeBase.vigor ?? 0).toFixed(2).replace(".", ",")}</b>, e o corte não é
                linear: o 1º ponto negativo tira 25% da sua vida, o 2º tira quase metade do que sobrou. Você também joga
                com Desvantagem em toda resistência de Vigor — veneno, doença, clima, Exaustão e o Fio da Vida.
              </p>
            )}
            <p
              className={`mb-3 text-sm font-bold ${remaining < 0 ? "text-rose-600 dark:text-rose-400" : "text-wine-600 dark:text-wine-300"}`}
            >
              Pontos restantes: {remaining} de {budget}
            </p>
            <div className="space-y-2">
              {ATTRIBUTES.map(({ key, label }) => {
                const value = character.attributeBase[key] ?? 0;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg bg-parchment-50 px-3 py-2 dark:bg-parchment-900"
                  >
                    <span className="font-medium text-parchment-800 dark:text-parchment-200">{label}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => adjustAttribute(key, -1)}
                        aria-label={`Diminuir ${label}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-parchment-200 font-bold text-parchment-700 hover:bg-parchment-300 dark:bg-parchment-800 dark:text-parchment-200"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-lg font-black text-parchment-900 dark:text-parchment-50">{value}</span>
                      <button
                        type="button"
                        onClick={() => adjustAttribute(key, 1)}
                        aria-label={`Aumentar ${label}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-wine-500/20 font-bold text-wine-700 hover:bg-wine-500/30 dark:text-wine-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Escolha sua Árvore Inicial</h2>
            <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">
              Cap. 1, seção 4 — desbloqueia o 1º patamar dela de graça e libera um kit de equipamento inicial.
            </p>
            <TreePicker selectedTreeId={character.startingTreeId} onSelect={selectStartingTree} />
          </div>
        )}

        {step === 5 && (
          <SkillsSection race={race} background={background} skills={character.skills} />
        )}

        {step === 6 && (
          <div>
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Equipamento inicial</h2>
            <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">
              O dinheiro do seu antecedente ({background?.startingGold ?? "—"} PO) soma com o kit de graça da sua Árvore Inicial — não é
              um ou outro.
            </p>
            {startingKit ? (
              <div className="rounded-xl bg-parchment-50 p-3 dark:bg-parchment-900">
                <p className="mb-2 text-sm font-semibold text-parchment-800 dark:text-parchment-100">
                  Kit de {startingTree?.subgroup}
                </p>
                <ul className="mb-3 space-y-0.5 text-xs text-parchment-600 dark:text-parchment-400">
                  {startingKit.items.map((item) => (
                    <li key={item.name}>· {item.name}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={addKit}
                  className="flex items-center gap-1 rounded-lg bg-wine-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-wine-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Kit Inicial ao Inventário
                </button>
              </div>
            ) : (
              <p className="text-sm text-parchment-600 dark:text-parchment-400">
                Volte e escolha uma Árvore Inicial pra liberar um kit de graça — ou pule esta etapa e monte o inventário direto na ficha.
              </p>
            )}
          </div>
        )}

        {step === 7 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Check className="mb-3 h-10 w-10 text-wine-500" />
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">
              {character.name || "Seu personagem"} está pronto pra jogar.
            </h2>
            <p className="mb-5 text-sm text-parchment-600 dark:text-parchment-400">
              Tudo aqui pode ser reeditado livremente na ficha completa a qualquer momento.
            </p>
            <button
              type="button"
              onClick={() => router.push("/ficha")}
              className="rounded-lg bg-wine-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-wine-500"
            >
              Ir para a Ficha
            </button>
          </div>
        )}
      </div>

      {step < STEPS.length - 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-1.5 text-sm font-medium text-parchment-600 transition-colors hover:bg-parchment-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-1 rounded-lg bg-wine-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500"
          >
            Avançar <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
