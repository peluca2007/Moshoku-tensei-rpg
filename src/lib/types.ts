export type AttributeKey = "forca" | "agilidade" | "vigor" | "intelecto" | "espirito";

export const ATTRIBUTES: { key: AttributeKey; label: string; short: string }[] = [
  { key: "forca", label: "Força", short: "FOR" },
  { key: "agilidade", label: "Agilidade", short: "AGI" },
  { key: "vigor", label: "Vigor", short: "VIG" },
  { key: "intelecto", label: "Intelecto", short: "INT" },
  { key: "espirito", label: "Espírito", short: "ESP" },
];

const ATTRIBUTE_KEY_BY_LABEL: Record<string, AttributeKey> = {
  Força: "forca",
  Agilidade: "agilidade",
  Vigor: "vigor",
  Intelecto: "intelecto",
  Espírito: "espirito",
};

/** Cap. 1, seção 7: o rótulo do atributo-chave de uma árvore ("Força ou Agilidade") pode citar mais de um — usa sempre o primeiro. */
export function attributeKeyFromLabel(label: string | undefined): AttributeKey | null {
  if (!label) return null;
  const first = label.split(/\s+ou\s+/i)[0].trim();
  return ATTRIBUTE_KEY_BY_LABEL[first] ?? null;
}

export type RankName =
  | "Principiante"
  | "Intermediário"
  | "Avançado"
  | "Santo"
  | "Rei"
  | "Imperador"
  | "Deus";

export const RANKS: RankName[] = [
  "Principiante",
  "Intermediário",
  "Avançado",
  "Santo",
  "Rei",
  "Imperador",
  "Deus",
];

// Capítulo 1, seção 7: bônus numérico fixo por rank, usado em ataque/CD/dano de QUALQUER árvore.
export const RANK_BONUS: Record<RankName, number> = {
  Principiante: 1,
  Intermediário: 2,
  Avançado: 3,
  Santo: 4,
  Rei: 5,
  Imperador: 6,
  Deus: 7,
};

/**
 * Cap. 2, §2: o piso e o teto de tamanho do encantamento de cada rank, em
 * caracteres (2026-09-02).
 *
 * A regra do livro sempre disse que "o tamanho do encantamento é proporcional
 * ao rank", e os cânticos nunca cumpriram isso: Bola de Água (Principiante)
 * tinha 134 caracteres e Zero Absoluto (Imperador) tinha 132. Ler os dois em
 * voz alta custava o mesmo, então o cântico não comunicava poder nenhum — era
 * decoração.
 *
 * Isto existe porque o Bônus de Recitação Perfeita transforma o cântico em
 * mecânica: se recitar bem dá Vantagem, o preço tem que ser tempo real de mesa.
 * Um Imperador que quer o bônus precisa mesmo sustentar meio minuto de fôlego
 * na frente do grupo; um Principiante resolve em uma linha. A dificuldade da
 * interpretação escala junto com o que ela paga.
 *
 * Assinaturas (◆) miram o topo da faixa do próprio rank — são a magia que
 * define o patamar, e devem ser a mais custosa de recitar dele.
 */
export const INCANTATION_LENGTH: Record<RankName, { min: number; max: number }> = {
  Principiante: { min: 90, max: 140 },
  Intermediário: { min: 140, max: 200 },
  Avançado: { min: 200, max: 280 },
  Santo: { min: 280, max: 380 },
  Rei: { min: 380, max: 500 },
  Imperador: { min: 500, max: 650 },
  Deus: { min: 500, max: 900 },
};

/**
 * Cap. 2, §2: o cântico só paga o Bônus de Recitação Perfeita se alcançar o
 * PISO do rank (2026-09-03).
 *
 * Antes disto o bônus era automático: bastava a magia ter um cântico escrito.
 * Uma auditoria de todas as 149 magias achou **55 com cântico abaixo do piso do
 * próprio rank** — Barreira, Cura, Desintoxicação, Invocação e Bardo estavam
 * quase inteiras fora da escada. "Não caias. Ainda não. Prontidão!" são 35
 * caracteres e pagava Vantagem no acerto, o mesmo que um cântico de 380 de rank
 * Rei. O bônus mais forte do livro estava sendo distribuído de graça, e o
 * incentivo era escrever cânticos CURTOS — exatamente o contrário do que o
 * capítulo promete.
 *
 * Agora o piso é a porta. Um cântico abaixo dele não é um erro: é uma magia
 * rápida de propósito (Prontidão, Rejeitar a Morte, Luz Absoluta, Lança de
 * Plasma, Explosão Silenciosa — todas de emergência, e todas com `costNote`
 * explicando a pressa). A velocidade É o benefício dela, e o livro passa a
 * imprimir "Sem bônus de recitação" na carta, em vez de dar as duas coisas.
 *
 * A regra se mede sozinha a partir de INCANTATION_LENGTH, então escrever um
 * cântico curto novo desliga o bônus dele automaticamente — ninguém precisa
 * lembrar de marcar um campo.
 */
