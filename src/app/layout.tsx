import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import StoreHydration from "@/components/StoreHydration";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <StoreHydration />
          <nav className="flex items-center gap-4 border-b border-parchment-300 bg-parchment-50 px-4 py-2 text-sm font-medium text-parchment-600 dark:border-parchment-800 dark:bg-parchment-950 dark:text-parchment-300">
            <Link href="/" className="hover:text-wine-600 dark:hover:text-wine-400">
              Ficha
            </Link>
            <Link href="/arvores" className="hover:text-wine-600 dark:hover:text-wine-400">
              Árvores
            </Link>
            <Link href="/personagens" className="hover:text-wine-600 dark:hover:text-wine-400">
              Personagens
            </Link>
            <Link href="/iniciativa" className="hover:text-wine-600 dark:hover:text-wine-400">
              Iniciativa
            </Link>
            <Link href="/livro" className="hover:text-wine-600 dark:hover:text-wine-400">
              Livro de Regras
            </Link>
            <span className="ml-auto">
              <ThemeToggle />
            </span>
          </nav>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
