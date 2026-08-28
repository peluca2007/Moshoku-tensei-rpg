import { create } from "zustand";

/** Uma rolagem de dano pré-preenchida vinda de fora do painel (arma do Inventário, magia do Grimório) — o painel abre já com isso, mas o jogador ainda pode editar antes de rolar. */
export interface PendingDamageRoll {
  formula: string;
  modifier: number;
  label: string;
}

interface DiceRollerState {
  open: boolean;
  pending: PendingDamageRoll | null;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  /** Abre o painel já em cima da seção de Dano, com fórmula/modificador prontos pra rolar ou editar. */
  requestDamageRoll: (pending: PendingDamageRoll) => void;
}

export const useDiceRollerStore = create<DiceRollerState>((set) => ({
  open: false,
  pending: null,
  setOpen: (open) => set({ open }),
  toggleOpen: () => set((s) => ({ open: !s.open })),
  requestDamageRoll: (pending) => set({ open: true, pending }),
}));
