"use client";

import { useState } from "react";
import { ClipboardPaste, Link2Off } from "lucide-react";
import Surface from "@/components/ui/Surface";
import { descreverFalha, FalhaDeLink, recolherLinkColado } from "@/lib/diagnosticoDeLink";

/**
 * A tela de "o link não abriu", com a razão e uma saída.
 *
 * Substitui a frase única que servia para cinco causas diferentes (ver
 * `lib/diagnosticoDeLink.ts`). Compartilhada entre `/ficha/importar` e
 * `/encontros/importar` porque as duas erram do mesmo jeito.
 *
 * O campo de colar não é consolo: é o caminho principal no celular. Baixar um
 * arquivo e achá-lo de novo num gerenciador de arquivos é o passo em que a
 * importação morre num telefone, e colar funciona em qualquer aparelho, com
 * qualquer aplicativo de mensagem — inclusive quando o link chegou partido.
 */
export default function LinkQueFalhou({
  falha,
  oQue,
  aoTentarDeNovo,
}: {
  falha: FalhaDeLink;
  oQue: "ficha" | "criatura";
  /** Recebe o fragmento já recolhido. A tela de cima decide o que fazer com ele. */
  aoTentarDeNovo: (fragmento: string) => void;
}) {
  const [colado, setColado] = useState("");
  const texto = descreverFalha(falha.motivo, falha.caracteres, oQue);
  const recolhido = recolherLinkColado(colado);

  return (
    <Surface level="sunken" className="flex flex-col items-center gap-3 p-6 text-center sm:p-8">
      <Link2Off className="h-9 w-9 text-parchment-400 dark:text-parchment-700" aria-hidden />

      <p className="font-display text-base font-bold text-parchment-800 dark:text-parchment-200">
        {texto.titulo}
      </p>

      <p className="max-w-sm text-xs leading-relaxed text-parchment-600 dark:text-parchment-400">
        {texto.explicacao}
      </p>

      <p className="max-w-sm text-xs font-semibold leading-relaxed text-parchment-700 dark:text-parchment-300">
        {texto.saida}
      </p>

      <form
        className="mt-2 w-full max-w-md text-left"
        onSubmit={(e) => {
          e.preventDefault();
          if (recolhido) aoTentarDeNovo(recolhido);
        }}
      >
        <label
          htmlFor="colar-link"
          className="block text-xs font-bold uppercase tracking-wide text-parchment-700 dark:text-parchment-300"
        >
          Cole o link aqui
        </label>
        <p className="mt-0.5 text-2xs text-parchment-600 dark:text-parchment-400">
          Pode ser o link inteiro, e pode estar quebrado em várias linhas — as quebras são removidas.
        </p>
        <textarea
          id="colar-link"
          value={colado}
          onChange={(e) => setColado(e.target.value)}
          rows={3}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="https://…/ficha/importar#g:…"
          className="mt-1.5 w-full resize-y rounded-lg border border-parchment-300 bg-parchment-50 p-2 font-mono text-xs text-parchment-900 placeholder:text-parchment-500 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50 dark:placeholder:text-parchment-500"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={!recolhido}
            className="flex min-h-[2.25rem] items-center gap-2 rounded-full bg-wine-600 px-4 py-2 text-sm font-bold text-white ring-1 ring-gold-400/30 transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ClipboardPaste className="h-4 w-4" aria-hidden />
            Ler este link
          </button>
          {recolhido && (
            <span className="text-2xs text-parchment-600 dark:text-parchment-400">
              {recolhido.length.toLocaleString("pt-BR")} caracteres depois de juntar as linhas
            </span>
          )}
        </div>
      </form>
    </Surface>
  );
}
