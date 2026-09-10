/**
 * O site sem servidor nenhum.
 *
 * ## Por que existe
 *
 * O `O-QUE-FALTA.md` listava o PWA como "a maior pendência funcional", com o
 * caso de uso escrito: **mesa física num porão sem sinal**. Um service worker é
 * exatamente o tipo de coisa que parece pronta e não está — ele registra sem
 * erro, o DevTools mostra o cache cheio, e aí o celular entra no elevador e a
 * página abre em branco porque faltava um chunk. Sem uma verificação que
 * DERRUBE o servidor, "funciona offline" é uma frase, não um fato.
 *
 * ## Por que ele sobe o próprio servidor, e por que o mata
 *
 * As outras checagens de tela pedem um `npm run dev` em outro terminal. Esta
 * não pode: em desenvolvimento o worker nem chega a ser registrado (ver
 * `SuporteOffline.tsx` — cache-primeiro em cima do Turbopack serviria o
 * JavaScript de dez minutos atrás), então só o build de produção tem o que
 * medir. Ela sobe um `next start` numa porta própria e o mata na metade.
 *
 * Matar o servidor é deliberado, e é melhor que o modo offline do DevTools: o
 * `Network.emulateNetworkConditions` do CDP se aplica à aba, e as buscas que o
 * SERVICE WORKER faz saem de outro alvo — dá pra "estar offline" na aba e o
 * worker continuar falando com o servidor, o que faria esta checagem passar
 * exatamente no caso que ela existe pra pegar. Servidor morto não tem essa
 * ambiguidade: a porta está fechada pra todo mundo.
 *
 * ## O que ele mede
 *
 * 1. **A lista de rotas do `public/sw.js` cobre o que o `next build` gerou.**
 *    Rota nova que ninguém lembrou de pré-cachear é o jeito mais provável de
 *    isso quebrar no futuro, e é silencioso — só aparece offline.
 * 2. **Cada rota abre com o servidor morto**, em carregamento completo (F5), e
 *    desenha o conteúdo dela: não basta responder HTML, tem que ter o `<h1>` e
 *    o JavaScript que hidrata a página.
 * 3. **A navegação suave** (clicar num link do menu) sobrevive offline — que é
 *    um caminho diferente do F5 e falha por outros motivos.
 * 4. **`/api/ficha-pdf` NÃO é servido do cache.** É a única rota que precisa do
 *    servidor, e um PDF guardado seria o PDF da ficha de outra pessoa.
 *
 *   npm run build
 *   npm run check:offline
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { comNavegador, dormir } from "./lib/navegador.mjs";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORTA = Number(process.env.PORTA_OFFLINE ?? 3100);
const BASE = `http://localhost:${PORTA}`;

/**
 * Rotas do build que NÃO devem estar no pré-cache, e o motivo de cada uma.
 * Qualquer outra que apareça no build e não esteja no `sw.js` é falha.
 */
const FORA_DO_PRECACHE = {
  "/_global-error": "página de erro do próprio framework",
  "/_not-found": "404 — não faz sentido guardar",
  "/icon.png": "favicon, servido pelo cache do navegador",
  "/manifest.webmanifest": "guardado à parte, pela constante MANIFESTO",
  "/semente-dev": "rota só das checagens headless",
};

const cor = { ok: "\x1b[32m", ruim: "\x1b[31m", fraco: "\x1b[90m", fim: "\x1b[0m" };
let falhas = 0;

function linha(estado, texto, detalhe = "") {
  const marca = estado === "ok" ? `${cor.ok}ok  ${cor.fim}` : `${cor.ruim}FALHA${cor.fim}`;
  if (estado !== "ok") falhas++;
  console.log(`${marca} ${texto.padEnd(24)} ${cor.fraco}${detalhe}${cor.fim}`);
}

/* ------------------------------------------------------------------ */
/* 1. A lista do worker contra o que o build gerou                     */
/* ------------------------------------------------------------------ */

