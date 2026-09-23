"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocEntry } from "./BookToc";

/**
 * Onde a leitura está, no livro inteiro.
 *
 * Nasceu dentro do `BookToc` (0.1.74) e saiu de lá quando o cabeçalho corrente
 * passou a precisar da mesma resposta: os dois perguntam "que seção está sendo
 * lida agora", e medir o documento duas vezes por scroll seria pagar o preço
 * em dobro pela mesma informação.
 */
export function usePosicaoDeLeitura(toc: TocEntry[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

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
    // A folga abaixo das barras do topo. Um título que acabou de aparecer
    // encostado na barra ainda não é "o que está sendo lido" — quem lê está
    // sempre um pouco abaixo dela.
    const FOLGA = 32;

    // As posições são medidas UMA vez (e de novo só em resize), nunca durante o
    // scroll: `getBoundingClientRect()` força layout síncrono, e chamar isso pros
    // ~40 títulos a cada frame num documento de 60 mil pixels trava o navegador.
    // Durante o scroll sobra só aritmética contra `scrollY`.
    let positions: { id: string; top: number }[] = [];

    /*
     * A linha de leitura é o ponto a partir do qual um título conta como "já
     * lido" — e ela tem que ficar abaixo de tudo que cobre o texto.
     *
     * Era fixa em 100px, de quando o nav (81px) era a única barra do topo. Com
     * o cabeçalho corrente embaixo dele, o mobile passou a cobrir 134px: o
     * título que você estava vendo no alto da tela ainda não tinha cruzado a
     * linha, e a barra insistia na seção anterior por mais uma tela inteira de
     * rolagem. Pior: era a própria barra que mentia sobre onde a leitura está.
     *
     * Por isso a linha é medida, não escolhida. Some as barras que existirem e
     * cai sozinha pra ~113px no desktop, onde o cabeçalho corrente é
     * `display:none` e mede zero.
     *
     * Medir o `summary`, e não a barra inteira, é de propósito: com o sumário
     * aberto a barra tem 60vh, mas quem abriu o sumário está escolhendo pra
     * onde ir, não lendo.
     */
    let linhaDeLeitura = 100;

    function measure() {
      const nav = document.querySelector("nav")?.getBoundingClientRect().height ?? 0;
      const cabecalho =
        document.querySelector(".livro-cabecalho-corrente summary")?.getBoundingClientRect()
          .height ?? 0;
      linhaDeLeitura = nav + cabecalho + FOLGA;

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
      const line = window.scrollY + linhaDeLeitura;
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

  return { activeId, capituloAtivo };
}
