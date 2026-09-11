/**
 * Simulador de combate — o playtest que o livro não tinha.
 *
 * O Apêndice C promete uma curva de dano e o Apêndice G promete uma curva de
 * criatura. Nada nunca rodou as duas uma contra a outra. Este script pega
 * fichas montadas com o MESMO orçamento de PA, resolve os números delas pelo
 * motor de verdade (`selectors.ts`, os mesmos que a ficha do site usa), e faz
 * elas se baterem com dados rolados.
 *
 * O motor de combate em si vive em `src/lib/combatSim.ts` desde 2026-09-03,
 * compartilhado com a tela /encontros: a tela que diz ao Mestre "este encontro
 * é justo" tem que responder pelos mesmos números que calibram o livro. Este
 * arquivo ficou só com o que é dele — as dez builds, os confrontos e o
 * relatório.
 *
 * O que ele NÃO é: um motor de regras completo. As simplificações estão em
 * SIMPLIFICACOES (importado do motor) e toda leitura do resultado tem que
 * passar por elas.
 */
import { getTreeById } from "../src/data/trees/index";
import { getPaSpent } from "../src/store/selectors";
import { AttributeKey, CharacterData, RankName, RANKS, RANK_BONUS } from "../src/lib/types";
import {
  Alvo,
  EstadoPersonagem,
  FichaCombate,
  SIMPLIFICACOES,
  d20,
  makeRng,
  aplicarDano,
  novoAlvo,
  danoEsperado,
  escolherAcao,
  montarFicha,
  novoEstado,
  testeDoFioDaVida,
  tickChamas,
  turnoPersonagem,
} from "../src/lib/combatSim";
import { MOLDES_CRIATURA, rodadasDoChefe } from "../src/data/bestiary";

const rng = makeRng(20260903);
const PA_ALVO = 12;

// ---------------------------------------------------------------------------
// Fichas
// ---------------------------------------------------------------------------
const ATTRS_ZERO: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

function ficha(
  nome: string,
  attrs: Partial<Record<AttributeKey, number>>,
  patch: Partial<CharacterData>
): CharacterData {
  return {
    id: nome,
    name: nome,
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { ...ATTRS_ZERO, ...attrs },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: patch.unlockedRanks?.[0]?.treeId ?? null,
    unlockedRanks: [],
    purchasedAbilities: [],
    purchasedCombinedSpells: [],
    gold: 0,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
    weaponGroupChoices: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
    currentCalor: null,
    overrides: {},
    ...patch,
  };
}

// ---------------------------------------------------------------------------
// As dez builds — 12 PA cada
// ---------------------------------------------------------------------------
/**
 * Monta a ficha e COMPRA até bater exatamente o orçamento.
 *
 * A primeira versão deste script chutava "3 compras por patamar" e produzia
 * fichas de 24 a 30 PA — porque atributo custa PA (escada progressiva do Cap. 1,
 * §2) e eu tinha dado 7 pontos de atributo a cada uma, o que sozinho já comia
 * 9 PA. Comparar fichas de orçamentos diferentes não mede balanceamento nenhum;
 * mede quem gastou mais.
 */
