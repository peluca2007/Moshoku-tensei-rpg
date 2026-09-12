/**
 * A ARTE QUE ESTÁ NA PASTA E NÃO ESTÁ NO LIVRO — 0.1.69.
 *
 * ## Por que este check existe
 *
 * O teste `src/data/midiaDeHabilidade.test.ts` fecha uma ponta: toda arte
 * CITADA existe em disco. Este script fecha a outra: todo arquivo em `public/`
 * está citado em algum lugar.
 *
 * A diferença importa porque as duas falhas são de tipos opostos. Um caminho
 * errado no mapa quebra um teste e alguém conserta hoje. Um arquivo que alguém
 * baixou, salvou em `public/` e esqueceu de mapear não quebra nada — ele
 * simplesmente nunca aparece, e a única forma de descobrir é lembrar que ele
 * existia. Já aconteceu com 44 arquivos de uma vez.
 *
 * ## O que ele NÃO reclama
 *
 * A pasta `public/` também guarda o cromo do site — ícone de PWA, logo, faixa
 * de fundo, service worker. Nada disso é arte de habilidade, e nada disso passa
 * pelo mapa. A lista `NAO_E_ARTE` isenta esses; qualquer arquivo de mídia fora
 * dela é considerado arte e precisa de destino.
 *
 * Uso: `npm run check:midia`
 */

import { readdirSync } from "node:fs";
import path from "node:path";
import {
  ARTE_DO_DOJO,
  ARTE_DO_FIO_DA_VIDA,
  ARTE_DO_TOUKI,
  ARTE_EXPLOSAO_DE_AURA,
  ARTE_LAMINA_DE_TOUKI,
  MIDIA_DE_HABILIDADE,
} from "../src/data/midiaDeHabilidade";

const PUBLIC = path.join(process.cwd(), "public");
const EXTENSOES = /\.(webp|gif|webm|mp4|png|jpe?g|avif)$/i;

/**
 * Cromo do site, e não arte de habilidade.
 *
 * Cada entrada é um arquivo que tem dono em outro lugar do código — o
 * manifesto do PWA, o `<Logo>`, a capa da home. Acrescentar aqui é dizer "este
 * não passa pelo mapa"; a alternativa é mapeá-lo.
 */
const NAO_E_ARTE = new Set([
  "icone-192.png",
  "icone-512.png",
  "icone-mascarado-512.png",
  "logo-real-alfa.png",
  "paisagem.jpg",
]);

/** As artes que ilustram uma SEÇÃO do livro, e não uma habilidade. */
const ARTES_DE_SECAO = [
  ARTE_DO_DOJO,
  ARTE_DO_TOUKI,
  ARTE_DO_FIO_DA_VIDA,
  ARTE_LAMINA_DE_TOUKI,
  ARTE_EXPLOSAO_DE_AURA,
];

const usados = new Set<string>([
  ...Object.values(MIDIA_DE_HABILIDADE).map((m) => m.src),
  ...ARTES_DE_SECAO.map((m) => m.src),
]);

const naPasta = readdirSync(PUBLIC).filter((f) => EXTENSOES.test(f) && !NAO_E_ARTE.has(f));
const semUso = naPasta.filter((f) => !usados.has(`/${f}`));

console.log(`🎨 ${usados.size} artes mapeadas · ${naPasta.length} arquivos de arte em public/`);

/*
 * O acento é avisado aqui, e não só no teste.
 *
 * O teste do mapa só vê o que já foi MAPEADO — um arquivo recém-baixado com
 * `ç` no nome passa despercebido até alguém mapeá-lo, e aí quebra um teste que
 * parecia não ter relação com a imagem. Avisar na hora em que o arquivo aparece
 * é mais barato: renomear em disco antes de escrever a linha do mapa.
 *
 * A razão do rigor: acento em caminho de URL falha CALADO em parte dos
 * servidores estáticos — o arquivo é gravado numa normalização Unicode e pedido
 * noutra, e os dois nomes não batem byte a byte.
 */
const comAcento = naPasta.filter((f) => /[^\x20-\x7E]/.test(f));
if (comAcento.length > 0) {
  console.log(`\n⚠️  ${comAcento.length} com acento ou símbolo no nome (renomeie pra ASCII):`);
  for (const f of comAcento) console.log(`   ${f}`);
}

if (semUso.length === 0) {
  if (comAcento.length === 0) console.log("✅ Nenhuma arte parada na pasta.");
  process.exit(0);
}

console.log(`\n⚠️  ${semUso.length} sem destino no livro:`);
for (const f of semUso) console.log(`   ${f}`);
console.log(
  "\nMapeie em src/data/midiaDeHabilidade.ts, ou acrescente a NAO_E_ARTE neste\n" +
    "arquivo se o arquivo for cromo do site e não arte de habilidade."
);
// Sai 0 de propósito: arte sem destino é uma LISTA DE TAREFAS, não um defeito.
// Falhar aqui travaria o commit de quem acabou de baixar uma imagem boa.
process.exit(0);
