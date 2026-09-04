/**
 * Auditoria das dezenove árvores contra a régua do Apêndice C.
 *
 * ## Por que existe
 *
 * O `PROGRESS.md` carrega, desde sempre, uma dívida enorme: "auditoria linha a
 * linha das magias — faltam por inteiro Suishin, Norte, Lutador, Escudos,
 * Arquearia, Ladino, Tático, Vendaval e Punho de Fogo". Nove das dezenove
 * árvores, quase metade do sistema, com números que ninguém conferiu. A forma
 * proposta era ler as ~400 magias à mão — trabalho de semanas, que envelhece no
 * dia seguinte ao primeiro nerf.
 *
 * O `check:livro` já verifica um LADO disso: que a régua nunca prometa MENOS
 * que o maior golpe único do patamar. Mas o outro lado é o perigoso. Uma coluna
 * pode prometer 40 e a árvore entregar 12, e nada no projeto percebe: a régua
 * fica alta, a mesa monta a build achando que ela bate no que está escrito, e
 * descobre na sessão.
 *
 * ## O que ele mede
 *
 * O TETO REAL DO TURNO, e não o maior golpe: quanto a árvore causa gastando as
 * três Ações do turno da melhor forma que o patamar permite. É isso que a coluna
 * do Apêndice C significa — "dano por turno" —, e é uma conta diferente de
 * "maior dano".
 *
 * Regras da conta, todas herdadas do texto do livro:
 *
 * - Você mantém o que comprou: no patamar Santo, as magias de Principiante,
 *   Intermediário e Avançado continuam na ficha. O orçamento considera todas.
 * - Uma habilidade de 1 Ação pode ser usada três vezes no turno; uma de 2, uma
 *   vez com uma Ação sobrando; uma de 4+ ocupa mais de um turno e se amortiza
 *   (Cap. 2, §3: o cântico pode ser dividido entre turnos).
 * - Reação não entra: ela acontece FORA do turno, e somá-la infla o número.
 * - O Bônus de Rank entra onde a fórmula diz "+ BC", porque a coluna do
 *   Apêndice C é medida com um personagem daquele patamar, não com um boneco de
 *   atributo zero.
 *
 * ## O que ele NÃO mede, e por que ainda assim vale
 *
 * Área, alcance, condições aplicadas, cura, controle, dano ao longo de rodadas,
 * e o Touki do alvo. Uma árvore de Utilidade legitimamente causa dano baixo, e
 * Escudos causa quase nenhum — é o papel delas. Por isso `regua: false` existe
 * em `danoPorTurno.ts`, e por isso este script **avisa** em vez de reprovar
 * quase tudo: ele não decide se a árvore está certa, ele diz onde olhar.
 *
 * ## O Corpo deixou de ser piso (2026-09-04)
 *
 * Até aqui as duas metades do relatório não eram comparáveis. Numa árvore de
 * MAGIA o dano está inteiro na fórmula da magia, e a medição era fiel. Numa
 * árvore do CORPO, não: o golpe base é o **Dado de Arma**, que escala por
 * degraus das Maestrias (`weaponDie.ts`), e as técnicas somam a ele em vez de
 * substituí-lo — "Dado de arma rolado três vezes" lido por um parser de `NdM`
 * vale ZERO. O número do Corpo saía marcado como PISO e nunca como falha,
 * porque o desvio podia ser inteiramente o que faltava medir.
 *
 * Faltavam duas coisas, e as duas agora existem:
 *
 * - `weaponFormula.ts` lê as fórmulas em português do catálogo do Corpo, com a
 *   distinção que o livro faz entre "arma normal" (dado + atributo + Bônus de
 *   Rank) e "rolado N vezes" (só os dados). Tem teste próprio.
 * - `ARMA_DE_REFERENCIA`, abaixo, declara qual arma o auditor assume por
 *   árvore — a premissa que estava faltando, agora escrita e discutível.
 *
 * E faltava o óbvio: o **ataque comum**. Nenhuma árvore declara "Atacar com
 * Arma (1 Ação)" como habilidade, porque é regra do Cap. 4 e não técnica de
 * árvore — então o medidor lia o guerreiro como alguém que só sabe usar
 * técnica. Era ele, e não as técnicas, que explicava as seis linhas do Corpo:
 * três ataques comuns já passam de todas elas.
 *
 * Faltava também a **quarta Ação** de quatro árvores (`ACAO_EXTRA_A_PARTIR_DE`).
 * O próprio Apêndice C avisa que conta com ela na coluna da Espada; medir com
 * três era comparar contra uma régua calibrada com quatro.
 *
 * ## O que "teto" significa, e por que ficar ABAIXO dele é normal
 *
 * O teto ignora chance de acerto, Touki do alvo e posicionamento. O Apêndice C
 * não: ele diz "valores médios, alvo de CA razoável". Logo uma coluna abaixo do
 * teto é o esperado — é o que a CA come. O teste é de um lado só de propósito:
 * se a régua promete MAIS que o teto, ela promete mais do que o personagem
 * consegue nem acertando tudo, e aí não há CA que explique.
 *
 * O que ele entrega é a lista curta. Auditar nove árvores lendo 400 magias é
 * trabalho de semanas; auditar as células que este relatório acusa é trabalho de
 * uma tarde.
 *
 *   npm run check:arvores
 */
