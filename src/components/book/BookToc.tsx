"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export interface TocEntry {
  id: string;
  label: string;
  children?: TocEntry[];
}

/** Tira acento e caixa — quem busca "pericias" tem que achar "Perícias". */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Sumário do /livro. O livro é um scroll único de 5 capítulos + 7 apêndices, então
 * sem estas duas coisas você não sabe onde está nem consegue chegar num lugar
 * específico sem rolar procurando:
 * - **Marcador de posição** (IntersectionObserver): destaca a seção que está na tela.
 * - **Filtro por nome**: reduz o sumário enquanto você digita, sem acento e sem caixa.
 */
export default function BookToc({ toc, onNavigate }: { toc: TocEntry[]; onNavigate?: () => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const allIds = useMemo(
    () => toc.flatMap((c) => [c.id, ...(c.children ?? []).map((x) => x.id)]),
    [toc]
  );

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
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [allIds]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return toc;
    return toc
      .map((chapter) => {
        const chapterHit = normalize(chapter.label).includes(q);
        const children = (chapter.children ?? []).filter((c) => normalize(c.label).includes(q));
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

      <nav className="space-y-3 text-sm">
        {filtered.map((chapter) => (
          <div key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              onClick={onNavigate}
              aria-current={activeId === chapter.id ? "location" : undefined}
              className={`block rounded px-1 py-0.5 font-semibold hover:text-wine-600 dark:hover:text-wine-300 ${
                activeId === chapter.id
                  ? "bg-wine-500/10 text-wine-700 dark:text-wine-300"
                  : "text-parchment-800 dark:text-parchment-200"
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
                      onClick={onNavigate}
                      aria-current={activeId === c.id ? "location" : undefined}
                      className={`-ml-3 block border-l-2 py-0.5 pl-3 hover:text-wine-600 dark:hover:text-wine-300 ${
                        activeId === c.id
                          ? "border-wine-500 font-medium text-wine-700 dark:text-wine-300"
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
