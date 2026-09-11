"use client";

import { ReactNode, useRef } from "react";
import BookToc, { TocEntry } from "./BookToc";

/**
 * Casca de leitura do /livro: sumário fixo no desktop, recolhido no mobile.
 * Precisa ser client porque o sumário tem marcador de posição e filtro — o
 * conteúdo dos capítulos continua sendo renderizado no servidor e entra aqui
 * como `children`, então nada do livro em si vira bundle de cliente.
 */
export default function BookShell({ toc, children }: { toc: TocEntry[]; children: ReactNode }) {
  const mobileToc = useRef<HTMLDetailsElement>(null);

  return (
    <div className="livro-shell grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      {/*
        A barra de progresso de leitura (0.1.55).

        O livro tem ~87 mil pixels de rolagem numa página só, e a barra de
        rolagem do navegador vira um traço de dois pixels que não diz nada. Esta
        é pintada por `animation-timeline: scroll()` — CSS puro, sem listener e
        sem JavaScript —, então ela não disputa a thread principal com nada.
        Onde a propriedade não existe, fica em 0 e some: decoração que falha tem
        que falhar invisível.
      */}
      <div
        aria-hidden
        className="print-hide fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-transparent"
      >
        <div className="livro-progresso h-full w-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
      </div>

      <aside className="print-hide hidden lg:block">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
            Sumário
          </p>
          <BookToc toc={toc} />
        </div>
      </aside>

      <details
        ref={mobileToc}
        className="print-hide rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60 lg:hidden"
      >
        {/* `py-1`: o alvo tinha 20px de altura, e este é o botão mais tocado do
            /livro no celular — é por ele que se navega o livro inteiro. */}
        <summary className="cursor-pointer py-1 text-sm font-semibold text-parchment-800 dark:text-parchment-200">
          Sumário
        </summary>
        <div className="mt-3">
          {/* Fecha o sumário ao pular pra uma seção — senão ele cobre o texto que você
              acabou de pedir pra ler, que é o comportamento mais irritante num celular. */}
          <BookToc toc={toc} onNavigate={() => mobileToc.current?.removeAttribute("open")} />
        </div>
      </details>

      <div className="min-w-0 space-y-14 rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm sm:p-6 dark:border-parchment-800 dark:bg-parchment-900/60">
        {children}
      </div>
    </div>
  );
}
