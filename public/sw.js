/**
 * O site inteiro, sem internet (0.1.15).
 *
 * ## O caso de uso
 *
 * Está no `O-QUE-FALTA.md` desde o começo, e é literal: **mesa física num porão
 * sem sinal.** As fichas já viviam no `localStorage` — o que morria sem rede
 * era o SITE, o HTML e o JavaScript que desenham a ficha. De nada adianta o
 * personagem estar salvo no aparelho se a página que o mostra precisa de um
 * servidor pra chegar.
 *
 * ## Por que escrito à mão, e não com uma biblioteca
 *
 * O guia de PWA do Next (`node_modules/next/dist/docs/01-app/02-guides/
 * progressive-web-apps.md`) sugere o Serwist pra cache offline. Ele resolveria,
 * e traria junto um plugin de build, um passo de geração e um manifesto de
 * pré-cache — pra um site de nove rotas estáticas. O que este arquivo faz cabe
 * em quatro estratégias, e todas as quatro estão escritas abaixo, legíveis.
 *
 * ## Por que NÃO usamos o `experimental.useOffline` do Next
 *
 * O Next 16 tem um `useOffline` que segura navegações e Server Actions quando a
 * rede cai, e as repete quando ela volta. Ele resolve OUTRO problema: a rede
 * que cai no meio da sessão. O nosso é a rede que nunca existiu — e a própria
 * documentação diz que "um reload completo offline continua falhando, porque o
 * navegador precisa da rede pra receber o HTML; carregamento offline de
 * verdade exigiria um service worker".
 *
 * Pior: os dois BRIGAM. A recuperação deste worker pra uma rota que não está em
 * cache é deixar o pedido de RSC falhar, o que faz o roteador do Next cair numa
 * navegação de página inteira — que o worker então serve do cache. Com o
 * `useOffline` ligado, esse pedido não falharia: ficaria pendente pra sempre, e
 * o clique no link não faria absolutamente nada. Um recurso experimental que
 * transforma "abre a versão em cache" em "trava em silêncio" não entra.
 *
 * ## As quatro estratégias
 *
 * | O quê                        | Como                    | Por quê |
 * |------------------------------|-------------------------|---------|
 * | `/_next/static`, `/_next/image` | cache primeiro       | o nome do arquivo carrega um hash do conteúdo: se o conteúdo mudar, a URL muda, e a versão velha nunca é servida por engano |
 * | imagens e fontes de `public/`| cache primeiro, revalidando atrás | não têm hash no nome: `divisor.png` continua `divisor.png` depois de trocado, então o cache serve rápido e busca a nova em segundo plano |
 * | navegação e RSC              | rede primeiro           | a página é o que muda a cada deploy; o cache aqui é a rede de segurança, não a fonte |
 * | `/api/*`                     | nunca                   | a exportação de PDF depende do binário do Typst no servidor. Guardar essa resposta seria guardar o PDF de uma ficha e devolvê-lo pra outra |
 *
 * ## A versão vem da URL de registro
 *
 * `SuporteOffline.tsx` registra este arquivo como `/sw.js?v=0.1.15`. É de onde
 * sai o nome dos caches, e é o que faz uma versão nova apagar os caches da
 * anterior. O truque existe porque este é um arquivo ESTÁTICO em `public/` —
 * não passa por build, então não há onde injetar um id de build. A URL de
 * registro é o único canal que sobra, e trocá-la também é o que faz o navegador
 * reinstalar o worker.
 */

const VERSAO = new URL(self.location.href).searchParams.get("v") ?? "dev";
const CACHE_PAGINAS = `mt-paginas-${VERSAO}`;
const CACHE_ESTATICO = `mt-estatico-${VERSAO}`;
const NOSSOS_CACHES = [CACHE_PAGINAS, CACHE_ESTATICO];

/**
 * As rotas que entram em cache na instalação, antes de alguém as visitar.
 *
 * É o `next build` inteiro, tirando `/api/ficha-pdf` (precisa de servidor),
 * `/semente-dev` (só serve às checagens headless) e `/_not-found`. Deliberado:
 * pré-cachear só a home faria o site funcionar offline apenas nas páginas que a
 * pessoa por acaso abriu antes de descer pro porão, e "por acaso" não é uma
 * garantia que dá pra escrever na landing.
 *
 * As três de `/criar` são as três vias de criação de personagem, e nenhuma
 * delas é opcional: quem chega na mesa sem ficha cria uma ali, e é justamente
 * quem tem mais chance de estar sem sinal.
 *
 * **Se uma rota nova for criada, ela entra aqui.** O `check:offline` falha se
 * não entrar — ele compara esta lista com o que o `next build` gerou, e é de
 * propósito que a lista seja escrita à mão: uma lista gerada estaria sempre
 * certa e nunca contaria que o site cresceu.
 */
