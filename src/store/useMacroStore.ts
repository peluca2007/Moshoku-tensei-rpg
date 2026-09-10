import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdvantageMode } from "@/lib/rollEngine";

/**
 * Macro de rolagem do jogador. Independente de personagem — é um atalho de
 * mesa, não um pedaço de ficha.
 *
 * ## Por que virou duas coisas (0.1.21)
 *
 * Até aqui era `{ id, label, formula }`, e só sabia guardar DANO. Metade do que
 * se repete numa sessão é o outro lado: "Furtividade com Vantagem", "Resistir
 * ao veneno", "Iniciativa" — tudo d20 com um modificador e um modo de vantagem,
 * e nada disso cabia numa fórmula de dados.
 *
 * O `tipo` é o que separa os dois, e existe como campo em vez de ser deduzido
 * da forma (por exemplo, "tem `formula`? então é dano") porque dedução por
 * ausência de campo é o tipo de regra que se quebra sozinha no dia em que o
 * terceiro tipo aparecer.
 */
export type MacroDeDano = {
  id: string;
  label: string;
  tipo: "dano";
  formula: string;
};

export type MacroDeTeste = {
  id: string;
  label: string;
  tipo: "teste";
  /** O bônus somado ao d20 — já é o total, porque o macro não sabe de personagem. */
  modificador: number;
  modo: AdvantageMode;
};

export type RollMacro = MacroDeDano | MacroDeTeste;

interface MacroState {
  macros: RollMacro[];
  addMacroDeDano: (label: string, formula: string) => void;
  addMacroDeTeste: (label: string, modificador: number, modo: AdvantageMode) => void;
  removeMacro: (id: string) => void;
}

function makeMacroId() {
  return `macro_${Math.random().toString(36).slice(2, 10)}`;
}

/** O formato salvo antes da 0.1.21: sem `tipo`, e sempre dano. */
interface MacroAntigo {
  id?: string;
  label?: string;
  formula?: string;
}

/**
 * v1 → v2: todo macro salvo até aqui era de dano, então ganha `tipo: "dano"`.
 *
 * "Ficha salva nunca é resetada" é a terceira regra da base de código, e vale
 * pro que está do lado dela: alguém tem "Bola de Fogo → 2d10+5" guardado desde
 * a primeira sessão, e um macro que some sem explicação é indistinguível de um
 * bug. Por isso a migração é defensiva com o que veio do disco — `label` e
 * `formula` são checados um a um, e um registro sem fórmula é descartado em vez
 * de virar um botão que rola zero.
 *
 * Exportada porque é ela que o teste chama: em Node não existe `localStorage`,
 * o `persist` do zustand vira passagem direta e `useMacroStore.persist` nem é
 * criado — não dá pra alcançar a migração pelo caminho da store. O `migrate:`
 * logo abaixo é a única linha que amarra as duas coisas.
 */
export function migrarMacros(estado: unknown, versao: number): MacroState {
  const anterior = estado as Partial<MacroState> | undefined;
  if (versao >= 2) return anterior as MacroState;

  const antigos = (anterior?.macros ?? []) as MacroAntigo[];
  const macros: RollMacro[] = antigos
    .filter((m): m is MacroAntigo & { formula: string } => typeof m?.formula === "string" && m.formula.trim() !== "")
    .map((m) => ({
      id: typeof m.id === "string" ? m.id : makeMacroId(),
      label: typeof m.label === "string" && m.label.trim() ? m.label : m.formula,
      tipo: "dano",
      formula: m.formula,
    }));

  return { ...(anterior as MacroState), macros };
}

export const useMacroStore = create<MacroState>()(
  persist(
    (set) => ({
      macros: [],
      addMacroDeDano: (label, formula) =>
        set((state) => ({
          macros: [
            ...state.macros,
            { id: makeMacroId(), label: label.trim() || formula.trim(), tipo: "dano", formula: formula.trim() },
          ],
        })),
      addMacroDeTeste: (label, modificador, modo) =>
        set((state) => ({
          macros: [...state.macros, { id: makeMacroId(), label: label.trim() || "Teste", tipo: "teste", modificador, modo }],
        })),
      removeMacro: (id) => set((state) => ({ macros: state.macros.filter((m) => m.id !== id) })),
    }),
    {
      name: "mushoku-tensei-macros",
      skipHydration: true,
      version: 2,
      migrate: migrarMacros,
    }
  )
);
