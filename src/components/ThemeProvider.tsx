"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ReactNode, useEffect } from "react";
import { CLASSE_DO_TEMA, TEMA_PADRAO, TEMAS, ehTemaDoLivro } from "@/lib/temas";

/**
 * Quatro temas (ver `src/lib/temas.ts`); o padrão é o Pergaminho Noite. O
 * `next-themes` cuida do claro/escuro (`dark`); a marca `tema-livro` vem do
 * script do <head> no primeiro quadro e daqui em cada troca.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      themes={TEMAS.map((t) => t.id)}
      value={CLASSE_DO_TEMA}
      defaultTheme={TEMA_PADRAO}
      enableSystem={false}
    >
      <MarcaDoLivro />
      {children}
    </NextThemesProvider>
  );
}

function MarcaDoLivro() {
  const { theme } = useTheme();
  useEffect(() => {
    if (!theme) return;
    document.documentElement.classList.toggle("tema-livro", ehTemaDoLivro(theme));
  }, [theme]);
  return null;
}