import { TREES } from "../src/data/trees/index";
import { RANKS, RANK_BONUS, type AbilityDef, type RankName } from "../src/lib/types";
import { diceAverage } from "../src/lib/dice";
import { escalateWeaponDie } from "../src/lib/weaponDie";
import { averageOfWeaponFormula, type WeaponContext } from "../src/lib/weaponFormula";
import {
  COLUNAS_CORPO,
  COLUNAS_MAGIA,
  DANO_POR_TURNO_CORPO,
  DANO_POR_TURNO_MAGIA,
  valorNumerico,
} from "../src/data/danoPorTurno";

/**
 * As nove que o PROGRESS.md lista como nunca auditadas linha a linha.
 *
 * Os ids aqui eram os NOMES das árvores ("suishin", "norte", "lutador",
 * "escudos", "ladino", "tatico", "punho_fogo") e não os `id` de
 * `src/data/trees` — então o marcador "[nunca auditada]" só acendia em duas das
 * nove, e justamente as sete que mais precisavam do aviso saíam sem ele. Um
 * `Set` de strings não reclama de chave inexistente; a checagem logo abaixo
 * passou a reclamar.
 */
const NUNCA_AUDITADAS = new Set([
  "deus-da-agua-corpo",
  "deus-do-norte",
  "armas-pesadas",
  "cavalaria-e-escudos",
  "arquearia",
  "furtividade-e-armadilhas",
  "navegacao-e-lideranca",
  "vendaval",
  "punho-de-fogo",
]);

const idsDesconhecidos = [...NUNCA_AUDITADAS].filter((id) => !TREES.some((t) => t.id === id));
if (idsDesconhecidos.length) {
  console.error(`❌ NUNCA_AUDITADAS cita árvore que não existe: ${idsDesconhecidos.join(", ")}`);
  process.exit(1);
}

/**
 * A arma que o auditor assume que o personagem daquela árvore carrega.
 *
 * É a decisão que faltava pra medir o Corpo, e ela tem que ser declarada em
 * algum lugar: "Dado de arma rolado três vezes" não vale nada sem saber qual
 * dado. Não vive nos dados da árvore de propósito — é premissa de MEDIÇÃO, não
 * regra do livro, e enfiá-la em `Tree` faria o catálogo carregar um campo que
 * só o auditor lê.
 *
 * O critério é sempre o mesmo: **o maior Dado Base que a proficiência daquela
 * árvore permite** (Cap. 3, "O Dado de Arma"). Escolher generoso é o lado
 * seguro AQUI porque o teste só dispara quando a régua promete MAIS do que a
 * árvore entrega — uma arma grande torna o teste mais difícil de acender, então
 * o que sobrevive a ele é desvio de verdade, e não escolha de arma do auditor.
 */
