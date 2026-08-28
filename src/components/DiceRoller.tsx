"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dices, Sparkles, Swords, X, Trash2, Star, Plus, Zap, ZapOff } from "lucide-react";
import { useActiveCharacter } from "@/store/useCharacterStore";
import { getAttackBonus, getFinalAttribute, getSpellDC, getWeaponDamage } from "@/store/selectors";
import { getTreeById } from "@/data/trees";
import { ATTRIBUTES, attributeKeyFromLabel, AttributeKey } from "@/lib/types";
import { useMacroStore } from "@/store/useMacroStore";
import { useDiceRollerStore } from "@/store/useDiceRollerStore";
import {
  ADVANTAGE_LABELS,
  AdvantageMode,
  D20RollResult,
  DiceRollResult,
  nextRollId,
  rollD20,
  rollFormula,
  RollLogEntry,
} from "@/lib/rollEngine";

const ADVANTAGE_MODES: AdvantageMode[] = ["desvantagemAbsoluta", "desvantagem", "normal", "vantagem", "vantagemAbsoluta"];

/** Só um número pra piscar durante a animação de "dado girando" — não tem relação com o resultado real. */
function randomPreviewFace(): number {
  return 1 + Math.floor(Math.random() * 20);
}

type TestSource = "manual" | "atributo" | "magia" | "marcial";

function d20Detail(result: D20RollResult): string {
  const rollsText = result.rolls.join(", ");
  const modText = result.modifier === 0 ? "" : ` ${result.modifier >= 0 ? "+" : ""}${result.modifier}`;
  const diceLabel = result.rolls.length > 1 ? `${result.rolls.length}d20 (${rollsText}) → ${result.kept}` : `d20 (${result.kept})`;
  return `${diceLabel}${modText}`;
}

function diceDetail(result: DiceRollResult): string {
  if (result.rolls.length === 0) return `${result.modifier >= 0 ? "+" : ""}${result.modifier}`;
  const rollsText = result.rolls.join(" + ");
  const modText = result.modifier === 0 ? "" : ` ${result.modifier >= 0 ? "+" : ""}${result.modifier}`;
  return `${result.count}d${result.sides} (${rollsText})${modText}`;
}