function build(
  nome: string,
  descricao: string,
  attrs: Partial<Record<AttributeKey, number>>,
  treeId: string,
  ateRank: RankName,
  /**
   * Quanto PA esta ficha pode gastar — 0.1.49.
   *
   * Era fixo em 12, e isso amarrava o playtest a um único nível de poder. A
   * tabela de chefes precisa montar um grupo do PATAMAR DE CADA CHEFE pra medir
   * calibragem em vez de diferença de nível, e pra isso o orçamento tem que
   * subir junto com o rank.
   */
  paAlvo: number = PA_ALVO
): { c: CharacterData; descricao: string } {
  const tree = getTreeById(treeId)!;
  const limite = RANKS.indexOf(ateRank);
  const base = ficha(nome, attrs, { startingTreeId: treeId });

  // Todas as compras possíveis até o rank alvo, na ordem em que o livro as lista.
  const candidatas: CharacterData["purchasedAbilities"] = [];
  for (const rank of RANKS.slice(0, limite + 1)) {
    const rd = tree.ranks.find((r) => r.rank === rank);
    if (!rd) continue;
    for (const a of rd.abilities) candidatas.push({ treeId, rank, kind: "ability", id: a.id });
    for (const t of rd.talents) candidatas.push({ treeId, rank, kind: "talent", id: t.id });
  }

  const unlockedRanks = RANKS.slice(0, limite + 1)
    .filter((rank) => tree.ranks.some((r) => r.rank === rank))
    .map((rank) => ({ treeId, rank }));

  // Compra em PROFUNDIDADE: o mínimo de conhecimentos por patamar pra destravar
  // o próximo, e só depois de chegar no topo é que o troco vira magia extra.
  //
  // A primeira versão comprava em ORDEM DE ARQUIVO e gastava os 12 PA inteiros
  // nas seis magias de 1º patamar — a "Elina Avançado" era, na verdade, uma
  // Principiante larga, e ela apareceu no relatório com 8 de dano por batalha.
  // Comparar isso com um Deus da Espada Avançado não mede balanceamento nenhum.
  const c: CharacterData = { ...base, unlockedRanks, purchasedAbilities: [] };
  /*
   * O TALENTO DE PV, comprado PRIMEIRO — 0.1.48.
   *
   * Toda árvore de Corpo tem um talento de 1 PA que dá "+4 PV por patamar seu
   * nesta árvore" — Braço de Ferro (Espada), Casco de Tartaruga (Suishin),
   * Ombro de Pedra (Escudos). Nenhum jogador de verdade deixa isso na mesa: é o
   * conhecimento mais barato do livro e o único que cresce sozinho a cada
   * patamar novo.
   *
   * O algoritmo deixava. Ele compra três conhecimentos por patamar em ORDEM DE
   * ARQUIVO, e as habilidades vêm antes dos talentos — então os talentos só
   * apareciam no troco, quando já não havia PA.
   *
   * O custo disso foi medido, e não é pequeno: dando ao Vex o Braço de Ferro em
   * troca da compra mais cara dele (uma troca de 2 PA por 1), o time inteiro
   * dele passou de **45,1% pra 54,9%** de vitória. Dez pontos, num talento de 1
   * PA. O relatório estava medindo a montagem da ficha e chamando aquilo de
   * balanceamento da árvore.
   *
   * A regra é declarada e estreita: compra o talento da PRÓPRIA árvore que
   * declara "+N PV por patamar", e só ele. Não é uma IA de build — é o mínimo
   * que separa uma ficha de uma lista de compras.
   *
   * Ele vem ANTES da compra mínima por patamar, e não depois: comprado no fim,
   * o orçamento já acabou e ele nunca entra. Comprado primeiro, o 1 PA fica
   * reservado — e o talento ainda CONTA como um dos três conhecimentos que
   * destravam o patamar seguinte, então não custa profundidade.
   */
  const talentoDePv = candidatas.find((x) => {
    if (x.kind !== "talent") return false;
    const rd = tree.ranks.find((r) => r.rank === x.rank);
    const def = rd?.talents?.find((t) => t.id === x.id);
    // PV, PM ou PT: toda árvore tem UM talento de 1 PA que escala sozinho a
    // cada patamar, e qual recurso ele dá é a identidade do pilar — Corpo dá
    // PV, Magia dá PM, as de Touki dão PT. Olhar só pra PV comprava defesa pros
    // guerreiros e nada pros magos, e o time de Corpo saltou 20 pontos de
    // vitória por causa disso. O jogador compra o da árvore DELE.
    return def ? /\+\d+\s*(PV|PM|PT) por patamar/i.test(def.description ?? "") : false;
  });
  if (talentoDePv && !c.purchasedAbilities.some((x) => x.id === talentoDePv.id)) {
    const tentativa = { ...c, purchasedAbilities: [...c.purchasedAbilities, talentoDePv] };
    if (getPaSpent(tentativa) <= paAlvo) c.purchasedAbilities = tentativa.purchasedAbilities;
  }


  const MINIMO_POR_PATAMAR = 3; // RANK_REQUIREMENTS: 3 conhecimentos destravam o rank seguinte
  for (const rank of RANKS.slice(0, limite + 1)) {
    const doRank = candidatas.filter((x) => x.rank === rank);
    for (const compra of doRank.slice(0, MINIMO_POR_PATAMAR)) {
      const tentativa = { ...c, purchasedAbilities: [...c.purchasedAbilities, compra] };
      if (getPaSpent(tentativa) > paAlvo) continue;
      c.purchasedAbilities = tentativa.purchasedAbilities;
    }
  }
  // Troco: qualquer conhecimento que ainda caiba, do patamar mais alto pro mais baixo.
  for (const compra of [...candidatas].reverse()) {
    if (c.purchasedAbilities.some((x) => x.id === compra.id)) continue;
    const tentativa = { ...c, purchasedAbilities: [...c.purchasedAbilities, compra] };
    if (getPaSpent(tentativa) > paAlvo) continue;
    c.purchasedAbilities = tentativa.purchasedAbilities;
  }
  return { c, descricao };
}

