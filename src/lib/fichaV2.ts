import type { AttributeKey, CharacterData } from "./types";
import { TREES } from "@/data/trees";
import { RACES } from "@/data/races";
import { BACKGROUNDS, SUBTABLES } from "@/data/backgrounds";
import { WEAPON_GROUPS } from "@/data/weaponGroups";
import { COMBINED_SPELLS } from "@/data/combinedSpells";
import {
  getArmorClass,
  getBonusDePericia,
  getCondicoesAtivas,
  getCurrentMp,
  getCurrentPp,
  getCurrentPt,
  getDeslocamento,
  getFinalAttributes,
  getInitiative,
  getMaiorBonusDeRank,
  getMaxMp,
  getPaSpent,
  getPpPool,
  getPtPool,
} from "@/store/selectors";
import { getPvNaMesa, hpAtualNaMesa } from "./mesa";

/**
 * Exportação consultiva da ficha para a mesa Roblox.
 *
 * CONTRATO INICIAL EMENDADO — T23a:
 *
 * - mesa = 2; envelopeVersion = 2.
 * - exporterVersion identifica este adaptador, NÃO a revisão do livro.
 * - Não há catalog.contentVersion nem calculationsVersion nesta versão.
 * - compatibility = "master-approved-snapshot": os números são uma foto
 *   calculada pelo site e precisam de aprovação do mestre.
 * - O Roblox resolve todas as referências contra seu próprio catálogo e
 *   registra a versão usada ao importar. IDs conhecidos NÃO provam que os
 *   cálculos vieram da mesma revisão do catálogo.
 * - constructionComplete = false quando uma referência não foi resolvida.
 *   omissions e warnings acompanham o envelope para a proposta do mestre.
 *   Uma construção parcial não pode ser promovida a personagem legítimo do
 *   RPG sem reconstrução e validação autoritativa.
 * - Proficiências abertas são proficiencyTexts, nunca IDs de perícia.
 * - Inventário vai por valor. sourceLocalId é identidade local da ficha,
 *   NÃO item/<id>, identidade Roblox nem prova de aquisição.
 * - Condições preservam stacks, note e sourceRankBonus. Este último não
 *   identifica um aplicador nem demonstra a maestria Nada Segura.
 * - mesa.*, legacyBarreira com conteúdo e contextos completos de ação
 *   não são reconstruídos por este adaptador.
 *
 * COMPATIBILIDADE COM FICHAS LEGADAS:
 *
 * A exportação cria uma cópia local com os mesmos padrões nullish que o
 * site usa: listas ausentes/null viram [], recursos atuais ausentes/null
 * ficam null (os seletores usam os máximos), descansosCurtos vira 0 e lore
 * vira "". A ficha original não é modificada. Nenhum outro número ou campo
 * obrigatório recebe um padrão inventado.
 *
 * A migração da antiga Barreira pertence a importCharacter. Este adaptador
 * não a reimplementa nem descarta seu recibo de compras.
 *
 * TRANSPORTE:
 *
 * codificarPartes(envelope) serializa exatamente JSON.stringify(envelope),
 * sem espaços adicionais, e retorna fragmentos desse JSON puro.
 * Não há prefixo, base64, compressão, índice ou cabeçalho dentro das partes.
 *
 * Cada fragmento:
 * - tem entre 1 e 4096 bytes UTF-8;
 * - termina entre pontos de código Unicode;
 * - é UTF-8 válido.
 *
 * partes.join("") restitui exatamente o JSON serializado. O cliente envia:
 * - fichaImportBegin: byteCount = bytes UTF-8 da concatenação,
 *   partCount = partes.length;
 * - fichaImportPart: index começando em 1 e text = partes[index - 1].
 *
 * uploadId, autorização, confirmação, prazo, deduplicação, validação do
 * schema e aprovação pertencem ao Roblox. Não são fornecidos pelo site.
 *
 * LIMITES:
 *
 * JSON <= 65536 bytes, até 32 partes, profundidade <= 12 contêineres,
 * <= 16384 nós. Limites numéricos abaixo são limites de transporte,
 * NÃO regras ou tetos do livro. Nada corta compras ou inventário.
 *
 * Este módulo não modifica a ficha, não usa rede, não importa Node e não
 * altera seletores. Textos do jogador precisam ser filtrados no Roblox.
 */
export const FICHA_V2_EXPORTADOR = "ficha-v2/1";
export const FICHA_V2_ENVELOPE_VERSION = 2;
export const FICHA_V2_BYTES_MAX = 65_536;
export const FICHA_V2_PARTE_BYTES_MAX = 4_096;
export const FICHA_V2_PARTES_MAX = 32;

