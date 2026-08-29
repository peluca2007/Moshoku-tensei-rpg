/**
 * Regenera livro-tex/gen/*.tex a partir de src/data.
 *
 *   npm run book:tex
 *
 * A rota /api/livro-tex chama exatamente as mesmas funções na hora do
 * download, então rodar isto é opcional — serve pra versionar o resultado e
 * poder ler o .tex no editor sem subir o site.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { GENERATED_PARTS } from "../src/lib/livroTex";

const dir = path.join(process.cwd(), "livro-tex", "gen");
await mkdir(dir, { recursive: true });

for (const part of GENERATED_PARTS) {
  const body = part.build();
  await writeFile(path.join(dir, part.file), body + "\n", "utf-8");
  console.log(`${part.file.padEnd(22)} ${String(body.split("\n").length).padStart(6)} linhas`);
}
console.log("\nlivro-tex/gen/ atualizado.");
