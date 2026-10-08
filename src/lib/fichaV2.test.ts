import { beforeEach, describe, expect, it } from "vitest";
import { useCharacterStore } from "@/store/useCharacterStore";
import { TREES } from "@/data/trees";
import {
  getArmorClass,
  getBonusDePericia,
  getCurrentMp,
  getCurrentPp,
  getCurrentPt,
  getDeslocamento,
  getFinalAttribute,
  getInitiative,
  getMaiorBonusDeRank,
  getMaxMp,
  getPaSpent,
  getPericiasTreinadas,
  getPpPool,
  getPtPool,
} from "@/store/selectors";
import { getPvNaMesa, hpAtualNaMesa } from "./mesa";
import type { CharacterData } from "./types";
import {
  codificarPartes,
  exportarFichaV2,
  FICHA_V2_BYTES_MAX,
  FICHA_V2_ENVELOPE_VERSION,
  FICHA_V2_EXPORTADOR,
  FICHA_V2_PARTE_BYTES_MAX,
} from "./fichaV2";

function ficha(): CharacterData {
  const estado = useCharacterStore.getState();
  return estado.characters[estado.activeId!];
}

const bytes = (texto: string) => new TextEncoder().encode(texto).length;

/**
 * Campos que arquivos antigos podem omitir e que o site lê com ?? padrão.
 * skills, overrides, attributeBase, bonusHp/bonusMp e gold não entram:
 * não foi demonstrado um padrão para eles.
 */
const LISTAS_LEGADAS = [
  "racialUpgrades",
  "purchasedCombinedSpells",
  "weaponGroupChoices",
  "treeSkillChoices",
  "saveAdvantages",
  "raceAttributeChoices",
  "purchasedAbilities",
  "proficiencies",
  "unlockedRanks",
  "inventory",
  "condicoes",
] as const;

const RECURSOS_LEGADOS = [
  "currentHp",
  "currentMp",
  "currentPt",
  "currentPp",
] as const;

function comPadroesLegados(c: CharacterData): CharacterData {
  return {
    ...c,
    lore: "",
    racialUpgrades: [],
    purchasedCombinedSpells: [],
    weaponGroupChoices: [],
    treeSkillChoices: [],
    saveAdvantages: [],
    raceAttributeChoices: [],
    purchasedAbilities: [],
    proficiencies: [],
    unlockedRanks: [],
    inventory: [],
    condicoes: [],
    descansosCurtos: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
  };
}

beforeEach(() => {
  useCharacterStore.setState({
    characters: {},
    order: [],
    activeId: null,
    history: {},
  });
  useCharacterStore.getState().createCharacter("Aria");
  useCharacterStore.getState().setStartingTree("agua");
});

