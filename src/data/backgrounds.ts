import { Background, SubtableEntry } from "@/lib/types";

export const BACKGROUNDS: Background[] = [
  {
    id: "plebeu",
    name: "Plebeu / Trabalhador Rural",
    rollRange: [1, 15],
    bonuses: {},
    bonusSkillChoices: 2,
    startingGold: "2d4",
    traits: ["2 Perícias ligadas a trabalhos mundanos (Ofícios, Culinária, Lidar com Animais ou Natureza)."],
  },
  {
    id: "orfao",
    name: "Órfão das Ruas",
    rollRange: [16, 25],
    bonuses: {},
    bonusSkillChoices: 2,
    startingGold: "1d4",
    traits: ["2 Perícias de sobrevivência urbana (Furtividade, Ladinagem, Enganação ou Acrobacia)."],
  },
  {
    id: "crianca-selvagem",
    name: "Criança Selvagem",
    rollRange: [26, 35],
    bonuses: { maxHp: 4 },
    fixedSkills: ["Sobrevivência"],
    startingGold: "0",
    traits: ["+4 PV Máximos permanentemente.", "Rola Sobrevivência com vantagem para achar comida."],
  },
  {
    id: "aprendiz-mercador",
    name: "Aprendiz de Mercador",
    rollRange: [36, 45],
    bonuses: {},
    fixedSkills: ["Intuição", "Lábia"],
    startingGold: "4d4+10",
    traits: [],
  },
  {
    id: "treino-precoce",
    name: "Treino Precoce / Escudeiro",
    rollRange: [46, 55],
    bonuses: {},
    fixedSkills: ["Atletismo"],
    startingGold: "2d4+2",
    grantsInitiativeAdvantage: true,
    traits: ["Vantagem em todas as rolagens de Iniciativa."],
  },
  {
    id: "acolito",
    name: "Acólito / Filho do Templo",
    rollRange: [56, 65],
    bonuses: {},
    fixedSkills: ["Religião", "Medicina Básica"],
    startingGold: "2d4",
    traits: [],
  },
  {
    id: "sangue-nobre",
    name: "Sangue Nobre",
    rollRange: [66, 72],
    bonuses: {},
    fixedSkills: ["Persuasão", "História"],
    startingGold: "6d4+20",
    traits: ["Vantagem em testes sociais ao lidar com autoridades."],
  },
  {
    id: "estudioso-precoce",
    name: "Estudioso Precoce (Expansão)",
    rollRange: [73, 80],
    bonuses: { maxMp: 10 },
    fixedSkills: ["Arcanismo"],
    startingGold: "2d4",
    traits: ["+10 PM Máximos permanentemente."],
  },
  {
    id: "sobrevivente",
    name: "Sobrevivente / Ex-Escravo",
    rollRange: [81, 86],
    bonuses: {},
    startingGold: "0",
    traits: ["Vantagem em resistência de Espírito (contra Medo) e de Vigor (contra Exaustão)."],
  },
  {
    id: "fator-laplace",
    name: "Fator Laplace / Linhagem Antiga",
    rollRange: [87, 92],
    bonuses: { maxMp: 10, maxHp: 2 },
    startingGold: "1d4",
    traits: ["Desvantagem em testes de Persuasão devido ao medo que instiga em pessoas comuns."],
  },
  {
    id: "miko",
    name: "Miko (Abençoada/Amaldiçoada)",
    rollRange: [93, 96],
    bonuses: {},
    startingGold: "2d4",
    requiresSubtable: "miko",
    traits: ["Role 1d8 na Tabela de Miko para definir a mutação mágica."],
  },
  {
    id: "olho-mistico",
    name: "Olho Místico Inato",
    rollRange: [97, 98],
    bonuses: {},
    startingGold: "2d4",
    requiresSubtable: "olho",
    traits: ["Role 1d10 na Tabela de Olhos Místicos para definir o Magan."],
  },
  {
    id: "genio",
    name: "Gênio (Conjuração Silenciosa)",
    rollRange: [99, 100],
    bonuses: {},
    startingGold: "2d4",
    traits: [
      "Pode conjurar magias usando o Tempo Silencioso sem sofrer penalidades de dano ou área.",
    ],
  },
];