const PROFUNDIDADE_MAX = 12;
const NOS_MAX = 16_384;
const ATRIBUTOS = [
  "forca",
  "agilidade",
  "vigor",
  "intelecto",
  "espirito",
] as const satisfies readonly AttributeKey[];

/**
 * Registro explícito fornecido pelo gerador do catálogo.
 * Alterações precisam preservar IDs existentes e ser conferidas com
 * tools/registros/pericias.json no projeto Roblox.
 */
const PERICIAS: Readonly<Record<string, string>> = Object.freeze({
  Atletismo: "atletismo",
  Acrobacia: "acrobacia",
  Furtividade: "furtividade",
  Ladinagem: "ladinagem",
  Arcanismo: "arcanismo",
  História: "historia",
  Investigação: "investigacao",
  Medicina: "medicina",
  Natureza: "natureza",
  Ofícios: "oficios",
  Religião: "religiao",
  Atuação: "atuacao",
  Enganação: "enganacao",
  Intimidação: "intimidacao",
  Intuição: "intuicao",
  Lábia: "labia",
  "Lidar com Animais": "lidar-com-animais",
  Percepção: "percepcao",
  Persuasão: "persuasao",
  Sobrevivência: "sobrevivencia",
});

type Attributes = Record<AttributeKey, number>;

export interface InventarioFichaV2 {
  sourceLocalId: string;
  name: string;
  type: "arma" | "armadura" | "geral";
  equipped: boolean;
  description?: string;
  armorClassBonus?: number;
  baseDie?: string;
  damageAttribute?: AttributeKey;
  treatmentsUsed?: number;
}

export interface OverridesFichaV2 {
  maxHp?: number;
  maxMp?: number;
  maxPt?: number;
  maxPp?: number;
  armorClass?: number;
  initiative?: number;
  guildRank?: CharacterData["overrides"]["guildRank"];
}

export interface CondicaoFichaV2 {
  conditionId: string;
  stacks: number;
  note?: string;
  sourceRankBonus?: number;
}

export interface FichaV2 {
  mesa: 2;
  envelopeVersion: 2;
  exporterVersion: string;
  compatibility: "master-approved-snapshot";
  sourceCharacterId: string;
  name: string;
  constructionComplete: boolean;
  omissions: string[];
  warnings: string[];
  construction: {
    raceId?: string;
    raceChosen: boolean;
    backgroundId?: string;
    backgroundChosen: boolean;
    subtableEntryId?: string;
    attributeBase: Attributes;
    raceAttributeChoices: AttributeKey[];
    racialUpgradeIds: string[];
    saveAdvantages: AttributeKey[];
    startingTreeId?: string;
    unlockedRankIds: string[];
    purchasedIds: string[];
    combinedSpellIds: string[];
    skillIds: string[];
    treeSkillChoiceIds: string[];
    proficiencyTexts: string[];
    weaponGroupIds: string[];
    bonusHp: number;
    bonusMp: number;
    gold: number;
    inventory: InventarioFichaV2[];
    overrides: OverridesFichaV2;
  };
  calculated: {
    attributes: Attributes;
    maxima: { pv: number; pm: number; pt: number; pp: number };
    armorClass: number;
    movementMeters: number;
    initiative: { bonus: number; advantage: boolean };
    highestRankBonus: number;
    skills: { skillId: string; bonus: number; trained: boolean }[];
    actionContexts: [];
    paSpent: number;
  };
  session: {
    current: { pv: number; pm: number; pt: number; pp: number };
    conditions: CondicaoFichaV2[];
    shortRests?: number;
    manualEffects: [];
  };
}

/**
 * CharacterData descreve a ficha atual, mas arquivos antigos podem não
 * conter todos os campos. Aplicar apenas padrões demonstrados no site.
 *
 * A cópia precisa preceder os seletores: alguns acessam diretamente uma
 * lista que outros já toleram com ?? []. Nenhuma lista original é mutada.
 */
