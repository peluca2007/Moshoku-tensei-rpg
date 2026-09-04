/**
 * Gera o FAVICON (`src/app/icon.png`) a partir do brasão em `assets-fonte/`.
 *
 * ## O brasão (0.1.12)
 *
 * O ícone era o letreiro inteiro reduzido, e o `O-QUE-FALTA.md` registrava a
 * ressalva: em 16px cinco letras viram mancha, e legibilidade ali pede um
 * SÍMBOLO. O símbolo chegou pronto — o brasão dourado de asas e olho — e é ele
 * que este script rasteriza.
 *
 * O que o script faz, nesta ordem:
 *
 * 1. **Apaga o xadrez de transparência.** A arte chegou como JPEG, e JPEG não
 *    tem canal alfa: o quadriculado do editor de imagem veio QUEIMADO nos
 *    pixels, como duas cores cinza de verdade. Sem este passo o favicon sai com
 *    o quadriculado em volta do brasão. Ver `ehXadrez` mais abaixo.
 * 2. **Recorta pelo conteúdo.** O brasão ocupa ~48% do quadro; o resto é fundo.
 *    Reduzir a imagem inteira deixaria o desenho pequeno demais no quadrado.
 * 3. **Reduz por média de área**, e não pegando um pixel a cada N: as asas têm
 *    traço fino, e amostragem simples come metade delas.
 * 4. **Compõe sobre `parchment-950`.** O brasão é ouro sobre nada; numa aba
 *    clara, sem fundo próprio, ele perderia o contorno.
 *
 * ## A fonte mora em `assets-fonte/`, e não em `public/`
 *
 * Mesma regra do `logo-sem-fundo.mjs`, e pelo mesmo motivo: matéria-prima de
 * build não é asset de site. Deixada em `public/`, a arte de 2752×1536 ficaria
 * servível por URL — baixável por qualquer visitante e concorrendo por engano
 * com o ícone bom.
 *
 * **Se a arte mudar:** exporte em **PNG** e substitua `assets-fonte/icon-fonte.png`.
 * PNG porque este script não tem (nem quer) uma biblioteca de imagem — ele
 * decodifica PNG com o `zlib` do próprio Node, e JPEG exigiria uma. Com ou sem
 * canal alfa, tanto faz: o xadrez queimado ele resolve sozinho, e é ele que
 * decide o que é fundo aqui.
 *
 *   node scripts/gerar-favicon.mjs
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRADA = resolve(raiz, "assets-fonte/icon-fonte.png");
const SAIDA = resolve(raiz, "src/app/icon.png");
/** O SVG que este script gerava antes da marca nova. */
const ANTIGO = resolve(raiz, "src/app/icon.svg");

const LADO = 256;

/**
 * O xadrez de transparência do editor de imagem, queimado nos pixels.
 *
 * São dois cinzas alternados (#EBEBEB e #BFBFBF). Um pixel é fundo quando as
 * duas coisas valem ao mesmo tempo: ele é CINZA (os três canais quase iguais) e
 * cai perto de um dos dois tons. As duas condições juntas são o que protege o
 * desenho — o dourado do brasão é saturado e nunca é cinza, então nenhuma parte
 * dele satisfaz a primeira.
 *
 * Arte que já venha com alfa de verdade passa por aqui sem ser tocada: pixel
 * transparente não é cinza claro, é transparente.
 */
const XADREZ_TONS = [235, 191];
/** Quanto um canal pode se afastar do tom pra ainda contar como xadrez. */
const XADREZ_TOLERANCIA = 26;
/** Diferença máxima entre o maior e o menor canal pra considerar o pixel cinza. */
const XADREZ_CINZA = 12;

