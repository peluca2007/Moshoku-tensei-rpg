import { Background, SubtableEntry, SubtableId } from "@/lib/types";

/**
 * Balanceamento dos Antecedentes — mesma régua das Raças (ver o cabeçalho de
 * `src/data/races.ts` pra dedução completa das taxas). Resumo: a moeda é o
 * "ponto de criação" (PC), 1 PC = +1 atributo = 2 PA pelo Cap. 1 §2; 1 perícia
 * = 0,25 PC; Vantagem permanente em todos os saves de 1 atributo = 1,5 PC;
 * 1 PV = 0,25 PC no Principiante e 0,042 no Imperador; 1 PM = 0,5 e 0,083.
 * Dinheiro inicial entra a ~50 PO por PC (Armadura Média do Cap. 5 §2: 60 PO
 * por +2 de CA).
 *
 * O problema que a auditoria de 2026-08-28 achou aqui é diferente do das raças:
 * a tabela d100 tem uma curva de raridade explícita (rollRange) e a curva de
 * PODER estava quase INVERTIDA na cauda. Os oito por cento mais raros da tabela
 * (93-100: Miko, Olho Místico, Gênio) valiam em média ~1,3 PC, enquanto o
 * Estudioso Precoce (8%) valia 8,35 na criação e o Fator Laplace (6%) valia
 * 14,75 — os dois puxados por bônus de PM absurdos (+14 e +20 numa reserva
 * inicial de 12). Simultaneamente, o resultado MAIS comum da tabela (Plebeu,
 * 15%) era o mais fraco de todos e desabava pra 0,73 PC no Imperador.
 * Correções abaixo, cada uma comentada no lugar.
 */
