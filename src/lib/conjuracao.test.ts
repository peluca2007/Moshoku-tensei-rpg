import { describe, expect, it } from "vitest";
import {
  EstadoPersonagem,
  acoesDe,
  aplicarDano,
  escolherAcao,
  makeRng,
  montarFicha,
  novoAlvo,
  novoEstado,
  perdaDeFoco,
  testeDeConcentracao,
  turnoPersonagem,
} from "./combatSim";
import { TREES, getTreeById } from "@/data/trees";
import { AttributeKey, CharacterData } from "./types";

/**
 * Conjuração Contínua e Dividida — Cap. 4, §3 e Cap. 2, §6 (0.1.40).
 *
 * ## O buraco que isto fechou
 *
 * Um turno tem 3 Ações, e o custo de conjuração sobe com o rank: Avançado 3,
 * Santo 4, Rei 5, Imperador 6. Ou seja, **magia de Santo pra cima não cabe num
 * turno** — e o motor filtrava a escolha por `acoes <= acoesRestantes`.
 *
 * Resultado medido: VINTE ações de dano do livro eram inalcançáveis pela
 * simulação, e não as menores. Sol Menor, Zero Absoluto, Era Glacial, Vazio,
 * Flashover — as maiores magias do jogo nunca foram simuladas uma única vez.
 *
 * O livro não as proíbe. Ele manda **dividir o cântico** entre turnos, e cobra
 * por isso: Perda de Foco se você passar um turno sem recitar, e um teste de
 * Espírito toda vez que levar dano.
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
    name: "Conjurador",
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { ...ZERO, intelecto: 5, espirito: 5, vigor: 4, forca: 4 },
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

/*
 * Terra, de propósito: a Falha Geológica (Santo, 4 Ações) é a melhor por Ação
 * daquela árvore, então a IA de verdade a escolhe e o cântico dividido acontece
 * de ponta a ponta. Fogo e Água não serviriam — nelas, uma magia de 2 ou 3 Ações
 * rende mais por Ação que a de 6, e um teste que dependesse disso estaria
 * medindo BALANCEAMENTO em vez de mecânica. (Que só duas das seis árvores de
 * magia tenham a magia longa valendo a pena é um achado, e está no backlog.)
 */
const mago = (): EstadoPersonagem => novoEstado(montarFicha(comArvoreInteira("terra")));
const sacoDePancada = () => novoAlvo({ nome: "saco", pv: 100_000, ca: 10 });

describe("as magias que não cabem num turno", () => {
  it("existem, e são as maiores do livro", () => {
    const longas = acoesDe(comArvoreInteira("fogo")).filter((a) => a.acoes > 3);
    expect(longas.length, "Fogo tem magia de Santo pra cima").toBeGreaterThan(0);
  });

  it("são vinte, no livro inteiro — e nenhuma delas era simulável", () => {
    // O número exato não é travado (o livro cresce); o que se cobra é que
    // existam, porque até a 0.1.40 a resposta era zero de zero.
    const total = TREES.reduce(
      (n, t) => n + acoesDe(comArvoreInteira(t.id)).filter((a) => a.acoes > 3).length,
      0
    );
    expect(total).toBeGreaterThan(10);
  });

  it("a escolha as considera quando o turno está inteiro", () => {
    const e = mago();
    const escolhida = escolherAcao(e, 3, sacoDePancada(), true);
    // A Falha Geológica custa 4 Ações e é a melhor por Ação da Terra. Antes da
    // 0.1.40 ela não podia nem ser cogitada.
    expect(escolhida.acoes, `escolheu ${escolhida.nome}`).toBeGreaterThan(3);
  });

  /*
   * A regra de decisão declarada. Sem ela, um mago com 1 Ação sobrando largava o
   * golpe de arma pra começar um cântico de 3 Ações — gastando a sobra E
   * amarrando o turno seguinte. Medido: o time dos magos perdia 16 pontos de
   * vitória. O livro PERMITE dividir; não manda começar com as sobras.
   */
  it("mas NÃO as considera com as sobras do turno", () => {
    const e = mago();
    const escolhida = escolherAcao(e, 1, sacoDePancada(), false);
    expect(escolhida.acoes).toBeLessThanOrEqual(1);
  });
});

