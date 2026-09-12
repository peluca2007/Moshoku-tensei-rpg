/**
 * A DIETA DA PASTA public/ — 0.1.72.
 *
 * ## O problema
 *
 * A arte do livro chegou a **115 MB**, com um único GIF de 18 MB. Num projeto
 * onde "mobile-first é inegociável" e o `/livro` tem que abrir offline numa
 * mesa, isso não é detalhe de build: é o livro não abrir no 4G de quem chegou
 * atrasado na sessão.
 *
 * ## O que ele faz
 *
 * Converte GIF e WebP grandes em **WebP animado**, descendo uma escada de
 * largura e qualidade até o arquivo caber no alvo. A escada existe porque o
 * mesmo par (largura, qualidade) que resolve um GIF de 30 quadros não resolve
 * um de 330 — e derrubar a qualidade de todos ao nível do pior seria pagar pelo
 * pior em cima dos outros oitenta.
 *
 * A moldura da arte no livro mostra 256px de altura numa coluna de ~700px, e o
 * primeiro degrau já é maior que isso. Nada aqui é reduzido abaixo do que a
 * página realmente exibe.
 *
 * ## O que ele NÃO faz
 *
 * Não toca em `.webm` (sharp não decodifica vídeo), nem no cromo do site, nem em
 * arquivo que já esteja abaixo do alvo. E não apaga nada: o GIF original é
 * removido só depois que o WebP existe em disco, e o histórico do git guarda a
 * versão anterior de qualquer jeito.
 *
 * Uso: `node scripts/comprimir-midia.mjs [--alvo 900] [--seco]`
 *   --alvo N   tamanho desejado em KB (padrão 900)
 *   --seco     só relata, não escreve
 */

import { readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { listarArte, PASTA_DA_ARTE } from "./lib/arte.mjs";

const CONVERSIVEIS = /\.(gif|webp|png|jpe?g)$/i;

const arg = (nome, padrao) =>
  process.argv.includes(nome) ? process.argv[process.argv.indexOf(nome) + 1] : padrao;
const ALVO = Number(arg("--alvo", 900)) * 1024;
const SECO = process.argv.includes("--seco");

/*
 * A escada. Cada degrau é (largura máxima, qualidade).
 *
 * Começa larga e boa; só desce quando o degrau anterior não coube no alvo. O
 * último degrau é o piso: abaixo dele a arte fica visivelmente pior que a
 * moldura que a exibe, e é melhor entregar um arquivo grande do que um borrão.
 */
const ESCADA = [
  [720, 72],
  [640, 62],
  [540, 55],
  [460, 48],
  [400, 42],
];

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;

let antesTotal = 0;
let depoisTotal = 0;
const teimosos = [];

const arquivos = listarArte().filter((f) => CONVERSIVEIS.test(f));

for (const arquivo of arquivos) {
  const origem = path.join(PASTA_DA_ARTE, arquivo);
  const antes = statSync(origem).size;
  antesTotal += antes;

  // Já cabe: não reprocessa. Reencodar por reencodar só perde qualidade.
  if (antes <= ALVO) {
    depoisTotal += antes;
    continue;
  }

  /*
   * Lê pra Buffer antes de entregar ao sharp — Windows, 0.1.72.
   *
   * Com um caminho, o libvips mantém o arquivo ABERTO enquanto o pipeline
   * viver, e no Windows não se renomeia nem se apaga arquivo aberto: o
   * `renameSync` do primeiro arquivo morria com EPERM. Com Buffer não há
   * handle nenhum, e a pasta fica livre pra ser reescrita. (Pasta sincronizada
   * pelo OneDrive piora: ele também segura o arquivo enquanto sobe.)
   */
  const bruto = readFileSync(origem);

  let meta;
  try {
    meta = await sharp(bruto, { animated: true }).metadata();
  } catch (e) {
    console.error(`⚠️  ${arquivo}: ${e.message}`);
    depoisTotal += antes;
    continue;
  }

  let melhor = null;
  for (const [largura, qualidade] of ESCADA) {
    const buf = await sharp(bruto, { animated: true })
      .resize({ width: Math.min(meta.width ?? largura, largura), withoutEnlargement: true })
      .webp({ quality: qualidade, effort: 4 })
      .toBuffer();
    melhor = { buf, largura, qualidade };
    if (buf.length <= ALVO) break;
  }

  /*
   * Desistir cedo — 0.1.74.
   *
   * Reencodar pode ENGORDAR um webp já bem comprimido, e o teste original era
   * só esse: "ficou maior, desiste". Faltava o caso do meio, que é pior porque
   * passa por vitória: um arquivo de 330 quadros desce a escada inteira até o
   * último degrau (400px, q42), fica 5% menor e é GRAVADO — perde-se resolução
   * e qualidade num arquivo que continua sem caber no alvo. Abaixo de um quinto
   * de ganho, o que se paga é sempre maior do que o que se leva.
   */
  const ganho = 1 - melhor.buf.length / antes;
  if (ganho < 0.2) {
    console.log(`=  ${arquivo}: ${kb(antes)} já está no melhor que dá (só ${(ganho * 100).toFixed(0)}% de ganho)`);
    depoisTotal += antes;
    continue;
  }

  const destino = path.join(
    PASTA_DA_ARTE,
    path.dirname(arquivo),
    `${path.basename(arquivo, path.extname(arquivo))}.webp`
  );
  const marca = melhor.buf.length <= ALVO ? "✅" : "⚠️ ";
  const pct = (100 - (melhor.buf.length / antes) * 100).toFixed(0);
  console.log(
    `${marca} ${arquivo}: ${mb(antes)} → ${kb(melhor.buf.length)} ` +
      `(${pct}% menor · ${melhor.largura}px q${melhor.qualidade}` +
      `${meta.pages > 1 ? ` · ${meta.pages} quadros` : ""})`
  );
  if (melhor.buf.length > ALVO) teimosos.push(`${arquivo} → ${kb(melhor.buf.length)}`);

  depoisTotal += melhor.buf.length;

  if (!SECO) {
    // Escreve o novo ANTES de apagar o velho: se o disco encher no meio, a
    // pasta fica com dois arquivos, e não com nenhum.
    if (origem === destino) {
      const tmp = `${destino}.novo`;
      writeFileSync(tmp, melhor.buf);
      renameSync(tmp, destino);
    } else {
      writeFileSync(destino, melhor.buf);
      unlinkSync(origem);
    }
  }
}

console.log(
  `\n📦 ${mb(antesTotal)} → ${mb(depoisTotal)} ` +
    `(${(100 - (depoisTotal / antesTotal) * 100).toFixed(0)}% menor)${SECO ? "  [seco: nada escrito]" : ""}`
);
if (teimosos.length > 0) {
  console.log(`\n⚠️  ${teimosos.length} não couberam no alvo nem no último degrau:`);
  for (const t of teimosos) console.log(`   ${t}`);
  console.log("   São arquivos de muitos quadros. Vale trocar por uma versão mais curta.");
}
if (!SECO) {
  console.log("\n⚠️  Extensões mudaram: rode `npm run casar:midia` e corrija os `src` do mapa.");
}
