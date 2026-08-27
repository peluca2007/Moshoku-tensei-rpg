"use client";

import { Download } from "lucide-react";

/** Abre o diálogo de impressão do navegador — o @media print de globals.css já transforma a página inteira num PDF limpo (sem nav, sem sumário, com quebras de capítulo). "Salvar como PDF" no diálogo do sistema é o "um clique" pedido. */
export default function ExportBookButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hide flex shrink-0 items-center gap-2 rounded-lg bg-wine-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-wine-500"
    >
      <Download className="h-4 w-4" /> Exportar Livro em PDF
    </button>
  );
}
