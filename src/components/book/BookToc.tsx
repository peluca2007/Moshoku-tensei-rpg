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

/** I, II, III… — o capítulo de um livro se numera assim, e o algarismo romano
 *  é curto o bastante pra viver numa coluna de 1,5rem sem apertar o título. */
const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/**
 * Separa o NÚMERO do TÍTULO — a diferença entre uma lista e um índice.
 *
 * Os rótulos do `SUMARIO_DO_LIVRO` carregam a numeração no meio do texto:
 * "Cap. 1 — O Núcleo do Sistema", "4. Testes e Perícias", "— Equipamento
 * Inicial", "A. Ficha de Exemplo". Renderizados como uma string só, eles dão
 * três problemas de uma vez: o "Cap. 1 —" come metade da largura da coluna e
 * empurra o nome pra segunda linha; a segunda linha volta pra margem esquerda e
 * parece uma entrada nova; e o travessão de subseção lê como traço solto, não
 * como hierarquia.
 *
 * Aqui o número sai do texto e vai pra uma coluna própria, que é onde ele mora
 * num índice impresso. O dado fica intacto de propósito: o mesmo `label`
 * alimenta a busca global do site, e lá "Cap. 1" é justamente o que a pessoa
 * digita.
 */
function numeroETitulo(
  label: string,
  indiceDoCapitulo?: number
): { numero: string; titulo: string; recuada?: boolean } {
  const capitulo = label.match(/^Cap\.\s*(\d+)\s*—\s*(.+)$/);
  if (capitulo) return { numero: ROMANOS[Number(capitulo[1]) - 1] ?? capitulo[1], titulo: capitulo[2] };

  // Abertura e Apêndices não têm número em livro nenhum: ficam com o losango,
  // que é o que o resto do livro já usa quando quer dizer "marca, não número".
  if (indiceDoCapitulo !== undefined) return { numero: "◆", titulo: label };

  const secao = label.match(/^([\dA-Z])\.\s*(.+)$/);
  if (secao) return { numero: secao[1], titulo: secao[2] };

  // Subseção não recebe numeral: ela não tem um no livro, e qualquer marca
  // inventada aqui (o travessão antigo, um ponto) disputa atenção com os
  // números que SÃO reais. O que diz que ela é filha é o recuo.
  const subsecao = label.match(/^—\s*(.+)$/);
  if (subsecao) return { numero: "", titulo: subsecao[1], recuada: true };

  return { numero: "", titulo: label };
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
      {/*
        A busca virou uma LINHA, e não mais uma caixa (2026-09-23).

        Uma caixa com borda nos quatro lados e fundo próprio é o objeto mais
        "formulário web" que existe, e ela era a primeira coisa do índice — o
        que fazia o sumário inteiro parecer o filtro de uma tabela. O filete
        embaixo faz o mesmo trabalho (dizer onde se digita) com a gramática que
        o resto do livro usa.
      */}
      <div className="relative mb-3 border-b border-parchment-300 focus-within:border-gold-500 dark:border-parchment-700">
        <Search
          className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-parchment-500 dark:text-parchment-500"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar seção…"
          aria-label="Buscar seção no livro"
          className="w-full bg-transparent py-1.5 pl-6 pr-6 text-xs text-parchment-800 outline-none placeholder:text-parchment-600 dark:text-parchment-100 dark:placeholder:text-parchment-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpar busca"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded p-0.5 text-parchment-600 hover:text-wine-600 dark:text-parchment-400 dark:hover:text-wine-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/*
        A GRADE DE ÍNDICE (2026-09-23).

        Cada entrada é uma grade de duas colunas — numeral fixo de 1,5rem e
        título — e é ela que faz a lista virar índice. Num rótulo que quebra em
        duas linhas ("Proficiências e Grupos de Arma", "Interromper uma
        Conjuração"), a segunda linha continua alinhada ao título em vez de
        voltar pra margem, que era o que fazia uma entrada longa parecer duas.
      */}
      {/*
        A serifada vem declarada aqui, e não herdada do `.livro-shell`.

        O cabeçalho corrente do mobile mora FORA do grid do livro (um item
        sticky só gruda enquanto a célula dele está na tela), então o mesmo
        índice saía serifado no desktop e em sans no celular — duas fontes pro
        mesmo componente, dependendo de onde ele foi montado.
      */}
      <nav ref={navRef} className="font-serif text-sm">
        {filtered.map((chapter, i) => {
          const { numero, titulo } = numeroETitulo(
            chapter.label,
            /^Cap\./.test(chapter.label) ? undefined : i
          );
          const aceso = capituloAtivo === chapter.id;
          return (
            <div
              key={chapter.id}
              /* O filete entre capítulos é o que dá ritmo a 84 entradas —
                 sem ele o índice é uma coluna de texto sem fim. O capítulo em
                 que a leitura está ganha um véu, porque num índice desse
                 tamanho a cor do título sozinha se perde entre as linhas. */
              className={`border-t border-parchment-300/50 py-2.5 first:border-t-0 first:pt-0 dark:border-parchment-800/60 ${
                aceso ? "-mx-2 rounded-lg bg-gold-500/[0.07] px-2 dark:bg-gold-500/[0.05]" : ""
              }`}
            >
              <a
                href={`#${chapter.id}`}
                data-toc-id={chapter.id}
                onClick={onNavigate}
                aria-current={aceso ? "location" : undefined}
                className={`grid grid-cols-[1.5rem_1fr] items-baseline gap-2 rounded py-0.5 font-display font-bold leading-snug transition-colors hover:text-wine-600 dark:hover:text-wine-300 ${
                  aceso ? "text-wine-700 dark:text-wine-300" : "text-parchment-800 dark:text-parchment-200"
                }`}
              >
                <span
                  aria-hidden
                  className={`text-right text-xs tabular-nums ${
                    aceso ? "text-gold-600 dark:text-gold-400" : "text-parchment-500 dark:text-parchment-500"
                  }`}
                >
                  {numero}
                </span>
                <span>{titulo}</span>
              </a>

              {chapter.children && chapter.children.length > 0 && (
                <ul className="mt-1">
                  {chapter.children.map((c) => {
                    const sec = numeroETitulo(c.label);
                    const secAcesa = activeId === c.id;
                    return (
                      <li key={c.id}>
                        <a
                          href={`#${c.id}`}
                          data-toc-id={c.id}
                          onClick={onNavigate}
                          aria-current={secAcesa ? "location" : undefined}
                          className={`grid grid-cols-[1.5rem_1fr] items-baseline gap-2 rounded py-1 leading-snug transition-colors hover:text-wine-600 dark:hover:text-wine-300 ${
                            secAcesa
                              ? "font-semibold text-wine-700 dark:text-wine-300"
                              : "text-parchment-600 dark:text-parchment-400"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`text-right text-2xs tabular-nums ${
                              secAcesa ? "text-gold-600 dark:text-gold-400" : "text-parchment-500 dark:text-parchment-600"
                            }`}
                          >
                            {sec.numero}
                          </span>
                          <span className={sec.recuada ? "pl-3 text-xs" : undefined}>{sec.titulo}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

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
