import { describe, expect, it } from "vitest";
import {
  AcaoCriatura,
  CriaturaEncontro,
  ResultadoEncontro,
  aplicarPapel,
  criaturaDoMolde,
  danoDasAcoesPorRodada,
  planoDoTurno,
  simularEncontro,
  usaAcoes,
} from "./encounterSim";
import { ajustarParaEquilibrio, arredondarPv, avaliar } from "./encounterBalance";
import { CRIATURAS_PRONTAS, MOLDES_CRIATURA, bonusResistencia, rodadasDoChefe } from "@/data/bestiary";
import { maxFormula, mediaFormula, modificadorFixo, patamarDaFicha, temDano } from "./combatSim";
import { AttributeKey, CharacterData, RankName, RANKS } from "./types";

/**
 * Testes do construtor de encontros.
 *
 * O que eles travam não é "a simulação está certa" — ela é uma aproximação, e a
 * lista de SIMPLIFICACOES diz isso na cara do Mestre. O que eles travam é que
 * as REGRAS DO LIVRO que o construtor promete aplicar continuam sendo aplicadas:
 * as transformações de papel do Apêndice G, a coluna de Resistência derivada, a
 * rodada extra do chefe, e o fato de que o veredito é reproduzível.
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
    attributeBase: ZERO_ATTRS,
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
    overrides: {},
    ...patch,
  };
}

/** Espadachim de `ateRank`, com a árvore aberta até lá. Serve de grupo de teste. */
function espadachim(nome: string, ateRank: RankName, forca = 4): CharacterData {
  const limite = RANKS.indexOf(ateRank);
  return ficha({
    id: nome,
    name: nome,
    attributeBase: { ...ZERO_ATTRS, forca, vigor: 2, agilidade: 2 },
    startingTreeId: "deus-da-espada",
    unlockedRanks: RANKS.slice(0, limite + 1).map((rank) => ({ treeId: "deus-da-espada", rank })),
  });
}

