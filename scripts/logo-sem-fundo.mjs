/**
 * Transforma `assets-fonte/logo-real.png` (fundo PRETO sólido, sem canal alfa) em
 * `public/logo-real-alfa.png`, com transparência de verdade.
 *
 * Por que existe: a logo chegou como PNG colortype 2 (truecolor, sem alfa). Em
 * 0.1.6 ela foi ao ar dentro de um cartucho escuro com `mix-blend-mode: screen`,
 * que faz o preto sumir contra o fundo do cartucho — mas o cartucho continua
 * sendo um retângulo visível, e um retângulo não é o que a marca deveria ser.
 * A saída certa é o arquivo ter alfa; então este script dá alfa a ele.
 *
 * A conta é a de sempre pra arte clara sobre fundo preto:
 *
 *   alfa = max(R,G,B)      — preto puro → 0, creme/ouro → 1
 *   cor  = cor × 255/alfa  — "des-premultiplica"
 *
 * O segundo passo não é cosmético. Sem ele, um pixel de borda a 40% de opacidade
 * carrega a cor JÁ escurecida pelo fundo preto, e a logo inteira ganha um halo
 * sujo em volta de cada letra quando pousa sobre pergaminho claro. Dividindo
 * pelo alfa, a borda recupera a cor que ela teria se nunca tivesse sido composta
 * contra preto.
 *
 * A ENTRADA mora fora de `public/` de propósito: ela é matéria-prima de build,
 * não asset de site. Deixada lá, o original de 1,3 MB com fundo preto ficaria
 * servível em `/logo-real.png` — baixável por qualquer visitante, e concorrendo
 * com a versão boa por engano.
 *
 * Zero dependências: o PNG é decodificado e recodificado com o `zlib` do próprio
 * Node — o projeto não tem (nem quer) uma lib de imagem pra rodar uma vez.
 *
 *   node scripts/logo-sem-fundo.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

const ENTRADA = join(process.cwd(), "assets-fonte", "logo-real.png");
const SAIDA = join(process.cwd(), "public", "logo-real-alfa.png");

const ASSINATURA = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** CRC-32 do PNG. O `zlib.crc32` do Node é recente demais pra confiar sem plano B. */
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

function lerChunks(buf) {
  if (!buf.subarray(0, 8).equals(ASSINATURA)) throw new Error("Não é um PNG.");
  const chunks = [];
  let p = 8;
  while (p < buf.length) {
    const tamanho = buf.readUInt32BE(p);
    const tipo = buf.toString("ascii", p + 4, p + 8);
    chunks.push({ tipo, dados: buf.subarray(p + 8, p + 8 + tamanho) });
    p += 12 + tamanho;
  }
  return chunks;
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

/** Desfaz os cinco filtros por scanline e devolve os pixels crus. */
function desfiltrar(dados, largura, altura, bpp) {
  const bytesPorLinha = largura * bpp;
  const saida = Buffer.alloc(bytesPorLinha * altura);
  let p = 0;
  for (let y = 0; y < altura; y++) {
    const filtro = dados[p++];
    const linha = dados.subarray(p, p + bytesPorLinha);
    p += bytesPorLinha;
    const destino = saida.subarray(y * bytesPorLinha, (y + 1) * bytesPorLinha);
    const anterior = y > 0 ? saida.subarray((y - 1) * bytesPorLinha, y * bytesPorLinha) : null;

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
  return saida;
}

const original = readFileSync(ENTRADA);
const chunks = lerChunks(original);
const ihdr = chunks.find((c) => c.tipo === "IHDR");
if (!ihdr) throw new Error("PNG sem IHDR.");

const largura = ihdr.dados.readUInt32BE(0);
const altura = ihdr.dados.readUInt32BE(4);
const profundidade = ihdr.dados[8];
const tipoCor = ihdr.dados[9];
const entrelacado = ihdr.dados[12];

if (profundidade !== 8) throw new Error(`Esperava 8 bits por canal, veio ${profundidade}.`);
if (tipoCor !== 2) throw new Error(`Esperava truecolor sem alfa (2), veio ${tipoCor}.`);
if (entrelacado !== 0) throw new Error("PNG entrelaçado (Adam7) não é suportado aqui.");

const comprimido = Buffer.concat(chunks.filter((c) => c.tipo === "IDAT").map((c) => c.dados));
const pixels = desfiltrar(inflateSync(comprimido), largura, altura, 3);

// Abaixo deste valor de alfa o pixel é fundo, não borda: dividir a cor por um
// alfa quase nulo amplificaria o ruído de compressão do JPEG-de-origem em
// pontinhos coloridos ao redor da arte.
const PISO_ALFA = 6;

const rgba = Buffer.alloc(largura * altura * 4);
for (let i = 0, j = 0; i < pixels.length; i += 3, j += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  const alfa = Math.max(r, g, b);

  if (alfa < PISO_ALFA) continue; // deixa em 0,0,0,0

  const escala = 255 / alfa;
  rgba[j] = Math.min(255, Math.round(r * escala));
  rgba[j + 1] = Math.min(255, Math.round(g * escala));
  rgba[j + 2] = Math.min(255, Math.round(b * escala));
  rgba[j + 3] = alfa;
}

// Recodifica com filtro 0 (None) em toda linha: o ganho de um filtro melhor não
// paga a complexidade num script que roda uma vez por logo.
const bytesPorLinha = largura * 4;
const cru = Buffer.alloc((bytesPorLinha + 1) * altura);
for (let y = 0; y < altura; y++) {
  cru[y * (bytesPorLinha + 1)] = 0;
  rgba.copy(cru, y * (bytesPorLinha + 1) + 1, y * bytesPorLinha, (y + 1) * bytesPorLinha);
}

const novoIhdr = Buffer.alloc(13);
novoIhdr.writeUInt32BE(largura, 0);
novoIhdr.writeUInt32BE(altura, 4);
novoIhdr[8] = 8;
novoIhdr[9] = 6; // RGBA
novoIhdr[10] = 0;
novoIhdr[11] = 0;
novoIhdr[12] = 0;

writeFileSync(
  SAIDA,
  Buffer.concat([
    ASSINATURA,
    escreverChunk("IHDR", novoIhdr),
    escreverChunk("IDAT", deflateSync(cru, { level: 9 })),
    escreverChunk("IEND", Buffer.alloc(0)),
  ])
);

let opacos = 0;
for (let j = 3; j < rgba.length; j += 4) if (rgba[j] > 200) opacos++;
console.log(`✅ ${SAIDA}`);
console.log(`   ${largura}×${altura}, ${(rgba.length / 4).toLocaleString("pt-BR")} pixels`);
console.log(`   ${((opacos / (largura * altura)) * 100).toFixed(1)}% do quadro é letreiro opaco — o resto virou transparente.`);
