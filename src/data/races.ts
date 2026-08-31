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
 */
export const RACES: Race[] = [
  {
    id: "humano",
    name: "Humano (Jinzoku)",
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
    traits: [
      "Adaptabilidade: 2 Perícias extras à escolha e +1 em UM atributo à sua escolha, permanente — nenhuma outra raça deixa você decidir onde o sangue pesa.",
      "Determinação Humana: uma vez por sessão, repita um teste de Atributo (não de Perícia, não de dano) que tenha acabado de falhar e use o novo resultado — humanos vivem menos que qualquer raça deste livro e aprenderam a não desperdiçar a única tentativa que têm.",
    ],
  },
  {
    id: "elfo",
    name: "Elfo (Erufu)",
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
    traits: [
      "Sentido da Floresta: Vantagem em Percepção auditiva e em Sobrevivência para navegação.",
      "+1 em Agilidade, permanente, e PM Máximos iguais ao DOBRO do seu Maior Bônus de Rank de magia (+2 no Principiante, +12 no Imperador) — séculos de convivência com a mana da Grande Floresta. Sem nenhuma escola de magia aberta, este bônus é 0.",
      "Sangue Longevo: Vantagem em testes de resistência de Vigor contra veneno e doença (Cap. 4, §7) — séculos de vida ensinam o corpo a esperar o pior.",
    ],
  },
  {
    id: "anao",
    name: "Anão (Dowaafu)",
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
    bonuses: { attributes: { vigor: 1 }, maxHp: 10 },
    fixedSkills: ["Ofícios (Forja)"],
    traits: [
      "Sangue da Forja: magias de Terra e Fogo custam 1 PM a menos para conjurar (mínimo 1). Não pode aprender magias de Água ou Vento.",
      "+1 em Vigor e +10 PV Máximos, permanentes — o corpo mais denso do livro.",
      "Fígado de Pedra: imune a ficar Embriagado e tem Vantagem em testes de resistência de Vigor contra Exaustão por privação (Cap. 4, seção 8).",
    ],
  },
  {
    id: "hobbit",
    name: "Povo Pequeno / Hobbit (Hobitto)",
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
        description:
          "A Vantagem racial em Enganação e Furtividade vira Vantagem Absoluta (3d20, escolha o maior). Só afeta essas duas perícias — não é Vantagem Absoluta em mais nada.",
      },
    ],
    traits: [
      "Deslocamento base reduzido: 7,5m.",
      "Aparência Enganosa: Vantagem em Enganação e Furtividade.",
      "Pequeno Demais pra Atrapalhar: você pode ocupar o mesmo espaço de outra criatura, desde que ela permita — passar por baixo, subir no ombro, se enfiar atrás das pernas dela. Não concede Cobertura automática nem impede que você seja alvo; só deixa vocês dois no mesmo quadrado.",
      "Sombra Absoluta (opcional, 3 PA): transforme a Vantagem racial acima em Vantagem Absoluta (Cap. 1, §4). É uma compra, não um bônus grátis — e é a única melhoria racial comprável do livro.",
      "+1 em Agilidade, permanente.",
      "Sorte do Povo Pequeno: uma vez por Descanso Longo, transforme uma Falha Crítica (1 Natural) sua em um resultado normal — o dado ainda rola, mas o desastre automático não acontece.",
    ],
  },
  {
    id: "raca-fera",
    name: "Raça Fera (Juuzoku)",
    description:
      "Habitantes da Grande Floresta com traços de mamíferos. Fisicamente superiores aos humanos, vida similar.",
    bonuses: { attributes: { forca: 1 } },
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
      "Howling · Grito de Guerra (ataque sônico): cone de 9 metros. Cada criatura na área faz teste de resistência de Vigor contra CD 8 + Espírito + seu Maior Bônus de Rank. Falha: sofre 1d6 de dano sônico por ponto do seu Maior Bônus de Rank (1d6 no Principiante, 6d6 no Imperador) e fica Atordoada até o fim do próximo turno dela. Sucesso: metade do dano e nada mais. Uma vez por combate — depois do primeiro uivo, ninguém mais é pego de surpresa.",
      "Howling · Eco de Caça (ecolocalização): o uivo volta e desenha o que tocou. Por 1 minuto você sabe a posição exata de toda criatura a até 30 metros, mesmo no escuro total, mesmo sob invisibilidade mágica, mesmo através de porta, mato ou parede fina. Você sabe ONDE, nunca O QUÊ: tamanho aproximado e posição, não identidade nem intenção. Pedra maciça, chumbo e qualquer barreira mágica bloqueiam o eco. Sem limite de usos.",
      "+1 em Força, permanente.",
      "Instinto de Caçada: Vantagem em Iniciativa contra qualquer criatura que você tenha farejado, rastreado ou observado antes do combate começar.",
    ],
  },
  {
    id: "celestial",
    name: "Raça Celestial (Tenzoku)",
    description: "Habitantes do Continente Divino. Vivem centenas de anos e possuem asas.",
    bonuses: { attributes: { espirito: 1 } },
    traits: [
      // Voo irrestrito desde a criação é o traço racial mais forte do livro
      // (anula terreno difícil, alcance corpo a corpo e boa parte das armadilhas
      // e quedas do Cap. 4) e não custava absolutamente nada — sozinho valia
      // ~2 PC, metade do orçamento inicial inteiro. A trava de armadura e carga é
      // o preço: o Celestial escolhe entre voar e ser tanque, em vez de levar os
      // dois. Com ela a raça sai de 3,6 para 3,2 PC e vai pro tier raro do
      // sorteio (RACE_WEIGHT), onde esse patamar de poder pertence.
      "Deslocamento de Voo igual ao de caminhada — só sem armadura média ou pesada e sem carregar mais da metade do seu limite de carga: asas não erguem aço.",
      "+1 em Espírito, permanente.",
      "Sangue do Continente Divino: Vantagem em testes de resistência de Espírito contra Medo e contra qualquer efeito de origem divina.",
    ],
  },
  {
    id: "oceano",
    name: "Raça do Oceano (Kaizoku)",
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
    traits: [
      "Respira debaixo d'água.",
      "Ignora penalidades de terreno difícil aquático.",
      "+1 em Vigor, permanente.",
      "Pressão das Profundezas: Resistência a dano contundente vindo de água em movimento (correnteza, magia de Água que usa força bruta, tsunami de cerco).",
    ],
  },
  {
    id: "migurd",
    name: "Migurd",
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
    traits: [
      "+1 em Intelecto, permanente, e PM Máximos iguais ao TRIPLO do seu Maior Bônus de Rank de magia (+3 no Principiante, +18 no Imperador) — a maior reserva racial do livro, e a única que não decai. Sem nenhuma escola de magia aberta, este bônus é 0.",
      "Telepatia curta com outros Migurds ou seres com telepatia.",
      "Mente Fechada: Vantagem em testes de resistência de Espírito contra qualquer efeito que leia, controle ou confunda a mente — quem nasce falando por telepatia aprende a trancar a própria porta antes de aprender a andar.",
    ],
  },
  {
    id: "superd",
    name: "Superd",
    description: "Pele pálida, cabelos verdes, cauda bifurcada que vira lança tridente.",
    // 2026-08-29: saiu o +1 de Intelecto e o Terceiro Olho deixou de atravessar
    // parede. Ver através de parede não é forte demais — é DESTRUTIVO pro design
    // de masmorra: mapa, emboscada, porta secreta e "o que tem do outro lado"
    // deixam de existir como perguntas na mesa inteira, todo turno, de graça.
    // A Previsão de Movimento entrega o mesmo fantasy (o Superd lê mana e sabe o
    // que vem) num eixo que só afeta combate, que é onde o Ruijerd usa.
    bonuses: {},
    traits: [
      "Previsão de Movimento (1 Ação): escolha uma criatura a até 18m que você possa ver e leia o fluxo de mana dela por 1 minuto — você enxerga o golpe antes de ele sair. Enquanto durar: os ataques dela contra você têm Desvantagem, você tem Vantagem nos testes de resistência contra as habilidades dela, e ela nunca te pega Surpreso.",
      "Previsão de Movimento — limites: uma leitura por vez (trocar de alvo custa outra Ação), e não funciona contra o que não move mana: construto inerte, armadilha mecânica, uma pedra caindo. Ler o fluxo não é ver o futuro; é ver a intenção antes de ela virar movimento.",
      "Sofre Desvantagem em interações sociais com humanos comuns (preconceito antigo, Cap. 1) — mas Vantagem Absoluta em Intuição para perceber a intenção real de quem esconde algo, porque o Terceiro Olho não mente.",
    ],
  },
  {
    id: "ogro",
    name: "Ogro (Onizoku)",
    description: "Extremamente altos e musculosos, machos chegam a 3 metros de altura.",
    // 2026-08-29: removidos os +6 PV Máximos. O Ogro já carrega o maior bônus de
    // atributo do livro (+2 de Força), e Força entra no acerto E no dano de todo
    // golpe — somar vida fixa em cima empilhava dois eixos numa raça que já era
    // a mais direta de jogar. Sem os PV fixos ele continua sendo o pacote mais
    // forte do tier raro, só que por uma via só.
    bonuses: { attributes: { forca: 2 } },
    traits: [
      "Brutamontes: Vantagem em testes de Força bruta.",
      "Limite de carga dobrado.",
      "+2 em Força, permanente — o maior bônus de atributo de qualquer raça do livro.",
    ],
  },
  {
    id: "demonio-imortal",
    name: "Demônio Imortal",
    description: "Descendentes do Primeiro Deus Demônio. Pele negra azeviche, seis braços (machos).",
    bonuses: { maxHp: 8 },
    traits: [
      // Regenerar 3 PV fixos era +8,8% da vida de um Principiante (34 PV) e +1,5%
      // da de um Imperador (193 PV): a habilidade de assinatura da raça sumia
      // exatamente no rank em que "imortal" devia significar alguma coisa, e era o
      // que segurava o Demônio Imortal em 2,08 PC no fim da campanha apesar de ser
      // raro no sorteio. Amarrar ao Maior Bônus de Rank (Cap. 1 §7) faz ela ir de
      // +1 a +6 por turno, na mesma escala que PV, PM e a compra de reserva do
      // Cap. 1 §2 já usam. Custa 2 PV por turno no Principiante e devolve o dobro
      // no Imperador — de propósito: o preço de escalar é não ser adiantado.
      "Regeneração Profunda: regenera PV iguais ao seu Maior Bônus de Rank (Cap. 1, §7) no início do seu turno, desde que esteja com mais de 0 PV.",
      "+8 PV Máximos, permanentes.",
      "Descendência Divina: Vantagem em testes de resistência de Vigor contra veneno e doença (Cap. 4, §7).",
    ],
  },
  {
    id: "dragao",
    name: "Raça Dragão (Ryuzoku)",
    description:
      "Raça mítica (requer aprovação do Mestre). Fisicamente a mais poderosa da existência, pode viver mais de 100.000 anos.",
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
    bonuses: { attributes: { forca: 2, vigor: 1 }, armorClass: 3 },
    traits: [
      "Escamas Dracônicas: +3 na CA (permanente, empilha com armadura) e Resistência a dano cortante e perfurante não-mágico.",
      "Garras e Presas: seus ataques desarmados usam Dado Base d10, contam como arma marcial mágica e sobem na Escada de Dados (Cap. 3) junto com o seu maior patamar do Corpo — um Dragão desarmado nunca está desarmado.",
      "Sopro Dracônico (1 Ação, 1 vez por Descanso Curto): cone de 12 metros do elemento que você escolheu ao criar o personagem. Dano igual a 1d10 por ponto do seu Maior Bônus de Rank (1d10 no Principiante, 6d10 no Imperador). Teste de resistência de Agilidade contra CD 8 + Vigor + Maior Bônus de Rank para metade do dano.",
      "Asas: Deslocamento de Voo igual ao dobro do seu Deslocamento de caminhada, sem restrição de armadura ou carga — as asas de um Ryuzoku erguem aço sem esforço.",
      "+2 em Força e +1 em Vigor, permanentes, e IMUNIDADE (não Resistência) a um elemento à escolha: Fogo, Gelo ou Eletricidade. É o mesmo elemento do seu Sopro.",
      "Cem Mil Anos: você não envelhece de forma perceptível, é imune a doença comum, e tem Vantagem em testes de resistência de Espírito contra qualquer efeito de Medo ou de controle mental.",
      "O Preço do Sangue: Vantagem em Intimidação, mas Desvantagem Absoluta em Persuasão, Lábia ou Diplomacia — nada que já foi um deus finge ser gente comum de verdade. É o único preço que a raça cobra, e ele é permanente.",
    ],
  },
];

export function getRaceById(id: string | null): Race | undefined {
  return RACES.find((r) => r.id === id);
}
