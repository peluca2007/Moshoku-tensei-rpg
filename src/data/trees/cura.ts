import { Tree } from "@/lib/types";
import { MAGIC_ACTIONS, RANK_PA_COST } from "./shared";

export const CURA_TREE: Tree = {
  id: "cura",
  name: "Magia de Cura",
  category: "magia",
  subgroup: "Cura e Suporte",
  mechanic: {
    tag: "Ferida Fresca",
    hook:
      "Não é quanto você cura — é quando. A mesma magia vale o dobro se chegar a tempo.",
    loop: [
      "Chegue a tempo. Toda magia de Cura cura EM DOBRO contra Ferida Fresca: o dano sofrido neste turno ou no turno anterior.",
      "Ou segure a ferida aberta. Selar a Ferida mantém um dano contando como Fresco por 1 hora inteira, muito depois do turno passar.",
      "Ou não espere o turno. Prontidão é 1 Reação, disparada quando o aliado sofre o golpe — então é sempre Ferida Fresca, por definição.",
    ],
    cost:
      "Não trata veneno, doença, maldição nem petrificação, em rank nenhum — isso é Desintoxicação, e a separação é absoluta. E não fere vivos: o Golpe Divino do Rei só morde morto-vivo, construto e mana corrompida.",
  },
  keyAttributeLabel: "Espírito",
  resourceLabel: "PM",
  tagline:
    "Não cura veneno, doença nem maldição (isso é Desintoxicação) — mas decide quem sobrevive à campanha. O Rank Deus (Ressurreição de recém-mortos) é puramente narrativo, sem custo em PA.",
  proficiencies: {
    armas: "Nenhuma além do padrão (armas simples, armadura leve).",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Escola Formal de Magia. Conjura com Espírito (Cap. 1, §7).",
  },
  grantedSkills: {
    fixed: ["Medicina"],
    choose: { count: 1, from: ["Religião", "Intuição", "Persuasão"] },
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d4+2",
      mastery: {
        name: "Diagnóstico",
        description:
          "[Ferida Fresca] Encostando ou observando por 10 segundos, você sabe PV atual/máximo, condições ativas e a categoria do problema (ferimento, veneno, doença, maldição, exaustão ou fome). Encostando num aliado a 0 PV, você o estabiliza automaticamente, sem PM, Ação nem rolagem.",
      },
      talents: [
        { id: "maos-firmes-cura", name: "Mãos Firmes", paCost: RANK_PA_COST.talent.Principiante, description: "Você conjura magias de Cura sem sofrer Desvantagem por corpo a corpo, chuva, escuro ou inimigo adjacente." },
        { id: "reserva-do-curandeiro", name: "Reserva do Curandeiro", paCost: RANK_PA_COST.talent.Principiante, description: "+2 PM por patamar seu em Cura. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela." , grants: { mpPerRank: 2 } },
        {
          id: "juramento",
          name: "Juramento",
          paCost: RANK_PA_COST.talent.Principiante,
          description: "Enquanto jurar nunca usar magia para ferir, suas magias de Cura custam 1 PM a menos (mínimo 1). Quebrar o juramento desliga o talento por uma semana.",
        },
      ],
      abilities: [
        {
          id: "cura",
          name: "Cura",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "2d8 + BC de PV (4d8 + BC se Ferida Fresca)" },
          effect: "Remove todas as Marcas da Morte do alvo e o acorda, se estiver a 0 PV.",
          incantation:
            "Que este poder divino seja alimento farto, e que dê a quem perdeu as forças\na força de se erguer de novo. Cura!",
        },
        {
          id: "estancar",
          name: "Estancar",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 1,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Encerra imediatamente sangramento, corte aberto ou queimadura ativa. Não funciona contra veneno nem fogo mágico ainda ardendo.",
          incantation:
            "Sangue que insiste em fugir por uma porta que não devia ter sido aberta, fica. Fogo que ainda come, para. Estancar!",
        },
        {
          id: "selar-a-ferida",
          name: "Selar a Ferida",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 1,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Custa 1 PM por Bônus de Rank seu em Cura (1 no Principiante, 6 no Imperador). O dano escolhido conta como Ferida Fresca por 1 hora, mesmo depois de o turno em que ocorreu passar — qualquer magia de Cura conjurada nesse dano nessa 1 hora ainda cura em dobro.",
          incantation:
            "Ferida, eu te marco e te guardo aberta um pouco mais, só o suficiente pra ser bem curada.\nSelar a Ferida!",
        },
        {
          id: "vigor-emprestado",
          name: "Vigor Emprestado",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "1d8 + BC de PV Temporários" },
          effect: "Duram 10 minutos, gastos antes dos PV reais, não acumulam com outra fonte.",
          incantation:
            "Força que eu ainda tenho de sobra, empresto um pouco a ti — não é meu pra sempre, mas é teu agora.\nVigor Emprestado!",
        },
        {
          id: "mao-que-acalma",
          name: "Mão que Acalma",
          paCost: RANK_PA_COST.talent.Principiante,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Remove um nível de Exaustão causado por ferimento, trauma ou por acordar do Fio da Vida. Não remove Exaustão por fome, sede ou marcha.",
          incantation:
            "Mão que acalma o tremor sem perguntar de onde ele veio, descansa sobre o teu ombro cansado.\nMão que Acalma!",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Alcance da Compaixão",
        description:
          "Suas magias de Cura passam a alcançar 9 metros. Magias de rank Principiante custam 1 PM a menos (mínimo 1), e você cura duas criaturas ao mesmo tempo com uma conjuração de Principiante, dividindo os dados.",
      },
      talents: [
        { id: "diagnostico-profundo", name: "Diagnóstico Profundo", paCost: RANK_PA_COST.talent.Intermediário, description: "Seu Diagnóstico revela também a causa: quem envenenou, que criatura infectou, há quanto tempo, e se é mágico ou natural." },
        { id: "toque-duplo", name: "Toque Duplo", paCost: RANK_PA_COST.talent.Intermediário, description: "Ao usar Prontidão, você pode curar dois aliados que sofreram dano do mesmo efeito, dividindo os dados." },
        { id: "curandeiro-de-guerra", name: "Curandeiro de Guerra", paCost: RANK_PA_COST.talent.Intermediário, description: "Você trata quatro pessoas por hora fora de combate, e nunca erra um diagnóstico sob pressão." },
      ],
      abilities: [
        {
          id: "prontidao",
          name: "Prontidão",
          signature: true,
          reaction: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 3,
          range: "9 metros",
          actions: { normal: 1 },
          costNote:
            "1 Reação em vez das 2 Ações do rank, e cântico curto de propósito — por isso NÃO concede Bônus de Recitação Perfeita (Cap. 2, §2, \"Cântico Curto\"). É a magia que define a escola justamente porque chega enquanto o golpe ainda está acontecendo, e um cântico de 140 caracteres a tornaria impossível de usar como Reação. A velocidade é o benefício dela; o livro não paga as duas coisas.",
          damage: { normal: "2d8 + BC de PV, sempre como Ferida Fresca: 4d8 + BC" },
          effect: "1 Reação, quando um aliado visível sofrer dano. A magia que define a escola — cura enquanto o golpe ainda está acontecendo.",
          incantation: "Não caias. Ainda não. Prontidão!",
        },
        {
          id: "bencao-coletiva",
          name: "Bênção Coletiva",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 4,
          range: "Esfera de 6m",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "1d8 + BC de PV (dobrado individualmente para quem tiver Ferida Fresca)" },
          effect: "Todos os aliados na área recuperam PV.",
          incantation:
            "Luz que não escolhe a quem alcança e que nunca perguntou quem merecia, cai igual sobre todos os que estão do meu lado, sem medir quem chegou primeiro nem quem gritou mais alto por ti. Bênção Coletiva!",
        },
        {
          id: "escudo-de-carne",
          name: "Escudo de Carne",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 3,
          range: "Toque",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "1 minuto: o alvo recebe Resistência a dano físico de armas mundanas. Encerra se ele cair a 0 PV.",
          incantation:
            "Carne que eu reforço por dentro, sem que ninguém veja a diferença por fora,\nresiste ao que o aço comum tenta fazer contigo.\nEscudo de Carne!",
        },
        {
          id: "transferencia",
          name: "Transferência",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 2,
          range: "Toque",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Até BC pontos do dano de um aliado adjacente passam para você, ignorando sua Resistência. O dano transferido conta como Ferida Fresca em você.",
          incantation:
            "Dá-me a tua dor. Não toda ela, porque toda ela te definiria e eu não tenho esse direito sobre ti — só o suficiente pra que consigas ficar de pé mais um turno, e mais um depois desse. Transferência!",
        },
        {
          id: "sono-reparador",
          name: "Sono Reparador",
          paCost: RANK_PA_COST.talent.Intermediário,
          pmCost: 3,
          range: "Toque",
          actions: { normal: 3, encurtada: 2, silenciosa: 1 },
          ritual: true,
          costNote:
            "3 Ações em vez de 2, e Ritual: induzir sono profundo o suficiente pra valer como Descanso Curto não é um toque instantâneo — é embalar alguém até ele apagar de verdade, e isso leva um minuto real de mesa, não meio segundo.",
          effect: "O alvo dorme 1 hora e acorda como se tivesse feito um Descanso Curto completo. Não funciona duas vezes na mesma pessoa entre Descansos Longos.",
          incantation:
            "Dorme. Só isso: eu cuido do resto enquanto os teus olhos estiverem fechados, e ninguém vai te acordar antes que o teu corpo termine o que precisa terminar. Sono Reparador!",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "A Ferida Mortal",
        description:
          "Você cura ferimentos potencialmente fatais: pode levar um aliado de 0 PV direto para PV positivos numa única conjuração, sem que ele receba Exaustão ao acordar. Não reimplanta membros decepados. Desbloqueia Magia Combinada.",
      },
      talents: [
        { id: "mao-silenciosa", name: "Mão Silenciosa", paCost: RANK_PA_COST.talent.Avançado, description: "Você conjura magias de Cura de rank Principiante e Intermediário em Conjuração Silenciosa, sem penalidade alguma." },
        { id: "sangue-trocado-cura", name: "Sangue Trocado", paCost: RANK_PA_COST.talent.Avançado, description: "Transferência passa a mover o dobro do dano e alcança 9 metros." },
        { id: "maos-repartidas", name: "Mãos Repartidas", paCost: RANK_PA_COST.talent.Avançado, description: "Ao conjurar Cura Suprema, você pode dividir os dados rolados entre até duas criaturas ao seu alcance, em vez de concentrar tudo em uma só. Cada uma ainda dobra individualmente se estiver com Ferida Fresca." },
      ],
      abilities: [
        {
          id: "cura-suprema",
          name: "Cura Suprema",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 6,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "6d8 + BC de PV (12d8 + BC se Ferida Fresca)" },
          effect: "Remove sangramentos, ossos quebrados e a condição Caído. Se o alvo estiver a 0 PV, levanta com metade dos PV máximos, sem Exaustão.",
          incantation:
            "Não é o corpo que decide se ainda respira, e nunca foi — é quem está de pé ao lado dele com as mãos limpas e a voz firme. Sou eu, e eu digo que sim. Ergue-te, com o osso reto, o sangue parado onde deveria parar, e o pulmão cheio mais uma vez. Cura Suprema!",
        },
        {
          id: "circulo-de-recuperacao",
          name: "Círculo de Recuperação",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 5,
          range: "Esfera de 9m",
          actions: { normal: 5, encurtada: 4, silenciosa: 2 },
          costNote:
            "5 Ações em vez das 3 padrão do rank: é cura sustentada por 3 turnos inteiros, sem exigir concentração nem recast — um investimento de tempo maior na hora de erguer, em troca de ficar ativa sozinha depois. Comparar direto com uma magia de dano único do mesmo rank não é justo pros dois lados: aqui o Ação extra compra os dois turnos seguintes de graça.",
          damage: { normal: "2d6 + BC de PV por turno" },
          effect: "3 turnos: todo aliado que começar o turno dentro da área recupera PV. Sustentada sem concentração, um círculo por vez.",
          incantation:
            "Chão que eu marco com luz e não com giz, fica aceso enquanto for preciso, sem me pedir mais nada e sem exigir que eu volte aqui. Cura, devagar e sem pressa nenhuma, todos os que pisarem dentro de ti — inclusive os que eu não teria escolhido. Círculo de Recuperação!",
        },
        {
          id: "rejeitar-a-morte",
          name: "Rejeitar a Morte",
          reaction: true,
          paCost: 4,
          pmCost: 5,
          range: "9 metros",
          actions: { normal: 1 },
          costNote:
            "4 PA em vez dos 2 do Avançado comum. É uma das quatro Salvações do livro (Cap. 4, §4) — impede uma morte de verdade, não recupera PV numérico. Vale mais que qualquer magia de dano do mesmo rank porque a alternativa dela não é 'menos eficiente', é a ficha do aliado terminando ali.",
          effect: "1 Reação, quando um aliado visível chegaria a 0 PV: ele fica com 1 PV e pode se mover 4,5m imediatamente. Uma vez por criatura por combate.",
          incantation: "Não. Ainda não é hoje. Rejeitar a Morte!",
        },
        {
          id: "anestesia",
          name: "Anestesia",
          paCost: RANK_PA_COST.talent.Avançado,
          pmCost: 3,
          range: "Toque",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "10 minutos sem dor: ignora penalidades de ferimento/Exaustão, mas o Mestre para de informar os PV do alvo ao jogador.",
          incantation:
            "Dor, eu não te removo, porque tu és honesta e o corpo dele ainda precisa de ti pra saber quando parar. Eu só te peço licença pra ficares em silêncio um instante — o tempo exato pra que ele continue de pé sem saber o preço que está pagando por isso. Anestesia!",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d6+3",
      mastery: {
        name: "A Luz que Reconecta",
        description:
          "Você reimplanta membros recém-decepados (menos de 1h, ou a qualquer momento se a ferida estiver Selada). Não recria o que não existe mais. Magias de rank Avançado ou inferior em Conjuração Silenciosa sem penalidade. Mantém duas magias sustentadas.",
      },
      talents: [
        { id: "vigilia", name: "Vigília", paCost: RANK_PA_COST.talent.Santo, description: "Uma vez por combate, sua Prontidão não gasta Reação." },
      ],
      abilities: [
        {
          id: "cura-radiante",
          name: "Cura Radiante",
          signature: true,
          paCost: RANK_PA_COST.signature.Santo,
          pmCost: 10,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Santo,
          damage: { normal: "10d8 + BC de PV (20d8 + BC se Ferida Fresca)" },
          effect: "Reimplanta um membro recém-decepado. Remove todas as Marcas da Morte, Exaustão física, e Caído/Atordoado/Cego de origem traumática.",
          incantation:
            "Anjo dos milagres, concede o teu sopro sagrado ao coração que ainda pulsa diante de ti, e não te apresses a partir antes que o osso encontre o osso, antes que a carne esqueça que foi cortada, e antes que o membro que se foi lembre por onde deve voltar. Fica só mais um instante. Um instante teu vale um ano inteiro do meu. Cura Radiante!",
        },
        {
          id: "santuario-menor",
          name: "Santuário Menor",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 8,
          range: "Esfera de 9m",
          actions: MAGIC_ACTIONS.Santo,
          effect: "1 minuto: nenhum aliado na área recebe Marcas da Morte, e todo aliado que chegaria a 0 PV fica com 1 PV — uma vez cada. Cada uma dessas salvações consome uma das duas Salvações daquela criatura no combate (Cap. 4, §4, Duas Salvações por Combate).",
          incantation:
            "Dentro deste espaço a morte pede licença e espera do lado de fora, encostada na parede, com a paciência de quem sabe que vai receber todo mundo mais cedo ou mais tarde. Eu não a estou enganando, e não sou tolo o bastante pra achar que a estou vencendo: estou apenas dizendo, com todas as letras, que hoje não é o dia dela. Santuário Menor!",
        },
        {
          id: "corpo-de-ferro",
          name: "Corpo de Ferro",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 7,
          range: "Toque",
          actions: MAGIC_ACTIONS.Santo,
          effect: "10 minutos: +50 PV máximos e imunidade a acertos críticos.",
          incantation:
            "Carne que eu fecho com aço e não com ligadura, osso que eu forro por dentro com aquilo que não cede, pele que eu ensino a recusar o gume antes mesmo de sentir o corte: aprende agora, e de uma vez, a não ceder antes da hora certa. E quando a hora certa vier, cede devagar, pra que dê tempo de alguém te alcançar. Corpo de Ferro!",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Golpe Divino",
        description:
          "Você canaliza cura ofensivamente contra mortos-vivos, construtos e criaturas de mana corrompida: sofrem o valor curado como dano radiante, sem teste. Contra vivos normais, não funciona. Regenera membros perdidos desde que os ossos estejam disponíveis, não importa há quanto tempo.",
      },
      talents: [
        { id: "sopro-do-julgamento", name: "Sopro do Julgamento", paCost: RANK_PA_COST.talent.Rei, description: "Seu Golpe Divino passa a funcionar também contra demônios de linhagem antiga e criaturas de rank Deus corrompidas, com metade do dano." },
      ],
      abilities: [
        {
          id: "restauracao",
          name: "Restauração",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 15,
          range: "Toque",
          actions: MAGIC_ACTIONS.Rei,
          effect: "Ritual de 10 minutos. Regenera completamente um membro/olho/orelha/órgão perdido, desde que você tenha os ossos correspondentes. Não funciona contra perdas por magia Imperador ou superior.",
          incantation:
            "Osso que falta no lugar onde antes havia osso: eu sei exatamente onde tu estavas, e o corpo que te perdeu também sabe — ele só não consegue mais dizer em voz alta. Então digo eu, por ele, e digo devagar. Aqui. Era aqui. Volta pra este ponto, e traz contigo a lembrança de como a carne crescia à tua volta, de como o sangue te encontrava sem se perder, e de como a mão que dependia de ti se fechava sem precisar pensar antes. Restauração!",
        },
        {
          id: "julgamento",
          name: "Julgamento",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 12,
          range: "Esfera de 12m",
          actions: MAGIC_ACTIONS.Rei,
          damage: { normal: "10d8 + BC de dano radiante (mortos-vivos/construtos/corrompidos, sem teste)" },
          effect: "Aliados vivos na área recuperam 3d8 + BC de PV na mesma conjuração.",
          incantation:
            "Luz que és bênção pro inocente e brasa viva pro que já deveria estar morto e enterrado há muito tempo: eu não vou te pedir pra escolher um lado, porque tu escolheste o teu antes de eu nascer e não mudaste desde então. Queima o que corrompe esta terra, alimenta o que ainda respira em cima dela, e não confundas os dois — nem por pressa, nem por piedade, nem porque alguém aqui vai gritar que não é justo. Julgamento!",
        },
        {
          id: "milagre-menor",
          name: "Milagre Menor",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 12,
          range: "Toque",
          actions: MAGIC_ACTIONS.Rei,
          effect: "Remove uma condição de qualquer origem, inclusive Paralisia, Petrificação, Congelado e cegueira mágica. Exceção absoluta: veneno, doença e maldição continuam fora de alcance.",
          incantation:
            "Condição que prende o corpo e zomba de toda medicina comum, que ri do curandeiro de vila e do cirurgião de corte com a mesma facilidade e no mesmo tom: eu não vim discutir contigo, nem provar a ninguém que sei o teu nome de cor. Eu vim desfazer-te, aqui e agora, na frente de quem estiver olhando — porque a vida não foi feita pra ficar engessada, e porque alguém precisa dizer isso em voz alta de vez em quando. Milagre Menor!",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d8+4",
      mastery: {
        name: "Nada é Irreversível",
        description:
          "Você regenera membros perdidos independentemente de quanto tempo faz e sem precisar dos ossos. Suas magias de Cura curam o valor máximo dos dados contra Feridas Frescas, sem rolar. Uma vez por turno, conjure magia de Cura de rank Avançado ou inferior em Silenciosa sem gastar Ação.",
      },
      talents: [
        { id: "a-mao-que-nao-cansa", name: "A Mão que Não Cansa", paCost: RANK_PA_COST.talent.Imperador, description: "Uma vez por Descanso Longo, conjure qualquer magia de Cura pagando zero PM." },
      ],
      abilities: [
        {
          id: "corpo-integro",
          name: "Corpo Íntegro",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 25,
          range: "Toque",
          actions: MAGIC_ACTIONS.Imperador,
          effect:
            "Ritual de 1 hora. O alvo é restaurado à integridade física completa: membros, órgãos, sentidos e cicatrizes voltam ao estado original, não importa quando/como foram perdidos. PV restaurados, Exaustão removida. Não remove veneno, doença nem maldição; não funciona em quem foi pulverizado, petrificado permanentemente ou consumido por magia Imperador ou superior.",
          incantation:
            "Tempo, tu que levas tudo embora e que nunca pediste licença a ninguém pra fazê-lo: eu não vim te acusar de nada. Levar é o teu ofício, e tu o fazes melhor do que qualquer um de nós faz o seu. Mas hoje eu vim cobrar uma coisa só, e vou cobrá-la devagar, item por item, pra que não reste dúvida sobre o que estou pedindo. Devolve o membro. Devolve o órgão. Devolve o olho, o ouvido, e a pele que tu levaste num ano que ele já nem lembra mais qual foi. Devolve tudo, e devolve como se nunca tivesse ido — sem cicatriz, sem marca, e sem aquela dor fina que fica avisando quando o tempo vai mudar. Corpo Íntegro!",
        },
        {
          id: "santuario",
          name: "Santuário",
          ritual: true,
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 20,
          range: "Esfera de 30m",
          actions: { normal: 4 },
          effect:
            "Ritual (4 Ações). 1 minuto: nenhuma criatura viva na área pode morrer — ainda caem a 0 PV, mas não recebem Marcas da Morte e não podem ser mortas por efeito abaixo de rank Deus. Quando acaba, todo o dano acumulado é aplicado de uma vez. Você não pode conjurar outra magia enquanto ativo.",
          incantation:
            "Ninguém morre aqui enquanto eu estiver a cantar. Não é uma promessa, não é um pedido e não é uma oração dirigida a coisa nenhuma: é a descrição exata do que passa a ser verdade dentro destas paredes a partir do instante em que a minha voz encostar na última delas. Cai quem tiver que cair. Sangra quem tiver que sangrar. Mas atravessar a linha final, ninguém atravessa — e se a morte insistir, se ela entender que hoje é dia dela e vier assim mesmo, então ela vai me encontrar de pé na porta, cantando, e vai ter que passar por cima de mim primeiro. Santuário!",
        },
        {
          id: "luz-absoluta",
          name: "Luz Absoluta",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 25,
          range: "Esfera de 30m",
          actions: { normal: 3, silenciosa: 2 },
          costNote:
            "3 Ações em vez das 6 do rank Imperador, e 25 PM em vez de 22. É cura de emergência + dano apocalíptico na mesma magia: se um aliado está caindo e a horda de mortos-vivos rodeia, a Luz Absoluta não pode esperar dois turnos. A velocidade custa 3 PM extras, e o cântico encolhe junto — não há tempo pra poema quando o que pede a luz é a sobrevivência imediata.",
          damage: { normal: "20d8 de dano radiante" },
          effect: "Mortos-vivos e construtos com menos da metade dos PV máximos são destruídos automaticamente; os demais sofrem o dano. Todo aliado vivo na área recupera 10d8 + BC de PV.",
          incantation:
            "Luz. Agora.\nLuz Absoluta!",
        },
      ],
    },
  ],
};
