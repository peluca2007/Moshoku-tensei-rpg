import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import StoreHydration from "@/components/StoreHydration";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreHydration />
        <nav className="flex gap-4 border-b border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <Link href="/" className="hover:text-sky-600 dark:hover:text-sky-400">
            Ficha
          </Link>
          <Link href="/arvores" className="hover:text-sky-600 dark:hover:text-sky-400">
            Árvores
          </Link>
          <Link href="/personagens" className="hover:text-sky-600 dark:hover:text-sky-400">
            Personagens
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
