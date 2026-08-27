import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Condition {
  id: string;
  name: string;
  /** Rodadas restantes; indefinido = sem prazo (removida manualmente). */
  duration?: number;
}

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  currentHp?: number;
  maxHp?: number;
  conditions: Condition[];
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

interface InitiativeState {
  combatants: Combatant[];
  round: number;
  currentTurnId: string | null;

  addCombatant: (name: string, initiative: number, maxHp?: number) => void;
  removeCombatant: (id: string) => void;
  updateCombatant: (id: string, patch: Partial<Omit<Combatant, "id" | "conditions">>) => void;
  addCondition: (combatantId: string, name: string, duration?: number) => void;
  removeCondition: (combatantId: string, conditionId: string) => void;
  nextTurn: () => void;
  resetCombat: () => void;
}

export const useInitiativeStore = create<InitiativeState>()(
  persist(
    (set) => ({
      combatants: [],
      round: 1,
      currentTurnId: null,

      addCombatant: (name, initiative, maxHp) =>
        set((state) => ({
          combatants: [
            ...state.combatants,
            {
              id: makeId("combatant"),
              name,
              initiative,
              maxHp,
              currentHp: maxHp,
              conditions: [],
            },
          ],
        })),

      removeCombatant: (id) =>
        set((state) => ({
          combatants: state.combatants.filter((c) => c.id !== id),
          currentTurnId: state.currentTurnId === id ? null : state.currentTurnId,
        })),

      updateCombatant: (id, patch) =>
        set((state) => ({
          combatants: state.combatants.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      addCondition: (combatantId, name, duration) =>
        set((state) => ({
          combatants: state.combatants.map((c) =>
            c.id === combatantId
              ? { ...c, conditions: [...c.conditions, { id: makeId("cond"), name, duration }] }
              : c
          ),
        })),

      removeCondition: (combatantId, conditionId) =>
        set((state) => ({
          combatants: state.combatants.map((c) =>
            c.id === combatantId ? { ...c, conditions: c.conditions.filter((cond) => cond.id !== conditionId) } : c
          ),
        })),

      /** Avança pro próximo combatente na ordem de Iniciativa (maior primeiro), decrementando a duração das condições de quem começa o turno. Voltar ao topo da lista soma 1 rodada. */
      nextTurn: () =>
        set((state) => {
          const sorted = [...state.combatants].sort((a, b) => b.initiative - a.initiative);
          if (sorted.length === 0) return state;
          const currentIdx = sorted.findIndex((c) => c.id === state.currentTurnId);
          const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % sorted.length;
          // só é uma "volta completa" (nova rodada) se já havia alguém jogando antes —
          // a primeiríssima chamada (currentIdx === -1) é o início da rodada 1, não uma volta.
          const wrapped = currentIdx !== -1 && nextIdx === 0;
          const nextCombatant = sorted[nextIdx];
          const combatants = state.combatants.map((c) => {
            if (c.id !== nextCombatant.id) return c;
            const conditions = c.conditions
              .map((cond) => (cond.duration !== undefined ? { ...cond, duration: cond.duration - 1 } : cond))
              .filter((cond) => cond.duration === undefined || cond.duration > 0);
            return { ...c, conditions };
          });
          return {
            combatants,
            currentTurnId: nextCombatant.id,
            round: wrapped ? state.round + 1 : state.round,
          };
        }),

      resetCombat: () => set({ combatants: [], round: 1, currentTurnId: null }),
    }),
    {
      name: "mushoku-tensei-initiative",
      skipHydration: true,
      version: 1,
    }
  )
);
