"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { normalizar } from "@/lib/texto";

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const navRef = useRef<HTMLElement | null>(null);

  const allIds = useMemo(
    () => toc.flatMap((c) => [c.id, ...(c.children ?? []).map((x) => x.id)]),
    [toc]
  );

  /*
   * De qual capítulo é cada seção — 0.1.74.
   *
   * `activeId` é UM id só: o último título que passou da linha de leitura.
   * Enquanto ele for o de uma seção, o capítulo-pai não acendia, e o sumário
   * parecia ter largado a leitura no meio do caminho — que é exatamente a
   * queixa de quem estava lendo o Cap. 4 e via o Cap. 4 apagado.
   */
  const paiDaSecao = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of toc) for (const f of c.children ?? []) m.set(f.id, c.id);
    return m;
  }, [toc]);
  const capituloAtivo = activeId ? paiDaSecao.get(activeId) ?? activeId : null;

  useEffect(() => {
    // Posição calculada direto do scroll, e não por IntersectionObserver: com uma
    // faixa de observação estreita, um scroll rápido (ou um pulo por link do próprio
    // sumário) faz todos os títulos atravessarem a faixa entre frames, nenhuma
    // interseção é registrada e o marcador nunca acende. Aqui a resposta é sempre
    // definida — o último título que já passou da linha de leitura — e vale também
    // no primeiro render, antes de qualquer scroll.
    const READING_LINE = 100;

    // As posições são medidas UMA vez (e de novo só em resize), nunca durante o
    // scroll: `getBoundingClientRect()` força layout síncrono, e chamar isso pros
    // ~40 títulos a cada frame num documento de 60 mil pixels trava o navegador.
    // Durante o scroll sobra só aritmética contra `scrollY`.
    let positions: { id: string; top: number }[] = [];
    function measure() {
      positions = allIds
        .map((id) => {
          const el = document.getElementById(id);
          return el ? { id, top: el.getBoundingClientRect().top + window.scrollY } : null;
        })
        .filter((p): p is { id: string; top: number } => p !== null)
        .sort((a, b) => a.top - b.top);
    }

    let frame = 0;
    function update() {
      frame = 0;
      const line = window.scrollY + READING_LINE;
      let current: string | null = null;
      for (const p of positions) {
        if (p.top <= line) current = p.id;
        else break;
      }
      setActiveId(current ?? positions[0]?.id ?? null);
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    function onResize() {
      measure();
      onScroll();
    }

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    /*
     * Re-medir quando o DOCUMENTO muda de altura — 0.1.74.
     *
     * Medir uma vez no mount só valeria se a página parasse de crescer depois
     * disso, e ela não para: são ~120 artes (várias de megabytes) carregando aos
     * poucos, os `<details>` do catálogo de árvores abrindo e fechando, e a
     * fonte de display trocando quando termina de baixar. Cada uma dessas
     * empurra os títulos pra baixo — e como as posições eram de antes, o
     * marcador ficava dezenas de milhares de pixels atrasado: o leitor estava
     * no Cap. 4 e o sumário insistia no Cap. 2. É este o "sumário não
     * acompanha".
     *
     * `resize` da janela não cobre nada disso: a janela não mudou de tamanho.
     */
    const observer = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    observer.observe(document.documentElement);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [allIds]);

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