const sw = readFileSync(resolve(raiz, "public/sw.js"), "utf8");
const bloco = sw.match(/const ROTAS = \[([\s\S]*?)\];/);
if (!bloco) {
  console.error("❌ Não achei o `const ROTAS = [...]` em public/sw.js.");
  process.exit(1);
}
const rotasDoWorker = [...bloco[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

const manifesto = resolve(raiz, ".next/prerender-manifest.json");
if (!existsSync(manifesto)) {
  console.error("❌ Não há build. Rode `npm run build` antes.");
  process.exit(1);
}
const rotasDoBuild = Object.keys(JSON.parse(readFileSync(manifesto, "utf8")).routes ?? {});

console.log("========================================");
console.log("OFFLINE — o site com o servidor morto");
console.log("========================================\n");
console.log(`Rotas no build............ ${rotasDoBuild.length}`);
console.log(`Rotas no pré-cache........ ${rotasDoWorker.length}\n`);

for (const rota of rotasDoBuild) {
  if (rota in FORA_DO_PRECACHE) continue;
  if (!rotasDoWorker.includes(rota)) {
    linha("falha", rota, "está no build e NÃO está no ROTAS de public/sw.js");
  }
}
for (const rota of rotasDoWorker) {
  if (!rotasDoBuild.includes(rota)) linha("falha", rota, "está no ROTAS do sw.js e não existe no build");
}
if (falhas === 0) linha("ok", "lista de rotas", `as ${rotasDoWorker.length} do worker batem com o build`);

/* ------------------------------------------------------------------ */
/* 2. Sobe o servidor                                                   */
/* ------------------------------------------------------------------ */

/*
 * O `next` é chamado pelo Node direto, e não por `npx`.
 *
 * `npx` no Windows exige `shell: true`, e o Node avisa (DEP0190) que passar
 * argumentos por shell não os escapa — o caminho do projeto aqui tem espaço e
 * acento ("Área de Trabalho"), que é exatamente a categoria de argumento que
 * um shell reescreve. Chamar o binário pelo caminho resolve as duas coisas.
 */
const servidor = spawn(process.execPath, [resolve(raiz, "node_modules/next/dist/bin/next"), "start", "-p", String(PORTA)], {
  cwd: raiz,
  stdio: "ignore",
  detached: process.platform !== "win32",
});

async function esperarServidor() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return true;
    } catch {
      /* ainda subindo */
    }
    await dormir(500);
  }
  return false;
}