export const BUILDS = [
  // TIME A — profundidade
  build("Elina", "Água — molha e congela", { intelecto: 3, vigor: 1 }, "agua", "Avançado"),
  build("Borg", "Deus do Norte — improviso e aço", { forca: 3, vigor: 1 }, "deus-do-norte", "Avançado"),
  build("Kest", "Fogo — dano bruto, sem defesa", { intelecto: 4 }, "fogo", "Avançado"),
  build("Dorn", "Terra — o mago com mais PV", { intelecto: 2, vigor: 2 }, "terra", "Avançado"),
  build("Sera", "Cura — decide quem sobrevive", { espirito: 3, vigor: 1 }, "cura", "Avançado"),

  // TIME B — outras identidades
  build("Vex", "Deus da Espada — o maior dano do livro", { forca: 4 }, "deus-da-espada", "Avançado"),
  build("Iri", "Vento — desequilibra e cobra", { intelecto: 3, agilidade: 1 }, "vento", "Avançado"),
  build("Gorr", "Lutador — empilha Quebrantado", { forca: 3, vigor: 1 }, "armas-pesadas", "Avançado"),
  build("Lyn", "Arquearia — dano sustentado a 90m", { agilidade: 4 }, "arquearia", "Avançado"),
  build("Mara", "Escudos — protege, não mata", { vigor: 3, forca: 1 }, "cavalaria-e-escudos", "Avançado"),
];

/** Ficha derivada uma vez por build; cada batalha recria só o estado mutável. */
const FICHAS: FichaCombate[] = BUILDS.map(({ c, descricao }) => montarFicha(c, descricao));

// ---------------------------------------------------------------------------
// Confronto
// ---------------------------------------------------------------------------
function batalha(timeA: EstadoPersonagem[], timeB: EstadoPersonagem[], maxRodadas = 20): "A" | "B" | "empate" {
  const ordem = [
    ...timeA.map((e) => ({ e, time: "A" as const })),
    ...timeB.map((e) => ({ e, time: "B" as const })),
  ]
    .map((x) => ({ ...x, ini: d20(rng) + x.e.ficha.iniciativa }))
    .sort((p, q) => q.ini - p.ini);

  for (let r = 0; r < maxRodadas; r++) {
    for (const { e, time } of ordem) {
      // Quem está no chão ainda TEM turno — é nele que rola o Fio da Vida.
      // Só o morto de vez é pulado, e as chamas não queimam quem já está a 0.
      if (e.morto) continue;
      if (!e.inconsciente && !tickChamas(e, rng)) continue;
      turnoPersonagem(e, time === "A" ? timeB : timeA, rng, time === "A" ? timeA : timeB);
    }
    if (timeB.every((x) => !x.vivo)) return "A";
    if (timeA.every((x) => !x.vivo)) return "B";
  }
  return "empate";
}

// ---------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------
console.log("═".repeat(78));
console.log("  ORÇAMENTO: 12 PA por ficha — conferido pelo motor (getPaSpent)");
console.log("═".repeat(78));
console.log(
  "FICHA".padEnd(8) + "BUILD".padEnd(46) + "PA".padStart(4) + "PV".padStart(6) + "CA".padStart(4) + "BC".padStart(4)
);

