import { Tree } from "@/lib/types";
import { MAGIC_ACTIONS, RANK_PA_COST } from "./shared";

export const BARREIRA_TREE: Tree = {
  id: "barreira",
  name: "Barreira e Proteção",
  category: "magia",
  subgroup: "Cura e Suporte",
  mechanic: {
    tag: "Selado / Fluxo Interrompido",
    hook:
      "Você não conjura contra o inimigo — você conjura contra o espaço, e escreve a lei que vale lá dentro.",
    loop: [
      "Desenhe. Toda barreira é uma esfera centrada num ponto à sua escolha, erguida por 1 Ação, e você sustenta uma por vez (duas do Intermediário em diante).",
      "Imponha o teto. Selado proíbe, dentro da esfera, magia de rank SUPERIOR ao seu rank em Barreira. Tentar mesmo assim gasta as Ações e o PM e falha.",
      "Escolha a face do Fluxo Interrompido: Estagnação (toda magia lá dentro custa +1 PM por Bônus de Rank seu, e ninguém recupera PM) ou Fonte (você e seus aliados recuperam 1 PM por turno). Nunca as duas.",
    ],
    cost:
      "Barreiras distorcem mana, e aço não é mana. Contra o pilar do Corpo esta árvore quase não faz nada — um Deus da Espada atravessa a sua lei sem notar que ela existe.",
  },
  keyAttributeLabel: "Espírito",
  resourceLabel: "PM",
  tagline:
    "Anti-magia medida em regras, não em dano. Fraqueza estrutural: barreiras distorcem mana, e aço não é mana — quase nada contra o pilar do Corpo.",
  proficiencies: {
    armas: "Nenhuma além do padrão (armas simples, armadura leve).",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Escola Formal de Magia. Conjura com Espírito.",
  },
  grantedSkills: {
    fixed: ["Arcanismo"],
    choose: { count: 1, from: ["Religião", "Percepção", "Intuição"] },
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "O Primeiro Círculo",
        description:
          "[Selado / Fluxo Interrompido] Você desenha barreiras (1 Ação + PM da magia), esferas centradas num ponto à sua escolha. Sustenta uma por vez, aplicando Selado e a condição de Fluxo Interrompido que você escolher. Você vê mana: barreiras, encantamentos, itens mágicos e invisibilidade mágica aparecem como contorno luminoso, sem custo.",
      },
      talents: [
        { id: "reserva-do-selador", name: "Reserva do Selador", paCost: RANK_PA_COST.talent.Principiante, description: "+2 PM por patamar seu em Barreira. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela." , grants: { mpPerRank: 2 } },
        { id: "circulo-portatil", name: "Círculo Portátil", paCost: RANK_PA_COST.talent.Principiante, description: "Sua barreira passa a se mover com você, centrada no seu corpo, em vez de ficar fixa num ponto." },
        { id: "mao-de-giz", name: "Mão de Giz", paCost: RANK_PA_COST.talent.Principiante, description: "Você desenha círculos permanentes em superfícies. Leva 1 hora e o dobro do PM, mas a barreira fica lá depois que você for embora." },
      ],
      abilities: [
        {
          id: "circulo-menor",
          name: "Círculo Menor",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 3,
          range: "Esfera de 6m",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Barreira de 6m de raio por 1 minuto. Criaturas dentro ficam Seladas. Você escolhe Estagnação ou Fonte.",
          incantation: "Traço este círculo no ar e no chão ao mesmo tempo, e declaro que o que estiver dentro dele obedece a mim antes do mundo. Círculo Menor!",
        },
        {
          id: "recusa",
          name: "Recusa",
          reaction: true,
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 2,
          range: "18 metros",
          actions: { normal: 1 },
          effect: "1 Reação, quando uma criatura conjurar magia de rank Principiante: a magia falha e o PM se perde. Contra rank Intermediário, ainda acontece, mas com metade dos dados.",
          incantation:
            "Que a força do impacto encontre uma recusa absoluta no ar e não alcance o meu corpo por nada neste mundo. Recusa!",
        },
        {
          id: "selo-de-objeto",
          name: "Selo de Objeto",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 1,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Um objeto mágico, arma encantada ou item amaldiçoado fica inerte por 1 hora.",
          incantation:
            "Que este objeto fique trancado pela minha mana e ninguém consiga violar o seu conteúdo sem a minha palavra. Selo de Objeto!",
        },
        {
          id: "anteparo",
          name: "Anteparo",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 2,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Uma placa de mana de 3m × 3m por 3 turnos. Qualquer magia de rank Principiante que a atravesse é anulada; de rank Intermediário tem os dados reduzidos à metade.",
          incantation:
            "Ergue-te, escudo de força invisível, e bloqueia o projétil antes que ele toque as vestes dos meus companheiros. Anteparo!",
        },
        {
          id: "leitura-de-trama",
          name: "Leitura de Trama",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 1,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Você identifica exatamente qual magia está ativa numa criatura/objeto/local, de qual escola e rank, e quanto tempo falta. Revela armadilhas mágicas e barreiras alheias.",
          incantation:
            "Trama mágica que tece os feitiços do mundo, revela a mim as fraquezas e a natureza de cada barreira ao redor. Leitura de Trama!",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d6+3",
      mastery: {
        name: "Interdição",
        description:
          "Magias conjuradas dentro de uma barreira sua custam +2 PM para quem não for seu aliado. Você sustenta duas barreiras simultaneamente, e pode escolher até Espírito criaturas para quem a barreira simplesmente não se aplica.",
      },
      talents: [
        { id: "trama-fina", name: "Trama Fina", paCost: RANK_PA_COST.talent.Intermediário, description: "Sua Recusa passa a anular magias de rank Intermediário por completo." },
        { id: "barreira-persistente", name: "Barreira Persistente", paCost: RANK_PA_COST.talent.Intermediário, description: "Suas barreiras continuam de pé por 1 minuto depois de você ficar inconsciente ou sair do alcance." },
        { id: "peneira", name: "Peneira", paCost: RANK_PA_COST.talent.Intermediário, description: "Você declara uma escola de magia à qual a sua barreira não se aplica." },
      ],
      abilities: [
        {
          id: "domo",
          name: "Domo",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 5,
          range: "Esfera de 12m",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Barreira de 12m por 10 minutos. Além de Selado e Fluxo Interrompido, impede passagem de efeitos mágicos pela superfície nos dois sentidos. Criaturas e flechas atravessam normalmente.",
          incantation:
            "Domo translúcido que desce em esfera perfeita sobre o nosso grupo, fecha-te com força contra qualquer investida e protege-nos de tudo que vier de fora. Domo!",
        },
        {
          id: "amarra",
          name: "Amarra",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 4,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Teste de Espírito (CD 8 + BC). Falha: por 1 minuto, o alvo não pode conjurar magia alguma. Ele ainda pode andar, correr e bater.",
          incantation:
            "Mana que corre solta por este chão como se não devesse satisfação a ninguém, eu te amarro aqui, neste ponto exato do mundo e em nenhum outro, e te proíbo de seguir adiante sem a minha licença. Amarra!",
        },
        {
          id: "espelho-de-mana",
          name: "Espelho de Mana",
          reaction: true,
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 4,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 Reação. A próxima magia de alvo único de rank Intermediário ou inferior dirigida a você é devolvida ao conjurador, com a CD original dele.",
          incantation:
            "Espelho polido de mana que reflete o feitiço de volta ao seu criador, devolve o ataque com a mesma fúria com que ele foi disparado. Espelho de Mana!",
        },
        {
          id: "silencio-de-mana",
          name: "Silêncio de Mana",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 3,
          range: "Esfera de 9m",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Por 1 minuto, criaturas na área não conseguem iniciar conjuração — quem já estava recitando pode terminar.",
          incantation:
            "Que nenhuma centelha mágica consiga inflamar este espaço, silenciando o poder dos conjuradores enquanto eu sustentar este selo. Silêncio de Mana!",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Selo de Conjuração",
        description:
          "O Selado das suas barreiras impõe Desvantagem em testes de resistência contra as suas magias para quem está dentro. Criaturas dentro que tentarem conjurar acima do limite sofrem 2d10 de dano psíquico e perdem a Ação. Desbloqueia Magia Combinada.",
      },
      talents: [
        { id: "trama-densa", name: "Trama Densa", paCost: RANK_PA_COST.talent.Avançado, description: "Todas as suas barreiras ganham o dobro de PV." },
        { id: "selo-cirurgico", name: "Selo Cirúrgico", paCost: RANK_PA_COST.talent.Avançado, description: "Amarra deixa de permitir teste de resistência contra criaturas de rank inferior ao seu." },
        { id: "duas-maos-tres-circulos", name: "Duas Mãos, Três Círculos", paCost: RANK_PA_COST.talent.Avançado, description: "Você sustenta três barreiras simultaneamente." },
      ],
      abilities: [
        {
          id: "recinto",
          name: "Recinto",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 7,
          range: "Esfera de 18m",
          actions: MAGIC_ACTIONS.Avançado,
          effect:
            "Barreira de 18m por 1 hora. Impede entrada e saída física de criaturas: a superfície vira sólida para carne, mas continua atravessável por objetos inanimados. Tem 120 PV contra ataques físicos.",
          incantation:
            "Este espaço deixa de pertencer ao mundo lá fora e passa a pertencer a mim: eu desenho a parede que ninguém vê, fecho o teto que ninguém alcança, tranco a porta que ninguém encontrou, e declaro que daqui em diante a única lei válida aqui dentro é a minha. Recinto!",
        },
        {
          id: "dissipar",
          name: "Dissipar",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 6,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Encerre um efeito mágico ativo de rank Avançado ou inferior: magia sustentada, barreira alheia, encantamento, invocação, condição de origem mágica. Sem teste, sem disputa.",
          incantation:
            "Feitiço alheio que se apoia neste ar como se tivesse direito adquirido a ele: eu encontro o ponto exato em que a tua estrutura inteira se sustenta, encosto um dedo só nele, e retiro dali a única coisa que te mantinha de pé. O resto tu fazes sozinho. Dissipar!",
        },
        {
          id: "campo-nulo",
          name: "Campo Nulo",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 6,
          range: "Esfera de 12m",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Por 3 turnos, nenhuma magia funciona dentro da área, incluindo as suas. Sustentadas de fora são suspensas; invocações desaparecem; itens mágicos ficam inertes.",
          incantation:
            "Aqui a mana não corre, não sobe e não responde a quem a chamar pelo nome. Eu apago a corrente que atravessa este chão desde antes de qualquer um de nós, e deixo no lugar dela um silêncio que nenhum feitiço consegue atravessar sem primeiro morrer dentro dele. Campo Nulo!",
        },
        {
          id: "redoma",
          name: "Redoma",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 5,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Uma esfera de 1,5m encapsula uma criatura: totalmente isolada, não conjura. Tem 60 PV.",
          incantation:
            "Cúpula que eu ergo sem pedra, sem madeira e sem uma única mão além desta, fecha-te sobre nós como a casca se fecha sobre a semente que ainda não está pronta, e não deixes entrar nem o vento, nem a lâmina, nem a palavra de quem ficou do lado de fora. Redoma!",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Espaço Recusado",
        description:
          "Suas barreiras impedem teleporte, invocação, passagem dimensional e qualquer forma de aparecer/desaparecer na área. Você sustenta barreiras sem limite de distância, no mesmo continente. Você vê e lê qualquer barreira, encantamento ou selo do mundo apenas olhando.",
      },
      talents: [
        { id: "o-selo-nao-cede", name: "O Selo Não Cede", paCost: RANK_PA_COST.talent.Santo, description: "Suas barreiras não podem ser destruídas por Dissipar/Anulação de patamar inferior ao seu, e criaturas presas dentro não saem por meios mágicos de nenhum patamar." },
      ],
      abilities: [
        {
          id: "interdito",
          name: "Interdito",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Santo,
          pmCost: 12,
          range: "Esfera de 45m",
          actions: MAGIC_ACTIONS.Santo,
          effect:
            "Por 24 horas: ninguém conjura acima do rank Santo, ninguém recupera PM, ninguém teleporta, nenhuma invocação existe, e item mágico de rank Rei ou inferior fica inerte. Aliados designados ficam isentos.",
          incantation:
            "Eu não te ataco, não te firo e não encosto um dedo em ti. Eu apenas escrevo, na borda deste círculo e com a minha própria mana, uma frase curta que diz o que não pode acontecer aqui dentro — e a partir do instante em que a última letra secar, o mundo inteiro vai obedecer a essa frase antes de obedecer a ti ou a qualquer coisa que tenha existido antes de nós dois. Interdito!",
        },
        {
          id: "recusar-o-mundo",
          name: "Recusar o Mundo",
          reaction: true,
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 10,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 Reação. Anule completamente uma magia dirigida a você ou aliado a 18m, de rank Rei ou inferior, sem teste. Uma vez por combate. Contra Imperador, dano reduzido à metade sem condições.",
          incantation:
            "Existe uma diferença entre proibir e recusar: proibir é dizer não a quem tenta, e recusar é fazer com que a tentativa nunca tenha chegado a existir. Eu recuso este espaço ao que vem de fora. Recuso a passagem, recuso a chegada, recuso o convite que ninguém fez — e recuso, por último, até a lembrança de que houve um caminho até aqui. Recusar o Mundo!",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Anulação",
        description:
          "Gastando 1 Reação e 4 PM, você anula qualquer magia de rank Imperador ou inferior no instante em que é conjurada, dentro de 45 metros, sem teste. Um número de vezes por combate igual ao seu Espírito. O conjurador perde o PM e as Ações gastas.",
      },
      talents: [
        { id: "retorno", name: "Retorno", paCost: RANK_PA_COST.talent.Rei, description: "Quando você anular uma magia com Anulação, o conjurador sofre dano psíquico igual ao PM que gastou, e não pode reconjurar até o fim do combate." },
      ],
      abilities: [
        {
          id: "o-circulo-do-rei",
          name: "O Círculo do Rei",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 16,
          range: "Esfera de 300m",
          actions: MAGIC_ACTIONS.Rei,
          effect:
            "Por uma semana, a região obedece a três regras à sua escolha: nenhuma magia acima de um rank; ninguém recupera PM; nada teleporta/invoca/atravessa; um tipo de criatura não entra; nada morre aqui.",
          incantation:
            "Todo círculo que eu tracei até hoje foi um pedido educado feito ao mundo, e o mundo aceitou por gentileza. Este não é um pedido. Este é a linha que um rei desenha no chão da própria sala do trono, e do lado de dentro dela não existe magia que eu não tenha permitido, não existe passo que eu não tenha autorizado, e não existe nome — vivo, morto ou antigo demais pra ser dito em voz alta — grande o bastante pra atravessá-la sem a minha licença expressa. O Círculo do Rei!",
        },
        {
          id: "prisao-absoluta",
          name: "Prisão Absoluta",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 14,
          range: "45 metros",
          actions: MAGIC_ACTIONS.Rei,
          effect: "Teste de Espírito com Desvantagem (CD 8 + BC). Falha: selada numa redoma de 3m por 1 hora, isolada e sem agir. Criaturas de patamar igual ou superior ao seu repetem o teste ao fim de cada um dos seus turnos. Só libertável por você ou por Dissipar de rank Imperador.",
          incantation:
            "Não é uma parede, porque parede se derruba. Não é uma corrente, porque corrente se arrebenta. É uma regra, e regra é a única coisa neste mundo que não se quebra pelo lado de dentro. Eu escrevo aqui, em volta de ti, a lei de que sair daqui é uma coisa que simplesmente não acontece — e a partir deste instante o mundo vai concordar comigo em vez de concordar contigo, todas as vezes, sem exceção e sem recurso, até que eu decida apagar o que escrevi. Prisão Absoluta!",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d8+4",
      mastery: {
        name: "Lei Local",
        description:
          "O Selado das suas barreiras passa a valer contra todo rank, incluindo Deus. Ao erguer qualquer barreira, declare uma regra arbitrária proibitiva que passa a valer dentro dela. Uma vez por turno, erga ou desfaça uma barreira sem gastar Ação.",
      },
      talents: [
        { id: "barreira-viva", name: "Barreira Viva", paCost: RANK_PA_COST.talent.Imperador, description: "Suas barreiras persistem mesmo depois da sua morte, até serem dissipadas por um Imperador ou por rank Deus." },
      ],
      abilities: [
        {
          id: "mundo-fechado",
          name: "Mundo Fechado",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 24,
          range: "Esfera de 1,5 km",
          actions: MAGIC_ACTIONS.Imperador,
          effect:
            "Por 1 hora, dentro da esfera nenhuma magia de nenhum rank funciona para ninguém além de você e quem você designar. Invocações se desfazem, itens mágicos morrem, barreiras alheias caem, voo mágico cessa.",
          incantation: "Houve um tempo em que este espaço fazia parte do mundo: respondia às leis dele, recebia o vento dele e devolvia o som dele. Esse tempo termina exatamente agora, na última sílaba desta frase. Eu retiro este lugar do mundo. Retiro o caminho que levava até aqui, retiro a porta que havia no fim do caminho, retiro a lembrança de que houve uma porta, e retiro a mana que atravessava estas paredes há séculos sem nunca ter pedido licença a ninguém. Do lado de fora nada muda: o mundo continua girando como sempre girou, sem sequer notar o buraco que ficou. Do lado de dentro, só existe o que eu deixei existir. Mundo Fechado!",
        },
        {
          id: "selo-do-nome",
          name: "Selo do Nome",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 20,
          range: "Toque",
          actions: MAGIC_ACTIONS.Imperador,
          effect: "Você sela permanentemente uma única magia, técnica ou habilidade de uma criatura tocada. Ela nunca mais consegue usar aquilo, até um mago de Barreira de patamar igual ou superior desfazer.",
          incantation:
            "Toda coisa que existe carrega um nome verdadeiro, e é por esse nome que o mundo a reconhece, a sustenta e a autoriza a continuar sendo aquilo que ela é. Eu aprendi o teu. Não o que te deram no berço, nem o que gritam quando te temem de longe — o outro, aquele que já estava lá antes de qualquer um dos dois ser inventado. E agora eu o escrevo nesta borda com a minha própria mão, dobro-o sobre si mesmo até que ele não caiba mais em nenhuma boca, e o fecho. O mundo vai continuar sabendo que tu existes. Só vai deixar, a partir deste instante, de saber como te obedecer. Selo do Nome!",
        },
      ],
    },
  ],
};
