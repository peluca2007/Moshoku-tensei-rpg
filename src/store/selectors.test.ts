import { describe, expect, it } from "vitest";
import {
  canPurchaseAbility,
  canPurchaseCombinedSpell,
  getCombinedSpellPaCost,
  getArmorClass,
  getAttributePaCost,
  getMaxHp,
  getMaxMp,
  getPaSpent,
  getPtPool,
  getSaveAdvantagePaCost,
  getSpellDC,
  getAttackBonus,
  getTrainedBody,
  getTreeGrantedSkills,
  getSkillPaCost,
} from "./selectors";
import { TREES } from "@/data/trees";
import { COMBINED_SPELLS, getCombinedSpellById } from "@/data/combinedSpells";
import { buildFichaPayload } from "@/lib/buildFichaPayload";
import {
  attributePaCostTotal,
  ATTRIBUTE_CREATION_POINTS,
  AttributeKey,
  CharacterData,
  getVigorFactor,
  PV_BASE,
  saveAdvantagePaCostTotal,
} from "@/lib/types";

/**
 * Testes das fórmulas do Cap. 4 e do Cap. 1.
 *
 * Por que existem (2026-09-03): `selectors.ts` tem 35 funções puras que
 * calculam TODO número da ficha — PV, PM, PT, PP, CA, BC e o PA gasto — e não
 * tinha um único teste. Duas das correções desta sessão foram exatamente do
 * tipo que um teste pega e uma revisão humana não: a ficha imprimia
 * `count × 2 PA` enquanto o motor cobrava a escada progressiva, e
 * `perfectRecitationBonus` lia um campo (`ability.rank`) que nunca existiu no
 * tipo.
 *
 * O que estes testes travam não é "o número está certo" — é **o número está no
 * mesmo lugar em que o livro diz que está**. Cada `expect` abaixo carrega a
 * seção do livro que o justifica, então quando um deles quebrar o autor sabe
 * imediatamente se quebrou o código ou mudou a regra.
 */

const ZERO_ATTRS: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

function ficha(patch: Partial<CharacterData> = {}): CharacterData {
  return {
    id: "t",
    name: "Teste",
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { ...ZERO_ATTRS },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: null,
    unlockedRanks: [],
    purchasedAbilities: [],
    purchasedCombinedSpells: [],
    gold: 0,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
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

describe("PV Máximos (Cap. 4, §1)", () => {
  it("sem nenhum patamar, o corpo é só a constante de base", () => {
    expect(getTrainedBody(ficha())).toBe(PV_BASE);
    expect(getMaxHp(ficha())).toBe(PV_BASE);
  });

  it("Vigor multiplica o corpo treinado, e o fator vem da tabela do livro", () => {
    const comVigor = ficha({ attributeBase: { ...ZERO_ATTRS, vigor: 3 } });
    expect(getMaxHp(comVigor)).toBe(Math.floor(PV_BASE * getVigorFactor(3)));
  });

  it("a escala negativa do Vigor é assimétrica de propósito", () => {
    // Cap. 1, §1, "Antes de largar o Vigor": -1 tira um quarto, -2 quase metade
    // do que sobrou. Se algum dia isto virar linear, o aviso do livro vira mentira.
    expect(getVigorFactor(-1)).toBe(0.75);
    expect(getVigorFactor(-2)).toBe(0.4);
    expect(getVigorFactor(1) - getVigorFactor(0)).toBeCloseTo(0.2, 5);
  });

  it("PV comprados com PA ficam FORA do Fator de Vigor", () => {
    // A regra que impede 1 PA de valer 2,6× mais numa ficha de Vigor 8.
    const a = getMaxHp(ficha({ attributeBase: { ...ZERO_ATTRS, vigor: 8 }, bonusHp: 10 }));
    const b = getMaxHp(ficha({ attributeBase: { ...ZERO_ATTRS, vigor: 8 } }));
    expect(a - b).toBe(10);
  });

  it("um override substitui o valor calculado por inteiro", () => {
    expect(getMaxHp(ficha({ overrides: { maxHp: 999 } }))).toBe(999);
  });
});

describe("PM Máximos (Cap. 4, §1)", () => {
  it("sem patamar de magia, sobra só a base de 8", () => {
    expect(getMaxMp(ficha())).toBe(8);
  });

  it("o piso de Espírito 4 mantém o cirurgião jogável", () => {
    // Cap. 1, §1: sem esse piso, um Imperador de Espírito 2 teria menos PM que
    // o custo da assinatura da própria escola.
    const espirito2 = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 2 },
      unlockedRanks: [{ treeId: "agua", rank: "Principiante" }],
    });
    const espirito4 = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 4 },
      unlockedRanks: [{ treeId: "agua", rank: "Principiante" }],
    });
    expect(getMaxMp(espirito2)).toBe(getMaxMp(espirito4));
  });

  it("PA avulso é cortado pelo cap nos dois primeiros patamares", () => {
    const semPa = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 4 },
      unlockedRanks: [{ treeId: "agua", rank: "Principiante" }],
    });
    const comPa = ficha({ ...semPa, bonusMp: 20 });
    expect(getMaxMp(comPa)).toBe(getMaxMp(semPa));
  });

  it("acima do 2º patamar o cap some e o PA avulso volta a contar", () => {
    const base = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 4 },
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "agua", rank: "Intermediário" },
        { treeId: "agua", rank: "Avançado" },
      ],
    });
    expect(getMaxMp({ ...base, bonusMp: 10 })).toBe(getMaxMp(base) + 10);
  });

  it("árvore do Corpo não concede PM nenhum, em patamar nenhum", () => {
    const guerreiro = ficha({
      attributeBase: { ...ZERO_ATTRS, espirito: 6 },
      unlockedRanks: [{ treeId: "deus-da-espada", rank: "Imperador" }],
    });
    expect(getMaxMp(guerreiro)).toBe(8);
  });
});

