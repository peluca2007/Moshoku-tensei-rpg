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
import { BASE, comNavegador, dormir, servidorNoAr, urlSemeada } from "./lib/navegador.mjs";

const ROTAS = ["/", "/ficha", "/arvores", "/personagens", "/iniciativa", "/encontros", "/loja", "/livro", "/criar"];
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
  for (const el of document.querySelectorAll("button,a,input,select,[role='button']")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.width < 24 || r.height < 24) pequenos++;
  }
  return JSON.stringify({ transbordo, culpados: culpados.slice(0, 6), pequenos });
})()`;

if (!(await servidorNoAr())) {
  console.error(`❌ ${BASE} não respondeu. Rode \`npm run dev\` antes.`);
  process.exit(1);
}

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
          `${quebrou ? "!!" : "ok"} ${rota.padEnd(14)} transbordo=${d.transbordo}px  alvos<24px=${d.pequenos}`
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
