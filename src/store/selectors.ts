import {
  ARVORE_QUE_ESCALA_IMPROVISADO,
  GRUPO_BASE,
  GRUPOS_COMPRAVEIS,
  grupoDaArma,
  PA_POR_GRUPO,
  WEAPON_GROUP_IDS,
  WeaponGroupId,
} from "@/data/weaponGroups";
import { getRaceById } from "@/data/races";
import { getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import { getTreeById } from "@/data/trees";
import { getCombinedSpellById } from "@/data/combinedSpells";
import { conheceSimboloTeorico, origemNaturalDoSimbolo } from "@/lib/simbolosTeoricos";
import { diceAverage } from "@/lib/dice";
import { escalateWeaponDie } from "@/lib/weaponDie";
import { Condicao, getCondicaoPorId, TETO_DE_ACUMULOS } from "@/data/condicoes";
import { getSkillByName } from "@/data/skills";
import {
  ATTRIBUTE_CREATION_POINTS,
  attributePaCostTotal,
  PROFICIENCIES_PER_PA,
  saveAdvantagePaCostTotal,
  SKILLS_PER_PA,
  AttributeKey,
  attributeKeysFromLabel,
  ATTRIBUTES,
  CharacterData,
  getVigorFactor,
  ReserveGrant,
  GuildRank,
  PV_BASE,
  RANK_BONUS,
  RANK_REQUIREMENTS,
  RANKS,
  RankName,
  Tree,
} from "@/lib/types";

export type { GuildRank };

/** Cap. 3: atributo-chave de cada árvore de Utilidade, usado no cálculo de PP. */
const UTILITY_KEY_ATTRIBUTE: Record<string, AttributeKey> = {
  "furtividade-e-armadilhas": "agilidade",
  "bardo-e-interacao": "espirito",
  "navegacao-e-lideranca": "intelecto",
};

type StoreState = CharacterData;

type Check = { ok: boolean; reason?: string };
const OK: Check = { ok: true };

/** Soma os bônus fixos de raça, antecedente e sub-tabela (Miko/Olho) para um atributo. */
/**
 * O atributo-chave de uma árvore PARA ESTE personagem.
 *
 * Quando o rótulo oferece escolha ("Força ou Agilidade" no Norte e no Vendaval,
 * "Força ou Intelecto" no Punho do Fogo), devolve aquele em que o personagem é
 * melhor — que é o que o livro promete e o que o código não fazia. Rótulo de um
 * atributo só devolve ele mesmo.
 */
export function getTreeAttributeKey(
  state: StoreState,
  treeId: string | null | undefined,
  padrao: AttributeKey
): AttributeKey {
  const chaves = attributeKeysFromLabel(getTreeById(treeId ?? "")?.keyAttributeLabel);
  if (chaves.length === 0) return padrao;
  return chaves.reduce((melhor, k) =>
    getFinalAttribute(state, k) > getFinalAttribute(state, melhor) ? k : melhor
  );
}

export function getFinalAttribute(state: StoreState, key: AttributeKey): number {
  const race = getRaceById(state.raceId);
  const background = getBackgroundById(state.backgroundId);
  const subtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, state.subtableEntryId)
    : undefined;

  const base = state.attributeBase[key] ?? 0;
  const raceBonus = race?.bonuses.attributes?.[key] ?? 0;
  const backgroundBonus = background?.bonuses.attributes?.[key] ?? 0;
  const subtableBonus = subtable?.bonuses.attributes?.[key] ?? 0;
  // Bônus livre de raça (Humano). Limitado ao que a raça concede, pra uma ficha
  // importada ou uma troca de raça não carregarem escolhas que não existem mais.
  const escolhaLivre = (state.raceAttributeChoices ?? [])
    .slice(0, race?.attributeChoices ?? 0)
    .filter((k) => k === key).length;

  return base + raceBonus + backgroundBonus + subtableBonus + escolhaLivre;
}

/**
 * Perícias que entram na ficha SOZINHAS por causa das árvores (Cap. 1, §4 —
 * "Perícias de Árvore"). Duas fontes, e só duas:
 *
 * 1. A **Árvore Inicial** ensina as `grantedSkills.fixed` dela, mais as que o
 *    jogador escolheu do `choose`. Nenhuma outra árvore ensina perícia — abrir
 *    a segunda árvore te dá técnicas, não hábitos: você já era alguém quando
 *    chegou nela.
 * 2. A **exceção do Ladino** (`masterySkillsWhenNotFirst`): a Maestria de 1º
 *    patamar de Furtividade e Armadilhas ensina Furtividade e Percepção a quem
 *    chegou DEPOIS. Se ela já for a Árvore Inicial, essas duas já vieram pelo
 *    caminho 1, e a Maestria entrega outra coisa no lugar (ver a descrição dela).
 * 3. A **habilidade comprada** que declara `grantsSkills` (2026-09-04). Duas
 *    técnicas do Deus do Norte já prometiam isso na prosa desde sempre —
 *    "Concede a perícia Medicina", "Você ganha as perícias Sobrevivência e
 *    Percepção" — e não tinham onde gravar: a fonte 1 é da ÁRVORE, e só da
 *    Inicial. O jogador comprava a técnica e a perícia não aparecia em tela
 *    nenhuma. Quem achou as duas foi o `check:texto`, lendo a prosa contra os
 *    campos.
 */
export function getTreeGrantedSkills(state: StoreState): string[] {
  const skills: string[] = [];

  const inicial = getTreeById(state.startingTreeId);
  if (inicial?.grantedSkills) {
    skills.push(...inicial.grantedSkills.fixed);
    const permitidas = inicial.grantedSkills.choose;
    if (permitidas) {
      skills.push(
        ...(state.treeSkillChoices ?? [])
          .slice(0, permitidas.count)
          .filter((s) => permitidas.from.includes(s))
      );
    }
  }

  for (const treeId of new Set(state.unlockedRanks.map((u) => u.treeId))) {
    if (treeId === state.startingTreeId) continue;
    const tree = getTreeById(treeId);
    if (tree?.masterySkillsWhenNotFirst) skills.push(...tree.masterySkillsWhenNotFirst);
  }

  for (const compra of state.purchasedAbilities ?? []) {
    if (compra.kind !== "ability") continue;
    const def = findAbilityOrTalentDef(compra.treeId, compra.rank, "ability", compra.id);
    const concedidas = (def as { grantsSkills?: string[] } | undefined)?.grantsSkills;
    if (concedidas) skills.push(...concedidas);
  }

  return Array.from(new Set(skills));
}

/** Quantas escolhas do `choose` da Árvore Inicial ainda faltam (0 se ela não tem nenhuma). */
export function getPendingTreeSkillChoices(state: StoreState): number {
  const choose = getTreeById(state.startingTreeId)?.grantedSkills?.choose;
  if (!choose) return 0;
  const validas = (state.treeSkillChoices ?? []).filter((s) => choose.from.includes(s));
  return Math.max(0, choose.count - validas.length);
}

/**
 * Todos os GRUPOS DE ARMA em que o personagem é proficiente (Cap. 1, §4).
 *
 * Duas fontes desde 0.1.62, e só duas — a regra virou uma linha: **você empunha
 * o que estudou, ou o que pagou.**
 *
 * 1. **O piso.** `GRUPO_BASE` (Desarmado e Improvisado), que todo personagem
 *    tem. Quebrar uma cadeira é instinto — mas ver `IMPROVISADO_NAO_ESCALA`:
 *    de graça não quer dizer bom.
 * 2. **As árvores abertas.** Cada árvore declara `gruposDeArma`. Vale pra TODA
 *    árvore aberta, não só a Inicial — diferente de `grantedSkills`, e de
 *    propósito: perícia é hábito (você já era alguém quando chegou na segunda
 *    árvore), mas empunhar arma é treino, e treino de arma é o que uma árvore
 *    do Corpo ensina, em qualquer ordem que você a abra.
 * 3. **Os comprados**, a `PA_POR_GRUPO` cada.
 *
 * O que SUMIU nesta versão: a escolha livre de criação e o grupo extra que cada
 * árvore do Corpo dava. Os dois eram gratuitos, e somados à regra geral de "1
 * PA compra três proficiências" faziam um personagem colecionar famílias
 * inteiras de arma sem pagar por nenhuma.
 */
