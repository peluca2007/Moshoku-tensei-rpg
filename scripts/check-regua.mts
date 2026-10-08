/**
 * A RÉGUA MEDIDA ESTÁ EM DIA? — `npm run check:regua` (2026-10-08).
 *
 * O Apêndice C imprime `src/data/reguaMedida.json`, gerado pelo simulador
 * (`npm run gerar:regua`). Se uma carta, um molde, o motor ou o montador mudou
 * depois da última geração, o livro está imprimindo a régua de outro jogo:
 * reprova, e quem mudou roda `npm run gerar:regua` no mesmo commit.
 */
import { readFileSync } from "node:fs";
import { hashDaRegua } from "./lib/hash-da-regua.mjs";

const regua = JSON.parse(readFileSync("src/data/reguaMedida.json", "utf8")) as { hash: string };
const agora = hashDaRegua();
if (regua.hash !== agora) {
  console.error(
    `❌ A régua do Apêndice C está velha: foi medida com ${regua.hash}, e o código agora é ${agora}.\n` +
      "   Rode `npm run gerar:regua` e suba o src/data/reguaMedida.json junto.",
  );
  process.exit(1);
}
console.log(`✅ A régua do Apêndice C está em dia (${agora}).`);