export const BACKGROUNDS: Background[] = [
  {
    id: "plebeu",
    name: "Plebeu / Trabalhador Rural",
    rollRange: [1, 15],
    // Plebeu é o resultado MAIS COMUM da tabela (15 em 100) e era o mais fraco
    // de todos: 1,35 PC na criação e 0,73 no Imperador, metade do segundo pior.
    // Uma faixa comum pode ser modesta, nunca lixo — é o que a maioria das
    // fichas da mesa vai rolar. +3 PV eram +8% da vida de um Principiante e
    // +1,5% da de um Imperador; +1 Vigor vale o mesmo na criação (1,0 PC contra
    // 0,75), não decai, e é literalmente o "corpo calejado" que o traço promete.
    bonuses: { attributes: { vigor: 1 } },
    bonusSkillChoices: 2,
    startingGold: "2d4",
    traits: [
      "2 Perícias ligadas a trabalhos mundanos (Ofícios, Culinária, Lidar com Animais ou Natureza).",
      "+1 em Vigor, permanente — corpo calejado por uma infância inteira de trabalho braçal.",
    ],
  },
  {
    id: "orfao",
    name: "Órfão das Ruas",
    rollRange: [16, 25],
    bonuses: { attributes: { agilidade: 1 } },
    bonusSkillChoices: 2,
    startingGold: "1d4",
    traits: [
      "2 Perícias de sobrevivência urbana (Furtividade, Ladinagem, Enganação ou Acrobacia).",
      "+1 em Agilidade, permanente.",
      "Instinto de Rua: Vantagem em Percepção para notar armadilhas, emboscadas, bolsos alheios e vigias — ninguém sobrevive na rua sem aprender a ler uma esquina.",
    ],
  },
  {
    id: "crianca-selvagem",
    name: "Criança Selvagem",
    rollRange: [26, 35],
    bonuses: { maxHp: 6, attributes: { vigor: 1 } },
    fixedSkills: ["Sobrevivência"],
    startingGold: "0",
    traits: [
      "+6 PV Máximos e +1 em Vigor, permanentes.",
      "Rola Sobrevivência com Vantagem para achar comida, água e abrigo.",
    ],
  },
  {
    id: "aprendiz-mercador",
    name: "Aprendiz de Mercador",
    rollRange: [36, 45],
    bonuses: { attributes: { intelecto: 1 } },
    fixedSkills: ["Intuição", "Lábia"],
    startingGold: "4d4+10",
    traits: [
      "+1 em Intelecto, permanente.",
      "Sexto Sentido Comercial: sempre sabe o preço justo de mercado de qualquer item comum, e tem Vantagem em testes pra perceber quando alguém está blefando numa negociação.",
    ],
  },
  {
    id: "treino-precoce",
    name: "Treino Precoce / Escudeiro",
    rollRange: [46, 55],
    bonuses: { attributes: { forca: 1 } },
    fixedSkills: ["Atletismo"],
    startingGold: "2d4+2",
    grantsInitiativeAdvantage: true,
    traits: [
      "Vantagem em todas as rolagens de Iniciativa.",
      "+1 em Força, permanente — anos carregando a armadura de outra pessoa antes de vestir a própria.",
    ],
  },
  {
    id: "acolito",
    name: "Acólito / Filho do Templo",
    rollRange: [56, 65],
    // O Acólito era o antecedente mais desigual entre builds: pra um mago valia
    // 3,60 PC na criação, pra um guerreiro valia as 2 perícias e mais nada — e
    // pra qualquer um dos dois desabava pra 1,10 no Imperador, o penúltimo lugar
    // da tabela. Trocar 2 dos 6 PM por +1 Espírito mantém o mesmo valor de
    // criação (3,60) e resolve os dois problemas de uma vez: Espírito é o
    // atributo que ALIMENTA a reserva de PM (Cap. 4 §1) e o BC de Cura,
    // Barreira, Desintoxicação e Invocação — as quatro escolas de templo — e
    // ainda serve de resistência mental pra um acólito que nunca conjurou nada.
    bonuses: { attributes: { espirito: 1 }, maxMp: 4 },
    fixedSkills: ["Religião", "Medicina Básica"],
    startingGold: "2d4",
    traits: [
      "+1 em Espírito e +4 PM Máximos, permanentes — a educação religiosa desperta uma afinidade latente com mana que nunca mais desaparece.",
    ],
  },
  {
    id: "sangue-nobre",
    name: "Sangue Nobre",
    rollRange: [66, 72],
    bonuses: { attributes: { espirito: 1 } },
    fixedSkills: ["Persuasão", "História"],
    startingGold: "6d4+20",
    traits: [
      "Vantagem em testes sociais ao lidar com autoridades.",
      "+1 em Espírito, permanente — comandar serviçais desde criança ensina presença antes de ensinar humildade.",
    ],
  },
  {
    id: "estudioso-precoce",
    name: "Estudioso Precoce (Expansão)",
    rollRange: [73, 80],
    // +14 PM MAIS QUE DOBRAVAM a reserva de qualquer mago recém-criado (12 → 26,
    // +117%) — um resultado de 8% da tabela entregando, sozinho, mais PM do que
    // a raça mais mágica do livro. Pela taxa do Cap. 1 §2 isso valia 14 PA, três
    // vezes e meia os 4 pontos que o jogador distribui na criação inteira. Com 8
    // ele fica em +67%, empatado com o Fator Laplace corrigido logo abaixo — que
    // é um resultado mais raro (6%) e traz duas Vantagens e +2 de atributo junto.
    bonuses: { maxMp: 8, attributes: { intelecto: 1 } },
    fixedSkills: ["Arcanismo"],
    startingGold: "2d4",
    traits: ["+8 PM Máximos e +1 em Intelecto, permanentes."],
  },
  {
    id: "sobrevivente",
    name: "Sobrevivente / Ex-Escravo",
    rollRange: [81, 86],
    // Sobrevivente é uma faixa rara (6 em 100, mais rara que Sangue Nobre) e
    // valia 1,75 PC — abaixo do Órfão e do Aprendiz de Mercador, que são quase
    // o dobro mais comuns, e sem nenhum dinheiro inicial pra compensar. +1 de
    // Espírito é o atributo que as duas metades do traço já citam (a Vantagem
    // contra Medo é um teste de Espírito) e o que a descrição inteira descreve:
    // não é o corpo que sobreviveu, é a vontade.
    bonuses: { attributes: { vigor: 1, espirito: 1 } },
    startingGold: "0",
    traits: [
      "Vantagem em resistência de Espírito (contra Medo) e de Vigor (contra Exaustão).",
      "+1 em Vigor e +1 em Espírito, permanentes — o corpo que sobreviveu ao pior já não se assusta com o segundo pior, e a vontade que o carregou até aqui não some junto com as cicatrizes.",
    ],
  },
 
  {
    id: "miko",
    name: "Miko (Abençoada/Amaldiçoada)",
    rollRange: [87, 92],
    // Cinco das oito entradas da MIKO_TABLE têm `bonuses: {}` — não mexem em
    // número nenhum da ficha — e três delas carregam maldições pesadas o
    // bastante pra sair NEGATIVAS (Esquecimento, Telepatia, Confiança Absoluta).
    // Resultado: o antecedente com 4% de chance, que o próprio texto descreve
    // como "cerca de 10 no mundo inteiro", valia em média 1,74 PC na criação e
    // 0,70 no Imperador — o pior da tabela d100, atrás do Plebeu de 15%. Um
    // piso de +1 Espírito no PRÓPRIO antecedente (a anomalia de mana que causa
    // a mutação também engrossa a alma que a carrega) levanta as oito entradas
    // de uma vez sem tocar em nenhuma, e é o que impede as duas piores
    // (Esquecimento, Telepatia) de valerem literalmente zero. A variância entre
    // os 1d8 continua enorme de propósito: abençoada ou amaldiçoada é o ponto.
    bonuses: { attributes: { espirito: 1 } },
    startingGold: "2d4",
    requiresSubtable: "miko",
    traits: [
      "+1 em Espírito, permanente — a anomalia de mana que produz a mutação não fica só no poder: ela engrossa a alma que o carrega.",
      "Role 1d8 na Tabela de Miko para definir a mutação mágica.",
    ],
  },
   {
    id: "fator-laplace",
    name: "Fator Laplace / Linhagem Antiga",
    rollRange: [92, 94],
    // 2026-08-29: todos os bônus fixos saíram e o antecedente passou a rolar 1d4
    // na LAPLACE_TABLE. Duas razões.
    //
    // A primeira é a que o usuário apontou: o Fator Laplace (6% da tabela) estava
    // mecanicamente ACIMA do Gênio (2%, o resultado mais raro do livro). Um
    // antecedente três vezes mais comum não pode ser o mais forte — a curva de
    // raridade e a de poder têm que apontar pro mesmo lado.
    //
    // A segunda é de identidade. "Linhagem Antiga" é a única entrada da tabela
    // cujo texto promete algo IMPREVISÍVEL acordando no sangue, e ela era a mais
    // previsível de todas: sempre os mesmos +2/+8/+6. Uma sub-tabela de 1d4 faz
    // dois Fatores Laplace na mesma mesa serem coisas diferentes, que é o que a
    // ficção sempre disse. Cada mutação vale +1 de atributo (que não decai) mais
    // um traço que também não decai — abaixo do Gênio nas quatro faces.
    bonuses: {},
    requiresSubtable: "laplace",
    startingGold: "1d4",
    traits: [
      "Role 1d4 na Tabela do Fator Laplace: a linhagem acordou de um jeito, e não é o mesmo em dois portadores. A mutação sorteada é permanente.",
      "Conjuração Silenciosa desde o nascimento (Cap. 2, seção 2): você manipula mana sem palavra alguma — ninguém te ensinou, você nunca soube fazer diferente. Sofre as penalidades normais do método (metade dos dados, área reduzida em um terço); quem não as sofre é o Gênio, e só ele.",
      "Vantagem em testes de resistência de Espírito contra Medo, Amedrontado e qualquer efeito que tente controlar sua mente: o que quer que exista na sua linhagem, não se deixa comandar.",
      "Desvantagem em Persuasão com desconhecidos — pessoas comuns sentem, mesmo sem saber o porquê, que algo em você quer distância.",
    ],
  },

  {
    id: "olho-mistico",
    name: "Olho Místico Inato",
    rollRange: [94, 98],
    // As DEZ entradas da OLHO_TABLE têm `bonuses: {}`: o segundo resultado mais
    // raro do livro (2 em 100) não mexia em um único número da ficha. Pior, era
    // autocontraditório — todo olho roda a PM (Previsão 3 PM/turno, Vazio
    // Absoluto 5 PM/turno, Olhos Que Tudo Veem 10 PM de uma vez) e o
    // antecedente não concedia PM nenhum, num personagem recém-criado que tem
    // 12 no total: o Magan mais caro da tabela consumia 83% da reserva por uso.
    // +6 PM fazem o olho ser jogável desde a primeira sessão (12 → 18, seis
    // turnos de Previsão em vez de quatro) e +1 de Intelecto é o valor que não
    // decai — e é o atributo certo, já que todo Magan aqui revela informação.
    bonuses: { attributes: { intelecto: 1 }, maxMp: 6 },
    startingGold: "2d4",
    requiresSubtable: "olho",
    traits: [
      "+1 em Intelecto e +6 PM Máximos, permanentes — o olho não vem sozinho: o corpo que o carrega já nasce com a mana de sobra que ele consome.",
      "Role 1d10 na Tabela de Olhos Místicos para definir o Magan.",
    ],
  },
  {
    id: "genio",
    name: "Gênio (Conjuração Silenciosa)",
    rollRange: [98, 100],
    // 99-100 é o resultado mais raro da tabela inteira (2%) e precisa ser o mais
    // forte, sem discussão — foi o pedido explícito do usuário em 2026-08-29,
    // depois de o Fator Laplace (6%) estar acima dele.
    //
    // Onde o Gênio ganha, e por que é definitivo: ele é o ÚNICO personagem do
    // livro que conjura em silêncio com dano cheio e área cheia. Pela regra do
    // Cap. 2 §2, a Conjuração Silenciosa custa menos Ações que a Padrão E dá um
    // Bônus de Forma grátis — o preço disso são metade dos dados e um terço da
    // área. O Gênio simplesmente não paga esse preço. Na prática ele conjura a
    // versão completa de qualquer magia pelo custo de Ação da versão reduzida,
    // com um bônus de forma de brinde, a campanha inteira.
    //
    // A extensão de 2026-08-29 (Silenciosa gratuita até o Avançado, contra só o
    // Principiante de todo mundo) é o que torna a superioridade IMPOSSÍVEL de
    // discutir sem inflar número nenhum: é economia de ação, o recurso mais caro
    // do sistema (Cap. 4 §4 tem um teto explícito pra ele), e cresce em valor
    // conforme as magias ficam caras em Ações.
    bonuses: { attributes: { intelecto: 1, espirito: 1 } },
    startingGold: "2d4",
    traits: [
      "Conjuração Silenciosa (Cap. 2, seção 2) sem sofrer a redução de dano nem a redução de área — você é o único no livro que conjura em silêncio com o feitiço inteiro. O custo de Ação reduzido e o Bônus de Forma gratuito continuam valendo: você não perde nada e ganha os dois.",
      "Prodígio: a Conjuração Silenciosa gratuita da primeira magia de cada turno vale até o rank AVANÇADO, não só o Principiante (Cap. 2, §2). Todo outro conjurador silencioso do mundo tem essa cortesia só no patamar mais baixo que conhece.",
      "+1 em Intelecto e +1 em Espírito, permanentes — precisão e reserva ao mesmo tempo, que é o que fez de você um gênio antes de qualquer aula.",
    ],
  },
];