BUILDS.forEach(({ c, descricao }, i) => {
  const pa = getPaSpent(c);
  const f = FICHAS[i];
  const alerta = pa === PA_ALVO ? "" : `  ⚠ ${pa} PA, não ${PA_ALVO}`;
  console.log(
    c.name.padEnd(8) +
      descricao.slice(0, 45).padEnd(46) +
      String(pa).padStart(4) +
      String(f.pvMax).padStart(6) +
      String(f.ca).padStart(4) +
      String(f.bc).padStart(4) +
      alerta
  );
});

/**
 * O alvo de referência da tabela de dano por turno.
 *
 * "Dano por turno" só existe CONTRA alguém: a chance de errar depende da CA do
 * outro. A CA 15 é a do molde de 3º patamar do Apêndice G — o meio da tabela —,
 * e está escrita aqui em vez de escondida na conta pra que ninguém leia a
 * coluna como um número absoluto.
 */
const BONECO_DE_REFERENCIA: Alvo = novoAlvo({ nome: "referência (CA 15)", pv: 1, ca: 15 });

console.log("\n" + "─".repeat(78));
console.log("  DANO MÉDIO POR TURNO (3 Ações, melhor ação, contra CA 15)");
console.log("─".repeat(78));
/*
 * A escolha vem de `escolherAcao`, e não de uma conta própria daqui.
 *
 * Esta tabela tinha a sua: dano médio dos dados por Ação, ignorando Dados de
 * Arma e bônus fixo. Enquanto a IA usava o mesmo critério, as duas concordavam
 * por acidente. Na 0.1.35 a IA passou a escolher por dano ESPERADO — com Dados
 * de Arma, bônus e chance de errar — e esta tabela passaria a anunciar uma ação
 * que a simulação não usa. Uma tabela que mente sobre a batalha logo abaixo é
 * pior que tabela nenhuma.
 */
for (const f of FICHAS) {
  const estado = novoEstado(f);
  const melhor = escolherAcao(estado, 3, BONECO_DE_REFERENCIA);
  const porTurno = danoEsperado(estado, melhor, BONECO_DE_REFERENCIA) * Math.floor(3 / melhor.acoes);
  console.log(
    f.nome.padEnd(8) +
      melhor.nome.padEnd(26) +
      `${melhor.acoes} Ação/ões`.padEnd(12) +
      `média ${Math.round(porTurno)}/turno`
  );
}

// ---------------------------------------------------------------------------
// 5 × 5 — mesmo orçamento, identidades diferentes
// ---------------------------------------------------------------------------
function novoTime(indices: number[]): EstadoPersonagem[] {
  return indices.map((i) => novoEstado(FICHAS[i]));
}

const TIME_A = [0, 1, 2, 3, 4]; // Elina, Borg, Kest, Dorn, Sera
const TIME_B = [5, 6, 7, 8, 9]; // Vex, Iri, Gorr, Lyn, Mara

const TENTATIVAS = 2000;
let vitoriasA = 0;
let vitoriasB = 0;
let empates = 0;
const danoTotal = new Map<string, number>();
const curaTotal = new Map<string, number>();
const sobrevivencia = new Map<string, number>();

for (let i = 0; i < TENTATIVAS; i++) {
  const a = novoTime(TIME_A);
  const b = novoTime(TIME_B);
  const r = batalha(a, b);
  if (r === "A") vitoriasA++;
  else if (r === "B") vitoriasB++;
  else empates++;
  for (const e of [...a, ...b]) {
    danoTotal.set(e.nome, (danoTotal.get(e.nome) ?? 0) + e.danoCausado);
    curaTotal.set(e.nome, (curaTotal.get(e.nome) ?? 0) + e.pvCurado);
    if (e.vivo) sobrevivencia.set(e.nome, (sobrevivencia.get(e.nome) ?? 0) + 1);
  }
}

console.log("\n" + "═".repeat(78));
console.log(`  5 × 5 — ${TENTATIVAS} batalhas`);
console.log("═".repeat(78));
console.log(`Time A (Elina, Borg, Kest, Dorn, Sera)....... ${((vitoriasA / TENTATIVAS) * 100).toFixed(1)}%`);
console.log(`Time B (Vex, Iri, Gorr, Lyn, Mara).......... ${((vitoriasB / TENTATIVAS) * 100).toFixed(1)}%`);
console.log(`Empates (20 rodadas sem decisão)............ ${((empates / TENTATIVAS) * 100).toFixed(1)}%`);