const ARMA_DE_REFERENCIA: Record<string, { die: string; nome: string; porque: string }> = {
  "deus-da-espada": {
    die: "d10",
    nome: "Espadão / Montante",
    porque: "'toda espada (curta, longa, espadão, rapieira, katana)' — o espadão é a maior delas",
  },
  "deus-do-norte": {
    die: "d10",
    nome: "Martelo de Guerra",
    porque: "proficiência UNIVERSAL em armas: nenhuma arma do Cap. 3 passa de d10",
  },
  "deus-da-agua-corpo": {
    die: "d10",
    nome: "Espadão / Montante",
    porque: "'toda espada' inclui o espadão; o escudo leve que a árvore concede é opcional",
  },
  arquearia: {
    die: "d10",
    nome: "Besta",
    porque: "'arco curto, arco longo, besta e funda' — a besta é o maior dado dos quatro",
  },
  "armas-pesadas": {
    die: "d10",
    nome: "Martelo de Guerra",
    porque: "'toda arma pesada, de duas mãos e improvisada' — o topo delas é d10",
  },
  "cavalaria-e-escudos": {
    die: "d8",
    nome: "Espada Longa",
    porque: "'toda arma de UMA MÃO' — d10 no Cap. 3 é sempre arma de duas mãos ou haste",
  },
  vendaval: {
    die: "d10",
    nome: "Alabarda / Lança",
    porque: "'toda espada e toda arma de haste' — a haste chega a d10",
  },
  "punho-de-fogo": {
    die: "d6",
    nome: "Ataque desarmado",
    porque: "a árvore não concede arma nenhuma: o punho é o Dado Base, e é o único",
  },
  // As tres de Utilidade entraram em 0.1.12, quando ganharam coluna propria no
  // Apendice C. Elas nao tem Escada de Dados (Cap. 3: "arvores de Utilidade nao
  // recebem degraus no Dado de Arma"), entao o dado delas nunca cresce — e e
  // exatamente por isso que elas ficam pra tras em dano sem precisar de nenhuma
  // regra que as puna. A soma de `weaponDieSteps` delas ja e zero nos dados, e o
  // codigo abaixo nao precisa de caso especial.
  "furtividade-e-armadilhas": {
    die: "d6",
    nome: "Espada Curta",
    porque: "'adaga, punhal, espada curta, funda e besta leve' — a espada curta é o maior dado de mão dela",
  },
  "navegacao-e-lideranca": {
    die: "d10",
    nome: "Alabarda / Lança",
    porque: "'armas simples, arco curto e lança' — a lança é d10 no Cap. 3",
  },
  "bardo-e-interacao": {
    die: "d6",
    nome: "Rapieira",
    porque: "'adaga, espada curta e rapieira' — as três param no d6",
  },
};

/**
 * O golpe que cada árvore de Utilidade acrescenta ao turno, uma vez por turno,
 * e que escala com o patamar em vez de virar uma habilidade nova por rank.
 *
 * As três vivem na MAESTRIA de 1º patamar, não num campo `damage` — e era por
 * isso que a medição dava zero nas três. O Dano Furtivo do Ladino existe assim
 * desde sempre; a Dissonância do Bardo e a Ordem de Tiro do Tático entraram em
 * 0.1.12 no mesmo molde, porque uma coluna própria no Apêndice C exige ter o
 * que medir.
 *
 * `dado` é o dado POR PATAMAR: no 3º patamar o Ladino soma 3d6.
 */
