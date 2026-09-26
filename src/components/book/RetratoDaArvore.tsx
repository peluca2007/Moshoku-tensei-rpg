import { arteDoLivro, enquadrar } from "./arteDasRacas";
import ImagemDoLivro from "./ImagemDoLivro";

/**
 * O RETRATO DA ÁRVORE (2026-09-25): quem encarna a escola — a Roxy na Magia
 * de Água, a Ghislaine no Deus da Espada, o Geese na Furtividade. Entra no
 * alto do catálogo da árvore, à direita, quando existe
 * `public/livro/arvores/<id da árvore>` (ou `<id>.recorte.webp`, sem fundo).
 * Árvore sem retrato abre como sempre abriu.
 */
export default function RetratoDaArvore({ id, nome }: { id: string; nome: string }) {
  const arte = arteDoLivro("arvores", id);
  if (!arte) return null;
  return (
    <figure
      className={`livro-arvore-retrato float-right mb-2 ml-3 w-2/5 max-w-48 overflow-hidden rounded-lg ${arte.recorte ? "" : "border border-parchment-300 dark:border-parchment-800"}`}
      data-recorte={arte.recorte ? "" : undefined}
    >
      <ImagemDoLivro
        arte={arte}
        alt={`Quem encarna ${nome}.`}
        modo={enquadrar(arte, 0.8, 150)}
        className={`w-full ${arte.recorte ? "object-contain" : "aspect-[4/5] object-cover object-top"}`}
      />
    </figure>
  );
}
