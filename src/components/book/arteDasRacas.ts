import { closeSync, existsSync, openSync, readSync } from "node:fs";
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

export type PastaDaArte = "racas" | "antecedentes" | "arvores" | "olhos" | "pranchas";

export interface Arte {
  src: string;
  /** Personagem de fundo transparente (entra inteiro, não recortado). */
  recorte: boolean;
  /** Tamanho do arquivo, em px (null se o formato não for lido aqui). */
  largura: number | null;
  altura: number | null;
}

/**
 * O tamanho de uma imagem, lido do cabeçalho do arquivo (PNG, JPEG, WebP),
 * sem decodificar. Síncrono de propósito: é chamado ao montar o livro, por
 * componentes de servidor que não são assíncronos.
 */
function dimensoes(arquivo: string): { largura: number; altura: number } | null {
  let fd: number | null = null;
  try {
    fd = openSync(arquivo, "r");
    const b = Buffer.alloc(64 * 1024);
    const n = readSync(fd, b, 0, b.length, 0);
    // PNG
    if (b.readUInt32BE(0) === 0x89504e47) return { largura: b.readUInt32BE(16), altura: b.readUInt32BE(20) };
    // WebP
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      const tipo = b.toString("ascii", 12, 16);
      if (tipo === "VP8X") return { largura: 1 + b.readUIntLE(24, 3), altura: 1 + b.readUIntLE(27, 3) };
      if (tipo === "VP8 ") return { largura: b.readUInt16LE(26) & 0x3fff, altura: b.readUInt16LE(28) & 0x3fff };
      if (tipo === "VP8L") {
        const v = b.readUInt32LE(21);
        return { largura: (v & 0x3fff) + 1, altura: ((v >> 14) & 0x3fff) + 1 };
      }
    }
    // JPEG: o primeiro marcador SOF traz o tamanho.
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < n) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          return { altura: b.readUInt16BE(i + 5), largura: b.readUInt16BE(i + 7) };
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== null) closeSync(fd);
  }
}

/**
 * Como a arte cabe num quadro de proporção `quadro` (largura ÷ altura) e
 * `larguraDoQuadro` px:
 * - "cheia": preenche o quadro, cortando as bordas;
 * - "inteira": entra inteira no meio, com uma cópia desfocada dela
 *   preenchendo o que sobra — pra quando cortar arrancaria a cabeça (o Orsted
 *   em pé num quadro deitado) ou ampliar deixaria a arte borrada.
 * Recorte (fundo transparente) sempre entra inteiro, sem o desfoque.
 */
export function enquadrar(arte: Arte, quadro: number, larguraDoQuadro: number): "cheia" | "inteira" {
  if (arte.recorte || !arte.largura || !arte.altura) return "cheia";
  const propria = arte.largura / arte.altura;
  const aparece = Math.min(propria, quadro) / Math.max(propria, quadro);
  const escala = Math.max(larguraDoQuadro / arte.largura, larguraDoQuadro / quadro / arte.altura);
  return aparece < 0.6 || escala > 1.5 ? "inteira" : "cheia";
}

export const PASTA_DA_ARTE_DAS_RACAS = "/livro/racas";

export function arteDoLivro(pasta: PastaDaArte, id: string): Arte | null {
  for (const recorte of [true, false]) {
    for (const ext of EXTENSOES) {
      const arquivo = `/livro/${pasta}/${id}${recorte ? ".recorte" : ""}.${ext}`;
      const disco = path.join(process.cwd(), "public", arquivo);
      if (existsSync(disco)) {
        const d = dimensoes(disco);
        return { src: arquivo, recorte, largura: d?.largura ?? null, altura: d?.altura ?? null };
      }
    }
  }
  return null;
}

export function arteDaRaca(id: string): Arte | null {
  return arteDoLivro("racas", id);
}
