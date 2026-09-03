import { RankName } from "@/lib/types";

/**
 * Magias Combinadas (Cap. 2, §4) — rework de 2026-09-03.
 *
 * O que elas eram: uma tabela de nove entradas com um `primaryTreeId`, uma lista
 * `secondary` e um `rankRequired` solto, que só existia impressa no livro.
 * Nenhuma delas era comprável em lugar nenhum — o motor não sabia que existiam,
 * a ficha não as guardava, e o mapa de árvores não as mostrava. O livro dizia
 * "cada uma custa PA" e nada nunca cobrou esse PA.
 *
 * Três coisas mudaram:
 *
 * 1. **O requisito virou um par explícito.** Cada combinação declara DUAS
 *    portas, cada uma com o seu próprio rank — "Fogo no Rei E Terra no
 *    Avançado". Antes o requisito era sempre "Avançado nas duas" com um
 *    `rankRequired` genérico por cima que não correspondia a nada verificável.
 *
 * 2. **Os requisitos ficaram DESIGUAIS de propósito.** Barreira Incandescente
 *    pede Barreira Avançado + Fogo Intermediário e é acessível cedo; Meteoro
 *    pede Fogo Rei + Terra Avançado e é o topo. Uma tabela em que tudo custa o
 *    mesmo não é uma tabela de escolhas — é uma lista.
 *
 * 3. **Elas são compradas com PA**, entram na ficha, e aparecem sozinhas no
 *    painel de /arvores no instante em que as duas portas abrem.
 *
 * Correção de bug junto: três magias apontavam para a árvore `"curar"`, que
 * nunca existiu — o id é `"cura"`. O livro imprimia a coluna da árvore-primária
 * vazia nessas três, e nenhuma verificação pegava porque nada lia o campo.
 */

export interface CombinedRequirement {
  treeId: string;
  rank: RankName;
}

export interface CombinedSpell {
  id: string;
  name: string;
  /**
   * As DUAS portas. Ambas precisam estar abertas na ficha — cada uma com o
   * rank exato listado aqui ou superior.
   */
  requires: [CombinedRequirement, CombinedRequirement];
  /** Custo em PA. Escala com a altura das duas portas, não com o rank da magia. */
  paCost: number;
  pmCost: number;
  range: string;
  actions: number;
  damage: string;
  effect: string;
}

