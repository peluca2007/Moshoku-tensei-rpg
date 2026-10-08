/**
 * O hash dos arquivos que decidem a régua do Apêndice C (2026-10-08).
 *
 * Mudou uma carta, um molde, o motor ou o montador: a régua medida ficou velha
 * e `check:regua` reprova. As quebras de linha são normalizadas, pra o mesmo
 * código dar o mesmo hash no Windows (CRLF) e no Linux (LF).
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ARQUIVOS_SOLTOS = [
  "src/data/bestiary.ts",
  "src/data/startingKits.ts",
  "src/lib/combatSim.ts",
  "src/lib/encounterSim.ts",
  "src/lib/combatSummons.ts",
  "src/lib/combatScenario.ts",
  "src/lib/combatReactions.ts",
  "src/lib/magiaTeorica.ts",
  "scripts/lib/montar-medicao.mts",
  "scripts/gerar-regua.mts",
];

export function hashDaRegua(): string {
  const arvores = readdirSync("src/data/trees").filter((f) => f.endsWith(".ts")).sort().map((f) => join("src/data/trees", f));
  const h = createHash("sha256");
  for (const arquivo of [...arvores, ...ARQUIVOS_SOLTOS]) {
    h.update(arquivo.replace(/\\/g, "/"));
    h.update(readFileSync(arquivo, "utf8").replace(/\r\n/g, "\n"));
  }
  return h.digest("hex").slice(0, 16);
}
