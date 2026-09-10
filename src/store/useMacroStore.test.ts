import { beforeEach, describe, expect, it } from "vitest";
import { migrarMacros, useMacroStore } from "./useMacroStore";

beforeEach(() => {
  useMacroStore.setState({ macros: [] });
});

describe("macros de dano", () => {
  it("guarda a fórmula e o nome", () => {
    useMacroStore.getState().addMacroDeDano("Bola de Fogo", "2d10+5");
    const [m] = useMacroStore.getState().macros;
    expect(m.tipo).toBe("dano");
    expect(m.label).toBe("Bola de Fogo");
    if (m.tipo === "dano") expect(m.formula).toBe("2d10+5");
  });

  it("sem nome, o nome vira a própria fórmula", () => {
    useMacroStore.getState().addMacroDeDano("   ", "1d6");
    expect(useMacroStore.getState().macros[0].label).toBe("1d6");
  });
});

describe("macros de teste", () => {
  it("guarda modificador e modo de vantagem", () => {
    useMacroStore.getState().addMacroDeTeste("Furtividade", 7, "vantagem");
    const [m] = useMacroStore.getState().macros;
    expect(m.tipo).toBe("teste");
    if (m.tipo === "teste") {
      expect(m.modificador).toBe(7);
      expect(m.modo).toBe("vantagem");
    }
  });

  it("aceita modificador negativo", () => {
    useMacroStore.getState().addMacroDeTeste("Nadar de armadura", -3, "desvantagem");
    const [m] = useMacroStore.getState().macros;
    if (m.tipo === "teste") expect(m.modificador).toBe(-3);
  });

  it("os dois tipos convivem na mesma lista", () => {
    useMacroStore.getState().addMacroDeDano("Espadada", "1d8+4");
    useMacroStore.getState().addMacroDeTeste("Iniciativa", 5, "normal");
    expect(useMacroStore.getState().macros.map((m) => m.tipo)).toEqual(["dano", "teste"]);
  });

  it("cada macro tem id próprio", () => {
    for (let i = 0; i < 30; i++) useMacroStore.getState().addMacroDeDano(`m${i}`, "1d6");
    const ids = useMacroStore.getState().macros.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("remover tira só o pedido", () => {
    useMacroStore.getState().addMacroDeDano("a", "1d6");
    useMacroStore.getState().addMacroDeDano("b", "1d8");
    const alvo = useMacroStore.getState().macros[0].id;
    useMacroStore.getState().removeMacro(alvo);
    expect(useMacroStore.getState().macros.map((m) => m.label)).toEqual(["b"]);
  });
});

/*
 * A migração v1 → v2.
 *
 * "Ficha salva nunca é resetada" é a terceira regra da base de código, e vale
 * pro que está do lado dela: alguém tem "Bola de Fogo → 2d10+5" guardado desde
 * a primeira sessão, e um macro que some sem explicação é indistinguível de um
 * defeito.
 */
describe("migração do que já estava salvo", () => {
  // Chamada direta, e não via `useMacroStore.persist`: em Node não há
  // `localStorage`, o `persist` vira passagem direta e a API dele nem existe.
  // O que amarra esta função ao caminho de verdade é o `migrate: migrarMacros`
  // do próprio arquivo da store.
  const migrar = (estado: unknown, versao: number) => migrarMacros(estado, versao) as { macros: unknown[] };

  it("macro antigo vira macro de dano, com nome e fórmula intactos", () => {
    const migrado = migrar({ macros: [{ id: "macro_x", label: "Bola de Fogo", formula: "2d10+5" }] }, 1);
    expect(migrado.macros).toEqual([
      { id: "macro_x", label: "Bola de Fogo", tipo: "dano", formula: "2d10+5" },
    ]);
  });

  it("macro antigo sem nome herda a fórmula como nome", () => {
    const migrado = migrar({ macros: [{ id: "macro_y", formula: "1d6" }] }, 1) as {
      macros: { label: string }[];
    };
    expect(migrado.macros[0].label).toBe("1d6");
  });

  it("registro sem fórmula é descartado, e não vira um botão que rola zero", () => {
    const migrado = migrar({ macros: [{ id: "a" }, { id: "b", formula: "   " }, { id: "c", formula: "1d4" }] }, 1);
    expect(migrado.macros).toHaveLength(1);
  });

  it("lista vazia continua vazia, sem explodir", () => {
    expect(migrar({ macros: [] }, 1).macros).toEqual([]);
    expect(migrar({}, 1).macros).toEqual([]);
    expect(migrar(undefined, 1).macros).toEqual([]);
  });

  it("estado que já é v2 passa sem ser mexido", () => {
    const jaNovo = { macros: [{ id: "z", label: "Furtividade", tipo: "teste", modificador: 7, modo: "vantagem" }] };
    expect(migrar(jaNovo, 2)).toBe(jaNovo);
  });
});
