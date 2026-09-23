"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { normalizar } from "@/lib/texto";
import { usePosicaoDeLeitura } from "./usePosicaoDeLeitura";

export interface TocEntry {
  id: string;
  label: string;
  children?: TocEntry[];
}

/**
 * Sumário do /livro. O livro é um scroll único de 5 capítulos + 7 apêndices, então
 * sem estas duas coisas você não sabe onde está nem consegue chegar num lugar
 * específico sem rolar procurando:
 * - **Marcador de posição**: acende a seção em que a leitura está — e o capítulo
 *   dela —, remedindo o documento sempre que ele muda de altura, e rolando o
 *   próprio painel o mínimo pra manter a entrada acesa à vista.
 * - **Filtro por nome**: reduz o sumário enquanto você digita, sem acento e sem caixa.
 */
export default function BookToc({ toc, onNavigate }: { toc: TocEntry[]; onNavigate?: () => void }) {
  const { activeId, capituloAtivo } = usePosicaoDeLeitura(toc);
  const [query, setQuery] = useState("");
  const navRef = useRef<HTMLElement | null>(null);

  /*
   * Manter o item aceso à VISTA dentro do painel — 0.1.74.
   *
   * O sumário tem 70 entradas num painel de altura de tela com rolagem própria:
   * acender a entrada certa não adianta se ela está 400px abaixo do que se vê.
   * Aqui o painel (e só ele) rola o mínimo pra trazer a entrada de volta; a
   * página nunca é tocada, e por isso não se usa `scrollIntoView`, que rolaria
   * as duas.
   */
  useEffect(() => {
    if (!activeId) return;
    const link = navRef.current?.querySelector<HTMLElement>(`a[data-toc-id="${CSS.escape(activeId)}"]`);
    if (!link) return;

    let painel: HTMLElement | null = link.parentElement;
    while (painel && painel.scrollHeight <= painel.clientHeight + 1) painel = painel.parentElement;
    if (!painel || painel === document.body || painel === document.documentElement) return;

    const alvo = link.getBoundingClientRect();
    const caixa = painel.getBoundingClientRect();
    const folga = 12;
    if (alvo.top < caixa.top + folga) painel.scrollTop -= caixa.top + folga - alvo.top;
    else if (alvo.bottom > caixa.bottom - folga) painel.scrollTop += alvo.bottom - (caixa.bottom - folga);
  }, [activeId]);

  const filtered = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return toc;
    return toc
      .map((chapter) => {
        const chapterHit = normalizar(chapter.label).includes(q);
        const children = (chapter.children ?? []).filter((c) => normalizar(c.label).includes(q));
        // Capítulo que casa mostra os filhos todos; senão, só os filhos que casam.
        if (chapterHit) return chapter;
        if (children.length > 0) return { ...chapter, children };
        return null;
      })
      .filter((c): c is TocEntry => c !== null);
  }, [toc, query]);

  return (
    <div>
      <div className="relative mb-3">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-parchment-600 dark:text-parchment-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar seção…"
          aria-label="Buscar seção no livro"
          className="w-full rounded-lg border border-parchment-300 bg-parchment-50 py-1.5 pl-8 pr-7 text-xs text-parchment-800 placeholder:text-parchment-600 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-100 dark:placeholder:text-parchment-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpar busca"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-parchment-600 hover:text-wine-600 dark:text-parchment-400 dark:hover:text-wine-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <nav ref={navRef} className="space-y-3 text-sm">
        {filtered.map((chapter) => (
          <div key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              data-toc-id={chapter.id}
              onClick={onNavigate}
              aria-current={capituloAtivo === chapter.id ? "location" : undefined}
              /*
               * O capítulo ativo ganha um filete dourado à esquerda, e não só
               * fundo — 0.1.64. Num sumário de 69 entradas, o fundo sozinho
               * some entre as linhas: o filete é o que se acha de relance
               * quando a pessoa volta pro sumário depois de ler.
               */
              className={`block rounded-lg border-l-[3px] px-2 py-1 font-display font-bold transition-all duration-150 hover:translate-x-0.5 hover:text-wine-600 dark:hover:text-wine-300 ${
                capituloAtivo === chapter.id
                  ? "border-gold-500 bg-gradient-to-r from-wine-500/15 to-transparent text-wine-700 dark:text-wine-300"
                  : "border-transparent text-parchment-800 dark:text-parchment-200"
              }`}
            >
              {chapter.label}
            </a>
            {chapter.children && chapter.children.length > 0 && (
              <ul className="mt-1 space-y-0.5 border-l border-parchment-300 pl-3 dark:border-parchment-800">
                {chapter.children.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      data-toc-id={c.id}
                      onClick={onNavigate}
                      aria-current={activeId === c.id ? "location" : undefined}
                      className={`-ml-3 block border-l-2 py-1 pl-3 transition-all duration-150 hover:translate-x-0.5 hover:border-wine-400/50 hover:text-wine-600 dark:hover:text-wine-300 ${
                        activeId === c.id
                          ? "border-gold-500 bg-gold-500/5 font-semibold text-wine-700 dark:text-wine-300"
                          : "border-transparent text-parchment-600 dark:text-parchment-400"
                      }`}
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="px-1 text-xs text-parchment-600 dark:text-parchment-400">
            Nenhuma seção com “{query}”. O filtro busca só por título — para achar um termo dentro do
            texto, use a busca do navegador (Ctrl+F).
          </p>
        )}
      </nav>
    </div>
  );
}
