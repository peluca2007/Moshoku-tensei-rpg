"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Dices, Sparkles } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getRaceById } from "@/data/races";
import { getBackgroundById } from "@/data/backgrounds";
import { rollRandomCharacter } from "@/lib/randomCharacter";
import { ATTRIBUTES } from "@/lib/types";
import RaceBackgroundDetails from "./RaceBackgroundDetails";
import SkillsSection from "./SkillsSection";
import TreePicker from "./TreePicker";

const STEPS = ["Árvore Inicial", "Perícias", "Girar o Destino", "Pronto"];

export default function CreationRoulette() {
  const router = useRouter();
  const startedCreation = useRef(false);

  useEffect(() => {
    if (startedCreation.current) return;
    startedCreation.current = true;
    useCharacterStore.getState().createCharacter();
  }, []);

  const character = useActiveCharacter();
  const [step, setStep] = useState(0);
  const [hasRolled, setHasRolled] = useState(false);

  const race = getRaceById(character.raceId);
  const background = getBackgroundById(character.backgroundId);

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function selectStartingTree(treeId: string) {
    useCharacterStore.getState().setStartingTree(treeId);
    if (!character.unlockedRanks.some((u) => u.treeId === treeId && u.rank === "Principiante")) {
      useCharacterStore.getState().unlockRank(treeId, "Principiante");
    }
  }

  function spin() {
    const result = rollRandomCharacter();
    useCharacterStore.getState().setRace(result.raceId);
    useCharacterStore.getState().setBackground(result.backgroundId);
    for (const { key } of ATTRIBUTES) {
      useCharacterStore.getState().setAttribute(key, result.attributeBase[key]);
    }
    setHasRolled(true);
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <Dices className="h-6 w-6 text-wine-500" /> Via 2 — Roleta do Destino
        </h1>
        <p className="mt-1 text-sm text-parchment-500 dark:text-parchment-400">
          Você escolhe sua Árvore Inicial e suas Perícias. Raça, Antecedente e Atributos ficam por conta do
          nascimento — como manda o cânone.
        </p>
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
      </header>

      <div className="min-h-[22rem] rounded-2xl border border-parchment-300 bg-parchment-100/70 p-5 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
        {step === 0 && (
          <div>
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Escolha sua Árvore Inicial</h2>
            <p className="mb-3 text-sm text-parchment-500 dark:text-parchment-400">
              Cap. 1, seção 4 — desbloqueia o 1º patamar dela de graça e libera um kit de equipamento inicial.
            </p>
            <TreePicker selectedTreeId={character.startingTreeId} onSelect={selectStartingTree} />
          </div>
        )}

        {step === 1 && <SkillsSection race={race} background={background} skills={character.skills} />}

        {step === 2 && (
          <div className="flex flex-col items-center text-center">
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Gire a roleta</h2>
            <p className="mb-4 text-sm text-parchment-500 dark:text-parchment-400">
              Sorteia Raça, Antecedente e Atributos de uma vez — pode girar de novo antes de confirmar.
            </p>
            <button
              type="button"
              onClick={spin}
              className="mb-4 flex items-center gap-2 rounded-full bg-wine-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-wine-500"
            >
              <Dices className="h-5 w-5" /> {hasRolled ? "Girar de Novo" : "Girar a Roleta do Destino"}
            </button>
            {hasRolled && <RaceBackgroundDetails race={race} background={background} />}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-wine-500" />
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">
              {character.name || "Seu personagem"} nasceu.
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
            disabled={step === 2 && !hasRolled}
            className="flex items-center gap-1 rounded-lg bg-wine-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Avançar <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
