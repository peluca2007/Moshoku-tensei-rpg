import { TREES } from "@/data/trees";

const porCusto = new Map<number, number>();
const inalcancaveis: string[] = [];
for (const t of TREES) for (const r of t.ranks) for (const a of r.abilities ?? []) {
  const d = (a as { damage?: { normal?: string } }).damage?.normal;
  if (!d) continue;
  const ac = (a as { actions?: { normal?: number } }).actions?.normal ?? 1;
  porCusto.set(ac, (porCusto.get(ac) ?? 0) + 1);
  if (ac > 3) inalcancaveis.push(`${t.id}/${a.name} (${r.rank}, ${ac} Ações)`);
}
console.log("Ações de dano por custo em Ações (o turno tem 3):");
for (const [k, v] of [...porCusto.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`  ${k} Ação/ões: ${String(v).padStart(3)}${k > 3 ? "   ← NÃO CABE NUM TURNO" : ""}`);
}
console.log(`\nTotal que o simulador NUNCA pode usar: ${inalcancaveis.length}`);
for (const x of inalcancaveis.slice(0, 12)) console.log("  " + x);
if (inalcancaveis.length > 12) console.log(`  ... e mais ${inalcancaveis.length - 12}`);
