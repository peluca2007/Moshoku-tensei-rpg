import { describe, expect, it } from "vitest";
import {
  Alvo,
  EstadoPersonagem,
  acoesDe,
  aplicarDano,
  casoBase,
  curar,
  darPvTemp,
  escolherAcao,
  escolherSuporte,
  makeRng,
  montarFicha,
  novaAcao,
  novoAlvo,
  novoEstado,
  turnoPersonagem,
} from "./combatSim";
import { getTreeById } from "@/data/trees";
import { AttributeKey, CharacterData } from "./types";

/**
 * Cura, PV Temporários e Ferida Fresca — o que a 0.1.37 acrescentou ao motor.
 *
 * ## Por que este arquivo existe
 *
 * Por três versões o simulador media todo mundo por dano, e `acoesDe`
 * DESCARTAVA cura e PV Temporários com um filtro de texto. O filtro estava
 * certo em recusar — os três moram no mesmo campo do livro e o sinal é oposto,
 * e somar cura como dano já contou a Prontidão como 105 de dano por turno. O
 * erro era parar aí: a escola de Cura entrava no playtest com 2 de 23
 * habilidades visíveis, e o relatório então declarava a curandeira fraca por
 * não bater, que é a única coisa que ela não faz.
 *
 * ## O erro específico que estes testes impedem de voltar
 *
 * `rolarDados` soma TODO grupo de dados que encontra na fórmula, e o livro
 * escreve os dois casos na mesma linha: *"2d8 + BC de PV (4d8 + BC se Ferida
 * Fresca)"*. A linha crua rola 2d8+4d8, e dobrar isso por Ferida Fresca
 * devolveria 12d8 onde o livro promete 4d8 — uma cura três vezes maior que a
 * escrita, num relatório que serve pra calibrar o livro. Foi medido: com o erro
 * dentro, o time da curandeira ganhava 20,1% das batalhas; com ele corrigido,
 * 8,3%.
 */

const ZERO: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

/** Um personagem que comprou tudo de uma árvore, pra varrer as habilidades dela. */
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

describe("o caso base de uma fórmula que descreve vários", () => {
  /*
   * Este é o teste que trava o erro caro. Se `casoBase` parar de cortar, a
   * fórmula inteira volta pra `rolarDados` e toda magia de Cura do livro passa
   * a curar a soma dos dois casos dela.
   */
  it("corta no parêntese, que é onde o livro põe a exceção", () => {
    expect(casoBase("2d8 + BC de PV (4d8 + BC se Ferida Fresca)")).toBe("2d8 + BC de PV");
    expect(casoBase("6d8 + BC de PV (12d8 + BC se Ferida Fresca)")).toBe("6d8 + BC de PV");
  });

  it("corta na vírgula, que é o outro separador que o livro usa", () => {
    expect(casoBase("2d8 + BC de PV, sempre como Ferida Fresca: 4d8 + BC")).toBe("2d8 + BC de PV");
  });

  it("deixa em paz a fórmula que só descreve um caso", () => {
    expect(casoBase("2d6 + BC de PV por turno")).toBe("2d6 + BC de PV por turno");
    expect(casoBase("1d8 + BC de PV Temporários")).toBe("1d8 + BC de PV Temporários");
  });
});

