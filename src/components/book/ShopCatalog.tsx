import { SHOP_CATEGORY_LABELS, SHOP_CATEGORY_ORDER, SHOP_ITEMS, ShopItem } from "@/data/shopItems";
import { BookTable, P, SubTitle } from "./BookUI";

/** Prefixa Dado/CA na descrição — evita uma coluna extra quase sempre vazia na tabela. */
function itemDetail(item: ShopItem): string {
  if (item.baseDie) return `Dado ${item.baseDie}. ${item.description}`;
  if (item.acBonus) return `+${item.acBonus} CA. ${item.description}`;
  return item.description;
}

/**
 * Onde o item é encontrado, em uma palavra.
 *
 * A coluna nasceu com o Compêndio (2026-09-23), quando o catálogo deixou de ser
 * só prateleira: sem ela, uma Lança Genuína de Superd apareceria na mesma
 * tabela que uma adaga de 6 PO, e nada na página diria que uma está à venda e a
 * outra não.
 */
function ondeSeAcha(item: ShopItem): string {
  switch (item.disponibilidade ?? "loja") {
    case "restrito":
      return "Fora da Guilda";
    case "inestimavel":
      return "Relíquia";
    default:
      return `Guilda ${item.guildRankRequired}`;
  }
}

/**
 * Gerado a partir de `SHOP_ITEMS` (mesmo array que a Loja em `/loja` usa pra
 * vender) — igual ao TreeCatalog do Cap. 3, isso garante que livro e loja
 * nunca divergem em nome, preço ou Rank mínimo.
 */
export default function ShopCatalog() {
  return (
    <div className="space-y-6">
      <P>
        O catálogo inteiro do mundo, e não só a prateleira. <b>Guilda F</b> a <b>Guilda S</b> é o Rank
        mínimo pra comprar em <code>/loja</code>, onde a compra debita o PO e manda o item direto pra ficha.{" "}
        <b>Fora da Guilda</b> é o que existe mas não está à venda ali — contrabando, drop e encomenda de
        submundo: tem preço porque alguém paga, só não é a Guilda que vende. <b>Relíquia</b> não tem preço
        nenhum: não se compra e não se vende (ver &ldquo;Vender o que caiu&rdquo;, abaixo).
      </P>
      {SHOP_CATEGORY_ORDER.map((category) => {
        const items = SHOP_ITEMS.filter((i) => i.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-2">
            <SubTitle>{SHOP_CATEGORY_LABELS[category]}</SubTitle>
            <BookTable
              headers={["Item", "Onde se acha", "Preço (PO)", "Descrição"]}
              rows={items.map((item) => [
                item.name,
                ondeSeAcha(item),
                item.price === null ? "—" : String(item.price),
                itemDetail(item),
              ])}
            />
          </div>
        );
      })}
    </div>
  );
}