function ehXadrez(r, g, b) {
  if (Math.max(r, g, b) - Math.min(r, g, b) > XADREZ_CINZA) return false;
  return XADREZ_TONS.some((tom) => Math.abs(r - tom) <= XADREZ_TOLERANCIA);
}

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
  const profundidade = ihdr.dados[8];
  const tipoDeCor = ihdr.dados[9];
  /*
   * Aceita RGBA (6) e RGB (2), e é de propósito.
   *
   * A arte-fonte deste ícone é uma imagem ACHATADA — o fundo dela é o xadrez do
   * editor, não transparência —, e qualquer editor que a exporte vai gravar RGB
   * sem canal alfa, porque não há alfa nenhum pra gravar. Exigir RGBA obrigaria
   * quem troca a arte a saber de um detalhe de formato que não muda nada aqui:
   * quem decide o que é fundo, neste script, é o `ehXadrez`, e não o canal alfa.
   *
   * O RGB é expandido pra RGBA na leitura, com alfa 255, e o resto do script
   * continua trabalhando num buffer de 4 canais só.
   */
  if (profundidade !== 8 || ![2, 3, 6].includes(tipoDeCor)) {
    throw new Error(
      `Esperava PNG de 8 bits em RGB, RGBA ou paleta (colortype 2, 3 ou 6); ` +
        `veio profundidade ${profundidade}, colortype ${tipoDeCor}.`
    );
  }

  // Paleta (colortype 3) entra na lista porque e o que um editor de imagem
  // costuma escolher sozinho pra uma arte de poucas cores — e este brasao, com
  // o xadrez atras, e exatamente isso. Recusa-la mandaria quem trocou a arte
  // pra um beco sem saida que ele nao tem ferramenta pra sair.
  const paleta = tipoDeCor === 3 ? chunks.find((c) => c.tipo === "PLTE")?.dados : null;
  const alfaDaPaleta = tipoDeCor === 3 ? chunks.find((c) => c.tipo === "tRNS")?.dados : null;
  if (tipoDeCor === 3 && !paleta) throw new Error("PNG de paleta sem chunk PLTE.");

  const canaisNoArquivo = tipoDeCor === 6 ? 4 : tipoDeCor === 2 ? 3 : 1;
  const dados = inflateSync(Buffer.concat(chunks.filter((c) => c.tipo === "IDAT").map((c) => c.dados)));
  const bpp = canaisNoArquivo;
  const bytesPorLinha = largura * bpp;
  const cru = Buffer.alloc(bytesPorLinha * altura);
  let q = 0;
  for (let y = 0; y < altura; y++) {
    const filtro = dados[q++];
    const linha = dados.subarray(q, q + bytesPorLinha);
    q += bytesPorLinha;
    const destino = cru.subarray(y * bytesPorLinha, (y + 1) * bytesPorLinha);
    const anterior = y > 0 ? cru.subarray((y - 1) * bytesPorLinha, y * bytesPorLinha) : null;
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

  if (canaisNoArquivo === 4) return { largura, altura, pixels: cru };

  const pixels = Buffer.alloc(largura * altura * 4);
  if (paleta) {
    for (let i = 0, j = 0; i < cru.length; i++, j += 4) {
      const indice = cru[i];
      pixels[j] = paleta[indice * 3];
      pixels[j + 1] = paleta[indice * 3 + 1];
      pixels[j + 2] = paleta[indice * 3 + 2];
      pixels[j + 3] = alfaDaPaleta && indice < alfaDaPaleta.length ? alfaDaPaleta[indice] : 255;
    }
    return { largura, altura, pixels };
  }
  for (let i = 0, j = 0; i < cru.length; i += 3, j += 4) {
    pixels[j] = cru[i];
    pixels[j + 1] = cru[i + 1];
    pixels[j + 2] = cru[i + 2];
    pixels[j + 3] = 255;
  }
  return { largura, altura, pixels };
}

const { largura, altura, pixels } = lerPng(ENTRADA);

// 1. Apaga o xadrez do editor, e SÓ ENTÃO mede a caixa do conteúdo. Na ordem
//    inversa a caixa seria a imagem inteira, porque o xadrez é opaco.
let apagados = 0;
for (let i = 3; i < pixels.length; i += 4) {
  if (pixels[i] > 24 && ehXadrez(pixels[i - 3], pixels[i - 2], pixels[i - 1])) {
    pixels[i] = 0;
    apagados++;
  }
}

// 2. A caixa do que sobrou visível.
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
if (x1 < 0) throw new Error("Sobrou tudo transparente — o filtro de xadrez comeu a arte inteira.");

// A arte tem que ser MAJORITARIAMENTE fundo: é um brasão com folga em volta, e
// se o recorte devolver quase o quadro inteiro, ou o xadrez não foi
// reconhecido, ou a arte trocada é outra coisa. Falhar aqui é melhor que
// publicar um favicon com moldura cinza.
const fracaoDoQuadro = ((x1 - x0 + 1) * (y1 - y0 + 1)) / (largura * altura);
if (fracaoDoQuadro > 0.9) {
  throw new Error(
    `O recorte pegou ${(fracaoDoQuadro * 100).toFixed(0)}% da imagem: o fundo não foi reconhecido. ` +
      `Se a arte nova não usa o xadrez do editor, exporte-a em PNG com alfa de verdade.`
  );
}

// 3. O campo quadrado que contém a caixa, centrado nela: esticar pra caber
//    deformaria o brasão.
const larguraCaixa = x1 - x0 + 1;
const alturaCaixa = y1 - y0 + 1;
const lado = Math.max(larguraCaixa, alturaCaixa) / (1 - MARGEM * 2);
const centroX = (x0 + x1) / 2;
const centroY = (y0 + y1) / 2;
const origemX = centroX - lado / 2;
const origemY = centroY - lado / 2;

// 4. Redução por média de área, composta sobre o fundo escuro.
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
console.log(`   ${LADO}×${LADO}, recortado da caixa ${larguraCaixa}×${alturaCaixa} do brasão.`);
console.log(`   Xadrez do editor apagado em ${((apagados / (largura * altura)) * 100).toFixed(0)}% dos pixels.`);
