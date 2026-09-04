/**
 * O que um leitor de tela encontra em cada rota.
 *
 * ## O que ele é, e o que ele NÃO é
 *
 * Ele **não** substitui abrir o NVDA e navegar o site de ouvido — isso continua
 * em aberto no `O-QUE-FALTA.md`, e continua sendo a única forma de descobrir se
 * a ficha é *usável* sem enxergar. O que ele resolve é a camada de baixo: os
 * defeitos que tornam a página impossível antes mesmo da questão de fluxo, e
 * que voltam sozinhos toda vez que alguém escreve um botão de ícone com pressa.
 *
 * São seis, e todos os seis já apareceram neste projeto pelo menos uma vez:
 *
 * 1. **Controle sem nome acessível.** Um `<button>` com só um `<svg>` dentro é
 *    anunciado como "botão", e ponto. É o defeito mais comum de qualquer
 *    interface com ícones — e este site tem dezenas.
 * 2. **`<img>` sem `alt`.** Sem o atributo o leitor lê o NOME DO ARQUIVO;
 *    `alt=""` (vazio, explícito) é o correto pra imagem decorativa, e é coisa
 *    diferente de não ter o atributo.
 * 3. **Campo sem rótulo.** Um `<input>` sem `<label>`, `aria-label` ou
 *    `aria-labelledby` é anunciado pelo tipo — "edição, em branco".
 * 4. **`id` duplicado.** Quebra silenciosamente a associação `<label for>` e o
 *    `aria-labelledby`: os dois apontam pro primeiro elemento com aquele id.
 * 5. **Salto de nível de cabeçalho** (h2 → h4). O leitor navega por cabeçalho,
 *    e um salto lê como "faltou uma seção".
 * 6. **Marco de página ausente** (`main`, `nav`). São os atalhos de navegação
 *    de um leitor de tela; sem eles só resta ler tudo desde o topo.
 *
 * `aria-hidden` sai de toda conta, que é o ponto dele.
 *
 *   npm run dev
 *   npm run check:a11y
 */
import { BASE, comNavegador, dormir, servidorNoAr, urlSemeada } from "./lib/navegador.mjs";

const ROTAS = ["/", "/ficha", "/arvores", "/personagens", "/iniciativa", "/encontros", "/loja", "/livro", "/criar"];

