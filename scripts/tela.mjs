/**
 * Fotografa uma rota do site, pra olhar com os próprios olhos.
 *
 * ## Por que existe
 *
 * O projeto tem quatro checks de navegador (`mobile`, `a11y`, `contraste`,
 * `offline`) e todos respondem perguntas de **certo ou errado**: transborda?
 * contraste passa no AA? a rota abre offline? Nenhum deles responde a pergunta
 * que sobra, que é a mais difícil de automatizar e a mais fácil de ignorar —
 * **isto está bonito?**
 *
 * Ele não reprova nada e não tem opinião. Só salva PNG, em qualquer largura, no
 * tema que você pedir, da página inteira ou de um pedaço. O julgamento continua
 * sendo de quem olha.
 *
 *   npm run start            # ou dev, noutro terminal
 *   node scripts/tela.mjs /livro
 *   node scripts/tela.mjs /livro --largura 390 --tema claro
 *   node scripts/tela.mjs /livro --ancora cap5-5 --altura 1400
 *
 * Opções:
 *   --largura N     largura da viewport (padrão 1280)
 *   --altura N      altura da viewport (padrão: página inteira)
 *   --tema dark|claro
 *   --ancora id     rola até o elemento antes de fotografar
 *   --saida arq.png
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { BASE, comNavegador, dormir, servidorNoAr } from "./lib/navegador.mjs";

const args = process.argv.slice(2);
/*
 * O Git Bash do Windows (MSYS) reescreve qualquer argumento que comece com "/"
 * num caminho do Windows antes do Node ver: `node scripts/tela.mjs /livro` chega
 * aqui como "C:/Program Files/Git/livro". Como toda rota deste site é curta e
 * conhecida, dá pra desfazer com segurança — fica só o último trecho.
 */
const bruta = args.find((a) => !a.startsWith("--")) ?? "/";
const rota = "/" + (bruta.split(/[\\/]/).filter(Boolean).pop() ?? "");
const opcao = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : padrao;
};

const largura = Number(opcao("largura", 1280));
const alturaPedida = opcao("altura", null);
const tema = opcao("tema", "dark") === "claro" ? "light" : "dark";
const ancora = opcao("ancora", null);
const pasta = ".telas";
const saida = opcao(
  "saida",
  path.join(pasta, `${rota.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}-${largura}-${tema}.png`)
);

if (!(await servidorNoAr())) {
  console.error(`❌ Nada respondendo em ${BASE}. Suba o servidor (npm run start) e tente de novo.`);
  process.exit(1);
}

mkdirSync(pasta, { recursive: true });

await comNavegador(async ({ abrir }) => {
  /*
   * Direto na rota, sem passar pela /semente-dev.
   *
   * `urlSemeada` existe pros checks que precisam de fichas no localStorage, e
   * ela redireciona por JavaScript depois de semear. Num headless recém-aberto
   * esse redirecionamento não acontece — a página fica parada, com corpo vazio,
   * e a foto sai inteiramente branca. Foi o primeiro defeito deste script.
   *
   * Fotografar não precisa de ficha nenhuma: o tema entra pelo mesmo atributo
   * que o site usa, antes da primeira pintura.
   */
  const { enviar, avaliar, fechar } = await abrir(`${BASE}${rota}`);
  await enviar("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { localStorage.setItem("tema", ${JSON.stringify(tema)}); } catch {}`,
  });

  await enviar("Emulation.setDeviceMetricsOverride", {
    width: largura,
    height: Number(alturaPedida ?? 900),
    // 1, e não 2: em 1280px de largura, escala 2 gera um PNG de 2560px que
    // estoura o limite de qualquer visualizador. Nitidez não é o ponto aqui.
    deviceScaleFactor: 1,
    mobile: largura < 700,
  });
  /*
   * `urlSemeada` cai em /semente-dev, que semeia as fichas e SÓ ENTÃO redireciona
   * pra rota pedida. Fotografar por tempo fixo pega a tela de trânsito — a
   * primeira versão deste script salvou um PNG inteiramente branco por isso.
   * Espera-se a rota final chegar, e depois que a fonte e a primeira pintura
   * assentarem.
   */
  for (let i = 0; i < 60; i++) {
    const [caminho, estado] = String(
      await avaliar("location.pathname + '|' + document.readyState")
    ).split("|");
    if (caminho === rota && estado === "complete") break;
    await dormir(250);
  }
  await dormir(1500);

  /*
   * A âncora vira um RECORTE, não uma rolagem.
   *
   * `scrollIntoView` + captura da viewport não funciona quando as métricas foram
   * sobrescritas por `setDeviceMetricsOverride`: a página rola, e a foto sai do
   * topo mesmo assim. `clip` em coordenadas absolutas do documento não depende
   * de onde a viewport está — e é o que `captureBeyondViewport` sabe recortar.
   */
  let recorte = null;
  if (ancora) {
    const topo = await avaliar(`(() => {
      const el = document.getElementById(${JSON.stringify(ancora)});
      if (!el) return null;
      return el.getBoundingClientRect().top + window.scrollY;
    })()`);
    if (topo === null || topo === undefined) {
      console.error(`❌ Não achei #${ancora} na página.`);
      process.exit(1);
    }
    recorte = {
      x: 0,
      y: Math.max(0, topo - 24),
      width: largura,
      height: Number(alturaPedida ?? 900),
      scale: 1,
    };
  }

  // Sem --altura, cresce a viewport até a página inteira: `captureBeyondViewport`
  // sozinho não resolve porque layout sticky e `100vh` continuam ancorados na
  // altura declarada, e a foto sai com o cabeçalho repetido no meio.
  if (!alturaPedida && !recorte) {
    const alturaTotal = Math.min((await avaliar("document.documentElement.scrollHeight")) ?? 900, 30000);
    await enviar("Emulation.setDeviceMetricsOverride", {
      width: largura,
      height: alturaTotal,
      deviceScaleFactor: 1,
      mobile: largura < 700,
    });
    await dormir(800);
  }

  // `captureBeyondViewport` fotografa a página inteira, ignorando a viewport. Com
  // --altura isso é o oposto do pedido: no /livro, que tem 87 mil pixels de
  // rolagem, ele devolve um PNG de 87 mil pixels de altura.
  const foto = await enviar("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: !alturaPedida || Boolean(recorte),
    ...(recorte ? { clip: recorte } : {}),
  });
  writeFileSync(saida, Buffer.from(foto.result.data, "base64"));
  console.log(`📷 ${saida}  (${largura}px, ${tema}${ancora ? `, âncora #${ancora}` : ""})`);
  await fechar();
});