const GOLPE_POR_PATAMAR: Record<string, { dado: string; nome: string }> = {
  "furtividade-e-armadilhas": { dado: "d6", nome: "Dano Furtivo" },
  "bardo-e-interacao": { dado: "d4", nome: "Dissonância" },
  "navegacao-e-lideranca": { dado: "d6", nome: "Ordem de Tiro" },
};

/** A média do golpe de patamar daquela árvore, ou 0 se ela não tiver um. */
function golpeDePatamar(treeId: string, rankIndex: number): { media: number; nome: string } | null {
  const regra = GOLPE_POR_PATAMAR[treeId];
  if (!regra) return null;
  return { media: diceAverage(`${rankIndex + 1}${regra.dado}`), nome: regra.nome };
}

/**
 * As árvores que ganham uma QUARTA Ação, e a partir de qual patamar.
 *
 * O Apêndice C avisa que isto existe e que ele já conta com isso: *"A Espada
 * conta 4 Ações do Avançado em diante. A Maestria 'Velocidade Encarnada' dá uma
 * Ação extra a quem não se move no turno, e os números dela já assumem isso.
 * Ela é a única coluna com uma 4ª Ação antes do Imperador."* Medir a Espada com
 * 3 Ações, então, é medir contra uma régua calibrada com 4 — e o desvio
 * apareceria como se a árvore devesse dano.
 *
 * Nas quatro, a Ação extra é RESTRITA a atacar (a do Norte é livre, a das
 * outras três é "só para atacar", "só para atacar ou agarrar", "só para um
 * único disparo, nunca técnica nomeada"). A interseção das quatro restrições é
 * exatamente o ATAQUE COMUM, e é isso que o medidor soma: uma técnica nomeada
 * a mais seria dano que três das quatro não podem fazer.
 */
const ACAO_EXTRA_A_PARTIR_DE: Record<string, { rank: RankName; porque: string }> = {
  "deus-da-espada": { rank: "Avançado", porque: "«Velocidade Encarnada»: 1 Ação extra a quem não se move" },
  "deus-do-norte": { rank: "Imperador", porque: "«Nada é Regra»: 1 Ação adicional, sem restrição" },
  "armas-pesadas": { rank: "Imperador", porque: "«Nada Fica de Pé»: 1 Ação adicional só pra atacar ou agarrar" },
  arquearia: { rank: "Imperador", porque: "«O Tiro Que Já Aconteceu»: 1 Ação adicional pra um disparo simples" },
};

/** A árvore já tem a quarta Ação neste patamar? */
function temAcaoExtra(treeId: string, rankIndex: number): boolean {
  const regra = ACAO_EXTRA_A_PARTIR_DE[treeId];
  return !!regra && rankIndex >= RANKS.indexOf(regra.rank);
}

/**
 * O Dado de Arma daquela árvore naquele patamar, já escalado pelas Maestrias
 * acumuladas até ali — mais o degrau abaixo, que várias técnicas usam.
 */
function contextoDeArma(treeId: string, ateRankIndex: number): WeaponContext | null {
  const arma = ARMA_DE_REFERENCIA[treeId];
  const tree = TREES.find((t) => t.id === treeId);
  if (!arma || !tree) return null;

  const degraus = tree.ranks
    .filter((r) => RANKS.indexOf(r.rank) <= ateRankIndex)
    .reduce((soma, r) => soma + (r.weaponDieSteps ?? 0), 0);

  return {
    dieAverage: diceAverage(escalateWeaponDie(arma.die, degraus)),
    dieAverageOneStepBelow: diceAverage(escalateWeaponDie(arma.die, Math.max(0, degraus - 1))),
    attribute: ATRIBUTO_POR_PATAMAR[Math.min(ateRankIndex, ATRIBUTO_POR_PATAMAR.length - 1)],
    rankBonus: RANK_BONUS[RANKS[ateRankIndex]],
  };
}

/** Acima disto a coluna promete mais do que a árvore entrega — vale olhar. */
const DESVIO_AVISO = 0.35;
/** Acima disto a promessa está tão longe do teto que é quase certamente erro. */
const DESVIO_ERRO = 0.6;

