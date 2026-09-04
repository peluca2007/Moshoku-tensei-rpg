import { diceAverage } from "./dice";

/**
 * Lê uma fórmula de dano da Árvore do Corpo e devolve a média dela.
 *
 * ## Por que isto existe
 *
 * `check:arvores` mede o teto do turno de cada árvore, e conseguia ser fiel na
 * Magia, onde o dano inteiro está na fórmula da magia ("3d8 + BC"). No Corpo
 * não: o golpe base é o **Dado de Arma** escalado por Maestria, e as técnicas
 * quase nunca substituem esse dado — elas o multiplicam ("Dado de arma rolado
 * três vezes"), somam a ele ("+2 Dados de Arma"), ou o rebaixam um degrau. Um
 * medidor que só entende `NdM` lê "Dado de arma rolado cinco vezes" como ZERO.
 *
 * Era por isso que o relatório imprimia as seis linhas do Corpo marcadas como
 * PISO e nunca como falha: o desvio podia ser inteiramente o que faltava medir.
 * Este módulo é o que faltava. Com ele o Corpo vira medição, igual à Magia.
 *
 * ## A convenção do livro, que este parser assume
 *
 * O Cap. 3 define **dano marcial = Dado de Arma (escalado) + Atributo + Bônus
 * do Rank**. As fórmulas do catálogo usam duas formas distintas, e a diferença
 * entre elas não é estilo — é regra:
 *
 * - **"Dado/Dano de arma normal"** invoca a fórmula inteira: dado + atributo +
 *   Bônus de Rank. É o ataque comum, com outro nome.
 * - **"Dado de arma rolado N vezes"** invoca só os DADOS. Quando a técnica
 *   também soma atributo, o texto diz com todas as letras ("…rolado quatro
 *   vezes + Força + Bônus de Rank"). Duas técnicas escrevem isso explicitamente,
 *   e é isso que prova que a omissão nas outras é deliberada.
 *
 * Ler as duas formas do mesmo jeito inflaria metade do catálogo do Corpo em
 * atributo + Bônus de Rank que o livro não concede.
 *
 * ## O que é descartado de propósito
 *
 * Bônus preso a uma condição que **o atacante não controla** não entra: o
 * Apêndice C mede um turno contra um alvo genérico, e "+2 Dados de Arma contra
 * armadura completa" só existe contra um alvo específico. O corte é sempre no
 * mesmo lugar — condição do ATACANTE conta (mover 9m antes de bater é escolha
 * dele, e ele pode fazer isso todo turno), condição do ALVO não (armadura,
 * estrutura, Reação defensiva, acúmulos de Quebrantado).
 *
 * O outro descarte é dano em si mesmo ("você sofre 1d4"): um medidor de dano
 * causado não pode somá-lo como se fosse dano causado.
 */
export interface WeaponContext {
  /** Média do Dado de Arma já escalado pelas Maestrias do patamar. */
  dieAverage: number;
  /** Média do Dado de Arma um degrau ABAIXO — várias técnicas rebaixam um degrau. */
  dieAverageOneStepBelow: number;
  /** Valor do atributo-chave do personagem naquele patamar. */
  attribute: number;
  /** Bônus de Rank do patamar (Cap. 1, §7). */
  rankBonus: number;
}

interface WeaponFormulaResult {
  /** Média de dano causado a UM alvo, num uso da técnica. */
  average: number;
  /** Como a fórmula foi lida, parcela a parcela — o relatório imprime isto. */
  reading: string[];
  /** true = a fórmula não descreve dano (cura, PV temporários, redução de dano). */
  notDamage: boolean;
  /** Trechos condicionais deliberadamente ignorados, e por quê. */
  ignored: string[];
}

/**
 * Fórmulas que não são dano causado. Somá-las mede a árvore errada: Cavalaria
 * e Escudos "causava" 11 por turno na conta ingênua porque `Aguentar o Baque`
 * REDUZ 2d10 — e reduzir dano não é causar dano.
 */
const NAO_E_DANO = /\bem PV\b|PV Temporários|\bReduz\b/i;

/** Condição que depende do ALVO, não do atacante — ver o cabeçalho. */
const DESCARTES: { re: RegExp; motivo: string }[] = [
  { re: /\+\s*\d+\s*Dados?\s+de\s+Arma\s+contra[^,.]*/gi, motivo: "bônus só contra um tipo de alvo" },
  { re: /\((?:dobrado|triplicado)\s+contra[^)]*\)/gi, motivo: "multiplicador só contra estrutura/armadura" },
  { re: /\+\s*\d+d\d+\s+se\s+[^,.]*/gi, motivo: "bônus preso a uma Reação do alvo" },
  { re: /\+?\s*\d+d\d+\s+por\s+acúmulo[^.]*/gi, motivo: "bônus por acúmulo construído no alvo" },
  { re: /\(você sofre[^)]*\)/gi, motivo: "dano em si mesmo, não no alvo" },
];

const MULTIPLICADOR: Record<string, number> = {
  duas: 2,
  três: 3,
  tres: 3,
  quatro: 4,
  cinco: 5,
};

const ATRIBUTO_ESCRITO = /\+\s*(Força|Agilidade|Vigor|Intelecto|Espírito)\b/i;

