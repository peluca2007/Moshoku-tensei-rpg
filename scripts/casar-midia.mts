/**
 * O CASAMENTO POR NOME EXATO — 0.1.72.
 *
 * ## Por que
 *
 * A partir da 0.1.71 os arquivos novos chegam com o nome EXATO da habilidade
 * que ilustram: `Agarrão.gif`, `Investida Devastadora.gif`, `Terremoto
 * Pessoal.webp`. Isso mata a ambiguidade que fez o `300.webp` parar na parede
 * de escudos — não há o que deduzir quando o nome É a resposta.
 *
 * Este script casa os dois lados e imprime a linha de mapa pronta. Ele **não**
 * escreve no arquivo: o `alt` descreve a CENA e precisa de olho humano, então o
 * que sai daqui vem com um `alt` marcado pra preencher.
 *
 * Uso: `npm run casar:midia`
 */

import { readdirSync } from "node:fs";
import path from "node:path";
import { MIDIA_DE_HABILIDADE } from "../src/data/midiaDeHabilidade";
import { TREES } from "../src/data/trees";

const PUBLIC = path.join(process.cwd(), "public");
const EXTENSOES = /\.(webp|gif|webm|mp4|png|jpe?g|avif)$/i;

/**
 * Tira acento, caixa, pontuação e os marcadores entre colchetes.
 *
 * `Investida Devastadora [Peso]` e `Investida Devastadora.gif` têm que casar: o
 * `[Peso]` é rótulo de linha de habilidade, não parte do nome que alguém
 * digitaria ao salvar uma imagem.
 */
function normalizar(texto: string): string {
  return texto
    .replace(/\[[^\]]*\]/g, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const porNome = new Map<string, string[]>();
for (const t of TREES) {
  for (const r of t.ranks) {
    for (const e of [...(r.abilities ?? []), ...(r.talents ?? [])]) {
      const k = normalizar(e.name);
      porNome.set(k, [...(porNome.get(k) ?? []), `${t.id}/${e.id}`]);
    }
    if (r.mastery) {
      const k = normalizar(r.mastery.name);
      porNome.set(k, [...(porNome.get(k) ?? []), `${t.id}/maestria`]);
    }
  }
}

const jaMapeados = new Set(Object.values(MIDIA_DE_HABILIDADE).map((m) => m.src));
const chavesUsadas = new Set(Object.keys(MIDIA_DE_HABILIDADE));

const soltos = readdirSync(PUBLIC).filter(
  (f) => EXTENSOES.test(f) && !jaMapeados.has(`/${f}`)
);

const casados: string[] = [];
const ambiguos: string[] = [];
const semPar: string[] = [];

for (const arquivo of soltos) {
  const base = normalizar(arquivo.replace(EXTENSOES, ""));
  const chaves = porNome.get(base);
  if (!chaves) {
    semPar.push(arquivo);
    continue;
  }
  const livres = chaves.filter((c) => !chavesUsadas.has(c));
  if (livres.length === 0) {
    ambiguos.push(`${arquivo} → todas as habilidades com esse nome já têm arte (${chaves.join(", ")})`);
  } else if (livres.length > 1) {
    ambiguos.push(`${arquivo} → ${livres.length} habilidades com esse nome: ${livres.join(", ")}`);
  } else {
    casados.push(`  "${livres[0]}": {\n    src: "/${arquivo}",\n    alt: "TODO: descreva a CENA, não o nome.",\n  },`);
  }
}

if (casados.length > 0) {
  console.log(`✅ ${casados.length} casaram por nome exato — cole em src/data/midiaDeHabilidade.ts:\n`);
  console.log(casados.join("\n"));
}
if (ambiguos.length > 0) {
  console.log(`\n⚠️  ${ambiguos.length} com nome repetido em mais de uma árvore (escolha na mão):`);
  for (const a of ambiguos) console.log(`   ${a}`);
}
if (semPar.length > 0) {
  console.log(`\n📭 ${semPar.length} sem habilidade de nome igual (abra e decida):`);
  for (const a of semPar) console.log(`   ${a}`);
}
