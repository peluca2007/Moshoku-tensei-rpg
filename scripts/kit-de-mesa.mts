/**
 * O KIT DO TESTE DE MESA — `npm run kit:mesa` (Etapa 1 do PLANO-DO-DESIGNER.md).
 *
 * Quatro fichas de 2º patamar montadas pelo MESMO store da ficha: cada
 * desbloqueio e cada compra passam pelas regras do site (`unlockRank` e
 * `purchaseAbility` devolvem false se o livro não deixar), então a ficha que
 * chega ao jogador é uma ficha que ele poderia ter montado sozinho.
 *
 * Imprime, pra cada uma, o resumo e o LINK de importação (`/ficha/importar#…`),
 * e roda os encontros candidatos no simulador do /encontros. O KIT-DE-MESA.md
 * é escrito a partir desta saída; a segunda sessão (portão da Etapa 4) usa o
 * mesmo script, então as fichas são as mesmas antes e depois do balanço.
 *
 * BASE muda a origem dos links (padrão: o site publicado).
 */
import { useCharacterStore } from "@/store/useCharacterStore";
import { getArmorClass, getMaxHp, getMaxMp, getPaSpent, getPendingRaceAttributeChoices, getPendingTreeSkillChoices, getPpPool, getPtPool } from "@/store/selectors";
import { codificarFicha } from "@/lib/fichaLink";
import { getTreeById } from "@/data/trees";
import { getRaceById } from "@/data/races";
import { getBackgroundById } from "@/data/backgrounds";
import { CRIATURAS_PRONTAS } from "@/data/bestiary";
import { criaturaDoMolde, simularEncontro, type CriaturaEncontro } from "@/lib/encounterSim";
import { avaliar } from "@/lib/encounterBalance";
import type { AttributeKey, CharacterData, RankName } from "@/lib/types";

const BASE = process.env.BASE ?? "https://moshoku-tensei-rpg.vercel.app";

/** 3 PA iniciais + 6 sessões (1 PA por sessão, Cap. 1): o personagem que acabou de chegar ao Intermediário. */
const ORCAMENTO = 9;

interface Molde {
  nome: string;
  papel: string;
  raca: string;
  antecedente: string;
  arvore: string;
  atributos: Partial<Record<AttributeKey, number>>;
  /** O atributo que o bônus livre da raça (Humano) recebe. */
  principal: AttributeKey;
  /** Perícias do "escolha N" da Árvore Inicial. */
  pericias?: string[];
  /** Compras em ordem: [rank, tipo, id]. O Intermediário é aberto quando aparece a primeira compra dele. */
  compras: [RankName, "ability" | "talent", string][];
}

const FICHAS: Molde[] = [
  {
    nome: "Ignis",
    principal: "intelecto",
    papel: "mago elemental",
    raca: "humano",
    antecedente: "estudioso-precoce",
    arvore: "fogo",
    atributos: { intelecto: 2 },
    compras: [
      ["Principiante", "ability", "brasa"],
      ["Principiante", "ability", "bola-de-fogo"],
      ["Principiante", "ability", "toque-escaldante"],
      ["Principiante", "ability", "clarao"],
      ["Intermediário", "ability", "explosao"],
      ["Intermediário", "ability", "lanca-de-fogo"],
      ["Intermediário", "talent", "calor-dirigido"],
    ],
  },
  {
    nome: "Borrasca",
    principal: "agilidade",
    papel: "Corpo",
    raca: "raca-fera",
    antecedente: "treino-precoce",
    arvore: "deus-do-norte",
    atributos: { agilidade: 1, vigor: 1 },
    compras: [
      ["Principiante", "ability", "forma-quadrupede"],
      ["Principiante", "ability", "golpe-baixo"],
      ["Principiante", "ability", "arremesso-de-espada"],
      ["Intermediário", "ability", "finta-do-norte"],
      ["Intermediário", "ability", "desarme"],
      ["Intermediário", "talent", "segunda-chance"],
    ],
  },
  {
    nome: "Capitã Vela",
    principal: "espirito",
    papel: "Utilidade (Tático)",
    raca: "hobbit",
    antecedente: "aprendiz-mercador",
    arvore: "navegacao-e-lideranca",
    atributos: { espirito: 2 },
    compras: [
      ["Principiante", "ability", "primeiro-a-ver"],
      ["Principiante", "talent", "voz-que-corrige"],
      ["Principiante", "talent", "olho-de-cerco"],
      ["Intermediário", "ability", "antecipacao"],
      ["Intermediário", "talent", "retirada-ordenada"],
      ["Intermediário", "talent", "terreno-conhecido"],
    ],
  },
  {
    nome: "Irmã Sella",
    principal: "espirito",
    papel: "suporte (Cura)",
    raca: "elfo",
    antecedente: "acolito",
    arvore: "cura",
    atributos: { espirito: 1, vigor: 1 },
    compras: [
      ["Principiante", "ability", "cura"],
      ["Principiante", "ability", "estancar"],
      ["Principiante", "ability", "vigor-emprestado"],
      ["Intermediário", "ability", "prontidao"],
      ["Intermediário", "ability", "bencao-coletiva"],
      ["Principiante", "talent", "maos-firmes-cura"],
    ],
  },
];

