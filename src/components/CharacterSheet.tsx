"use client";

import { useMemo } from "react";
import { Heart, Droplets, Shield, Swords, Coins, Sparkles, Target, Gem } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { useCharacterDerived } from "@/store/useCharacterDerived";
import { getPaSpent } from "@/store/selectors";
import { RACES, getRaceById } from "@/data/races";
import { BACKGROUNDS, MIKO_TABLE, OLHO_TABLE, getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import { getTreeById } from "@/data/trees";
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
import { RANK_COLORS } from "@/lib/rankColors";
import InventorySection from "./InventorySection";
import RaceBackgroundDetails from "./RaceBackgroundDetails";
import SkillsSection from "./SkillsSection";

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

function StatCard({
  icon,
  label,
  value,
  tone,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-50">{value}</p>
      </div>
      {extra}
    </div>
  );
}

function BonusInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex shrink-0 flex-col items-center text-[10px] font-semibold uppercase text-slate-400">
      +PA
      <input
        type="number"
        min={0}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        title="Comprado com PA (Cap. 1: 1 PA = +5)"
        className="w-12 rounded border border-slate-200 bg-white px-1 text-center text-xs text-slate-700 outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />
    </label>
  );
}

export default function CharacterSheet() {
  const character = useActiveCharacter();
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
    inventory,
    skills,
    bonusHp,
    bonusMp,
  } = character;
  const paSpent = getPaSpent(character);

  const { attributes, maxHp, maxMp, armorClass, initiative } = useCharacterDerived();

  const race = getRaceById(raceId);
  const background = getBackgroundById(backgroundId);
  const startingTree = getTreeById(startingTreeId);
  const subtableOptions = background?.requiresSubtable === "miko" ? MIKO_TABLE : background?.requiresSubtable === "olho" ? OLHO_TABLE : null;
  const chosenSubtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, subtableEntryId)
    : undefined;

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

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Cabeçalho */}
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <input
          value={name}
          onChange={(e) => useCharacterStore.getState().setName(e.target.value)}
          placeholder="Nome do personagem"
          className="w-full rounded-lg bg-transparent text-3xl font-black tracking-tight text-slate-900 outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-sky-400 dark:text-slate-50 dark:placeholder:text-slate-700"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <select
            value={raceId ?? ""}
            onChange={(e) => useCharacterStore.getState().setRace(e.target.value || null)}
            className="rounded-full border-0 bg-slate-900/5 px-3 py-1 font-medium text-slate-700 outline-none ring-1 ring-slate-900/10 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"
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
            className="rounded-full border-0 bg-slate-900/5 px-3 py-1 font-medium text-slate-700 outline-none ring-1 ring-slate-900/10 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"
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
              className="rounded-full border-0 bg-violet-500/10 px-3 py-1 font-medium text-violet-600 outline-none ring-1 ring-violet-500/30 dark:text-violet-400"
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
            className="flex items-center gap-1 rounded-full bg-violet-500/10 px-3 py-1 font-medium text-violet-600 ring-1 ring-violet-500/30 dark:text-violet-400"
          >
            <Gem className="h-3.5 w-3.5" /> {paSpent} PA gastos
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar esquerda */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/80"
                  >
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                      {short}
                    </span>
                    <input
                      type="number"
                      min={-2}
                      max={ATTRIBUTE_HARD_CAP}
                      value={base}
                      onChange={(e) => useCharacterStore.getState().setAttribute(key, Number(e.target.value))}
                      className="w-12 bg-transparent text-center text-lg font-black text-slate-900 outline-none dark:text-slate-50"
                    />
                    {final !== base && (
                      <span className="text-[10px] text-slate-400">Final {final >= 0 ? `+${final}` : final}</span>
                    )}
                    {paCost > 0 && <span className="text-[10px] font-semibold text-violet-500">{paCost} PA</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <StatCard
              icon={<Heart className="h-5 w-5 text-white" />}
              label="PV Máximo"
              value={maxHp}
              tone="bg-rose-500"
              extra={
                <BonusInput value={bonusHp} onChange={(v) => useCharacterStore.getState().setBonusHp(v)} />
              }
            />
            <StatCard
              icon={<Droplets className="h-5 w-5 text-white" />}
              label="PM Máximo"
              value={maxMp}
              tone="bg-sky-500"
              extra={
                <BonusInput value={bonusMp} onChange={(v) => useCharacterStore.getState().setBonusMp(v)} />
              }
            />
            <StatCard
              icon={<Shield className="h-5 w-5 text-white" />}
              label="Classe de Armadura"
              value={armorClass}
              tone="bg-slate-500"
            />
            <StatCard
              icon={<Swords className="h-5 w-5 text-white" />}
              label="Iniciativa"
              value={`${initiative.bonus >= 0 ? "+" : ""}${initiative.bonus}${
                initiative.hasAdvantage ? " (Vantagem)" : ""
              }`}
              tone="bg-amber-500"
            />
          </div>

          {startingTree && (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Árvore Inicial
              </h2>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{startingTree.name}</p>
            </div>
          )}
        </aside>

        {/* Corpo principal: Grimório */}
        <main className="space-y-4">
          <RaceBackgroundDetails race={race} background={background} subtable={chosenSubtable} />
          <SkillsSection race={race} background={background} skills={skills} />

          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
            <Sparkles className="h-5 w-5 text-sky-500" /> Grimório &amp; Habilidades
          </h2>

          {abilitiesByTree.size === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Nenhuma magia ou talento comprado ainda.
            </p>
          )}

          {Array.from(abilitiesByTree.entries()).map(([treeId, purchases]) => {
            const tree = getTreeById(treeId);
            if (!tree) return null;
            const resolved = resolveAbilities(tree, purchases);

            return (
              <div
                key={treeId}
                className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
              >
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-50">
                  {tree.name}
                  {highestRankByTree.get(treeId) && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                        RANK_COLORS[highestRankByTree.get(treeId)!]
                      }`}
                    >
                      {highestRankByTree.get(treeId)}
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {resolved.map(({ kind, rank, def }) => (
                    <div
                      key={def.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-50">{def.name}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${RANK_COLORS[rank]}`}
                        >
                          {rank}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {kind === "ability" ? "Habilidade" : "Talento"} · {def.paCost} PA
                        {kind === "ability" && (() => {
                          const ability = def as AbilityDef;
                          const pm = ability.pmCost !== undefined ? ` · ${ability.pmCost} PM` : "";
                          return `${pm} · ${ability.actions.normal} Ações`;
                        })()}
                      </p>
                      {kind === "ability" ? (
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                          {(def as AbilityDef).damage?.normal && (
                            <span className="font-medium">{(def as AbilityDef).damage!.normal}. </span>
                          )}
                          {(def as AbilityDef).effect}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                          {(def as TalentDef).description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <InventorySection inventory={inventory} />
        </main>
      </div>

      {/* Painel de regras rápidas */}
      <footer className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-slate-100 shadow-sm dark:border-slate-800">
        <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Target className="h-4 w-4" /> Regras Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="font-semibold text-sky-400">CD da Habilidade</span> = 8 + Atributo + Bônus do
            Rank ({Object.entries(RANK_BONUS).map(([r, b]) => `${r} +${b}`).join(", ")})
          </p>
          <p>
            <span className="font-semibold text-sky-400">Bônus de Ataque</span> = 1d20 + Atributo + Bônus do
            Rank
          </p>
        </div>
      </footer>
    </div>
  );
}
