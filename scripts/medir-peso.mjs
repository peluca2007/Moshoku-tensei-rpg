/**
 * Mede o peso de cada página do site num celular médio — 2026-09-26.
 *
 * O autor disse "o site está pesado", e peso sem número vira opinião. Este
 * script abre cada rota num Chrome headless com a CPU 4× mais lenta (um
 * Android médio) e uma rede 4G, e mede o que a pessoa sente:
 *
 * - **Bytes**: quanto desceu pela rede (comprimido), separado em HTML, JS, CSS,
 *   imagem e fonte.
 * - **Tempo**: primeira pintura, maior pintura (LCP), e o tempo que a página
 *   passa travada em tarefa longa (TBT) — que é o "o site não responde".
 * - **Livro pronto**: no /livro/folhear, quando a diagramação termina
 *   (`data-pronto`), que é quando dá pra virar a página.
 *
 * Mede contra o BUILD (`npm run build && npx next start -p 3019`), nunca
 * contra o `next dev`: o dev compila sob demanda, não comprime e não minifica,
 * e o balão "Rendering…" que aparece nele não existe em produção.
 *
 *   BASE=http://localhost:3019 node scripts/medir-peso.mjs [/rota ...]
 */
import { comNavegador, dormir } from "./lib/navegador.mjs";

const BASE = process.env.BASE ?? "http://localhost:3019";
const ROTAS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/livro", "/livro/folhear", "/ficha", "/arvores", "/criar", "/loja", "/encontros", "/mestre"];

const kb = (b) => `${Math.round(b / 1024)} KB`;
const s = (ms) => `${(ms / 1000).toFixed(1)} s`;

await comNavegador(async ({ abrir }) => {
  const linhas = [];
  for (const rota of ROTAS) {
    const aba = await abrir("about:blank");
    await aba.enviar("Network.enable");
    await aba.enviar("Network.setCacheDisabled", { cacheDisabled: true });
    await aba.enviar("Emulation.setCPUThrottlingRate", { rate: 4 });
    await aba.enviar("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (9 * 1024 * 1024) / 8,
      uploadThroughput: (1.5 * 1024 * 1024) / 8,
    });
    await aba.enviar("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        window.__lcp = 0; window.__tbt = 0; window.__longas = 0;
        new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__tbt += Math.max(0, e.duration - 50); window.__longas = Math.max(window.__longas, e.duration); } }).observe({ type: "longtask", buffered: true });
      `,
    });
    const t0 = Date.now();
    await aba.enviar("Page.navigate", { url: BASE + rota });
    let pronto = null;
    for (let i = 0; i < 240; i++) {
      await dormir(250);
      const estado = await aba.avaliar(
        `document.readyState === "complete" && (!location.pathname.endsWith("/folhear") || !!document.querySelector("[data-pronto]"))`
      );
      if (estado) {
        pronto = Date.now() - t0;
        break;
      }
    }
    await dormir(1500);
    const m = await aba.avaliar(`(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const rec = performance.getEntriesByType("resource");
      const por = { html: nav.transferSize, js: 0, css: 0, img: 0, fonte: 0, outro: 0 };
      for (const r of rec) {
        const t = r.transferSize || r.encodedBodySize || 0;
        const u = r.name.split("?")[0];
        if (/\\.js$/.test(u) || r.initiatorType === "script") por.js += t;
        else if (/\\.css$/.test(u) || r.initiatorType === "css" && /css/.test(u)) por.css += t;
        else if (/\\.(woff2?|ttf|otf)$/.test(u)) por.fonte += t;
        else if (r.initiatorType === "img" || /\\.(webp|png|jpe?g|gif|avif|svg)$/.test(u) || /_next\\/image/.test(u)) por.img += t;
        else por.outro += t;
      }
      const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
      const maiores = rec
        .map((r) => [Math.round((r.transferSize || r.encodedBodySize) / 1024), Math.round(r.decodedBodySize / 1024), r.initiatorType, r.name.replace(location.origin, "").slice(0, 100)])
        .sort((a, b) => b[0] - a[0])
        .slice(0, 25);
      return { por, fcp, maiores, lcp: window.__lcp, tbt: window.__tbt, longa: window.__longas, nos: document.getElementsByTagName("*").length };
    })()`);
    await aba.fechar();
    const total = Object.values(m.por).reduce((a, b) => a + b, 0);
    linhas.push({
      rota,
      total: kb(total),
      html: kb(m.por.html),
      js: kb(m.por.js),
      css: kb(m.por.css),
      img: kb(m.por.img),
      fonte: kb(m.por.fonte),
      FCP: s(m.fcp),
      LCP: s(m.lcp),
      TBT: s(m.tbt),
      "maior trava": s(m.longa),
      pronto: pronto === null ? "—" : s(pronto),
      "nós DOM": m.nos,
    });
    console.error(`  ${rota} medida`);
    // DETALHE=1 lista os maiores arquivos (KB na rede, KB aberto, tipo, caminho).
    if (process.env.DETALHE) for (const x of m.maiores) console.error(`    ${x.join("  ")}`);
  }
  console.table(linhas);
});