export function averageOfWeaponFormula(formula: string, ctx: WeaponContext): WeaponFormulaResult {
  const reading: string[] = [];
  const ignored: string[] = [];

  if (NAO_E_DANO.test(formula)) {
    return { average: 0, reading: ["não é dano causado"], notDamage: true, ignored };
  }

  let texto = formula;
  for (const { re, motivo } of DESCARTES) {
    const achados = texto.match(re);
    if (achados) {
      for (const a of achados) ignored.push(`"${a.trim()}" — ${motivo}`);
      texto = texto.replace(re, " ");
    }
  }

  const { dieAverage: dado, dieAverageOneStepBelow: dadoAbaixo, attribute: atr, rankBonus: br } = ctx;
  const ataqueComum = dado + atr + br;

  let total = 0;
  /** O ataque comum já foi somado — com atributo e Bônus de Rank juntos. */
  let ataqueContado = false;

  // 1. "Dado de arma rolado N vezes" — só os DADOS, sem atributo (ver cabeçalho).
  const mult = texto.match(/dado de arma rolad[oa]\s+(duas|tr[êe]s|quatro|cinco)\s+vezes/i);
  if (mult) {
    const n = MULTIPLICADOR[mult[1].toLowerCase()];
    total += n * dado;
    reading.push(`${n}× dado de arma (${(n * dado).toFixed(1)})`);
  }

  // 2. Um ataque comum com o dado rebaixado um degrau.
  if (!mult && /dado de arma um degrau abaixo/i.test(texto)) {
    total += dadoAbaixo + atr + br;
    ataqueContado = true;
    reading.push(`ataque com o dado um degrau abaixo (${(dadoAbaixo + atr + br).toFixed(1)})`);
  }

  // 3. Meio dado: um golpe fraco de propósito (Golpe Baixo, Tiro de Contenção,
  //    Cabeçada). Meio dado é meio DADO, não meia fórmula — nem atributo nem
  //    Bônus de Rank entram.
  if (/metade do dado/i.test(texto)) {
    total += dado / 2;
    reading.push(`meio dado de arma (${(dado / 2).toFixed(1)})`);
  }

  // 4. Dois golpes numa Ação só: o segundo sai um degrau abaixo.
  if (/(segundo (ataque|disparo)|arma secundária):\s*um degrau abaixo/i.test(texto)) {
    total += ataqueComum + (dadoAbaixo + atr + br);
    ataqueContado = true;
    reading.push(`ataque comum (${ataqueComum.toFixed(1)})`);
    reading.push(`segundo golpe um degrau abaixo (${(dadoAbaixo + atr + br).toFixed(1)})`);
  }

  // 5. O ataque comum invocado pelo nome, ou um bônus escrito EM CIMA dele —
  //    fórmula que começa com "+" descreve o que se soma a um golpe normal.
  const invocaNormal = /d(?:ado|ano) de arma normal|dano de arma\b/i.test(texto);
  // Lido da fórmula ORIGINAL, e não da já podada: `Quebra-Armadura` é
  // "+2 Dados de Arma contra armadura completa" — descartado o bônus, o que
  // sobra ainda é um ataque comum. Testar o texto podado leria a técnica como
  // zero de dano, o que é pior do que não medir.
  const ehBonusSobreAtaque = /^\s*\+/.test(formula);
  if (!ataqueContado && !mult && (invocaNormal || ehBonusSobreAtaque)) {
    total += ataqueComum;
    ataqueContado = true;
    reading.push(`ataque comum (${ataqueComum.toFixed(1)})`);
  }

  // 6. "+N Dados de Arma": dados extras no golpe, sem atributo extra.
  const extras = texto.match(/\+\s*(\d+)\s*Dados?\s+de\s+Arma/i);
  if (extras) {
    const n = Number(extras[1]);
    total += n * dado;
    reading.push(`+${n} dado(s) de arma (${(n * dado).toFixed(1)})`);
  }

  // 7. "no segundo corte": a técnica bate duas vezes e o bônus escrito é do
  //    segundo golpe. Sem isto, Cruz Nebulosa (2 Ações) vira um golpe só.
  if (/no segundo corte/i.test(texto) && ataqueContado) {
    total += ataqueComum;
    reading.push(`segundo corte (${ataqueComum.toFixed(1)})`);
  }

  // 8. Os NdM que sobraram no texto.
  for (const m of texto.matchAll(/(\d+)d(\d+)/g)) {
    const media = diceAverage(`${m[1]}d${m[2]}`);
    total += media;
    reading.push(`${m[0]} (${media})`);
  }

  // 9. Atributo e Bônus de Rank escritos explicitamente — e "BC", que é
  //    exatamente a soma dos dois (Cap. 1, §7).
  const citaBC = /\bBC\b/i.test(texto);
  if (!ataqueContado) {
    if (citaBC || ATRIBUTO_ESCRITO.test(texto)) {
      total += atr;
      reading.push(`atributo (${atr})`);
    }
    if (citaBC || /Bônus de Rank/i.test(texto)) {
      total += br;
      reading.push(`Bônus de Rank (${br})`);
    }
  }

  return { average: total, reading, notDamage: false, ignored };
}
