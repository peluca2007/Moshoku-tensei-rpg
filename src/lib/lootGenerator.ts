import { SHOP_ITEMS, type ShopItem } from "@/data/shopItems";
import { FRACAO_EM_MOEDA, getSubArquetipo } from "@/data/bestiary";
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

/**
 * Uma criatura derrotada, do jeito que a recompensa precisa dela: o valor da
 * conta do Apêndice G (`recompensaDaCriatura`) e o sub-arquétipo, que decide
 * de que o valor é feito.
 */
export interface CriaturaDerrotada {
  valor: number;
  subArquetipo?: string;
}

/** Sem sub-arquétipo: a criatura montada antes de 2026-09-23 carrega pouca moeda e qualquer tralha. */
const SEM_SUB = {
  fracaoMoeda: FRACAO_EM_MOEDA.pouca,
  temEquipamento: true,
  partes: { nome: "Partes aproveitáveis", descricao: "O que dá pra vender do corpo e da bagagem dela, pelo preço cheio." },
};

function sortearAte(lista: ItemDeLoot[], teto: number, rng: () => number, maximo: number): ItemDeLoot[] {
  const escolhidos: ItemDeLoot[] = [];
  let gasto = 0;
  for (let i = 0; i < maximo; i++) {
    const elegiveis = lista.filter((item) => item.price <= teto - gasto);
    if (!elegiveis.length) break;
    const item = elegiveis[Math.floor(rng() * elegiveis.length)];
    escolhidos.push(item);
    gasto += item.price;
  }
  return escolhidos;
}

/**
 * A RECOMPENSA DE UM ENCONTRO (Apêndice G, "A recompensa") — 2026-10-07.
 *
 * Cada criatura derrotada vale a conta dela, e o valor aparece INTEIRO,
 * dividido pela moeda do sub-arquétipo:
 *
 * - **Moeda:** bolsa 60%, pouca 30%, nenhuma 0%. O lobo não carrega bolsa, e
 *   antes desta data o gerador transformava em moeda tudo o que a tralha não
 *   cobria — o livro dizia que a besta não deixa moeda, e o site deixava.
 * - **Equipamento** (poção, veneno, aventura; revende pela metade): só de quem
 *   carrega bolsa, até 40% do que não veio em moeda.
 * - **Espólio** (vende pelo preço cheio): até três itens da lista do
 *   sub-arquétipo, e o que sobra vira as "partes valiosas" dele — o couro
 *   inteiro, o núcleo, o sangue. É por isso que caçar vale mais que saquear.
 *
 * Determinístico pela semente: a mesma batalha sorteada de novo devolve o mesmo
 * espólio, senão o Mestre que recarrega a página ganha outro tesouro.
 */
export function gerarRecompensaDoEncontro(criaturas: CriaturaDerrotada[], seed: number): LootGerado {
  if (!Number.isSafeInteger(seed)) throw new Error("Semente inválida.");
  const rng = makeRng(seed);
  const porSub = new Map<string, number>();
  for (const c of criaturas) {
    if (!Number.isFinite(c.valor) || c.valor <= 0) continue;
    const chave = getSubArquetipo(c.subArquetipo) ? c.subArquetipo! : "";
    porSub.set(chave, (porSub.get(chave) ?? 0) + Math.round(c.valor));
  }

  let moedas = 0;
  const tralhas: ItemDeLoot[] = [];
  const itens: ItemDeLoot[] = [];
  let valorTotal = 0;
  for (const [chave, valor] of porSub) {
    valorTotal += valor;
    const sub = getSubArquetipo(chave);
    const fracaoMoeda = sub ? FRACAO_EM_MOEDA[sub.moeda] : SEM_SUB.fracaoMoeda;
    const emMoeda = Math.round(valor * fracaoMoeda);
    moedas += emMoeda;
    let resto = valor - emMoeda;

    if (sub ? sub.moeda === "bolsa" : SEM_SUB.temEquipamento) {
      const equipamento = sortearAte(EQUIPAMENTO, Math.floor(resto * 0.4), rng, 3);
      itens.push(...equipamento);
      resto -= equipamento.reduce((s, i) => s + i.price, 0);
    }

    const lista = sub ? TRALHAS.filter((t) => sub.espolios.includes(t.id)) : TRALHAS;
    const espolio = sortearAte(lista.length ? lista : TRALHAS, resto, rng, 3);
    tralhas.push(...espolio);
    resto -= espolio.reduce((s, i) => s + i.price, 0);

    if (resto > 0) {
      const partes = sub?.partesValiosas ?? SEM_SUB.partes;
      tralhas.push({
        id: `partes_${chave || "aproveitaveis"}`,
        name: partes.nome,
        category: "tralha",
        type: "geral",
        description: partes.descricao,
        price: resto,
        guildRankRequired: "F",
        disponibilidade: "restrito",
      });
    }
  }

  return { moedas, tralhas, itens, valorTotal };
}

/**
 * O espólio a partir de um orçamento que o Mestre escreveu à mão, no lugar da
 * conta do livro. O valor se divide igual entre os sub-arquétipos em cena, e
 * cada parte segue a regra de `gerarRecompensaDoEncontro`.
 */
export function gerarLootDoEncontro(
  orcamento: number,
  seed: number,
  subArquetipos: string[] = []
): LootGerado {
  if (!Number.isSafeInteger(orcamento) || orcamento < 0 || orcamento > 1000000)
    throw new Error("Informe um orçamento de 0 a 1.000.000 PO.");
  if (!Number.isSafeInteger(seed)) throw new Error("Semente inválida.");
  const subs = subArquetipos.length ? subArquetipos : [""];
  const parte = Math.floor(orcamento / subs.length);
  const criaturas = subs.map((subArquetipo, i) => ({
    subArquetipo: subArquetipo || undefined,
    // O resto da divisão vai pro primeiro, pra soma bater com o orçamento.
    valor: parte + (i === 0 ? orcamento - parte * subs.length : 0),
  }));
  return { ...gerarRecompensaDoEncontro(criaturas, seed), valorTotal: orcamento };
}