const ACOES_POR_TURNO = 3;

/**
 * O atributo principal em cada patamar, como o próprio Apêndice C declara:
 * "atributo principal progredindo de 4 até 8" (`Appendices.tsx`).
 *
 * Isto não é um chute meu — é a premissa escrita da tabela, e ignorá-la foi o
 * primeiro erro deste script. Sem ela, TODA coluna alta aparecia ~50% acima do
 * teto calculado, um desvio sistemático que denunciava a conta, não a régua:
 * uma magia "3d8 + BC" no 5º patamar rende 13,5 + 5 pela conta errada e
 * 13,5 + 13 pela certa. Desvio uniforme em tudo é sinal de medidor quebrado.
 */
const ATRIBUTO_POR_PATAMAR = [4, 5, 6, 7, 8, 8];

/**
 * A média de dano de uma habilidade, com o Bônus de Conjuração somado onde a
 * fórmula pede.
 *
 * As fórmulas são texto livre ("2d8 + BC", "Vigor + 1d8 em PV", "3d6 por alvo"),
 * e não existe parser confiável pra elas — o próprio `PROGRESS.md` registra essa
 * decisão. O que dá pra extrair com segurança são os NdM; o "+ BC" é somado
 * quando a palavra aparece, porque ela é escrita sempre do mesmo jeito no livro.
 *
 * O BC usa o patamar do PERSONAGEM, não o rank da magia: um Rei conjurando uma
 * magia de Principiante soma o BC de Rei (Cap. 1, §7).
 */
function mediaDeDano(formula: string, patamarDoPersonagem: number): number {
  let total = 0;
  for (const m of formula.matchAll(/(\d+)d(\d+)/g)) total += diceAverage(`${m[1]}d${m[2]}`);
  if (total === 0) return 0;
  if (/\bBC\b|Bônus de Rank/i.test(formula)) {
    const atributo = ATRIBUTO_POR_PATAMAR[Math.min(patamarDoPersonagem, ATRIBUTO_POR_PATAMAR.length - 1)];
    total += atributo + RANK_BONUS[RANKS[patamarDoPersonagem]];
  }
  return total;
}

interface Golpe {
  nome: string;
  media: number;
  acoes: number;
}

/** Todo golpe disponível a quem chegou neste patamar — os de baixo continuam valendo. */
function golpesAcumulados(treeId: string, ateRankIndex: number): Golpe[] {
  const tree = TREES.find((t) => t.id === treeId);
  if (!tree) return [];
  const arma = contextoDeArma(treeId, ateRankIndex);
  const golpes: Golpe[] = [];

  // O ataque comum, que toda árvore do Corpo tem de graça e nenhuma declara
  // como habilidade: "Atacar com Arma (1 Ação)" (Cap. 4, §3). Sem ele o teto do
  // Corpo era medido como se o guerreiro só soubesse usar técnica — e é
  // exatamente por ele que Arco aparecia entregando 33 no 5º patamar.
  if (arma) {
    golpes.push({
      nome: "Ataque comum",
      media: arma.dieAverage + arma.attribute + arma.rankBonus,
      acoes: 1,
    });
  }

  for (let i = 0; i <= ateRankIndex; i++) {
    const rd = tree.ranks.find((r) => r.rank === RANKS[i]);
    if (!rd) continue;
    for (const a of rd.abilities as AbilityDef[]) {
      const formula = a.damage?.normal;
      if (!formula) continue;
      // Reação acontece fora do turno: contá-la no orçamento de 3 Ações mede um
      // turno que não existe.
      if (a.reaction) continue;
      // 0 Ações não é "de graça no turno": é montada fora dele (Armadilha de
      // Caça pede 10 minutos). Repeti-la três vezes por turno foi o que fez o
      // relatório anunciar "Armadilha de Caça ×3" como o melhor turno do Arco.
      if (a.actions.normal === 0) continue;

      const media = arma
        ? averageOfWeaponFormula(formula, arma).average
        : mediaDeDano(formula, ateRankIndex);
      if (media <= 0) continue;
      golpes.push({ nome: a.name, media, acoes: a.actions.normal });
    }
  }
  return golpes;
}