function normalizarAusencias(ficha: CharacterData): CharacterData {
  return {
    ...ficha,
    lore: ficha.lore ?? "",
    racialUpgrades: ficha.racialUpgrades ?? [],
    purchasedCombinedSpells: ficha.purchasedCombinedSpells ?? [],
    weaponGroupChoices: ficha.weaponGroupChoices ?? [],
    treeSkillChoices: ficha.treeSkillChoices ?? [],
    saveAdvantages: ficha.saveAdvantages ?? [],
    raceAttributeChoices: ficha.raceAttributeChoices ?? [],
    purchasedAbilities: ficha.purchasedAbilities ?? [],
    proficiencies: ficha.proficiencies ?? [],
    unlockedRanks: ficha.unlockedRanks ?? [],
    inventory: ficha.inventory ?? [],
    condicoes: ficha.condicoes ?? [],
    descansosCurtos: ficha.descansosCurtos ?? 0,
    currentHp: ficha.currentHp ?? null,
    currentMp: ficha.currentMp ?? null,
    currentPt: ficha.currentPt ?? null,
    currentPp: ficha.currentPp ?? null,
    ...(ficha.legacyBarreira != null
      ? {
          legacyBarreira: {
            ...ficha.legacyBarreira,
            purchases: ficha.legacyBarreira.purchases ?? [],
          },
        }
      : {}),
  };
}

function erro(campo: string, motivo: string): never {
  throw new Error(`${campo}: ${motivo}.`);
}

function unicodeValido(texto: string, campo: string): void {
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const seguinte = texto.charCodeAt(i + 1);
      if (!(seguinte >= 0xdc00 && seguinte <= 0xdfff))
        erro(campo, "surrogate Unicode isolado");
      i++;
    } else if (c >= 0xdc00 && c <= 0xdfff) {
      erro(campo, "surrogate Unicode isolado");
    }
  }
}

function bytes(texto: string): number {
  return new TextEncoder().encode(texto).length;
}

function texto(
  valor: unknown,
  campo: string,
  maxBytes: number,
  minCaracteres = 0,
  maxCaracteres?: number,
): string {
  if (typeof valor !== "string") erro(campo, "esperado texto");
  unicodeValido(valor, campo);
  const quantidade = [...valor].length;
  if (
    quantidade < minCaracteres ||
    (maxCaracteres !== undefined && quantidade > maxCaracteres)
  )
    erro(campo, "quantidade de caracteres fora do formato");
  if (bytes(valor) > maxBytes)
    erro(campo, `texto excede ${maxBytes} bytes UTF-8`);
  return valor;
}

function inteiro(
  valor: unknown,
  campo: string,
  minimo: number,
  maximo: number,
): number {
  if (
    typeof valor !== "number" ||
    !Number.isInteger(valor) ||
    valor < minimo ||
    valor > maximo
  )
    erro(campo, `esperado inteiro entre ${minimo} e ${maximo}`);
  return valor;
}

function booleano(valor: unknown, campo: string): boolean {
  if (typeof valor !== "boolean") erro(campo, "esperado booleano");
  return valor;
}

function lista<T>(valor: readonly T[], campo: string, limite: number): T[] {
  if (!Array.isArray(valor)) erro(campo, "esperada lista");
  if (valor.length > limite) erro(campo, `lista excede ${limite} entradas`);
  const resultado: T[] = [];
  for (let i = 0; i < valor.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(valor, i))
      erro(campo, `lista com buraco no índice ${i}`);
    if (valor[i] === undefined || valor[i] === null)
      erro(campo, `entrada ausente no índice ${i}`);
    resultado.push(valor[i]);
  }
  return resultado;
}

function unico<T>(
  valores: T[],
  campo: string,
  chave: (valor: T) => string,
): T[] {
  const vistos = new Set<string>();
  for (const valor of valores) {
    const id = chave(valor);
    if (vistos.has(id)) erro(campo, `entrada repetida: ${id}`);
    vistos.add(id);
  }
  return valores;
}

function atributo(valor: unknown, campo: string): AttributeKey {
  if (
    typeof valor !== "string" ||
    !(ATRIBUTOS as readonly string[]).includes(valor)
  )
    erro(campo, "atributo desconhecido");
  return valor as AttributeKey;
}

function atributos(
  origem: Record<AttributeKey, number>,
  campo: string,
): Attributes {
  return Object.fromEntries(
    ATRIBUTOS.map((chave) => [
      chave,
      inteiro(origem[chave], `${campo}.${chave}`, -20, 50),
    ]),
  ) as Attributes;
}

