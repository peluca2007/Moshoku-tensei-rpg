/**
 * O BALANCEADOR — `npm run balancear` (2026-09-27, ideia do autor: "usar o
 * simulador de encontros pra balancear o sistema inteiro").
 *
 * A pergunta que ele responde: **quanto cada árvore leva o grupo adiante?**
 * Não "quanto dano ela dá" (o Apêndice C e o `medir:regua` já medem isso, e
 * cura, controle e Tático não aparecem em dano), mas o que o JOGO mede: o
 * grupo ganha, em quantas rodadas, e com quantos caídos.
 *
 * O método é o do "valor de substituição":
 * - um grupo de referência de três (Deus do Norte, Fogo e Cura — o kit de mesa
 *   sem o quarto lugar) fica fixo;
 * - o quarto lugar recebe cada uma das 19 árvores, uma de cada vez, montada
 *   do jeito honesto do `medir:orcamento`: todos os ranks até o patamar,
 *   quatro compras por rank (a assinatura primeiro), o atributo da árvore na
 *   régua do Apêndice C (4 no 1º, 8 no 6º) e Vigor 3 no Corpo, 2 no resto;
 * - o grupo enfrenta dois encontros do Apêndice G no mesmo patamar: o
 *   DIFÍCIL (cinco criaturas do molde — o Equilibrado de quatro satura perto
 *   de 95% e esconde a diferença) e um CHEFE;
 * - a mesma semente pra todas as árvores: a diferença é a árvore, não a sorte.
 *
 * O relatório marca quem se afasta da mediana do patamar: vitória 12 pontos
 * abaixo ou acima, ou rodadas 20% mais longas. Longe da mediana é SUSPEITO,
 * não culpado — o motor tem pontos cegos, listados em CEGOS abaixo, e a
 * árvore que vive neles aparece mais fraca do que é na mesa.
 *
 *   npm run balancear                 (6 patamares, 300 batalhas)
 *   PATAMARES=1,3,6 BATALHAS=200 npm run balancear
 *   npm run balancear -- --md         (tabela em markdown pra colar no plano)
 */
import { useCharacterStore } from "@/store/useCharacterStore";
import { TREES, getTreeById } from "@/data/trees";
import { getStartingKit } from "@/data/startingKits";
import { criaturaDoMolde, simularEncontro, type ResultadoEncontro } from "@/lib/encounterSim";
import { RANKS, type AttributeKey, type CharacterData } from "@/lib/types";

const BATALHAS = Number(process.env.BATALHAS ?? 300);
const PATAMARES = (process.env.PATAMARES ?? "1,2,3,4,5,6").split(",").map(Number);
const PRINCIPAL = [4, 4, 5, 6, 7, 8];
const SEMENTE = 20260927;
const MD = process.argv.includes("--md");
const EXPERIMENTO_MAGIA = process.env.EXPERIMENTO_MAGIA;

/**
 * O que o motor ainda não enxerga (ou enxerga pela metade) em cada árvore —
 * depois da Tarefa 6 do Codex (RELATORIO-CODEX-SIMULADOR.md, 2026-09-28).
 */
const CEGOS: Record<string, string> = {
  "navegacao-e-lideranca": "Ponto de Estrangulamento, Manobra e Emboscada (mapa e preparo)",
  "bardo-e-interacao": "Marcha, Réquiem e as canções de efeito narrativo",
  invocacao: "ordens e poderes narrativos dos Pactos",
  "furtividade-e-armadilhas": "armadilha preparada, emboscada e furtividade",
  teorica: "fórmulas montadas na hora (o motor usa as fixas)",
};

/*
 * O QUE COMPRAR (2026-09-28). Era "a assinatura e os primeiros da lista", e em
 * metade das árvores de Utilidade isso é exploração (Mapa Vivo, Suprimento,
 * Sinais) — e na Invocação eram três talentos preparatórios e nenhum Pacto até
 * o 3º patamar. O personagem que vai pra luta compra o que luta: pontua cada
 * item pelo texto e fica com os quatro melhores do patamar que a ficha aceita.
 */
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

