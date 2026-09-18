import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Condition {
  id: string;
  name: string;
  /** Rodadas restantes; indefinido = sem prazo (removida manualmente). */
  duration?: number;
}

/**
 * O que o Mestre precisa saber sobre um monstro DURANTE a luta — 0.1.90.
 *
 * O Bloco do Monstro (Apêndice G) mora na tela de Encontros, que é onde o
 * encontro se monta. Só que a mesa acontece aqui, no rastreador — e era aqui
 * que o Mestre não tinha a CA, a Percepção passiva nem as resistências na
 * frente. Ele voltava pra outra tela no meio da rodada, ou chutava.
 *
 * Tudo aqui é CÓPIA, tirada da criatura no momento em que ela entra no
 * combate, e de propósito: o combate é um instantâneo. Se o Mestre recalibrar a
 * criatura no meio da luta, o bicho que já está na mesa não muda debaixo dele.
 */
export interface FichaDeCombate {
  ca: number;
  percepcao: number;
  /** "+3" já formatado — o rastreador exibe, não calcula. */
  atributos: { rotulo: string; valor: string }[];
  pericias: string[];
  resistencias: string[];
  imunidades: string[];
  deslocamento: number;
  movimentoEspecial?: string;
  tamanho?: string;
  sentido?: string;
  /** A CD que ela impõe, e o Bônus de Rank dela (= o patamar). */
  cdResistencia: number;
  patamar: number;
}

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  currentHp?: number;
  maxHp?: number;
  conditions: Condition[];
  /** Só criaturas têm. Personagem tem a ficha dele, que é bem maior que isto. */
  ficha?: FichaDeCombate;
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

interface InitiativeState {
  combatants: Combatant[];
  round: number;
  currentTurnId: string | null;

  addCombatant: (name: string, initiative: number, maxHp?: number, ficha?: FichaDeCombate) => void;
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

      addCombatant: (name, initiative, maxHp, ficha) =>
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
              ficha,
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
