/**
 * O ALARME DO MOLDE — `npm run check:molde` (2026-10-05).
 *
 * ## Por que existe
 *
 * O Apêndice G promete: 4 criaturas do patamar = Equilibrado, 5 = Difícil, o
 * Chefe = Equilibrado. Os moldes foram medidos contra o simulador em 27/09 e
 * ficaram certos. De 28 a 30/09, três correções do motor (preparo e
 * pré-requisitos cobrados, a IA sem gastar Reação como Ação, o BC só onde a
 * carta manda) tiraram dos heróis o que eles ganhavam de graça — todas
 * corretas — e o 3º patamar com 5 criaturas caiu de 67% pra 31% de vitória.
 * Ninguém viu por uma semana: o livro prometia Difícil e entregava Mortal.
 *
 * Este check mede o grupo de calibragem (o mesmo do `medir:orcamento`) contra
 * 4 e 5 criaturas do molde e contra o Chefe, nos seis patamares, e compara com
 * a tabela REFERENCIA de `scripts/lib/medirMolde.ts`. O mesmo alarme roda na
 * suíte de testes (`src/lib/moldeCalibrado.test.ts`). Semente fixa: o mesmo código dá o mesmo número.
 *
 * ## Quando ele reprova
 *
 * Um número a mais de TOLERANCIA pontos da referência. Aí uma de duas:
 * - a mudança no motor ou no livro é certa, e o molde precisa ser medido de
 *   novo (`npm run medir:orcamento`, e o PV em `src/data/bestiary.ts`);
 * - ou a referência mudou de propósito — atualize REFERENCIA no mesmo commit,
 *   dizendo por quê.
 *
 *   npm run check:molde
 *   BATALHAS=400 npm run check:molde     (mais preciso, mais lento)
 */

/*
 * A store é persistida no navegador. No Node o persist imprime um aviso por
 * compra; o armazenamento volátil abaixo (o mesmo do `balancear`) cala isso
 * sem tocar no roster de ninguém. O import precisa vir depois.
 */
const armazenamento = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    get length() { return armazenamento.size; },
    clear: () => armazenamento.clear(),
    getItem: (k: string) => armazenamento.get(k) ?? null,
    key: (i: number) => [...armazenamento.keys()][i] ?? null,
    removeItem: (k: string) => { armazenamento.delete(k); },
    setItem: (k: string, v: string) => { armazenamento.set(k, v); },
  } satisfies Storage,
});
Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: globalThis.localStorage } });

const { REFERENCIA, TOLERANCIA, medirPatamar } = await import("./lib/medirMolde");

const BATALHAS = Number(process.env.BATALHAS ?? 300);
const falhas: string[] = [];
console.log(`Molde do Apêndice G contra o grupo de calibragem — ${BATALHAS} batalhas por encontro, tolerância ±${TOLERANCIA}.\n`);
console.log("| Patamar | 4 criaturas | 5 criaturas | Chefe |\n| --- | --- | --- | --- |");
for (let patamar = 1; patamar <= 6; patamar++) {
  const r = medirPatamar(patamar, BATALHAS);
  falhas.push(...r.falhas);
  const marca = (k: "quatro" | "cinco" | "chefe") =>
    `${r.medido[k]}%${Math.abs(r.medido[k] - REFERENCIA[patamar][k]) > TOLERANCIA ? " ❌" : ""}`;
  console.log(`| ${patamar}º | ${marca("quatro")} | ${marca("cinco")} | ${marca("chefe")} |`);
}

if (falhas.length) {
  console.log(`\n❌ O molde saiu da faixa em ${falhas.length} encontro(s):`);
  for (const f of falhas) console.log(`   ${f}`);
  console.log("\nSe a mudança é certa, meça o molde de novo (npm run medir:orcamento) e ajuste o PV em src/data/bestiary.ts;");
  console.log("se a referência mudou de propósito, atualize REFERENCIA em scripts/lib/medirMolde.ts, no mesmo commit.");
  process.exit(1);
}
console.log("\n✅ O molde entrega o que o Apêndice G promete, dentro da tolerância.");
