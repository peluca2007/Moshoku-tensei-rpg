/** Abre os marcadores reais em Chrome limpo, confere nomes acessíveis,
 * largura e persistência. Fotos em 390/1440 nos papéis do livro. */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { comNavegador, dormir, urlSemeada } from "./lib/navegador.mjs";
mkdirSync(".telas/mesa",{recursive:true});
let falhas=0;
// Usa a mesma medição do gate oficial, aqui com o bloco Na mesa aberto e
// recursos/condições reais. O arquivo é código local do projeto.
const fonteContraste=readFileSync("scripts/check-contraste.mjs","utf8");
const auditoria=fonteContraste.split("const AUDITORIA = String.raw`")[1].split("})()`;")[0]+"})()";
const exigir=(ok,texto)=>{console.log(`${ok?"OK":"FALHA"} ${texto}`);if(!ok)falhas++;};
await comNavegador(async({abrir})=>{
  for(const tema of ["livro-dia","livro-noite"]) for(const largura of [390,1440]) {
    const aba=await abrir(urlSemeada("/ficha",tema));
    aba.avaliar = async expression => {
      const res = await aba.enviar("Runtime.evaluate", { expression, returnByValue: true });
      if (res.result?.exceptionDetails) throw new Error(res.result.exceptionDetails.exception?.description ?? res.result.exceptionDetails.text);
      return res.result?.result?.value;
    };
    await aba.enviar("Emulation.setDeviceMetricsOverride",{width:largura,height:900,deviceScaleFactor:1,mobile:largura===390});
    for(let i=0;i<50;i++){if(await aba.avaliar('location.pathname==="/ficha" && !!document.querySelector("[data-na-mesa]")'))break;await dormir(250);}
    exigir(await aba.avaliar('!!document.querySelector("[data-na-mesa]") && !document.querySelector("[data-na-mesa]").open'),`Ficha neutra: bloco fechado (${tema}, ${largura})`);
    await aba.avaliar(`(()=>{const r=JSON.parse(localStorage.getItem("mushoku-tensei-roster"));const c=r.state.characters[r.state.activeId];c.mesa={exaustao:4,marcas:2,estabilizado:false,responsavel:6,salvacoes:1,trauma:3,cicatrizes:[11],usos:{"bardo-e-interacao:inspiracao":1}};c.currentHp=0;c.attributeBase.espirito=3;c.skills.push("Medicina");c.inventory.push({id:"kit-auditoria",name:"Kit de Primeiros Socorros",type:"geral",equipped:false});c.unlockedRanks.push({treeId:"arquearia",rank:"Principiante"});c.descansosCurtos=0;c.unlockedRanks.push({treeId:"bardo-e-interacao",rank:"Principiante"});c.purchasedAbilities.push({treeId:"bardo-e-interacao",rank:"Principiante",kind:"ability",id:"inspiracao"});r.version=18;localStorage.setItem("mushoku-tensei-roster",JSON.stringify(r));location.reload();})()`);
    for(let i=0;i<50;i++){if(await aba.avaliar('document.querySelector("[data-na-mesa]")?.open && document.querySelector("[data-na-mesa]").textContent.includes("Estabilizado")'))break;await dormir(250);}
    exigir(await aba.avaliar('document.querySelector("[data-na-mesa]")?.open'),`Marcadores persistidos: bloco abriu (${tema}, ${largura})`);
    exigir(await aba.avaliar('document.querySelector("[data-na-mesa]").textContent.includes("CD 14")'),"CD do responsável aplicada");
    exigir(await aba.avaliar('document.querySelector("[data-na-mesa]").textContent.includes("2 disponíveis")'),"Inspiração: Espírito 3, um uso consumido");
    const medida=await aba.avaliar('document.documentElement.scrollWidth-document.documentElement.clientWidth');exigir(medida<=1,`Sem transbordo: ${medida}px`);
    const ax=await aba.enviar("Accessibility.getFullAXTree");
    const vazios=(ax.result?.nodes??[]).filter(n=>!n.ignored&&["button","textbox","spinbutton","combobox","checkbox"].includes(n.role?.value)&&!n.name?.value?.trim());
    exigir(!vazios.length,`Controles com nome: ${vazios.length} vazios`);
    const contraste=JSON.parse(await aba.avaliar(auditoria));
    exigir(contraste.length===0,`Contraste com marcadores abertos: ${contraste.length} falhas`);
    if(contraste.length) console.log(JSON.stringify(contraste.slice(0,6)));
    await aba.avaliar('document.querySelector("[data-na-mesa]").scrollIntoView({block:"start"});');await dormir(300);
    const foto=await aba.enviar("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
    writeFileSync(`.telas/mesa/${tema}-${largura}.png`,Buffer.from(foto.result.data,"base64"));
    await aba.avaliar('Array.from(document.querySelectorAll("[data-na-mesa] legend")).find(e=>e.textContent==="Fio da Vida").parentElement.scrollIntoView({block:"start"})');await dormir(200);
    const fioFoto=await aba.enviar("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
    writeFileSync(`.telas/mesa/fio-${tema}-${largura}.png`,Buffer.from(fioFoto.result.data,"base64"));
    // Usa o controle renderizado: sua ação deve zerar Salvações e conservar
    // Exaustão/Trauma/Cicatrizes. Persistência fica em localStorage.
    let chegou=false;
    for(let i=0;i<260;i++) {
      if(await aba.avaliar('document.activeElement?.tagName==="BUTTON"&&document.activeElement.textContent==="Novo combate"')) {chegou=true;break;}
      await aba.enviar("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
      await aba.enviar("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
    }
    exigir(chegou,"Novo combate alcançado só com Tab");
    if(chegou) {
      await aba.enviar("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:"\r"});
      await aba.enviar("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
    }
    await dormir(200);
    exigir(await aba.avaliar('(()=>{const r=JSON.parse(localStorage.getItem("mushoku-tensei-roster"));const m=r.state.characters[r.state.activeId].mesa;return m.salvacoes===0&&m.exaustao===4&&m.trauma===3&&m.cicatrizes[0]===11;})()'),"Novo combate zera Salvações e conserva marcadores persistentes");
    await aba.avaliar('document.querySelector("[data-origem-pv] summary").click()');
    exigir(await aba.avaliar('document.querySelector("[data-origem-pv]").textContent.includes("não soma neste patamar")'),"PV: mostra árvores cujo dado ficou de fora");
    await aba.avaliar('document.querySelector("[data-origem-pv]").scrollIntoView({block:"start"})');await dormir(200);
    const pvFoto=await aba.enviar("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
    writeFileSync(`.telas/mesa/pv-${tema}-${largura}.png`,Buffer.from(pvFoto.result.data,"base64"));
    await aba.avaliar('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim().startsWith("Curto (")).click()');
    await aba.avaliar('Array.from(document.querySelectorAll("label")).find(l=>l.textContent.includes("Fui tratado")).querySelector("input").click()');
    await aba.avaliar('(()=>{const s=Array.from(document.querySelectorAll("select")).find(s=>s.textContent.includes("Outra pessoa"));Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value").set.call(s,"kit-auditoria");s.dispatchEvent(new Event("change",{bubbles:true}));s.scrollIntoView({block:"center"});})()');await dormir(200);
    exigir(await aba.avaliar('document.documentElement.scrollWidth-document.documentElement.clientWidth<=1'),"Tratamento: sem transbordo");
    const novoContraste=JSON.parse(await aba.avaliar(auditoria));exigir(novoContraste.length===0,`Contraste da conta de PV e tratamento: ${novoContraste.length} falhas`);
    const tratamentoFoto=await aba.enviar("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
    writeFileSync(`.telas/mesa/tratamento-${tema}-${largura}.png`,Buffer.from(tratamentoFoto.result.data,"base64"));
    await aba.avaliar('Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Aplicar na ficha").click()');await dormir(200);
    exigir(await aba.avaliar('(()=>{const r=JSON.parse(localStorage.getItem("mushoku-tensei-roster"));const c=r.state.characters[r.state.activeId];return c.currentHp>0&&c.inventory.find(i=>i.id==="kit-auditoria").tratamentosUsados===1&&c.mesa.marcas===0&&c.mesa.exaustao===5;})()'),"Tratamento aplicado: PV, kit, marcas e Exaustão persistidos");
    await aba.fechar();
  }
},{porta:Number(process.env.PORTA_CDP??9356)});
process.exitCode=falhas?1:0;
