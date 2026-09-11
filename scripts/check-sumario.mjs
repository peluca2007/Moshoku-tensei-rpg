/**
 * O sumário do /livro descreve o livro que existe? — `npm run check:sumario`
 *
 * ## Por que existe
 *
 * O sumário mora em `src/app/livro/page.tsx` e as seções moram nos componentes
 * dos capítulos. São **duas listas escritas à mão que precisam concordar**, e
 * esse é o arranjo que apodrece calado: quem escreve uma seção nova está com a
 * cabeça no conteúdo, não no índice.
 *
 * Ele acusa dois defeitos opostos:
 *
 * 1. **Âncora quebrada** — o sumário promete uma seção que não existe. Clicar
 *    não faz nada, e o leitor conclui que o site está quebrado (está).
 * 2. **Seção fora do sumário** — a seção existe e o sumário não a cita. Este é
 *    o pior dos dois, porque é invisível: o conteúdo foi escrito, revisado,
 *    commitado, e simplesmente ninguém o encontra. Num documento de 87 mil
 *    pixels de rolagem, o que não está no sumário não existe.
 *
 * A primeira execução achou **24 seções órfãs**, incluindo os quatro sistemas
 * compartilhados do Cap. 3 — o Dado de Arma, o Touki, o Tiro Perfeito e o
 * Triângulo dos Estilos — e a seção de Proficiências do Cap. 1, que tinha
 * acabado de virar um sistema inteiro.
 *
 * ## O que ele NÃO cobra
 *
 * Nem toda âncora precisa estar no sumário: um livro com 240 entradas de índice
 * não tem índice, tem outro livro. A lista `FORA_DO_SUMARIO_DE_PROPOSITO` é
 * onde mora essa decisão — e ela exige que alguém a escreva, que é o ponto.
 *
 *   npm run start          # ou dev, noutro terminal
 *   npm run check:sumario
 */
import { BASE, servidorNoAr } from "./lib/navegador.mjs";

/**
 * Âncoras que existem no documento e NÃO deveriam estar no sumário.
 *
 * São subdivisões finas — uma tabela dentro de uma seção, um quadro de exceção,
 * um exemplo — que entram como destino de link interno, mas cujo lugar no índice
 * seria ruído. Cada entrada aqui é uma decisão, não um perdão automático.
 */
const FORA_DO_SUMARIO_DE_PROPOSITO = new Set([
  "cap1-4-pericias", // a tabela de perícias, dentro de "Testes e Perícias"
  "cap1-4-como-se-ganha", // subdivisão de Proficiências, que já está listada
  "cap1-6-laplace", // as três sub-tabelas de Destino; a seção-mãe está no sumário
  "cap1-6-miko",
  "cap1-6-olho",
  "cap3-pp", // recursos citados dentro da Árvore de Utilidade
  "cap3-faixas",
  "cap3-utilidade-combate",
  "cap3-todas-magia", // os três blocos de "Todas as Sub-árvores", que está listada
  "cap3-todas-corpo",
  "cap3-todas-utilidade",
  "cap4-vigor", // regras de sobrevivência, dentro das condições do Cap. 4
  "cap4-cicatrizes",
  "cap4-trauma",
  "cap4-fome-sede",
  "cap4-clima",
]);

if (!(await servidorNoAr())) {
  console.error(`❌ Nada respondendo em ${BASE}. Suba o servidor (npm run start) e tente de novo.`);
  process.exit(1);
}

const html = await (await fetch(`${BASE}/livro`)).text();

const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const noSumario = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];

const quebradas = noSumario.filter((h) => !ids.has(h));

// Só seções de capítulo e apêndice entram na conta: o resto dos ids da página é
// infraestrutura (rótulo de campo, região de acessibilidade, âncora de React).
const orfas = [...ids].filter(
  (id) =>
    /^(cap\d|cap0|apendice)/.test(id) &&
    !noSumario.includes(id) &&
    !FORA_DO_SUMARIO_DE_PROPOSITO.has(id)
);

console.log("========================================");
console.log("SUMÁRIO × SEÇÕES — o índice descreve o livro?");
console.log("========================================");
console.log(`Entradas no sumário.................... ${noSumario.length}`);
console.log(`Ids no documento...................... ${ids.size}`);
console.log(`Fora do sumário de propósito.......... ${FORA_DO_SUMARIO_DE_PROPOSITO.size}`);

if (quebradas.length) {
  console.log(`\n❌ ÂNCORAS QUEBRADAS (${quebradas.length}) — o sumário promete o que não existe:`);
  for (const a of quebradas) console.log(`   · #${a}`);
}

if (orfas.length) {
  console.log(`\n❌ SEÇÕES FORA DO SUMÁRIO (${orfas.length}) — existem e ninguém as encontra:`);
  for (const a of orfas) console.log(`   · #${a}`);
  console.log(
    "\n   Ou entram no TOC de src/app/livro/page.tsx, ou entram na lista\n" +
      "   FORA_DO_SUMARIO_DE_PROPOSITO deste script, com o motivo."
  );
}

console.log("========================================");
if (quebradas.length || orfas.length) {
  console.log(`\n❌ ${quebradas.length + orfas.length} divergência(s) entre o sumário e o livro.`);
  process.exit(1);
}
console.log("\n✅ Toda seção do livro está no sumário, e todo item do sumário existe.");