/**
 * O melhor uso das 3 Ações do turno.
 *
 * Mochila pequena e com repetição: a mesma magia pode ser conjurada duas vezes
 * num turno se couber.
 *
 * ## `amortizar`, e as cinco falsas falhas que ele causou
 *
 * Um golpe de 4+ Ações ocupa mais de um turno. Dividir o dano dele pelos turnos
 * gastos parece a única leitura honesta — e é a errada pra metade da tabela.
 * O Apêndice C avisa, com todas as letras, que as duas metades dele não são
 * medidas do mesmo jeito:
 *
 *   "Magia não está amortizada pelas Ações. Uma magia de Imperador custa 6
 *   Ações — dois turnos inteiros. O Sol Menor aparece como ~130, mas entrega
 *   ~65 por turno."
 *
 * Ou seja: a coluna de MAGIA é o dano CHEIO da maior magia, e o leitor é quem
 * divide. Amortizar antes de comparar media uma coisa contra outra, e o
 * resultado era previsível — as cinco únicas células acusadas na Magia eram as
 * cinco escolas cuja maior magia custa 4, 5 ou 6 Ações:
 *
 *   Fogo 4º  ~62 × Mar de Chamas  56 (4 Ações)  →  amortizado dava 28
 *   Água 5º  ~54 × Relâmpago      57 (4 Ações)  →  amortizado dava 28
 *   Fogo 5º  ~90 × Flashover      79 (5 Ações)  →  amortizado dava 39
 *   Vento 5º ~70 × Grito do Mundo 68 (5 Ações)  →  amortizado dava 34
 *   Terra 6º ~105 × Rio de Magma 101 (5 Ações)  →  amortizado dava 50
 *
 * Cinco colunas caindo dentro de 3% a 12% do dano cheio, e nenhuma dentro de
 * 40% do amortizado, não é coincidência: é a régua declarando como foi
 * calibrada. A régua estava certa, as árvores estavam certas, e o medidor
 * estava lendo a metade errada da tabela.
 *
 * No CORPO a amortização continua valendo: ali a coluna é dano por turno de
 * verdade (o próprio Apêndice diz que a Espada "conta 4 Ações do Avançado em
 * diante", que só faz sentido dentro de um turno), e nenhuma técnica marcial do
 * livro passa de 3 Ações.
 */
