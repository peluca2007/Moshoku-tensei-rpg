import { TREES } from "@/data/trees";
for (const id of ["desintoxicacao", "fogo"]) {
  const t = TREES.find((x) => x.id === id)!;
  console.log(`\n== ${t.name}`);
  for (const r of t.ranks) for (const a of r.abilities as any[]) if (a.damage?.normal)
    console.log(`${r.rank.padEnd(13)} ${a.name.padEnd(26)} A${a.actions?.normal} PM${a.pmCost ?? "-"} | ${a.damage.normal.slice(0, 70)} | ${a.effect.slice(0, 90)}`);
}
