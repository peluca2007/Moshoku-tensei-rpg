import { Race } from "@/lib/types";

export const RACES: Race[] = [
  {
    id: "humano",
    name: "Humano (Jinzoku)",
    description:
      "A raça dominante do mundo. Físico relativamente fraco e vida curta (70-100 anos), mas altíssima inteligência e versatilidade.",
    bonuses: { maxMp: 6 },
    bonusSkillChoices: 2,
    traits: [
      "Adaptabilidade: 2 Perícias extras à escolha e +6 PM Máximos.",
      "Determinação Humana: uma vez por sessão, repita um teste de Atributo (não de Perícia, não de dano) que tenha acabado de falhar e use o novo resultado — humanos vivem menos que qualquer raça deste livro e aprenderam a não desperdiçar a única tentativa que têm.",
    ],
  },
  {
    id: "elfo",
    name: "Elfo (Erufu)",
    description:
      "Habitantes da Grande Floresta. Corpos esguios, orelhas longas, fertilidade baixa e vida longuíssima.",
    bonuses: { attributes: { agilidade: 1 }, maxMp: 8 },
    traits: [
      "Sentido da Floresta: Vantagem em Percepção auditiva e em Sobrevivência para navegação.",
      "+1 em Agilidade e +8 PM Máximos, permanentes.",
      "Sangue Longevo: Vantagem em testes de resistência de Vigor contra veneno e doença (Apêndice D) — séculos de vida ensinam o corpo a esperar o pior.",
    ],
  },
  {
    id: "anao",
    name: "Anão (Dowaafu)",
    description:
      "Artesãos e ferreiros inatos da Cordilheira do Dragão Azul. Vivem várias centenas de anos, baixa estatura, alta resistência ao álcool.",
    bonuses: { maxHp: 6 },
    fixedSkills: ["Ofícios (Forja)"],
    traits: [
      "Sangue da Forja: magias de Terra e Fogo custam 1 PM a menos para conjurar (mínimo 1). Não pode aprender magias de Água ou Vento.",
      "+6 PV Máximos, permanentes.",
      "Fígado de Pedra: imune a ficar Embriagado e tem Vantagem em testes de resistência de Vigor contra Exaustão por privação (Cap. 4, seção 6).",
    ],
  },
  {
    id: "hobbit",
    name: "Povo Pequeno / Hobbit (Hobitto)",
    description:
      "Vivem na Grande Floresta e em cidades como Millishion. Estatura e aparência de criança humana por toda a vida.",
    bonuses: { attributes: { agilidade: 1 } },
    traits: [
      "Deslocamento base reduzido: 7,5m.",
      "Aparência Enganosa: Vantagem em Enganação e Furtividade.",
      "+1 em Agilidade, permanente.",
      "Sorte do Povo Pequeno: uma vez por Descanso Longo, transforme uma Falha Crítica (1 Natural) sua em um resultado normal — o dado ainda rola, mas o desastre automático não acontece.",
    ],
  },
  {
    id: "raca-fera",
    name: "Raça Fera (Juuzoku)",
    description:
      "Habitantes da Grande Floresta com traços de mamíferos. Fisicamente superiores aos humanos, vida similar.",
    bonuses: { attributes: { forca: 1 } },
    traits: [
      "Sentidos Selvagens: Vantagem para rastrear pelo olfato; Desvantagem em resistência a fumaça/odores fortes.",
      "Magia Inerente: nasce sabendo conjurar Howling (2 PM, 1 Ação ataque / Ação Bônus rastreio).",
      "+1 em Força, permanente.",
      "Instinto de Caçada: Vantagem em Iniciativa contra qualquer criatura que você tenha farejado, rastreado ou observado antes do combate começar.",
    ],
  },
  {
    id: "celestial",
    name: "Raça Celestial (Tenzoku)",
    description: "Habitantes do Continente Divino. Vivem centenas de anos e possuem asas.",
    bonuses: { attributes: { espirito: 1 } },
    traits: [
      "Deslocamento de Voo igual ao deslocamento de caminhada.",
      "+1 em Espírito, permanente.",
      "Sangue do Continente Divino: Vantagem em testes de resistência de Espírito contra Medo e contra qualquer efeito de origem divina.",
    ],
  },
  {
    id: "oceano",
    name: "Raça do Oceano (Kaizoku)",
    description: "Governantes do Mar de Ringus.",
    bonuses: { maxHp: 4 },
    traits: [
      "Respira debaixo d'água.",
      "Ignora penalidades de terreno difícil aquático.",
      "+4 PV Máximos, permanentes.",
      "Pressão das Profundezas: Resistência a dano contundente vindo de água em movimento (correnteza, magia de Água que usa força bruta, tsunami de cerco).",
    ],
  },
  {
    id: "migurd",
    name: "Migurd",
    description:
      "Humanoides de cabelos e olhos azuis, ~200 anos de vida, aparência de adolescente até os 150 anos.",
    bonuses: { attributes: { intelecto: 1 }, maxMp: 10 },
    traits: [
      "+1 em Intelecto e +10 PM Máximos, permanentes.",
      "Telepatia curta com outros Migurds ou seres com telepatia.",
    ],
  },
  {
    id: "superd",
    name: "Superd",
    description: "Pele pálida, cabelos verdes, cauda bifurcada que vira lança tridente.",
    bonuses: { attributes: { intelecto: 1 } },
    traits: [
      "Terceiro Olho: como Ação Bônus, enxerga seres vivos, fluxos de mana e invisibilidade mágica através de paredes num raio de 9m, por 1 minuto.",
      "+1 em Intelecto, permanente.",
      "Sofre Desvantagem em interações sociais com humanos comuns (preconceito antigo, Cap. 1) — mas Vantagem Absoluta em Intuição para perceber a intenção real de quem esconde algo, porque o Terceiro Olho não mente.",
    ],
  },
  {
    id: "ogro",
    name: "Ogro (Onizoku)",
    description: "Extremamente altos e musculosos, machos chegam a 3 metros de altura.",
    bonuses: { attributes: { forca: 2 }, maxHp: 6 },
    traits: [
      "Brutamontes: Vantagem em testes de Força bruta.",
      "Limite de carga dobrado.",
      "+2 em Força e +6 PV Máximos, permanentes.",
    ],
  },
  {
    id: "demonio-imortal",
    name: "Demônio Imortal",
    description: "Descendentes do Primeiro Deus Demônio. Pele negra azeviche, seis braços (machos).",
    bonuses: { maxHp: 8 },
    traits: [
      "Regeneração Profunda: regenera +3 PV no início do seu turno, desde que esteja com mais de 0 PV.",
      "+8 PV Máximos, permanentes.",
      "Descendência Divina: Vantagem em testes de resistência de Vigor contra veneno e doença (Apêndice D).",
    ],
  },
  {
    id: "dragao",
    name: "Raça Dragão (Ryuzoku)",
    description:
      "Raça mítica (requer aprovação do Mestre). Fisicamente a mais poderosa da existência, pode viver mais de 100.000 anos.",
    bonuses: { attributes: { forca: 1 }, maxHp: 5 },
    traits: [
      "Escamas Dracônicas: Defesa Base altíssima, resistência natural a ataques cortantes simples.",
      "Aura Primordial e Garras: ataques desarmados causam 1d8 + Força de dano cortante (letal mágico).",
      "+1 em Força e +5 PV Máximos, permanentes, e Resistência a um elemento à escolha (Fogo, Gelo ou Eletricidade).",
      "O Preço do Sangue: Vantagem em Intimidação, mas Desvantagem Absoluta em Persuasão, Lábia ou Diplomacia — nada que já foi um deus finge ser gente comum de verdade.",
    ],
  },
];

export function getRaceById(id: string | null): Race | undefined {
  return RACES.find((r) => r.id === id);
}
