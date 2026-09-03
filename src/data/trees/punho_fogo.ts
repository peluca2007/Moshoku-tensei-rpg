import { Tree } from "@/lib/types";
import { RANK_PA_COST } from "./shared";

/**
 * Punho de Fogo (Híbrida: Lutador + Magia de Fogo)
 * Identidade: "O golpe não termina no impacto — a explosão segue."
 * Mecânica central: **Medidor Térmico (Calor)** — acumula com acertos, gasta para explosões.
 * Risco/Recompensa: superaquecimento concede poder, mas drena PV/PT.
 */
export const PUNHO_DE_FOGO_TREE: Tree = {
  id: "punho-de-fogo",
  name: "Punho do Fogo",
  category: "corpo",
  subgroup: "Híbrida (Lutador + Magia de Fogo)",
  mechanic: {
    tag: "Calor",
    hook:
      "O calor não é aura: é o recurso. Você acumula batendo e gasta explodindo.",
    loop: [
      "Bata. Cada ataque desarmado que acerta causa +1d4 ígneo e concede 1 ponto de Calor, até o máximo de 5.",
      "Segure. O Calor é o combustível das técnicas da árvore — quanto mais alto, mais forte cada uma delas sai.",
      "Solte. Gaste o Calor acumulado numa explosão, num incêndio em área ou numa redução de CA do inimigo, e volte ao zero.",
    ],
    cost:
      "É uma árvore híbrida e escondida: exige rank Intermediário em Magia de Fogo E em Lutador antes de existir. E o Calor zera em quem não bate — um turno sem acertar é um turno sem recurso.",
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
    armas: "Ataque desarmado (Dado Base d6), armadura leve. Proíbe armadura pesada (desliga a árvore).",
    pericias: "—",
    nota: "Ofício do Corpo + Fogo. Usa Força ou Intelecto.",
  },
  ranks: [
    // ===================== PRINCIPIANTE =====================
    {
      rank: "Principiante",
      hpDiceFormula: "1d10+3",
      weaponDieSteps: 1,
      mastery: {
        name: "Impacto Térmico",
        description:
          "[Calor] Seus ataques desarmados causam +1d4 ígneo extra. Ao acertar, você ganha 1 de **Calor** (máx. 5). " +
          "Pode gastar 1 PM para converter 1 Calor em **Em Chamas** no alvo. " +
          "Se atingir 5 de Calor, entra em **Brasa Viva** até o fim do próximo turno: +1d6 ígneo nos socos, " +
          "mas sofre 1d6 de dano ígneo auto-infligido ao fim do turno.",
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
          damage: { normal: "1d8 + BC (ígneo)" },
          effect: "Soco direto. **Ganha 2 de Calor**. Aplica Em Chamas. Alvo faz teste de Vigor (CD 8+BC) ou fica com -2 em testes de concentração até o fim do próximo turno.",
        },
        {
          id: "passo-de-brasa",
          name: "Passo de Brasa",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 1,
          ptCost: 1,
          range: "9 metros",
          actions: { normal: 1 },
          effect: "Investida propulsada a fogo. Ignora ataques de oportunidade do ponto de partida. **Ganha 1 de Calor** se terminar adjacente a inimigo.",
        },
        {
          id: "chicote-de-fumaca",
          name: "Chicote de Fumaça",
          paCost: RANK_PA_COST.common.Principiante,
          pmCost: 2,
          range: "Linha de 6m x 1,5m",
          actions: { normal: 1 },
          effect: "Golpe de palma que libera nuvem de fuligem. Teste de Vigor (CD 8+BC): falha = Cego 1 turno + -2 no acerto (irritação). **Gasta 1 Calor** para aumentar a área para 9m.",
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
          "Máximo de **Calor sobe para 8**. A cada turno em combate, seu Calor decai 1 (em vez de zerar). " +
          "Enquanto com **3+ de Calor**: seus socos ignoram Resistência ígnea e custam -1 PM/PT (mín. 1). " +
          "**Superaquecimento (8 Calor)**: entra em **Fúria Vulcânica** por 1 turno — socos causam dano em área (3m), " +
          "mas você sofre 2d6 ígneo auto-infligido e fica **Exausto** (-2 Ações no próximo turno).",
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
          effect: "Gancho giratório que empurra 3m e aplica Em Chamas. **Gasta 3 de Calor**: alvos que falharem no teste de Força (CD 8+BC) ficam **Atolados** no chão derretido por 1 turno.",
        },
        {
          id: "pele-de-cinzas",
          name: "Pele de Cinzas",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 2,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "1 minuto: cauteriza feridas (cura 2d8 PV) e quem te atingir corpo a corpo sofre 2d6 ígneo. **Enquanto ativa, ganha 1 Calor extra ao ser atingido.**",
        },
        {
          id: "circulo-de-cinzas",
          name: "Círculo de Cinzas",
          paCost: RANK_PA_COST.common.Intermediário,
          pmCost: 3,
          range: "Esfera de 4,5m",
          actions: { normal: 1 },
          damage: { normal: "2d6 ígneo" },
          effect: "Rasteira giratória. Teste de Agilidade (CD 8+BC): falha = Caído + **Atolado**. O anel residual queima quem atravessar (2d6 ígneo, aplica Em Chamas). **Gasta 2 Calor** para deixar o chão **Terreno Difícil + Em Chamas** por 2 turnos.",
        },
      ],
    },
    // ===================== AVANÇADO =====================
    {
      rank: "Avançado",
      hpDiceFormula: "1d12+4",
      weaponDieSteps: 2,
      ptGained: 1,
      mastery: {
        name: "Punho de Nova",
        description:
          "Máximo de **Calor sobe para 12**. **Encadeamento Térmico**: sempre que gasta Calor, o próximo ataque desarmado " +
          "no mesmo turno custa -1 Ação (mín. 0) e ganha +1d6 ígneo. " +
          "Uma vez por combate, pode detonar **todo o Calor** num **Soco de Nova** (ação livre, 3m de raio, " +
          "dano = 1d10 ígneo por ponto de Calor gasto, CD 8+BC para metade). Zera seu Calor e causa 1 nível de Exaustão.",
      },
      talents: [
        { id: "combustao-reativa", name: "Combustão Reativa", paCost: RANK_PA_COST.talent.Avançado, description: "Se sofrer crítico ou estiver Atordoado/Incapacitado, detona ½ do Calor atual automaticamente (explosão 3m, repele 3m). Não causa Exaustão." },
      ],
      abilities: [
        {
          id: "lotus-carmesim",
          name: "Lótus Carmesim",
          signature: true,
          paCost: RANK_PA_COST.signature.Avançado,
          pmCost: 5,
          ptCost: 2,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "4d8 + BC (ígneo)" },
          effect: "Sequência de 3 socos rápidos (rolagens separadas). Cada acerto **ganha 2 Calor**. O 3º soco **ignora CA de escudo/barreira**, aplica **Atordoado 1 turno** e, se o alvo estava Em Chamas, detona a condição para +3d6 explosão.",
        },
        {
          id: "impacto-meteorico",
          name: "Impacto Meteórico",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 4,
          ptCost: 2,
          range: "9 metros",
          actions: { normal: 1 },
          damage: { normal: "5d8 + BC (ígneo + contundente)" },
          effect: "Salto + mergulho explosivo. Onda de choque radial 6m: teste de Agilidade (CD 8+BC) ou Caído + Atolado. **Gasta 4 Calor**: cria cratera de magma (Terreno Difícil, 2d6 ígneo/turno a quem entrar) por 2 turnos.",
        },
        {
          id: "lanca-incandescente",
          name: "Lança Incandescente",
          paCost: RANK_PA_COST.common.Avançado,
          pmCost: 4,
          range: "18 metros",
          actions: { normal: 1 },
          damage: { normal: "6d6 + BC (ígneo perfurante)" },
          effect: "Feixe perfurante disparado dos dedos. **Ignora armaduras físicas** (placas/malhas) ao derreter o metal. **Gasta 3 Calor**: atravessa o alvo e atinge até 2 inimigos atrás em linha (dano halved).",
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
          "Imunidade a fogo/calor. **Calor máximo = 16**. Recupera 1 PT sempre que causar dano ígneo. " +
          "**Cinza Viva**: ao gastar Calor, pode optar por deixar **Cinza** no local (dura 1 hora). " +
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
          effect: "Aura de fogo branco por 1 turno. Remove maldições, venenos, feitiços mentais do usuário. Projéteis físicos disparados contra você no mesmo turno são **vaporizados** (sem ataque, sem dano). **Gasta 5 Calor** para estender a aliados a 6m.",
        },
        {
          id: "punho-da-condenacao",
          name: "Punho da Condenação",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 7,
          ptCost: 3,
          range: "Corpo a corpo",
          actions: { normal: 1 },
          damage: { normal: "8d8 + BC (ígneo)" },
          effect: "Golpe cirúrgico injeta calor na corrente sanguínea. Teste de Vigor (CD 8+BC) c/ Desvantagem: falha = **Paralisado por combustão interna 2 turnos** (não age, CA -2). Sucesso: metade do dano, **Lento** 1 turno. **Gasta 6 Calor**: a paralisia vira **Petrificação leve** (PV do alvo viram cinza; cura requer rank Santo+).",
        },
        {
          id: "prisao-de-purgatorio",
          name: "Prisão de Purgatório",
          paCost: RANK_PA_COST.common.Santo,
          pmCost: 9,
          range: "18 metros",
          actions: { normal: 2 },
          damage: { normal: "6d8 ígneo/turno" },
          effect: "Ergue paredes de fogo cilíndricas (9m diâmetro) ao redor do alvo/grupo. Atravessar = 6d8 ígneo + **Em Chamas incombatível** (só anulação rank Santo+ remove). **Gasta 8 Calor**: o teto da prisão fecha, causando **asfixia** (teste de Vigor/turno ou 1 nível de Exaustão). Dura 3 turnos ou até você dispensar.",
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
          "Aura passiva 9m. **Aliados**: imunidade a Medo/Pânico, +2 em testes de Vigor, ganham 1 PT/turno. " +
          "**Inimigos**: Exaustão Térmica — Deslocamento -3m, -2 na Iniciativa, testes de Vigor c/ Desvantagem. " +
          "**Calor máximo = 20**. Ao atingir 20 Calor, **não sofre Exaustão** — em vez disso, " +
          "entra em **Erupção Contínua** (grátis): todo soco explode em 3m até o Calor cair abaixo de 10.",
      },
      talents: [
        { id: "presenca-do-vulcao", name: "Presença do Vulcão", paCost: RANK_PA_COST.talent.Rei, description: "A aura afeta área de 18m. Inimigos que começarem o turno na área ganham 1 nível de **Queimadura Severa** (dano ígneo dobrado, cura recebida reduzida à metade)." },
      ],
      abilities: [
        {
          id: "trono-de-chamas",
          name: "Trono de Chamas",
          signature: true,
          paCost: RANK_PA_COST.signature.Rei,
          pmCost: 12,
          ptCost: 4,
          range: "Esfera de 18m",
          actions: { normal: 2 },
          damage: { normal: "6d10 + BC/turno (ígneo)" },
          effect: "Domínio territorial de magma. Inimigos na área: **drenam 2 de Força e Agilidade/turno** (você ganha bônus igual). Estruturas derretem. **Gasta 10 Calor/turno** para manter (pode dispensar livre). Ao fim, a área vira **Terreno Vulcânico** permanente (magma, gás tóxico).",
        },
        {
          id: "coroa-solar",
          name: "Coroa Solar",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 10,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Halo independente por 3 turnos. Dispara **raios automáticos** (Reação grátis, 1/turno) contra quem flanquear ou fugir: 4d10 ígneo, ignora Cobertura. **Gasta 2 Calor/disparo**.",
        },
        {
          id: "avatar-das-cinzas",
          name: "Avatar das Cinzas",
          paCost: RANK_PA_COST.common.Rei,
          pmCost: 14,
          ptCost: 4,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Materializa **2 braços gigantes de magma** (alcance corpo a corpo +3m, tamanho Grande). " +
            "Permite **Agarrar criaturas Gigantescas**, **Bloquear ataques em área** (Reação, gasta 3 Calor, anula dano de área para aliados a 6m) e **Esmagar estruturas** (dano triplicado). " +
            "Dura até você dispensar ou Calor zerar. **Custo de manutenção: 3 Calor/turno**.",
        },
      ],
    },
    // ===================== IMPERADOR =====================
    {
      rank: "Imperador",
      hpDiceFormula: "2d10+6",
      weaponDieSteps: 2,
      ptGained: 1,
      mastery: {
        name: "Soberania Térmica",
        description:
          "Imunidade **absoluta** a fogo/calor/plasma. **Todo dano ígneo recebido é absorvido**: " +
          "cura PV = ½ do dano + restaura PT/PM iguais ao Bônus de Rank. " +
          "**Calor máximo = 25**. **Fusão Ambiental**: enquanto engajado, CA dos inimigos -3, " +
          "armaduras metálicas derretem (perdem bônus de CA), água evapora instantaneamente. " +
          "Você pode **transferir Calor para aliados** (toque, 1 Ação): eles ganham buffs de fogo, você zera seu Calor.",
      },
      talents: [
        { id: "soberania-termica", name: "Soberania Térmica", paCost: RANK_PA_COST.talent.Imperador, description: "Pode 'beber' fogo ambiental (incêndios, lava, magias inimigas rank Imperador ou inferior) como Ação grátis: ganha Calor igual ao nível da magia + cura PV/PT." },
      ],
      abilities: [
        {
          id: "erupcao-do-soberano",
          name: "Erupção do Soberano",
          signature: true,
          paCost: RANK_PA_COST.signature.Imperador,
          pmCost: 18,
          ptCost: 5,
          range: "Esfera de 30m",
          actions: { normal: 2 },
          damage: { normal: "12d10 + BC (ígneo + contundente)" },
          effect: "Soca as falhas tectônicas. **Pilares de magma** surgem (3d10 ígneo/turno a quem tocar). O campo de batalha vira **Zona Vulcânica Permanente**: terreno difícil, gás tóxico (teste Vigor/hora), magma flui. **Gasta todo Calor**: cada ponto = +1d6 no raio inicial e +1 turno de duração dos pilares.",
        },
        {
          id: "manto-de-supernova",
          name: "Manto de Supernova",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 16,
          ptCost: 4,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "Corpo vira **plasma puro por 3 turnos**. " +
            "• Armas mundanas derretem ao tocar (destruídas). " +
            "• Ataques **ignoram 100% de defesas** (CA, Escudos, Barreiras, Manto de Touki, Imunidades rank < Imperador). " +
            "• Seus socos causam dano em **área 3m** automático. " +
            "• **Ganha 5 Calor/turno grátis**. " +
            "Ao fim, **detona todo Calor restante** em explosão final (1d12 por ponto, 15m).",
        },
        {
          id: "colapso-solar",
          name: "Colapso Solar",
          paCost: RANK_PA_COST.common.Imperador,
          pmCost: 20,
          ptCost: 6,
          range: "Esfera de 45m",
          actions: { normal: 2 },
          damage: { normal: "14d12 + BC (plasma)" },
          effect: "Cria **micro-vácuo gravitacional** (Força 30): suga todos os inimigos para o centro (teste Força CD 20 ou arrastados). " +
            "Depois **implode**: plasma instável desestabiliza magia (efeitos mágicos rank < Imperador na área falham automaticamente por 1 turno). " +
            "**Gasta todo Calor**: cada ponto = +1m no raio de sucção e +1d6 dano final.",
        },
      ],
    },
    // ===================== DEUS =====================
    {
      rank: "Deus",
      hpDiceFormula: "3d10+8",
      weaponDieSteps: 3,
      ptGained: 1,
      mastery: {
        name: "Aura do Alfa e Ômega",
        description:
          "Suas chamas **transcendem dano**. **Calor ilimitado** (sem teto). " +
          "**Modo Alfa (Destruição)**: socos desintegram matéria a nível atômico — ignoram PV, " +
          "reduzem alvo a 0 instantaneamente se falharem teste de Vigor CD 30 (criaturas rank < Deus). " +
          "**Modo Ômega (Vida)**: calor regenera — aliados a 18m recuperam membros, órgãos, " +
          "PV máximos, removem Exaustão/Marcas da Morte. Você escolhe o modo a cada soco (Ação livre).",
      },
      talents: [
        { id: "transcendencia-ignea", name: "Transcendência Ígnea", paCost: 4, description: "Imune a controle de grupo, alteração temporal, envelhecimento e morte natural. Seu Calor persiste após a morte — se morrer, ressuscita em 1d4 dias no local mais quente do mundo (vulcão, núcleo planetário)." },
      ],
      abilities: [
        {
          id: "big-bang-marcial",
          name: "Big Bang Marcial",
          signature: true,
          paCost: 6,
          pmCost: 25,
          ptCost: 8,
          range: "Corpo a corpo",
          actions: { normal: 2 },
          damage: { normal: "20d12 + BC (plasma puro)" },
          effect: "O soco comprime o peso/calor de uma **estrela nascendo**. " +
            "• **Ignora TUDO**: CA, Imunidades, Ressurreição, Contingências, Desejos, Intervenção Divina (rank < Deus). " +
            "• Alvo falha em Vigor CD 30 = **apagado da existência** (corpo, alma, memória, linha do tempo). " +
            "• Explosão residual 100m: 10d12 plasma, terra vira vidro, atmosfera incendeia. " +
            "• Você sofre **3 níveis de Exaustão permanentes** (só removíveis por rank Deus).",
        },
        {
          id: "ignicao-da-alma",
          name: "Ignição da Alma",
          paCost: 6,
          pmCost: 0,
          ptCost: 0,
          range: "Pessoal",
          actions: { normal: 1 },
          effect: "**Gatilho: reduzido a 0 PV**. Inflama a própria alma — **ressuscita instantânea** com PV/PT/PM máximos, " +
            "Calor = 50 (ilimitado), e **incendia o mapa inteiro** por 1 hora (dano ígneo 4d10/turno a todos os hostis, " +
            "aliados curados 4d10/turno). Uma vez por arco de campanha.",
        },
        {
          id: "julgamento-de-prometeu",
          name: "Julgamento de Prometeu",
          ritual: true,
          paCost: 6,
          pmCost: 30,
          ptCost: 10,
          range: "Continental",
          actions: { normal: 6 },
          damage: { normal: "50d12 (fogo divino)" },
          effect: "Molda a realidade com os punhos. Abre **fenda dimensional** que jorra **Chamas Primordiais** (o fogo da criação). " +
            "• Apaga existências menores da linha do tempo (NPCs, cidades, exércitos rank < Rei — sem teste). " +
            "• Reescreve o clima de **um continente inteiro**: passa a **chover fogo divino** a seu comando por 1 ano e 1 dia. " +
            "• Cria **novas criaturas de fogo** leais a você (o Mestre define stats). " +
            "• Custo: **você envelhece 10 anos** e perde 1 ponto de Atributo permanente (escolha do Mestre).",
        },
      ],
    },
  ],
};