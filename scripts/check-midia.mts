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
 * Só `public/arte/`. O cromo do site — ícone de PWA, logo, capa da home,
 * service worker — mora na raiz de `public/`, e é justamente por isso que a
 * separação da 0.1.74 existe: antes era preciso manter à mão uma lista de
 * exceções aqui, e uma exceção esquecida vira aviso falso.
 *
 * Uso: `npm run check:midia`
 */

import { statSync } from "node:fs";
import path from "node:path";
import { listarArte, PASTA_DA_ARTE, urlDaArte } from "./lib/arte.mjs";
import {
  ARTE_DO_DOJO,
  ARTE_DO_FIO_DA_VIDA,
  ARTE_DO_TOUKI,
  ARTE_EXPLOSAO_DE_AURA,
  ARTE_LAMINA_DE_TOUKI,
  MIDIA_DE_HABILIDADE,
} from "../src/data/midiaDeHabilidade";

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

const naPasta = listarArte();
const semUso = naPasta.filter((f) => !usados.has(urlDaArte(f)));

console.log(`🎨 ${usados.size} artes mapeadas · ${naPasta.length} arquivos em public/arte/`);

/*
 * O PESO, e não só o destino — 0.1.74.
 *
 * `evolucao-forma-imortal.gif` entrou no livro com 6,75 MB e ficou mapeado
 * assim, porque a dieta (`comprimir-midia`) tinha rodado ANTES de ele chegar.
 * Nada no caminho entre "salvei o arquivo" e "está no livro" olhava o tamanho —
 * e num livro que precisa abrir no 4G de quem chegou atrasado na sessão, um
 * arquivo assim custa mais que todos os outros da página somados.
 *
 * O aviso é preciso de propósito, pra não virar ruído que se aprende a ignorar:
 *
 * - **Acima de 900 KB e ainda em `.gif`/`.png`/`.jpg`**: nunca passou pela
 *   dieta, que converte tudo em WebP animado. É o caso que importa, e tem
 *   conserto de um comando.
 * - **Acima de 1,5 MB em qualquer formato**: já é WebP e ainda pesa isso, então
 *   é um arquivo de MUITOS quadros, onde a escada de qualidade não resolve. O
 *   conserto é trocar por uma versão mais curta, e isso é decisão de quem
 *   escolheu a arte.
 *
 * Entre esses dois está a faixa dos três ou quatro arquivos que já desceram a
 * escada inteira e pararam perto de 900 KB. Reclamar deles toda vez ensinaria a
 * pular a lista onde um dia vai estar um de 6 MB.
 */
const ALVO = 900 * 1024;
const TETO_ABSOLUTO = 1.5 * 1024 * 1024;
const JA_COMPRIMIDO = /\.(webp|webm|mp4)$/i;

const pesados = naPasta
  .map((f) => ({ f, bytes: statSync(path.join(PASTA_DA_ARTE, f)).size }))
  .filter(({ f, bytes }) => bytes > TETO_ABSOLUTO || (bytes > ALVO && !JA_COMPRIMIDO.test(f)))
  .sort((a, b) => b.bytes - a.bytes);

if (pesados.length > 0) {
  console.log(`\n⚠️  ${pesados.length} acima do peso — o livro abre no 4G da mesa:`);
  for (const { f, bytes } of pesados) {
    console.log(`   ${(bytes / 1048576).toFixed(2)} MB  ${f}`);
  }
  console.log(
    '\nRode `node scripts/comprimir-midia.mjs`. Se ele responder "já está no\n' +
      'melhor que dá", o arquivo é de muitos quadros: o conserto é trocar por uma\n' +
      "versão mais curta da mesma cena."
  );
}

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
  if (comAcento.length === 0 && pesados.length === 0) console.log("✅ Nenhuma arte parada na pasta, e nenhuma acima do peso.");
  process.exit(0);
}

console.log(`\n⚠️  ${semUso.length} sem destino no livro:`);
for (const f of semUso) console.log(`   ${f}`);
console.log(
  "\nMapeie em src/data/midiaDeHabilidade.ts — o mapa é quem decide em qual pasta\n" +
    "de árvore o arquivo vai morar. Se não for arte de habilidade e sim cromo do\n" +
    "site, o lugar dele é a raiz de public/, fora de public/arte/."
);
// Sai 0 de propósito: arte sem destino é uma LISTA DE TAREFAS, não um defeito.
// Falhar aqui travaria o commit de quem acabou de baixar uma imagem boa.
process.exit(0);
