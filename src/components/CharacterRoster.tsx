"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, User, Check } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getRaceById } from "@/data/races";
import { getBackgroundById } from "@/data/backgrounds";
import { getPaSpent } from "@/store/selectors";

export default function CharacterRoster() {
  const router = useRouter();
  const order = useCharacterStore((s) => s.order);
  const characters = useCharacterStore((s) => s.characters);
  const activeId = useCharacterStore((s) => s.activeId);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function openCharacter(id: string) {
    useCharacterStore.getState().setActiveCharacter(id);
    router.push("/");
  }

  function createAndOpen() {
    useCharacterStore.getState().createCharacter();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-slate-50">
          <User className="h-6 w-6 text-sky-500" /> Meus Personagens
        </h1>
        <button
          type="button"
          onClick={createAndOpen}
          className="flex items-center gap-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
        >
          <Plus className="h-4 w-4" /> Criar Ficha
        </button>
      </header>

      {order.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nenhuma ficha ainda. Clique em &quot;Criar Ficha&quot; pra começar.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {order.map((id) => {
          const character = characters[id];
          if (!character) return null;
          const race = getRaceById(character.raceId);
          const background = getBackgroundById(character.backgroundId);
          const isActive = id === activeId;
          const isConfirming = confirmingId === id;

          return (
            <div
              key={id}
              className={`rounded-2xl border p-4 shadow-sm transition-colors ${
                isActive
                  ? "border-sky-400 bg-sky-50/60 dark:border-sky-500 dark:bg-sky-950/30"
                  : "border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60"
              }`}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <h2 className="font-bold text-slate-900 dark:text-slate-50">{character.name || "Sem nome"}</h2>
                {isActive && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                    <Check className="h-3 w-3" /> Ativa
                  </span>
                )}
              </div>
              <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                {race?.name ?? "Raça não definida"} · {background?.name ?? "Antecedente não definido"} ·{" "}
                {getPaSpent(character)} PA gastos
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openCharacter(id)}
                  className="flex-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900"
                >
                  Abrir Ficha
                </button>
                {isConfirming ? (
                  <button
                    type="button"
                    onClick={() => {
                      useCharacterStore.getState().deleteCharacter(id);
                      setConfirmingId(null);
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-500"
                  >
                    Confirmar?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(id)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition-colors hover:border-rose-300 hover:text-rose-500 dark:border-slate-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
