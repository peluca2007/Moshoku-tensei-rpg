import { Race } from "@/lib/types";

/**
 * Balanceamento das Raças — a régua usada nesta tabela (auditoria de 2026-08-28).
 *
 * A moeda é o "ponto de criação" (PC): 1 PC = +1 ponto de atributo = 2 PA pela
 * própria tabela do Cap. 1 §2. Dela saem as demais taxas: 1 perícia = 0,25 PC,
 * Vantagem permanente em todos os saves de 1 atributo = 1,5 PC.
 *
 * O que mais importa aqui: **bônus fixo de PV/PM e bônus de atributo envelhecem
 * de formas opostas**. A tabela do Cap. 1 §2 dá 4×MB de PV e 2×MB de PM por 2 PA,
 * então 1 PV vale 0,25 PC no Principiante e 0,042 PC no Imperador; 1 PM vale
 * 0,5 PC e 0,083 PC. Já +1 de atributo entra na fórmula MULTIPLICADO pelo Bônus
 * de Rank (PV = … + Vigor × MB × 4; PM = Espírito × MB + 8), então cresce sozinho.
 * Em números concretos, num mago de Vigor 2 / Espírito 4:
 *   - +1 Vigor  = +7 PV no Principiante (34 PV de pool, +21%) e +27 PV no
 *     Imperador (193 PV de pool, +14%) — a fração se mantém;
 *   - +6 PV fixos = +18% no Principiante e +3,1% no Imperador — some;
 *   - +10 PM fixos = +83% da reserva de um Principiante (12 → 22) e +23% da de
 *     um Imperador (44 → 54) — encolhe, mas menos, porque a reserva de PM é
 *     pequena; é por isso que os bônus de PM eram os outliers de criação daqui.
 *
 * Regra que orientou as correções abaixo: raridade no sorteio (RACE_WEIGHT, em
 * `src/lib/randomCharacter.ts`) tem que subir junto com o poder medido no
 * Imperador, e **nenhuma raça comum pode ser lixo**. Toda raça precisa de pelo
 * menos um traço que NÃO decaia com o Rank (atributo, perícia ou Vantagem).
 *
 * ## Rework de 2026-09-26 (decisão do autor): tiers, preço de escolha e despertares
 *
 * O buraco não era a tabela, era a porta da escolha: escolher custava 1 PA
 * qualquer que fosse a raça, então o Dragão (~9 PC) e o Demônio Imortal
 * custavam o mesmo que um Humano. Agora cada raça tem um TIER, que decide a
 * faixa no d100 e o preço de escolher (CUSTO_DE_ESCOLHA): Comum e Incomum 1 PA,
 * Rara 2, Lendária 3; a Mítica (Dragão) não se escolhe.
 *
 * E cada raça ganhou DOIS DESPERTARES comprados com PA (como a Sombra Absoluta
 * do Povo Pequeno, que era a única): o 1º a partir do Intermediário, o 2º a
 * partir do Santo. As comuns despertam mais forte — é assim que a raça que o
 * dado deu barata alcança a rara no fim da campanha.
 */
