import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Literata } from "next/font/google";
import StoreHydration from "@/components/StoreHydration";
import ThemeProvider from "@/components/ThemeProvider";
import Nav from "@/components/Nav";
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

export const metadata: Metadata = {
  title: "Mushoku Tensei RPG",
  description: "Ficha de personagem, árvores de habilidade e o livro de regras do sistema.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <StoreHydration />
          <Nav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