const ROTAS = [
  "/",
  "/mesa",
  "/ficha",
  "/ficha/importar",
  "/arvores",
  "/personagens",
  "/iniciativa",
  "/encontros",
  "/mestre",
  "/comparar",
  "/encontros/importar",
  "/loja",
  "/livro",
  "/busca",
  "/criar",
  "/criar/entrevista",
  "/criar/manual",
  "/criar/roleta",
  "/offline",
];

/**
 * Os arquivos que o CSS pede e que NENHUM HTML menciona.
 *
 * `pergaminho.avif` e `fibra.jpg` são `background-image` do `globals.css`, e
 * `divisor.png` é o ornamento do rodapé. Como só aparecem dentro da folha de
 * estilo, a varredura de HTML abaixo não os encontra — e sem eles o site
 * offline abre com o pergaminho branco, que é o único jeito de ele parecer
 * quebrado tendo funcionado.
 */
const ASSETS_DO_CSS = ["/texturas/pergaminho.avif", "/texturas/fibra.jpg", "/ornamentos/divisor.png"];

/**
 * O manifesto entra no cache junto com o resto.
 *
 * Ele só é lido na hora de instalar o app, e quem instala está online — mas o
 * Chrome relê o manifesto de tempos em tempos pra saber se o ícone ou o nome
 * mudaram, e relendo offline sem cache ele conclui que o app foi desinstalado
 * do servidor. É um arquivo de 1 KB pra não correr esse risco.
 */
const MANIFESTO = "/manifest.webmanifest";

/** Extensões que contam como asset estático de `public/`. */
const EXTENSOES_DE_ASSET = /\.(png|jpe?g|avif|webp|gif|svg|ico|woff2?|ttf|otf)$/i;