function montar(treeId: string, patamar: number, nome: string, experimentar = false): CharacterData {
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

const REFERENCIA = ["deus-do-norte", "fogo", "cura"];

interface Linha {
  treeId: string;
  nome: string;
  categoria: string;
  dificil: ResultadoEncontro;
  chefe: ResultadoEncontro;
  contribuicao: number;
  sobreviveu: number;
}

function mediana(v: number[]): number {
  const o = [...v].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const suspeitos: string[] = [];

for (const patamar of PATAMARES) {
  const referencia = REFERENCIA.map((id, i) => montar(id, patamar, `Ref${i + 1}`));
  const dificil = [{ ...criaturaDoMolde(patamar, "padrao", "Criatura", `d${patamar}`), tatica: "aleatorio" as const, quantidade: 5 }];
  const chefe = [{ ...criaturaDoMolde(patamar, "chefe", "Chefe", `k${patamar}`), tatica: "aleatorio" as const, quantidade: 1 }];

  const linhas: Linha[] = [];
  for (const arvore of TREES) {
    const heroi = montar(arvore.id, patamar, arvore.name, true);
    const grupo = [...referencia, heroi];
    const rd = simularEncontro(grupo, dificil, { batalhas: BATALHAS, semente: SEMENTE });
    const rc = simularEncontro(grupo, chefe, { batalhas: BATALHAS, semente: SEMENTE });
    const eu = (r: ResultadoEncontro) => r.porPersonagem.find((p) => p.id === heroi.id)!;
    linhas.push({
      treeId: arvore.id,
      nome: arvore.name,
      categoria: arvore.category,
      dificil: rd,
      chefe: rc,
      contribuicao: (eu(rd).danoMedio + eu(rd).curaMedia + eu(rc).danoMedio + eu(rc).curaMedia) / 2,
      sobreviveu: (eu(rd).sobreviveu + eu(rc).sobreviveu) / 2,
    });
  }

  const medVit = mediana(linhas.map((l) => (l.dificil.vitorias + l.chefe.vitorias) / 2));
  const medRod = mediana(linhas.map((l) => (l.dificil.rodadasMedia + l.chefe.rodadasMedia) / 2));
  const medCon = mediana(linhas.map((l) => l.contribuicao));

  console.log(`\n## ${patamar}º patamar — grupo de referência (Norte, Fogo, Cura) + a árvore\n`);
  console.log(
    MD
      ? "| Árvore | Difícil (5) | Chefe | Rodadas | Caídos | Contribuição | Sobrevive | |\n| --- | --- | --- | --- | --- | --- | --- | --- |"
      : "Árvore                     Difícil  Chefe  Rodadas  Caídos  Contrib.  Sobrevive"
  );
  linhas.sort((a, b) => b.dificil.vitorias + b.chefe.vitorias - (a.dificil.vitorias + a.chefe.vitorias));
  for (const l of linhas) {
    const vit = (l.dificil.vitorias + l.chefe.vitorias) / 2;
    const rod = (l.dificil.rodadasMedia + l.chefe.rodadasMedia) / 2;
    const caidos = (l.dificil.quedasMedia + l.chefe.quedasMedia) / 2;
    const marcas: string[] = [];
    if (vit - medVit >= 0.12) marcas.push("▲ forte");
    if (medVit - vit >= 0.12) marcas.push("▼ fraca");
    if (rod > medRod * 1.2) marcas.push("lenta");
    if (l.contribuicao > medCon * 1.6) marcas.push("contribui muito");
    if (l.contribuicao < medCon * 0.5) marcas.push("contribui pouco");
    const cego = CEGOS[l.treeId];
    const nota = marcas.length ? marcas.join(", ") + (cego ? ` (motor cego: ${cego})` : "") : "";
    if (marcas.length) suspeitos.push(`${patamar}º · ${l.nome}: ${nota}`);
    const cel = [
      pct(l.dificil.vitorias),
      pct(l.chefe.vitorias),
      rod.toFixed(1),
      caidos.toFixed(1),
      Math.round(l.contribuicao).toString(),
      pct(l.sobreviveu),
    ];
    console.log(
      MD
        ? `| ${l.nome} | ${cel.join(" | ")} | ${nota} |`
        : `${l.nome.padEnd(26)} ${cel[0].padStart(7)} ${cel[1].padStart(6)} ${cel[2].padStart(8)} ${cel[3].padStart(7)} ${cel[4].padStart(9)} ${cel[5].padStart(10)}  ${nota}`
    );
  }
  console.log(`\nMediana: vitória ${pct(medVit)}, ${medRod.toFixed(1)} rodadas, contribuição ${Math.round(medCon)}.`);
}

console.log(`\n## Suspeitos (${suspeitos.length})\n`);
for (const s of suspeitos) console.log(`- ${s}`);
console.log(
  "\nSuspeito não é culpado: leia a árvore, confira no /encontros com o log turno a turno, e só então mexa." +
    "\nContribuição = dano + cura por batalha, média dos dois encontros."
);
