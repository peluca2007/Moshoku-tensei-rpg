/**
 * Gera o FAVICON, derivado de `public/logo.svg`.
 *
 * ATENÇÃO (0.1.8): `public/logo.svg` NÃO é mais a marca do site. Desde 0.1.6 a
 * marca é `public/logo-real-alfa.png` (ver `src/components/ui/Logo.tsx`), e o
 * `logo.svg` sobrevive por uma razão só: ele é vetorial, e o favicon precisa
 * ser vetorial pra ler num quadrado de 16px. Trocar o favicon pela marca nova
 * exigiria rasterizar e recortar um PNG — trabalho de verdade, anotado no
 * PROGRESS.md e ainda não feito.
 *
 * A variante `logo-dark.svg` que este script gerava foi APAGADA em 0.1.8: com a
 * marca nova na nav, no rodapé e na landing, nenhum componente a importava mais.
 *
 * O logo veio com o letreiro em `fill="#000"` e os ornamentos em dourado. Isso
 * resolve o tema claro e some no escuro — e não dá pra consertar com CSS,
 * porque um `<img>` não herda `currentColor` e um `filter: invert` levaria o
 * dourado junto.
 *
 * O derivado é GERADO, nunca editado à mão:
 *
 * - `src/app/icon.svg` — o favicon. O logo é um letreiro deitado (600×320) e
 *   uma aba de navegador é um quadrado de 16px: sem uma moldura quadrada com
 *   fundo próprio, ele chegaria lá como três riscos ilegíveis.
 *
 * Rode depois de qualquer troca do logo:  node scripts/gerar-favicon.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origem = resolve(raiz, "public/logo.svg");
const svg = readFileSync(origem, "utf8");

/** parchment-50 e parchment-900 do `globals.css` — o mesmo par do resto do site. */
const CLARO = "#fdf6e3";
const ESCURO = "#2b1810";

/*
 * O preto do logo está em DOIS lugares, e essa foi a armadilha: a primeira
 * versão deste script trocou só o primeiro e o resultado passou em tudo que é
 * automático — arquivo válido, servido com o content-type certo, as duas
 * variantes no HTML — enquanto na tela metade do letreiro sumia no fundo
 * escuro. Só um print resolveu.
 *
 *   1. `fill="#000"` — a linha "jobless reincarnation". Um só.
 *   2. `<stop offset="1"/>` — o FIM dos quatro degradês das letras grandes.
 *      Um `<stop>` sem `stop-color` é preto por padrão em SVG, então as letras
 *      vão de dourado a preto sem que a palavra "preto" apareça no arquivo.
 */
const pretos = svg.match(/fill="#000"/g)?.length ?? 0;
const stopsPretos = svg.match(/<stop offset="1"\s*\/>/g)?.length ?? 0;
if (pretos !== 1 || stopsPretos !== 4) {
  throw new Error(
    `logo.svg deveria ter um fill="#000" (o letreiro) e quatro <stop offset="1"/> sem cor ` +
      `(o fim dos degradês); achei ${pretos} e ${stopsPretos}. O arquivo mudou de estrutura — ` +
      "confira antes de gerar os derivados."
  );
}

const NOTA = (o) =>
  `<desc>GERADO por scripts/gerar-favicon.mjs a partir de public/logo.svg — não edite à mão. ${o}</desc>\n`;

// ---------------------------------------------------------------------------
// 1. O letreiro em claro — não vira mais arquivo próprio, é só o insumo do
//    favicon abaixo.
// ---------------------------------------------------------------------------
const claro = svg
  .replace('fill="#000"', `fill="${CLARO}"`)
  // O degradê tem que ir de dourado ao CLARO, espelhando o dourado-ao-preto do
  // original. Deixar o fim preto some com "Mus", "Te" e "u" no tema escuro.
  .replaceAll('<stop offset="1"/>', `<stop stop-color="${CLARO}" offset="1"/>`);
// ---------------------------------------------------------------------------
// 2. O favicon: o mesmo letreiro claro, centrado num quadrado escuro.
// ---------------------------------------------------------------------------
const miolo = claro
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<title>[\s\S]*?<\/title>/g, "")
  .replace(/<desc>[\s\S]*?<\/desc>/g, "")
  .trim();

// O logo mede 600×320. Escala 0,8 num quadrado de 512 deixa 480×256 de arte e
// margem igual dos dois lados: (512-480)/2 = 16 e (512-256)/2 = 128.
const icone = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<title>Mushoku Tensei RPG</title>
${NOTA("Favicon: o logo sobre fundo parchment-900, pra ler nas duas cores de aba.")}<rect width="512" height="512" rx="96" fill="${ESCURO}"/>
<g transform="translate(16 128) scale(0.8)">
${miolo}
</g>
</svg>
`;
writeFileSync(resolve(raiz, "src/app/icon.svg"), icone, "utf8");

console.log("src/app/icon.svg gerado de public/logo.svg");
