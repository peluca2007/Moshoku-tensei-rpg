"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Droplets, Shield, Swords, Coins, Sparkles, Target, Gem, Flame, Compass, Search, X, BookOpen, FileDown, FileJson, Loader2, RotateCcw, Plus, Undo2 } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { useCharacterDerived } from "@/store/useCharacterDerived";
import { getGuildRank, getPaSpent } from "@/store/selectors";
import { RACES, getRaceById } from "@/data/races";
import { BACKGROUNDS, MIKO_TABLE, OLHO_TABLE, getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import { getTreeById, getTreeGroups } from "@/data/trees";
import { getStartingKit } from "@/data/startingKits";
import {
  AbilityDef,
  ATTRIBUTE_CREATION_MAX,
  ATTRIBUTE_HARD_CAP,
  ATTRIBUTE_PA_COST_PER_POINT,
  ATTRIBUTES,
  PurchasedAbility,
  RANK_BONUS,
  RANKS,
  RankName,
  TalentDef,
  Tree,
} from "@/lib/types";
import { RANK_COLORS, CATEGORY_ACCENT } from "@/lib/rankColors";
import { CATEGORY_LABELS } from "@/data/trees";
import InventorySection from "./InventorySection";
import RaceBackgroundDetails from "./RaceBackgroundDetails";
import SkillsSection from "./SkillsSection";
import { CastingBreakdown, IncantationBlock, RitualBadge } from "./AbilityDetail";
import { buildFichaPayload } from "@/lib/buildFichaPayload";
import DiceRoller from "./DiceRoller";

interface ResolvedAbility {
  kind: "ability" | "talent";
  rank: RankName;
  def: AbilityDef | TalentDef;
}

function resolveAbilities(tree: Tree, purchases: PurchasedAbility[]): ResolvedAbility[] {
  const resolved: ResolvedAbility[] = [];
  for (const purchase of purchases) {
    const rankDef = tree.ranks.find((r) => r.rank === purchase.rank);
    if (!rankDef) continue;
    const def =
      purchase.kind === "ability"
        ? rankDef.abilities.find((a) => a.id === purchase.id)
        : rankDef.talents.find((t) => t.id === purchase.id);
    if (def) resolved.push({ kind: purchase.kind, rank: purchase.rank, def });
  }
  return resolved;
}


/** PV/PM/PT/PP: valor atual (gasto em jogo) editável, e o máximo — normalmente calculado, mas sobrescrevível pra itens/exceções que o site não modela. */
function ResourceCard({
  icon,
  label,
  tone,
  current,
  max,
  maxOverridden,
  onCurrentChange,
  onMaxChange,
  onResetMax,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  tone: string;
  current: number;
  max: number;
  maxOverridden: boolean;
  onCurrentChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  onResetMax: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-parchment-300 bg-parchment-100/70 p-3 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-parchment-500 dark:text-parchment-400">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            value={current}
            onChange={(e) => onCurrentChange(Number(e.target.value))}
            title="Valor atual — vai gastando/recuperando em jogo"
            className="w-12 rounded bg-transparent text-lg font-bold text-parchment-900 outline-none focus:ring-2 focus:ring-wine-400 dark:text-parchment-50"
          />
          <span className="text-parchment-400">/</span>
          <input
            type="number"
            value={max}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            title="Máximo calculado — edite pra sobrescrever (item, exceção de mesa, etc.)"
            className={`w-12 rounded bg-transparent text-sm font-semibold outline-none focus:ring-2 focus:ring-wine-400 ${
              maxOverridden ? "text-gold-600 dark:text-gold-400" : "text-parchment-500 dark:text-parchment-400"
            }`}
          />
          {maxOverridden && (
            <button
              type="button"
              onClick={onResetMax}
              title="Voltar ao valor calculado automaticamente"
              className="text-parchment-400 hover:text-wine-500 dark:hover:text-wine-400"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      {extra}
    </div>
  );
}

/** CA/Iniciativa: um valor calculado, mas editável — sobrescreve quando você digita algo diferente. */
function EditableStatCard({
  icon,
  label,
  tone,
  value,
  overridden,
  onChange,
  onReset,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  tone: string;
  value: number;
  overridden: boolean;
  onChange: (value: number) => void;
  onReset: () => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-parchment-300 bg-parchment-100/70 p-3 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-parchment-500 dark:text-parchment-400">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            title="Calculado — edite pra sobrescrever"
            className={`w-14 rounded bg-transparent text-lg font-bold outline-none focus:ring-2 focus:ring-wine-400 ${
              overridden ? "text-gold-600 dark:text-gold-400" : "text-parchment-900 dark:text-parchment-50"
            }`}
          />
          {suffix && <span className="text-xs text-parchment-500 dark:text-parchment-400">{suffix}</span>}
          {overridden && (
            <button
              type="button"
              onClick={onReset}
              title="Voltar ao valor calculado automaticamente"
              className="text-parchment-400 hover:text-wine-500 dark:hover:text-wine-400"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BonusInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex shrink-0 flex-col items-center text-[10px] font-semibold uppercase text-parchment-400">
      +PA
      <input
        type="number"
        min={0}
        step={12}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        title="Comprado com PA (Cap. 1: 2 PA = +12)"
        className="w-12 rounded border border-parchment-300 bg-parchment-50 px-1 text-center text-xs text-parchment-700 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-200"
      />
    </label>
  );
}

export default function CharacterSheet() {
  const character = useActiveCharacter();
  const canUndo = useCharacterStore((s) => (s.activeId ? (s.history[s.activeId]?.length ?? 0) > 0 : false));
  const {
    name,
    raceId,
    backgroundId,
    subtableEntryId,
    gold,
    startingTreeId,
    purchasedAbilities,
    unlockedRanks,
    attributeBase,
    skills,
    bonusHp,
    bonusMp,
    overrides,
  } = character;
  const paSpent = getPaSpent(character);
  const guildRank = getGuildRank(character);
  const [grimoireQuery, setGrimoireQuery] = useState("");
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");

  const {
    attributes,
    maxHp,
    maxMp,
    maxPt,
    maxPp,
    currentHp,
    currentMp,
    currentPt,
    currentPp,
    armorClass,
    initiative,
  } = useCharacterDerived();

  const race = getRaceById(raceId);
  const background = getBackgroundById(backgroundId);
  const startingTree = getTreeById(startingTreeId);
  const startingKit = startingTree ? getStartingKit(startingTree.subgroup) : undefined;
  const subtableOptions = background?.requiresSubtable === "miko" ? MIKO_TABLE : background?.requiresSubtable === "olho" ? OLHO_TABLE : null;
  const chosenSubtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, subtableEntryId)
    : undefined;

  async function handleDownloadPdf() {
    setPdfState("loading");
    try {
      const payload = buildFichaPayload({
        character,
        race,
        background,
        subtable: chosenSubtable,
        attributes,
        maxHp,
        maxMp,
        maxPt,
        maxPp,
        armorClass,
        initiativeBonus: initiative.bonus,
      });
      const res = await fetch("/api/ficha-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`PDF request failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(name || "ficha").trim() || "ficha"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setPdfState("idle");
    } catch (err) {
      console.error("Falha ao baixar PDF da ficha:", err);
      setPdfState("error");
    }
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(name || "ficha").trim() || "ficha"}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const abilitiesByTree = useMemo(() => {
    const grouped = new Map<string, PurchasedAbility[]>();
    for (const ability of purchasedAbilities) {
      const list = grouped.get(ability.treeId) ?? [];
      list.push(ability);
      grouped.set(ability.treeId, list);
    }
    return grouped;
  }, [purchasedAbilities]);

  const highestRankByTree = useMemo(() => {
    const map = new Map<string, RankName>();
    for (const { treeId, rank } of unlockedRanks) {
      const current = map.get(treeId);
      if (!current || RANKS.indexOf(rank) > RANKS.indexOf(current)) {
        map.set(treeId, rank);
      }
    }
    return map;
  }, [unlockedRanks]);

  /** Cap. 2, seção 5: Maestrias são cumulativas — cada Rank desbloqueado mantém a sua pra sempre, não só a do Rank mais alto (algumas Maestrias de patamar alto até citam "estende sua Maestria de Intermediário"). */
  const unlockedRanksByTree = useMemo(() => {
    const map = new Map<string, RankName[]>();
    for (const { treeId, rank } of unlockedRanks) {
      const list = map.get(treeId) ?? [];
      if (!list.includes(rank)) list.push(rank);
      map.set(treeId, list);
    }
    for (const list of map.values()) list.sort((a, b) => RANKS.indexOf(a) - RANKS.indexOf(b));
    return map;
  }, [unlockedRanks]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Cabeçalho */}
      <header className="rounded-2xl border border-parchment-300 bg-gradient-to-br from-wine-50 via-parchment-50 to-parchment-50 p-6 shadow-sm dark:border-parchment-800 dark:from-parchment-900 dark:via-parchment-950 dark:to-parchment-900">
        <div className="flex items-start gap-3">
          <input
            value={name}
            onChange={(e) => useCharacterStore.getState().setName(e.target.value)}
            placeholder="Nome do personagem"
            className="min-w-0 flex-1 rounded-lg bg-transparent text-3xl font-black tracking-tight text-parchment-900 outline-none placeholder:text-parchment-300 focus:ring-2 focus:ring-wine-400 dark:text-parchment-50 dark:placeholder:text-parchment-700"
          />
          <button
            type="button"
            onClick={() => useCharacterStore.getState().undo()}
            disabled={!canUndo}
            title="Desfazer a última alteração nesta ficha"
            className="mt-1.5 flex shrink-0 items-center gap-1.5 rounded-full border border-parchment-300 px-3.5 py-1.5 text-xs font-semibold text-parchment-600 shadow-sm transition-colors hover:bg-parchment-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <Undo2 className="h-3.5 w-3.5" /> Desfazer
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfState === "loading"}
            title="Baixar a ficha completa em PDF (via Typst)"
            className="mt-1.5 flex shrink-0 items-center gap-1.5 rounded-full bg-wine-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pdfState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
            {pdfState === "loading" ? "Gerando..." : "Baixar PDF"}
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            title="Exportar esta ficha como arquivo JSON (backup, ou pra importar em outro navegador)"
            className="mt-1.5 flex shrink-0 items-center gap-1.5 rounded-full border border-parchment-300 px-3.5 py-1.5 text-xs font-semibold text-parchment-600 shadow-sm transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <FileJson className="h-3.5 w-3.5" /> Exportar JSON
          </button>
        </div>
        {pdfState === "error" && (
          <p className="mt-1 text-xs text-rose-500">Não deu pra gerar o PDF agora. Tente de novo em instantes.</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <select
            value={raceId ?? ""}
            onChange={(e) => useCharacterStore.getState().setRace(e.target.value || null)}
            className="rounded-full border-0 bg-parchment-900/5 px-3 py-1 font-medium text-parchment-700 outline-none ring-1 ring-parchment-900/10 dark:bg-white/5 dark:text-parchment-200 dark:ring-white/10"
          >
            <option value="">Raça não definida</option>
            {RACES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={backgroundId ?? ""}
            onChange={(e) => useCharacterStore.getState().setBackground(e.target.value || null)}
            className="rounded-full border-0 bg-parchment-900/5 px-3 py-1 font-medium text-parchment-700 outline-none ring-1 ring-parchment-900/10 dark:bg-white/5 dark:text-parchment-200 dark:ring-white/10"
          >
            <option value="">Antecedente não definido</option>
            {BACKGROUNDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {subtableOptions && (
            <select
              value={subtableEntryId ?? ""}
              onChange={(e) => useCharacterStore.getState().setSubtableEntry(e.target.value || null)}
              className="rounded-full border-0 bg-gold-500/10 px-3 py-1 font-medium text-gold-600 outline-none ring-1 ring-gold-500/30 dark:text-gold-400"
            >
              <option value="">Escolher resultado...</option>
              {subtableOptions.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.roll}. {entry.name}
                </option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 font-medium text-amber-600 ring-1 ring-amber-500/30 dark:text-amber-400">
            <Coins className="h-3.5 w-3.5" />
            <input
              type="number"
              value={gold}
              onChange={(e) => useCharacterStore.getState().setGold(Number(e.target.value))}
              className="w-14 bg-transparent outline-none"
            />
            PO
          </label>

          <span
            title="Só informativo — quem controla quanto PA você tem é o Mestre."
            className="flex items-center gap-1 rounded-full bg-gold-500/10 px-3 py-1 font-medium text-gold-600 ring-1 ring-gold-500/30 dark:text-gold-400"
          >
            <Gem className="h-3.5 w-3.5" /> {paSpent} PA gastos
          </span>

          <span
            title="Rank de Aventureiro na Guilda — referência de reputação (Apêndice G), não trava mecânica. Quem decide de verdade é o Mestre."
            className="flex items-center gap-1 rounded-full bg-wine-500/10 px-3 py-1 font-medium text-wine-600 ring-1 ring-wine-500/30 dark:text-wine-300"
          >
            <BookOpen className="h-3.5 w-3.5" /> Rank {guildRank} na Guilda
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar esquerda */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-parchment-500 dark:text-parchment-400">
              Atributos
            </h2>
            <div className="grid grid-cols-5 gap-2 lg:grid-cols-3">
              {ATTRIBUTES.map(({ key, short, label }) => {
                const base = attributeBase[key] ?? 0;
                const final = attributes[key];
                const pointsAbove = Math.max(0, base - ATTRIBUTE_CREATION_MAX);
                const paCost = pointsAbove * ATTRIBUTE_PA_COST_PER_POINT;
                return (
                  <div
                    key={key}
                    title={label}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-parchment-300 bg-parchment-50 p-2 dark:border-parchment-700 dark:bg-parchment-800/80"
                  >
                    <span className="text-[10px] font-bold uppercase text-parchment-500 dark:text-parchment-400">
                      {short}
                    </span>
                    <input
                      type="number"
                      min={-2}
                      max={ATTRIBUTE_HARD_CAP}
                      value={base}
                      onChange={(e) => useCharacterStore.getState().setAttribute(key, Number(e.target.value))}
                      className="w-12 bg-transparent text-center text-lg font-black text-parchment-900 outline-none dark:text-parchment-50"
                    />
                    {final !== base && (
                      <span className="text-[10px] text-parchment-400">Final {final >= 0 ? `+${final}` : final}</span>
                    )}
                    {paCost > 0 && <span className="text-[10px] font-semibold text-gold-500">{paCost} PA</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <ResourceCard
              icon={<Heart className="h-5 w-5 text-white" />}
              label="PV (atual / máximo)"
              tone="bg-rose-500"
              current={currentHp}
              max={maxHp}
              maxOverridden={overrides.maxHp !== undefined}
              onCurrentChange={(v) => useCharacterStore.getState().setCurrentHp(v)}
              onMaxChange={(v) => useCharacterStore.getState().setOverride("maxHp", v)}
              onResetMax={() => useCharacterStore.getState().setOverride("maxHp", null)}
              extra={<BonusInput value={bonusHp} onChange={(v) => useCharacterStore.getState().setBonusHp(v)} />}
            />
            <ResourceCard
              icon={<Droplets className="h-5 w-5 text-white" />}
              label="PM (atual / máximo)"
              tone="bg-wine-500"
              current={currentMp}
              max={maxMp}
              maxOverridden={overrides.maxMp !== undefined}
              onCurrentChange={(v) => useCharacterStore.getState().setCurrentMp(v)}
              onMaxChange={(v) => useCharacterStore.getState().setOverride("maxMp", v)}
              onResetMax={() => useCharacterStore.getState().setOverride("maxMp", null)}
              extra={<BonusInput value={bonusMp} onChange={(v) => useCharacterStore.getState().setBonusMp(v)} />}
            />
            {(maxPt > 0 || overrides.maxPt !== undefined) && (
              <ResourceCard
                icon={<Flame className="h-5 w-5 text-white" />}
                label="PT (atual / máximo, Touki)"
                tone="bg-orange-500"
                current={currentPt}
                max={maxPt}
                maxOverridden={overrides.maxPt !== undefined}
                onCurrentChange={(v) => useCharacterStore.getState().setCurrentPt(v)}
                onMaxChange={(v) => useCharacterStore.getState().setOverride("maxPt", v)}
                onResetMax={() => useCharacterStore.getState().setOverride("maxPt", null)}
              />
            )}
            {(maxPp > 0 || overrides.maxPp !== undefined) && (
              <ResourceCard
                icon={<Compass className="h-5 w-5 text-white" />}
                label="PP (atual / máximo, Preparação)"
                tone="bg-emerald-500"
                current={currentPp}
                max={maxPp}
                maxOverridden={overrides.maxPp !== undefined}
                onCurrentChange={(v) => useCharacterStore.getState().setCurrentPp(v)}
                onMaxChange={(v) => useCharacterStore.getState().setOverride("maxPp", v)}
                onResetMax={() => useCharacterStore.getState().setOverride("maxPp", null)}
              />
            )}
            <EditableStatCard
              icon={<Shield className="h-5 w-5 text-white" />}
              label="Classe de Armadura"
              tone="bg-parchment-500"
              value={armorClass}
              overridden={overrides.armorClass !== undefined}
              onChange={(v) => useCharacterStore.getState().setOverride("armorClass", v)}
              onReset={() => useCharacterStore.getState().setOverride("armorClass", null)}
            />
            <EditableStatCard
              icon={<Swords className="h-5 w-5 text-white" />}
              label="Iniciativa"
              tone="bg-amber-500"
              value={initiative.bonus}
              overridden={overrides.initiative !== undefined}
              onChange={(v) => useCharacterStore.getState().setOverride("initiative", v)}
              onReset={() => useCharacterStore.getState().setOverride("initiative", null)}
              suffix={initiative.hasAdvantage ? "(Vantagem)" : undefined}
            />
          </div>

          <div className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 text-sm shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-parchment-500 dark:text-parchment-400">
              Árvore Inicial
            </h2>
            <select
              value={startingTreeId ?? ""}
              onChange={(e) => {
                const treeId = e.target.value || null;
                useCharacterStore.getState().setStartingTree(treeId);
                if (treeId && !unlockedRanks.some((u) => u.treeId === treeId && u.rank === "Principiante")) {
                  useCharacterStore.getState().unlockRank(treeId, "Principiante");
                }
              }}
              title="Desbloqueia o 1º patamar dela de graça e libera o kit de equipamento inicial (Cap. 1, seção 4)"
              className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm font-semibold text-parchment-800 outline-none dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            >
              <option value="">Nenhuma escolhida ainda</option>
              {getTreeGroups().map((group) => (
                <optgroup key={`${group.category}-${group.subgroup}`} label={`${CATEGORY_LABELS[group.category]} — ${group.subgroup}`}>
                  {group.trees.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {startingTree && startingKit && (
              <>
                <ul className="mt-2 space-y-0.5 text-xs text-parchment-600 dark:text-parchment-400">
                  {startingKit.items.map((item) => (
                    <li key={item.name}>· {item.name}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    for (const item of startingKit.items) useCharacterStore.getState().addItem(item);
                  }}
                  className="mt-2 flex items-center gap-1 rounded-lg bg-wine-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-wine-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Kit Inicial ao Inventário
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Corpo principal: Grimório */}
        <main className="space-y-4">
          <RaceBackgroundDetails race={race} background={background} subtable={chosenSubtable} />
          <SkillsSection race={race} background={background} skills={skills} />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-parchment-900 dark:text-parchment-50">
              <Sparkles className="h-5 w-5 text-wine-500" /> Grimório &amp; Habilidades
            </h2>
            {abilitiesByTree.size > 0 && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -tranparchment-y-1/2 text-parchment-400" />
                <input
                  value={grimoireQuery}
                  onChange={(e) => setGrimoireQuery(e.target.value)}
                  placeholder="Buscar magia, talento ou árvore..."
                  className="w-56 rounded-full border border-parchment-300 bg-parchment-50 py-1.5 pl-8 pr-7 text-xs text-parchment-700 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-200"
                />
                {grimoireQuery && (
                  <button
                    type="button"
                    onClick={() => setGrimoireQuery("")}
                    className="absolute right-2 top-1/2 -tranparchment-y-1/2 text-parchment-400 hover:text-parchment-600 dark:hover:text-parchment-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {abilitiesByTree.size === 0 && (
            <p className="rounded-xl border border-dashed border-parchment-300 p-6 text-center text-sm text-parchment-500 dark:border-parchment-700 dark:text-parchment-400">
              Nenhuma magia ou talento comprado ainda.
            </p>
          )}

          {(() => {
            const query = grimoireQuery.trim().toLowerCase();
            const entries = Array.from(abilitiesByTree.entries()).flatMap(([treeId, purchases]) => {
              const tree = getTreeById(treeId);
              if (!tree) return [];
              const resolved = resolveAbilities(tree, purchases);
              const treeNameMatches = tree.name.toLowerCase().includes(query);
              const filtered = !query || treeNameMatches ? resolved : resolved.filter(({ def }) => def.name.toLowerCase().includes(query));
              if (query && filtered.length === 0) return [];
              return [{
                treeId,
                tree,
                resolved: filtered,
                highestRank: highestRankByTree.get(treeId),
                unlockedTreeRanks: unlockedRanksByTree.get(treeId) ?? [],
              }];
            });

            if (query && entries.length === 0) {
              return (
                <p className="rounded-xl border border-dashed border-parchment-300 p-6 text-center text-sm text-parchment-500 dark:border-parchment-700 dark:text-parchment-400">
                  Nada encontrado para “{grimoireQuery}”.
                </p>
              );
            }

            return entries.map(({ treeId, tree, resolved, highestRank, unlockedTreeRanks }) => {
              const masteries = unlockedTreeRanks
                .map((rank) => ({ rank, mastery: tree.ranks.find((r) => r.rank === rank)?.mastery }))
                .filter((m): m is { rank: RankName; mastery: NonNullable<typeof m.mastery> } => !!m.mastery);
              const accent = CATEGORY_ACCENT[tree.category];

              return (
                <div
                  key={treeId}
                  className={`rounded-2xl border-l-4 ${accent.border} border-y border-r border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-y-parchment-800 dark:border-r-parchment-800 dark:bg-parchment-900/60`}
                >
                  <h3 className="mb-3 flex flex-wrap items-center gap-2 text-base font-bold text-parchment-900 dark:text-parchment-50">
                    {tree.name}
                    <span className={`rounded-full bg-parchment-900/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accent.text} dark:bg-white/5`}>
                      {CATEGORY_LABELS[tree.category]}
                    </span>
                    {highestRank && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${RANK_COLORS[highestRank]}`}
                      >
                        {highestRank}
                      </span>
                    )}
                  </h3>

                {masteries.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {masteries.map(({ rank, mastery }) => (
                      <div
                        key={rank}
                        className="rounded-xl border border-gold-200 bg-gold-50/60 p-3 text-sm dark:border-gold-900 dark:bg-gold-950/30"
                      >
                        <span className="font-semibold text-gold-700 dark:text-gold-400">
                          ◈ Maestria ({rank}): {mastery.name}
                        </span>
                        <p className="mt-0.5 text-xs text-gold-900/80 dark:text-gold-200/80">
                          {mastery.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {resolved.map(({ kind, rank, def }) => (
                    <div
                      key={def.id}
                      className="rounded-xl border border-parchment-300 bg-parchment-100/80 p-3 dark:border-parchment-800 dark:bg-parchment-950/50"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <span className="font-semibold text-parchment-900 dark:text-parchment-50">
                          {kind === "ability" && (def as AbilityDef).signature && "◆ "}
                          {def.name}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          {kind === "ability" && <RitualBadge ability={def as AbilityDef} />}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${RANK_COLORS[rank]}`}
                          >
                            {rank}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-parchment-500 dark:text-parchment-400">
                        {kind === "ability" ? "Habilidade" : "Talento"} · {def.paCost} PA
                        {kind === "ability" && (() => {
                          const ability = def as AbilityDef;
                          const pm = ability.pmCost !== undefined ? ` · ${ability.pmCost} PM` : "";
                          const pt = ability.ptCost !== undefined ? ` · ${ability.ptCost} PT` : "";
                          const pp = ability.ppCost !== undefined ? ` · ${ability.ppCost} PP` : "";
                          const actionLabel = ability.reaction
                            ? "1 Reação"
                            : ability.actions.normal === 0
                              ? "Passivo"
                              : `${ability.actions.normal} Ação${ability.actions.normal > 1 ? "ões" : ""}`;
                          return `${pm}${pt}${pp} · ${ability.range} · ${actionLabel}`;
                        })()}
                      </p>
                      {kind === "ability" ? (
                        <>
                          <p className="mt-1 text-sm text-parchment-700 dark:text-parchment-300">
                            {(def as AbilityDef).damage?.normal && (
                              <span className="font-medium">{(def as AbilityDef).damage!.normal}. </span>
                            )}
                            {(def as AbilityDef).effect}
                          </p>
                          <CastingBreakdown ability={def as AbilityDef} />
                          <IncantationBlock ability={def as AbilityDef} />
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-parchment-700 dark:text-parchment-300">
                          {(def as TalentDef).description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              );
            });
          })()}

          <InventorySection />
        </main>
      </div>

      {/* Painel de regras rápidas */}
      <footer className="rounded-2xl border border-parchment-300 bg-parchment-900 p-4 text-parchment-100 shadow-sm dark:border-parchment-800">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-parchment-400">
            <Target className="h-4 w-4" /> Regras Rápidas
          </h2>
          <Link
            href="/livro"
            className="flex items-center gap-1 text-xs font-medium text-wine-400 hover:text-wine-300"
          >
            <BookOpen className="h-3.5 w-3.5" /> Livro de regras completo
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="font-semibold text-wine-400">CD da Habilidade</span> = 8 + Atributo + Bônus do
            Rank ({Object.entries(RANK_BONUS).map(([r, b]) => `${r} +${b}`).join(", ")})
          </p>
          <p>
            <span className="font-semibold text-wine-400">Bônus de Ataque</span> = 1d20 + Atributo + Bônus do
            Rank
          </p>
          <p>
            <span className="font-semibold text-wine-400">Empilhamento</span> = bônus do mesmo tipo não somam
            (use o maior); teto de +5 vindo de aliados; máximo 5 Ações por turno (2 externas).
          </p>
          <p>
            <span className="font-semibold text-wine-400">Vantagem</span> = 2d20, escolha o maior (3d20 se
            Absoluta). Não empilha; Vantagem e Desvantagem se cancelam uma a uma.
          </p>
        </div>
      </footer>

      <DiceRoller />
    </div>
  );
}
