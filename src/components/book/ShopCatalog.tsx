import { SHOP_CATEGORY_LABELS, SHOP_CATEGORY_ORDER, SHOP_ITEMS, ShopItem } from "@/data/shopItems";
import { BookTable, P, SubTitle } from "./BookUI";

/** Prefixa Dado/CA na descrição — evita uma coluna extra quase sempre vazia na tabela. */
function itemDetail(item: ShopItem): string {
  if (item.baseDie) return `Dado ${item.baseDie}. ${item.description}`;
  if (item.acBonus) return `+${item.acBonus} CA. ${item.description}`;
  return item.description;
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
        Preço de venda oficial da Guilda, o mesmo catálogo à venda em <code>/loja</code> — comprar lá debita o PO
        e manda o item direto pra ficha ativa. Abaixo do Rank mínimo, o item não aparece à venda ali, por mais
        PO que você tenha (ver &ldquo;A Loja da Guilda&rdquo; acima).
      </P>
      {SHOP_CATEGORY_ORDER.map((category) => {
        const items = SHOP_ITEMS.filter((i) => i.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-2">
            <SubTitle>{SHOP_CATEGORY_LABELS[category]}</SubTitle>
            <BookTable
              headers={["Item", "Rank mínimo", "Preço (PO)", "Descrição"]}
              rows={items.map((item) => [item.name, item.guildRankRequired, String(item.price), itemDetail(item)])}
            />
          </div>
        );
      })}
    </div>
  );
}
