/**
 * Gera os dois arquivos DERIVADOS de `public/logo.svg`.
 *
 * O logo veio com o letreiro em `fill="#000"` e os ornamentos em dourado. Isso
 * resolve o tema claro e some no escuro — e não dá pra consertar com CSS,
 * porque um `<img>` não herda `currentColor` e um `filter: invert` levaria o
 * dourado junto.
 *
 * Então existem dois derivados, e eles são GERADOS, nunca editados à mão:
 *
 * - `public/logo-dark.svg` — o mesmo logo com o letreiro em parchment-50, pro
 *   tema escuro da barra de navegação.
 * - `src/app/icon.svg` — o favicon. O logo é um letreiro deitado (600×320) e
 *   uma aba de navegador é um quadrado de 16px: sem uma moldura quadrada com
 *   fundo próprio, ele chegaria lá como três riscos ilegíveis.
 *
 * Rode depois de qualquer troca do logo:  node scripts/gerar-logo-dark.mjs
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
  `<desc>GERADO por scripts/gerar-logo-dark.mjs a partir de public/logo.svg — não edite à mão. ${o}</desc>\n`;

// ---------------------------------------------------------------------------
// 1. A variante de tema escuro: só o letreiro muda de cor.
// ---------------------------------------------------------------------------
const claro = svg
  .replace('fill="#000"', `fill="${CLARO}"`)
  // O degradê tem que ir de dourado ao CLARO, espelhando o dourado-ao-preto do
  // original. Deixar o fim preto some com "Mus", "Te" e "u" no tema escuro.
  .replaceAll('<stop offset="1"/>', `<stop stop-color="${CLARO}" offset="1"/>`);
writeFileSync(
  resolve(raiz, "public/logo-dark.svg"),
  claro.replace("<desc>", NOTA("Letreiro e fim dos degradês em parchment-50, pro tema escuro.") + "<desc>"),
  "utf8"
);

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

console.log("public/logo-dark.svg e src/app/icon.svg gerados de public/logo.svg");