describe("ficha v2 para a mesa Roblox", () => {
  it("declara uma foto aprovada pelo mestre, sem simular versão do catálogo", () => {
    const { envelope, avisos } = exportarFichaV2(ficha());
    expect(envelope.mesa).toBe(2);
    expect(envelope.envelopeVersion).toBe(FICHA_V2_ENVELOPE_VERSION);
    expect(envelope.exporterVersion).toBe(FICHA_V2_EXPORTADOR);
    expect(envelope.compatibility).toBe("master-approved-snapshot");
    expect(envelope).not.toHaveProperty("catalog");
    expect(envelope).not.toHaveProperty("calculationsVersion");
    expect(envelope.warnings).toEqual(avisos);
    expect(envelope.calculated.actionContexts).toEqual([]);
  });

  it("exporta ficha legada com os campos opcionais na prática removidos", () => {
    const base = ficha();
    const legada: CharacterData = { ...base };
    const dados = legada as unknown as Record<string, unknown>;

    for (const campo of [
      ...LISTAS_LEGADAS,
      ...RECURSOS_LEGADOS,
      "descansosCurtos",
      "lore",
    ])
      delete dados[campo];

    const chavesAntes = Object.keys(legada);
    const textoAntes = JSON.stringify(legada);
    const exportada = exportarFichaV2(legada);
    const esperada = exportarFichaV2(comPadroesLegados(base));

    expect(exportada).toEqual(esperada);
    expect(exportada.envelope.construction.weaponGroupIds).toEqual([]);
    expect(exportada.envelope.construction.unlockedRankIds).toEqual([]);
    expect(exportada.envelope.construction.purchasedIds).toEqual([]);
    expect(exportada.envelope.construction.inventory).toEqual([]);
    expect(exportada.envelope.session.conditions).toEqual([]);
    expect(exportada.envelope.session.shortRests).toBe(0);
    expect(exportada.envelope.session.current).toEqual(
      exportada.envelope.calculated.maxima,
    );
    expect(Object.keys(legada)).toEqual(chavesAntes);
    expect(JSON.stringify(legada)).toBe(textoAntes);
    expect(Object.prototype.hasOwnProperty.call(legada, "weaponGroupChoices"))
      .toBe(false);
    expect(codificarPartes(exportada.envelope).join(""))
      .toBe(JSON.stringify(exportada.envelope));
  });

  it("usa os mesmos padrões nullish quando listas legadas vêm como null", () => {
    const base = ficha();
    const legada: CharacterData = { ...base };
    const dados = legada as unknown as Record<string, unknown>;

    for (const campo of [
      ...LISTAS_LEGADAS,
      ...RECURSOS_LEGADOS,
      "descansosCurtos",
      "lore",
    ])
      dados[campo] = null;

    expect(exportarFichaV2(legada)).toEqual(
      exportarFichaV2(comPadroesLegados(base)),
    );
    expect(dados.weaponGroupChoices).toBeNull();
    expect(dados.currentMp).toBeNull();
  });

  it("tolera apenas weaponGroupChoices ausente sem alterar os demais dados", () => {
    const c = ficha();
    const legada: CharacterData = { ...c };
    delete (legada as unknown as Record<string, unknown>).weaponGroupChoices;

    expect(exportarFichaV2(legada)).toEqual(
      exportarFichaV2({ ...c, weaponGroupChoices: [] }),
    );
  });

  it("não transforma valores presentes inválidos em listas vazias", () => {
    const c: CharacterData = { ...ficha() };
    (c as unknown as Record<string, unknown>).weaponGroupChoices = "espadas";
    expect(() => exportarFichaV2(c)).toThrow(/Grupos de arma.*esperada lista/);

    const outra: CharacterData = { ...ficha() };
    (outra as unknown as Record<string, unknown>).racialUpgrades = 7;
    expect(() => exportarFichaV2(outra))
      .toThrow(/Aprimoramentos raciais.*esperada lista/);
  });

  it("tolera purchases ausente em um recibo legado vazio, sem descartar conteúdo", () => {
    const c: CharacterData = {
      ...ficha(),
      legacyBarreira: { purchases: [], refundedPa: 0 },
    };
    delete (
      c.legacyBarreira as unknown as Record<string, unknown>
    ).purchases;

    expect(exportarFichaV2(c)).toEqual(exportarFichaV2(ficha()));
    expect(Object.prototype.hasOwnProperty.call(c.legacyBarreira, "purchases"))
      .toBe(false);

    const comReembolso: CharacterData = {
      ...ficha(),
      legacyBarreira: { purchases: [], refundedPa: 1 },
    };
    delete (
      comReembolso.legacyBarreira as unknown as Record<string, unknown>
    ).purchases;
    expect(() => exportarFichaV2(comReembolso)).toThrow(/legacyBarreira/);
  });

  it("usa os mesmos seletores de PV, recursos e atributos do site", () => {
    const c = ficha();
    const { envelope } = exportarFichaV2(c);
    const calculados = envelope.calculated;

    expect(calculados.maxima).toEqual({
      pv: getPvNaMesa(c),
      pm: getMaxMp(c),
      pt: getPtPool(c),
      pp: getPpPool(c),
    });
    expect(envelope.session.current).toEqual({
      pv: Math.min(hpAtualNaMesa(c), getPvNaMesa(c)),
      pm: Math.min(getCurrentMp(c), getMaxMp(c)),
      pt: Math.min(getCurrentPt(c), getPtPool(c)),
      pp: Math.min(getCurrentPp(c), getPpPool(c)),
    });
    for (const chave of [
      "forca",
      "agilidade",
      "vigor",
      "intelecto",
      "espirito",
    ] as const)
      expect(calculados.attributes[chave]).toBe(getFinalAttribute(c, chave));

    expect(calculados.armorClass).toBe(getArmorClass(c));
    expect(calculados.movementMeters).toBe(
      Math.round(getDeslocamento(c) * 10) / 10,
    );
    expect(calculados.initiative).toEqual({
      bonus: getInitiative(c).bonus,
      advantage: getInitiative(c).hasAdvantage,
    });
    expect(calculados.highestRankBonus).toBe(getMaiorBonusDeRank(c));
    expect(calculados.paSpent).toBe(getPaSpent(c));

    const medicina = getBonusDePericia(c, "Medicina");
    expect(medicina).not.toBeNull();
    expect(
      calculados.skills.find((entrada) => entrada.skillId === "skill/medicina"),
    ).toEqual({
      skillId: "skill/medicina",
      bonus: medicina!.total,
      trained: medicina!.treinada,
    });
  });

  it("exporta total e treinada dos objetos BonusDePericia", () => {
    const c: CharacterData = {
      ...ficha(),
      skills: ["História", "Medicina"],
      treeSkillChoices: ["Lidar com Animais"],
    };
    const { envelope } = exportarFichaV2(c);

    for (const [nome, id] of [
      ["História", "skill/historia"],
      ["Medicina", "skill/medicina"],
      ["Atletismo", "skill/atletismo"],
      ["Lidar com Animais", "skill/lidar-com-animais"],
    ]) {
      const esperado = getBonusDePericia(c, nome);
      expect(esperado).not.toBeNull();
      const exportada = envelope.calculated.skills.find(
        (entrada) => entrada.skillId === id,
      );
      expect(exportada).toEqual({
        skillId: id,
        bonus: esperado!.total,
        trained: esperado!.treinada,
      });
      expect(typeof exportada!.bonus).toBe("number");
      expect(typeof exportada!.trained).toBe("boolean");
    }

    expect(
      envelope.calculated.skills.find(
        (entrada) => entrada.skillId === "skill/medicina",
      )!.trained,
    ).toBe(true);
    expect(
      envelope.calculated.skills.find(
        (entrada) => entrada.skillId === "skill/atletismo",
      )!.trained,
    ).toBe(false);

    const idsTreinados = new Map([
      ["História", "skill/historia"],
      ["Medicina", "skill/medicina"],
    ]);
    for (const pericia of getPericiasTreinadas(c)) {
      const id = idsTreinados.get(pericia.nome);
      expect(id).toBeDefined();
      expect(
        envelope.calculated.skills.find((entrada) => entrada.skillId === id),
      ).toEqual({
        skillId: id,
        bonus: pericia.total,
        trained: pericia.treinada,
      });
    }
  });

  it("forma IDs de compra com árvore, rank e espécie", () => {
    const tree = TREES.find((entrada) => entrada.id === "agua")!;
    const rank = tree.ranks.find((entrada) => entrada.abilities.length > 0)!;
    const ability = rank.abilities[0];
    const c: CharacterData = {
      ...ficha(),
      purchasedAbilities: [{
        treeId: tree.id,
        rank: rank.rank,
        kind: "ability",
        id: ability.id,
      }],
    };
    const { envelope } = exportarFichaV2(c);
    expect(envelope.construction.purchasedIds).toEqual([
      `ability/${tree.id}/${encodeURIComponent(rank.rank)}/${ability.id}`,
    ]);
    expect(envelope.construction.startingTreeId).toBe("tree/agua");
  });

  it("resolve perícias pelo registro e preserva proficiências como texto", () => {
    const { envelope } = exportarFichaV2({
      ...ficha(),
      skills: ["História", "Medicina"],
      treeSkillChoices: ["Lidar com Animais"],
      proficiencies: ["Idioma dracônico", "Ferramentas de carpinteiro"],
    });
    expect(envelope.construction.skillIds).toEqual([
      "skill/historia",
      "skill/medicina",
    ]);
    expect(envelope.construction.treeSkillChoiceIds).toEqual([
      "skill/lidar-com-animais",
    ]);
    expect(envelope.construction.proficiencyTexts).toEqual([
      "Idioma dracônico",
      "Ferramentas de carpinteiro",
    ]);
  });

  it("não inventa referências e faz a omissão viajar no envelope", () => {
    const { envelope, avisos } = exportarFichaV2({
      ...ficha(),
      skills: ["Perícia que não existe"],
      purchasedAbilities: [{
        treeId: "agua",
        rank: ficha().unlockedRanks[0].rank,
        kind: "ability",
        id: "habilidade-inexistente",
      }],
    });
    expect(envelope.constructionComplete).toBe(false);
    expect(envelope.construction.skillIds).toEqual([]);
    expect(envelope.construction.purchasedIds).toEqual([]);
    expect(envelope.omissions.some((mensagem) =>
      mensagem.includes("habilidade-inexistente"),
    )).toBe(true);
    expect(avisos.some((mensagem) =>
      mensagem.includes("Perícia que não existe"),
    )).toBe(true);
    expect(envelope.warnings).toEqual(avisos);
  });

  it("preserva inventário por valor sem transformar id local em item de catálogo", () => {
    const { envelope } = exportarFichaV2({
      ...ficha(),
      inventory: [{
        id: "instancia-local-123",
        name: "Espada do avô",
        type: "arma",
        description: "Gravada com uma promessa.",
        baseDie: "d6",
        damageAttribute: "forca",
        equipped: true,
        tratamentosUsados: 2,
      }],
    });
    expect(envelope.construction.inventory).toEqual([{
      sourceLocalId: "instancia-local-123",
      name: "Espada do avô",
      type: "arma",
      description: "Gravada com uma promessa.",
      baseDie: "d6",
      damageAttribute: "forca",
      equipped: true,
      treatmentsUsed: 2,
    }]);
    expect(JSON.stringify(envelope.construction.inventory)).not.toContain("item/");
  });

  it("recusa inventário com id local repetido", () => {
    const item = {
      id: "mesmo-id",
      name: "Pedra",
      type: "geral" as const,
      equipped: false,
    };
    expect(() => exportarFichaV2({
      ...ficha(),
      inventory: [item, { ...item }],
    })).toThrow(/Inventário.*repetida/);
  });

  it("preserva nota e bônus da fonte nas condições conhecidas", () => {
    const { envelope } = exportarFichaV2({
      ...ficha(),
      condicoes: [{
        id: "quebrantado",
        acumulos: 2,
        nota: "Aplicado pelo guardião",
        bonusDeRankDaFonte: 3,
      }],
    });
    expect(envelope.session.conditions).toEqual([{
      conditionId: "condition/quebrantado",
      stacks: 2,
      note: "Aplicado pelo guardião",
      sourceRankBonus: 3,
    }]);
  });

  it("omite condição desconhecida com aviso explícito", () => {
    const { envelope } = exportarFichaV2({
      ...ficha(),
      condicoes: [{ id: "condicao-inexistente" }],
    });
    expect(envelope.session.conditions).toEqual([]);
    expect(envelope.omissions.some((mensagem) =>
      mensagem.includes("condicao-inexistente"),
    )).toBe(true);
  });

  it("recusa notas longas, números inválidos e atuais negativos antes dos seletores", () => {
    expect(() => exportarFichaV2({
      ...ficha(),
      currentMp: Number.NaN,
    })).toThrow(/PM atual/);
    expect(() => exportarFichaV2({
      ...ficha(),
      currentHp: Number.POSITIVE_INFINITY,
    })).toThrow(/PV atual/);
    expect(() => exportarFichaV2({
      ...ficha(),
      currentHp: -3,
    })).toThrow(/PV atual/);
    expect(() => exportarFichaV2({
      ...ficha(),
      condicoes: [{ id: "quebrantado", nota: "x".repeat(61) }],
    })).toThrow(/Nota de condição/);
  });

  it("reduz atuais acima dos máximos com aviso, sem cortar valores de construção", () => {
    const c = ficha();
    const { envelope, avisos } = exportarFichaV2({
      ...c,
      currentMp: getMaxMp(c) + 1,
      currentPt: getPtPool(c) + 1,
      currentPp: getPpPool(c) + 1,
    });
    expect(envelope.session.current.pm).toBe(envelope.calculated.maxima.pm);
    expect(envelope.session.current.pt).toBe(envelope.calculated.maxima.pt);
    expect(envelope.session.current.pp).toBe(envelope.calculated.maxima.pp);
    for (const recurso of ["PM", "PT", "PP"])
      expect(avisos.some((mensagem) =>
        mensagem.startsWith(`${recurso} atual acima`),
      )).toBe(true);
  });

  it("não exporta mesa.* e não descarta um arquivo legado com conteúdo", () => {
    const { envelope, avisos } = exportarFichaV2({
      ...ficha(),
      mesa: {
        exaustao: 1,
        marcas: 1,
        estabilizado: false,
        responsavel: 2,
        salvacoes: 0,
        trauma: 0,
        cicatrizes: [],
        usos: {},
      },
    });
    expect(envelope.session).not.toHaveProperty("tableState");
    expect(avisos.some((mensagem) => mensagem.includes("mesa.*"))).toBe(true);
    expect(() => exportarFichaV2({
      ...ficha(),
      legacyBarreira: { purchases: [], refundedPa: 1 },
    })).toThrow(/legacyBarreira/);
  });

  it("recusa nome maior que o limite e surrogate isolado sem truncar", () => {
    expect(() => exportarFichaV2({
      ...ficha(),
      name: "🐉".repeat(33),
    })).toThrow(/Nome/);
    expect(() => exportarFichaV2({
      ...ficha(),
      name: "\ud800",
    })).toThrow(/surrogate/);
    expect(exportarFichaV2({
      ...ficha(),
      name: "🐉".repeat(32),
    }).envelope.name).toBe("🐉".repeat(32));
  });

  it("é determinístico e não modifica a ficha original", () => {
    const c = ficha();
    const antes = JSON.stringify(c);
    const primeira = exportarFichaV2(c);
    const segunda = exportarFichaV2(c);
    expect(primeira).toEqual(segunda);
    expect(JSON.stringify(c)).toBe(antes);
    expect(primeira.envelope.construction.attributeBase).not.toBe(c.attributeBase);
  });

  it("recusa listas acima do limite sem cortar entradas", () => {
    expect(() => exportarFichaV2({
      ...ficha(),
      inventory: Array.from({ length: 257 }, (_, index) => ({
        id: `local-${index}`,
        name: "Pedra",
        type: "geral" as const,
        equipped: false,
      })),
    })).toThrow(/Inventário.*256/);
  });
});

