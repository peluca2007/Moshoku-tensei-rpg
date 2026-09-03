import { TREES } from "../src/data/trees/index";
import { INCANTATION_LENGTH, qualifiesForRecitationBonus, RankName } from "../src/lib/types";

/**
 * Self-check dos cânticos (Cap. 2, §2).
 *
 * O que ele guarda, desde 2026-09-03, é a regra que passou a valer mecânica:
 * o cântico só concede o Bônus de Recitação Perfeita se alcançar o PISO do
 * rank. Antes, o bônus era automático e 55 das 149 magias do livro estavam
 * abaixo do próprio piso — o sistema premiava quem escrevesse cântico curto.
 *
 * Por isso há duas severidades distintas aqui:
 *
 * - FALHA (quebra o build): magia sem cântico nenhum. Isso é sempre um erro.
 * - AVISO: cântico fora da faixa. Abaixo do piso é uma decisão de design
 *   legítima — a magia é rápida de propósito e o livro imprime "Sem bônus"
 *   nela —, mas exige `costNote` explicando a pressa. Acima do teto é só estilo:
 *   o rank deixa de ser legível se um Principiante recita mais que um Santo.
 */

const MAGIC_TREES = ["agua", "fogo", "terra", "vento", "cura", "desintoxicacao", "barreira", "invocacao", "bardo-e-interacao"];

let total = 0;
let semCantico = 0;
let semBonus = 0;
let semBonusSemNota = 0;
let acimaDoTeto = 0;

const semBonusLista: string[] = [];

for (const tree of TREES) {
  if (!MAGIC_TREES.includes(tree.id)) continue;

  for (const rankDef of tree.ranks) {
    const rank: RankName = rankDef.rank;
    const faixa = INCANTATION_LENGTH[rank];

    for (const ability of rankDef.abilities) {
      total++;

      if (!ability.incantation || ability.incantation.trim().length === 0) {
        console.error(`[FALHA] ${tree.id} (${rank}) -> ${ability.name}: SEM ENCANTAMENTO`);
        semCantico++;
        continue;
      }

      const len = ability.incantation.replace(/\\n/g, "\n").trim().length;
      const temBonus = qualifiesForRecitationBonus(ability.incantation, rank);

      if (!temBonus) {
        semBonus++;
        semBonusLista.push(`${tree.id}/${ability.name} (${rank}, ${len} car.)`);
        if (!ability.costNote) {
          console.warn(
            `[AVISO] ${tree.id} (${rank}) -> ${ability.name}: cântico de ${len} car. (piso ${faixa.min}) ` +
              `fica SEM bônus de recitação, e não tem costNote explicando por que é rápida.`
          );
          semBonusSemNota++;
        }
      } else if (len > faixa.max) {
        console.warn(
          `[AVISO] ${tree.id} (${rank}) -> ${ability.name}: ${len} car. acima do teto ${faixa.max} — ` +
            `o rank deixa de ser legível pelo tamanho do cântico.`
        );
        acimaDoTeto++;
      }
    }
  }
}

console.log("\n========================================");
console.log(`Magias verificadas.................. ${total}`);
console.log(`Sem cântico (erro)................. ${semCantico}`);
console.log(`Sem bônus de recitação (por design) ${semBonus}`);
console.log(`  ...destas, sem costNote.......... ${semBonusSemNota}`);
console.log(`Acima do teto do rank.............. ${acimaDoTeto}`);
console.log("========================================");

if (semBonusLista.length) {
  console.log("\nMagias que NÃO concedem Recitação Perfeita (velocidade é o benefício delas):");
  for (const l of semBonusLista) console.log(`  · ${l}`);
}

if (semCantico > 0) {
  console.error("\n❌ SELF-CHECK FALHOU: existem magias sem encantamento.");
  process.exit(1);
}
console.log("\n✅ SELF-CHECK PASSOU: toda magia tem cântico, e a escada de tamanho está declarada.");
