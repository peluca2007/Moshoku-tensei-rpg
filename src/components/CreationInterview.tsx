"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Dices, Sparkles, ScrollText, Sprout, UserRoundCheck } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { getRaceById, RACES } from "@/data/races";
import { getBackgroundById, getSubtableEntryById, BACKGROUNDS } from "@/data/backgrounds";
import {
  drawInterviewQuestions,
  resolveInterview,
  InterviewMode,
  InterviewQuestion,
  InterviewOption,
  LotteryEntry,
} from "@/data/interview";
import { buildInterviewLore } from "@/lib/interviewLore";
import { applyDragonChance, RACE_WEIGHT, rollRandomAttributes, rollRandomSubtableEntry } from "@/lib/randomCharacter";
import { ATTRIBUTES } from "@/lib/types";
import RaceBackgroundDetails from "./RaceBackgroundDetails";
import RaceCrest from "./RaceCrest";
import SkillsSection from "./SkillsSection";
import TreePicker from "./TreePicker";
import ImagemDaFicha from "@/components/ui/ImagemDaFicha";

/**
 * Pools da loteria com o peso de raridade de cada candidato. Antecedente usa a
 * largura da faixa d100 da tabela do Cap. 1 §6, que já É a raridade dele no livro.
 *
 * O Dragão fica FORA desta pool: desde 2026-08-29 ele existe no sorteio, mas com
 * chance fixa de 1% (`applyDragonChance`), rolada por fora e depois da loteria.
 * Se ele entrasse aqui com peso, o viés das respostas mexeria nessa chance — e o
 * pedido era 1% exato, não "1% em média".
 */
const RACE_POOL: LotteryEntry[] = RACES.filter((r) => r.id !== "dragao").map((r) => ({
  id: r.id,
  weight: RACE_WEIGHT[r.id] ?? 1,
}));
const BACKGROUND_POOL: LotteryEntry[] = BACKGROUNDS.map((b) => ({
  id: b.id,
  weight: Math.max(1, b.rollRange[1] - b.rollRange[0] + 1),
}));

/** Só as raças que o sorteio pode entregar — as mesmas que o jogador pode escolher no modo "antecedente". */
const PICKABLE_RACES = RACES.filter((r) => (RACE_WEIGHT[r.id] ?? 1) > 0);

type Phase = "modo" | "raca" | "perguntas" | "sorteio" | "arvore" | "pericias" | "pronto";

const SORTEIO_MS = 1900;

