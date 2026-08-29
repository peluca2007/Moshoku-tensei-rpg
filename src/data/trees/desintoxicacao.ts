import { Tree } from "@/lib/types";
import { MAGIC_ACTIONS, RANK_PA_COST } from "./shared";

export const DESINTOXICACAO_TREE: Tree = {
  id: "desintoxicacao",
  name: "Magia de Desintoxicação",
  category: "magia",
  subgroup: "Cura e Suporte",
  keyAttributeLabel: "Espírito",
  resourceLabel: "PM",
  tagline:
    "Trata veneno, doença, maldição e petrificação — a única escola cuja dificuldade cresce sozinha (Profundidade). O Rank Deus (a Doença da Pedra Mágica) é puramente narrativo.",
  proficiencies: {
    armas: "Nenhuma além do padrão (armas simples, armadura leve).",
    pericias: "Medicina e Ofícios (Alquimia) são as perícias da escola; o Bônus de Rank NÃO soma em perícia nenhuma.",
    nota: "Escola Formal de Magia. Conjura com Espírito.",
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Paladar",
        description:
          "Tocando, cheirando ou provando qualquer substância, você sabe exatamente o que ela é, e identifica a Profundidade de qualquer aflição que veja, inclusive em cadáveres. Você é imune a veneno mundano.",
      },
      talents: [
        { id: "reserva-do-purificador", name: "Reserva do Purificador", paCost: RANK_PA_COST.talent.Principiante, description: "+2 PM por patamar seu em Desintoxicação. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela." , grants: { mpPerRank: 2 } },
        { id: "herborista", name: "Herborista", paCost: RANK_PA_COST.talent.Principiante, description: "Fora de combate, com uma hora e material, reduza a Profundidade de uma aflição em 1 sem gastar PM. No máximo uma vez por aflição por Descanso Longo." },
        { id: "mao-que-nao-contamina", name: "Mão que Não Contamina", paCost: RANK_PA_COST.talent.Principiante, description: "Você não pode ser envenenado, infectado ou amaldiçoado por contato ao manusear aquilo que está tratando ou extraindo." },
      ],
      abilities: [
        {
          id: "purgar",
          name: "Purgar",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Remove uma aflição de Profundidade 1 do alvo — veneno, doença, maldição ou petrificação incipiente, mágica ou não.",
          incantation: "O que entrou sem ser convidado, saia do jeito que quiser, mas saia. Purgar!",
        },
        {
          id: "antidoto",
          name: "Antídoto",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 1,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "O alvo recebe Vantagem contra veneno e doença por 1 hora; se já afetado, a Profundidade para de subir durante o período.",
        },
        {
          id: "agua-limpa",
          name: "Água Limpa",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 1,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Purifica até 20 litros de comida, água, ar ou terreno contaminado.",
        },
        {
          id: "sangria",
          name: "Sangria",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "2d6 de dano ao alvo" },
          effect: "Reduz em 1 a Profundidade de uma aflição sem removê-la, ao custo do dano acima. No máximo uma vez por aflição por Descanso Longo.",
        },
        {
          id: "estomago-de-ferro",
          name: "Estômago de Ferro",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 1,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Por 8 horas, o alvo pode comer e beber qualquer coisa sem consequência.",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Extração",
        description:
          "Ao purgar qualquer aflição, você pode capturá-la num frasco em vez de dissipá-la (mantém a Profundidade original, dura 1 mês). Aplicada em arma, comida ou superfície, força teste de Vigor (CD 8 + BC) na próxima criatura exposta. Você carrega até Espírito frascos.",
      },
      talents: [
        { id: "frasco-estavel", name: "Frasco Estável", paCost: RANK_PA_COST.talent.Intermediário, description: "Suas extrações duram um ano em vez de um mês, e você carrega o dobro de frascos." },
        { id: "purga-coletiva", name: "Purga Coletiva", paCost: RANK_PA_COST.talent.Intermediário, description: "O Purgar de rank Principiante passa a atingir até três criaturas adjacentes com uma conjuração." },
        { id: "leitura-de-sintoma", name: "Leitura de Sintoma", paCost: RANK_PA_COST.talent.Intermediário, description: "Você sabe se alguém está afetado por algo antes dos sintomas aparecerem, incluindo maldições dormentes e venenos de efeito retardado." },
      ],
      abilities: [
        {
          id: "purga-profunda",
          name: "Purga Profunda",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 4,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Remove uma aflição de Profundidade 2 ou menor, ou reduz em 2 a Profundidade de qualquer aflição — a redução, no máximo uma vez por aflição por Descanso Longo.",
        },
        {
          id: "muro-esteril",
          name: "Muro Estéril",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 3,
          range: "Esfera de 9m",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Por 1 hora, gás venenoso, esporo, praga, ácido e ar contaminado não entram na área.",
        },
        {
          id: "torpor",
          name: "Torpor",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 3,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Teste de Vigor (CD 8 + BC) ou o alvo fica Envenenado por 1 minuto (Desvantagem em ataques e testes de atributo). Sem dano.",
        },
        {
          id: "diagnostico-de-praga",
          name: "Diagnóstico de Praga",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 2,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Identifica todas as criaturas doentes, envenenadas ou amaldiçoadas num raio de 18m, a Profundidade de cada uma, e quem foi a origem.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d6+3",
      mastery: {
        name: "Contra a Maré",
        description:
          "Você purga aflições de Profundidade 3 ou menor. A Profundidade de qualquer aflição para de subir em criaturas a até 9 metros de você, enquanto consciente. Desbloqueia Magia Combinada.",
      },
      talents: [
        { id: "purificador-de-guerra", name: "Purificador de Guerra", paCost: RANK_PA_COST.talent.Avançado, description: "Muro Estéril e Quarentena passam a cobrir o dobro da área e a durar o dobro do tempo." },
        { id: "extracao-refinada", name: "Extração Refinada", paCost: RANK_PA_COST.talent.Avançado, description: "Aflições extraídas por você sobem 1 de Profundidade ao serem aplicadas em outra criatura." },
        { id: "corpo-recusado", name: "Corpo Recusado", paCost: RANK_PA_COST.talent.Avançado, description: "Você é imune a veneno e doença não-mágicos, e a Profundidade de qualquer aflição sobe em você na metade da velocidade normal." },
      ],
      abilities: [
        {
          id: "anular",
          name: "Anular",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 6,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Avançado,
          effect:
            "Remove uma condição de qualquer origem do alvo: Envenenado, Paralisado, Petrificado, Cego, Surdo, Amedrontado, Atordoado, Congelado, Em Chamas, Atolado, Desequilibrado ou Marcado. Também remove aflições de Profundidade 3 ou menor.",
        },
        {
          id: "quarentena",
          name: "Quarentena",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 5,
          range: "Esfera de 12m",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Por 10 minutos, nada tóxico, infeccioso ou amaldiçoado atravessa a borda da área, nos dois sentidos.",
        },
        {
          id: "corrosao",
          name: "Corrosão",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 5,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "4d8 de dano ácido (dobrado contra construtos e armaduras pesadas)" },
          effect: "Teste de Vigor (CD 8 + BC). Falha: dano e Envenenado por 1 minuto. Metal não-mágico exposto perde 2 de CA permanentemente.",
        },
        {
          id: "sangue-trocado-desintox",
          name: "Sangue Trocado",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 4,
          range: "Toque",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Você transfere uma aflição de um alvo para você mesmo, reduzindo a Profundidade dela em 2 no processo.",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Estado Anulado",
        description:
          "Você purga aflições de Profundidade 4 ou menor. Toda criatura que você purgar fica imune àquela aflição específica por 24 horas. Você anula qualquer condição (dos outros) com um toque, sem PM, uma vez por turno.",
      },
      talents: [
        { id: "a-mao-que-nao-erra", name: "A Mão que Não Erra", paCost: RANK_PA_COST.talent.Santo, description: "Uma vez por Descanso Longo, você purga uma aflição de Profundidade um ponto acima do seu limite." },
      ],
      abilities: [
        {
          id: "purificacao",
          name: "Purificação",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Santo,
          pmCost: 11,
          range: "Esfera de 30m",
          actions: MAGIC_ACTIONS.Santo,
          effect: "Toda criatura, água, solo, alimento e estrutura na área é purgada de aflições de Profundidade 4 ou menor.",
          incantation: "Que a terra esqueça o que foi despejado nela. Que a carne esqueça o que entrou nela. Purificação!",
        },
        {
          id: "selar-a-maldicao",
          name: "Selar a Maldição",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 9,
          range: "Toque",
          actions: MAGIC_ACTIONS.Santo,
          effect: "Uma aflição que você não consegue purgar fica congelada em Profundidade e sintomas por até um ano — não melhora, mas para de piorar.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Veneno",
        description:
          "Você conjura aflições diretamente, sem frasco nem contato. Venenos criados por você começam na Profundidade igual à metade do seu Bônus de Rank, arredondado para cima. Seus efeitos de veneno ignoram Resistência a veneno. Você purga aflições de Profundidade 5 ou menor.",
      },
      talents: [
        { id: "duas-faces", name: "Duas Faces", paCost: RANK_PA_COST.talent.Rei, description: "Quando purgar uma aflição de uma criatura, gaste 1 Ação para aplicá-la imediatamente em outra criatura visível a até 9m, sem frasco e sem teste." },
      ],
      abilities: [
        {
          id: "sopro-podre",
          name: "Sopro Podre",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 13,
          range: "Cone de 18m",
          actions: MAGIC_ACTIONS.Rei,
          damage: { normal: "10d8 de dano de veneno" },
          effect:
            "Teste de Vigor com Desvantagem. Falha: dano, Envenenado por 10 minutos, e uma aflição de Profundidade 3 que continua subindo. Sucesso: metade. Não funciona em construtos, mortos-vivos ou quem não respira.",
        },
        {
          id: "toque-do-fim",
          name: "Toque do Fim",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 10,
          range: "Toque",
          actions: MAGIC_ACTIONS.Rei,
          effect:
            "Teste de Vigor (CD 8 + BC). Falha: o alvo recebe uma aflição de Profundidade 4 à sua escolha, que sobe 1 por dia e mata ao chegar a 6. Só um mago de patamar igual ou superior consegue removê-la.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d8+4",
      mastery: {
        name: "O Corpo Limpo",
        description:
          "Você purga qualquer aflição de Profundidade 5 ou menor sem rolagem, ritual ou tempo — inclusive petrificação completa, maldições hereditárias e parasitas mágicos. É permanentemente imune a veneno, doença, maldição e petrificação. Uma vez por turno, conjure magia de Desintoxicação de rank Avançado ou inferior em Silenciosa sem gastar Ação.",
      },
      talents: [
        { id: "nada-entra", name: "Nada Entra", paCost: RANK_PA_COST.talent.Imperador, description: "Todos os aliados a até 18 metros de você compartilham a sua imunidade a veneno, doença e maldição enquanto permanecerem ao seu alcance." },
      ],
      abilities: [
        {
          id: "o-mundo-sem-praga",
          name: "O Mundo Sem Praga",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 22,
          range: "Raio de 3 km",
          actions: MAGIC_ACTIONS.Imperador,
          effect: "Toda aflição de Profundidade 5 ou menor deixa de existir dentro do raio: em pessoas, água, solo, ar e paredes. Efeito narrativo permanente.",
        },
        {
          id: "nome-do-veneno",
          name: "Nome do Veneno",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 18,
          range: "45 metros",
          actions: MAGIC_ACTIONS.Imperador,
          effect: "Você transfere uma aflição inteira, com Profundidade intacta, de uma criatura afetada para outra visível, sem teste (com Desvantagem contra criaturas de rank Deus).",
        },
      ],
    },
  ],
};