describe("as ações de suporte deixaram de ser descartadas", () => {
  const cura = acoesDe(comArvoreInteira("cura"));

  it("a escola de Cura traz ações de cura, e não zero", () => {
    const curas = cura.filter((a) => a.tipo === "cura");
    // Seis, na medição de 2026-09-10. A asserção é "mais que uma" de propósito:
    // travar o número exato quebraria quando o livro ganhar uma magia nova.
    expect(curas.length).toBeGreaterThan(1);
  });

  it("a ação de suporte tem a fórmula de DANO vazia", () => {
    /*
     * A salvaguarda estrutural: o campo do livro é o mesmo pros três tipos e o
     * sinal é oposto. Com `dano` vazio, uma cura que vaze pro caminho de dano
     * soma zero — `mediaDados("")` é 0 — em vez de curar o inimigo.
     */
    for (const a of cura.filter((x) => x.tipo !== "dano")) {
      expect(a.dano, `${a.nome} traz fórmula no campo de dano`).toBe("");
      expect(a.formulaSuporte.length, `${a.nome} não tem fórmula de suporte`).toBeGreaterThan(0);
    }
  });

  it("PV Temporários são classificados como escudo, e não como cura", () => {
    const barreira = acoesDe(comArvoreInteira("barreira"));
    const casca = barreira.find((a) => a.nome === "Casca");
    expect(casca?.tipo).toBe("escudo");
  });

  it("a Prontidão cura sempre como Ferida Fresca — é o que define a escola", () => {
    expect(cura.find((a) => a.nome === "Prontidão")?.sempreFresca).toBe(true);
    expect(cura.find((a) => a.nome === "Cura")?.sempreFresca).toBe(false);
  });

  it("a escolha de ATAQUE nunca devolve uma ação de suporte", () => {
    // Sem este filtro a IA gastaria o turno numa cura resolvida como dano, com
    // fórmula vazia: zero de dano e o turno queimado.
    const e = novoEstado(montarFicha(comArvoreInteira("cura")));
    const inimigo = novoAlvo({ nome: "alvo", pv: 100, ca: 15 });
    for (let acoes = 1; acoes <= 3; acoes++) {
      expect(escolherAcao(e, acoes, inimigo).tipo).toBe("dano");
    }
  });
});

describe("PV Temporários e Ferida Fresca", () => {
  it("a casca é gasta antes dos PV reais", () => {
    const alvo = novoAlvo({ nome: "x", pv: 30, ca: 10, pvTemp: 10 });
    const real = aplicarDano(alvo, 4);
    expect(alvo.pvTemp).toBe(6);
    expect(alvo.pv, "a carne não devia ter sido tocada").toBe(30);
    expect(real, "dano absorvido não é dano sofrido").toBe(0);
  });

  it("o que passa da casca chega nos PV", () => {
    const alvo = novoAlvo({ nome: "x", pv: 30, ca: 10, pvTemp: 10 });
    expect(aplicarDano(alvo, 25)).toBe(15);
    expect(alvo.pvTemp).toBe(0);
    expect(alvo.pv).toBe(15);
  });

  it("levar golpe abre a janela da Ferida Fresca, mesmo se a casca comeu tudo", () => {
    const alvo = novoAlvo({ nome: "x", pv: 30, ca: 10, pvTemp: 10 });
    aplicarDano(alvo, 3);
    expect(alvo.feridaFresca, "quem levou o golpe levou o golpe").toBeGreaterThan(0);
  });

  it("os PV Temporários não acumulam: o maior vence", () => {
    const alvo = novoAlvo({ nome: "x", pv: 30, ca: 10 });
    expect(darPvTemp(alvo, 8)).toBe(8);
    expect(darPvTemp(alvo, 5), "uma casca menor não soma").toBe(0);
    expect(alvo.pvTemp).toBe(8);
    expect(darPvTemp(alvo, 12), "uma maior substitui e vale a diferença").toBe(4);
    expect(alvo.pvTemp).toBe(12);
  });
});

describe("a cura", () => {
  const ferido = (): Alvo => novoAlvo({ nome: "x", pv: 10, ca: 10 });

  it("dobra contra Ferida Fresca — a regra que faz o curandeiro agir cedo", () => {
    const fresco = ferido();
    fresco.feridaFresca = 2;
    expect(curar(fresco, 10, 100)).toBe(20);

    const frio = ferido();
    expect(curar(frio, 10, 100), "sem ferida fresca, o valor escrito").toBe(10);
  });

  it("respeita o teto de PV e devolve o que a mesa REALMENTE recebeu", () => {
    const quase = novoAlvo({ nome: "x", pv: 95, ca: 10 });
    // Curar 40 em quem está 5 abaixo do máximo vale 5. Contar o rolado faria um
    // curandeiro parecer melhor justamente quando desperdiça magia.
    expect(curar(quase, 40, 100)).toBe(5);
    expect(quase.pv).toBe(100);
  });

  it("não ressuscita: quem caiu não é alvo de cura neste motor", () => {
    const morto = novoAlvo({ nome: "x", pv: 0, ca: 10, vivo: false });
    expect(curar(morto, 30, 100)).toBe(0);
  });
});

