import { describe, expect, it } from "vitest";
import { resistenciasDe } from "@/lib/combatSim";
import { TREES } from "@/data/trees";
import type { CharacterData } from "@/lib/types";

/**
 * RESISTÊNCIA E IMUNIDADE DO PERSONAGEM — Cap. 4, §6 (0.1.90).
 *
 * ## O que a função faz
 *
 * Lê a prosa das Maestrias e habilidades do personagem e descobre a quais tipos
 * de dano ele resiste. Depois que o Apêndice G passou a dar Resistência às
 * criaturas, deixar o lado dos personagens de fora seria a mesma regra valendo
 * num sentido só.
 *
 * ## Por que ela tem MUITO teste
 *
 * Porque ler prosa erra, e erra caro. Cada caso abaixo é um falso positivo que
 * a primeira versão realmente produziu — a Arquearia saiu resistindo a
 * perfurante quando a carta dela diz o OPOSTO, o mago de Fogo saiu imune ao
 * próprio elemento, e o invocador saiu com a resistência do bicho dele. Nenhum
 * deles apareceria na tela como erro: apareceriam como um playtest otimista, e
 * o Mestre calibraria o encontro por um número inventado.
 */

/** Um personagem com a árvore inteira aberta e comprada. */
function comArvore(treeId: string): CharacterData {
  const t = TREES.find((x) => x.id === treeId)!;
  return {
    id: "teste",
    name: t.name,
    startingTreeId: t.id,
    unlockedRanks: t.ranks.map((r) => ({ treeId: t.id, rank: r.rank })),
    purchasedAbilities: t.ranks.flatMap((r) =>
      [...r.abilities, ...r.talents].map((a) => ({
        treeId: t.id,
        rank: r.rank,
        id: a.id,
        kind: "ability" as const,
      }))
    ),
  } as unknown as CharacterData;
}

describe("O que ela encontra de verdade", () => {
  it("o Deus do Norte é imune a veneno", () => {
    expect(resistenciasDe(comArvore("deus-do-norte")).imunidades).toContain("veneno");
  });

  it("o Punho do Fogo resiste a frio", () => {
    expect(resistenciasDe(comArvore("punho-de-fogo")).resistencias).toContain("frio");
  });

  it("quem não abriu árvore nenhuma não resiste a nada", () => {
    const vazio = { id: "x", unlockedRanks: [], purchasedAbilities: [] } as unknown as CharacterData;
    expect(resistenciasDe(vazio)).toEqual({ resistencias: [], imunidades: [] });
  });
});

describe("Os falsos positivos que ela NÃO pode cometer", () => {
  /*
   * "Suas magias de Fogo IGNORAM Resistência a dano ígneo e contundente" é uma
   * habilidade que FURA a resistência do alvo. A primeira versão procurava
   * "ignora" e deixava passar "ignoram".
   */
  it("'ignoram Resistência a X' não dá resistência a X", () => {
    const arqueiro = resistenciasDe(comArvore("arquearia"));
    expect(arqueiro.resistencias, "a Arquearia FURA Resistência a perfurante").not.toContain(
      "perfurante"
    );
  });

  it("'ignora Resistência E IMUNIDADE a dano ígneo' também não", () => {
    // O plasma do Fogo Imperador. Com uma janela curta, a segunda palavra
    // escapava e o mago de Fogo saía imune ao próprio elemento.
    const fogo = resistenciasDe(comArvore("fogo"));
    expect(fogo.imunidades, "o mago de Fogo não é imune ao próprio elemento").not.toContain("ígneo");
    expect(fogo.resistencias).not.toContain("ígneo");
  });

  /*
   * "Teste de resistência" é rolagem; "Resistência a dano" é metade do dano. A
   * palavra é a mesma e o significado não tem nada a ver.
   */
  it("'Vantagem em testes de resistência contra veneno' não é resistência a dano", () => {
    expect(resistenciasDe(comArvore("desintoxicacao")).resistencias).not.toContain("veneno");
  });

  it("a resistência do INVOCADO não é a do invocador", () => {
    // O Filhote Evolutivo chega a "PV = 25 × Bônus de Rank, Resistência a dano
    // físico" — dele, não de quem o chamou.
    const invocador = resistenciasDe(comArvore("invocacao"));
    expect(invocador.resistencias).not.toContain("físico");
  });

  it("resistência CONDICIONAL não entra, porque o motor não modela a condição", () => {
    // A Terra tem "Resistência a dano físico mundano enquanto estiver com os
    // pés no chão". Contar como permanente seria pior que não contar.
    const terra = resistenciasDe(comArvore("terra"));
    expect(terra.resistencias).not.toContain("físico");
  });

  it("nem resistência a dano MUNDANO, que o motor não sabe distinguir", () => {
    // A simulação não guarda se o golpe veio de arma mágica. Uma resistência a
    // "físico mundano" tratada como "físico" deixa o playtest otimista.
    for (const id of ["fogo", "terra"]) {
      expect(resistenciasDe(comArvore(id)).resistencias, id).not.toContain("físico");
    }
  });
});

describe("A varredura do livro inteiro fica dentro do razoável", () => {
  /*
   * A trava de sanidade. Se uma habilidade nova fizer a leitura disparar em
   * meia dúzia de árvores, é quase certo que a regex passou a pegar a palavra
   * errada — e é melhor descobrir aqui que num playtest que saiu otimista.
   */
  it("no máximo três árvores concedem resistência permanente e incondicional", () => {
    const comAlgo = TREES.filter((t) => {
      const r = resistenciasDe(comArvore(t.id));
      return r.resistencias.length > 0 || r.imunidades.length > 0;
    });
    expect(comAlgo.map((t) => t.name).join(", ")).toBeTruthy();
    expect(comAlgo.length).toBeLessThanOrEqual(3);
  });

  it("e nenhuma árvore acumula mais de dois tipos", () => {
    for (const t of TREES) {
      const r = resistenciasDe(comArvore(t.id));
      expect(r.resistencias.length + r.imunidades.length, t.name).toBeLessThanOrEqual(2);
    }
  });

  it("Imunidade engole Resistência: nunca as duas ao mesmo tipo", () => {
    for (const t of TREES) {
      const r = resistenciasDe(comArvore(t.id));
      for (const i of r.imunidades) expect(r.resistencias, t.name).not.toContain(i);
    }
  });
});