export function qualifiesForRecitationBonus(
  incantation: string | undefined,
  rank: RankName
): boolean {
  if (!incantation) return false;
  return incantation.replace(/\\n/g, "\n").trim().length >= INCANTATION_LENGTH[rank].min;
}

// Capítulo 1, seção 3: quantos "conhecimentos" (magias/talentos) a árvore precisa ter
// para liberar a COMPRA do próximo rank, e quanto custa em PA desbloquear esse rank.
export const RANK_REQUIREMENTS: Record<RankName, { knowledgeRequired: number; paCost: number }> = {
  Principiante: { knowledgeRequired: 0, paCost: 1 },
  Intermediário: { knowledgeRequired: 3, paCost: 1 },
  Avançado: { knowledgeRequired: 6, paCost: 2 },
  Santo: { knowledgeRequired: 9, paCost: 2 },
  Rei: { knowledgeRequired: 12, paCost: 3 },
  Imperador: { knowledgeRequired: 15, paCost: 3 },
  Deus: { knowledgeRequired: 18, paCost: 4 },
};

/**
 * Cap. 1, §1: teto por atributo no point-buy da criação.
 *
 * 2026-08-30: baixou de 4 pra 2 a pedido do usuário, e o bônus de Raça /
 * Antecedente deixou de entrar no orçamento (ver ATTRIBUTE_CREATION_POINTS
 * abaixo). A mudança de regime: antes era "distribua 4 pontos entre os 5
 * atributos, e ainda ganhe +1 do Humano e +1 do Plebeu por cima". Um jogador
 * podia abrir o jogo em Força 4/Agilidade 4/Vigor 2 (com o Anão em cima disso)
 * já no 1º turno — corpo, mira e tanque no máximo da criação, sem nenhum
 * tradeoff. Agora ele distribui 2 pontos livres e RECEBE os bônus de raça e
 * antecedente por fora, igual a todo mundo: nenhum deles aumenta o orçamento,
 * só o resultado final. A escolha ficou mais tensa e as raças ficaram
 * relativamente mais fortes, porque elas não disputam mais os 2 pontos que a
 * mesa inteira recebe.
 */
export const ATTRIBUTE_CREATION_MAX = 4;
/**
 * Cap. 1, §1: pontos distribuídos na criação.
 *
 * 2026-08-30: 3 → 2. O Sistema de Defeitos continua devolvendo +1/+2 pelos
 * -1/-2 e fechando a soma dos atributos base em 2 (de qualquer jeito). O que
 * mudou: bônus de Raça/Antecedente/sub-tabela NUNCA entra neste orçamento —
 * são por fora do point-buy, em cima do que o jogador distribui. É a única
 * forma de evitar que uma Raça com +2 de atributo (Ogro, Dragão) ou
 * Antecedente com +1 em dois atributos (Sobrevivente) simplesmente pulasse o
 * cap e deixasse o jogador com 5/6 atributos no 4 sem nenhum custo.
 */
export const ATTRIBUTE_CREATION_POINTS = 2;
/**
 * Cap. 1, §2: custo em PA da N-ésima compra de Atributo (N começa em 1) —
 * progressivo, não fixo. 1 PA nas duas primeiras compras, 2 PA nas duas
 * seguintes, 3 PA nas duas seguintes, e assim por diante.
 *
 * Isto era um número fixo (2 PA por ponto) até 2026-09-03, e a ficha imprimia
 * esse número fixo na tela enquanto `getAttributePaCost` já cobrava a escada
 * progressiva desde a auditoria anterior. O jogador via um total de PA gasto
 * que não batia com a soma das linhas do próprio painel. Agora existe uma
 * função só, e ela é a origem tanto do que o motor cobra quanto do que o livro
 * e a ficha imprimem.
 */
export function attributePaCostForPurchase(n: number): number {
  return Math.floor((n - 1) / 2) + 1;
}

/** Custo total em PA de `count` pontos de Atributo comprados acima do orçamento da criação. */
export function attributePaCostTotal(count: number): number {
  let total = 0;
  for (let i = 1; i <= count; i++) total += attributePaCostForPurchase(i);
  return total;
}

/**
 * Cap. 1, §2: Vantagem permanente em TODOS os Testes de Resistência de um
 * atributo à sua escolha. Uma vez por atributo, então o teto é 5 compras.
 *
 * Baixou de 3 pra 2 PA em 2026-08-29. Ela também deixou de ser só uma linha da
 * tabela: até então não existia em lugar nenhum do site — nenhum campo na ficha,
 * nenhum PA contado, nada no PDF. Era uma compra que o livro vendia e o sistema
 * não sabia que existia.
 */
/**
 * Cap. 1, §2: custo em PA da N-ésima compra de Vantagem em Testes de
 * Resistência (N começa em 1) — 2, 3, 4, e daí 4 pra sempre (teto).
 *
 * Mesma história do custo de atributo acima: era a constante fixa 2, a ficha
 * imprimia `count × 2`, e `getSaveAdvantagePaCost` já cobrava a escada. Uma
 * ficha com as cinco compras mostrava 10 PA numa linha e 17 PA no total.
 */
