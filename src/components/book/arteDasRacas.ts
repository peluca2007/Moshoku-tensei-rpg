import { existsSync } from "node:fs";
import path from "node:path";

/**
 * A ilustração de cada raça no livro (2026-09-25).
 *
 * O autor vai trazendo as artes aos poucos. Pra ninguém precisar mexer em
 * código quando uma chega, o livro procura o arquivo pelo nome: basta salvar
 * `public/livro/racas/<id da raça>.webp` (ou .jpg, .png, .avif) e a página
 * da raça passa a mostrar a arte no lugar do quadro reservado. A lista dos
 * nomes está em `ARTE-PARA-O-LIVRO.md`.
 *
 * Roda só no servidor, na hora de montar o livro (no build de produção, ou a
 * cada recarga no `npm run dev`).
 */
const EXTENSOES = ["webp", "avif", "jpg", "jpeg", "png"];

export const PASTA_DA_ARTE_DAS_RACAS = "/livro/racas";

export function arteDaRaca(id: string): string | null {
  for (const ext of EXTENSOES) {
    const arquivo = `${PASTA_DA_ARTE_DAS_RACAS}/${id}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", arquivo))) return arquivo;
  }
  return null;
}