export const MIKO_TABLE: SubtableEntry[] = [
  {
    id: "forca-sobre-humana",
    roll: 1,
    name: "Força Sobre-humana (Zanoba)",
    // +3 de Força era o maior bônus de atributo do livro inteiro (o segundo é o
    // +2 do Ogro): 75% do orçamento de criação vindo de UM resultado de 1d8
    // dentro de um antecedente de 4%. Com o teto de criação em 4, isso punha o
    // personagem em Força 7 já na primeira sessão — +7 no acerto E +7 no dano de
    // todo golpe, contra os +4 de qualquer outra ficha. A maldição não paga por
    // isso: o Cap. 1 §4 diz que "Vigor não governa nenhuma perícia", então a
    // Desvantagem só morde em testes de resistência. +2 mantém Zanoba como a
    // Miko mais forte da tabela sem dobrar o teto de atributo de todo mundo.
    bonuses: { attributes: { forca: 2 } },
    traits: [
      "Abençoada: +2 em Força, permanente, e ataques desarmados causam 1d8 + Força (letal).",
      "Maldição: Desvantagem em testes de Vigor (sem resistência física).",
    ],
  },
  {
    id: "leitura-memorias",
    roll: 2,
    name: "Leitura de Memórias",
    bonuses: {},
    traits: [
      "Abençoada: 1 Ação de toque lê memórias superficiais e intenções (Vantagem em Intuição/Interrogatório).",
      "Maldição: custa 3 PM por uso.",
    ],
  },
  {
    id: "rebobinar-tempo",
    roll: 3,
    name: "Rebobinar o Tempo",
    bonuses: {},
    traits: [
      "Abençoada: 1x/semana rebobina o estado de um objeto inanimado em até 24h.",
      "Maldição: drena 50% do PM Máximo atual; não funciona em criaturas vivas.",
    ],
  },
  {
    id: "telepatia",
    roll: 4,
    name: "Telepatia",
    bonuses: {},
    traits: [
      "Abençoada: lê pensamentos superficiais e fala telepaticamente num raio de 18m.",
      "Maldição: fisicamente muda; Desvantagem em Iniciativa.",
    ],
  },
  {
    id: "confianca-absoluta",
    roll: 5,
    name: "Miko da Confiança Absoluta",
    bonuses: {},
    traits: [
      "Abençoada: Vantagem Absoluta em Persuasão e Lábia.",
      "Maldição: falha automaticamente em Intuição para perceber mentiras.",
    ],
  },
  {
    id: "esquecimento",
    roll: 6,
    name: "Maldição do Esquecimento",
    bonuses: {},
    traits: [
      "Abençoada: Vantagem Absoluta em Furtividade (presença nula).",
      "Maldição: quase ninguém lembra do seu rosto/nome/existência 10min após sair do campo de visão.",
    ],
  },
  {
    id: "acumulo",
    roll: 7,
    name: "Maldição do Acúmulo",
    // +15 PM eram +125% da reserva de um Principiante e valiam 7,5 PC sozinhos —
    // quase o dobro do orçamento inicial inteiro, saindo de um 1d8. Era o que
    // fazia a MIKO_TABLE ter 6,75 PC de amplitude entre a melhor e a pior
    // entrada, num mesmo dado. 10 mantém o "reator infinito" (12 → 22 PM,
    // +83%, ainda o maior bônus de PM de qualquer resultado do livro) sem que
    // rolar 7 no 1d8 valha três vezes rolar 6.
    bonuses: { maxMp: 10 },
    traits: [
      "Abençoada: +10 PM Máximos (reator infinito).",
      "Maldição: exige 'liberação' semanal; falhar aplica 1 nível de Exaustão por dia até a morte.",
    ],
  },
  {
    id: "odio",
    roll: 8,
    name: "Maldição do Ódio",
    bonuses: { maxHp: 10, armorClass: 2 },
    traits: [
      "Abençoada: +2 na CA e +10 PV Máximos (aura primordial).",
      "Maldição: todo ser que sinta mana sofre ódio instintivo e paranóico ao te ver.",
    ],
  },
];