export const MIKO_TABLE: SubtableEntry[] = [
  {
    id: "forca-sobre-humana",
    roll: 1,
    name: "Força Sobre-humana (Zanoba)",
    bonuses: { attributes: { forca: 3 } },
    traits: [
      "Abençoada: ataques desarmados causam 1d8 + Força (letal).",
      "Maldição: Desvantagem em testes de Vigor (sem resistência física).",
    ],
  },
  {
    id: "leitura-memorias",
    roll: 2,
    name: "Leitura de Memórias",
    bonuses: {},
    traits: [
      "Abençoada: 1 Ação de toque lê memórias superficiais e intenções (Vantagem em Intuição/Interrogatório).",
      "Maldição: custa 3 PM por uso.",
    ],
  },
  {
    id: "rebobinar-tempo",
    roll: 3,
    name: "Rebobinar o Tempo",
    bonuses: {},
    traits: [
      "Abençoada: 1x/semana rebobina o estado de um objeto inanimado em até 24h.",
      "Maldição: drena 50% do PM Máximo atual; não funciona em criaturas vivas.",
    ],
  },
  {
    id: "telepatia",
    roll: 4,
    name: "Telepatia",
    bonuses: {},
    traits: [
      "Abençoada: lê pensamentos superficiais e fala telepaticamente num raio de 18m.",
      "Maldição: fisicamente muda; Desvantagem em Iniciativa.",
    ],
  },
  {
    id: "confianca-absoluta",
    roll: 5,
    name: "Miko da Confiança Absoluta",
    bonuses: {},
    traits: [
      "Abençoada: Vantagem Absoluta em Persuasão e Lábia.",
      "Maldição: falha automaticamente em Intuição para perceber mentiras.",
    ],
  },
  {
    id: "esquecimento",
    roll: 6,
    name: "Maldição do Esquecimento",
    bonuses: {},
    traits: [
      "Abençoada: Vantagem Absoluta em Furtividade (presença nula).",
      "Maldição: quase ninguém lembra do seu rosto/nome/existência 10min após sair do campo de visão.",
    ],
  },
  {
    id: "acumulo",
    roll: 7,
    name: "Maldição do Acúmulo",
    bonuses: { maxMp: 15 },
    traits: [
      "Abençoada: +15 PM Máximos (reator infinito).",
      "Maldição: exige 'liberação' semanal; falhar aplica 1 nível de Exaustão por dia até a morte.",
    ],
  },
  {
    id: "odio",
    roll: 8,
    name: "Maldição do Ódio",
    bonuses: { maxHp: 10, armorClass: 2 },
    traits: [
      "Abençoada: +2 na CA e +10 PV Máximos (aura primordial).",
      "Maldição: todo ser que sinta mana sofre ódio instintivo e paranóico ao te ver.",
    ],
  },
];

export const OLHO_TABLE: SubtableEntry[] = [
  { id: "previsao", roll: 1, name: "Olho da Previsão", bonuses: {}, traits: ["Ação Bônus, 3 PM/turno: vê 2s no futuro (Vantagem em ataques, oponentes têm Desvantagem contra você). Mais de 3 turnos seguidos causa Tontura por 1h."] },
  { id: "poder-magico", roll: 2, name: "Olho do Poder Mágico", bonuses: {}, traits: ["Ação Livre, 2 PM/cena: vê fluxo de mana, invisíveis mágicos, identifica itens mágicos e nível de perigo."] },
  { id: "clarividencia", roll: 3, name: "Olho da Clarividência", bonuses: {}, traits: ["1 Ação, 1 PM/km: visão telescópica tipo drone. Corpo físico fica Cego e indefeso (CA 10) enquanto em uso."] },
  { id: "permeacao", roll: 4, name: "Olho de Permeação", bonuses: {}, traits: ["1 Ação, 2 PM/cena: Raio-X através de paredes/roupas (9m). Não atravessa criaturas vivas ou materiais densos em mana."] },
  { id: "identificacao", roll: 5, name: "Olho de Identificação", bonuses: {}, traits: ["Ação Bônus, 1 PM/alvo: revela fraquezas, nome do feitiço e efeitos. Segredos divinos/de outros continentes aparecem como 'Desconhecido'."] },
  { id: "absorcao", roll: 6, name: "Olho da Absorção", bonuses: {}, traits: ["Reação, PM igual ao da magia absorvida: anula magia inimiga. Lançar magia com o olho descoberto suga o próprio feitiço (perde ação, PM e a magia falha)."] },
  { id: "tudo-veem", roll: 7, name: "Olhos Que Tudo Veem", bonuses: {}, traits: ["Ritual de 10min, 10 PM, 1x/semana: rastreia alguém no globo ou revela planta de masmorra. Deixa Visão Embaçada (-2 em acertos físicos) pelo resto do dia."] },
  { id: "vazio-absoluto", roll: 8, name: "Olho do Vazio Absoluto", bonuses: {}, traits: ["1 Ação, 5 PM/turno mantido: barreira de repulsão de 9m. Não pode atacar ou se mover enquanto mantiver."] },
  { id: "afeicao", roll: 9, name: "Olho de Afeição", bonuses: {}, traits: ["Passiva se descoberto, 1 PM/hora: quem olha nos seus olhos faz teste de Espírito com Desvantagem ou desenvolve infatuação perigosa (risco de obsessão yandere)."] },
  { id: "rastreador", roll: 10, name: "Olho Rastreador", bonuses: {}, traits: ["1 Ação de Busca, 2 PM (recente) / 10 PM (décadas): revela rastros de vida, segue pegadas por continentes. Rastreio antigo tem cooldown de 1x/mês."] },
];

export function getBackgroundById(id: string | null): Background | undefined {
  return BACKGROUNDS.find((b) => b.id === id);
}

export function getSubtableEntryById(
  table: "miko" | "olho",
  id: string | null
): SubtableEntry | undefined {
  const source = table === "miko" ? MIKO_TABLE : OLHO_TABLE;
  return source.find((e) => e.id === id);
}