export function getWeaponGroups(state: StoreState): WeaponGroupId[] {
  const grupos = new Set<WeaponGroupId>([GRUPO_BASE]);

  for (const treeId of new Set(state.unlockedRanks.map((u) => u.treeId))) {
    for (const g of getTreeById(treeId)?.proficiencies?.gruposDeArma ?? []) grupos.add(g);
  }

  for (const g of state.weaponGroupChoices ?? []) {
    if (GRUPOS_COMPRAVEIS.includes(g)) grupos.add(g);
  }

  return WEAPON_GROUP_IDS.filter((g) => grupos.has(g));
}

/**
 * O PA gasto em grupos de arma comprados.
 *
 * Um grupo que a ÁRVORE já dá não é cobrado, mesmo que esteja na lista de
 * comprados: quem comprou Espadas e depois abriu o Deus da Espada não deve
 * continuar pagando por uma coisa que passou a vir de graça. O PA volta pra
 * mão dele, como qualquer refund de escolha que o livro faz.
 */
export function getWeaponGroupPaCost(state: StoreState): number {
  const daArvore = new Set<WeaponGroupId>();
  for (const treeId of new Set(state.unlockedRanks.map((u) => u.treeId))) {
    for (const g of getTreeById(treeId)?.proficiencies?.gruposDeArma ?? []) daArvore.add(g);
  }
  const pagos = (state.weaponGroupChoices ?? []).filter(
    (g) => GRUPOS_COMPRAVEIS.includes(g) && !daArvore.has(g)
  );
  return new Set(pagos).size * PA_POR_GRUPO;
}

/**
 * O personagem é proficiente com esta arma? (Cap. 1, §4)
 *
 * Arma que o catálogo não conhece devolve `true`: loot de campanha e arma
 * escrita à mão no inventário são do Mestre, e um sistema que dá Desvantagem
 * calada porque não reconheceu um nome é pior que um que não dá nada. Ver a
 * nota em `GRUPO_POR_ARMA`.
 */
export function isProficientWithWeapon(state: StoreState, weaponName: string): boolean {
  const grupo = grupoDaArma(weaponName);
  if (!grupo) return true;
  return getWeaponGroups(state).includes(grupo);
}

/** Cap. 1, §4: arma sem proficiência ataca com Desvantagem. O dano nunca muda. */
export function temDesvantagemPorArma(state: StoreState, weaponName: string): boolean {
  return !isProficientWithWeapon(state, weaponName);
}

/** Quantos pontos do bônus livre da raça ainda faltam distribuir (0 se a raça não tem nenhum). */
export function getPendingRaceAttributeChoices(state: StoreState): number {
  const total = getRaceById(state.raceId)?.attributeChoices ?? 0;
  return Math.max(0, total - (state.raceAttributeChoices ?? []).length);
}

export function getFinalAttributes(state: StoreState): Record<AttributeKey, number> {
  return Object.fromEntries(
    ATTRIBUTES.map(({ key }) => [key, getFinalAttribute(state, key)])
  ) as Record<AttributeKey, number>;
}

function getFlatBonusSum(state: StoreState, field: "maxHp" | "maxMp" | "armorClass"): number {
  const race = getRaceById(state.raceId);
  const background = getBackgroundById(state.backgroundId);
  const subtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, state.subtableEntryId)
    : undefined;

  return (
    (race?.bonuses[field] ?? 0) +
    (background?.bonuses[field] ?? 0) +
    (subtable?.bonuses[field] ?? 0)
  );
}

const RANKS_DESCENDING = [...RANKS].reverse();

/** Rank mais alto já desbloqueado numa árvore (undefined se nenhum). */
export function getHighestUnlockedRank(state: StoreState, treeId: string): RankName | undefined {
  const unlocked = new Set(
    state.unlockedRanks.filter((r) => r.treeId === treeId).map((r) => r.rank)
  );
  return RANKS_DESCENDING.find((r) => unlocked.has(r));
}

/** Maior Bônus de Rank (Cap. 1, seção 7) entre os ranks desbloqueados de árvores que passem no filtro — 0 se nenhuma. */
function getHighestRankBonus(state: StoreState, categoryFilter?: Tree["category"]): number {
  return state.unlockedRanks.reduce((max, u) => {
    const tree = getTreeById(u.treeId);
    if (!tree) return max;
    if (categoryFilter && tree.category !== categoryFilter) return max;
    return Math.max(max, RANK_BONUS[u.rank]);
  }, 0);
}

/**
 * Reserva concedida pelos talentos de árvore comprados (Cap. 1, "O Padrão das
 * Reservas"). Até 2026-08-29 nenhum desses 24 talentos mexia num número da
 * ficha: eram texto, e o jogador digitava o resultado à mão nos campos avulsos
 * de PV/PM — o que também significava que a metade PT deles não tinha campo
 * nenhum pra ser digitada.
 *
 * Todo talento de reserva é UMA compra de 1 PA (`canPurchaseAbility` recusa a
 * segunda com "Já adquirido.") que cresce sozinha a cada patamar novo naquela
 * árvore: nas escolas de magia, +2 PM e +2 PV por patamar; no Corpo, +4 PV
 * por patamar ou +1 PT por patamar. É o que os dados fazem e o que o Cap. 1
 * deve dizer — não "comprável várias vezes".
 *
 * `hpPerRank`/`mpPerRank`/`ptPerRank` escalam com quantos patamares você abriu
 * NAQUELA árvore (é o que "por patamar seu nesta árvore" quer dizer); `pt` é
 * valor fixo, e hoje só o Ombro de Pedra (Escudos) o usa: +4 PV por patamar E
 * +1 PT fixo, a única exceção ao "ou" do Corpo.
 */
function getTalentReserve(state: StoreState, field: keyof ReserveGrant): number {
  return state.purchasedAbilities.reduce((sum, a) => {
    if (a.kind !== "talent") return sum;
    const def = getTreeById(a.treeId)
      ?.ranks.find((r) => r.rank === a.rank)
      ?.talents.find((t) => t.id === a.id);
    const value = def?.grants?.[field];
    if (!value) return sum;
    // `pt` é o legado de valor fixo; `ptPerRank` escala como PV e PM.
    if (field === "pt") return sum + value;
    return sum + value * state.unlockedRanks.filter((u) => u.treeId === a.treeId).length;
  }, 0);
}

/**
 * O "corpo treinado" da fórmula do Cap. 4, antes do Vigor entrar:
 * PV_BASE (14) + 1,67 × a soma das médias dos Dados de PV de todos os patamares
 * desbloqueados. Exportado porque a ficha mostra essa parcela separada do fator.
 *
 * O que saiu em 2026-08-29 foi o CASO ESPECIAL que existia aqui: o dado do 1º
 * patamar da Árvore Inicial contava pelo valor máximo em vez da média, e isso
 * fazia os PV Máximos dependerem de `startingTreeId`.
 */
export function getTrainedBody(state: StoreState): number {
  const dados = state.unlockedRanks.reduce((total, unlocked) => {
    const rankDef = getTreeById(unlocked.treeId)?.ranks.find((r) => r.rank === unlocked.rank);
    return total + (rankDef ? diceAverage(rankDef.hpDiceFormula) : 0);
  }, 0);
  return PV_BASE + dados * 1.67;
}

/**
 * PV Máximos (Cap. 4, "Cálculos Vitais") — UMA fórmula, sem piso e sem caso especial:
 *
 *   PV Máximos = (14 + 1,67 × soma dos Dados de PV dos seus patamares) × Fator de Vigor
 *
 * 2026-08-30: o multiplicador dos dados caiu de 2 pra 1,5 e logo pra 1,67 (a
 * pedido do usuário, "se tirar o 2x no começo do jogo o pessoal sofre eu acho,
 * q tal 1.5? → 1.67"). É o meio-termo entre o ×2 original (Escudeiro com
 * Vigor 4 chegava a 90 PV com 5 PA, exatamente o "quebrado" que ele mostrou)
 * e o ×1,5 (Escudeiro 73 PV no mesmo caso, queda de 19% sobre o original). O
 * ×1,67 mantém a proporcionalidade entre classes (árvore com dado maior
 * continua dando mais PV) e tira o "andar pra cima e dobrar" que inflava a
 * reserva inteira. Tabela de calibração com Vigor 0, acumulado até o
 * patamar (conferida em 2026-09-13, depois do nerf de PV dos magos descrito
 * em `TreeRankDef.hpDiceFormula` — os cinco números estavam com deriva de 1 a
 * 2 PV desde a 0.1.x): Escudeiro 27/44/64 PV (P→A); Lutador 29/44/62; Espada
 * 27/42/59; Magia de Água 19/25/34; Terra 22/32/44.
 *
 * Bônus fixos (raça, antecedente, sub-tabela) e PV comprados com PA entram
 * DEPOIS do fator, de propósito: são placas de metal parafusadas no corpo, não
 * constituição — se multiplicassem, um item viraria mais forte só por o dono
 * ter Vigor alto.
 */
