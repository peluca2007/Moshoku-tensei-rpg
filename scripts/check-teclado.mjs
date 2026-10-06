/** Percurso real sem mouse. Ler o DOM orienta o teste; só teclas ativam controles.
 * FALHA: foco perdido, controle sem nome, compra sem contexto ou ação que não ocorre.
 * AVISO: NVDA e a qualidade dos anúncios precisam da escuta do autor.
 */
import { BASE, comNavegador, dormir } from './lib/navegador.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('.telas/teclado',{recursive:true});
const exigir=(ok,msg)=>{if(!ok)throw Error(msg)};
await comNavegador(async ({abrir})=>{
 const aba=await abrir(BASE+'/criar');
 aba.avaliar=async expression=>{const r=await aba.enviar('Runtime.evaluate',{expression,returnByValue:true});if(r.result?.exceptionDetails)throw Error(r.result.exceptionDetails.exception?.description??r.result.exceptionDetails.text);return r.result?.result?.value};
 async function esperar(expr){for(let i=0;i<120;i++){if(await aba.avaliar(expr))return;await dormir(250)}throw Error('Não ficou pronto: '+expr)}
 async function tecla(key,shift=false){const codes={Tab:9,Enter:13,' ':32,ArrowDown:40,ArrowUp:38,ArrowRight:39,ArrowLeft:37,Home:36,End:35};for(const type of ['keyDown','keyUp'])await aba.enviar('Input.dispatchKeyEvent',{type,key,code:key===' '?'Space':key,windowsVirtualKeyCode:codes[key],nativeVirtualKeyCode:codes[key],text:type==="keyDown"?(key==="Enter"?"\r":key===" "?" ":undefined):undefined,modifiers:shift?8:0});await dormir(25)}
 async function chegar(expr){for(let i=0;i<450;i++){if(await aba.avaliar(`(()=>{const e=document.activeElement;return ${expr}})()`))return;await tecla('Tab')}throw Error('Não alcançou por Tab: '+expr)}
 async function ativar(expr,key='Enter'){await chegar(expr);await tecla(key);await dormir(350)}
 async function ax(){const r=await aba.enviar('Accessibility.getFullAXTree');const nodes=r.result.nodes.filter(n=>!n.ignored);const falhas=nodes.filter(n=>['button','textbox','combobox','spinbutton','radio','checkbox','switch'].includes(n.role?.value)&&!n.name?.value?.trim());for(const n of falhas){const d=await aba.enviar('DOM.resolveNode',{backendNodeId:n.backendDOMNodeId});const h=await aba.enviar('Runtime.callFunctionOn',{objectId:d.result.object.objectId,functionDeclaration:'function(){return this.outerHTML}',returnByValue:true});console.log('Sem nome:',h.result.result.value)}exigir(!falhas.length,'AX: controles sem nome '+JSON.stringify(falhas.map(n=>({role:n.role?.value,id:n.backendDOMNodeId}))));return nodes}
 async function avanco(n){await ativar('e.tagName==="BUTTON" && e.textContent.includes("Avançar")');await esperar(`document.querySelector('[data-passo="${n}"]')!==null`);exigir(await aba.avaliar(`document.activeElement.dataset.passo==="${n}"`),'Foco não anunciou passo '+n);await ax()}
 try {
  await esperar('!!document.querySelector("a[href=\\"/criar/manual\\"]")');
  await ativar('e.getAttribute("href")==="/criar/manual"');
  await esperar('!!document.querySelector("[data-passo=\\"0\\"]")');
  await chegar('e.getAttribute("aria-label")==="Nome do personagem"');
  await aba.enviar('Input.insertText',{text:'Caminho pelo teclado'});await ax();
  await avanco(1);
  await ativar('e.tagName==="BUTTON" && e.textContent.trim().startsWith("Humano")',' ');
  await tecla('ArrowDown');
  exigir(await aba.avaliar('document.activeElement.getAttribute("role")==="radio" && document.activeElement.getAttribute("aria-checked")==="true"'),'Seta não escolheu raça');
  await tecla('ArrowUp');
  exigir(await aba.avaliar('document.activeElement.textContent.trim().startsWith("Humano")'),'Seta não voltou à raça humana');
  await ativar('e.getAttribute("aria-label")==="Bônus racial: +1 em Intelecto"',' ');
  await avanco(2);
  await chegar('e.getAttribute("aria-label")==="Antecedente"');await tecla('ArrowDown');await tecla('Enter');
  await avanco(3);
  await ativar('e.getAttribute("aria-label")==="Aumentar Intelecto"',' ');
  await tecla(' ');
  await avanco(4);
  await ativar('e.getAttribute("aria-label")==="Magia de Água"',' ');
  await avanco(5);
  await chegar('e.getAttribute("aria-label")==="Nova perícia"');
  await aba.enviar('Input.insertText',{text:'Arcanismo'});await tecla('Enter');
  await avanco(6);
  await ativar('e.tagName==="BUTTON" && e.textContent.includes("Adicionar Kit Inicial")',' ');
  await avanco(7);
  await ativar('e.tagName==="BUTTON" && e.textContent.includes("Ir para a Ficha")');
  await esperar('location.pathname==="/ficha" && !!document.querySelector("[data-ficha-cabecalho]")');await esperar('document.activeElement!==document.body');await ax();
  await ativar('e.tagName==="A" && e.getAttribute("href")==="/arvores"');
  await esperar('location.pathname==="/arvores"');await dormir(800);
  await ativar('e.tagName==="BUTTON" && e.textContent.trim()==="Lista"');
  await ativar('e.tagName==="BUTTON" && e.textContent.includes("Magia de Água")');
  await ativar('e.tagName==="BUTTON" && e.textContent.trim()==="Principiante"');
  await esperar('Array.from(document.querySelectorAll("button")).some(b=>b.getAttribute("aria-label")?.startsWith("Comprar Bola de Água"))');
  const nodes=await ax();
  exigir(nodes.some(n=>n.role?.value==='button'&&n.name?.value==='Comprar Bola de Água por 1 PA'),'Compra precisa dizer habilidade e PA na árvore AX');
  await ativar('e.getAttribute("aria-label")==="Comprar Bola de Água por 1 PA"',' ');
  exigir(await aba.avaliar('document.activeElement.getAttribute("aria-label")==="Bola de Água comprado"'),'Compra perdeu foco');
  exigir(await aba.avaliar('Array.from(document.querySelectorAll("[role=status]")).some(e=>e.textContent.includes("Bola de Água comprado"))'),'Compra sem anúncio');
  await ativar('e.tagName==="BUTTON" && e.textContent.trim()==="Intermediário"');
  await ativar('e.tagName==="BUTTON" && e.getAttribute("aria-disabled")==="true" && e.getAttribute("aria-label")?.startsWith("Comprar")',' ');
  const motivo=await aba.avaliar('document.getElementById(document.activeElement.getAttribute("aria-describedby"))?.textContent');
  exigir(motivo && await aba.avaliar(`Array.from(document.querySelectorAll("[role=status]")).some(e=>e.textContent===${JSON.stringify(motivo)})`),'Recusa sem anúncio do motivo');
  await ativar('e.tagName==="A" && e.getAttribute("href")==="/ficha"');
  await esperar('location.pathname==="/ficha" && !!document.querySelector("[data-carta-comprada]")');
  await chegar('e.getAttribute("aria-label")==="Gastar 1 de PV"');await tecla(' ');
  exigir(await aba.avaliar('Array.from(document.querySelectorAll("[role=status]")).some(e=>e.textContent.startsWith("PV:"))'),'PV sem anúncio');
  await ativar('e.tagName==="BUTTON" && e.textContent.trim()==="Desfazer"');
  await tecla(' ');await dormir(300);
  exigir(await aba.avaliar('!document.querySelector("[data-carta-comprada=bola-de-agua]")'),'Desfazer não removeu a compra');
  exigir(await aba.avaliar('!document.querySelector("[data-gesto-na-ficha]")'),'Desfazer conservou o gesto');
  await ativar('e.tagName==="SUMMARY" && e.textContent.includes("Exportar")');
  await ativar('e.tagName==="BUTTON" && e.textContent.includes("Copiar link")');
  await esperar('Array.from(document.querySelectorAll("button")).some(e=>e.textContent.includes("Link copiado")) || document.body.textContent.includes("O navegador não deixou copiar")');
  await tecla('Tab',true);exigir(await aba.avaliar('document.activeElement.tagName!=="BODY"'),'Shift+Tab perdeu foco');await ax();
  const foto=await aba.enviar('Page.captureScreenshot',{format:'png'});writeFileSync('.telas/teclado/percurso.png',Buffer.from(foto.result.data,'base64'));
  console.log('OK: criação manual, compra, PV, desfazer, exportação e Shift+Tab sem mouse; nomes via AX e anúncios presentes.');
  console.log('AVISO: ouvir com NVDA continua com o autor.');
 } finally {await aba.fechar()}
}).catch(e=>{console.error('FALHA: '+e.message);process.exitCode=1});
