import { describe, expect, it } from "vitest";
import { Acao, Alvo, acoesDe, makeRng, montarFicha, novoEstado, resolver, SIMPLIFICACOES } from "./combatSim";
import { getTreeById, TREES } from "@/data/trees";
import { AttributeKey, CharacterData } from "./types";

/**
 * Quebrantado dentro da simulação — 0.1.35.
 *
 * ## Por que este teste existe separado
 *
 * Porque a condição entrou no motor lendo PROSA. Todo o resto de `acoesDe` lê
 * `damage.normal`, um campo estruturado; `aplicaQuebrantado` lê `effect`, que é
 * texto escrito pra humano. Isso funciona hoje e continua funcionando enquanto
 * ninguém reescrever uma frase — e "ninguém reescreveu a frase" não é coisa que
 * se possa supor num livro que ainda está sendo escrito.
 *
 * Se alguém trocar "ganha 2 acúmulos de Quebrantado" por "fica 2 vezes
 * Quebrantado", o motor volta a devolver Armas Pesadas mais fraca do que ela é
 * — em silêncio, e com um número de aparência plausível no comparador de
 * builds. É o tipo de erro que só um teste pega.
 */

const ZERO: Record<AttributeKey, number> = {
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
    attributeBase: { ...ZERO },
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
    condicoes: [],
    descansosCurtos: 0,
    overrides: {},
    ...patch,
  } as unknown as CharacterData;
}

/** Uma lutadora de Armas Pesadas com tudo que a árvore dá até os patamares pedidos. */
function pesado(ranks: string[]): CharacterData {
  const tree = getTreeById("armas-pesadas");
  const compras = (tree?.ranks ?? [])
    .filter((r) => ranks.includes(r.rank))
    .flatMap((r) =>
      r.abilities.map((a) => ({ kind: "ability" as const, treeId: "armas-pesadas", rank: r.rank, id: a.id }))
    );
  return ficha({
    name: "Bruta",
    attributeBase: { ...ZERO, forca: 6, vigor: 5, agilidade: 3 },
    startingTreeId: "armas-pesadas",
    unlockedRanks: ranks.map((rank) => ({ treeId: "armas-pesadas", rank })) as CharacterData["unlockedRanks"],
    purchasedAbilities: compras,
  });
}

function boneco(ca = 15, pv = 10_000): Alvo {
  return {
    nome: "boneco",
    pv,
    ca,
    vivo: true,
    molhado: false,
    emChamas: 0,
    quebrantado: 0,
    preso: false,
    caido: false,
    envenenado: false,
    reacaoDisponivel: false,
    danoCausado: 0,
  };
}

function acaoDeTeste(patch: Partial<Acao> = {}): Acao {
  return {
    nome: "teste",
    acoes: 1,
    pm: 0,
    pt: 0,
    dano: "10",
    dadosDeArma: 0,
    area: false,
    ataque: false,
    frio: false,
    fogo: false,
    aplicaMolhado: false,
    aplicaQuebrantado: 0,
    ...patch,
  };
}

/* ------------------------------------------------------------------------- */
/* A leitura da prosa                                                         */
/* ------------------------------------------------------------------------- */

describe("o motor enxerga os acúmulos que o livro escreve", () => {
  const acoes = acoesDe(pesado(["Principiante", "Intermediário", "Avançado", "Santo", "Rei"]));
  const porNome = (nome: string) => acoes.find((a) => a.nome.startsWith(nome));

  it("lê o número quando o livro dá o número", () => {
    // "o alvo fica Caído e ganha 2 acúmulos de Quebrantado"
    expect(porNome("Investida Devastadora")?.aplicaQuebrantado).toBe(2);
    // "acerta automaticamente e aplica 3 acúmulos de Quebrantado"
    expect(porNome("Esmagar")?.aplicaQuebrantado).toBe(3);
    // "Falha: dano, Caído e 1 acúmulo de Quebrantado" — no singular
    expect(porNome("Onda de Choque")?.aplicaQuebrantado).toBe(1);
  });

  it('lê "ao máximo" e "iguais ao seu Bônus de Rank" como o teto, não como um acúmulo', () => {
    expect(porNome("Ruína")?.aplicaQuebrantado).toBe("maximo");
    expect(porNome("Prensa")?.aplicaQuebrantado).toBe("maximo");
  });

  it("não vê Quebrantado onde não há", () => {
    const semNada = acoes.filter((a) => !/Investida|Esmagar|Onda de Choque|Ruína|Prensa/.test(a.nome));
    expect(semNada.length).toBeGreaterThan(0);
    for (const a of semNada) expect(a.aplicaQuebrantado, a.nome).toBe(0);
  });

  /*
   * Esta é a asserção que sustenta a decisão de ler prosa.
   *
   * Ler `effect` é seguro enquanto a condição for de uma árvore só e ninguém a
   * REMOVER — o dia em que outra árvore escrever "remove todos os acúmulos de
   * Quebrantado", o leitor acima passa a contar remoção como aplicação. Este
   * teste é o alarme: ele quebra na hora em que a premissa deixar de valer.
   */
  it("nenhuma outra árvore do livro toca na condição — é o que torna seguro ler a prosa", () => {
    const citacoes = new Set<string>();
    for (const t of TREES) {
      for (const r of t.ranks) {
        for (const a of r.abilities ?? []) {
          const prosa = `${a.effect ?? ""} ${a.damage?.normal ?? ""}`;
          if (/quebrantad/i.test(prosa)) citacoes.add(t.id);
        }
      }
    }
    expect(citacoes).toEqual(new Set(["armas-pesadas"]));
  });

  it("e nenhuma delas REMOVE acúmulos — remoção lida como aplicação seria o erro silencioso", () => {
    for (const t of TREES) {
      for (const r of t.ranks) {
        for (const a of r.abilities ?? []) {
          if (!/quebrantad/i.test(a.effect ?? "")) continue;
          expect(a.effect, `${t.id} · ${a.name}`).not.toMatch(/remove|perde|elimina|dissipa/i);
        }
      }
    }
  });
});

