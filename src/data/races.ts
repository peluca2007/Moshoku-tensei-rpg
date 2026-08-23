import { Race } from "@/lib/types";

export const RACES: Race[] = [
  {
    id: "humano",
    name: "Humano (Jinzoku)",
    description:
      "A raça dominante do mundo. Físico relativamente fraco e vida curta (70-100 anos), mas altíssima inteligência e versatilidade.",
    bonuses: { maxMp: 2 },
    bonusSkillChoices: 2,
    traits: ["Adaptabilidade: 2 Perícias extras à escolha e +2 PM Máximos."],
  },
  {
    id: "elfo",
    name: "Elfo (Erufu)",
    description:
      "Habitantes da Grande Floresta. Corpos esguios, orelhas longas, fertilidade baixa e vida longuíssima.",
    bonuses: { maxMp: 4 },
    traits: [
      "Sentido da Floresta: Vantagem em Percepção auditiva e em Sobrevivência para navegação.",
      "+4 PM Máximos.",
    ],
  },
  {
    id: "anao",
    name: "Anão (Dowaafu)",
    description:
      "Artesãos e ferreiros inatos da Cordilheira do Dragão Azul. Vivem várias centenas de anos, baixa estatura, alta resistência ao álcool.",
    bonuses: {},
    fixedSkills: ["Ofícios (Forja)"],
    traits: [
      "Sangue da Forja: magias de Terra e Fogo custam 1 PM a menos para conjurar (mínimo 1).",
      "Não pode aprender magias de Água ou Vento.",
    ],
  },
  {
    id: "hobbit",
    name: "Povo Pequeno / Hobbit (Hobitto)",
    description:
      "Vivem na Grande Floresta e em cidades como Millishion. Estatura e aparência de criança humana por toda a vida.",
    bonuses: {},
    traits: [
      "Deslocamento base reduzido: 7,5m.",
      "Aparência Enganosa: Vantagem em Enganação e Furtividade.",
    ],
  },
  {
    id: "raca-fera",
    name: "Raça Fera (Juuzoku)",
    description:
      "Habitantes da Grande Floresta com traços de mamíferos. Fisicamente superiores aos humanos, vida similar.",
    bonuses: {},
    traits: [
      "Sentidos Selvagens: Vantagem para rastrear pelo olfato; Desvantagem em resistência a fumaça/odores fortes.",
      "Magia Inerente: nasce sabendo conjurar Howling (2 PM, 1 Ação ataque / Ação Bônus rastreio).",
    ],
  },
  {
    id: "celestial",
    name: "Raça Celestial (Tenzoku)",
    description: "Habitantes do Continente Divino. Vivem centenas de anos e possuem asas.",
    bonuses: {},
    traits: ["Deslocamento de Voo igual ao deslocamento de caminhada."],
  },
  {
    id: "oceano",
    name: "Raça do Oceano (Kaizoku)",
    description: "Governantes do Mar de Ringus.",
    bonuses: {},
    traits: ["Respira debaixo d'água.", "Ignora penalidades de terreno difícil aquático."],
  },
  {
    id: "migurd",
    name: "Migurd",
    description:
      "Humanoides de cabelos e olhos azuis, ~200 anos de vida, aparência de adolescente até os 150 anos.",
    bonuses: { maxMp: 6 },
    traits: [
      "+6 PM Máximos.",
      "Telepatia curta com outros Migurds ou seres com telepatia.",
    ],
  },
  {
    id: "superd",
    name: "Superd",
    description: "Pele pálida, cabelos verdes, cauda bifurcada que vira lança tridente.",
    bonuses: {},
    traits: [
      "Terceiro Olho: como Ação Bônus, enxerga seres vivos e fluxos de mana através de paredes.",
      "Sofre Desvantagem em interações sociais com humanos (preconceito).",
    ],
  },
  {
    id: "ogro",
    name: "Ogro (Onizoku)",
    description: "Extremamente altos e musculosos, machos chegam a 3 metros de altura.",
    bonuses: {},
    traits: [
      "Brutamontes: Vantagem em testes de Força bruta.",
      "Limite de carga dobrado.",
    ],
  },
  {
    id: "demonio-imortal",
    name: "Demônio Imortal",
    description: "Descendentes do Primeiro Deus Demônio. Pele negra azeviche, seis braços (machos).",
    bonuses: {},
    traits: ["Regeneração Profunda: regenera +2 PV no início do turno, se estiver com mais de 0 PV."],
  },
  {
    id: "dragao",
    name: "Raça Dragão (Ryuzoku)",
    description:
      "Raça mítica (requer aprovação do Mestre). Fisicamente a mais poderosa da existência, pode viver mais de 100.000 anos.",
    bonuses: { maxHp: 5 },
    traits: [
      "Escamas Dracônicas: Defesa Base altíssima, resistência natural a ataques cortantes simples.",
      "Aura Primordial e Garras: ataques desarmados causam 1d8 + Força de dano cortante (letal mágico).",
      "+5 PV Máximos e Resistência a um elemento à escolha (Fogo, Gelo ou Eletricidade).",
      "O Preço do Sangue: Vantagem em Intimidação, mas Desvantagem Absoluta em Persuasão, Lábia ou Diplomacia.",
    ],
  },
];

export function getRaceById(id: string | null): Race | undefined {
  return RACES.find((r) => r.id === id);
}