describe("Pontos de Touki (Cap. 3)", () => {
  it("sem patamar do Corpo, não existe PT", () => {
    expect(getPtPool(ficha({ attributeBase: { ...ZERO_ATTRS, vigor: 5 } }))).toBe(0);
  });

  it("PT Menor antes do Pleno é o Vigor, com mínimo 1", () => {
    const semVigor = ficha({ unlockedRanks: [{ treeId: "deus-do-norte", rank: "Principiante" }] });
    expect(getPtPool(semVigor)).toBe(1);
  });

  it("magia e utilidade nunca dão PT, por mais alto que seja o rank", () => {
    const mago = ficha({
      attributeBase: { ...ZERO_ATTRS, vigor: 6, espirito: 6 },
      unlockedRanks: [{ treeId: "terra", rank: "Imperador" }],
    });
    expect(getPtPool(mago)).toBe(0);
  });
});

describe("Custos de PA (Cap. 1, §2)", () => {
  it("a compra de atributo é progressiva: 1, 1, 2, 2, 3, 3…", () => {
    expect([1, 2, 3, 4, 5, 6].map(attributePaCostTotal)).toEqual([1, 2, 4, 6, 9, 12]);
  });

  it("a Vantagem em Resistência é 2, 3, 4, 4, 4 — 17 PA pelas cinco", () => {
    expect([1, 2, 3, 4, 5].map(saveAdvantagePaCostTotal)).toEqual([2, 5, 9, 13, 17]);
  });

  it("o motor cobra exatamente a escada que o livro imprime", () => {
    // A regressão de 2026-09-03: a ficha mostrava `count × 2` e o motor cobrava
    // a escada. Este teste é o que impede as duas de divergirem de novo.
    const cinco = ficha({ saveAdvantages: ["forca", "agilidade", "vigor", "intelecto", "espirito"] });
    expect(getSaveAdvantagePaCost(cinco)).toBe(saveAdvantagePaCostTotal(5));
    expect(getSaveAdvantagePaCost(cinco)).toBe(17);
  });

  it("atributo dentro do orçamento da criação não custa PA", () => {
    const noOrcamento = ficha({
      attributeBase: { ...ZERO_ATTRS, forca: ATTRIBUTE_CREATION_POINTS },
    });
    expect(getAttributePaCost(noOrcamento)).toBe(0);
  });

  it("o Sistema de Defeitos não cria pontos: a soma é que conta", () => {
    // Cap. 1, §1: com os dois defeitos a soma dos cinco fecha em 2 de qualquer
    // jeito, então nada é cobrado.
    const comDefeitos = ficha({
      attributeBase: { forca: 4, agilidade: 1, vigor: 0, intelecto: -1, espirito: -2 },
    });
    expect(getAttributePaCost(comDefeitos)).toBe(0);
  });
});

describe("Custo de Abertura de árvore (Cap. 1, §8)", () => {
  it("a primeira árvore é grátis e cada nova custa uma a mais", () => {
    // 1ª = 0 PA extra, 2ª = 1, 3ª = 2 — o que impede abrir cinco árvores
    // por 5 PA só pra colecionar Maestrias de 1º patamar.
    const uma = ficha({ unlockedRanks: [{ treeId: "agua", rank: "Principiante" }] });
    const duas = ficha({
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "fogo", rank: "Principiante" },
      ],
    });
    const tres = ficha({
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "fogo", rank: "Principiante" },
        { treeId: "vento", rank: "Principiante" },
      ],
    });
    expect(getPaSpent(uma)).toBe(0);
    expect(getPaSpent(duas)).toBe(1);
    expect(getPaSpent(tres)).toBe(3);
  });
});