export default function DiceRoller() {
  const character = useActiveCharacter();
  const open = useDiceRollerStore((s) => s.open);
  const setOpen = useDiceRollerStore((s) => s.setOpen);
  const toggleOpen = useDiceRollerStore((s) => s.toggleOpen);
  const pendingRoll = useDiceRollerStore((s) => s.pending);
  const diceAnimationEnabled = useDiceRollerStore((s) => s.diceAnimationEnabled);
  const setDiceAnimationEnabled = useDiceRollerStore((s) => s.setDiceAnimationEnabled);
  const [handledPendingRoll, setHandledPendingRoll] = useState(pendingRoll);
  const [mode, setMode] = useState<AdvantageMode>("normal");
  const [testSource, setTestSource] = useState<TestSource>("manual");
  const [attributeKey, setAttributeKey] = useState<AttributeKey>("forca");
  const [magicTreeId, setMagicTreeId] = useState<string>("");
  const [marcialTreeId, setMarcialTreeId] = useState<string>("");
  const [marcialAttribute, setMarcialAttribute] = useState<AttributeKey>("forca");
  const [testModifier, setTestModifier] = useState(0);
  const [damageFormula, setDamageFormula] = useState("2d6");
  const [damageModifier, setDamageModifier] = useState(0);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>("");
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [log, setLog] = useState<RollLogEntry[]>([]);
  const [lastResult, setLastResult] = useState<{ total: number; critical?: "sucesso" | "falha" | null } | null>(null);
  /** null = segue o último teste automaticamente; true/false = jogador sobrescreveu manualmente pra esta rolagem. */
  const [criticalDamageOverride, setCriticalDamageOverride] = useState<boolean | null>(null);
  const criticalDamage = criticalDamageOverride ?? lastResult?.critical === "sucesso";
  const macros = useMacroStore((s) => s.macros);
  const addMacro = useMacroStore((s) => s.addMacro);
  const removeMacro = useMacroStore((s) => s.removeMacro);
  const [macroLabel, setMacroLabel] = useState("");
  const [macroFormula, setMacroFormula] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [rollingPreview, setRollingPreview] = useState(1);
  const rollAnimationRef = useRef<{ interval: ReturnType<typeof setInterval>; timeout: ReturnType<typeof setTimeout> } | null>(null);

  useEffect(
    () => () => {
      if (rollAnimationRef.current) {
        clearInterval(rollAnimationRef.current.interval);
        clearTimeout(rollAnimationRef.current.timeout);
      }
    },
    []
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "r" || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;
      toggleOpen();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleOpen]);

  // Alguém de fora pediu uma rolagem pronta (arma do Inventário, magia do Grimório) — ajusta a
  // seção de Dano durante o render (em vez de useEffect) toda vez que chega um pedido novo;
  // cada requestDamageRoll() cria um objeto novo, então a comparação por identidade já basta,
  // sem precisar "limpar" a store depois de consumir. Ver
  // https://react.dev/learn/you-might-not-need-an-effect.
  if (pendingRoll && pendingRoll !== handledPendingRoll) {
    setHandledPendingRoll(pendingRoll);
    setDamageFormula(pendingRoll.formula);
    setDamageModifier(pendingRoll.modifier);
    setSelectedWeaponId("");
    setPendingLabel(pendingRoll.label);
  }

  const magicTrees = useMemo(
    () =>
      character.unlockedRanks
        .map((r) => getTreeById(r.treeId))
        .filter((t): t is NonNullable<typeof t> => !!t && t.category === "magia")
        .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i),
    [character.unlockedRanks]
  );
  const corpoTrees = useMemo(
    () =>
      character.unlockedRanks
        .map((r) => getTreeById(r.treeId))
        .filter((t): t is NonNullable<typeof t> => !!t && t.category === "corpo")
        .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i),
    [character.unlockedRanks]
  );
  const weapons = useMemo(() => character.inventory.filter((i) => i.type === "arma" && i.baseDie), [character.inventory]);

  function applySource(source: TestSource, attrKey = attributeKey, treeId = magicTreeId, marcialTree = marcialTreeId, marcialAttr = marcialAttribute) {
    if (source === "atributo") setTestModifier(getFinalAttribute(character, attrKey));
    else if (source === "magia" && treeId) {
      const tree = getTreeById(treeId);
      const attr = attributeKeyFromLabel(tree?.keyAttributeLabel) ?? "intelecto";
      setTestModifier(getAttackBonus(character, treeId, attr));
    } else if (source === "marcial" && marcialTree) {
      setTestModifier(getAttackBonus(character, marcialTree, marcialAttr));
    }
  }

  function pushLog(entry: Omit<RollLogEntry, "id" | "timestamp">) {
    setLog((prev) => [{ ...entry, id: nextRollId(), timestamp: Date.now() }, ...prev].slice(0, 40));
    setLastResult({ total: entry.total, critical: entry.critical });
  }

  /**
   * O resultado (`entry`) já foi calculado de forma síncrona antes de chegar aqui — isto só
   * atrasa a apresentação com números girando por um instante, puramente cosmético. Com a
   * animação desligada (toggle no cabeçalho, persistido), cai direto no pushLog de sempre.
   */
  function animateRoll(entry: Omit<RollLogEntry, "id" | "timestamp">) {
    if (rollAnimationRef.current) {
      clearInterval(rollAnimationRef.current.interval);
      clearTimeout(rollAnimationRef.current.timeout);
      rollAnimationRef.current = null;
    }
    if (!diceAnimationEnabled) {
      pushLog(entry);
      return;
    }
    setIsRolling(true);
    setRollingPreview(randomPreviewFace());
    const interval = setInterval(() => setRollingPreview(randomPreviewFace()), 70);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      rollAnimationRef.current = null;
      setIsRolling(false);
      pushLog(entry);
    }, 600);
    rollAnimationRef.current = { interval, timeout };
  }

  function handleRollD20() {
    const result = rollD20(mode, testModifier);
    let label = "Teste";
    if (testSource === "atributo") label = `Teste de ${ATTRIBUTES.find((a) => a.key === attributeKey)?.label}`;
    else if (testSource === "magia" && magicTreeId) label = `Ataque Mágico (${getTreeById(magicTreeId)?.name})`;
    else if (testSource === "marcial" && marcialTreeId) label = `Ataque Marcial (${getTreeById(marcialTreeId)?.name})`;
    if (mode !== "normal") label += ` — ${ADVANTAGE_LABELS[mode]}`;
    animateRoll({ label, detail: d20Detail(result), total: result.total, critical: result.critical });
  }

  function handleSelectWeapon(id: string) {
    setSelectedWeaponId(id);
    const item = weapons.find((w) => w.id === id);
    if (!item || !item.baseDie) return;
    const info = getWeaponDamage(character, item.baseDie, item.damageAttribute ?? "forca");
    if (info) {
      setDamageFormula(info.escalatedDie);
      setDamageModifier(info.attributeValue + info.rankBonus);
    }
  }

  function handleRollDamage() {
    const weapon = weapons.find((w) => w.id === selectedWeaponId);
    const baseLabel = weapon ? `Dano — ${weapon.name}` : "Dano";
    // Recalcula na hora em vez de confiar no snapshot de handleSelectWeapon — se o Bônus de
    // Rank do personagem mudou desde que a arma foi escolhida no dropdown, o dado e o
    // modificador aqui já saem atualizados, sem exigir reabrir o dropdown.
    let liveFormula = damageFormula;
    let liveModifier = damageModifier;
    if (weapon && weapon.baseDie) {
      const info = getWeaponDamage(character, weapon.baseDie, weapon.damageAttribute ?? "forca");
      if (info) {
        liveFormula = info.escalatedDie;
        liveModifier = info.attributeValue + info.rankBonus;
      }
    }
    if (criticalDamage) {
      // Cap. 4, §5: crítico rola os dados de dano duas vezes; os bônus fixos somam uma vez só.
      const first = rollFormula(liveFormula, 0);
      const second = rollFormula(liveFormula, 0);
      const total = first.total + second.total + liveModifier;
      const detail = `${diceDetail(first)} + ${diceDetail(second)} (crítico) + ${liveModifier}`;
      animateRoll({ label: `${baseLabel} (Crítico)`, detail, total });
    } else {
      const result = rollFormula(liveFormula, liveModifier);
      animateRoll({ label: baseLabel, detail: diceDetail(result), total: result.total });
    }
    setCriticalDamageOverride(null);
  }

  function handleRollMacro(macroId: string) {
    const macro = macros.find((m) => m.id === macroId);
    if (!macro) return;
    const result = rollFormula(macro.formula);
    animateRoll({ label: macro.label, detail: diceDetail(result), total: result.total });
  }

  function handleAddMacro() {
    if (!macroFormula.trim()) return;
    addMacro(macroLabel, macroFormula);
    setMacroLabel("");
    setMacroFormula("");
  }

  const spellDcInfo =
    testSource === "magia" && magicTreeId
      ? getSpellDC(character, magicTreeId, attributeKeyFromLabel(getTreeById(magicTreeId)?.keyAttributeLabel) ?? "intelecto")
      : null;

  const resultCritical = isRolling ? null : (lastResult?.critical ?? null);
  const resultBoxClass =
    resultCritical === "sucesso"
      ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40"
      : resultCritical === "falha"
        ? "border-rose-400 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/40"
        : "border-parchment-300 bg-parchment-100 dark:border-parchment-700 dark:bg-parchment-900";

  return (
    <>
      <button
        type="button"
        onClick={toggleOpen}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-wine-600 text-white shadow-lg ring-4 ring-wine-600/20 transition-transform hover:scale-105 hover:bg-wine-500"
        title="Rolador de Dados (atalho: R)"
        aria-label="Abrir rolador de dados"
      >
        <Dices className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-x-3 bottom-[5.5rem] z-40 flex max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-parchment-300 bg-parchment-50 shadow-2xl dark:border-parchment-700 dark:bg-parchment-950 sm:inset-x-auto sm:right-5 sm:w-[22rem]">
          <div className="flex items-center justify-between border-b border-parchment-300 bg-parchment-100 px-4 py-3 dark:border-parchment-800 dark:bg-parchment-900">
            <h2 className="flex items-center gap-2 text-sm font-bold text-parchment-900 dark:text-parchment-50">
              <Dices className="h-4 w-4 text-wine-500" /> Rolador de Dados
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDiceAnimationEnabled(!diceAnimationEnabled)}
                title={
                  diceAnimationEnabled
                    ? "Animação do dado ligada — clique pro modo rápido (sem animação, útil em combate)"
                    : "Modo rápido ligado (sem animação) — clique pra religar a animação do dado"
                }
                aria-label={diceAnimationEnabled ? "Desligar animação do dado" : "Ligar animação do dado"}
                aria-pressed={diceAnimationEnabled}
                className={`rounded-lg p-1.5 transition-colors ${
                  diceAnimationEnabled
                    ? "text-wine-500 hover:text-wine-600 dark:hover:text-wine-400"
                    : "text-parchment-400 hover:text-parchment-600 dark:hover:text-parchment-300"
                }`}
              >
                {diceAnimationEnabled ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar rolador de dados"
                className="text-parchment-400 hover:text-rose-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {(isRolling || lastResult) && (
              <div className={`mb-4 rounded-xl border p-3 text-center ${resultBoxClass}`}>
                <div
                  className={`text-3xl font-black text-parchment-900 dark:text-parchment-50 ${isRolling ? "animate-dice-spin" : ""}`}
                >
                  {isRolling ? rollingPreview : lastResult?.total}
                </div>
                {resultCritical && (
                  <div
                    className={`text-xs font-bold uppercase tracking-wide ${
                      resultCritical === "sucesso" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {resultCritical === "sucesso" ? "Crítico!" : "Falha Crítica!"}
                  </div>
                )}
              </div>
            )}

            <section className="mb-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                Teste (1d20)
              </h3>
              <div className="mb-2 grid grid-cols-4 gap-1">
                {(["manual", "atributo", "magia", "marcial"] as TestSource[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setTestSource(s);
                      applySource(s);
                    }}
                    className={`rounded-lg px-1.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                      testSource === s
                        ? "bg-wine-600 text-white"
                        : "bg-parchment-100 text-parchment-600 hover:bg-parchment-200 dark:bg-parchment-900 dark:text-parchment-300"
                    }`}
                  >
                    {s === "manual" ? "Livre" : s === "atributo" ? "Atributo" : s === "magia" ? "Magia" : "Marcial"}
                  </button>
                ))}
              </div>

              {testSource === "atributo" && (
                <div className="mb-2 grid grid-cols-5 gap-1">
                  {ATTRIBUTES.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => {
                        setAttributeKey(a.key);
                        applySource("atributo", a.key);
                      }}
                      className={`rounded-lg px-1 py-1 text-[11px] font-semibold ${
                        attributeKey === a.key
                          ? "bg-wine-500/20 text-wine-700 ring-1 ring-wine-500 dark:text-wine-300"
                          : "bg-parchment-100 text-parchment-600 dark:bg-parchment-900"
                      }`}
                    >
                      {a.short}
                    </button>
                  ))}
                </div>
              )}

              {testSource === "magia" && (
                <div className="mb-2">
                  <select
                    value={magicTreeId}
                    onChange={(e) => {
                      setMagicTreeId(e.target.value);
                      applySource("magia", attributeKey, e.target.value);
                    }}
                    className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                  >
                    <option value="">Escolha uma árvore de Magia…</option>
                    {magicTrees.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {spellDcInfo !== null && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-parchment-600 dark:text-parchment-400">
                      <Sparkles className="h-3 w-3" /> CD desta escola: <span className="font-semibold">{spellDcInfo}</span>
                    </p>
                  )}
                </div>
              )}

              {testSource === "marcial" && (
                <div className="mb-2 space-y-1.5">
                  <select
                    value={marcialTreeId}
                    onChange={(e) => {
                      setMarcialTreeId(e.target.value);
                      applySource("marcial", attributeKey, magicTreeId, e.target.value);
                    }}
                    className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                  >
                    <option value="">Escolha uma árvore do Corpo…</option>
                    {corpoTrees.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-1">
                    {(["forca", "agilidade"] as AttributeKey[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          setMarcialAttribute(k);
                          applySource("marcial", attributeKey, magicTreeId, marcialTreeId, k);
                        }}
                        className={`rounded-lg px-1.5 py-1 text-[11px] font-medium ${
                          marcialAttribute === k
                            ? "bg-wine-500/20 text-wine-700 ring-1 ring-wine-500 dark:text-wine-300"
                            : "bg-parchment-100 text-parchment-600 dark:bg-parchment-900"
                        }`}
                      >
                        {k === "forca" ? "Força" : "Agilidade"}
                      </button>
                    ))}
                  </div>
                  <p className="flex items-center gap-1 text-[11px] text-parchment-600 dark:text-parchment-400">
                    <Swords className="h-3 w-3" /> Acerto Físico = 1d20 + Atributo + Bônus do Rank
                  </p>
                </div>
              )}

              <div className="mb-2 flex items-center gap-2">
                <label className="text-xs text-parchment-600 dark:text-parchment-400">Modificador</label>
                <input
                  type="number"
                  value={testModifier}
                  onChange={(e) => setTestModifier(Number(e.target.value))}
                  className="w-20 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                />
              </div>

              <div className="mb-2 grid grid-cols-5 gap-1">
                {ADVANTAGE_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    title={ADVANTAGE_LABELS[m]}
                    className={`rounded-lg px-1 py-1.5 text-[10px] font-medium leading-tight ${
                      mode === m
                        ? "bg-wine-600 text-white"
                        : "bg-parchment-100 text-parchment-600 hover:bg-parchment-200 dark:bg-parchment-900 dark:text-parchment-400"
                    }`}
                  >
                    {m === "desvantagemAbsoluta"
                      ? "Desv. Abs."
                      : m === "desvantagem"
                        ? "Desv."
                        : m === "normal"
                          ? "Normal"
                          : m === "vantagem"
                            ? "Vant."
                            : "Vant. Abs."}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRollD20}
                disabled={isRolling}
                className="w-full rounded-lg bg-wine-600 py-2 text-sm font-bold text-white transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Rolar 1d20
              </button>
            </section>

            <section className="mb-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                Dano
              </h3>
              {pendingLabel && (
                <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-wine-600 dark:text-wine-300">
                  <Sparkles className="h-3 w-3" /> Pronto pra rolar: {pendingLabel} — confira o dado antes de rolar.
                </p>
              )}
              {weapons.length > 0 && (
                <select
                  value={selectedWeaponId}
                  onChange={(e) => handleSelectWeapon(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                >
                  <option value="">Dado livre…</option>
                  {weapons.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.baseDie})
                    </option>
                  ))}
                </select>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={damageFormula}
                  onChange={(e) => setDamageFormula(e.target.value)}
                  placeholder="ex: 2d6"
                  aria-label="Fórmula de dano"
                  className="flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                />
                <span className="text-sm text-parchment-400">+</span>
                <input
                  type="number"
                  value={damageModifier}
                  onChange={(e) => setDamageModifier(Number(e.target.value))}
                  aria-label="Modificador de dano"
                  className="w-16 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                />
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-parchment-600 dark:text-parchment-400">
                <input
                  type="checkbox"
                  checked={criticalDamage}
                  onChange={(e) => setCriticalDamageOverride(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                Crítico — dobrar os dados de dano (Cap. 4, §5)
              </label>
              <button
                type="button"
                onClick={handleRollDamage}
                disabled={isRolling}
                className="mt-2 w-full rounded-lg bg-parchment-800 py-2 text-sm font-bold text-white transition-colors hover:bg-parchment-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-parchment-200 dark:text-parchment-900 dark:hover:bg-parchment-300"
              >
                Rolar Dano
              </button>
            </section>

            <section className="mb-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                Macros
              </h3>
              {macros.length > 0 && (
                <ul className="mb-2 space-y-1">
                  {macros.map((macro) => (
                    <li key={macro.id} className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRollMacro(macro.id)}
                        disabled={isRolling}
                        className="flex flex-1 items-center justify-between gap-2 rounded-lg bg-parchment-100 px-2 py-1.5 text-left text-xs font-medium text-parchment-700 transition-colors hover:bg-wine-500/10 hover:text-wine-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-parchment-900 dark:text-parchment-200 dark:hover:text-wine-300"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <Star className="h-3 w-3 shrink-0 text-gold-500" />
                          <span className="truncate">{macro.label}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-parchment-400 dark:text-parchment-500">{macro.formula}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMacro(macro.id)}
                        title="Apagar macro"
                        aria-label={`Apagar macro ${macro.label}`}
                        className="shrink-0 text-parchment-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={macroLabel}
                  onChange={(e) => setMacroLabel(e.target.value)}
                  placeholder="Nome (ex: Bola de Fogo)"
                  aria-label="Nome do macro"
                  className="min-w-0 flex-[2] rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                />
                <input
                  type="text"
                  value={macroFormula}
                  onChange={(e) => setMacroFormula(e.target.value)}
                  placeholder="2d10+5"
                  aria-label="Fórmula do macro"
                  className="w-20 shrink-0 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-xs dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                />
                <button
                  type="button"
                  onClick={handleAddMacro}
                  disabled={!macroFormula.trim()}
                  title="Salvar macro"
                  aria-label="Salvar macro"
                  className="shrink-0 rounded-lg bg-parchment-800 p-1.5 text-white transition-colors hover:bg-parchment-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-parchment-200 dark:text-parchment-900 dark:hover:bg-parchment-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </section>

            <section>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                  Histórico
                </h3>
                {log.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setLog([]);
                      setLastResult(null);
                    }}
                    className="flex items-center gap-1 text-[11px] text-parchment-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-3 w-3" /> Limpar
                  </button>
                )}
              </div>
              {log.length === 0 ? (
                <p className="text-xs text-parchment-400 dark:text-parchment-500">Nenhuma rolagem ainda.</p>
              ) : (
                <ul className="space-y-1">
                  {log.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-parchment-100 px-2 py-1.5 text-xs dark:bg-parchment-900"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-parchment-800 dark:text-parchment-200">{entry.label}</p>
                        <p className="truncate text-[11px] text-parchment-600 dark:text-parchment-400">{entry.detail}</p>
                      </div>
                      <span
                        className={`shrink-0 text-base font-bold ${
                          entry.critical === "sucesso"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : entry.critical === "falha"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-parchment-900 dark:text-parchment-50"
                        }`}
                      >
                        {entry.total}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
