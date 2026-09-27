import { describe, expect, it } from "vitest";
import { criarFormula, POTENCIA, RANKS_TEORICOS, type FormulaEscolha } from "./magiaTeorica";
import { TEORICA_TREE } from "@/data/trees/teorica";

const base: FormulaEscolha = {
  rank: "Principiante",
  essencia: "mana",
  verbos: ["lancar"],
  forma: "circulo",
  meio: "ar",
  armada: false,
  gatilho: "entrada",
};
const f = (e: Partial<FormulaEscolha>) => criarFormula({ ...base, ...e });

describe("Magia Teórica — três palavras e uma conta", () => {
  it("o Dardo é a frase básica: 1 PM, 1d8 + BC, 9 m", () => {
    const dardo = f({});
    expect(dardo.valida).toBe(true);
    expect(dardo.pm).toBe(1);
    expect(dardo.dano).toBe("1d8 + BC");
    expect(dardo.alcance).toBe("9 m");
    expect(dardo.leitura).toBe("Mana · Lançar · Círculo");
  });

  it("a conta é a potência + 1 por palavra fora do básico", () => {
    // Fogo (+1) + Linha (+1), potência Intermediária (2) = 4
    const r = f({ rank: "Intermediário", essencia: "fogo", forma: "linha" });
    expect(r.pm).toBe(4);
    expect(r.conta).toEqual(["Potência Intermediário 2", "Fogo 1", "Linha 1"]);
    // segundo verbo +1 e armar +2
    const armada = f({ rank: "Santo", verbos: ["erguer", "sinalizar"], meio: "giz", armada: true });
    expect(armada.pm).toBe(6 + 1 + 2);
  });

  it("a potência custa 1 PM por dado, e pode ficar abaixo do seu rank", () => {
    for (const rank of RANKS_TEORICOS) expect(POTENCIA[rank].pm).toBe(POTENCIA[rank].dados);
    const barata = f({ rank: "Rei", potencia: "Principiante" });
    expect(barata.pm).toBe(1);
    expect(barata.dano).toBe("1d8 + BC");
  });

  it("a ordem das palavras não muda nada", () => {
    const a = f({ rank: "Avançado", verbos: ["erguer", "selar"] });
    const b = f({ rank: "Avançado", verbos: ["selar", "erguer"] });
    expect(a.pm).toBe(b.pm);
    expect(a.resumo).toBe(b.resumo);
    expect(a.nome).toBe("Égide de Mana");
  });

  it("Erguer soma Quadrado e Terra (não multiplica); Selar usa a Régua do Selo", () => {
    expect(f({ verbos: ["erguer"], forma: "quadrado" }).pv).toBe(30);
    expect(f({ rank: "Avançado", verbos: ["erguer"], forma: "quadrado", essencia: "terra" }).pv).toBe(120);
    const selo = f({ rank: "Intermediário", verbos: ["selar"], essencia: "fogo" });
    expect(selo.pv).toBeNull();
    expect(selo.bloqueio).toContain("magia de Fogo");
    expect(selo.bloqueio).toContain("um rank acima atravessa");
    expect(selo.bloqueio).toContain("Touki atravessam");
    // essência de escola: só barra aquela escola, e barra um rank a mais
    expect(selo.bloqueio).toContain("rank Avançado ou abaixo não atravessa");
    expect(f({ rank: "Intermediário", verbos: ["selar"] }).bloqueio).toContain("rank Intermediário ou abaixo não atravessa");
  });

  it("as formas: Triângulo +1 dado, Onda área com metade, Eco repete, Estrela divide", () => {
    expect(f({ rank: "Intermediário", forma: "triangulo" }).dano).toBe("3d8 + BC");
    const onda = f({ rank: "Avançado", forma: "onda" });
    expect(onda.dano).toBe("3d8 + BC");
    expect(onda.resolucao).toContain("Agilidade");
    expect(f({ rank: "Avançado", forma: "eco" }).dano).toContain("no começo do seu próximo turno, 3d8");
    expect(f({ rank: "Avançado", forma: "estrela" }).dano).toContain("até 3 alvos");
    // forma que não diz nada sobre o verbo não muda nada, e não é proibida
    const quadradoNoTiro = f({ forma: "quadrado" });
    expect(quadradoNoTiro.valida).toBe(true);
    expect(quadradoNoTiro.dano).toBe("1d8 + BC");
  });

  it("Vida cura sem BC; Lançar com outro verbo só leva o efeito longe", () => {
    expect(f({ essencia: "vida" }).dano).toBe("1d8");
    const longe = f({ rank: "Avançado", verbos: ["lancar", "selar"] });
    expect(longe.dano).toBeNull();
    expect(longe.alcance).toBe("27 m");
    expect(longe.resumo).toContain("a até 27 m de você");
  });

  it.each([
    ["dois verbos antes do Avançado", { rank: "Intermediário", verbos: ["erguer", "selar"] }, "Dois verbos"],
    ["potência acima do rank", { potencia: "Avançado" }, "A potência não passa"],
    ["forma de patamar acima", { forma: "triangulo" }, "Triângulo se aprende no Intermediário"],
    ["tiro preparado em giz", { meio: "giz" }, "Lançar que fere se desenha"],
    ["pedra antes do Santo", { rank: "Avançado", verbos: ["erguer"], meio: "pedra" }, "pedra se aprende no Santo"],
    ["armar antes do Santo", { rank: "Avançado", verbos: ["erguer"], meio: "giz", armada: true }, "Armar uma fórmula se aprende no Santo"],
    ["armar no ar", { rank: "Santo", verbos: ["erguer"], armada: true }, "precisa de giz"],
  ] satisfies [string, Partial<FormulaEscolha>, string][])("recusa: %s", (_nome, escolha, erro) => {
    const r = f(escolha);
    expect(r.valida).toBe(false);
    expect(r.erros.join(" ")).toContain(erro);
  });

  it("a mina arcana: Lançar armado em giz sai no Santo", () => {
    const mina = f({ rank: "Santo", essencia: "fogo", forma: "onda", meio: "giz", armada: true });
    expect(mina.valida).toBe(true);
    expect(mina.pm).toBe(6 + 1 + 1 + 2);
    expect(mina.ativacao).toContain("dispara sozinha");
  });

  it("toda carta da árvore é uma fórmula que o motor aceita, e há uma carta de dano por patamar", () => {
    for (const r of TEORICA_TREE.ranks) {
      expect(r.abilities.some((a) => a.damage), `${r.rank} sem carta de dano`).toBe(true);
    }
    const frase = TEORICA_TREE.ranks.find((r) => r.rank === "Imperador")!.abilities.find((a) => a.id === "frase-final")!;
    expect(frase.damage?.normal).toContain("13d8 + BC");
  });
});