/** Tudo que o HTML de uma rota carrega e que o navegador buscaria sozinho. */
const REFERENCIAS_NO_HTML = /\/_next\/(?:static\/[^"'\\\s>)]+|image\?[^"'\\\s>)]+)/g;

/**
 * Descarta o `_rsc` da chave do cache.
 *
 * O roteador do Next pede a mesma rota como `/loja?_rsc=1a2b3c`, e esse sufixo
 * muda a cada build. Sem normalizar, o payload guardado numa visita nunca seria
 * encontrado na seguinte — o cache encheria de entradas mortas e acertaria
 * zero vez.
 */
function chaveDeCache(url) {
  const u = new URL(url);
  u.searchParams.delete("_rsc");
  return u.toString();
}

/** Um pedido é de RSC quando o roteador o marca — por cabeçalho ou por parâmetro. */
function ehRSC(request) {
  return request.headers.get("RSC") === "1" || new URL(request.url).searchParams.has("_rsc");
}

/**
 * Guarda uma resposta, se ela for guardável.
 *
 * `response.ok` deixa de fora 404 e 500 — servir um erro guardado por semanas é
 * pior que não servir nada. `type === "basic"` deixa de fora resposta opaca de
 * outra origem, cujo status a gente nem consegue ler pra saber se deu certo.
 */
async function guardar(nomeDoCache, request, response) {
  if (!response || !response.ok || response.type !== "basic") return response;
  const cache = await caches.open(nomeDoCache);
  await cache.put(chaveDeCache(request.url), response.clone());
  return response;
}

async function doCache(request) {
  const cache = await caches.open(CACHE_PAGINAS);
  const emPaginas = await cache.match(chaveDeCache(request.url));
  if (emPaginas) return emPaginas;
  const estatico = await caches.open(CACHE_ESTATICO);
  return estatico.match(chaveDeCache(request.url));
}

/* ------------------------------------------------------------------ */
/* Instalação                                                          */
/* ------------------------------------------------------------------ */

/**
 * Busca o HTML das rotas, guarda, e guarda também tudo que elas referenciam.
 *
 * O segundo passo é o que faz a coisa funcionar. Guardar só o HTML de `/loja`
 * daria, offline, uma página em branco com um `<script>` apontando pra um
 * arquivo que não está em lugar nenhum: o HTML do App Router é uma casca, e
 * quem desenha a loja é o JavaScript que ele manda buscar. Por isso o HTML é
 * lido como TEXTO e varrido atrás das URLs de `/_next/` que ele cita — os
 * chunks, o CSS e as imagens já otimizadas pelo `next/image`.
 *
 * Falha de uma rota não derruba a instalação (`Promise.allSettled`): melhor um
 * app offline com oito rotas do que um worker que nunca instalou porque uma
 * delas devolveu 500 no exato segundo do registro.
 */
async function precachear() {
  const paginas = await caches.open(CACHE_PAGINAS);
  const estatico = await caches.open(CACHE_ESTATICO);

  const referencias = new Set();

  await Promise.allSettled(
    ROTAS.map(async (rota) => {
      const resposta = await fetch(rota, { cache: "reload", credentials: "same-origin" });
      if (!resposta.ok) throw new Error(`${rota}: ${resposta.status}`);
      const html = await resposta.clone().text();
      for (const achado of html.matchAll(REFERENCIAS_NO_HTML)) {
        // O HTML traz as URLs com `&amp;` — buscá-las assim devolve 400.
        referencias.add(achado[0].replace(/&amp;/g, "&"));
      }
      await paginas.put(rota, resposta);
    })
  );

  await Promise.allSettled(
    [...referencias, ...ASSETS_DO_CSS, MANIFESTO].map(async (url) => {
      const resposta = await fetch(url, { cache: "reload", credentials: "same-origin" });
      if (resposta.ok) await estatico.put(url, resposta);
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precachear());
});

/* ------------------------------------------------------------------ */
/* Ativação                                                            */
/* ------------------------------------------------------------------ */

/*
 * Note que NÃO há `skipWaiting()` aqui.
 *
 * Um worker novo que assume no meio da sessão troca, embaixo de uma página já
 * aberta, os chunks que ela ainda vai pedir — e o pedido do chunk velho passa a
 * dar 404. Em vez disso ele espera, e o `SuporteOffline.tsx` oferece o botão
 * "Atualizar" pra quem quiser trocar na hora. Quem não quiser troca sozinho na
 * próxima vez que fechar todas as abas.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const nomes = await caches.keys();
      await Promise.all(
        nomes.filter((n) => n.startsWith("mt-") && !NOSSOS_CACHES.includes(n)).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "ASSUMIR_AGORA") self.skipWaiting();
});

/* ------------------------------------------------------------------ */
/* Busca                                                               */
/* ------------------------------------------------------------------ */

/** Cache primeiro: só vai à rede quando não tem. Pra URL que carrega hash. */
async function cachePrimeiro(request, nomeDoCache) {
  const guardado = await doCache(request);
  if (guardado) return guardado;
  const resposta = await fetch(request);
  return guardar(nomeDoCache, request, resposta);
}

/**
 * Cache primeiro, revalidando atrás. Pra arquivo de `public/`, cujo nome não
 * muda quando o conteúdo muda: serve o que tem na hora e busca o novo em
 * segundo plano, que chega na visita seguinte.
 */
async function cacheERevalida(request) {
  const guardado = await doCache(request);
  const daRede = fetch(request)
    .then((resposta) => guardar(CACHE_ESTATICO, request, resposta))
    .catch(() => null);
  return guardado ?? daRede.then((r) => r ?? Response.error());
}

/**
 * Rede primeiro, com o cache de rede de segurança.
 *
 * Sem cache E sem rede, a resposta depende de quem perguntou:
 *
 * - **Navegação**: devolve a página `/offline`, que explica o que está faltando.
 *   Devolver `Response.error()` daria a tela de dinossauro do navegador, que
 *   não distingue "o site não guardou esta rota" de "o site saiu do ar".
 * - **RSC**: devolve o erro de propósito. É o que faz o roteador do Next
 *   desistir da navegação suave e recarregar a página inteira — que passa de
 *   novo por aqui, agora como navegação, e encontra o HTML em cache. Devolver
 *   `/offline` aqui entregaria HTML a quem esperava um payload de RSC, e o
 *   roteador quebraria com um erro de parse em vez de navegar.
 */
async function redePrimeiro(request) {
  try {
    const resposta = await fetch(request);
    return await guardar(CACHE_PAGINAS, request, resposta);
  } catch {
    const guardado = await doCache(request);
    if (guardado) return guardado;
    if (ehRSC(request)) return Response.error();
    const offline = await caches.match("/offline");
    return offline ?? Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Só GET de mesma origem. POST não é cacheável por definição, e resposta de
  // outra origem vem opaca — guardá-la é guardar uma caixa que não dá pra abrir.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // A rota do PDF precisa do servidor, e ponto. Ver a tabela lá em cima.
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname === "/_next/image") {
    event.respondWith(cachePrimeiro(request, CACHE_ESTATICO));
    return;
  }

  if (EXTENSOES_DE_ASSET.test(url.pathname) || url.pathname === MANIFESTO) {
    event.respondWith(cacheERevalida(request));
    return;
  }

  if (request.mode === "navigate" || ehRSC(request)) {
    event.respondWith(redePrimeiro(request));
  }
});