function tetoPorTurno(
  golpes: Golpe[],
  amortizar: boolean,
  ataqueExtra = 0,
  rotuloDoExtra?: string
): { total: number; plano: string } {
  if (golpes.length === 0) return { total: 0, plano: "—" };

  // Caminho 1: encher o turno com golpes que cabem nele.
  const cabem = golpes.filter((g) => g.acoes <= ACOES_POR_TURNO);
  const melhorPorAcoes = new Map<number, Golpe>();
  for (const g of cabem) {
    const atual = melhorPorAcoes.get(g.acoes);
    if (!atual || g.media > atual.media) melhorPorAcoes.set(g.acoes, g);
  }
  // dp[a] = melhor dano usando exatamente até `a` Ações.
  const dp: { dano: number; usados: Golpe[] }[] = Array.from({ length: ACOES_POR_TURNO + 1 }, () => ({
    dano: 0,
    usados: [],
  }));
  for (let a = 1; a <= ACOES_POR_TURNO; a++) {
    dp[a] = { ...dp[a - 1], usados: [...dp[a - 1].usados] };
    for (const [custo, g] of melhorPorAcoes) {
      if (custo > a) continue;
      const candidato = dp[a - custo].dano + g.media;
      if (candidato > dp[a].dano) dp[a] = { dano: candidato, usados: [...dp[a - custo].usados, g] };
    }
  }

  // Caminho 2: um golpe grande, que ocupa mais que um turno.
  let grande = { valor: 0, golpe: null as Golpe | null, turnos: 1 };
  for (const g of golpes) {
    const turnos = Math.max(1, Math.ceil(g.acoes / ACOES_POR_TURNO));
    const valor = amortizar ? g.media / turnos : g.media;
    if (valor > grande.valor) grande = { valor, golpe: g, turnos };
  }

  if (grande.valor > dp[ACOES_POR_TURNO].dano && grande.golpe) {
    const g = grande.golpe;
    const nota = amortizar
      ? `${g.acoes} Ações, amortizado`
      : `${g.acoes} Ações, dano cheio — ~${(g.media / grande.turnos).toFixed(0)}/turno`;
    const extraNoGrande = ataqueExtra > 0 ? ` + ${rotuloDoExtra ?? "Ataque comum (4ª Ação)"}` : "";
    return { total: grande.valor + ataqueExtra, plano: `${g.nome} (${nota})${extraNoGrande}` };
  }
  const contagem = new Map<string, number>();
  for (const g of dp[ACOES_POR_TURNO].usados) contagem.set(g.nome, (contagem.get(g.nome) ?? 0) + 1);
  const plano = [...contagem].map(([n, q]) => (q > 1 ? `${n} ×${q}` : n)).join(" + ") || "—";
  const extra = ataqueExtra > 0 ? ` + ${rotuloDoExtra ?? "Ataque comum (4ª Ação)"}` : "";
  return { total: dp[ACOES_POR_TURNO].dano + ataqueExtra, plano: plano + extra };
}

// ---------------------------------------------------------------------------
// O relatório
// ---------------------------------------------------------------------------
let erros = 0;
let avisos = 0;
const linhasDoRelatorio: string[] = [];
/** Corpo entra separado: ali o número é piso, não medição. */
const listaCorpo: string[] = [];

const colunas = [...COLUNAS_MAGIA, ...COLUNAS_CORPO].filter((c) => c.regua !== false);

for (const tabela of [DANO_POR_TURNO_MAGIA, DANO_POR_TURNO_CORPO]) {
  tabela.forEach((linha, rankIndex) => {
    for (const coluna of colunas) {
      const celula = linha.porArvore[coluna.treeId];
      if (!celula) continue;
      // Célula com qualificador ("~22 + área", "0 a ∞") descreve outra coisa de
      // propósito — comparar seria inventar uma regra que o texto não tem.
      if (/[a-zA-Zà-úÀ-Ú∞]/.test(celula.replace(/^~?\d+\s*/, ""))) continue;
      const prometido = valorNumerico(celula);
      if (prometido === null || prometido <= 0) continue;

      const arvore = TREES.find((t) => t.id === coluna.treeId);
      const ehCorpo = arvore?.category === "corpo";

      const arma = contextoDeArma(coluna.treeId, rankIndex);
      const ataqueExtra =
        arma && temAcaoExtra(coluna.treeId, rankIndex)
          ? arma.dieAverage + arma.attribute + arma.rankBonus
          : 0;
      const golpeDeMaestria = golpeDePatamar(coluna.treeId, rankIndex);
      // A Utilidade tambem gasta as 3 Acoes atacando quando escolhe atacar: o
      // orcamento do turno e o mesmo pra todo mundo, e comparar uma coluna que
      // inclui o ataque comum com outra que nao inclui foi o defeito que esta
      // versao passou o dia corrigindo.
      const { total, plano } = tetoPorTurno(
        golpesAcumulados(coluna.treeId, rankIndex),
        ehCorpo || arvore?.category === "utilidade",
        ataqueExtra + (golpeDeMaestria?.media ?? 0),
        golpeDeMaestria?.nome
      );
      if (total <= 0) continue;

      const desvio = (prometido - total) / prometido;
      if (desvio < DESVIO_AVISO) continue;

      const marca = NUNCA_AUDITADAS.has(coluna.treeId) ? " [nunca auditada]" : "";
      const msg =
        `${coluna.label} no ${linha.patamar}: a régua promete ${celula}, o teto do turno dá ` +
        `${total.toFixed(0)} (${(desvio * 100).toFixed(0)}% abaixo) — melhor turno: ${plano}${marca}`;

      // O Corpo deixou de ser piso: com o Dado de Arma modelado, a linha dele é
      // medição igual à da Magia e responde pelas mesmas regras. O que continua
      // separando as duas listas é só a leitura — a do Corpo mostra a arma de
      // referência, porque ela é a premissa que pode ser discutida.
      if (ehCorpo) {
        if (desvio >= DESVIO_ERRO) {
          erros++;
          listaCorpo.push(`[FALHA]  ${msg}`);
        } else {
          avisos++;
          listaCorpo.push(`[AVISO]  ${msg}`);
        }
      } else if (desvio >= DESVIO_ERRO) {
        erros++;
        linhasDoRelatorio.push(`[FALHA]  ${msg}`);
      } else {
        avisos++;
        linhasDoRelatorio.push(`[AVISO]  ${msg}`);
      }
    }
  });
}

