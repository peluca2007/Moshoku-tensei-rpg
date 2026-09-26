import { TREES } from "@/data/trees";
import TreeCrest from "../TreeCrest";

/**
 * A VITRINE DAS DEZENOVE ÁRVORES (2026-09-25).
 *
 * O brasão de cada árvore, na cor dela, levando ao catálogo. Mora no fim do
 * Mapa Completo, onde a tabela seguinte (os nomes dos patamares, larga demais
 * pra coluna) sempre pulava pra página nova e deixava meia página em branco.
 * No livro folheado ela estica até o pé da página e se arruma pelo espaço que
 * sobrou (esticarVitrines, em diagramacao.ts); com pouco espaço, some.
 */
export default function VitrineDasArvores() {
  return (
    <nav aria-label="As dezenove árvores" className="livro-vitrine livro-vitrine-arvores mt-4">
      <p className="livro-vitrine-titulo text-2xs font-bold uppercase tracking-[0.25em] text-gold-700 dark:text-gold-400">
        As dezenove árvores
      </p>
      <ul className="livro-vitrine-lista mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
        {TREES.map((tree) => (
          <li key={tree.id}>
            <a
              href={`#arvore-${tree.id}`}
              data-arvore={tree.id}
              className="livro-vitrine-item flex flex-col items-center gap-1 rounded-lg p-2 text-center no-underline hover:bg-parchment-200/50 dark:hover:bg-parchment-800/50"
            >
              <span className="livro-vitrine-retrato">
                <TreeCrest tree={tree} size={48} rounded="rounded-full" />
              </span>
              <span className="livro-vitrine-nome text-xs font-semibold text-parchment-900 dark:text-parchment-100">
                {tree.name.replace(/^(Magia de |Estilo )/, "")}
              </span>
              <span className="livro-vitrine-raridade text-3xs uppercase tracking-wider text-parchment-600 dark:text-parchment-400">
                {tree.category === "magia" ? "Magia" : tree.category === "corpo" ? "Corpo" : "Utilidade"}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