// Cap. 4 §3: "Não existe ação bônus neste sistema — tudo é medido em Ações", e o
// turno tem 3 Ações mais 1 Reação. Três olhos cobravam moedas de ação que o livro
// não tem ("Ação Bônus" em dois, "Ação Livre" num terceiro) — o único lugar do
// sistema, junto do Terceiro Olho do Superd, que ainda fazia isso. Ativar o Magan
// custa 1 das 3 Ações do turno, como qualquer outra coisa; manter, nada.
export const OLHO_TABLE: SubtableEntry[] = [
  { id: "previsao", roll: 1, name: "Olho da Previsão", bonuses: {}, traits: ["1 Ação pra ativar, 3 PM/turno: vê 2s no futuro (Vantagem em ataques, oponentes têm Desvantagem contra você). Mais de 3 turnos seguidos causa Tontura por 1h."] },
  { id: "poder-magico", roll: 2, name: "Olho do Poder Mágico", bonuses: {}, traits: ["1 Ação, 2 PM/cena: vê fluxo de mana, invisíveis mágicos, identifica itens mágicos e nível de perigo."] },
  { id: "clarividencia", roll: 3, name: "Olho da Clarividência", bonuses: {}, traits: ["1 Ação, 1 PM/km: visão telescópica tipo drone. Corpo físico fica Cego e indefeso (CA 10) enquanto em uso."] },
  { id: "permeacao", roll: 4, name: "Olho de Permeação", bonuses: {}, traits: ["1 Ação, 2 PM/cena: Raio-X através de paredes/roupas (9m). Não atravessa criaturas vivas ou materiais densos em mana."] },
  { id: "identificacao", roll: 5, name: "Olho de Identificação", bonuses: {}, traits: ["1 Ação, 1 PM/alvo: revela fraquezas, nome do feitiço e efeitos. Segredos divinos/de outros continentes aparecem como 'Desconhecido'."] },
  { id: "absorcao", roll: 6, name: "Olho da Absorção", bonuses: {}, traits: ["Reação, PM igual ao da magia absorvida: anula magia inimiga. Lançar magia com o olho descoberto suga o próprio feitiço (perde ação, PM e a magia falha)."] },
  { id: "tudo-veem", roll: 7, name: "Olhos Que Tudo Veem", bonuses: {}, traits: ["Ritual de 10min, 10 PM, 1x/semana: rastreia alguém no globo ou revela planta de masmorra. Deixa Visão Embaçada (-2 em acertos físicos) pelo resto do dia."] },
  { id: "vazio-absoluto", roll: 8, name: "Olho do Vazio Absoluto", bonuses: {}, traits: ["1 Ação, 5 PM/turno mantido: barreira de repulsão de 9m. Não pode atacar ou se mover enquanto mantiver."] },
  { id: "afeicao", roll: 9, name: "Olho de Afeição", bonuses: {}, traits: ["Passiva se descoberto, 1 PM/hora: quem olha nos seus olhos faz teste de Espírito com Desvantagem ou desenvolve infatuação perigosa (risco de obsessão yandere)."] },
  { id: "rastreador", roll: 10, name: "Olho Rastreador", bonuses: {}, traits: ["1 Ação de Busca, 2 PM (recente) / 10 PM (décadas): revela rastros de vida, segue pegadas por continentes. Rastreio antigo tem cooldown de 1x/mês."] },
];

