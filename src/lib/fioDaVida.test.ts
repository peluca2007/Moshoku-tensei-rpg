import { describe, expect, it } from "vitest";
import {
  EstadoPersonagem,
  aplicarDano,
  curar,
  escolherSuporte,
  makeRng,
  montarFicha,
  novaAcao,
  novoAlvo,
  novoEstado,
  testeDoFioDaVida,
  turnoPersonagem,
} from "./combatSim";
import { getTreeById } from "@/data/trees";
import { AttributeKey, CharacterData } from "./types";

/**
 * O Fio da Vida (Cap. 4, §7) — 0.1.38.
 *
 * ## O que estes testes protegem
 *
 * O livro é explícito: *"Se seus Pontos de Vida chegarem a 0, você cai
 * Inconsciente e entra em estado de Morte"* — e *"qualquer magia de cura
 * aplicada por um aliado remove todas as Marcas da Morte instantaneamente e você
 * acorda"*. O motor tratava 0 PV como morte instantânea e permanente.
 *
 * Isso não era só infidelidade. Era a causa de TODO combate contra chefe dar 0%
 * ou 100%, sem meio-termo: quem caía sumia pra sempre, o dano do grupo despencava,
 * a luta se alongava e caía o próximo — uma espiral com realimentação positiva
 * não produz resultado intermediário, produz coin flip. Foi medido: no 4º
 * patamar, um chefe com 49 de dano por turno perdia 97% das vezes e um com 51
 * ganhava 94%.
 *
 * Com o Fio da Vida e um curandeiro, o mesmo confronto virou 55% × 45%. O
 * meio-termo existe porque levantar alguém interrompe a espiral.
 */

const ZERO: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

function comArvoreInteira(treeId: string): CharacterData {
  const tree = getTreeById(treeId);
  const compras = (tree?.ranks ?? []).flatMap((r) =>
    (r.abilities ?? []).map((a) => ({ kind: "ability" as const, treeId, rank: r.rank, id: a.id }))
  );
  return {
    id: "t",
    name: "Varredura",
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { ...ZERO, espirito: 5, intelecto: 5, vigor: 4, forca: 4 },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: treeId,
    unlockedRanks: (tree?.ranks ?? []).map((r) => ({ treeId, rank: r.rank })),
    purchasedAbilities: compras,
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
    condicoes: [],
    descansosCurtos: 0,
    overrides: {},
  } as unknown as CharacterData;
}

const heroi = (): EstadoPersonagem => novoEstado(montarFicha(comArvoreInteira("cura")));

describe("chegar a 0 PV", () => {
  it("derruba o personagem, mas NÃO o mata", () => {
    const e = heroi();
    aplicarDano(e, 10_000);
    expect(e.pv, "os PV param em zero, não ficam negativos").toBe(0);
    expect(e.inconsciente, "caiu").toBe(true);
    expect(e.morto, "mas não morreu").toBe(false);
    expect(e.vivo, "e está fora da luta — é o que as checagens do motor leem").toBe(false);
  });

  it("mata a CRIATURA, que não tem Fio da Vida", () => {
    // A regra é dos personagens. Um goblin inconsciente é um goblin morto pra
    // qualquer efeito de mesa, e dar Marcas da Morte a monstro encheria o motor
    // de estado que ninguém consulta.
    const bicho = novoAlvo({ nome: "goblin", pv: 5, ca: 12 });
    aplicarDano(bicho, 50);
    expect(bicho.vivo).toBe(false);
    expect(bicho.inconsciente).toBe(false);
  });

  it("quem te derrubou decide o quanto é difícil voltar", () => {
    // "CD 9 contra um Principiante, CD 14 contra um Imperador."
    const fraco = heroi();
    aplicarDano(fraco, 10_000, 1);
    expect(fraco.cdFioDaVida).toBe(9);

    const forte = heroi();
    aplicarDano(forte, 10_000, 6);
    expect(forte.cdFioDaVida).toBe(14);
  });
});

