import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Uma rolagem de dano pré-preenchida vinda de fora do painel (arma do Inventário, magia do Grimório) — o painel abre já com isso, mas o jogador ainda pode editar antes de rolar. */
export interface PendingDamageRoll {
  formula: string;
  modifier: number;
  label: string;
}

interface DiceRollerState {
  open: boolean;
  pending: PendingDamageRoll | null;
  /** Efeito de dado girando antes de assentar no resultado. Desligável pra um modo rápido em combate. */
  diceAnimationEnabled: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  /** Abre o painel já em cima da seção de Dano, com fórmula/modificador prontos pra rolar ou editar. */
  requestDamageRoll: (pending: PendingDamageRoll) => void;
  setDiceAnimationEnabled: (enabled: boolean) => void;
}

export const useDiceRollerStore = create<DiceRollerState>()(
  persist(
    (set) => ({
      open: false,
      pending: null,
      diceAnimationEnabled: true,
      setOpen: (open) => set({ open }),
      toggleOpen: () => set((s) => ({ open: !s.open })),
      requestDamageRoll: (pending) => set({ open: true, pending }),
      setDiceAnimationEnabled: (enabled) => set({ diceAnimationEnabled: enabled }),
    }),
    {
      name: "mushoku-tensei-dice-roller",
      skipHydration: true,
      version: 1,
      // Só a preferência de animação persiste — `open`/`pending` são estado de sessão, não devem
      // sobreviver a um reload (o painel não deve reabrir sozinho na próxima visita).
      partialize: (state) => ({ diceAnimationEnabled: state.diceAnimationEnabled }),
    }
  )
);
