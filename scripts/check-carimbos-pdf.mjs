/** Tarefa 15: os carimbos reais nos dois modos e o PDF baixado pelo botão da ficha.
 * Usa fichas semeadas em perfil isolado. Os quatro PDFs ficam só no disco. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { BASE, comNavegador, dormir, urlSemeada } from "./lib/navegador.mjs";
const pasta = ".telas/carimbos-pdf";
mkdirSync(pasta, { recursive: true });
const temas = ["pergaminho", "pergaminho-noite", "livro-dia", "livro-noite"];
const exigir = (ok, mensagem) => { if (!ok) throw new Error(mensagem); console.log("OK " + mensagem); };
const carimbos = [...readFileSync("public/livro/carimbos.svg", "utf8").matchAll(/id="(carimbo-[^"]+)"/g)].map(m => m[1]);
const fonteContraste = readFileSync("scripts/check-contraste.mjs", "utf8");
const auditoria = fonteContraste.split("const AUDITORIA = String.raw`")[1].split("})()`;")[0] + "})()";
await comNavegador(async ({ abrir }) => {
  for (const tema of temas) for (const largura of [390, 1440]) {
    const aba = await abrir("about:blank");
    aba.avaliar = async expression => {
      const r = await aba.enviar("Runtime.evaluate", { expression, returnByValue: true });
      if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text);
      return r.result?.result?.value;
    };
    const esperar = async expressao => {
      for (let i = 0; i < 200; i++) { if (await aba.avaliar(expressao)) return; await dormir(250); }
      throw new Error("Não ficou pronto: " + expressao);
    };
    await aba.enviar("Emulation.setDeviceMetricsOverride", { width: largura, height: 1000, deviceScaleFactor: 1, mobile: largura === 390 });
    await aba.enviar("Page.navigate", { url: urlSemeada("/arvores", tema) });
    await esperar('location.pathname==="/arvores" && !!document.querySelector("button[aria-pressed]")');
    // O HTML inicial pode chegar antes da hidratação. Lista é idempotente;
    // espera a confirmação do estado antes de tocar nos acordeões.
    for (let i = 0; i < 40; i++) {
      await aba.avaliar('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim()==="Lista").click()');
      await dormir(250);
      if (await aba.avaliar('Array.from(document.querySelectorAll("button[aria-pressed=true]")).some(b=>b.textContent.trim()==="Lista")')) break;
    }
    await esperar('Array.from(document.querySelectorAll("button[aria-pressed=true]")).some(b=>b.textContent.trim()==="Lista")');
    await esperar('document.querySelectorAll("main use[href*=carimbos]").length>=19');
    const refs = await aba.avaliar('Array.from(document.querySelectorAll("main use[href*=carimbos]")).map(u=>u.getAttribute("href").split("#")[1])');
    exigir(carimbos.every(id => refs.includes(id)), `${tema} ${largura}: todas as 19 árvores na lista`);
    exigir(await aba.avaliar('Array.from(document.querySelectorAll("main img")).every(i=>!i.src.includes("/arvores/"))'), "Lista sem fotos de árvores");
    for (let i = 0; i < 40; i++) {
      if (await aba.avaliar('Array.from(document.querySelectorAll("button[aria-expanded]")).find(b=>b.textContent.includes("Magia de Água"))?.getAttribute("aria-expanded")==="true"')) break;
      await aba.avaliar('Array.from(document.querySelectorAll("button[aria-expanded]")).find(b=>b.textContent.includes("Magia de Água")).click()');
      await dormir(250);
    }
    await esperar('!!document.querySelector("button[aria-expanded=true]")');
    await dormir(1000);
    const transbordo = await aba.avaliar('document.documentElement.scrollWidth-document.documentElement.clientWidth');
    if (transbordo > 1) {
      const foto = await aba.enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      writeFileSync(`${pasta}/falha-lista-${tema}-${largura}.png`, Buffer.from(foto.result.data, "base64"));
    }
    exigir(transbordo <= 1, `Lista aberta sem transbordo (${transbordo}px)`);
    const contraste = JSON.parse(await aba.avaliar(auditoria));
    if (contraste.length) console.log(JSON.stringify(contraste, null, 2));
    exigir(contraste.length === 0, `Lista: contraste (${contraste.length} falhas)`);
    const foto = await aba.enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    writeFileSync(`${pasta}/lista-${tema}-${largura}.png`, Buffer.from(foto.result.data, "base64"));
    // O mapa já abre focado na Água, incluindo o painel da árvore.
    await aba.enviar("Page.navigate", { url: `${BASE}/arvores?arvore=agua` });
    await esperar('!!document.querySelector("main use[href=\\"/livro/carimbos.svg#carimbo-agua\\"]")');
    await dormir(1200);
    exigir(await aba.avaliar('Array.from(document.querySelectorAll("main img")).every(i=>!i.src.includes("/arvores/"))'), "Mapa e painel sem fotos de árvores");
    exigir(await aba.avaliar('document.documentElement.scrollWidth-document.documentElement.clientWidth<=1'), "Mapa sem transbordo");
    const ax = await aba.enviar("Accessibility.getFullAXTree");
    const vazios = ax.result.nodes.filter(n => !n.ignored && ["button", "textbox", "combobox", "spinbutton"].includes(n.role?.value) && !n.name?.value?.trim());
    for (const n of vazios) {
      const d = await aba.enviar("DOM.resolveNode", { backendNodeId: n.backendDOMNodeId });
      const h = await aba.enviar("Runtime.callFunctionOn", { objectId: d.result.object.objectId, functionDeclaration: "function(){return this.outerHTML}", returnByValue: true });
      console.log("Sem nome: " + h.result.result.value);
    }
    exigir(vazios.length === 0, "Controles do mapa com nome acessível");
    const mapa = await aba.enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    writeFileSync(`${pasta}/mapa-${tema}-${largura}.png`, Buffer.from(mapa.result.data, "base64"));
    if (largura === 1440) {
    await aba.enviar("Page.navigate", { url: `${BASE}/ficha` });
    await esperar('Array.from(document.querySelectorAll("button")).some(b=>b.textContent.trim()==="Baixar PDF")');
      await dormir(1000);
      await aba.enviar("Browser.setDownloadBehavior", { behavior: "deny" });
      await aba.avaliar(`(()=>{const original=window.fetch;window.fetch=async(...args)=>{const res=await original(...args);if(args[0]==="/api/ficha-pdf"){window.__temaPdf=JSON.parse(args[1].body).tema;window.__payloadPdf=JSON.parse(args[1].body);window.__statusPdf=res.status;const bytes=new Uint8Array(await res.clone().arrayBuffer());let bin="";for(let i=0;i<bytes.length;i+=8192)bin+=String.fromCharCode(...bytes.subarray(i,i+8192));window.__pdf=btoa(bin);}return res;};})()`);
      await aba.avaliar('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim()==="Baixar PDF").click()');
      await esperar('window.__pdf!==undefined');
      const status = await aba.avaliar('window.__statusPdf');
      exigir(status === 200, `${tema}: rota PDF respondeu ${status}`);
      exigir(await aba.avaliar('window.__temaPdf') === tema, "Botão enviou o tema selecionado");
      const pdf = Buffer.from(await aba.avaliar('window.__pdf'), "base64");
      exigir(pdf.subarray(0, 5).toString() === "%PDF-", "Arquivo recebido é PDF");
      writeFileSync(`${pasta}/ficha-${tema}.pdf`, pdf);
      writeFileSync(`${pasta}/payload-${tema}.json`, JSON.stringify(await aba.avaliar('window.__payloadPdf'), null, 2));
    }
    await aba.fechar();
  }
}, { porta: Number(process.env.PORTA_CDP ?? 9357) });
console.log("Carimbos e exportações nos quatro temas aprovados.");
