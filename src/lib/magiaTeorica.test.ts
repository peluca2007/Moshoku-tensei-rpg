import { describe, expect, it } from "vitest";
import { criarFormula, type FormulaEscolha } from "./magiaTeorica";

const base: FormulaEscolha = {
  rank: "Principiante",
  essencia: "mana",
  operadores: ["conter"],
  forma: "quadrado",
  meio: "ar",
  gatilho: false,
  condicao: "entrada",
};

describe("oficina de Magia Teórica", () => {
  it("transforma Mana, Conter e Quadrado numa barreira física calculável", () => {
    const formula = criarFormula(base);
    expect(formula.valida).toBe(true);
    expect(formula.pm).toBe(4);
    expect(formula.nome).toBe("Muralha de Mana");
    expect(formula.pv).toBe(30);
    expect(formula.dano).toBeNull();
    expect(formula.bloqueio).toContain("magia atravessa");
  });

  it("projeta Fogo com dano ígneo e o alcance alterado pela Linha", () => {
    const formula = criarFormula({ ...base, essencia: "fogo", operadores: ["projetar"], forma: "linha" });
    expect(formula.valida).toBe(true);
    expect(formula.pm).toBe(5);
    expect(formula.dano).toBe("1d6");
    expect(formula.tipo).toBe("ígneo");
    expect(formula.alcance).toBe("13.5 m");
  });

  it("cobra mais PM e símbolos para juntar contenção e rejeição", () => {
    const formula = criarFormula({ ...base, rank: "Intermediário", operadores: ["conter", "rejeitar"], forma: "circulo" });
    expect(formula.valida).toBe(true);
    expect(formula.pm).toBe(8);
    expect(formula.pv).toBe(40);
    expect(formula.bloqueio).toContain("criaturas e projéteis");
    expect(formula.bloqueio).toContain("magia de rank Intermediário");
    expect(formula.resumo).toContain("camada externa é física");
    const invertida = criarFormula({ ...base, rank: "Intermediário", operadores: ["rejeitar", "conter"], forma: "circulo" });
    expect(invertida.resumo).toContain("camada externa é mágica");
  });

  it("lê a ordem das palavras sem mudar arbitrariamente o custo", () => {
    const antes = criarFormula({ ...base, rank: "Avançado", essencia: "fogo", operadores: ["expandir", "projetar"], forma: "linha" });
    const depois = criarFormula({ ...base, rank: "Avançado", essencia: "fogo", operadores: ["projetar", "expandir"], forma: "linha" });
    expect(antes.valida).toBe(true);
    expect(depois.valida).toBe(true);
    expect(antes.pm).toBe(13);
    expect(depois.pm).toBe(13);
    expect(antes.leitura).toContain("cone na origem");
    expect(depois.leitura).toContain("área no destino");
    expect(antes.alcance).toBe("19.5 m");
    expect(depois.alcance).toBe("40.5 m");
    expect(antes.area).toContain("cone");
    expect(depois.area).toContain("no destino");
  });

  it("impede gatilho no ar e permite o mesmo circuito em giz no Avançado", () => {
    const ar = criarFormula({ ...base, rank: "Avançado", gatilho: true });
    const giz = criarFormula({ ...base, rank: "Avançado", meio: "giz", gatilho: true });
    expect(ar.valida).toBe(false);
    expect(ar.erros).toContain("Um gatilho precisa de giz, pergaminho ou pedra gravada.");
    expect(giz.valida).toBe(true);
    expect(giz.pm).toBe(11);
  });

  it("permite Círculo como forma neutra e exige estrutura para Quadrado", () => {
    const circuloInstantaneo = criarFormula({ ...base, essencia: "fogo", operadores: ["projetar"], forma: "circulo" });
    const quadradoSemEstrutura = criarFormula({ ...base, essencia: "fogo", operadores: ["projetar"], forma: "quadrado" });
    expect(circuloInstantaneo.valida).toBe(true);
    expect(circuloInstantaneo.pm).toBe(4);
    expect(circuloInstantaneo.duracao).toBe("instantânea");
    expect(circuloInstantaneo.dano).toBe("1d6");
    expect(quadradoSemEstrutura.valida).toBe(false);
    expect(quadradoSemEstrutura.erros[0]).toContain("não tem PV");
  });

  it("faz a essência alterar a barreira além do nome", () => {
    const fogo = criarFormula({ ...base, essencia: "fogo" });
    const terra = criarFormula({ ...base, essencia: "terra" });
    expect(fogo.efeitoDaEssencia).toContain("dano ígneo");
    expect(terra.pv).toBe(40);
  });

  it("faz um selo de rejeição sem PV físico e limita o bloqueio à essência", () => {
    const selo = criarFormula({ ...base, essencia: "fogo", operadores: ["rejeitar"], forma: "circulo" });
    expect(selo.valida).toBe(true);
    expect(selo.pv).toBeNull();
    expect(selo.bloqueio).toContain("magia de Fogo");
    expect(selo.bloqueio).toContain("um rank acima atravessa");
    expect(selo.bloqueio).toContain("ataques físicos atravessam");
  });

  it("exige uma ordem executável para projetar e repetir uma barreira", () => {
    const invertida = criarFormula({ ...base, rank: "Avançado", operadores: ["conter", "projetar"], forma: "quadrado" });
    const repeticaoPrematura = criarFormula({ ...base, rank: "Avançado", operadores: ["repetir", "conter"], forma: "quadrado" });
    expect(invertida.valida).toBe(false);
    expect(invertida.erros).toContain("Para criar uma barreira distante, escreva Projetar antes de Conter ou Rejeitar.");
    expect(repeticaoPrematura.valida).toBe(false);
    expect(repeticaoPrematura.erros).toContain("Repetir precisa ser a última palavra: ele duplica a saída pronta.");
  });

  it("separa construção e potência: circuitos avançados podem conter uma saída fraca", () => {
    const formula = criarFormula({ ...base, rank: "Avançado", potencia: "Principiante", operadores: ["conter", "rejeitar"], forma: "circulo" });
    expect(formula.valida).toBe(true);
    expect(formula.pm).toBe(6);
    expect(formula.pv).toBe(20);
    expect(formula.bloqueio).toContain("rank Principiante");
    expect(formula.ativacao).toContain("2 Ações");
    expect(criarFormula({ ...base, rank: "Avançado", potencia: "Principiante", meio: "giz" }).ativacao).toContain("1 Ação");
    const impossivel = criarFormula({ ...base, rank: "Principiante", potencia: "Avançado" });
    expect(impossivel.valida).toBe(false);
    expect(impossivel.erros).toContain("A potência não pode superar o rank de construção da Magia Teórica.");
  });

  it("permite sinal sensorial como opção inicial sem conceder dano nem Surdo", () => {
    const sinal = criarFormula({ ...base, operadores: ["expressar"], forma: "circulo" });
    expect(sinal.valida).toBe(true);
    expect(sinal.pm).toBe(3);
    expect(sinal.dano).toBeNull();
    expect(sinal.duracao).toBe("1 turno");
    const paredeSom = criarFormula({ ...base, essencia: "som" });
    expect(paredeSom.efeitoDaEssencia).toContain("Não aplica Surdo");
  });

  it("limita a área de ataque e soma reforços físicos sem multiplicá-los", () => {
    const onda = criarFormula({ ...base, rank: "Intermediário", potencia: "Intermediário", essencia: "fogo", operadores: ["projetar", "expandir"], forma: "circulo" });
    expect(onda.valida).toBe(true);
    expect(onda.area).toContain("raio de 3 m");
    expect(onda.dano).toBe("1d6");
    expect(onda.resolucao).toContain("Agilidade");
    const parede = criarFormula({ ...base, rank: "Avançado", potencia: "Avançado", essencia: "terra" });
    expect(parede.pv).toBe(120);
  });

  it("impede cura por repetição e alarme de quebra sem subcélula", () => {
    const cura = criarFormula({ ...base, rank: "Intermediário", essencia: "vida", operadores: ["projetar", "repetir"], forma: "circulo" });
    expect(cura.valida).toBe(false);
    expect(cura.erros.some((erro) => erro.includes("Repetir não renova"))).toBe(true);
    const quebra = criarFormula({ ...base, rank: "Avançado", meio: "giz", gatilho: true, condicao: "quebra" });
    expect(quebra.valida).toBe(false);
    expect(quebra.erros.some((erro) => erro.includes("outra célula"))).toBe(true);
  });

  it("reserva fronteiras enormes para instalações preparadas", () => {
    const ar = criarFormula({ ...base, rank: "Rei", potencia: "Rei", forma: "circulo" });
    const giz = criarFormula({ ...base, rank: "Rei", potencia: "Rei", forma: "circulo", meio: "giz" });
    expect(ar.valida).toBe(true);
    expect(ar.area).toContain("12 m");
    expect(giz.area).toContain("150 m");
    const ampliada = criarFormula({ ...base, rank: "Santo", potencia: "Santo", operadores: ["conter", "expandir"], forma: "circulo" });
    expect(ampliada.valida).toBe(false);
    expect(ampliada.erros.some((erro) => erro.includes("limite é 12 m"))).toBe(true);
  });
});