export function getMaxHp(state: StoreState): number {
  const fator = getVigorFactor(getFinalAttribute(state, "vigor"));
  const natural = Math.floor(getTrainedBody(state) * fator);
  // Talentos, bônus fixos e PV comprados com PA ficam FORA do Fator de Vigor: se
  // entrassem, a mesma compra de 1 PA valeria 2,6× mais numa ficha de Vigor 8 —
  // exatamente a "armadilha" que o Cap. 1 desenha contra ao padronizar reservas.
  const computed =
    natural + getTalentReserve(state, "hpPerRank") + getFlatBonusSum(state, "maxHp") + state.bonusHp;
  return state.overrides.maxHp ?? computed;
}

/**
 * PV de referência de uma árvore, pra tabela que o livro imprime (Cap. 4,
 * "Cálculos Vitais") — revisão do livro.
 *
 * A tabela do Cap. 4 é escrita à mão (Escudeiro 27/44/64, Água 19/25/34...) e
 * já derivou 1 a 2 PV da ficha antes, a cada mudança de Dado de PV. Esta função
 * é a MESMA fórmula de `getTrainedBody` × `getVigorFactor` (com o arredondamento
 * de `diceAverage`), sem raça, talento nem compra, pra que o livro gere a
 * tabela em vez de copiá-la.
 *
 * `patamares` = quantos patamares daquela árvore, a partir do Principiante.
 */
export function getPvDeReferencia(treeId: string, patamares: number, vigor = 0): number {
  const ranks = (getTreeById(treeId)?.ranks ?? []).filter((r) => RANKS.indexOf(r.rank) < patamares);
  const dados = ranks.reduce((total, r) => total + diceAverage(r.hpDiceFormula), 0);
  return Math.floor((PV_BASE + dados * 1.67) * getVigorFactor(vigor));
}

/**
 * PM Máximos (Cap. 4) — fórmula com cap nos 2 primeiros ranks (2026-08-30).
 *
 * Pedido do usuário: "para o mago pode usar uma magia no max 4 vezes nos
 * niveis baixos". Em números: a assinatura do Principiante custa 1-2 PM; a
 * do Intermediário custa 3 PM. Quatro casts cabem em 4-12 PM, e o que a
 * fórmula precisa garantir é isso: a PORÇÃO DA RESERVA QUE VEM DE COMPRA
 * AVULSA (bônus PA, sub-tabela Miko/Olho que adiciona +6/+10 PM fixos) não
 * pode, sozinha, empurrar o mago iniciante acima desse teto. Acima do 2º
 * patamar a fórmula antiga entra inteira — é o que calibrou o teto do
 * Imperador.
 *
 * Implementação: o cap é "no máximo `máx(Espírito, 4) × MB + 8` PM sobre a base da
 * fórmula original" — ou seja, corta o `bonusMp` (PA avulso) e o `maxMp`
 * fixo de antecedente/sub-tabela, mas deixa passar o talento `mpPerRank`
 * (que é o investimento consciente da árvore, do Cap. 1 "Padrão das
 * Reservas") e o bônus racial ESCALAR (Elfo ×2, Migurd ×3, que cresce
 * com MB igual à base).
 *
 *   E=4, MB=1, sem nada: 12 PM (4 casts máx da assinatura 1-PM)
 *   E=4, MB=1, +2 talento (Nascente de Mana): 14 PM
 *   E=4, MB=1, +2 talento, +8 PA: 14 PM (cap corta os 8 PA)
 *   E=4, MB=1, Migurd (+3 racial), +2 talento: 17 PM (racial entra)
 *   E=4, MB=1, +2 talento, Acólito (+1×MB): 15 PM (o escalar entra, como o racial)
 *   E=4, MB=2 (Intermediário) sem nada: 16 PM (5 casts máx da 3-PM)
 *   E=4, MB=6 (Imperador): base 32 PM, sem cap
 */
export function getMaxMp(state: StoreState): number {
  const espirito = getFinalAttribute(state, "espirito");
  const maiorBonusMagia = getHighestRankBonus(state, "magia");
  const background = getBackgroundById(state.backgroundId);
  const subtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, state.subtableEntryId)
    : undefined;
  const atributoPiso = Math.max(espirito, 4);
  const baseSemCap = atributoPiso * maiorBonusMagia + 8;
  // PM ESCALAR — raça, antecedente e sub-tabela (2026-09-17).
  //
  // Era só a raça. Antecedente e sub-tabela davam PM FIXO (Acólito +4,
  // Estudioso +8, Olho Místico +6, Acúmulo +10) e o teto dos dois primeiros
  // patamares zerava os quatro: com Espírito 4 e MB 1 a reserva já bate no teto,
  // então a descrição prometia PM que o jogador nunca via. No Acúmulo era pior —
  // a maldição (Exaustão diária) valia da primeira sessão, e a bênção só
  // aparecia no Avançado. Convertidos para múltiplo do MB, os quatro passam pelo
  // teto como o bônus racial sempre passou, e valem ZERO pra quem não abriu
  // escola nenhuma, que é o certo para um bônus de mana.
  const escalarDeMana =
    ((getRaceById(state.raceId)?.bonuses.mpPerMagicRank ?? 0) +
      (background?.bonuses.mpPerMagicRank ?? 0) +
      (subtable?.bonuses?.mpPerMagicRank ?? 0)) *
    maiorBonusMagia;
  const talentoMp = getTalentReserve(state, "mpPerRank");
  const baseComRacialETalentos = baseSemCap + escalarDeMana + talentoMp;
  // Extras avulsos (PA, antecedentes, sub-tabela) são capados nos 2 primeiros
  // ranks. Desde 2026-09-26 o teto usa o Espírito (`máx(Espírito, 4) × MB + 8`,
  // + talento + escalar): antes era `4 × MB + 8`, e o Espírito acima de 4 não
  // rendia PM nenhum até o Avançado — o "reator" do Cap. 1 não existia nos
  // patamares mais jogados. Só PA avulso e PM fixo de antecedente são cortados.
  if (maiorBonusMagia <= 2) {
    const capTotal = baseComRacialETalentos;
    const extras = getFlatBonusSum(state, "maxMp") + state.bonusMp;
    return state.overrides.maxMp ?? Math.min(baseComRacialETalentos + extras, capTotal);
  }
  const computed =
    baseComRacialETalentos +
    getFlatBonusSum(state, "maxMp") +
    state.bonusMp;
  return state.overrides.maxMp ?? computed;
}

/**
 * Pontos de Touki (Cap. 3, "Pontos de Touki"): sem nenhum patamar do Corpo, 0.
 * Com qualquer patamar do Corpo: PT = máx(Vigor + Espírito, 0) + Crescimento, onde
 * Crescimento soma o `ptGained` de TODO patamar do Corpo desbloqueado (1, ou 2
 * em Cavalaria e Escudos).
 *
 * 2026-09-16: existiam duas reservas — o PT Menor (= Vigor) antes do Avançado e
 * o PT Pleno depois —, e as árvores cobravam PT no Principiante e no
 * Intermediário enquanto as próprias Maestrias diziam que a reserva só chegava
 * no Avançado. Com a criação dando 2 pontos de atributo, o PT Menor era 1 ou 2:
 * o Escudeiro Principiante usava a própria Assinatura uma ou duas vezes. A regra
 * virou uma só: todo guerreiro tem Touki desde o 1º patamar, só não percebe; o
 * Avançado dá o Manto, não a reserva.
 */
export function getPtPool(state: StoreState): number {
  const corpoRanks = state.unlockedRanks.filter((r) => getTreeById(r.treeId)?.category === "corpo");

  function computeNatural(): number {
    if (corpoRanks.length === 0) return 0;

    const vigor = getFinalAttribute(state, "vigor");
    const espirito = getFinalAttribute(state, "espirito");

    // Crescimento vem do campo `ptGained` de cada patamar, e não de um
    // `treeId === "cavalaria-e-escudos" ? 2 : 1` escrito à mão aqui.
    const crescimento = corpoRanks.reduce((sum, u) => {
      const rankDef = getTreeById(u.treeId)?.ranks.find((r) => r.rank === u.rank);
      return sum + (rankDef?.ptGained ?? 1);
    }, 0);

    // Piso no par de atributos, não no total: Vigor −2 e Espírito −1 davam
    // PT −2 no Principiante, uma reserva negativa. O PP já tinha "mínimo 1";
    // aqui o par nunca desce de 0 e os patamares somam por cima.
    return (
      Math.max(vigor + espirito, 0) +
      crescimento +
      getTalentReserve(state, "pt") +
      getTalentReserve(state, "ptPerRank")
    );
  }

  return state.overrides.maxPt ?? computeNatural();
}