export const COMBINED_SPELLS: CombinedSpell[] = [
  // --- Porta baixa: Avançado + Intermediário ---
  {
    id: "barreira-incandescente",
    name: "Barreira Incandescente",
    requires: [
      { treeId: "barreira", rank: "Avançado" },
      { treeId: "fogo", rank: "Intermediário" },
    ],
    paCost: 3,
    pmCost: 11,
    range: "Pessoal",
    actions: 2,
    damage: "—",
    effect:
      "Muro de 9m que combina escudo mágico com fogo. Aliados atrás ganham Cobertura Total, e o muro causa 2d10 ígneo a quem atravessar. Dura 1 minuto ou 60 PV.",
  },
  {
    id: "muralha-de-espinhos",
    name: "Muralha de Espinhos",
    requires: [
      { treeId: "terra", rank: "Avançado" },
      { treeId: "fogo", rank: "Intermediário" },
    ],
    paCost: 3,
    pmCost: 12,
    range: "Linha de 18 metros",
    actions: 3,
    damage: "4d6 perfurante + Em Chamas",
    effect:
      "Muro de videiras espinhosas que crescem e queimam. Criaturas que atravessarem sofrem 4d6 perfurante e ficam Em Chamas por 1 turno. Dura 3 turnos.",
  },

  // --- Porta média: Avançado + Avançado ---
  {
    id: "magma",
    name: "Magma",
    requires: [
      { treeId: "fogo", rank: "Avançado" },
      { treeId: "terra", rank: "Avançado" },
    ],
    paCost: 4,
    pmCost: 12,
    range: "18 metros",
    actions: 3,
    damage: "4d10 ígneo + 4d10 contundente",
    effect:
      "Muro de rocha derretida. Teste de Agilidade (CD 8 + BC) ou sofre o dano cheio e a área fica Em Chamas por 1 minuto. Estruturas de madeira queimam.",
  },
  {
    id: "gelo-tempestuoso",
    name: "Gelo Tempestuoso",
    requires: [
      { treeId: "agua", rank: "Avançado" },
      { treeId: "vento", rank: "Avançado" },
    ],
    paCost: 4,
    pmCost: 13,
    range: "Cone de 18 metros",
    actions: 3,
    damage: "3d8 perfurante + 3d8 frio + 3d8 sônico",
    effect:
      "Rajada de cristais carregados por vento cortante. Teste de Agilidade (CD 8 + BC) pra metade. Alvos no cone ficam Molhados e Desequilibrados por 1 turno — as duas condições que as escolas-mãe cobram.",
  },

  // --- Porta alta: Santo em uma das duas ---
  {
    id: "panico",
    name: "Pânico",
    requires: [
      { treeId: "fogo", rank: "Santo" },
      { treeId: "vento", rank: "Avançado" },
    ],
    paCost: 5,
    pmCost: 13,
    range: "Cone de 27 metros",
    actions: 3,
    damage: "—",
    effect:
      "Onda de calor e vento que espalha pânico. Teste de Espírito (CD 8 + BC) ou Amedrontado por 1 minuto. Falha crítica: corre em linha reta pra longe de você, pelo caminho mais longo, por 3 turnos.",
  },
  {
    id: "relampago-santo",
    name: "Relâmpago Santo",
    requires: [
      { treeId: "agua", rank: "Santo" },
      { treeId: "cura", rank: "Avançado" },
    ],
    paCost: 5,
    pmCost: 14,
    range: "Linha de 36 metros",
    actions: 4,
    damage: "6d10 elétrico",
    effect:
      "Um único relâmpago que mescla eletricidade e mana curativa. Inimigos na linha fazem teste de Agilidade (CD 8 + BC) ou sofrem o dano cheio. Um aliado na linha recebe cura igual ao dano causado.",
  },
  {
    id: "tempestade-de-cura",
    name: "Tempestade de Cura",
    requires: [
      { treeId: "cura", rank: "Santo" },
      { treeId: "agua", rank: "Avançado" },
    ],
    paCost: 5,
    pmCost: 14,
    range: "Esfera de 18m",
    actions: 3,
    damage: "—",
    effect:
      "Chuva morna com mana curativa. Aliados na área curam 3d8 + BC de PV e ficam Molhados — e regeneram 1d4 PV no fim de cada turno por 3 turnos.",
  },

  // --- Porta de topo ---
  {
    id: "nevasca-curativa",
    name: "Nevasca Curativa",
    requires: [
      { treeId: "agua", rank: "Rei" },
      { treeId: "cura", rank: "Santo" },
    ],
    paCost: 7,
    pmCost: 14,
    range: "Esfera de 30m",
    actions: 3,
    damage: "—",
    effect:
      "Tempestade de neve com mana restauradora. Aliados na área curam 2d8 + BC por turno durante 3 turnos e ficam imunes a frio não-mágico. Inimigos fazem teste de Vigor ou têm o Deslocamento reduzido à metade enquanto durar.",
  },
  {
    id: "meteoro",
    name: "Meteoro",
    requires: [
      { treeId: "fogo", rank: "Rei" },
      { treeId: "terra", rank: "Avançado" },
    ],
    paCost: 8,
    pmCost: 25,
    range: "120 metros",
    actions: 6,
    damage: "20d10 ígneo + 10d10 contundente",
    effect:
      "Você chama uma rocha flamejante do céu. Teste de Agilidade (CD 8 + BC) pra metade, em área de 9m. O epicentro vira cratera: terreno difícil permanente.",
  },
];

export function getCombinedSpellById(id: string): CombinedSpell | undefined {
  return COMBINED_SPELLS.find((s) => s.id === id);
}
