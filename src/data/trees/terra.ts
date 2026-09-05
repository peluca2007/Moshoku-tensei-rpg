import { Tree } from "@/lib/types";
import { MAGIC_ACTIONS, RANK_PA_COST } from "./shared";

export const TERRA_TREE: Tree = {
  id: "terra",
  name: "Magia de Terra",
  icon: "/arvores/terra.svg",
  category: "magia",
  subgroup: "Magia Ofensiva",
  mechanic: {
    tag: "Atolado → Soterrado",
    hook:
      "Prende primeiro, enterra depois. É a única escola que constrói, e o mago com mais PV do jogo.",
    loop: [
      "Atole. Metade das magias de Terra aplica Atolado: metade do Deslocamento naquele terreno, e o dobro do Deslocamento pra sair dele.",
      "Cobre. Bala de Pedra e Canhão de Pedra acertam AUTOMATICAMENTE contra alvo Atolado, sem rolagem de acerto.",
      "Enterre. Cárcere, Prisão de Pedra e Sepultamento convertem um alvo já Atolado em Soterrado — Deslocamento 0, Preso, sem visão nem gesto, sufocando a 2d10 por turno.",
    ],
    cost:
      "É a escola mais lenta do livro: Muro de Terra é um ritual de 3 Ações e nada aqui resolve um turno sozinho. Você compra controle e concreto, não velocidade.",
  },
  keyAttributeLabel: "Intelecto",
  resourceLabel: "PM",
  tagline:
    "Atolado e Soterrado, nessa ordem. Terra prende primeiro e enterra depois: quase toda magia da escola ou aplica Atolado, ou cobra o dobro de quem já está Atolado. Também é a única escola que constrói, e o mago com mais PV do jogo.",
  proficiencies: {
    armas: "Nenhuma além do padrão (armas simples, armadura leve).",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Escola Formal de Magia. Conjura com Intelecto (BC = Intelecto + Bônus de Rank).",
  },
  grantedSkills: {
    fixed: ["Arcanismo"],
    choose: { count: 1, from: ["Ofícios", "Atletismo", "Natureza"] },
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "Moldar",
        description:
          "Sem PM e sem Ação, você molda terra, areia, argila e pedra macia num raio de 9 metros: abrir/fechar buraco, degrau, tigela, parede baixa. Em 10 minutos você ergue um abrigo fortificado pro grupo inteiro. [Atolado] O chão que você moldou neste turno conta como terreno difícil para criaturas hostis.",
      },
      talents: [
        { id: "pele-de-pedra", name: "Pele de Pedra", paCost: RANK_PA_COST.talent.Principiante, description: "+4 PV por patamar seu em Terra. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela." , grants: { hpPerRank: 4 } },
        { id: "sentido-sismico", name: "Sentido Sísmico", paCost: RANK_PA_COST.talent.Principiante, description: "Você percebe pelo chão qualquer criatura em contato com o solo num raio de 18m, mesmo invisível ou escondida." },
        { id: "mineralogista", name: "Mineralogista", paCost: RANK_PA_COST.talent.Principiante, description: "Você identifica minérios e pedras preciosas, e sabe, ao tocar uma parede, o que existe atrás dela." },
      ],
      abilities: [
        {
          id: "bala-de-pedra",
          name: "Bala de Pedra",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 1,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "1d10 + BC (contundente)" },
          effect: "Ataque mágico à distância. Contra alvo Atolado, acerta automaticamente.",
          incantation:
            "Pó que já foi montanha, muito antes de virar caminho,\nlembra do peso que tinhas antes de aprender a ser pó, e vai.\nBala de Pedra!",
        },
        {
          id: "atoleiro",
          name: "Atoleiro",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "Esfera de 6m de raio",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Sem dano. Teste de Agilidade (CD 8 + BC) ou fica Atolado. Área permanece terreno difícil por 10 minutos.",
          incantation:
            "Terra firme, sê honesta uma vez na vida: nunca foste firme,\nsempre foste lama esperando a desculpa certa pra ceder.\nAtoleiro!",
        },
        {
          id: "muro-de-terra",
          name: "Muro de Terra",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "9 metros",
          actions: { normal: 3, encurtada: 2, silenciosa: 1 },
          ritual: true,
          costNote:
            "3 Ações em vez de 2, e Ritual: erguer 6 metros de parede sólida com 40 PV não é o mesmo gesto que atirar uma pedra. Toda outra magia Principiante deste livro é reação de combate; esta é engenharia, e engenharia leva tempo mesmo nas mãos de um mago.",
          effect: "Parede de 6m de largura por 3m de altura, meio metro de espessura, 40 PV, dura 10 minutos. Cobertura Total.",
          incantation:
            "Pedra que dorme sob meus pés, levanta-te devagar, camada sobre camada, até que nada do que vier atrás de mim passe por cima. Muro de Terra!",
        },
        {
          id: "lanca-de-pedra",
          name: "Lança de Pedra",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "9 metros",
          actions: MAGIC_ACTIONS.Principiante,
          damage: { normal: "2d6 (perfurante)" },
          effect: "Estacas irrompem sob até três criaturas. Teste de Agilidade (CD 8 + BC): falha sofre o dano e fica Atolado.",
          incantation:
            "Estacas que dormem sob o chão que eles pisam sem desconfiar de nada,\nacordem juntas, subam de uma vez, e não avisem antes.\nLança de Pedra!",
        },
        {
          id: "mao-de-terra",
          name: "Mão de Terra",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Principiante,
          effect: "Disputa de Força contra o seu BC. Se você vencer, o alvo fica Agarrado e Atolado, e pode ser arrastado 3m por turno.",
          incantation:
            "Mão que eu não tenho, mas o chão empresta: fecha os dedos de pedra\nem volta de quem fugiu sobre uma terra que não é dele.\nMão de Terra!",
        },
      ],
    },
    {
      rank: "Intermediário",
      hpDiceFormula: "1d6+3",
      mastery: {
        name: "Compressão",
        description:
          "Suas magias de projétil de Terra sobem um degrau de dado (d10 vira d12, 2d6 vira 2d8) e passam a ignorar Resistência a dano contundente. Você endurece qualquer estrutura sua gastando 1 PM: o Muro de Terra passa a ter 80 PV.",
      },
      talents: [
        { id: "municao-infinita", name: "Munição Infinita", paCost: RANK_PA_COST.talent.Intermediário, description: "Suas magias de projétil de Terra funcionam mesmo sobre madeira, metal, água ou vazio — você carrega o próprio material." },
        { id: "chao-meu", name: "Chão Meu", paCost: RANK_PA_COST.talent.Intermediário, description: "Você ignora a condição Atolado e terreno difícil de qualquer origem, inclusive de magias inimigas, e sai de Soterrado gastando 1 Ação sem precisar de teste." },
        { id: "escultor", name: "Escultor", paCost: RANK_PA_COST.talent.Intermediário, description: "Você reproduz em pedra qualquer coisa que já tenha visto, com precisão perfeita." },
      ],
      abilities: [
        {
          id: "canhao-de-pedra",
          name: "Canhão de Pedra",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 3,
          range: "90 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "3d8 + BC (contundente/perfurante)" },
          effect: "Ataque mágico à distância. Ignora metade da CA de armadura não-mágica. Contra alvo Atolado, acerta automaticamente e crita em 19-20.",
          incantation:
            "Pedra, esquece que és pedra. Esquece o peso, esquece o formato.\nSê a bala, e nada mais que a bala, até o momento do impacto.\nCanhão de Pedra!",
        },
        {
          id: "terremoto-menor",
          name: "Terremoto Menor",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 4,
          range: "Esfera de 12m de raio",
          actions: MAGIC_ACTIONS.Intermediário,
          damage: { normal: "3d6 + BC (contundente)" },
          effect: "Teste de Agilidade (CD 8 + BC). Falha: dano, Caído e Atolado. Estruturas de pedra sofrem dano dobrado.",
          incantation:
            "Chão que finge estar parado desde que o mundo se lembra de existir,\ntreme agora do jeito que finges nunca tremer, revela a mentira,\ne derruba quem confiou demais em ti.\nTerremoto Menor!",
        },
        {
          id: "carcere",
          name: "Cárcere",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "O primeiro degrau de Soterrado da escola: o chão se fecha em torno de um alvo que já esteja Atolado, Preso ou Caído e o engole até o pescoço. O alvo fica Soterrado (Cap. 4, §6). Contra um alvo que não esteja em nenhuma dessas condições, a magia só o deixa Atolado.",
          incantation:
            "Terra que já engoliu tanta coisa e nunca devolveu nenhuma delas, fecha-te agora em volta do pescoço dele, sobe devagar até o queixo, e não te apresses a devolver o que engoliste. Cárcere!",
        },
        {
          id: "fortaleza-rapida",
          name: "Fortaleza Rápida",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 4,
          range: "Raio de 9m",
          actions: MAGIC_ACTIONS.Intermediário,
          effect: "Em 1 Ação, você ergue um círculo de muralhas de 3m em volta do grupo, com abertura à sua escolha. 60 PV por seção, dura 1 hora.",
          incantation:
            "Pedra que dorme em todas as direções ao mesmo tempo, acorda inteira de uma vez\ne cerca este grupo como se sempre tivesse sido tua função.\nFortaleza Rápida!",
        },
      ],
    },
    {
      rank: "Avançado",
      hpDiceFormula: "1d8+3",
      mastery: {
        name: "Domínio Mineral",
        description:
          "Você manipula metal além de pedra: travar armadura, entortar lâmina, arrancar arma da mão a 9m (disputa de Força). Suas estruturas passam a ter o dobro dos PV e não podem ser derrubadas por dano de área. Desbloqueia Magia Combinada.",
      },
      talents: [
        { id: "segunda-bala", name: "Segunda Bala", paCost: RANK_PA_COST.talent.Avançado, description: "Uma vez por turno, ao conjurar Canhão de Pedra, você dispara duas pelo custo de uma. Alvos podem ser diferentes." },
        { id: "nucleo-de-ferro", name: "Núcleo de Ferro", paCost: RANK_PA_COST.talent.Avançado, description: "Você recebe Resistência a dano contundente, cortante e perfurante de armas não-mágicas enquanto estiver com os pés no chão." },
        { id: "arquiteto-de-guerra", name: "Arquiteto de Guerra", paCost: RANK_PA_COST.talent.Avançado, description: "Suas construções ficam permanentes se você gastar uma hora consolidando." },
      ],
      abilities: [
        {
          id: "chuva-de-meteoros",
          name: "Chuva de Meteoros",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 7,
          range: "Esfera de 18m de raio",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "8d8 + BC (contundente)" },
          effect: "Teste de Agilidade (CD 8 + BC), metade se passar. A área vira terreno difícil permanente; quem falhar fica Atolado nos escombros.",
          incantation:
            "O que está embaixo já esteve em cima, muito antes do céu decidir\nque as pedras eram dele e guardá-las longe do alcance de qualquer mão.\nEu não peço emprestado. Eu devolvo o que sempre foi teu, de uma só vez, sem aviso prévio.\nChuva de Meteoros!",
        },
        {
          id: "prisao-de-pedra",
          name: "Prisão de Pedra",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 6,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Avançado,
          effect: "Um bloco maciço encapsula o alvo, que fica Soterrado (Cap. 4, §6) e, além disso, surdo e incapaz de conjurar por qualquer via. O bloco tem 100 PV, e sair dele exige derrubá-lo — o teste de Força de Soterrado não serve aqui. Não exige que o alvo esteja Atolado antes: é a exceção do Avançado.",
          incantation:
            "Bloco que eu arranco do coração da montanha ainda quente do próprio peso, ainda pesado do que carregava:\nfecha-te em volta dele, apaga a luz, apaga o som, apaga o ar que ele respira sem merecer,\ncomo se ele nunca tivesse existido fora de ti.\nPrisão de Pedra!",
        },
        {
          id: "lamina-de-aco",
          name: "Lâmina de Aço",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 5,
          range: "27 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "6d8 + BC (perfurante)" },
          effect: "Dispara metal extraído do solo em linha, ignorando toda CA de armadura metálica.",
          incantation:
            "Minério que dorme fundo sob a terra sem saber que um dia seria espada nem que teria dono,\neu te acordo e te dou, num instante só, o formato que a mina levaria séculos inteiros pra te dar.\nLâmina de Aço!",
        },
        {
          id: "colapso",
          name: "Colapso",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 6,
          range: "45 metros",
          actions: MAGIC_ACTIONS.Avançado,
          damage: { normal: "8d6" },
          effect: "Uma estrutura à sua escolha desmorona. Criaturas embaixo fazem teste de Agilidade (CD 8 + BC) ou sofrem o dano e ficam Presas.",
          incantation:
            "Pedra sobre pedra, sustentada apenas pela promessa antiga de que ficaria de pé para sempre,\nfeita por gente que já morreu há muito tempo e não está aqui pra cumpri-la.\nEu retiro a promessa agora, sem aviso e sem cerimônia. Cai.\nColapso!",
        },
      ],
    },
    {
      rank: "Santo",
      hpDiceFormula: "1d8+4",
      mastery: {
        name: "O Chão Obedece",
        description:
          "Você molda terra, pedra e metal num raio de 1 km, sem PM, fora de combate. Em combate, gaste 1 Ação para reformular o campo de batalha (aliados escolhem se são afetados; inimigos não). Não pode ser derrubado, empurrado, agarrado nem teleportado contra a vontade enquanto tocar o solo. [Soterrado] Toda magia sua que aplicaria Atolado passa a aplicar Soterrado se o alvo já estiver Atolado.",
      },
      talents: [
        { id: "peso-absoluto", name: "Peso Absoluto", paCost: RANK_PA_COST.talent.Santo, description: "Uma vez por combate, sem gastar Ação, triplique o peso de um alvo visível. Teste de Força ou fica Atolado e Caído (Soterrado, se já estava Atolado); voadores caem do céu." },
      ],
      abilities: [
        {
          id: "falha-geologica",
          name: "Falha Geológica",
          signature: true,
          paCost: RANK_PA_COST.signature.Santo,
          pmCost: 11,
          range: "Linha de 90m × 6m",
          actions: MAGIC_ACTIONS.Santo,
          damage: { normal: "10d10 de dano de queda" },
          effect: "Teste de Agilidade com Desvantagem. Falha: cai na fenda e fica Presa no fundo. Sucesso: fica na borda, Atolada e Caída. Estruturas atravessadas desabam; a fenda é permanente.",
          incantation:
            "Placa que dorme há dez mil anos sob o peso de tudo que aprendeu a chamar de chão firme,\nsob cidades inteiras que nunca desconfiaram do que havia debaixo delas:\nacorda por dois segundos. Só dois. É tudo que eu preciso, e é tudo que vai sobrar em pé\nquando eu terminar de te acordar.\nFalha Geológica!",
        },
        {
          id: "golem",
          name: "Golem",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 9,
          range: "18 metros",
          actions: MAGIC_ACTIONS.Santo,
          effect: "Anima um corpo de pedra de 3m por 10 minutos: 80 PV, CA 16, ataca com seu BC causando 3d10+BC, obedece ordens simples sem gastar suas Ações. Um por vez.",
          incantation:
            "Corpo que eu moldo sem coração e sem medo nenhum pra colocar dentro dele,\nsem dor pra sentir e sem nome próprio pra chamar de seu:\nlevanta-te como se sempre tivesses andado, ainda que nunca tenhas dado um passo antes,\ne escuta apenas a minha voz, porque é a única que vais ouvir enquanto existires.\nGolem!",
        },
      ],
    },
    {
      rank: "Rei",
      hpDiceFormula: "1d10+4",
      mastery: {
        name: "Metal e Magma",
        description:
          "Metal: você conjura, molda e endurece aço puro — suas armas de pedra passam a contar como mágicas e ignoram Resistência. Magma: dano de magma ignora Resistência a ígneo e contundente ao mesmo tempo, e aplica Em Chamas mesmo em imunes.",
      },
      talents: [
        {
          id: "bala-imperial",
          name: "Bala Imperial",
          paCost: RANK_PA_COST.talent.Rei,
          description: "Seu Canhão de Pedra passa a rolar 8d8 e ignora toda CA de armadura, Cobertura e Manto de Touki. Em troca, custa 6 PM e não combina com Segunda Bala.",
        },
      ],
      abilities: [
        {
          id: "rio-de-magma",
          name: "Rio de Magma",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 14,
          range: "Linha de 45m × 9m",
          actions: MAGIC_ACTIONS.Rei,
          damage: { normal: "12d8 + BC de dano de magma no impacto, depois 6d10 por turno" },
          effect: "A área permanece coberta de magma por 10 minutos. Teste de Agilidade para metade — criaturas Atoladas não podem testar.",
          incantation:
            "Rio que corre bem lá embaixo, onde nem a raiz mais funda da árvore mais velha jamais ousou descer,\nonde a luz nunca chegou e o silêncio nunca foi quebrado por um único passo humano:\nsobe agora, encontra a superfície pela primeira vez em toda a tua longa existência subterrânea,\ne não te apresses a esfriar — fica quente o tempo suficiente pra que ninguém aqui jamais esqueça o teu nome.\nRio de Magma!",
        },
        {
          id: "muralha-do-fim",
          name: "Muralha do Fim",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 12,
          range: "Raio de 90m",
          actions: MAGIC_ACTIONS.Rei,
          effect: "Você ergue uma muralha de pedra e aço de 9 metros de altura, com 400 PV por seção. Permanente até ser destruída.",
          incantation:
            "Pedra e aço, que nunca concordaram em absolutamente nada em toda a história longa deste mundo até este exato momento em que eu falo,\nuni-vos agora, esquecei de vez a rixa antiga entre o que é lavrado da terra e o que é forjado a fogo em terra alheia,\ne formai uma única linha que separa, de uma vez por todas e sem meio-termo, o que fica de fora do que fica protegido para sempre e sem exceção.\nMuralha do Fim!",
        },
      ],
    },
    {
      rank: "Imperador",
      hpDiceFormula: "1d10+5",
      mastery: {
        name: "O Continente é Seu",
        description:
          "Você molda terra, pedra, metal e magma num raio de 10 km, permanentemente. Criaturas hostis em contato com o solo a até 30m estão permanentemente Atoladas, sem teste — e qualquer uma delas que comece o turno a até 9m de você fica Soterrada. Uma vez por turno, conjure magia de Terra Avançado ou inferior em Silenciosa sem gastar Ação.",
      },
      talents: [
        { id: "aquele-que-move-montanhas", name: "Aquele que Move Montanhas", paCost: RANK_PA_COST.talent.Imperador, description: "Uma vez por Descanso Longo, conjure qualquer magia de Terra pagando metade do PM, arredondado para baixo." },
      ],
      abilities: [
        {
          id: "sepultamento",
          name: "Sepultamento",
          signature: true,
          ritual: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 20,
          range: "Esfera de 45m",
          actions: MAGIC_ACTIONS.Imperador,
          damage: {
            normal: "16d10 de dano contundente",
            porTurno: "4d10 sufocando (substitui os 2d10 padrão da condição Soterrado)",
          },
          effect: "Teste de Força com Desvantagem Absoluta. Falha: dano e Soterrada, sufocando a 4d10 por turno em vez dos 2d10 normais da condição. Sucesso: metade do dano e Atolada. Aliados são poupados automaticamente.",
          incantation:
            "A terra recebe tudo de volta, cedo ou tarde, sempre, com ou sem a minha ajuda direta neste dia —\nesta é a única lei que ela jamais quebrou desde que o primeiro corpo caiu sobre ela e ela decidiu, em silêncio absoluto, ficar com ele para sempre e sem devolver.\nEu não decido o destino de ninguém aqui hoje. Eu só estou antecipando a data\nque já estava marcada desde o dia distante em que nasceram de pó e prometeram, sem qualquer convicção real, esquecer disso um dia qualquer no futuro distante.\nSepultamento!",
        },
        {
          id: "cordilheira",
          name: "Cordilheira",
          ritual: true,
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 18,
          range: "Raio de 3 km",
          actions: MAGIC_ACTIONS.Imperador,
          effect: "Você levanta ou derruba a geografia da região — montanha, vale, desfiladeiro. Efeito narrativo permanente: rotas mudam, exércitos são forçados a rodear.",
          incantation:
            "Este mapa está errado. Sempre esteve, desde o dia distante em que o primeiro cartógrafo\nolhou pra esta terra e achou, ingenuamente, que ela ficaria parada para sempre só porque ele desenhou um limite fino nela.\nEu vou corrigi-lo agora, com as próprias mãos e sem pedir licença a absolutamente ninguém.\nOnde havia planície, que se erga montanha; onde havia montanha, que se abra vale profundo;\ne que todo exército que planejou cuidadosamente a marcha de amanhã descubra, ao acordar,\nque a geografia inteira que memorizaram com tanto esforço já não existe mais.\nCordilheira!",
        },
      ],
    },
  ],
};
