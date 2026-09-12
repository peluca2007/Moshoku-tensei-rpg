"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CornerDownLeft,
  Gem,
  GraduationCap,
  Search,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Users,
  Wand2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buscar, TIPO_LABELS, type TipoDoc } from "@/lib/busca";

/**
 * A BUSCA DO SITE INTEIRO, do topo de qualquer página — 0.1.65, redesenhada em 0.1.66.
 *
 * ## Por que ela existe
 *
 * A `/busca` sempre foi uma boa busca, e sempre foi uma PÁGINA: pra usá-la era
 * preciso sair de onde você estava, procurar, e voltar. No meio de uma sessão,
 * com a ficha aberta e a mesa esperando, isso é atrito suficiente pra pessoa
 * desistir e folhear o livro no olho.
 *
 * Aqui ela é um painel sobre a página atual: abre, responde, fecha, e você
 * continua onde estava.
 *
 * ## O que a primeira versão errou
 *
 * Ela funcionava e parecia um menu suspenso de qualquer site: linhas coladas,
 * selos de tipo soltos na margem direita, nenhuma hierarquia entre o nome da
 * magia e a árvore dela, e nada da identidade pergaminho/vinho/dourado do resto
 * do projeto. O relato foi "está feio, bem feio", e estava.
 *
 * O que mudou: **ícone por tipo** (o olho acha "magia" antes de ler), o tipo
 * virou parte da linha de contexto em vez de um selo flutuando, o resultado
 * selecionado ganhou filete dourado à esquerda como o sumário do livro, e o
 * painel ganhou moldura e sombra que o separam da página.
 *
 * ## O que ela NÃO faz
 *
 * Filtro por tipo e paginação. Quem precisa disso quer a página inteira, e o
 * rodapé leva pra lá. O painel é pra achar UMA coisa rápido.
 */

/**
 * Um ícone por tipo de resultado.
 *
 * Ele não é decoração: numa lista de oito linhas parecidas, a forma é lida
 * antes do texto. Quem procura "fogo" e quer a MAGIA acha o ícone de varinha
 * sem ler nenhum dos oito nomes.
 */
const ICONE: Record<TipoDoc, LucideIcon> = {
  habilidade: Wand2,
  talento: Sparkles,
  maestria: Gem,
  combinada: Sparkles,
  arvore: Swords,
  item: Shield,
  raca: Users,
  antecedente: BookOpen,
  pericia: GraduationCap,
  criatura: Skull,
  secao: BookOpen,
};

