import Image from "next/image";
import Link from "next/link";
import { BookOpen, Dices, ScrollText, Skull, Sparkles, Store, Swords, TreePine, UserPlus, Users } from "lucide-react";
import PatchNotes from "@/components/PatchNotes";
import Surface from "@/components/ui/Surface";
import Logo from "@/components/ui/Logo";
import Ornament from "@/components/ui/Ornament";
import { TREES } from "@/data/trees";

/**
 * Cresceu de três pra SEIS destinos em 0.1.8.
 *
 * Com três cards, metade do site continuava invisível pra quem chega: a ficha,
 * o roster e o montador de encontros — que é onde o Mestre passa o tempo dele —
 * só apareciam como texto numa lista de bullets embaixo. Agora que as sete
 * rotas têm arte própria, cada uma pode se apresentar com a cara que ela tem.
 *
 * Seis, e não sete: `/criar` fica de fora de propósito porque ela já é o botão
 * grande do topo da página, e repetir o CTA principal dentro da vitrine
 * enfraquece os dois.
 *
 * A ordem é a de uso, não a do menu: descobrir o sistema (árvores) → fazer a
 * ficha → equipar → guardar → o lado do Mestre → a referência.
 */
const VITRINE = [
  {
    href: "/arvores",
    arte: "/texturas/ceu-arvores.png",
    icon: TreePine,
    kicker: `${TREES.length} sub-árvores`,
    title: "O mapa do que você pode virar",
    description:
      "Um círculo de Magia, Corpo e Utilidade que abre do Principiante ao Imperador. Sem classe, sem nível: você é a soma do que estudou.",
  },
  {
    href: "/ficha",
    arte: "/faixas/ficha.png",
    icon: Users,
    kicker: "Ficha viva",
    title: "Os números se calculam sozinhos",
    description:
      "PV, PM, PT, CA e Iniciativa saem das suas escolhas — e continuam editáveis a qualquer momento, porque nenhuma mesa cabe inteira numa fórmula.",
  },
  {
    href: "/loja",
    arte: "/faixas/loja.jpg",
    icon: Store,
    kicker: "Loja da Guilda",
    title: "Equipar antes de sair da cidade",
    description:
      "Armas, poções, venenos e ferramentas mágicas com preço e Rank mínimo. Comprar debita o PO e manda o item direto pra ficha.",
  },
  {
    href: "/personagens",
    arte: "/faixas/personagens.jpg",
    icon: UserPlus,
    kicker: "O grupo inteiro",
    title: "Todas as fichas da mesa",
    description:
      "Cada personagem vive no seu navegador e sai em JSON — o Mestre importa os cinco e simula o encontro contra eles antes da sessão.",
  },
  {
    href: "/encontros",
    arte: "/faixas/encontros.jpg",
    icon: Skull,
    kicker: "Do lado do Mestre",
    title: "Descubra se você matou a mesa",
    description:
      "Monte a criatura pelo molde do Apêndice G e rode o combate 300 vezes contra as fichas de verdade do grupo. O site dá o veredito.",
  },
  {
    href: "/livro",
    arte: "/faixas/livro.jpg",
    icon: BookOpen,
    kicker: "Livro de regras",
    title: "O sistema inteiro, navegável",
    description:
      "Cinco capítulos e os apêndices, do primeiro teste de d20 ao molde de chefe — no site e exportável em PDF pra levar pra mesa.",
  },
];

/**
 * O que o site é, e não PARA ONDE ele leva.
 *
 * Eram quatro e viraram três em 0.1.8: "Feito pra mesa de verdade" descrevia o
 * tracker e o montador de encontros, que agora têm card próprio na vitrine —
 * dizer a mesma coisa duas vezes na mesma página só ensina o leitor a pular a
 * segunda. O que sobrou são as três afirmações que nenhuma rota consegue fazer
 * sozinha.
 */
const FEATURES = [
  {
    icon: Sparkles,
    title: "Sem nível, sem classe",
    description:
      "Você recebe Pontos de Aprimoramento e gasta um por um, na ordem que quiser. Um personagem é a soma do que estudou — não um pacote pronto.",
  },
  {
    icon: Dices,
    title: "3 formas de nascer",
    description:
      "Manual, Roleta do Destino ou a Entrevista — três portas para a mesma ficha, e a Entrevista deixa suas respostas pesarem no sorteio.",
  },
  {
    icon: Swords,
    title: "Rolador que já sabe as contas",
    description:
      "Testes, dano de arma e de magia, vantagem/desvantagem e crítico, puxando o Bônus de Rank e o atributo certos da ficha aberta.",
  },
];