function segmento(valor: string): string {
  texto(valor, "Segmento de ID", 256, 1);
  return encodeURIComponent(valor).replace(
    /[!'()*]/g,
    (ch) => "%" + ch.charCodeAt(0).toString(16).toUpperCase(),
  );
}

function idDe(kind: string, ...partes: string[]): string {
  const id = [kind, ...partes.map(segmento)].join("/");
  return texto(id, "ID de catálogo", 256, 1);
}

function objeto(valor: unknown, campo: string): Record<string, unknown> {
  if (!valor || typeof valor !== "object" || Array.isArray(valor))
    erro(campo, "esperado objeto");
  const proto = Object.getPrototypeOf(valor);
  if (proto !== Object.prototype && proto !== null)
    erro(campo, "esperado objeto simples");
  return valor as Record<string, unknown>;
}

/**
 * SUBTABLES pode expor a lista diretamente ou um objeto com entries.
 * Nenhuma busca global por nome: a tabela é sempre a requerida pelo
 * antecedente. Se a fonte usar outra estrutura, recusa em vez de adivinhar.
 */
function entradasDaSubtabela(id: string): { id: string }[] {
  const tabelas = SUBTABLES as unknown as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(tabelas, id))
    erro("Subtabela", `tabela desconhecida: ${id}`);
  const tabela = tabelas[id];
  const entradas = Array.isArray(tabela)
    ? tabela
    : objeto(tabela, "Subtabela").entries;
  if (!Array.isArray(entradas))
    erro("Subtabela", "a fonte não expõe uma lista entries");
  return entradas.map((entrada, index) => {
    const dados = objeto(entrada, `Subtabela[${index}]`);
    return { id: texto(dados.id, "ID da subentrada", 256, 1) };
  });
}

function overridesDaFicha(ficha: CharacterData): OverridesFichaV2 {
  const origem = objeto(ficha.overrides, "Overrides");
  const permitidos = new Set([
    "maxHp",
    "maxMp",
    "maxPt",
    "maxPp",
    "armorClass",
    "initiative",
    "guildRank",
  ]);
  for (const chave of Object.keys(origem))
    if (!permitidos.has(chave))
      erro("Overrides", `campo desconhecido: ${chave}`);

  const resultado: OverridesFichaV2 = {};
  for (const chave of ["maxHp", "maxMp", "maxPt", "maxPp"] as const)
    if (origem[chave] !== undefined)
      resultado[chave] = inteiro(origem[chave], `Overrides.${chave}`, 0, 9999);
  if (origem.armorClass !== undefined)
    resultado.armorClass = inteiro(origem.armorClass, "Overrides.armorClass", 0, 99);
  if (origem.initiative !== undefined)
    resultado.initiative = inteiro(origem.initiative, "Overrides.initiative", -50, 50);
  if (origem.guildRank !== undefined) {
    resultado.guildRank = texto(
      origem.guildRank,
      "Overrides.guildRank",
      32,
      1,
      32,
    ) as NonNullable<CharacterData["overrides"]["guildRank"]>;
  }
  return resultado;
}

function inventarioDaFicha(ficha: CharacterData): InventarioFichaV2[] {
  const entradas = lista(ficha.inventory, "Inventário", 256).map((item, index) => {
    const campo = `Inventário[${index}]`;
    const sourceLocalId = texto(item.id, `${campo}.id`, 128, 1);
    if (!["arma", "armadura", "geral"].includes(item.type))
      erro(campo, "tipo desconhecido");
    const resultado: InventarioFichaV2 = {
      sourceLocalId,
      name: texto(item.name, `${campo}.name`, 256, 1, 128),
      type: item.type,
      equipped: booleano(item.equipped, `${campo}.equipped`),
    };
    if (item.description !== undefined)
      resultado.description = texto(item.description, `${campo}.description`, 2048);
    if (item.acBonus !== undefined)
      resultado.armorClassBonus = inteiro(item.acBonus, `${campo}.acBonus`, -99, 99);
    if (item.baseDie !== undefined)
      resultado.baseDie = texto(item.baseDie, `${campo}.baseDie`, 256, 1);
    if (item.damageAttribute !== undefined)
      resultado.damageAttribute = atributo(item.damageAttribute, `${campo}.damageAttribute`);
    if (item.tratamentosUsados !== undefined)
      resultado.treatmentsUsed = inteiro(
        item.tratamentosUsados,
        `${campo}.tratamentosUsados`,
        0,
        9999,
      );
    return resultado;
  });
  return unico(entradas, "Inventário", (entrada) => entrada.sourceLocalId);
}

/**
 * O total e o treinamento vêm do objeto BonusDePericia retornado pelo site.
 */