export function saveAdvantagePaCostForPurchase(n: number): number {
  return Math.min(4, 2 + (n - 1));
}

/** Custo total em PA de `count` compras de Vantagem em Resistência. */
export function saveAdvantagePaCostTotal(count: number): number {
  let total = 0;
  for (let i = 1; i <= count; i++) total += saveAdvantagePaCostForPurchase(i);
  return total;
}

/** Cap. 1, §2: 1 PA compra 2 Perícias. */
export const SKILLS_PER_PA = 2;
/** Cap. 1, §4: 1 PA compra 3 Proficiências ou Línguas — mais baratas porque são mais estreitas. */
export const PROFICIENCIES_PER_PA = 3;
export const ATTRIBUTE_HARD_CAP = 8;
/** Cap. 1, §1: o Sistema de Defeitos deixa um atributo em -1 e outro em -2. Nada desce abaixo disso. */
export const ATTRIBUTE_FLOOR = -2;

/** Cap. 4, "Cálculos Vitais": a constante da fórmula de PV — o corpo com que todo mundo nasce, antes de treino nenhum.
 *
 * 2026-08-30: 20 → 14, nerf geral pedido pelo usuário ("com 5 PA peguei 80 de
 * vida"). A constante soma direto na fórmula, antes do Fator de Vigor e dos
 * Dados de PV, então cada ponto a menos afeta TODOS os personagens
 * uniformemente — sem distorcer a curva entre classes. O diagnóstico dele
 * ("80 PV com 5 PA") é consistente com a fórmula antiga: Vigor 0 + 20 + 2
 * dados médios = 60-70 PV, e os talentos de reserva (+2 por patamar)
 * somavam mais 10-12 PV por 5 PA. 14 tira ~10 PV do piso e mostra que
 * rank baixo é pra rank baixo: lutar no 1º patamar é pra ser arriscado,
 * não confortável.
 */
export const PV_BASE = 14;

/**
 * Cap. 4, "A Escala do Vigor": todo o efeito do Vigor sobre os PV, num fator só.
 *
 * Cada ponto POSITIVO soma 20% — calibrado (não chutado) contra a fórmula de
 * três termos que vigorou até 2026-08-28: medindo `PV_antigo / (PV_BASE + 2×dados)`
 * nas 18 árvores × 6 patamares, o fator implícito da fórmula antiga era 1,14 /
 * 1,38 / 1,61 / 1,84 / 2,07 / 2,31 pra Vigor 1..6 — quase exatamente 1 + 0,20×V,
 * e notavelmente estável entre patamares (era essa estabilidade que provava que
 * a forma multiplicativa cabia). A troca preserva a curva de PV do jogo dentro
 * de ~9 PV em média.
 *
 * O lado NEGATIVO é a mudança de verdade, e é deliberadamente não-linear: -1
 * custa 25% (não 20%) e -2 custa mais 47% do que sobrou. Na fórmula antiga o
 * castigo era perfeitamente linear (4 × Bônus de Rank por ponto) e, pior, o
 * piso de "Constituição Base mínimo 13" achatava Vigor -2, -1, 0 e 1 no MESMO
 * valor de base — no 1º patamar, largar Vigor a -2 custava 8 PV e pagava 2
 * pontos de atributo. Vigor não governa nenhuma perícia (Cap. 1, §4), então
 * ele era o dump stat matematicamente ótimo de toda ficha do livro.
 */
export function getVigorFactor(vigor: number): number {
  if (vigor <= -2) return 0.4;
  if (vigor === -1) return 0.75;
  // Arredondado a duas casas de propósito: `1 + 0.2 * 7` dá 2.4000000000000004
  // em ponto flutuante, e a tabela que o livro imprime diz "×2,40". Sem isto, o
  // motor multiplica por um número que o livro não contém — hoje o Math.floor
  // dos PV esconde a diferença, mas "esconde" não é o mesmo que "não existe".
  return Math.round((1 + 0.2 * vigor) * 100) / 100;
}

/** A Escala do Vigor como o livro a imprime (Cap. 4, §1) — a mesma função acima, tabelada pros valores alcançáveis. */
export const VIGOR_FACTOR_TABLE: { vigor: number; factor: number; label: string }[] = [
  { vigor: -2, factor: 0.4, label: "Corpo Quebrado" },
  { vigor: -1, factor: 0.75, label: "Constituição Frágil" },
  { vigor: 0, factor: 1, label: "Corpo Comum" },
  { vigor: 1, factor: 1.2, label: "Saudável" },
  { vigor: 2, factor: 1.4, label: "Robusto" },
  { vigor: 3, factor: 1.6, label: "Endurecido" },
  { vigor: 4, factor: 1.8, label: "Inquebrável" },
  { vigor: 5, factor: 2.0, label: "Sobre-humano" },
  { vigor: 6, factor: 2.2, label: "Monstruoso" },
  { vigor: 7, factor: 2.4, label: "Lendário" },
  { vigor: 8, factor: 2.6, label: "Divino" },
];

