import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Macro de rolagem customizado do jogador — ex: "Bola de Fogo" -> "2d10+5". Independente de personagem. */
export interface RollMacro {
  id: string;
  label: string;
  formula: string;
}

interface MacroState {
  macros: RollMacro[];
  addMacro: (label: string, formula: string) => void;
  removeMacro: (id: string) => void;
}

function makeMacroId() {
  return `macro_${Math.random().toString(36).slice(2, 10)}`;
}

export const useMacroStore = create<MacroState>()(
  persist(
    (set) => ({
      macros: [],
      addMacro: (label, formula) =>
        set((state) => ({
          macros: [...state.macros, { id: makeMacroId(), label: label.trim() || formula.trim(), formula: formula.trim() }],
        })),
      removeMacro: (id) => set((state) => ({ macros: state.macros.filter((m) => m.id !== id) })),
    }),
    {
      name: "mushoku-tensei-macros",
      skipHydration: true,
      version: 1,
    }
  )
);
