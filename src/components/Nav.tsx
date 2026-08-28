"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/ficha", label: "Ficha" },
  { href: "/arvores", label: "Árvores" },
  { href: "/personagens", label: "Personagens" },
  { href: "/iniciativa", label: "Iniciativa" },
  { href: "/mestre", label: "Mestre" },
  { href: "/apresentacao", label: "Apresentação" },
  { href: "/livro", label: "Livro de Regras" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="border-b border-parchment-300 bg-parchment-50 text-sm font-medium text-parchment-600 dark:border-parchment-800 dark:bg-parchment-950 dark:text-parchment-300">
      <div className="flex items-center gap-4 px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-parchment-900/5 dark:hover:bg-white/5 sm:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-black text-parchment-900 hover:text-wine-600 dark:text-parchment-50 dark:hover:text-wine-400"
        >
          Mushoku Tensei RPG
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 whitespace-nowrap hover:text-wine-600 dark:hover:text-wine-400 ${
                pathname === link.href ? "font-bold text-wine-600 dark:text-wine-400" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <span className="ml-auto shrink-0">
          <ThemeToggle />
        </span>
      </div>

      {open && (
        <div className="flex flex-col border-t border-parchment-300 px-2 py-2 dark:border-parchment-800 sm:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2.5 ${
                pathname === link.href
                  ? "bg-wine-500/10 font-bold text-wine-600 dark:text-wine-400"
                  : "hover:bg-parchment-900/5 dark:hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
