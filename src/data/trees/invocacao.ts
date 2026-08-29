import { Tree } from "@/lib/types";
import { RANK_PA_COST } from "./shared";

/**
 * Invocação tem "poucas magias e muitos Pactos": cada criatura invocável é um
 * Pacto comprado com PA, como uma magia — modelado aqui como Talento (mesmo
 * formato de custo + descrição), prefixado "Pacto:" pra clareza na UI.
 */
export const INVOCACAO_TREE: Tree = {
  id: "invocacao",
  name: "Espíritos e Feras",
  category: "magia",
  subgroup: "Invocação",
  keyAttributeLabel: "Espírito",
  resourceLabel: "PM",
  tagline: "A menor lista de feitiços do mundo — o que você compra aqui não são feitiços, são relações (Pactos).",
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "O Primeiro Círculo",
        description:
          "Você desenha círculos e mantém 1 Pacto ativo por vez. Um invocado permanece por 1 hora ou até 0 PV (não pode ser chamado de novo até o próximo Descanso Longo). Invocados têm PV = 10 × seu Bônus de Rank e usam o seu BC para acertar e para CD. Você entende e é entendido por qualquer criatura com Pacto, sem idioma comum.",
      },
      talents: [
        { id: "pacto-lobo-cinzento", name: "Pacto: Lobo Cinzento", paCost: RANK_PA_COST.talent.Principiante, description: "3d8 mordida, deslocamento 12m, rastreia por cheiro com Vantagem. Se outro aliado estiver adjacente ao alvo, derruba." },
        { id: "pacto-corvo-mensageiro", name: "Pacto: Corvo Mensageiro", paCost: RANK_PA_COST.talent.Principiante, description: "Frágil (metade dos PV), voa 18m. Você vê e ouve pelo que ele vê e ouve a qualquer distância. Não luta." },
        { id: "pacto-salamandra", name: "Pacto: Salamandra", paCost: RANK_PA_COST.talent.Principiante, description: "2d8 mordida + 2d6 ígneo, imune a fogo, aplica Em Chamas. Acende fogueiras e derrete fechaduras; do tamanho de um gato." },
        { id: "pacto-espirito-de-pedra", name: "Pacto: Espírito de Pedra", paCost: RANK_PA_COST.talent.Principiante, description: "3d6 soco, Resistência a dano físico, Deslocamento 6m. Não recua nunca. Serve para segurar uma porta." },
        { id: "reserva-do-invocador", name: "Reserva do Invocador", paCost: RANK_PA_COST.talent.Principiante, description: "+2 PM por patamar seu em Invocação. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela." , grants: { mpPerRank: 2 } },
        { id: "traco-rapido", name: "Traço Rápido", paCost: RANK_PA_COST.talent.Principiante, description: "Desenhar um círculo em combate passa a custar o PM normal, sem o dobro." },
        { id: "circulo-guardado", name: "Círculo Guardado", paCost: RANK_PA_COST.talent.Principiante, description: "Você carrega um círculo pré-desenhado. Usá-lo dispensa o tempo de desenho, e ele aguenta três invocações antes de se apagar." },
      ],
      abilities: [
        {
          id: "chamado",
          name: "Chamado",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 3,
          range: "Círculo",
          actions: { normal: 1 },
          effect:
            "Invoca uma criatura com quem você tenha Pacto. Ela surge no círculo e age a partir do próximo turno. Invocar um Pacto acima do Principiante custa PM adicional: +3 PM por patamar de diferença (Intermediário 6, Avançado 9, Santo 12, Rei 15). Desenhar o círculo custa 10 minutos fora de combate, ou 1 Ação e o dobro do PM no meio da luta.",
          incantation: "Eu desenhei o caminho e paguei a passagem. Venha, e o que for combinado será cumprido. Chamado!",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Vínculo",
        description:
          "2 Pactos ativos ao mesmo tempo. Você vê pelos olhos de qualquer invocado seu, gastando 1 Ação, a qualquer distância (seu corpo fica Cego enquanto isso). Ordens específicas passam a custar 1 Ação para todos os seus invocados de uma vez.",
      },
      talents: [
        { id: "pacto-urso-das-cavernas", name: "Pacto: Urso das Cavernas", paCost: RANK_PA_COST.talent.Intermediário, description: "4d10 garra, Grande, empurra 3m a cada acerto. Absorve dano por você." },
        { id: "pacto-serpente-de-nevoa", name: "Pacto: Serpente de Névoa", paCost: RANK_PA_COST.talent.Intermediário, description: "Ataque com veneno (Vigor ou Envenenado). Move-se por qualquer fresta; invisível em terreno enevoado." },
        { id: "pacto-espirito-do-vento", name: "Pacto: Espírito do Vento", paCost: RANK_PA_COST.talent.Intermediário, description: "Não ataca. Concede Voo (18m) a um aliado que ele toque, enquanto durar a invocação." },
        { id: "pacto-grifo", name: "Pacto: Grifo", paCost: RANK_PA_COST.talent.Intermediário, description: "Voa 24m, 3d10 garra, e carrega uma pessoa." },
        { id: "sangue-no-circulo", name: "Sangue no Círculo", paCost: RANK_PA_COST.talent.Intermediário, description: "Você pode pagar o PM de uma invocação com PV, na razão de 2 PV por 1 PM." },
        { id: "vontade-firme", name: "Vontade Firme", paCost: RANK_PA_COST.talent.Intermediário, description: "Invocados seus são imunes a Amedrontado e não podem ser dominados, expulsos ou dissipados por efeito de patamar inferior ao do próprio Pacto invocado." },
        { id: "companhia", name: "Companhia", paCost: RANK_PA_COST.talent.Intermediário, description: "Um invocado à sua escolha permanece 8 horas em vez de 1." },
      ],
      abilities: [
        {
          id: "retorno-invocacao",
          name: "Retorno",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 2,
          range: "90 metros",
          actions: { normal: 1 },
          effect: "Um invocado seu volta imediatamente para o círculo, ou é dispensado. Se dispensado antes de chegar a 0 PV, pode ser chamado de novo neste mesmo dia.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d6+3",
      mastery: {
        name: "Círculo Rápido",
        description:
          "3 Pactos ativos. Invocar deixa de exigir círculo desenhado: gaste 1 Ação e trace no ar. Invocados passam a ter PV = 15 × seu Bônus de Rank e recebem seu Bônus de Rank no dano. Desbloqueia Magia Combinada.",
      },
      talents: [
        { id: "pacto-quimera", name: "Pacto: Quimera", paCost: RANK_PA_COST.talent.Avançado, description: "Três cabeças, três ataques por turno de 2d8 cada, um deles com sopro elemental à sua escolha ao invocar." },
        { id: "pacto-espirito-antigo", name: "Pacto: Espírito Antigo", paCost: RANK_PA_COST.talent.Avançado, description: "Não luta. Responde uma pergunta por invocação sobre algo que aconteceu antes de você nascer — verdadeira, ainda que enviesada." },
        { id: "pacto-golem-de-guerra", name: "Pacto: Golem de Guerra", paCost: RANK_PA_COST.talent.Avançado, description: "Enorme, 6d8 por golpe, Resistência a todo dano físico, Deslocamento 6m. Não pode ser movido nem derrubado." },
        { id: "pacto-alcateia", name: "Pacto: Alcateia", paCost: RANK_PA_COST.talent.Avançado, description: "Invoca cinco lobos de uma vez, cada um com um quarto dos PV normais e 1d8 de mordida em vez de 3d8, agindo na mesma Iniciativa." },
        { id: "duas-vidas", name: "Duas Vidas", paCost: RANK_PA_COST.talent.Avançado, description: "Um invocado reduzido a 0 PV pode ser chamado de novo após um Descanso Curto, em vez de Longo." },
        { id: "empatia-absoluta", name: "Empatia Absoluta", paCost: RANK_PA_COST.talent.Avançado, description: "Você compartilha os sentidos de todos os seus invocados ao mesmo tempo, sem gastar Ação e sem ficar cego." },
        { id: "pacto-emprestado", name: "Pacto Emprestado", paCost: RANK_PA_COST.talent.Avançado, description: "Um aliado pode comandar um dos seus invocados com as próprias Ações, sem que você gaste nada." },
      ],
      abilities: [
        {
          id: "substituicao",
          name: "Substituição",
          signature: true,
          reaction: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 6,
          range: "18 metros",
          actions: { normal: 1 },
          effect: "1 Reação, quando você ou um aliado for alvo de um ataque: um invocado seu troca de lugar com o alvo instantaneamente e recebe o ataque no lugar dele.",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Corpos Artificiais",
        description:
          "4 Pactos ativos. Você constrói o corpo de um invocado à sua escolha entre sessões: escolha duas melhorias permanentes (+50% PV, +1 ataque por turno, sentido especial, resistência a um tipo de dano, ou voo). Invocados não desaparecem a 0 PV — o corpo quebra, a consciência volta e recebe um corpo novo após um Descanso Longo.",
      },
      talents: [
        { id: "pacto-espirito-da-chama-antiga", name: "Pacto: Espírito da Chama Antiga", paCost: RANK_PA_COST.talent.Santo, description: "4d8 de dano ígneo em área de 6m por turno, sem gastar suas Ações. Não obedece bem: role Espírito (CD 15) a cada turno, ou ele escolhe o próprio alvo." },
        { id: "pacto-sentinela-de-aco", name: "Pacto: Sentinela de Aço", paCost: RANK_PA_COST.talent.Santo, description: "Enorme, 100 PV além do normal, intercepta um ataque por rodada contra um aliado adjacente, automaticamente. Não ataca." },
        { id: "pacto-mensageiro-do-alto", name: "Pacto: Mensageiro do Alto", paCost: RANK_PA_COST.talent.Santo, description: "Atravessa continentes numa hora, entrega qualquer coisa a qualquer pessoa que você já tenha visto, e volta." },
        { id: "o-nome-verdadeiro", name: "O Nome Verdadeiro", paCost: RANK_PA_COST.talent.Santo, description: "Você aprende o nome verdadeiro de um invocado. Ele passa a obedecer qualquer ordem sem teste, inclusive ordens suicidas — e passa a te odiar em silêncio." },
      ],
      abilities: [
        {
          id: "circulo-de-convocacao",
          name: "Círculo de Convocação",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Santo,
          pmCost: 12,
          range: "Círculo de 12m",
          actions: { normal: 4 },
          effect: "Invoca todos os seus Pactos de uma vez, no mesmo turno. Uma vez por Descanso Longo.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+4",
      mastery: {
        name: "Círculo Permanente",
        description:
          "5 Pactos ativos. Um invocado à sua escolha fica permanentemente ao seu lado, sem custo de PM e sem limite de tempo — ele come, dorme e tem opinião. Círculos que você desenhar em pedra ou metal duram para sempre e podem ser usados por outras pessoas, se souberem o nome certo.",
      },
      talents: [
        { id: "pacto-fera-ancestral", name: "Pacto: Fera Ancestral", paCost: RANK_PA_COST.common.Rei, description: "Gigantesca. 4d10 por golpe, três golpes por turno, voa, e respira um elemento à sua escolha em cone de 18m. Ela concorda em vir; não concorda em ficar." },
        { id: "pacto-espirito-do-contrato", name: "Pacto: Espírito do Contrato", paCost: RANK_PA_COST.common.Rei, description: "Não luta e não pode ser ferido. Enquanto existir, qualquer acordo verbal na presença dele é vinculante: quem quebrar sofre 10d10 de dano psíquico, onde estiver." },
        { id: "legiao", name: "Legião", paCost: RANK_PA_COST.talent.Rei, description: "Ao invocar, você pode chamar três cópias de um mesmo Pacto de patamar Avançado ou inferior, pagando o PM uma vez." },
      ],
      abilities: [
        {
          id: "troca-de-lugares",
          name: "Troca de Lugares",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 12,
          range: "Alcance ilimitado",
          actions: { normal: 1 },
          effect: "Você e um invocado seu trocam de posição instantaneamente, em qualquer lugar do mundo.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d10+4",
      mastery: {
        name: "O Grande Círculo",
        description:
          "6 Pactos ativos, todos podem estar em campo ao mesmo tempo. Invocar deixa de custar Ação: você chama um invocado por turno de graça. Seus invocados usam os seus PV como reserva de emergência — ao chegar a 0, você pode transferir dano para si mesmo e mantê-lo de pé.",
      },
      talents: [
        { id: "ninguem-chega-sozinho", name: "Ninguém Chega Sozinho", paCost: RANK_PA_COST.talent.Imperador, description: "Todos os seus invocados em campo recebem +2 na CA, +2 no acerto e imunidade a efeitos de dissipação de patamar Rei ou inferior." },
      ],
      abilities: [
        {
          id: "o-chamado-que-nao-se-recusa",
          name: "O Chamado que Não se Recusa",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 22,
          range: "Ilimitado (em qualquer lugar do mundo)",
          actions: { normal: 6 },
          effect:
            "Você invoca uma criatura com quem não tem Pacto — qualquer criatura de rank Rei ou inferior que já tenha visto, viva ou morta. Teste de Espírito com Desvantagem: se falhar, obedece por 1 minuto; se passar, vem mesmo assim, furiosa, e o Mestre decide o que ela faz.",
        },
        {
          id: "corpo-emprestado",
          name: "Corpo Emprestado",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 18,
          range: "Pessoal",
          actions: { normal: 1 },
          effect:
            "Por 10 minutos, você transfere sua consciência para o corpo de um invocado, usando os PV, ataques e sentidos dele; seu corpo fica inconsciente e protegido pelo círculo. Se o corpo emprestado morrer, você volta com 1 PV e um nível de Exaustão.",
        },
      ],
    },
  ],
};
