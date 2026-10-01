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
 * - TABELA-TORRE: célula estreita demais transforma uma linha em parede alta.
 * - PARTIDA CURTA: tabela partida com só uma ou duas linhas de um lado.
 * - COLUNA CURTA: as duas colunas de uma página terminam muito desniveladas.
 * - CABEÇALHO ALTO: título de coluna quebra em mais de duas linhas.
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

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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
const arquivoDaAssinatura = opcao("assinatura", null);
const compararCom = opcao("comparar-assinatura", null);
const LARGURA = Number(opcao("largura", "1440"));
const ALTURA = Number(opcao("altura", "900"));
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
  const decoracao = (el) => el.matches(".livro-imagem-fundo, img.blur-2xl, .folhear-capa-fundo, .livro-fecho-fundo");

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

  // 1b. Tabela partida com só UMA OU DUAS linhas de um lado: no pé da
  // coluna ou sozinhas no alto da seguinte, com o cabeçalho repetido.
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
    if (ultimo.n <= 2) anotar(pagina(ultimo.left), "partida-curta", ultimo.n + " linha(s) sozinha(s) no alto: " + ultimo.texto);
    if (grupos[0].n <= 2) anotar(pagina(grupos[0].left), "partida-curta", grupos[0].n + " linha(s) sozinha(s) no pé: " + grupos[0].texto);
  });

  // 1c. Tabela-torre e cabeçalho alto. A medida é visual: largura e altura
  // computadas depois de todas as passadas, já na geometria da impressão.
  f.querySelectorAll(".livro-tabela").forEach((caixa) => {
    if (oculto(caixa) || getComputedStyle(caixa).columnSpan === "all" || caixa.closest(".folhear-larga")) return;
    const tabela = caixa.querySelector("table");
    if (!tabela) return;
    const celulas = [...tabela.querySelectorAll("th, td")].filter((el) => el.getClientRects()[0]?.width > 1);
    const estreita = celulas.find((el) => el.getClientRects()[0].width / k < 90);
    const linhaAlta = [...tabela.querySelectorAll("tbody tr")].find((tr) => {
      const q = tr.getClientRects()[0];
      const estilo = getComputedStyle(tr.cells[0] ?? tr);
      const lh = parseFloat(estilo.lineHeight) || parseFloat(estilo.fontSize) * 1.3;
      return q && q.height / k > lh * 6;
    });
    if (estreita && linhaAlta) {
      const q = linhaAlta.getClientRects()[0];
      anotar(pagina(q.left), "torre", Math.round(estreita.getClientRects()[0].width / k) + " px; linha de " + Math.round(q.height / k) + " px: " + (linhaAlta.textContent || "").trim().slice(0, 55));
    }
  });
  f.querySelectorAll(".livro-tabela th").forEach((th) => {
    if (oculto(th)) return;
    const q = th.getClientRects()[0];
    if (!q || q.height < 2) return;
    // A altura do <th> é compartilhada pela linha inteira; medir a caixa faria
    // um título curto parecer alto quando o vizinho quebra. Os retângulos do
    // conteúdo revelam quantas linhas este cabeçalho realmente ocupa.
    const faixa = document.createRange();
    faixa.selectNodeContents(th);
    const topos = [];
    for (const r of faixa.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      const topo = Math.round(r.top / k);
      if (!topos.some((v) => Math.abs(v - topo) <= 1)) topos.push(topo);
    }
    if (topos.length > 2) anotar(pagina(q.left), "cabecalho-alto", topos.length + " linhas: " + (th.textContent || "").trim().slice(0, 55));
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
  // A carta (e a seção) que pula de coluna deixa a CAIXA dela no vão: um pedaço
  // vazio que desce até o pé. Conta o que está dentro, não a caixa.
  f.querySelectorAll("p, li, tr, h2, h3, h4, figure, .livro-caixa, .livro-verbete > *, dl, blockquote, header, nav").forEach((el) => {
    if (oculto(el)) return;
    for (const q of el.getClientRects()) {
      if (!q.height) continue;
      const larga = q.width / k > colW + 4;
      const b = (q.bottom - fr.top) / k;
      const { p, col } = onde(q.left + 2);
      for (const c of larga ? [0, 1] : [col]) fundo.set(p * 2 + c, Math.max(fundo.get(p * 2 + c) ?? 0, b));
    }
  });
  // O selo do pé da coluna (preencherPes) mora numa camada fora do fluxo, e
  // preenche de propósito: conta como mancha ocupada.
  document.querySelectorAll(".folhear-pes .folhear-selo-pe").forEach((el) => {
    const q = el.getBoundingClientRect();
    if (!q.height) return;
    const { p, col } = onde(q.left + 2);
    fundo.set(p * 2 + col, Math.max(fundo.get(p * 2 + col) ?? 0, (q.bottom - fr.top) / k));
  });
  const abertura = new Set();
  f.querySelectorAll(".livro-abertura, .folhear-colofao").forEach((el) => abertura.add(onde(el.getBoundingClientRect().left + 2).p));
  const semTexto = new Set();
  f.querySelectorAll(".folhear-fantasma, .folhear-capa, .folhear-guarda, .folhear-rosto, .folhear-sumario").forEach((el) => {
    for (const q of el.getClientRects()) semTexto.add(onde(q.left + 2).p);
  });
  const total = Math.max(...[...fundo.keys()].map((c) => Math.floor(c / 2))) + 1;

  // Peça de margem a margem explica o desnível: o texto acima ou abaixo dela
  // forma outra faixa e não precisa terminar na mesma altura.
  const paginasComLarga = new Set();
  f.querySelectorAll(".folhear-larga, .livro-vitrine, .livro-prancha, figure").forEach((el) => {
    if (oculto(el)) return;
    for (const q of el.getClientRects()) if (q.height > 1 && q.width / k > colW + 4) paginasComLarga.add(onde(q.left + 2).p);
  });
  const finaisDeCapitulo = new Map();
  f.querySelectorAll(":scope > [data-capitulo]").forEach((cap) => {
    let ultima = -1;
    cap.querySelectorAll("p, li, tr, h2, h3, h4, figure, .livro-caixa, .livro-verbete, dl, blockquote").forEach((el) => {
      for (const q of el.getClientRects()) if (q.height > 1) ultima = Math.max(ultima, onde(q.left + 2).p);
    });
    if (ultima >= 0) finaisDeCapitulo.set(ultima, cap.dataset.capitulo || "capítulo");
  });
  for (let p = 0; p < total; p++) {
    if (semTexto.has(p) || abertura.has(p) || paginasComLarga.has(p)) continue;
    const a = fundo.get(p * 2) ?? 0, b = fundo.get(p * 2 + 1) ?? 0;
    if (!a || !b) continue;
    const diferenca = Math.abs(a - b) / H;
    if (diferenca > 0.3) {
      const fim = finaisDeCapitulo.get(p);
      anotar(p, "coluna-curta", Math.round(diferenca * 100) + "% de diferença" + (fim ? "; última página de " + fim : ""));
    }
  }
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
    // Com o foco marcado à mão (object-position no próprio elemento), o recorte é escolha, não acidente.
    if (ajuste === "cover" && !i.style.objectPosition) {
      const quadro = w / h, arte = i.naturalWidth / i.naturalHeight;
      const visivel = Math.min(quadro, arte) / Math.max(quadro, arte);
      if (visivel < 0.45) anotar(pag, "recorte-forte", nome + " mostra só " + Math.round(visivel * 100) + "% da imagem");
    }
  }
  // 5. A ASSINATURA DA DIAGRAMAÇÃO. Texto pode ser reescrito e arte pode ser
  // trocada, mas uma otimização deste algoritmo não pode mover uma peça. Para
  // cada peça que define a leitura, guarda a página e a coluna do primeiro
  // fragmento. A ordem desambigua cartas/tabelas sem id e também denuncia
  // qualquer mudança acidental na quantidade delas.
  const elementos = [];
  [...f.querySelectorAll("h2, h3, h4, .livro-verbete, table, figure")].forEach((el, ordem) => {
    if (oculto(el)) return;
    const q = [...el.getClientRects()].find((r) => r.width > 1 && r.height > 1);
    if (!q) return;
    const xp = (q.left - o) / k;
    const pag = Math.max(0, Math.floor(xp / P));
    const tipo = el.matches("h2, h3, h4") ? "titulo" : el.matches(".livro-verbete") ? "carta" : el.matches("table") ? "tabela" : "figura";
    const texto = (el.getAttribute("aria-label") || el.querySelector("figcaption")?.textContent || el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 100);
    elementos.push({
      tipo,
      ordem,
      id: el.id || null,
      texto,
      pagina: pag + 1,
      coluna: xp - pag * P < P / 2 ? 1 : 2,
    });
  });

  // PerformanceEntry não é determinística e, por isso, fica FORA da parte
  // comparada byte a byte. Mantemos todas as execuções: uma recomposição
  // inesperada também aparece no relatório, em vez de se esconder na média.
  const grupos = new Map();
  performance.getEntriesByType("measure").filter((e) => e.name.startsWith("folhear:")).forEach((e) => {
    const nome = e.name.slice("folhear:".length);
    const lista = grupos.get(nome) || [];
    lista.push(Math.round(e.duration * 100) / 100);
    grupos.set(nome, lista);
  });
  const tempos = Object.fromEntries([...grupos].map(([nome, execucoes]) => [nome, {
    execucoes,
    totalMs: Math.round(execucoes.reduce((s, n) => s + n, 0) * 100) / 100,
  }]));
  return { paginas: total, titulos, problemas, assinatura: { versao: 1, paginas: total, elementos }, tempos };
})()`;

mkdirSync(SAIDA, { recursive: true });
for (const f of readdirSync(SAIDA)) rmSync(path.join(SAIDA, f), { force: true });

const resultado = await comNavegador(async ({ abrir }) => {
  const { enviar, avaliar } = await abrir("about:blank");
  await enviar("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { localStorage.setItem("theme", "dark"); localStorage.setItem("livro-folhear-modo", "livro"); localStorage.setItem("livro-folhear-papel", ${JSON.stringify(papel)}); } catch {}`,
  });
  await enviar("Emulation.setDeviceMetricsOverride", { width: LARGURA, height: ALTURA, deviceScaleFactor: Number(process.env.ESCALA ?? 1), mobile: false });
  await enviar("Page.navigate", { url: `${BASE}/livro/folhear` });
  let pronto = false;
  for (let i = 0; i < 240; i++) {
    if (await avaliar("!!document.querySelector('.folhear[data-pronto]')")) {
      pronto = true;
      break;
    }
    await dormir(250);
  }
  if (!pronto) throw new Error(`o livro não ficou pronto em ${BASE}/livro/folhear`);
  await dormir(1500);
  const resposta = await enviar("Runtime.evaluate", { expression: MEDIR, awaitPromise: true, returnByValue: true });
  const medida = resposta.result?.result?.value;
  if (!Array.isArray(medida?.problemas)) {
    const detalhe = resposta.result?.exceptionDetails?.exception?.description ?? resposta.result?.result?.description ?? JSON.stringify(resposta.result);
    throw new Error(`não consegui medir o livro: ${detalhe}`);
  }

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
const relatorioDaAssinatura = {
  viewport: { largura: LARGURA, altura: ALTURA },
  papel,
  assinatura: medida.assinatura,
  tempos: medida.tempos,
};
if (arquivoDaAssinatura) {
  const destino = path.resolve(arquivoDaAssinatura);
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, `${JSON.stringify(relatorioDaAssinatura, null, 2)}\n`);
}
let assinaturaDivergiu = false;
if (compararCom) {
  const esperado = JSON.parse(readFileSync(path.resolve(compararCom), "utf8"));
  const antes = JSON.stringify(esperado.assinatura);
  const agora = JSON.stringify(medida.assinatura);
  assinaturaDivergiu = antes !== agora;
  if (assinaturaDivergiu) {
    const a = esperado.assinatura?.elementos ?? [];
    const b = medida.assinatura?.elementos ?? [];
    const i = Math.max(0, Array.from({ length: Math.max(a.length, b.length) }, (_, n) => n).find((n) => JSON.stringify(a[n]) !== JSON.stringify(b[n])) ?? 0);
    console.error(`\n❌ Assinatura diferente de ${compararCom}.`);
    console.error(`   esperado: ${JSON.stringify(a[i] ?? { paginas: esperado.assinatura?.paginas })}`);
    console.error(`   recebido: ${JSON.stringify(b[i] ?? { paginas: medida.assinatura?.paginas })}`);
  }
}
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
  torre: "Tabela-torre",
  "partida-curta": "Tabela partida com até duas linhas de um lado",
  "coluna-curta": "Coluna curta sem peça larga que explique",
  "cabecalho-alto": "Cabeçalho de tabela com mais de duas linhas",
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
  "## Tempos das passadas",
  "",
  ...Object.entries(medida.tempos).map(([nome, tempo]) => `- **${nome}:** ${tempo.totalMs.toFixed(2)} ms (${tempo.execucoes.map((n) => n.toFixed(2)).join(" + ")})`),
  "",
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
console.log("\n⏱️  Passadas da diagramação");
for (const [nome, tempo] of Object.entries(medida.tempos)) console.log(`   ${nome.padEnd(18)} ${tempo.totalMs.toFixed(2).padStart(9)} ms  [${tempo.execucoes.map((n) => n.toFixed(2)).join(" + ")}]`);
if (arquivoDaAssinatura) console.log(`\n🔏 Assinatura: ${path.relative(process.cwd(), path.resolve(arquivoDaAssinatura))}`);
if (compararCom && !assinaturaDivergiu) console.log(`✅ Assinatura idêntica a ${compararCom}`);
console.log(`\n📁 ${path.relative(process.cwd(), SAIDA)}/ — index.html, relatorio.md, ${folhas.length} folhas de contato`);
const graves = porTipo.titulo.length + porTipo.estouro.length + porTipo["arte-quebrada"].length;
process.exit(graves || assinaturaDivergiu ? 1 : 0);
