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
    // Os +6 PM só existiam pra metade das builds: um humano que abre uma árvore
    // do Corpo nunca conjura nada e recebia, na prática, só as 2 perícias — a
    // raça cuja identidade inteira é "versatilidade" era a única com bônus
    // numérico que servia pra um arquétipo só. Dividir em +4 PV / +4 PM mantém o
    // mesmo valor de criação (4 PV = 1,0 PC e 4 PM = 2,0 PC no Principiante,
    // contra os 3,0 PC dos 6 PM antigos) e faz metade do pacote valer pra
    // qualquer ficha, que é literalmente o que adaptabilidade quer dizer.
    bonuses: { maxHp: 4, maxMp: 4 },
    bonusSkillChoices: 2,
    traits: [
      "Adaptabilidade: 2 Perícias extras à escolha, +4 PV e +4 PM Máximos.",
      "Determinação Humana: uma vez por sessão, repita um teste de Atributo (não de Perícia, não de dano) que tenha acabado de falhar e use o novo resultado — humanos vivem menos que qualquer raça deste livro e aprenderam a não desperdiçar a única tentativa que têm.",
    ],
  },
  {
    id: "elfo",
    name: "Elfo (Erufu)",
    description:
      "Habitantes da Grande Floresta. Corpos esguios, orelhas longas, fertilidade baixa e vida longuíssima.",
    // +8 PM eram +67% da reserva de um Principiante (12 → 20) e, pela taxa do
    // Cap. 1 §2, valiam sozinhos 8 PA — o DOBRO dos 4 pontos que o jogador
    // distribui na criação inteira. Com o +1 de Agilidade em cima, o Elfo valia
    // 5,9 PC, mais que qualquer raça rara do sorteio, sendo de raridade média.
    // 5 PM o põem em +42%, na mesma ordem de grandeza do Migurd e do Acólito.
    bonuses: { attributes: { agilidade: 1 }, maxMp: 5 },
    traits: [
      "Sentido da Floresta: Vantagem em Percepção auditiva e em Sobrevivência para navegação.",
      "+1 em Agilidade e +5 PM Máximos, permanentes.",
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
    bonuses: { attributes: { vigor: 1 }, maxHp: 6 },
    fixedSkills: ["Ofícios (Forja)"],
    traits: [
      "Sangue da Forja: magias de Terra e Fogo custam 1 PM a menos para conjurar (mínimo 1). Não pode aprender magias de Água ou Vento.",
      "+1 em Vigor e +6 PV Máximos, permanentes.",
      "Fígado de Pedra: imune a ficar Embriagado e tem Vantagem em testes de resistência de Vigor contra Exaustão por privação (Cap. 4, seção 8).",
    ],
  },
  {
    id: "hobbit",
    name: "Povo Pequeno / Hobbit (Hobitto)",
    description:
      "Vivem na Grande Floresta e em cidades como Millishion. Estatura e aparência de criança humana por toda a vida.",
    bonuses: { attributes: { agilidade: 1 } },
    traits: [
      "Deslocamento base reduzido: 7,5m.",
      "Aparência Enganosa: Vantagem em Enganação e Furtividade.",
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
      "Magia Inerente: nasce sabendo conjurar Howling (2 PM, 1 Ação — ataque sônico ou rastreio).",
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
    bonuses: { attributes: { intelecto: 1 }, maxMp: 6 },
    traits: [
      "+1 em Intelecto e +6 PM Máximos, permanentes.",
      "Telepatia curta com outros Migurds ou seres com telepatia.",
      "Mente Fechada: Vantagem em testes de resistência de Espírito contra qualquer efeito que leia, controle ou confunda a mente — quem nasce falando por telepatia aprende a trancar a própria porta antes de aprender a andar.",
    ],
  },
  {
    id: "superd",
    name: "Superd",
    description: "Pele pálida, cabelos verdes, cauda bifurcada que vira lança tridente.",
    bonuses: { attributes: { intelecto: 1 } },
    traits: [
      // Cap. 4 §3: não existe ação bônus neste sistema. Custando 1 das 3 Ações do
      // turno, o Terceiro Olho continua sendo o melhor sensor do livro sem ser de graça.
      "Terceiro Olho: gastando 1 Ação, enxerga seres vivos, fluxos de mana e invisibilidade mágica através de paredes num raio de 9m, por 1 minuto.",
      "+1 em Intelecto, permanente.",
      "Sofre Desvantagem em interações sociais com humanos comuns (preconceito antigo, Cap. 1) — mas Vantagem Absoluta em Intuição para perceber a intenção real de quem esconde algo, porque o Terceiro Olho não mente.",
    ],
  },
  {
    id: "ogro",
    name: "Ogro (Onizoku)",
    description: "Extremamente altos e musculosos, machos chegam a 3 metros de altura.",
    bonuses: { attributes: { forca: 2 }, maxHp: 6 },
    traits: [
      "Brutamontes: Vantagem em testes de Força bruta.",
      "Limite de carga dobrado.",
      "+2 em Força e +6 PV Máximos, permanentes.",
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
    // "Defesa Base altíssima" era a única promessa numérica do livro sem número
    // nenhum atrás dela: `bonuses` não concedia CA, então a ficha de um Dragão
    // saía com exatamente a mesma CA de um Hobbit (10 + Agilidade). +2 é o valor
    // da Armadura Média do Cap. 5 §2 — a escama vale uma armadura, e continua
    // empilhando com a que ele resolver vestir por cima.
    bonuses: { attributes: { forca: 1 }, maxHp: 5, armorClass: 2 },
    traits: [
      "Escamas Dracônicas: +2 na CA (permanente, empilha com armadura) e resistência natural a ataques cortantes simples.",
      "Aura Primordial e Garras: ataques desarmados causam 1d8 + Força de dano cortante (letal mágico).",
      "+1 em Força e +5 PV Máximos, permanentes, e Resistência a um elemento à escolha (Fogo, Gelo ou Eletricidade).",
      "O Preço do Sangue: Vantagem em Intimidação, mas Desvantagem Absoluta em Persuasão, Lábia ou Diplomacia — nada que já foi um deus finge ser gente comum de verdade.",
    ],
  },
];

export function getRaceById(id: string | null): Race | undefined {
  return RACES.find((r) => r.id === id);
}
