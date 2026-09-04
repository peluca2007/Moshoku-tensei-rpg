"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

/**
 * `/criar` NÃO entra aqui de propósito (2026-09-03).
 *
 * Criar personagem não é um destino que se visita: é uma coisa que se faz uma
 * vez por ficha, e sempre a partir do roster. `/personagens` já abre com o botão
 * de criação e mostra as fichas existentes ao lado — que é o contexto que faz a
 * pergunta "criar mais uma?" ter sentido. Ter as duas portas no topo dava ao
 * fluxo mais peso permanente do que ele merece, e a de cima chegava sem
 * contexto nenhum.
 *
 * A rota continua existindo e linkada da landing e do roster; só saiu da barra.
 */
const LINKS = [
  { href: "/ficha", label: "Ficha" },
  { href: "/arvores", label: "Árvores" },
  { href: "/personagens", label: "Personagens" },
  { href: "/iniciativa", label: "Iniciativa" },
  { href: "/encontros", label: "Encontros" },
  { href: "/loja", label: "Loja" },
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

        {/*
          O logo entra como DUAS imagens, uma por tema, em vez de uma com filtro
          CSS: o letreiro é preto e os ornamentos são dourados, então qualquer
          `invert` que salvasse o letreiro no escuro estragaria o dourado junto.
          `logo-dark.svg` é gerado de `logo.svg` — ver scripts/gerar-logo-dark.mjs.

          O "RPG" continua sendo texto porque o logo é da franquia, não deste
          projeto: o que ele nomeia é o mundo, e a palavra que diz o que este
          site é fica do lado de fora da arte.
        */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Mushoku Tensei"
            width={112}
            height={60}
            priority
            unoptimized
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src="/logo-dark.svg"
            alt="Mushoku Tensei"
            width={112}
            height={60}
            priority
            unoptimized
            className="hidden h-8 w-auto dark:block"
          />
          <span className="whitespace-nowrap font-black tracking-wide text-parchment-900 hover:text-wine-600 dark:text-parchment-50 dark:hover:text-wine-400">
            RPG
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 whitespace-nowrap hover:text-wine-600 dark:hover:text-wine-400 ${
                pathname === link.href ? "font-bold text-wine-600 dark:text-wine-300" : ""
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
                  ? "bg-wine-500/10 font-bold text-wine-600 dark:text-wine-300"
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
