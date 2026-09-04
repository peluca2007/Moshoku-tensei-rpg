/**
 * Varredura de contraste das rotas, nos dois temas.
 *
 * ## Por que não dá pra fazer isso olhando print
 *
 * O `PROGRESS.md` já dizia "o print é o teste que falta", e o print resolve
 * layout. Contraste ele não resolve, por duas razões que esta sessão descobriu
 * na marra:
 *
 * 1. **Print tem perfil de cor.** Os primeiros prints desta varredura saíram do
 *    Chrome sem `--force-color-profile=srgb`, e um botão `bg-wine-600`
 *    (#4a0e2e) apareceu no PNG como #7d505e. Isso é o bastante pra "achar" um
 *    defeito de contraste que não existe — e eu achei, e quase corrigi.
 * 2. **O olho não mede.** Um texto a 4,3:1 e um a 4,7:1 são indistinguíveis
 *    olhando, e um passa e o outro não.
 *
 * A conta tem que sair de dentro do navegador, com a cor computada.
 *
 * ## O que ele mede, e as três armadilhas que ele desarma
 *
 * Para cada nó de texto: a cor computada contra o fundo EFETIVO, comparados
 * com o mínimo do WCAG AA (4,5:1, ou 3:1 pra texto grande).
 *
 * - **Cor em `lab()`.** O Tailwind v4 emite `color-mix(in oklab, …)`, e o
 *   computado disso volta como `lab(94.41 0.68 10.85 / 0.7)`. Um parser que lê
 *   números da string entende 94.41 como canal R e devolve uma cor podre: foi
 *   assim que um card creme virou "rgb(142,74,76)" e a varredura acusou 441
 *   falsos positivos numa página só. Aqui a cor é pintada num canvas 1×1 sobre
 *   preto e sobre branco, e cor e alfa saem resolvidos das duas medidas — o
 *   navegador converte qualquer formato pra sRGB, hoje e no formato que
 *   inventarem depois.
 * - **Fundo translúcido.** Quase todo card do site é `bg-parchment-50/70`, e o
 *   fundo real é a pilha de camadas até o primeiro ancestral opaco.
 * - **`opacity` no ancestral.** Um `opacity-70` no card puxa texto e fundo
 *   juntos na direção da página. É invisível numa inspeção de CSS e foi o que
 *   derrubou 128 textos da Loja abaixo do mínimo.
 *
 * ## O que ele NÃO reprova, de propósito
 *
 * - Controle **desabilitado** — o WCAG 1.4.3 isenta componente inativo, e um
 *   botão apagado é justamente como se comunica que ele está apagado.
 * - Elemento **`aria-hidden`** — ornamento não é texto.
 * - Texto sobre **imagem** de verdade (não a textura do body): a conta não sabe
 *   ler uma foto, e fingir que sabe daria número inventado.
 *
 * ## Como rodar
 *
 *   npm run dev                      # em outro terminal
 *   npm run check:contraste
 *
 * Precisa de um Chrome; procura os caminhos usuais ou usa $CHROME.
 */
import { BASE, comNavegador, dormir, servidorNoAr, urlSemeada } from "./lib/navegador.mjs";

const ROTAS = ["/", "/ficha", "/arvores", "/personagens", "/iniciativa", "/encontros", "/loja", "/livro", "/criar"];
const TEMAS = process.env.TEMA ? [process.env.TEMA] : ["light", "dark"];

