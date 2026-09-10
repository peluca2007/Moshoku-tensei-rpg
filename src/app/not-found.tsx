import Link from "next/link";
import { Compass, Map, Search } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { INDICE_BUSCA } from "@/lib/busca";

/**
 * A tela de rota inexistente — 0.1.18.
 *
 * Até aqui o site não tinha nenhuma, e o padrão do framework respondia
 * literalmente *"404: This page could not be found."* — **em inglês**, num
 * documento `lang="pt-BR"`, e com dois `<title>` no mesmo HTML, porque a tela
 * embutida traz o dela por cima do que o layout já tinha escrito.
 *
 * Estando em `src/app/`, ela renderiza DENTRO do layout raiz: vem com o menu, o
 * rodapé, a fonte e o tema escolhido, que é o que faz um 404 parecer uma página
 * deste site em vez do fim dele. É também por isso que o título da aba volta a
 * ser um só — o do layout.
 *
 * Os três atalhos não são decoração. Quem cai aqui veio de um link velho, de um
 * endereço digitado à mão ou de uma rota que mudou de nome, e as três perguntas
 * que restam são sempre as mesmas: onde está minha ficha, onde está a regra, e
 * como eu procuro a coisa cujo endereço eu não sei.
 */
export default function NaoEncontrada() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <PageHeader icon={Compass} title="Este endereço não existe">
        Nada foi perdido — só esta rota é que não está no mapa.
      </PageHeader>

      <EmptyState
        icon={Map}
        hint={
          <>
            Suas fichas continuam salvas no aparelho: elas não moram nesta página nem em nenhuma outra —
            um endereço errado não apaga personagem nenhum.
          </>
        }
      >
        O caminho acabou antes da porta.
      </EmptyState>

      <nav aria-label="Para onde ir" className="flex flex-wrap gap-2">
        {[
          { href: "/personagens", label: "Meus personagens" },
          { href: "/ficha", label: "Ficha" },
          { href: "/livro", label: "Livro de Regras" },
          { href: "/arvores", label: "Árvores" },
          { href: "/", label: "Início" },
        ].map((rota) => (
          <Link
            key={rota.href}
            href={rota.href}
            className="lift rounded-full border border-parchment-300 bg-parchment-50/70 px-4 py-2 text-sm font-semibold text-parchment-700 hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:bg-parchment-900/60 dark:text-parchment-200 dark:hover:border-wine-600 dark:hover:text-wine-300"
          >
            {rota.label}
          </Link>
        ))}
      </nav>

      <p className="text-sm text-parchment-600 dark:text-parchment-400">
        <Search className="mr-1.5 inline h-4 w-4 align-text-bottom" aria-hidden />
        Procurando uma magia, um item ou uma criatura pelo nome?{" "}
        <Link
          href="/busca"
          className="font-semibold text-wine-700 underline underline-offset-2 dark:text-wine-300"
        >
          A busca acha nos {INDICE_BUSCA.length} verbetes do livro
        </Link>
        .
      </p>
    </div>
  );
}
