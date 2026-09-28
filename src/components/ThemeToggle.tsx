"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { TEMA_PADRAO, TEMAS, type TemaId } from "@/lib/temas";

const noopSubscribe = () => () => {};

/**
 * A amostra de cada tema: o papel, a tinta e o acento, como uma lombada de
 * livro. Cores fixas de propósito — a amostra mostra o OUTRO tema, não o atual.
 */
const AMOSTRA: Record<TemaId, { papel: string; tinta: string; acento: string }> = {
  "pergaminho-noite": { papel: "#1a1210", tinta: "#ede3d0", acento: "#d4a94e" },
  pergaminho: { papel: "#fdf6e3", tinta: "#2b1810", acento: "#8e2f55" },
  "livro-noite": { papel: "#141418", tinta: "#e8e3d9", acento: "#b197fc" },
  "livro-dia": { papel: "#f1ede5", tinta: "#1d1e24", acento: "#6546b8" },
};

/**
 * O seletor de tema (2026-09-27): eram dois (claro/escuro) num botão que
 * alternava; com quatro, alternar obrigaria a passar por três pra chegar no
 * quarto. Vira um menu com a amostra de cada um.
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Evita mismatch de hidratação: no servidor não sabemos o tema salvo no navegador.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  if (!mounted) {
    return <span className="h-8 w-8 shrink-0" />;
  }

  const atual = TEMAS.find((t) => t.id === theme) ?? TEMAS.find((t) => t.id === TEMA_PADRAO)!;

  return (
    <div ref={raiz} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        title={`Tema: ${atual.nome}`}
        aria-label={`Tema: ${atual.nome}. Trocar tema`}
        className="flex h-8 w-8 items-center justify-center rounded-full text-parchment-600 transition-colors hover:bg-wine-600/10 hover:text-wine-600 dark:text-parchment-400 dark:hover:bg-wine-400/10 dark:hover:text-wine-400"
      >
        <Palette className="h-4 w-4" />
      </button>

      {aberto && (
        <div
          role="menu"
          aria-label="Tema do site"
          className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-parchment-300 bg-parchment-50 p-1.5 shadow-xl dark:border-parchment-700 dark:bg-parchment-900"
        >
          {TEMAS.map((t) => {
            const a = AMOSTRA[t.id];
            const escolhido = t.id === atual.id;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitemradio"
                aria-checked={escolhido}
                onClick={() => {
                  setTheme(t.id);
                  setAberto(false);
                }}
                className="flex min-h-10 w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm text-parchment-800 hover:bg-parchment-200/60 dark:text-parchment-100 dark:hover:bg-parchment-800/60"
              >
                <span
                  aria-hidden
                  className="flex h-7 w-10 shrink-0 items-end overflow-hidden rounded-sm border border-black/20"
                  style={{ background: a.papel }}
                >
                  <span className="h-full w-2" style={{ background: a.acento }} />
                  <span className="mb-1.5 ml-1 text-[10px] font-bold leading-none" style={{ color: a.tinta }}>
                    Aa
                  </span>
                </span>
                <span className="flex-1">
                  {t.nome}
                  {t.id === TEMA_PADRAO && <span className="ml-1 text-xs opacity-60">(padrão)</span>}
                </span>
                {escolhido && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