export const RACES: Race[] = [
  {
    id: "humano",
    tier: "comum",
    rollRange: [1, 16],
    name: "Humano (Jinzoku)",
    icon: "/racas/humano.png",
    description:
      "A raça dominante do mundo. Físico relativamente fraco e vida curta (70-100 anos), mas altíssima inteligência e versatilidade.",
    // 2026-08-29: saíram os +4 PV / +4 PM fixos, entrou +1 atributo à ESCOLHA do
    // jogador. É a correção mais direta possível pro problema que a raça sempre
    // teve: metade do pacote numérico servia pra um arquétipo só (um humano
    // guerreiro nunca gastava os PM), e bônus fixo de PV/PM decai com o Rank —
    // 4 PV valem +11% da vida de um Principiante e +2,8% da de um Imperador.
    // Um ponto de atributo entra multiplicado no que importa (PV pelo Fator de
    // Vigor, PM pelo Bônus de Rank, acerto e dano direto) e o JOGADOR escolhe
    // onde. É literalmente o que "adaptabilidade" quer dizer, e é a única raça
    // do livro cujo bônus muda de ficha pra ficha.
    bonuses: {},
    attributeChoices: 1,
    bonusSkillChoices: 2,
    upgrades: [
      {
        id: "humano-determinacao-dobrada",
        name: "Determinação Dobrada",
        paCost: 2,
        patamarMinimo: "Intermediário",
        description:
          "A Determinação Humana passa a valer duas vezes por sessão, e também em testes de resistência — a espécie que vive menos aprendeu a não aceitar o primeiro não.",
      },
      {
        id: "humano-o-mundo-e-dos-humanos",
        name: "O Mundo É dos Humanos",
        paCost: 4,
        patamarMinimo: "Santo",
        description:
          "Quando um aliado a até 9 metros que possa te ouvir falhar num teste de resistência, você pode gastar a sua Reação pra ele repetir o teste e usar o novo resultado. Uma vez por rodada. Nenhuma raça governa o mundo por ser a mais forte: governa porque não deixa os seus caírem.",
      },
    ],
    traits: [
      "Adaptabilidade: 2 Perícias extras à escolha e +1 em UM atributo à sua escolha, permanente — nenhuma outra raça deixa você decidir onde o sangue pesa.",
      "Determinação Humana: uma vez por sessão, repita um teste de atributo ou de perícia (não um ataque, nem uma rolagem de dano) que tenha acabado de falhar e use o novo resultado — humanos vivem menos que qualquer raça deste livro e aprenderam a não desperdiçar a única tentativa que têm.",
      "Línguas: Língua Humana (Comum), a que o mundo inteiro usa pra negociar.",
    ],
  },
  {
    id: "elfo",
    tier: "incomum",
    rollRange: [47, 55],
    name: "Elfo (Erufu)",
    icon: "/racas/elfo.png",
    description:
      "Habitantes da Grande Floresta. Corpos esguios, orelhas longas, fertilidade baixa e vida longuíssima.",
    // 2026-08-29: os 5 PM fixos viraram ESCALARES (Maior Bônus de Rank de magia
    // × 2). Fixo, o bônus valia +42% da reserva de um Principiante e +11% da de
    // um Imperador — o traço mágico de uma raça que vive séculos evaporava
    // exatamente na idade em que ela deveria estar no auge. Escalar, ele entrega
    // 2 PM no 1º patamar e 12 no 6º, mantendo a mesma fração a campanha inteira.
    // E vale 0 pra um elfo que nunca abriu escola de magia — correto: é mana,
    // não vida.
    bonuses: { attributes: { agilidade: 1 }, mpPerMagicRank: 2 },
    upgrades: [
      {
        id: "elfo-olhos-da-floresta",
        name: "Olhos da Grande Floresta",
        paCost: 2,
        patamarMinimo: "Intermediário",
        description:
          "Seus ataques à distância (arco, arremesso ou magia) ignoram Cobertura parcial, e a Vantagem do Sentido da Floresta passa a valer em toda Percepção, não só a auditiva.",
      },
      {
        id: "elfo-mana-ancestral",
        name: "Mana Ancestral",
        paCost: 4,
        patamarMinimo: "Santo",
        grants: { mpPerMagicRank: 2 },
        description:
          "O bônus racial de PM passa de 2× para 4× o seu Maior Bônus de Rank de magia (aplicado sozinho na ficha). Uma vez por Descanso Longo, gastando 1 Ação, recupere PM iguais a 2× esse bônus.",
      },
    ],
    traits: [
      "Sentido da Floresta: Vantagem em Percepção auditiva e em Sobrevivência para navegação.",
      "+1 em Agilidade, permanente, e PM Máximos iguais ao DOBRO do seu Maior Bônus de Rank de magia (+2 no Principiante, +12 no Imperador) — séculos de convivência com a mana da Grande Floresta. Sem nenhuma escola de magia aberta, este bônus é 0.",
      "Sangue Longevo: Vantagem em testes de resistência de Vigor contra veneno e doença (Cap. 4, §8) — séculos de vida ensinam o corpo a esperar o pior.",
      "Línguas: Língua Humana (Comum) e Língua Élfica.",
    ],
  },
  {
    id: "anao",
    tier: "incomum",
    rollRange: [56, 64],
    name: "Anão (Dowaafu)",
    icon: "/racas/anao.png",
    description:
      "Artesãos e ferreiros inatos da Cordilheira do Dragão Azul. Vivem várias centenas de anos, baixa estatura, alta resistência ao álcool.",
    // O Anão era o pior pacote do livro — e o único que podia sair NEGATIVO. A
    // proibição de Água e Vento fecha 2 das 8 escolas pra sempre, e o desconto de
    // 1 PM só paga quem já for mago de Terra ou Fogo; pra um anão guerreiro (o
    // arquétipo óbvio da raça) sobravam +6 PV e uma perícia, que no Imperador
    // valem 0,25 PC contra os 2,8 do Ogro. Pior: ele nem era comum no sorteio, e
    // raridade média com poder de lanterna é a pior combinação possível. +1 de
    // Vigor é o único bônus que não evapora com o Rank e é exatamente o que a
    // descrição ("alta resistência") já prometia em texto sem entregar em número.
    // 2026-08-29: 6 → 10 PV fixos, a pedido do usuário. Bônus fixo de PV entra
    // FORA do Fator de Vigor (Cap. 4, §1), então vale +28% da vida de um anão
    // recém-criado e ~+7% da de um Imperador: é um bônus de começo de campanha,
    // de propósito. O que segura o Anão no rank alto continua sendo o +1 de
    // Vigor, que multiplica.
    //
    // Revisão do livro: o desconto fixo de 1 PM não descontava nada numa magia
    // de 1 PM (mínimo 1) e valia 5% no Imperador — o padrão de "fixo que decai"
    // que o cabeçalho deste arquivo condena, pago com duas escolas fechadas pra
    // sempre. Agora ele cresce com metade do Bônus de Rank da escola (1 a 3).
    bonuses: { attributes: { vigor: 1 }, maxHp: 10 },
    fixedSkills: ["Ofícios (Forja)"],
    upgrades: [
      {
        id: "anao-martelo-e-bigorna",
        name: "Martelo e Bigorna",
        paCost: 2,
        patamarMinimo: "Intermediário",
        description:
          "Resistência a dano ígneo — quem cresce na boca da forja não se queima fácil. E armas e armaduras que você fabrica (Cap. 5, §4) ficam prontas na metade do tempo.",
      },
      {
        id: "anao-montanha-viva",
        name: "Montanha Viva",
        paCost: 4,
        patamarMinimo: "Santo",
        description:
          "Resistência a dano contundente, e nada te derruba contra a sua vontade: você não pode ser empurrado, ficar Caído nem Desequilibrado se não quiser.",
      },
    ],
    traits: [
      "Sangue da Forja: magias de Terra e de Fogo custam menos PM, num desconto igual à metade do seu Bônus de Rank naquela escola, arredondado pra cima (1 no Principiante e no Intermediário, 2 no Avançado e no Santo, 3 no Rei e no Imperador; o custo nunca cai abaixo de 1). Não soma com outros descontos de PM: vale o maior. A Sobrecarga e as técnicas do Punho do Fogo não são magia de Fogo e não recebem o desconto. Não pode aprender magias de Água ou Vento.",
      "+1 em Vigor e +10 PV Máximos, permanentes — o corpo mais denso do livro.",
      "Fígado de Pedra: bebida nenhuma te derruba (álcool não te impõe penalidade alguma) e você tem Vantagem em testes de resistência de Vigor contra Exaustão por privação (Cap. 4, seção 9).",
      "Línguas: Língua Humana (Comum) e Língua Anã.",
    ],
  },
  {
    id: "hobbit",
    tier: "comum",
    rollRange: [17, 31],
    name: "Povo Pequeno / Hobbit (Hobitto)",
    icon: "/racas/hobbit.png",
    description:
      "Vivem na Grande Floresta e em cidades como Millishion. Estatura e aparência de criança humana por toda a vida.",
    bonuses: { attributes: { agilidade: 1 } },
    // A compra de 3 PA é a primeira melhoria racial do livro (ver Race.upgrades).
    // Continua em 3 PA mesmo depois de a Vantagem em Resistência do Cap. 1 §2
    // baixar de 3 pra 2 (2026-08-29): a régua não é o alcance, é a força. Aquela
    // compra dá Vantagem (2d20) em todos os saves de UM atributo; esta dá
    // Vantagem ABSOLUTA (3d20) em duas perícias. Um degrau a mais de dado vale o
    // PA a mais, e a compra é opcional — não infla a raça de quem não comprar.
    upgrades: [
      {
        id: "hobbit-sombra-absoluta",
        name: "Sombra Absoluta",
        paCost: 3,
        patamarMinimo: "Intermediário",
        description:
          "A Vantagem racial em Enganação e Furtividade vira Vantagem Absoluta (3d20, escolha o maior). Só afeta essas duas perícias — não é Vantagem Absoluta em mais nada.",
      },
      {
        id: "hobbit-sorte-grande",
        name: "Sorte Grande",
        paCost: 4,
        patamarMinimo: "Santo",
        description:
          "A Sorte do Povo Pequeno passa a duas vezes por Descanso Longo, e também serve pra se defender: transforme um Acerto Crítico contra você num acerto normal.",
      },
    ],
    traits: [
      "Deslocamento base reduzido: 7,5m.",
      "Aparência Enganosa: Vantagem em Enganação e Furtividade.",
      "Pequeno Demais pra Atrapalhar: você pode ocupar o mesmo espaço de outra criatura, desde que ela permita — passar por baixo, subir no ombro, se enfiar atrás das pernas dela. Não concede Cobertura automática nem impede que você seja alvo; só deixa vocês dois no mesmo quadrado.",
      "+1 em Agilidade, permanente.",
      "Sorte do Povo Pequeno: uma vez por Descanso Longo, transforme uma Falha Crítica (1 Natural) sua em um resultado normal — o dado ainda rola, mas o desastre automático não acontece.",
      "Línguas: Língua Humana (Comum) e Língua Bestial, a da Grande Floresta.",
    ],
  },
  {
    id: "raca-fera",
    tier: "comum",
    rollRange: [32, 46],
    name: "Raça Fera (Juuzoku)",
    icon: "/racas/raca-fera.jpg",
    description:
      "Habitantes da Grande Floresta com traços de mamíferos. Fisicamente superiores aos humanos, vida similar.",
    bonuses: { attributes: { forca: 1 } },
    // 2026-09-26: a Fera era a comum mais forte do livro (~3,3 PC) — um cone que
    // atordoa todo mundo no 1º patamar. O atordoar virou o 1º despertar; de
    // graça, o uivo desequilibra.
    upgrades: [
      {
        id: "fera-uivo-que-paralisa",
        name: "Uivo que Paralisa",
        paCost: 3,
        patamarMinimo: "Intermediário",
        description:
          "Quem falha no teste do Grito de Guerra por 5 ou mais fica Atordoado até o fim do próximo turno dele, em vez de Desequilibrado; quem falha por menos fica Desequilibrado, como sempre.",
      },
      {
        id: "fera-furia-da-matilha",
        name: "Fúria da Matilha",
        paCost: 4,
        patamarMinimo: "Santo",
        description:
          "Uma vez por Descanso Longo, gastando 1 Ação: por 1 minuto você tem Resistência a dano cortante, perfurante e contundente, e Vantagem nos ataques corpo a corpo contra criaturas Amedrontadas, Desequilibradas ou Atordoadas.",
      },
    ],
    traits: [
      "Sentidos Selvagens: Vantagem para rastrear pelo olfato; Desvantagem em resistência a fumaça/odores fortes.",
      // Cap. 4 §3: "Não existe ação bônus neste sistema — tudo é medido em Ações".
      // O texto antigo cobrava uma Ação Bônus pelo modo rastreio, que não existe.
      // 2026-08-29: a mecânica estava resumida a uma linha entre parênteses e a
      // mesa não tinha como arbitrar nada — nem alcance, nem CD, nem dano, nem
      // duração. Escrita por inteiro abaixo. O dano escala com o Maior Bônus de
      // Rank pra não virar lixo no rank alto, e o modo ofensivo é 1x por combate
      // porque Atordoado em área por 2 PM no 1º patamar seria, disparado, o
      // melhor efeito por PM do livro inteiro.
      "Magia Inerente — HOWLING (2 PM, 1 Ação): você nasce sabendo, sem gastar PA e sem precisar de escola aberta. Ao conjurar, escolha UM dos dois modos.",
      "Howling · Grito de Guerra (ataque sônico): cone de 9 metros. Cada criatura na área faz teste de resistência de Vigor contra CD 8 + Espírito + seu Maior Bônus de Rank. Falha: sofre 1d6 de dano sônico por ponto do seu Maior Bônus de Rank (1d6 no Principiante, 6d6 no Imperador) e fica Desequilibrada até o fim do próximo turno dela (Atordoada, com o despertar Uivo que Paralisa). Sucesso: metade do dano e nada mais. Uma vez por combate — depois do primeiro uivo, ninguém mais é pego de surpresa.",
      "Howling · Eco de Caça (ecolocalização): o uivo volta e desenha o que tocou. Por 1 minuto você sabe a posição exata de toda criatura a até 30 metros, mesmo no escuro total, mesmo sob invisibilidade mágica, mesmo através de porta, mato ou parede fina. Você sabe ONDE, nunca O QUÊ: tamanho aproximado e posição, não identidade nem intenção. Pedra maciça, chumbo e qualquer barreira mágica bloqueiam o eco. Sem limite de usos.",
      "+1 em Força, permanente.",
      "Instinto de Caçada: Vantagem em Iniciativa contra qualquer criatura que você tenha farejado, rastreado ou observado antes do combate começar.",
      "Línguas: Língua Humana (Comum) e Língua Bestial.",
    ],
  },
  {
    id: "celestial",
    tier: "rara",
    rollRange: [93, 97],
    name: "Raça Celestial (Tenzoku)",
    icon: "/racas/celestial.jpg",
    description: "Habitantes do Continente Divino. Vivem centenas de anos e possuem asas.",
    bonuses: { attributes: { espirito: 1 } },
    upgrades: [
      {
        id: "celestial-asas-de-guerra",
        name: "Asas de Guerra",
        paCost: 3,
        patamarMinimo: "Intermediário",
        description: "Você voa também de armadura média (a pesada continua pesando demais pras asas).",
      },
      {
        id: "celestial-luz-do-continente-divino",
        name: "Luz do Continente Divino",
        paCost: 4,
        patamarMinimo: "Santo",
        description:
          "Uma vez por Descanso Longo, gastando 1 Ação: por 1 minuto, aliados a até 9 metros de você somam o seu Espírito nos testes de resistência de Espírito e são imunes a Amedrontado.",
      },
    ],
    traits: [
      // Voo irrestrito desde a criação é o traço racial mais forte do livro
      // (anula terreno difícil, alcance corpo a corpo e boa parte das armadilhas
      // e dos buracos) e não custava absolutamente nada — sozinho valia
      // ~2 PC, metade do orçamento inicial inteiro. A trava de armadura e carga é
      // o preço: o Celestial escolhe entre voar e ser tanque, em vez de levar os
      // dois. Com ela a raça sai de 3,6 para 3,2 PC e vai pro tier raro do
      // sorteio (RACE_WEIGHT), onde esse patamar de poder pertence.
      // Revisão do livro: voo, queda e limite de carga agora têm regra geral no
      // Cap. 4 (§3, "Alcance, Levantar, Queda, Voo e Montaria"). O traço repete os
      // mesmos números pra ficha se bastar sozinha; se um mudar, mude os dois.
      "Deslocamento de Voo igual ao de caminhada — só sem armadura média ou pesada e sem carregar mais da metade do seu limite de carga (o limite de todo mundo é 15 kg × (Força + 5)): asas não erguem aço.",
      "Voo na prática: voar é Andar pelo ar, pelo mesmo custo. Quem está no chão te alcança corpo a corpo se você estiver até 1,5 m acima do alcance normal dele. Se ficar Atordoado, Paralisado, Incapacitado ou a 0 PV no ar, você cai: 1d6 de dano de queda por 3 m de altura, até 20d6, e fica Caído.",
      "+1 em Espírito, permanente.",
      "Sangue do Continente Divino: Vantagem em testes de resistência de Espírito contra ficar Amedrontado e contra qualquer efeito de origem divina.",
      "Línguas: Língua Humana (Comum) e Língua Divina.",
    ],
  },
  {
    id: "oceano",
    tier: "incomum",
    rollRange: [65, 73],
    name: "Raça do Oceano (Kaizoku)",
    icon: "/racas/oceano.jpg",
    description: "Governantes do Mar de Ringus.",
    // Trocado +4 PV fixos por +1 Vigor. A Raça do Oceano é uma das mais comuns no
    // sorteio e era a única cujo pacote inteiro podia não valer NADA: respirar
    // embaixo d'água, terreno aquático e resistência a correnteza são todos
    // condicionais à campanha, e numa campanha terrestre sobravam +4 PV — 0,17 PC
    // no Imperador, o pacote mais fraco do livro em mesa sem mar. +1 Vigor entrega
    // o mesmo valor na criação (1,0 PC contra 1,0 PC), não decai com o Rank e
    // funciona em qualquer campanha; "governantes do Mar de Ringus" que mergulham
    // sob pressão a vida inteira é o corpo mais óbvio pra pendurar isso.
    bonuses: { attributes: { vigor: 1 } },
    // 2026-09-26: era a raça mais fraca do livro (~1,4 PC), com quase tudo
    // pendurado no mar. Ganhou um traço que funciona em qualquer campanha: o
    // corpo feito pro frio das profundezas (e a Magia de Água é a escola do frio).
    upgrades: [
      {
        id: "oceano-chamado-das-mares",
        name: "Chamado das Marés",
        paCost: 2,
        patamarMinimo: "Intermediário",
        description:
          "Uma vez por Descanso Curto, gastando 1 Ação: uma onda sai de você num cone de 6 metros, mesmo longe do mar. Cada criatura na área faz teste de Força contra CD 8 + Vigor + seu Maior Bônus de Rank; na falha, é empurrada 3 metros e fica Molhada.",
      },
      {
        id: "oceano-pressao-abissal",
        name: "Pressão Abissal",
        paCost: 4,
        patamarMinimo: "Santo",
        description:
          "Uma vez por turno, um ataque ou magia seu contra uma criatura Molhada causa dano extra igual a 2 × seu Maior Bônus de Rank.",
      },
    ],
    traits: [
      "Respira debaixo d'água.",
      "Corpo das Profundezas: Resistência a dano de frio, e você nada com o dobro do seu Deslocamento.",
      "Ignora penalidades de terreno difícil aquático.",
      "+1 em Vigor, permanente.",
      "Pressão das Profundezas: a correnteza, a magia de Água que usa força bruta e o tsunami de cerco te causam metade do dano contundente.",
      "Línguas: Língua Humana (Comum) e Língua do Oceano.",
    ],
  },
  {
    id: "migurd",
    tier: "incomum",
    rollRange: [74, 82],
    name: "Migurd",
    icon: "/racas/migurd.jpg",
    description:
      "Humanoides de cabelos e olhos azuis, ~200 anos de vida, aparência de adolescente até os 150 anos.",
    // +10 PM eram o maior bônus fixo de qualquer raça: +83% da reserva de um
    // Principiante (12 → 22). E mesmo assim o Migurd DESABAVA no fim da campanha
    // — PM fixo vale 0,5 PC por ponto no rank 1 e 0,083 no rank 6, então de 6,15
    // PC na criação sobravam 1,98 no Imperador, abaixo de raças bem mais comuns.
    // Os dois problemas têm a mesma causa (a raça inteira estava pendurada num
    // número que não escala) e a mesma correção: 6 PM tiram o pico da criação, e
    // a Vantagem abaixo — que não decai — segura o valor no rank alto. É também o
    // traço óbvio pra uma espécie que cresce conversando por telepatia.
    // 2026-08-29: mesma correção do Elfo, um degrau acima (×3 contra ×2), que é
    // o que separa "convive com mana" de "nasce falando por ela". Os 6 PM fixos
    // valiam +50% da reserva de um Principiante e +13% da de um Imperador; ×3
    // entrega 3 PM no 1º patamar e 18 no 6º, sem o pico de criação e sem o
    // desabamento no fim que este comentário descrevia em 2026-08-28.
    bonuses: { attributes: { intelecto: 1 }, mpPerMagicRank: 3 },
    upgrades: [
      {
        id: "migurd-rede-telepatica",
        name: "Rede Telepática",
        paCost: 2,
        patamarMinimo: "Intermediário",
        description:
          "A telepatia passa a funcionar com qualquer criatura voluntária a até 30 metros, não só Migurds: o grupo inteiro conversa em silêncio, e isso conta como falar pra tudo que pede voz de comando.",
      },
      {
        id: "migurd-mente-espelho",
        name: "Mente-Espelho",
        paCost: 4,
        patamarMinimo: "Santo",
        description:
          "Você é imune a Amedrontado e a efeitos de controle mental. Uma vez por Descanso Longo, quando resistir a um efeito que leia ou controle a mente, ele volta contra quem o lançou, com a mesma CD.",
      },
    ],
    traits: [
      "+1 em Intelecto, permanente, e PM Máximos iguais ao TRIPLO do seu Maior Bônus de Rank de magia (+3 no Principiante, +18 no Imperador) — a maior reserva racial de nascença, e cresce com você a campanha inteira. Sem nenhuma escola de magia aberta, este bônus é 0.",
      "Telepatia curta com outros Migurds ou seres com telepatia.",
      "Mente Fechada: Vantagem em testes de resistência de Espírito contra qualquer efeito que leia, controle ou confunda a mente — quem nasce falando por telepatia aprende a trancar a própria porta antes de aprender a andar.",
      "Línguas: Língua Humana (Comum) e Língua Migurd, que é telepática: entre Migurds, a conversa não faz som.",
    ],
  },
  {
    id: "superd",
    tier: "rara",
    rollRange: [83, 87],
    name: "Superd",
    icon: "/racas/superd.jpg",
    description: "Pele pálida, cabelos verdes, cauda bifurcada que vira lança tridente.",
    // 2026-08-29: saiu o +1 de Intelecto e o Terceiro Olho deixou de atravessar
    // parede. Ver através de parede não é forte demais — é DESTRUTIVO pro design
    // de masmorra: mapa, emboscada, porta secreta e "o que tem do outro lado"
    // deixam de existir como perguntas na mesa inteira, todo turno, de graça.
    // A Previsão de Movimento entrega o mesmo fantasy (o Superd lê mana e sabe o
    // que vem) num eixo que só afeta combate, que é onde o Ruijerd usa.
    bonuses: {},
    upgrades: [
      {
        id: "superd-leitura-em-grupo",
        name: "Leitura em Grupo",
        paCost: 3,
        patamarMinimo: "Intermediário",
        description:
          "A Previsão de Movimento também protege um aliado adjacente a você: os ataques da criatura lida contra ele têm Desvantagem. Se o aliado se afastar, a proteção passa pra outro adjacente na hora.",
      },
      {
        id: "superd-tridente-ancestral",
        name: "Tridente Ancestral",
        paCost: 4,
        patamarMinimo: "Santo",
        description:
          "Uma vez por turno, quando atacar com uma arma, você ataca também com a Cauda-lança sem gastar Ação — o Ruijerd nunca lutou com uma arma só. Esse golpe é o da mão de apoio do Golpe Duplo (Cap. 4, §3): só o dado da Cauda-lança, um degrau abaixo, sem somar atributo nem Bônus de Rank.",
      },
    ],
    traits: [
      "Previsão de Movimento (1 Ação): escolha uma criatura a até 18m que você possa ver e leia o fluxo de mana dela por 1 minuto — você enxerga o golpe antes de ele sair. Enquanto durar: os ataques dela contra você têm Desvantagem, você tem Vantagem nos testes de resistência contra as habilidades dela, e ela nunca te pega Surpreso.",
      "Previsão de Movimento — limites: uma leitura por vez (trocar de alvo custa outra Ação), e não funciona contra o que não move mana: construto inerte, armadilha mecânica, uma pedra caindo. Ler o fluxo não é ver o futuro; é ver a intenção antes de ela virar movimento.",
      "Cauda-lança: a cauda bifurcada é uma arma racial de verdade — d8 perfurante, sobe a Escada de Dados com os seus degraus como qualquer arma, e você não precisa de mão livre para usá-la.",
      "Sofre Desvantagem em interações sociais com humanos comuns (preconceito antigo) — mas Vantagem Absoluta em Intuição para perceber a intenção real de quem esconde algo, porque a leitura de mana não mente.",
      "Línguas: Língua Humana (Comum) e Língua Demoníaca.",
    ],
  },
  {
    id: "ogro",
    tier: "rara",
    rollRange: [88, 92],
    name: "Ogro (Onizoku)",
    icon: "/racas/ogro.png",
    description: "Extremamente altos e musculosos, machos chegam a 3 metros de altura.",
    // 2026-08-29: removidos os +6 PV Máximos. O Ogro já carrega o maior bônus de
    // atributo do livro (+2 de Força), e Força entra no acerto E no dano de todo
    // golpe — somar vida fixa em cima empilhava dois eixos numa raça que já era
    // a mais direta de jogar. Sem os PV fixos ele continua sendo o pacote mais
    // forte do tier raro, só que por uma via só.
    bonuses: { attributes: { forca: 2 } },
    upgrades: [
      {
        id: "ogro-arremesso-de-gigante",
        name: "Arremesso de Gigante",
        paCost: 2,
        patamarMinimo: "Intermediário",
        description:
          "Gastando 1 Ação, arremesse uma criatura que você esteja Agarrando (do seu tamanho ou menor) até 6 metros: ela sofre 1d6 de dano contundente por ponto do seu Maior Bônus de Rank e fica Caída. Se acertar outra criatura no caminho, as duas sofrem o dano.",
      },
      {
        id: "ogro-colosso",
        name: "Colosso",
        paCost: 5,
        patamarMinimo: "Santo",
        description:
          "Você passa a contar como criatura Grande: seu alcance corpo a corpo aumenta em 1,5 metro, e as armas de duas mãos que você empunha sobem um degrau a mais na Escada de Dados.",
      },
    ],
    traits: [
      "Brutamontes: Vantagem em testes de Força e de Atletismo para quebrar, erguer ou empurrar.",
      "Limite de carga dobrado: 30 kg × (Força + 5), contra os 15 kg × (Força + 5) de todo mundo.",
      "+2 em Força, permanente — o maior bônus num atributo só do livro.",
      "Línguas: Língua Humana (Comum) e Língua Demoníaca.",
    ],
  },
  {
    id: "demonio-imortal",
    // 2026-09-26: de 8% (o mesmo do Elfo) para 2%, tier Lendário — o autor
    // apontou que "uma das melhores raças não era difícil de pegar".
    tier: "lendaria",
    rollRange: [98, 99],
    name: "Demônio Imortal",
    icon: "/racas/demonio-imortal.webp",
    description: "Descendentes do Primeiro Deus Demônio. Pele negra azeviche, seis braços (machos).",
    bonuses: { maxHp: 8 },
    upgrades: [
      {
        id: "demonio-carne-que-volta",
        name: "Carne que Volta",
        paCost: 3,
        patamarMinimo: "Intermediário",
        description:
          "Membros perdidos voltam em 1 hora. E uma vez por Descanso Longo, a Regeneração Profunda funciona mesmo a 0 PV: no início do seu turno você volta com PV iguais ao seu Maior Bônus de Rank e deixa de rolar o Fio da Vida.",
      },
      {
        id: "demonio-imortal-de-fato",
        name: "Imortal de Fato",
        paCost: 5,
        patamarMinimo: "Santo",
        description: "A Regeneração Profunda passa a devolver o DOBRO do seu Maior Bônus de Rank por turno.",
      },
    ],
    traits: [
      // Regenerar 3 PV fixos era +8,8% da vida de um Principiante (34 PV) e +1,5%
      // da de um Imperador (193 PV): a habilidade de assinatura da raça sumia
      // exatamente no rank em que "imortal" devia significar alguma coisa, e era o
      // que segurava o Demônio Imortal em 2,08 PC no fim da campanha apesar de ser
      // raro no sorteio. Amarrar ao Maior Bônus de Rank (Cap. 1 §7) faz ela ir de
      // +1 a +6 por turno, na mesma escala que PV, PM e a compra de reserva do
      // Cap. 1 §2 já usam. Custa 2 PV por turno no Principiante e devolve o dobro
      // no Imperador — de propósito: o preço de escalar é não ser adiantado.
      // Revisão do livro: "no início do seu turno" sem trava deixava a mesa ler
      // que o Demônio volta ao máximo parado alguns minutos fora de combate, o
      // que quebra a campanha de atrito do Cap. 4 ("A Carne Não Fecha Sozinha").
      // A regeneração fica só em combate; fora dele, quem paga é o Descanso Curto.
      "Regeneração Profunda: regenera PV iguais ao seu Maior Bônus de Rank (Cap. 1, §7) no início do seu turno, desde que esteja com mais de 0 PV. Só em combate. Fora dele, cada Descanso Curto devolve a você PV iguais a 5 × seu Maior Bônus de Rank (o teto de dois Descansos Curtos por dia, Cap. 4, §7, continua valendo).",
      "+8 PV Máximos, permanentes.",
      "Descendência Divina: Vantagem em testes de resistência de Vigor contra veneno e doença (Cap. 4, §8).",
      "Línguas: Língua Humana (Comum) e Língua Demoníaca.",
    ],
  },
  {
    id: "dragao",
    tier: "mitica",
    rollRange: [100, 100],
    name: "Raça Dragão (Ryuzoku)",
    icon: "/racas/dragao.webp",
    description:
      "Raça mítica. Fisicamente a mais poderosa da existência, pode viver mais de 100.000 anos — e quem nasce dela ainda é filhote.",
    // 2026-08-29 — buff, e o Dragão entrou no sorteio com 1% exato (ver
    // DRAGON_CHANCE em src/lib/randomCharacter.ts). Antes ele era uma raça
    // "mítica" com o pacote de uma raça rara comum: +1 Força e +5 PV fixos, o
    // mesmo patamar do Celestial, sendo a única que exige aprovação do Mestre.
    //
    // Três mudanças de forma, não só de número:
    // 1. Os +5 PV fixos viraram +1 Vigor. Sob a fórmula nova (Cap. 4, §1) PV
    //    fixo entra FORA do Fator de Vigor e decai; +1 Vigor multiplica a vida
    //    inteira por 1,2 e não decai nunca. Sozinho, isso já vale mais que os 5
    //    PV em qualquer patamar acima do 1º.
    // 2. As garras entraram na Escada de Dados (Cap. 3) em vez de ficarem
    //    travadas em 1d8 pra sempre — um Dragão Imperador desarmado agora bate
    //    como quem empunha arma marcial, que é o mínimo pro fantasy.
    // 3. Ganhou o Sopro, que é a única coisa que uma pessoa espera de um dragão
    //    e que a raça não tinha. Escala com o Maior Bônus de Rank e é limitado
    //    por Descanso Curto, então não vira o recurso principal de ninguém.
    // 2026-09-27 — NERF grande, pedido do autor ("pensei em nerfar muito o
    // dragão… ele tem potencial de ser bem forte, é só gastar PA"). O pacote
    // de antes valia mais de 15 pontos de criação na régua do topo deste
    // arquivo (+2 For +1 Vig, +3 CA, resistência a corte e perfuração, imunidade
    // elemental, voo livre de armadura, garras d10, Sopro de 1d10 por MB) —
    // quinze vezes um Humano. Agora é um filhote de dragão: o pacote cabe no
    // de uma raça lendária (~6 PC, par do Demônio Imortal), e por isso passou a
    // poder ser ESCOLHIDO pelo preço da lendária (3 PA). O dragão adulto é o
    // despertar do Santo, uma vez por dia.
    // Sem asas (2026-09-27, o autor: "em Mushoku eles não têm asas"): a Raça
    // Dragão da obra — Orsted, Laplace, Perugius — tem corpo de gente. Quem
    // voa são os Dragões Vermelhos, que são monstro, não raça.
    bonuses: { attributes: { forca: 1, vigor: 1 }, armorClass: 1 },
    upgrades: [
      {
        id: "dragao-sopro-desperto",
        name: "Sopro Desperto",
        paCost: 3,
        patamarMinimo: "Intermediário",
        description: "O Sopro Dracônico passa a duas vezes por Descanso Curto.",
      },
      {
        id: "dragao-forma-do-dragao",
        name: "Forma do Dragão",
        paCost: 5,
        patamarMinimo: "Santo",
        description:
          "Uma vez por Descanso Longo, gastando 2 Ações, você assume a forma do dragão por 1 minuto: fica Grande (alcance corpo a corpo +1,5 metro), ganha PV Temporários iguais a 5 × seu Maior Bônus de Rank e Resistência a dano cortante e perfurante mundano, as Garras e Presas sobem um degrau na Escada de Dados, e você pode usar o Sopro uma vez a mais durante a forma. Ao voltar, você ganha 1 nível de Exaustão — o corpo de gente não foi feito pra caber um deus.",
      },
    ],
    traits: [
      "Escamas Dracônicas: +1 na CA (permanente, empilha com armadura).",
      "Garras e Presas: ataques desarmados com Dado Base d8, que sobem na Escada de Dados (Cap. 3) com o seu maior patamar do Corpo.",
      "Sopro Dracônico (1 Ação, 1 vez por Descanso Curto): cone de 9 metros do seu elemento, 1d6 por ponto do seu Maior Bônus de Rank (6d6 no Imperador). Agilidade contra CD 8 + Vigor + Maior Bônus de Rank para metade.",
      "+1 em Força e +1 em Vigor, permanentes, e Resistência a um tipo de dano à escolha: ígneo, frio ou elétrico. É o mesmo elemento do seu Sopro.",
      "Cem Mil Anos: você não envelhece de forma perceptível e é imune a doença comum.",
      "O Preço do Sangue: Vantagem em Intimidação, mas Desvantagem Absoluta em Persuasão e Lábia, pra sempre — nada que já foi um deus finge ser gente comum.",
      "Línguas: Língua Humana (Comum) e Língua Dragônica.",
    ],
  },
];

export function getRaceById(id: string | null): Race | undefined {
  return RACES.find((r) => r.id === id);
}
