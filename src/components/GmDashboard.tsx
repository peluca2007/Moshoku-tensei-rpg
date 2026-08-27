"use client";

import Link from "next/link";
import { LayoutDashboard, Shield } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getRaceById } from "@/data/races";
import {
  getArmorClass,
  getCurrentHp,
  getCurrentMp,
  getCurrentPp,
  getCurrentPt,
  getMaxHp,
  getMaxMp,
  getPpPool,
  getPtPool,
} from "@/store/selectors";

function ResourceBar({ current, max, tone }: { current: number; max: number; tone: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-parchment-900/10 dark:bg-white/10">
      <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function GmDashboard() {
  const order = useCharacterStore((s) => s.order);
  const characters = useCharacterStore((s) => s.characters);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <LayoutDashboard className="h-6 w-6 text-wine-500" /> Painel do Mestre
        </h1>
      </header>

      {order.length === 0 ? (
        <p className="rounded-xl border border-dashed border-parchment-300 p-8 text-center text-sm text-parchment-500 dark:border-parchment-700 dark:text-parchment-400">
          Nenhum personagem salvo ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {order.map((id) => {
            const character = characters[id];
            if (!character) return null;
            const race = getRaceById(character.raceId);

            const maxHp = getMaxHp(character);
            const currentHp = getCurrentHp(character);
            const maxMp = getMaxMp(character);
            const currentMp = getCurrentMp(character);
            const maxPt = getPtPool(character);
            const currentPt = getCurrentPt(character);
            const maxPp = getPpPool(character);
            const currentPp = getCurrentPp(character);
            const ac = getArmorClass(character);

            return (
              <Link
                key={id}
                href="/personagens"
                onClick={() => useCharacterStore.getState().setActiveCharacter(id)}
                className="block rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm transition-colors hover:border-wine-400 dark:border-parchment-800 dark:bg-parchment-900/60 dark:hover:border-wine-500"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="font-bold text-parchment-900 dark:text-parchment-50">{character.name || "Sem nome"}</h2>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-parchment-900/5 px-2 py-0.5 text-xs font-semibold text-parchment-600 dark:bg-white/5 dark:text-parchment-300">
                    <Shield className="h-3 w-3" /> CA {ac}
                  </span>
                </div>
                {race && <p className="mb-3 text-xs text-parchment-500 dark:text-parchment-400">{race.name}</p>}

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="mb-0.5 flex justify-between text-parchment-600 dark:text-parchment-300">
                      <span>PV</span>
                      <span>
                        {currentHp} / {maxHp}
                      </span>
                    </div>
                    <ResourceBar current={currentHp} max={maxHp} tone="bg-rose-500" />
                  </div>
                  {maxMp > 0 && (
                    <div>
                      <div className="mb-0.5 flex justify-between text-parchment-600 dark:text-parchment-300">
                        <span>PM</span>
                        <span>
                          {currentMp} / {maxMp}
                        </span>
                      </div>
                      <ResourceBar current={currentMp} max={maxMp} tone="bg-sky-500" />
                    </div>
                  )}
                  {maxPt > 0 && (
                    <div>
                      <div className="mb-0.5 flex justify-between text-parchment-600 dark:text-parchment-300">
                        <span>PT</span>
                        <span>
                          {currentPt} / {maxPt}
                        </span>
                      </div>
                      <ResourceBar current={currentPt} max={maxPt} tone="bg-amber-500" />
                    </div>
                  )}
                  {maxPp > 0 && (
                    <div>
                      <div className="mb-0.5 flex justify-between text-parchment-600 dark:text-parchment-300">
                        <span>PP</span>
                        <span>
                          {currentPp} / {maxPp}
                        </span>
                      </div>
                      <ResourceBar current={currentPp} max={maxPp} tone="bg-emerald-500" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