export interface FlatBonuses {
  attributes?: Partial<Record<AttributeKey, number>>;
  maxHp?: number;
  maxMp?: number;
  /**
   * PM que ESCALAM com o Maior Bônus de Rank de magia, em vez de serem um
   * número fixo (Elfo ×2, Migurd ×3 — 2026-08-29).
   *
   * Existe porque bônus fixo de PM é o pior tipo de bônus deste livro: ele vale
   * +67% da reserva de um Principiante e +18% da de um Imperador, então a raça
   * inteira é um pico de criação que evapora. Amarrado ao Bônus de Rank, o
   * mesmo traço vale a mesma fração do começo ao fim — e vale ZERO pra quem
   * nunca abriu uma escola de magia, que é exatamente o certo pra um bônus de
   * mana.
   */
  mpPerMagicRank?: number;
  /** Ex: Miko "Maldição do Ódio" concede +2 CA (aura primordial). */
  armorClass?: number;
}

/**
 * Melhoria racial comprável com PA (Cap. 1, §5) — não vem de graça com a raça,
 * o jogador decide se investe. Hoje só o Povo Pequeno tem uma.
 */
export interface RacialUpgrade {
  id: string;
  name: string;
  paCost: number;
  description: string;
}

export interface Race {
  id: string;
  name: string;
  description: string;
  /**
   * O retrato da raça, em `public/racas/` (2026-09-03).
   *
   * Mesma regra do `Tree.icon`: o arquivo se chama como o `id`, então não
   * existe tabela de mapeamento em lugar nenhum — só a extensão varia, e é por
   * isso que o caminho inteiro mora aqui. Criação, ficha e livro leem daqui.
   */
  icon?: string;
  bonuses: FlatBonuses;
  fixedSkills?: string[];
  bonusSkillChoices?: number;
  /**
   * Quantos pontos de atributo de +1 o jogador distribui livremente ao escolher
   * esta raça (Humano: 1). Diferente de `bonuses.attributes`, que é fixo.
   */
  attributeChoices?: number;
  /** Melhorias raciais que podem ser compradas com PA depois da criação. */
  upgrades?: RacialUpgrade[];
  traits: string[];
}

export interface Background {
  id: string;
  name: string;
  rollRange: [number, number];
  bonuses: FlatBonuses;
  fixedSkills?: string[];
  bonusSkillChoices?: number;
  startingGold: string;
  grantsInitiativeAdvantage?: boolean;
  requiresSubtable?: SubtableId;
  traits: string[];
}

/** Sub-tabelas de antecedente (Cap. 1, §6). O registro com nome, dado e entradas de cada uma vive em src/data/backgrounds.ts (SUBTABLES). */
export type SubtableId = "miko" | "olho" | "laplace";

export interface SubtableEntry {
  id: string;
  roll: number;
  name: string;
  bonuses: FlatBonuses;
  traits: string[];
}

/**
 * Reserva concedida por um talento de árvore, em forma legível pelo motor.
 *
 * Existe desde 2026-08-29: até então os 21 talentos de reserva do livro (Braço
 * de Ferro, Reserva do Curandeiro, Aço Rápido…) eram só texto — nenhum deles
 * mexia num único número da ficha, e o jogador tinha que digitar o resultado à
 * mão no campo de PV/PM avulsos. O Capítulo 1 chama isso de "O Padrão das
 * Reservas" e promete que todo talento desse tipo vale exatamente o mesmo em
 * qualquer árvore; agora o código é quem garante.
 */
export interface ReserveGrant {
  /** +N PV por patamar desbloqueado NA MESMA árvore do talento. */
  hpPerRank?: number;
  /** +N PM por patamar desbloqueado NA MESMA árvore do talento. */
  mpPerRank?: number;
  /**
   * +N PT por patamar desbloqueado NA MESMA árvore do talento (2026-09-03).
   *
   * PT era a única das três reservas fora do Padrão do Cap. 1: PV e PM já
   * escalavam por patamar, e PT vinha como número fixo. A consequência não era
   * só inconsistência — era redundância. Cinco árvores tinham DOIS talentos de
   * PT em patamares diferentes fazendo a mesma coisa com um número diferente
   * ("+2 PT Máximos" no Intermediário, "+3 PT Máximos" no Avançado), e comprar
   * o segundo não mudava nada na mesa além do total.
   *
   * Com PT escalando, um talento só cobre a árvore inteira — e o segundo pôde
   * virar outra coisa: recarga em vez de tanque maior.
   */
  ptPerRank?: number;
  /**
   * +N PT Máximos, valor fixo. Só sobrevive como RIDER em cima de outra
   * reserva — o Ombro de Pedra dá +4 PV por patamar e +1 PT fixo. Nenhum
   * talento deve existir só pra dar PT fixo: era exatamente essa a
   * redundância que o rework de 2026-09-03 desfez.
   */
  pt?: number;
}