/**
 * Pontos de Preparação (Cap. 3): sem nenhum patamar de Utilidade, 0. Senão,
 * Intelecto + o maior atributo-chave entre suas árvores de Utilidade
 * (mínimo 1), +1 por patamar de 3º ou superior em qualquer uma delas.
 */
export function getPpPool(state: StoreState): number {
  const utilRanks = state.unlockedRanks.filter((r) => getTreeById(r.treeId)?.category === "utilidade");

  function computeNatural(): number {
    if (utilRanks.length === 0) return 0;

    const intelecto = getFinalAttribute(state, "intelecto");
    let segundoTermo = 0;
    let patamarBonus = 0;
    for (const u of utilRanks) {
      const key = UTILITY_KEY_ATTRIBUTE[u.treeId];
      if (key) {
        // Quando o atributo-chave da árvore JÁ É Intelecto (Navegação e
        // Liderança), ele não conta duas vezes — no lugar, entra o Bônus de
        // Rank naquela árvore. Sem isso o Tático chegava ao teto investindo um
        // atributo só, onde os outros precisam de dois.
        //
        // Com mais de uma árvore de Utilidade (Ladino + Tático, por exemplo), o
        // segundo termo é o MAIOR entre os atributos-chave delas, e no Tático
        // quem disputa é o Bônus de Rank dele, não o Intelecto. Os +1 por
        // patamar de 3º ou superior somam em todas as árvores do pilar.
        segundoTermo = Math.max(
          segundoTermo,
          key === "intelecto" ? RANK_BONUS[u.rank] : getFinalAttribute(state, key)
        );
      }
      if (RANKS.indexOf(u.rank) >= RANKS.indexOf("Avançado")) patamarBonus += 1;
    }

    return Math.max(intelecto + segundoTermo, 1) + patamarBonus;
  }

  return state.overrides.maxPp ?? computeNatural();
}

/**
 * CA = 10 + Agilidade final + bônus fixo de raça/antecedente/sub-tabela
 * (ex: Miko "Maldição do Ódio") + itens de armadura equipados.
 */
/**
 * Deslocamento do personagem, em metros — Cap. 4, §1 e §3 (0.1.90).
 *
 * "9 metros, exceto onde a raça indicar outro valor", e as condições mexem
 * nele: Atolado corta pela metade, Congelado e Paralisado zeram. A ficha
 * mostrava CA, PV e PM e não mostrava este — e ele é o número que a mesa mais
 * pergunta depois da CA, porque toda rodada começa com alguém decidindo se
 * alcança.
 *
 * A penalidade de −3 m por vestir armadura sem proficiência (Cap. 1, §4) NÃO
 * entra aqui, e não por esquecimento: a ficha não guarda em quais categorias de
 * armadura o personagem é proficiente — isso vem da prosa de cada árvore. O dia
 * em que virar dado, esta é a função que muda.
 */
export function getDeslocamento(state: StoreState): number {
  const efeitos = getEfeitosDeCondicoes(state);
  const base = 9;
  if (efeitos.deslocamento === "zero") return 0;
  if (efeitos.deslocamento === "metade") return base / 2;
  return base;
}

export function getArmorClass(state: StoreState): number {
  const temEscudos = getWeaponGroups(state).includes("escudos");
  const equippedBonus = state.inventory.reduce((sum, item) => {
    if (!item.equipped || item.type !== "armadura") return sum;
    const bonus = item.acBonus ?? 0;
    // Cap. 1, §4 (0.1.52): escudo é o único item de defesa que se EMPUNHA, e por
    // isso é o único que cobra proficiência aqui. Sem ela o escudo não deixa de
    // funcionar — erguer uma tábua na frente do corpo ajuda um pouco mesmo sem
    // treino —, mas rende +1 em vez de +2. A mão continua ocupada de qualquer
    // jeito, que é o outro custo dele.
    //
    // Armadura vestida não passa por aqui de propósito: a penalidade dela é
    // Desvantagem em Furtividade/Acrobacia e −3m de Deslocamento, não CA menor.
    if (grupoDaArma(item.name) === "escudos" && !temEscudos) return sum + Math.min(bonus, 1);
    return sum + bonus;
  }, 0);
  // Quebrantado (Cap. 4, §2) é a ÚNICA condição do livro que mexe num número da
  // ficha: −1 de CA por acúmulo. Entra depois do override manual de propósito —
  // quem digitou uma CA à mão está declarando o corpo do personagem, e a
  // condição é algo que acontece com esse corpo depois.
  const quebrantado = getPenalidadeQuebrantado(state);
  const computed = 10 + getFinalAttribute(state, "agilidade") + getFlatBonusSum(state, "armorClass") + equippedBonus;
  return (state.overrides.armorClass ?? computed) - quebrantado;
}

/** Iniciativa = 1d20 + Agilidade; Escudeiro/Treino Precoce dá Vantagem. */
export function getInitiative(state: StoreState): { bonus: number; hasAdvantage: boolean } {
  const background = getBackgroundById(state.backgroundId);
  return {
    bonus: state.overrides.initiative ?? getFinalAttribute(state, "agilidade"),
    hasAdvantage: background?.grantsInitiativeAdvantage ?? false,
  };
}

export interface WeaponDamageInfo {
  treeId: string;
  treeName: string;
  rank: RankName;
  rankLabel: string;
  rankBonus: number;
  steps: number;
  baseDie: string;
  escalatedDie: string;
  attribute: AttributeKey;
  attributeValue: number;
  /** −1 por acúmulo de Quebrantado (Cap. 4, §2). Zero quando não há a condição. */
  penalidadeQuebrantado: number;
  averageDamage: number;
}

/**
 * Fórmula de dano marcial (Cap. 3): Dado de Arma (escalado) + Atributo + Bônus
 * do Rank do Estilo. "Um ataque comum usa os degraus do seu maior patamar
 * entre as árvores do Corpo" (Apêndice D, Ambiguidades Resolvidas) — por isso a escalada usa sempre a
 * árvore do Corpo onde o personagem tem o rank mais alto, não uma em particular.
 */
