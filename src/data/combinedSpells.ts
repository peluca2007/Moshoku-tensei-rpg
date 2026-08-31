import { RankName } from "@/lib/types";

/**
 * Magias Combinadas — fusões oficiais entre árvores de magia.
 *
 * Uma magia combinada (Cap. 2, §4) é uma magia nova que você só pode
 * aprender se tiver pelo menos o rank indicado em DUAS árvores
 * envolvidas. O custo de PM é a soma do custo das duas magias-base
 * (arredondado pra cima), o tempo de conjuração é o da mais lenta
 * +1 Ação (a sincronização cobra), e o dano combina dados quando
 * houver sobreposição elemental.
 *
 * O resultado aqui é só a TABELA — a Maestria "Magia Combinada" do
 * rank Avançado da sua árvore é o que destrava a possibilidade de
 * aprender; cada combinação entra na sua lista de magias como uma
 * habilidade comprada com PA de Avançado+ da árvore-primária.
 */

export interface CombinedSpell {
  id: string;
  name: string;
  /** Árvore que você considera "primária" — onde aprende a magia combinada. */
  primaryTreeId: string;
  /** Outras árvores que precisam ter o rank mínimo destravado. */
  secondary: { treeId: string; minimumRank: RankName }[];
  rankRequired: RankName;
  /** Custo de PA pra aprender (custo da assinatura na árvore primária + 1). */
  paCost: number;
  /** PM = soma do PM das magias-base, arredondado pra cima. */
  pmCost: number;
  range: string;
  actions: number;
  damage: string;
  effect: string;
}

export const COMBINED_SPELLS: CombinedSpell[] = [
  {
    id: "magma",
    name: "Magma",
    primaryTreeId: "fogo",
    secondary: [{ treeId: "terra", minimumRank: "Avançado" }],
    rankRequired: "Santo",
    paCost: 6,
    pmCost: 12,
    range: "18 metros",
    actions: 3,
    damage: "4d10 ígneo + 4d10 contundente",
    effect:
      "Muro de rocha derretida. Teste de Agilidade (CD 8 + BC) ou 4d10 de dano ígneo + 4d10 contundente e a área fica Em Chamas por 1 minuto. Estruturas de madeira queimam.",
  },
  {
    id: "gelo-tempestuoso",
    name: "Gelo Tempestuoso",
    primaryTreeId: "agua",
    secondary: [{ treeId: "vento", minimumRank: "Avançado" }],
    rankRequired: "Santo",
    paCost: 6,
    pmCost: 13,
    range: "Cone de 18 metros",
    actions: 3,
    damage: "3d8 perfurante + 3d8 frio + 3d8 sônico",
    effect:
      "Rajada de cristais de gelo carregados por vento cortante. Teste de Agilidade (CD 8 + BC) ou dano triplo (ígneo, perfurante, sônico). Alvos no cone ficam Molhados e Desequilibrados por 1 turno.",
  },
  {
    id: "relampago-santo",
    name: "Relâmpago Santo",
    primaryTreeId: "agua",
    secondary: [{ treeId: "curar", minimumRank: "Avançado" }],
    rankRequired: "Santo",
    paCost: 7,
    pmCost: 14,
    range: "Linha de 36 metros",
    actions: 4,
    damage: "6d10 elétrico",
    effect:
      "Um único relâmpago que mescla eletricidade e mana curativa. Alvos inimigos fazem teste de Agilidade (CD 8 + BC) ou recebem 6d10 de dano elétrico. Um aliado na linha recebe cura igual ao dano causado.",
  },
  {
    id: "barreira-incandescente",
    name: "Barreira Incandescente",
    primaryTreeId: "barreira",
    secondary: [{ treeId: "fogo", minimumRank: "Avançado" }],
    rankRequired: "Santo",
    paCost: 6,
    pmCost: 11,
    range: "Pessoal",
    actions: 2,
    damage: "—",
    effect:
      "Muro de 9m que combina escudo mágico com fogo. Aliados atrás ganham Cobertura Total e o muro causa 2d10 ígneo a quem atravessar. Dura 1 minuto ou 60 PV.",
  },
  {
    id: "tempestade-de-cura",
    name: "Tempestade de Cura",
    primaryTreeId: "curar",
    secondary: [{ treeId: "agua", minimumRank: "Avançado" }],
    rankRequired: "Santo",
    paCost: 6,
    pmCost: 14,
    range: "Esfera de 18m",
    actions: 3,
    damage: "—",
    effect:
      "Chuva morna com mana curativa. Aliados na área curam 3d8 + BC de PV e ficam Molhados (regeneram 1d4 PV extras no fim do turno por 3 turnos).",
  },
  {
    id: "panico",
    name: "Pânico",
    primaryTreeId: "fogo",
    secondary: [{ treeId: "vento", minimumRank: "Avançado" }],
    rankRequired: "Santo",
    paCost: 7,
    pmCost: 13,
    range: "Cone de 27 metros",
    actions: 3,
    damage: "—",
    effect:
      "Onda de calor e vento que espalha pânico. Teste de Espírito (CD 8 + BC) ou Amedrontado por 1 minuto. Falha crítica: corre em linha reta pra longe de você pelo maior caminho possível por 3 turnos.",
  },
  {
    id: "muralha-de-espinhos",
    name: "Muralha de Espinhos",
    primaryTreeId: "terra",
    secondary: [{ treeId: "fogo", minimumRank: "Avançado" }],
    rankRequired: "Santo",
    paCost: 6,
    pmCost: 12,
    range: "Linha de 18 metros",
    actions: 3,
    damage: "4d6 perfurante + Em Chamas",
    effect:
      "Muro de videiras espinhosas que crescem e queimam. Criaturas que atravessarem recebem 4d6 perfurante + Em Chamas por 1 turno. Dura 3 turnos.",
  },
  {
    id: "nevasca-curativa",
    name: "Nevasca Curativa",
    primaryTreeId: "agua",
    secondary: [{ treeId: "curar", minimumRank: "Avançado" }],
    rankRequired: "Rei",
    paCost: 7,
    pmCost: 14,
    range: "Esfera de 30m",
    actions: 3,
    damage: "—",
    effect:
      "Tempestade de neve com mana restauradora. Aliados na área curam 2d8 + BC por turno por 3 turnos e ficam imunes a frio não-mágico. Inimigos na área fazem teste de Vigor ou ficam Lentos.",
  },
  {
    id: "meteoro",
    name: "Meteoro",
    primaryTreeId: "fogo",
    secondary: [{ treeId: "terra", minimumRank: "Rei" }],
    rankRequired: "Imperador",
    paCost: 10,
    pmCost: 25,
    range: "120 metros",
    actions: 6,
    damage: "20d10 ígneo + 10d10 contundente",
    effect:
      "Você invoca uma rocha flamejante do céu. Teste de Agilidade (CD 8 + BC) ou dano massivo em área de 9m. O epicentro vira crater (terreno difícil permanente).",
  },
];
