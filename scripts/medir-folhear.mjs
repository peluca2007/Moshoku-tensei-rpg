/**
 * Mede o tempo que o modo Livro leva para poder ser folheado.
 *
 * Esta régua separa a primeira abertura de uma reabertura no mesmo navegador.
 * A distinção importa para a Tarefa 11: o diário da diagramação não pode
 * acelerar a abertura fria, mas precisa transformar a segunda abertura em um
 * único layout sem esconder o custo no carregamento da página.
 *
 * Rode contra o build, não contra o servidor de desenvolvimento:
 *
 *   npm run build
 *   npx next start -p 3019
 *   BASE=http://localhost:3019 npm run medir:folhear
 *
 * TAXAS=1,4 escolhe as desacelerações de CPU. Por padrão a régua mede a
 * máquina livre e depois uma CPU 4× mais lenta, como o notebook da Tarefa 11.
 */
import { comNavegador, dormir } from "./lib/navegador.mjs";

const BASE = process.env.BASE ?? "http://localhost:3019";
const ROTA = process.env.ROTA ?? "/livro/folhear";
const TAXAS = (process.env.TAXAS ?? "1,4")
  .split(",")
  .map(Number)
  .filter((n) => Number.isFinite(n) && n >= 1);
const LIMITE_MS = Number(process.env.LIMITE_MS ?? 60_000);
const SEM_DIARIO = process.env.SEM_DIARIO === "1";

const segundos = (ms) => `${(ms / 1000).toFixed(2)} s`;

async function esperarLivro(aba) {
  const inicio = Date.now();
  while (Date.now() - inicio < LIMITE_MS) {
    const medida = await aba.avaliar(`(() => {
      if (!document.querySelector(".folhear[data-pronto]")) return null;
      const tempos = performance.getEntriesByType("measure")
        .filter((e) => e.name.startsWith("folhear:"))
        .map((e) => [e.name.slice(8), e.duration]);
      const armazenamento = Object.keys(localStorage).map((chave) => {
        const valor = localStorage.getItem(chave) || "";
        return [chave, chave.length + valor.length];
      });
      const diagnostico = sessionStorage.getItem("livro-folhear-diario-diagnostico") || "—";
      const indice = Number(/^assinatura:(\d+)/.exec(diagnostico)?.[1]);
      const elemento = Number.isInteger(indice)
        ? document.querySelectorAll(".folhear-fluxo h2, .folhear-fluxo h3, .folhear-fluxo h4, .folhear-fluxo .livro-verbete, .folhear-fluxo .livro-tabela, .folhear-fluxo figure")[indice - 1]
        : null;
      const fluxo = document.querySelector(".folhear-fluxo");
      const faixa = document.querySelector(".folhear-faixa");
      const paginaLargura = parseFloat(getComputedStyle(document.querySelector(".folhear")).getPropertyValue("--pagina"));
      const escala = fluxo.getBoundingClientRect().width / fluxo.offsetWidth;
      const origem = faixa.getBoundingClientRect().left;
      const assinatura = Array.from(fluxo.querySelectorAll("h2, h3, h4, .livro-verbete, .livro-tabela, figure"), (el) => {
        const q = Array.from(el.getClientRects()).find((r) => r.height > 1);
        if (!q) return "x";
        const x = (q.left - origem) / escala;
        const p = Math.floor(x / paginaLargura);
        return p + ":" + (x - p * paginaLargura < paginaLargura / 2 ? 0 : 1);
      }).join(",");
      return {
        pronto: performance.now(),
        paginas: Number(document.querySelector(".folhear-posicao-paginas")?.textContent?.match(/de\\s+(\\d+)/)?.[1] || 0),
        tempos,
        armazenamento,
        diario: elemento ? diagnostico + ":" + elemento.tagName.toLowerCase() + "#" + (elemento.id || "-") + "." + elemento.className.toString().split(/\s+/).slice(0, 3).join(".") + ":" + (elemento.textContent || "").trim().slice(0, 45) : diagnostico,
        assinatura,
      };
    })()`);
    if (medida) return medida;
    await dormir(100);
  }
  throw new Error(`o livro não ficou pronto em ${segundos(LIMITE_MS)}`);
}

function resumir(tipo, taxa, medida) {
  const porNome = new Map(medida.tempos);
  // `cartas` e `titulos` já incluem as medidas internas de cada passada. Não
  // somar pai e filhos evita anunciar o mesmo layout duas vezes.
  const ehInterna = (nome) => /^cartas-passada$|^titulos-(passada|calcos|velhos|tabelas)$/.test(nome);
  const soma = medida.tempos.reduce((total, [nome, duracao]) => total + (ehInterna(nome) ? 0 : duracao), 0);
  const bytesLocais = medida.armazenamento.reduce((total, [, tamanho]) => total + tamanho * 2, 0);
  return {
    CPU: `${taxa}×`,
    abertura: tipo,
    pronto: segundos(medida.pronto),
    layout: segundos(soma),
    figuras: segundos(porNome.get("figuras") ?? 0),
    cartas: segundos(porNome.get("cartas") ?? 0),
    titulos: segundos(porNome.get("titulos") ?? 0),
    equilibrio: segundos(porNome.get("equilibrar-colunas") ?? 0),
    paginas: medida.paginas || "—",
    localStorage: `${Math.round(bytesLocais / 1024)} KB`,
    diario: medida.diario,
  };
}

await comNavegador(async ({ abrir }) => {
  const aba = await abrir("about:blank");
  const linhas = [];
  await aba.enviar("Network.enable");
  await aba.enviar("Page.addScriptToEvaluateOnNewDocument", {
    source: `try {
      localStorage.setItem("theme", "dark");
      localStorage.setItem("livro-folhear-modo", "livro");
      localStorage.setItem("livro-folhear-papel", "noite");
    } catch {}`,
  });

  for (const taxa of TAXAS) {
    await aba.enviar("Emulation.setCPUThrottlingRate", { rate: taxa });
    await aba.enviar("Storage.clearDataForOrigin", { origin: new URL(BASE).origin, storageTypes: "all" });

    await aba.enviar("Page.navigate", { url: BASE + ROTA });
    const fria = await esperarLivro(aba);
    linhas.push(resumir("fria", taxa, fria));

    if (SEM_DIARIO) {
      await aba.avaliar(`Object.keys(localStorage).filter((chave) => chave.startsWith("livro-folhear-diario:")).forEach((chave) => localStorage.removeItem(chave))`);
    }

    // A reabertura usa a mesma aba e o mesmo perfil: cache HTTP, fontes e o
    // eventual diário em localStorage continuam disponíveis. O relógio de
    // performance recomeça com a navegação.
    await aba.enviar("Page.navigate", { url: "about:blank" });
    await dormir(100);
    await aba.enviar("Page.navigate", { url: BASE + ROTA });
    const reabertura = await esperarLivro(aba);
    const linha = resumir("reabertura", taxa, reabertura);
    linha.assinatura = reabertura.assinatura === fria.assinatura ? "idêntica" : "mudou";
    linhas.push(linha);
  }

  await aba.fechar();
  console.table(linhas);
});
