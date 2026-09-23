import { SHOP_ITEMS, type ShopItem } from "@/data/shopItems";
import { getSubArquetipo } from "@/data/bestiary";
import { makeRng } from "./combatSim";

/** Um item que caiu: sempre com preço, porque relíquia não é sorteada (ver abaixo). */
export type ItemDeLoot = ShopItem & { price: number };

export interface LootGerado {
  moedas: number;
  /** O que o corpo e o cenário deram: presa, casco, gema esgotada. Vende a 100%. */
  tralhas: ItemDeLoot[];
  /** Poção, veneno, equipamento. Vende a 50%. */
  itens: ItemDeLoot[];
  valorTotal: number;
}

/**
 * O que pode cair de um encontro.
 *
 * Relíquia (`price: null`) nunca entra: ela não tem preço porque não está na
 * economia, e um gerador que trabalha com orçamento em PO não tem como pesá-la.
 * Uma Lança de Superd cai quando a HISTÓRIA a entrega — nunca porque o d20
 * disse que sim.
 *
 * Encantamento também fica de fora: é serviço encomendado a um encantador, não
 * uma coisa que um lobo carrega.
 */
const SORTEAVEIS = SHOP_ITEMS.filter(
  (item): item is ItemDeLoot => item.price !== null && item.price > 0 && item.category !== "encantamento"
);

const TRALHAS = SORTEAVEIS.filter((i) => i.category === "tralha");
const EQUIPAMENTO = SORTEAVEIS.filter((i) => ["pocao", "aventura", "veneno"].includes(i.category));

/** Quanto do orçamento vem em moeda, por quem foi derrotado. */
const PESO_DA_MOEDA = { nenhuma: 0.1, pouca: 0.3, bolsa: 0.6 } as const;

/**
 * O espólio dos sub-arquétipos derrotados, e quanto deles vem em moeda.
 *
 * Sem sub-arquétipo nenhum, cai no comportamento antigo: qualquer tralha do
 * catálogo e 40% em moeda. É o encontro montado antes de 2026-09-23, que
 * continua funcionando.
 */
function espolioDe(subArquetipos: string[]): { tralhas: ItemDeLoot[]; fracaoMoeda: number } {
  const subs = subArquetipos.map(getSubArquetipo).filter((s) => s !== undefined);
  if (!subs.length) return { tralhas: TRALHAS, fracaoMoeda: 0.4 };

  const ids = new Set(subs.flatMap((s) => s.espolios));
  const tralhas = TRALHAS.filter((t) => ids.has(t.id));

  // A média, e não o maior: um grupo de bandidos com um lobo de estimação
  // carrega menos bolsa por cabeça do que um bando só de bandidos.
  const fracaoMoeda = subs.reduce((soma, s) => soma + PESO_DA_MOEDA[s.moeda], 0) / subs.length;

  return { tralhas: tralhas.length ? tralhas : TRALHAS, fracaoMoeda };
}

/**
 * O espólio de um encontro, a partir do orçamento em PO que o Mestre declarou.
 *
 * Divide em três porque é assim que a mesa usa (Cap. 5, "Vender o que caiu"):
 * a moeda entra direto na ficha, a TRALHA é o que se vende pelo preço cheio, e
 * o equipamento é o que se usa ou se revende pela metade. Antes tudo vinha como
 * uma pilha só de poções — o resultado era que a economia de revenda não tinha
 * de onde tirar tralha nenhuma, e a parte mais característica dela nunca
 * acontecia na mesa.
 *
 * `subArquetipos` são os das criaturas derrotadas: é o que faz o espólio sair
 * do corpo em vez de um sorteio cego. Um bando de lobos deixa presa e chifre e
 * quase nada em moeda; uma quadrilha de bandidos deixa bolsa.
 *
 * Determinístico pela semente: a mesma batalha sorteada de novo devolve o mesmo
 * espólio, senão o Mestre que recarrega a página ganha outro tesouro.
 */
export function gerarLootDoEncontro(
  orcamento: number,
  seed: number,
  subArquetipos: string[] = []
): LootGerado {
  if (!Number.isSafeInteger(orcamento) || orcamento < 0 || orcamento > 1000000)
    throw new Error("Informe um orçamento de 0 a 1.000.000 PO.");
  if (!Number.isSafeInteger(seed)) throw new Error("Semente inválida.");

  const rng = makeRng(seed);
  const { tralhas: elegiveisTralha, fracaoMoeda } = espolioDe(subArquetipos);
  const tralhas: ItemDeLoot[] = [];
  const itens: ItemDeLoot[] = [];
  let gasto = 0;

  // O que não vai em moeda se divide entre espólio e equipamento. Uma bolsa que
  // vem só em objeto obriga o grupo a achar um comprador antes de poder comer;
  // uma que vem só em moeda apaga o saque do jogo.
  const emObjeto = 1 - fracaoMoeda;
  const tetoTralha = Math.floor(orcamento * emObjeto * 0.6);
  const tetoItens = Math.floor(orcamento * emObjeto * 0.4);

  for (const [lista, teto, destino] of [
    [elegiveisTralha, tetoTralha, tralhas],
    [EQUIPAMENTO, tetoItens, itens],
  ] as const) {
    let gastoAqui = 0;
    for (let i = 0; i < 5; i++) {
      const elegiveis = lista.filter((item) => item.price <= teto - gastoAqui);
      if (!elegiveis.length) break;
      const item = elegiveis[Math.floor(rng() * elegiveis.length)];
      destino.push(item);
      gastoAqui += item.price;
    }
    gasto += gastoAqui;
  }

  return { moedas: orcamento - gasto, tralhas, itens, valorTotal: orcamento };
}