describe("o cântico dividido", () => {
  it("atravessa turnos e a magia sai no fim", () => {
    const rng = makeRng(11);
    const e = mago();
    const alvo = sacoDePancada();

    turnoPersonagem(e, [alvo], rng);
    expect(e.conjurando, "o primeiro turno inteiro foi pro cântico").not.toBeNull();
    expect(e.conjurando?.acoesGastas, "as três Ações do turno foram recitar").toBe(3);
    expect(alvo.pv, "e nada de dano ainda").toBe(100_000);

    let guarda = 0;
    while (e.conjurando && guarda++ < 5) turnoPersonagem(e, [alvo], rng);
    expect(e.conjurando, "o cântico terminou").toBeNull();
    expect(alvo.pv, "e a magia saiu").toBeLessThan(100_000);
  });

  it("o PM é investido quando o cântico COMEÇA, não quando a magia sai", () => {
    // É o que o livro chama de "o PM investido", e é o que se perde pela metade
    // quando alguém interrompe.
    const e = mago();
    const pmAntes = e.pm;
    turnoPersonagem(e, [sacoDePancada()], makeRng(11));
    expect(e.pm).toBeLessThan(pmAntes);
  });

  it("quem está conjurando não ataca", () => {
    // Cap. 2, §6: "você não pode fazer mais nada. Atacar, usar item, conjurar
    // outra magia ou usar Reação, não."
    const rng = makeRng(11);
    const e = mago();
    const alvo = sacoDePancada();
    turnoPersonagem(e, [alvo], rng);
    expect(e.conjurando, "começou a conjurar").not.toBeNull();
    expect(alvo.pv, "o turno inteiro foi cântico: nenhum golpe saiu").toBe(100_000);
  });
});

describe("o que derruba um cântico", () => {
  const d20Fixo = (valor: number) => () => (valor - 1) / 20 + 0.001;

  it("Perda de Foco: um turno inteiro sem recitar e a magia falha", () => {
    const e = mago();
    e.conjurando = { acao: e.ficha.acoes[0], acoesGastas: 2, acoesNesteTurno: 0 };
    perdaDeFoco(e);
    expect(e.conjurando, "a mana se perde e recomeça do zero").toBeNull();
  });

  it("mas 1 Ação recitada no turno segura o cântico", () => {
    const e = mago();
    e.conjurando = { acao: e.ficha.acoes[0], acoesGastas: 2, acoesNesteTurno: 1 };
    perdaDeFoco(e);
    expect(e.conjurando).not.toBeNull();
  });

  it("sofrer dano NÃO interrompe sozinho — interrompe FALHAR no teste", () => {
    const passa = mago();
    passa.conjurando = { acao: passa.ficha.acoes[0], acoesGastas: 2, acoesNesteTurno: 2 };
    testeDeConcentracao(passa, 2, d20Fixo(20));
    expect(passa.conjurando, "passou no teste: o cântico segue").not.toBeNull();
    expect(passa.conjurando?.acoesGastas, "e as Ações já gastas continuam valendo").toBe(2);

    const falha = mago();
    falha.conjurando = { acao: falha.ficha.acoes[0], acoesGastas: 2, acoesNesteTurno: 2 };
    testeDeConcentracao(falha, 6, d20Fixo(1));
    expect(falha.conjurando, "falhou: perdeu tudo que investiu").toBeNull();
  });

  it("quem interrompe devolve METADE do PM, não o total", () => {
    // O livro cobra metade, arredondado pra cima: quem foi interrompido perdeu
    // tempo e mana, mas não a magia inteira.
    const e = mago();
    const acao = e.ficha.acoes.find((a) => a.pm >= 4)!;
    e.pm = 0;
    e.conjurando = { acao, acoesGastas: 2, acoesNesteTurno: 2 };
    testeDeConcentracao(e, 6, d20Fixo(1));
    expect(e.pm).toBe(Math.floor(acao.pm / 2));
  });

  it("um golpe testa a concentração de quem conjura", () => {
    const e = mago();
    e.conjurando = { acao: e.ficha.acoes[0], acoesGastas: 2, acoesNesteTurno: 2 };
    // Bônus de Rank alto e 1 natural: a CD fica em 16 e o teste falha.
    aplicarDano(e, 5, 6, d20Fixo(1));
    expect(e.conjurando).toBeNull();
  });

  it("sem rng nenhum, o golpe não testa nada — é o caminho das contas puras", () => {
    const e = mago();
    e.conjurando = { acao: e.ficha.acoes[0], acoesGastas: 2, acoesNesteTurno: 2 };
    aplicarDano(e, 5, 6);
    expect(e.conjurando).not.toBeNull();
  });
});
