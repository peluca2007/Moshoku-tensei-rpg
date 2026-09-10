import type { Metadata } from "next";
import { Suspense } from "react";
import { Search } from "lucide-react";
import BuscaGlobal from "@/components/BuscaGlobal";
import PageHeader from "@/components/ui/PageHeader";
import { INDICE_BUSCA } from "@/lib/busca";

export const metadata: Metadata = {
  title: "Busca",
  description: "Procure por nome ou pelo que a regra diz em todo o livro: técnicas, magias, talentos, maestrias, árvores, itens, raças, antecedentes, perícias e criaturas.",
};

/*
 * O `Suspense` não é enfeite: `BuscaGlobal` lê o `?q=` por `useSearchParams`, e
 * sem um limite de suspensão em volta o Next tira a rota inteira da geração
 * estática — o que quebraria justamente o pré-cache do service worker, que só
 * guarda o HTML que o `next build` produziu. Mesmo arranjo de `/arvores`.
 */
export default function BuscaPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      {/*
        O cabeçalho é renderizado no SERVIDOR, fora do Suspense.

        Tudo que lê `?q=` fica preso ao cliente, e a rota inteira dentro do
        limite de suspensão nasceria como uma casca sem `<h1>` — o `check:offline`
        pegou isso: a página abria com o servidor morto, mas sem título nenhum
        até o JavaScript hidratar. Com o cabeçalho aqui, quem chega já lê o que
        é esta tela, e a contagem de verbetes sai do índice sem custo de cliente.
      */}
      <PageHeader icon={Search} title="Busca">
        Tudo que o livro escreveu, achável por nome ou pelo que a regra diz — {INDICE_BUSCA.length}{" "}
        verbetes entre técnicas, magias, talentos, maestrias, árvores, itens, raças, antecedentes,
        perícias e criaturas.
      </PageHeader>
      <Suspense fallback={null}>
        <BuscaGlobal />
      </Suspense>
    </div>
  );
}
