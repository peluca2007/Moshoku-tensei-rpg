"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, User, Check, Upload, Wand2 } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getRaceById } from "@/data/races";
import RaceCrest from "./RaceCrest";
import { getBackgroundById } from "@/data/backgrounds";
import { getGuildRank, getPaSpent } from "@/store/selectors";

export default function CharacterRoster() {
  const router = useRouter();
  const order = useCharacterStore((s) => s.order);
  const characters = useCharacterStore((s) => s.characters);
  const activeId = useCharacterStore((s) => s.activeId);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openCharacter(id: string) {
    useCharacterStore.getState().setActiveCharacter(id);
    router.push("/ficha");
  }

  function createAndOpen() {
    useCharacterStore.getState().createCharacter();
    router.push("/ficha");
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== "object" || !("attributeBase" in data)) {
        throw new Error("Arquivo não parece ser uma ficha exportada deste site.");
      }
      useCharacterStore.getState().importCharacter(data);
      router.push("/ficha");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Não foi possível ler esse arquivo.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <User className="h-6 w-6 text-wine-500" /> Meus Personagens
        </h1>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-2 text-sm font-medium text-parchment-600 transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <Upload className="h-4 w-4" /> Importar JSON
          </button>
          <Link
            href="/criar"
            className="flex items-center gap-1 rounded-lg border border-wine-400 px-3 py-2 text-sm font-medium text-wine-600 transition-colors hover:bg-wine-50 dark:border-wine-600 dark:text-wine-300 dark:hover:bg-wine-950/40"
            title="Escolha entre criação manual, roleta ou entrevista do destino"
          >
            <Wand2 className="h-4 w-4" /> Criar com Guia
          </Link>
          <button
            type="button"
            onClick={createAndOpen}
            className="flex items-center gap-1 rounded-lg bg-wine-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wine-500"
          >
            <Plus className="h-4 w-4" /> Criar Ficha
          </button>
        </div>
      </header>

      {importError && (
        <p className="mb-4 rounded-lg border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {importError}
        </p>
      )}

      {order.length === 0 && (
        <p className="rounded-xl border border-dashed border-parchment-300 p-8 text-center text-sm text-parchment-600 dark:border-parchment-700 dark:text-parchment-400">
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
                  ? "border-wine-400 bg-wine-50/60 dark:border-wine-500 dark:bg-wine-950/30"
                  : "border-parchment-300 bg-parchment-100/70 dark:border-parchment-800 dark:bg-parchment-900/60"
              }`}
            >
              {/*
                O retrato da raça no card (2026-09-03). Não é a foto de perfil
                que o roster ainda vai ganhar — é o que dá pra mostrar hoje sem
                pedir upload nenhum, e ocupa exatamente o lugar dela: um card de
                ficha que era só nome e dois botões passa a ter uma cara.
              */}
              <div className="mb-3 flex items-start gap-3">
                {race && <RaceCrest race={race} size={52} rounded="rounded-xl" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-parchment-900 dark:text-parchment-50">
                      {character.name || "Sem nome"}
                    </h2>
                    {isActive && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-wine-500/10 px-2 py-0.5 text-[11px] font-semibold text-wine-600 dark:text-wine-300">
                        <Check className="h-3 w-3" /> Ativa
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-parchment-600 dark:text-parchment-400">
                    {race?.name ?? "Raça não definida"} · {background?.name ?? "Antecedente não definido"} ·{" "}
                    {getPaSpent(character)} PA gastos · Rank {getGuildRank(character)} na Guilda
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openCharacter(id)}
                  className="flex-1 rounded-lg bg-parchment-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-parchment-700 dark:bg-white dark:text-parchment-900"
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
                    aria-label={`Apagar ${character.name || "personagem sem nome"}`}
                    className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 transition-colors hover:border-rose-300 hover:text-rose-500 dark:border-parchment-700"
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
