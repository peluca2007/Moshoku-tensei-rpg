/** Benefício contra regra ausente pode vender uma opção morta. FALHA só para
 * efeito integral de oportunidade sem movimento; desconhecidos são AVISO.
 * Não entra no gate de publicação até as decisões do autor serem aplicadas. */
import { fontesImpressas, normalizar } from "./lib/texto-impresso";
import { TREES } from "@/data/trees";
import { WEAPON_GROUPS } from "@/data/weaponGroups";
// Definições explícitas, com origem revisável. Encontrar o termo numa carta
// NÃO o define: apenas capítulos/glossário podem confirmar um desconhecido.
const penalidades = [
    { termo: /terreno dificil/, fonte: "Cap. 4, §3" },
    { termo: /caid[oa]/, fonte: "Glossário: Caído" },
    { termo: /sem proficiencia|arma.*proficiencia/, fonte: "Cap. 1, §4" },
    { termo: /armadura.*furtividade/, fonte: "Cap. 1, §4" },
    { termo: /exaust/, fonte: "Cap. 4, §9" },
    { termo: /preso|envenenad|amedrontad|quebrantad/, fonte: "Glossário de Condições" },
    { termo: /distancia longa|atirar colado/, fonte: "Cap. 4, §3" },
];
const fontes = fontesImpressas();
const definicoes = normalizar(fontes.filter(f => /Chapter|condicoes/.test(f.arquivo)).map(f => f.texto).join("\n"))
    .replace(/<[^>]+>/g, "").replace(/&ldquo;|&rdquo;/g, '"');
let falhas = 0, avisos = 0;
const reportados = new Set<string>();
function relatar(tipo: "FALHA" | "AVISO", arquivo: string, linha: number, motivo: string, frase: string) {
    const key = `${arquivo}:${linha}:${motivo}`;
    if (reportados.has(key))
        return;
    reportados.add(key);
    if (tipo === "FALHA")
        falhas++;
    else
        avisos++;
    console.log(`${tipo} ${arquivo}:${linha} — ${motivo}\n  ${frase.trim().slice(0, 340)}`);
}
const medidas = ["alcance da arma", "alcance maximo", "alcance curto", "alcance longo", "distancia longa", "distancia curta", "invisivel", "invisibilidade", "visao no escuro", "escuridao total", "luz fraca"];
// Uma medida é definida apenas com uma explicação operacional, nunca porque
// aparece no mesmo capítulo (ex.: a Cicatriz 11 usa, mas não define alcance).
function definida(termo: string) {
    const alcances = ["arcos-e-bestas", "arremesso"].every(id => {
        const a = WEAPON_GROUPS.find(g => g.id === id)?.alcance;
        return a && a.normal > 0 && a.longo > a.normal;
    });
    if (alcances && termo === "alcance da arma" && /alcance da arma[^\n]{0,50}e o normal/.test(definicoes)) return true;
    if (alcances && termo === "alcance maximo" && /alcance maximo[^\n]{0,50}e o longo/.test(definicoes)) return true;
    if (alcances && termo === "distancia longa" && /alem dele e ate o longo[^\n]{0,70}distancia longa[^\n]{0,30}desvantagem/.test(definicoes)) return true;
    const escaped = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`${escaped}[^.\n]{0,100}(?:significa|e definido|:|=)[^.\n]{0,160}(?:\\d+\\s*m|vantagem|desvantagem|enxerga|ataque|oculto)`).test(definicoes)
        || (termo === "invisivel" && /nome:\s*["']invisivel/.test(definicoes));
}
for (const { arquivo, texto } of fontes) {
    texto.split("\n").forEach((frase, indice) => {
        const t = normalizar(frase);
        for (const medida of medidas)
            if (t.includes(medida) && !definida(medida))
                relatar("AVISO", arquivo, indice + 1, `medida/estado sem definição confirmada: ${medida}`, frase);
        const efeito = t.includes("description:") ? t.slice(t.indexOf("description:")) : t;
        const oportunidade = /(?:nao|nunca|sem) provoca(?:r)?[^.]{0,55}oportunidade/.test(efeito);
        if (oportunidade && !/mover|movimento|desloc|recu|avanc|sair|passo|desengaj/.test(efeito)) {
            const integral = TREES.some(tree => tree.ranks.some(r => [...r.talents.map(t => t.description), ...r.abilities.map(a => a.effect)].some(texto => t.includes(normalizar(texto)) && /^(?:voce )?(?:disparar|conjurar|beber [^.]+?) (?:nao|nunca) provoca ataques? de oportunidade\.?$/i.test(normalizar(texto)))));
            relatar(integral ? "FALHA" : "AVISO", arquivo, indice + 1, "oportunidade por ação que não é movimento (Cap. 4, §4)", frase);
        }
        const imunidade = t.match(/(?:nao|nunca) sofre (?:desvantagem|penalidade)(?: de| por| em)?\s+([^."\n]+)|ignora (?:a )?penalidade (?:de|por)\s+([^."\n]+)|sem penalidade/);
        if (imunidade && !penalidades.some(p => p.termo.test(imunidade[0]))) {
            const integral = TREES.some(tree => tree.ranks.some(r => [...r.talents.map(t => t.description), ...r.abilities.map(a => a.effect)].some(texto => t.includes(normalizar(texto)) && /^(?:voce )?(?:(?:nao|nunca) sofre (?:desvantagem|penalidade)|ignora (?:a )?penalidade)[^.]+\.?$/.test(normalizar(texto)))));
            relatar(integral ? "FALHA" : "AVISO", arquivo, indice + 1, "imunidade sem penalidade definida no mapa; revisar definição", frase);
        }
    });
}
console.log(`\ncheck:fantasmas — ${falhas} FALHA, ${avisos} AVISO. Mapa: ${penalidades.map(p => p.fonte).join("; ")}.`);
process.exitCode = falhas ? 1 : 0;