describe("quando a IA decide curar em vez de bater", () => {
  function grupo(pvs: number[]): EstadoPersonagem[] {
    const e = novoEstado(montarFicha(comArvoreInteira("cura")));
    return pvs.map((pv, i) => ({ ...novoEstado(e.ficha), nome: `a${i}`, pv }));
  }

  /** Um curandeiro com exatamente as ações que o teste quer discutir. */
  function comAcoes(time: EstadoPersonagem[], acoes: ReturnType<typeof novaAcao>[]): EstadoPersonagem {
    const quem = time[time.length - 1];
    return { ...quem, ficha: { ...quem.ficha, acoes } };
  }

  const CURA_GRANDE = novaAcao({ nome: "grande", tipo: "cura", formulaSuporte: "4d8", acoes: 1 });
  const CURA_EM_AREA = novaAcao({ nome: "área", tipo: "cura", formulaSuporte: "1d8", acoes: 1, area: true });

  it("com o grupo inteiro, não há cura a fazer", () => {
    const time = grupo([100, 100]);
    expect(escolherSuporte(comAcoes(time, [CURA_GRANDE]), 3, time)).toBeNull();
  });

  /*
   * A casca é o caso oposto da cura, e de propósito: ela vale em quem AINDA não
   * tem casca, ferido ou não. Pré-escudar o grupo antes do primeiro golpe é o
   * que um jogador faz, e a regra aqui faz o mesmo.
   */
  it("mas há casca a dar em quem está inteiro e sem casca", () => {
    const time = grupo([100, 100]);
    const escudo = novaAcao({ nome: "casca", tipo: "escudo", formulaSuporte: "2d8" });
    expect(escolherSuporte(comAcoes(time, [escudo]), 3, time)?.acao.nome).toBe("casca");

    time.forEach((x) => (x.pvTemp = 5));
    expect(escolherSuporte(comAcoes(time, [escudo]), 3, time), "com todo mundo já de casca, nada").toBeNull();
  });

  it("escolhe o aliado mais ferido", () => {
    const time = grupo([5, 40, 100]);
    const escolha = escolherSuporte(time[2], 3, time);
    expect(escolha?.alvo.nome).toBe("a0");
  });

  /*
   * A regra de escolha ganhou o alcance da área na 0.1.37, e este teste é o
   * porquê: sem ele a Bênção Coletiva — 1d8 em TODO o grupo — perdia pra sempre
   * pra uma Cura de 2d8 num só, inclusive com quatro companheiros caindo ao
   * lado. Era uma magia que o livro tem e a simulação nunca escolhia.
   */
  it("com muitos feridos, a cura em área vence a cura maior num só", () => {
    // 1d8 (média 4,5) em quatro feridos vale 18; 4d8 (média 18) num só vale 18.
    // Com CINCO feridos a área passa na frente, e é o que a mesa vê.
    const muitos = grupo([10, 10, 10, 10, 10, 100]);
    const escolha = escolherSuporte(comAcoes(muitos, [CURA_GRANDE, CURA_EM_AREA]), 3, muitos);
    expect(escolha?.acao.nome, "com o grupo caindo, a de área").toBe("área");

    const um = grupo([10, 100]);
    expect(
      escolherSuporte(comAcoes(um, [CURA_GRANDE, CURA_EM_AREA]), 3, um)?.acao.nome,
      "com um ferido só, a maior individual"
    ).toBe("grande");
  });

  /*
   * A Prontidão é 1 Ação e cura SEMPRE como Ferida Fresca — 2d8 escritos que
   * valem 4d8. Se a escolha parar de contar essa dobra, ela passa a ser
   * comparada pela metade do que entrega, e a magia que o livro chama de "a
   * que define a escola" perde pra magias piores.
   */
  it("a escolha conta a dobra de quem cura sempre como Ferida Fresca", () => {
    const time = grupo([10, 100]);
    const prontidao = novaAcao({ nome: "pronta", tipo: "cura", formulaSuporte: "2d8", sempreFresca: true });
    const comum = novaAcao({ nome: "comum", tipo: "cura", formulaSuporte: "3d8" });
    expect(escolherSuporte(comAcoes(time, [comum, prontidao]), 3, time)?.acao.nome).toBe("pronta");
  });

  it("sem aliados, o turno continua sendo só de dano", () => {
    // É o que garante que o comparador de builds — uma ficha sozinha contra um
    // boneco — não mudou de número nenhum com esta versão.
    const solo = novoEstado(montarFicha(comArvoreInteira("cura")));
    expect(escolherSuporte(solo, 3, [])).toBeNull();
  });
});

