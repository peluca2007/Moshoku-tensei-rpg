import { Tree } from "@/lib/types";

export const ESCUDOS_TREE: Tree = {
  id: "cavalaria-e-escudos",
  name: "Cavalaria e Escudos",
  category: "corpo",
  subgroup: "Tank / Defensor",
  keyAttributeLabel: "Vigor",
  resourceLabel: "PT",
  tagline:
    "Aparar e não devolver nada — diferente do Suishin-ryū, o Defensor não tem Fluxo nem contragolpe. A pergunta única é quem está atrás de mim. Maior PV do livro; gasta PT mais rápido que qualquer outra árvore.",
  rankLabels: {
    Principiante: "Escudeiro",
    Intermediário: "Guarda",
    Avançado: "Protetor",
    Santo: "Guardião",
    Rei: "Muralha",
    Imperador: "Bastião",
  },
  proficiencies: {
    armas: "Toda arma de uma mão, TODO escudo, e armadura leve, média e pesada — o pacote de proficiência mais completo do livro em defesa.",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Ofício do Corpo (sem patamar Deus).",
  },
  grantedSkills: {
    fixed: ["Atletismo", "Percepção"],
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d10+4",
      weaponDieSteps: 1,
      mastery: {
        name: "Interpor",
        description:
          "Você desbloqueia 'Sob Minha Guarda': designe aliados (até seu Bônus de Rank) como protegidos; a até 3m, gaste 1 Reação para que todo o dano de um ataque contra ele venha para você (não reduzível por Resistência, mas sim por PT). Se ele sofrer dano que você não interceptou, recupere 1 PT. Você é proficiente com toda armadura e escudo, e com escudo recebe +2 na CA além do normal.",
      },
      talents: [
        { id: "ombro-de-pedra", name: "Ombro de Pedra", paCost: 1, description: "+4 PV por patamar seu nesta árvore. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela." , grants: { hpPerRank: 4 } },
        { id: "montaria", name: "Montaria", paCost: 1, description: "Você monta, treina e acalma qualquer besta de carga. Sobre ela, você não cai por efeito que permita teste, e sua montaria também está Sob Sua Guarda." },
        { id: "sono-de-ferro", name: "Sono de Ferro", paCost: 1, description: "Você dorme de armadura completa sem penalidade e acorda pronto. Vantagem contra Exaustão por marcha ou vigília." },
      ],
      abilities: [
        {
          id: "muralha-de-um",
          name: "Muralha de Um",
          signature: true,
          paCost: 2,
          ptCost: 1,
          range: "3 metros",
          actions: { normal: 1 },
          effect: "Até o início do próximo turno, você não pode se mover, e aliados a até 3m recebem Cobertura Superior (+5 CA) e Resistência a dano de área. Você não recebe nenhum benefício.",
        },
        {
          id: "golpe-de-escudo",
          name: "Golpe de Escudo",
          paCost: 1,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "1d8 + Força (contundente)" },
          effect: "Teste de Força do alvo (CD 8 + Vigor + Rank) ou é empurrado 3m e fica Caído.",
        },
        {
          id: "puxar",
          name: "Puxar",
          paCost: 1,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "Um aliado a até 9m é puxado para adjacente a você e fica Sob Sua Guarda imediatamente, mesmo excedendo seu limite.",
        },
        {
          id: "provocar-odio",
          name: "Provocar Ódio",
          paCost: 1,
          range: "Visão",
          actions: { normal: 1 },
          effect: "Teste de Espírito (CD 8 + Vigor + Rank). Falha: no próximo turno da criatura, ataques contra qualquer um que não seja você têm Desvantagem. (Não é a Provocação do Suishin-ryū, que força o ataque pra alimentar contragolpe — aqui você só torna caro ignorar você.)",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d12+4",
      weaponDieSteps: 0,
      mastery: {
        name: "Peso do Aço",
        description:
          "O alcance de Sob Minha Guarda sobe para 4,5 metros. Você não pode ser empurrado, derrubado, agarrado nem movido contra a vontade com os pés no chão e escudo na mão. Com armadura pesada, Resistência a dano de área.",
      },
      talents: [
        { id: "dois-escudos", name: "Dois Escudos", paCost: 1, description: "Você empunha um escudo em cada mão: +2 na CA adicional, e não pode atacar." },
        { id: "folego-de-sentinela", name: "Fôlego de Sentinela", paCost: 1, description: "+2 PT Máximos." , grants: { pt: 2 } },
        { id: "a-porta-sou-eu", name: "A Porta Sou Eu", paCost: 1, description: "Enquanto bloquear uma passagem de até 3m, criaturas Médias ou menores não atravessam sem antes te derrubar." },
      ],
      abilities: [
        {
          id: "aguentar",
          name: "Aguentar o Baque",
          signature: true,
          reaction: true,
          paCost: 2,
          ptCost: 1,
          range: "Pessoal",
          actions: { normal: 1 },
          damage: { normal: "Reduz 1d10 + Vigor + Bônus de Rank" },
          effect: "1 Reação, ao interceptar dano por Sob Minha Guarda: reduza aquele dano antes de aplicá-lo em você. Empilha com quantas Reações tiver.",
        },
        {
          id: "escudo-erguido",
          name: "Escudo Erguido",
          paCost: 1,
          ptCost: 1,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 minuto: ataques à distância mundanos contra você e aliados a 3m erram automaticamente. Você não pode correr enquanto sustentar.",
        },
        {
          id: "formacao",
          name: "Formação",
          paCost: 1,
          range: "Passivo",
          actions: { normal: 0 },
          effect: "Aliados adjacentes a você somam seu Bônus de Rank aos testes de resistência contra efeitos de área e contra ser movido.",
        },
        {
          id: "cavalgada",
          name: "Cavalgada",
          paCost: 1,
          range: "Deslocamento da montaria",
          actions: { normal: 1 },
          effect: "Requer montaria. Avance até o dobro do deslocamento dela atravessando linhas inimigas — no caminho, teste de Força ou Caídas. Sem ataques de oportunidade.",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d12+5",
      weaponDieSteps: 1,
      ptGained: 2,
      mastery: {
        name: "Escudo Estendido",
        description:
          "Você recebe o Manto de Touki completo e a reserva de PT — recebe 2 PT por patamar em vez de 1. O Touki é projetado para fora do corpo: Sob Minha Guarda alcança 9 metros e exige apenas linha de visão. Interceptar dano deixa de custar Reação uma vez por rodada.",
      },
      talents: [
        { id: "casco-escudos", name: "Casco", paCost: 2, description: "Você tem Resistência a dano físico de armas mundanas enquanto empunhar escudo." },
        { id: "guarda-ampla", name: "Guarda Ampla", paCost: 2, description: "O número de aliados Sob Sua Guarda passa a ser o dobro do seu Bônus de Rank." },
        { id: "aco-paciente", name: "Aço Paciente", paCost: 2, description: "+4 PT Máximos." , grants: { pt: 4 } },
      ],
      abilities: [
        {
          id: "nao-ele",
          name: "Não Ele",
          signature: true,
          reaction: true,
          paCost: 3,
          ptCost: 2,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "1 Reação: intercepte um ataque, magia ou efeito de área inteiro dirigido a um aliado Sob Sua Guarda, mesmo de alvo único e mesmo sem alcance físico. Você sofre o efeito completo no lugar dele, inclusive condições.",
        },
        {
          id: "redirecionar-escudos",
          name: "Redirecionar",
          reaction: true,
          paCost: 2,
          ptCost: 1,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "Ao interceptar um ataque à distância ou projétil mágico, desvie-o para uma criatura hostil à sua escolha a até 9m, usando a rolagem original.",
        },
        {
          id: "folego-emprestado",
          name: "Fôlego Emprestado",
          paCost: 2,
          ptCost: 2,
          range: "9 metros",
          actions: { normal: 1 },
          damage: { normal: "PV Temporários = Vigor + Bônus de Rank" },
          effect: "Um aliado Sob Sua Guarda recebe PV Temporários e remove uma condição de Amedrontado, Atordoado ou Caído.",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "2d6+5",
      weaponDieSteps: 0,
      ptGained: 2,
      mastery: {
        name: "Aegis",
        description:
          "Aliados Sob Sua Guarda recebem, passivamente e sem custo: redução de dano igual ao seu Bônus de Rank contra todo dano recebido, imunidade a acertos críticos, e o direito de repetir um teste de resistência falho por turno.",
      },
      talents: [
        {
          id: "aco-vivo",
          name: "Aço Vivo",
          paCost: 3,
          description:
            "Sua armadura e escudo se reparam sozinhos após cada Descanso Curto e não podem ser destruídos por efeito algum de patamar inferior ao seu.",
        },
        {
          id: "contagem-de-corpos",
          name: "Contagem de Corpos",
          paCost: 3,
          description:
            "Para cada aliado Sob Sua Guarda que não tenha sofrido dano neste combate, você recebe +1 na CA, cumulativo.",
        },
      ],
      abilities: [
        {
          id: "custe-o-que-custar",
          name: "Custe o Que Custar",
          signature: true,
          reaction: true,
          paCost: 4,
          ptCost: 3,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 Reação, quando um aliado Sob Sua Guarda chegaria a 0 PV: ele fica com 1 PV e é movido 9m para fora do perigo. Você sofre todo o dano excedente, sem receber Marcas da Morte neste turno.",
        },
        {
          id: "bastiao-menor",
          name: "Bastião Menor",
          paCost: 3,
          ptCost: 2,
          range: "Esfera de 6m",
          actions: { normal: 1 },
          effect: "1 minuto: criaturas hostis que entrarem gastam o dobro do deslocamento, e nenhum efeito de área de fora atinge quem está dentro sem antes te atingir.",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "2d6+6",
      weaponDieSteps: 1,
      ptGained: 2,
      mastery: {
        name: "Ninguém Passa",
        description:
          "Criaturas hostis não podem se mover para além de você (3m para cada lado da sua linha) sem antes vencer uma disputa de Força ou Vigor. Você intercepta dano por Sob Minha Guarda sem gastar Reação, quantas vezes quiser por rodada. Imune a Paralisia, Petrificação, Preso e efeitos que impeçam agir, com 1+ PT.",
      },
      talents: [],
      abilities: [
        {
          id: "a-linha",
          name: "A Linha",
          signature: true,
          paCost: 5,
          ptCost: 4,
          range: "18 metros",
          actions: { normal: 1 },
          effect: "1 minuto: todo dano dirigido a qualquer aliado a até 18 metros vem para você automaticamente, reduzido pelo seu Bônus de Rank. Você não pode se mover, atacar nem ser curado enquanto sustentar.",
        },
        {
          id: "ordem-de-recuo",
          name: "Ordem de Recuo",
          paCost: 4,
          ptCost: 2,
          range: "18 metros",
          actions: { normal: 1 },
          effect: "Todos os aliados a até 18m movem-se imediatamente até o próprio Deslocamento em direção a um ponto indicado, sem ataques de oportunidade e sem gastar as Ações deles.",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "2d8+6",
      weaponDieSteps: 0,
      ptGained: 2,
      mastery: {
        name: "Enquanto Eu Estiver de Pé",
        description:
          "Nenhum aliado Sob Sua Guarda pode ser reduzido a menos de 1 PV enquanto você estiver consciente e a até 18m dele — o excedente vem para você, sempre, sem custo. Você recebe 1 Ação adicional (mover-se, interpor-se, proteger). Ao chegar a 0 PV, gaste todos os PT e volte a 1 PV, uma vez por combate.",
      },
      talents: [
        { id: "nome-na-porta", name: "Nome na Porta", paCost: 4, description: "Aliados Sob Sua Guarda ficam imunes a Amedrontado, e inimigos que falharem ao tentar atravessar sua linha ficam Abalados (Desvantagem até o fim do próximo turno)." },
      ],
      abilities: [
        {
          id: "o-muro-final",
          name: "O Muro Final",
          signature: true,
          paCost: 6,
          ptCost: 6,
          range: "Todo o campo de batalha",
          actions: { normal: 2 },
          effect:
            "Uma vez por Descanso Longo. Por 1 minuto, nenhum aliado seu pode morrer — todo dano letal é transferido para você, e você não cai abaixo de 1 PV durante a duração. Quando acaba, todo o dano acumulado é aplicado em você de uma vez. Você provavelmente morre.",
        },
        {
          id: "aco-inquebravel",
          name: "Aço Inquebrável",
          paCost: 5,
          ptCost: 4,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Por 3 turnos, você é imune a todo dano de patamar Rei ou inferior, e criaturas hostis a até 9m não conseguem se afastar de você.",
        },
      ],
    },
  ],
};
