/**
 * Auditoria das condições de uso em cartas de dano.
 *
 * O simulador extrai regras de prosa. Uma carta nova pode dizer “Só usável”,
 * “Requer” ou “contra alvo…” e continuar parecendo uma ação comum para a IA.
 * Este inventário deixa cada ocorrência visível e declara se o motor a modela,
 * aproxima ou deliberadamente mede só pelo caso base. Uma redação condicional
 * nova e sem tratamento vira PENDENTE e falha: assim a lista não volta a ser
 * um cemitério de ocorrências que alguém precisa lembrar de reler.
 */
import { TREES } from "../src/data/trees/index";

type Estado = "MODELADO" | "APROXIMADO" | "REVISADO" | "PENDENTE";

const PADRAO = /só usável|requer|apenas se|depois de usar|enquanto|contra alvo/i;

function tratamento(efeito: string, dano: string): { estado: Estado; nota: string } {
  const modelados: string[] = [];
  if (/(?:só usável|apenas se)[^.;]*metade ou (?:menos|mais) dos pv/i.test(efeito))
    modelados.push("limiar dos PV do usuário bloqueia a ação");
  if (/depois de usar[^.;]*nível de exaustão/i.test(efeito))
    modelados.push("Exaustão é acumulada depois de cada uso");
  if (/requer cenário utilizável/i.test(efeito))
    modelados.push("o cenário precisa declarar material utilizável");
  if (/pré-requisito:[^.;]+ ativa/i.test(efeito))
    modelados.push("a preparação ativa precisa ser declarada no cenário");
  if (/requer 1 patamar em (?:Água|Fogo|Vento)/i.test(efeito))
    modelados.push("confere o patamar estruturado na outra árvore");
  if (/requer (?:o talento )?Puro Escudo/i.test(efeito))
    modelados.push("confere o pré-requisito estruturado da compra");
  if (/requer Empunhadura Dupla e uma terceira arma/i.test(efeito))
    modelados.push("confere a compra exigida e três armas no inventário");
  if (/sempre como ferida fresca|cura enquanto o golpe/i.test(efeito))
    modelados.push("a Reação cura pela fórmula de Ferida Fresca");
  if (/continua uma vez por (?:turno|combate)/i.test(efeito))
    modelados.push("limite de uso por turno/combate");
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
  if (/sustentada|por turno/i.test(`${efeito} ${dano}`)) {
    return { estado: "APROXIMADO", nota: "mede os tiques sustentados; posição e duração de cena seguem abstratas" };
  }
  if (/contra (?:objetos?|alvo)|fica (?:Caído|Desequilibrado)|qualquer resultado|ignora metade da CA/i.test(efeito)) {
    return { estado: "REVISADO", nota: "mede deliberadamente o caso base; o bônus condicional fica fora da régua" };
  }
  return { estado: "PENDENTE", nota: "redação condicional ainda sem decisão explícita no motor" };
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

for (const estado of ["MODELADO", "APROXIMADO", "REVISADO", "PENDENTE"] as const) {
  const grupo = achados.filter((a) => a.estado === estado);
  console.log(`\n${estado} (${grupo.length})`);
  for (const a of grupo) {
    console.log(`- ${a.arvore} · ${a.rank} · ${a.nome}: ${a.nota}`);
    console.log(`  “${a.efeito}”`);
  }
}

console.log(`\nTotal: ${achados.length} carta(s) de dano com condição de uso.`);
if (achados.some((a) => a.estado === "PENDENTE")) process.exitCode = 1;
