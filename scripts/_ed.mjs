import fs from "node:fs";
const [file, json] = process.argv.slice(2);
const pares = JSON.parse(fs.readFileSync(json, "utf8"));
let s = fs.readFileSync(file, "utf8");
for (const [velho, novo] of pares) {
  const n = s.split(velho).length - 1;
  if (n !== 1) { console.error(`!! ${n} ocorrências em ${file}: ${velho.slice(0,70)}`); process.exit(1); }
  s = s.replace(velho, () => novo);
}
fs.writeFileSync(file, s);
console.log(`ok ${file} (${pares.length})`);
