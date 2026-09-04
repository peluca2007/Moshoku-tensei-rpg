/**
 * Auditoria das dezenove árvores contra a régua do Apêndice C.
 *
 * ## Por que existe
 *
 * O `PROGRESS.md` carrega, desde sempre, uma dívida enorme: "auditoria linha a
 * linha das magias — faltam por inteiro Suishin, Norte, Lutador, Escudos,
 * Arquearia, Ladino, Tático, Vendaval e Punho de Fogo". Nove das dezenove
 * árvores, quase metade do sistema, com números que ninguém conferiu. A forma
 * proposta era ler as ~400 magias à mão — trabalho de semanas, que envelhece no
 * dia seguinte ao primeiro nerf.
 *
 * O `check:livro` já verifica um LADO disso: que a régua nunca prometa MENOS
 * que o maior golpe único do patamar. Mas o outro lado é o perigoso. Uma coluna
 * pode prometer 40 e a árvore entregar 12, e nada no projeto percebe: a régua
 * fica alta, a mesa monta a build achando que ela bate no que está escrito, e
 * descobre na sessão.
 *
 * ## O que ele mede
 *
 * O TETO REAL DO TURNO, e não o maior golpe: quanto a árvore causa gastando as
 * três Ações do turno da melhor forma que o patamar permite. É isso que a coluna
 * do Apêndice C significa — "dano por turno" —, e é uma conta diferente de
 * "maior dano".
 *
 * Regras da conta, todas herdadas do texto do livro:
 *
 * - Você mantém o que comprou: no patamar Santo, as magias de Principiante,
 *   Intermediário e Avançado continuam na ficha. O orçamento considera todas.
 * - Uma habilidade de 1 Ação pode ser usada três vezes no turno; uma de 2, uma
 *   vez com uma Ação sobrando; uma de 4+ ocupa mais de um turno e se amortiza
 *   (Cap. 2, §3: o cântico pode ser dividido entre turnos).
 * - Reação não entra: ela acontece FORA do turno, e somá-la infla o número.
 * - O Bônus de Rank entra onde a fórmula diz "+ BC", porque a coluna do
 *   Apêndice C é medida com um personagem daquele patamar, não com um boneco de
 *   atributo zero.
 *
 * ## O que ele NÃO mede, e por que ainda assim vale
 *
 * Área, alcance, condições aplicadas, cura, controle, dano ao longo de rodadas,
 * e o Touki do alvo. Uma árvore de Utilidade legitimamente causa dano baixo, e
 * Escudos causa quase nenhum — é o papel delas. Por isso `regua: false` existe
 * em `danoPorTurno.ts`, e por isso este script **avisa** em vez de reprovar
 * quase tudo: ele não decide se a árvore está certa, ele diz onde olhar.
 *
 * ## A limitação que separa as duas metades do relatório
 *
 * Numa árvore de MAGIA, o dano está inteiro na fórmula da magia — a medição
 * abaixo é fiel. Numa árvore do CORPO, não: o golpe base é o **Dado de Arma**,
 * que escala por degraus concedidos pelas Maestrias de cada patamar
 * (`weaponDie.ts`), e as técnicas costumam somar a ele em vez de substituí-lo.
 * Medir isso direito exigiria ler as Maestrias uma a uma e decidir qual arma o
 * personagem carrega.
 *
 * Então o número do Corpo aqui é um **PISO**, não uma medição — e o relatório
 * diz isso em vez de fingir precisão. Inventar um Dado de Arma plausível daria
 * um número mais bonito e menos verdadeiro; um medidor que não sabe o que não
 * sabe é pior que nenhum.
 *
 * O que ele entrega é a lista curta. Auditar nove árvores lendo 400 magias é
 * trabalho de semanas; auditar as células que este relatório acusa é trabalho de
 * uma tarde.
 *
 *   npm run check:arvores
 */
import { TREES } from "../src/data/trees/index";
import { RANKS, RANK_BONUS, AbilityDef } from "../src/lib/types";
import { diceAverage } from "../src/lib/dice";
import {
  COLUNAS_CORPO,
  COLUNAS_MAGIA,
  DANO_POR_TURNO_CORPO,
  DANO_POR_TURNO_MAGIA,
  valorNumerico,
} from "../src/data/danoPorTurno";

/** As nove que o PROGRESS.md lista como nunca auditadas linha a linha. */
const NUNCA_AUDITADAS = new Set([
  "suishin",
  "norte",
  "lutador",
  "escudos",
  "arquearia",
  "ladino",
  "tatico",
  "vendaval",
  "punho_fogo",
]);

/** Acima disto a coluna promete mais do que a árvore entrega — vale olhar. */
const DESVIO_AVISO = 0.35;
/** Acima disto a promessa está tão longe do teto que é quase certamente erro. */
const DESVIO_ERRO = 0.6;

const ACOES_POR_TURNO = 3;