describe("Apêndice G — o molde", () => {
  it("deriva o Bônus de Resistência que o livro imprimia à mão", () => {
    // A tabela impressa trazia +2, +2, +3, +4, +5, +6. O livro define a coluna
    // como "metade do Bônus de Ataque, arredondado pra cima" — se a derivação
    // divergir desses seis valores, uma das duas está errada.
    expect(MOLDES_CRIATURA.map(bonusResistencia)).toEqual([2, 2, 3, 4, 5, 6]);
  });

  it("cobre os seis patamares, sem buraco e em ordem", () => {
    expect(MOLDES_CRIATURA.map((m) => m.patamar)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("cresce monotonicamente em toda coluna — é uma escada, não uma lista", () => {
    for (let i = 1; i < MOLDES_CRIATURA.length; i++) {
      const antes = MOLDES_CRIATURA[i - 1];
      const agora = MOLDES_CRIATURA[i];
      expect(agora.pv).toBeGreaterThan(antes.pv);
      expect(agora.ca).toBeGreaterThan(antes.ca);
      expect(agora.bonusAtaque).toBeGreaterThan(antes.bonusAtaque);
      expect(agora.danoPorTurno).toBeGreaterThan(antes.danoPorTurno);
      expect(agora.cdResistencia).toBeGreaterThan(antes.cdResistencia);
    }
  });
});

describe("Apêndice G — os papéis", () => {
  it("lacaio usa metade do PV e do dano do patamar", () => {
    const molde = MOLDES_CRIATURA[2]; // 3º — Ameaça: 90 PV, ~35 de dano
    expect(aplicarPapel(3, "lacaio")).toEqual({
      pv: Math.round(molde.pv / 2),
      danoPorTurno: Math.round(molde.danoPorTurno / 2),
    });
  });

  it("chefe dobra o PV e MANTÉM o dano", () => {
    const molde = MOLDES_CRIATURA[3]; // 4º — Elite
    expect(aplicarPapel(4, "chefe")).toEqual({
      pv: molde.pv * 2,
      danoPorTurno: molde.danoPorTurno,
    });
  });

  it("padrão não mexe em nada", () => {
    const molde = MOLDES_CRIATURA[0];
    expect(aplicarPapel(1, "padrao")).toEqual({ pv: molde.pv, danoPorTurno: molde.danoPorTurno });
  });
});

describe("a rodada extra do chefe", () => {
  it("não se aplica a grupo de três ou menos — ela compensa números, não pune mesa pequena", () => {
    expect(rodadasDoChefe(1)).toBe(1);
    expect(rodadasDoChefe(3)).toBe(1);
  });

  it("dá uma rodada a cada dois personagens, arredondando pra baixo", () => {
    expect(rodadasDoChefe(4)).toBe(2);
    expect(rodadasDoChefe(5)).toBe(2); // o exemplo do livro: grupo de cinco, chefe age duas vezes
    expect(rodadasDoChefe(6)).toBe(3);
    expect(rodadasDoChefe(7)).toBe(3);
  });
});

describe("simularEncontro", () => {
  const grupo = [
    espadachim("A", "Avançado"),
    espadachim("B", "Avançado"),
    espadachim("C", "Avançado"),
  ];

  function criatura(patch: Partial<CriaturaEncontro> = {}): CriaturaEncontro {
    return { ...criaturaDoMolde(3, "padrao", "Bicho", "c1"), ...patch };
  }

  it("é reproduzível: mesma semente, mesmo resultado", () => {
    const opcoes = { batalhas: 60, semente: 7 };
    const a = simularEncontro(grupo, [criatura()], opcoes);
    const b = simularEncontro(grupo, [criatura()], opcoes);
    expect(a).toEqual(b);
  });

  it("sementes diferentes dão resultados diferentes — não é uma constante disfarçada", () => {
    const a = simularEncontro(grupo, [criatura()], { batalhas: 60, semente: 1 });
    const b = simularEncontro(grupo, [criatura()], { batalhas: 60, semente: 99 });
    expect(a).not.toEqual(b);
  });

  it("as três frações somam 1: toda batalha vira vitória, TPK ou empate", () => {
    const r = simularEncontro(grupo, [criatura()], { batalhas: 80, semente: 3 });
    expect(r.vitorias + r.tpk + r.empates).toBeCloseTo(1, 10);
  });

  it("um lacaio de 1º patamar não ameaça um grupo Avançado", () => {
    const r = simularEncontro(grupo, [criatura({ ...criaturaDoMolde(1, "lacaio", "Rato", "r"), quantidade: 1 })], {
      batalhas: 120,
      semente: 11,
    });
    expect(r.vitorias).toBeGreaterThan(0.95);
    expect(avaliar(r).faixa === "trivial" || avaliar(r).faixa === "facil").toBe(true);
  });

  it("um chefe Lenda contra Principiantes é letal", () => {
    const novatos = [espadachim("X", "Principiante", 2), espadachim("Y", "Principiante", 2)];
    const r = simularEncontro(novatos, [criaturaDoMolde(6, "chefe", "Lenda", "l")], {
      batalhas: 120,
      semente: 13,
    });
    expect(r.vitorias).toBeLessThan(0.2);
    expect(avaliar(r).faixa).toBe("letal");
  });

  it("mais criaturas do mesmo tipo derrubam a taxa de vitória", () => {
    const poucas = simularEncontro(grupo, [criatura({ quantidade: 1 })], { batalhas: 120, semente: 5 });
    const muitas = simularEncontro(grupo, [criatura({ quantidade: 6 })], { batalhas: 120, semente: 5 });
    expect(muitas.vitorias).toBeLessThan(poucas.vitorias);
  });

  it("a escala infla a criatura: escala maior, menos vitórias", () => {
    const base = { batalhas: 120, semente: 17 };
    const fraca = simularEncontro(grupo, [criatura()], { ...base, escala: 0.5 });
    const forte = simularEncontro(grupo, [criatura()], { ...base, escala: 3 });
    expect(forte.vitorias).toBeLessThan(fraca.vitorias);
  });

  it("relata uma linha por personagem do grupo", () => {
    const r = simularEncontro(grupo, [criatura()], { batalhas: 40, semente: 2 });
    expect(r.porPersonagem.map((p) => p.nome)).toEqual(["A", "B", "C"]);
  });
});

describe("avaliar — as faixas", () => {
  function resultado(patch: Partial<ResultadoEncontro>): ResultadoEncontro {
    return {
      batalhas: 100,
      vitorias: 1,
      tpk: 0,
      empates: 0,
      rodadasMedia: 4,
      quedasMedia: 0,
      pvRestante: 1,
      porPersonagem: [],
      ...patch,
    };
  }

  it("vitória baixa é Letal, e o TPK muda o texto sem mudar a faixa", () => {
    expect(avaliar(resultado({ vitorias: 0.3, tpk: 0.6 })).faixa).toBe("letal");
    expect(avaliar(resultado({ vitorias: 0.3, tpk: 0.1 })).faixa).toBe("letal");
    expect(avaliar(resultado({ vitorias: 0.3, tpk: 0.6 })).resumo).not.toBe(
      avaliar(resultado({ vitorias: 0.3, tpk: 0.1 })).resumo
    );
  });

  it("vencer sempre mas perder muita gente ainda é Perigoso", () => {
    // O grupo ganha 100% das vezes e mesmo assim perde dois personagens por
    // combate: taxa de vitória sozinha não descreve o encontro.
    expect(avaliar(resultado({ vitorias: 1, quedasMedia: 2 })).faixa).toBe("perigoso");
  });

  it("vitória quase certa com alguém caindo é Equilibrado", () => {
    expect(avaliar(resultado({ vitorias: 0.99, quedasMedia: 0.6 })).faixa).toBe("equilibrado");
  });

  it("vitória total sem baixas é Fácil se o combate dura, e Trivial se acaba na hora", () => {
    expect(avaliar(resultado({ vitorias: 1, quedasMedia: 0, rodadasMedia: 5 })).faixa).toBe("facil");
    expect(avaliar(resultado({ vitorias: 1, quedasMedia: 0, rodadasMedia: 1.4 })).faixa).toBe("trivial");
  });
});

describe("ajustarParaEquilibrio", () => {
  /** Curva sintética e monótona: quanto maior a escala, menor a vitória. */
  function medidor(dureza: number) {
    return (escala: number): ResultadoEncontro => ({
      batalhas: 100,
      vitorias: Math.max(0, Math.min(1, 1 - escala / dureza)),
      tpk: 0,
      empates: 0,
      rodadasMedia: 3,
      quedasMedia: 0.5,
      pvRestante: 0.5,
      porPersonagem: [],
    });
  }

  it("acha a escala em que a vitória encosta no alvo", () => {
    const ajuste = ajustarParaEquilibrio(medidor(10), 0.92);
    expect(ajuste).not.toBeNull();
    // vitoria = 1 - escala/10 = 0,92 → escala = 0,8
    expect(ajuste!.escala).toBeGreaterThan(0.7);
    expect(ajuste!.escala).toBeLessThanOrEqual(0.8);
    expect(ajuste!.vitoriaProjetada).toBeGreaterThanOrEqual(0.92);
  });

  it("devolve null quando nem a criatura mínima chega ao alvo — o problema é a composição", () => {
    // dureza 0,1: até a escala mínima (0,2) já zera a vitória.
    expect(ajustarParaEquilibrio(medidor(0.1), 0.92)).toBeNull();
  });

  it("devolve null quando nem a criatura máxima ameaça o grupo", () => {
    // Vitória sempre 100%, qualquer escala: inflar não resolve.
    const sempreGanha = (): ResultadoEncontro => ({
      batalhas: 100,
      vitorias: 1,
      tpk: 0,
      empates: 0,
      rodadasMedia: 2,
      quedasMedia: 0,
      pvRestante: 1,
      porPersonagem: [],
    });
    expect(ajustarParaEquilibrio(sempreGanha, 0.92)).toBeNull();
  });
});

describe("utilidades", () => {
  it("arredondarPv cai em múltiplo de 5 e nunca abaixo de 5", () => {
    expect(arredondarPv(147)).toBe(145);
    expect(arredondarPv(148)).toBe(150);
    expect(arredondarPv(0.4)).toBe(5);
  });

  it("patamarDaFicha devolve o maior patamar aberto, em qualquer árvore", () => {
    expect(patamarDaFicha(ficha())).toBe(0);
    expect(patamarDaFicha(espadachim("z", "Principiante"))).toBe(1);
    expect(patamarDaFicha(espadachim("z", "Avançado"))).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// As ações da criatura (2026-09-03)
// ---------------------------------------------------------------------------
describe("fórmulas com modificador fixo", () => {
  it("lê o '+5' de '4d8+5', que as funções de magia ignoram de propósito", () => {
    expect(modificadorFixo("4d8+5")).toBe(5);
    expect(modificadorFixo("2d6-2")).toBe(-2);
    expect(modificadorFixo("3d10")).toBe(0);
    // O "d8" não pode ser lido como um +8 solto.
    expect(modificadorFixo("1d8")).toBe(0);
  });

  it("média e teto somam o fixo uma vez só", () => {
    expect(mediaFormula("4d8+5")).toBe(4 * 4.5 + 5);
    expect(maxFormula("4d8+5")).toBe(37);
    expect(mediaFormula("1d6")).toBe(3.5);
  });

  it("temDano separa o golpe da manobra", () => {
    expect(temDano("2d6")).toBe(true);
    expect(temDano("+3")).toBe(true);
    expect(temDano("")).toBe(false);
  });
});

describe("planoDoTurno", () => {
  function comAcoes(...acoes: Partial<AcaoCriatura>[]): CriaturaEncontro {
    return {
      ...criaturaDoMolde(3, "padrao", "Bicho", "c1"),
      acoes: acoes.map((a, i) => ({
        id: `a${i}`,
        nome: `Ação ${i}`,
        acoes: 1,
        dano: "1d6",
        alcance: "",
        area: false,
        tipo: "ataque" as const,
        nota: "",
        ...a,
      })),
    };
  }

  it("gasta as três Ações no melhor dano médio POR AÇÃO", () => {
    // 2d6 (7) numa Ação bate 5d6 (17,5) em três: 7/Ação contra 5,8/Ação.
    const c = comAcoes({ id: "rapida", dano: "2d6", acoes: 1 }, { id: "lenta", dano: "5d6", acoes: 3 });
    expect(planoDoTurno(c).map((a) => a.id)).toEqual(["rapida", "rapida", "rapida"]);
    expect(danoDasAcoesPorRodada(c)).toBe(21);
  });

  it("usa a ação cara quando ela rende mais por Ação, e completa o turno com a barata", () => {
    // 6d6 (21) em 2 Ações = 10,5/Ação; 1d6 (3,5) em 1.
    const c = comAcoes({ id: "cara", dano: "6d6", acoes: 2 }, { id: "barata", dano: "1d6", acoes: 1 });
    expect(planoDoTurno(c).map((a) => a.id)).toEqual(["cara", "barata"]);
  });

  it("ignora manobra sem dano — a teia monta a armadilha, não é o golpe", () => {
    const c = comAcoes({ id: "presas", dano: "2d6" }, { id: "teia", dano: "" });
    expect(planoDoTurno(c).every((a) => a.id === "presas")).toBe(true);
    expect(usaAcoes(comAcoes({ dano: "" }))).toBe(false);
  });
});

describe("criatura com ações declaradas", () => {
  const grupo = [espadachim("A", "Avançado"), espadachim("B", "Avançado"), espadachim("C", "Avançado")];

  /** A mesma criatura, escrita das duas formas: orçamento fixo e ações. */
  function orcamento(dano: number): CriaturaEncontro {
    return { ...criaturaDoMolde(3, "padrao", "Bicho", "c1"), danoPorTurno: dano, quantidade: 2 };
  }
  function comAcoes(dano: string): CriaturaEncontro {
    return {
      ...orcamento(0),
      acoes: [
        { id: "golpe", nome: "Golpe", acoes: 1, dano, alcance: "", area: false, tipo: "ataque", nota: "" },
      ],
    };
  }

  it("continua reproduzível: mesma semente, mesmo resultado", () => {
    const opcoes = { batalhas: 60, semente: 7 };
    expect(simularEncontro(grupo, [comAcoes("2d8+3")], opcoes)).toEqual(
      simularEncontro(grupo, [comAcoes("2d8+3")], opcoes)
    );
  });

  it("quem manda é a ação, não o Dano/turno: as duas têm o mesmo orçamento e machucam diferente", () => {
    // `danoPorTurno` é 0 nas duas (o motor o trata como o mínimo de 1). A das
    // ações tira PV de verdade; a do orçamento zerado mal arranha.
    const base = { batalhas: 150, semente: 21 };
    const inofensiva = simularEncontro(grupo, [orcamento(0)], base);
    const armada = simularEncontro(grupo, [comAcoes("2d8+3")], base);
    expect(inofensiva.pvRestante).toBeGreaterThan(0.95);
    expect(armada.pvRestante).toBeLessThan(inofensiva.pvRestante - 0.05);
  });

  it("dano maior nas ações derruba a taxa de vitória", () => {
    const base = { batalhas: 150, semente: 23 };
    const fraca = simularEncontro(grupo, [comAcoes("1d6")], base);
    const forte = simularEncontro(grupo, [comAcoes("8d12+20")], base);
    expect(forte.vitorias).toBeLessThan(fraca.vitorias);
  });

  it("a escala do ajuste automático também escala o dano das ações", () => {
    const base = { batalhas: 150, semente: 29 };
    const pequena = simularEncontro(grupo, [comAcoes("2d8+3")], { ...base, escala: 0.3 });
    const grande = simularEncontro(grupo, [comAcoes("2d8+3")], { ...base, escala: 4 });
    expect(grande.vitorias).toBeLessThan(pequena.vitorias);
  });

  it("ação em área pega o grupo inteiro, e a de alvo único não", () => {
    const emArea = comAcoes("3d10");
    emArea.acoes[0].area = true;
    const base = { batalhas: 120, semente: 31 };
    const unico = simularEncontro(grupo, [comAcoes("3d10")], base);
    const area = simularEncontro(grupo, [emArea], base);
    expect(area.pvRestante).toBeLessThan(unico.pvRestante);
  });
});

describe("as criaturas prontas do Apêndice G", () => {
  it("todas trazem ações escritas — uma criatura pronta sem ação não serve de exemplo", () => {
    for (const pronta of CRIATURAS_PRONTAS) {
      expect(pronta.acoes.length).toBeGreaterThan(0);
    }
  });

  it("o turno de três Ações entrega o Dano por Turno do molde, com 15% de folga", () => {
    // É esta igualdade que faz a criatura pronta valer o mesmo resolvida por
    // rolagem ou por orçamento — e é o que garante que ligar as ações não
    // invalidou a calibragem publicada do Apêndice G.
    for (const pronta of CRIATURAS_PRONTAS) {
      const criatura: CriaturaEncontro = {
        ...criaturaDoMolde(pronta.patamar, pronta.papel, pronta.nome, pronta.id),
        acoes: pronta.acoes.map((a, i) => ({ ...a, id: `${pronta.id}-${i}` })),
      };
      const orcamento = aplicarPapel(pronta.patamar, pronta.papel).danoPorTurno;
      const razao = danoDasAcoesPorRodada(criatura) / orcamento;
      expect(razao, `${pronta.nome}: ${danoDasAcoesPorRodada(criatura)} contra ${orcamento}`).toBeGreaterThan(0.85);
      expect(razao, `${pronta.nome}: ${danoDasAcoesPorRodada(criatura)} contra ${orcamento}`).toBeLessThan(1.15);
    }
  });
});