function montar(m: Molde): CharacterData {
  const s = useCharacterStore.getState();
  s.createCharacter(m.nome);
  // Ficha pronta é entregue pelo Mestre, não escolhida pelo jogador: conta como
  // sorteio e não paga o PA da escolha (Cap. 1, §5). Sem isso, cada ficha
  // gastava 1 PA a mais que o orçamento do kit desde a 0.1.108.
  s.setRace(m.raca, false);
  s.setBackground(m.antecedente, false);
  const antecedente = getBackgroundById(m.antecedente);
  const primeiraLinha = (antecedente as { subtable?: { entries?: { id: string }[] } } | undefined)?.subtable?.entries?.[0]?.id;
  if (primeiraLinha) s.setSubtableEntry(primeiraLinha);
  for (const [k, v] of Object.entries(m.atributos)) s.setAttribute(k as AttributeKey, v);
  s.setStartingTree(m.arvore);
  const racaDef = getRaceById(m.raca);
  for (let i = 0; i < (racaDef?.attributeChoices ?? 0); i++) s.setRaceAttributeChoice(i, m.principal);
  const escolha = getTreeById(m.arvore)?.grantedSkills?.choose;
  if (escolha) {
    const lista = m.pericias ?? escolha.from;
    for (let i = 0; i < escolha.count; i++) s.setTreeSkillChoice(i, lista[i]);
  }
  for (const [rank, kind, id] of m.compras) {
    const atual = useCharacterStore.getState();
    const ficha = atual.characters[atual.activeId!];
    if (!ficha.unlockedRanks.some((u) => u.treeId === m.arvore && u.rank === rank)) {
      if (!atual.unlockRank(m.arvore, rank)) throw new Error(`${m.nome}: o livro não deixa abrir ${rank} em ${m.arvore}`);
    }
    if (!useCharacterStore.getState().purchaseAbility({ treeId: m.arvore, rank, kind, id })) {
      throw new Error(`${m.nome}: o livro não deixa comprar ${id} (${rank})`);
    }
  }
  const fim = useCharacterStore.getState();
  return fim.characters[fim.activeId!];
}

const nomeDe = (treeId: string, id: string) => {
  for (const r of getTreeById(treeId)?.ranks ?? []) {
    const a = [...r.abilities, ...r.talents].find((x) => x.id === id);
    if (a) return a.name;
  }
  return id;
};

const grupo: CharacterData[] = [];
for (const m of FICHAS) {
  const ficha = montar(m);
  const st = ficha as unknown as Parameters<typeof getMaxHp>[0];
  const gasto = getPaSpent(st);
  if (gasto > ORCAMENTO) throw new Error(`${m.nome} gastou ${gasto} PA (orçamento ${ORCAMENTO})`);
  const pend = getPendingTreeSkillChoices(st) + getPendingRaceAttributeChoices(st);
  grupo.push(ficha);
  console.log(`\n### ${m.nome} — ${m.papel}`);
  console.log(`${getRaceById(m.raca)?.name} · ${getBackgroundById(m.antecedente)?.name} · ${getTreeById(m.arvore)?.name} (Intermediário)`);
  console.log(`PV ${getMaxHp(st)} · PM ${getMaxMp(st)} · PT ${getPtPool(st)} · PP ${getPpPool(st)} · CA ${getArmorClass(st)} · PA ${gasto}/${ORCAMENTO}${pend ? ` · ${pend} escolha(s) livre(s) na ficha` : ""}`);
  console.log(`Compras: ${m.compras.map(([, , id]) => nomeDe(m.arvore, id)).join(", ")}`);
  console.log(`Link: ${BASE}/ficha/importar#${await codificarFicha(ficha)}`);
}

// Os encontros candidatos, só com as criaturas prontas do Apêndice G (as que
// estão NO LIVRO), montadas como o /encontros as monta: o molde do patamar, o
// Bloco do Monstro e as ações escritas.
const pronta = (id: string, quantidade: number): CriaturaEncontro => {
  const p = CRIATURAS_PRONTAS.find((c) => c.id === id)!;
  return {
    ...criaturaDoMolde(p.patamar, p.papel, p.nome, p.id),
    arquetipo: p.arquetipo,
    tamanho: p.tamanho,
    pericias: p.pericias,
    resistencias: p.resistencias,
    imunidades: p.imunidades,
    acoes: p.acoes.map((acao, i) => ({ ...acao, id: `${p.id}-${i}` })),
    quantidade,
  };
};
const ENCONTROS: [string, [string, number][]][] = [
  ["2 Serpentes", [["serpente-pantano", 2]]],
  ["Serpente + Aranha", [["serpente-pantano", 1], ["aranha-cavernas", 1]]],
  ["Serpente + Aranha + 2 Sapos", [["serpente-pantano", 1], ["aranha-cavernas", 1], ["sapo-lodo", 2]]],
  ["Aranha + 3 Sapos", [["aranha-cavernas", 1], ["sapo-lodo", 3]]],
  ["2 Serpentes + Aranha", [["serpente-pantano", 2], ["aranha-cavernas", 1]]],
  ["2 Serpentes + 2 Aranhas (o orçamento do livro)", [["serpente-pantano", 2], ["aranha-cavernas", 2]]],
];
console.log("\n## Encontros (simulador do /encontros, 400 batalhas)");
for (const [nome, lista] of ENCONTROS) {
  const r = simularEncontro(grupo, lista.map(([id, q]) => pronta(id, q)), { batalhas: 400 });
  const v = avaliar(r);
  const dano = r.porPersonagem.map((p) => `${p.nome} ${p.danoMedio.toFixed(0)}${p.curaMedia ? `/+${p.curaMedia.toFixed(0)}` : ""}`).join(" · ");
  console.log(`- ${nome}: ${v.titulo} — vitória ${(r.vitorias * 100).toFixed(0)}%, ${r.rodadasMedia.toFixed(1)} rodadas, ${r.quedasMedia.toFixed(2)} quedas · dano/batalha: ${dano}`);
}