/**
 * Pré-requisito de COMPRA: ids de habilidades/talentos da MESMA árvore que
 * precisam já estar comprados (2026-09-03).
 *
 * Dez habilidades do livro carregavam a exigência só na prosa do efeito —
 * "Requer o talento Puro Escudo", "Requer Pacto: Filhote Evolutivo" — e
 * `canPurchaseAbility` só checava rank desbloqueado e duplicata. Na prática
 * dava pra comprar o Golpe de Escudo Soberano sem ter Puro Escudo: a linha de
 * identidade inteira do Escudeiro (sete habilidades Soberanas que só existem
 * pra quem abre mão de arma de dano) era opcional só no texto.
 *
 * Só entra aqui o que é pré-requisito de COMPRA. Condição de uso — "Requer
 * alvo Agarrado", "Requer montaria", "Requer Postura" — continua na prosa,
 * porque é o Mestre que julga na mesa, não a ficha.
 */
export type PrerequisiteIds = string[];
export interface TalentDef {
  id: string;
  name: string;
  paCost: number;
  description: string;
  /** Reserva que este talento concede, quando concede (Cap. 1, "O Padrão das Reservas"). */
  grants?: ReserveGrant;
  /** Ids da mesma árvore que precisam estar comprados antes deste. */
  requires?: PrerequisiteIds;
}

/** Maestria: passiva automática e gratuita concedida ao desbloquear o rank (Cap. 2, seção 5). Não conta como conhecimento. */
export interface MasteryDef {
  name: string;
  description: string;
}

/**
 * Cobre magias (com PM), técnicas de Touki (com PT, Árvore do Corpo) e
 * técnicas de Utilidade (com PP). Nenhum custo de recurso presente = efeito
 * puramente passivo/gratuito além do PA.
 */
export interface AbilityDef {
  id: string;
  name: string;
  paCost: number;
  pmCost?: number;
  /** Custo em Pontos de Touki (Árvore do Corpo, Cap. 3). */
  ptCost?: number;
  /** Custo em Pontos de Preparação (Árvore de Utilidade, Cap. 3). */
  ppCost?: number;
  /** Magia ou Técnica Assinatura (◆) do rank — já reflete o +1 PA extra no paCost. */
  signature?: boolean;
  /** Ritual: não pode ser encurtado, geralmente custa mais Ações. */
  ritual?: boolean;
  /**
   * Por que ESTA magia foge da tabela do rank (Cap. 2, "Nem toda magia obedece
   * à tabela") — 2026-09-02.
   *
   * Até esta data as 149 magias do livro copiavam `MAGIC_ACTIONS[rank]` e
   * `RANK_PA_COST[rank]` sem exceção: toda magia Avançada custava 3 Ações e 2
   * PA, sempre, e o rank virava a única variável de design que existia. O
   * problema não é a tabela — é ela ser inescapável: uma magia que purifica o
   * poço de uma vila e uma que abre a garganta de um homem custavam o mesmo
   * porque nasceram no mesmo patamar.
   *
   * Quando `actions` ou `paCost` divergem do padrão do rank, este campo é
   * OBRIGATÓRIO e explica a troca em uma frase (o self-check de
   * scripts/check-magias.mts falha sem ele). Sem essa nota, um desvio é
   * indistinguível de um erro de digitação — pra quem lê a ficha e pra quem
   * mantém o livro seis meses depois.
   */
  costNote?: string;
  /** Ids da mesma árvore que precisam estar comprados antes desta. */
  requires?: PrerequisiteIds;
  /**
   * Perícias que ESTA habilidade ensina a quem a compra (2026-09-04).
   *
   * Existe porque duas técnicas do Deus do Norte já prometiam isso na prosa —
   * "Concede a perícia Medicina", "Você ganha as perícias Sobrevivência e
   * Percepção" — e não havia onde gravar: `grantedSkills` é da ÁRVORE e só vale
   * se ela for a Inicial. O jogador comprava a técnica e a perícia não aparecia
   * em tela nenhuma. A auditoria de texto de 0.1.12 (`check:texto`) foi quem
   * achou as duas, e a regra dela continua vigiando: prosa que promete perícia
   * sem este campo vira aviso.
   *
   * Diferente de perícia comprada, ela não custa PA — `getSkillPaCost` a trata
   * como gratuita, igual às de raça e antecedente.
   */
  grantsSkills?: string[];
  range: string;
  actions: {
    normal: number;
    encurtada?: number;
    silenciosa?: number | "reação";
  };
  /** true = o "normal" custo é 1 Reação em vez de X Ações. */
  reaction?: boolean;
  damage?: {
    normal: string;
    encurtada?: string;
    /**
     * Bônus que só se aplica sob uma condição (alvo em certo estado, recurso
     * gasto, PV do conjurador) — 2026-09-05.
     *
     * O `check:texto` (regra R5) compara os dados citados no `effect` com os
     * dados de `damage.normal` e avisa quando um só existe na prosa. Um
     * "+1d6 se o alvo estiver Em Chamas" nunca vai caber em `normal` (não é o
     * dano garantido do golpe), mas também não pode ficar invisível pra
     * sempre — por isso mora aqui, fora do que a "régua" do `check:arvores`
     * soma no teto por turno.
     */
    condicional?: string;
    /**
     * Dano que se repete sozinho a cada turno, por uma condição ou terreno
     * que a habilidade deixou pra trás (Em Chamas, cratera de magma) — sem
     * gastar nova Ação. Mesma razão de existir que `condicional`: visível
     * pro `check:texto`, mas fora da soma de `check:arvores`.
     */
    porTurno?: string;
  };
  /**
   * Cura concedida pela MESMA habilidade que também causa dano em
   * `damage.normal` (magias de dano duplo, Cap. 3 de Cura) — 2026-09-05.
   *
   * Cura de magias 100% curativas continua guardada dentro do próprio
   * `damage.normal`, como sempre foi (`combatSim.ts` reconhece o padrão por
   * palavra-chave). Esse campo só existe para o caso em que `damage.normal`
   * já está ocupado pelo dano real e a cura não tem onde ir — sem ele, a
   * cura ficava só na prosa e nenhuma conta a via.
   */
  healing?: { normal: string };
  effect: string;
  incantation?: string;
}

