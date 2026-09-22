import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBestiaryStore } from "./useBestiaryStore";
import { SEMENTE_ENCONTRO } from "@/lib/encounterReport";

describe("encontros salvos", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    useBestiaryStore.setState({ criaturas: [], pastas: [], selecionadas: [], grupo: [], cenas: [], chegada: null, configuracao: { semente: SEMENTE_ENCONTRO, armasPorPersonagem: {} } });
  });

  it("guarda um instantâneo independente e restaura ações, armas e quantidades sem apagar outras criaturas", () => {
    const s = useBestiaryStore.getState();
    const id = s.criar(2, "padrao", "Goblin");
    s.adicionarAcao(id, { nome: "Lança", dano: "2d6", escalaDano: 1.25 });
    s.atualizar(id, { quantidade: 7, resistencias: ["frio"], tatica: "fragil" });
    s.definirGrupo(["heroi"]);
    s.configurarEncontro({ semente: 777, armasPorPersonagem: { heroi: "espada" } });
    const cenaId = s.salvarCena(" Emboscada ", "Chuva na estrada")!;
    s.atualizar(id, { quantidade: 1, resistencias: [] });
    s.atualizarAcao(id, useBestiaryStore.getState().criaturas[0].acoes[0].id, { dano: "99d20" });
    const outro = s.criar(6, "chefe", "Dragão");
    s.configurarEncontro({ semente: 2, armasPorPersonagem: {} });
    s.definirGrupo([]);
    expect(s.carregarCena(cenaId)).toBe(true);
    const restaurado = useBestiaryStore.getState();
    expect(restaurado.criaturas.find((c) => c.id === id)).toMatchObject({ quantidade: 7, resistencias: ["frio"], tatica: "fragil", acoes: [{ dano: "2d6", escalaDano: 1.25 }] });
    expect(restaurado.criaturas.some((c) => c.id === outro)).toBe(true);
    expect(restaurado.selecionadas).toEqual([id]);
    expect(restaurado.grupo).toEqual(["heroi"]);
    expect(restaurado.configuracao).toEqual({ semente: 777, armasPorPersonagem: { heroi: "espada" } });
    expect(restaurado.cenas[0].nome).toBe("Emboscada");
    expect(restaurado.cenas[0].criaturas[0]).not.toBe(restaurado.criaturas.find((c) => c.id === id));
  });

  it("reabrir é idempotente, recupera criatura removida e não recria pasta excluída", () => {
    const s = useBestiaryStore.getState();
    const pasta = s.criarPasta("Cena");
    const criatura = s.criar(1, "lacaio", "Goblin", pasta);
    const cena = s.salvarCena("Cena", "")!;
    s.remover(criatura); s.removerPasta(pasta);
    s.carregarCena(cena); s.carregarCena(cena);
    expect(useBestiaryStore.getState().criaturas).toHaveLength(1);
    expect(useBestiaryStore.getState().criaturas[0].pastaId).toBeUndefined();
  });

  it("atualizar conserva o id e excluir cena conserva o bestiário", () => {
    const s = useBestiaryStore.getState();
    expect(s.salvarCena("Vazio", "")).toBeNull();
    s.criar(1, "padrao");
    expect(s.salvarCena(" ", "")).toBeNull();
    const id = s.salvarCena("Antigo", "")!;
    expect(s.salvarCena("Novo", "Outra nota", id)).toBe(id);
    expect(useBestiaryStore.getState().cenas).toHaveLength(1);
    s.removerCena(id);
    expect(useBestiaryStore.getState().criaturas).toHaveLength(1);
    expect(s.carregarCena(id)).toBe(false);
  });
});
