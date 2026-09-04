/**
 * O Chrome headless que as verificações de tela usam.
 *
 * Existe porque `check:contraste` e `check:mobile` precisam exatamente da mesma
 * coisa — abrir uma rota do site num navegador de verdade e rodar um pedaço de
 * JS dentro dela — e porque o pouco que há de perigoso nisso é sempre o mesmo:
 *
 * - `--force-color-profile=srgb` **não é opcional**. Sem ele o Chrome aplica o
 *   perfil de cor do monitor, e a cor que sai é outra: um `bg-wine-600`
 *   (#4a0e2e) saiu como #7d505e num print desta série, o suficiente pra
 *   inventar um defeito de contraste que não existia.
 * - Semear a página. Toda rota é medida via `/semente-dev`, que grava duas
 *   fichas e força o tema antes de redirecionar. Sem isso `/ficha` e
 *   `/personagens` abrem vazias e a medição não vê metade dos componentes.
 * - Fechar o que abriu. Uma aba esquecida por rota deixa o processo vivo no fim.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const BASE = process.env.BASE ?? "http://localhost:3000";

const CANDIDATOS = [
  process.env.CHROME,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);

export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** A URL que semeia fichas, força o tema e cai na rota pedida. */
export function urlSemeada(rota, tema = "dark") {
  return `${BASE}/semente-dev?tema=${tema}&ir=${encodeURIComponent(rota)}`;
}

export async function servidorNoAr() {
  try {
    return (await fetch(BASE)).ok;
  } catch {
    return false;
  }
}

function conversa(ws) {
  let id = 0;
  const pendentes = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (pendentes.has(m.id)) {
      pendentes.get(m.id)(m);
      pendentes.delete(m.id);
    }
  });
  return (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pendentes.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
}

/**
 * Abre um Chrome, entrega uma função `abrir(url)` e garante o fechamento.
 *
 * `abrir` devolve `{ enviar, fechar }`: `enviar` é o canal do DevTools Protocol
 * daquela aba, e `fechar` a descarta.
 */
export async function comNavegador(tarefa, { porta = Number(process.env.PORTA_CDP ?? 9333) } = {}) {
  const chrome = CANDIDATOS.find((c) => existsSync(c));
  if (!chrome) {
    console.error("❌ Não achei um Chrome. Aponte um com CHROME=/caminho/do/chrome.");
    process.exit(1);
  }

  const perfil = mkdtempSync(path.join(tmpdir(), "tela-"));
  const navegador = spawn(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--force-color-profile=srgb",
      `--remote-debugging-port=${porta}`,
      `--user-data-dir=${perfil}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  async function esperar() {
    for (let i = 0; i < 40; i++) {
      try {
        if ((await fetch(`http://127.0.0.1:${porta}/json/version`)).ok) return;
      } catch {
        /* ainda subindo */
      }
      await dormir(250);
    }
    throw new Error(
      "o Chrome não abriu a porta de depuração. Rodando de dentro do WSL com um Chrome do " +
        "Windows isso é esperado: a porta fica do lado de lá. Rode a checagem do mesmo lado do navegador."
    );
  }

  async function abrir(url) {
    const alvo = await (
      await fetch(`http://127.0.0.1:${porta}/json/new?${encodeURIComponent(url)}`, { method: "PUT" })
    ).json();
    const ws = new WebSocket(alvo.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r));
    const enviar = conversa(ws);
    await enviar("Page.enable");
    return {
      enviar,
      async avaliar(expressao) {
        const res = await enviar("Runtime.evaluate", { expression: expressao, returnByValue: true });
        return res.result?.result?.value;
      },
      async fechar() {
        ws.close();
        await fetch(`http://127.0.0.1:${porta}/json/close/${alvo.id}`);
      },
    };
  }

  try {
    await esperar();
    return await tarefa({ abrir });
  } finally {
    navegador.kill();
    // O Chrome ainda segura arquivos do perfil por um instante depois do kill, e
    // apagar cedo demais estoura EPERM no Windows — o que faria a checagem
    // "falhar" depois de já ter dado o veredito.
    await dormir(500);
    try {
      rmSync(perfil, { recursive: true, force: true });
    } catch {
      /* o SO limpa o temp depois */
    }
  }
}
