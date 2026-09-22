import { SHOP_ITEMS, type ShopItem } from "@/data/shopItems";
import { makeRng } from "./combatSim";

export interface LootGerado {
  moedas: number;
  itens: ShopItem[];
  valorTotal: number;
}

/** O mestre informa o orçamento em PO; preços vêm da Loja da Guilda. */
export function gerarLootDoEncontro(orcamento: number, seed: number): LootGerado {
  if (!Number.isSafeInteger(orcamento) || orcamento < 0 || orcamento > 1000000) throw new Error("Informe um orçamento de 0 a 1.000.000 PO.");
  if (!Number.isSafeInteger(seed)) throw new Error("Semente inválida.");
  const rng = makeRng(seed);
  let saldo = orcamento;
  const itens: ShopItem[] = [];
  const tetoItens = Math.floor(orcamento * 0.6);
  let gasto = 0;
  for (let i = 0; i < 5; i++) {
    const elegiveis = SHOP_ITEMS.filter((item) => ["pocao", "aventura"].includes(item.category) && item.price > 0 && item.price <= tetoItens - gasto);
    if (!elegiveis.length) break;
    const item = elegiveis[Math.floor(rng() * elegiveis.length)];
    itens.push(item);
    gasto += item.price;
    saldo -= item.price;
  }
  return { moedas: saldo, itens, valorTotal: orcamento };
}
