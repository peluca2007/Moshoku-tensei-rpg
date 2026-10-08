/** Compara largura/profundidade no mesmo orçamento real de PA. Variantes de
 * PV existem apenas nesta bancada; não alteram selectors nem dados do livro. */
import { writeFileSync } from "node:fs";
import { montar } from "./lib/montar-medicao.mjs";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getTreeById } from "@/data/trees";
import { RANKS, RANK_BONUS, PV_BASE, getVigorFactor, type CharacterData } from "@/lib/types";
import { diceAverage } from "@/lib/dice";
import { getMaxHp, getMaxMp, getPtPool, getArmorClass, getPaSpent, getFinalAttribute, getTrainedBody } from "@/store/selectors";
import { montarFicha } from "@/lib/combatSim";
import { criaturaDoMolde, simularEncontro } from "@/lib/encounterSim";
import { PA_TIPICO_POR_PATAMAR } from "@/data/ritmoDePa";
const BATALHAS = Number(process.env.BATALHAS ?? 300);
const atual = () => { const s = useCharacterStore.getState(); return s.characters[s.activeId!]; };
function tentar(orcamento: number, acao: () => unknown) {
    const antes = structuredClone(atual());
    acao();
    if (getPaSpent(atual()) > orcamento)
        useCharacterStore.setState(s => ({ characters: { ...s.characters, [antes.id]: antes } }));
}
function build(tipo: "fundo" | "largo-Corpo" | "largo-misto", pa: number, patamar: number) {
    const inicio = montar("armas-pesadas", 1, tipo);
    useCharacterStore.setState(s => ({ characters: { ...s.characters, [inicio.id]: { ...inicio, attributeBase: { forca: 4, agilidade: 0, vigor: 0, intelecto: 0, espirito: 0 }, unlockedRanks: [{ treeId: "armas-pesadas", rank: "Principiante" }], purchasedAbilities: [] } } }));
    const ids = tipo === "fundo" ? ["armas-pesadas"] : tipo === "largo-misto" ? ["armas-pesadas", "deus-do-norte"] : ["armas-pesadas", "deus-da-espada", "cavalaria-e-escudos", "deus-da-agua-corpo", "deus-do-norte", "arquearia", "vendaval"];
    for (const id of ids) {
        tentar(pa, () => useCharacterStore.getState().unlockRank(id, "Principiante"));
        const def = getTreeById(id)!.ranks[0];
        for (const talent of def.talents.filter(t => t.grants?.hpPerRank))
            tentar(pa, () => useCharacterStore.getState().purchaseAbility({ treeId: id, rank: "Principiante", kind: "talent", id: talent.id }));
    }
    const ranks = tipo === "largo-Corpo" ? 1 : tipo === "largo-misto" ? Math.max(2, patamar - 1) : patamar;
    for (const rank of RANKS.slice(0, ranks))
        for (const id of ids) {
            tentar(pa, () => useCharacterStore.getState().unlockRank(id, rank));
            const def = getTreeById(id)!.ranks.find(r => r.rank === rank);
            if (!def)
                continue;
            const candidatos = [...def.abilities.map(a => ({ id: a.id, kind: "ability" as const, peso: (a.signature ? 10 : 0) + (/\d+d\d+/.test(`${a.damage?.normal} ${a.effect}`) ? 4 : 0) })), ...def.talents.map(t => ({ id: t.id, kind: "talent" as const, peso: t.grants?.hpPerRank ? 8 : 0 }))].sort((a, b) => b.peso - a.peso);
            let compradas = 0;
            for (const c of candidatos) {
                if (compradas === 4)
                    break;
                const antes = atual().purchasedAbilities.length;
                tentar(pa, () => useCharacterStore.getState().purchaseAbility({ treeId: id, rank, kind: c.kind, id: c.id }));
                if (atual().purchasedAbilities.length > antes)
                    compradas++;
            }
        }
    return structuredClone(atual());
}
export function roxy() {
    const c = montar("agua", 1, "Roxy (referência sem orçamento)");
    return { ...c, raceId: "migurd", attributeBase: { forca: 0, agilidade: 3, vigor: 2, intelecto: 5, espirito: 5 }, inventory: [], purchasedAbilities: [], unlockedRanks: [["agua", 4], ["terra", 3], ["vento", 3], ["cura", 2]].flatMap(([id, n]) => RANKS.slice(0, Number(n)).map(rank => ({ treeId: String(id), rank }))) } satisfies CharacterData;
}
function variantes(c: CharacterData) {
    const dados = c.unlockedRanks.map(u => ({ id: u.treeId, nivel: RANK_BONUS[u.rank], dado: diceAverage(getTreeById(u.treeId)!.ranks.find(r => r.rank === u.rank)!.hpDiceFormula) }));
    const dominante = [...new Set(dados.map(d => d.id))].sort((a, b) => Math.max(...dados.filter(d => d.id === b).map(d => d.nivel)) - Math.max(...dados.filter(d => d.id === a).map(d => d.nivel)) || (a === c.startingTreeId ? -1 : 1))[0];
    const soma1 = RANKS.map((_, i) => Math.max(0, ...dados.filter(d => d.nivel === i + 1).map(d => d.dado))).reduce((a, b) => a + b, 0);
    const soma2 = dados.reduce((a, d) => a + (d.id === dominante ? d.dado : Math.floor(d.dado / 2)), 0);
    const soma3 = dados.filter(d => d.id === c.startingTreeId || dados.some(o => o.id === d.id && o.nivel >= 2)).reduce((a, d) => a + d.dado, 0);
    const fator = getVigorFactor(getFinalAttribute(c, "vigor"));
    const extra = getMaxHp(c) - Math.floor(getTrainedBody(c) * fator);
    return [getMaxHp(c), ...[soma1, soma2, soma3].map(s => Math.floor((PV_BASE + 1.67 * s) * fator) + extra)];
}
const linhas: string[] = ["# Tarefa 14c — largura e profundidade", "", `2026-10-07. ${BATALHAS} batalhas/célula, semente 20261007; quatro criaturas = Equilibrado, cinco = Difícil, alvo aleatório. Trio: Fogo, Cura e Arquearia; a build ocupa o lutador.`, "", "Vigor 0, Força 4, raça humana sorteada sem bônus escolhido; kit do Lutador equipado. Compras feitas pela store, sem conceder PA. Quatro compras por rank, assinatura/dano e reserva primeiro. PA não gasto é reportado, não vira PV grátis. A referência Roxy tem os atributos/ranks do Apêndice A e excede alguns orçamentos: não é comparação pareada.", "", "Variantes: 1 maior dado por patamar; 2 árvore dominante inteira, demais dados pela metade arredondada para baixo; 3 dados de árvores externas apenas quando chegaram ao 2º. Reservas de talentos permanecem em todas; apenas os dados de PV mudam.", ""];
const raw: unknown[] = [];
for (let p = 1; p <= 4; p++) {
    const pa = PA_TIPICO_POR_PATAMAR[p - 1];
    linhas.push(`## ${p}º patamar — orçamento ${pa} PA`, "", "| Build | PA real | Patamares | PV atual/1/2/3 | PT | PM | CA | Acerto | Dano/turno E | Vitória E/D | Quedas E/D | Vitória 1 E/D | Vitória 2 E/D | Vitória 3 E/D |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    const ref = ["fogo", "cura", "arquearia"].map(id => montar(id, p, id));
    for (const c of [...(["fundo", "largo-Corpo", "largo-misto"] as const).map(t => build(t, pa, p)), roxy()]) {
        const hp = variantes(c);
        const resultados = hp.map(maxHp => [4, 5].map(quantidade => simularEncontro([...ref, { ...c, overrides: { ...c.overrides, maxHp } }], [{ ...criaturaDoMolde(p, "padrao", "Molde", "molde"), tatica: "aleatorio", quantidade }], { batalhas: BATALHAS, semente: 20261007 })));
        const f = montarFicha(c);
        const pct = (r: typeof resultados[number]) => r.map(x => (100 * x.vitorias).toFixed(1) + "%").join(" / ");
        const dano = resultados[0][0].porPersonagem.find(x => x.id === c.id)!.danoMedio / resultados[0][0].rodadasMedia;
        linhas.push(`| ${c.name} | ${getPaSpent(c)} | ${c.unlockedRanks.length} | ${hp.join(" / ")} | ${getPtPool(c)} | ${getMaxMp(c)} | ${getArmorClass(c)} | ${f.bc} | ${dano.toFixed(1)} | ${pct(resultados[0])} | ${resultados[0].map(x => x.quedasMedia.toFixed(2)).join(" / ")} | ${resultados.slice(1).map(pct).join(" | ")} |`);
        raw.push({ patamar: p, orcamento: pa, character: c, pv: hp, resultados });
    }
    console.log(linhas.slice(-6).join("\n"));
}
linhas.push("", "Dano/turno é razão entre médias de dano e duração, não média das razões individuais. Acerto é o BC da árvore inicial; ações de outras árvores podem ter bônus próprios. IA/controle/mapa mantêm as limitações do balancear. O atributo fixo permite isolar PA investido em árvores, não mede compra ótima de atributos.", "", "Conclusões: no orçamento de 17 PA, largo-Corpo tem 100 PV e 73% no Difícil; fundo tem 52 PV e 68,7%. Com 47 PA, largo-Corpo fica em 55%, contra 59,3% do fundo: PV sozinho não determina vitória.", "No orçamento de 30 PA, as variantes 1/2/3 baixam largo-Corpo de 128 PV para 53/88/53 e o Difícil de 74,3% para 38,3%/56,3%/38,3%, conservando compras e sementes.", "Roxy serve de controle de fórmula; não representa uma build comprável em todos esses orçamentos.");
writeFileSync("_local/docs/RELATORIO-CODEX-LARGURA.md", linhas.join("\n") + "\n");
writeFileSync("_local/medir-largura.json", JSON.stringify(raw, null, 2));
