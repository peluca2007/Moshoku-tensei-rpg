import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono, Literata } from "next/font/google";
import StoreHydration from "@/components/StoreHydration";
import SuporteOffline from "@/components/SuporteOffline";
import ThemeProvider from "@/components/ThemeProvider";
import { SCRIPT_TAMANHO_INICIAL } from "@/components/FontSizeToggle";
import Nav from "@/components/Nav";
import DiceRoller from "@/components/DiceRoller";
import Footer from "@/components/Footer";
import { OrnamentDefs } from "@/components/ui/Ornament";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Serifada de display, usada em títulos (capítulo, seção, nome do personagem).
 * Até 2026-08-28 o site inteiro renderizava em Arial: `globals.css` sobrescrevia
 * o `--font-sans` com `font-family: Arial` no `body`, então as duas Geist eram
 * baixadas em toda visita e nenhuma das duas chegava à tela — um livro de RPG
 * com a fonte padrão de um formulário.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

/** Serifada de leitura, para o corpo de texto do livro (`/livro`). */
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  display: "swap",
});

/**
 * O ícone da aba é `src/app/icon.svg`, achado por convenção do App Router — não
 * precisa (nem deve) ser declarado aqui. Ele é gerado do logo por
 * `scripts/gerar-favicon.mjs`, e o `favicon.ico` padrão do Next saiu junto:
 * com os dois no lugar, cada navegador escolhia um.
 */
export const metadata: Metadata = {
  title: {
    default: "Mushoku Tensei RPG",
    template: "%s · Mushoku Tensei RPG",
  },
  description: "Ficha de personagem, árvores de habilidade e o livro de regras do sistema.",
  applicationName: "Mushoku Tensei RPG",
  /*
   * O que o iOS lê pra instalar na tela inicial (0.1.15).
   *
   * O Safari ignora metade do `manifest.webmanifest` — inclusive o `name` e o
   * `display` — e continua lendo estas metas antigas da Apple. Sem
   * `appleWebApp`, "Adicionar à Tela de Início" no iPhone gera um atalho que
   * abre o Safari com barra de endereço e tudo, ou seja, nada.
   */
  appleWebApp: {
    capable: true,
    title: "MT RPG",
    statusBarStyle: "black-translucent",
  },
};

/**
 * A cor da barra do sistema, nos dois temas (0.1.15).
 *
 * O `manifest.ts` só aceita UMA `theme_color`, e o site tem dois temas. Estas
 * duas metas cobrem o outro caso: no app instalado em tema escuro, uma barra
 * cor de pergaminho ficaria colada no topo de uma página quase preta.
 *
 * Elas seguem o `prefers-color-scheme` do sistema, e não a classe `.dark` que o
 * botão de tema controla — meta tag não reage a classe. Quem inverte o tema
 * manualmente fica com a barra do sistema no outro tom; é o limite da
 * plataforma, e é uma faixa de 4mm no topo.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf6e3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1210" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${literata.variable} h-full antialiased`}
    >
      <head>
        {/*
          O tamanho de letra escolhido tem que valer ANTES da primeira pintura,
          senão a página nasce no padrão e salta — o mesmo flash que o
          `next-themes` evita com a mesma técnica. `dangerouslySetInnerHTML` é
          a forma de emitir um script síncrono aqui; o conteúdo é uma constante
          do próprio código, sem nada vindo de fora.
        */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TAMANHO_INICIAL }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <StoreHydration />
          {/*
            As definições de filtro SVG do ornamento vivem no layout, e não no
            componente: um `<filter id>` é global por documento, e repetir o
            mesmo id uma vez por divisor de seção (o Cap. 1 do livro tem
            dezenas) seria dezenas de ids duplicados no HTML.
          */}
          <OrnamentDefs />
          <Nav />
          {/* Abaixo do menu, no fluxo: a faixa empurra a página em vez de cobrir
              os botões flutuantes. Ver SuporteOffline.tsx. */}
          <SuporteOffline />
          {/* `flex-1` é o que gruda o rodapé no fim da janela em página curta.
              Antes daqui cada rota carregava um `min-h-screen` próprio pra
              simular isso — e com um rodapé de verdade no fim, esse
              `min-h-screen` viraria uma tela inteira de pergaminho vazio entre
              o conteúdo e o rodapé em TODAS as páginas. */}
          <main className="flex-1">{children}</main>
          <Footer />
          {/*
            O rolador de dados vive AQUI desde a 0.1.22, e não mais dentro da
            ficha.

            Ele nasceu como parte do `CharacterSheet`, o que fazia sentido
            enquanto rolar dado era uma coisa que se faz olhando a ficha. Não é:
            no meio do combate a pessoa está no tracker de iniciativa vendo de
            quem é o turno, ou em `/encontros` com a criatura aberta — e era
            exatamente aí que ela tinha que sair da tela pra rolar um d20.

            Ele já era global em tudo menos na montagem: o estado mora no
            `useDiceRollerStore`, os macros no `useMacroStore`, e o personagem
            vem do `useActiveCharacter` (que devolve uma ficha em branco quando
            não há nenhuma ativa, então nenhuma rota precisa de contexto de
            personagem pra montá-lo).
          */}
          <DiceRoller />
        </ThemeProvider>
      </body>
    </html>
  );
}
