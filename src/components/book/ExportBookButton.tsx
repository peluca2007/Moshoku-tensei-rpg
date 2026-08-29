"use client";

import { useState } from "react";
import { FileCode2, Loader2, Printer } from "lucide-react";

/**
 * Duas saídas, porque elas resolvem problemas diferentes:
 *
 * - LaTeX (.tex): o livro tipografado de verdade, pronto pro Overleaf. É a
 *   entrega "livro impresso". Não compila aqui — LaTeX exige uma distribuição
 *   TeX instalada no servidor, que este projeto não tem e um deploy não teria;
 *   o PDF da FICHA funciona porque o Typst compila em processo, o que não tem
 *   equivalente pro LaTeX. Então baixamos a FONTE, num arquivo só, e o Overleaf
 *   compila em dois cliques.
 * - Imprimir: o @media print de globals.css transforma a página numa versão
 *   limpa; "Salvar como PDF" no diálogo do sistema resolve quando o que se quer
 *   é só um PDF rápido pra consulta.
 */
export default function ExportBookButton() {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState(false);

  async function baixarTex() {
    setBaixando(true);
    setErro(false);
    try {
      const res = await fetch("/api/livro-tex");
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "moshoku-tensei-livro.tex";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErro(true);
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="print-hide flex shrink-0 flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={baixarTex}
        disabled={baixando}
        title="Baixa o livro inteiro em LaTeX, num arquivo só — cole no Overleaf e compile em LuaLaTeX"
        className="flex items-center gap-2 rounded-lg bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-wine-500 disabled:opacity-60"
      >
        {baixando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCode2 className="h-4 w-4" />}
        {baixando ? "Montando…" : "Exportar Livro (LaTeX)"}
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        title="Abre o diálogo de impressão — “Salvar como PDF” gera um PDF rápido de consulta"
        className="flex items-center gap-2 rounded-lg border border-parchment-300 px-3 py-2 text-sm font-semibold text-parchment-700 transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-800"
      >
        <Printer className="h-4 w-4" /> Imprimir
      </button>

      {erro && (
        <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
          Falhou. A pasta <code>livro-tex/</code> está no projeto?
        </span>
      )}
    </div>
  );
}
