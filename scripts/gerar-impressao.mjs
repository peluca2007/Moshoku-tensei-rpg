/**
 * AS ARTES DO LIVRO PRA IMPRESSÃO — 2026-09-26.
 *
 * ## Por que existe
 *
 * O PDF não conhece WebP. Na hora de imprimir, o Chrome recodifica cada arte
 * WebP (e PNG, GIF, AVIF) sem perda, no tamanho original: a abertura do Comece
 * Aqui sozinha virava 2,6 MB dentro do PDF, e o livro inteiro passaria de
 * 300 MB. JPEG entra no PDF do jeito que está.
 *
 * Então cada arte de `public/livro/` e `public/arte/` ganha uma cópia JPEG em
 * `public/impressao/` (mesmo caminho, extensão .jpg), com 1000 px de largura no
 * máximo — o bastante pra uma página Carta — e o fundo transparente pintado
 * da cor do papel dia. O botão "Baixar PDF" do livro folheado troca as artes
 * por essas cópias antes de chamar a impressão (Folhear.tsx).
 *
 * ## Uso
 *
 *   npm run gerar:impressao        (rodar de novo sempre que entrar arte nova)
 *
 * Só refaz a cópia que ficou mais velha que a arte.
 */

import { mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAIZ = process.cwd();
const ORIGENS = ["public/livro", "public/arte"];
const DESTINO = path.join(RAIZ, "public", "impressao");
const PAPEL_DIA = "#f7f3ea";

const artes = [];
const andar = (pasta) => {
  for (const nome of readdirSync(pasta)) {
    const caminho = path.join(pasta, nome);
    if (statSync(caminho).isDirectory()) andar(caminho);
    else if (/\.(webp|png|gif|avif|jpe?g)$/i.test(nome)) artes.push(caminho);
  }
};
for (const origem of ORIGENS) andar(path.join(RAIZ, origem));

let feitas = 0;
let puladas = 0;
for (const arte of artes) {
  // public/livro/racas/anao.webp → public/impressao/livro/racas/anao.jpg
  const relativo = path.relative(path.join(RAIZ, "public"), arte).replace(/\.[^.]+$/, ".jpg");
  const saida = path.join(DESTINO, relativo);
  if (existsSync(saida) && statSync(saida).mtimeMs >= statSync(arte).mtimeMs) {
    puladas++;
    continue;
  }
  mkdirSync(path.dirname(saida), { recursive: true });
  try {
    // Arte animada: o quadro do meio, onde a cena está acontecendo.
    const meta = await sharp(arte, { pages: 1 }).metadata().catch(() => ({}));
    const quadro = (meta.pages ?? 1) > 1 ? Math.floor(meta.pages / 2) : 0;
    await sharp(arte, { page: quadro })
      .flatten({ background: PAPEL_DIA })
      .resize({ width: 1000, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(saida);
    feitas++;
  } catch (erro) {
    console.warn(`  não deu: ${path.relative(RAIZ, arte)} (${erro.message})`);
  }
}
console.log(`🖨️  ${feitas} cópias pra impressão feitas, ${puladas} já estavam em dia (public/impressao/).`);