export interface TreeRankDef {
  rank: RankName;
  hpDiceFormula: string;
  /** Árvore do Corpo: PT ganhos ao alcançar este rank (Cap. 3, "PT Pleno"). */
  ptGained?: number;
  /** Árvore de Utilidade: PP ganhos ao alcançar este rank (+1 a partir do 3º patamar). */
  ppGained?: number;
  /** Árvore do Corpo: degraus ganhos na Escada de Dados de Arma neste rank. */
  weaponDieSteps?: number;
  /** Exceção pontual ao custo de RANK_REQUIREMENTS (ex: Cap. 3 — Rei do Norte custa 2 PA em vez de 3, por ter quase 50 titulares vivos). */
  unlockPaCostOverride?: number;
  /** Maestria gratuita concedida ao desbloquear o rank. */
  mastery?: MasteryDef;
  talents: TalentDef[];
  abilities: AbilityDef[];
}

/**
 * A Mecânica Central de uma árvore (Cap. 3, "Como Ler uma Árvore") — 2026-09-03.
 *
 * Toda árvore SEMPRE teve uma ideia própria, e nenhuma delas dizia qual era.
 * O que existia era `tagline`, uma frase de sabor que o livro nem sequer
 * imprimia: a mesa abria o catálogo de Terra e via 24 magias, sem nenhuma linha
 * explicando que a escola inteira gira em torno de prender primeiro e enterrar
 * depois. Quem já sabia jogar deduzia lendo tudo; quem não sabia escolhia a
 * árvore pelo nome.
 *
 * Os quatro campos são deliberadamente rígidos, porque é o rigor que torna as
 * dezenove comparáveis lado a lado:
 *
 * - `tag`   — o rótulo curto, o MESMO que aparece entre colchetes na Maestria
 *             de 1º patamar da árvore. É o gancho de memória.
 * - `hook`  — uma frase: o que esta árvore faz que nenhuma outra faz.
 * - `loop`  — o ciclo de jogo, na ordem em que acontece na mesa. Dois a quatro
 *             passos, cada um uma ação concreta, nunca um adjetivo.
 * - `cost`  — o que ela deliberadamente NÃO faz. Uma árvore sem fraqueza
 *             declarada é uma árvore que ninguém sabe quando não escolher, e é
 *             assim que se escreve um sistema em que todo mundo joga a mesma
 *             ficha.
 */
export interface TreeMechanic {
  tag: string;
  hook: string;
  loop: string[];
  cost: string;
}

