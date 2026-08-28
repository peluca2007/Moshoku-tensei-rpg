"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, ScrollText } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getRaceById, RACES } from "@/data/races";
import { getBackgroundById, getSubtableEntryById, BACKGROUNDS } from "@/data/backgrounds";
import { drawInterviewQuestions, resolveInterview, InterviewQuestion, InterviewOption } from "@/data/interview";
import { rollRandomAttributes, rollRandomSubtableEntry } from "@/lib/randomCharacter";
import { ATTRIBUTES } from "@/lib/types";
import RaceBackgroundDetails from "./RaceBackgroundDetails";
import SkillsSection from "./SkillsSection";
import TreePicker from "./TreePicker";

const RACE_IDS = RACES.map((r) => r.id);
const BACKGROUND_IDS = BACKGROUNDS.map((b) => b.id);

type Phase = "perguntas" | "arvore" | "pericias" | "pronto";

export default function CreationInterview() {
  const router = useRouter();
  const startedCreation = useRef(false);
  const [questions] = useState<InterviewQuestion[]>(() => drawInterviewQuestions());
  const [answers, setAnswers] = useState<InterviewOption[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("perguntas");

  useEffect(() => {
    if (startedCreation.current) return;
    startedCreation.current = true;
    useCharacterStore.getState().createCharacter();
  }, []);

  const character = useActiveCharacter();
  const race = getRaceById(character.raceId);
  const background = getBackgroundById(character.backgroundId);
  const chosenSubtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, character.subtableEntryId)
    : undefined;

  function answer(option: InterviewOption) {
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1);
      return;
    }
    // Última pergunta: resolve o Destino e já aplica raça, antecedente e atributos sorteados.
    const result = resolveInterview(nextAnswers, RACE_IDS, BACKGROUND_IDS);
    useCharacterStore.getState().setRace(result.raceId);
    useCharacterStore.getState().setBackground(result.backgroundId);
    const resultBackground = BACKGROUNDS.find((b) => b.id === result.backgroundId);
    if (resultBackground?.requiresSubtable) {
      useCharacterStore.getState().setSubtableEntry(rollRandomSubtableEntry(resultBackground.requiresSubtable));
    }
    const attrs = rollRandomAttributes();
    for (const { key } of ATTRIBUTES) {
      useCharacterStore.getState().setAttribute(key, attrs[key]);
    }
    setPhase("arvore");
  }

  function backOneQuestion() {
    if (questionIndex === 0) return;
    setQuestionIndex((i) => i - 1);
    setAnswers((prev) => prev.slice(0, -1));
  }

  function selectStartingTree(treeId: string) {
    useCharacterStore.getState().setStartingTree(treeId);
    if (!character.unlockedRanks.some((u) => u.treeId === treeId && u.rank === "Principiante")) {
      useCharacterStore.getState().unlockRank(treeId, "Principiante");
    }
  }

  const progress =
    phase === "perguntas" ? questionIndex / questions.length : phase === "arvore" ? 0.7 : phase === "pericias" ? 0.85 : 1;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <ScrollText className="h-6 w-6 text-wine-500" /> Via 3 — A Entrevista (O Destino)
        </h1>
        <p className="mt-1 text-sm text-parchment-500 dark:text-parchment-400">
          Perguntas sobre uma infância que não é bem a sua — mas que decide, junto com um pouco de sorte, quem
          seu personagem nasceu sendo.
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-parchment-300 dark:bg-parchment-800">
          <div className="h-full rounded-full bg-wine-500 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </header>

      <div className="min-h-[22rem] rounded-2xl border border-parchment-300 bg-parchment-100/70 p-5 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
        {phase === "perguntas" && (
          <div key={questionIndex} className="animate-fade-slide-in">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-parchment-500 dark:text-parchment-400">
              Pergunta {questionIndex + 1} de {questions.length}
            </p>
            <h2 className="mb-4 text-lg font-bold text-parchment-900 dark:text-parchment-50">
              {questions[questionIndex].prompt}
            </h2>
            <div className="space-y-2">
              {questions[questionIndex].options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => answer(option)}
                  className="w-full rounded-xl border border-parchment-300 bg-parchment-50 p-3 text-left text-sm text-parchment-700 transition-colors hover:border-wine-400 hover:bg-wine-50 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-200 dark:hover:bg-wine-950/30"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "arvore" && (
          <div>
            <div className="relative mb-4 overflow-hidden rounded-xl bg-wine-500/10 p-3 text-sm text-wine-700 dark:text-wine-300">
              <div
                className="animate-birth-flash pointer-events-none absolute inset-0 rounded-full bg-gold-400/40 blur-xl"
                aria-hidden
              />
              <div className="animate-birth-reveal relative">
                O Destino falou: <b>{race?.name}</b>, <b>{background?.name}</b>.
              </div>
            </div>
            <RaceBackgroundDetails race={race} background={background} subtable={chosenSubtable} />
            <h2 className="mb-1 mt-4 text-lg font-bold text-parchment-900 dark:text-parchment-50">Escolha sua Árvore Inicial</h2>
            <p className="mb-3 text-sm text-parchment-500 dark:text-parchment-400">
              Cap. 1, seção 4 — desbloqueia o 1º patamar dela de graça e libera um kit de equipamento inicial.
            </p>
            <TreePicker selectedTreeId={character.startingTreeId} onSelect={selectStartingTree} />
            <button
              type="button"
              onClick={() => setPhase("pericias")}
              disabled={!character.startingTreeId}
              className="mt-4 w-full rounded-lg bg-wine-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Avançar
            </button>
          </div>
        )}

        {phase === "pericias" && (
          <div>
            <SkillsSection race={race} background={background} skills={character.skills} />
            <button
              type="button"
              onClick={() => setPhase("pronto")}
              className="mt-4 w-full rounded-lg bg-wine-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-wine-500"
            >
              Avançar
            </button>
          </div>
        )}

        {phase === "pronto" && (
          <div className="animate-birth-reveal flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-wine-500" />
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">
              {character.name || "Seu personagem"} tem uma história agora.
            </h2>
            <p className="mb-5 text-sm text-parchment-500 dark:text-parchment-400">
              Dê um nome a ele e ajuste qualquer detalhe livremente na ficha completa.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg bg-wine-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-wine-500"
            >
              Ir para a Ficha
            </button>
          </div>
        )}
      </div>

      {phase === "perguntas" && questionIndex > 0 && (
        <button
          type="button"
          onClick={backOneQuestion}
          className="mt-4 flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-1.5 text-sm font-medium text-parchment-600 transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
        >
          <ChevronLeft className="h-4 w-4" /> Pergunta anterior
        </button>
      )}
    </div>
  );
}
