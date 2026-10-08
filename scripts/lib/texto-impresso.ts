import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
/** Mantém linhas para diagnósticos; comentários nunca são regra impressa. */
export function semComentarios(texto: string): string {
    return texto.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, " ")).replace(/(^|[^:])\/\/.*$/gm, "$1");
}
export const normalizar = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
export function fontesImpressas() {
    const dados = readdirSync("src/data").filter(n => /^(races|backgrounds|shopItems|bestiary|preMadeMonsters|condicoes|marcadoresDaMesa)\.ts$/.test(n)).map(n => `src/data/${n}`);
    const arvores = readdirSync("src/data/trees").filter(n => n.endsWith(".ts") && n !== "index.ts").map(n => `src/data/trees/${n}`);
    const capitulos = readdirSync("src/components/book").filter(n => /^(Chapter\d|Appendices)\.tsx$/.test(n)).map(n => `src/components/book/${n}`);
    return [...dados, ...arvores, ...capitulos].map(arquivo => ({ arquivo: path.posix.normalize(arquivo), texto: semComentarios(readFileSync(arquivo, "utf8")) }));
}
