/**
 * Gera o FAVICON (`src/app/icon.png`) a partir da marca nova.
 *
 * ## O que mudou em 0.1.11
 *
 * Até aqui o favicon era um SVG derivado de `public/logo.svg` — o letreiro
 * ANTIGO. Ele era o último lugar do site que ainda mostrava a marca anterior, e
 * sobrevivia por uma razão técnica: favicon precisa ler num quadrado de 16px, e
 * a marca nova é um PNG, então trocar exigia rasterizar e recortar.
 *
 * Este script faz as duas coisas, reaproveitando o decodificador de PNG que o
 * `logo-sem-fundo.mjs` já tinha:
 *
 * 1. **Recorta pelo conteúdo.** A marca ocupa só ~15% do quadro; o resto é
 *    transparente. Reduzir a imagem inteira pra 256px deixaria o letreiro do
 *    tamanho de um grão. O recorte usa a caixa real dos pixels opacos.
 * 2. **Reduz por média de área**, e não pegando um pixel a cada N: o letreiro
 *    tem traço fino, e amostragem simples come metade dele.
 * 3. **Compõe sobre `parchment-950`.** A marca é creme e ouro, desenhada pra
 *    fundo escuro; numa aba clara, sem fundo próprio, ela sumiria.
 *
 * O quadrado final é o recorte CENTRADO num campo quadrado — o letreiro é
 * deitado (1,5:1), e esticá-lo pra caber deformaria a marca.
 *
 *   node scripts/gerar-favicon.mjs
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRADA = resolve(raiz, "public/logo-real-alfa.png");
const SAIDA = resolve(raiz, "src/app/icon.png");
/** O SVG que este script gerava antes da marca nova. */
const ANTIGO = resolve(raiz, "src/app/icon.svg");

const LADO = 256;
/** parchment-950 do `globals.css` — o mesmo fundo do tema escuro. */
const FUNDO = [0x1a, 0x12, 0x10];
/** Respiro entre a arte e a borda do ícone, em fração do lado. */
const MARGEM = 0.08;

const ASSINATURA = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABELA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function escreverChunk(tipo, dados) {
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length);
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([tamanho, corpo, crc]);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

function lerPng(caminho) {
  const buf = readFileSync(caminho);
  if (!buf.subarray(0, 8).equals(ASSINATURA)) throw new Error("Não é um PNG.");
  const chunks = [];
  let p = 8;
  while (p < buf.length) {
    const tamanho = buf.readUInt32BE(p);
    chunks.push({ tipo: buf.toString("ascii", p + 4, p + 8), dados: buf.subarray(p + 8, p + 8 + tamanho) });
    p += 12 + tamanho;
  }
  const ihdr = chunks.find((c) => c.tipo === "IHDR");
  const largura = ihdr.dados.readUInt32BE(0);
  const altura = ihdr.dados.readUInt32BE(4);
  if (ihdr.dados[8] !== 8 || ihdr.dados[9] !== 6) throw new Error("Esperava RGBA de 8 bits.");

  const dados = inflateSync(Buffer.concat(chunks.filter((c) => c.tipo === "IDAT").map((c) => c.dados)));
  const bpp = 4;
  const bytesPorLinha = largura * bpp;
  const pixels = Buffer.alloc(bytesPorLinha * altura);
  let q = 0;
  for (let y = 0; y < altura; y++) {
    const filtro = dados[q++];
    const linha = dados.subarray(q, q + bytesPorLinha);
    q += bytesPorLinha;
    const destino = pixels.subarray(y * bytesPorLinha, (y + 1) * bytesPorLinha);
    const anterior = y > 0 ? pixels.subarray((y - 1) * bytesPorLinha, y * bytesPorLinha) : null;
    for (let i = 0; i < bytesPorLinha; i++) {
      const a = i >= bpp ? destino[i - bpp] : 0;
      const b = anterior ? anterior[i] : 0;
      const c = anterior && i >= bpp ? anterior[i - bpp] : 0;
      let v = linha[i];
      if (filtro === 1) v += a;
      else if (filtro === 2) v += b;
      else if (filtro === 3) v += (a + b) >> 1;
      else if (filtro === 4) v += paeth(a, b, c);
      else if (filtro !== 0) throw new Error(`Filtro PNG desconhecido: ${filtro}`);
      destino[i] = v & 0xff;
    }
  }
  return { largura, altura, pixels };
}

