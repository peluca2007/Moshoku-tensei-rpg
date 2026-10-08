import type { CharacterData } from "./types";
import { RANK_BONUS } from "./types";
import { getTreeById } from "@/data/trees";
import { getFinalAttribute, getHighestUnlockedRank } from "@/store/selectors";
export type PeriodoDeUso = "combate" | "curto" | "longo" | "sessao";
export interface LimiteDeUso {
    periodo: PeriodoDeUso;
    quantidade: number;
    texto: string;
}
const normalizar = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
/** Falha fechada: múltiplos limites/gatilhos ambíguos não viram uma caixinha. */
export function lerLimite(texto: string, espirito: number, rank: number): LimiteDeUso | null {
    const t = normalizar(texto);
    const periodos = [...t.matchAll(/(?:por|a cada)\s+(combate|descanso curto|descanso longo|sessao)/g)].filter(m=>/(?:vez|vezes|usos|espirito|rank|fatos livres)\s*$/.test(t.slice(0,m.index)));
    if (periodos.length !== 1)
        return null;
    const m = periodos[0];
    const antes = t.slice(Math.max(0, m.index! - 100), m.index);
    let quantidade: number | undefined;
    const depois = t.slice(m.index! + m[0].length, m.index! + m[0].length + 80);
    if (/(?:uma|1) vez\s*$/.test(antes))
        quantidade = 1;
    else if (/(\d+) (?:vezes|usos)\s*$/.test(antes))
        quantidade = Number(antes.match(/(\d+) (?:vezes|usos)\s*$/)![1]);
    else if (/(duas|tres|quatro|cinco|seis) (?:vezes|usos)\s*$/.test(antes))
        quantidade = ({duas:2,tres:3,quatro:4,cinco:5,seis:6} as Record<string,number>)[antes.match(/(duas|tres|quatro|cinco|seis) (?:vezes|usos)\s*$/)![1]];
    else if (/(?:espirito|espirito vezes|espirito\))\s*$/.test(antes))
        quantidade = Math.max(0, espirito);
    else if (/(?:bonus de rank|bonus de rank da arvore|bonus de rank vezes|bonus de rank\))\s*$/.test(antes))
        quantidade = Math.max(0, rank);
    else if (/numero de vezes\s*$/.test(antes) && /^\s+igual ao seu espirito/.test(depois))
        quantidade = Math.max(0, espirito);
    else if (/fatos livres\s*$/.test(antes) && /^\s*=\s*(?:o seu )?bonus de rank/.test(depois))
        quantidade = Math.max(0, rank);
    // "uma vez por turno e por combate", condições e reservas que recarregam
    // não são limites de uso. Só formatos inequívocos chegam aqui.
    if (quantidade === undefined || /\b(?:se|quando)\b[^.]*$/.test(antes) && !/(?:uma|1) vez\s*$/.test(antes))
        return null;
    const periodo: PeriodoDeUso = m[1] === "combate" ? "combate" : m[1] === "sessao" ? "sessao" : m[1] === "descanso curto" ? "curto" : "longo";
    return { periodo, quantidade, texto };
}
export function limitesDaFicha(c: CharacterData) {
    const entradas = c.purchasedAbilities.flatMap(p => {
        const r = getTreeById(p.treeId)?.ranks.find(r => r.rank === p.rank);
        const def = p.kind === "ability" ? r?.abilities.find(a => a.id === p.id) : r?.talents.find(a => a.id === p.id);
        return def ? [{ chave: `${p.treeId}:${p.id}`, treeId: p.treeId, nome: def.name, texto: "effect" in def ? def.effect : def.description }] : [];
    });
    for (const u of c.unlockedRanks) {
        const def = getTreeById(u.treeId)?.ranks.find(r => r.rank === u.rank)?.mastery;
        if (def)
            entradas.push({ chave: `${u.treeId}:maestria:${u.rank}`, treeId: u.treeId, nome: def.name, texto: def.description });
    }
    for (const id of new Set(c.unlockedRanks.map(u => u.treeId)))
        if (getTreeById(id)?.category === "utilidade")
            entradas.push({ chave: `${id}:fatos-livres`, treeId: id, nome: `Fatos livres · ${getTreeById(id)!.name}`, texto: "Fatos livres por sessão = o seu Bônus de Rank naquela árvore." });
    const reconhecidas=entradas.map(e => ({ ...e, chaveOrigem:e.chave, limite: lerLimite(e.texto, getFinalAttribute(c, "espirito"), RANK_BONUS[getHighestUnlockedRank(c, e.treeId) ?? "Principiante"]) }));
    // Leitura de Batalha amplia o mesmo Improviso concedido no Principiante;
    // os usos não são dois recursos independentes. A descrição de cada
    // Maestria continua intacta, e o contador usa o limite maior concedido.
    const improvisos=reconhecidas.filter(e=>e.chave.includes(":maestria:")&&/O Improviso/.test(e.texto)&&e.limite?.periodo==="combate");
    const maiores=new Map<string,number>();
    for(const e of improvisos) maiores.set(e.treeId,Math.max(maiores.get(e.treeId)??0,e.limite!.quantidade));
    for(const e of improvisos) {
        const maior=maiores.get(e.treeId)!;
        if(e.limite!.quantidade<maior) e.limite=null;
        else e.chave=`${e.treeId}:improviso`;
    }
    return reconhecidas;
}
