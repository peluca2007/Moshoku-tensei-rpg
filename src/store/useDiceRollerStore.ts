import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Uma rolagem de dano pré-preenchida vinda de fora do painel (arma do Inventário, magia do Grimório) — o painel abre já com isso, mas o jogador ainda pode editar antes de rolar. */
export interface PendingDamageRoll {
  formula: string;
  modifier: number;
  label: string;
}

/** Um teste de perícia pedido de fora — a ficha manda o nome e o total já somado. */
export interface PendingSkillRoll {
  nome: string;
  modificador: number;
  /** O personagem tem a perícia: dá Vantagem quando ela se encaixa (Cap. 1, §4). */
  treinada: boolean;
}

interface DiceRollerState {
  open: boolean;
  pending: PendingDamageRoll | null;
  pendingSkill: PendingSkillRoll | null;
  /** Efeito de dado girando antes de assentar no resultado. Desligável pra um modo rápido em combate. */
  diceAnimationEnabled: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  /** Abre o painel já em cima da seção de Dano, com fórmula/modificador prontos pra rolar ou editar. */
  requestDamageRoll: (pending: PendingDamageRoll) => void;
  /**
   * Abre o painel já montado num teste de PERÍCIA (0.1.32) — é o que acontece
   * ao tocar numa perícia da ficha. Segue o mesmo desenho de
   * `requestDamageRoll`: quem pede não sabe rolar, só sabe o que quer rolado.
   */
  requestSkillRoll: (pending: PendingSkillRoll) => void;
  setDiceAnimationEnabled: (enabled: boolean) => void;
}

export const useDiceRollerStore = create<DiceRollerState>()(
  persist(
    (set) => ({
      open: false,
      pending: null,
      pendingSkill: null,
      diceAnimationEnabled: true,
      setOpen: (open) => set({ open }),
      toggleOpen: () => set((s) => ({ open: !s.open })),
      requestDamageRoll: (pending) => set({ open: true, pending }),
      requestSkillRoll: (pendingSkill) => set({ open: true, pendingSkill }),
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
