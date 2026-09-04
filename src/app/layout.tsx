import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Literata } from "next/font/google";
import StoreHydration from "@/components/StoreHydration";
import ThemeProvider from "@/components/ThemeProvider";
import { SCRIPT_TAMANHO_INICIAL } from "@/components/FontSizeToggle";
import Nav from "@/components/Nav";
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
          {/* `flex-1` é o que gruda o rodapé no fim da janela em página curta.
              Antes daqui cada rota carregava um `min-h-screen` próprio pra
              simular isso — e com um rodapé de verdade no fim, esse
              `min-h-screen` viraria uma tela inteira de pergaminho vazio entre
              o conteúdo e o rodapé em TODAS as páginas. */}
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
