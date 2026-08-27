import { Background, SubtableEntry } from "@/lib/types";

export const BACKGROUNDS: Background[] = [
  {
    id: "plebeu",
    name: "Plebeu / Trabalhador Rural",
    rollRange: [1, 15],
    bonuses: { maxHp: 3 },
    bonusSkillChoices: 2,
    startingGold: "2d4",
    traits: [
      "2 Perícias ligadas a trabalhos mundanos (Ofícios, Culinária, Lidar com Animais ou Natureza).",
      "+3 PV Máximos, permanentes — corpo calejado por uma infância inteira de trabalho braçal.",
    ],
  },
  {
    id: "orfao",
    name: "Órfão das Ruas",
    rollRange: [16, 25],
    bonuses: { attributes: { agilidade: 1 } },
    bonusSkillChoices: 2,
    startingGold: "1d4",
    traits: [
      "2 Perícias de sobrevivência urbana (Furtividade, Ladinagem, Enganação ou Acrobacia).",
      "+1 em Agilidade, permanente.",
      "Instinto de Rua: Vantagem em Percepção para notar armadilhas, emboscadas, bolsos alheios e vigias — ninguém sobrevive na rua sem aprender a ler uma esquina.",
    ],
  },
  {
    id: "crianca-selvagem",
    name: "Criança Selvagem",
    rollRange: [26, 35],
    bonuses: { maxHp: 6, attributes: { vigor: 1 } },
    fixedSkills: ["Sobrevivência"],
    startingGold: "0",
    traits: [
      "+6 PV Máximos e +1 em Vigor, permanentes.",
      "Rola Sobrevivência com Vantagem para achar comida, água e abrigo.",
    ],
  },
  {
    id: "aprendiz-mercador",
    name: "Aprendiz de Mercador",
    rollRange: [36, 45],
    bonuses: { attributes: { intelecto: 1 } },
    fixedSkills: ["Intuição", "Lábia"],
    startingGold: "4d4+10",
    traits: [
      "+1 em Intelecto, permanente.",
      "Sexto Sentido Comercial: sempre sabe o preço justo de mercado de qualquer item comum, e tem Vantagem em testes pra perceber quando alguém está blefando numa negociação.",
    ],
  },
  {
    id: "treino-precoce",
    name: "Treino Precoce / Escudeiro",
    rollRange: [46, 55],
    bonuses: { attributes: { forca: 1 } },
    fixedSkills: ["Atletismo"],
    startingGold: "2d4+2",
    grantsInitiativeAdvantage: true,
    traits: [
      "Vantagem em todas as rolagens de Iniciativa.",
      "+1 em Força, permanente — anos carregando a armadura de outra pessoa antes de vestir a própria.",
    ],
  },
  {
    id: "acolito",
    name: "Acólito / Filho do Templo",
    rollRange: [56, 65],
    bonuses: { maxMp: 6 },
    fixedSkills: ["Religião", "Medicina Básica"],
    startingGold: "2d4",
    traits: [
      "+6 PM Máximos, permanentes — a educação religiosa desperta uma afinidade latente com mana que nunca mais desaparece.",
    ],
  },
  {
    id: "sangue-nobre",
    name: "Sangue Nobre",
    rollRange: [66, 72],
    bonuses: { attributes: { espirito: 1 } },
    fixedSkills: ["Persuasão", "História"],
    startingGold: "6d4+20",
    traits: [
      "Vantagem em testes sociais ao lidar com autoridades.",
      "+1 em Espírito, permanente — comandar serviçais desde criança ensina presença antes de ensinar humildade.",
    ],
  },
  {
    id: "estudioso-precoce",
    name: "Estudioso Precoce (Expansão)",
    rollRange: [73, 80],
    bonuses: { maxMp: 14, attributes: { intelecto: 1 } },
    fixedSkills: ["Arcanismo"],
    startingGold: "2d4",
    traits: ["+14 PM Máximos e +1 em Intelecto, permanentes."],
  },
  {
    id: "sobrevivente",
    name: "Sobrevivente / Ex-Escravo",
    rollRange: [81, 86],
    bonuses: { attributes: { vigor: 1 } },
    startingGold: "0",
    traits: [
      "Vantagem em resistência de Espírito (contra Medo) e de Vigor (contra Exaustão).",
      "+1 em Vigor, permanente — o corpo que sobreviveu ao pior já não se assusta com o segundo pior.",
    ],
  },
  {
    id: "fator-laplace",
    name: "Fator Laplace / Linhagem Antiga",
    rollRange: [87, 92],
    bonuses: { attributes: { espirito: 2 }, maxMp: 20, maxHp: 6 },
    startingGold: "1d4",
    traits: [
      "+2 em Espírito, +20 PM Máximos e +6 PV Máximos, permanentes — seu corpo nasceu acostumado a segurar mais mana e mais dor do que deveria ser possível.",
      "Conjuração Silenciosa desde o nascimento (Cap. 2, seção 2): você manipula mana sem palavra alguma — ninguém te ensinou, você nunca soube fazer diferente.",
      "Vantagem em testes de resistência de Espírito contra Medo, Amedrontado e qualquer efeito que tente controlar sua mente: o que quer que exista na sua linhagem, não se deixa comandar.",
      "Desvantagem em Persuasão com desconhecidos — pessoas comuns sentem, mesmo sem saber o porquê, que algo em você quer distância.",
    ],
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
    bonuses: { attributes: { intelecto: 1 } },
    startingGold: "2d4",
    traits: [
      "Conjuração Silenciosa (Cap. 2, seção 2) sem sofrer a redução de dano nem a redução de área — só a limitação de forma continua valendo, e mesmo essa você pode escolher mudar como qualquer outro conjurador silencioso.",
      "+1 em Intelecto, permanente.",
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