/* ------------------------------------------------------------------------- */
/* O efeito                                                                   */
/* ------------------------------------------------------------------------- */

describe("o efeito dos acúmulos", () => {
  it("empilha até o Bônus de Rank de quem aplicou, e para ali", () => {
    const e = novoEstado(montarFicha(pesado(["Principiante", "Intermediário", "Avançado"])));
    const alvo = boneco();
    const rng = makeRng(1);
    // Esmagar aplica 3 de uma vez; dez golpes desses não passam do teto.
    for (let i = 0; i < 10; i++) resolver(e, acaoDeTeste({ aplicaQuebrantado: 3 }), alvo, rng);
    expect(e.ficha.bonusDeRank).toBeGreaterThan(0);
    expect(alvo.quebrantado).toBe(e.ficha.bonusDeRank);
  });

  it('"ao máximo" chega ao teto num golpe só', () => {
    const e = novoEstado(montarFicha(pesado(["Principiante", "Intermediário", "Avançado", "Santo"])));
    const alvo = boneco();
    resolver(e, acaoDeTeste({ aplicaQuebrantado: "maximo" }), alvo, makeRng(2));
    expect(alvo.quebrantado).toBe(e.ficha.bonusDeRank);
  });

  it("um acúmulo de quem bate mais fraco vale exatamente 1 de dano a menos", () => {
    const limpo = novoEstado(montarFicha(pesado(["Principiante"])));
    const ferido = novoEstado(montarFicha(pesado(["Principiante"])));
    ferido.quebrantado = 3;
    const acao = acaoDeTeste({ dano: "10" });

    const a = resolver(limpo, acao, boneco(), makeRng(5));
    const b = resolver(ferido, acao, boneco(), makeRng(5));
    expect(a - b).toBe(3);
  });

  it("nunca vira cura: dano menor que os acúmulos para no zero", () => {
    const e = novoEstado(montarFicha(pesado(["Principiante"])));
    e.quebrantado = 99;
    expect(resolver(e, acaoDeTeste({ dano: "1" }), boneco(), makeRng(3))).toBe(0);
  });
});

/*
 * A CA merece contagem, e não uma rolagem só: o efeito é probabilístico.
 *
 * A comparação é feita SEMENTE A SEMENTE — a mesma semente contra o alvo
 * intacto e contra o quebrado —, então o primeiro d20 das duas é o mesmo
 * número. Com CA menor, todo acerto do intacto continua sendo acerto do
 * quebrado: a relação é de contido, não de média, e por isso não depende de
 * quantas rodadas o teste roda.
 */
describe("cada acúmulo tira 1 da CA do alvo", () => {
  const e = novoEstado(montarFicha(pesado(["Principiante"])));
  const acao = acaoDeTeste({ ataque: true, dano: "10" });
  const CA = e.ficha.bc + 15; // alta o bastante pra sobrar espaço pros 5 acúmulos

  function acertos(quebrantado: number): number {
    let n = 0;
    for (let semente = 1; semente <= 400; semente++) {
      const alvo = { ...boneco(CA), quebrantado };
      if (resolver(e, acao, alvo, makeRng(semente)) > 0) n++;
    }
    return n;
  }

  it("o alvo quebrado é acertado mais vezes que o intacto", () => {
    expect(acertos(5)).toBeGreaterThan(acertos(0));
  });

  it("mais acúmulos nunca acertam menos", () => {
    const curva = [0, 1, 2, 3, 4, 5].map(acertos);
    for (let i = 1; i < curva.length; i++) {
      expect(curva[i], `de ${i - 1} pra ${i} acúmulos`).toBeGreaterThanOrEqual(curva[i - 1]);
    }
  });

  it("a CA nunca desce abaixo de 1: um monte de acúmulos não vira acerto automático", () => {
    // CA 3 com 50 acúmulos. Sem o piso, a CA seria negativa e até o 1 natural
    // acertaria — e o 1 natural é falha automática em qualquer caso (Cap. 1).
    let erros = 0;
    for (let semente = 1; semente <= 400; semente++) {
      const alvo = { ...boneco(3), quebrantado: 50 };
      if (resolver(e, acao, alvo, makeRng(semente)) === 0) erros++;
    }
    expect(erros).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------------- */
/* A declaração na tela                                                       */
/* ------------------------------------------------------------------------- */

describe("o que a simulação declara ao Mestre", () => {
  it("não diz mais que Quebrantado fica de fora", () => {
    const condicoes = SIMPLIFICACOES.find((s) => s.startsWith("Condições modeladas"))!;
    expect(condicoes).toContain("Quebrantado");
    expect(condicoes).not.toMatch(/Quebrantado[^.]*fica[m]? de fora/);
    // As quatro que continuam de fora seguem declaradas — a lista não pode
    // encolher em silêncio.
    for (const c of ["Atolado", "Desequilibrado", "Marcado", "Soterrado"]) {
      expect(condicoes, c).toContain(c);
    }
  });
});
