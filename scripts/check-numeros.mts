/** Prosa pode envelhecer depois que uma carta muda. AVISO é revisão humana,
 * nunca autorização para reescrever o livro. A medição usa recursos e CA reais. */
import { writeFileSync } from "node:fs";
import { montar } from "./lib/montar-medicao.mjs";
import { TREES } from "@/data/trees";
import { COLUNAS_CORPO, COLUNAS_MAGIA, DANO_POR_TURNO_CORPO, DANO_POR_TURNO_MAGIA } from "@/data/danoPorTurno";
import { criaturaDoMolde, simularEncontro } from "@/lib/encounterSim";
import { fontesImpressas } from "./lib/texto-impresso";
import { numerosDaProsa } from "./lib/numeros-da-prosa";
let avisos = 0;
const saida: string[] = [];
for (const fonte of fontesImpressas().filter(f => /Chapter|Appendices/.test(f.arquivo))) {
    for (const a of numerosDaProsa(fonte.texto, TREES)) {
        avisos++;
        saida.push(`AVISO ${fonte.arquivo}:${a.linha} — ${a.motivo}\n  ${a.frase}`);
    }
}
const BATALHAS = Number(process.env.BATALHAS ?? 300);
saida.push("", `Apêndice C versus combate real (${BATALHAS} batalhas; semente 20261007):`, "| Árvore | Patamar | Impresso | Medido/turno | Diferença | Diagnóstico |", "| --- | --- | --- | --- | --- | --- |");
const raw: unknown[] = [];
for (const tabela of [DANO_POR_TURNO_MAGIA, DANO_POR_TURNO_CORPO])
    for (const linha of tabela) {
        const patamar = Number(linha.patamar[0]);
        const ref = ["deus-do-norte", "fogo", "cura"].map(id => montar(id, patamar, id));
        for (const [id, impresso] of Object.entries(linha.porArvore)) {
            const heroi = montar(id, patamar, id);
            const r = simularEncontro([...ref, heroi], [{ ...criaturaDoMolde(patamar, "padrao", "Molde", "molde"), tatica: "aleatorio", quantidade: 5 }], { batalhas: BATALHAS, semente: 20261007 });
            const eu = r.porPersonagem.find(p => p.id === heroi.id)!;
            const medido = eu.danoMedio / r.rodadasMedia;
            const numero = Number(impresso.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(",", "."));
            const delta = numero > 0 ? (medido - numero) / numero : null;
            const coluna = [...COLUNAS_CORPO, ...COLUNAS_MAGIA].find(c => c.treeId === id);
            const nota = delta !== null && Math.abs(delta) > 0.2 ? "AVISO" : delta === null ? "AVISO: sem célula numérica" : "OK";
            if (nota.startsWith("AVISO"))
                avisos++;
            saida.push(`| ${coluna?.label ?? id} | ${patamar} | ${impresso} | ${medido.toFixed(2)} | ${delta === null ? "—" : (100 * delta).toFixed(1) + "%"} | ${nota}${coluna?.regua === false ? " (coluna de suporte/papel próprio)" : ""} |`);
            raw.push({ id, patamar, impresso, medido, delta, personagem: heroi, resultado: r });
        }
    }
saida.push("", "Diferenças refletem método: a tabela inclui teto/área e papéis específicos; o combate inclui erro, recursos, duração e alvos disponíveis. Dano/turno é razão das médias. Cura/Invocação/Escudos precisam de interpretação do papel e dos pontos cegos; AVISO não é uma recomendação de trocar a célula.", `check:numeros — 0 FALHA, ${avisos} AVISO.`);
writeFileSync("_local/check-numeros.txt", saida.join("\n") + "\n");
writeFileSync("_local/check-numeros.json", JSON.stringify(raw, null, 2));
console.log(saida.join("\n"));
// Imports de rank e normalização são utilizados no helper compartilhado;
// mantenha o script sem regras duplicadas.
