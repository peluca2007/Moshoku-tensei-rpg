"use client";

import { useRef, useState } from "react";
import { Swords, Maximize, Minimize } from "lucide-react";
import { useInitiativeStore } from "@/store/useInitiativeStore";

function hpColor(ratio: number) {
  if (ratio <= 0.25) return "bg-rose-500";
  if (ratio <= 0.6) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function PresentationMode() {
  const combatants = useInitiativeStore((s) => s.combatants);
  const round = useInitiativeStore((s) => s.round);
  const currentTurnId = useInitiativeStore((s) => s.currentTurnId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-parchment-950 p-6 text-parchment-50 sm:p-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-black sm:text-4xl">
          <Swords className="h-8 w-8 text-wine-400 sm:h-10 sm:w-10" /> Rodada {round}
        </h1>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-2 rounded-full border border-parchment-700 px-4 py-2 text-sm font-medium text-parchment-300 transition-colors hover:bg-parchment-900"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          {isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
        </button>
      </header>

      {sorted.length === 0 ? (
        <p className="text-center text-lg text-parchment-500">Aguardando o Mestre iniciar um combate em /iniciativa...</p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((c) => {
            const isCurrent = c.id === currentTurnId;
            const ratio = c.maxHp ? Math.max(0, (c.currentHp ?? 0) / c.maxHp) : 1;
            return (
              <li
                key={c.id}
                className={`rounded-3xl border-2 p-5 transition-colors sm:p-6 ${
                  isCurrent ? "border-wine-400 bg-wine-950/40" : "border-parchment-800 bg-parchment-900/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {isCurrent && <span className="rounded-full bg-wine-500 px-3 py-1 text-xs font-black uppercase tracking-wide">Agora</span>}
                    <span className="text-xl font-bold sm:text-3xl">{c.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-parchment-400 sm:text-base">Iniciativa {c.initiative}</span>
                </div>

                {c.maxHp !== undefined && (
                  <div className="mt-3">
                    <div className="h-4 w-full overflow-hidden rounded-full bg-parchment-800 sm:h-5">
                      <div
                        className={`h-full rounded-full transition-all ${hpColor(ratio)}`}
                        style={{ width: `${Math.round(ratio * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-sm text-parchment-400 sm:text-base">
                      {c.currentHp ?? 0} / {c.maxHp} PV
                    </p>
                  </div>
                )}

                {c.conditions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.conditions.map((cond) => (
                      <span
                        key={cond.id}
                        className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 sm:text-sm"
                      >
                        {cond.name}
                        {cond.duration !== undefined ? ` (${cond.duration})` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
