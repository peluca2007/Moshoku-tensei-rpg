/**
 * A REVISÃO DO LIVRO, PÁGINA A PÁGINA — 2026-09-25.
 *
 * ## Por que existe
 *
 * O autor pediu: "olhar página a página pra ver se está tudo bonito — e um
 * script pra, sempre que a gente mexer em algo, olhar isso". Mexer em uma
 * regra muda o tamanho de um parágrafo, que muda onde cai a quebra de página,
 * que empurra um título pro pé da coluna três capítulos adiante. Ninguém acha
 * isso lendo o diff. Este script abre o livro folheado num Chrome sem janela,
 * mede o livro inteiro e fotografa todas as duplas.
 *
 * ## O que ele confere
 *
 * - TÍTULO SEPARADO DO TEXTO: título no pé da coluna e o texto dele na
 *   seguinte (o defeito que o autor chamou de obrigatório).
 * - ESTOURO: bloco passando da coluna ou da página.
 * - PÁGINA VAZIA: mais de 18% da mancha em branco.
 * - ARTE QUEBRADA: imagem que não carregou.
 * - ARTE BORRADA: imagem ampliada mais de 1,6× do tamanho que o arquivo tem.
 * - LINHA SOLTA: tabela partida com uma linha só de um lado da quebra.
 * - RECORTE FORTE: imagem cortada pra caber no quadro mostrando menos de 45%
 *   dela (o rosto do Orsted cortado era isso).
 *
 * ## O que ele entrega
 *
 * `.telas/revisao/`: uma foto por dupla, folhas de contato (quatro duplas por
 * folha, pra revisar o livro inteiro de olho em poucos minutos), e o
 * `relatorio.md` / `index.html` com os problemas de cada página.
 *
 * ## Uso
 *
 *   npm run revisar:livro                      (servidor em BASE, padrão :3000)
 *   BASE=http://localhost:3010 npm run revisar:livro
 *   npm run revisar:livro -- --papel dia       (o papel claro)
 *   npm run revisar:livro -- --sem-fotos       (só as medições, em segundos)
 *
 * Sai com código 1 se houver título separado, estouro ou arte quebrada: dá
 * pra usar antes de abrir um PR.
 */

import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { BASE, comNavegador, dormir } from "./lib/navegador.mjs";

const args = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : padrao;
};
const papel = opcao("papel", "noite");
const semFotos = args.includes("--sem-fotos");
const LARGURA = 1440;
const ALTURA = 900;
const SAIDA = path.join(process.cwd(), ".telas", "revisao");