describe("BC e CD (Cap. 1, §7)", () => {
  it("CD é sempre 8 + BC, e BC é o atributo mais o Rank daquela árvore", () => {
    const mago = ficha({
      attributeBase: { ...ZERO_ATTRS, intelecto: 5 },
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "agua", rank: "Intermediário" },
      ],
    });
    const bc = getAttackBonus(mago, "agua", "intelecto");
    expect(bc).toBe(5 + 2); // Intelecto 5 + Bônus do Intermediário
    expect(getSpellDC(mago, "agua", "intelecto")).toBe(8 + bc);
  });

  it("o Bônus é da árvore em uso, não o maior da ficha", () => {
    // Cap. 1, §7, "O Bônus Depende da Ação".
    const multi = ficha({
      attributeBase: { ...ZERO_ATTRS, intelecto: 4, espirito: 4 },
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "agua", rank: "Intermediário" },
        { treeId: "agua", rank: "Avançado" },
        { treeId: "cura", rank: "Principiante" },
      ],
    });
    expect(getAttackBonus(multi, "agua", "intelecto")).toBe(4 + 3);
    expect(getAttackBonus(multi, "cura", "espirito")).toBe(4 + 1);
  });
});

describe("Classe de Armadura (Cap. 4, §1)", () => {
  it("base 10 + Agilidade", () => {
    expect(getArmorClass(ficha({ attributeBase: { ...ZERO_ATTRS, agilidade: 3 } }))).toBe(13);
  });

  it("só armadura equipada conta", () => {
    const item = {
      id: "i1",
      name: "Cota",
      type: "armadura" as const,
      acBonus: 4,
      equipped: false,
    };
    expect(getArmorClass(ficha({ inventory: [item] }))).toBe(10);
    expect(getArmorClass(ficha({ inventory: [{ ...item, equipped: true }] }))).toBe(14);
  });
});

describe("Pré-requisito de compra (2026-09-03)", () => {
  const escudeiro = ficha({
    startingTreeId: "cavalaria-e-escudos",
    unlockedRanks: [{ treeId: "cavalaria-e-escudos", rank: "Principiante" }],
  });

  it("recusa a habilidade Soberana sem o talento Puro Escudo", () => {
    // A linha inteira do Escudeiro só existe pra quem abre mão de arma de dano.
    // Até esta data a exigência vivia só na prosa do efeito, e nada a checava.
    const r = canPurchaseAbility(
      escudeiro,
      "cavalaria-e-escudos",
      "Principiante",
      "ability",
      "golpe-de-escudo-soberano"
    );
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("Puro Escudo");
  });

  it("libera assim que o pré-requisito está comprado", () => {
    const comPuroEscudo = ficha({
      ...escudeiro,
      purchasedAbilities: [
        { treeId: "cavalaria-e-escudos", rank: "Principiante", kind: "talent", id: "puro-escudo" },
      ],
    });
    expect(
      canPurchaseAbility(
        comPuroEscudo,
        "cavalaria-e-escudos",
        "Principiante",
        "ability",
        "golpe-de-escudo-soberano"
      ).ok
    ).toBe(true);
  });

  it("uma habilidade sem pré-requisito continua livre", () => {
    expect(
      canPurchaseAbility(escudeiro, "cavalaria-e-escudos", "Principiante", "talent", "puro-escudo").ok
    ).toBe(true);
  });
});