export default function BuscaRapida() {
  const [aberta, setAberta] = useState(false);
  const [termo, setTermo] = useState("");
  const [selecionado, setSelecionado] = useState(0);
  const campo = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /*
   * Sete resultados: o painel flutua sobre o conteúdo, e uma lista que cobre a
   * tela inteira deixa de ser um atalho e vira a página que ela queria evitar.
   */
  const resultados = useMemo(() => (termo.trim() ? buscar(termo).slice(0, 7) : []), [termo]);

  const fechar = useCallback(() => {
    setAberta(false);
    setTermo("");
    setSelecionado(0);
  }, []);

  const irPara = useCallback(
    (href: string) => {
      fechar();
      router.push(href);
    },
    [fechar, router]
  );

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberta((v) => !v);
      }
      if (e.key === "Escape") fechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [fechar]);

  useEffect(() => {
    if (aberta) campo.current?.focus();
  }, [aberta]);

  function aoNavegar(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelecionado((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelecionado((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const alvo = resultados[Math.min(selecionado, resultados.length - 1)];
      irPara(alvo ? alvo.doc.href : `/busca?q=${encodeURIComponent(termo)}`);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberta(true)}
        aria-label="Buscar no site (Ctrl+K)"
        title="Buscar no site — Ctrl+K"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-parchment-600 transition-colors hover:bg-parchment-900/5 hover:text-wine-600 dark:text-parchment-300 dark:hover:bg-white/5 dark:hover:text-wine-300"
      >
        <Search className="h-[18px] w-[18px]" aria-hidden />
      </button>

      {aberta && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-parchment-950/70 px-3 pt-[10vh] backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label="Buscar no site"
          onMouseDown={fechar}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gold-500/40 bg-parchment-50 shadow-[0_24px_60px_-12px_rgba(26,18,16,0.6)] ring-1 ring-parchment-950/5 dark:bg-parchment-950 dark:ring-white/5"
          >
            {/* O campo, com a lupa dourada — a mesma cor que marca destaque no livro. */}
            <div className="flex items-center gap-2.5 border-b border-parchment-300 bg-gradient-to-r from-parchment-100/80 to-transparent px-4 dark:border-parchment-800 dark:from-parchment-900/70">
              <Search className="h-[18px] w-[18px] shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
              <input
                ref={campo}
                value={termo}
                onChange={(e) => {
                  setTermo(e.target.value);
                  // Volta pro topo AQUI, e não num efeito: `setState` dentro de
                  // `useEffect` dispara renderização em cascata, e o dado que
                  // muda é o mesmo que este evento já trouxe.
                  setSelecionado(0);
                }}
                onKeyDown={aoNavegar}
                placeholder="Magia, técnica, condição, item, regra…"
                aria-label="O que procurar"
                className="min-w-0 flex-1 bg-transparent py-3.5 font-display text-base text-parchment-900 outline-none placeholder:font-sans placeholder:text-sm placeholder:text-parchment-600 dark:text-parchment-50 dark:placeholder:text-parchment-400"
              />
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar busca"
                className="rounded-lg p-1.5 text-parchment-600 transition-colors hover:bg-parchment-900/5 hover:text-wine-600 dark:text-parchment-400 dark:hover:bg-white/5"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {termo.trim() && (
              <ul className="max-h-[54vh] overflow-y-auto p-2">
                {resultados.map((r, i) => {
                  const Icone = ICONE[r.doc.tipo] ?? Sparkles;
                  const ativo = i === selecionado;
                  return (
                    <li key={r.doc.chave}>
                      <button
                        type="button"
                        onClick={() => irPara(r.doc.href)}
                        onMouseEnter={() => setSelecionado(i)}
                        className={`flex w-full items-center gap-3 rounded-xl border-l-[3px] px-3 py-2.5 text-left transition-colors ${
                          ativo
                            ? "border-gold-500 bg-gradient-to-r from-wine-500/12 to-transparent"
                            : "border-transparent hover:bg-parchment-900/[0.04] dark:hover:bg-white/[0.04]"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors ${
                            ativo
                              ? "bg-gold-500/20 text-gold-700 ring-gold-500/40 dark:text-gold-300"
                              : "bg-parchment-200/60 text-parchment-600 ring-parchment-300/60 dark:bg-parchment-900 dark:text-parchment-400 dark:ring-parchment-800"
                          }`}
                        >
                          <Icone className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-sm font-bold text-parchment-900 dark:text-parchment-50">
                            {r.doc.nome}
                          </span>
                          {/*
                            O tipo entrou na linha de CONTEXTO, e não num selo na
                            margem: solto à direita ele criava uma segunda coluna
                            que o olho precisava atravessar, e o contexto —
                            "Magia de Fogo · Principiante" — é o que responde
                            "qual desses é o meu".
                          */}
                          <span className="block truncate text-xs text-parchment-600 dark:text-parchment-400">
                            <span className="text-wine-700 dark:text-wine-300">
                              {TIPO_LABELS[r.doc.tipo]}
                            </span>
                            {" · "}
                            {r.doc.contexto}
                          </span>
                        </span>
                        {ativo && (
                          <CornerDownLeft
                            className="h-3.5 w-3.5 shrink-0 text-gold-600 dark:text-gold-400"
                            aria-hidden
                          />
                        )}
                      </button>
                    </li>
                  );
                })}

                {resultados.length === 0 && (
                  <li className="px-3 py-8 text-center">
                    <p className="text-sm text-parchment-700 dark:text-parchment-300">
                      Nada com <b>{termo}</b>.
                    </p>
                    <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">
                      Tente uma palavra só — o livro procura no nome e no texto.
                    </p>
                  </li>
                )}
              </ul>
            )}

            {/* O rodapé é fixo: ele ensina as teclas e leva pra busca completa. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-parchment-300 bg-parchment-100/60 px-4 py-2.5 text-[11px] text-parchment-600 dark:border-parchment-800 dark:bg-parchment-900/50 dark:text-parchment-400">
              <span className="flex items-center gap-1.5">
                <Tecla>↑↓</Tecla> navegar
              </span>
              <span className="flex items-center gap-1.5">
                <Tecla>
                  <CornerDownLeft className="h-2.5 w-2.5" aria-hidden />
                </Tecla>
                abrir
              </span>
              <span className="flex items-center gap-1.5">
                <Tecla>esc</Tecla> fechar
              </span>
              {resultados.length > 0 && (
                <button
                  type="button"
                  onClick={() => irPara(`/busca?q=${encodeURIComponent(termo)}`)}
                  className="ml-auto font-semibold text-wine-700 hover:underline dark:text-wine-300"
                >
                  Ver todos →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** A tecla desenhada do rodapé — é o que faz o atalho parecer um atalho. */
function Tecla({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border border-parchment-300 bg-parchment-50 px-1 py-px font-sans text-[10px] font-semibold text-parchment-700 shadow-sm dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-300">
      {children}
    </kbd>
  );
}