/** Roda dentro da página: mede o livro inteiro e devolve os problemas por página. */
const MEDIR = `(async () => {
  const f = document.querySelector(".folhear-fluxo");
  const fx = document.querySelector(".folhear-faixa");
  const cs = getComputedStyle(document.querySelector(".folhear"));
  const P = parseFloat(cs.getPropertyValue("--pagina"));
  const M = parseFloat(cs.getPropertyValue("--margem"));
  const C = parseFloat(cs.getPropertyValue("--calha"));
  const fr = f.getBoundingClientRect();
  const k = fr.width / f.offsetWidth;
  const o = fx.getBoundingClientRect().left;
  const H = f.offsetHeight;
  const colW = (P - 2 * M - C) / 2;
  const pagina = (x) => Math.floor((x - o) / k / P);
  const problemas = [];
  const anotar = (pag, tipo, texto) => problemas.push({ pagina: pag + 1, tipo, texto });
  const oculto = (el) => el.closest("details:not([open])");
  // Fundo desfocado de uma arte (a própria arte, ampliada e borrada atrás dela): é decoração.
  const decoracao = (el) => el.matches(".livro-imagem-fundo, img.blur-2xl, .folhear-capa-fundo");

  // As imagens fora da vista estão em loading=lazy: pra medir, carrega todas.
  const imgs = [...document.querySelectorAll(".folhear-livro img")];
  imgs.forEach((i) => (i.loading = "eager"));
  await Promise.race([
    Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })))),
    new Promise((r) => setTimeout(r, 20000)),
  ]);

  // 1. Título separado do texto.
  const sel = "h3, h4, .livro-arvore-cabeca, .livro-verbete > div:first-child, :is(.livro-caixa, .livro-maestria, .livro-proficiencias) > p:first-child, .livro-mecanica > div:first-child, .livro-tabela thead";
  const seguinte = (t) => {
    let n = t;
    while (n && n !== f) {
      let i = n.nextElementSibling;
      while (i && ![...i.getClientRects()].some((r) => r.height > 1)) i = i.nextElementSibling;
      if (i) return i;
      n = n.parentElement;
    }
    return null;
  };
  const coluna = (q) => { const x = (q.left - o) / k + Math.min(q.width / k / 2, 40); const p = Math.floor(x / P); return p * 2 + (x - p * P > P / 2 ? 1 : 0); };
  let titulos = 0;
  f.querySelectorAll(sel).forEach((t) => {
    if (oculto(t) || t.closest(".livro-abertura, .folhear-sumario, .livro-raca")) return;
    const rt = t.getClientRects();
    if (!rt.length) return;
    titulos++;
    // A primeira linha: título partido entre colunas também é título solto.
    const r = rt[0];
    const d = seguinte(t);
    const c = d && [...d.getClientRects()].find((q) => q.height > 1);
    if (c && coluna(c) > coluna(r)) anotar(pagina(r.left), "titulo", (t.textContent || "").trim().slice(0, 60));
  });

  // 1b. Tabela partida com UMA linha de um lado: no pé da coluna (o título
  // órfão das tabelas) ou sozinha no alto da seguinte, com o cabeçalho repetido.
  f.querySelectorAll(".livro-tabela").forEach((tab) => {
    if (oculto(tab)) return;
    const grupos = [];
    tab.querySelectorAll("tbody tr:not(.folhear-cabecalho-repetido)").forEach((tr) => {
      const q = tr.getClientRects()[0];
      if (!q || q.height < 2) return;
      const c = coluna(q);
      if (grupos.length && grupos[grupos.length - 1].c === c) grupos[grupos.length - 1].n++;
      else grupos.push({ c, n: 1, left: q.left, texto: (tr.textContent || "").trim().slice(0, 40) });
    });
    if (grupos.length < 2) return;
    const ultimo = grupos[grupos.length - 1];
    if (ultimo.n === 1) anotar(pagina(ultimo.left), "linha-solta", "última linha sozinha: " + ultimo.texto);
    if (grupos[0].n === 1) anotar(pagina(grupos[0].left), "linha-solta", "primeira linha sozinha no pé: " + grupos[0].texto);
  });

  // 2. Estouro: bloco passando da coluna ou da página.
  f.querySelectorAll("table, .livro-tabela, figure, .livro-caixa, .livro-ficha, .livro-verbete, dl, pre, img, video, .livro-arvore-cabeca, p, li").forEach((el) => {
    if (oculto(el) || decoracao(el) || el.closest(".livro-abertura, .folhear-guarda, .folhear-capa")) return;
    for (const q of el.getClientRects()) {
      if (q.width < 2 || q.height < 2) continue;
      const x0 = (q.left - o) / k, x1 = (q.right - o) / k, y1 = (q.bottom - fr.top) / k;
      const pag = Math.floor((x0 + 2) / P);
      const base = pag * P + M;
      const larga = x1 - x0 > colW + 6 || !!el.closest(".folhear-larga, .livro-raca, .livro-vitrine, .livro-prancha");
      const esq = x0 - base;
      const dir = x1 - (larga ? pag * P + P - M : x0 - base < colW ? base + colW : base + colW + C + colW);
      const sinais = [];
      if (dir > 3) sinais.push("direita +" + Math.round(dir));
      if (esq < -3) sinais.push("esquerda " + Math.round(esq));
      if (y1 > H + 3) sinais.push("pé +" + Math.round(y1 - H));
      if (sinais.length) { anotar(pag, "estouro", el.tagName + " " + sinais.join(", ") + ' "' + (el.textContent || "").trim().slice(0, 40) + '"'); break; }
    }
  });

  // 3. Página vazia (a mancha que sobrou em branco).
  const fundo = new Map();
  const onde = (x) => { const xp = (x - o) / k; const p = Math.floor(xp / P); const dentro = xp - p * P - M; return { p, col: dentro > colW + C / 2 ? 1 : 0 }; };
  f.querySelectorAll("p, li, tr, h2, h3, h4, figure, .livro-caixa, .livro-verbete, dl, blockquote, header, nav, section, article").forEach((el) => {
    if (oculto(el)) return;
    for (const q of el.getClientRects()) {
      if (!q.height) continue;
      const larga = q.width / k > colW + 4;
      const b = (q.bottom - fr.top) / k;
      const { p, col } = onde(q.left + 2);
      for (const c of larga ? [0, 1] : [col]) fundo.set(p * 2 + c, Math.max(fundo.get(p * 2 + c) ?? 0, b));
    }
  });
  const abertura = new Set();
  f.querySelectorAll(".livro-abertura, .folhear-colofao").forEach((el) => abertura.add(onde(el.getBoundingClientRect().left + 2).p));
  const semTexto = new Set();
  f.querySelectorAll(".folhear-fantasma, .folhear-capa, .folhear-guarda, .folhear-rosto, .folhear-sumario").forEach((el) => {
    for (const q of el.getClientRects()) semTexto.add(onde(q.left + 2).p);
  });
  const total = Math.max(...[...fundo.keys()].map((c) => Math.floor(c / 2))) + 1;
  for (let p = 0; p < total; p++) {
    if (semTexto.has(p) || abertura.has(p + 1)) continue;
    const a = (fundo.get(p * 2) ?? 0) / H, b = (fundo.get(p * 2 + 1) ?? 0) / H;
    const vazio = 1 - (a + b) / 2;
    if (vazio > 0.18) anotar(p, "vazia", Math.round(vazio * 100) + "% da mancha em branco");
  }

  // 4. Arte: quebrada, borrada ou cortada demais.
  for (const i of imgs) {
    if (oculto(i) || decoracao(i)) continue;
    const q = i.getBoundingClientRect();
    if (q.width < 8 || q.height < 8) continue;
    const pag = pagina(q.left + 2);
    const nome = (i.getAttribute("src") || "").split("/").slice(-2).join("/");
    if (!i.naturalWidth) { anotar(pag, "arte-quebrada", nome); continue; }
    const w = q.width / k, h = q.height / k;
    const ajuste = getComputedStyle(i).objectFit;
    const escala = ajuste === "cover" ? Math.max(w / i.naturalWidth, h / i.naturalHeight) : Math.min(w / i.naturalWidth, h / i.naturalHeight);
    if (escala > 1.6) anotar(pag, "arte-borrada", nome + " ampliada " + escala.toFixed(1) + "× (" + i.naturalWidth + "px num quadro de " + Math.round(w) + "px)");
    if (ajuste === "cover") {
      const quadro = w / h, arte = i.naturalWidth / i.naturalHeight;
      const visivel = Math.min(quadro, arte) / Math.max(quadro, arte);
      if (visivel < 0.45) anotar(pag, "recorte-forte", nome + " mostra só " + Math.round(visivel * 100) + "% da imagem");
    }
  }
  return { paginas: total, titulos, problemas };
})()`;