export interface Tree {
  id: string;
  name: string;
  category: "magia" | "corpo" | "utilidade";
  subgroup: string;
  /** A ideia única da árvore, explicada no topo do catálogo dela (Cap. 3). */
  mechanic?: TreeMechanic;
  /** Nome cosmético do rank nesta árvore (ex: Armas Pesadas usa "Briguento" em vez de "Principiante"). Mecânica (RANK_BONUS/RANK_REQUIREMENTS) é sempre a do RankName real. */
  rankLabels?: Partial<Record<RankName, string>>;
  /** Atributo(s) que alimentam o BC/CD desta árvore (texto livre — ex: "Força ou Agilidade"). */
  keyAttributeLabel?: string;
  /** Recurso gasto pela árvore, pra exibição (PM, PT, PP, ou "—" pra Utilidade fora de PP). */
  resourceLabel?: string;
  /** Curta descrição de identidade da árvore, usada no painel de detalhes. */
  tagline?: string;
  /**
   * O brasão da árvore, em `public/arvores/` (2026-09-03).
   *
   * O arquivo se chama como o `id` da árvore, então o mapeamento nome→arquivo
   * deixou de existir como tabela: só a extensão varia, e é por isso que o
   * caminho inteiro mora aqui em vez de ser montado por concatenação. Quem
   * desenha (`/arvores`, `/livro`, o seletor de criação, a ficha) lê deste
   * campo — nenhuma tela repete a lista.
   */
  icon?: string;
  /** true = não aparece no seletor de Árvore Inicial (criação); só some acessível depois, desbloqueando na tela de Árvores como qualquer multiclasse (ex: árvores híbridas com pré-requisito de outras duas). */
  hiddenFromCreation?: boolean;
  /** Nota exibida no topo do catálogo (TreeCatalog) explicando um pré-requisito narrativo — não é uma trava de código, o Mestre que decide. */
  prerequisiteNote?: string;
  /**
   * O que esta árvore concede de proficiência e a quais perícias o Bônus de
   * Rank dela se aplica (2026-08-29).
   *
   * O Cap. 1 §4 já dizia que "toda árvore do Corpo concede proficiência com o
   * que ela usa — várias Maestrias de 1º patamar dizem isso explicitamente".
   * "Várias" era exatamente o problema: a informação estava enterrada no meio do
   * texto de algumas Maestrias, ausente nas outras, e nenhuma árvore de Magia ou
   * de Utilidade declarava nada. A mesa tinha que deduzir se um mago de Terra
   * pode vestir cota de malha. Agora as 18 declaram, no topo, antes do 1º patamar.
   */
  proficiencies?: {
    /** Armas e armaduras que a árvore libera, e as que ela proíbe. */
    armas: string;
    /** Perícias ligadas à árvore — e, na Utilidade, em quais o Bônus de Rank soma. */
    pericias: string;
    /** Uma linha de enquadramento: Escola Formal ou Ofício, atributo de conjuração, recurso. */
    nota: string;
  };
  /**
   * As perícias que esta árvore ENSINA (Cap. 1, §4 — "Perícias de Árvore").
   *
   * Elas só entram na ficha se a árvore for a sua ÁRVORE INICIAL. Uma árvore
   * aberta depois ensina técnicas, não hábitos: você já era alguém quando chegou
   * nela. É por isso que `masterySkillsWhenNotFirst` existe como exceção
   * declarada, e não como regra geral.
   *
   * Importante não confundir com `proficiencies.pericias`, que é onde o Bônus de
   * Rank SOMA. As duas coisas são independentes: o Bônus de Rank de uma árvore
   * de Utilidade cobre quatro ou cinco perícias, mas o personagem não fica
   * treinado em todas elas — ele escolhe quais aprende.
   */
  grantedSkills?: {
    /** Perícias garantidas quando esta é a Árvore Inicial. */
    fixed: string[];
    /** Além das fixas, o jogador escolhe `count` desta lista (também só se for a Inicial). */
    choose?: { count: number; from: string[] };
  };
  /**
   * Exceção do Ladino: perícias que a Maestria de 1º patamar ensina a quem
   * chegou DEPOIS — ou seja, entram só quando a árvore NÃO é a Inicial (nesse
   * caso `grantedSkills` já as teria dado). É a única árvore do livro que ensina
   * as próprias perícias a um recém-chegado; em troca, quem a tem como Inicial
   * recebe outra coisa (ver a descrição da Maestria).
   */
  masterySkillsWhenNotFirst?: string[];
  ranks: TreeRankDef[];
}

export interface PurchasedAbility {
  treeId: string;
  rank: RankName;
  kind: "ability" | "talent";
  id: string;
}

export interface UnlockedRank {
  treeId: string;
  rank: RankName;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: "arma" | "armadura" | "geral";
  description?: string;
  /** Bônus de CA se for vestido/empunhado — só se aplica a armadura. */
  acBonus?: number;
  /** Dado Base da arma (Cap. 3: "O Dado de Arma"), ex: "d6", "2d8" — só se aplica a arma. */
  baseDie?: string;
  /** Atributo usado no dano (Força, ou Agilidade pra armas leves — Cap. 3, "As Fórmulas Marciais"). Padrão: Força. */
  damageAttribute?: AttributeKey;
  equipped: boolean;
}

/** Cap. 5, §2: Rank de Aventureiro na Guilda — mede reputação, não poder de combate (RANKS acima). */
export type GuildRank = "F" | "E" | "D" | "C" | "B" | "A" | "S";

/** Ordem crescente de prestígio na Guilda — usada pra comparar "Rank X já libera itens até aqui". */
export const GUILD_RANK_ORDER: GuildRank[] = ["F", "E", "D", "C", "B", "A", "S"];

/** true se `have` já alcança (ou supera) `required` na escada de Rank de Guilda. */
export function meetsGuildRank(have: GuildRank, required: GuildRank): boolean {
  return GUILD_RANK_ORDER.indexOf(have) >= GUILD_RANK_ORDER.indexOf(required);
}

/**
 * Dados de uma ficha de personagem — o site suporta várias, uma por vez ativa.
 * Não guarda um "saldo de PA": o Mestre controla quanto cada ficha tem fora do
 * site, então o sistema só soma e mostra quanto já foi gasto (ver getPaSpent).
 */
