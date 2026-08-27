import { Tree } from "@/lib/types";
import { UTILITY_PA_COST } from "./shared";

export const TATICO_TREE: Tree = {
  id: "navegacao-e-lideranca",
  name: "Navegação e Liderança",
  category: "utilidade",
  subgroup: "Sobrevivência e Táticas",
  keyAttributeLabel: "Intelecto",
  resourceLabel: "PP",
  tagline:
    "Domínio da Preparação: tempo e logística. Faixa exclusiva: economia de ação — só o Tático concede Ações, mexe na Iniciativa e reposiciona aliados. A pergunta dele: \"onde e quando isso acontece?\"",
  rankLabels: {
    Principiante: "Explorador",
    Intermediário: "Rastreador",
    Avançado: "Guia",
    Santo: "Estrategista",
    Rei: "Comandante",
    Imperador: "Senhor da Guerra",
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d8+1",
      mastery: {
        name: "Onde Pisar",
        description:
          "Escopo: a próxima hora, o trecho de estrada à frente. Enquanto liderar a marcha, o grupo nunca se perde e ignora terreno difícil natural. O grupo nunca é surpreendido — emboscadas ainda acontecem, mas vocês agem no primeiro turno. Sempre encontram água, abrigo e um lugar defensável.",
      },
      talents: [
        { id: "mapa-vivo", name: "Mapa Vivo", paCost: UTILITY_PA_COST.talent.Principiante, description: "Você desenha e lê mapas; regiões que já atravessou ficam registradas e podem ser vendidas." },
        { id: "suprimento", name: "Suprimento", paCost: UTILITY_PA_COST.talent.Principiante, description: "O grupo consome metade de ração/água/forragem, e você sempre sabe quantos dias faltam para o problema começar." },
        { id: "sinais", name: "Sinais", paCost: UTILITY_PA_COST.talent.Principiante, description: "Código de gestos e assobios com o grupo: comunicação a 200m sem falar." },
        { id: "conhecimento-de-bestas", name: "Conhecimento de Bestas", paCost: UTILITY_PA_COST.talent.Principiante, description: "Sobre qualquer monstro visto, identifica espécie, comportamento de caça e uma fraqueza real." },
        { id: "olho-de-cerco", name: "Olho de Cerco", paCost: UTILITY_PA_COST.talent.Principiante, description: "Olhando pra uma fortificação/acampamento, estima defensores, suprimento, tempo de resistência e o ponto fraco." },
      ],
      abilities: [
        {
          id: "primeiro-a-ver",
          name: "Primeiro a Ver",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Principiante,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Uma vez por combate: se o grupo entrar em combate vindo de uma marcha conduzida por você, todos os aliados somam seu Bônus de Rank na Iniciativa, e você escolhe quem age primeiro.",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d8+2",
      mastery: {
        name: "Quem Passou Por Aqui",
        description:
          "Escopo: o dia de hoje, uma região de um dia de viagem. Rastros deixam de ser teste: você sabe quantos eram, o que carregavam, há quanto tempo, e se estavam com pressa. Prevê o destino provável de uma trilha seguida por uma hora.",
      },
      talents: [
        { id: "marcha-forcada", name: "Marcha Forçada", paCost: UTILITY_PA_COST.talent.Intermediário, description: "O grupo viaja o dobro da distância por dia; seu teste de Vigor final tem Vantagem, e você isenta um aliado por dia." },
        { id: "terreno-conhecido", name: "Terreno Conhecido", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Escolha um tipo de terreno: velocidade total nele, e Vantagem em navegação e ocultação." },
        { id: "cavalaria-tatico", name: "Cavalaria", paCost: UTILITY_PA_COST.talent.Intermediário, description: "Você treina e monta qualquer besta de carga; não cai por efeito que permita teste de Agilidade." },
        { id: "retirada-ordenada", name: "Retirada Ordenada", paCost: UTILITY_PA_COST.talent.Intermediário, description: "1 Ação: até o fim do próximo turno, aliados que se afastarem de inimigos não provocam oportunidade." },
      ],
      abilities: [
        {
          id: "antecipacao",
          name: "Antecipação",
          signature: true,
          reaction: true,
          paCost: UTILITY_PA_COST.signature.Intermediário,
          ppCost: 1,
          range: "Voz",
          actions: { normal: 1 },
          effect: "1 Reação, quando um inimigo declara uma ação. Um aliado à sua escolha usa imediatamente 1 Ação para reagir. Uma vez por combate.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d8+2",
      ppGained: 1,
      mastery: {
        name: "O Terreno Escolhido",
        description:
          "Escopo: a semana, uma província, uma rota comercial. Com 10 minutos antes de um combate previsto, você escolhe uma característica definidora do campo de batalha (elevação, gargalo, chão instável, luz favorável, cobertura pesada) — e o Mestre não pode discordar.",
      },
      talents: [
        { id: "engenharia-de-campo", name: "Engenharia de Campo", paCost: UTILITY_PA_COST.talent.Avançado, description: "Com uma hora e ajuda do grupo, ergue paliçada, ponte improvisada, fosso ou trincheira: 40 PV, Cobertura Superior." },
        { id: "voz-de-sargento", name: "Voz de Sargento", paCost: UTILITY_PA_COST.talent.Avançado, description: "1 Ação: um aliado remove Atordoado ou Caído e repete um teste de resistência falho." },
        { id: "logistica-de-guerra", name: "Logística de Guerra", paCost: UTILITY_PA_COST.talent.Avançado, description: "Você abastece até cinquenta pessoas indefinidamente em território hostil." },
        { id: "emboscada-planejada", name: "Emboscada Planejada", paCost: UTILITY_PA_COST.talent.Avançado, description: "Requer 1 PP ao usar. Com uma hora de preparo, todos os aliados agem antes de qualquer inimigo no primeiro turno, e os inimigos ficam Surpresos." },
      ],
      abilities: [
        {
          id: "ponto-de-estrangulamento",
          name: "Ponto de Estrangulamento",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Avançado,
          ppCost: 1,
          range: "Campo de batalha",
          actions: { normal: 1 },
          effect:
            "Declare que existe um gargalo de 3m de largura no campo de batalha. Inimigos só atravessam por ali; aliados posicionados nele têm +3 CA e Vantagem em ataques de oportunidade; efeitos de área inimigos atingem no máximo dois personagens.",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d10+3",
      ppGained: 1,
      mastery: {
        name: "A Ordem de Batalha",
        description:
          "Escopo: o mês, um campo de batalha inteiro, o suprimento de uma tropa. Aliados podem usar sua rolagem de Iniciativa. Uma vez por turno, sem gastar Ação, troque a posição de dois aliados na ordem de Iniciativa. Você sempre sabe quem ainda não agiu e o que cada inimigo fez.",
      },
      talents: [
        { id: "foco-de-fogo", name: "Foco de Fogo", paCost: UTILITY_PA_COST.talent.Santo, description: "1 Ação: até o fim do turno, aliados que atacarem o alvo apontado somam seu Bônus de Rank ao dano." },
        { id: "prever-o-golpe", name: "Prever o Golpe", paCost: UTILITY_PA_COST.talent.Santo, description: "1 Reação: quando aliado a 18m for atingido, ele recebe +4 na CA contra aquele ataque, resolvido retroativamente." },
        { id: "a-guerra-antes-da-guerra", name: "A Guerra Antes da Guerra", paCost: UTILITY_PA_COST.talent.Santo, description: "Gastando 2 PP, a força inimiga chegou em pior estado: reduza o número de inimigos em um terço, ou dê a todos 1 nível de Exaustão." },
        { id: "doutrina", name: "Doutrina", paCost: UTILITY_PA_COST.talent.Santo, description: "Escolha um estilo/escola: contra praticantes dele, aliados que ouvirem suas instruções recebem +2 na CA." },
      ],
      abilities: [
        {
          id: "manobra",
          name: "Manobra",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Santo,
          ppCost: 1,
          range: "Voz",
          actions: { normal: 1 },
          effect: "Até três aliados que te ouçam movem-se imediatamente até o próprio Deslocamento, sem provocar oportunidade e sem gastar as Ações deles.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d10+3",
      ppGained: 1,
      mastery: {
        name: "Comando",
        description:
          "Escopo: a estação, uma campanha militar. Uma vez por turno, gastando 1 Ação sua, conceda 1 Ação adicional a um aliado que a use imediatamente. Aliados sob seu comando não são movidos contra a vontade e nunca ficam Surpresos. Você lidera até 500 pessoas sem testes.",
      },
      talents: [
        { id: "segundo-escalao", name: "Segundo Escalão", paCost: UTILITY_PA_COST.talent.Rei, description: "Gastando 2 PP, uma força aliada que estava a caminho chega agora — patrulha, mercenários, guarda da cidade." },
        { id: "sem-baixas", name: "Sem Baixas", paCost: UTILITY_PA_COST.talent.Rei, description: "Uma vez por Descanso Longo, quando um aliado chegaria a 0 PV, ele fica com 1 PV e se move 9m para fora do perigo." },
        { id: "ordem-de-marcha", name: "Ordem de Marcha", paCost: UTILITY_PA_COST.talent.Rei, description: "Aliados que te ouvem ganham +3m de Deslocamento e podem atravessar espaços ocupados por aliados livremente." },
      ],
      abilities: [
        {
          id: "avante",
          name: "Avante",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Rei,
          ppCost: 3,
          range: "Voz",
          actions: { normal: 1 },
          effect: "Uma vez por combate: todos os aliados que te ouçam recebem 1 Ação adicional neste turno, que não pode conjurar magia de rank Santo ou superior.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d12+4",
      ppGained: 1,
      mastery: {
        name: "A Guerra Já Acabou",
        description:
          "Escopo: o ano, uma guerra inteira. Uma vez por Descanso Longo, gastando 4 PP, declare uma condição estratégica já em vigor (estrada cortada, porto bloqueado, exército sem pagamento). Você pode declarar que um confronto planejado não vai acontecer. Recupere 2 PP em Descanso Curto.",
      },
      talents: [
        { id: "o-mapa-e-meu", name: "O Mapa É Meu", paCost: UTILITY_PA_COST.talent.Imperador, description: "Seu Escopo passa a cobrir um continente inteiro: movimentação de tropas, rotas, colheitas, estações." },
        { id: "reputacao-de-aco", name: "Reputação de Aço", paCost: UTILITY_PA_COST.talent.Imperador, description: "Exércitos que saibam que você comanda o outro lado sofrem penalidade de moral; alguns recusam engajamento." },
        { id: "heranca-de-comando", name: "Herança de Comando", paCost: UTILITY_PA_COST.talent.Imperador, description: "Escolha um talento de qualquer patamar desta árvore que não possua. Troque a cada Descanso Longo; nunca mais de um por vez." },
      ],
      abilities: [
        {
          id: "a-batalha-que-voce-escolheu",
          name: "A Batalha Que Você Escolheu",
          signature: true,
          paCost: UTILITY_PA_COST.signature.Imperador,
          ppCost: 4,
          range: "Campo de batalha",
          actions: { normal: 3 },
          effect:
            "Uma vez por Descanso Longo. Declare que este confronto foi montado por você e escolha duas: todos os aliados recebem 1 Ação extra nos próximos 3 turnos; os reforços inimigos não vêm; o terreno muda a seu favor; o comandante inimigo desconfia do segundo em comando. Exige inimigos organizados — contra um monstro solitário, não faz nada.",
        },
      ],
    },
  ],
};
