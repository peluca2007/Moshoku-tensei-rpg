import { Tree } from "@/lib/types";
import { RANK_PA_COST } from "./shared";

/**
 * Punho de Fogo (Híbrida: Lutador + Magia de Fogo)
 * Identidade: "O golpe não termina no impacto — a explosão segue."
 * Mecânica central: Medidor Térmico (Calor) — acumula com acertos, gasta para explosões.
 *
 * ## Rework de clareza de 2026-09-05 — o Calor tinha seis regras, não uma
 *
 * A árvore era a mais confusa do livro, e não por acaso: cada patamar reescrevia
 * o recurso do zero. O teto subia numa escada torta (5 → 8 → 12 → 16 → 20 → 25);
 * o decaimento mudava de regra no 2º patamar ("zera" virou "decai 1"); o estouro
 * tinha três nomes e três efeitos diferentes (Brasa Viva, Fúria Vulcânica,
 * Erupção Contínua); e cada técnica cobrava um número próprio de Calor — 1, 2,
 * 3, 4, 5, 6, 8, 10 por turno. Ninguém joga isso sem a página aberta na frente,
 * e quem pagou rank Intermediário em DUAS árvores pra chegar aqui merecia
 * coisa melhor.
 *
 * O rework não tira poder: tira aritmética. Quatro regras, e todas na Maestria
 * de 1º patamar, onde a mesa lê uma vez e nunca mais precisa voltar:
 *
 * 1. GANHAR  — 1 de Calor por ataque desarmado que acerta.
 * 2. TETO    — 5 por patamar seu nesta árvore (5/10/15/20/25/30, o heatCap).
 * 3. PERDER  — 1 no fim de todo turno em que você não acertou ninguém. Nunca a
 *              barra inteira: "um turno sem acertar é um turno sem recurso" era
 *              a regra que punia o azar de errar um ataque com o recurso todo.
 * 4. GASTAR  — toda técnica tem uma SOBRECARGA, e toda Sobrecarga custa 3 de
 *              Calor. Um número só, em patamar nenhum diferente. As únicas
 *              exceções são as detonações declaradas (Soco de Nova, Erupção do
 *              Soberano, Colapso Solar, Manto de Supernova), que gastam a barra
 *              inteira porque É ISSO que elas são.
 *
 * O estouro também virou um nome só: BRASA VIVA, que existe desde o 1º patamar
 * e melhora em cada um deles. E ela para de cobrar o 1d6 em você no patamar
 * Santo — porque o Santo é literalmente imune a fogo, e cobrar dano ígneo de um
 * imune era a contradição mais visível da árvore.
 *
 * ## Combustível: PM ou PT, à escolha
 *
 * As técnicas cobravam PM E PT ao mesmo tempo (5 PM + 2 PT num golpe só). O
 * personagem que chega aqui já rachou os PA dele em duas árvores e sustenta
 * duas reservas; cobrar as duas por golpe era o terceiro imposto. Agora cada
 * técnica tem UM custo, e ele se paga em PM, em PT, ou dividido entre os dois.
 */