export default function LandingPage() {
  return (
    <div>
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

        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pb-12 sm:pt-16">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-parchment-50/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-700 shadow-sm ring-1 ring-gold-500/40 backdrop-blur-sm dark:bg-parchment-950/75 dark:text-gold-300">
            <Sparkles className="h-3.5 w-3.5" /> Projeto de fã, não-oficial
          </p>
          {/*
            O logo É o título — ele não ilustra um h1, ele substitui um.

            Até 2026-09-03 a página escrevia o nome duas vezes: o logo dizia
            "Mushoku Tensei" e o h1 logo abaixo repetia "Mushoku Tensei RPG" em
            corpo maior. Agora o h1 existe (é ele que nomeia a página pra busca
            e pra leitor de tela) mas é lido, não visto — `sr-only`.

            E desde 0.1.6 o "RPG" saiu daqui também: ele está dentro do
            letreiro novo. Ver ui/Logo.tsx.
          */}
          <h1 className="sr-only">Mushoku Tensei RPG</h1>
          <Logo className="mx-auto mt-1 h-48 sm:h-72" priority />
          <p className="mx-auto mt-6 max-w-xl text-base text-parchment-700 dark:text-parchment-300 sm:text-lg">
            Um sistema de RPG de mesa completo, homebrew e feito por fãs, ambientado no mundo de{" "}
            <i>Mushoku Tensei: Jobless Reincarnation</i>. Crie seu personagem, evolua pelas árvores de magia,
            corpo e utilidade, e jogue.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/criar"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-wine-600 px-6 py-3 font-bold text-white shadow-lg ring-1 ring-gold-400/40 transition-all hover:scale-105 hover:bg-wine-500 hover:shadow-xl sm:w-auto"
            >
              <Sparkles className="h-5 w-5" /> Criar Personagem
            </Link>
            <Link
              href="/personagens"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-parchment-300 bg-parchment-50/90 px-6 py-3 font-semibold text-parchment-700 shadow-sm backdrop-blur-sm transition-colors hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:bg-parchment-900/80 dark:text-parchment-200 dark:hover:border-wine-600 dark:hover:text-wine-400 sm:w-auto"
            >
              Já tenho uma ficha
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {VITRINE.map(({ href, arte, icon: Icon, kicker, title, description }) => (
            <Link key={href} href={href} className="group block focus-visible:outline-none">
              <Surface
                level="raised"
                interactive
                className="flex h-full flex-col overflow-hidden group-focus-visible:ring-2 group-focus-visible:ring-gold-500"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={arte}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 340px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* A arte precisa morrer antes do texto: sem esta camada, o
                      "kicker" dourado cai em cima de uma nebulosa clara e some. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-parchment-50 via-parchment-50/40 to-transparent dark:from-parchment-900 dark:via-parchment-900/40" />
                  <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-wine-600/95 text-parchment-50 shadow-lg ring-1 ring-gold-400/50 backdrop-blur-sm">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                </div>
                {/*
                  `relative` não é decoração aqui: o bloco da arte acima é
                  posicionado, e elemento posicionado pinta ACIMA de irmão não
                  posicionado, mesmo vindo antes no DOM. Sem isto, o `-mt-3`
                  enfiava a linha "19 sub-árvores" por baixo da imagem e ela
                  sumia da tela — que foi exatamente o que o primeiro print
                  mostrou.
                */}
                <div className="relative -mt-3 flex flex-1 flex-col p-5 pt-0">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gold-700 dark:text-gold-400">
                    {kicker}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-black text-parchment-900 dark:text-parchment-50">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-parchment-600 dark:text-parchment-400">
                    {description}
                  </p>
                </div>
              </Surface>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <Ornament />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Surface key={title} className="p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-wine-600/10 text-wine-600 ring-1 ring-wine-500/25 dark:bg-wine-500/15 dark:text-wine-300">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mb-1 font-display font-bold text-parchment-900 dark:text-parchment-50">{title}</h2>
              <p className="text-sm leading-relaxed text-parchment-600 dark:text-parchment-400">{description}</p>
            </Surface>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-4">
          <Link
            href="/criar/entrevista"
            className="flex items-center gap-1.5 text-sm font-semibold text-wine-600 hover:text-wine-500 dark:text-wine-300"
          >
            <ScrollText className="h-4 w-4" /> Fazer a Entrevista do Destino
          </Link>
          <span className="hidden text-parchment-300 dark:text-parchment-700 sm:inline">·</span>
          <Link
            href="/iniciativa"
            className="flex items-center gap-1.5 text-sm font-semibold text-wine-600 hover:text-wine-500 dark:text-wine-300"
          >
            <Swords className="h-4 w-4" /> Abrir o tracker de iniciativa
          </Link>
        </div>
      </div>

      {/*
        A faixa de convite (0.1.6).

        A landing terminava numa fileira de links de texto e caía direto no
        rodapé — ela dizia o que o sistema tem e nunca voltava a pedir a única
        coisa que quer de quem está lendo. Uma faixa larga com o grupo de
        aventureiros fecha a página do jeito que ela abriu: com o mundo, não com
        uma lista.
      */}
      <section className="relative isolate overflow-hidden">
        {/*
          Quatro camadas, e nenhuma é enfeite (refeita em 0.1.8).
          Antes eram duas — a arte e um véu chapado —, e o resultado tinha corte
          reto em cima e embaixo, laterais que simplesmente terminavam, e a
          tocha do grupo brilhando por trás da linha de texto. Cada camada aqui
          resolve um desses:

          1. A ARTE, tratada pelo `.faixa-arte` como toda faixa de rota.
          2. A MÁSCARA de quatro pontas, que faz a imagem morrer no pergaminho
             em vez de encostar numa borda — é ela que tira o "recorte colado
             na página" que a versão anterior tinha.
          3. O VÉU em degradê (mais denso no meio, onde o texto está; mais
             aberto nas pontas, onde a arte pode aparecer) — em vez do véu
             uniforme, que apagava a imagem inteira pra proteger três linhas.
          4. Os dois FILETES dourados, que dão à faixa a mesma aresta de luz que
             todo `.surface-raised` do site tem.
        */}
        {/*
          A máscara é do GRUPO, não da arte (0.1.9).
          A versão anterior mascarava só a imagem e depois punha um véu radial
          por cima — mas o véu era um retângulo opaco, e era ELE que desenhava
          as duas linhas horizontais duras que faziam a faixa parecer um recorte
          colado na página. A arte sumia nas pontas; a caixa de cor, não.

          Agora arte e véu vivem dentro do mesmo `<div>` mascarado, então os
          dois desaparecem juntos: no centro a faixa tem imagem e escurecimento
          suficientes pra segurar o texto, e nas quatro bordas ela simplesmente
          deixa de existir — não há aresta pra ver, porque não há nada ali além
          do pergaminho da página.

          Por isso também não há mais filetes dourados aqui: filete marca
          justamente a aresta que esta seção não quer ter.
        */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(120%_92%_at_50%_50%,black_0%,black_28%,transparent_80%)]"
          aria-hidden
        >
          <Image
            src="/faixas/convite.jpg"
            alt=""
            fill
            sizes="100vw"
            className="arte-ambiente object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-parchment-50/55 dark:bg-parchment-950/60" />
        </div>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <h2 className="font-display text-2xl font-black text-parchment-900 drop-shadow-[0_1px_0_rgba(253,246,227,0.5)] dark:text-parchment-50 dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-3xl">
            A guilda está aceitando fichas
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-parchment-700 dark:text-parchment-200 sm:text-base">
            Sem nível, sem classe. Você recebe Pontos de Aprimoramento e decide, um por um, no que virar.
          </p>
          <Link
            href="/criar"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-wine-600 px-7 py-3 font-bold text-white shadow-lg ring-1 ring-gold-400/40 transition-all hover:scale-105 hover:bg-wine-500 hover:shadow-xl"
          >
            <Sparkles className="h-5 w-5" /> Criar Personagem
          </Link>
        </div>
      </section>

      <PatchNotes />
    </div>
  );
}
