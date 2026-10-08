/** Montador idêntico ao balancear; armazenamento só em memória, nunca o roster real. */
import type { AttributeKey, CharacterData } from "@/lib/types";
const armazenamentoVolatil = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    get length() { return armazenamentoVolatil.size; },
    clear: () => armazenamentoVolatil.clear(),
    getItem: (chave: string) => armazenamentoVolatil.get(chave) ?? null,
    key: (indice: number) => [...armazenamentoVolatil.keys()][indice] ?? null,
    removeItem: (chave: string) => { armazenamentoVolatil.delete(chave); },
    setItem: (chave: string, valor: string) => { armazenamentoVolatil.set(chave, valor); },
  } satisfies Storage,
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { localStorage: globalThis.localStorage },
});
const [arvores, kits, tipos, store] = await Promise.all([
  import("@/data/trees"),
  import("@/data/startingKits"),
  import("@/lib/types"),
  import("@/store/useCharacterStore"),
]);
const { getTreeById } = arvores;
const { getStartingKit } = kits;
const { RANKS } = tipos;
const { useCharacterStore } = store;


const PRINCIPAL = [4, 4, 5, 6, 7, 8];
const EXPERIMENTO_MAGIA = process.env.EXPERIMENTO_MAGIA;
type Item = { id: string; name: string; description?: string; effect?: string; signature?: boolean };
function pesoDeCombate(item: Item, kind: "ability" | "talent"): number {
  const t = `${item.name} ${item.description ?? ""} ${item.effect ?? ""}`;
  let p = 0;
  if (item.signature) p += 10;
  if (/\d+d\d+/.test(t)) p += 4;
  if (/^Pacto:/.test(item.name)) p += 4;
  if (/Não (ataca|luta)/.test(t)) p -= 6;
  if (/\bdano\b|ataque|acerto|Ação|Ações|aliad|Apontad|[Cc]anção|\bCA\b|Vantagem|Reação|Resistência|invocad/.test(t)) p += 2;
  if (/viag|mapa|\bPO\b|\bdias\b|região|mercad|Descanso Longo|uma hora|Ofício|ritual|contato|negoci/i.test(t)) p -= 2;
  // A reserva da escola (+2 PM e +2 PV por patamar): o mago que luta compra.
  if (/\+\d+ PM/.test(t)) p += 5;
  if (kind === "ability") p += 1;
  return p;
}

const ATRIBUTO: Record<string, AttributeKey> = {
  Força: "forca",
  Agilidade: "agilidade",
  Intelecto: "intelecto",
  Espírito: "espirito",
  Vigor: "vigor",
};

function atributoDa(treeId: string): AttributeKey {
  const rotulo = getTreeById(treeId)?.keyAttributeLabel ?? "Força";
  return ATRIBUTO[rotulo.split(" ou ")[0]] ?? "forca";
}

export function montar(treeId: string, patamar: number, nome: string, experimentar = false): CharacterData {
  const arvore = getTreeById(treeId)!;
  const s = useCharacterStore.getState();
  s.createCharacter(nome);
  s.setRace("humano", false);
  const principal = atributoDa(treeId);
  s.setAttribute(principal, PRINCIPAL[patamar - 1]);
  if (principal !== "vigor") s.setAttribute("vigor", arvore.category === "corpo" ? 3 : 2);
  // O elementalista precisa de dois atributos, mira e mana (Cap. 1, §2: "o
  // elementalista precisa de dois atributos pra chegar no mesmo lugar"). O
  // PM é Espírito × Bônus de Rank + 8; só com Intelecto, o mago de 6º tinha
  // 32 PM pra magias de 20–22 — uma por luta. Espírito dois abaixo da mira.
  if (arvore.category === "magia" && principal === "intelecto" && !process.env.SEM_MANA) {
    s.setAttribute("espirito", Math.max(0, PRINCIPAL[patamar - 1] - 2));
  }
  s.setStartingTree(treeId);
  // O kit inicial da árvore, equipado (2026-09-28): sem ele todo mundo lutava
  // pelado com a arma de referência (d6), e o tanque — cuja Guarda do Corpo
  // só compensa com CA maior que a do protegido — não protegia ninguém.
  let temArma = false;
  for (const item of getStartingKit(arvore.subgroup)?.items ?? []) {
    if (item.type === "geral") continue;
    if (item.type === "arma" && temArma) continue;
    useCharacterStore.getState().addItem({ ...item });
    const inv = useCharacterStore.getState().characters[useCharacterStore.getState().activeId!].inventory;
    useCharacterStore.getState().toggleEquipped(inv[inv.length - 1].id);
    if (item.type === "arma") temArma = true;
  }
  for (const rank of RANKS.slice(0, patamar)) {
    useCharacterStore.getState().unlockRank(treeId, rank);
    const def = arvore.ranks.find((r) => r.rank === rank);
    if (!def) continue;
    const candidatos = [
      ...def.abilities.map((a) => ({ kind: "ability" as const, id: a.id, peso: pesoDeCombate(a as Item, "ability") })),
      ...def.talents.map((t) => ({ kind: "talent" as const, id: t.id, peso: pesoDeCombate(t as Item, "talent") })),
    ].sort((x, y) => y.peso - x.peso);
    let compradas = 0;
    for (const c of candidatos) {
      // Controle pareado, sem conceder PA ou recursos extras à versão nova.
      if (process.env.SEM_NOVAS_DEFESAS === "1" && ["couraca-de-barro", "refrao-da-retomada"].includes(c.id)) continue;
      if (compradas >= 4) break;
      if (useCharacterStore.getState().purchaseAbility({ treeId, rank, kind: c.kind, id: c.id })) compradas++;
    }
  }
  const fim = useCharacterStore.getState();
  const personagem = fim.characters[fim.activeId!];
  if (!experimentar || arvore.category !== "magia") return personagem;
  // Bancada da Tarefa 7: mede as duas propostas sem transformar hipótese em
  // regra do livro. `PV` aproxima dados iniciais mais robustos; `ESCUDO`
  // aproxima uma Reação de 2 PM que concede uma casca uma vez por combate.
  if (EXPERIMENTO_MAGIA === "PV" && patamar <= 2) return { ...personagem, bonusHp: personagem.bonusHp + 4 * patamar };
  if (EXPERIMENTO_MAGIA === "ESCUDO" && patamar <= 2) return { ...personagem, bonusHp: personagem.bonusHp + 9 + patamar };
  if (EXPERIMENTO_MAGIA === "PV_TODOS") return { ...personagem, bonusHp: personagem.bonusHp + 4 * patamar };
  if (EXPERIMENTO_MAGIA === "PM") return { ...personagem, bonusMp: personagem.bonusMp + 20 };
  if (EXPERIMENTO_MAGIA === "BC") return {
    ...personagem,
    attributeBase: { ...personagem.attributeBase, [principal]: personagem.attributeBase[principal] + 2 },
  };
  return personagem;
}

