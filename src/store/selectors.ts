import { getRaceById } from "@/data/races";
import { getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import { getTreeById } from "@/data/trees";
import { diceAverage } from "@/lib/dice";
import { escalateWeaponDie } from "@/lib/weaponDie";
import {
  ATTRIBUTE_CREATION_POINTS,
  ATTRIBUTE_PA_COST_PER_POINT,
  PROFICIENCIES_PER_PA,
  SAVE_ADVANTAGE_PA_COST,
  SKILLS_PER_PA,
  AttributeKey,
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

/** Cap. 3: o Deus da Espada acorda o Touki Pleno no 2º patamar (Intermediário); as demais árvores do Corpo, no 3º (Avançado). */
function ptPlenoThresholdIndex(treeId: string): number {
  return treeId === "deus-da-espada" ? RANKS.indexOf("Intermediário") : RANKS.indexOf("Avançado");
}

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

  return Array.from(new Set(skills));
}

/** Quantas escolhas do `choose` da Árvore Inicial ainda faltam (0 se ela não tem nenhuma). */
export function getPendingTreeSkillChoices(state: StoreState): number {
  const choose = getTreeById(state.startingTreeId)?.grantedSkills?.choose;
  if (!choose) return 0;
  const validas = (state.treeSkillChoices ?? []).filter((s) => choose.from.includes(s));
  return Math.max(0, choose.count - validas.length);
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
 * Soma dos Dados de PV de todos os patamares desbloqueados, DOBRADA — o "corpo
 * treinado" da fórmula do Cap. 4, antes do Vigor entrar. Exportado porque a
 * ficha mostra essa parcela separada do fator.
 *
 * O ×2 é o mesmo de sempre (Cap. 4 justifica: sem ele um Norte chega ao
 * Imperador com ~70 PV contra ~130 de dano por turno e o combate acaba antes
 * de o segundo personagem agir). O que saiu em 2026-08-29 foi o CASO ESPECIAL
 * que existia aqui: o dado do 1º patamar da Árvore Inicial contava pelo valor
 * máximo em vez da média. Além de ser a única exceção do livro a essa regra,
 * ele fazia os PV Máximos dependerem de `startingTreeId` — trocar a Árvore
 * Inicial numa ficha pronta mexia silenciosamente na vida. A constante
 * PV_BASE (20, contra os 10..13 da Constituição Base antiga) absorve o que
 * esse máximo entregava.
 */
/**
 * Reserva concedida pelos talentos de árvore comprados (Cap. 1, "O Padrão das
 * Reservas"). Até 2026-08-29 nenhum desses 24 talentos mexia num número da
 * ficha: eram texto, e o jogador digitava o resultado à mão nos campos avulsos
 * de PV/PM — o que também significava que a metade PT deles não tinha campo
 * nenhum pra ser digitada.
 *
 * `hpPerRank`/`mpPerRank` escalam com quantos patamares você abriu NAQUELA
 * árvore (é o que "por patamar seu nesta árvore" quer dizer); `pt` é fixo.
 */
function getTalentReserve(state: StoreState, field: keyof ReserveGrant): number {
  return state.purchasedAbilities.reduce((sum, a) => {
    if (a.kind !== "talent") return sum;
    const def = getTreeById(a.treeId)
      ?.ranks.find((r) => r.rank === a.rank)
      ?.talents.find((t) => t.id === a.id);
    const value = def?.grants?.[field];
    if (!value) return sum;
    if (field === "pt") return sum + value;
    return sum + value * state.unlockedRanks.filter((u) => u.treeId === a.treeId).length;
  }, 0);
}

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
 * patamar: Escudeiro 27/44/64 PV (P→A); Lutador 28/43/61; Espada
 * 27/41/57; Magia de Água 21/29/39; Terra 24/35/48.
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
 * Implementação: o cap é "no máximo `4 × MB + 8` PM sobre a base da
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
 *   E=4, MB=1, +2 talento, +4 fixo Acólito: 14 PM (cap corta o fixo)
 *   E=4, MB=2 (Intermediário) sem nada: 16 PM (5 casts máx da 3-PM)
 *   E=4, MB=6 (Imperador): base 32 PM, sem cap
 */
export function getMaxMp(state: StoreState): number {
  const espirito = getFinalAttribute(state, "espirito");
  const maiorBonusMagia = getHighestRankBonus(state, "magia");
  const atributoPiso = Math.max(espirito, 4);
  const baseSemCap = atributoPiso * maiorBonusMagia + 8;
  const escalarRacial = (getRaceById(state.raceId)?.bonuses.mpPerMagicRank ?? 0) * maiorBonusMagia;
  const talentoMp = getTalentReserve(state, "mpPerRank");
  const baseComRacialETalentos = baseSemCap + escalarRacial + talentoMp;
  // Extras avulsos (PA, antecedentes, sub-tabela) são capados nos 2 primeiros
  // ranks. Cap = `4 × MB + 8 + talentoMp + escalarRacial` — talento entra
  // (não é cortado), racial entra (escala com MB, não é "compra avulsa"),
  // mas PA/antecedente/sub-tabela são capados em zero. Acima do 2º, sem cap.
  if (maiorBonusMagia <= 2) {
    const capTotal = 4 * maiorBonusMagia + 8 + talentoMp + escalarRacial;
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
 * Pontos de Touki (Cap. 3, "Pontos de Touki (PT) — as duas reservas"): sem
 * nenhum patamar do Corpo, 0. Com pelo menos um patamar mas nenhum "Pleno"
 * ainda, PT Menor = max(Vigor, 1). A partir do Touki Pleno (3º patamar em
 * geral; 2º no Deus da Espada, que também conta pra soma de Crescimento):
 * PT = Vigor + Espírito + Crescimento, onde Crescimento soma +1 por patamar
 * com Pleno já desbloqueado (+2 por patamar em Cavalaria e Escudos, que gasta
 * PT mais rápido que qualquer outra árvore). Corrigido em 2026-08-28: a
 * fórmula antiga daqui (Vigor + Espírito×Maior Bônus, multiplicativa) não
 * batia com o livro e deixava PT bem mais generoso que o pretendido.
 */
export function getPtPool(state: StoreState): number {
  const corpoRanks = state.unlockedRanks.filter((r) => getTreeById(r.treeId)?.category === "corpo");

  function computeNatural(): number {
    if (corpoRanks.length === 0) return 0;

    const vigor = getFinalAttribute(state, "vigor");
    const espirito = getFinalAttribute(state, "espirito");

    const plenoRanks = corpoRanks.filter((u) => RANKS.indexOf(u.rank) >= ptPlenoThresholdIndex(u.treeId));
    if (plenoRanks.length === 0) return Math.max(vigor, 1) + getTalentReserve(state, "pt");

    // Crescimento vem do campo `ptGained` de cada patamar — antes era um
    // `treeId === "cavalaria-e-escudos" ? 2 : 1` escrito à mão aqui, e o campo
    // do dado ficava morto, só alimentando o catálogo. Os valores coincidiam,
    // mas nada impedia que divergissem em silêncio numa edição futura.
    const crescimento = plenoRanks.reduce((sum, u) => {
      const rankDef = getTreeById(u.treeId)?.ranks.find((r) => r.rank === u.rank);
      return sum + (rankDef?.ptGained ?? 1);
    }, 0);

    return vigor + espirito + crescimento + getTalentReserve(state, "pt");
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
        // Rank naquela árvore. Sem isso o Tático tinha a maior reserva de PP do
        // livro (20 no Imperador, contra 15 do Bardo) investindo UM atributo
        // onde as outras duas árvores de Utilidade investem dois.
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
export function getArmorClass(state: StoreState): number {
  const equippedBonus = state.inventory.reduce(
    (sum, item) => sum + (item.equipped && item.type === "armadura" ? (item.acBonus ?? 0) : 0),
    0
  );
  const computed = 10 + getFinalAttribute(state, "agilidade") + getFlatBonusSum(state, "armorClass") + equippedBonus;
  return state.overrides.armorClass ?? computed;
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
  attribute: AttributeKey = "forca"
): WeaponDamageInfo | null {
  const corpoRanks = state.unlockedRanks.filter((r) => getTreeById(r.treeId)?.category === "corpo");
  if (corpoRanks.length === 0 || !baseDie) return null;

  let bestTreeId = corpoRanks[0].treeId;
  let bestRankIndex = -1;
  for (const u of corpoRanks) {
    const idx = RANKS.indexOf(u.rank);
    if (idx > bestRankIndex) {
      bestRankIndex = idx;
      bestTreeId = u.treeId;
    }
  }

  const tree = getTreeById(bestTreeId);
  if (!tree) return null;
  const rank = RANKS[bestRankIndex];

  const steps = tree.ranks
    .filter((r) => RANKS.indexOf(r.rank) <= bestRankIndex)
    .reduce((sum, r) => sum + (r.weaponDieSteps ?? 0), 0);

  const escalatedDie = escalateWeaponDie(baseDie, steps);
  const rankBonus = RANK_BONUS[rank];
  const attributeValue = getFinalAttribute(state, attribute);

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
    averageDamage: diceAverage(escalatedDie) + attributeValue + rankBonus,
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
  return state.purchasedAbilities.filter((a) => a.treeId === treeId).length;
}

function findAbilityOrTalentDef(treeId: string, rank: RankName, kind: "ability" | "talent", id: string) {
  const rankDef = getTreeById(treeId)?.ranks.find((r) => r.rank === rank);
  return kind === "ability"
    ? rankDef?.abilities.find((a) => a.id === id)
    : rankDef?.talents.find((t) => t.id === id);
}

/** Custo em PA pra desbloquear um rank numa árvore: RANK_REQUIREMENTS, a menos que a árvore declare unlockPaCostOverride (ex: Rei do Norte = 2 PA). */
export function getRankUnlockPaCost(treeId: string, rank: RankName): number {
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
  // 2026-08-30: o orçamento da criação ficou fixo em ATTRIBUTE_CREATION_POINTS (2)
  // e NÃO desconta mais os bônus de Raça/Antecedente/sub-tabela. Eles são
  // empilhados POR FORA do point-buy, não são pontos que a raça "gasta" do
  // jogador. Sem isso, Ogro (+2 For) ou Dragão (+2 For +1 Vig) abririam o jogo
  // no 4/4 sem cobrar nada — o que mata o propósito do cap de criação.
  const budget = ATTRIBUTE_CREATION_POINTS;
  return Math.max(0, soma - budget) * ATTRIBUTE_PA_COST_PER_POINT;
}

/** Cap. 1, §2: Vantagem permanente nos saves de um atributo — 2 PA por atributo. */
export function getSaveAdvantagePaCost(state: StoreState): number {
  return (state.saveAdvantages ?? []).length * SAVE_ADVANTAGE_PA_COST;
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

export function getProficiencyPaCost(state: StoreState): number {
  return Math.ceil((state.proficiencies ?? []).length / PROFICIENCIES_PER_PA);
}

/** Melhorias raciais compradas (Cap. 1, §5) — hoje só a do Povo Pequeno, a 3 PA. */
export function getRacialUpgradePaCost(state: StoreState): number {
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
export function getHpMpPaCost(state: StoreState): number {
  const hpRate = Math.max(1, getHighestRankBonus(state) * 4);
  const mpRate = Math.max(1, getHighestRankBonus(state, "magia") * 2);
  const hpCost = Math.ceil(state.bonusHp / hpRate) * 2;
  const mpCost = Math.ceil(state.bonusMp / mpRate) * 2;
  return Math.max(0, hpCost) + Math.max(0, mpCost);
}

/**
 * PA já gastos, só pra informar o jogador (o Mestre controla o quanto ele
 * tem fora do site — o sistema não trava compra por "saldo insuficiente"):
 * desbloqueios de rank + magias/talentos comprados + atributos acima de 4
 * + PV/PM comprados.
 */
export function getPaSpent(state: StoreState): number {
  // Cap. 1, §8, "Custo de Abertura": desbloquear o Principiante de uma árvore
  // nova custa PA igual à posição de abertura (1ª árvore = 1 PA, 2ª = 2 PA, ...),
  // não o custo fixo de RANK_REQUIREMENTS.Principiante — senão a regra que o
  // livro descreve como "corrigida" (impedir abrir 5 árvores por 5 PA de graça)
  // nunca é aplicada de fato. A ordem de state.unlockedRanks já é cronológica
  // (só cresce por append em unlockRank), então dá pra usar direto.
  const openedTrees = new Set<string>();
  const rankCost = state.unlockedRanks.reduce((sum, u) => {
    if (u.rank === "Principiante" && !openedTrees.has(u.treeId)) {
      openedTrees.add(u.treeId);
      return sum + openedTrees.size;
    }
    return sum + getRankUnlockPaCost(u.treeId, u.rank);
  }, 0);
  const abilityCost = state.purchasedAbilities.reduce((sum, a) => {
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
    getProficiencyPaCost(state)
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

/** Pode comprar esta magia/talento? Exige só o rank já desbloqueado nesta árvore. */
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

  const def = findAbilityOrTalentDef(treeId, rank, kind, id);
  if (!def) return { ok: false, reason: "Não encontrado." };

  return OK;
}
