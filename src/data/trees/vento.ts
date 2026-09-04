import { Tree } from "@/lib/types";
import { MAGIC_ACTIONS, RANK_PA_COST } from "./shared";

export const VENTO_TREE: Tree = {
  id: "vento",
  name: "Magia de Vento",
  icon: "/arvores/vento.png",
  category: "magia",
  subgroup: "Magia Ofensiva",
  mechanic: {
    tag: "Desequilibrado",
    hook:
      "Não derruba nem prende: tira o inimigo do prumo e cobra por isso em cima.",
    loop: [
      "Desequilibre. Quase toda magia de Vento aplica Desequilibrado — metade do Deslocamento, uma Reação por rodada, Desvantagem em ataque de oportunidade.",
      "Cobre. Toda magia de Vento sua rola UM DADO DE DANO A MAIS contra alvo Desequilibrado.",
      "Suba. Do Avançado em diante você voa de graça, e quem está Desequilibrado não te alcança de volta.",
    ],
    cost:
      "O menor dado por magia das quatro ofensivas, e nenhuma parede. Vento não segura ninguém — ele atrapalha, empurra e sai de perto.",
  },
  keyAttributeLabel: "Intelecto",
  resourceLabel: "PM",
  tagline: "Corte, som e mobilidade — a escola que anula a distância, inclusive a sua própria.",
  proficiencies: {
    armas: "Nenhuma além do padrão (armas simples, armadura leve).",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Escola Formal de Magia. Conjura com Intelecto (BC = Intelecto + Bônus de Rank).",
  },
  grantedSkills: {
    fixed: ["Arcanismo"],
    choose: { count: 1, from: ["Acrobacia", "Percepção", "Sobrevivência"] },
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d4+2",
      mastery: {
        name: "Brisa",
        description:
          "Controle constante e gratuito de ar num raio de 18 metros, sem PM e sem Ação. Você nunca sofre dano de queda de até 15 metros, e desce devagar de qualquer altura. [Desequilibrado] Uma vez por turno, sem gastar Ação nem PM, empurre uma criatura a até 9m em 1,5m — se isso a tirar de uma borda, telhado, ponte ou escada, ela fica Desequilibrada.",
      },
      talents: [
        { id: "pes-leves", name: "Pés Leves", paCost: RANK_PA_COST.talent.Principiante, description: "+3 metros de Deslocamento, e você não deixa pegadas nem faz ruído ao andar." },
        { id: "ouvido-do-vento", name: "Ouvido do Vento", paCost: RANK_PA_COST.talent.Principiante, description: "Você escuta qualquer conversa a até 60 metros, desde que exista ar entre vocês. Vantagem em Percepção auditiva." },
        { id: "reserva-de-ar", name: "Reserva de Ar", paCost: RANK_PA_COST.talent.Principiante, description: "+2 PM por patamar seu em Vento. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela." , grants: { mpPerRank: 2 } },
      ],
      abilities: [
        {
          id: "lamina-de-vento",
          name: "Lâmina de Vento",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 1,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "1d10 + BC (cortante)" },
          effect: "Ataque mágico à distância. Se acertar, o alvo fica Desequilibrado.",
          incantation:
            "Ar que passa por tudo sem pedir licença a coisa nenhuma,\ntoma o fio da navalha e vai até ele.\nLâmina de Vento!",
        },
        {
          id: "empurrao",
          name: "Empurrão",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 1,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Teste de Força (CD 8 + BC) ou o alvo é empurrado 6m na direção escolhida e fica Desequilibrado. Sem dano.",
          incantation:
            "Vento que não corta, só empurra com o peso do mundo inteiro atrás,\nvai até ele e não pares até que perceba que perdeu o chão.\nEmpurrão!",
        },
        {
          id: "passo-de-vento",
          name: "Passo de Vento",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "Pessoal",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "1 Ação: desloque-se 18 metros em qualquer direção, inclusive para cima, sem provocar ataques de oportunidade e ignorando terreno difícil. Desce suavemente se terminar no ar.",
          incantation:
            "Ar sob meus pés, que finge não estar lá até que eu peça,\nleva-me daqui pra ali antes que alguém perceba que eu me movi.\nPasso de Vento!",
        },
        {
          id: "sopro-de-poeira",
          name: "Sopro de Poeira",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 1,
          range: "Cone de 6 metros",
          actions: { normal: 1, encurtada: 1, silenciosa: 1 },
          costNote:
            "1 Ação em vez de 2: é poeira soprada na cara de alguém, não um feitiço de duas partes. Sem dano e sem duração além de um turno, o custo em Ação tinha que acompanhar o quão pouco ela realmente faz.",
          effect: "Teste de Vigor (CD 8 + BC) ou o alvo fica Cego e Desequilibrado até o fim do próximo turno dele. Sem dano.",
          incantation:
            "Poeira que dorme no chão, levanta e cega quem olhar de frente sem pensar duas vezes.\nSopro de Poeira!",
        },
        {
          id: "vacuo-localizado",
          name: "Vácuo Localizado",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "1d6" },
          effect: "Remove o ar ao redor da cabeça do alvo. Ele não consegue recitar cânticos, falar nem gritar por 1 turno. Não funciona em quem não respira.",
          incantation:
            "Ar que envolve a cabeça dele sem que ele perceba nada, eu te retiro agora mesmo, sem aviso.\nVácuo Localizado!",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Sem Peso",
        description:
          "Passo de Vento passa a custar 1 PM e pode ser usado uma vez por turno sem gastar Ação. Você ignora terreno difícil e não pode ser Caído nem Atolado enquanto consciente. Ataques à distância mundanos contra você sofrem Desvantagem. [Desequilibrado] O pagamento da escola: toda magia de Vento sua rola UM DADO DE DANO A MAIS contra um alvo Desequilibrado — é o equivalente exato do frio que dobra contra Molhado, na Água.",
      },
      talents: [
        { id: "corrente-de-apoio", name: "Corrente de Apoio", paCost: RANK_PA_COST.talent.Intermediário, description: "Quando um aliado a até 18m conjurar magia de área, gaste 1 PM como Reação para aumentar a área dela em metade." },
        { id: "corte-fino", name: "Corte Fino", paCost: RANK_PA_COST.talent.Intermediário, description: "Suas magias cortantes de Vento causam +1d6 contra criaturas sem armadura." },
        { id: "fuga-perfeita", name: "Fuga Perfeita", paCost: RANK_PA_COST.talent.Intermediário, description: "Ao ser reduzido a 0 PV, você é automaticamente arremessado 9m para longe da fonte do dano antes de cair." },
      ],
      abilities: [
        {
          id: "estrondo-sonico",
          name: "Estrondo Sônico",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 3,
          range: "Linha de 27 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "3d8 + BC (contundente)" },
          effect: "Teste de Força (CD 8 + BC). Falha: dano cheio, empurradas 9m e Desequilibradas. Sucesso: metade.",
          incantation:
            "Ar que se dobra até doer nas próprias costuras, endireite de uma vez\ne leve tudo o que estiver na frente sem escolher o que poupar.\nEstrondo Sônico!",
        },
        {
          id: "foice-de-vacuo",
          name: "Foice de Vácuo",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "36 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "2d10 + BC (cortante)" },
          effect: "Ataque mágico à distância que ignora Cobertura. Contra alvo Desequilibrado, crita em 19-20 e ignora metade da CA de armadura.",
          incantation:
            "Foice que ninguém vê chegar até já ter passado, curva-te no ar sem fazer barulho algum,\ne não pares na primeira coisa que encontrares no caminho.\nFoice de Vácuo!",
        },
        {
          id: "ciclone",
          name: "Ciclone",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 4,
          range: "Esfera de 9m de raio",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "2d8 + BC (contundente)" },
          effect: "Teste de Força (CD 8 + BC). Falha: dano, arremessadas 6m para longe do centro, Desequilibradas e Caídas. Vento forte na área por 1 minuto — projéteis mundanos erram.",
          incantation:
            "Vento que gira em volta de si mesmo até esquecer qual direção era a original,\nleva tudo que estiver perto contigo nessa dança, sem escolher quem fica de fora.\nCiclone!",
        },
        {
          id: "asas-emprestadas",
          name: "Asas Emprestadas",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "Toque",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "10 minutos: o alvo recebe Deslocamento de Voo igual ao dobro do deslocamento dele. Se acabar no ar, desce suavemente.",
          incantation:
            "Asas que eu não tenho, mas posso emprestar por um tempo, cresçam nas costas dele\ne o levem mais alto do que os próprios pés jamais o levariam.\nAsas Emprestadas!",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Voo",
        description:
          "Você recebe Deslocamento de Voo permanente igual ao seu Deslocamento normal, sem custo de PM, enquanto consciente e não Exausto. Desbloqueia o direito de combinar escolas (Magia Combinada, Cap. 2).",
      },
      talents: [
        { id: "vento-constante", name: "Vento Constante", paCost: RANK_PA_COST.talent.Avançado, description: "Você mantém duas magias de Vento sustentadas simultaneamente sem concentração." },
        { id: "redirecionar", name: "Redirecionar", paCost: RANK_PA_COST.talent.Avançado, description: "1 Reação e 2 PM: um ataque à distância mundano ou projétil mágico dirigido a você é desviado para outra criatura a até 9m." },
        { id: "corpo-de-corrente", name: "Corpo de Corrente", paCost: RANK_PA_COST.talent.Avançado, description: "Além de Caído e Atolado, você é imune a Preso e Agarrado, e atravessa qualquer fresta por onde caiba ar." },
      ],
      abilities: [
        {
          id: "nova-congelante",
          name: "Nova Congelante",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 6,
          range: "Esfera de 12m",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "6d8 de frio (já contando a duplicação por Molhado)" },
          effect: "Requer 1 patamar em Água (ou aliado mago de Água conjurando junto). Todos na área ficam Molhados e imediatamente Congelados, sem teste.",
          incantation:
            "Umidade que viaja comigo desde a última chuva que caiu, pare no meio do caminho e escolhe,\nagora, sem hesitar nenhum instante, ser vidro em vez de ser água que apenas corre e some no chão.\nNova Congelante!",
        },
        {
          id: "prisao-de-ar",
          name: "Prisão de Ar",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 5,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Teste de Força (CD 8 + BC). Falha: o alvo é erguido 6m do chão, Preso e Desequilibrado por 1 minuto (repete teste no fim de cada turno).",
          incantation:
            "Ar que sustenta o pássaro em pleno voo sem que ele nunca perceba o próprio esforço de estar voando,\nsustenta agora quem eu escolher, bem longe do chão firme em que sempre confiou cegamente até hoje.\nPrisão de Ar!",
        },
        {
          id: "guilhotina-de-vacuo",
          name: "Guilhotina de Vácuo",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 5,
          range: "Linha de 45 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "5d8 + BC (cortante, +2d8 contra Desequilibrado)" },
          effect: "Corta madeira, corda e tecido com facilidade; não corta pedra.",
          incantation:
            "Vazio que corta sem lâmina nenhuma, sem fio, sem peso algum e sem qualquer aviso a quem estiver por perto observando,\ntraça uma linha reta e exata por onde nada mais volta a se juntar depois de cortado em dois pedaços.\nGuilhotina de Vácuo!",
        },
        {
          id: "tomar-o-ar",
          name: "Tomar o Ar",
          paCost: 4,
          pmCost: 4,
          range: "Esfera de 6m",
          actions: MAGIC_ACTIONS.Avançado,
          costNote:
            "4 PA em vez dos 2 do Avançado comum. Não é dano — é negar a magia inteira de um inimigo (sem ar, sem cântico) e apagar fogo em área, incluindo Em Chamas mágico. Contra um mago rival ou um incêndio fora de controle, isto vale mais que qualquer feitiço de dano do mesmo rank.",
          damage: { normal: "3d6 por turno" },
          effect: "Remove o ar da área por 3 turnos. Teste de Vigor por turno; quem falhar sofre dano e não pode recitar cântico. Apaga fogo na área, inclusive Em Chamas.",
          incantation:
            "Ar que todos aqui respiram sem nunca agradecer por isso nem uma única vez sequer, eu te retiro deste espaço inteiro agora\ne devolvo só depois que a lição estiver bem aprendida por quem realmente precisa aprendê-la.\nTomar o Ar!",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d6+3",
      mastery: {
        name: "Senhor do Céu",
        description:
          "Seu Voo passa ao dobro do Deslocamento, e você pode pairar imóvel indefinidamente. Você controla o vento num raio de 1 km: nega voo a hostis, encalha navios, derruba flechas, dispersa névoa. Nenhum ataque à distância mundano acerta você.",
      },
      talents: [
        { id: "sem-cantico", name: "Sem Cântico", paCost: RANK_PA_COST.talent.Santo, description: "Suas magias de Vento de rank Avançado ou inferior podem ser conjuradas em Conjuração Silenciosa sem penalidade alguma." },
      ],
      abilities: [
        {
          id: "tempestade-cortante",
          name: "Tempestade Cortante",
          signature: true,
          paCost: RANK_PA_COST.signature.Santo,
          pmCost: 11,
          range: "Esfera de 30m de raio",
          actions: MAGIC_ACTIONS.Santo,
          damage: { normal: "5d8 + BC de dano cortante por turno" },
          effect: "Dura 1 minuto e se move 9m por turno para onde você quiser. Desequilibrado automático em quem falhar teste de Força.",
          incantation:
            "Que o ar se lembre de que já foi lâmina afiada, muito antes de aprender a ser apenas respiração calma e mansa demais.\nQue ele lembre mil vezes por segundo, sem parar nenhum instante sequer, sem descansar nunca, sem jamais esquecer de novo o que sempre foi de verdade.\nTempestade Cortante!",
        },
        {
          id: "ceu-negado",
          name: "Céu Negado",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 9,
          range: "Raio de 300m",
          actions: MAGIC_ACTIONS.Santo,
          effect: "10 minutos: nenhuma criatura hostil voa, salta acima de 3m ou dispara projéteis pra dentro da área. Aliados voam livremente.",
          incantation:
            "Céu que sempre foi de todos, sem dono nenhum e sem fronteira alguma desde o princípio remoto dos tempos,\nhoje eu fecho a tua porta pra quem vem com má intenção guardada na alma há tempos. Que ninguém hostil se erga\nacima do que os próprios pés já alcançavam antes de eu ter chegado aqui hoje.\nCéu Negado!",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Som e Vácuo",
        description:
          "Você conjura dano sônico, que ignora Cobertura, armadura e o Manto de Touki (não funciona no vácuo nem debaixo d'água). Cria silêncio absoluto ou ruído insuportável em até 30m, à vontade, sem PM.",
      },
      talents: [
        { id: "ouvido-absoluto", name: "Ouvido Absoluto", paCost: RANK_PA_COST.talent.Rei, description: "Você \"vê\" por som num raio de 60m, atravessando paredes, escuridão e invisibilidade." },
      ],
      abilities: [
        {
          id: "grito-do-mundo",
          name: "Grito do Mundo",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 13,
          range: "Esfera de 45m",
          actions: MAGIC_ACTIONS.Rei,
          damage: { normal: "10d10 + BC de dano sônico (ignora armadura, Cobertura e Manto de Touki)" },
          effect: "Teste de Vigor (CD 8 + BC). Falha: dano cheio, Desequilibrado, Atordoado 1 turno e Surdo 10 minutos. Sucesso: metade e Desequilibrado mesmo assim. Estruturas de pedra racham; vidro se despedaça.",
          incantation:
            "Eu não grito com a garganta. Eu grito com o ar inteiro que existe entre mim e todos vocês,\ne peço a ele que carregue não a minha voz, mas o meu peso completo e integral.\nQue toda pedra desta região rache, que todo vidro se lembre de que já foi areia um dia distante,\ne que quem estiver de pé aprenda, na própria carne, o que é ser atingido por um som que decidiu ter forma física.\nGrito do Mundo!",
        },
        {
          id: "vazio",
          name: "Vazio",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 12,
          range: "Esfera de 18m",
          actions: MAGIC_ACTIONS.Rei,
          damage: { normal: "4d10 por turno, sem teste" },
          effect: "Remove todo o ar da área por 1 minuto. Impossível recitar, gritar ou fazer fogo ali dentro. Som não existe — nem o seu.",
          incantation:
            "Eu não crio nada aqui. Eu apenas retiro tudo — o ar que respiram, o som que fariam, a possibilidade de gritar por socorro pra alguém do lado de fora que talvez ouvisse.\nQue esta esfera inteira se torne o lugar mais silencioso que qualquer um de vocês jamais visitou em toda a vida,\ne que ninguém aqui dentro consiga sequer dizer o próprio nome em voz alta, nem pra si mesmo.\nVazio!",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d8+4",
      mastery: {
        name: "A Atmosfera é Sua",
        description:
          "Você controla a pressão do ar num raio de 5 km. Criaturas hostis a até 18m de você estão permanentemente Desequilibradas, sem teste. Uma vez por turno, conjure magia de Vento de rank Avançado ou inferior em Silenciosa sem gastar Ação.",
      },
      talents: [
        { id: "nada-toca-voce", name: "Nada Toca Você", paCost: RANK_PA_COST.talent.Imperador, description: "Enquanto estiver voando e não Exausto, criaturas de rank Santo ou inferior não conseguem te atingir com ataque corpo a corpo algum." },
      ],
      abilities: [
        {
          id: "lamina-do-horizonte",
          name: "Lâmina do Horizonte",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 20,
          range: "Linha de 3 km",
          actions: MAGIC_ACTIONS.Imperador,
          damage: { normal: "16d10 + BC de dano cortante (+6d10 contra Desequilibrado)" },
          effect: "Teste de Agilidade com Desvantagem Absoluta; quem passar fica Desequilibrado pela esteira de pressão. Muralhas, torres e florestas na trajetória são cortadas ao meio, permanentemente.",
          incantation:
            "Um traço. Um só, do horizonte de um lado ao horizonte mais distante do outro, sem hesitar em nenhum ponto do longuíssimo caminho entre os dois extremos.\nE que tudo o que estiver do lado errado dele descubra, tarde demais e sem nenhuma chance real de correção,\nque sempre esteve do lado errado desde o próprio início de tudo — não porque escolheu mal em algum momento importante da vida,\nmas porque eu, e apenas eu, decidi onde a linha inteira seria traçada neste exato dia, sem consultar absolutamente ninguém antes.\nLâmina do Horizonte!",
        },
        {
          id: "explosao-silenciosa",
          name: "Explosão Silenciosa",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 22,
          range: "Esfera de 60m",
          actions: { normal: 3, silenciosa: 2 },
          costNote:
            "3 Ações em vez das 6 do rank Imperador, e 22 PM em vez de 18. O nome já entrega a lógica: uma explosão dessa escala sair em 3 Ações, sem o mundo perceber até o eco chegar quilômetros depois, é logisticamente impossível sem pagar o excedente de mana pela ausência do cântico completo — o vácuo que segura o som também segura parte do próprio feitiço.",
          damage: { normal: "12d12 dividido igualmente entre ígneo, sônico e contundente" },
          effect: "Requer 1 patamar em Fogo. Teste de Vigor com Desvantagem Absoluta para metade. Ignora Resistência aos três tipos. Não faz som no momento — ele chega depois, a quilômetros de distância.",
          incantation:
            "Fogo.\nVácuo.\nAgora.",
        },
      ],
    },
  ],
};