function periciasCalculadas(
  ficha: CharacterData,
): FichaV2["calculated"]["skills"] {
  return Object.entries(PERICIAS).map(([nome, id]) => {
    const bonus = getBonusDePericia(ficha, nome);
    if (bonus === null)
      erro(
        `Perícia ${nome}`,
        "registro de exportação não corresponde à Lista Mestre do site",
      );
    return {
      skillId: idDe("skill", id),
      bonus: inteiro(bonus.total, `Bônus de ${nome}`, -9999, 9999),
      trained: booleano(bonus.treinada, `Treinamento de ${nome}`),
    };
  });
}

function validarJson(valor: unknown): void {
  let nos = 0;
  const ancestrais = new Set<object>();

  function visitar(atual: unknown, profundidade: number, caminho: string): void {
    nos++;
    if (nos > NOS_MAX) erro("Envelope", `excede ${NOS_MAX} nós`);
    if (atual === null || atual === undefined)
      erro(caminho, "null/undefined não é aceito");
    if (typeof atual === "string") {
      unicodeValido(atual, caminho);
      return;
    }
    if (typeof atual === "number") {
      if (!Number.isFinite(atual)) erro(caminho, "número não finito");
      return;
    }
    if (typeof atual === "boolean") return;
    if (typeof atual !== "object")
      erro(caminho, `tipo não JSON: ${typeof atual}`);

    const nivel = profundidade + 1;
    if (nivel > PROFUNDIDADE_MAX)
      erro(caminho, `excede ${PROFUNDIDADE_MAX} contêineres de profundidade`);
    if (ancestrais.has(atual)) erro(caminho, "referência circular");
    ancestrais.add(atual);
    if (Object.getOwnPropertySymbols(atual).length)
      erro(caminho, "chaves Symbol não são aceitas");

    if (Array.isArray(atual)) {
      const chaves = Object.keys(atual);
      if (chaves.length !== atual.length)
        erro(caminho, "lista com buracos ou propriedades adicionais");
      for (let i = 0; i < atual.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(atual, i))
          erro(caminho, "lista com buraco");
        visitar(atual[i], nivel, `${caminho}[${i}]`);
      }
    } else {
      const dados = objeto(atual, caminho);
      for (const [chave, filho] of Object.entries(dados)) {
        unicodeValido(chave, `${caminho}: chave`);
        visitar(filho, nivel, `${caminho}.${chave}`);
      }
    }
    ancestrais.delete(atual);
  }

  visitar(valor, 0, "Envelope");
}

function serializar(envelope: FichaV2): string {
  validarJson(envelope);
  const json = JSON.stringify(envelope);
  if (bytes(json) > FICHA_V2_BYTES_MAX)
    erro("Envelope", `excede ${FICHA_V2_BYTES_MAX} bytes UTF-8`);
  return json;
}

/**
 * Pura: usa os seletores do site e não modifica a ficha.
 * Ausências historicamente toleradas recebem os mesmos padrões do site.
 * Referência desconhecida é omitida com aviso; dado estrutural/número
 * inválido, arquivo legado não representável ou limite excedido é erro.
 */