mkdirSync(SAIDA, { recursive: true });
for (const f of readdirSync(SAIDA)) rmSync(path.join(SAIDA, f), { force: true });

const resultado = await comNavegador(async ({ abrir }) => {
  const { enviar, avaliar } = await abrir("about:blank");
  await enviar("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { localStorage.setItem("theme", "dark"); localStorage.setItem("livro-folhear-modo", "livro"); localStorage.setItem("livro-folhear-papel", ${JSON.stringify(papel)}); } catch {}`,
  });
  await enviar("Emulation.setDeviceMetricsOverride", { width: LARGURA, height: ALTURA, deviceScaleFactor: 1, mobile: false });
  await enviar("Page.navigate", { url: `${BASE}/livro/folhear` });
  for (let i = 0; i < 240; i++) {
    if (await avaliar("!!document.querySelector('.folhear[data-pronto]')")) break;
    await dormir(250);
  }
  await dormir(1500);
  const medida = (await enviar("Runtime.evaluate", { expression: MEDIR, awaitPromise: true, returnByValue: true })).result?.result?.value;
  if (!medida) throw new Error("não consegui medir o livro (ele abriu?)");

  const fotos = [];
  if (!semFotos) {
    const duplas = Math.ceil(medida.paginas / 2);
    for (let d = 0; d < duplas; d++) {
      if (d > 0) {
        await enviar("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
        await enviar("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
        await dormir(620);
      }
      const foto = await enviar("Page.captureScreenshot", { format: "jpeg", quality: 72 });
      const nome = `dupla-${String(d).padStart(3, "0")}.jpg`;
      writeFileSync(path.join(SAIDA, nome), Buffer.from(foto.result.data, "base64"));
      fotos.push({ nome, paginas: d === 0 ? "capa" : `${d * 2}–${d * 2 + 1}` });
      if (d % 20 === 0) process.stdout.write(`  fotografando… dupla ${d} de ${duplas}\n`);
    }
  }
  return { medida, fotos };
});

// ── As folhas de contato: quatro duplas por folha ───────────────────────
const { medida, fotos } = resultado;
const CEL_W = 720;
const CEL_H = 450;
const ROTULO = 28;
const folhas = [];
for (let i = 0; i < fotos.length; i += 4) {
  const lote = fotos.slice(i, i + 4);
  const pecas = [];
  for (const [j, f] of lote.entries()) {
    const x = (j % 2) * CEL_W;
    const y = Math.floor(j / 2) * (CEL_H + ROTULO);
    pecas.push({ input: await sharp(path.join(SAIDA, f.nome)).resize(CEL_W, CEL_H).toBuffer(), left: x, top: y + ROTULO });
    const doLote = medida.problemas.filter((p) => f.paginas !== "capa" && f.paginas.split("–").map(Number).includes(p.pagina));
    const aviso = doLote.length ? ` — ${doLote.length} problema(s)` : "";
    pecas.push({
      input: Buffer.from(`<svg width="${CEL_W}" height="${ROTULO}"><rect width="100%" height="100%" fill="${doLote.length ? "#5a1d1d" : "#111"}"/><text x="8" y="19" font-size="15" font-family="Arial" fill="#fff">${f.paginas === "capa" ? "capa" : "páginas " + f.paginas}${aviso}</text></svg>`),
      left: x,
      top: y,
    });
  }
  const nome = `folha-${String(folhas.length + 1).padStart(2, "0")}.jpg`;
  await sharp({ create: { width: CEL_W * 2, height: (CEL_H + ROTULO) * 2, channels: 3, background: "#222" } })
    .composite(pecas)
    .jpeg({ quality: 78 })
    .toFile(path.join(SAIDA, nome));
  folhas.push(nome);
}

// ── O relatório ──────────────────────────────────────────────────────────
const NOMES = {
  titulo: "Título separado do texto",
  estouro: "Bloco passando da coluna ou da página",
  vazia: "Página com a mancha vazia",
  "arte-quebrada": "Arte que não carregou",
  "arte-borrada": "Arte ampliada demais (pode ficar borrada)",
  "recorte-forte": "Arte cortada demais pra caber no quadro",
  "linha-solta": "Tabela partida com uma linha só de um lado",
};
const porTipo = Object.fromEntries(Object.keys(NOMES).map((t) => [t, medida.problemas.filter((p) => p.tipo === t)]));
const linhas = [
  `# Revisão do livro — ${new Date().toLocaleString("pt-BR")}`,
  "",
  `${medida.paginas} páginas, ${medida.titulos} títulos conferidos, papel ${papel}.`,
  "",
  ...Object.entries(NOMES).map(([t, n]) => `- **${n}:** ${porTipo[t].length}`),
  "",
  ...Object.entries(NOMES).flatMap(([t, n]) =>
    porTipo[t].length ? [`## ${n}`, "", ...porTipo[t].map((p) => `- pág. ${p.pagina}: ${p.texto}`), ""] : []
  ),
  folhas.length ? `## Folhas de contato\n\n${folhas.map((f) => `- ${f}`).join("\n")}` : "",
];
writeFileSync(path.join(SAIDA, "relatorio.md"), linhas.join("\n"));

const html = `<!doctype html><meta charset="utf-8"><title>Revisão do livro</title>
<style>body{background:#141418;color:#e8e3d9;font:14px system-ui;margin:24px}h1{font-size:22px}
.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(460px,1fr));gap:18px}
figure{margin:0}img{width:100%;display:block;border:1px solid #333}figcaption{padding:4px 0}
.ruim figcaption{color:#ff9d8a}li{margin:2px 0}</style>
<h1>Revisão do livro — ${medida.paginas} páginas</h1>
<ul>${Object.entries(NOMES).map(([t, n]) => `<li>${n}: <b>${porTipo[t].length}</b></li>`).join("")}</ul>
<div class="grade">${fotos
  .map((f) => {
    const doLote = medida.problemas.filter((p) => f.paginas !== "capa" && f.paginas.split("–").map(Number).includes(p.pagina));
    return `<figure class="${doLote.length ? "ruim" : ""}"><img loading="lazy" src="${f.nome}"><figcaption>${f.paginas === "capa" ? "capa" : "páginas " + f.paginas}${doLote
      .map((p) => `<br>• pág. ${p.pagina}: ${NOMES[p.tipo]} — ${p.texto.replace(/</g, "&lt;")}`)
      .join("")}</figcaption></figure>`;
  })
  .join("")}</div>`;
writeFileSync(path.join(SAIDA, "index.html"), html);

console.log(`\n📖 ${medida.paginas} páginas · ${medida.titulos} títulos conferidos`);
for (const [t, n] of Object.entries(NOMES)) console.log(`${porTipo[t].length ? "⚠️ " : "✅"} ${n}: ${porTipo[t].length}`);
for (const p of medida.problemas.slice(0, 40)) console.log(`   pág. ${p.pagina} · ${NOMES[p.tipo]} · ${p.texto}`);
if (medida.problemas.length > 40) console.log(`   … e mais ${medida.problemas.length - 40} (ver relatorio.md)`);
console.log(`\n📁 ${path.relative(process.cwd(), SAIDA)}/ — index.html, relatorio.md, ${folhas.length} folhas de contato`);
const graves = porTipo.titulo.length + porTipo.estouro.length + porTipo["arte-quebrada"].length;
process.exit(graves ? 1 : 0);
