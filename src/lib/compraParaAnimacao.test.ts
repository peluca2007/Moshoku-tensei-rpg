import { beforeEach, describe, expect, it } from "vitest";
import { registrarCompraParaAnimacao, cancelarCompraParaAnimacao, consumirCompraParaAnimacao } from "./compraParaAnimacao";
import type { PurchasedAbility } from "./types";
const compra: PurchasedAbility = { treeId: "agua", rank: "Principiante", kind: "ability", id: "bola-de-agua" };
beforeEach(cancelarCompraParaAnimacao);
describe("evento transitório de compra", () => {
  it("consome uma vez e não repete ao voltar à ficha", () => {
    registrarCompraParaAnimacao("a", compra);
    expect(consumirCompraParaAnimacao("a", [compra])).toEqual(compra);
    expect(consumirCompraParaAnimacao("a", [compra])).toBeNull();
  });
  it("não anima uma compra reembolsada antes de abrir a ficha", () => {
    registrarCompraParaAnimacao("a", compra);
    expect(consumirCompraParaAnimacao("a", [])).toBeNull();
  });
  it("não anima outro personagem nem guarda o evento para a volta", () => {
    registrarCompraParaAnimacao("a", compra);
    expect(consumirCompraParaAnimacao("b", [compra])).toBeNull();
    expect(consumirCompraParaAnimacao("a", [compra])).toBeNull();
  });
  it("uma troca explícita cancela a compra pendente", () => {
    registrarCompraParaAnimacao("a", compra);
    cancelarCompraParaAnimacao();
    expect(consumirCompraParaAnimacao("a", [compra])).toBeNull();
  });
  it("importar uma ficha com compras não produz evento", () => {
    expect(consumirCompraParaAnimacao("a", [compra])).toBeNull();
  });
});

// Ações reais do store: a animação recebe autorização apenas do caminho de compra.
import { useCharacterStore } from "@/store/useCharacterStore";
describe("origem do evento nas ações da ficha", () => {
  function preparar() {
    const id = useCharacterStore.getState().createCharacter("Teste");
    const state = useCharacterStore.getState();
    useCharacterStore.setState({ characters: { ...state.characters, [id]: { ...state.characters[id], startingTreeId: "agua", unlockedRanks: [{ treeId: "agua", rank: "Principiante" }] } } });
    return id;
  }
  it("uma compra válida autoriza o efeito e uma rejeitada não", () => {
    const id = preparar();
    expect(useCharacterStore.getState().purchaseAbility(compra)).toBe(true);
    expect(consumirCompraParaAnimacao(id, [compra])).toEqual(compra);
    expect(useCharacterStore.getState().purchaseAbility(compra)).toBe(false);
    expect(consumirCompraParaAnimacao(id, [compra])).toBeNull();
  });
  it("desfazer impede que restaurar a compra produza uma celebração", () => {
    const id = preparar();
    useCharacterStore.getState().purchaseAbility(compra);
    useCharacterStore.getState().undo();
    expect(consumirCompraParaAnimacao(id, [compra])).toBeNull();
  });
  it("trocar de personagem cancela a compra pendente", () => {
    const id = preparar();
    useCharacterStore.getState().purchaseAbility(compra);
    useCharacterStore.getState().setActiveCharacter(id);
    expect(consumirCompraParaAnimacao(id, [compra])).toBeNull();
  });
});