export function getWeaponDamage(
  state: StoreState,
  baseDie: string,
  attribute: AttributeKey = "forca",
  /**
   * O nome da arma, quando se sabe — 0.1.62.
   *
   * Serve a uma coisa só: descobrir se ela é IMPROVISADA. Arma improvisada não
   * sobe na Escada de Dados (Cap. 3, §1), e sem o nome não há como saber.
   * Opcional porque a maior parte dos chamadores passa só o dado.
   */
  weaponName?: string
): WeaponDamageInfo | null {
  const corpoRanks = state.unlockedRanks.filter((r) => getTreeById(r.treeId)?.category === "corpo");
  if (corpoRanks.length === 0 || !baseDie) return null;

  const bestRankIndex = corpoRanks.reduce((m, u) => Math.max(m, RANKS.indexOf(u.rank)), -1);
  const rank = RANKS[bestRankIndex];

  const ehImprovisada = weaponName ? grupoDaArma(weaponName) === GRUPO_BASE : false;
  const degrausAte = (treeId: string) =>
    (getTreeById(treeId)?.ranks ?? [])
      .filter((r) => RANKS.indexOf(r.rank) <= bestRankIndex)
      .reduce((sum, r) => sum + (r.weaponDieSteps ?? 0), 0);

  /*
   * EMPATE DE RANK: "você escolhe" — Cap. 3, §1 (revisão do livro).
   *
   * Degraus e Bônus vêm da árvore de maior Rank. Até aqui o empate caía na
   * árvore aberta primeiro, regra que o livro nunca escreveu. A ficha não tem
   * onde guardar a escolha, então escolhe o que um jogador escolheria: com arma
   * improvisada, o Deus do Norte se ele estiver no empate (é a única árvore que
   * a escala); senão, a árvore que dá mais degraus.
   */
  const empatadas = [...new Set(corpoRanks.filter((u) => RANKS.indexOf(u.rank) === bestRankIndex).map((u) => u.treeId))];
  const bestTreeId =
    ehImprovisada && empatadas.includes(ARVORE_QUE_ESCALA_IMPROVISADO)
      ? ARVORE_QUE_ESCALA_IMPROVISADO
      : empatadas.reduce((m, id) => (degrausAte(id) > degrausAte(m) ? id : m));

  const tree = getTreeById(bestTreeId);
  if (!tree) return null;

  const degrausDaArvore = degrausAte(bestTreeId);

  /*
   * ARMA IMPROVISADA TRAVA EM d6 — Cap. 3, §1 (0.1.62).
   *
   * Ela é o único grupo de arma que todo personagem tem de graça, e sem esta
   * trava ela viraria a MELHOR arma do rank alto: um Imperador pegaria um banco
   * de taverna e rolaria 3d10 sem ter estudado nada, de graça, contra o espadachim
   * que pagou por cada degrau.
   *
   * Um Imperador quebra a mesma cadeira que um Principiante quebra, e ela faz o
   * mesmo estrago. O que muda é o que ele faz DEPOIS.
   *
   * **O Deus do Norte é a única exceção, e é a identidade dele em número.** A
   * árvore diz em letra que não existe arma proibida pra ele — "se dá pra
   * empunhar, você é proficiente" —, e aqui isso deixa de ser prosa: só ele
   * escala improvisado como arma de verdade.
   *
   * E só quando os degraus VÊM dele: antes bastava ter o Norte em algum
   * lugar, e um Norte Principiante deixava a cadeira escalar com os 9 degraus
   * de um Deus da Espada Imperador.
   */
  const steps = ehImprovisada && bestTreeId !== ARVORE_QUE_ESCALA_IMPROVISADO ? 0 : degrausDaArvore;

  const escalatedDie = escalateWeaponDie(baseDie, steps);
  const rankBonus = RANK_BONUS[rank];
  const attributeValue = getFinalAttribute(state, attribute);
  // A outra metade de Quebrantado: −1 de dano por acúmulo, em TODOS os ataques.
  // Sai como campo próprio, e não somado dentro de `attributeValue`, pra que a
  // tela consiga dizer de onde veio o número menor.
  const penalidadeQuebrantado = getPenalidadeQuebrantado(state);

  return {
    treeId: tree.id,
    treeName: tree.name,
    rank,
    rankLabel: tree.rankLabels?.[rank] ?? rank,
    rankBonus,
    steps,
    baseDie,
    escalatedDie,
    attribute,
    attributeValue,
    penalidadeQuebrantado,
    averageDamage: diceAverage(escalatedDie) + attributeValue + rankBonus - penalidadeQuebrantado,
  };
}

/** PV/PM/PT/PP atuais: `null` (ainda não tocado) mostra igual ao máximo calculado; senão, o valor salvo. */
export function getCurrentHp(state: StoreState): number {
  return state.currentHp ?? getMaxHp(state);
}
export function getCurrentMp(state: StoreState): number {
  return state.currentMp ?? getMaxMp(state);
}
export function getCurrentPt(state: StoreState): number {
  return state.currentPt ?? getPtPool(state);
}
export function getCurrentPp(state: StoreState): number {
  return state.currentPp ?? getPpPool(state);
}

/** CD da Habilidade = 8 + Atributo + Bônus do Rank daquela árvore (Cap. 1, seção 7). */
export function getSpellDC(state: StoreState, treeId: string, attribute: AttributeKey = "intelecto"): number {
  const rank = getHighestUnlockedRank(state, treeId);
  const rankBonus = rank ? RANK_BONUS[rank] : 0;
  return 8 + getFinalAttribute(state, attribute) + rankBonus;
}

/** Bônus de Ataque = Atributo + Bônus do Rank daquela árvore (some 1d20 na hora de rolar). */
export function getAttackBonus(state: StoreState, treeId: string, attribute: AttributeKey = "intelecto"): number {
  const rank = getHighestUnlockedRank(state, treeId);
  const rankBonus = rank ? RANK_BONUS[rank] : 0;
  return getFinalAttribute(state, attribute) + rankBonus;
}

/** Quantos "conhecimentos" (magias/talentos) o personagem já tem numa árvore. */
export function getKnowledgeCount(state: StoreState, treeId: string): number {
  return state.purchasedAbilities.filter((a) => a.treeId === treeId && !origemNaturalDoSimbolo(state, a.id)).length;
}

function findAbilityOrTalentDef(treeId: string, rank: RankName, kind: "ability" | "talent", id: string) {
  const rankDef = getTreeById(treeId)?.ranks.find((r) => r.rank === rank);
  return kind === "ability"
    ? rankDef?.abilities.find((a) => a.id === id)
    : rankDef?.talents.find((t) => t.id === id);
}

/** Custo em PA pra desbloquear um rank numa árvore: RANK_REQUIREMENTS, a menos que a árvore declare unlockPaCostOverride (ex: Rei do Norte = 2 PA). */
export function getRankUnlockPaCost(treeId: string, rank: RankName): number {
  if (rank === "Principiante") {
    // Será calculado dinamicamente com base na ordem de abertura (0 PA para a 1ª, 1 PA para a 2ª, etc.)
    return 0;
  }
  const rankDef = getTreeById(treeId)?.ranks.find((r) => r.rank === rank);
  return rankDef?.unlockPaCostOverride ?? RANK_REQUIREMENTS[rank].paCost;
}

/**
 * Cap. 1, §2: cada ponto de atributo comprado depois da criação custa 2 PA.
 *
 * Mede pela SOMA dos cinco atributos base contra os 4 pontos da criação, e
 * não atributo a atributo. A versão anterior cobrava só o que passasse de 4
 * em cada atributo isolado, e isso abria dois furos que a revisão do Cap. 1
 * (2026-08-29) encontrou:
 *
 * 1. Um personagem com 4/4/4/4/4 — soma 20, contra os 4 pontos que a criação
 *    distribui — custava ZERO PA, porque nenhum atributo passava de 4.
 * 2. O Sistema de Defeitos virava lucro puro: largue Vigor em -2 na criação
 *    pra embolsar 2 pontos, e depois suba Vigor de volta a 0 na ficha sem
 *    pagar PA nenhum, porque o caminho de -2 até 4 era todo gratuito. O
 *    defeito devolvia pontos permanentes e cobrava nada.
 *
 * Com a soma, subir qualquer atributo custa o mesmo em qualquer altura da
 * escala, e recomprar um defeito custa exatamente os 2 PA por ponto que a
 * tabela do Cap. 1 anuncia. ATTRIBUTE_CREATION_MAX continua sendo o teto por
 * atributo na criação (checado no assistente), e ATTRIBUTE_HARD_CAP o teto
 * absoluto de 8.
 */
export function getAttributePaCost(state: StoreState): number {
  const soma = ATTRIBUTES.reduce((sum, { key }) => sum + (state.attributeBase[key] ?? 0), 0);
  const budget = ATTRIBUTE_CREATION_POINTS;
  const purchasedPoints = Math.max(0, soma - budget);
  return attributePaCostTotal(purchasedPoints);
}

export function getSaveAdvantagePaCost(state: StoreState): number {
  return saveAdvantagePaCostTotal((state.saveAdvantages ?? []).length);
}

/** true se os Testes de Resistência deste atributo têm Vantagem permanente. */
export function hasSaveAdvantage(state: StoreState, key: AttributeKey): boolean {
  return (state.saveAdvantages ?? []).includes(key);
}

/**
 * PA gasto em Perícias e em Proficiências/Línguas (Cap. 1, §2 e §4).
 *
 * As perícias que vêm de graça não contam: as fixas de raça/antecedente e as da
 * Árvore Inicial nunca entram em `state.skills`, e as escolhas de bônus de
 * raça/antecedente (`bonusSkillChoices`) são abatidas aqui. O que sobra foi
 * comprado, a 2 por PA.
 *
 * Antes de 2026-08-29 nenhuma das duas linhas entrava no total de PA gasto —
 * o livro cobrava e a ficha não contava.
 */
export function getSkillPaCost(state: StoreState): number {
  const race = getRaceById(state.raceId);
  const background = getBackgroundById(state.backgroundId);
  const gratuitas = new Set([
    ...(race?.fixedSkills ?? []),
    ...(background?.fixedSkills ?? []),
    ...getTreeGrantedSkills(state),
  ]);
  const escolhasDeBonus = (race?.bonusSkillChoices ?? 0) + (background?.bonusSkillChoices ?? 0);
  const compradas = Math.max(0, state.skills.filter((s) => !gratuitas.has(s)).length - escolhasDeBonus);
  return Math.ceil(compradas / SKILLS_PER_PA);
}

function getProficiencyPaCost(state: StoreState): number {
  return Math.ceil((state.proficiencies ?? []).length / PROFICIENCIES_PER_PA);
}