describe("fragmentos JSON puro da ficha v2", () => {
  it("recompõe exatamente JSON.stringify sem prefixo ou transformação", () => {
    const { envelope } = exportarFichaV2(ficha());
    const partes = codificarPartes(envelope);
    expect(partes.join("")).toBe(JSON.stringify(envelope));
    expect(JSON.parse(partes.join(""))).toEqual(envelope);
    expect(partes.length).toBeGreaterThanOrEqual(1);
    expect(partes.length).toBeLessThanOrEqual(32);
  });

  it("divide por bytes UTF-8 sem separar um ponto de código", () => {
    const { envelope } = exportarFichaV2({
      ...ficha(),
      inventory: Array.from({ length: 20 }, (_, index) => ({
        id: `item-local-${index}`,
        name: `Equipamento ${index}`,
        type: "geral" as const,
        description: "🐉á".repeat(200),
        equipped: false,
      })),
    });
    const partes = codificarPartes(envelope);
    expect(partes.length).toBeGreaterThan(1);
    for (const parte of partes) {
      expect(bytes(parte)).toBeGreaterThan(0);
      expect(bytes(parte)).toBeLessThanOrEqual(FICHA_V2_PARTE_BYTES_MAX);
      expect(
        new TextDecoder("utf-8", { fatal: true }).decode(
          new TextEncoder().encode(parte),
        ),
      ).toBe(parte);
    }
    expect(partes.join("")).toBe(JSON.stringify(envelope));
    expect(bytes(partes.join(""))).toBeLessThanOrEqual(FICHA_V2_BYTES_MAX);
  });

  it("recusa JSON excessivo antes de gerar partes", () => {
    const { envelope } = exportarFichaV2(ficha());
    envelope.warnings = ["x".repeat(FICHA_V2_BYTES_MAX)];
    expect(() => codificarPartes(envelope)).toThrow(/65536 bytes/);
  });

  it("recusa valores que JSON.stringify esconderia ou converteria", () => {
    const { envelope } = exportarFichaV2(ficha());
    envelope.calculated.armorClass = Number.NaN;
    expect(() => codificarPartes(envelope)).toThrow(/não finito/);

    const outro = exportarFichaV2(ficha()).envelope;
    Object.assign(outro, { campoInvalido: undefined });
    expect(() => codificarPartes(outro)).toThrow(/null\/undefined/);
  });

  it("recusa estruturas circulares e profundas", () => {
    const { envelope } = exportarFichaV2(ficha());
    Object.assign(envelope, { circular: envelope });
    expect(() => codificarPartes(envelope)).toThrow(/circular/);

    const outro = exportarFichaV2(ficha()).envelope;
    let profundo: object = {};
    for (let index = 0; index < 13; index++) profundo = { filho: profundo };
    Object.assign(outro, { profundo });
    expect(() => codificarPartes(outro)).toThrow(/profundidade/);
  });
});
