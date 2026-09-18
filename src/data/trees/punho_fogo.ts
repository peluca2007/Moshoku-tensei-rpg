import { Tree } from "@/lib/types";
import { RANK_PA_COST } from "./shared";

/**
 * Punho do Fogo (Híbrida: Lutador + Magia de Fogo)
 * Identidade: "O Fogo e o Lutador que você já tem, no mesmo soco."
 *
 * ## Rework de 2026-09-16 — o Calor saiu, e nada entrou no lugar
 *
 * A revisão de design achou a árvore ilegível: três recursos ao mesmo tempo
 * (PT, PM e Calor), técnicas de Corpo pagas em PM, quatro talentos com o nome
 * da própria Maestria e efeito diferente, cinco condições que o livro nunca
 * definiu (Lento, Queimadura Severa, Exaustão Térmica, Vulnerabilidade,
 * Medo/Pânico), um dreno de 2 de Força e Agilidade por turno num sistema em
 * que o atributo começa em 0 a 2, e o maior dano por Ação do livro.
 *
 * A diretriz do autor: quem chega aqui JÁ TEM Magia de Fogo e Lutador na
 * ficha. Então a árvore não inventa recurso nem condição — ela junta os dois:
 *
 * 1. ACENDA     — todo soco que acerta aplica Em Chamas (a condição do Fogo).
 * 2. QUEBRE     — soco em alvo JÁ Em Chamas aplica também Quebrantado (a do
 *                 Lutador). O primeiro golpe acende; os seguintes desmontam.
 * 3. SOBRECARGA — técnicas custam PT, como no Lutador; pagar 2 PM a mais (a
 *                 reserva que o Fogo já dá) acende o efeito extra. Um número só.
 *
 * O Imperador ganhou a ideia de "pegar fogo de propósito": enquanto você mesmo
 * queima, toda Sobrecarga sai de graça — o recurso é o próprio corpo.
 *
 * Os ids das habilidades e talentos não mudaram, pra que fichas salvas e as
 * artes de `midiaDeHabilidade.ts` continuem apontando pro lugar certo.
 */
