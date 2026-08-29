import { Tree } from "@/lib/types";
import { RANK_PA_COST } from "./shared";

export const ARQUEARIA_TREE: Tree = {
  id: "arquearia",
  name: "Arquearia",
  category: "corpo",
  subgroup: "Arqueiro",
  keyAttributeLabel: "Agilidade",
  resourceLabel: "PT",
  tagline:
    "Contra quem não veste Touki, o maior dano sustentado do jogo, a 90 metros e sem gastar recurso. Contra rank Santo+, o Manto de Touki reduz cada tiro pelo dobro do Bônus de Rank do alvo — a árvore concede só uma forma cara de furar isso.",
  rankLabels: {
    Principiante: "Atirador",
    Intermediário: "Caçador",
    Avançado: "Franco-Atirador",
    Santo: "Olho de Águia",
    Rei: "Predador",
    Imperador: "Lenda da Flecha",
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d8+2",
      weaponDieSteps: 1,
      mastery: {
        name: "Olho do Caçador",
        description:
          "Você nunca sofre Desvantagem por distância longa. Ignora Cobertura Leve e não sofre penalidade por atirar em meio a aliados engajados. Identifica a distância exata até qualquer coisa visível.",
      },
      talents: [
        { id: "aljava-cheia", name: "Aljava Cheia", paCost: 1, description: "Você nunca fica sem flechas em terreno com madeira, e fabrica munição durante um Descanso Curto." },
        { id: "passo-e-tiro", name: "Passo e Tiro", paCost: 1, description: "Disparar não provoca ataques de oportunidade." },
        { id: "braco-firme", name: "Braço Firme", paCost: 1, description: "+4 PV por patamar seu nesta árvore. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela." , grants: { hpPerRank: 4 } },
      ],
      abilities: [
        {
          id: "disparo-duplo",
          name: "Disparo Duplo",
          signature: true,
          paCost: 2,
          range: "Alcance da arma",
          actions: { normal: 1 },
          damage: { normal: "Segundo disparo: um degrau abaixo" },
          effect: "Dois disparos contra o mesmo alvo ou alvos diferentes. Se ambos acertarem o mesmo alvo, ele fica Marcado; e faz um teste de Vigor (CD 8 + Agilidade + Bônus de Rank) ou também fica Caído.",
        },
        {
          id: "tiro-de-contencao",
          name: "Tiro de Contenção",
          paCost: 1,
          range: "Alcance da arma",
          actions: { normal: 1 },
          damage: { normal: "Metade do dado de arma" },
          effect: "Teste de Vigor (CD 8 + Agilidade + Rank) ou o alvo tem o Deslocamento reduzido à metade por 2 turnos.",
        },
        {
          id: "tiro-de-objeto",
          name: "Tiro de Objeto",
          paCost: 1,
          range: "Qualquer distância visível",
          actions: { normal: 1 },
          effect: "Você acerta um objeto específico e pequeno a qualquer distância visível, sem rolagem.",
        },
        {
          id: "flecha-de-sinal",
          name: "Flecha de Sinal",
          paCost: 1,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Você carrega flechas de assobio, de fumaça colorida e incendiárias.",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d8+2",
      weaponDieSteps: 1,
      mastery: {
        name: "A Marca Fica",
        description:
          "A condição Marcado passa a durar o combate inteiro. Você pode Marcar sem atacar (1 Ação de observação). Contra criaturas Marcadas, sabe automaticamente PV aproximado, resistências e se ela veste Touki.",
      },
      talents: [
        { id: "leitura-de-presa", name: "Leitura de Presa", paCost: 1, description: "Vantagem em Sobrevivência e Percepção para rastrear e emboscar. (Se você já tem isto pelo Tático ou pelo Norte, escolha outro talento — o mesmo bônus não empilha.)" },
        { id: "corda-rapida", name: "Corda Rápida", paCost: 1, description: "Recarregar besta deixa de custar Ação." },
        { id: "distancia-e-seguranca", name: "Distância É Segurança", paCost: 1, description: "Contra criaturas a mais de 18 metros, você recebe +2 na CA." },
      ],
      abilities: [
        {
          id: "tiro-certeiro",
          name: "Tiro Certeiro",
          signature: true,
          paCost: 2,
          ptCost: 1,
          range: "Alcance da arma",
          actions: { normal: 1 },
          effect: "Um disparo contra alvo Marcado que acerta automaticamente e crita em 19-20.",
        },
        {
          id: "chuva-de-flechas",
          name: "Chuva de Flechas",
          paCost: 1,
          ptCost: 1,
          range: "Esfera de 6m ao alcance máximo",
          actions: { normal: 1 },
          effect: "Teste de Agilidade (CD 8 + Agilidade + Rank) ou sofrem o dano de arma completo. Ignora Cobertura que não seja teto.",
        },
        {
          id: "armadilha-de-caca",
          name: "Armadilha de Caça",
          paCost: 1,
          range: "Local (10 minutos para montar)",
          actions: { normal: 0 },
          damage: { normal: "3d6" },
          effect: "Uma criatura que entrar sofre o dano e fica Presa até passar num teste de Força. Você pode ter até Agilidade armadilhas ativas.",
        },
        {
          id: "tiro-perfurante",
          name: "Tiro Perfurante",
          paCost: 1,
          ptCost: 1,
          range: "Linha",
          actions: { normal: 1 },
          effect: "O disparo atravessa o alvo e atinge a próxima criatura na linha com o mesmo dano. Contra alvo Atolado, Preso ou Congelado, atravessa até três.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d8+3",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "Aura na Corda",
        description:
          "Você recebe o Manto de Touki completo e a reserva de PT. Seus disparos contam como mágicos e ignoram Resistência a perfurante — mas ainda não furam o Manto de Touki de ninguém. O alcance de todas as suas armas de disparo dobra.",
      },
      talents: [
        { id: "folego-estavel", name: "Fôlego Estável", paCost: 2, description: "+3 PT Máximos." , grants: { pt: 3 } },
        { id: "tres-na-corda", name: "Três na Corda", paCost: 2, description: "Disparo Duplo passa a ser triplo, com o terceiro disparo dois degraus abaixo." },
        { id: "nunca-aqui", name: "Nunca Aqui", paCost: 2, description: "Depois de atirar, gaste 1 PT para se mover 9m sem provocar oportunidade e refazer Furtividade imediatamente." },
      ],
      abilities: [
        {
          id: "tiro-do-ceu",
          name: "Tiro do Céu",
          signature: true,
          paCost: 3,
          ptCost: 2,
          range: "Dobro do alcance máximo",
          actions: { normal: 2 },
          damage: { normal: "Dado de arma rolado três vezes" },
          effect: "Se o alvo estiver Marcado e não souber que você existe, o acerto é crítico automático.",
        },
        {
          id: "tiro-interrompido",
          name: "Tiro Interrompido",
          reaction: true,
          paCost: 2,
          ptCost: 1,
          range: "Alcance da arma",
          actions: { normal: 1 },
          effect: "1 Reação, quando uma criatura visível começar a conjurar, beber uma poção ou usar um item. Disparo automático; se causar dano, teste de Espírito ou perde a ação e o recurso gasto.",
        },
        {
          id: "ninho",
          name: "Ninho",
          paCost: 2,
          range: "Posição preparada (10 minutos)",
          actions: { normal: 0 },
          effect: "Enquanto permanecer na posição: Vantagem em todos os disparos, +2 no dano, e ninguém determina sua posição sem Percepção com Desvantagem contra sua Furtividade.",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d10+3",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "A Distância Não Existe",
        description:
          "Você acerta qualquer alvo que consiga ver, sem limite de alcance. Enxerga com precisão perfeita a até 1 km, atravessando neblina, escuridão e chuva. Contra alvos Marcados, seus disparos ignoram Cobertura Total, desde que exista qualquer trajetória física.",
      },
      talents: [
        {
          id: "marca-perene",
          name: "Marca Perene",
          paCost: RANK_PA_COST.talent.Santo,
          description:
            "A condição Marcado passa a durar até o próximo Descanso Longo, mesmo se a criatura fugir, se esconder ou atravessar o continente. Você a encontra de novo.",
        },
        {
          id: "contra-bateria",
          name: "Contra-Bateria",
          paCost: RANK_PA_COST.talent.Santo,
          description: "Quando um inimigo te atacar à distância, você sabe exatamente onde ele está e o Marca automaticamente.",
        },
        {
          id: "peso-da-aljava",
          name: "Peso da Aljava",
          paCost: RANK_PA_COST.talent.Santo,
          description: "Suas flechas causam +1d8 contra criaturas Grandes ou maiores.",
        },
      ],
      abilities: [
        {
          id: "um-alvo-um-tiro",
          name: "Um Alvo, Um Tiro",
          signature: true,
          paCost: 4,
          ptCost: 3,
          range: "Alcance ilimitado (visão)",
          actions: { normal: 2 },
          effect:
            "Uma vez por combate. Contra alvo Marcado com metade ou menos dos PV: o disparo reduz o alvo a 0 PV automaticamente, sem rolagem. Não funciona contra quem veste Touki, rank Rei ou superior, nem mais de 200 PV máximos.",
        },
        {
          id: "tempestade-de-setas",
          name: "Tempestade de Setas",
          paCost: 3,
          ptCost: 2,
          range: "30 metros",
          actions: { normal: 1 },
          effect: "Você dispara contra todas as criaturas hostis que consiga ver dentro de 30m, com rolagem separada para cada. Dano completo em todas.",
        },
        {
          id: "flecha-amarrada",
          name: "Flecha Amarrada",
          paCost: RANK_PA_COST.common.Santo,
          ptCost: 1,
          range: "Alcance da arma",
          actions: { normal: 1 },
          effect: "Teste de Força (CD 8 + Agilidade + Rank) ou o alvo fica Preso, com Deslocamento 0, até gastar 1 Ação e passar no teste.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d10+4",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "A Flecha que Fura",
        description:
          "O patamar que o arqueiro esperou a campanha inteira: gastando 3 PT (Flecha de Touki), um único disparo ignora completamente o Manto de Touki do alvo e toda redução de dano contra projéteis. É caro de propósito, e não existe segunda forma.",
      },
      talents: [
        { id: "aljava-divina", name: "Aljava Divina", paCost: RANK_PA_COST.talent.Rei, description: "A Flecha de Touki passa a custar 2 PT em vez de 3." },
      ],
      abilities: [
        {
          id: "cacada",
          name: "Caçada",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          ptCost: 2,
          range: "Alcance da arma",
          actions: { normal: 1 },
          effect:
            "Escolha um alvo Marcado. Até o fim do combate, seus disparos contra ele têm Vantagem e critam em 18-20; e o primeiro disparo de cada turno que acertar causa +1d10 cumulativo, até o máximo de +3d10. Trocar de alvo encerra o efeito.",
        },
        {
          id: "flecha-do-fim-da-estrada",
          name: "Flecha do Fim da Estrada",
          reaction: true,
          paCost: 4,
          ptCost: 4,
          range: "Visão",
          actions: { normal: 1 },
          effect: "1 Reação, quando uma criatura visível tentar fugir, teleportar, voar para fora de alcance ou entrar por uma porta. Disparo automático com Flecha de Touki embutida; teste de Vigor ou a fuga falha.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d12+4",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "O Tiro Que Já Aconteceu",
        description:
          "Você recebe 1 Ação adicional por turno, usável apenas para um único disparo — nunca para Disparo Duplo, Três na Corda ou qualquer técnica nomeada. Seus disparos não podem ser aparados, bloqueados nem interceptados por efeito de rank Rei ou inferior, incluindo o Fluxo Verdadeiro. Criaturas Marcadas por você não conseguem se esconder de você, nem por magia.",
      },
      talents: [
        { id: "nenhum-deles-chegou-perto", name: "Nenhum Deles Chegou Perto", paCost: 4, description: "Enquanto tiver ao menos 1 PT e linha de visão, criaturas hostis não conseguem se aproximar a menos de 9 metros sem passar num teste de Espírito (CD 8 + Agilidade + Bônus de Rank)." },
      ],
      abilities: [
        {
          id: "a-flecha-que-nao-erra",
          name: "A Flecha que Não Erra",
          signature: true,
          paCost: 6,
          ptCost: 5,
          range: "Qualquer lugar já visto",
          actions: { normal: 2 },
          damage: { normal: "Dado de arma rolado cinco vezes + Agilidade + Bônus de Rank" },
          effect: "Uma vez por combate. Acerta automaticamente, ignora CA, Cobertura, Manto de Touki, armadura mágica e barreiras físicas. Se o alvo estiver Marcado, não precisa vê-lo agora.",
        },
        {
          id: "ceu-cheio",
          name: "Céu Cheio",
          paCost: 5,
          ptCost: 4,
          range: "Esfera de 30m a qualquer distância",
          actions: { normal: 2 },
          damage: { normal: "12d10 (perfurante)" },
          effect: "Teste de Agilidade para metade. Criaturas Marcadas na área não têm direito ao teste. A área vira terreno difícil eriçado de hastes.",
        },
      ],
    },
  ],
};