describe("o teste do Fio da Vida", () => {
  /** Um d20 forjado, pra testar a regra e não a sorte. */
  const dadoFixo = (valor: number) => () => (valor - 1) / 20 + 0.001;

  it("falhar dá uma Marca da Morte", () => {
    const e = heroi();
    aplicarDano(e, 10_000, 6); // CD 14
    testeDoFioDaVida(e, dadoFixo(2));
    expect(e.marcasDaMorte).toBe(1);
    expect(e.morto).toBe(false);
  });

  it("um 1 natural dá DUAS", () => {
    const e = heroi();
    aplicarDano(e, 10_000, 6);
    testeDoFioDaVida(e, dadoFixo(1));
    expect(e.marcasDaMorte).toBe(2);
  });

  it("três Marcas matam de vez", () => {
    const e = heroi();
    aplicarDano(e, 10_000, 6);
    testeDoFioDaVida(e, dadoFixo(1)); // 2 marcas
    testeDoFioDaVida(e, dadoFixo(2)); // 3 marcas
    expect(e.marcasDaMorte).toBeGreaterThanOrEqual(3);
    expect(e.morto, "acabou").toBe(true);
    expect(e.inconsciente, "quem morreu não está mais caído: está morto").toBe(false);
  });

  it("passar estabiliza, e quem estabilizou para de rolar", () => {
    const e = heroi();
    aplicarDano(e, 10_000, 1); // CD 9, e o Vigor da ficha ajuda
    testeDoFioDaVida(e, dadoFixo(20));
    expect(e.estabilizado).toBe(true);
    // A escolha declarada do motor: estabilizado não rola mais. O livro diz
    // "estabiliza temporariamente" e não diz quando recomeça.
    testeDoFioDaVida(e, dadoFixo(1));
    expect(e.marcasDaMorte, "não devia ter rolado de novo").toBe(0);
  });

  it("o turno de quem está no chão é o teste, e nada mais", () => {
    const e = heroi();
    aplicarDano(e, 10_000, 6);
    const inimigo = novoAlvo({ nome: "alvo", pv: 500, ca: 10 });
    const antes = inimigo.pv;
    turnoPersonagem(e, [inimigo], makeRng(3));
    expect(inimigo.pv, "um inconsciente não ataca").toBe(antes);
    expect(e.marcasDaMorte + (e.estabilizado ? 1 : 0), "mas o turno dele aconteceu").toBeGreaterThan(0);
  });
});

describe("levantar um companheiro", () => {
  it("a cura acorda, zera as Marcas e devolve o personagem à luta", () => {
    const e = heroi();
    aplicarDano(e, 10_000, 6);
    testeDoFioDaVida(e, dadoFixoDoisNaturais());
    expect(e.marcasDaMorte).toBeGreaterThan(0);

    const devolvido = curar(e, 12, e.ficha.pvMax);
    expect(e.vivo, "voltou pra luta").toBe(true);
    expect(e.inconsciente).toBe(false);
    expect(e.marcasDaMorte, "remove todas as Marcas da Morte instantaneamente").toBe(0);
    expect(devolvido, "e levantou com o que a magia devolveu").toBeGreaterThan(0);
    expect(e.pv).toBe(devolvido);
  });

  function dadoFixoDoisNaturais() {
    return () => 0.001; // 1 natural: duas Marcas
  }

  it("não ressuscita quem já morreu de vez", () => {
    const e = heroi();
    aplicarDano(e, 10_000, 6);
    e.marcasDaMorte = 3;
    e.morto = true;
    e.inconsciente = false;
    expect(curar(e, 50, e.ficha.pvMax)).toBe(0);
    expect(e.vivo).toBe(false);
  });

  /*
   * A prioridade da IA. Um companheiro no chão está perdendo o dano dele E
   * rolando contra a morte a cada turno: a mesma magia que devolveria 15 PV a
   * alguém em pé devolve um personagem inteiro à batalha. Se esta asserção cair,
   * o curandeiro voltou a deixar gente morrer no chão pra topar um ferido.
   */
  it("o curandeiro levanta quem caiu ANTES de curar quem está de pé", () => {
    const curandeiro = heroi();
    const caido = heroi();
    const ferido = heroi();
    aplicarDano(caido, 10_000, 6);
    ferido.pv = 1;

    const time = [curandeiro, caido, ferido];
    const escolha = escolherSuporte(curandeiro, 3, time);
    expect(escolha?.alvo, `escolheu curar ${escolha?.alvo.nome}`).toBe(caido);
  });

  it("sem quem levantar, volta a cuidar do mais ferido", () => {
    const curandeiro = heroi();
    const ferido = heroi();
    ferido.pv = 1;
    const escolha = escolherSuporte(curandeiro, 3, [curandeiro, ferido]);
    expect(escolha?.alvo).toBe(ferido);
  });

  it("uma ação de suporte que não cura não levanta ninguém", () => {
    // Casca em quem está no chão seria PV Temporários num inconsciente: o livro
    // manda CURA pra acordar, e só ela.
    const curandeiro = heroi();
    const caido = heroi();
    aplicarDano(caido, 10_000, 6);
    const soEscudo = {
      ...curandeiro,
      ficha: {
        ...curandeiro.ficha,
        acoes: [novaAcao({ nome: "casca", tipo: "escudo" as const, formulaSuporte: "2d8" })],
      },
    };
    const escolha = escolherSuporte(soEscudo, 3, [soEscudo, caido]);
    expect(escolha?.alvo, "a casca não vai pro caído").not.toBe(caido);
  });
});