export default function CreationInterview() {
  const router = useRouter();
  const startedCreation = useRef(false);
  const [questions] = useState<InterviewQuestion[]>(() => drawInterviewQuestions());
  const [answers, setAnswers] = useState<InterviewOption[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("modo");
  const [mode, setMode] = useState<InterviewMode>("ambos");
  /** Raça escolhida na mão no modo "antecedente" (null no modo "ambos", onde ela é sorteada). */
  const [pickedRaceId, setPickedRaceId] = useState<string | null>(null);

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

  /** Aplica o resultado do Destino na ficha. Chamado só depois da animação de sorteio. */
  const commitDestiny = useCallback(
    (finalAnswers: InterviewOption[]) => {
      const store = useCharacterStore.getState();
      const result = resolveInterview(finalAnswers, RACE_POOL, BACKGROUND_POOL, mode);

      // No modo "antecedente" a raça já foi escolhida na fase "raca" e result.raceId é null.
      // A raça sorteada passa pela chance de 1% do Dragão antes de entrar na ficha.
      if (result.raceId) store.setRace(applyDragonChance(result.raceId));
      store.setBackground(result.backgroundId);

      const resultBackground = BACKGROUNDS.find((b) => b.id === result.backgroundId);
      if (resultBackground?.requiresSubtable) {
        store.setSubtableEntry(rollRandomSubtableEntry(resultBackground.requiresSubtable));
      }

      // No modo "antecedente" a raça veio da fase "raca", então já está na ficha.
      const finalRaceName = getRaceById(result.raceId ?? pickedRaceId)?.name ?? "";
      store.setLore(buildInterviewLore(finalAnswers, finalRaceName, resultBackground?.name ?? "", mode));

      const attrs = rollRandomAttributes();
      for (const { key } of ATTRIBUTES) store.setAttribute(key, attrs[key]);

      setPhase("arvore");
    },
    [mode, pickedRaceId]
  );

  function answer(option: InterviewOption) {
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1);
      return;
    }
    // Última pergunta: entra na animação de sorteio, que decide quando aplicar o Destino.
    setAnswers(nextAnswers);
    setPhase("sorteio");
  }

  function backOneQuestion() {
    if (questionIndex === 0) return;
    setQuestionIndex((i) => i - 1);
    setAnswers((prev) => prev.slice(0, -1));
  }

  function chooseMode(next: InterviewMode) {
    setMode(next);
    setPhase(next === "antecedente" ? "raca" : "perguntas");
  }

  function chooseRace(raceId: string) {
    setPickedRaceId(raceId);
    useCharacterStore.getState().setRace(raceId);
  }

  const progress =
    phase === "modo"
      ? 0
      : phase === "raca"
        ? 0.05
        : phase === "perguntas"
          ? 0.1 + (questionIndex / questions.length) * 0.55
          : phase === "sorteio"
            ? 0.68
            : phase === "arvore"
              ? 0.78
              : phase === "pericias"
                ? 0.9
                : 1;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <ScrollText className="h-6 w-6 text-wine-500" /> Via 3 — A Entrevista (O Destino)
        </h1>
        <p className="mt-1 text-sm text-parchment-600 dark:text-parchment-400">
          Perguntas sobre uma infância que não é bem a sua — mas que decide, junto com um pouco de sorte, quem
          seu personagem nasceu sendo.
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-parchment-300 dark:bg-parchment-800">
          <div
            className="h-full rounded-full bg-wine-500 transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </header>

      <div className="min-h-[22rem] rounded-2xl border border-parchment-300 bg-parchment-100/70 p-5 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
        {phase === "modo" && (
          <div className="animate-fade-slide-in">
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">
              O que você quer deixar nas mãos do Destino?
            </h2>
            <p className="mb-4 text-sm text-parchment-600 dark:text-parchment-400">
              As perguntas são as mesmas nos dois modos. O que muda é o quanto das respostas vira sorteio.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModeCard
                icon={<Dices className="h-6 w-6" />}
                title="Raça e Antecedente"
                subtitle="Tudo nas mãos do Destino"
                description="Suas respostas pesam as duas loterias. Você descobre o que nasceu sendo e de onde veio ao mesmo tempo."
                onClick={() => chooseMode("ambos")}
              />
              <ModeCard
                icon={<UserRoundCheck className="h-6 w-6" />}
                title="Só o Antecedente"
                subtitle="Você escolhe a Raça"
                description="Você já sabe o que seu personagem é. As respostas decidem só a infância dele — de onde veio e o que isso deixou."
                onClick={() => chooseMode("antecedente")}
              />
            </div>
          </div>
        )}

        {phase === "raca" && (
          <div className="animate-fade-slide-in">
            <h2 className="mb-1 text-lg font-bold text-parchment-900 dark:text-parchment-50">Escolha a Raça</h2>
            <p className="mb-4 text-sm text-parchment-600 dark:text-parchment-400">
              Cap. 1, seção 5. Raças míticas ficam de fora aqui — elas só entram na criação Manual, com aval do
              Mestre.
            </p>
            <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {PICKABLE_RACES.map((r) => {
                const selected = character.raceId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => chooseRace(r.id)}
                    aria-pressed={selected}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      selected
                        ? "border-wine-500 bg-wine-500/10"
                        : "border-parchment-300 bg-parchment-50 hover:border-wine-400 dark:border-parchment-700 dark:bg-parchment-900"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-parchment-900 dark:text-parchment-50">
                      {r.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-parchment-600 dark:text-parchment-400">
                      {r.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setPhase("modo")}
                className="flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-2 text-sm font-medium text-parchment-600 transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
              >
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <button
                type="button"
                onClick={() => setPhase("perguntas")}
                disabled={!character.raceId}
                className="flex-1 rounded-lg bg-wine-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Começar a Entrevista
              </button>
            </div>
          </div>
        )}

        {phase === "perguntas" && (
          <div key={questionIndex} className="animate-fade-slide-in">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
              Pergunta {questionIndex + 1} de {questions.length}
            </p>
            <h2 className="mb-4 text-lg font-bold text-parchment-900 dark:text-parchment-50">
              {questions[questionIndex].prompt}
            </h2>
            <div className="space-y-2">
              {questions[questionIndex].options.map((option, i) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => answer(option)}
                  style={{ animationDelay: `${i * 55}ms` }}
                  className="animate-fade-slide-in w-full rounded-xl border border-parchment-300 bg-parchment-50 p-3 text-left text-sm text-parchment-700 transition-colors hover:border-wine-400 hover:bg-wine-50 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-200 dark:hover:bg-wine-950/30"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "sorteio" && (
          <DestinyDraw mode={mode} onDone={() => commitDestiny(answers)} />
        )}

        {phase === "arvore" && (
          <div>
            <div className="relative mb-4 overflow-hidden rounded-xl bg-wine-500/10 p-3 text-sm text-wine-700 dark:text-wine-300">
              <div
                className="animate-birth-flash pointer-events-none absolute inset-0 rounded-full bg-gold-400/40 blur-xl"
                aria-hidden
              />
              <div className="animate-birth-reveal relative">
                {mode === "antecedente" ? (
                  <>
                    O Destino falou: <b>{background?.name}</b>. A Raça, essa foi escolha sua — <b>{race?.name}</b>.
                  </>
                ) : (
                  <>
                    O Destino falou: <b>{race?.name}</b>, <b>{background?.name}</b>.
                  </>
                )}
              </div>
            </div>
            <RaceBackgroundDetails race={race} background={background} subtable={chosenSubtable} />
            <h2 className="mb-1 mt-4 text-lg font-bold text-parchment-900 dark:text-parchment-50">Escolha sua Árvore Inicial</h2>
            <p className="mb-3 text-sm text-parchment-600 dark:text-parchment-400">
              Cap. 1, seção 4 — desbloqueia o 1º patamar dela de graça e libera um kit de equipamento inicial.
            </p>
            <TreePicker selectedTreeId={character.startingTreeId} onSelect={(treeId) => useCharacterStore.getState().setStartingTree(treeId)} />
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
            <p className="mb-5 text-sm text-parchment-600 dark:text-parchment-400">
              Dê um nome a ele e ajuste qualquer detalhe livremente na ficha completa.
            </p>
            {/*
              Raça e antecedente só ficam definitivos depois do sorteio — pedir
              a foto antes disso seria pedir pra imaginar uma cara pra alguém
              que o Destino ainda não escolheu quem é. Opcional, como em toda
              via: sem foto cai no brasão da raça.
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

function ModeCard({
  icon,
  title,
  subtitle,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-parchment-300 bg-parchment-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-wine-400 hover:shadow-md dark:border-parchment-700 dark:bg-parchment-900 dark:hover:border-wine-600"
    >
      <span className="mb-2 text-wine-500 transition-transform group-hover:scale-110">{icon}</span>
      <span className="text-base font-bold text-parchment-900 dark:text-parchment-50">{title}</span>
      <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold-700 dark:text-gold-300">
        {subtitle}
      </span>
      <span className="text-sm text-parchment-600 dark:text-parchment-400">{description}</span>
    </button>
  );
}

/**
 * Animação do sorteio: nomes de raça/antecedente passando rápido antes de assentar,
 * mesmo princípio do dado girando no Rolador — o resultado já está decidido, isto é só
 * suspense. Nada aqui influencia a loteria: `onDone` é que chama `resolveInterview`.
 * Respeita `prefers-reduced-motion` pulando direto pro resultado.
 */
function DestinyDraw({ mode, onDone }: { mode: InterviewMode; onDone: () => void }) {
  const [tick, setTick] = useState(0);
  const done = useRef(false);

  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (done.current) return;
    if (reduced) {
      done.current = true;
      onDone();
      return;
    }
    const spin = setInterval(() => setTick((t) => t + 1), 110);
    const finish = setTimeout(() => {
      done.current = true;
      clearInterval(spin);
      onDone();
    }, SORTEIO_MS);
    return () => {
      clearInterval(spin);
      clearTimeout(finish);
    };
  }, [reduced, onDone]);

  const raceName = PICKABLE_RACES[tick % PICKABLE_RACES.length]?.name ?? "";
  const backgroundName = BACKGROUNDS[(tick * 3) % BACKGROUNDS.length]?.name ?? "";

  return (
    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 text-center" aria-live="polite">
      <div className="relative">
        <span className="animate-destiny-pulse absolute inset-0 -m-5 rounded-full bg-gold-400/25 blur-xl" aria-hidden />
        <Dices className="animate-destiny-spin relative h-12 w-12 text-wine-500" aria-hidden />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-parchment-600 dark:text-parchment-400">
        O Destino está decidindo
      </p>
      {/* Sem animação CSS aqui de propósito: a troca de texto a cada 110ms JÁ é o efeito, e
          empilhar um keyframe de scale/rotate por cima repinta texto todo frame sem ganho. */}
      <div className="space-y-1.5 font-mono text-lg font-bold text-parchment-900 tabular dark:text-parchment-50">
        {mode === "ambos" && <p>{raceName}</p>}
        <p>{backgroundName}</p>
      </div>
      <p className="max-w-xs text-xs text-parchment-600 dark:text-parchment-400">
        {mode === "antecedente"
          ? "Suas respostas pesaram a loteria, mas nunca a decidiram sozinhas."
          : "Suas respostas pesaram as duas loterias, mas nunca as decidiram sozinhas."}
      </p>
    </div>
  );
}
