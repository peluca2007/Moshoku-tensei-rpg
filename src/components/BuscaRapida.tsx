"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, X } from "lucide-react";
import { buscar, TIPO_LABELS } from "@/lib/busca";

/**
 * A BUSCA DO SITE INTEIRO, do topo de qualquer página — 0.1.65.
 *
 * ## Por que ela existe
 *
 * A `/busca` sempre foi uma boa busca, e sempre foi uma PÁGINA: pra usá-la era
 * preciso sair de onde você estava, procurar, e voltar. No meio de uma sessão,
 * com a ficha aberta e a mesa esperando, isso é atrito suficiente pra pessoa
 * desistir e folhear o livro no olho.
 *
 * Aqui ela é um painel sobre a página atual: abre, responde, fecha, e você
 * continua onde estava. A `/busca` continua existindo — ela é o destino de link
 * direto e de quem chega pelo buscador.
 *
 * ## O que ela NÃO faz
 *
 * Ela não tem filtro por tipo nem paginação. Quem precisa disso quer a página
 * inteira, e o último item do painel leva pra lá. O painel é pra achar UMA
 * coisa rápido — a magia que você não lembra o nome, a condição que o Mestre
 * citou, a regra que alguém questionou.
 */
export default function BuscaRapida() {
  const [aberta, setAberta] = useState(false);
  const [termo, setTermo] = useState("");
  const [selecionado, setSelecionado] = useState(0);
  const campo = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /*
   * Oito resultados, e não os 40 que a página mostra: o painel flutua sobre o
   * conteúdo, e uma lista que cobre a tela inteira deixa de ser um atalho.
   */
  const resultados = useMemo(() => (termo.trim() ? buscar(termo).slice(0, 8) : []), [termo]);

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

  // Ctrl+K / ⌘K abre de qualquer lugar; Esc fecha.
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
          className="fixed inset-0 z-[60] flex items-start justify-center bg-parchment-950/55 px-3 pt-[12vh] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Buscar no site"
          // Clicar FORA fecha. O `stopPropagation` do painel abaixo é o que
          // impede que clicar dentro dele feche junto.
          onMouseDown={fechar}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-gold-500/30 bg-parchment-50 shadow-2xl dark:bg-parchment-950"
          >
            <div className="flex items-center gap-2 border-b border-parchment-300 px-3 dark:border-parchment-800">
              <Search className="h-4 w-4 shrink-0 text-parchment-600 dark:text-parchment-400" aria-hidden />
              <input
                ref={campo}
                value={termo}
                onChange={(e) => {
                  setTermo(e.target.value);
                  // O índice volta pro topo AQUI, e não num efeito: um `setState`
                  // dentro de `useEffect` dispara uma renderização em cascata, e
                  // o dado que muda é o mesmo que o evento já trouxe.
                  setSelecionado(0);
                }}
                onKeyDown={aoNavegar}
                placeholder="Magia, técnica, condição, item, regra…"
                aria-label="O que procurar"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-parchment-900 outline-none placeholder:text-parchment-600 dark:text-parchment-50 dark:placeholder:text-parchment-400"
              />
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar busca"
                className="rounded p-1 text-parchment-600 hover:text-wine-600 dark:text-parchment-400"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {termo.trim() && (
              <ul className="max-h-[52vh] overflow-y-auto py-1">
                {resultados.map((r, i) => (
                  <li key={r.doc.chave}>
                    <button
                      type="button"
                      onClick={() => irPara(r.doc.href)}
                      onMouseEnter={() => setSelecionado(i)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                        i === selecionado
                          ? "bg-wine-500/10"
                          : "hover:bg-parchment-900/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-parchment-900 dark:text-parchment-50">
                          {r.doc.nome}
                        </span>
                        <span className="block truncate text-xs text-parchment-600 dark:text-parchment-400">
                          {r.doc.contexto}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-parchment-200/70 px-2 py-0.5 text-[10px] font-bold text-parchment-700 dark:bg-parchment-800 dark:text-parchment-300">
                        {TIPO_LABELS[r.doc.tipo]}
                      </span>
                    </button>
                  </li>
                ))}

                {resultados.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-parchment-600 dark:text-parchment-400">
                    Nada com <b>{termo}</b>. Tente uma palavra só.
                  </li>
                )}

                {resultados.length > 0 && (
                  <li className="border-t border-parchment-300 dark:border-parchment-800">
                    <button
                      type="button"
                      onClick={() => irPara(`/busca?q=${encodeURIComponent(termo)}`)}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-wine-700 hover:bg-wine-500/5 dark:text-wine-300"
                    >
                      Ver todos os resultados de <b>{termo}</b> →
                    </button>
                  </li>
                )}
              </ul>
            )}

            {!termo.trim() && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-4 text-xs text-parchment-600 dark:text-parchment-400">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-parchment-300 px-1 font-sans text-[10px] dark:border-parchment-700">
                    ↑↓
                  </kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-parchment-300 px-1 font-sans text-[10px] dark:border-parchment-700">
                    <CornerDownLeft className="inline h-2.5 w-2.5" aria-hidden />
                  </kbd>
                  abrir
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-parchment-300 px-1 font-sans text-[10px] dark:border-parchment-700">
                    esc
                  </kbd>
                  fechar
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
