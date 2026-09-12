/**
 * A FOLHA DE CONTATO DA ARTE — 0.1.70.
 *
 * ## Por que este script existe
 *
 * Eu mapeei `300.webp` como "a falange de escudos do filme 300" sem nunca ter
 * aberto o arquivo. É uma lâmina azul de água. O nome de um arquivo é a
 * lembrança de quem o baixou, não a descrição da cena — e deduzir do nome foi
 * um erro que só apareceu quando alguém leu o livro e estranhou.
 *
 * Pior: `.webp` e `.gif` daqui são quase todos ANIMADOS, e o primeiro quadro
 * costuma ser a transição — fundo branco, borrão, a tela antes do golpe. Abrir
 * o arquivo e olhar o primeiro quadro engana quase tanto quanto ler o nome.
 *
 * Este script extrai o quadro do MEIO de cada arquivo (onde a cena está
 * acontecendo) e monta folhas de contato numeradas, pra conferir dezenas de
 * arquivos de uma vez em vez de um a um.
 *
 * Uso: `node scripts/folha-de-contato.mjs [--por-folha 16]`
 * Saída: `.telas/contato-N.png` + a legenda numerada no terminal.
 */

import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.join(process.cwd(), "public");
const SAIDA = path.join(process.cwd(), ".telas");
// `.webm` e `.mp4` ficam de fora: sharp não decodifica vídeo, e sem ffmpeg no
// ambiente não há de onde tirar um quadro. São poucos, e vão no olho.
const LEGIVEIS = /\.(webp|gif|png|jpe?g|avif)$/i;
const IGNORAR = new Set([
  "icone-192.png",
  "icone-512.png",
  "icone-mascarado-512.png",
  "logo-real-alfa.png",
  "paisagem.jpg",
]);

const COLUNAS = 4;
const CEL_W = 300;
const CEL_H = 190;
const ROTULO_H = 26;
const porFolha = Number(process.argv.includes("--por-folha")
  ? process.argv[process.argv.indexOf("--por-folha") + 1]
  : 16);

mkdirSync(SAIDA, { recursive: true });

const arquivos = readdirSync(PUBLIC)
  .filter((f) => LEGIVEIS.test(f) && !IGNORAR.has(f))
  .sort();

/** O quadro do meio, redimensionado pra caber na célula. */
async function quadroDoMeio(arquivo) {
  const caminho = path.join(PUBLIC, arquivo);
  let pagina = 0;
  try {
    const meta = await sharp(caminho, { animated: true }).metadata();
    // `pages` só existe em arquivo animado. O quadro do meio é onde a cena
    // está acontecendo; o primeiro é quase sempre a transição de entrada.
    if (meta.pages && meta.pages > 1) pagina = Math.floor(meta.pages / 2);
  } catch {
    /* metadata falhou: tenta a página 0 mesmo assim. */
  }
  return sharp(caminho, { page: pagina })
    .resize(CEL_W, CEL_H, { fit: "contain", background: { r: 18, g: 16, b: 14 } })
    .toFormat("png")
    .toBuffer();
}

/** O nome do arquivo desenhado como faixa, via SVG — sharp não escreve texto. */
function rotulo(texto, numero) {
  const seguro = texto.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  return Buffer.from(
    `<svg width="${CEL_W}" height="${ROTULO_H}" xmlns="http://www.w3.org/2000/svg">
       <rect width="100%" height="100%" fill="#1d1a16"/>
       <text x="6" y="18" font-family="monospace" font-size="13" fill="#e9c46a">${numero}.</text>
       <text x="30" y="18" font-family="monospace" font-size="13" fill="#f2e9d8">${seguro}</text>
     </svg>`
  );
}

let n = 0;
for (let inicio = 0; inicio < arquivos.length; inicio += porFolha) {
  const lote = arquivos.slice(inicio, inicio + porFolha);
  const linhas = Math.ceil(lote.length / COLUNAS);
  const largura = COLUNAS * CEL_W;
  const altura = linhas * (CEL_H + ROTULO_H);

  const camadas = [];
  for (const [i, arquivo] of lote.entries()) {
    const col = i % COLUNAS;
    const lin = Math.floor(i / COLUNAS);
    const x = col * CEL_W;
    const y = lin * (CEL_H + ROTULO_H);
    const numero = inicio + i + 1;
    try {
      camadas.push({ input: await quadroDoMeio(arquivo), left: x, top: y });
    } catch (e) {
      console.error(`  ⚠️ ${arquivo}: ${e.message}`);
    }
    camadas.push({ input: rotulo(arquivo, numero), left: x, top: y + CEL_H });
    console.log(`${String(numero).padStart(3)}. ${arquivo}`);
  }

  const folha = await sharp({
    create: { width: largura, height: altura, channels: 3, background: { r: 18, g: 16, b: 14 } },
  })
    .composite(camadas)
    .png()
    .toBuffer();

  n += 1;
  const destino = path.join(SAIDA, `contato-${n}.png`);
  writeFileSync(destino, folha);
  console.log(`\n📷 ${destino}  (${lote.length} artes)\n`);
}
