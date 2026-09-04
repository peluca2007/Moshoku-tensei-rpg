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
  icon: "/arvores/invocacao.jpg",
  category: "magia",
  subgroup: "Invocação",
  mechanic: {
    tag: "Pacto",
    hook:
      "A menor lista de feitiços do mundo. O que você compra aqui não são magias — são relações, e elas agem sozinhas.",
    loop: [
      "Feche o Pacto. Cada Pacto comprado com PA é uma criatura específica que aceitou te servir; você mantém 1 ativo por vez no começo, mais nos ranks seguintes.",
      "Desenhe o círculo. A invocação padrão é a MAESTRIA, não uma compra: 10 minutos de preparo fora de combate e 3 PM. Invocar no meio da luta é outra coisa, custa 3 Ações e sai pela metade.",
      "Solte. O invocado dura 1 hora ou até cair a 0 PV, tem PV iguais a 10 × seu Bônus de Rank, usa o SEU BC para acertar e para CD, e age com 1 Ação e 1 Reação por turno — as dele, não as suas.",
    ],
    cost:
      "Você depende de preparo. Um invocador emboscado sem círculo pronto é um mago de armadura leve com meia dúzia de feitiços — e um invocado que cai não volta antes do próximo Descanso Longo.",
  },
  keyAttributeLabel: "Espírito",
  resourceLabel: "PM",
  tagline: "A menor lista de feitiços do mundo — o que você compra aqui não são feitiços, são relações (Pactos).",
  proficiencies: {
    armas: "Nenhuma além do padrão (armas simples, armadura leve).",
    pericias: "O Bônus de Rank desta árvore NÃO soma em perícia nenhuma — somar em perícia é exclusivo das três árvores de Utilidade (Cap. 3).",
    nota: "Escola Formal de Magia. Conjura com Espírito.",
  },
  grantedSkills: {
    fixed: ["Arcanismo"],
    choose: { count: 1, from: ["Natureza", "Lidar com Animais", "Religião"] },
  },
  ranks: [
    {
      rank: "Principiante",
      hpDiceFormula: "1d6+2",
      mastery: {
        name: "O Primeiro Círculo",
        description:
          "[Pacto] Você aprende a fechar acordos com criaturas invocáveis e a desenhar círculos — e a INVOCAR: com um círculo preparado (10 minutos, fora de combate) e 3 PM, você chama qualquer Pacto que tenha fechado. Isso é a Maestria, não uma compra: um invocador que gastou todo o PA em Pactos não pode ficar com um caderno de acordos e nenhuma forma de chamar ninguém. Mantém 1 Pacto ativo por vez (sobe nos ranks seguintes). Um invocado permanece 1 hora ou até cair a 0 PV (não pode ser invocado de novo até o próximo Descanso Longo). PV do invocado = 10 × seu Bônus de Rank e ele usa o seu BC para acertar e para CD. UM INVOCADO AGE COM 1 AÇÃO E 1 REAÇÃO POR TURNO — as dele, e não as suas três; ele não é um segundo personagem seu, é um aliado que obedece. Invocar um Pacto de patamar acima do Principiante custa +3 PM por patamar de diferença (Intermediário 6, Avançado 9, Santo 12, Rei 15). Você entende e é entendido por qualquer criatura com quem tenha Pacto, sem idioma comum.",
      },
      talents: [
        { id: "invocacao-de-emergencia", name: "Círculo Improvisado", paCost: RANK_PA_COST.talent.Principiante, description: "O Chamado de Emergência passa a custar 3 PM em vez de 6 — você aprendeu a traçar o círculo com o pé, no chão, enquanto recua. Não muda as 3 Ações nem a penalidade do invocado." },
        { id: "pacto-firmado", name: "Pacto Firmado", paCost: RANK_PA_COST.talent.Principiante, description: "O invocado que vier pelo Chamado de Emergência NÃO sofre a penalidade: chega com os PV cheios e o dano cheio. O acordo foi fechado firme o bastante pra valer mesmo às pressas." },
        { id: "ordem-partilhada", name: "Ordem Partilhada", paCost: RANK_PA_COST.talent.Principiante, description: "Ceda uma das suas 3 Ações a um invocado seu: ele age uma vez a mais neste turno. Não custa PM e não gasta a Reação dele. É a única forma de um invocado agir duas vezes no mesmo turno, e o preço é você agir uma vez a menos." },
        { id: "pacto-filhote", name: "Pacto: Filhote Evolutivo", paCost: RANK_PA_COST.talent.Principiante, description: "Você invoca um filhote de fera (1d4 garras, PV = 10 × seu Bônus de Rank). Ele não luta, mas pode executar uma Ação de ajuda por turno. É o mais fraco dos Pactos de 1º patamar de propósito: é o único que EVOLUI, e no Avançado ele passa todos os outros (4d8, PV = 25 × Bônus de Rank, Resistência a dano físico)." },
        { id: "pacto-cao-de-caca", name: "Pacto: Cão de Caça", paCost: RANK_PA_COST.talent.Principiante, description: "Mordida 2d6, faro apurado (Vantagem em Sobrevivência para rastrear) e pode Derrubar em vez de causar dano. É o Pacto de briga do 1º patamar — não chega perto do Urso das Cavernas do 2º, e não deveria." },
        { id: "pacto-corvo-mensageiro", name: "Pacto: Corvo Mensageiro", paCost: RANK_PA_COST.talent.Principiante, description: "Bico 1d6, voa 18m e entrega uma mensagem falada a qualquer pessoa que você já tenha visto, num raio de um dia de viagem. Enquanto estiver no ar, você tem Vantagem em Percepção visual pela linha de visão dele." },
        { id: "pacto-fogo-fatuo", name: "Pacto: Fogo-Fátuo", paCost: RANK_PA_COST.talent.Principiante, description: "Não ataca. Ilumina 9m, atravessa qualquer fresta, e ao tocar uma criatura hostil (1 Ação dele) marca-a: o próximo ataque de aliado contra ela tem Vantagem. É o Pacto de quem invoca para o grupo, não para si." },
      ],
      abilities: [
        {
          id: "chamado",
          costNote:
            "3 Ações em vez das 2 da tabela do rank — e é o turno inteiro, de propósito. A invocação com círculo é gratuita e mora na Maestria; esta aqui existe pra quando não houve tempo de desenhar círculo nenhum. Se ela custasse o padrão do rank, o círculo de 10 minutos não teria função, e a fraqueza declarada da escola (\"um invocador emboscado sem círculo pronto é um mago de armadura leve\") deixaria de existir.",
          name: "Chamado de Emergência",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 6,
          range: "Pessoal",
          actions: { normal: 3 },
          effect:
            "3 Ações e 6 PM: invoca um Pacto seu NO MEIO DA LUTA, sem círculo nenhum. O invocado surge com METADE dos PV e METADE do dano — foi chamado às pressas, e o acordo não teve tempo de assentar. Ele age a partir do próximo turno, com 1 Ação e 1 Reação por turno, como qualquer invocado. O talento Círculo Improvisado baixa o custo para 3 PM; o talento Pacto Firmado tira a penalidade de PV e de dano. Invocar um Pacto de patamar acima do Principiante custa o mesmo adicional da Maestria (+3 PM por patamar de diferença).",
          incantation: "Eu não te ordeno e não te compro: eu te chamo pelo nome que nós dois combinamos, e espero que venhas porque prometeste vir. Chamado!",
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
        { id: "evolucao-forma-media",
          requires: ["pacto-filhote"], name: "Evolução: Forma Média", paCost: RANK_PA_COST.talent.Intermediário, description: "Requer Pacto: Filhote Evolutivo. Seu filhote cresce (Médio): garras 2d8 + BC, PV = 15 × seu Bônus de Rank, e aprende um truque de combate (pode Derrubar ou Desarmar com 1 Ação)." },
        { id: "evolucao-sentidos-agucados",
          requires: ["pacto-filhote"], name: "Evolução: Sentidos Aguçados", paCost: RANK_PA_COST.talent.Intermediário, description: "Requer Pacto: Filhote Evolutivo. Seu filhote ganha visão no escuro 18m, faro aguçado (Vantagem em Percepção) e transmite alertas telepáticos pra você." },
        { id: "vinculo-concentrado", name: "Vínculo Concentrado", paCost: RANK_PA_COST.talent.Intermediário, description: "Você pode focar toda a mana de múltiplos invocados em um único pacto ativo. Se invocar apenas uma criatura gastando o PM total que você teria disponível para o seu limite de invocação atual (ex: 2 invocados = gasta PM de 2), o bicho ganha: +2d no dado de dano, +10 PV por Bônus de Rank e Resistência a dano mágico." },
        { id: "pacto-urso-das-cavernas", name: "Pacto: Urso das Cavernas", paCost: RANK_PA_COST.talent.Intermediário, description: "4d10 garra, Grande, empurra 3m a cada acerto. Absorve dano por você." },
        { id: "pacto-serpente-de-nevoa", name: "Pacto: Serpente de Névoa", paCost: RANK_PA_COST.talent.Intermediário, description: "Ataque com veneno (Vigor ou Envenenado). Move-se por qualquer fresta; invisível em terreno enevoado." },
        { id: "pacto-espirito-do-vento", name: "Pacto: Espírito do Vento", paCost: RANK_PA_COST.talent.Intermediário, description: "Não ataca. Concede Voo (18m) a um aliado que ele toque, enquanto durar a invocação." },
        { id: "pacto-grifo", name: "Pacto: Grifo", paCost: RANK_PA_COST.talent.Intermediário, description: "Voa 24m, 3d10 garra, e carrega uma pessoa." },
        { id: "sangue-no-circulo", name: "Sangue no Círculo", paCost: RANK_PA_COST.talent.Intermediário, description: "Você pode pagar o PM de uma invocação com PV, na razão de 2 PV por 1 PM." },
        { id: "vontade-firme", name: "Vontade Firme", paCost: RANK_PA_COST.talent.Intermediário, description: "Invocados seus são imunes a Amedrontado e não podem ser dominados, expulsos ou dissipados por efeito de patamar inferior ao do próprio Pacto invocado." },
      ],
      abilities: [
        {
          id: "retorno-invocacao",
          costNote:
            "1 Ação em vez das 2 da tabela do rank. A Invocação é a única escola do livro cujo custo em Ações não escala com o rank, e é de propósito: o preparo dela acontece FORA de combate, no círculo de 10 minutos. O que sobra pra mesa é só o gesto de puxar o fio do Pacto — e um gesto não fica mais lento porque o invocado ficou mais forte. O rank desta escola mede COM QUEM você fechou acordo, não quanto tempo leva pra chamar.",
          name: "Retorno",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 2,
          range: "90 metros",
          actions: { normal: 1 },
          effect: "Um invocado seu volta imediatamente para o círculo, ou é dispensado. Se dispensado antes de chegar a 0 PV, pode ser chamado de novo neste mesmo dia.",
          incantation:
            "Familiar que cumpriu o seu dever neste campo de batalha, desfaça o seu corpo físico e retorne em paz para o descanso das brumas até que o meu chamado te convoque novamente. Retorno!",
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
        { id: "convocacao-aprimorada", requires: ["invocacao-de-emergencia"], name: "Convocação Aprimorada", paCost: RANK_PA_COST.talent.Avançado, description: "Requer Círculo Improvisado. O Chamado de Emergência passa a custar 1 Ação em vez de 3 — no Avançado a Maestria já dispensou o círculo desenhado, e o que sobrava de lento era o gesto. Não muda o PM nem a penalidade: quem quer o invocado inteiro compra Pacto Firmado." },
        { id: "evolucao-forma-imortal",
          requires: ["evolucao-forma-media"], name: "Evolução: Forma Suprema", paCost: RANK_PA_COST.talent.Avançado, description: "Requer Evolução: Forma Média. Seu filhote atinge o auge (Grande ou Voador): 4d8 dano elementar ou físico, PV = 25 × seu Bônus de Rank, ganha Resistência a dano físico e pode conjurar uma magia menor da sua árvore." },
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
          incantation:
            "Pelo elo de sangue e mana que nos une através do círculo de pacto, troque a sua posição com a minha no piscar de um olho e receba o impacto que era destinado a mim neste momento crucial. Substituição!",
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
          incantation:
            "Este círculo não é uma jaula, e nunca foi — é uma porta que eu desenho com a minha própria mana pra que tu não precises abrir caminho sozinho do outro lado. Eu marco o chão, marco a hora combinada, marco o preço que já foi pago entre nós dois, e agora só me resta ficar de pé aqui e esperar o som dos teus passos chegando de um lugar que não tem chão. Círculo de Convocação!",
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
          costNote:
            "1 Ação em vez das 5 da tabela do rank. A Invocação é a única escola do livro cujo custo em Ações não escala com o rank, e é de propósito: o preparo dela acontece FORA de combate, no círculo de 10 minutos. O que sobra pra mesa é só o gesto de puxar o fio do Pacto — e um gesto não fica mais lento porque o invocado ficou mais forte. O rank desta escola mede COM QUEM você fechou acordo, não quanto tempo leva pra chamar.",
          name: "Troca de Lugares",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 12,
          range: "Alcance ilimitado",
          actions: { normal: 1 },
          effect: "Você e um invocado seu trocam de posição instantaneamente, em qualquer lugar do mundo.",
          incantation:
            "Existe um fio entre nós dois desde o dia em que fechamos o acordo, e esse fio nunca se importou com a distância — ele só se importa com quem puxa primeiro. Eu puxo agora. Toma o meu lugar neste chão, com o meu peso, o meu perigo e a lâmina que já vinha vindo, e devolve-me o teu, com tudo o que houver de errado nele. Não é fuga e não é covardia: é o que dois que confiam um no outro fazem quando um dos dois ainda tem fôlego e o outro já não tem mais nenhum. Troca de Lugares!",
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
          incantation:
            "Durante toda a minha vida eu chamei pedindo, e vocês vieram porque quiseram vir. Mas existe uma hora, uma só, em que pedir não basta, e é a hora em que aquilo que está do outro lado da porta é grande demais pra que qualquer um de nós dois sobreviva sozinho a ele. Esta é essa hora. Então hoje eu não estou pedindo. Eu estou dizendo o teu nome inteiro, do primeiro som ao último, do jeito exato que só consegue dizer quem estava lá no dia em que ele te foi dado — e o mundo, que respeita nomes acima de qualquer outra coisa, vai te trazer aqui queiras tu ou não. Depois nós dois acertamos as contas. O Chamado que Não se Recusa!",
        },
        {
          id: "corpo-emprestado",
          costNote:
            "1 Ação em vez das 6 da tabela do rank. A Invocação é a única escola do livro cujo custo em Ações não escala com o rank, e é de propósito: o preparo dela acontece FORA de combate, no círculo de 10 minutos. O que sobra pra mesa é só o gesto de puxar o fio do Pacto — e um gesto não fica mais lento porque o invocado ficou mais forte. O rank desta escola mede COM QUEM você fechou acordo, não quanto tempo leva pra chamar.",
          name: "Corpo Emprestado",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 18,
          range: "Pessoal",
          actions: { normal: 1 },
          effect:
            "Por 10 minutos, você transfere sua consciência para o corpo de um invocado, usando os PV, ataques e sentidos dele; seu corpo fica inconsciente e protegido pelo círculo. Se o corpo emprestado morrer, você volta com 1 PV e um nível de Exaustão.",
          incantation:
            "Um pacto começa como um acordo entre dois que continuam sendo dois, e é assim que ele fica por anos, por décadas, por uma vida inteira de invocações e despedidas educadas na porta do círculo. Mas há um último degrau que quase ninguém sobe, e ele não se sobe com mana nem com estudo: sobe-se com confiança, e confiança não se compra em lugar nenhum. Eu te ofereço este corpo, com os ossos que ele tem e as cicatrizes que ele carrega sem esconder de ti, e peço em troca o teu — não pra te usar, mas pra que, por um instante só, não exista mais diferença entre a minha vontade e a tua força. Vem. Não vou fechar a porta atrás de ti. Corpo Emprestado!",
        },
      ],
    },
  ],
};
