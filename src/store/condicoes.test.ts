import { beforeEach, describe, expect, it } from "vitest";
import { CONDICOES } from "@/data/condicoes";
import { useCharacterStore } from "./useCharacterStore";
import { getArmorClass, getCondicoesAtivas, getEfeitosDeCondicoes, getWeaponDamage } from "./selectors";

function ficha() {
  return useCharacterStore.getState().characters[useCharacterStore.getState().activeId!];
}

beforeEach(() => {
  useCharacterStore.setState({ characters: {}, order: [], activeId: null, history: {} });
  useCharacterStore.getState().createCharacter("Teste");
});

describe("marcar condição na ficha", () => {
  it("aplica e remove", () => {
    useCharacterStore.getState().aplicarCondicao("envenenado");
    expect(getCondicoesAtivas(ficha()).map((c) => c.condicao.id)).toEqual(["envenenado"]);
    useCharacterStore.getState().removerCondicao("envenenado");
    expect(getCondicoesAtivas(ficha())).toEqual([]);
  });

  /*
   * Um personagem não fica "Envenenado duas vezes" — o Cap. 4 não tem essa
   * ideia, e duas linhas iguais na ficha seriam duas coisas pra remover no fim
   * do combate em vez de uma.
   */
  it("aplicar duas vezes a mesma condição não acumulável não faz nada", () => {
    useCharacterStore.getState().aplicarCondicao("envenenado");
    useCharacterStore.getState().aplicarCondicao("envenenado");
    expect(ficha().condicoes).toHaveLength(1);
    expect(getCondicoesAtivas(ficha())[0].acumulos).toBe(1);
  });

  it("Quebrantado acumula, porque o livro diz que acumula", () => {
    useCharacterStore.getState().aplicarCondicao("quebrantado");
    useCharacterStore.getState().aplicarCondicao("quebrantado");
    useCharacterStore.getState().aplicarCondicao("quebrantado");
    expect(ficha().condicoes).toHaveLength(1);
    expect(getCondicoesAtivas(ficha())[0].acumulos).toBe(3);
  });

  it("tirar o último acúmulo tira a condição inteira", () => {
    useCharacterStore.getState().aplicarCondicao("quebrantado");
    useCharacterStore.getState().ajustarAcumulos("quebrantado", -1);
    expect(getCondicoesAtivas(ficha())).toEqual([]);
  });

  it("a nota de duração é texto livre e sobrevive", () => {
    useCharacterStore.getState().aplicarCondicao("preso");
    useCharacterStore.getState().anotarCondicao("preso", "CD 12 Força pra sair");
    expect(getCondicoesAtivas(ficha())[0].nota).toBe("CD 12 Força pra sair");
  });

  it("fim de combate limpa tudo", () => {
    for (const id of ["envenenado", "caido", "quebrantado"]) useCharacterStore.getState().aplicarCondicao(id);
    useCharacterStore.getState().limparCondicoes();
    expect(getCondicoesAtivas(ficha())).toEqual([]);
  });

  /*
   * Ficha salva pode carregar um id de uma versão anterior do livro. Uma linha
   * órfã não pode virar exceção no meio do cálculo de CA — ela some da leitura.
   */
  it("id que não existe mais no glossário é ignorado, não quebra", () => {
    useCharacterStore.setState((s) => ({
      characters: {
        ...s.characters,
        [s.activeId!]: { ...s.characters[s.activeId!], condicoes: [{ id: "condicao-que-nao-existe" }] },
      },
    }));
    expect(getCondicoesAtivas(ficha())).toEqual([]);
    expect(() => getArmorClass(ficha())).not.toThrow();
  });
});

describe("o que a condição faz com os números", () => {
  it("Quebrantado tira 1 de CA por acúmulo — é a única que mexe num número", () => {
    const base = getArmorClass(ficha());
    useCharacterStore.getState().aplicarCondicao("quebrantado");
    expect(getArmorClass(ficha())).toBe(base - 1);
    useCharacterStore.getState().aplicarCondicao("quebrantado");
    expect(getArmorClass(ficha())).toBe(base - 2);
  });

  it("Envenenado NÃO mexe na CA — ele muda como se rola, não o corpo", () => {
    const base = getArmorClass(ficha());
    useCharacterStore.getState().aplicarCondicao("envenenado");
    expect(getArmorClass(ficha())).toBe(base);
  });

  it("Quebrantado tira 1 de dano por acúmulo", () => {
    // O patamar entra direto no estado: `unlockRank` cobra a regra de PA e de
    // conhecimento do Cap. 1, e o que este teste mede é a penalidade de dano,
    // não o desbloqueio.
    useCharacterStore.setState((s) => ({
      characters: {
        ...s.characters,
        [s.activeId!]: {
          ...s.characters[s.activeId!],
          unlockedRanks: [{ treeId: "deus-da-espada", rank: "Principiante" as const }],
        },
      },
    }));
    const antes = getWeaponDamage(ficha(), "d8")!;
    useCharacterStore.getState().aplicarCondicao("quebrantado");
    useCharacterStore.getState().aplicarCondicao("quebrantado");
    const depois = getWeaponDamage(ficha(), "d8")!;
    expect(depois.penalidadeQuebrantado).toBe(2);
    expect(depois.averageDamage).toBe(antes.averageDamage - 2);
  });
});