console.log("\n" + "─".repeat(78));
console.log("  CONTRIBUIÇÃO INDIVIDUAL (média por batalha)");
console.log("─".repeat(78));
/*
 * A coluna de CURA, e por que a ordenação mudou — 0.1.37.
 *
 * Enquanto a tabela tinha uma coluna só, ela ordenava por dano e chamava isso
 * de "contribuição". Para nove das dez builds era quase verdade; para a Sera
 * era uma difamação com cara de medida — a escola inteira dela é a coisa que a
 * coluna não media.
 *
 * Agora são duas colunas e a ordem é por CONTRIBUIÇÃO TOTAL (dano + PV
 * devolvidos). Somar os dois não diz que 1 de cura vale 1 de dano — diz que os
 * dois são maneiras de gastar um turno, que é o que a tabela compara. Quem
 * quiser a régua antiga tem a coluna de dano ali do lado, intacta.
 */
const linhas = [...danoTotal.entries()]
  .map(([nome, total]) => ({
    nome,
    dano: total / TENTATIVAS,
    cura: (curaTotal.get(nome) ?? 0) / TENTATIVAS,
    viveu: ((sobrevivencia.get(nome) ?? 0) / TENTATIVAS) * 100,
  }))
  .sort((x, y) => y.dano + y.cura - (x.dano + x.cura));
console.log(
  "FICHA".padEnd(8) + "DANO/BATALHA".padStart(14) + "PV DEVOLVIDOS".padStart(15) + "SOBREVIVEU".padStart(13)
);
for (const l of linhas) {
  console.log(
    l.nome.padEnd(8) +
      l.dano.toFixed(0).padStart(14) +
      // Um traço, e não um zero, em quem não tem magia de suporte nenhuma: zero
      // sugere que tentou e não conseguiu.
      (l.cura > 0 ? l.cura.toFixed(0) : "—").padStart(15) +
      (l.viveu.toFixed(0) + "%").padStart(13)
  );
}

// ---------------------------------------------------------------------------
// Os cinco vencedores contra um chefe (Apêndice G)
// ---------------------------------------------------------------------------
/** Apêndice G, "Ajustando pra cima": chefe único = dobra o PV da linha, mantém o dano. */
const CHEFES = MOLDES_CRIATURA.filter((m) => m.patamar >= 3 && m.patamar <= 5).map((m) => ({
  patamar: m.patamar,
  nome: `${m.patamar}º — ${m.titulo} (chefe)`,
  pv: m.pv * 2,
  ca: m.ca,
  ataque: m.bonusAtaque,
  danoPorTurno: m.danoPorTurno,
  // O Bônus de Rank equivalente ao patamar da criatura, pro CD do Fio da Vida:
  // o livro casa a escada de patamares da criatura com a de Ranks do
  // personagem, e RANK_BONUS é essa escada.
  bonusDeRank: RANK_BONUS[RANKS[Math.min(RANKS.length - 1, m.patamar - 1)]],
}));

/*
 * O GRUPO DE REFERÊNCIA da tabela de chefes — 0.1.38.
 *
 * Até aqui esta tabela lutava contra "o time que venceu o 5×5", o que é uma
 * escolha estranha por si (a régua de chefe do livro passava a depender do
 * resultado de um confronto entre jogadores) e virou um problema de verdade
 * quando a cura entrou no motor: o vencedor é sempre o Time B, e o Time B é
 * justamente o time SEM curandeiro.
 *
 * A tabela publicava, portanto, o comportamento de um grupo que não pode
 * levantar ninguém do chão — e um Mestre lia aquilo como "o que acontece com um
 * grupo". Aqui o grupo é uma mesa plausível, escrita à mão e nomeada: linha de
 * frente, dano corpo a corpo, dano à distância, mago e CURANDEIRO.
 */