const MEDICAO = String.raw`(() => {
  const problemas = [];
  const anota = (tipo, el, detalhe) =>
    problemas.push({
      tipo,
      detalhe,
      tag: el.tagName.toLowerCase(),
      classe: String(el.className?.baseVal ?? el.className ?? "").slice(0, 70),
      trecho: (el.outerHTML || "").replace(/\s+/g, " ").slice(0, 90),
    });

  const escondido = (el) => el.closest("[aria-hidden='true']") !== null;

  /**
   * O nome acessível, na ordem em que o navegador resolve: aria-labelledby,
   * aria-label, conteúdo de texto, title, e — só pra input — o value/alt.
   * Texto dentro de um filho aria-hidden NÃO conta, que é justamente o caso do
   * botão que só tem um ícone.
   */
  function nomeAcessivel(el) {
    const porId = el.getAttribute("aria-labelledby");
    if (porId) {
      const partes = porId.split(/\s+/).map((id) => document.getElementById(id)?.textContent?.trim() ?? "");
      if (partes.join(" ").trim()) return partes.join(" ").trim();
    }
    const rotulo = el.getAttribute("aria-label");
    if (rotulo && rotulo.trim()) return rotulo.trim();

    const clone = el.cloneNode(true);
    for (const oculto of clone.querySelectorAll("[aria-hidden='true']")) oculto.remove();
    const texto = (clone.textContent || "").trim();
    if (texto) return texto;

    // Link cujo conteúdo é uma IMAGEM tira o nome do alt dela — é assim que o
    // logo do cabeçalho se anuncia, e ler só o textContent o reprovaria em
    // todas as nove rotas por um defeito que não existe.
    for (const filho of clone.querySelectorAll("img[alt],[aria-label],svg title")) {
      const nome = (filho.getAttribute?.("alt") || filho.getAttribute?.("aria-label") || filho.textContent || "").trim();
      if (nome) return nome;
    }

    const title = el.getAttribute("title");
    if (title && title.trim()) return title.trim();
    if (el.tagName === "INPUT") {
      const v = el.getAttribute("value") || el.getAttribute("alt") || "";
      if (v.trim()) return v.trim();
      const envolvente = el.closest("label");
      if (envolvente && (envolvente.textContent || "").trim()) return (envolvente.textContent || "").trim();
      const porFor = el.id ? document.querySelector('label[for="' + CSS.escape(el.id) + '"]') : null;
      if (porFor && (porFor.textContent || "").trim()) return (porFor.textContent || "").trim();
    }
    return "";
  }

  // 1. Controles sem nome.
  for (const el of document.querySelectorAll("button,a[href],select,textarea,[role='button']")) {
    if (escondido(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (!nomeAcessivel(el)) anota("controle sem nome", el, "nada pra anunciar além do papel");
  }

  // 2. Imagens sem o atributo alt (alt="" é correto e passa).
  for (const el of document.querySelectorAll("img")) {
    if (escondido(el)) continue;
    if (!el.hasAttribute("alt")) anota("img sem alt", el, el.getAttribute("src")?.slice(0, 60) ?? "");
  }

  // 3. Campos sem rótulo.
  for (const el of document.querySelectorAll("input:not([type='hidden'])")) {
    if (escondido(el)) continue;
    if (!nomeAcessivel(el)) anota("campo sem rótulo", el, el.getAttribute("type") ?? "text");
  }

  // 4. ids duplicados.
  const vistos = new Map();
  for (const el of document.querySelectorAll("[id]")) {
    const id = el.id;
    if (vistos.has(id)) anota("id duplicado", el, id);
    else vistos.set(id, el);
  }

  // 5. Níveis de cabeçalho.
  const niveis = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => !escondido(h));
  const h1 = niveis.filter((h) => h.tagName === "H1").length;
  if (h1 === 0) problemas.push({ tipo: "sem h1", detalhe: "a página não declara do que ela é", tag: "-", classe: "", trecho: "" });
  if (h1 > 1) problemas.push({ tipo: "h1 repetido", detalhe: h1 + " elementos h1", tag: "-", classe: "", trecho: "" });
  let anterior = 0;
  for (const h of niveis) {
    const n = Number(h.tagName[1]);
    if (anterior && n > anterior + 1) {
      anota("salto de cabeçalho", h, "h" + anterior + " → h" + n + ": " + (h.textContent || "").trim().slice(0, 40));
    }
    anterior = n;
  }

  // 6. Marcos.
  for (const [seletor, nome] of [["main", "main"], ["nav", "nav"]]) {
    if (!document.querySelector(seletor)) {
      problemas.push({ tipo: "marco ausente", detalhe: nome, tag: "-", classe: "", trecho: "" });
    }
  }

  return JSON.stringify(problemas);
})()`;

if (!(await servidorNoAr())) {
  console.error(`❌ ${BASE} não respondeu. Rode \`npm run dev\` antes.`);
  process.exit(1);
}

let total = 0;
await comNavegador(
  async ({ abrir }) => {
    console.log("========================================");
    console.log("ACESSIBILIDADE — o que um leitor de tela encontra");
    console.log("========================================");
    for (const rota of ROTAS) {
      const aba = await abrir(urlSemeada(rota));
      await dormir(Number(process.env.ESPERA_MS ?? 5000));
      const problemas = JSON.parse((await aba.avaliar(MEDICAO)) ?? "[]");
      await aba.fechar();

      total += problemas.length;
      console.log(`${problemas.length === 0 ? "ok " : "!! "}${rota.padEnd(14)} ${problemas.length}`);
      const porTipo = new Map();
      for (const p of problemas) porTipo.set(p.tipo, [...(porTipo.get(p.tipo) ?? []), p]);
      for (const [tipo, lista] of porTipo) {
        console.log(`     ${tipo} (${lista.length})`);
        for (const p of lista.slice(0, 3)) console.log(`       · <${p.tag}> ${p.detalhe} — ${p.trecho}`);
      }
    }
  },
  { porta: Number(process.env.PORTA_CDP ?? 9335) }
);

console.log("========================================");
if (total > 0) {
  console.error(`\n❌ ${total} problema(s) de acessibilidade estrutural.`);
  process.exit(1);
}
console.log("\n✅ Nenhum problema estrutural nas nove rotas. (Teste com leitor de tela de verdade continua pendente.)");
