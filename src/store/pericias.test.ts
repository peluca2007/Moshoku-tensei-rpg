import { beforeEach, describe, expect, it } from "vitest";
import { SKILLS } from "@/data/skills";
import { TREES } from "@/data/trees";
import { useCharacterStore } from "./useCharacterStore";
import { getBonusDePericia, getPericiasTreinadas } from "./selectors";

function ficha() {
  return useCharacterStore.getState().characters[useCharacterStore.getState().activeId!];
}

function comPatamar(treeId: string, rank: "Principiante" | "Intermediário" | "Avançado") {
  useCharacterStore.setState((s) => ({
    characters: {
      ...s.characters,
      [s.activeId!]: { ...s.characters[s.activeId!], unlockedRanks: [{ treeId, rank }] },
    },
  }));
}

beforeEach(() => {
  useCharacterStore.setState({ characters: {}, order: [], activeId: null, history: {} });
  useCharacterStore.getState().createCharacter("Teste");
});

/*
 * A lista `periciasCobertas` é a fonte da CONTA; a prosa `pericias` é o que o
 * livro imprime. Este bloco existe pra que as duas nunca divirjam em silêncio —
 * era exatamente o risco que impedia a rolagem de perícia de existir.
 */
describe("a lista e a prosa dizem a mesma coisa", () => {
  it("toda perícia coberta existe na Lista Mestre", () => {
    const nomes = new Set(SKILLS.map((s) => s.name));
    for (const t of TREES) {
      for (const nome of t.proficiencies?.periciasCobertas ?? []) {
        expect(nomes.has(nome), `${t.id} cobre "${nome}", que não existe na Lista Mestre`).toBe(true);
      }
    }
  });

  it("toda perícia coberta é citada na prosa da mesma árvore", () => {
    for (const t of TREES) {
      const prosa = t.proficiencies?.pericias ?? "";
      for (const nome of t.proficiencies?.periciasCobertas ?? []) {
        expect(prosa.includes(nome), `${t.id}: a lista tem "${nome}" e a prosa não o cita`).toBe(true);
      }
    }
  });

  /* O livro é explícito: somar em perícia é exclusivo das três de Utilidade. */
  it("só as árvores de Utilidade cobrem perícia", () => {
    for (const t of TREES) {
      const cobre = (t.proficiencies?.periciasCobertas ?? []).length > 0;
      if (cobre) expect(t.category, t.id).toBe("utilidade");
    }
  });

  it("as três de Utilidade cobrem alguma coisa — senão o campo não serviria pra nada", () => {
    const utilidade = TREES.filter((t) => t.category === "utilidade");
    expect(utilidade.length).toBe(3);
    for (const t of utilidade) {
      expect((t.proficiencies?.periciasCobertas ?? []).length, t.id).toBeGreaterThan(0);
    }
  });
});

describe("a conta do teste de perícia", () => {
  it("sem a perícia treinada, é só o atributo", () => {
    const p = getBonusDePericia(ficha(), "Furtividade")!;
    expect(p.treinada).toBe(false);
    expect(p.bonusDeRank).toBe(0);
    expect(p.total).toBe(p.atributoValor);
  });

  it("com a perícia e a árvore que a cobre, soma o Bônus de Rank", () => {
    useCharacterStore.getState().addSkill("Furtividade");
    comPatamar("furtividade-e-armadilhas", "Intermediário");
    const p = getBonusDePericia(ficha(), "Furtividade")!;
    expect(p.treinada).toBe(true);
    expect(p.bonusDeRank).toBe(2);
    expect(p.arvoreDoBonus).toBeTruthy();
    expect(p.total).toBe(p.atributoValor + 2);
  });

  /*
   * A regra que o livro grifa: "só naquelas que você realmente tem — se você
   * nunca aprendeu a perícia, não existe teste treinado onde somar o bônus".
   */
  it("a árvore sozinha NÃO dá o bônus: sem a perícia, não há onde somar", () => {
    comPatamar("furtividade-e-armadilhas", "Avançado");
    const p = getBonusDePericia(ficha(), "Furtividade")!;
    expect(p.treinada).toBe(false);
    expect(p.bonusDeRank).toBe(0);
  });

  it("perícia que a árvore não cobre não ganha bônus", () => {
    useCharacterStore.getState().addSkill("Arcanismo");
    comPatamar("furtividade-e-armadilhas", "Avançado");
    expect(getBonusDePericia(ficha(), "Arcanismo")!.bonusDeRank).toBe(0);
  });

  /* Cap. 4, §5: bônus do mesmo tipo não empilham — vale o maior. */
  it("duas árvores cobrindo a mesma perícia não somam: vale o maior", () => {
    useCharacterStore.getState().addSkill("Percepção");
    useCharacterStore.setState((s) => ({
      characters: {
        ...s.characters,
        [s.activeId!]: {
          ...s.characters[s.activeId!],
          unlockedRanks: [
            { treeId: "furtividade-e-armadilhas", rank: "Principiante" },
            { treeId: "navegacao-e-lideranca", rank: "Avançado" },
          ],
        },
      },
    }));
    expect(getBonusDePericia(ficha(), "Percepção")!.bonusDeRank).toBe(3);
  });

  it("perícia que não existe devolve null em vez de inventar zero", () => {
    expect(getBonusDePericia(ficha(), "Malabarismo Cósmico")).toBeNull();
  });

  it("a lista de treinadas sai em ordem e só com o que o personagem tem", () => {
    useCharacterStore.getState().addSkill("Percepção");
    useCharacterStore.getState().addSkill("Acrobacia");
    expect(getPericiasTreinadas(ficha()).map((p) => p.nome)).toEqual(["Acrobacia", "Percepção"]);
  });
});