/** Melhorias raciais compradas (Cap. 1, §5) — hoje só a do Povo Pequeno, a 3 PA. */
function getRacialUpgradePaCost(state: StoreState): number {
  const upgrades = getRaceById(state.raceId)?.upgrades ?? [];
  return (state.racialUpgrades ?? []).reduce(
    (sum, id) => sum + (upgrades.find((u) => u.id === id)?.paCost ?? 0),
    0
  );
}

/** true se a ficha já comprou aquela melhoria racial. */
export function hasRacialUpgrade(state: StoreState, upgradeId: string): boolean {
  return (state.racialUpgrades ?? []).includes(upgradeId);
}

/**
 * Cap. 1, seção 2: 2 PA = +PV iguais a QUATRO VEZES o Maior Bônus de Rank
 * (qualquer árvore), ou +PM iguais ao DOBRO do Maior Bônus de Rank de magia —
 * escala com o Rank de propósito (o Aside do livro explica: um Imperador rende
 * 6× mais por PA que um Principiante). `bonusHp`/`bonusMp` continuam sendo o
 * valor de PV/PM que o jogador digita direto na ficha (Cap. 1: "PA é
 * informativo, não travado") — só o cálculo do custo em PA mostrado usa a taxa.
 *
 * Duas correções, ambas achadas comparando esta compra com o que as árvores
 * já ofereciam:
 * - 2026-08-28 (revisão com agentes): a taxa era fixa em 12 pra qualquer Rank
 *   — exatamente `2 × 6`, o Bônus só de um Imperador; Rank mais baixo pagava
 *   PA de menos pelo mesmo bônus. Passou a escalar com o Rank.
 * - 2026-08-28 (auditoria de balanceamento): mesmo já escalando, esta compra
 *   era 4× pior que o talento de reserva recomprável que 12 árvores têm
 *   (Braço de Ferro, Osso Duro, Pele de Pedra...). Um Imperador com 6
 *   patamares comprava o talento por 1 PA e levava +4×6 = 24 PV; a tabela do
 *   Cap. 1 pedia 2 PA por 2×6 = 12 PV. A linha de PV/PM da tabela era, na
 *   prática, uma armadilha: sempre a pior compra disponível pra quem tem
 *   qualquer árvore aberta. Dobrar as duas taxas empata o VALOR por compra
 *   (24 PV / 12 PM no Imperador); o talento continua melhor por PA, e isso é
 *   proposital — ele é travado no número de patamares de UMA árvore, enquanto
 *   esta compra é incondicional e não tem teto.
 */
function getHpMpPaCost(state: StoreState): number {
  const { hpRate, mpRate } = getReserveBuyRates(state);
  const hpCost = Math.ceil(state.bonusHp / hpRate) * 2;
  const mpCost = Math.ceil(state.bonusMp / mpRate) * 2;
  return Math.max(0, hpCost) + Math.max(0, mpCost);
}

/**
 * Quanto rende cada compra de reserva da tabela do Cap. 1, §2, e se ela rende
 * ALGUMA coisa.
 *
 * `mpBloqueado` existe por causa de uma armadilha que a revisão do livro achou
 * em 2026-09-17: nos dois primeiros patamares de magia o teto de PM (Cap. 4,
 * §1) corta TODO extra avulso, e a compra de +PM é um deles. Um Principiante
 * pagava 2 PA por +2 PM e o teto devolvia exatamente zero — a tabela vendia a
 * compra sem avisar. A regra do teto continua de pé; o que muda é que o livro
 * e a ficha passam a dizer, na cara, que a compra só rende do Avançado em
 * diante.
 */
export function getReserveBuyRates(state: StoreState): {
  hpRate: number;
  mpRate: number;
  mpBloqueado: boolean;
} {
  const bonusMagia = getHighestRankBonus(state, "magia");
  return {
    hpRate: Math.max(1, getHighestRankBonus(state) * 4),
    mpRate: Math.max(1, bonusMagia * 2),
    mpBloqueado: bonusMagia <= 2,
  };
}

/**
 * Cap. 2, §4: uma Magia Combinada exige as DUAS portas abertas, cada uma no
 * rank que ela pede. Não basta o rank Avançado genérico que a Maestria
 * concede — Meteoro quer Fogo no Rei E Terra no Avançado, e é essa desigualdade
 * que faz a tabela ser uma lista de escolhas em vez de um bloco que abre junto.
 */
export function canPurchaseCombinedSpell(state: StoreState, id: string): Check {
  const spell = getCombinedSpellById(id);
  if (!spell) return { ok: false, reason: "Magia Combinada desconhecida." };
  if ((state.purchasedCombinedSpells ?? []).includes(id)) {
    return { ok: false, reason: "Já adquirida." };
  }
  for (const req of spell.requires) {
    const atual = getHighestUnlockedRank(state, req.treeId);
    const nome = getTreeById(req.treeId)?.name ?? req.treeId;
    if (!atual || RANKS.indexOf(atual) < RANKS.indexOf(req.rank)) {
      return { ok: false, reason: `Exige ${nome} no rank ${req.rank}.` };
    }
  }
  return { ok: true };
}

/** PA gasto em Magias Combinadas (Cap. 2, §4). */
export function getCombinedSpellPaCost(state: StoreState): number {
  return (state.purchasedCombinedSpells ?? []).reduce(
    (sum, id) => sum + (getCombinedSpellById(id)?.paCost ?? 0),
    0
  );
}
/**
 * PA já gastos, só pra informar o jogador (o Mestre controla o quanto ele
 * tem fora do site — o sistema não trava compra por "saldo insuficiente"):
 * desbloqueios de rank + magias/talentos comprados + atributos acima de 4
 * + PV/PM comprados.
 */
export function getPaSpent(state: StoreState): number {
  /*
   * Cap. 1, §8, "Custo de Abertura": abrir o Principiante de uma árvore nova
   * custa PA igual à posição de abertura, e a PRIMEIRA é de graça — 0, 1, 2, 3,
   * 4, num total de 10 PA por cinco árvores.
   *
   * A Árvore Inicial sair de graça é a regra: ela já é escolhida na criação e já
   * vem com kit, então cobrar por ela seria cobrar duas vezes pela mesma coisa.
   *
   * Até 0.1.62 este comentário dizia "1ª = 1 PA, 2ª = 2 PA" — copiado do livro,
   * que dizia isso — enquanto o código logo abaixo fazia `size - 1` e cobrava o
   * que está escrito aqui agora. Foi a auditoria de 2026-09-11 que achou a
   * divergência, e a mesa decidiu: o código estava certo e o livro foi corrigido.
   *
   * A ordem de `state.unlockedRanks` já é cronológica (só cresce por append em
   * `unlockRank`), então dá pra usar direto.
   */
  const openedTrees = new Set<string>();
  const rankCost = state.unlockedRanks.reduce((sum, u) => {
    if (u.rank === "Principiante" && !openedTrees.has(u.treeId)) {
      openedTrees.add(u.treeId);
      // 1ª árvore = 0 PA, 2ª = 1 PA, 3ª = 2 PA, 4ª = 3 PA, 5ª = 4 PA...
      return sum + Math.max(0, openedTrees.size - 1);
    }
    const rankDef = getTreeById(u.treeId)?.ranks.find((r) => r.rank === u.rank);
    return sum + (rankDef?.unlockPaCostOverride ?? RANK_REQUIREMENTS[u.rank].paCost);
  }, 0);
    const abilityCost = state.purchasedAbilities.reduce((sum, a) => {
      // Se a escola foi aberta depois da compra avulsa, o símbolo tornou-se gratuito.
      if (a.treeId === "teorica" && origemNaturalDoSimbolo(state, a.id)) return sum;
      const def = findAbilityOrTalentDef(a.treeId, a.rank, a.kind, a.id);
    return sum + (def?.paCost ?? 0);
  }, 0);
  return (
    rankCost +
    abilityCost +
    getAttributePaCost(state) +
    getHpMpPaCost(state) +
    getRacialUpgradePaCost(state) +
    getSaveAdvantagePaCost(state) +
    getSkillPaCost(state) +
    getProficiencyPaCost(state) +
    getWeaponGroupPaCost(state) +
    getCombinedSpellPaCost(state)
  );
}

/** Cap. 5, §2 (Guilda de Aventureiros): faixas de PA usadas como referência pro Rank de Aventureiro — não é regra travada, só o chute inicial que o livro dá ao Mestre. */
const GUILD_RANK_THRESHOLDS: { rank: GuildRank; min: number }[] = [
  { rank: "S", min: 110 },
  { rank: "A", min: 75 },
  { rank: "B", min: 50 },
  { rank: "C", min: 30 },
  { rank: "D", min: 15 },
  { rank: "E", min: 6 },
  { rank: "F", min: 0 },
];

