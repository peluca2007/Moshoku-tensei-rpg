import type { PurchasedAbility } from "./types";

// Transitório: não entra no arquivo da ficha nem sobrevive a recarregar a página.
let pendente: { personagem: string; compra: PurchasedAbility } | null = null;
export function registrarCompraParaAnimacao(personagem: string, compra: PurchasedAbility) {
  pendente = { personagem, compra };
}
export function cancelarCompraParaAnimacao() { pendente = null; }
export function consumirCompraParaAnimacao(personagem: string, compras: PurchasedAbility[]) {
  const evento = pendente;
  pendente = null;
  if (!evento || evento.personagem !== personagem) return null;
  return compras.find(c => c.treeId === evento.compra.treeId && c.rank === evento.compra.rank && c.kind === evento.compra.kind && c.id === evento.compra.id) ?? null;
}