const AUDITORIA = String.raw`(() => {
  const canal = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  const razao = (a, b) => { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };

  // Ver o cabeçalho: pintar num canvas é a única leitura que não depende do
  // formato em que o navegador resolveu devolver a cor.
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const cache = new Map();
  function paraRgba(cor) {
    if (cache.has(cor)) return cache.get(cor);
    const medir = (base) => {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = base; cx.fillRect(0, 0, 1, 1);
      cx.fillStyle = cor;  cx.fillRect(0, 0, 1, 1);
      return cx.getImageData(0, 0, 1, 1).data;
    };
    const preto = medir("#000"), branco = medir("#fff");
    const a = 1 - (branco[0] - preto[0]) / 255;
    const r = a > 0.001
      ? { rgb: [preto[0] / a, preto[1] / a, preto[2] / a].map((c) => Math.min(255, c)), a }
      : { rgb: [0, 0, 0], a: 0 };
    cache.set(cor, r);
    return r;
  }
  const sobre = (frente, a, fundo) => frente.map((c, i) => c * a + fundo[i] * (1 - a));

  function fundoDe(el) {
    let atual = el, pilha = [], arte = false;
    while (atual) {
      const cs = getComputedStyle(atual);
      // A textura do BODY não conta como arte: é uma folha de pergaminho de
      // baixíssimo contraste atrás de uma cor sólida. Contá-la dispensaria todo
      // card translúcido do tema claro, que é quase a página inteira.
      const daPagina = atual === document.body || atual === document.documentElement;
      if (!daPagina && cs.backgroundImage !== "none") arte = true;
      const { rgb: cor, a } = paraRgba(cs.backgroundColor);
      if (a > 0) { pilha.push([cor, a]); if (a >= 0.999) break; }
      atual = atual.parentElement;
    }
    const doBody = paraRgba(getComputedStyle(document.body).backgroundColor);
    let fundo = doBody.a > 0 ? doBody.rgb.slice() : [255, 255, 255];
    for (let i = pilha.length - 1; i >= 0; i--) fundo = sobre(pilha[i][0], pilha[i][1], fundo);
    return { fundo, arte };
  }

  const achados = [];
  for (const el of document.querySelectorAll("body *")) {
    const texto = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").trim();
    if (!texto) continue;
    if (el.closest("[aria-hidden='true'],[disabled],[aria-disabled='true']")) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const { rgb: cor, a: alfaTexto } = paraRgba(cs.color);
    if (alfaTexto === 0) continue;
    const { fundo, arte } = fundoDe(el);
    if (arte) continue;
    let opacidade = 1, p = el;
    while (p) { opacidade *= Number(getComputedStyle(p).opacity); p = p.parentElement; }
    if (opacidade < 0.05) continue;
    const efetiva = sobre(cor, alfaTexto * opacidade, fundo);
    const px = parseFloat(cs.fontSize);
    const peso = parseInt(cs.fontWeight, 10) || 400;
    const minimo = px >= 24 || (px >= 18.66 && peso >= 700) ? 3 : 4.5;
    const rz = razao(efetiva, fundo);
    if (!Number.isFinite(rz) || rz >= minimo) continue;
    achados.push({
      texto: texto.slice(0, 58), razao: Number(rz.toFixed(2)), minimo, px, peso,
      cor: cs.color, fundo: "rgb(" + fundo.map(Math.round).join(",") + ")",
      classe: String(el.className.baseVal ?? el.className ?? "").slice(0, 88),
    });
  }
  return JSON.stringify(achados);
})()`;

if (!(await servidorNoAr())) {
  console.error(`❌ ${BASE} não respondeu. Rode \`npm run dev\` antes.`);
  process.exit(1);
}

let total = 0;
await comNavegador(async ({ abrir }) => {
  console.log("========================================");
  console.log("VARREDURA DE CONTRASTE — WCAG AA (4,5:1; 3:1 pra texto grande)");
  console.log("========================================");

  for (const tema of TEMAS) {
    for (const rota of ROTAS) {
      const aba = await abrir(urlSemeada(rota, tema));
      await dormir(Number(process.env.ESPERA_MS ?? 5000));
      const achados = JSON.parse((await aba.avaliar(AUDITORIA)) ?? "[]");
      await aba.fechar();

      total += achados.length;
      console.log(`${achados.length === 0 ? "ok " : "!! "}${tema.padEnd(5)} ${rota.padEnd(14)} ${achados.length}`);
      for (const a of achados.sort((x, y) => x.razao - y.razao).slice(0, 8)) {
        console.log(`      ${String(a.razao).padStart(5)}:1 (min ${a.minimo})  ${a.cor} sobre ${a.fundo}  ${a.px}px/${a.peso}`);
        console.log(`      "${a.texto}"`);
        console.log(`      .${a.classe}`);
      }
    }
  }
});

console.log("========================================");
if (total > 0) {
  console.error(`\n❌ ${total} texto(s) abaixo do mínimo do WCAG AA.`);
  process.exit(1);
}
console.log("\n✅ Nenhum texto abaixo do mínimo do WCAG AA nas nove rotas, nos dois temas.");