/** Retorna o Rank fixado pelo Mestre (overrides.guildRank) se existir; senão, uma estimativa por PA gasto (Cap. 5, §2: só um chute inicial, nunca a regra real). */
export function getGuildRank(state: StoreState): GuildRank {
  if (state.overrides.guildRank) return state.overrides.guildRank;
  const paSpent = getPaSpent(state);
  return GUILD_RANK_THRESHOLDS.find((t) => paSpent >= t.min)?.rank ?? "F";
}

/** true quando o Rank exibido é só a estimativa por PA — não uma decisão do Mestre já registrada. */
export function isGuildRankEstimated(state: StoreState): boolean {
  return !state.overrides.guildRank;
}

/**
 * Pode desbloquear este rank? Exige (Cap. 1, seção 3): rank anterior já
 * desbloqueado na mesma árvore e conhecimentos suficientes. PA não é
 * travado aqui — é só informativo (ver getPaSpent).
 */
export function canUnlockRank(state: StoreState, treeId: string, rank: RankName): Check {
  if (state.unlockedRanks.some((r) => r.treeId === treeId && r.rank === rank)) {
    return { ok: false, reason: "Rank já desbloqueado." };
  }

  const rankIndex = RANKS.indexOf(rank);
  if (rankIndex > 0) {
    const previousRank = RANKS[rankIndex - 1];
    const hasPrevious = state.unlockedRanks.some(
      (r) => r.treeId === treeId && r.rank === previousRank
    );
    if (!hasPrevious) return { ok: false, reason: `Desbloqueie ${previousRank} antes.` };
  }

  const requirement = RANK_REQUIREMENTS[rank];
  const knowledge = getKnowledgeCount(state, treeId);
  if (knowledge < requirement.knowledgeRequired) {
    return {
      ok: false,
      reason: `Precisa de ${requirement.knowledgeRequired} conhecimento(s) nesta árvore (tem ${knowledge}).`,
    };
  }

  return OK;
}

/**
 * O caminho MAIS BARATO até um rank numa árvore, em PA — revisão do livro.
 *
 * Existe pra que a pergunta "largura ou profundidade?" do Cap. 1, §8 imprima
 * um número calculado, e não escrito à mão: o texto antigo contava 10
 * conhecimentos onde RANK_REQUIREMENTS exige 15 pro Imperador.
 *
 * A conta é gulosa e é a mesma que a ficha permite: antes de cada desbloqueio,
 * compra os conhecimentos mais baratos entre os patamares JÁ abertos até
 * alcançar o exigido (`getKnowledgeCount` conta conhecimento de qualquer rank da
 * árvore). Pré-requisito entre habilidades é ignorado — o número é um piso.
 *
 * `custoDeAbertura` é o preço do Principiante, e quem chama decide: o custo de
 * abrir a Árvore Inicial (1 PA ou grátis) ainda está em aberto no livro, e as
 * árvores seguintes pagam pela ordem de abertura (Cap. 1, §8). O padrão 0 só
 * soma "nada" à abertura; não é regra.
 */
export function getCustoMinimoAteRank(
  treeId: string,
  ate: RankName = "Imperador",
  custoDeAbertura = 0
): { desbloqueios: number; conhecimentos: number; quantidade: number; total: number } {
  const tree = getTreeById(treeId);
  const alvo = RANKS.indexOf(ate);
  let desbloqueios = custoDeAbertura;
  let conhecimentos = 0;
  let quantidade = 0;
  const disponiveis: number[] = [];
  for (let i = 0; i <= alvo; i++) {
    const rank = RANKS[i];
    if (i > 0) {
      const exigido = RANK_REQUIREMENTS[rank].knowledgeRequired;
      disponiveis.sort((x, y) => x - y);
      while (quantidade < exigido && disponiveis.length > 0) {
        conhecimentos += disponiveis.shift()!;
        quantidade++;
      }
      desbloqueios += getRankUnlockPaCost(treeId, rank);
    }
    const rankDef = tree?.ranks.find((r) => r.rank === rank);
    for (const item of [...(rankDef?.abilities ?? []), ...(rankDef?.talents ?? [])]) {
      disponiveis.push(item.paCost);
    }
  }
  return { desbloqueios, conhecimentos, quantidade, total: desbloqueios + conhecimentos };
}

/** Pode comprar esta magia/talento? Exige só o rank já desbloqueado nesta árvore. */
/** O nome legível de um id dentro de uma árvore — pra mensagem de erro dizer o que falta. */
function findNomeNaArvore(treeId: string, id: string): string | undefined {
  const tree = getTreeById(treeId);
  for (const rankDef of tree?.ranks ?? []) {
    const achado =
      rankDef.abilities.find((a) => a.id === id) ?? rankDef.talents.find((t) => t.id === id);
    if (achado) return achado.name;
  }
  return undefined;
}

export function canPurchaseAbility(
  state: StoreState,
  treeId: string,
  rank: RankName,
  kind: "ability" | "talent",
  id: string
): Check {
  const rankUnlocked = state.unlockedRanks.some((r) => r.treeId === treeId && r.rank === rank);
  if (!rankUnlocked) return { ok: false, reason: "Rank ainda não desbloqueado nesta árvore." };

  if (state.purchasedAbilities.some((a) => a.treeId === treeId && a.id === id)) {
    return { ok: false, reason: "Já adquirido." };
  }
  if (treeId === "teorica" && origemNaturalDoSimbolo(state, id)) {
    return { ok: false, reason: "Símbolo concedido pela árvore de origem." };
  }

  // Pré-requisito de compra (2026-09-03). Dez habilidades declaram `requires`:
  // as sete Soberanas do Escudeiro, que só existem pra quem comprou Puro Escudo,
  // e as três Evoluções do Pacto, que precisam do Filhote. Até esta data a
  // exigência vivia só na prosa do efeito, e nada a checava.
  const defParaRequisito = findAbilityOrTalentDef(treeId, rank, kind, id);
  for (const requerido of defParaRequisito?.requires ?? []) {
    if (!state.purchasedAbilities.some((a) => a.treeId === treeId && a.id === requerido)
      && !(treeId === "teorica" && conheceSimboloTeorico(state, requerido))) {
      const nome = findNomeNaArvore(treeId, requerido) ?? requerido;
      return { ok: false, reason: `Exige "${nome}" nesta árvore antes.` };
    }
  }

  /*
   * PRÉ-REQUISITO EM OUTRA ÁRVORE — "Requer 1 patamar em Água" (0.1.91).
   *
   * Quatro habilidades do livro são PONTES entre escolas: Vapor Seco (Fogo,
   * pede Vento), Nova Congelante (Vento, pede Água), Explosão Silenciosa
   * (Vento, pede Fogo) e Dedos de Mana (Ladino, pede qualquer escola de magia).
   * As quatro diziam a exigência na prosa, e a ficha deixava comprar assim
   * mesmo — porque `requires` só sabe olhar a PRÓPRIA árvore.
   *
   * O que elas vendem é a mistura. Comprar sem o outro lado é levar o efeito
   * sem pagar a ponte, e era o único jeito de um mago de Vento puro sair com
   * uma magia de gelo na ficha.
   */
  const comRequisito = findAbilityOrTalentDef(treeId, rank, kind, id);
  const exigencia = comRequisito?.requiresRank;
  if (exigencia) {
    const ordemExigida = RANKS.indexOf(exigencia.rank);
    const atende = state.unlockedRanks.some((u) => {
      if (RANKS.indexOf(u.rank) < ordemExigida) return false;
      if (exigencia.treeId) return u.treeId === exigencia.treeId;
      if (exigencia.categoria) return getTreeById(u.treeId)?.category === exigencia.categoria;
      return false;
    });
    if (!atende) {
      const onde = exigencia.treeId
        ? (getTreeById(exigencia.treeId)?.name ?? exigencia.treeId)
        : exigencia.categoria === "magia"
          ? "alguma escola de magia"
          : `alguma árvore de ${exigencia.categoria}`;
      return { ok: false, reason: `Exige o patamar ${exigencia.rank} em ${onde}.` };
    }
  }

  const def = findAbilityOrTalentDef(treeId, rank, kind, id);
  if (!def) return { ok: false, reason: "Não encontrado." };

  return OK;
}

/* ------------------------------------------------------------------------- */
/* Condições ativas (Cap. 4, §2) — 0.1.24                                    */
/* ------------------------------------------------------------------------- */

