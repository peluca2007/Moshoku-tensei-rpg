/**
 * Detector de redundância — "ganho isso no 1º patamar e ganho quase igual no 3º".
 *
 * O problema que ele procura não é uma regra errada: é uma progressão que não
 * progride. Quando o Avançado entrega uma versão levemente melhor do que o
 * Principiante já dava, o jogador paga 2 PA por uma linha de texto nova e nada
 * muda na mesa — e nenhum check de consistência pega isso, porque não há
 * contradição nenhuma. Só há repetição.
 *
 * Como ele mede: normaliza o texto de cada habilidade, talento e Maestria
 * (tira acento, caixa, número e palavra vazia) e compara par a par dentro da
 * MESMA árvore, com o índice de Jaccard sobre os tokens. Não é semântica — é
 * sobreposição de vocabulário —, então ele erra pra mais: cabe a quem lê julgar
 * se o par é uma escada legítima (Purgar → Purga Profunda) ou uma repetição.
 */
import { TREES } from "../src/data/trees/index";
import { RANKS } from "../src/lib/types";

const VAZIAS = new Set([
  "a","o","as","os","de","da","do","das","dos","e","ou","que","um","uma","uns","umas","em","no","na",
  "nos","nas","por","para","pra","com","sem","ao","aos","se","sua","seu","suas","seus","voce","vc",
  "ate","mais","menos","ser","sao","e","nao","como","cada","toda","todo","todas","todos","ela","ele",
  "isso","este","esta","esse","essa","dele","dela","pelo","pela","num","numa","alvo","teste","acao",
  "acoes","rank","bonus","patamar","criatura","turno","minuto","metros","você","1","2","3","pm","pt","pa",
]);

function tokens(texto: string): Set<string> {
  return new Set(
    texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !VAZIAS.has(t) && !/^\d+d?\d*$/.test(t))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

interface Entrada {
  rank: string;
  rankIdx: number;
  tipo: "Maestria" | "Talento" | "Magia";
  reserva: boolean;
  nome: string;
  texto: string;
  tokens: Set<string>;
}

const LIMIAR = Number(process.argv[2] ?? 0.34);
let achados = 0;

for (const tree of TREES) {
  const entradas: Entrada[] = [];
  for (const rd of tree.ranks) {
    const rankIdx = RANKS.indexOf(rd.rank);
    if (rd.mastery) {
      entradas.push({
        rank: rd.rank, rankIdx, tipo: "Maestria", nome: rd.mastery.name, reserva: false,
        texto: rd.mastery.description, tokens: tokens(rd.mastery.description),
      });
    }
    for (const t of rd.talents) {
      entradas.push({
        rank: rd.rank, rankIdx, tipo: "Talento", nome: t.name, reserva: !!t.grants,
        texto: t.description, tokens: tokens(t.description),
      });
    }
    for (const a of rd.abilities) {
      const texto = `${a.effect} ${a.damage?.normal ?? ""}`;
      entradas.push({
        rank: rd.rank, rankIdx, tipo: "Magia", nome: a.name, reserva: false, texto, tokens: tokens(texto),
      });
    }
  }

  const pares: { s: number; x: Entrada; y: Entrada }[] = [];
  for (let i = 0; i < entradas.length; i++) {
    for (let j = i + 1; j < entradas.length; j++) {
      const x = entradas[i];
      const y = entradas[j];
      // Só interessa a repetição ENTRE patamares: dentro do mesmo rank, duas
      // opções parecidas são uma escolha; entre ranks, é uma escada que não sobe.
      if (x.rankIdx === y.rankIdx) continue;
      // Dois talentos de RESERVA compartilham a redação de propósito: o "Padrão
      // das Reservas" (Cap. 1) existe justamente pra que +PV, +PM e +PT digam a
      // mesma frase em qualquer árvore. Isso é padronização, não repetição.
      if (x.reserva && y.reserva) continue;
      const s = jaccard(x.tokens, y.tokens);
      if (s >= LIMIAR) pares.push({ s, x, y });
    }
  }

  if (pares.length === 0) continue;
  pares.sort((p, q) => q.s - p.s);
  console.log("\n" + "═".repeat(76));
  console.log(`  ${tree.name}`);
  console.log("═".repeat(76));
  for (const { s, x, y } of pares) {
    achados++;
    const [antes, depois] = x.rankIdx < y.rankIdx ? [x, y] : [y, x];
    console.log(`\n  ${(s * 100).toFixed(0)}% — ${antes.rank} → ${depois.rank}`);
    console.log(`    ${antes.tipo} ${antes.nome}`);
    console.log(`      ${antes.texto.slice(0, 150)}`);
    console.log(`    ${depois.tipo} ${depois.nome}`);
    console.log(`      ${depois.texto.slice(0, 150)}`);
  }
}

console.log("\n" + "─".repeat(76));
console.log(`Pares acima de ${(LIMIAR * 100).toFixed(0)}% de sobreposição: ${achados}`);
console.log("Sobreposição alta NÃO é erro por si — escada legítima também repete");
console.log("vocabulário. Cada par abaixo precisa de julgamento humano.");

export {};