/**
 * O atributo principal em cada patamar, como o próprio Apêndice C declara:
 * "atributo principal progredindo de 4 até 8" (`Appendices.tsx`).
 *
 * Isto não é um chute meu — é a premissa escrita da tabela, e ignorá-la foi o
 * primeiro erro deste script. Sem ela, TODA coluna alta aparecia ~50% acima do
 * teto calculado, um desvio sistemático que denunciava a conta, não a régua:
 * uma magia "3d8 + BC" no 5º patamar rende 13,5 + 5 pela conta errada e
 * 13,5 + 13 pela certa. Desvio uniforme em tudo é sinal de medidor quebrado.
 */
const ATRIBUTO_POR_PATAMAR = [4, 5, 6, 7, 8, 8];

/**
 * A média de dano de uma habilidade, com o Bônus de Conjuração somado onde a
 * fórmula pede.
 *
 * As fórmulas são texto livre ("2d8 + BC", "Vigor + 1d8 em PV", "3d6 por alvo"),
 * e não existe parser confiável pra elas — o próprio `PROGRESS.md` registra essa
 * decisão. O que dá pra extrair com segurança são os NdM; o "+ BC" é somado
 * quando a palavra aparece, porque ela é escrita sempre do mesmo jeito no livro.
 *
 * O BC usa o patamar do PERSONAGEM, não o rank da magia: um Rei conjurando uma
 * magia de Principiante soma o BC de Rei (Cap. 1, §7).
 */
function mediaDeDano(formula: string, patamarDoPersonagem: number): number {
  let total = 0;
  for (const m of formula.matchAll(/(\d+)d(\d+)/g)) total += diceAverage(`${m[1]}d${m[2]}`);
  if (total === 0) return 0;
  if (/\bBC\b|Bônus de Rank/i.test(formula)) {
    const atributo = ATRIBUTO_POR_PATAMAR[Math.min(patamarDoPersonagem, ATRIBUTO_POR_PATAMAR.length - 1)];
    total += atributo + RANK_BONUS[RANKS[patamarDoPersonagem]];
  }
  return total;
}

interface Golpe {
  nome: string;
  media: number;
  acoes: number;
}

/** Todo golpe disponível a quem chegou neste patamar — os de baixo continuam valendo. */
function golpesAcumulados(treeId: string, ateRankIndex: number): Golpe[] {
  const tree = TREES.find((t) => t.id === treeId);
  if (!tree) return [];
  const golpes: Golpe[] = [];
  for (let i = 0; i <= ateRankIndex; i++) {
    const rd = tree.ranks.find((r) => r.rank === RANKS[i]);
    if (!rd) continue;
    for (const a of rd.abilities as AbilityDef[]) {
      const formula = a.damage?.normal;
      if (!formula) continue;
      // Reação acontece fora do turno: contá-la no orçamento de 3 Ações mede um
      // turno que não existe.
      if (a.reaction) continue;
      const media = mediaDeDano(formula, ateRankIndex);
      if (media <= 0) continue;
      golpes.push({ nome: a.name, media, acoes: Math.max(1, a.actions.normal) });
    }
  }
  return golpes;
}

/**
 * O melhor uso das 3 Ações do turno.
 *
 * Mochila pequena e com repetição: a mesma magia pode ser conjurada duas vezes
 * num turno se couber. Golpes que custam mais que um turno inteiro entram pela
 * média amortizada (dano ÷ turnos gastos), que é como o próprio livro os
 * descreve — "magias de 4, 5 ou 6 Ações são perfeitamente jogáveis; elas só
 * exigem que alguém segure a linha de frente".
 */
function tetoPorTurno(golpes: Golpe[]): { total: number; plano: string } {
  if (golpes.length === 0) return { total: 0, plano: "—" };

  // Caminho 1: encher o turno com golpes que cabem nele.
  const cabem = golpes.filter((g) => g.acoes <= ACOES_POR_TURNO);
  const melhorPorAcoes = new Map<number, Golpe>();
  for (const g of cabem) {
    const atual = melhorPorAcoes.get(g.acoes);
    if (!atual || g.media > atual.media) melhorPorAcoes.set(g.acoes, g);
  }
  // dp[a] = melhor dano usando exatamente até `a` Ações.
  const dp: { dano: number; usados: Golpe[] }[] = Array.from({ length: ACOES_POR_TURNO + 1 }, () => ({
    dano: 0,
    usados: [],
  }));
  for (let a = 1; a <= ACOES_POR_TURNO; a++) {
    dp[a] = { ...dp[a - 1], usados: [...dp[a - 1].usados] };
    for (const [custo, g] of melhorPorAcoes) {
      if (custo > a) continue;
      const candidato = dp[a - custo].dano + g.media;
      if (candidato > dp[a].dano) dp[a] = { dano: candidato, usados: [...dp[a - custo].usados, g] };
    }
  }

  // Caminho 2: um golpe grande, amortizado pelos turnos que ele ocupa.
  let amortizado = { dano: 0, golpe: null as Golpe | null };
  for (const g of golpes) {
    const turnos = Math.max(1, Math.ceil(g.acoes / ACOES_POR_TURNO));
    const porTurno = g.media / turnos;
    if (porTurno > amortizado.dano) amortizado = { dano: porTurno, golpe: g };
  }

  if (amortizado.dano > dp[ACOES_POR_TURNO].dano && amortizado.golpe) {
    const g = amortizado.golpe;
    return { total: amortizado.dano, plano: `${g.nome} (${g.acoes} Ações, amortizado)` };
  }
  const contagem = new Map<string, number>();
  for (const g of dp[ACOES_POR_TURNO].usados) contagem.set(g.nome, (contagem.get(g.nome) ?? 0) + 1);
  const plano = [...contagem].map(([n, q]) => (q > 1 ? `${n} ×${q}` : n)).join(" + ") || "—";
  return { total: dp[ACOES_POR_TURNO].dano, plano };
}