describe("resumo dos efeitos", () => {
  it("diz QUEM causou cada efeito, e não só que ele existe", () => {
    useCharacterStore.getState().aplicarCondicao("envenenado");
    const e = getEfeitosDeCondicoes(ficha());
    expect(e.desvantagemEmAtaques).toEqual(["Envenenado"]);
    expect(e.desvantagemEmTestes).toEqual(["Envenenado"]);
  });

  /* Cap. 4, §5 (Empilhamento): a pior restrição manda, elas não se somam. */
  it("Deslocamento: zero vence metade, em qualquer ordem", () => {
    useCharacterStore.getState().aplicarCondicao("atolado");
    expect(getEfeitosDeCondicoes(ficha()).deslocamento).toBe("metade");
    useCharacterStore.getState().aplicarCondicao("preso");
    expect(getEfeitosDeCondicoes(ficha()).deslocamento).toBe("zero");

    useCharacterStore.getState().limparCondicoes();
    useCharacterStore.getState().aplicarCondicao("preso");
    useCharacterStore.getState().aplicarCondicao("atolado");
    expect(getEfeitosDeCondicoes(ficha()).deslocamento).toBe("zero");
  });

  it("Em Chamas e Soterrado avisam o dano do início do turno", () => {
    useCharacterStore.getState().aplicarCondicao("em-chamas");
    useCharacterStore.getState().aplicarCondicao("soterrado");
    expect(getEfeitosDeCondicoes(ficha()).danoPorTurno).toEqual([
      { nome: "Em Chamas", formula: "1d6" },
      { nome: "Soterrado", formula: "2d10" },
    ]);
  });

  it("ficha sem condição nenhuma não inventa efeito", () => {
    const e = getEfeitosDeCondicoes(ficha());
    expect(e.desvantagemEmAtaques).toEqual([]);
    expect(e.deslocamento).toBe("normal");
    expect(e.penalidadeQuebrantado).toBe(0);
  });

  it("toda condição do glossário pode ser aplicada sem quebrar nada", () => {
    for (const c of CONDICOES) {
      useCharacterStore.getState().aplicarCondicao(c.id);
      expect(() => getEfeitosDeCondicoes(ficha()), c.id).not.toThrow();
      expect(() => getArmorClass(ficha()), c.id).not.toThrow();
    }
    expect(getCondicoesAtivas(ficha())).toHaveLength(CONDICOES.length);
  });
});

/*
 * O teto de dois Descansos Curtos entre dois Longos (Cap. 4, §7).
 *
 * O aviso do livro é literal — "dois, e nem um a mais" — e a defesa dele é
 * aritmética: sem o teto, a reserva de PM vira PV indefinidamente pela Magia de
 * Cura, e o grupo volta inteiro descansando duas horas a mais. A store recusa o
 * terceiro em vez de deixar a tela sozinha vigiando.
 */
describe("teto de Descansos Curtos", () => {
  const nada = { pv: 0, pm: 0, pt: 0, pp: 0 };
  const maximos = { pv: 40, pm: 16, pt: 10, pp: 6 };

  it("aceita dois e recusa o terceiro", () => {
    expect(useCharacterStore.getState().descansar("curto", nada, maximos)).toBe(true);
    expect(useCharacterStore.getState().descansar("curto", nada, maximos)).toBe(true);
    expect(useCharacterStore.getState().descansar("curto", nada, maximos)).toBe(false);
    expect(ficha().descansosCurtos).toBe(2);
  });

  it("o Longo zera o contador — é ele que vira o dia", () => {
    useCharacterStore.getState().descansar("curto", nada, maximos);
    useCharacterStore.getState().descansar("curto", nada, maximos);
    useCharacterStore.getState().descansar("longo", nada, maximos);
    expect(ficha().descansosCurtos).toBe(0);
    expect(useCharacterStore.getState().descansar("curto", nada, maximos)).toBe(true);
  });

  it("descanso nunca passa do máximo da reserva", () => {
    useCharacterStore.getState().setCurrentHp(1);
    useCharacterStore.getState().descansar("longo", { pv: 9999, pm: 9999, pt: 9999, pp: 9999 }, maximos);
    expect(ficha().currentHp).toBe(maximos.pv);
    expect(ficha().currentMp).toBe(maximos.pm);
  });

  /*
   * `null` em `currentHp` significa "cheio, ainda não tocado" (ver
   * `getCurrentHp`). Somar em cima de null daria NaN e apagaria a reserva da
   * ficha — o pior desfecho possível pra um botão que a pessoa aperta pra
   * RECUPERAR alguma coisa.
   */
  it("reserva nunca tocada (null) não vira NaN ao descansar", () => {
    expect(ficha().currentHp).toBeNull();
    useCharacterStore.getState().descansar("longo", { pv: 5, pm: 5, pt: 5, pp: 5 }, maximos);
    expect(ficha().currentHp).toBe(maximos.pv);
    expect(Number.isNaN(ficha().currentMp)).toBe(false);
  });
});
