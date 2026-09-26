import { Tree } from "@/lib/types";

export const SUISHIN_TREE: Tree = {
  id: "deus-da-agua-corpo",
  name: "Estilo Deus da Água",
  icon: "/arvores/deus-da-agua-corpo.svg",
  category: "corpo",
  subgroup: "Espadachim",
  mechanic: {
    tag: "Contra-ataque",
    hook:
      "Você não abre a luta. Você cobra por ela — e é o único estilo que mantém outras pessoas vivas.",
    loop: [
      "Deixe vir. Quando uma criatura adjacente ERRA um ataque corpo a corpo contra você, o Fluxo dispara: contra-ataque imediato com dano de arma normal, sem gastar PT nem Reação.",
      "Suba a CA e a chance de errar. Aparar, postura e escudo leve existem pra transformar acerto em erro — cada erro do inimigo vira dano seu.",
      "Estenda. Do Avançado em diante o contra-ataque cobre quem está ao seu lado, não só você.",
    ],
    cost:
      "Contra quem não ataca, você não faz nada. É o mais fraco dos três estilos numa luta de iniciativa pura, e o único que precisa que o inimigo coopere.",
  },
  // Agilidade, e não Vigor (correção do autor, 0.1.83). O Suishin-ryū não
  // vende aguentar o golpe: vende LER o golpe e chegar meio segundo antes dele.
  // Aparar, postura e contragolpe são todos timing, e timing é Agilidade. O
  // Vigor que estava aqui fazia a árvore de contra-ataque rolar com o atributo
  // do tanque, e ainda punha o Suishin na mesma frase que Escudos no Cap. 1.
  keyAttributeLabel: "Agilidade",
  resourceLabel: "PT",
  tagline:
    "Aparar e devolver. Considerado o mais fraco dos três estilos porque um Deus da Água que enfrenta quem não ataca não faz nada — mas é o único que mantém outras pessoas vivas. Sem relação com a Magia de Água — chamado Suishin-ryū nas referências cruzadas.",
  proficiencies: {
    armas: "Grupos Espadas e Escudos. Proficiência com armadura leve e média; pesada via 'Peso Não Atrapalha'.",
    gruposDeArma: ["espadas", "escudos"],
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Escola Formal do Corpo.",
  },
  grantedSkills: {
    fixed: ["Intuição", "Percepção"],
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d8+3",
      weaponDieSteps: 1,
      mastery: {
        name: "Fluxo",
        description:
          "[Contra-ataque] Quando uma criatura adjacente erra um ataque corpo a corpo contra você, você contra-ataca imediatamente com dano de arma normal, sem custo de PT. O Fluxo NÃO gasta Reação: ele tem o próprio limite por rodada (1 no Principiante, 2 no Intermediário; a Maré de Retorno e o Domínio Absoluto sobem esse teto) e é um ataque corpo a corpo comum, com rolagem de acerto. É toda a identidade da escola: você não abre a luta, você cobra por ela.",
      },
      talents: [
        { id: "casco-de-tartaruga", name: "Casco de Tartaruga", paCost: 1, description: "+4 PV por patamar seu nesta árvore. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela." , grants: { hpPerRank: 4 } },
        { id: "olho-na-mao", name: "Olho na Mão", paCost: 1, description: "Vantagem em Intuição para prever a próxima ação de uma criatura; o Mestre é obrigado a dar uma dica honesta." },
        { id: "paciencia-de-pedra", name: "Paciência de Pedra", paCost: 1, description: "Você é imune a Amedrontado e a efeitos que forcem você a agir contra a vontade. Provocação não funciona em você." },
      ],
      abilities: [
        {
          id: "aparar",
          name: "Aparar",
          signature: true,
          reaction: true,
          paCost: 2,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          effect:
            "1 Reação, quando alvo de ataque corpo a corpo: some seu Bônus de Rank à CA contra aquele ataque, resolvido depois de ver a rolagem. ESTE bônus soma com qualquer outro bônus de CA, inclusive o da Postura de Água e o do Manto de Touki — é a única exceção nomeada à regra de empilhamento do Cap. 4, §5, e existe porque sem ela o Aparar somava exatamente ZERO dentro da Postura, que é o modo que a árvore inteira monta. Se com isso o ataque errar, o Fluxo dispara normalmente (o Aparar gasta a Reação; o Fluxo, nunca).",
        },
        {
          id: "guarda-do-corpo",
          name: "Guarda do Corpo",
          reaction: true,
          paCost: 1,
          range: "1,5 metros",
          actions: { normal: 1 },
          effect: "1 Reação: quando aliado a até 1,5m for alvo de ataque, você vira o alvo. Aplique sua CA — se o ataque errar, o Fluxo dispara.",
        },
        {
          id: "peso-nao-atrapalha",
          name: "Peso Não Atrapalha",
          paCost: 1,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Proficiência em armadura pesada desde o Principiante. Vestida, ela não te dá Desvantagem em Furtividade (o resto do preço da pesada, não somar Agilidade na CA, continua), e você dorme com ela sem prejuízo.",
        },
        {
          id: "provocar",
          name: "Provocar",
          paCost: 1,
          range: "Visão e audição",
          actions: { normal: 1 },
          effect: "1 Ação, uma vez por turno. Teste de Espírito (CD 8 + Espírito + Rank). Se falhar, no próximo turno o alvo tem que atacar você se conseguir alcançá-lo. É o que dá ao Suishin uma decisão no PRÓPRIO turno: a árvore cobra por ser atacada, então convidar o golpe é a jogada, não esperar por ela. No rank Rei, a Maestria 'A Arte da Provocação' torna esta habilidade gratuita (sem gastar Ação) e quem falhar ataca com Desvantagem.",
        },
        {
          id: "base-firme",
          name: "Base Firme",
          paCost: 1,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Você não pode ser movido contra a vontade, derrubado ou empurrado por nada que permita teste de Força ou Agilidade.",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d8+3",
      weaponDieSteps: 1,
      mastery: {
        name: "A Armadura Não Pesa",
        description:
          "Usando armadura pesada, +1 na CA além do valor normal. O seu Fluxo passa a disparar duas vezes por rodada.",
      },
      talents: [
        { id: "guarda-longa", name: "Guarda Longa", paCost: 1, description: "Seu alcance de Reação corpo a corpo aumenta para 3 metros." },
        { id: "aco-calmo", name: "Aço Calmo", paCost: 1, description: "+1 PT por patamar seu no Estilo Deus da Água. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nele.", grants: { ptPerRank: 1 } },
        {
          id: "nome-de-reidar",
          name: "Nome de Reidar",
          paCost: 1,
          // 2026-09-05: era só sabor (nenhum efeito jogável) — o único talento
          // do livro que não fazia nada além de decorar a ficha. O gancho
          // mecânico entra no mesmo tamanho de "Homem Dentro" (Ladino, Santo):
          // um favor pontual, uma vez por sessão, não um recurso de combate.
          description:
            "Seu cônjuge abandonou a própria casa pra estar com você — costume herdado da princesa. Você tem uma pessoa de lealdade absoluta no mundo: ela guarda seus segredos e cuida do que você deixa pra trás. Uma vez por sessão, ela resolve por você um problema logístico pequeno enquanto você está fora (abrigo, provisão, uma mensagem entregue).",
        },
      ],
      abilities: [
        {
          id: "devolver",
          name: "Devolver",
          signature: true,
          paCost: 2,
          ptCost: 1,
          range: "Contra-ataque de Fluxo",
          actions: { normal: 0 },
          damage: { normal: "Dano de arma + metade do dano que o ataque causaria" },
          effect: "Quando o Fluxo disparar, pague 1 PT: aquele contra-ataque soma metade do dano que o ataque inimigo causaria. Não gasta Reação e não é um golpe a mais: você devolve o golpe dele com a força dele somada à sua.",
        },
        {
          id: "trava-de-lamina",
          name: "Trava de Lâmina",
          paCost: 1,
          ptCost: 1,
          range: "Corpo a corpo",
          actions: { normal: 0 },
          effect: "Quando o seu Aparar fizer um ataque errar, pague 1 PT: disputa de Força com o atacante. Se vencer, ele não ataca no próximo turno dele, e você pode desarmá-lo. Não gasta Reação. Cada Aparar aceita um modificador só: Trava de Lâmina ou Peso da Água.",
        },
        {
          id: "muralha-de-um-homem",
          name: "Muralha de Um Homem",
          paCost: 1,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Enquanto você não se mover no seu turno, aliados adjacentes recebem Cobertura Superior contra ataques à distância vindos da sua direção. (Diferente de Guarda do Corpo: isto é passivo, só contra distância, e não gasta Reação. Escudo Vivo no Avançado amplia Guarda do Corpo para 3m e 1 uso grátis/turno.)",
        },
        {
          id: "contra-investida",
          name: "Contra-Investida",
          reaction: true,
          paCost: 1,
          ptCost: 1,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          effect: "1 Reação, quando um inimigo se mover para dentro do seu alcance corpo a corpo: você ataca antes que ele chegue, interrompendo a ação dele se acertar.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d10+4",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "A Postura",
        description:
          "Você veste o Manto de Touki e destrava as outras manobras de gasto. E aprende a Postura de Água (Kamae, 1 Ação pra entrar): Deslocamento 0, não ataca no seu turno (o Fluxo continua), soma Bônus de Rank à CA e ganha Reações extras (Bônus de Rank ÷ 2, arredondado pra cima). Sair é livre ao se mover.",
      },
      talents: [
        { id: "postura-movel", name: "Postura Móvel", paCost: 2, description: "Em Postura, você pode se mover até 3 metros por turno sem sair dela." },
        { id: "segunda-guarda", name: "Segunda Guarda", paCost: 2, description: "+1 Reação por turno, mesmo fora da Postura." },
        { id: "escudo-vivo", name: "Escudo Vivo", paCost: 2, description: "Guarda do Corpo passa a alcançar 3 metros e pode ser usada uma vez por turno sem gastar Reação. (Muralha de Um Homem no Intermediário dá Cobertura Superior passiva contra distância se você não se mover — papéis diferentes: reação ativa vs passiva à distância.)" },
      ],
      abilities: [
        {
          id: "fluxo-verdadeiro",
          name: "Fluxo Verdadeiro",
          signature: true,
          reaction: true,
          paCost: 3,
          ptCost: 2,
          range: "9 metros",
          actions: { normal: 1 },
          effect:
            "1 Reação: apara qualquer flecha, virote, projétil mágico, ou magia de ataque de alvo único de rank Avançado ou inferior. O efeito é anulado, ou redirecionado pra outra criatura a 9m com a CD original. Não funciona contra área nem Espada de Luz.",
        },
        {
          id: "correnteza",
          name: "Correnteza",
          paCost: 2,
          ptCost: 1,
          range: "Contra-ataque de Fluxo",
          actions: { normal: 0 },
          effect: "Gaste 1 PT no início da sua rodada para ativar. Cada contra-ataque de Fluxo que acertar naquela rodada causa +1 Dado de Arma cumulativo, até o teto de +2 Dados de Arma num mesmo contra-ataque: o terceiro causa dois dados extras, e do quarto em diante o bônus permanece em dois.",
        },
        {
          id: "peso-da-agua",
          name: "Peso da Água",
          paCost: 2,
          ptCost: 1,
          range: "Corpo a corpo",
          actions: { normal: 0 },
          effect: "Quando o seu Aparar fizer um ataque errar, pague 1 PT: o atacante faz teste de Força ou fica Caído e perde o restante das Ações dele no turno. Não gasta Reação. Cada Aparar aceita um modificador só: Trava de Lâmina ou Peso da Água.",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d10+4",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "Ler o Fluxo",
        description:
          "O Mestre é obrigado a te informar o que um inimigo pretende fazer antes de resolver a ação. Fluxo Verdadeiro passa a funcionar contra magias de qualquer rank, exceto área e rank Imperador. Você é imune a acertos críticos em Postura.",
      },
      talents: [],
      abilities: [
        {
          id: "o-primeiro-segredo",
          name: "O Primeiro Segredo",
          signature: true,
          reaction: true,
          paCost: 4,
          ptCost: 3,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          effect:
            "1 Reação, no gatilho que você escolher. Um dos Cinco Segredos — criado com o Mestre. Escolha um gatilho (inimigo ataca você/aliado, conjura, se move, foge) e duas opções de orçamento (anula o efeito; devolve o dano; aplica Caído, Preso ou Atordoado, ou faz o alvo largar a arma; atinge todos a 3m; +5 CA a você e aliado), mais uma Amarra (condição de uso). Limite de 'anula o efeito': nunca anula efeito de rank acima do seu nesta árvore, nem efeito que pega várias criaturas, a menos que 'atinge todos a 3m' também esteja entre as opções escolhidas.",
        },
        {
          id: "espelho-suishin",
          name: "Espelho",
          reaction: true,
          paCost: 3,
          ptCost: 2,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          effect: "1 Reação: quando um inimigo usar contra você técnica marcial de rank Santo ou inferior, você a executa de volta imediatamente, mesmo sem possuí-la.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d12+5",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "A Arte da Provocação",
        description:
          "Provocar vira gratuito, uma vez por turno. Quem falhar ataca você com Desvantagem. Em Postura, inimigos que optarem por não atacar você e estiverem ao alcance sofrem Desvantagem em tudo naquele turno.",
      },
      talents: [],
      abilities: [
        {
          id: "o-segundo-segredo",
          name: "O Segundo Segredo",
          signature: true,
          reaction: true,
          paCost: 5,
          ptCost: 3,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          effect: "1 Reação, igual ao primeiro. Invente seu segundo Segredo com o mesmo molde, escolhendo três opções de orçamento em vez de duas.",
        },
        {
          id: "mare-de-retorno",
          name: "Maré de Retorno",
          paCost: 4,
          ptCost: 3,
          range: "Postura",
          actions: { normal: 1 },
          effect: "Requer Postura. Até o início do próximo turno, todo ataque corpo a corpo que errar você dispara o Fluxo, até um número de vezes por rodada igual ao seu Bônus de Rank (o maior teto de Fluxo antes do Domínio Absoluto).",
        },
        {
          id: "nada-passa",
          name: "Nada Passa",
          reaction: true,
          paCost: 4,
          ptCost: 2,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 Reação: você apara um efeito de área — ele acontece, mas não atinge você nem aliados adjacentes a você.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d12+5",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "Domínio Absoluto",
        description:
          "Em Postura, o seu Fluxo e as suas Reações deixam de ter limite numérico por rodada (continua uma vez por criatura por turno). Seu alcance de Reação corpo a corpo aumenta para 4,5 metros. Você pode entrar em Postura como Reação no instante em que o combate começar.",
      },
      talents: [],
      abilities: [
        {
          id: "reino-da-espada-da-privacao",
          name: "Reino da Espada da Privação",
          signature: true,
          paCost: 6,
          ptCost: 5,
          range: "Esfera de 12m",
          actions: { normal: 2 },
          effect:
            "Requer Postura (não pode sair). Estabelece um domínio esférico de 12m: qualquer hostil que se mova, ataque, conjure ou canalize mana dentro sofre dano de arma normal, sem rolagem de acerto, uma vez por turno dela. Dura enquanto mantiver Postura e tiver PT (1 PT/turno). Um alvo completamente imóvel não é atingido. A Espada de Luz Verdadeira ignora este domínio.",
        },
        {
          id: "o-terceiro-segredo",
          name: "O Terceiro Segredo",
          reaction: true,
          paCost: 5,
          ptCost: 4,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          effect: "1 Reação, igual ao primeiro. Invente seu terceiro Segredo com o mesmo molde, escolhendo quatro opções de orçamento.",
        },
      ],
    },
  ],
};
