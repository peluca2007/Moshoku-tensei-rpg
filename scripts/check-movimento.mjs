/**
 * O ALARME DE PESO DO MOVIMENTO — `npm run check:movimento` (2026-10-05).
 *
 * ## Por que existe
 *
 * Os gestos das escolas no livro (0.1.140) gastavam de 108 a 400 ms de
 * processador por segundo, com CPU 4×, o tempo TODO em que a página ficava
 * aberta — e nada no projeto via isso: os checks perguntavam se a animação
 * acontece (`check:animacao`), não quanto ela custa. Conversa com o Codex,
 * proposta 3.3: um alarme como o `check:molde`, que pega a próxima regressão,
 * de quem for.
 *
 * ## O que mede (os critérios combinados com o Codex)
 *
 * - Navegador, janela (1440 × 900) e CPU (4× mais lenta) fixos.
 * - PARADO: espera todas as animações finitas terminarem (até 40 s) e mede o
 *   tempo de processador por segundo em várias amostras; vale a mediana. É o
 *   custo de ler a página depois que ela se acalma, e o teto é perto de zero.
 * - ANIMAÇÕES INFINITAS rodando na página parada: cada uma é custo que não
 *   acaba nunca. Lista quais são; reprova as que não estão na lista de
 *   permitidas abaixo (com o motivo de cada uma).
 * - ENTRADA (os primeiros 5 s depois de pronto) é impressa pra comparação, mas
 *   não reprova: um gesto pode custar enquanto toca, desde que acabe.
 *
 * ## Onde rodar
 *
 * O número que vale é o de PRODUÇÃO (`next build` + `next start`): o servidor
 * de desenvolvimento soma o próprio custo (HMR, avisos) e infla a medida. Em
 * desenvolvimento o check roda, avisa que é indicativo e inclui o `/ficha`
 * (que precisa da semente, inexistente em produção).
 *
 *   BASE=http://localhost:3010 npm run check:movimento
 *   SO=Fogo npm run check:movimento        (só as rotas cujo rótulo contém "Fogo")
 */
import { BASE, comNavegador, dormir } from "./lib/navegador.mjs";

/**
 * Teto do custo PARADO, em ms de processador por segundo com CPU 4×.
 * Calibrado em produção em 2026-10-05 (duas rodadas, 9 rotas): parado de 0,1 a
 * 1,3 ms/s, com um pico isolado de 8,6. Um gesto deixado infinito (o teste da
 * regressão) deu 37. O teto fica acima do ruído e bem abaixo da regressão.
 */
const TETO_PARADO = Number(process.env.TETO ?? 12);
const AMOSTRAS = 3;

/** Animações infinitas que podem continuar rodando, e por quê. */
const PERMITIDAS = [
  // Nenhuma por enquanto: todo gesto do livro e da ficha termina. A arena
  // (respiração e poeira) é infinita, mas só existe depois de "Assistir uma
  // batalha" e pausa fora da tela — não aparece nas rotas abaixo.
];

const ROTAS = [
  { rota: "/livro#arvore-fogo", rotulo: "livro · Fogo" },
  { rota: "/livro#arvore-agua", rotulo: "livro · Água" },
  { rota: "/livro#arvore-teorica", rotulo: "livro · Teórica" },
  { rota: "/livro#arvore-deus-do-norte", rotulo: "livro · Norte" },
  { rota: "/livro#arvore-bardo-e-interacao", rotulo: "livro · Bardo" },
  { rota: "/", rotulo: "capa" },
  { rota: "/arvores", rotulo: "árvores" },
  { rota: "/loja", rotulo: "loja" },
  { rota: "/novidades", rotulo: "novidades" },
];

async function emDesenvolvimento() {
  try {
    return (await fetch(`${BASE}/semente-dev`, { redirect: "manual" })).status !== 404;
  } catch {
    return false;
  }
}

// SO=fogo mede só as rotas cujo rótulo contém o texto.
if (process.env.SO) ROTAS.splice(0, ROTAS.length, ...ROTAS.filter((r) => r.rotulo.includes(process.env.SO)));

const dev = await emDesenvolvimento();
if (dev) ROTAS.push({ rota: "/ficha", rotulo: "ficha (semeada)", semente: true });

