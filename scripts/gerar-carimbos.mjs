// OS CARIMBOS DAS 19 ÁRVORES (2026-10-07).
//
// Gera `public/livro/carimbos.svg`: um sprite com um <symbol id="carimbo-<árvore>">
// por árvore — o selo de `identidadeDasArvores.ts` (火, 水, 剣…) escrito a pincel
// dentro da moldura de um hanko. O livro e o site usam com
// <use href="/livro/carimbos.svg#carimbo-fogo"/>, pintado com `currentColor`.
//
// Por que um desenho, e não a fonte: o kanji em texto usa a fonte do aparelho
// e muda de cara entre iPhone, Android e Windows. Aqui o pincel é o mesmo em
// todo lugar, e o site não carrega fonte nenhuma (o sprite inteiro tem ~40 KB).
//
// A forma da moldura diz o pilar, como os selos de verdade: Magia é redondo,
// Corpo é quadrado, Utilidade é o selo comprido de assinatura. A borda é
// irregular (pedra cortada à mão), com falhas de tinta, e é a mesma a cada
// geração (semente por árvore).
//
// Fonte: Yuji Syuku (SIL Open Font License 1.1, © The Yuji Project Authors),
// baixada do Google Fonts só com os 19 kanjis — ela não vai pro repositório:
//   https://fonts.googleapis.com/css2?family=Yuji+Syuku&text=火水風土癒解式召剣流北闘盾嵐拳弓影詩導
// (a URL do .ttf está no CSS que essa página devolve).
//
// Uso (opentype.js fora do projeto, pra não virar dependência):
//   OPENTYPE=<pasta>/node_modules/opentype.js/dist/opentype.module.js \
//     node scripts/gerar-carimbos.mjs <yuji-syuku.ttf>

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fonte = process.argv[2];
if (!fonte || !process.env.OPENTYPE) {
  console.error("Uso: OPENTYPE=<opentype.module.js> node scripts/gerar-carimbos.mjs <fonte.ttf>");
  process.exit(1);
}
const opentype = await import(pathToFileURL(process.env.OPENTYPE).href);
const buf = readFileSync(fonte);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// As árvores, o selo e o pilar: lidos dos dados, não copiados à mão.
const identidade = readFileSync(path.join(RAIZ, "src", "data", "identidadeDasArvores.ts"), "utf8");
const selos = [...identidade.matchAll(/"?([a-z-]+)"?: identidade\("#[0-9a-f]{6}", "[^"]+", "(.)"\)/g)].map((m) => ({ id: m[1], selo: m[2] }));
const pilar = {};
for (const arquivo of ["agua", "fogo", "vento", "terra", "cura", "desintoxicacao", "teorica", "invocacao", "espada", "suishin", "norte", "lutador", "escudos", "arquearia", "ladino", "bardo", "tatico", "vendaval", "punho_fogo"]) {
  const t = readFileSync(path.join(RAIZ, "src", "data", "trees", `${arquivo}.ts`), "utf8");
  const id = t.match(/\n  id: "([^"]+)"/)?.[1];
  const cat = t.match(/\n  category: "([^"]+)"/)?.[1];
  if (id && cat) pilar[id] = cat;
}

function semente(texto) {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n = (v) => Math.round(v * 10) / 10;

// As três formas, como função do ângulo (superelipse = quadrado de cantos vivos-macios).
const superelipse = (expoente, rx, ry) => (a, s) => {
  const c = Math.cos(a), si = Math.sin(a);
  const x = Math.sign(c) * Math.abs(c) ** (2 / expoente);
  const y = Math.sign(si) * Math.abs(si) ** (2 / expoente);
  return [50 + x * rx * s, 50 + y * ry * s];
};
const FORMAS = {
  magia: superelipse(2, 46, 46),
  corpo: superelipse(7, 45, 45),
  utilidade: superelipse(5, 36, 47),
};

/** Comandos de caminho em coordenadas RELATIVAS e inteiras: é o que deixa o sprite leve. */
function relativo(comandos) {
  let x = 0, y = 0, x0 = 0, y0 = 0;
  const r = Math.round;
  return comandos
    .map((c) => {
      let s;
      if (c.type === "M") { s = `m${r(c.x - x)} ${r(c.y - y)}`; x0 = c.x; y0 = c.y; }
      else if (c.type === "L") s = `l${r(c.x - x)} ${r(c.y - y)}`;
      else if (c.type === "Q") s = `q${r(c.x1 - x)} ${r(c.y1 - y)} ${r(c.x - x)} ${r(c.y - y)}`;
      else if (c.type === "C") s = `c${r(c.x1 - x)} ${r(c.y1 - y)} ${r(c.x2 - x)} ${r(c.y2 - y)} ${r(c.x - x)} ${r(c.y - y)}`;
      else { x = x0; y = y0; return "z"; }
      x = r(c.x); y = r(c.y);
      return s;
    })
    .join("")
    .replace(/ -/g, "-");
}

/** A moldura: um contorno tremido, em pontos inteiros de um espaço 0–1000. */
function moldura(forma, rnd) {
  const passos = 40;
  const pts = Array.from({ length: passos }, (_, i) => {
    const [x, y] = forma((i / passos) * Math.PI * 2, 1);
    const j = 1 + (rnd() - 0.5) * 0.045;
    return { type: i ? "L" : "M", x: (50 + (x - 50) * j) * 10, y: (50 + (y - 50) * j) * 10 };
  });
  return relativo([...pts, { type: "Z" }]);
}

function carimbo({ id, selo }) {
  const rnd = semente(id);
  const forma = FORMAS[pilar[id]] ?? FORMAS.magia;
  // Falhas de tinta: o traço da moldura se interrompe em pontos irregulares.
  const tracos = Array.from({ length: 4 }, () => `${380 + Math.round(rnd() * 700)} ${10 + Math.round(rnd() * 22)}`).join(" ");

  const glifo = font.charToGlyph(selo);
  if (!glifo || glifo.index === 0) throw new Error(`O kanji ${selo} (${id}) não está na fonte.`);
  const upm = font.unitsPerEm;
  const caminho = glifo.getPath(0, 0, upm);
  const caixa = caminho.getBoundingBox();
  const larguraMax = pilar[id] === "utilidade" ? 50 : 58;
  const escala = Math.min(larguraMax / (caixa.x2 - caixa.x1), 60 / (caixa.y2 - caixa.y1));
  const cx = (caixa.x1 + caixa.x2) / 2, cy = (caixa.y1 + caixa.y2) / 2;
  const desvio = (rnd() - 0.5) * 3;
  const tx = n(50 + desvio - cx * escala), ty = n(51 - cy * escala);

  return [
    `<symbol id="carimbo-${id}" viewBox="0 0 100 100">`,
    `<path transform="scale(.1)" d="${moldura(forma, rnd)}" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="58" stroke-dasharray="${tracos}" stroke-linejoin="round"/>`,
    `<path transform="matrix(${+escala.toFixed(5)} 0 0 ${+escala.toFixed(5)} ${tx} ${ty})" d="${relativo(caminho.commands)}" fill="currentColor"/>`,
    `</symbol>`,
  ].join("");
}

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg">` +
  `<!-- Kanji: Yuji Syuku, SIL Open Font License 1.1, (c) The Yuji Project Authors. Gerado por scripts/gerar-carimbos.mjs. -->` +
  selos.map(carimbo).join("") +
  `</svg>\n`;
const saida = path.join(RAIZ, "public", "livro", "carimbos.svg");
writeFileSync(saida, svg);
console.log(`${selos.length} carimbos · ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB → ${path.relative(RAIZ, saida)}`);