console.log("========================================");
console.log("AUDITORIA DAS ÁRVORES — teto do turno × régua do Apêndice C");
console.log("========================================");
if (linhasDoRelatorio.length === 0) {
  console.log("MAGIA — nenhuma coluna promete mais do que a árvore entrega.");
} else {
  console.log("MAGIA (medição fiel: o dano está na fórmula da magia)");
  for (const l of linhasDoRelatorio) console.log(l);
}
console.log("");
if (listaCorpo.length === 0) {
  console.log("CORPO — nenhuma coluna promete mais do que a árvore entrega.");
} else {
  console.log("CORPO (medição: Dado de Arma escalado por Maestria, com a arma de referência abaixo)");
  for (const l of listaCorpo) console.log(l);
}
console.log("");
console.log("Arma de referência de cada árvore do Corpo (o maior Dado Base que a proficiência permite):");
for (const [id, arma] of Object.entries(ARMA_DE_REFERENCIA)) {
  const tree = TREES.find((t) => t.id === id);
  const degraus = tree?.ranks.reduce((s, r) => s + (r.weaponDieSteps ?? 0), 0) ?? 0;
  const noTopo = escalateWeaponDie(arma.die, degraus);
  console.log(
    `  · ${(tree?.name ?? id).padEnd(24)} ${arma.nome} (${arma.die} → ${noTopo} no 6º) — ${arma.porque}`
  );
}
console.log("");
console.log("O teto ignora chance de acerto e Touki do alvo; a régua não ('alvo de CA razoável').");
console.log("Coluna ABAIXO do teto é o esperado. Só o contrário é defeito — e é só isso que sai acima.");
console.log("");
console.log(`Colunas conferidas..................... ${colunas.length}`);
console.log(`Árvores sem auditoria manual........... ${NUNCA_AUDITADAS.size} de ${TREES.length}`);
console.log(`Avisos (${(DESVIO_AVISO * 100).toFixed(0)}%+ abaixo)................. ${avisos}`);
console.log(`Falhas (${(DESVIO_ERRO * 100).toFixed(0)}%+ abaixo)................. ${erros}`);
console.log("========================================");

if (erros > 0) {
  console.error(
    `\n❌ ${erros} coluna(s) prometem mais que o dobro do que a árvore entrega no turno.\n` +
      `   Ou a régua está alta, ou a árvore perdeu dano num rework e ninguém corrigiu a promessa.`
  );
  process.exit(1);
}
console.log("\n✅ Nenhuma promessa da régua está gritantemente acima do que a árvore entrega.");
