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

import { mkdirSync, renameSync } from "node:fs";
import path from "node:path";
import { EXTENSOES_DE_ARTE as EXTENSOES, listarArte, PASTA_DA_ARTE, urlDaArte } from "./lib/arte.mjs";
import * as mapa from "../src/data/midiaDeHabilidade";
import { MIDIA_DE_HABILIDADE } from "../src/data/midiaDeHabilidade";
import { TREES } from "../src/data/trees";

/** `--seco` só relata; sem ele, o arquivo casado é movido pra pasta da árvore. */
const SECO = process.argv.includes("--seco");

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

/*
 * Tudo que o módulo da mídia aponta, e não só o mapa: as artes de SEÇÃO
 * (`ARTE_DO_DOJO`, `ARTE_DO_TOUKI`, …) são exports soltos, moram em
 * `arte/livro/` e não ilustram habilidade nenhuma. Sem elas aqui, este script
 * as listaria pra sempre como "sem habilidade de nome igual".
 */
const jaMapeados = new Set<string>([
  ...Object.values(MIDIA_DE_HABILIDADE).map((m) => m.src),
  ...Object.values(mapa)
    .filter((v): v is { src: string; alt: string } => !!v && typeof v === "object" && "src" in v)
    .map((v) => v.src),
]);
const chavesUsadas = new Set(Object.keys(MIDIA_DE_HABILIDADE));

const soltos = listarArte().filter((f) => !jaMapeados.has(urlDaArte(f)));

const casados: string[] = [];
const movidos: string[] = [];
const ambiguos: string[] = [];
const semPar: string[] = [];

for (const arquivo of soltos) {
  // `arquivo` é relativo a `public/arte/` e pode vir com pasta: o nome que casa
  // com a habilidade é só o último trecho, sem extensão.
  const base = normalizar(path.basename(arquivo).replace(EXTENSOES, ""));
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
    /*
     * O arquivo VAI pra pasta da árvore — 0.1.74.
     *
     * O caminho canônico é `arte/<arvore>/<id>.<ext>`, e quem sabe qual é a
     * árvore é justamente o casamento que acabou de acontecer aqui. Deixar o
     * arquivo onde estava obrigaria a movê-lo na mão depois de colar a linha,
     * e é aí que caminho e arquivo se separam calados.
     *
     * O `alt` continua sendo o que este script NÃO escreve: ele descreve a
     * cena, e a cena só se sabe abrindo o arquivo (`npm run folha --sem-uso`).
     */
    const chave = livres[0];
    const destino = `${chave}${path.extname(arquivo)}`;
    if (!SECO && destino !== arquivo) {
      mkdirSync(path.dirname(path.join(PASTA_DA_ARTE, destino)), { recursive: true });
      renameSync(path.join(PASTA_DA_ARTE, arquivo), path.join(PASTA_DA_ARTE, destino));
      movidos.push(`${arquivo} → ${destino}`);
    }
    casados.push(
      `  "${chave}": {\n    src: "${urlDaArte(destino)}",\n    alt: "TODO: descreva a CENA, não o nome.",\n  },`
    );
  }
}

if (casados.length > 0) {
  console.log(`✅ ${casados.length} casaram por nome exato — cole em src/data/midiaDeHabilidade.ts:\n`);
  console.log(casados.join("\n"));
}
if (movidos.length > 0) {
  console.log(`\n📁 ${movidos.length} movidos pra pasta da árvore:`);
  for (const m of movidos) console.log(`   ${m}`);
}
if (ambiguos.length > 0) {
  console.log(`\n⚠️  ${ambiguos.length} com nome repetido em mais de uma árvore (escolha na mão):`);
  for (const a of ambiguos) console.log(`   ${a}`);
}
if (semPar.length > 0) {
  console.log(`\n📭 ${semPar.length} sem habilidade de nome igual (abra e decida):`);
  for (const a of semPar) console.log(`   ${a}`);
}