// ---------------------------------------------------------------------------
// O relatório
// ---------------------------------------------------------------------------
let erros = 0;
let avisos = 0;
const linhasDoRelatorio: string[] = [];
/** Corpo entra separado: ali o número é piso, não medição. */
const listaCorpo: string[] = [];

const colunas = [...COLUNAS_MAGIA, ...COLUNAS_CORPO].filter((c) => c.regua !== false);

for (const tabela of [DANO_POR_TURNO_MAGIA, DANO_POR_TURNO_CORPO]) {
  tabela.forEach((linha, rankIndex) => {
    for (const coluna of colunas) {
      const celula = linha.porArvore[coluna.treeId];
      if (!celula) continue;
      // Célula com qualificador ("~22 + área", "0 a ∞") descreve outra coisa de
      // propósito — comparar seria inventar uma regra que o texto não tem.
      if (/[a-zA-Zà-úÀ-Ú∞]/.test(celula.replace(/^~?\d+\s*/, ""))) continue;
      const prometido = valorNumerico(celula);
      if (prometido === null || prometido <= 0) continue;

      const { total, plano } = tetoPorTurno(golpesAcumulados(coluna.treeId, rankIndex));
      if (total <= 0) continue;

      const desvio = (prometido - total) / prometido;
      if (desvio < DESVIO_AVISO) continue;

      const arvore = TREES.find((t) => t.id === coluna.treeId);
      const ehCorpo = arvore?.category === "corpo";
      const marca = NUNCA_AUDITADAS.has(coluna.treeId) ? " [nunca auditada]" : "";
      const msg =
        `${coluna.label} no ${linha.patamar}: a régua promete ${celula}, o teto do turno dá ` +
        `${total.toFixed(0)} (${(desvio * 100).toFixed(0)}% abaixo) — melhor turno: ${plano}${marca}`;

      // No Corpo o número é piso, não medição (ver o cabeçalho): ele nunca vira
      // FALHA, porque o Dado de Arma que falta na conta pode explicar o desvio
      // inteiro. Reprovar um build por causa do que o medidor não sabe medir
      // treinaria a equipe a ignorar o relatório.
      if (ehCorpo) {
        avisos++;
        listaCorpo.push(`[PISO]   ${msg}`);
      } else if (desvio >= DESVIO_ERRO) {
        erros++;
        linhasDoRelatorio.push(`[FALHA]  ${msg}`);
      } else {
        avisos++;
        linhasDoRelatorio.push(`[AVISO]  ${msg}`);
      }
    }
  });
}

console.log("========================================");
console.log("AUDITORIA DAS ÁRVORES — teto do turno × régua do Apêndice C");
console.log("========================================");
if (linhasDoRelatorio.length === 0) {
  console.log("MAGIA — nenhuma coluna promete mais do que a árvore entrega.");
} else {
  console.log("MAGIA (medição fiel: o dano está na fórmula da magia)");
  for (const l of linhasDoRelatorio) console.log(l);
}
if (listaCorpo.length) {
  console.log("");
  console.log("CORPO (PISO, não medição: falta o Dado de Arma escalado por Maestria)");
  for (const l of listaCorpo) console.log(l);
}
console.log("");
console.log(`Colunas conferidas..................... ${colunas.length}`);
console.log(`Árvores sem auditoria manual........... ${NUNCA_AUDITADAS.size} de ${TREES.length}`);
console.log(`Avisos (${(DESVIO_AVISO * 100).toFixed(0)}%+ abaixo)................. ${avisos}`);
console.log(`Falhas (${(DESVIO_ERRO * 100).toFixed(0)}%+ abaixo)................. ${erros}`);
console.log("========================================");

if (erros > 0) {
  console.error(
    `\n❌ ${erros} coluna(s) prometem mais que o dobro do que a árvore entrega no turno.\n` +
      `   Ou a régua está alta, ou a árvore perdeu dano num rework e ninguém corrigiu a promessa.`
  );
  process.exit(1);
}
console.log("\n✅ Nenhuma promessa da régua está gritantemente acima do que a árvore entrega.");