describe("o efeito disso numa batalha inteira", () => {
  /*
   * O teste de ponta a ponta, e a razão de todo o resto existir: um grupo com
   * curandeiro tem que aguentar mais pancada que o mesmo grupo sem ele. Se esta
   * asserção cair, a cura voltou a não chegar na batalha — que era o estado do
   * motor até a 0.1.37.
   */
  it("um grupo com curandeiro sobrevive mais que o mesmo grupo sem cura", () => {
    const fichaCura = montarFicha(comArvoreInteira("cura"));

    function pvRestante(comCura: boolean): number {
      let soma = 0;
      for (let semente = 1; semente <= 200; semente++) {
        const rng = makeRng(semente);
        const time = [novoEstado(fichaCura), novoEstado(fichaCura)];
        time[0].nome = "curandeiro";
        time[1].nome = "companheiro";
        // O companheiro apanha todo turno; o curandeiro age.
        for (let rodada = 0; rodada < 6; rodada++) {
          aplicarDano(time[1], 6);
          if (!time[1].vivo) break;
          turnoPersonagem(time[0], [novoAlvo({ nome: "saco", pv: 10_000, ca: 30 })], rng, comCura ? time : []);
        }
        soma += Math.max(0, time[1].pv);
      }
      return soma / 200;
    }

    const com = pvRestante(true);
    const sem = pvRestante(false);
    expect(com, `com cura sobrou ${com.toFixed(1)}, sem cura ${sem.toFixed(1)}`).toBeGreaterThan(sem);
  });

  it("a janela da Ferida Fresca fecha com o passar dos turnos", () => {
    const rng = makeRng(1);
    const e = novoEstado(montarFicha(comArvoreInteira("cura")));
    aplicarDano(e, 1);
    expect(e.feridaFresca).toBe(2);
    turnoPersonagem(e, [novoAlvo({ nome: "s", pv: 10_000, ca: 30 })], rng);
    expect(e.feridaFresca, "um turno depois, ainda fresca").toBe(1);
    turnoPersonagem(e, [novoAlvo({ nome: "s", pv: 10_000, ca: 30 })], rng);
    expect(e.feridaFresca, "dois turnos depois, a carne fechou").toBe(0);
  });

  it("uma ação de cura nunca vira dano", () => {
    // O pesadelo do campo compartilhado: a cura chegando no inimigo como golpe.
    const rng = makeRng(7);
    const e = novoEstado(montarFicha(comArvoreInteira("cura")));
    const inimigo = novoAlvo({ nome: "inimigo", pv: 500, ca: 12 });
    const antes = inimigo.pv;
    const aliados = [e, { ...novoEstado(e.ficha), nome: "ferido", pv: 1 }];
    turnoPersonagem(e, [inimigo], rng, aliados);
    expect(inimigo.pv, "o inimigo não pode ter sido CURADO").toBeLessThanOrEqual(antes);
  });

  it("a ação de suporte sai como suporte na fábrica, sem herdar dano", () => {
    const a = novaAcao({ nome: "teste", tipo: "cura", formulaSuporte: "2d8" });
    expect(a.dano).toBe("");
    expect(a.ataque).toBe(false);
  });
});
