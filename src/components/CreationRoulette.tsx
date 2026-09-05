"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Dices, LucideIcon, ScrollText, Sparkles, Sprout, Users } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getRaceById, RACES } from "@/data/races";
import RaceCrest from "./RaceCrest";
import { BACKGROUNDS, getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import {
  getRaceProbabilities,
  getRollableRaceIds,
  rollRandomAttributes,
  rollRandomBackground,
  rollRandomRace,
  rollRandomSubtableEntry,
} from "@/lib/randomCharacter";
import { useWheelSpin, WHEEL_MAX_ATTEMPTS } from "@/lib/useWheelSpin";
import { ATTRIBUTES } from "@/lib/types";
import RaceBackgroundDetails from "./RaceBackgroundDetails";
import RouletteWheel, { WheelLegend, WheelOption } from "./RouletteWheel";
import SkillsSection from "./SkillsSection";
import TreePicker from "./TreePicker";
import ImagemDaFicha from "@/components/ui/ImagemDaFicha";

const STEPS = ["Árvore Inicial", "Perícias", "Sortear o Destino", "Pronto"];

// Nomes que não cabem inteiros na legenda ("Povo Pequeno / Hobbit", "Demônio Imortal")
// ganham um rótulo curto — o nome completo continua no resultado abaixo da roleta.
const RACE_LABELS: Record<string, string> = {
  hobbit: "Hobbit",
  "demonio-imortal": "Demônio",
};
const ROLLABLE_RACE_IDS = getRollableRaceIds();
const RACE_PROBABILITY = new Map(getRaceProbabilities().map((p) => [p.id, p.probability]));
const RACE_OPTIONS: WheelOption[] = ROLLABLE_RACE_IDS.map((id) => {
  const race = RACES.find((r) => r.id === id);
  const label = RACE_LABELS[id] ?? (race?.name ?? id).split(" (")[0].replace(/^Raça (do )?/, "");
  return { id, label, probability: RACE_PROBABILITY.get(id) ?? 0 };
});
// Nomes completos ("Treino Precoce / Escudeiro", "Fator Laplace / Linhagem Antiga"...) não
// cabem numa fatia sem se sobrepor — rótulo curto escolhido à mão por antecedente (o nome
// completo continua aparecendo no resultado abaixo da roleta).
const BACKGROUND_LABELS: Record<string, string> = {
  plebeu: "Plebeu",
  orfao: "Órfão",
  "crianca-selvagem": "Selvagem",
  "aprendiz-mercador": "Mercador",
  "treino-precoce": "Escudeiro",
  acolito: "Acólito",
  "sangue-nobre": "Sangue Nobre",
  "estudioso-precoce": "Estudioso",
  sobrevivente: "Sobrevivente",
  "fator-laplace": "Laplace",
  miko: "Miko",
  "olho-mistico": "Olho Místico",
  genio: "Gênio",
};
const BACKGROUND_OPTIONS: WheelOption[] = BACKGROUNDS.map((bg) => ({
  id: bg.id,
  label: BACKGROUND_LABELS[bg.id] ?? bg.name.split(" / ")[0].split(" (")[0],
  probability: (bg.rollRange[1] - bg.rollRange[0] + 1) / 100,
}));

function WheelBlock({
  title,
  icon,
  options,
  wheel,
  resultLabel,
  resultCrest,
}: {
  title: string;
  icon: LucideIcon;
  options: WheelOption[];
  wheel: ReturnType<typeof useWheelSpin>;
  resultLabel?: string;
  /** Arte do resultado, quando ele tem uma (a Raça tem; o Antecedente não). */
  resultCrest?: React.ReactNode;
}) {
  const attemptsLeft = WHEEL_MAX_ATTEMPTS - wheel.attempts;
  const Icon = icon;
  return (
    <div>
      <h2 className="mb-4 flex items-center justify-center gap-2 text-lg font-bold text-parchment-900 dark:text-parchment-50">
        <Icon className="h-5 w-5 text-wine-500" />
        {title}
      </h2>
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
        <RouletteWheel
          options={options}
          icon={icon}
          spinToken={wheel.spinToken}
          targetId={wheel.targetId}
          spinVariance={wheel.spinVariance}
          onSettle={wheel.handleSettle}
        />
        <div className="w-full max-w-xs md:mt-2 md:max-w-[260px]">
          <WheelLegend options={options} highlightId={wheel.result} />
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center text-center">
        <button
          type="button"
          onClick={wheel.spin}
          disabled={!wheel.canSpin}
          className="flex items-center gap-2 rounded-full bg-wine-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          <Dices className={`h-5 w-5 ${wheel.spinning ? "animate-spin" : ""}`} />
          {wheel.spinning
            ? "Girando..."
            : wheel.attempts === 0
              ? "Girar"
              : attemptsLeft > 0
                ? "Girar de Novo"
                : "Sem mais tentativas"}
        </button>
        <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">
          {attemptsLeft > 0 ? `${attemptsLeft} de ${WHEEL_MAX_ATTEMPTS} tentativas restantes` : "O Destino já decidiu."}
        </p>
        {resultLabel && wheel.result && (
          <div className="mt-3 flex animate-birth-reveal items-center gap-2">
            {resultCrest}
            <p className="text-sm font-semibold text-wine-700 dark:text-wine-300">{resultLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [attributesRolled, setAttributesRolled] = useState(false);

  const raceWheel = useWheelSpin(rollRandomRace);
  const backgroundWheel = useWheelSpin(rollRandomBackground);

  useEffect(() => {
    if (!raceWheel.result) return;
    useCharacterStore.getState().setRace(raceWheel.result);
  }, [raceWheel.result]);

  useEffect(() => {
    if (!backgroundWheel.result) return;
    useCharacterStore.getState().setBackground(backgroundWheel.result);
    const bg = getBackgroundById(backgroundWheel.result);
    if (bg?.requiresSubtable) {
      useCharacterStore.getState().setSubtableEntry(rollRandomSubtableEntry(bg.requiresSubtable));
    }
  }, [backgroundWheel.result]);

  const race = getRaceById(character.raceId);
  const background = getBackgroundById(character.backgroundId);
  const chosenSubtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, character.subtableEntryId)
    : undefined;

  const destinyReady = !!raceWheel.result && !!backgroundWheel.result && attributesRolled;
  const anySpinning = raceWheel.spinning || backgroundWheel.spinning;

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function selectStartingTree(treeId: string) {
    useCharacterStore.getState().setStartingTree(treeId);
  }

  function rollAttributes() {
    const attrs = rollRandomAttributes();
    for (const { key } of ATTRIBUTES) {
      useCharacterStore.getState().setAttribute(key, attrs[key]);
    }
    setAttributesRolled(true);
  }

  return (
    <div className={`mx-auto p-4 transition-[max-width] sm:p-6 ${step === 2 ? "max-w-4xl" : "max-w-2xl"}`}>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <Dices className="h-6 w-6 text-wine-500" /> Via 2 — Roleta do Destino
        </h1>
        <p className="mt-1 text-sm text-parchment-600 dark:text-parchment-400">
          Você escolhe sua Árvore Inicial e suas Perícias. Raça e Antecedente são sorteados em roletas
          separadas — quanto mais forte o resultado, mais rara a fatia. Só {WHEEL_MAX_ATTEMPTS} giros por
          roleta: depois disso, o Destino decidiu e o resultado atual fica valendo.
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
            <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">
              Cap. 1, seção 4 — desbloqueia o 1º patamar dela de graça e libera um kit de equipamento inicial.
            </p>
            <TreePicker selectedTreeId={character.startingTreeId} onSelect={selectStartingTree} />
          </div>
        )}

        {step === 1 && <SkillsSection race={race} background={background} skills={character.skills} />}

        {step === 2 && (
          <div className="space-y-10">
            <WheelBlock
              title="Roleta da Raça"
              icon={Users}
              options={RACE_OPTIONS}
              wheel={raceWheel}
              resultLabel={race?.name}
              // O retrato aparece no instante em que a roleta para: é o momento
              // em que o personagem nasce, e até aqui ele nascia como um nome.
              resultCrest={race ? <RaceCrest race={race} size={56} rounded="rounded-xl" /> : undefined}
            />
            <div className="border-t border-parchment-300 dark:border-parchment-800" />
            <WheelBlock
              title="Roleta do Antecedente"
              icon={ScrollText}
              options={BACKGROUND_OPTIONS}
              wheel={backgroundWheel}
              resultLabel={background?.name}
            />
            <div className="border-t border-parchment-300 dark:border-parchment-800" />

            <div className="flex flex-col items-center text-center">
              <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Atributos</h2>
              <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">
                Sorteia a distribuição de pontos e defeitos do Cap. 1 — sem limite de tentativas.
              </p>
              <button
                type="button"
                onClick={rollAttributes}
                className="flex items-center gap-2 rounded-full bg-wine-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-wine-500"
              >
                <Dices className="h-5 w-5" /> {attributesRolled ? "Rolar de Novo" : "Rolar Atributos"}
              </button>
              {attributesRolled && (
                <div className="mt-4 grid w-full grid-cols-5 gap-2 text-center">
                  {ATTRIBUTES.map(({ key, label }) => (
                    <div key={key} className="rounded-lg border border-parchment-300 bg-parchment-50 p-2 dark:border-parchment-700 dark:bg-parchment-900">
                      <p className="text-3xs uppercase tracking-wide text-parchment-600 dark:text-parchment-400">{label}</p>
                      <p className="text-lg font-bold text-parchment-900 dark:text-parchment-50">{character.attributeBase[key]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {race && background && (
              <div key={`${race.id}-${background.id}`} className="animate-birth-reveal border-t border-parchment-300 pt-6 dark:border-parchment-800">
                <RaceBackgroundDetails race={race} background={background} subtable={chosenSubtable} />
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="animate-birth-reveal flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-wine-500" />
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">
              {character.name || "Seu personagem"} nasceu.
            </h2>
            <p className="mb-5 text-sm text-parchment-600 dark:text-parchment-400">
              Dê um nome a ele e ajuste qualquer detalhe livremente na ficha completa.
            </p>
            {/*
              Só aqui, na tela final: nas roletas anteriores a raça e o
              antecedente ainda podem trocar a cada giro, e uma foto escolhida
              antes disso descreveria um personagem que já não existe mais.
              Opcional — sem foto cai no brasão da raça sorteada.
            */}
            <div className="mb-5 flex flex-col items-center gap-2">
              <div className="h-20 w-20 overflow-hidden rounded-2xl border border-parchment-300/80 bg-parchment-100/80 shadow-sm dark:border-parchment-700/80 dark:bg-parchment-900/80">
                {character.portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={character.portrait}
                    alt={character.name ? `Retrato de ${character.name}` : "Retrato do personagem"}
                    className="h-full w-full object-cover"
                  />
                ) : race ? (
                  <RaceCrest race={race} size={80} rounded="rounded-none" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-parchment-400">
                    <Sprout className="h-7 w-7" />
                  </span>
                )}
              </div>
              <ImagemDaFicha
                tipo="portrait"
                valorAtual={character.portrait}
                rotulo="Adicionar foto"
                onChange={(dataUrl) => useCharacterStore.getState().setPortrait(dataUrl)}
              />
            </div>
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
            disabled={step === 0 || anySpinning}
            className="flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-1.5 text-sm font-medium text-parchment-600 transition-colors hover:bg-parchment-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          <button
            type="button"
            onClick={next}
            disabled={anySpinning || (step === 2 && !destinyReady)}
            className="flex items-center gap-1 rounded-lg bg-wine-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Avançar <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
