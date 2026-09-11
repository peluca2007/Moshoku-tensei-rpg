/**
 * O site em tela de celular de verdade.
 *
 * ## Por que existe
 *
 * O `O-QUE-FALTA.md` registrava, como item que "precisa de você": *"nunca vi o
 * site abaixo de 500px — o Chrome do Windows trava a largura mínima da janela
 * aí, e todo print 'mobile' que eu tirei era um recorte de uma janela de 500.
 * É onde metade da mesa vai abrir o site."*
 *
 * O recorte é o problema: recortar uma janela de 500px em 360 mostra o que
 * caberia em 360, não o que o CSS FAZ em 360 — media query não dispara, flex
 * não recalcula, e um `<select>` continua com a largura que tinha. É por isso
 * que nada aparecia. Aqui a largura é imposta de dentro
 * (`Emulation.setDeviceMetricsOverride`), então o layout é recalculado de
 * verdade, sem depender do mínimo de janela do sistema operacional.
 *
 * ## O que ele mede
 *
 * 1. **Transbordo horizontal.** `scrollWidth > clientWidth` é a falha que
 *    estraga a página inteira: um único elemento largo demais empurra tudo e o
 *    site passa a rolar de lado. Ele aponta o CULPADO, não só o sintoma —
 *    ignorando quem está dentro de um container que rola de propósito (tabela
 *    do livro, mapa das árvores).
 * 2. **Alvo de toque abaixo de 24px** (WCAG 2.2, critério 2.5.8, nível AA).
 *    Não reprova: uma parte legítima disso é link dentro de frase, que o
 *    próprio critério isenta. Sai como contagem, pra vigiar.
 *
 * As duas falhas que ele achou na primeira execução: a linha de "nova perícia"
 * da ficha empurrava 39px em 320px, e o importador da iniciativa empurrava 41px
 * em **360px** — a largura da metade dos Androids. As duas pela mesma causa,
 * que é a armadilha clássica de flexbox: item de flex tem `min-width: auto` e
 * NÃO encolhe abaixo do próprio conteúdo, então `flex-1` sem `min-w-0` não
 * encolhe nada.
 *
 *   npm run dev            # em outro terminal
 *   npm run check:mobile
 */
import { BASE, comNavegador, dormir, exigirSemeador, servidorNoAr, urlSemeada } from "./lib/navegador.mjs";

const ROTAS = ["/", "/ficha", "/arvores", "/personagens", "/iniciativa", "/encontros", "/mestre", "/comparar", "/sessao", "/loja", "/livro", "/busca?q=fogo", "/criar", "/offline", "/rota-que-nao-existe", "/ficha/importar#g:linkCortadoDeProposito"];
/** 320 = o iPhone SE mais estreito ainda em uso; 360 = a moda dos Androids; 414 = iPhone grande. */
const LARGURAS = [320, 360, 414];