export const PUNHO_DE_FOGO_TREE: Tree = {
  id: "punho-de-fogo",
  name: "Punho do Fogo",
  icon: "/arvores/punho-de-fogo.png",
  category: "corpo",
  subgroup: "Híbrida (Lutador + Magia de Fogo)",
  mechanic: {
    tag: "Calor",
    hook:
      "O calor não é aura: é o recurso. Você acumula batendo e gasta explodindo — e toda explosão desta árvore custa o mesmo número.",
    loop: [
      "Bata. Cada ataque desarmado que acerta causa +1d6 ígneo e dá 1 de Calor. O teto é 5 por patamar seu nesta árvore: 5 no 1º, 30 no 6º.",
      "Segure. Você perde 1 de Calor no fim de todo turno em que não acertou ninguém — 1, nunca a barra inteira.",
      "Solte. Toda técnica desta árvore tem uma Sobrecarga, e toda Sobrecarga custa 3 de Calor. Encher a barra até o teto acende Brasa Viva sozinho, sem gastar nada.",
    ],
    cost:
      "É híbrida e escondida: exige rank Intermediário em Magia de Fogo E em Lutador antes de existir — dois patamares pagos antes do primeiro ponto de Calor. E ela não tem alcance nem defesa: sem alguém em quem bater, o recurso não sobe e a árvore inteira apaga.",
  },
  hiddenFromCreation: true,
  prerequisiteNote: "Pré-requisito: Rank Intermediário em Magia de Fogo e em Lutador.",
  keyAttributeLabel: "Força ou Intelecto",
  resourceLabel: "PT / PM / Calor",
  tagline: "O calor não é uma aura, é a extensão do seu punho. Cada impacto queima, cada golpe é uma explosão controlada.",
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
    armas: "Grupo Desarmado e Improvisado (Dado Base d6 no punho). Mais UM grupo à sua escolha. Armadura leve; proíbe armadura pesada (desliga a árvore).",
    gruposDeArma: ["desarmado-e-improvisado"],
    escolhaDeGrupo: 1,
    pericias: "—",
    nota: "Ofício do Corpo + Fogo. Usa Força ou Intelecto. Combustível: o custo de qualquer técnica desta árvore pode ser pago em PM, em PT, ou dividido entre os dois — corpo e mana queimam o mesmo fogo, e quem chegou aqui já pagou por duas árvores.",
  },
  ranks: [
    // ===================== PRINCIPIANTE =====================
    {
      rank: "Principiante",
      hpDiceFormula: "1d10+3",
      weaponDieSteps: 1,
      // Teto de Calor deste patamar. A regra é 5 x patamar, e a Maestria abaixo
      // a escreve por extenso — este campo é a mesma promessa em número, pra
      // ficha calcular sem reler a prosa.
      heatCap: 5,
      mastery: {
        name: "Impacto Térmico",
        description:
          "[Calor] Seus ataques desarmados causam +1d6 ígneo extra. As quatro regras do Calor, e não existe uma quinta: " +
          "GANHAR — cada ataque desarmado que acerta dá 1 de Calor (as técnicas dizem quando dão mais). " +
          "TETO — 5 de Calor por patamar que você possua nesta árvore. " +
          "PERDER — 1 de Calor no fim de todo turno em que você não acertou ninguém. " +
          "GASTAR — toda técnica desta árvore tem uma Sobrecarga, e toda Sobrecarga custa 3 de Calor, em qualquer patamar. " +
          "Ao encher a barra até o teto você entra em Brasa Viva até o fim do próximo turno, sem gastar nada: os seus socos causam +1d6 ígneo por patamar seu, e você paga 1d6 ígneo em si mesmo ao fim de cada turno dela.",
      },
      talents: [
        { id: "sangue-quente", name: "Sangue Quente", paCost: RANK_PA_COST.talent.Principiante, description: "Resistência a frio extremo e magias básicas de gelo; impede redução de deslocamento em ambientes gélidos." },
        { id: "maos-de-brasa", name: "Mãos de Brasa", paCost: RANK_PA_COST.talent.Principiante, description: "Punhos emitem luz/calor constante (6m); acende fogueiras ao toque." },
        { id: "calor-interno", name: "Calor Interno", paCost: RANK_PA_COST.talent.Principiante, description: "+4 PV por patamar nesta árvore.", grants: { hpPerRank: 4 } },
      ],
      abilities: [
        {
          id: "centelha-do-iniciante",
          name: "Centelha do Iniciante",
          signature: true,
          paCost: RANK_PA_COST.signature.Principiante,
          pmCost: 1,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "1d8 + BC (ígneo)", condicional: "+2d6 ao Sobrecarregar" },
          effect: "Soco direto. Ganha 2 de Calor e aplica Em Chamas. O alvo faz teste de Vigor (CD 8+BC) ou fica com -2 em testes de concentração até o fim do próximo turno. Sobrecarga: +2d6 no golpe.",
        },
        {
          id: "passo-de-brasa",
          name: "Passo de Brasa",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 1,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "Investida propulsada a fogo. Ignora ataques de oportunidade do ponto de partida. Ganha 1 de Calor se terminar adjacente a inimigo. Sobrecarga: o deslocamento dobra e você ignora terreno difícil no caminho.",
        },
        {
          id: "chicote-de-fumaca",
          name: "Chicote de Fumaça",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "Linha de 6m x 1,5m",
          actions: { normal: 1 },
          effect: "Golpe de palma que libera nuvem de fuligem. Teste de Vigor (CD 8+BC): falha = Cego 1 turno + -2 no acerto (irritação). Sobrecarga: a linha vira 9m e a nuvem fica no ar até o fim do próximo turno.",
        },
      ],
    },
    // ===================== INTERMEDIÁRIO =====================
    {
      rank: "Intermediário",
      hpDiceFormula: "1d10+4",
      weaponDieSteps: 1,
      ptGained: 1,
      heatCap: 10,
      mastery: {
        name: "Fornalha Interna",
        description:
          "Enquanto estiver com 3 ou mais de Calor, seus socos ignoram Resistência a fogo e o custo das suas técnicas cai em 1 (mínimo 1). " +
          "Sua Brasa Viva melhora: enquanto ela durar, cada soco seu também atinge todo inimigo adjacente ao alvo.",
      },
      talents: [
        { id: "fornalha-interna", name: "Fornalha Interna", paCost: RANK_PA_COST.talent.Intermediário, description: "Ganhar Calor cura 1 PV por ponto. Perder Calor (por decaimento) concede +1 no próximo teste de Vigor." },
      ],
      abilities: [
        {
          id: "sopro-do-forja",
          name: "Sopro do Forja",
          signature: true,
          paCost: RANK_PA_COST.signature.Intermediário,
          pmCost: 3,
          range: "Cone de 6 metros",
          actions: { normal: 1 },
          damage: { normal: "3d6 + BC (ígneo)" },
          effect: "Gancho giratório que empurra 3m e aplica Em Chamas. Sobrecarga: alvos que falharem no teste de Força (CD 8+BC) ficam Atolados no chão derretido por 1 turno.",
        },
        {
          id: "pele-de-cinzas",
          name: "Pele de Cinzas",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 2,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 minuto: cauteriza feridas (cura 2d8 PV) e quem te atingir corpo a corpo sofre 2d6 ígneo. Enquanto ativa, ganha 1 Calor extra ao ser atingido.",
        },
        {
          id: "circulo-de-cinzas",
          name: "Círculo de Cinzas",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "Esfera de 4,5m",
          actions: { normal: 1 },
          damage: { normal: "2d6 ígneo" },
          effect: "Rasteira giratória. Teste de Agilidade (CD 8+BC): falha = Caído + Atolado. O anel residual queima quem atravessar (2d6 ígneo, aplica Em Chamas). Sobrecarga: o chão vira Terreno Difícil + Em Chamas por 2 turnos.",
        },
      ],
    },
    // ===================== AVANÇADO =====================
    {
      rank: "Avançado",
      hpDiceFormula: "1d12+4",
      weaponDieSteps: 2,
      ptGained: 1,
      heatCap: 15,
      mastery: {
        name: "Punho de Nova",
        description:
          "Encadeamento Térmico: no turno em que você Sobrecarregar uma técnica, o seu próximo ataque desarmado custa 1 Ação a menos (mínimo 0) e causa +1d6 ígneo. " +
          "Soco de Nova: uma vez por combate, sem gastar Ação, detone a barra inteira — 3m de raio, 1d10 ígneo por ponto de Calor gasto, teste de Agilidade (CD 8+BC) para metade. Zera seu Calor e causa 1 nível de Exaustão.",
      },
      talents: [
        { id: "combustao-reativa", name: "Combustão Reativa", paCost: RANK_PA_COST.talent.Avançado, description: "Se sofrer crítico ou estiver Atordoado/Incapacitado, detona metade do Calor atual automaticamente (explosão 3m, repele 3m). Não causa Exaustão." },
      ],
      abilities: [
        {
          id: "lotus-carmesim",
          name: "Lótus Carmesim",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 5,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "4d8 + BC (ígneo)", condicional: "+3d6 ao detonar Em Chamas no 3º soco" },
          effect: "Sequência de 3 socos rápidos (rolagens separadas). Cada acerto ganha 2 Calor. O 3º soco ignora CA de escudo/barreira, aplica Atordoado 1 turno e, se o alvo estava Em Chamas, detona a condição para +3d6 explosão.",
        },
        {
          id: "impacto-meteorico",
          name: "Impacto Meteórico",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 4,
          range: "9 metros",
          actions: { normal: 1 },
          damage: { normal: "5d8 + BC (ígneo + contundente)", porTurno: "2d6 (ígneo) por turno a quem entrar na cratera de magma" },
          effect: "Salto + mergulho explosivo. Onda de choque radial 6m: teste de Agilidade (CD 8+BC) ou Caído + Atolado. Sobrecarga: cria cratera de magma (Terreno Difícil, 2d6 ígneo/turno a quem entrar) por 2 turnos.",
        },
        {
          id: "lanca-incandescente",
          name: "Lança Incandescente",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 4,
          range: "18 metros",
          actions: { normal: 1 },
          damage: { normal: "6d6 + BC (ígneo perfurante)" },
          effect: "Feixe perfurante disparado dos dedos. Ignora armaduras físicas (placas/malhas) ao derreter o metal. Sobrecarga: atravessa o alvo e atinge até 2 inimigos atrás em linha, com metade do dano neles.",
        },
      ],
    },
    // ===================== SANTO =====================
    {
      rank: "Santo",
      hpDiceFormula: "1d12+5",
      weaponDieSteps: 1,
      ptGained: 1,
      heatCap: 20,
      mastery: {
        name: "Chama Eterna",
        description:
          "Imunidade a fogo e calor — e, por isso, a Brasa Viva para de cobrar o 1d6 em você: daqui pra cima estourar a barra sai de graça. " +
          "Recupera 1 PT sempre que causar dano ígneo. " +
          "Cinza Viva: ao Sobrecarregar uma técnica, você pode deixar Cinza no local (dura 1 hora). " +
          "Aliados em cima de Cinza ganham Resistência ígnea e +2 em testes de Vigor. " +
          "Inimigos em Cinza sofrem -2 no deslocamento e Vulnerabilidade ígnea.",
      },
      talents: [
        { id: "chama-eterna", name: "Chama Eterna", paCost: RANK_PA_COST.talent.Santo, description: "Suas chamas não podem ser apagadas por água, vento ou vácuo mundano; apenas anulação superior (rank Santo+)." },
      ],
      abilities: [
        {
          id: "fogo-purificador",
          name: "Fogo Purificador",
          signature: true,
          paCost: RANK_PA_COST.signature.Santo,
          pmCost: 8,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Aura de fogo branco por 1 turno. Remove maldições, venenos, feitiços mentais do usuário. Projéteis físicos disparados contra você no mesmo turno são vaporizados (sem ataque, sem dano). Sobrecarga: estende a aura a todos os aliados a 6m.",
        },
        {
          id: "punho-da-condenacao",
          name: "Punho da Condenação",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 7,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "8d8 + BC (ígneo)" },
          effect: "Golpe cirúrgico injeta calor na corrente sanguínea. Teste de Vigor (CD 8+BC) com Desvantagem: falha = Paralisado por combustão interna 2 turnos (não age, CA -2). Sucesso: metade do dano, Lento 1 turno. Sobrecarga: a paralisia vira petrificação — uma aflição de rank Santo, que só um purificador de patamar Santo ou superior remove.",
        },
        {
          id: "prisao-de-purgatorio",
          name: "Prisão de Purgatório",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 9,
          range: "18 metros",
          actions: { normal: 2 },
          damage: { normal: "6d8 ígneo/turno" },
          effect: "Ergue paredes de fogo cilíndricas (9m de diâmetro) ao redor do alvo ou do grupo. Atravessar custa 6d8 ígneo + Em Chamas que não se apaga (só anulação rank Santo+ remove). Sobrecarga: o teto da prisão fecha, causando asfixia (teste de Vigor por turno ou 1 nível de Exaustão). Dura 3 turnos ou até você dispensar.",
        },
      ],
    },
    // ===================== REI =====================
    {
      rank: "Rei",
      hpDiceFormula: "2d8+5",
      weaponDieSteps: 2,
      ptGained: 1,
      heatCap: 25,
      mastery: {
        name: "Presença do Vulcão",
        description:
          "Aura passiva 9m. Aliados: imunidade a Medo/Pânico, +2 em testes de Vigor, ganham 1 PT/turno. " +
          "Inimigos: Exaustão Térmica — Deslocamento -3m, -2 na Iniciativa, testes de Vigor com Desvantagem. " +
          "Sua Brasa Viva vira Erupção Contínua: ao encher a barra ela não acaba no fim do próximo turno — todo soco seu explode em 3m até o Calor cair abaixo da metade do teto.",
      },
      talents: [
        { id: "presenca-do-vulcao", name: "Presença do Vulcão", paCost: RANK_PA_COST.talent.Rei, description: "A aura afeta área de 18m. Inimigos que começarem o turno na área ganham 1 nível de Queimadura Severa (dano ígneo dobrado, cura recebida reduzida à metade)." },
      ],
      abilities: [
        {
          id: "trono-de-chamas",
          name: "Trono de Chamas",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 12,
          range: "Esfera de 18m",
          actions: { normal: 2 },
          damage: { normal: "6d10 + BC/turno (ígneo)" },
          effect: "Domínio territorial de magma. Inimigos na área drenam 2 de Força e Agilidade por turno (você ganha bônus igual) e estruturas derretem. Manter custa uma Sobrecarga por turno, e você pode dispensar quando quiser. Ao fim, a área vira Terreno Vulcânico permanente (magma, gás tóxico).",
        },
        {
          id: "coroa-solar",
          name: "Coroa Solar",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 10,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Halo independente por 3 turnos. Dispara raios automáticos (Reação grátis, 1/turno) contra quem flanquear ou fugir: 4d10 ígneo, ignora Cobertura. Cada disparo custa uma Sobrecarga.",
        },
        {
          id: "avatar-das-cinzas",
          name: "Avatar das Cinzas",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 14,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Materializa 2 braços gigantes de magma (alcance corpo a corpo +3m, tamanho Grande). " +
            "Permite Agarrar criaturas Gigantescas, Bloquear ataques em área (Reação e uma Sobrecarga: anula dano de área para aliados a 6m) e Esmagar estruturas (dano triplicado). " +
            "Dura até você dispensar ou o Calor zerar. Manutenção: uma Sobrecarga por turno.",
        },
      ],
    },
    // ===================== IMPERADOR =====================
    {
      rank: "Imperador",
      hpDiceFormula: "2d10+6",
      weaponDieSteps: 2,
      ptGained: 1,
      heatCap: 30,
      mastery: {
        name: "Soberania Térmica",
        description:
          "Imunidade absoluta a fogo/calor/plasma. Todo dano ígneo recebido é absorvido: " +
          "cura PV = metade do dano + restaura PT/PM iguais ao Bônus de Rank. " +
          "Fusão Ambiental: enquanto engajado, CA dos inimigos -3, " +
          "armaduras metálicas derretem (perdem bônus de CA), água evapora instantaneamente. " +
          "Você pode transferir Calor para aliados (toque, 1 Ação): eles ganham buffs de fogo, você zera seu Calor.",
      },
      talents: [
        { id: "soberania-termica", name: "Soberania Térmica", paCost: RANK_PA_COST.talent.Imperador, description: "Pode beber fogo ambiental (incêndios, lava, magias inimigas de rank Imperador ou inferior) como Ação grátis: ganha Calor igual ao rank da magia e cura PV/PT." },
      ],
      abilities: [
        {
          id: "erupcao-do-soberano",
          name: "Erupção do Soberano",
          signature: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 18,
          range: "Esfera de 30m",
          actions: { normal: 2 },
          damage: {
            normal: "12d10 + BC (ígneo + contundente)",
            porTurno: "3d10 (ígneo) por turno a quem tocar os pilares de magma",
            condicional: "+1d6 no raio inicial por ponto de Calor gasto",
          },
          effect: "Soca as falhas tectônicas. Pilares de magma surgem (3d10 ígneo/turno a quem tocar). O campo de batalha vira Zona Vulcânica Permanente: terreno difícil, gás tóxico (teste de Vigor por hora), magma flui. Detonação: gaste a barra inteira e cada ponto vale +1d6 no raio inicial e +1 turno de duração dos pilares.",
        },
        {
          id: "manto-de-supernova",
          name: "Manto de Supernova",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 16,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Corpo vira plasma puro por 3 turnos. " +
            "Armas mundanas derretem ao tocar (destruídas). " +
            "Ataques não respeitam defesa nenhuma (CA, Escudos, Barreiras, Manto de Touki, imunidades de rank abaixo de Imperador). " +
            "Seus socos causam dano em área 3m automático. " +
            "Ganha 5 Calor por turno, de graça. " +
            "Ao fim, detona a barra inteira numa explosão final (1d12 por ponto, 15m).",
        },
        {
          id: "colapso-solar",
          name: "Colapso Solar",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 20,
          range: "Esfera de 45m",
          actions: { normal: 2 },
          damage: { normal: "14d12 + BC (plasma)", condicional: "+1d6 no dano final por ponto de Calor gasto" },
          effect: "Cria um micro-vácuo gravitacional que suga todos os inimigos para o centro (teste de Força, CD 8+BC, ou arrastados). " +
            "Depois implode: o plasma instável desestabiliza magia (efeitos mágicos de rank abaixo de Imperador na área falham automaticamente por 1 turno). " +
            "Detonação: gaste a barra inteira e cada ponto vale +1m no raio de sucção e +1d6 no dano final.",
        },
      ],
    },
  ],
};
