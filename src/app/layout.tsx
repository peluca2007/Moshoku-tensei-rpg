import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
          <Nav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
