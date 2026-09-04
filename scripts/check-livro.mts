import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { TREES } from "../src/data/trees/index";
import { getRankDeusForTree } from "../src/data/rankDeus";
import { INCANTATION_LENGTH, RANKS, qualifiesForRecitationBonus } from "../src/lib/types";
import { diceAverage } from "../src/lib/dice";
import {
  COLUNAS_CORPO,
  COLUNAS_MAGIA,
  DANO_POR_TURNO_CORPO,
  DANO_POR_TURNO_MAGIA,
  valorNumerico,
} from "../src/data/danoPorTurno";
import { MAGIC_ACTIONS } from "../src/data/trees/shared";
import { SHOP_CATEGORY_ICONS, SHOP_CATEGORY_ORDER } from "../src/data/shopItems";
import { RACES } from "../src/data/races";
import { CRIATURAS_PRONTAS } from "../src/data/bestiary";

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

  // O patamar Divino é narrativo em TODA árvore (Cap. 1, §3: "não possui custo
  // mecânico de PA"). Até 2026-09-03 o Punho de Fogo era a única exceção — tinha
  // 13 habilidades compráveis no rank Deus. Virou quadro narrativo como as
  // outras dezoito, e este check tranca a decisão.
  if (tree.ranks.some((r) => r.rank === "Deus")) {
    falha(
      `árvore "${tree.name}" (${tree.id}) tem um patamar Deus COMPRÁVEL — o Cap. 1, §3 diz que o ` +
        `Divino não tem custo em PA. Mova o conteúdo para o quadro narrativo em src/data/rankDeus.ts`
    );
  }
  if (!getRankDeusForTree(tree.id)) {
    falha(`árvore "${tree.name}" (${tree.id}) não tem quadro de Rank Deus nem caminho de ascensão`);
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
// 5. Apêndice C — a régua de dano não pode prometer menos do que a árvore entrega
//
// "Dano por turno" embute Ações, número de alvos e o Touki do inimigo, e nada
// disso está nos dados de uma magia isolada — então a tabela continua sendo uma
// calibragem humana. O que dá pra verificar é o PISO: uma coluna pode ficar
// ACIMA da média do maior golpe único daquele patamar (várias Ações, vários
// alvos), mas nunca abaixo dela.
//
// Foi assim que a régua envelheceu sem ninguém ver: o Sopro Podre caiu de 10d8
// pra 6d8 no rework de 2026-09-03 e a coluna da Desintoxicação continuou
// anunciando ~55 no 5º patamar — um número que a escola não alcançava mais.
// ---------------------------------------------------------------------------
/**
 * A média do maior golpe único do patamar, JÁ AMORTIZADA pelas Ações que ele
 * custa — que é a unidade em que o Apêndice C mede.
 *
 * O próprio livro avisa: "Magia não está amortizada pelas Ações. Uma magia de
 * Imperador custa 6 Ações — dois turnos inteiros." Um turno tem 3 Ações, então
 * uma magia de 6 Ações entrega metade do total por turno. Sem essa divisão o
 * check acusaria o Sol Menor (221 de média, 6 Ações) contra uma coluna de 130,
 * quando 130 é exatamente o número certo pra ele.
 */
function danoPorTurnoDaArvore(treeId: string, rankIndex: number): number {
  const tree = TREES.find((t) => t.id === treeId);
  const rank = RANKS[rankIndex];
  const rd = tree?.ranks.find((r) => r.rank === rank);
  if (!rd) return 0;
  let melhor = 0;
  for (const a of rd.abilities) {
    const formula = a.damage?.normal;
    if (!formula) continue;
    let total = 0;
    for (const m of formula.matchAll(/(\d+)d(\d+)/g)) total += diceAverage(`${m[1]}d${m[2]}`);
    const acoes = a.reaction ? 1 : Math.max(1, a.actions.normal);
    const turnos = Math.max(1, Math.ceil(acoes / 3));
    const porTurno = total / turnos;
    if (porTurno > melhor) melhor = porTurno;
  }
  return melhor;
}

const COLUNAS_DA_REGUA = new Set(
  [...COLUNAS_MAGIA, ...COLUNAS_CORPO].filter((c) => c.regua !== false).map((c) => c.treeId)
);

for (const tabela of [DANO_POR_TURNO_MAGIA, DANO_POR_TURNO_CORPO]) {
  tabela.forEach((linha, i) => {
    for (const [treeId, celula] of Object.entries(linha.porArvore)) {
      if (!COLUNAS_DA_REGUA.has(treeId)) continue;
      // Célula com qualificador — "~22 + área", "~39 em 45m", "0 a ∞" — não é um
      // número de dano por turno comparável: o livro escolheu descrever outra
      // coisa ali de propósito. Verificar isso seria inventar uma regra que o
      // texto não tem.
      if (/[a-zA-Zà-úÀ-Ú∞]/.test(celula.replace(/^~?\d+\s*/, ""))) continue;
      const prometido = valorNumerico(celula);
      if (prometido === null) continue;
      const piso = Math.round(danoPorTurnoDaArvore(treeId, i));
      if (piso > 0 && prometido < piso) {
        aviso(
          `Apêndice C: ${treeId} no ${linha.patamar} promete ${celula}, mas o maior golpe único do ` +
            `patamar já tem média ${piso} — a régua está abaixo do que a árvore entrega`
        );
      }
    }
  });
}

// ---------------------------------------------------------------------------
// O brasão de cada árvore existe mesmo em disco (2026-09-03)
// ---------------------------------------------------------------------------
/*
 * `Tree.icon` é um caminho em texto: nada no TypeScript impede que ele aponte
 * pra um arquivo que não existe, e o resultado disso é um quadrado quebrado no
 * mapa de árvores que ninguém vê até abrir a página certa. As dezenove imagens
 * chegaram com espaço no nome, acento e uma extensão mentindo sobre o formato
 * — exatamente a classe de erro que só um teste de existência pega.
 */
function conferirArquivo(rotulo: string, url: string) {
  const caminho = join("public", url.replace(/^\//, ""));
  if (!existsSync(caminho)) falha(`${rotulo} aponta "${url}", mas ${caminho} não existe`);
}

let semIcone = 0;
for (const tree of TREES) {
  if (!tree.icon) {
    aviso(`Árvore "${tree.name}" (${tree.id}) não declara icon — ela vai cair no ícone genérico da categoria`);
    semIcone++;
    continue;
  }
  conferirArquivo(`Árvore "${tree.name}"`, tree.icon);
}

// A loja tem arte por categoria, e uma categoria sem arte é caso previsto (cai
// no ícone de traço). O que não pode é declarar arte que não existe.
for (const [categoria, url] of Object.entries(SHOP_CATEGORY_ICONS)) {
  if (url) conferirArquivo(`Categoria de loja "${categoria}"`, url);
}
for (const race of RACES) {
  if (!race.icon) {
    aviso(`Raça "${race.name}" (${race.id}) não declara icon — o card dela sai sem retrato`);
    continue;
  }
  conferirArquivo(`Raça "${race.name}"`, race.icon);
}

// As criaturas prontas do Apêndice G seguem a mesma regra das árvores e das
// raças: o arquivo se chama como o `id`, e um caminho quebrado aqui vira
// quadrado partido no livro e no montador de encontros.
for (const criatura of CRIATURAS_PRONTAS) {
  if (!criatura.icon) {
    aviso(`Criatura "${criatura.nome}" (${criatura.id}) não declara icon — ela sai sem retrato`);
    continue;
  }
  conferirArquivo(`Criatura "${criatura.nome}"`, criatura.icon);
}

const categoriasSemArte = SHOP_CATEGORY_ORDER.filter((c) => !SHOP_CATEGORY_ICONS[c]);
if (categoriasSemArte.length) {
  aviso(`Categorias da loja sem arte própria (usam o ícone de traço): ${categoriasSemArte.join(", ")}`);
}

// Os avulsos que a interface referencia por caminho fixo. Cada um destes já
// quebrou uma vez: o logo escuro, a textura e a paisagem entraram em CSS e JSX
// como string, onde nenhum tipo os protege.
for (const url of ["/logo-real-alfa.png", "/paisagem.jpg", "/texturas/pergaminho.avif", "/texturas/fibra.jpg"]) {
  conferirArquivo("Arte fixa da interface", url);
}

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// O sumário aponta pra âncoras que existem, e na ORDEM em que a página as tem
// (0.1.7)
//
// Por que existe: o Capítulo 2 estava fisicamente na ordem 1, 2, 6, 7, 3, 4, 5 —
// as seções "Interromper uma Conjuração" e "Regras Gerais" ficavam ENTRE a 2 e a
// 3, e a §6 abria falando do custo em Ações que só a §3 estabelece. O sumário
// listava 1→7 certinho, então clicar em "3. Tempo de Conjuração" fazia o leitor
// SUBIR na página. E o Capítulo 4 numerava 8 seções enquanto o sumário numerava
// 9, porque "Reações e Ações Defensivas" estava enterrada como subtítulo dentro
// da seção de fome, sede e clima.
//
// Nada disso quebra `tsc`, `eslint` nem teste: são âncoras válidas apontando pro
// lugar errado. Um livro é uma ORDEM, e ordem precisa de teste.
const arquivosDoLivro = readdirSync(join(process.cwd(), "src/components/book"));
const ordemNaPagina: string[] = [];
for (const nome of ["Chapter0", "Chapter1", "Chapter2", "Chapter3", "Chapter4", "Chapter5", "Appendices"]) {
  const arquivo = arquivosDoLivro.find((f) => f === `${nome}.tsx`);
  if (!arquivo) continue;
  const texto = readFileSync(join(process.cwd(), "src/components/book", arquivo), "utf8");
  for (const m of texto.matchAll(/<(?:Chapter|Section|Sub)Title[^>]*\bid="([a-z0-9-]+)"/g)) {
    ordemNaPagina.push(m[1]);
  }
}

const paginaLivro = readFileSync(join(process.cwd(), "src/app/livro/page.tsx"), "utf8");
const ordemNoSumario = [...paginaLivro.matchAll(/id:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);

for (const id of ordemNoSumario) {
  if (!ordemNaPagina.includes(id)) falha(`Sumário do livro aponta pra "#${id}", que não existe em nenhum capítulo`);
}

// A ordem relativa: os ids do sumário que existem na página têm que aparecer nela
// na mesma sequência. Se não aparecem, um link do sumário anda pra trás.
const soOsQueExistem = ordemNoSumario.filter((id) => ordemNaPagina.includes(id));
let anterior = -1;
for (const id of soOsQueExistem) {
  const posicao = ordemNaPagina.indexOf(id);
  if (posicao < anterior) {
    falha(
      `Sumário fora de ordem: "#${id}" vem depois no sumário, mas aparece ANTES na página — ` +
        `clicar nele faz o leitor subir`
    );
  }
  anterior = Math.max(anterior, posicao);
}

console.log(`Âncoras do sumário conferidas.......... ${ordemNoSumario.length}, todas na ordem da página`);
console.log("\n========================================");
console.log(`Árvores................................ ${TREES.length}`);
console.log(`  com Mecânica Central................. ${TREES.filter((t) => t.mechanic).length}`);
console.log(`  com quadro de Rank Deus.............. ${TREES.filter((t) => getRankDeusForTree(t.id)).length}`);
console.log(`  com brasão em public/arvores......... ${TREES.length - semIcone}`);
console.log(`Raças com retrato...................... ${RACES.filter((r) => r.icon).length} de ${RACES.length}`);
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
