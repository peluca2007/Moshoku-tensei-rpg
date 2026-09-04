import { Tree } from "@/lib/types";
import { MAGIC_ACTIONS, RANK_PA_COST } from "./shared";

export const AGUA_TREE: Tree = {
  id: "agua",
  name: "Magia de Água",
  icon: "/arvores/agua.svg",
  category: "magia",
  subgroup: "Magia Ofensiva",
  mechanic: {
    tag: "Molhado → Congelado",
    hook:
      "A escola de dois tempos: ela molha para depois congelar, e todo o dano mora no segundo tempo.",
    loop: [
      "Molhe. Quase toda magia de Água aplica Molhado, e a Maestria de 1º patamar aplica de graça, uma vez por turno, sem Ação nem PM.",
      "Cobre. Contra alvo Molhado, todo dano de frio é DOBRADO e o alvo tem Desvantagem contra o seu gelo.",
      "Congele. Do Avançado em diante, qualquer magia de frio sua deixa Congelado quem estava Molhado e falhou: Deslocamento 0 até quebrar o gelo ou sofrer fogo.",
    ],
    cost:
      "Sozinha, tem o menor dano bruto das quatro ofensivas — o número só aparece depois do preparo. Contra imune a frio, metade da árvore desliga.",
  },
  keyAttributeLabel: "Intelecto",
  resourceLabel: "PM",
  tagline: "Atrição e controle de terreno — vence decidindo onde a luta acontece, não trocando golpes.",
  proficiencies: {
    armas: "Nenhuma além do padrão (armas simples, armadura leve).",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Escola Formal de Magia. Conjura com Intelecto (BC = Intelecto + Bônus de Rank).",
  },
  grantedSkills: {
    fixed: ["Arcanismo"],
    choose: { count: 1, from: ["Medicina", "Natureza", "Percepção"] },
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d4+1",
      mastery: {
        name: "Afinidade Aquática",
        description:
          "Cria, move, aquece levemente ou evapora até 20 litros de água limpa por minuto, sem gastar PM nem Ação. Não causa dano, mas serve pra tudo o mais: encher cantis, apagar fogueiras, limpar ferimentos, dar água a um cavalo. [Molhado] Sem PM e sem Ação, uma vez por turno, deixe Molhada uma criatura adjacente a você ou a qualquer água que você controle.",
      },
      talents: [
        {
          id: "condutor-de-gelo",
          name: "Condutor de Gelo",
          paCost: RANK_PA_COST.talent.Principiante,
          description: "Magias de gelo suas contra alvos Molhados impõem Desvantagem no teste de resistência.",
        },
        {
          id: "nascente-de-mana",
          name: "Nascente de Mana",
          paCost: RANK_PA_COST.talent.Principiante,
          description: "+2 PM por patamar seu em Água. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela.",
          grants: { mpPerRank: 2 },
        },
        {
          id: "mao-firme",
          name: "Mão Firme",
          paCost: RANK_PA_COST.talent.Principiante,
          description: "Você não sofre Desvantagem ao conjurar com um inimigo adjacente a você.",
        },
      ],
      abilities: [
        {
          id: "bola-de-agua",
          name: "Bola de Água",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 1,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "1d6 + BC (contundente)" },
          effect: "Ataque mágico à distância. O alvo é empurrado 1,5m e fica Molhado.",
          incantation:
            "Que a grande proteção da água esteja no lugar que buscas.\nEu clamo por um riacho refrescante e borbulhante, aqui e agora.\nBola de Água!",
        },
        {
          id: "flecha-de-agua",
          name: "Flecha de Água",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 1,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "1d8 + BC (perfurante)" },
          effect: "Ataque mágico à distância. Se acertar, o alvo fica Molhado. A magia comum que define um mago de Água.",
          incantation:
            "Água que flui sem nunca escolher caminho, escolhe um agora:\na linha reta entre mim e ele. Toma a forma da caçada.\nFlecha de Água!",
        },
        {
          id: "impacto-de-gelo",
          name: "Impacto de Gelo",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "1d4 contundente + 1d6 de frio (frio dobra contra Molhado)" },
          effect: "Teste de Resistência de Agilidade (CD 8 + BC). Falha: deslocamento reduzido em 3m até o fim do próximo turno.",
          incantation:
            "Coloco diante de ti um berço de gelo, como desejas.\nDeita-te e esquece o calor que te trouxe.\nImpacto de Gelo!",
        },
        {
          id: "lamina-de-gelo",
          name: "Lâmina de Gelo",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "1d8 + BC (cortante) + 1d4 de frio" },
          effect: "Cria uma arma de gelo por 1 minuto. Ataques com ela usam Força ou Intelecto, à sua escolha.",
          incantation:
            "Frio cortante do inverno, que racha a árvore em silêncio:\nvem à minha mão e esculpe a arma que ceifará meus inimigos.\nLâmina de Gelo!",
        },
        {
          id: "escudo-de-agua",
          name: "Escudo de Água",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "6 metros",
          actions: MAGIC_ACTIONS.Principiante,
          effect:
            "Barreira de água de 3m de largura por 2 turnos. Aliados atrás recebem Cobertura Superior (+5 CA) contra ataques físicos e projéteis. Dano ígneo que a atravessa é reduzido à metade.",
          incantation:
            "Espírito das correntes que dorme sob toda pedra,\nergue-te da terra e faz de ti a muralha que me protege do calor.\nEscudo de Água!",
        },
        {
          id: "nevoa-densa",
          name: "Névoa Densa",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 1,
          range: "Esfera de 6 metros",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Área fortemente obscurecida por 5 minutos (efetivamente cega quem está dentro). Vento forte dissipa em 1 turno.",
          incantation:
            "Respiração fria da manhã, que apaga o vale antes do sol subir:\ndesce sobre eles e rouba-lhes a visão do mundo.\nNévoa Densa!",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d4+2",
      mastery: {
        name: "Cântico Fluido",
        description:
          "Suas magias de Rank Principiante não sofrem mais penalidade na versão Encurtada — dano cheio, área cheia. Falhas críticas em magias de Principiante apenas falham em silêncio.",
      },
      talents: [
        {
          id: "fluidez-defensiva",
          name: "Fluidez Defensiva",
          paCost: RANK_PA_COST.talent.Intermediário,
          description: "1 Ação e 2 PM: você desliza 4,5m em qualquer direção sobre água conjurada, sem provocar ataques de oportunidade.",
        },
        {
          id: "pressao-profunda",
          name: "Pressão Profunda",
          paCost: RANK_PA_COST.talent.Intermediário,
          description: "Magias que empurram agora empurram o dobro da distância. Colisão com obstáculo causa +1d6 contundente.",
        },
        {
          id: "cristalizacao-rapida",
          name: "Cristalização Rápida",
          paCost: RANK_PA_COST.talent.Intermediário,
          description: "Uma vez por combate, aplique Congelado a um alvo já Molhado sem conjurar magia — apenas 1 Ação e 2 PM.",
        },
      ],
      abilities: [
        {
          id: "canhao-de-agua",
          name: "Canhão de Água",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "Linha de 18m × 1,5m",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "3d6 + BC (contundente)" },
          effect: "Teste de Resistência de Força (CD 8 + BC). Falha: empurradas 4,5m e ficam Molhadas. Sucesso: metade do dano, mas ficam Molhadas mesmo assim.",
          incantation:
            "Flexível espírito da água, que cedes a tudo e não cedes a nada:\nreúne num só ponto o que sempre esteve espalhado.\nVarre com teu poder oculto tudo o que houver diante de mim.\nCanhão de Água!",
        },
        {
          id: "lanca-de-gelo",
          name: "Lança de Gelo",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 3,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "2d8 + BC (perfurante) + 1d8 de frio (dobra contra Molhado)" },
          effect: "Ataque mágico à distância. Se acertar, o alvo fica Molhado pelo degelo do impacto. A magia que consagra um Intermediário.",
          incantation:
            "Águas eternas, que aprendestes a dureza com a montanha:\ncondensai-vos na haste que atravessa a armadura e o osso.\nNão vos peço força. Peço a ponta.\nLança de Gelo!",
        },
        {
          id: "pilar-de-gelo",
          name: "Pilar de Gelo",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "2d6 + BC (contundente)" },
          effect:
            "Coluna de 1,5m de raio e 3m de altura. Teste de Agilidade (CD 8 + BC): falha sofre o dano e é arremessado ao topo. Dura 10 minutos e concede Cobertura Superior.",
          incantation:
            "Águas adormecidas sob a terra, que ninguém vê e todos pisam: acordai de uma só vez, endurecei no caminho, e erguei-vos para os céus levando convosco o que estiver em cima. Pilar de Gelo!",
        },
        {
          id: "respingos-de-agua",
          name: "Respingos de Água",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 2,
          range: "Esfera de 9m de raio",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Sem dano. Toda criatura na área fica Molhada, sem teste de resistência. O chão vira terreno difícil por 1 minuto.",
          incantation:
            "Gotas que caem sem ordem e sem pressa, eu vos dou as duas:\nespalhai-vos por tudo, entrai em cada dobra,\ne que nada aqui continue seco quando eu calar.\nRespingos de Água!",
        },
        {
          id: "enxurrada",
          name: "Enxurrada",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "Cone de 9 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "2d6 + BC (contundente)" },
          effect: "Teste de Resistência de Força (CD 8 + BC). Falha: empurrão de 4,5m, Caído e Molhado. Sucesso: metade do dano, Molhado.",
          incantation:
            "Correnteza que arranca a montanha um punhado por século,\nhoje te dou pressa: faz num instante o que farias em mil anos.\nDesce sobre eles, arranca-lhes o chão, e leva tudo contigo.\nEnxurrada!",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Termodinâmica Aplicada",
        description:
          "Você troca livremente o dano de frio das suas magias por contundente (água pressurizada) ou ígneo (vapor), sem alterar os dados. [Congelado] O pagamento da escola, agora como regra geral: QUALQUER magia de frio sua que force teste de resistência deixa Congelado quem já estava Molhado e falhou no teste. Molhado é o preparo; Congelado é a cobrança. Desbloqueia o direito de aprender e executar Magias Combinadas (Cap. 2).",
      },
      talents: [
        { id: "zero-perfurante", name: "Zero Perfurante", paCost: RANK_PA_COST.talent.Avançado, description: "Seu gelo ignora Resistência a dano de frio." },
        {
          id: "mestre-da-adaptacao",
          name: "Mestre da Adaptação",
          paCost: RANK_PA_COST.talent.Avançado,
          description: "Suas magias Encurtadas de Água não perdem mais dados de dano, apenas a redução de área.",
        },
        {
          id: "nucleo-gelido",
          name: "Núcleo Gélido",
          paCost: RANK_PA_COST.talent.Avançado,
          description: "Você é imune a dano de frio não-mágico e não sofre penalidades de clima gelado.",
        },
      ],
      abilities: [
        {
          id: "quebra-de-gelo",
          name: "Quebra de Gelo",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 4,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "3d8 + BC (perfurante) + 2d6 de frio (dobra contra Molhado)" },
          effect: "Ataque mágico à distância. Contra objetos e estruturas, o dano é dobrado.",
          incantation:
            "Magníficos espíritos da água, senhores do que congela e do que racha:\nolhai o insolente que ousou ficar de pé diante de mim.\nErguei contra ele a vossa majestosa espada de gelo,\ne não a useis para cortar — usai-a para estilhaçar.\nQuebra de Gelo!",
        },
        {
          id: "corte-de-gelo",
          name: "Corte de Gelo",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 4,
          range: "Linha de 18 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "3d8 + BC (cortante) + 1d6 de frio" },
          effect: "Teste de Resistência de Agilidade (CD 8 + BC) para cada criatura na linha. Falha: dano cheio. Sucesso: metade.",
          incantation:
            "Frio implacável, que não odeia ninguém e mata todo mundo:\ntoma a forma da execução perfeita, a que não precisa de segunda tentativa.\nEu te convoco não para ferir, não para assustar,\nmas para abater e fatiar aquilo que se move à minha frente.\nCorte de Gelo!",
        },
        {
          id: "campo-de-gelo",
          name: "Campo de Gelo",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 4,
          range: "Esfera de 9m de raio",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "2d8 de frio (dobra contra Molhado)" },
          effect: "Teste de Resistência de Vigor (CD 8 + BC). Falha: deslocamento reduzido a 0 até o fim do próximo turno (e Congelado, pela Maestria Termodinâmica Aplicada, se o alvo já estava Molhado).",
          incantation:
            "Deusa Azul que desce dos céus quando a estação vira,\ne diante de quem o rio para no meio do próprio gesto:\nempunha o teu cajado e toca este solo uma única vez.\nQue a geada suba pelas pernas de quem estiver aqui,\ne que este mundo maldito aprenda a ficar parado.\nCampo de Gelo!",
        },
        {
          id: "nevasca",
          name: "Nevasca",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 5,
          range: "Explosão de 9m centrada em você",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "2d6 perfurante + 3d6 de frio + BC (dobra contra Molhado)" },
          effect: "Teste de Resistência de Agilidade (CD 8 + BC). Falha: dano cheio e arremessadas 3m. Sucesso: metade e não empurradas. Você não é afetado.",
          incantation:
            "Soberano envolto em branco absoluto, que não caminha e mesmo assim chega,\ncujo frio rouba o calor da pele, do sangue e por fim da vontade:\neu te dou este campo inteiro como trono.\nGira ao meu redor e congela os que ousaram se aproximar.\nNevasca!",
        },
        {
          id: "tempestade",
          name: "Tempestade",
          paCost: 4,
          pmCost: 5,
          range: "Raio de 1 km",
          actions: { normal: 5, encurtada: 4, silenciosa: 3 },
          costNote:
            "4 PA (o dobro do Avançado comum, mais que a maioria das magias Santo) e 5 Ações em vez de 3. Nenhuma magia de dano do livro decide um combate antes dele começar; esta decide. Um raio de 1 km com magia de Fogo até Intermediário desligada ao ar livre não é vantagem tática, é remover uma escola inteira do campo — e ainda mantém o grupo adversário Molhado, que é o gatilho de metade da árvore de Água. Custa caro pra aprender porque muda a guerra, e leva quase dois turnos porque clima não se convoca num estalo: a frente fria precisa chegar.",
          effect:
            "Chuva pesada por 1 hora. Todos sob ela mantêm Molhado permanentemente. Visibilidade reduzida à metade. Fogueiras e magia de fogo rank Intermediário ou inferior não funcionam ao ar livre.",
          incantation:
            "Nuvens carregadas que viajais pelos ventos uivantes,\nvós que atravessais reinos sem pedir passagem a rei nenhum:\nparai sobre a minha cabeça. Ficai. Eu vos dou motivo.\nDerramai-vos até que o fogo não tenha onde nascer.\nLavai o mundo!\nTempestade!",
        },
        {
          id: "fortaleza-de-gelo",
          name: "Fortaleza de Gelo",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 5,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Muralha ou domo com 80 PV (Cobertura Total). Se conjurada como Reação em Silenciosa, surge com apenas 30 PV. Dura 10 minutos.",
          incantation:
            "Guardião das geleiras eternas, que guardas o silêncio há mais tempo do que existem nomes:\nergue-te das profundezas onde nada te alcança e vem até onde tudo alcança.\nPõe-te entre mim e o que vem aí.\nSê o escudo intransponível, e não cedas antes de mim.\nFortaleza de Gelo!",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d6+3",
      mastery: {
        name: "Domínio Climático",
        description:
          "Você é imune aos danos e efeitos colaterais das suas próprias magias de área e de clima, e pode poupar um número de aliados igual ao seu Espírito. Enxerga perfeitamente através de chuva, névoa e nevasca, e mantém uma magia de clima ativa sem gastar concentração nem Ações.",
      },
      talents: [
        {
          id: "olho-da-tempestade",
          name: "Olho da Tempestade",
          paCost: RANK_PA_COST.talent.Santo,
          description: "Você mantém duas magias de clima simultaneamente, e o custo em PM de qualquer magia de clima da escola é reduzido à metade.",
        },
      ],
      abilities: [
        {
          id: "cumulonimbus",
          name: "Cumulonimbus",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Santo,
          pmCost: 10,
          range: "Raio de 1,5 km",
          actions: MAGIC_ACTIONS.Santo,
          effect:
            "A nuvem paira por 1 minuto. Todos na área ficam Molhados incondicionalmente. Enquanto ativa, gastando 1 Ação e 2 PM você castiga um alvo visível com um relâmpago: teste de Agilidade (CD 8 + BC) ou 4d10 de dano elétrico (metade se passar).",
          incantation:
            "Grande espírito da água, que enches o oceano e a lágrima com a mesma substância,\ne tu, príncipe do relâmpago, que ascendes sem olhar para baixo:\neu vos chamo juntos, para que vos encontreis sobre mim.\nErguei a torre de nuvem até onde o ar não sustenta pássaro nenhum.\nConcedei o meu desejo e trazei uma bênção selvagem.\nCumulonimbus!",
        },
        {
          id: "prisao-de-gelo-eterno",
          name: "Prisão de Gelo Eterno",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 8,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Santo,
          damage: { normal: "4d8 de frio ao falhar (dobra contra Molhado)" },
          effect:
            "Teste de Resistência de Vigor (CD 8 + BC), com Desvantagem se Molhado. Falha: Paralisado em animação suspensa por até 1 hora, imune a dano. Dano ígneo aplicado ao bloco concede novo teste.",
          incantation:
            "Coração parado do inverno profundo, que não bates e por isso não cansas:\nabre-te uma vez só e recebe o que eu te entrego.\nNão te peço que o mates — a morte é curta demais para o que ele fez.\nToma esta alma com o gesto que ela começou e não vai terminar,\ne guarda-a onde o tempo não alcança.\nFecha-te. E esquece a chave.\nPrisão de Gelo Eterno!",
        },
        {
          id: "maremoto",
          name: "Maremoto",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 9,
          range: "Linha de 45m × 9m",
          actions: MAGIC_ACTIONS.Santo,
          damage: { normal: "8d8 + BC (contundente)" },
          effect:
            "Teste de Resistência de Força (CD 8 + BC). Falha: dano cheio, arrastadas 9m, Caídas e Molhadas. Sucesso: metade, sem arrasto. Estruturas de madeira sofrem dano dobrado.",
          incantation:
            "Mar que engoliu continentes antes que houvesse quem lhes desse nome,\ntu que recuaste por vontade própria e deixaste os homens construírem na tua memória:\neles esqueceram. Eu não.\nLembra-te do que és, lembra-te de onde chegava a tua margem,\ne vem, sem pressa e sem raiva, apenas com todo o teu peso,\nreivindicar esta terra que sempre foi tua.\nMaremoto!",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Condutividade",
        description:
          "A escola de Água passa a incluir o elemento Eletricidade. Todo dano elétrico que você causar a um alvo Molhado impõe Desvantagem no teste de resistência dele; se tirar 5 ou menos, fica Atordoado por 1 turno.",
      },
      talents: [
        {
          id: "soberania-eletrica",
          name: "Soberania Elétrica",
          paCost: RANK_PA_COST.talent.Rei,
          description: "O Atordoamento causado pela Maestria Condutividade dura 2 turnos e se estende a todas as criaturas adjacentes ao alvo original.",
        },
      ],
      abilities: [
        {
          id: "relampago",
          name: "Relâmpago",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 14,
          range: "Alcance ilimitado (linha de visão)",
          actions: { normal: 4, encurtada: 3, silenciosa: 2 },
          costNote:
            "4 Ações em vez das 5 do rank Rei, e 14 PM em vez de 12. A magia não constrói nada: a nuvem já está no céu, paga e cantada em Cumulonimbus, e o que resta é apontar. Cobrar cinco Ações por um gesto que só fecha um circuito já montado era punir o mago duas vezes pela mesma tempestade. O PM extra é o preço da pressa — puxar o relâmpago antes que ele desça sozinho custa mais mana do que esperar.",
          damage: { normal: "8d10 + BC (elétrico)" },
          effect:
            "Pré-requisito: Cumulonimbus ativa acima de você. Ignora bônus de CA por Touki. Contra armadura metálica, acerto é Crítico automático. Contra alvo Molhado, dano dobrado.",
          incantation:
            "Ó espíritos das águas magníficas, que já me destes a nuvem e agora me deveis o resto:\neu não vos suplico mais. Eu cobro.\nPríncipe do Trovão, que dormes sobre a tempestade que eu mesmo ergui,\nabre um olho e olha para baixo — para aquele que continua de pé.\nEle crê que a altura o protege, que o metal o protege.\nDesce em linha reta, sem curva e sem trovão antes do clarão,\ne ensina ao insolente que o Imperador ainda reina supremo!\nRelâmpago!",
        },
        {
          id: "era-glacial",
          name: "Era Glacial",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 11,
          range: "Esfera de 30m",
          actions: MAGIC_ACTIONS.Rei,
          damage: { normal: "3d10 de frio (sem teste, a quem começar o turno dentro)" },
          effect:
            "A área vira terreno congelado por 24 horas; deslocamento reduzido à metade dentro dela. Corpos d'água congelam sólidos e viram terreno transitável.",
          incantation:
            "Estação que não pede permissão a lavrador nenhum,\ntu que chegas quando queres e ficas quanto entendes:\nnão te peço um inverno. Peço o primeiro deles,\naquele que veio antes de haver casa, celeiro ou colheita para perder.\nDesce sobre esta terra com a lentidão de quem tem todo o tempo,\nendurece o rio no meio da corrente, sela o lago por cima,\ne cobre sem pressa o que os homens construíram,\naté que a paisagem esqueça que alguém morou aqui.\nEra Glacial!",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d8+4",
      mastery: {
        name: "O Silêncio Primordial",
        description:
          "Seu dano de frio ignora completamente Resistência e Imunidade. Criaturas reduzidas a 0 PV pelas suas magias de gelo cristalizam em pó de diamante — não podem ser ressuscitadas por nada abaixo de rank Deus. Uma vez por turno, conjure uma magia de Água de rank Avançado ou inferior em Conjuração Silenciosa sem gastar Ação.",
      },
      talents: [
        {
          id: "essencia-do-inverno",
          name: "Essência do Inverno",
          paCost: RANK_PA_COST.talent.Imperador,
          description:
            "Seu dano de frio passa a ignorar também Invulnerabilidade e proteção mágica de rank inferior ao seu. Uma vez por Descanso Longo, conjure Zero Absoluto pagando metade do PM.",
        },
      ],
      abilities: [
        {
          id: "zero-absoluto",
          name: "Zero Absoluto",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 20,
          range: "Esfera de 45 metros",
          actions: MAGIC_ACTIONS.Imperador,
          damage: { normal: "12d12 de frio (24d12 contra alvo Molhado)" },
          effect:
            "Teste de Resistência de Vigor com Desvantagem Absoluta. Aliados são isolados magicamente e não sofrem efeito algum. Criaturas reduzidas a 0 PV são eternamente petrificadas — sem ressurreição, sem cura, sem corpo.",
          incantation:
            "Antes da primeira estrela decidir arder, havia isto:\nnenhum movimento, nenhum atrito, nenhuma pressa em coisa alguma.\nSilêncio primordial, anterior ao fogo e à palavra que o nomeou,\neu não te invoco como quem chama um servo. Eu te lembro.\nQue o vento pare no meio do sopro e fique ali, de pé, sem cair.\nQue a água esqueça como se corre e o sangue esqueça para onde ia.\nEu não peço frio — frio ainda é uma quantidade de calor,\ne eu vim tirar a última.\nQue o conceito de calor deixe de existir dentro deste círculo,\ne que o que restar seja pó de diamante, intacto e incapaz de voltar.\nZero Absoluto!",
        },
        {
          id: "diluvio",
          name: "Dilúvio",
          ritual: true,
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 18,
          range: "Raio de 3 km",
          actions: MAGIC_ACTIONS.Imperador,
          effect:
            "Efeito narrativo de escala regional. Todos na área permanecem Molhados por 3 dias, todo terreno vira difícil, magia de fogo de rank Santo ou inferior falha automaticamente ao ar livre, e qualquer exército em campo aberto perde suprimentos.",
          incantation:
            "Céus que testemunhastes a queda de três mundos e não chorastes por nenhum,\nvós que vistes erguerem-se torres, impérios e fronteiras,\ne vistes tudo isso ser corrigido pela mesma água, sempre a mesma:\neu não vos acuso de crueldade — apenas me lembro de como se limpa uma face.\nAbri-vos sobre esta região inteira, sobre campos, estradas e depósitos de grão.\nNão tenhais pressa. Caí devagar, e caí durante dias,\naté que o exército inteiro descubra que perdeu o chão, a comida e a vontade.\nAbri-vos, e não pareis.\nDilúvio!",
        },
      ],
    },
  ],
};
