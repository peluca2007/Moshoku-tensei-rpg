import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PATCH_NOTES } from "@/data/patchNotes";
import Ornament from "./ui/Ornament";
import Logo from "./ui/Logo";
import CopyChip from "./ui/CopyChip";

/** O repositório e o contato do autor — citados no rodapé de todas as rotas. */
const REPOSITORIO = "https://github.com/peluca2007/Moshoku-tensei-rpg";
const DISCORD = "peluca2007";

/**
 * O gato-polvo, desenhado aqui.
 *
 * O `lucide-react` 1.x tirou os ícones de MARCA do pacote (não existe mais
 * `Github` exportado — `npx tsc` reclama na hora), e trocar por um ícone
 * genérico de código não diz a mesma coisa: o que este chip promete é
 * especificamente o GitHub. Como é um path só, ele mora aqui e não vira
 * dependência nova.
 */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/**
 * O fim da página (0.1.5).
 *
 * Até aqui NENHUMA rota do site terminava: elas paravam. Você rolava até o
 * último card e depois vinha pergaminho vazio até o fim do scroll — o que, num
 * site, lê como página quebrada, e não como "acabou".
 *
 * O rodapé também é o lugar certo do disclaimer de fã. Na landing ele estava
 * ocupando o espaço logo abaixo do CTA — o ponto mais valioso da página, onde
 * deveria estar a prova de que o sistema é bom, e onde estava um parágrafo
 * jurídico em corpo 12. A informação continua no site inteiro (agora em TODAS
 * as rotas, não só na inicial), só saiu da vitrine.
 */
const COLUNAS = [
  {
    titulo: "Jogar",
    links: [
      { href: "/criar", label: "Criar personagem" },
      { href: "/personagens", label: "Meus personagens" },
      { href: "/ficha", label: "Ficha" },
      { href: "/loja", label: "Loja da Guilda" },
    ],
  },
  {
    titulo: "Mesa",
    links: [
      { href: "/iniciativa", label: "Tracker de iniciativa" },
      { href: "/encontros", label: "Montar encontro" },
      { href: "/arvores", label: "Árvores de progressão" },
    ],
  },
  {
    titulo: "Referência",
    links: [
      { href: "/livro", label: "Livro de regras" },
      { href: "/livro#apendices", label: "Apêndices" },
      { href: "/#patch-notes", label: "Notas de versão" },
    ],
  },
];

export default function Footer() {
  const versao = PATCH_NOTES[0];

  return (
    <footer className="print-hide mt-16 border-t border-parchment-300 bg-parchment-100/60 backdrop-blur-sm dark:border-parchment-800 dark:bg-parchment-950/60">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Ornament className="!my-0 mb-8" />

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex">
              <Logo className="h-20" />
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-parchment-600 dark:text-parchment-400">
              Sistema de RPG de mesa homebrew, ambientado no Mundo de Seis Faces.
            </p>
            {versao ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-2.5 py-1 text-[11px] font-bold text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300">
                v{versao.version} · {versao.title}
              </p>
            ) : null}
          </div>

          {COLUNAS.map((coluna) => (
            <nav key={coluna.titulo} aria-label={coluna.titulo}>
              <h2 className="mb-3 font-display text-xs font-black uppercase tracking-widest text-parchment-700 dark:text-parchment-300">
                {coluna.titulo}
              </h2>
              <ul className="space-y-2">
                {coluna.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-parchment-600 transition-colors hover:text-wine-600 dark:text-parchment-400 dark:hover:text-wine-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/*
          Onde encontrar o projeto e quem o mantém (0.1.6).
          O Discord é handle, não convite: um link `discord.gg` expira e vira
          404 no rodapé de todas as páginas — o nome de usuário, não.
        */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-parchment-300/70 pt-6 dark:border-parchment-800/70">
          <a
            href={REPOSITORIO}
            target="_blank"
            rel="noopener noreferrer"
            className="lift flex items-center gap-2 rounded-full border border-parchment-300 bg-parchment-50/70 px-3.5 py-1.5 text-xs font-semibold text-parchment-700 hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:bg-parchment-900/60 dark:text-parchment-200 dark:hover:border-wine-600 dark:hover:text-wine-300"
          >
            <GithubMark className="h-4 w-4" /> peluca2007/Moshoku-tensei-rpg
          </a>
          <CopyChip value={DISCORD} title="Copiar o usuário do Discord">
            <MessageCircle className="h-4 w-4" /> Discord: {DISCORD}
          </CopyChip>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-parchment-600 dark:text-parchment-400">
          Projeto de fã, sem fins lucrativos e sem vínculo com Rifujin na Magonote, a editora ou qualquer
          detentor dos direitos de <i>Mushoku Tensei</i>. Todo o sistema de regras aqui é uma criação
          homebrew original, feita só pra jogar com amigos — nomes e ambientação da obra original são usados
          apenas como inspiração e referência.
        </p>
      </div>
    </footer>
  );
}