export const PUNHO_DE_FOGO_TREE: Tree = {
  id: "punho-de-fogo",
  name: "Punho do Fogo",
  icon: "/arvores/punho-de-fogo.png",
  category: "corpo",
  subgroup: "Híbrida (Lutador + Magia de Fogo)",
  mechanic: {
    tag: "Soco Aceso",
    hook:
      "Não é uma árvore nova: é o Fogo e o Lutador que você já tem, no mesmo soco. Nenhum recurso novo, nenhuma condição nova.",
    loop: [
      "Acenda. Todo soco que acerta deixa o alvo Em Chamas — a condição da Magia de Fogo.",
      "Quebre. Se o alvo já estava Em Chamas, o soco também aplica 1 acúmulo de Quebrantado — a condição do Lutador. O primeiro golpe acende; os seguintes desmontam.",
      "Sobrecarregue. As técnicas custam PT, como no Lutador. Pague 2 PM a mais, da reserva que o seu Fogo já te dá, e ela sai com o efeito extra.",
      "No Imperador, pegue fogo de propósito: enquanto você mesmo queima, toda Sobrecarga sai de graça.",
    ],
    cost:
      "É híbrida e escondida: exige rank Intermediário em Magia de Fogo E em Lutador antes de existir. Quase tudo aqui é corpo a corpo, e contra quem é imune a fogo o ciclo quebra no primeiro passo: sem Em Chamas não há Quebrantado.",
  },
  hiddenFromCreation: true,
  prerequisiteNote: "Pré-requisito: Rank Intermediário em Magia de Fogo e em Lutador.",
  keyAttributeLabel: "Força ou Intelecto",
  resourceLabel: "PT / PM",
  tagline: "O golpe não termina no impacto: o primeiro soco acende, os seguintes desmontam.",
  rankLabels: {
    Principiante: "Iniciante",
    Intermediário: "Aspirante",
    Avançado: "Veterano",
    Santo: "Mestre das Chamas",
    Rei: "Rei do Fogo",
    Imperador: "Imperador Magmático",
    Deus: "Deus do Fogo Marcial",
  },
  proficiencies: {
    armas: "Grupo Desarmado e Improvisado (Dado Base d6 no punho). Armadura leve; proíbe armadura pesada (desliga a árvore).",
    gruposDeArma: ["desarmado-e-improvisado"],
    pericias: "—",
    nota: "Ofício do Corpo + Fogo. Usa Força ou Intelecto. As técnicas custam PT; a Sobrecarga custa 2 PM, pagos da reserva que a sua Magia de Fogo já te dá.",
  },
  ranks: [
    // ===================== PRINCIPIANTE =====================
    {
      rank: "Principiante",
      hpDiceFormula: "1d10+3",
      weaponDieSteps: 1,
      mastery: {
        name: "Soco Aceso",
        description:
          "[Soco Aceso] Esta árvore junta as duas que você já tem, e não inventa recurso nenhum. " +
          "O ATRIBUTO: nesta árvore, BC = o maior entre Força e Intelecto + o seu Bônus de Rank no Punho do Fogo — nunca o Rank da Magia de Fogo. É o que faz dela uma árvore do Corpo que escala por BC sem virar escola de magia: o punho do lutador bruto e o do estudioso chegam no mesmo lugar por caminhos diferentes. " +
          "ACENDA — todo ataque desarmado seu que acerta deixa o alvo Em Chamas. " +
          "QUEBRE — se o alvo JÁ estava Em Chamas, o soco também aplica 1 acúmulo de Quebrantado. O teto de Quebrantado dos seus socos é o maior Bônus de Rank entre Punho do Fogo e Lutador (o dobro do Bônus de Rank do Lutador, se você tiver o Avançado dele). Um soco que acerta alvo Em Chamas conta como tendo aplicado Quebrantado, mesmo com o alvo no teto. " +
          "SOBRECARREGUE — toda técnica desta árvore custa PT e tem uma Sobrecarga: pague 2 PM a mais ao usá-la e ela sai com o efeito extra. " +
          "Não existe quarta regra.",
      },
      talents: [
        { id: "sangue-quente", name: "Sangue Quente", paCost: RANK_PA_COST.talent.Principiante, description: "Você tem Resistência a dano de frio e não sofre penalidade de clima gelado." },
        { id: "maos-de-brasa", name: "Mãos de Brasa", paCost: RANK_PA_COST.talent.Principiante, description: "Seus punhos iluminam 6 metros quando você quiser e acendem qualquer coisa inflamável ao toque." },
        { id: "calor-interno", name: "Calor Interno", paCost: RANK_PA_COST.talent.Principiante, description: "+4 PV por patamar seu nesta árvore. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nela.", grants: { hpPerRank: 4 } },
      ],
      abilities: [
        {
          id: "centelha-do-iniciante",
          name: "Centelha do Iniciante",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          ptCost: 1,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "Dado de arma + 1d6 (ígneo)", condicional: "+2d6 ígneo ao Sobrecarregar" },
          effect: "Soco que acende. Se o alvo já estava Em Chamas, aplica 2 acúmulos de Quebrantado em vez de 1. Sobrecarga: +2d6 ígneo.",
        },
        {
          id: "passo-de-brasa",
          name: "Passo de Brasa",
          paCost: RANK_PA_COST.common.Principiante,
          ptCost: 1,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "Investida propulsada a fogo: desloque-se até 9m em linha reta sem provocar ataque de oportunidade. Conta como corrida pro Momento do Lutador. Sobrecarga: toda criatura cujo espaço você atravessou fica Em Chamas.",
        },
        {
          id: "chicote-de-fumaca",
          name: "Chicote de Fumaça",
          paCost: RANK_PA_COST.common.Principiante,
          ptCost: 1,
          range: "Linha de 6m x 1,5m",
          actions: { normal: 1 },
          effect: "Golpe de palma que solta uma nuvem de fuligem. Teste de Vigor (CD 8 + BC) ou o alvo fica Cego até o fim do próximo turno dele. Sobrecarga: a linha vira 9m, e quem falhar também fica Em Chamas.",
        },
      ],
    },
    // ===================== INTERMEDIÁRIO =====================
    {
      rank: "Intermediário",
      hpDiceFormula: "1d10+4",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "Fornalha Interna",
        description:
          "Seus socos ignoram Resistência a dano ígneo. Atiçar: uma vez por turno, quando um soco seu aplicar Quebrantado, o Em Chamas do alvo queima na hora, além de queimar no turno dele.",
      },
      talents: [
        { id: "fornalha-interna", name: "Fôlego de Fornalha", paCost: RANK_PA_COST.talent.Intermediário, description: "+1 PT por patamar seu no Punho do Fogo. Aplicado sozinho na ficha, e cresce a cada patamar novo que você abrir nele.", grants: { ptPerRank: 1 } },
      ],
      abilities: [
        {
          id: "sopro-do-forja",
          name: "Sopro do Forja",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          ptCost: 2,
          range: "Cone de 6 metros",
          actions: { normal: 1 },
          damage: { normal: "3d6 + BC (ígneo)" },
          effect: "Gancho giratório. Teste de Agilidade (CD 8 + BC): falha sofre o dano, é empurrada 3m e fica Em Chamas; sucesso, metade do dano. Sobrecarga: quem falhar também fica Atolado no chão derretido até o fim do próximo turno dele.",
        },
        {
          id: "pele-de-cinzas",
          name: "Pele de Cinzas",
          paCost: RANK_PA_COST.common.Intermediário,
          ptCost: 1,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 minuto: quem te atingir com ataque corpo a corpo fica Em Chamas. Sobrecarga: e sofre 2d6 ígneo na hora.",
        },
        {
          id: "circulo-de-cinzas",
          name: "Círculo de Cinzas",
          paCost: RANK_PA_COST.common.Intermediário,
          ptCost: 2,
          range: "Esfera de 4,5m",
          actions: { normal: 1 },
          damage: { normal: "2d6 + BC (ígneo)" },
          effect: "Rasteira giratória. Teste de Agilidade (CD 8 + BC): falha sofre o dano, fica Caída e Em Chamas; sucesso, metade do dano. Sobrecarga: o chão fica em brasa por 2 turnos — terreno difícil, e quem começar o turno nele fica Em Chamas.",
        },
      ],
    },
    // ===================== AVANÇADO =====================
    {
      rank: "Avançado",
      hpDiceFormula: "1d12+4",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "Punho de Nova",
        description:
          "Você veste o Manto de Touki e destrava as manobras de gasto. Encadeamento: no turno em que Sobrecarregar uma técnica, o seu próximo ataque desarmado neste turno não gasta Ação. " +
          "Soco de Nova: uma vez por combate, com 1 Ação, apague o Em Chamas de todos os inimigos a até 3m de você — cada um sofre 1d10 ígneo por acúmulo de Quebrantado que carrega (teste de Agilidade, CD 8 + BC, para metade).",
      },
      talents: [
        { id: "combustao-reativa", name: "Combustão Reativa", paCost: RANK_PA_COST.talent.Avançado, description: "Quando você sofrer um acerto crítico ou ficar Atordoado, todo inimigo adjacente a você fica Em Chamas e é empurrado 3m." },
      ],
      abilities: [
        {
          id: "lotus-carmesim",
          name: "Lótus Carmesim",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          ptCost: 2,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "Dado de arma rolado três vezes (três socos)", condicional: "+3d6 ígneo ao Sobrecarregar" },
          effect: "Três socos rápidos contra o mesmo alvo, com rolagens separadas — o primeiro que acerta acende, os seguintes quebram. Se o 3º acertar, teste de Vigor (CD 8 + BC) ou o alvo fica Atordoado até o fim do próximo turno dele. Sobrecarga: o 3º soco apaga o Em Chamas do alvo numa explosão de +3d6 ígneo.",
        },
        {
          id: "impacto-meteorico",
          name: "Impacto Meteórico",
          paCost: RANK_PA_COST.common.Avançado,
          ptCost: 2,
          range: "9 metros",
          actions: { normal: 1 },
          damage: { normal: "4d8 + BC (ígneo e contundente)", porTurno: "2d6 (ígneo) por turno a quem entrar na cratera de magma" },
          effect: "Salte até 9m e caia sobre um ponto: toda criatura a até 3m dele faz teste de Agilidade (CD 8 + BC) — falha sofre o dano, fica Caída e Em Chamas; sucesso, metade do dano. Sobrecarga: a cratera vira magma por 2 turnos — terreno difícil, e quem entrar ou começar o turno nela sofre 2d6 ígneo.",
        },
        {
          id: "lanca-incandescente",
          name: "Lança Incandescente",
          paCost: RANK_PA_COST.common.Avançado,
          ptCost: 2,
          range: "18 metros",
          actions: { normal: 1 },
          damage: { normal: "4d6 + BC (ígneo)" },
          effect: "O único golpe à distância da árvore: um feixe disparado dos dedos, que ignora o bônus de CA de armadura de metal e deixa o alvo Em Chamas. Sobrecarga: atravessa o alvo e atinge até 2 criaturas atrás dele na linha, com metade do dano.",
        },
      ],
    },
    // ===================== SANTO =====================
    {
      rank: "Santo",
      hpDiceFormula: "1d12+5",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "Chama Eterna",
        description:
          "Você é imune a dano ígneo e à condição Em Chamas. Uma vez por turno, quando um soco seu aplicar Quebrantado num alvo Em Chamas, você recupera 1 PT.",
      },
      talents: [
        { id: "chama-eterna", name: "Brasa Funda", paCost: RANK_PA_COST.talent.Santo, description: "O Em Chamas que você aplica queima 1d10 em vez de 1d8." },
      ],
      abilities: [
        {
          id: "fogo-purificador",
          name: "Fogo Purificador",
          signature: true,
          paCost: RANK_PA_COST.signature.Santo,
          ptCost: 3,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Aura de fogo branco até o início do seu próximo turno: projéteis mundanos disparados contra você viram cinza antes de acertar, e quem te atacar corpo a corpo fica Em Chamas. Sobrecarga: a aura cobre também os aliados a até 6m.",
        },
        {
          id: "punho-da-condenacao",
          name: "Punho da Condenação",
          paCost: RANK_PA_COST.common.Santo,
          ptCost: 3,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "6d8 + BC (ígneo)" },
          effect: "Golpe que injeta calor no sangue. Teste de Vigor (CD 8 + BC): falha sofre o dano e fica Paralisado até o fim do próximo turno dele; sucesso, metade do dano. Se o alvo já estava Em Chamas e falhar, ele também recebe acúmulos de Quebrantado iguais ao seu Bônus de Rank. Sobrecarga: o teste tem Desvantagem.",
        },
        {
          id: "prisao-de-purgatorio",
          name: "Prisão de Purgatório",
          paCost: RANK_PA_COST.common.Santo,
          ptCost: 3,
          range: "18 metros",
          actions: { normal: 2 },
          damage: { normal: "3d8 ígneo/turno" },
          effect: "Um anel de fogo de 9m de diâmetro em volta de um ponto, por 3 turnos. Quem estiver dentro ou atravessar a parede sofre 3d8 ígneo no início de cada turno seu e fica Em Chamas. Sobrecarga: o anel dura 1 minuto.",
        },
      ],
    },
    // ===================== REI =====================
    {
      rank: "Rei",
      hpDiceFormula: "2d8+5",
      weaponDieSteps: 2,
      ptGained: 1,
      mastery: {
        name: "Presença do Vulcão",
        description:
          "Todo inimigo que começar o turno a até 9m de você fica Em Chamas. Contra alvos Em Chamas, seus ataques desarmados têm +2 no acerto.",
      },
      talents: [
        { id: "presenca-do-vulcao", name: "Vulcão Largo", paCost: RANK_PA_COST.talent.Rei, description: "A Presença do Vulcão alcança 18 metros em vez de 9." },
      ],
      abilities: [
        {
          id: "trono-de-chamas",
          name: "Trono de Chamas",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          ptCost: 4,
          range: "Esfera de 18m",
          actions: { normal: 2 },
          damage: { normal: "4d10 + BC/turno (ígneo)" },
          effect: "Um domínio de magma centrado em você, por 1 turno. Todo inimigo que começar o turno na área sofre o dano (teste de Vigor, CD 8 + BC, para metade) e fica Em Chamas. Sobrecarga: pagando os 2 PM de novo no início de cada turno seu, o domínio continua, por até 1 minuto.",
        },
        {
          id: "coroa-solar",
          name: "Coroa Solar",
          paCost: RANK_PA_COST.common.Rei,
          ptCost: 3,
          range: "Pessoal",
          actions: { normal: 1 },
          damage: { normal: "3d10 (ígneo)" },
          effect: "Um halo de fogo por 3 turnos. Uma vez por turno, sem gastar a sua Reação, quando um inimigo a até 9m fugir de você ou atacar um aliado seu, o halo dispara nele: o dano, ignorando Cobertura, e Em Chamas. Sobrecarga: o halo dura 1 minuto.",
        },
        {
          id: "avatar-das-cinzas",
          name: "Avatar das Cinzas",
          paCost: RANK_PA_COST.common.Rei,
          ptCost: 4,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Dois braços gigantes de magma por 1 minuto: seu alcance corpo a corpo aumenta em 3m, você agarra criaturas de qualquer tamanho, e seus ataques contam como armas de cerco contra estruturas. Sobrecarga: uma vez por turno, como Reação, os braços cobrem um aliado a até 6m e anulam contra ele o dano de um efeito de área.",
        },
      ],
    },
    // ===================== IMPERADOR =====================
    {
      rank: "Imperador",
      hpDiceFormula: "2d10+6",
      weaponDieSteps: 1,
      ptGained: 1,
      mastery: {
        name: "O Corpo É o Pavio",
        description:
          "Você pode pegar fogo de propósito. Com 1 Ação, você fica Em Chamas por vontade própria: sofre 2d10 ígneo no início de cada turno seu, e a sua imunidade a fogo não protege disso — é o seu próprio corpo queimando. " +
          "Enquanto queimar assim, toda técnica desta árvore sai com a Sobrecarga de graça, sem pagar PM. " +
          "Apagar-se custa 1 Ação e explode: todo inimigo a até 6m sofre 1d10 ígneo por turno que você passou queimando, até 10d10 (teste de Agilidade, CD 8 + BC, para metade).",
      },
      talents: [
        { id: "soberania-termica", name: "Beber o Fogo", paCost: RANK_PA_COST.talent.Imperador, description: "Uma vez por turno, quando um efeito de fogo de uma criatura hostil te atingir, você o absorve: não sofre o efeito e recupera PT iguais ao seu Bônus de Rank." },
      ],
      abilities: [
        {
          id: "erupcao-do-soberano",
          name: "Erupção do Soberano",
          signature: true,
          paCost: RANK_PA_COST.signature.Imperador,
          ptCost: 5,
          range: "Esfera de 30m",
          actions: { normal: 2 },
          damage: {
            normal: "12d10 + BC (ígneo e contundente)",
            porTurno: "3d10 (ígneo) por turno a quem tocar os pilares de magma",
          },
          effect: "Você soca o chão e abre as falhas. Teste de Agilidade (CD 8 + BC): falha sofre o dano e fica Em Chamas; sucesso, metade do dano. Pilares de magma ficam na área por 3 turnos, e quem os tocar sofre 3d10 ígneo. Sobrecarga: quem falhar também recebe acúmulos de Quebrantado iguais ao seu Bônus de Rank.",
        },
        {
          id: "manto-de-supernova",
          name: "Manto de Supernova",
          paCost: RANK_PA_COST.common.Imperador,
          ptCost: 4,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Seu corpo vira plasma por 3 turnos: seus socos ignoram CA de armadura, escudo, Cobertura e Manto de Touki, e atingem também todo inimigo a até 3m do alvo. Arma mundana que te acertar derrete. Quando acaba, você fica com 1 nível de Exaustão. Sobrecarga: em vez da Exaustão, o fim do manto explode — 6d12 ígneo em todo inimigo a até 9m (teste de Agilidade, CD 8 + BC, para metade).",
        },
        {
          id: "colapso-solar",
          name: "Colapso Solar",
          paCost: RANK_PA_COST.common.Imperador,
          ptCost: 5,
          range: "Esfera de 45m",
          actions: { normal: 2 },
          damage: { normal: "14d12 + BC (plasma)" },
          effect: "Uma vez por combate. Um núcleo de plasma puxa todo inimigo na área 9m em direção ao centro (teste de Força, CD 8 + BC, evita o puxão) e implode: todos sofrem o dano (teste de Vigor para metade), e magias de rank inferior ao seu na área se desfazem. Sobrecarga: quem falhar no Vigor fica Em Chamas e recebe acúmulos de Quebrantado iguais ao seu Bônus de Rank.",
        },
      ],
    },
  ],
};
