import { existsSync } from "node:fs";
import path from "node:path";

/**
 * As ilustrações do livro que entram PELO NOME DO ARQUIVO (2026-09-25).
 *
 * O autor vai trazendo as artes aos poucos. Pra ninguém precisar mexer em
 * código quando uma chega, o livro procura o arquivo pelo id: basta salvar
 * `public/livro/<pasta>/<id>.webp` (ou .jpg, .png, .avif) e a página passa a
 * mostrar a arte. Pastas: `racas` (id da raça), `antecedentes` (id do
 * antecedente), `arvores` (id da árvore), `olhos` (id do olho demoníaco). A lista dos nomes está em
 * `ARTE-PARA-O-LIVRO.md`.
 *
 * Dois jeitos de a arte entrar:
 * - `<id>.webp` é uma CENA: preenche o quadro inteiro, recortada nas bordas.
 * - `<id>.recorte.webp` é um personagem de FUNDO TRANSPARENTE: entra inteiro,
 *   de pé sobre a trama da cor, com a sombra deslocada da cor por trás.
 *
 * Roda só no servidor, na hora de montar o livro (no build de produção, ou a
 * cada recarga no `npm run dev`).
 */
const EXTENSOES = ["webp", "avif", "png", "jpg", "jpeg"];

export type PastaDaArte = "racas" | "antecedentes" | "arvores" | "olhos";

export interface Arte {
  src: string;
  /** Personagem de fundo transparente (entra inteiro, não recortado). */
  recorte: boolean;
}

export const PASTA_DA_ARTE_DAS_RACAS = "/livro/racas";

export function arteDoLivro(pasta: PastaDaArte, id: string): Arte | null {
  for (const recorte of [true, false]) {
    for (const ext of EXTENSOES) {
      const arquivo = `/livro/${pasta}/${id}${recorte ? ".recorte" : ""}.${ext}`;
      if (existsSync(path.join(process.cwd(), "public", arquivo))) return { src: arquivo, recorte };
    }
  }
  return null;
}

export function arteDaRaca(id: string): Arte | null {
  return arteDoLivro("racas", id);
}
