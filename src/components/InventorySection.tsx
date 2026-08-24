"use client";

import { useState } from "react";
import { Backpack, Plus, Trash2, ShieldCheck } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { InventoryItem } from "@/lib/types";

const TYPE_LABELS: Record<InventoryItem["type"], string> = {
  arma: "Arma",
  armadura: "Armadura",
  geral: "Geral",
};

export default function InventorySection({ inventory }: { inventory: InventoryItem[] }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<InventoryItem["type"]>("geral");
  const [acBonus, setAcBonus] = useState("");
  const [description, setDescription] = useState("");

  function changeType(next: InventoryItem["type"]) {
    setType(next);
    // +CA só faz sentido pra armadura — troca de tipo limpa o valor pra não colar em outro item.
    if (next !== "armadura") setAcBonus("");
  }

  function addItem() {
    if (!name.trim()) return;
    useCharacterStore.getState().addItem({
      name: name.trim(),
      type,
      acBonus: type === "armadura" && acBonus ? Number(acBonus) : undefined,
      description: description.trim() || undefined,
    });
    setName("");
    setType("geral");
    setAcBonus("");
    setDescription("");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
        <Backpack className="h-5 w-5 text-sky-500" /> Inventário
      </h2>

      {inventory.length === 0 && (
        <p className="mb-3 rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nenhum item ainda.
        </p>
      )}

      <div className="mb-3 space-y-2">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900 dark:text-slate-50">{item.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {TYPE_LABELS[item.type]}
                {item.type === "armadura" && item.acBonus ? ` · +${item.acBonus} CA` : ""}
              </p>
              {item.description && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {item.type === "armadura" && item.acBonus !== undefined && (
                <button
                  type="button"
                  onClick={() => useCharacterStore.getState().toggleEquipped(item.id)}
                  title={item.equipped ? "Desequipar" : "Equipar"}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                    item.equipped
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> {item.equipped ? "Equipado" : "Equipar"}
                </button>
              )}
              <button
                type="button"
                onClick={() => useCharacterStore.getState().removeItem(item.id)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition-colors hover:border-rose-300 hover:text-rose-500 dark:border-slate-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Nome
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Armadura de Couro"
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Descrição (opcional)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: dada pelo mestre da guilda"
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Tipo
          </label>
          <select
            value={type}
            onChange={(e) => changeType(e.target.value as InventoryItem["type"])}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="geral">Geral</option>
            <option value="arma">Arma</option>
            <option value="armadura">Armadura</option>
          </select>
        </div>
        {type === "armadura" && (
          <div className="w-20">
            <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              +CA
            </label>
            <input
              type="number"
              value={acBonus}
              onChange={(e) => setAcBonus(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        )}
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
    </section>
  );
}
