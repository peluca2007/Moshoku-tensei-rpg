import { INVOCACAO_TREE } from "@/data/trees/invocacao";
import { getFinalAttribute, getHighestUnlockedRank } from "@/store/selectors";
import { RANK_BONUS, type CharacterData } from "./types";
import { novaAcao, novoEstado, type EstadoPersonagem } from "./combatSim";

export interface PactoDeCombate { id: string; nome: string; descricao: string; custo: number; dano: string; quantidade: number; golpes: number; pvPorRank?: number; deslocamento?: number; resistencia?: boolean }
const perfis: Record<string, Partial<PactoDeCombate> & { dano: string }> = {
  "pacto-cao-de-caca": { dano: "2d6" }, "pacto-corvo-mensageiro": { dano: "1d6", deslocamento: 18 },
  "pacto-urso-das-cavernas": { dano: "4d10" }, "pacto-serpente-de-nevoa": { dano: "2d6 (veneno)" },
  "pacto-grifo": { dano: "3d10", deslocamento: 24 }, "pacto-quimera": { dano: "2d8", golpes: 3 },
  "pacto-golem-de-guerra": { dano: "6d8", deslocamento: 6, resistencia: true },
  "pacto-alcateia": { dano: "1d8", quantidade: 5 }, "pacto-fera-ancestral": { dano: "4d10", golpes: 3 },
};

export function pactosDeCombate(c: CharacterData): PactoDeCombate[] {
  const compras = new Set(c.purchasedAbilities.filter((a) => a.treeId === "invocacao").map((a) => a.id));
  return INVOCACAO_TREE.ranks.flatMap((rank) => rank.talents.flatMap((t) => {
    if (!compras.has(t.id)) return [];
    let perfil = perfis[t.id];
    let custo = RANK_BONUS[rank.rank] * 3;
    if (t.id === "pacto-filhote") {
      if (compras.has("evolucao-forma-imortal")) { perfil = { dano: "4d8", pvPorRank: 25, resistencia: true }; custo = 9; }
      else if (compras.has("evolucao-forma-media")) { perfil = { dano: "2d8", pvPorRank: 15 }; custo = 6; }
    }
    return perfil ? [{ id: t.id, nome: t.name.replace("Pacto: ", ""), descricao: t.description, custo, quantidade: 1, golpes: 1, ...perfil }] : [];
  }));
}

/** Pactos já invocados antes da iniciativa: o PM do preparo é descontado do dono. */
export function prepararInvocados(grupo: CharacterData[], heroes: EstadoPersonagem[], selecao: Record<string, string[]> = {}): EstadoPersonagem[] {
  const invocados: EstadoPersonagem[] = [];
  for (const c of grupo) {
    const dono = heroes.find((h) => h.ficha.id === c.id)!;
    const rank = getHighestUnlockedRank(c, "invocacao");
    const bonus = rank ? RANK_BONUS[rank] : 0;
    const ids = [...new Set(selecao[c.id] ?? [])];
    if (ids.length > bonus) throw new Error(`${dono.nome}: quantidade de Pactos superior ao limite do Rank.`);
    const disponiveis = pactosDeCombate(c);
    for (const id of ids) {
      const pacto = disponiveis.find((p) => p.id === id);
      if (!pacto || !bonus) throw new Error(`${dono.nome}: Pacto indisponível na ficha.`);
      if (dono.pm < pacto.custo) throw new Error(`${dono.nome}: PM insuficiente para preparar ${pacto.nome}.`);
      dono.pm -= pacto.custo;
      const bc = getFinalAttribute(c, "espirito") + bonus;
      const pv = Math.max(1, Math.floor((pacto.pvPorRank ?? (bonus >= 3 ? 15 : 10)) * bonus / (pacto.quantidade > 1 ? 4 : 1)));
      for (let i = 0; i < pacto.quantidade; i++) {
        const nome = `${pacto.nome}${pacto.quantidade > 1 ? ` ${i + 1}` : ""} (${dono.nome})`;
        const danoBonus = id === "pacto-filhote" && pacto.custo === 6 ? bc : bonus >= 3 ? bonus : 0;
        const estado = novoEstado({
          ...dono.ficha, id: `${c.id}:${id}:${i}`, nome, invocadoDe: c.id, acoesPorTurno: 1, ataquesPorAcao: pacto.golpes,
          ca: 10 + bonus, pvMax: pv, pmMax: 0, ptMax: 0, bc, resistencia: bc,
          rankAgua: 0, rankLadino: 0, temPassoVazio: false, temAparar: false, temDevolver: false, temGuardaCorpo: false,
          temMareRetorno: false, reacaoExtraFixa: 0, fluxoUsosMax: 0, posturaBonusCA: 0, posturaReacoesExtra: 0,
          deslocamento: pacto.deslocamento ?? 9, acoes: [], imunidades: [],
          resistencias: pacto.resistencia ? ["cortante", "perfurante", "contundente"] : [],
          arma: { ...dono.ficha.arma, id: null, nome: pacto.nome, baseDie: pacto.dano, escalatedDie: pacto.dano, steps: 0,
            attackBonus: bc, damageBonus: danoBonus, penalidadeQuebrantado: 0, proficiente: true },
          ataqueBasico: novaAcao({ nome: "golpe comum", dano: pacto.dano, ataque: true, alcance: "Corpo a corpo" }),
        });
        estado.fioDaVida = false;
        invocados.push(estado);
      }
    }
  }
  return invocados;
}
