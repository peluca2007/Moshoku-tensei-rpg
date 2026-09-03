import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { TREES } from "../src/data/trees/index";
import { getRankDeusForTree } from "../src/data/rankDeus";
import { INCANTATION_LENGTH, qualifiesForRecitationBonus } from "../src/lib/types";
import { MAGIC_ACTIONS } from "../src/data/trees/shared";

/**
 * Self-check de consistência entre os DADOS e o TEXTO do livro.
 *
 * Por que existe: em 2026-09-03, uma leitura manual do livro inteiro achou sete
 * contradições. Nenhuma delas era sutil — "as 18 árvores" num livro com 19,
 * "Uma Salvação" onde a regra diz duas, um Aside explicando uma fórmula que
 * tinha mudado três dias antes, uma tabela renderizando um bônus (+8) que não
 * existe em RANK_BONUS. Todas nasceram do mesmo jeito: **um número foi escrito à
 * mão numa frase e depois o dado mudou**.
 *
 * Ler o livro inteiro à mão acha isso uma vez. Este script acha toda vez, em
 * dois segundos, e é a única forma de a próxima mudança de dado não reabrir a
 * mesma classe de bug.
 *
 * Ele NÃO tenta entender o texto: só procura, na prosa dos capítulos, números e
 * afirmações que têm uma fonte de verdade em `src/data` ou `src/lib` e compara.
 */

const BOOK_DIR = "src/components/book";
const bookText = readdirSync(BOOK_DIR)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => `\n/* ==== ${f} ==== */\n` + readFileSync(join(BOOK_DIR, f), "utf8"))
  .join("");

let erros = 0;
let avisos = 0;

function falha(msg: string) {
  console.error(`[FALHA] ${msg}`);
  erros++;
}
function aviso(msg: string) {
  console.warn(`[AVISO] ${msg}`);
  avisos++;
}

// ---------------------------------------------------------------------------
// 1. Contagem de árvores escrita na prosa
// ---------------------------------------------------------------------------
const NUMERO_POR_EXTENSO: Record<number, string> = {
  17: "dezessete",
  18: "dezoito",
  19: "dezenove",
  20: "vinte",
};
const total = TREES.length;
const corretoExtenso = NUMERO_POR_EXTENSO[total];

