import { Tree } from "@/lib/types";

/**
 * Árvore híbrida "Punho de Fogo" (Magia de Fogo + Lutador).
 * Exige Intermediário em Fogo e Lutador.
 * O tema: o golpe não termina no impacto, a explosão segue.
 */
export const PUNHO_DE_FOGO_TREE: Tree = {
  id: "punho-de-fogo",
  name: "Punho de Fogo",
  category: "corpo",
  subgroup: "Híbrida",
  hiddenFromCreation: true,
  prerequisiteNote: "Pré-requisito: Rank Intermediário em Magia de Fogo e em Lutador.",
  keyAttributeLabel: "Força ou Intelecto",
  resourceLabel: "PT / PM",
  tagline: "O calor não é uma aura, é a extensão do seu punho. Cada impacto queima, cada golpe é uma explosão controlada.",
  proficiencies: {
    armas: "Lutador (desarmado), armadura leve.",
    pericias: "—",
    nota: "Ofício do Corpo + Fogo. Usa Força ou Intelecto para tudo.",
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d10+3",
      weaponDieSteps: 1,
      mastery: {
        name: "Impacto Térmico",
        description: "Seus ataques desarmados causam +1d4 ígneo extra. Ao acertar um soco, você pode gastar 1 PM para aplicar a condição Em Chamas.",
      },
      talents: [
        { id: "calor-interno", name: "Calor Interno", paCost: 2, description: "+2 PV por patamar nesta árvore." },
      ],
      abilities: [
        {
          id: "soco-explosivo",
          name: "Soco Explosivo",
          paCost: 2,
          pmCost: 2,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "2d10 + BC (ígneo)" },
          effect: "Se acertar, o alvo faz teste de Vigor (CD 8+BC) ou é lançado 3m e fica Abalado.",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d10+4",
      mastery: {
        name: "Fluxo de Plasma",
        description: "Seus ataques desarmados ignoram Resistência ígnea. Acertos críticos em Em Chamas causam 2x o dado de dano ígneo.",
      },
      talents: [],
      abilities: [],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d12+4",
      mastery: {
        name: "Punho de Nova",
        description: "Uma vez por combate, seu ataque desarmado vira uma explosão de 3m de raio — dano integral a todos na área.",
      },
      talents: [],
      abilities: [],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d12+5",
      mastery: { name: "O Coração que Queima", description: "Imunidade a fogo, e você recupera PT sempre que causar dano ígneo." },
      talents: [],
      abilities: [],
    },
    {
      rank: "Rei",
      hpDiceFormula: "2d8+5",
      mastery: { name: "Combustão Espontânea", description: "Todo inimigo que começar o turno adjacente a você sofre 1d6 ígneo." },
      talents: [],
      abilities: [],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "2d10+6",
      mastery: { name: "Fim do Mundo", description: "O calor ao seu redor é tão intenso que transforma o ambiente: pedra derrete, água evapora, metal amolece. CA do alvo cai em 3 enquanto você estiver engajado." },
      talents: [],
      abilities: [],
    },
  ],
};