/**
 * As condições marcadas na ficha, já resolvidas contra o glossário.
 *
 * Descarta id que não existe mais em `CONDICOES` em vez de quebrar: uma ficha
 * salva pode carregar uma condição de uma versão anterior do livro, e uma linha
 * órfã na ficha é melhor tratada como "não existe" do que como uma exceção no
 * meio do cálculo de CA.
 */
export interface CondicaoNaFicha {
  condicao: Condicao;
  acumulos: number;
  nota?: string;
  /** O Bônus de Rank de quem aplicou, quando a mesa informou — ver `CondicaoAtiva`. */
  bonusDeRankDaFonte?: number;
}

export function getCondicoesAtivas(state: StoreState): CondicaoNaFicha[] {
  return (state.condicoes ?? [])
    .map((ativa): CondicaoNaFicha | null => {
      const condicao = getCondicaoPorId(ativa.id);
      return condicao
        ? {
            condicao,
            acumulos: ativa.acumulos ?? 1,
            nota: ativa.nota,
            bonusDeRankDaFonte: ativa.bonusDeRankDaFonte,
          }
        : null;
    })
    .filter((x): x is CondicaoNaFicha => x !== null);
}

/**
 * A penalidade de Quebrantado: −1 na CA e −1 no dano por acúmulo.
 *
 * É a única condição do livro que mexe num NÚMERO da ficha, e por isso a única
 * que entra no cálculo. As outras mudam como se rola (Vantagem, Desvantagem) ou
 * o que se pode fazer (Ações, Deslocamento) — coisas que a ficha mostra, mas não
 * soma.
 */
export function getPenalidadeQuebrantado(state: StoreState): number {
  const q = getCondicoesAtivas(state).find((c) => c.condicao.id === "quebrantado");
  if (!q) return 0;
  /*
   * O TETO — 0.1.73.
   *
   * A regra é "até o máximo do Bônus de Rank de quem aplicou", e o código
   * devolvia `acumulos` cru. Nove cliques no `+` do Painel do Mestre levavam a
   * CA a −9 e o dano de todo ataque a −9, sem nada no sistema dizendo que
   * aquilo era impossível.
   *
   * Quando a mesa informou quem aplicou, o teto é o Bônus de Rank dessa fonte.
   * Quando não informou, o teto é o maior Bônus de Rank que o livro concede a
   * uma criatura jogável — não adivinha o número da mesa, só barra o absurdo.
   */
  return Math.min(q.acumulos, q.bonusDeRankDaFonte ?? TETO_DE_ACUMULOS);
}


export interface EfeitosDeCondicoes {
  /** Rolagens de ATAQUE saem com Desvantagem, e por causa de quais condições. */
  desvantagemEmAtaques: string[];
  /** Testes de atributo saem com Desvantagem, e por causa de quais. */
  desvantagemEmTestes: string[];
  /** Quem ataca este personagem tem Vantagem. */
  vantagemParaQuemAtaca: string[];
  /** Deslocamento zerado ou pela metade — o pior dos dois vence. */
  deslocamento: "normal" | "metade" | "zero";
  /** Perdeu as Ações do turno. */
  semAcoes: string[];
  /** Dano no início do turno, por condição. */
  danoPorTurno: { nome: string; formula: string }[];
  /** −1 de CA e de dano por acúmulo de Quebrantado. */
  penalidadeQuebrantado: number;
}

/**
 * Tudo que as condições ativas fazem, junto — é o que a ficha desenha em cima do
 * corpo do personagem e o que o rolador consulta antes de uma rolagem.
 *
 * Cada efeito vem acompanhado do NOME de quem o causou, e não como um booleano
 * solto: a diferença entre "Desvantagem" e "Desvantagem por Envenenado" é a
 * diferença entre a mesa aceitar o número e a mesa entender o número.
 */
export function getEfeitosDeCondicoes(state: StoreState): EfeitosDeCondicoes {
  const ativas = getCondicoesAtivas(state);
  const efeitos: EfeitosDeCondicoes = {
    desvantagemEmAtaques: [],
    desvantagemEmTestes: [],
    vantagemParaQuemAtaca: [],
    deslocamento: "normal",
    semAcoes: [],
    danoPorTurno: [],
    penalidadeQuebrantado: getPenalidadeQuebrantado(state),
  };

  for (const { condicao } of ativas) {
    const m = condicao.mecanica;
    if (!m) continue;
    if (m.desvantagemEmAtaques) efeitos.desvantagemEmAtaques.push(condicao.nome);
    if (m.desvantagemEmTestes) efeitos.desvantagemEmTestes.push(condicao.nome);
    if (m.vantagemParaQuemAtaca || m.vantagemCorpoACorpo) efeitos.vantagemParaQuemAtaca.push(condicao.nome);
    if (m.semAcoes) efeitos.semAcoes.push(condicao.nome);
    if (m.danoPorTurno) efeitos.danoPorTurno.push({ nome: condicao.nome, formula: m.danoPorTurno });
    // Zero vence metade: duas condições que reduzem o Deslocamento não se somam,
    // a pior manda — é como o livro trata empilhamento (Cap. 4, §5).
    if (m.deslocamento === "zero") efeitos.deslocamento = "zero";
    else if (m.deslocamento === "metade" && efeitos.deslocamento !== "zero") efeitos.deslocamento = "metade";
  }

  return efeitos;
}

/* ------------------------------------------------------------------------- */
/* Teste de perícia (Cap. 1, §4) — 0.1.32                                    */
/* ------------------------------------------------------------------------- */

export interface BonusDePericia {
  nome: string;
  /** O atributo que governa a perícia, segundo a Lista Mestre. */
  atributo: AttributeKey;
  atributoValor: number;
  /** Bônus de Rank somado, e de qual árvore de Utilidade ele veio. */
  bonusDeRank: number;
  arvoreDoBonus?: string;
  /** O total que vai no d20. */
  total: number;
  /** O personagem TEM a perícia — é isso que dá Vantagem quando ela se encaixa. */
  treinada: boolean;
}

/**
 * O bônus de um teste de perícia, com a conta aberta.
 *
 * O Cap. 1, §4 tem três partes, e só duas são conta:
 *
 * 1. **`1d20 + Atributo`** — a Lista Mestre diz qual atributo governa cada
 *    perícia, e é isso que sempre soma.
 * 2. **Bônus de Rank em perícia**, exclusivo das três árvores de Utilidade:
 *    soma nas perícias que aquela árvore cobre, "mas só naquelas que você
 *    realmente possui — se você nunca aprendeu a perícia, não existe teste
 *    treinado onde somar o bônus". As duas condições são checadas aqui.
 * 3. **Vantagem por ter a perícia**, "sempre que ela se encaixar perfeitamente
 *    na situação" — o *quando* é julgamento do Mestre, e por isso `treinada`
 *    é devolvido como fato e não aplicado como modo de rolagem. Quem decide
 *    continua sendo quem está na mesa.
 *
 * Quando duas árvores de Utilidade cobrem a mesma perícia (Percepção, no Ladino
 * e no Tático), vale o MAIOR bônus — bônus do mesmo tipo não empilham (Cap. 4,
 * §5, Empilhamento).
 */
export function getBonusDePericia(state: StoreState, nome: string): BonusDePericia | null {
  const pericia = getSkillByName(nome);
  if (!pericia) return null;

  const atributoValor = getFinalAttribute(state, pericia.attribute);
  const treinada = state.skills.includes(nome);

  let bonusDeRank = 0;
  let arvoreDoBonus: string | undefined;
  if (treinada) {
    for (const u of state.unlockedRanks) {
      const tree = getTreeById(u.treeId);
      if (!tree?.proficiencies?.periciasCobertas?.includes(nome)) continue;
      const rank = getHighestUnlockedRank(state, tree.id);
      if (!rank) continue;
      const bonus = RANK_BONUS[rank];
      if (bonus > bonusDeRank) {
        bonusDeRank = bonus;
        arvoreDoBonus = tree.name;
      }
    }
  }

  return {
    nome,
    atributo: pericia.attribute,
    atributoValor,
    bonusDeRank,
    arvoreDoBonus,
    total: atributoValor + bonusDeRank,
    treinada,
  };
}

/** As perícias que o personagem tem, com o bônus de cada uma já calculado. */
export function getPericiasTreinadas(state: StoreState): BonusDePericia[] {
  return state.skills
    .map((nome) => getBonusDePericia(state, nome))
    .filter((p): p is BonusDePericia => p !== null)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