export interface CharacterData {
  id: string;
  name: string;
  /**
   * Foto de perfil do personagem, como data URL JPEG (2026-09-04).
   *
   * Opcional e sempre opcional: uma ficha sem foto é uma ficha completa, e o
   * roster cai no brasão da raça, que já resolvia isso desde 0.1.2.
   *
   * Mora DENTRO da ficha, e não como URL externa, porque a promessa do botão
   * "Exportar JSON" é levar a ficha inteira num arquivo só. Quem grava passa
   * obrigatoriamente por `prepararImagem` (`imagemDaFicha.ts`), que reduz e
   * comprime até caber num teto duro de bytes — o `localStorage` guarda o
   * roster inteiro e não avisa quando a cota acaba.
   *
   * Não viaja no link de compartilhamento: ver `fichaLink.ts`.
   */
  portrait?: string;
  /** Capa da ficha, mesmo formato e mesmas regras da `portrait` — só maior. */
  cover?: string;
  /** Texto livre — história de fundo e anotações de mesa. A Entrevista (Via 3) pré-preenche com um rascunho a partir das respostas; o jogador edita à vontade em /ficha. Também sai no PDF exportado. */
  lore: string;
  raceId: string | null;
  backgroundId: string | null;
  subtableEntryId: string | null;
  attributeBase: Record<AttributeKey, number>;
  /**
   * Atributos escolhidos pelo bônus livre da raça (Cap. 1, §5 — hoje só o
   * Humano tem um). Um item por ponto: `Race.attributeChoices` diz quantos, e
   * repetir o mesmo atributo é permitido se a raça der mais de um.
   *
   * Separado de `attributeBase` de propósito: o custo em PA de atributo se mede
   * pela soma do point-buy (Cap. 1, §2), e um bônus de raça não é ponto
   * comprado — misturá-los faria a raça cobrar PA do jogador.
   */
  raceAttributeChoices: AttributeKey[];
  /** Ids de RacialUpgrade já comprados com PA (ex: "hobbit-sombra-absoluta"). */
  racialUpgrades: string[];
  /**
   * Atributos cujos Testes de Resistência têm Vantagem permanente (Cap. 1, §2 —
   * 2 PA cada, uma vez por atributo).
   */
  saveAdvantages: AttributeKey[];
  startingTreeId: string | null;
  unlockedRanks: UnlockedRank[];
  purchasedAbilities: PurchasedAbility[];
  /**
   * Ids de Magias Combinadas compradas (Cap. 2, §4) — 2026-09-03.
   *
   * Elas não cabem em `purchasedAbilities` porque não pertencem a UMA árvore:
   * cada uma nasce do encontro de duas, e a ficha precisa saber disso pra
   * mostrar as duas portas que a destravaram. Antes desta data elas existiam
   * só como tabela impressa no livro — nada as comprava, nada as guardava, e o
   * PA que o texto dizia que elas custavam nunca saía de lugar nenhum.
   */
  purchasedCombinedSpells: string[];
  gold: number;
  inventory: InventoryItem[];
  /** Perícias além das automáticas de raça/antecedente/Árvore Inicial (Cap. 1, §4). */
  skills: string[];
  /**
   * As perícias escolhidas dentro do `grantedSkills.choose` da Árvore Inicial —
   * a parte "escolha 1 destas três" que as árvores de Utilidade usam.
   * Separada de `skills` porque não é comprada com PA: vem da árvore.
   */
  treeSkillChoices: string[];
  /**
   * Proficiências e línguas (Cap. 1, §4). São coisa diferente de perícia: cobrem
   * um instrumento, uma ferramenta, um tipo de arma ou um idioma, e por isso são
   * mais baratas — 1 PA compra TRÊS, contra 2 perícias pelo mesmo 1 PA.
   * Texto livre, porque a lista do mundo é aberta.
   */
  proficiencies: string[];
  /** PV/PM Máximos comprados com PA (Cap. 1, seção 2: 2 PA = +12), fora da árvore. */
  bonusHp: number;
  bonusMp: number;
  /**
   * PV/PM/PT/PP atuais (o que sobrou depois de gastar/sofrer dano em jogo).
   * `null` = ainda não tocado nesta ficha, mostra igual ao máximo calculado.
   * Uma vez definido, fica independente do máximo — subir de nível não cura
   * retroativamente, igual numa mesa de verdade.
   */
  currentHp: number | null;
  currentMp: number | null;
  currentPt: number | null;
  currentPp: number | null;
  /**
   * Sobrescreve o valor calculado quando não-nulo/indefinido — válvula de
   * escape pra itens, maldições ou exceções de mesa que o site não modela.
   * Sempre opcional: por padrão tudo continua 100% calculado a partir da
   * ficha (raça/antecedente/árvores/atributos).
   */
  overrides: {
    maxHp?: number;
    maxMp?: number;
    maxPt?: number;
    maxPp?: number;
    armorClass?: number;
    initiative?: number;
    /** Cap. 5, §2: Rank de Guilda é decisão do Mestre, nunca uma fórmula — isto é o valor que ele fixou. Sem isso, o site mostra uma estimativa por PA gasto, só como chute inicial. */
    guildRank?: GuildRank;
  };
}
