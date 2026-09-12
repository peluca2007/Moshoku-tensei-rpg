"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./ui/Logo";
import BotaoInstalar from "./BotaoInstalar";
import BuscaRapida from "./BuscaRapida";
import ThemeToggle from "./ThemeToggle";
import FontSizeToggle from "./FontSizeToggle";

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
/**
 * Dez destinos viraram sete (0.1.36).
 *
 * A barra tinha crescido um link por ferramenta nova, e chegou a dez — mais do
 * que caberia numa decisão. Três saíram, e nenhum por ser pouco usado:
 *
 * - **Mesa** saiu porque a tela saiu. Ela era a ficha com botões grandes, e
 *   agora a ficha TEM os botões grandes: as reservas ganharam os passos de
 *   ±1/±5 e a faixa de "de quem é a vez" (ver `VezDaMesa`).
 * - **Iniciativa** e **Encontros** saíram porque são trabalho de Mestre, e o
 *   `/mestre` passou a ser a porta deles — junto do comparador de builds, que
 *   já morava fora da barra pelo mesmo motivo.
 *
 * As três rotas continuam existindo, linkadas e no pré-cache offline: o que
 * mudou é quem responde por elas na barra. Uma barra é uma pergunta — "onde eu
 * estou e pra onde posso ir?" —, e uma pergunta com dez respostas não é uma
 * pergunta.
 */
const LINKS = [
  { href: "/ficha", label: "Ficha" },
  { href: "/arvores", label: "Árvores" },
  { href: "/personagens", label: "Personagens" },
  { href: "/mestre", label: "Mestre" },
  { href: "/loja", label: "Loja" },
  // "Livro" e não "Livro de Regras": o rótulo longo era o que empurrava a Busca
  // pra fora da tela em telas de ~900px quando a barra tinha dez destinos.
  { href: "/livro", label: "Livro" },
  { href: "/busca", label: "Busca" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    /*
     * `sticky` + fundo translúcido com blur (0.1.5).
     *
     * A barra rolava pra fora da tela junto com a página: no /livro, que tem
     * capítulos de vários metros de scroll, sair de uma seção significava
     * rolar de volta ao topo pra achar o menu. Ela agora fica.
     *
     * O fundo é `/85` com `backdrop-blur` em vez de sólido porque a textura de
     * pergaminho do body é `fixed`: uma barra opaca cortaria a folha em duas
     * na horizontal, e o translúcido deixa a folha passar por baixo — que é o
     * que faz a barra parecer apoiada NA página, e não colada por cima dela.
     */
    <nav className="area-segura-topo area-segura-lados sticky top-0 z-40 border-b border-parchment-300/80 bg-parchment-50/85 text-sm font-medium text-parchment-600 shadow-[0_1px_0_rgba(212,169,78,0.25),0_8px_24px_-16px_rgba(43,24,16,0.5)] backdrop-blur-md dark:border-parchment-800/80 dark:bg-parchment-950/85 dark:text-parchment-300">
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
          Uma imagem só, e sem o "RPG" de texto ao lado (0.1.6): a logo nova já
          traz a palavra dentro do letreiro. Ver ui/Logo.tsx pro porquê do
          cartucho escuro e do `mix-blend-screen`.
        */}
        <Link href="/" className="flex shrink-0 items-center transition-transform hover:scale-[1.03]">
          <Logo className="h-16" priority />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              /*
               * A rota atual era só negrito + vinho — a mesma diferença que
               * qualquer link ganha no hover, o que dava dois estados
               * indistinguíveis. O filete dourado embaixo é uma marca que o
               * hover não usa, então "onde estou" e "o que estou apontando"
               * param de se confundir.
               */
              className={`relative shrink-0 whitespace-nowrap py-1 transition-colors hover:text-wine-600 dark:hover:text-wine-400 ${
                pathname === link.href
                  ? "font-bold text-wine-600 after:absolute after:inset-x-0 after:-bottom-[9px] after:h-0.5 after:rounded-full after:bg-gold-500 dark:text-wine-300 dark:after:bg-gold-400"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <span className="ml-auto flex shrink-0 items-center gap-0.5">
          {/*
            A busca vem ANTES dos dois toggles — 0.1.65.
            Ela é a única das três que responde uma pergunta; tamanho de fonte e
            tema se ajusta uma vez e esquece. O que se usa no meio de uma sessão
            fica mais perto do polegar.
          */}
          <BuscaRapida />
          <FontSizeToggle />
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
          {/*
            O botão de instalar, no menu — 0.1.61.

            Ele já existia, só que SÓ no rodapé. Num site cujo `/livro` tem 87
            mil pixels de rolagem, "está no rodapé" é o mesmo que não existir: o
            relato que abriu isto foi *"não apareceu a opção de adicionar à tela
            inicial"*, de um aparelho de verdade.

            O componente decide sozinho se aparece — some quando o app já está
            instalado, e some no navegador que não sabe instalar. Aqui ele fica
            onde a pessoa procura quando quer fazer algo com o site, que é o
            menu, e continua no rodapé pra quem chega lá pelo fim da página.
          */}
          <div className="border-t border-parchment-300 px-3 pt-1 dark:border-parchment-800">
            <BotaoInstalar />
          </div>
        </div>
      )}
    </nav>
  );
}