const MEDICAO = String.raw`(() => {
  const janela = document.documentElement.clientWidth;
  const transbordo = document.documentElement.scrollWidth - janela;
  const culpados = [];
  if (transbordo > 1) {
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right <= janela + 1) continue;
      // Quem vive dentro de um container que rola (ou recorta) de propósito não
      // é culpado: a tabela larga do livro DEVE rolar dentro da caixa dela.
      let p = el.parentElement, contido = false;
      while (p) {
        const ov = getComputedStyle(p).overflowX;
        if (ov === "auto" || ov === "scroll" || ov === "hidden") { contido = true; break; }
        p = p.parentElement;
      }
      if (contido) continue;
      culpados.push({
        tag: el.tagName.toLowerCase(),
        direita: Math.round(r.right),
        largura: Math.round(r.width),
        texto: (el.textContent || "").trim().slice(0, 38),
        classe: String(el.className.baseVal ?? el.className ?? "").slice(0, 76),
      });
    }
  }
  let pequenos = 0;
  let inline = 0;
  for (const el of document.querySelectorAll("button,a,input,select,[role='button']")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // O alvo é a UNIÃO do controle com os filhos dele, e não só a caixa dele.
    //
    // O nó do mapa de árvores (0.1.15) estende a área de toque com um <span>
    // invisível maior que o desenho — um clique no span sobe pro botão, então
    // ele É alvo. Medindo só o retângulo do botão, os 40 nós apareciam aqui
    // como "abaixo de 24px" mesmo depois de corrigidos, e a contagem passaria a
    // acusar justamente o remédio.
    let x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom;
    for (const filho of el.children) {
      const c = filho.getBoundingClientRect();
      if (c.width === 0 || c.height === 0) continue;
      if (c.left < x0) x0 = c.left;
      if (c.top < y0) y0 = c.top;
      if (c.right > x1) x1 = c.right;
      if (c.bottom > y1) y1 = c.bottom;
    }
    if (x1 - x0 >= 24 && y1 - y0 >= 24) continue;

    // INLINE não conta — o WCAG 2.5.8 isenta, em letra, o alvo que está "numa
    // sentença ou bloco de texto". Sem esta distinção o número era ruído: o
    // /livro acusava 229 alvos pequenos, e 221 deles eram os termos de condição
    // ("Quebrantado", "Caído") sublinhados dentro do parágrafo, que o critério
    // perdoa justamente porque aumentá-los quebraria a linha do texto.
    //
    // A regra é a mesma do critério: o alvo é inline se ele mora dentro de um
    // elemento de texto corrido e tem irmãos que são texto.
    // "Inline" aqui é o que o critério descreve: o alvo se comporta como palavra
    // dentro de um trecho de texto. Dois sinais juntos, porque nenhum sozinho
    // basta: display inline pega o botão de condição, e "o pai tem muito mais
    // texto que eu" é o que distingue uma palavra grifada no meio de um
    // parágrafo de um link solto numa lista de navegação.
    // (Sem crase neste comentário de propósito — ele mora dentro de uma template
    // literal, e uma crase aqui fecha a string e quebra o arquivo inteiro.)
    const meu = (el.textContent || "").trim().length;
    const doPai = ((el.parentElement && el.parentElement.textContent) || "").trim().length;
    const ehInline = getComputedStyle(el).display.startsWith("inline");
    if (ehInline && doPai > meu + 20) {
      inline++;
      continue;
    }
    pequenos++;
  }
  return JSON.stringify({ transbordo, culpados: culpados.slice(0, 6), pequenos, inline });
})()`;

if (!(await servidorNoAr())) {
  console.error(`❌ ${BASE} não respondeu. Rode \`npm run dev\` antes.`);
  process.exit(1);
}

// Sem esta linha o check passa medindo a página 404 — ver `exigirSemeador`.
await exigirSemeador();

let quebradas = 0;
await comNavegador(
  async ({ abrir }) => {
    console.log("========================================");
    console.log("TELAS ESTREITAS — transbordo horizontal e alvo de toque");
    console.log("========================================");

    for (const largura of LARGURAS) {
      console.log(`\n--- ${largura}px ---`);
      for (const rota of ROTAS) {
        const aba = await abrir("about:blank");
        await aba.enviar("Emulation.setDeviceMetricsOverride", {
          width: largura,
          height: 800,
          deviceScaleFactor: 2,
          mobile: true,
        });
        await aba.enviar("Page.navigate", { url: urlSemeada(rota) });
        await dormir(Number(process.env.ESPERA_MS ?? 5000));
        const d = JSON.parse((await aba.avaliar(MEDICAO)) ?? "{}");
        await aba.fechar();

        const quebrou = (d.transbordo ?? 0) > 1;
        if (quebrou) quebradas++;
        console.log(
          `${quebrou ? "!!" : "ok"} ${rota.padEnd(14)} transbordo=${d.transbordo}px  alvos<24px=${d.pequenos}${d.inline ? ` (+${d.inline} inline, isentos)` : ""}`
        );
        for (const c of d.culpados ?? []) {
          console.log(`     ↳ <${c.tag}> chega a ${c.direita}px (larg. ${c.largura}) "${c.texto}"`);
          console.log(`       .${c.classe}`);
        }
      }
    }
  },
  { porta: Number(process.env.PORTA_CDP ?? 9334) }
);

console.log("========================================");
if (quebradas > 0) {
  console.error(`\n❌ ${quebradas} página(s) rolam de lado numa tela de celular.`);
  process.exit(1);
}
console.log(`\n✅ Nenhuma das ${ROTAS.length} rotas transborda entre ${LARGURAS[0]}px e ${LARGURAS.at(-1)}px.`);