const metricas = async (aba) =>
  Object.fromEntries((await aba.enviar("Performance.getMetrics")).result.metrics.map((m) => [m.name, m.value]));

async function custo(aba, segundos) {
  const a = await metricas(aba);
  await dormir(segundos * 1000);
  const b = await metricas(aba);
  return ((b.TaskDuration - a.TaskDuration) * 1000) / segundos;
}

const mediana = (v) => [...v].sort((x, y) => x - y)[Math.floor(v.length / 2)];

console.log(`Peso do movimento em ${BASE}${dev ? " — SERVIDOR DE DESENVOLVIMENTO: números indicativos" : " (produção)"}`);
console.log(`CPU 4×, 1440 × 900; parado = mediana de ${AMOSTRAS} amostras de 4 s; teto ${TETO_PARADO} ms/s.\n`);
console.log("| Rota | Entrada (5 s) | Parado | Animações infinitas |\n| --- | ---: | ---: | --- |");

const falhas = [];
await comNavegador(async ({ abrir }) => {
  for (const { rota, rotulo, semente } of ROTAS) {
    const aba = await abrir("about:blank");
    await aba.enviar("Performance.enable");
    await aba.enviar("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    const destino = semente ? `${BASE}/semente-dev?tema=dark&ir=${encodeURIComponent(rota)}` : BASE + rota;
    await aba.enviar("Page.navigate", { url: destino });
    // Pronto: o livro marca data-pronto; as outras rotas, o load + um respiro.
    for (let i = 0; i < 120; i++) {
      const pronto = await aba.avaliar(
        `location.pathname.startsWith('/livro') ? !!document.querySelector('.folhear[data-pronto]') : (document.readyState === 'complete' && !location.pathname.startsWith('/semente-dev'))`
      );
      if (pronto) break;
      await dormir(250);
    }
    await dormir(1000);
    await aba.enviar("Emulation.setCPUThrottlingRate", { rate: 4 });
    const entrada = await custo(aba, 5);
    // Espera as animações finitas acabarem (até 40 s).
    for (let i = 0; i < 80; i++) {
      const rodando = await aba.avaliar(
        `document.getAnimations().filter(a => a.playState === 'running' && Number.isFinite(a.effect?.getComputedTiming().endTime)).length`
      );
      if (!rodando) break;
      await dormir(500);
    }
    const amostras = [];
    for (let i = 0; i < AMOSTRAS; i++) amostras.push(await custo(aba, 4));
    const parado = mediana(amostras);
    const infinitas = await aba.avaliar(`[...new Set(document.getAnimations()
      .filter(a => a.playState === 'running' && !Number.isFinite(a.effect?.getComputedTiming().endTime))
      .map(a => (a.animationName || a.id || 'sem nome').replace(/^.*__/, '') + ' em ' + (a.effect?.target?.dataset?.p ? 'peça ' + a.effect.target.dataset.p : (a.effect?.target?.className?.baseVal ?? a.effect?.target?.className ?? '?').toString().split(' ')[0])))]`);
    const proibidas = infinitas.filter((n) => !PERMITIDAS.some((p) => n.includes(p)));
    if (parado > TETO_PARADO) falhas.push(`${rotulo}: parado ${parado.toFixed(1)} ms/s (teto ${TETO_PARADO})`);
    for (const n of proibidas) falhas.push(`${rotulo}: animação infinita rodando parada — ${n}`);
    console.log(`| ${rotulo} | ${entrada.toFixed(1)} ms/s | ${parado.toFixed(1)} ms/s${parado > TETO_PARADO ? " ❌" : ""} | ${infinitas.length ? infinitas.join("; ") + (proibidas.length ? " ❌" : "") : "—"} |`);
    await aba.fechar();
  }
});

if (falhas.length) {
  console.log(`\n❌ ${falhas.length} problema(s):`);
  for (const f of falhas) console.log(`   ${f}`);
  console.log("\nAnimação que custa parada: faça ela terminar (iteration-count finito) ou pausar fora da tela;");
  console.log("se ela precisa mesmo rodar sempre, entre em PERMITIDAS com o motivo, no mesmo commit.");
  process.exit(1);
}
console.log("\n✅ Nenhuma rota gasta processador parada além do teto, e nenhuma animação infinita fica rodando.");
