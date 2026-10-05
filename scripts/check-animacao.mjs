/** Verifica as demonstrações reais por teclado, redução de movimento e impressão.
 * As fotos ficam em .telas/animacao; não altera ficha nem regras de jogo. */
import { mkdirSync, writeFileSync } from "node:fs";
import { BASE, comNavegador, dormir, urlSemeada } from "./lib/navegador.mjs";

mkdirSync(".telas/animacao", { recursive: true });
const exigir = (ok, mensagem) => { if (!ok) throw new Error(mensagem); };
async function esperar(aba, expressao) {
  for (let i = 0; i < 180; i++) { if (await aba.avaliar(expressao)) return; await dormir(500); }
  throw new Error(`Não ficou pronto: ${expressao}`);
}
async function foto(aba, nome) {
  const r = await aba.enviar("Page.captureScreenshot", { format: "png" });
  exigir(r.result?.data, "Captura não retornou imagem");
  writeFileSync(`.telas/animacao/${nome}.png`, Buffer.from(r.result.data, "base64"));
}
await comNavegador(async ({ abrir }) => {
  for (const largura of [1440, 390]) {
    const aba = await abrir("about:blank");
    aba.avaliar = async (expression) => {
      const r = await aba.enviar("Runtime.evaluate", { expression, returnByValue: true });
      if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text);
      return r.result?.result?.value;
    };
    try {
      await aba.enviar("Emulation.setDeviceMetricsOverride", { width: largura, height: 900, deviceScaleFactor: 1, mobile: largura === 390 });
      await aba.enviar("Emulation.setTouchEmulationEnabled", { enabled: largura === 390 });
      await aba.enviar("Page.navigate", { url: urlSemeada("/livro", "livro-noite") });
      await esperar(aba, '!!document.querySelector(".folhear[data-pronto]")');
      // O modo rolado permite examinar cada diagrama sem depender do número de página.
      await aba.avaliar('Array.from(document.querySelectorAll("button")).find(b => /Contínuo/.test(b.textContent))?.click()');
      await esperar(aba, '!!document.querySelector(".folhear[data-modo=continuo]")');
      for (const [tipo, titulo, passos, esperado] of [
        ["turno", "Anatomia do Turno", 4, "Conjuração concluída"],
        ["quebrantado", "Quebrantado Empilha", 4, "teto foi alcançado"],
        ["tiro", "Etapas do Tiro Perfeito", 4, "Disparo resolvido"],
      ]) {
        const seletor = `[aria-label="Experimentar: ${titulo}"]`;
        await aba.avaliar(`document.querySelector(${JSON.stringify(seletor)}).scrollIntoView({block:"center"}); document.querySelector(${JSON.stringify(seletor)}).focus()`);
        await dormir(800);
        await foto(aba, `${largura}-${tipo}-antes`);
        await aba.enviar("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
        await aba.enviar("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
        await esperar(aba, '!!document.querySelector("dialog[open]")');
        for (let i = 0; i < passos; i++) {
          const botao = tipo === "tiro" && i === 1 ? "Falhar nesta etapa" : "Próximo passo";
          await aba.avaliar(`Array.from(document.querySelectorAll("dialog button")).find(b => b.textContent === ${JSON.stringify(botao)}).click()`);
          await dormir(60);
        }
        exigir(await aba.avaliar(`document.querySelector("dialog").textContent.includes(${JSON.stringify(esperado)})`), `${tipo}: estado final incorreto`);
        if (tipo === "tiro") exigir(await aba.avaliar('document.querySelector("dialog").textContent.includes("Falhou: bônus perdido")'), "Falha intermediária interrompeu o tiro");
        await foto(aba, `${largura}-${tipo}-depois`);
        await aba.enviar("Emulation.setEmulatedMedia", { media: "print" });
        exigir(await aba.avaliar('getComputedStyle(document.querySelector("dialog")).display === "none"'), "Demonstração encobre impressão");
        await aba.enviar("Emulation.setEmulatedMedia", { media: "screen", features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
        await aba.avaliar('Array.from(document.querySelectorAll("dialog button")).find(b => b.textContent === "Rever").click()');
        await dormir(60);
        await aba.avaliar('Array.from(document.querySelectorAll("dialog button")).find(b => b.textContent === "Próximo passo").click()');
        await dormir(60);
        exigir(await aba.avaliar('!document.querySelector("dialog").textContent.includes("Alvo intacto.")'), "Movimento reduzido bloqueou controles");
        await aba.enviar("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
        await esperar(aba, '!document.querySelector("dialog[open]")');
        await aba.enviar("Emulation.setEmulatedMedia", { media: "screen", features: [] });
      }
      for (const rota of ["/ficha", "/criar", "/criar/manual", "/arvores", "/loja", "/personagens", "/novidades", "/busca", "/encontros"]) {
        await aba.enviar("Page.navigate", { url: urlSemeada(rota, "livro-noite") });
        await esperar(aba, `location.pathname === ${JSON.stringify(rota)} && !!document.querySelector("main")`);
        await dormir(1200);
        exigir(await aba.avaliar("document.documentElement.scrollWidth <= innerWidth + 1"), `${rota}: transbordou em ${largura}px`);
        await foto(aba, `${largura}-${rota.slice(1).replaceAll("/", "-")}`);
        if (rota === "/ficha") {
          await aba.avaliar('document.querySelector("[role=progressbar][aria-label=PV]").scrollIntoView({block:"center"})');
          await dormir(400);
          const antes = await aba.avaliar('Number(document.querySelector("[role=progressbar][aria-label=PV]").getAttribute("aria-valuenow"))');
          await foto(aba, `${largura}-pv-antes`);
          await aba.avaliar('Array.from(document.querySelectorAll("button")).find(b => b.getAttribute("aria-label") === "Gastar 5 de PV").click()');
          await dormir(80);
          await foto(aba, `${largura}-pv-movimento`);
          await dormir(400);
          exigir(await aba.avaliar('Number(document.querySelector("[role=progressbar][aria-label=PV]").getAttribute("aria-valuenow"))') === Math.max(0, antes - 5), "Barra de PV não acompanhou o valor da ficha");
          await foto(aba, `${largura}-pv-depois`);
        }
        if (rota === "/criar/manual") {
          await aba.avaliar('Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Avançar")).click()');
          await dormir(400);
          exigir(await aba.avaliar('Array.from(document.querySelectorAll("ol")).some(el => el.getAttribute("aria-label") === "Escolhas concluídas")'), "Passo da criação não assentou no resumo");
          await foto(aba, `${largura}-criar-depois`);
        }
      }
      console.log(`✅ ${largura}px: três diagramas, falha no tiro, teclado, redução, impressão, PV, criação e nove rotas`);
    } finally { await aba.fechar(); }
  }
});
console.log(`Servidor conferido: ${BASE}`);