/** Mata o `next start` E o processo de servidor que ele abriu por baixo. */
async function matarServidor() {
  if (process.platform === "win32") {
    spawn("taskkill", ["/PID", String(servidor.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    process.kill(-servidor.pid, "SIGKILL");
  }
  // Espera a porta fechar de verdade: derrubar o processo e navegar no mesmo
  // instante às vezes ainda pega a conexão em pé, e o teste passaria online.
  for (let i = 0; i < 40; i++) {
    try {
      await fetch(BASE, { signal: AbortSignal.timeout(300) });
    } catch {
      return true;
    }
    await dormir(250);
  }
  return false;
}

if (!(await esperarServidor())) {
  console.error(`❌ O \`next start\` não subiu em ${BASE}. Rode \`npm run build\` antes.`);
  await matarServidor();
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* 3. A medição                                                         */
/* ------------------------------------------------------------------ */

/** O que uma página tem que ter pra contar como "abriu": título e conteúdo. */
const MEDICAO = String.raw`JSON.stringify({
  titulo: document.querySelector("h1")?.textContent?.trim().slice(0, 40) ?? "",
  caracteres: document.body.innerText.trim().length,
  temMenu: !!document.querySelector("nav a[href='/livro']"),
  url: location.pathname,
})`;

/**
 * `avaliar` com `await`.
 *
 * O `avaliar` do harness devolve o valor de uma expressão síncrona, e tudo que
 * é interessante num service worker é Promise: `serviceWorker.ready`,
 * `caches.keys()`, `cache.keys()`. `awaitPromise` é uma opção do próprio
 * `Runtime.evaluate` — não precisa de espera em laço, nem de pendurar
 * resultado no `window`. As outras checagens não usam, então ele mora aqui e
 * não no harness.
 */
async function avaliarAsync(aba, expressao) {
  const res = await aba.enviar("Runtime.evaluate", {
    expression: expressao,
    awaitPromise: true,
    returnByValue: true,
  });
  return res.result?.result?.value;
}

/**
 * Espera a aba PARAR numa rota, em vez de dormir um tanto e torcer.
 *
 * A primeira versão desta checagem dormia 1,5s por rota e mediu cinco delas
 * ainda em `about:blank` — cinco falhas que não existiam, e que mudavam de
 * rota a cada execução. Espera fixa não serve aqui: com o servidor morto, o
 * tempo de abrir uma página é o tempo de o worker achar as coisas no disco, e
 * isso varia com o tamanho do que ela carrega (o `/livro` guarda 190 mil
 * caracteres de texto; o `/criar` guarda mil).
 *
 * A condição de parada é a página estar PRONTA — na rota certa, com o menu
 * hidratado e com texto na tela —, e não só ter saído do branco.
 */
async function esperarRota(aba, rota, limiteMs = 15000) {
  const fim = Date.now() + limiteMs;
  let ultimo = null;
  while (Date.now() < fim) {
    const bruto = await aba.avaliar(MEDICAO);
    if (bruto) {
      ultimo = JSON.parse(bruto);
      if (ultimo.url === rota && ultimo.temMenu && ultimo.caracteres > 200) return ultimo;
      // A `/offline` chegando no lugar de outra rota é um veredito, não um
      // estado intermediário: esperar mais não vai trocá-la pela certa.
      if (ultimo.url === "/offline" && rota !== "/offline") return ultimo;
    }
    await dormir(250);
  }
  return ultimo;
}

try {
  await comNavegador(async ({ abrir }) => {
    // --- Fase online: instala o worker -------------------------------
    const aba = await abrir(BASE);
    /*
     * Quem registra o worker é o SITE, e não esta checagem.
     *
     * Registrar aqui com uma URL própria (`?v=teste`) criaria uma segunda
     * inscrição no mesmo escopo, competindo com a que o `SuporteOffline.tsx`
     * acabou de fazer — e a checagem estaria medindo um worker que só ela
     * mesma instala. Esperar o `ready` mede o caminho de verdade: se o
     * registro do site quebrar, isto aqui estoura no tempo limite, que é
     * exatamente o que se quer saber.
     */
    const instalacao = await avaliarAsync(
      aba,
      String.raw`(async () => {
        try {
          const registro = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((_, rejeita) =>
              setTimeout(() => rejeita(new Error("o site não registrou o worker em 30s")), 30000)
            ),
          ]);
          const nomes = (await caches.keys()).filter((n) => n.startsWith("mt-"));
          const porCache = await Promise.all(
            nomes.map(async (n) => (await (await caches.open(n)).keys()).length)
          );
          return JSON.stringify({
            ativo: !!registro.active,
            nomes,
            total: porCache.reduce((a, b) => a + b, 0),
          });
        } catch (e) {
          return JSON.stringify({ erro: String(e) });
        }
      })()`
    );

    const dados = instalacao ? JSON.parse(instalacao) : { erro: "a aba não respondeu" };
    if (dados.erro || !dados.ativo) {
      linha("falha", "instalação do worker", dados.erro ?? "não ficou ativo");
      await aba.fechar();
      return;
    }
    /*
     * O piso de 40 não é chute: são 16 rotas de HTML mais os chunks, o CSS e as
     * imagens que elas citam. Um número baixo aqui significa que a varredura de
     * referências do `precachear()` parou de achar o que procura — o sintoma
     * seria o site abrir offline em branco, e é justamente o que não pode
     * passar despercebido.
     */
    if (dados.total < 40) {
      linha("falha", "pré-cache", `só ${dados.total} arquivos guardados — o site não cabe nisso`);
    } else {
      linha("ok", "pré-cache", `${dados.total} arquivos em ${dados.nomes.join(", ")}`);
    }
    await aba.fechar();

    // --- Mata o servidor ---------------------------------------------
    if (!(await matarServidor())) {
      linha("falha", "derrubar o servidor", `a porta ${PORTA} continuou respondendo`);
      return;
    }
    console.log(`
${cor.fraco}--- servidor morto; daqui pra baixo não existe rede ---${cor.fim}
`);

    // --- Fase offline: carregamento completo de cada rota ------------
    for (const rota of rotasDoWorker) {
      const t = await abrir(BASE + rota);
      const m = await esperarRota(t, rota);
      await t.fechar();

      if (!m) {
        linha("falha", rota, "a aba não respondeu em 15s");
        continue;
      }
      if (m.url !== rota) {
        linha("falha", rota, `caiu em ${m.url}`);
      } else if (rota !== "/offline" && m.titulo === "Sem internet") {
        linha("falha", rota, "serviu a página /offline — não estava em cache");
      } else if (!m.temMenu) {
        linha("falha", rota, "abriu sem o menu: o HTML veio, o JavaScript não");
      } else if (m.caracteres < 200) {
        linha("falha", rota, `só ${m.caracteres} caracteres na tela`);
      } else {
        linha("ok", rota, `"${m.titulo}" · ${m.caracteres} car.`);
      }
    }

    // --- Navegação suave ---------------------------------------------
    const nav = await abrir(BASE + "/ficha");
    await esperarRota(nav, "/ficha");
    await nav.avaliar(`document.querySelector("nav a[href='/livro']").click()`);
    const depois = (await esperarRota(nav, "/livro")) ?? {};
    await nav.fechar();
    if (depois.url === "/livro" && depois.caracteres > 200 && depois.titulo !== "Sem internet") {
      linha("ok", "navegação suave", `/ficha → /livro sem rede ("${depois.titulo}")`);
    } else {
      linha("falha", "navegação suave", `/ficha → /livro parou em ${depois.url} ("${depois.titulo ?? "?"}")`);
    }
  });

  /*
   * A rota do PDF fora do cache é verificada no CÓDIGO, e não na tela.
   *
   * Offline ela falha de qualquer jeito, com ou sem a regra — o teste de tela
   * passaria mesmo se a exclusão fosse removida. O que precisa ser garantido é
   * que ela nunca seja GUARDADA quando há rede, e isso é uma linha do worker.
   */
  if (!sw.includes('url.pathname.startsWith("/api/")')) {
    linha("falha", "/api/ fora do cache", "a regra que exclui /api/ sumiu do sw.js");
  } else {
    linha("ok", "/api/ fora do cache", "a rota do PDF nunca é guardada");
  }
} finally {
  await matarServidor();
}

console.log("\n========================================");
console.log(`Falhas.................................. ${falhas}`);
console.log("========================================\n");

if (falhas > 0) {
  console.error("❌ O site NÃO está inteiro sem rede.");
  process.exit(1);
}
console.log("✅ Todas as rotas abrem com o servidor morto, em F5 e em navegação suave.");
