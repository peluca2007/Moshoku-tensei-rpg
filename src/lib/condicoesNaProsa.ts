import { CONDICOES, Condicao } from "@/data/condicoes";

/**
 * Acha as condições citadas dentro do texto de uma habilidade.
 *
 * ## A regra de casamento, e por que ela é MAIÚSCULA-sensível
 *
 * O livro tem uma convenção que o próprio glossário declara: condição citada
 * numa habilidade vem com inicial maiúscula — "o alvo fica Envenenado", "e
 * sofre Preso". Este reconhecedor obedece a essa convenção em vez de ignorá-la,
 * e isso não é preciosismo: metade dos nomes é palavra comum do português.
 *
 * Sem exigir a maiúscula, "a fonte do medo" viraria um link pra condição Fonte,
 * "preso ao chão" viraria Preso, e "marcado pela guerra" viraria Marcado. Um
 * glossário que se acende em toda frase deixa de ser glossário e vira ruído.
 *
 * A `Fonte` do Fluxo Interrompido é o caso que testou a regra. Ela parecia a
 * exclusão óbvia — é a palavra mais comum da lista —, e a medição desmentiu:
 * varrendo a prosa das dezenove árvores, "Fonte" com F maiúsculo aparece sete
 * vezes e as sete são a condição. O uso comum é sempre minúsculo, e a regra da
 * maiúscula já dá conta sozinha. O palpite teria custado sete links certos.
 */

/** Um pedaço do texto: ou prosa comum, ou uma condição reconhecida. */
export type PedacoDeProsa = { texto: string } | { texto: string; condicao: Condicao };

/**
 * As formas de um nome, incluindo gênero e número.
 *
 * A prosa do livro flexiona: "as criaturas ficam **Seladas**", "cai na fenda e
 * fica **Presa**", "duas ficam **Caídas**". Casar só a forma do glossário
 * deixaria a maioria dessas citações sem link — medido antes de escrever isto:
 * são dezenas de ocorrências flexionadas em toda a base (Molhada 5, Molhados 4,
 * Molhadas 3, e assim por diante).
 *
 * A flexão troca só a vogal final de nomes terminados em "o", que é a forma de
 * particípio que todas as condições nomeadas assim usam. Ela não TRUNCA o nome,
 * e é isso que a mantém segura: "Marcado" gera Marcada/Marcados/Marcadas e nunca
 * "Marca" — palavra que aparece 34 vezes na prosa como "Marcas da Morte", que é
 * outra coisa inteiramente.
 *
 * "Em Chamas", "Estagnação" e "Fluxo Interrompido" não flexionam e ficam como
 * estão.
 */
function formasDe(nome: string): string[] {
  if (!nome.endsWith("o")) return [nome];
  const raiz = nome.slice(0, -1);
  return [nome, `${raiz}a`, `${raiz}os`, `${raiz}as`];
}

/**
 * Todos os nomes reconhecíveis, do mais longo pro mais curto.
 *
 * A ordem importa: "Fluxo Interrompido" tem que ser testado antes de qualquer
 * nome contido nele, senão o casamento parcial come o começo do nome inteiro e
 * sobra um pedaço solto no meio da frase.
 */
const NOMES = CONDICOES.flatMap((c) =>
  [c.nome, ...(c.sinonimos ?? [])].flatMap((nome) => formasDe(nome).map((forma) => ({ nome: forma, condicao: c })))
).sort((a, b) => b.nome.length - a.nome.length);

function escapar(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * A expressão é montada UMA vez, na importação do módulo, e não a cada card
 * desenhado: o `/livro` renderiza centenas de habilidades numa página só, e
 * remontar 24 alternativas por card é trabalho repetido para sempre o mesmo
 * resultado.
 *
 * As bordas são `(?<![\p{L}])` e `(?![\p{L}])` em vez de `\b` porque `\b` do
 * JavaScript não conhece letra acentuada: com ele, "Atordoado" casaria dentro de
 * palavras que terminam em vogal acentuada logo antes, e "Cego" casaria em
 * "Cegonha".
 */
const EXPRESSAO = new RegExp(`(?<![\\p{L}])(${NOMES.map((n) => escapar(n.nome)).join("|")})(?![\\p{L}])`, "gu");

/**
 * Quebra o texto em pedaços, marcando os que são condição.
 *
 * Devolve um array de um elemento só quando não há nenhuma — quem desenha pode
 * tratar os dois casos igual, sem um caminho especial pro texto comum.
 */
export function separarCondicoes(texto: string): PedacoDeProsa[] {
  if (!texto) return [{ texto: "" }];

  const pedacos: PedacoDeProsa[] = [];
  let cursor = 0;

  // `matchAll` em vez de `exec` em laço: o estado `lastIndex` de uma expressão
  // global compartilhada entre chamadas é a forma clássica de um reconhecedor
  // funcionar no primeiro card e pular termos no segundo.
  for (const achado of texto.matchAll(EXPRESSAO)) {
    const inicio = achado.index ?? 0;
    const nome = achado[1];
    const condicao = NOMES.find((n) => n.nome === nome)?.condicao;
    if (!condicao) continue;
    if (inicio > cursor) pedacos.push({ texto: texto.slice(cursor, inicio) });
    pedacos.push({ texto: nome, condicao });
    cursor = inicio + nome.length;
  }

  if (cursor < texto.length) pedacos.push({ texto: texto.slice(cursor) });
  return pedacos.length > 0 ? pedacos : [{ texto }];
}

/** Só os ids das condições citadas, sem repetição — para checagens e contagens. */
export function condicoesCitadas(texto: string): string[] {
  const ids = separarCondicoes(texto)
    .filter((p): p is { texto: string; condicao: Condicao } => "condicao" in p)
    .map((p) => p.condicao.id);
  return [...new Set(ids)];
}