export function getBackgroundById(id: string | null): Background | undefined {
  return BACKGROUNDS.find((b) => b.id === id);
}

/**
 * Tabela do Fator Laplace (1d4) — Cap. 1, §6. Criada em 2026-08-29 pra substituir
 * os bônus fixos do antecedente.
 *
 * Régua das quatro faces: cada uma dá +1 de atributo (que multiplica e não decai)
 * mais UM traço permanente de natureza diferente — reserva, sobrevivência,
 * conhecimento e presença. Nenhuma toca em Conjuração Silenciosa: o que separa o
 * Fator Laplace do Gênio é justamente isso, e diluir essa fronteira desfaria a
 * correção inteira. Nenhuma face chega perto do pacote do Gênio, de propósito:
 * 6% da tabela não pode competir com 2%.
 */
export const LAPLACE_TABLE: SubtableEntry[] = [
  {
    id: "veias-abertas",
    roll: 1,
    name: "Veias Abertas",
    bonuses: { attributes: { espirito: 1 } },
    traits: [
      "+1 em Espírito, permanente.",
      "A mana corre solta em você e não fica parada: ao terminar um Descanso Curto, recupere PM adicionais iguais ao seu Maior Bônus de Rank de magia, além do que o descanso já devolve.",
      "O corpo não fecha a torneira: você não consegue esconder que é um conjurador de quem enxerga mana (todo Superd, todo mago Avançado ou superior).",
    ],
  },
  {
    id: "carne-que-lembra",
    roll: 2,
    name: "Carne que Lembra",
    bonuses: { attributes: { vigor: 1 } },
    traits: [
      "+1 em Vigor, permanente.",
      "Uma vez por combate, ao chegar a 0 PV, você estabiliza automaticamente sem rolar o Fio da Vida (Cap. 4, §6) — a carne fecha antes de você decidir. Continua Inconsciente; só não morre.",
      "Toda cicatriz sua reabre quando a linhagem é mencionada em voz alta perto de você. Não causa dano; causa perguntas.",
    ],
  },
  {
    id: "memoria-da-linhagem",
    roll: 3,
    name: "Memória da Linhagem",
    bonuses: { attributes: { intelecto: 1 } },
    traits: [
      "+1 em Intelecto, permanente.",
      "Vantagem Absoluta (Cap. 1, §4) em Arcanismo e História sobre qualquer coisa anterior ao seu nascimento — você não deduz, você LEMBRA, e as lembranças não são suas.",
      "Nada disso vale pro presente: sobre o que aconteceu depois de você nascer, seus testes são normais como os de qualquer um.",
    ],
  },
  {
    id: "presenca-errada",
    roll: 4,
    name: "Presença Errada",
    bonuses: { attributes: { agilidade: 1 } },
    traits: [
      "+1 em Agilidade, permanente.",
      "Bestas, insetos gigantes e mortos-vivos sem mente não atacam você por iniciativa própria — algo neles reconhece o que você carrega e recua. Perdem o medo se você atacar primeiro, ou se alguém com mente os obrigar.",
      "Animais domésticos fogem de você. Cavalo não te aceita; cão late até você sair de vista.",
    ],
  },
];

/** Toda sub-tabela de antecedente do livro, num registro só — acrescentar uma é uma linha aqui, e nenhuma no resto do código. */
export const SUBTABLES: Record<SubtableId, { name: string; die: string; entries: SubtableEntry[] }> = {
  miko: { name: "Miko e Amaldiçoados", die: "1d8", entries: MIKO_TABLE },
  olho: { name: "Olhos Demoníacos / Místicos", die: "1d10", entries: OLHO_TABLE },
  laplace: { name: "Fator Laplace", die: "1d4", entries: LAPLACE_TABLE },
};

export function getSubtableEntryById(
  table: SubtableId,
  id: string | null
): SubtableEntry | undefined {
  const source = SUBTABLES[table].entries;
  return source.find((e) => e.id === id);
}
