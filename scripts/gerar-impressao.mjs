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
/** Desvio-padrão do cinza de um quadro: perto de zero é chapado (branco, preto ou borrão). */
async function contraste(arte, pagina) {
  const { channels } = await sharp(arte, { page: pagina }).greyscale().stats();
  return channels[0].stdev;
}

/**
 * O quadro que vai pro papel. O do meio, se ele tem desenho; senão, o de mais
 * contraste entre ~24 amostras — desde que seja bem mais rico (1,5×), pra não
 * trocar à toa uma arte que é suave do começo ao fim.
 */
async function quadroDaImpressao(arte, paginas) {
  const meio = Math.floor(paginas / 2);
  const doMeio = await contraste(arte, meio);
  if (doMeio >= 35) return meio;
  let melhor = meio;
  let maior = doMeio;
  for (let p = 0; p < paginas; p += Math.max(1, Math.floor(paginas / 24))) {
    const c = await contraste(arte, p);
    if (c > maior) { maior = c; melhor = p; }
  }
  return maior >= doMeio * 1.5 ? melhor : meio;
}

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
    // Arte animada: o quadro do meio, onde a cena costuma estar acontecendo —
    // a não ser que ele seja chapado (o Clarão abre e passa metade do tempo em
    // branco; o Empurrão, num borrão). Aí vale o quadro de mais contraste.
    const meta = await sharp(arte, { pages: 1 }).metadata().catch(() => ({}));
    const quadro = (meta.pages ?? 1) > 1 ? await quadroDaImpressao(arte, meta.pages) : 0;
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