describe("Padrão das Reservas — PT escala como PV e PM (2026-09-03)", () => {
  it("um talento de PT rende por patamar, não um número fixo", () => {
    // Antes desta data PT era a única das três reservas fora do Padrão do
    // Cap. 1: vinha como "+2 PT Máximos" fixo. Cinco árvores tinham DOIS
    // talentos assim em patamares diferentes, fazendo a mesma coisa com um
    // número diferente — comprar o segundo não mudava nada além do total.
    const umPatamar = ficha({
      startingTreeId: "deus-da-espada",
      unlockedRanks: [{ treeId: "deus-da-espada", rank: "Principiante" }],
      purchasedAbilities: [],
    });
    const tresPatamares = ficha({
      startingTreeId: "deus-da-espada",
      unlockedRanks: [
        { treeId: "deus-da-espada", rank: "Principiante" },
        { treeId: "deus-da-espada", rank: "Intermediário" },
        { treeId: "deus-da-espada", rank: "Avançado" },
      ],
    });
    const comTalento = (c: CharacterData) => ({
      ...c,
      purchasedAbilities: [
        { treeId: "deus-da-espada", rank: "Intermediário" as const, kind: "talent" as const, id: "aco-rapido" },
      ],
    });

    const ganho1 = getPtPool(comTalento(umPatamar)) - getPtPool(umPatamar);
    const ganho3 = getPtPool(comTalento(tresPatamares)) - getPtPool(tresPatamares);
    expect(ganho1).toBe(1);
    expect(ganho3).toBe(3);
  });

  it("nenhum talento existe SÓ pra dar PT fixo", () => {
    // A redundância não era usar o campo `pt` — era existir um talento cuja
    // única função é "+N PT Máximos", repetido em dois patamares da mesma
    // árvore. Um rider de PT em cima de um talento de PV (Ombro de Pedra)
    // continua legítimo: ele não compete com nada.
    const soPtFixo: string[] = [];
    for (const tree of TREES) {
      for (const rd of tree.ranks) {
        for (const t of rd.talents) {
          const g = t.grants;
          if (!g) continue;
          const soPt = g.pt !== undefined && !g.hpPerRank && !g.mpPerRank && !g.ptPerRank;
          if (soPt) soPtFixo.push(`${tree.id}/${t.id}`);
        }
      }
    }
    expect(soPtFixo).toEqual([]);  });
});

describe("Magias Combinadas (Cap. 2, §4)", () => {
  it("toda combinação aponta para árvores que existem", () => {
    // Três delas apontavam para "curar" — id que nunca existiu; o certo é "cura".
    // O livro imprimia a coluna vazia e nada pegava, porque nada lia o campo.
    const orfas: string[] = [];
    for (const s of COMBINED_SPELLS) {
      for (const r of s.requires) {
        if (!TREES.some((t) => t.id === r.treeId)) orfas.push(`${s.id} → ${r.treeId}`);
      }
    }
    expect(orfas).toEqual([]);
  });

  it("exige as DUAS portas, cada uma no rank dela", () => {
    // Meteoro: Fogo Rei + Terra Avançado.
    const meteoro = getCombinedSpellById("meteoro")!;
    expect(meteoro.requires).toHaveLength(2);

    const soFogo = ficha({
      unlockedRanks: [
        { treeId: "fogo", rank: "Principiante" },
        { treeId: "fogo", rank: "Intermediário" },
        { treeId: "fogo", rank: "Avançado" },
        { treeId: "fogo", rank: "Santo" },
        { treeId: "fogo", rank: "Rei" },
      ],
    });
    const negado = canPurchaseCombinedSpell(soFogo, "meteoro");
    expect(negado.ok).toBe(false);
    expect(negado.reason).toContain("Terra");

    const comAsDuas = ficha({
      ...soFogo,
      unlockedRanks: [
        ...soFogo.unlockedRanks,
        { treeId: "terra", rank: "Principiante" },
        { treeId: "terra", rank: "Intermediário" },
        { treeId: "terra", rank: "Avançado" },
      ],
    });
    expect(canPurchaseCombinedSpell(comAsDuas, "meteoro").ok).toBe(true);
  });

  it("rank alto numa porta não substitui a outra", () => {
    // Avançado nas duas NÃO abre o Meteoro: ele quer Fogo no Rei.
    const avancadoNasDuas = ficha({
      unlockedRanks: [
        { treeId: "fogo", rank: "Principiante" },
        { treeId: "fogo", rank: "Intermediário" },
        { treeId: "fogo", rank: "Avançado" },
        { treeId: "terra", rank: "Principiante" },
        { treeId: "terra", rank: "Intermediário" },
        { treeId: "terra", rank: "Avançado" },
      ],
    });
    expect(canPurchaseCombinedSpell(avancadoNasDuas, "meteoro").ok).toBe(false);
    // ...mas abre o Magma, que pede Avançado nas duas.
    expect(canPurchaseCombinedSpell(avancadoNasDuas, "magma").ok).toBe(true);
  });

  it("o PA da Combinada entra no total gasto", () => {
    const magma = getCombinedSpellById("magma")!;
    const base = ficha({
      unlockedRanks: [
        { treeId: "fogo", rank: "Principiante" },
        { treeId: "terra", rank: "Principiante" },
      ],
    });
    const comMagma = ficha({ ...base, purchasedCombinedSpells: ["magma"] });
    expect(getCombinedSpellPaCost(comMagma)).toBe(magma.paCost);
    expect(getPaSpent(comMagma) - getPaSpent(base)).toBe(magma.paCost);
  });

  it("não dá pra comprar duas vezes", () => {
    const c = ficha({
      unlockedRanks: [
        { treeId: "fogo", rank: "Principiante" },
        { treeId: "fogo", rank: "Intermediário" },
        { treeId: "fogo", rank: "Avançado" },
        { treeId: "terra", rank: "Principiante" },
        { treeId: "terra", rank: "Intermediário" },
        { treeId: "terra", rank: "Avançado" },
      ],
      purchasedCombinedSpells: ["magma"],
    });
    expect(canPurchaseCombinedSpell(c, "magma").ok).toBe(false);
  });
});

