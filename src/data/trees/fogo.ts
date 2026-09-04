import { Tree } from "@/lib/types";
import { MAGIC_ACTIONS, RANK_PA_COST } from "./shared";

export const FOGO_TREE: Tree = {
  id: "fogo",
  name: "Magia de Fogo",
  icon: "/arvores/fogo.svg",
  category: "magia",
  subgroup: "Magia Ofensiva",
  mechanic: {
    tag: "Em Chamas",
    hook:
      "A única escola ofensiva que não prepara nada: ela cobra na hora, e continua cobrando depois.",
    loop: [
      "Acerte. Quase toda magia de Fogo aplica Em Chamas junto com o dano — não há passo de montagem.",
      "Em Chamas cobra 1d6 no início de cada turno do alvo (1d8 a partir do Intermediário), sem você gastar Ação nem PM de novo.",
      "Toda magia de Fogo sua causa dano CHEIO contra quem já está Em Chamas: passar no teste de resistência não corta mais pela metade.",
    ],
    cost:
      "Não controla, não prende, não protege. Fogo não tem uma única magia que impeça alguém de chegar até você, e Molhado apaga o seu fogo em vez de acendê-lo.",
  },
  keyAttributeLabel: "Intelecto",
  resourceLabel: "PM",
  tagline: "Dano bruto e consequência — a única escola que destrói o que estava em volta.",
  proficiencies: {
    armas: "Nenhuma além do padrão (armas simples, armadura leve).",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Escola Formal de Magia. Conjura com Intelecto (BC = Intelecto + Bônus de Rank).",
  },
  grantedSkills: {
    fixed: ["Arcanismo"],
    choose: { count: 1, from: ["Ofícios", "Intimidação", "Atletismo"] },
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d4+1",
      mastery: {
        name: "Chama Viva",
        description:
          "Acende, apaga, aquece e controla qualquer chama já existente a até 9m, sem PM e sem Ação. Você é imune a dano ígneo não-mágico e não sofre penalidade de calor extremo. [Em Chamas] Fogo é a escola que não prepara nada: ela cobra na hora. Toda magia de Fogo sua rola o dano cheio contra alvo Em Chamas, sem metade em caso de sucesso no teste de resistência.",
      },
      talents: [
        {
          id: "pavio-curto",
          name: "Pavio Curto",
          paCost: RANK_PA_COST.talent.Principiante,
          description: "Magias suas que aplicam Em Chamas causam +2 de dano contra alvos que já estejam Em Chamas.",
        },
        {
          id: "folego-de-forja",
          name: "Fôlego de Forja",
          paCost: RANK_PA_COST.talent.Principiante,
          description: "+2 PM por patamar seu em Fogo. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela.",
          grants: { mpPerRank: 2 },
        },
        {
          id: "maos-de-ferreiro",
          name: "Mãos de Ferreiro",
          paCost: RANK_PA_COST.talent.Principiante,
          description: "Você trabalha metal, vidro e cerâmica sem forja, usando as próprias mãos.",
        },
      ],
      abilities: [
        {
          id: "bola-de-fogo",
          name: "Bola de Fogo",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 1,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "1d8 + BC (ígneo)" },
          effect: "Ataque mágico à distância. Se acertar, o alvo fica Em Chamas.",
          incantation:
            "Chama que dormes na pedra e na madeira, acorda na minha mão\ne vai até ele antes que ele perceba que já é tarde.\nBola de Fogo!",
        },
        {
          id: "fagulha",
          name: "Fagulha",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 1,
          range: "9 metros",
          actions: { normal: 1, encurtada: 1, silenciosa: 1 },
          costNote:
            "1 Ação em vez das 2 padrão do rank: não há dano, teste ou área pra construir — é um gesto de dedo estalando, não um feitiço em duas etapas. Cobrar 2 Ações por acender um pavio seria mais caro que o próprio incêndio que ele causa.",
          effect: "Sem dano direto. Um ponto de calor acende qualquer coisa inflamável que você consiga ver.",
          incantation:
            "Pequena chama, nasce na ponta do meu dedo, tímida como fósforo riscado no vento.\nNão morras logo — só o suficiente pra pegar.\nFagulha!",
        },
        {
          id: "toque-escaldante",
          name: "Toque Escaldante",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "2d6 + BC (ígneo)" },
          effect: "Ataque corpo a corpo mágico. Aplica Em Chamas. Se você estiver com metade ou menos dos PV, causa +1d6.",
          incantation:
            "Calor que mora na minha própria mão e não me queima,\npassa agora para a mão dele, que não vai gostar da visita.\nToque Escaldante!",
        },
        {
          id: "muro-de-chamas",
          name: "Muro de Chamas",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 3,
          range: "Linha de 9 metros",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "3d6 de dano ígneo a quem atravessa" },
          effect: "Parede de fogo de 3m de altura por 1 minuto. Atravessá-la aplica Em Chamas. Bloqueia visão e assusta animais.",
          incantation:
            "Linha que eu risco no chão, levanta-te em fogo e fica de pé.\nQue ninguém atravesse sem pagar o preço da travessia.\nMuro de Chamas!",
        },
        {
          id: "clarao",
          name: "Clarão",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 1,
          range: "Esfera de 6 metros",
          actions: { normal: 1, encurtada: 1, silenciosa: 1 },
          costNote:
            "1 Ação em vez de 2. Sem dado de dano, sem duração além de um turno — o efeito inteiro é um clarão e um teste, mais rápido de soltar do que de descrever. Manter no padrão de 2 Ações faria dela a magia menos eficiente do próprio rank em termos de Ação gasta por efeito entregue.",
          effect: "Teste de Resistência de Vigor (CD 8 + BC) ou o alvo fica Cego até o fim do próximo turno. Não causa dano nem incendeia nada.",
          incantation:
            "Luz que estoura antes mesmo de aquecer, mais rápida que o susto,\nrouba a visão de quem olhar direto pra ela.\nClarão!",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d4+1",
      mastery: {
        name: "Propagação",
        description:
          "A condição Em Chamas aplicada por você causa 1d8 em vez de 1d6. Uma vez por turno, sem gastar Ação, você faz o fogo de um alvo Em Chamas saltar para outra criatura a até 3m (teste de Agilidade CD 8 + BC ou também pega fogo).",
      },
      talents: [
        {
          id: "calor-dirigido",
          name: "Calor Dirigido",
          paCost: RANK_PA_COST.talent.Intermediário,
          description: "Você escolhe até Intelecto criaturas na área das suas magias de Fogo. Elas não são afetadas.",
        },
        {
          id: "combustao-lenta",
          name: "Combustão Lenta",
          paCost: RANK_PA_COST.talent.Intermediário,
          description: "Em Chamas aplicada por você não pode ser apagada gastando Ação — só com água, frio ou submersão.",
        },
        {
          id: "nada-sobra",
          name: "Nada Sobra",
          paCost: RANK_PA_COST.talent.Intermediário,
          description: "Suas magias causam dano dobrado contra objetos, estruturas, cordas, portas e barreiras não-mágicas.",
        },
      ],
      abilities: [
        {
          id: "lanca-de-fogo",
          name: "Lança de Fogo",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 3,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "3d8 + BC (ígneo, ignora Resistência); +2d8 contra alvo Em Chamas" },
          effect: "Ataque mágico à distância. Fogo comprimido em haste: não incendeia, perfura e sela a ferida no caminho.",
          incantation:
            "Calor branco que não conhece fumaça e não deixa cinza pra trás,\ntoma a forma da lança, a ponta primeiro e o resto depois,\ne atravessa o que estiver na frente sem parar pra queimar.\nLança de Fogo!",
        },
        {
          id: "explosao",
          name: "Explosão",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 4,
          range: "Esfera de 6 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "3d6 + BC de explosão (+3d6 contra alvos Em Chamas)" },
          effect: "Teste de Resistência de Agilidade (CD 8 + BC), metade se passar. Falha: arremessadas 3m.",
          incantation:
            "Ar que eu comprimo até doer nas minhas próprias mãos, solta-te tudo de uma vez.\nNão precisas queimar — apenas empurra com toda a força que eu te emprestei.\nExplosão!",
        },
        {
          id: "chuva-de-brasas",
          name: "Chuva de Brasas",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 3,
          range: "Esfera de 9m de raio",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Sem dano imediato. Teste de Agilidade (CD 8 + BC) ou Em Chamas. Inflamáveis na área acendem; terreno difícil por brasa acesa 1 minuto.",
          incantation:
            "Cinzas quentes que eu levanto do nada e jogo bem alto, acima de todo mundo,\ncaiam devagar, sem pressa nenhuma, sobre tudo o que puder pegar fogo.\nChuva de Brasas!",
        },
        {
          id: "sopro",
          name: "Sopro",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 3,
          range: "Cone de 9 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "2d10 + BC (ígneo)" },
          effect: "Teste de Agilidade para metade do dano. Em Chamas a quem falhar.",
          incantation:
            "Respiração que eu prendo até o peito doer, eu te solto agora inteira de uma vez,\num sopro só, quente como forja acesa há três dias, largo como um grito sem fim.\nSopro!",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Termodinâmica Inversa",
        description:
          "Você controla a temperatura dentro das suas áreas: pode poupar aliados/objetos, ou fazer o fogo queimar só um material escolhido. Desbloqueia o direito de combinar escolas (Magia Combinada, Cap. 2).",
      },
      talents: [
        { id: "coracao-de-brasa", name: "Coração de Brasa", paCost: RANK_PA_COST.talent.Avançado, description: "Você é imune a todo dano ígneo, mágico ou não, e à condição Em Chamas." },
        {
          id: "detonacao",
          name: "Detonação",
          paCost: RANK_PA_COST.talent.Avançado,
          description: "Uma vez por turno, sem gastar Ação, apague a condição Em Chamas de um alvo para causar imediatamente 3d8 de dano de explosão nele.",
        },
        {
          id: "cantico-de-cinzas",
          name: "Cântico de Cinzas",
          paCost: RANK_PA_COST.talent.Avançado,
          description: "Magias de Fogo de rank Intermediário ou inferior custam 1 PM a menos (mínimo 1).",
        },
      ],
      abilities: [
        {
          id: "tempestade-de-fogo",
          name: "Tempestade de Fogo",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 6,
          range: "Esfera de 12m de raio",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "6d8 + BC (ígneo)" },
          effect:
            "Teste de Agilidade (CD 8 + BC), metade se passar. Falha: Em Chamas. A área continua queimando 1 minuto: quem começar o turno dentro sofre +2d6.",
          incantation:
            "Vento que alimenta e chama que devora, girem juntos, um empurrando o outro,\ncada volta mais rápida que a anterior, cada rajada mais faminta,\naté que não reste ar para respirar nem nome pra lembrar deste lugar.\nTempestade de Fogo!",
        },
        {
          id: "coluna-solar",
          name: "Coluna Solar",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 5,
          range: "45 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "5d8 + BC (ígneo)" },
          effect: "Pilar de fogo de 3m de raio. Teste de Agilidade para metade, Em Chamas automático em falha. Ignora Cobertura que não seja um teto sólido.",
          incantation:
            "Sol que eu não posso trazer inteiro pra este lugar, mando um raio só teu,\nreto como julgamento, quente como o meio-dia sem sombra nenhuma pra esconder-se.\nDesce e não te desvies de nada que estiver no caminho.\nColuna Solar!",
        },
        {
          id: "vapor-seco",
          name: "Vapor Seco",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 4,
          range: "Esfera de 9m",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "4d8 de dano ígneo" },
          effect:
            "Requer 1 patamar em Vento (ou aliado mago de Vento conjurando junto). Teste de Vigor (CD 8 + BC): falha não fala nem recita cânticos por 2 turnos e fica Em Chamas por dentro (não abafável com 1 Ação).",
          incantation:
            "Ar que rouba a água antes que ela vire suor na pele de quem respira,\nentra pelos pulmões e queima por dentro, onde nenhuma armadura chega\ne nenhum escudo pensa em proteger, porque ninguém ergue escudo contra o próprio fôlego.\nVapor Seco!",
        },
        {
          id: "escudo-de-cinzas",
          name: "Escudo de Cinzas",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 4,
          range: "Pessoal",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "1 minuto: quem te atingir corpo a corpo sofre 2d6 ígneo e fica Em Chamas. Você recebe Resistência a dano físico de armas mundanas.",
          incantation:
            "Cinza que já foi fogo e ainda lembra de arder debaixo da camada fria,\nveste-te em mim como uma segunda pele que ninguém vê até tocar,\ne cobra de quem me tocar o preço inteiro de ter me tocado.\nEscudo de Cinzas!",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Domínio da Combustão",
        description:
          "Suas magias de Fogo ignoram Resistência a dano ígneo e de explosão. Você pode conjurar qualquer magia de Fogo de rank Avançado ou inferior com metade da área pelo dobro do dano, ou o inverso. Fogo aceso por você não se apaga enquanto você quiser.",
      },
      talents: [
        {
          id: "segunda-ignicao",
          name: "Segunda Ignição",
          paCost: RANK_PA_COST.talent.Santo,
          description: "Uma vez por combate, ao conjurar magia de Fogo de rank Avançado ou inferior, conjure-a duas vezes pagando o PM uma vez; a segunda pode ter alvo diferente.",
        },
      ],
      abilities: [
        {
          id: "mar-de-chamas",
          name: "Mar de Chamas",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Santo,
          pmCost: 12,
          range: "Raio de 60m",
          actions: MAGIC_ACTIONS.Santo,
          damage: { normal: "10d8 + BC (ígneo)" },
          effect: "Teste de Agilidade com Desvantagem. Falha: dano cheio e Em Chamas. Sucesso: metade. Aliados só são poupados pelo talento Calor Dirigido. Área continua em chamas por 10 minutos.",
          incantation:
            "Que o chão lembre do dia em que foi lava, muito antes de aprender a ser pedra,\nmuito antes de alguém plantar em cima e chamar aquilo de terra firme.\nEu não crio o fogo. Eu só devolvo a memória que ele tinha antes de esfriar.\nAcorda, chão. Lembra do que eras antes de qualquer coisa ter nome.\nQue nada aqui volte a ter nome quando eu terminar de falar.\nMar de Chamas!",
        },
        {
          id: "corpo-de-fogo",
          name: "Corpo de Fogo",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 8,
          range: "Pessoal",
          actions: MAGIC_ACTIONS.Santo,
          damage: { normal: "3d6 de dano ígneo a quem tocar" },
          effect: "1 minuto: Resistência a todo dano físico, atravessa frestas, ignora terreno difícil. Não pode usar itens, empunhar armas nem ser curado.",
          incantation:
            "Eu deixo de ser carne por um instante inteiro e viro só a chama que a carne guardava por dentro.\nQue a lâmina passe através de mim como passa através da fumaça de uma fogueira apagada,\ne que quem me tocar aprenda, tarde demais e com a mão em chamas,\nque eu não estava mais lá quando ele decidiu tocar.\nCorpo de Fogo!",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Plasma",
        description:
          "Você conjura dano de plasma, que ignora Resistência e Imunidade a dano ígneo e derrete metal, pedra e Touki com igual indiferença. Dano de plasma reduz permanentemente em 2 a CA de armadura não-mágica atingida, cumulativamente.",
      },
      talents: [
        {
          id: "ponto-de-fusao",
          name: "Ponto de Fusão",
          paCost: RANK_PA_COST.talent.Rei,
          description: "Seu dano de plasma passa a ignorar também barreiras mágicas com PV — ele fura, em vez de gastar.",
        },
      ],
      abilities: [
        {
          id: "flashover",
          name: "Flashover",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 14,
          range: "Raio de 90m",
          actions: MAGIC_ACTIONS.Rei,
          damage: { normal: "12d10 + BC (ígneo, d12 contra alvo já Em Chamas)" },
          effect: "Teste de Vigor com Desvantagem (exceto submersos/barreira/clima chuvoso). Falha: dano cheio e Em Chamas incombatível. Sucesso: metade.",
          incantation:
            "Eu não peço chama. Chama é fraca demais pro que eu quero de você.\nPeço o instante exato em que tudo o que respira, em toda esta região ao meu redor,\ndescobre, tarde demais, que já estava queimando por dentro há vários segundos —\nque o fogo não chegou agora, chegou antes, entrou em silêncio, e só agora se anuncia.\nNão há aviso, porque não sobrou tempo pra aviso nenhum a ninguém.\nFlashover!",
        },
        {
          id: "lanca-de-plasma",
          name: "Lança de Plasma",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 13,
          range: "45 metros",
          actions: { normal: 3, encurtada: 2, silenciosa: 1 },
          costNote:
            "3 Ações em vez das 5 do rank Rei, e 13 PM em vez de 10. É a magia de ataque único mais direta do rank — sem área, sem clima, sem preparo — e um mago Rei que já domina Plasma não precisa do cântico inteiro pra formar uma linha reta. A rapidez sai do bolso do PM: tira o fôlego mais do que a versão lenta tiraria. Por isso o encantamento também foge do piso de tamanho do rank Rei: é a única magia do livro cuja brevidade É o efeito — cantar mais devagar do que isto anularia a Ação que ela custou pra ser rápida.",
          damage: { normal: "8d8 + BC (plasma)" },
          effect: "Ataque mágico à distância. Atravessa o alvo em linha reta e atinge tudo atrás por mais 15m com metade do dano.",
          incantation:
            "Ponta.\nFura!",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "A Segunda Estrela",
        description:
          "Suas magias de Fogo e plasma não podem ser aparadas, refletidas, absorvidas nem redirecionadas por rank inferior ao seu. Criaturas reduzidas a 0 PV são reduzidas a cinza — sem ressurreição abaixo de rank Deus. Uma vez por turno, conjure magia de Fogo Avançado ou inferior em Silenciosa sem gastar Ação.",
      },
      talents: [
        {
          id: "a-chama-que-escolhe",
          name: "A Chama Que Escolhe",
          paCost: RANK_PA_COST.talent.Imperador,
          description: "Você poupa automaticamente um número de criaturas igual ao seu Espírito em qualquer magia sua, incluindo o Sol Menor.",
        },
      ],
      abilities: [
        {
          id: "sol-menor",
          name: "Sol Menor",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 22,
          range: "Esfera de 30m",
          actions: MAGIC_ACTIONS.Imperador,
          damage: { normal: "14d12 de plasma (20d12 contra alvos Em Chamas)" },
          effect:
            "Teste de Vigor com Desvantagem Absoluta. Aliados não são poupados automaticamente. Construções, terreno e cadáveres na área deixam de existir; a cratera é permanente.",
          incantation:
            "Eu junto tudo o que o fogo seria em mil anos de fome lenta,\ntoda a lenha que ele nunca teve, toda a floresta que ele sonhou consumir e nunca alcançou,\ne devolvo isso em um único segundo, aqui, sobre estas cabeças que não sabem o que vem.\nQue o céu abaixe até o chão, e que o chão suba até não haver mais diferença entre os dois,\naté que ninguém mais consiga dizer onde terminava o mundo e onde começava o fogo.\nEu não trago um sol. Eu trago o que resta depois que um sol termina de existir.\nSol Menor!",
        },
        {
          id: "nunca-apaga",
          name: "Nunca Apaga",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 16,
          range: "Raio de 1 km",
          actions: MAGIC_ACTIONS.Imperador,
          effect: "A região pega fogo e continua pegando fogo por três dias, sem combustível, ignorando chuva de rank Santo ou inferior. Rotas fecham, cidades evacuam.",
          incantation:
            "Eu não acendo fogueira nenhuma. Eu ensino ao fogo que ele não precisa mais de lenha,\nnem de vento, nem da minha permissão pra continuar depois que eu já tiver ido embora.\nQue ele queime porque decidiu queimar, e não porque alguma coisa ainda o alimenta.\nQue a chuva caia sobre ele, dia após dia, noite após noite, e pergunte por que não apaga nada, e não receba resposta nenhuma além do próprio crepitar.\nPor três dias inteiros, que ninguém aqui se lembre de como era o silêncio antes disto começar.\nNunca Apaga!",
        },
      ],
    },
  ],
};
