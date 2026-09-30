import type { Metadata } from "next";
import FolhearPage from "./folhear/page";

export const metadata: Metadata = {
  title: "Livro de Regras",
};

/**
 * O livro do site é o livro folheado (2026-09-27, o autor: "o livro de rolar
 * tá feio"). Antes o /livro era outra página, no pergaminho antigo, com a
 * mesma prosa noutra roupa; agora é um livro só, com os dois jeitos de ler:
 * Livro (páginas, no computador) e Contínuo (rolando, o padrão no celular).
 * O /livro/folhear continua respondendo, pros links que já existem.
 */
export default FolhearPage;
