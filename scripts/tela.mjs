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
  /*
   * A chave é "theme", e não "tema" — 0.1.65.
   *
   * É o que o `next-themes` lê, e é o que o /semente-dev grava. Enquanto este
   * script gravava "tema", TODA foto saía no tema escuro: o headless segue o
   * tema do SO, o localStorage tinha uma chave que ninguém lê, e `--tema claro`
   * não fazia nada. Foi descoberto tentando ver um defeito que a mesa relatou
   * justamente no tema claro.
   */
  await enviar("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { localStorage.setItem("theme", ${JSON.stringify(tema)}); } catch {}`,
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
    /*
     * MEDIR DUAS VEZES, com uma rolagem no meio — 0.1.69.
     *
     * Uma medição só saía sempre no mesmo lugar errado, e a causa não era
     * timing: o `/livro` usa `content-visibility` e mídia `loading="lazy"`, e o
     * navegador ESTIMA a altura do que ainda não pintou. Medir com a página no
     * topo é medir um documento que ainda não existe no comprimento que terá.
     *
     * Rolar até a âncora força o navegador a pintar tudo que ficou pra trás.
     * A segunda medição, depois disso, é sobre o documento de verdade.
     */
    for (let passada = 0; passada < 3; passada++) {
      const achou = await avaliar(`(() => {
        const el = document.getElementById(${JSON.stringify(ancora)});
        if (!el) return false;
        /*
         * Abrir os <details> ANCESTRAIS antes de rolar.
         *
         * O catálogo de árvores do Cap. 3 mora dentro de um <details> por
         * árvore, fechado por padrão. O id existe no DOM, o script achava, e
         * mesmo assim a foto saía do topo da página: conteúdo de <details>
         * fechado é \`display: none\`, e \`scrollIntoView\` num elemento que não
         * tem caixa simplesmente não faz nada. O erro era mudo dos dois lados —
         * o script dizia que achou, e a foto mostrava outra coisa.
         */
        for (let p = el.parentElement; p; p = p.parentElement) {
          if (p.tagName === "DETAILS") p.open = true;
        }
        el.scrollIntoView({ block: "start" });
        return true;
      })()`);
      if (!achou) {
        console.error(`❌ Não achei #${ancora} na página.`);
        process.exit(1);
      }
      await dormir(700);
    }
    /*
     * A foto da âncora é da VIEWPORT ROLADA — 0.1.69.
     *
     * A versão anterior recortava por coordenada absoluta do documento, e saía
     * sempre no mesmo lugar errado a partir de um certo ponto do `/livro`. A
     * causa é um teto do compositor: `captureBeyondViewport` compõe a página
     * inteira numa surface só, e acima de ~16 mil pixels o `clip` é
     * silenciosamente ignorado — o que é exatamente onde o Capítulo 3 começa
     * num livro de 87 mil pixels de rolagem.
     *
     * Rolar até a âncora e fotografar a viewport não tem teto nenhum: o que o
     * navegador pinta é o que sai. O `scrollIntoView` acima já deixou a página
     * na posição certa; aqui só se ajusta o cabeçalho `sticky`, que cobriria o
     * topo do alvo.
     */
    await avaliar("window.scrollBy(0, -72)");
    await dormir(400);
  }

  // Sem --altura, cresce a viewport até a página inteira: `captureBeyondViewport`
  // sozinho não resolve porque layout sticky e `100vh` continuam ancorados na
  // altura declarada, e a foto sai com o cabeçalho repetido no meio.
  if (!alturaPedida && !ancora) {
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
    // Com âncora, a viewport JÁ está no lugar certo — ver o bloco da âncora.
    captureBeyondViewport: !alturaPedida && !ancora,
    ...(recorte ? { clip: recorte } : {}),
  });
  writeFileSync(saida, Buffer.from(foto.result.data, "base64"));
  console.log(`📷 ${saida}  (${largura}px, ${tema}${ancora ? `, âncora #${ancora}` : ""})`);
  await fechar();
});
