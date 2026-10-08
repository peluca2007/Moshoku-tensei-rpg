import type { Tree } from "@/lib/types";
import { RANK_BONUS } from "@/lib/types";
import { normalizar } from "./texto-impresso";
/** Nome e número na mesma frase; números de outra frase nunca contaminam.
 * Dado por patamar é expandido apenas quando a prosa especifica o rank. */
export function numerosDaProsa(texto: string, trees: Tree[]) {
    const achados: {
        linha: number;
        motivo: string;
        frase: string;
    }[] = [];
    const cartas = trees.flatMap(t => t.ranks.flatMap(r => [...r.abilities.map(a => ({ nome: a.name, texto: `${a.damage?.normal ?? ""} ${a.damage?.encurtada ?? ""} ${a.effect}`, custo: a.pmCost, pa: a.paCost })), ...r.talents.map(a => ({ nome: a.name, texto: a.description, custo: undefined, pa: a.paCost })), ...(r.mastery ? [{ nome: r.mastery.name, texto: r.mastery.description, custo: undefined, pa: undefined }] : [])]));
    // Algumas mecânicas nomeadas vivem dentro da Maestria, como a canção
    // DISSONÂNCIA de A Plateia. O alias é extraído do cabeçalho, sem copiar dados.
    for (const c of [...cartas])
        for (const m of c.texto.matchAll(/\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ ]{2,}):/g))
            cartas.push({ nome: m[1][0] + m[1].slice(1).toLocaleLowerCase("pt-BR"), texto: c.texto.slice(m.index! + m[0].length).split(".")[0], custo: undefined, pa: undefined });
    const limpo = texto.replace(/<[^>]+>/g, m => m.replace(/[^\n]/g, " ")).replace(/\{["']\s["']\}/g, m => " ".repeat(m.length));
    for (const fraseMatch of limpo.matchAll(/[^.!?;]+[.!?;]?/g)) {
        const frase = fraseMatch[0].replace(/\s+/g, " ").trim();
        const t = normalizar(frase);
        const dice = [...t.matchAll(/\b\d+d\d+\b/g)].map(m => m[0]);
        const custos = [...t.matchAll(/\b(\d+)\s*(pm|pa)\b/g)];
        if (!dice.length && !custos.length)
            continue;
        const citadas = cartas.filter(c => frase.includes(c.nome) && (c.nome !== "Cura" || /\b(?:a|de|da) Cura\b/.test(frase)));
        // Frase com mais de uma carta exige atribuição semântica: não compare o
        // custo da primeira com a segunda. Deixe revisão humana explícita.
        if (new Set(citadas.map(c => c.nome)).size > 1)
            continue;
        for (const c of citadas.slice(0, 1)) {
            const ct = normalizar(c.texto);
            const inicioFrase = limpo.slice(0, fraseMatch.index).split(/[.!?]/).at(-1) ?? "";
            const contexto = normalizar(inicioFrase + frase);
            const rank = Object.entries(RANK_BONUS).find(([nome]) => contexto.includes(normalizar(nome)))?.[1] ?? Number(contexto.match(/(?:no|do)\s+(\d)[ºo]/)?.[1]);
            const esperados = [...ct.matchAll(/\b(\d+)d(\d+)([^.;]{0,40}?por patamar(?: seu)?)?/g)].map(m => `${Number(m[1]) * (m[3] && rank ? rank : 1)}d${m[2]}`);
            const divergentes = dice.filter(d => !esperados.includes(d));
            const pos = t.indexOf(normalizar(c.nome));
            const proximos = ["pm", "pa"].map(unidade => custos.filter(m => m[2] === unidade).sort((a, b) => Math.abs(a.index! - pos) - Math.abs(b.index! - pos))[0]).filter(m => !!m);
            const custoErrado = proximos.some(m => (m[2] === "pm" ? c.custo : c.pa) !== undefined && Number(m[1]) !== (m[2] === "pm" ? c.custo : c.pa));
            if (divergentes.length || custoErrado)
                achados.push({ linha: texto.slice(0, fraseMatch.index).split("\n").length, motivo: `${c.nome}: prosa ${divergentes.join(", ") || "custo"}; carta ${esperados.join(", ") || ct.slice(0, 110)}; PM ${c.custo ?? "—"}, PA ${c.pa ?? "—"}`, frase: frase.slice(0, 360) });
        }
    }
    return achados;
}
