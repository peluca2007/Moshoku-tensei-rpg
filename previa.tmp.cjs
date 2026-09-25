const sharp = require(process.cwd() + "/node_modules/sharp");
const fs = require("fs");
const COR = { cap0:"#ffa94d",cap1:"#5eb1ff",cap2:"#b197fc",cap3:"#38d9a9",cap4:"#ff6b6b",cap5:"#ffd43b",apendices:"#a5b4c4",
 "familia-magia":"#b197fc","familia-corpo":"#ff6b6b","familia-utilidade":"#e3c88f",fogo:"#ff6f4a",agua:"#5a9bff",vento:"#8be28f",terra:"#c89a6a",cura:"#d4e157",
 desintoxicacao:"#c07dff",teorica:"#78d5d0",invocacao:"#ff7ec4","deus-da-espada":"#ff4d6a","deus-da-agua-corpo":"#4fc4ff","deus-do-norte":"#a9bcd6",
 "armas-pesadas":"#e0a86a","cavalaria-e-escudos":"#7d8cff",vendaval:"#33d6b0","punho-de-fogo":"#ff9a3d",arquearia:"#a8c46a","furtividade-e-armadilhas":"#9d8df1",
 "bardo-e-interacao":"#ffab91","navegacao-e-lideranca":"#e3c88f" };
const K = 0.3, PW = Math.round(816 * K), PH = Math.round(1056 * K);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// Texto simulado: linhas nas duas colunas.
let linhas = "";
for (let y = 70; y < 965; y += 16) { linhas += `<rect x="60" y="${y}" width="335" height="6" fill="#8d8a84" opacity=".55"/><rect x="421" y="${y}" width="335" height="6" fill="#8d8a84" opacity=".55"/>`; }
const texto = Buffer.from(`<svg width="816" height="1056"><rect width="816" height="1056" fill="#141418"/>${linhas}<rect x="740" y="998" width="24" height="18" fill="#888"/></svg>`);
(async () => {
  const pagina = await sharp(texto).resize(PW, PH).png().toBuffer();
  const temas = process.argv.slice(3);
  const pecas = [];
  for (const [i, t] of temas.entries()) {
    const svg = fs.readFileSync(`public/livro/caos/${t}.svg`);
    const tira = await sharp(svg, { density: 72 * K }).resize(PW * 3, PH).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const [cr, cg, cb] = hex(COR[t] ?? "#cccccc");
    const px = Buffer.alloc(tira.info.width * tira.info.height * 4);
    for (let p = 0; p < tira.info.width * tira.info.height; p++) { px[p*4]=cr; px[p*4+1]=cg; px[p*4+2]=cb; px[p*4+3]=Math.round(tira.data[p*4+3]*0.45); }
    const cor = await sharp(px, { raw: { width: tira.info.width, height: tira.info.height, channels: 4 } }).png().toBuffer();
    for (let v = 0; v < 3; v++) {
      const camada = await sharp(cor).extract({ left: v * PW, top: 0, width: PW, height: PH }).toBuffer();
      const img = await sharp(pagina).composite([{ input: camada }]).png().toBuffer();
      pecas.push({ input: img, left: v * (PW + 6), top: i * (PH + 22) + 18 });
    }
    pecas.push({ input: Buffer.from(`<svg width="300" height="18"><text x="2" y="13" font-size="13" font-family="Arial" fill="#fff">${t}</text></svg>`), left: 0, top: i * (PH + 22) });
  }
  await sharp({ create: { width: PW * 3 + 12, height: temas.length * (PH + 22), channels: 3, background: "#333" } }).composite(pecas).png().toFile(process.argv[2]);
  console.log("ok");
})();
