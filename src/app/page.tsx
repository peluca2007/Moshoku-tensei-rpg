import Image from "next/image";
import Link from "next/link";
import { BookOpen, Dices, ScrollText, Shield, Sparkles, Store, Swords, TreePine, Users } from "lucide-react";
import PatchNotes from "@/components/PatchNotes";
import { TREES } from "@/data/trees";

const FEATURES = [
  {
    icon: Users,
    title: "Ficha viva",
    description: "Atributos, PV/PM/PT/PP e CA calculados sozinhos — mas tudo editável a qualquer momento, sem trava nenhuma.",
  },
  {
    icon: TreePine,
    // Contado de TREES: a landing dizia "18" desde antes do Vendaval e do Punho
    // de Fogo entrarem. Número na vitrine também tem uma fonte só.
    title: `${TREES.length} sub-árvores`,
    description: "Um mapa de progressão radial, do Principiante ao Imperador, pra magia, corpo e utilidade.",
  },
  {
    icon: Dices,
    title: "3 formas de nascer",
    description: "Manual, Roleta do Destino ou a Entrevista — escolha como seu personagem chega ao mundo.",
  },
  {
    icon: Swords,
    title: "Rolador de dados",
    description: "Testes, dano de arma e de magia, vantagem/desvantagem e crítico, puxando os bônus certos sozinho.",
  },
  {
    icon: BookOpen,
    title: "Livro de regras completo",
    description: "Todo o sistema navegável no site, com exportação em PDF pra levar pra mesa.",
  },
  {
    icon: Shield,
    title: "Feito pra mesa de verdade",
    description: "Tracker de iniciativa pra acompanhar o combate direto do site.",
  },
  {
    icon: Store,
    title: "Loja da Guilda",
    description: "Armas, poções, venenos e ferramentas mágicas com preço e Rank mínimo — comprar já manda direto pra ficha.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        {/*
          A paisagem do Mundo de Seis Faces, atrás do herói (2026-09-03).
          Antes daqui o topo da landing era texto sobre nada — e a primeira
          coisa que um livro de RPG precisa vender é o lugar onde ele acontece.

          Ela é COBERTA por um degradê que vai do transparente ao fundo da
          página: a imagem aparece no alto, morre antes de encostar no texto, e
          a leitura nunca disputa contraste com um céu. Por isso o degradê tem
          três paradas e não duas — a do meio é que segura o texto.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_100%)] sm:h-[34rem]"
          aria-hidden
        >
          <Image
            src="/paisagem.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-parchment-50/10 via-parchment-50/60 to-parchment-50/90 dark:from-parchment-950/25 dark:via-parchment-950/60 dark:to-parchment-950/90" />
        </div>
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-wine-500/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-parchment-50/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-700 shadow-sm ring-1 ring-gold-500/40 backdrop-blur-sm dark:bg-parchment-950/75 dark:text-gold-300">
            <Sparkles className="h-3.5 w-3.5" /> Projeto de fã, não-oficial
          </p>
          {/*
            O logo É o título — ele não ilustra um h1, ele substitui um.

            Até 2026-09-03 a página escrevia o nome duas vezes: o logo dizia
            "Mushoku Tensei" e o h1 logo abaixo repetia "Mushoku Tensei RPG" em
            corpo maior. Agora o h1 existe (é ele que nomeia a página pra busca
            e pra leitor de tela) mas é lido, não visto — `sr-only` —, e o "RPG"
            que o logo da franquia não tem entra como uma linha própria, que é
            exatamente a informação que este projeto acrescenta ao nome.

            Ver Nav.tsx pro porquê de serem duas imagens em vez de uma com filtro.
          */}
          <h1 className="sr-only">Mushoku Tensei RPG</h1>
          <Image
            src="/logo.svg"
            alt=""
            aria-hidden
            width={600}
            height={320}
            priority
            unoptimized
            className="mx-auto h-28 w-auto drop-shadow-sm dark:hidden sm:h-40"
          />
          <Image
            src="/logo-dark.svg"
            alt=""
            aria-hidden
            width={600}
            height={320}
            priority
            unoptimized
            className="mx-auto hidden h-28 w-auto dark:block sm:h-40"
          />
          <p className="mt-1 font-display text-2xl font-black tracking-[0.35em] text-wine-600 dark:text-gold-400 sm:text-3xl">
            RPG
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base text-parchment-600 dark:text-parchment-300 sm:text-lg">
            Um sistema de RPG de mesa completo, homebrew e feito por fãs, ambientado no mundo de{" "}
            <i>Mushoku Tensei: Jobless Reincarnation</i>. Crie seu personagem, evolua pelas árvores de magia,
            corpo e utilidade, e jogue.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/criar"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-wine-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-wine-500 sm:w-auto"
            >
              <Sparkles className="h-5 w-5" /> Criar Personagem
            </Link>
            <Link
              href="/personagens"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-parchment-300 bg-parchment-50 px-6 py-3 font-semibold text-parchment-700 shadow-sm transition-colors hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-200 dark:hover:border-wine-600 dark:hover:text-wine-400 sm:w-auto"
            >
              Já tenho uma ficha
            </Link>
          </div>

          <p className="mx-auto mt-10 max-w-xl rounded-2xl border border-parchment-300 bg-parchment-50/80 p-4 text-xs leading-relaxed text-parchment-600 dark:border-parchment-800 dark:bg-parchment-900/60 dark:text-parchment-400">
            Este é um projeto de fã, sem fins lucrativos e sem vínculo com Rifujin na Magonote, a editora ou
            qualquer detentor dos direitos de <i>Mushoku Tensei</i>. Todo o sistema de regras aqui é uma
            criação homebrew original, feita só pra jogar com amigos — nomes e ambientação da obra original
            são usados apenas como inspiração e referência.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-parchment-300 bg-parchment-50/70 p-5 shadow-sm transition-colors hover:border-wine-400 dark:border-parchment-800 dark:bg-parchment-900/60 dark:hover:border-wine-600"
            >
              <Icon className="mb-3 h-7 w-7 text-wine-500" />
              <h2 className="mb-1 font-bold text-parchment-900 dark:text-parchment-50">{title}</h2>
              <p className="text-sm text-parchment-600 dark:text-parchment-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-4">
          <Link
            href="/livro"
            className="flex items-center gap-1.5 text-sm font-semibold text-wine-600 hover:text-wine-500 dark:text-wine-300 dark:hover:text-wine-300"
          >
            <BookOpen className="h-4 w-4" /> Ler o livro de regras
          </Link>
          <span className="hidden text-parchment-300 dark:text-parchment-700 sm:inline">·</span>
          <Link
            href="/arvores"
            className="flex items-center gap-1.5 text-sm font-semibold text-wine-600 hover:text-wine-500 dark:text-wine-300 dark:hover:text-wine-300"
          >
            <TreePine className="h-4 w-4" /> Explorar as árvores de progressão
          </Link>
          <span className="hidden text-parchment-300 dark:text-parchment-700 sm:inline">·</span>
          <Link
            href="/criar/entrevista"
            className="flex items-center gap-1.5 text-sm font-semibold text-wine-600 hover:text-wine-500 dark:text-wine-300 dark:hover:text-wine-300"
          >
            <ScrollText className="h-4 w-4" /> Fazer a Entrevista do Destino
          </Link>
        </div>
      </div>

      <PatchNotes />
    </div>
  );
}
