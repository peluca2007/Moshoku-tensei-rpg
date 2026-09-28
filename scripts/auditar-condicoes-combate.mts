/**
 * Auditoria das condições de uso em cartas de dano.
 *
 * O simulador extrai regras de prosa. Uma carta nova pode dizer “Só usável”,
 * “Requer” ou “contra alvo…” e continuar parecendo uma ação comum para a IA.
 * Este inventário deixa cada ocorrência visível e declara se o motor a modela,
 * aproxima ou apenas lista para revisão humana. Não falha: o que não é seguro
 * automatizar é um achado de projeto, não necessariamente um bug.
 */
import { TREES } from "../src/data/trees/index";

type Estado = "MODELADO" | "APROXIMADO" | "LISTADO";

const PADRAO = /só usável|requer|apenas se|depois de usar|enquanto|contra alvo/i;

function tratamento(efeito: string, dano: string): { estado: Estado; nota: string } {
  const modelados: string[] = [];
  if (/(?:só usável|apenas se)[^.;]*metade ou (?:menos|mais) dos pv/i.test(efeito))
    modelados.push("limiar dos PV do usuário bloqueia a ação");
  if (/depois de usar[^.;]*nível de exaustão/i.test(efeito))
    modelados.push("Exaustão é acumulada depois de cada uso");
  if (modelados.length) return { estado: "MODELADO", nota: modelados.join("; ") };
  if (/^requer alvo agarrado/i.test(efeito)) {
    return { estado: "APROXIMADO", nota: "cobra +1 Ação para agarrar e presume sucesso" };
  }
  if (/^requer 6 ?m de corrida/i.test(efeito)) {
    return { estado: "APROXIMADO", nota: "cobra +1 Ação para Andar" };
  }
  if (/^requer alvo (?:caído|preso|molhado|em chamas)/i.test(efeito)) {
    return { estado: "MODELADO", nota: "confere o estado estruturado do alvo" };
  }
  if (/contra alvo molhado/i.test(`${efeito} ${dano}`) && /frio|gelo/i.test(dano)) {
    return { estado: "MODELADO", nota: "Molhado dobra as parcelas de frio" };
  }
  if (/contra alvo (?:caído|preso)/i.test(efeito)) {
    return { estado: "MODELADO", nota: "o estado altera Vantagem/CA no resolvedor" };
  }
  if (/^uma vez por (?:turno|combate)[.:,]/i.test(efeito.trim())) {
    return { estado: "MODELADO", nota: "limite de uso por turno/combate" };
  }
  return { estado: "LISTADO", nota: "a condição ainda não altera a conta automaticamente" };
}

const achados = TREES.flatMap((tree) => tree.ranks.flatMap((rank) => rank.abilities
  .filter((ability) => ability.damage?.normal && PADRAO.test(ability.effect))
  .map((ability) => ({
    arvore: tree.name,
    rank: rank.rank,
    nome: ability.name,
    efeito: ability.effect.replace(/\s+/g, " ").trim(),
    ...tratamento(ability.effect, ability.damage?.normal ?? ""),
  }))));

for (const estado of ["MODELADO", "APROXIMADO", "LISTADO"] as const) {
  const grupo = achados.filter((a) => a.estado === estado);
  console.log(`\n${estado} (${grupo.length})`);
  for (const a of grupo) {
    console.log(`- ${a.arvore} · ${a.rank} · ${a.nome}: ${a.nota}`);
    console.log(`  “${a.efeito}”`);
  }
}

console.log(`\nTotal: ${achados.length} carta(s) de dano com condição de uso.`);