describe("Magias Combinadas na ficha exportada", () => {
  it("uma Combinada comprada sai no PDF, com as duas portas visíveis", () => {
    // Elas fazem parte da ficha desde 2026-09-03; se o PDF não as leva, o
    // jogador imprime uma folha que não sabe que ele as tem.
    const c = ficha({ purchasedCombinedSpells: ["meteoro"] });
    const payload = buildFichaPayload({
      character: c,
      attributes: { ...ZERO_ATTRS },
      maxHp: 10,
      maxMp: 8,
      maxPt: 0,
      maxPp: 0,
      armorClass: 10,
      initiativeBonus: 0,
    });
    const carta = payload.abilityCards.find((a) => a.name.includes("Meteoro"));
    expect(carta).toBeDefined();
    expect(carta!.range).toContain("Fogo Rei");
    expect(carta!.range).toContain("Terra Avançado");
    expect(carta!.cost).toContain("8 PA");
  });

  it("ficha sem Combinada não gera carta nenhuma delas", () => {
    const payload = buildFichaPayload({
      character: ficha(),
      attributes: { ...ZERO_ATTRS },
      maxHp: 10,
      maxMp: 8,
      maxPt: 0,
      maxPp: 0,
      armorClass: 10,
      initiativeBonus: 0,
    });
    const nomes = COMBINED_SPELLS.map((s) => s.name);
    expect(payload.abilityCards.filter((a) => nomes.some((n) => a.name.includes(n)))).toEqual([]);
  });
});

describe("Perícias que a árvore ensina sozinha (Cap. 1, §4)", () => {
  /**
   * O terceiro caminho, aberto em 0.1.12: uma HABILIDADE comprada que declara
   * `grantsSkills`. Duas técnicas do Deus do Norte prometiam perícia na prosa
   * desde que foram escritas, e não havia campo pra guardar — o jogador
   * comprava e a perícia não aparecia em lugar nenhum. Quem achou foi o
   * `check:texto`, lendo o texto contra os campos.
   *
   * O Norte NÃO é a Árvore Inicial nestes testes de propósito: como inicial ele
   * já entrega Sobrevivência e Enganação pelo caminho 1, e o teste não
   * distinguiria as duas fontes.
   */
  const comLeituraDeRastro = ficha({
    startingTreeId: "agua",
    unlockedRanks: [{ treeId: "deus-do-norte", rank: "Principiante" }],
    purchasedAbilities: [
      { treeId: "deus-do-norte", rank: "Principiante", kind: "ability", id: "leitura-de-rastro-norte" },
    ],
  });

  it("uma técnica com grantsSkills entrega as perícias que a carta promete", () => {
    const pericias = getTreeGrantedSkills(comLeituraDeRastro);
    expect(pericias).toContain("Sobrevivência");
    expect(pericias).toContain("Percepção");
  });

  it("sem a compra, a técnica não entrega nada", () => {
    const semCompra = ficha({
      startingTreeId: "agua",
      unlockedRanks: [{ treeId: "deus-do-norte", rank: "Principiante" }],
    });
    expect(getTreeGrantedSkills(semCompra)).not.toContain("Percepção");
  });

  it("perícia concedida é GRATUITA — não vira PA gasto", () => {
    const anotadas = { ...comLeituraDeRastro, skills: ["Sobrevivência", "Percepção"] };
    expect(getSkillPaCost(anotadas)).toBe(0);
  });

  it("todo grantsSkills do livro cita uma perícia que existe na Lista Mestre", async () => {
    const { SKILLS } = await import("@/data/skills");
    const conhecidas = new Set(SKILLS.map((s) => s.name));
    for (const tree of TREES) {
      for (const rank of tree.ranks) {
        for (const a of rank.abilities) {
          for (const nome of (a as { grantsSkills?: string[] }).grantsSkills ?? []) {
            expect(conhecidas, `${tree.name} · ${a.name}`).toContain(nome);
          }
        }
      }
    }
  });
});