export function exportarFichaV2(
  origem: CharacterData,
): { envelope: FichaV2; avisos: string[] } {
  const ficha = normalizarAusencias(origem);
  const avisos: string[] = [];
  const omissoes: string[] = [];
  const avisar = (mensagem: string) => {
    if (!avisos.includes(mensagem)) avisos.push(mensagem);
  };
  const omitir = (campo: string, valor: string) => {
    const mensagem = `${campo}: referência não resolvida "${valor}"; omitida`;
    omissoes.push(mensagem);
    avisar(mensagem);
  };

  const sourceCharacterId = texto(ficha.id, "ID local da ficha", 128, 1);
  const name = texto(ficha.name.trim(), "Nome", 128, 1, 32);

  if (
    ficha.legacyBarreira &&
    (ficha.legacyBarreira.purchases.length !== 0 ||
      ficha.legacyBarreira.refundedPa !== 0)
  )
    erro(
      "legacyBarreira",
      "arquivo legado com conteúdo exige um adaptador específico; não será descartado",
    );

  const race = RACES.find((entrada) => entrada.id === ficha.raceId);
  const background = BACKGROUNDS.find((entrada) => entrada.id === ficha.backgroundId);
  const startingTree = TREES.find((entrada) => entrada.id === ficha.startingTreeId);

  if (ficha.raceId !== null) {
    texto(ficha.raceId, "Raça", 256, 1);
    if (!race) omitir("Raça", ficha.raceId);
  }
  if (ficha.backgroundId !== null) {
    texto(ficha.backgroundId, "Antecedente", 256, 1);
    if (!background) omitir("Antecedente", ficha.backgroundId);
  }
  if (ficha.startingTreeId !== null) {
    texto(ficha.startingTreeId, "Árvore inicial", 256, 1);
    if (!startingTree) omitir("Árvore inicial", ficha.startingTreeId);
  }

  let subtableEntryId: string | undefined;
  if (ficha.subtableEntryId !== null) {
    const localId = texto(ficha.subtableEntryId, "Subentrada", 256, 1);
    const subtableId = background?.requiresSubtable;
    if (
      subtableId &&
      entradasDaSubtabela(subtableId).some((entrada) => entrada.id === localId)
    )
      subtableEntryId = idDe("subtable-entry", subtableId, localId);
    else omitir("Subentrada", localId);
  }

  const racialUpgradeIds: string[] = [];
  for (const localId of unico(
    lista(ficha.racialUpgrades, "Aprimoramentos raciais", 256),
    "Aprimoramentos raciais",
    (id) => texto(id, "Aprimoramento racial", 256, 1),
  )) {
    if (race?.upgrades?.some((entrada) => entrada.id === localId))
      racialUpgradeIds.push(idDe("race-upgrade", race.id, localId));
    else omitir("Aprimoramento racial", localId);
  }

  const unlockedRankIds: string[] = [];
  for (const entrada of lista(ficha.unlockedRanks, "Ranks", 512)) {
    const treeId = texto(entrada.treeId, "Rank.treeId", 256, 1);
    const rank = texto(entrada.rank, "Rank.rank", 256, 1);
    const tree = TREES.find((item) => item.id === treeId);
    if (tree?.ranks.some((item) => item.rank === rank))
      unlockedRankIds.push(idDe("rank", treeId, rank));
    else omitir("Rank", `${treeId}/${rank}`);
  }
  unico(unlockedRankIds, "Ranks", (id) => id);

  const arvoresDaConstrucao = new Set<string>(
    ficha.unlockedRanks.map((entrada) => entrada.treeId),
  );
  if (ficha.startingTreeId !== null) arvoresDaConstrucao.add(ficha.startingTreeId);
  if (arvoresDaConstrucao.size > 64) erro("Árvores", "excede 64 entradas");

  const purchasedIds: string[] = [];
  for (const compra of lista(ficha.purchasedAbilities, "Compras", 1024)) {
    const treeId = texto(compra.treeId, "Compra.treeId", 256, 1);
    const rank = texto(compra.rank, "Compra.rank", 256, 1);
    const localId = texto(compra.id, "Compra.id", 256, 1);
    if (compra.kind !== "ability" && compra.kind !== "talent")
      erro("Compra.kind", "espécie desconhecida");
    const tree = TREES.find((entrada) => entrada.id === treeId);
    const definicaoRank = tree?.ranks.find((entrada) => entrada.rank === rank);
    const definicoes =
      compra.kind === "ability"
        ? definicaoRank?.abilities
        : definicaoRank?.talents;
    if (definicoes?.some((entrada) => entrada.id === localId))
      purchasedIds.push(idDe(compra.kind, treeId, rank, localId));
    else omitir("Compra", `${compra.kind}/${treeId}/${rank}/${localId}`);
  }
  unico(purchasedIds, "Compras", (id) => id);

  const combinedSpellIds: string[] = [];
  for (const localId of unico(
    lista(ficha.purchasedCombinedSpells, "Magias combinadas", 256),
    "Magias combinadas",
    (id) => texto(id, "Magia combinada", 256, 1),
  )) {
    if (COMBINED_SPELLS.some((entrada) => entrada.id === localId))
      combinedSpellIds.push(idDe("combined-spell", localId));
    else omitir("Magia combinada", localId);
  }

  function periciasDaLista(valores: string[], campo: string): string[] {
    const resultado: string[] = [];
    for (const nome of unico(
      lista(valores, campo, 256),
      campo,
      (valor) => texto(valor, campo, 256, 1),
    )) {
      if (Object.prototype.hasOwnProperty.call(PERICIAS, nome))
        resultado.push(idDe("skill", PERICIAS[nome]));
      else omitir(campo, nome);
    }
    return resultado;
  }

  const weaponGroupIds: string[] = [];
  for (const localId of unico(
    lista(ficha.weaponGroupChoices, "Grupos de arma", 256),
    "Grupos de arma",
    (id) => texto(id, "Grupo de arma", 256, 1),
  )) {
    if (WEAPON_GROUPS.some((entrada) => entrada.id === localId))
      weaponGroupIds.push(idDe("weapon-group", localId));
    else omitir("Grupo de arma", localId);
  }

  const construction: FichaV2["construction"] = {
    ...(race ? { raceId: idDe("race", race.id) } : {}),
    raceChosen:
      ficha.racaEscolhida === undefined
        ? false
        : booleano(ficha.racaEscolhida, "Raça escolhida"),
    ...(background ? { backgroundId: idDe("background", background.id) } : {}),
    backgroundChosen:
      ficha.antecedenteEscolhido === undefined
        ? false
        : booleano(ficha.antecedenteEscolhido, "Antecedente escolhido"),
    ...(subtableEntryId ? { subtableEntryId } : {}),
    attributeBase: atributos(ficha.attributeBase, "Atributos base"),
    raceAttributeChoices: lista(
      ficha.raceAttributeChoices,
      "Escolhas de atributo racial",
      256,
    ).map((valor) => atributo(valor, "Escolha de atributo racial")),
    racialUpgradeIds,
    saveAdvantages: unico(
      lista(ficha.saveAdvantages, "Vantagens de resistência", 256).map((valor) =>
        atributo(valor, "Vantagem de resistência"),
      ),
      "Vantagens de resistência",
      (valor) => valor,
    ),
    ...(startingTree ? { startingTreeId: idDe("tree", startingTree.id) } : {}),
    unlockedRankIds,
    purchasedIds,
    combinedSpellIds,
    skillIds: periciasDaLista(ficha.skills, "Perícias compradas"),
    treeSkillChoiceIds: periciasDaLista(ficha.treeSkillChoices, "Perícias da árvore"),
    proficiencyTexts: unico(
      lista(ficha.proficiencies, "Proficiências livres", 256).map((valor) =>
        texto(valor, "Proficiência livre", 256, 1, 128),
      ),
      "Proficiências livres",
      (valor) => valor,
    ),
    weaponGroupIds,
    bonusHp: inteiro(ficha.bonusHp, "Bônus de PV", 0, 9999),
    bonusMp: inteiro(ficha.bonusMp, "Bônus de PM", 0, 9999),
    gold: inteiro(ficha.gold, "Ouro", 0, 1_000_000_000),
    inventory: inventarioDaFicha(ficha),
    overrides: overridesDaFicha(ficha),
  };

  // Os recursos ausentes já são null; números presentes inválidos não
  // podem ser escondidos por um seletor que reduza o atual ao máximo.
  for (const [campo, valor] of [
    ["PV atual", ficha.currentHp],
    ["PM atual", ficha.currentMp],
    ["PT atual", ficha.currentPt],
    ["PP atual", ficha.currentPp],
  ] as const)
    if (valor !== null) inteiro(valor, campo, 0, 9999);

  const maxima = {
    pv: inteiro(getPvNaMesa(ficha), "PV máximo", 0, 9999),
    pm: inteiro(getMaxMp(ficha), "PM máximo", 0, 9999),
    pt: inteiro(getPtPool(ficha), "PT máximo", 0, 9999),
    pp: inteiro(getPpPool(ficha), "PP máximo", 0, 9999),
  };

  const atuais = {
    pv: inteiro(hpAtualNaMesa(ficha), "PV atual calculado", 0, 9999),
    pm: inteiro(getCurrentMp(ficha), "PM atual calculado", 0, 9999),
    pt: inteiro(getCurrentPt(ficha), "PT atual calculado", 0, 9999),
    pp: inteiro(getCurrentPp(ficha), "PP atual calculado", 0, 9999),
  };
  for (const chave of ["pv", "pm", "pt", "pp"] as const) {
    const cru = {
      pv: ficha.currentHp,
      pm: ficha.currentMp,
      pt: ficha.currentPt,
      pp: ficha.currentPp,
    }[chave];
    if (atuais[chave] > maxima[chave] || (cru !== null && cru > maxima[chave]))
      avisar(`${chave.toUpperCase()} atual acima do máximo; exportado como ${maxima[chave]}`);
    atuais[chave] = Math.min(atuais[chave], maxima[chave]);
  }

  const movimentoBruto = getDeslocamento(ficha);
  if (
    !Number.isFinite(movimentoBruto) ||
    movimentoBruto < 0 ||
    movimentoBruto > 999
  )
    erro("Deslocamento", "fora de 0–999 metros");
  const movementMeters = Math.round(movimentoBruto * 10) / 10;
  if (movementMeters !== movimentoBruto)
    avisar(`Deslocamento arredondado de ${movimentoBruto} para ${movementMeters} metros`);

  const initiative = getInitiative(ficha);
  const calculated: FichaV2["calculated"] = {
    attributes: atributos(getFinalAttributes(ficha), "Atributos calculados"),
    maxima,
    armorClass: inteiro(getArmorClass(ficha), "CA", 0, 99),
    movementMeters,
    initiative: {
      bonus: inteiro(initiative.bonus, "Iniciativa", -50, 50),
      advantage: booleano(initiative.hasAdvantage, "Vantagem de iniciativa"),
    },
    highestRankBonus: inteiro(getMaiorBonusDeRank(ficha), "Maior bônus de Rank", 0, 12),
    skills: periciasCalculadas(ficha),
    actionContexts: [],
    paSpent: inteiro(getPaSpent(ficha), "PA gasto", 0, 1_000_000_000),
  };

  const condicoesOriginais = lista(ficha.condicoes ?? [], "Condições", 12);
  unico(condicoesOriginais, "Condições", (condicao) =>
    texto(condicao.id, "Condição.id", 256, 1),
  );
  for (const condicao of condicoesOriginais) {
    inteiro(condicao.acumulos ?? 1, "Acúmulos de condição", 1, 12);
    if (condicao.nota !== undefined)
      texto(condicao.nota, "Nota de condição", 240, 0, 60);
    if (condicao.bonusDeRankDaFonte !== undefined)
      inteiro(condicao.bonusDeRankDaFonte, "Bônus de Rank da fonte", 0, 12);
  }

  const ativas = getCondicoesAtivas(ficha);
  const idsAtivos = new Set(ativas.map((entrada) => entrada.condicao.id));
  for (const condicao of condicoesOriginais)
    if (!idsAtivos.has(condicao.id))
      omitir("Condição", condicao.id);

  const conditions: CondicaoFichaV2[] = ativas.map((entrada) => ({
    conditionId: idDe("condition", entrada.condicao.id),
    stacks: inteiro(entrada.acumulos, "Acúmulos de condição", 1, 12),
    ...(entrada.nota !== undefined
      ? { note: texto(entrada.nota, "Nota de condição", 240, 0, 60) }
      : {}),
    ...(entrada.bonusDeRankDaFonte !== undefined
      ? {
          sourceRankBonus: inteiro(
            entrada.bonusDeRankDaFonte,
            "Bônus de Rank da fonte",
            0,
            12,
          ),
        }
      : {}),
  }));

  avisar("Contextos de ação não são exportados nesta versão; devem ser calculados pelo executor");
  if (ficha.inventory.length)
    avisar("Inventário por valor: textos e modificações declarados pelo jogador, sujeitos à aprovação");
  if (ficha.proficiencies.length)
    avisar("Proficiências livres são texto do jogador, não referências de perícia");
  if (ficha.mesa !== undefined)
    avisar("Marcadores mesa.* não são exportados; a importação não pode apagar o estado existente");
  if (Object.keys(construction.overrides).length)
    avisar("Overrides são declarações de mesa e exigem aprovação explícita");

  const envelope: FichaV2 = {
    mesa: 2,
    envelopeVersion: FICHA_V2_ENVELOPE_VERSION,
    exporterVersion: FICHA_V2_EXPORTADOR,
    compatibility: "master-approved-snapshot",
    sourceCharacterId,
    name,
    constructionComplete: omissoes.length === 0,
    omissions: [...omissoes],
    warnings: [...avisos],
    construction,
    calculated,
    session: {
      current: atuais,
      conditions,
      shortRests: inteiro(ficha.descansosCurtos, "Descansos curtos", 0, 2),
      manualEffects: [],
    },
  };

  serializar(envelope);
  return { envelope, avisos: [...avisos] };
}

/**
 * Valida representabilidade JSON e limites estruturais/de transporte.
 * Não substitui a validação completa do schema e de referências no Roblox.
 */
export function codificarPartes(envelope: FichaV2): string[] {
  const json = serializar(envelope);
  const partes: string[] = [];
  let parte = "";
  let tamanho = 0;

  for (const ponto of json) {
    const quantidade = bytes(ponto);
    if (tamanho + quantidade > FICHA_V2_PARTE_BYTES_MAX) {
      partes.push(parte);
      parte = "";
      tamanho = 0;
    }
    parte += ponto;
    tamanho += quantidade;
  }
  if (parte) partes.push(parte);
  if (partes.length === 0 || partes.length > FICHA_V2_PARTES_MAX)
    erro("Transporte", `quantidade de partes fora de 1–${FICHA_V2_PARTES_MAX}`);
  return partes;
}