/*
 * ...e na 0.1.49 ele passou a SUBIR DE PATAMAR junto com o chefe.
 *
 * A tabela punha um único grupo de 12 PA (Avançado, 3º) contra chefes de 3º, 4º
 * e 5º: um abaixo do nível dele, um no nível, um dois acima. O que ela media não
 * era "o chefe está calibrado?", era "quão longe do nível do grupo está este
 * chefe?" — e foi por isso que nenhum ajuste global resolvia as três linhas ao
 * mesmo tempo: os três patamares pediam correções em direções opostas.
 *
 * Agora cada linha monta o grupo do patamar DELA, e a pergunta vira a certa: um
 * chefe do seu próprio patamar deve dizimar o grupo em 25% das vezes?
 *
 * O orçamento por patamar é calibragem declarada, não regra do livro — o livro
 * não diz quanto PA um personagem de 4º patamar tem, porque quem dá PA é o
 * Mestre. Os 12 do 3º são os que o playtest sempre usou; 18 e 24 mantêm a mesma
 * proporção de "os desbloqueios mais uns oito de conhecimento".
 */
const GRUPO_POR_PATAMAR: Record<number, { rank: RankName; pa: number }> = {
  3: { rank: "Avançado", pa: 12 },
  4: { rank: "Santo", pa: 18 },
  5: { rank: "Rei", pa: 24 },
};

/** A mesa plausível: linha de frente, corpo a corpo, distância, mago e CURANDEIRO. */
const MOLDE_DO_GRUPO: {
  nome: string;
  descricao: string;
  attrs: Partial<Record<AttributeKey, number>>;
  arvore: string;
}[] = [
  { nome: "Mara", descricao: "Escudos", attrs: { vigor: 3, forca: 1 }, arvore: "cavalaria-e-escudos" },
  { nome: "Vex", descricao: "Deus da Espada", attrs: { forca: 4 }, arvore: "deus-da-espada" },
  { nome: "Lyn", descricao: "Arquearia", attrs: { agilidade: 4 }, arvore: "arquearia" },
  { nome: "Kest", descricao: "Fogo", attrs: { intelecto: 4 }, arvore: "fogo" },
  { nome: "Sera", descricao: "Cura", attrs: { espirito: 3, vigor: 1 }, arvore: "cura" },
];

export function grupoDoPatamar(patamar: number, paOverride?: number): FichaCombate[] {
  const { rank } = GRUPO_POR_PATAMAR[patamar] ?? GRUPO_POR_PATAMAR[3];
  const pa = paOverride ?? (GRUPO_POR_PATAMAR[patamar] ?? GRUPO_POR_PATAMAR[3]).pa;
  return MOLDE_DO_GRUPO.map((m) => {
    const { c, descricao } = build(m.nome, m.descricao, m.attrs, m.arvore, rank, pa);
    return montarFicha(c, descricao);
  });
}

console.log("\n" + "═".repeat(78));
console.log("  GRUPO DO PATAMAR DO CHEFE x CHEFE — " + TENTATIVAS + " batalhas por patamar");
console.log("  (Mara, Vex, Lyn, Kest, Sera — montados no rank e no orcamento de cada linha)");
console.log("═".repeat(78));
/*
 * A coluna DIZIMADO — 0.1.38.
 *
 * "Vitória" e "mortes médias" não respondem a pergunta que decide se um chefe
 * presta: **com que frequência ele acaba com o grupo inteiro?** 2,8 mortes
 * médias tanto pode ser "quase sempre morrem três" quanto "metade das vezes não
 * morre ninguém e na outra metade morrem todos" — e as duas mesas são
 * completamente diferentes.
 *
 * O alvo de design é **no mínimo 25% de dizimação** por chefe. Um chefe que
 * nunca dizima é um saco de PV com nome próprio.
 */
console.log(
  "CHEFE".padEnd(24) +
    "GRUPO".padStart(8) +
    "PV".padStart(6) +
    "VITÓRIA".padStart(10) +
    "DIZIMADO".padStart(10) +
    "RODADAS".padStart(9) +
    "MORTES".padStart(8)
);

