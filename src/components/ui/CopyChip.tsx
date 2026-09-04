"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Uma etiqueta que copia o próprio conteúdo (0.1.6).
 *
 * Existe pro handle do Discord no rodapé: o Discord não tem URL pública estável
 * pra um nome de usuário (um convite `discord.gg` expira e vira 404 no rodapé de
 * TODAS as páginas), então o que serve é o texto no clipboard, que é o que se
 * cola na busca de amigos do app.
 *
 * Ele mora num componente próprio, e não com `"use client"` no rodapé inteiro,
 * porque o rodapé importa `PATCH_NOTES` — 48 KB de texto que não têm por que
 * atravessar pro bundle do cliente só pra fazer um botão funcionar.
 */
export default function CopyChip({
  value,
  children,
  title,
}: {
  /** O que vai pro clipboard. */
  value: string;
  /**
   * O conteúdo da etiqueta, ícone incluído, JÁ como elemento.
   *
   * Não é `icon: ComponentType` de propósito: o rodapé é Server Component, e
   * React recusa em runtime uma FUNÇÃO atravessando pra um Client Component
   * ("Only plain objects can be passed to Client Components"). `tsc` aceita,
   * `eslint` aceita, e a página quebra ao abrir — outro defeito que só o print
   * pegou. Elemento já construído atravessa.
   */
  children: React.ReactNode;
  title?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  async function copiar() {
    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopiado(false), 1600);
    } catch {
      // `navigator.clipboard` some fora de contexto seguro (http://, iframe sem
      // permissão). O texto já está visível na etiqueta, então falhar em
      // silêncio é melhor que um alerta explicando que o botão não funciona.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title={title}
      className={`lift flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        copiado
          ? "border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300"
          : "border-parchment-300 bg-parchment-50/70 text-parchment-700 hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:bg-parchment-900/60 dark:text-parchment-200 dark:hover:border-wine-600 dark:hover:text-wine-300"
      }`}
    >
      {children}
      {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3 w-3 opacity-50" />}
    </button>
  );
}
