"use client";

import { ReactNode, useRef } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import BookToc, { TocEntry } from "./BookToc";
import { usePosicaoDeLeitura } from "./usePosicaoDeLeitura";

/**
 * Casca de leitura do /livro: sumário fixo no desktop, cabeçalho corrente no
 * mobile. Precisa ser client porque os dois seguem a posição da leitura — o
 * conteúdo dos capítulos continua sendo renderizado no servidor e entra aqui
 * como `children`, então nada do livro em si vira bundle de cliente.
 */
export default function BookShell({ toc, children }: { toc: TocEntry[]; children: ReactNode }) {
  const mobileToc = useRef<HTMLDetailsElement>(null);
  const { activeId, capituloAtivo } = usePosicaoDeLeitura(toc);

  const capitulo = toc.find((c) => c.id === capituloAtivo);
  const secao = capitulo?.children?.find((c) => c.id === activeId);

  return (
    <>
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

      {/*
        O CABEÇALHO CORRENTE — o topo de página de um livro (2026-09-23).

        No papel, o alto de cada página repete em que capítulo você está; foi
        sempre a resposta pra "onde eu estou" sem ter que voltar ao índice. No
        celular essa pergunta não tinha resposta nenhuma: o sumário era um
        `<details>` no começo do documento, e chegar nele custava rolar os 87
        mil pixels de volta. Na prática, quem lia no celular não navegava o
        livro — rolava.

        Por isso ele não é um enfeite ao lado do sumário: ele É o sumário no
        mobile. Fechado, diz o capítulo e a seção; aberto, é o índice inteiro,
        com busca, em qualquer ponto do livro.

        Fora do grid de propósito: um item sticky só gruda enquanto a célula
        dele está na tela, e a célula desta barra tem a altura da barra — dentro
        do grid ela descolaria na primeira rolagem.
      */}
      <details
        ref={mobileToc}
        className="livro-cabecalho-corrente print-hide sticky top-[var(--altura-nav)] z-30 mb-6 rounded-xl border border-parchment-300 bg-parchment-100/95 shadow-sm backdrop-blur-sm lg:hidden dark:border-parchment-800 dark:bg-parchment-900/95"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-left">
          <BookOpen className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-xs font-bold text-parchment-800 dark:text-parchment-200">
              {capitulo?.label ?? "Sumário"}
            </span>
            {secao && (
              <span className="block truncate text-2xs text-parchment-600 dark:text-parchment-400">
                {secao.label}
              </span>
            )}
          </span>
          <ChevronDown
            className="livro-cabecalho-seta h-4 w-4 shrink-0 text-parchment-600 transition-transform dark:text-parchment-400"
            aria-hidden
          />
        </summary>
        <div className="max-h-[60vh] overflow-y-auto border-t border-parchment-300 p-3 dark:border-parchment-800">
          {/* Fecha ao pular pra uma seção — senão ele cobre o texto que você
              acabou de pedir pra ler, que é o comportamento mais irritante num
              celular. */}
          <BookToc toc={toc} onNavigate={() => mobileToc.current?.removeAttribute("open")} />
        </div>
      </details>

      <div className="livro-shell grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="print-hide hidden lg:block">
          {/*
            O sumário gruda ABAIXO do nav, e não a 16px do topo — 0.1.74.

            O nav é `sticky top-0` e tem ~81px de altura: ele está sempre lá. Com
            `top-4` o painel subia até 16px do topo da janela, quer dizer, até
            DEBAixo da barra translúcida — o título "Sumário" ficava borrado atrás
            do menu, e a lista parecia começar cortada. `top-24` é a mesma
            compensação que todo título do livro já usa no `scroll-mt-24`, então o
            painel para exatamente onde as âncoras param.
          */}
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
              Sumário
            </p>
            <BookToc toc={toc} />
          </div>
        </aside>

        {/*
          A PÁGINA (2026-09-23).

          Era um cartão: `rounded-2xl` com borda dos quatro lados e 16px de
          padding, envolvendo os 87 mil pixels do livro inteiro. Um cartão é o
          que o site usa pra um bloco de informação — a loja, a ficha, um
          encontro — e o livro inteiro dentro de um só não lia como página,
          lia como "mais um bloco do site, porém gigante".

          O que muda: margem de livro (o respiro lateral é a metade do que
          separa um texto impresso de uma parede de pixels), textura de papel,
          e a sombra de folha apoiada no lugar da borda desenhada. A medida de
          linha de 68ch continua vindo do `livro-prosa`, como antes.
        */}
        <div className="livro-pagina surface min-w-0 space-y-16 px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          {children}
        </div>
      </div>
    </>
  );
}
