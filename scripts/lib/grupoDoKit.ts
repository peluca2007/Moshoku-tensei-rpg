/**
 * O grupo de calibragem do molde — o kit de mesa subido patamar a patamar.
 * Mora aqui desde 2026-10-05 porque dois scripts o usam: o `medir:orcamento`
 * (a tabela do Apêndice G) e o `check:molde` (o alarme quando ela sai da faixa).
 */
import { useCharacterStore } from "@/store/useCharacterStore";
import { getTreeById } from "@/data/trees";
import { RANKS, type AttributeKey, type CharacterData } from "@/lib/types";

const PRINCIPAL = [4, 4, 5, 6, 7, 8];

/*
 * O quarto lugar (2026-09-27). O kit de mesa tem uma Tática (Vela), e o motor
 * não enxerga o Tático: ela entrava na conta como um alvo que não faz nada, e
 * os moldes foram calibrados contra um grupo de TRÊS. Até o motor aprender o
 * Tático (Tarefa 6 do Codex), a calibragem usa uma Arqueira — a mediana do
 * `npm run balancear`. `GRUPO=kit` volta ao kit de mesa.
 */
const QUARTO =
  process.env.GRUPO === "kit"
    ? { nome: "Vela", arvore: "navegacao-e-lideranca", principal: "espirito" as AttributeKey, corpo: false }
    : { nome: "Mira", arvore: "arquearia", principal: "agilidade" as AttributeKey, corpo: true };

export const GRUPO: { nome: string; arvore: string; principal: AttributeKey; corpo: boolean }[] = [
  { nome: "Ignis", arvore: "fogo", principal: "intelecto", corpo: false },
  { nome: "Borrasca", arvore: "deus-do-norte", principal: "agilidade", corpo: true },
  QUARTO,
  { nome: "Sella", arvore: "cura", principal: "espirito", corpo: false },
];

export function montar(g: (typeof GRUPO)[number], patamar: number): CharacterData {
  const s = useCharacterStore.getState();
  s.createCharacter(`${g.nome} ${patamar}º`);
  s.setRace("humano", false);
  s.setAttribute(g.principal, PRINCIPAL[patamar - 1]);
  s.setAttribute("vigor", g.corpo ? 3 : 2);
  s.setStartingTree(g.arvore);
  const arvore = getTreeById(g.arvore)!;
  for (const rank of RANKS.slice(0, patamar)) {
    useCharacterStore.getState().unlockRank(g.arvore, rank);
    const def = arvore.ranks.find((r) => r.rank === rank);
    if (!def) continue;
    // Quatro compras por patamar: a assinatura, as técnicas seguintes, e
    // talentos pra completar (o Tático tem uma técnica só por patamar, e o
    // patamar seguinte pede 3 conhecimentos na árvore).
    const tecnicas = [...def.abilities.filter((a) => a.signature), ...def.abilities.filter((a) => !a.signature)].slice(0, 3);
    const compras = [
      ...tecnicas.map((a) => ({ kind: "ability" as const, id: a.id })),
      ...def.talents.map((t) => ({ kind: "talent" as const, id: t.id })),
    ].slice(0, 4);
    for (const c of compras) useCharacterStore.getState().purchaseAbility({ treeId: g.arvore, rank, ...c });
  }
  const fim = useCharacterStore.getState();
  return fim.characters[fim.activeId!];
}