const { largura, altura, pixels } = lerPng(ENTRADA);

// 1. A caixa do que é visível. Sem isso, 85% do ícone seria vazio.
let x0 = largura;
let y0 = altura;
let x1 = -1;
let y1 = -1;
for (let y = 0; y < altura; y++) {
  for (let x = 0; x < largura; x++) {
    if (pixels[(y * largura + x) * 4 + 3] > 24) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
}
if (x1 < 0) throw new Error("A marca está inteira transparente — nada pra recortar.");

// 2. O campo quadrado que contém a caixa, centrado nela: o letreiro é deitado, e
//    esticar pra caber deformaria a marca.
const larguraCaixa = x1 - x0 + 1;
const alturaCaixa = y1 - y0 + 1;
const lado = Math.max(larguraCaixa, alturaCaixa) / (1 - MARGEM * 2);
const centroX = (x0 + x1) / 2;
const centroY = (y0 + y1) / 2;
const origemX = centroX - lado / 2;
const origemY = centroY - lado / 2;

// 3. Redução por média de área, composta sobre o fundo escuro.
const saida = Buffer.alloc(LADO * LADO * 3);
const passo = lado / LADO;
for (let sy = 0; sy < LADO; sy++) {
  for (let sx = 0; sx < LADO; sx++) {
    let somaR = 0;
    let somaG = 0;
    let somaB = 0;
    let somaA = 0;
    let n = 0;
    const iniX = Math.floor(origemX + sx * passo);
    const fimX = Math.max(iniX + 1, Math.floor(origemX + (sx + 1) * passo));
    const iniY = Math.floor(origemY + sy * passo);
    const fimY = Math.max(iniY + 1, Math.floor(origemY + (sy + 1) * passo));
    for (let y = iniY; y < fimY; y++) {
      for (let x = iniX; x < fimX; x++) {
        n++;
        if (x < 0 || y < 0 || x >= largura || y >= altura) continue; // fora da arte = fundo
        const i = (y * largura + x) * 4;
        const a = pixels[i + 3] / 255;
        somaR += pixels[i] * a;
        somaG += pixels[i + 1] * a;
        somaB += pixels[i + 2] * a;
        somaA += a;
      }
    }
    if (n === 0) n = 1;
    // Média já premultiplicada: compor sobre o fundo é somar o que faltou de alfa.
    const cobertura = somaA / n;
    const j = (sy * LADO + sx) * 3;
    saida[j] = Math.round(somaR / n + FUNDO[0] * (1 - cobertura));
    saida[j + 1] = Math.round(somaG / n + FUNDO[1] * (1 - cobertura));
    saida[j + 2] = Math.round(somaB / n + FUNDO[2] * (1 - cobertura));
  }
}

const bytesPorLinha = LADO * 3;
const cru = Buffer.alloc((bytesPorLinha + 1) * LADO);
for (let y = 0; y < LADO; y++) {
  cru[y * (bytesPorLinha + 1)] = 0;
  saida.copy(cru, y * (bytesPorLinha + 1) + 1, y * bytesPorLinha, (y + 1) * bytesPorLinha);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(LADO, 0);
ihdr.writeUInt32BE(LADO, 4);
ihdr[8] = 8;
ihdr[9] = 2; // truecolor sem alfa: o fundo já está composto
writeFileSync(
  SAIDA,
  Buffer.concat([
    ASSINATURA,
    escreverChunk("IHDR", ihdr),
    escreverChunk("IDAT", deflateSync(cru, { level: 9 })),
    escreverChunk("IEND", Buffer.alloc(0)),
  ])
);

// O App Router aceita `icon.svg` E `icon.png`; com os dois presentes, cada
// navegador escolhe um e a aba fica mostrando marcas diferentes por máquina.
if (existsSync(ANTIGO)) {
  rmSync(ANTIGO);
  console.log("Removido o favicon antigo (src/app/icon.svg) — dois ícones fazem cada navegador escolher um.");
}

console.log(`✅ ${SAIDA}`);
console.log(`   ${LADO}×${LADO}, recortado da caixa ${larguraCaixa}×${alturaCaixa} da marca.`);
