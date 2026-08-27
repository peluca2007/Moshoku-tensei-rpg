"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const noopSubscribe = () => () => {};

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Evita mismatch de hidratação: no servidor não sabemos o tema salvo no navegador.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  if (!mounted) {
    return <span className="h-8 w-8 shrink-0" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-parchment-500 transition-colors hover:bg-wine-600/10 hover:text-wine-600 dark:text-parchment-400 dark:hover:bg-wine-400/10 dark:hover:text-wine-400"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