for (const [n, extenso] of Object.entries(NUMERO_POR_EXTENSO)) {
  const num = Number(n);
  if (num === total) continue;
  // "as 18 árvores", "das 18 sub-árvores", "dezoito árvores"
  const padroes = [
    new RegExp(`\\b${num}\\s+(sub-)?árvores`, "gi"),
    new RegExp(`\\b${extenso}\\s+(sub-)?árvores`, "gi"),
  ];
  for (const re of padroes) {
    const achados = bookText.match(re);
    if (achados) {
      falha(
        `o livro diz "${achados[0]}" mas TREES tem ${total} árvores ` +
          `(escreva "${total}" ou "${corretoExtenso}")`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Toda árvore precisa de Mecânica Central e de quadro de Rank Deus
// ---------------------------------------------------------------------------
for (const tree of TREES) {
  if (!tree.mechanic) {
    falha(`árvore "${tree.name}" (${tree.id}) não declara \`mechanic\` — o catálogo dela abre sem a Mecânica Central`);
  } else {
    if (tree.mechanic.loop.length < 2 || tree.mechanic.loop.length > 4) {
      aviso(`"${tree.name}": o \`loop\` tem ${tree.mechanic.loop.length} passos (o padrão do livro é 2 a 4)`);
    }
    // A tag precisa aparecer entre colchetes na Maestria de 1º patamar.
    //
    // Tags de DOIS TEMPOS ("Molhado → Congelado") são marcadas em dois lugares
    // de propósito: o preparo na Maestria de 1º patamar, a cobrança no patamar
    // em que ela passa a valer. Por isso basta a primeira metade aparecer aqui.
    const primeira = tree.ranks[0]?.mastery?.description ?? "";
    const preparo = tree.mechanic.tag.split("→")[0].trim();
    if (!primeira.includes(`[${tree.mechanic.tag}]`) && !primeira.includes(`[${preparo}]`)) {
      aviso(
        `"${tree.name}": a Maestria de 1º patamar não marca a tag [${tree.mechanic.tag}] — ` +
          `o leitor não reconhece a mecânica quando ela volta`
      );
    }
  }

  const temPatamarDeus = tree.ranks.some((r) => r.rank === "Deus");
  if (!getRankDeusForTree(tree.id) && !temPatamarDeus) {
    falha(`árvore "${tree.name}" (${tree.id}) não tem quadro de Rank Deus nem caminho de ascensão`);
  }
  if (getRankDeusForTree(tree.id) && temPatamarDeus) {
    aviso(
      `"${tree.name}": tem patamar Deus comprável E quadro narrativo de Rank Deus — o catálogo mostra os dois`
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Cânticos: piso do rank = porta do Bônus de Recitação Perfeita
// ---------------------------------------------------------------------------
let magias = 0;
let semCantico = 0;
let semBonus = 0;
let semBonusSemNota = 0;
let acimaDoTeto = 0;
const semBonusLista: string[] = [];

for (const tree of TREES) {
  for (const rankDef of tree.ranks) {
    for (const a of rankDef.abilities) {
      // Só as oito ESCOLAS DE MAGIA recitam (Cap. 2, §2). Uma técnica marcial
      // que gasta PM — Punho de Fogo queima mana no soco — não é uma magia e
      // não tem cântico: ela é executada, não conjurada.
      if (tree.category !== "magia" || a.pmCost === undefined) continue;
      magias++;
      const faixa = INCANTATION_LENGTH[rankDef.rank];

      if (!a.incantation?.trim()) {
        falha(`${tree.id} (${rankDef.rank}) → ${a.name}: magia sem encantamento`);
        semCantico++;
        continue;
      }

      const len = a.incantation.replace(/\\n/g, "\n").trim().length;
      if (!qualifiesForRecitationBonus(a.incantation, rankDef.rank)) {
        semBonus++;
        semBonusLista.push(`${tree.id}/${a.name} (${rankDef.rank}, ${len} car.)`);
        if (!a.costNote) {
          aviso(
            `${tree.id} (${rankDef.rank}) → ${a.name}: ${len} car. (piso ${faixa.min}) fica SEM bônus ` +
              `de recitação e não tem costNote explicando por que é rápida`
          );
          semBonusSemNota++;
        }
      } else if (len > faixa.max) {
        aviso(`${tree.id} (${rankDef.rank}) → ${a.name}: ${len} car. acima do teto ${faixa.max} do rank`);
        acimaDoTeto++;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Divergir da tabela de custo exige costNote (Cap. 2)
// ---------------------------------------------------------------------------
for (const tree of TREES) {
  if (tree.category !== "magia") continue;
  for (const rankDef of tree.ranks) {
    for (const a of rankDef.abilities) {
      if (a.pmCost === undefined || a.reaction || a.costNote) continue;
      const padrao = MAGIC_ACTIONS[rankDef.rank]?.normal;
      if (padrao !== undefined && a.actions.normal !== padrao) {
        aviso(
          `${tree.id} (${rankDef.rank}) → ${a.name}: ${a.actions.normal} Ações onde a tabela do rank pede ${padrao}, ` +
            `e sem costNote justificando (Cap. 2: todo desvio carrega uma nota)`
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
console.log("\n========================================");
console.log(`Árvores................................ ${TREES.length}`);
console.log(`  com Mecânica Central................. ${TREES.filter((t) => t.mechanic).length}`);
console.log(`  com quadro de Rank Deus.............. ${TREES.filter((t) => getRankDeusForTree(t.id)).length}`);
console.log(`Magias verificadas..................... ${magias}`);
console.log(`  sem cântico (erro)................... ${semCantico}`);
console.log(`  sem bônus de recitação (por design).. ${semBonus}`);
console.log(`    ...destas, sem costNote............ ${semBonusSemNota}`);
console.log(`  acima do teto do rank................ ${acimaDoTeto}`);
console.log(`Erros.................................. ${erros}`);
console.log(`Avisos................................. ${avisos}`);
console.log("========================================");

if (semBonusLista.length) {
  console.log("\nMagias que NÃO concedem Recitação Perfeita (velocidade é o benefício delas):");
  for (const l of semBonusLista) console.log(`  · ${l}`);
}

if (erros > 0) {
  console.error(`\n❌ SELF-CHECK FALHOU: ${erros} erro(s) de consistência entre dados e texto.`);
  process.exit(1);
}
console.log("\n✅ SELF-CHECK PASSOU: dados e texto do livro estão consistentes.");
