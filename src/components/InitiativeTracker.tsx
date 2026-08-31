"use client";

import { useState } from "react";
import { Plus, X, Swords, RotateCcw, ChevronRight, Heart, Download } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useInitiativeStore } from "@/store/useInitiativeStore";
import { getInitiative, getMaxHp } from "@/store/selectors";

function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

export default function InitiativeTracker() {
  const combatants = useInitiativeStore((s) => s.combatants);
  const round = useInitiativeStore((s) => s.round);
  const currentTurnId = useInitiativeStore((s) => s.currentTurnId);

  const rosterOrder = useCharacterStore((s) => s.order);
  const rosterCharacters = useCharacterStore((s) => s.characters);

  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState<number | "">("");
  const [maxHp, setMaxHp] = useState<number | "">("");
  const [importId, setImportId] = useState("");
  const [conditionDraft, setConditionDraft] = useState<Record<string, { name: string; duration: string }>>({});

  const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);

  function handleAddManual() {
    if (!name.trim()) return;
    useInitiativeStore.getState().addCombatant(name.trim(), Number(initiative) || 0, maxHp === "" ? undefined : Number(maxHp));
    setName("");
    setInitiative("");
    setMaxHp("");
  }

  function handleImport() {
    const character = rosterCharacters[importId];
    if (!character) return;
    const { bonus } = getInitiative(character);
    const roll = rollD20() + bonus;
    const hp = getMaxHp(character);
    useInitiativeStore.getState().addCombatant(character.name || "Sem nome", roll, hp);
    setImportId("");
  }

  function handleAddCondition(combatantId: string) {
    const draft = conditionDraft[combatantId];
    if (!draft?.name.trim()) return;
    const duration = draft.duration.trim() === "" ? undefined : Number(draft.duration);
    useInitiativeStore.getState().addCondition(combatantId, draft.name.trim(), duration);
    setConditionDraft((prev) => ({ ...prev, [combatantId]: { name: "", duration: "" } }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <Swords className="h-6 w-6 text-wine-500" /> Tracker de Iniciativa
        </h1>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-wine-500/10 px-3 py-1 text-sm font-bold text-wine-600 ring-1 ring-wine-500/30 dark:text-wine-300">
            Rodada {round}
          </span>
          <button
            type="button"
            onClick={() => useInitiativeStore.getState().resetCombat()}
            className="flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-1.5 text-sm font-medium text-parchment-600 transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <RotateCcw className="h-4 w-4" /> Novo Combate
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          Adicionar Combatente
        </h2>
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[10rem]">
            <label className="mb-1 block text-xs text-parchment-600 dark:text-parchment-400">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Goblin Batedor"
              className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-parchment-600 dark:text-parchment-400">Iniciativa</label>
            <input
              type="number"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-24 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-parchment-600 dark:text-parchment-400">PV Máximo</label>
            <input
              type="number"
              value={maxHp}
              onChange={(e) => setMaxHp(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-24 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            />
          </div>
          <button
            type="button"
            onClick={handleAddManual}
            className="flex items-center gap-1 rounded-lg bg-wine-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>

        {rosterOrder.length > 0 && (
          <div className="flex items-center gap-2 border-t border-parchment-300 pt-3 dark:border-parchment-800">
            <select
              value={importId}
              onChange={(e) => setImportId(e.target.value)}
              className="flex-1 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            >
              <option value="">Importar da lista de personagens…</option>
              {rosterOrder.map((id) => (
                <option key={id} value={id}>
                  {rosterCharacters[id]?.name || "Sem nome"}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleImport}
              disabled={!importId}
              className="flex items-center gap-1 rounded-lg border border-wine-500 px-3 py-1.5 text-sm font-medium text-wine-600 transition-colors hover:bg-wine-500/10 disabled:opacity-40 dark:text-wine-300"
            >
              <Download className="h-4 w-4" /> Rolar e Importar
            </button>
          </div>
        )}
      </section>

      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed border-parchment-300 p-8 text-center text-sm text-parchment-600 dark:border-parchment-700 dark:text-parchment-400">
          Nenhum combatente ainda. Adicione personagens ou NPCs acima pra começar.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => useInitiativeStore.getState().nextTurn()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-wine-600 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-wine-500"
          >
            Próximo Turno <ChevronRight className="h-5 w-5" />
          </button>

          <ul className="space-y-2">
            {sorted.map((c) => {
              const isCurrent = c.id === currentTurnId;
              const hpPct = c.maxHp ? Math.max(0, Math.min(100, ((c.currentHp ?? c.maxHp) / c.maxHp) * 100)) : null;
              const draft = conditionDraft[c.id] ?? { name: "", duration: "" };
              return (
                <li
                  key={c.id}
                  className={`rounded-2xl border p-3 shadow-sm transition-colors ${
                    isCurrent
                      ? "border-wine-500 bg-wine-50/70 ring-2 ring-wine-400/50 dark:border-wine-500 dark:bg-wine-950/40"
                      : "border-parchment-300 bg-parchment-100/70 dark:border-parchment-800 dark:bg-parchment-900/60"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment-900/5 text-sm font-black text-parchment-800 dark:bg-white/5 dark:text-parchment-100">
                      {c.initiative}
                    </span>
                    <span className="min-w-[6rem] flex-1 font-bold text-parchment-900 dark:text-parchment-50">
                      {c.name}
                      {isCurrent && (
                        <span className="ml-2 rounded-full bg-wine-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Turno atual
                        </span>
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-rose-500" />
                      <input
                        type="number"
                        value={c.currentHp ?? 0}
                        onChange={(e) =>
                          useInitiativeStore.getState().updateCombatant(c.id, { currentHp: Number(e.target.value) })
                        }
                        className="w-14 rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 text-center text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                      />
                      <span className="text-xs text-parchment-400">/</span>
                      <input
                        type="number"
                        value={c.maxHp ?? 0}
                        onChange={(e) =>
                          useInitiativeStore.getState().updateCombatant(c.id, { maxHp: Number(e.target.value) })
                        }
                        className="w-14 rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 text-center text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => useInitiativeStore.getState().removeCombatant(c.id)}
                      aria-label={`Remover ${c.name} do combate`}
                      className="ml-auto text-parchment-400 hover:text-rose-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {hpPct !== null && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-parchment-900/10 dark:bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all ${
                          hpPct > 50 ? "bg-emerald-500" : hpPct > 20 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {c.conditions.map((cond) => (
                      <span
                        key={cond.id}
                        className="flex items-center gap-1 rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] font-medium text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300"
                      >
                        {cond.name}
                        {cond.duration !== undefined && <span className="opacity-70">({cond.duration})</span>}
                        <button
                          type="button"
                          onClick={() => useInitiativeStore.getState().removeCondition(c.id, cond.id)}
                          aria-label={`Remover condição ${cond.name} de ${c.name}`}
                          className="hover:text-rose-500"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={draft.name}
                      onChange={(e) =>
                        setConditionDraft((prev) => ({ ...prev, [c.id]: { ...draft, name: e.target.value } }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddCondition(c.id)}
                      placeholder="+ condição"
                      aria-label={`Nova condição para ${c.name}`}
                      className="w-24 rounded-full border border-dashed border-parchment-300 bg-transparent px-2 py-0.5 text-[11px] outline-none focus:border-wine-400 dark:border-parchment-700"
                    />
                    <input
                      value={draft.duration}
                      onChange={(e) =>
                        setConditionDraft((prev) => ({ ...prev, [c.id]: { ...draft, duration: e.target.value } }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddCondition(c.id)}
                      placeholder="rodadas"
                      type="number"
                      aria-label={`Duração da condição em rodadas para ${c.name}`}
                      className="w-16 rounded-full border border-dashed border-parchment-300 bg-transparent px-2 py-0.5 text-[11px] outline-none focus:border-wine-400 dark:border-parchment-700"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