for (const chefe of CHEFES) {
  const fichasDoGrupo = grupoDoPatamar(chefe.patamar);
  let vitorias = 0;
  let dizimados = 0;
  let somaRodadas = 0;
  let somaMortes = 0;
  for (let i = 0; i < TENTATIVAS; i++) {
    const grupo = fichasDoGrupo.map(novoEstado);
    let pvChefe = chefe.pv;
    let rodada = 0;
    for (; rodada < 20; rodada++) {
      for (const e of grupo) {
        // Quem está no chão ainda tem turno: é nele que rola o Fio da Vida.
        if (e.morto) continue;
        if (e.inconsciente) {
          testeDoFioDaVida(e, rng);
          continue;
        }
        if (!e.vivo) continue;
        // Um Alvo NOVO por personagem, de propósito: é o comportamento que este
        // relatório sempre teve, e mexer nele mudaria os números publicados no
        // livro dentro de uma refatoração. O efeito colateral é que Molhado e
        // Em Chamas não persistem de um personagem pro seguinte — ou seja, o
        // combo do mago de Água nunca é contado contra o chefe, e a coluna
        // subestima quem depende dele. Vale corrigir em uma mudança própria,
        // que possa ser lida como recalibragem e não como limpeza.
        const alvoChefe: Alvo = {
          ...novoAlvo({ nome: chefe.nome, pv: 0, ca: chefe.ca }),
          // O PV do chefe é acessor, e não valor: ele vive fora deste objeto
          // (`pvChefe`) porque o mesmo chefe atravessa os turnos de todos os
          // personagens do grupo. O espalhamento acima entrega os campos
          // neutros; estas duas linhas SUBSTITUEM o `pv` que ele trouxe.
          get pv() {
            return pvChefe;
          },
          set pv(v) {
            pvChefe = v;
          },
        };
        turnoPersonagem(e, [alvoChefe], rng, grupo);
      }
      if (pvChefe <= 0) break;
      // Chefe age: uma rodada inteira a cada dois personagens do grupo
      // (Apêndice G, "Ajustando pra cima").
      let restante = chefe.danoPorTurno * rodadasDoChefe(grupo.length);
      for (const alvo of grupo) {
        if (restante <= 0) break;
        if (!alvo.vivo) continue;
        if (d20(rng) + chefe.ataque < alvo.ca) continue;
        // Casca incluída no teto, senão o orçamento do chefe transborda pro
        // próximo alvo enquanto a deste ainda está de pé (0.1.37).
        const golpe = Math.min(restante, alvo.pv + alvo.pvTemp);
        // "Quem te derrubou decide o quanto é difícil voltar": o chefe de 5º
        // patamar deixa numa CD bem pior que o de 3º.
        // O `rng` é o que permite o teste de Concentração de quem está
        // conjurando (Cap. 2, §6): sem ele o chefe nunca derruba um cântico.
        aplicarDano(alvo, golpe, chefe.bonusDeRank, rng);
        restante -= golpe;
      }
      if (grupo.every((e) => !e.vivo)) break;
    }
    if (pvChefe <= 0) vitorias++;
    // Dizimado é o grupo INTEIRO no chão, e não "o chefe sobreviveu": uma
    // batalha que estoura as 20 rodadas com dois de pé não dizimou ninguém.
    if (grupo.every((e) => !e.vivo)) dizimados++;
    somaRodadas += rodada + 1;
    somaMortes += grupo.filter((e) => !e.vivo).length;
  }
  console.log(
    chefe.nome.padEnd(24) +
      `${GRUPO_POR_PATAMAR[chefe.patamar].pa}PA`.padStart(8) +
      String(chefe.pv).padStart(6) +
      ((vitorias / TENTATIVAS) * 100).toFixed(0).padStart(9) + "%" +
      ((dizimados / TENTATIVAS) * 100).toFixed(0).padStart(9) + "%" +
      (somaRodadas / TENTATIVAS).toFixed(1).padStart(9) +
      (somaMortes / TENTATIVAS).toFixed(1).padStart(9)
  );
}

console.log("\n" + "─".repeat(78));
console.log("  SIMPLIFICAÇÕES — leia antes de concluir qualquer coisa");
console.log("─".repeat(78));
for (const s of SIMPLIFICACOES) console.log("· " + s);

export {};
