import { describe, expect, it } from "vitest";
import { AlvoDoGrupo, Aviso, avisarSobreCriatura, chanceDeAcerto, escalarFormula } from "./creatureAdvice";
import { AcaoCriatura, CriaturaEncontro, criaturaDoMolde } from "./encounterSim";
import { mediaFormula } from "./combatSim";
import { getMoldePorPatamar } from "@/data/bestiary";

/**
 * Testes do conselho ao vivo.
 *
 * O que eles travam não é o texto — é a PREMISSA de cada aviso: que ele só
 * aparece quando a condição existe, que ele cita um número que a mesa pode
 * conferir, e que a correção que ele oferece resolve o que ele apontou. Um
 * aviso que sugere uma troca que não conserta nada é pior que nenhum aviso:
 * ele gasta a confiança do Mestre uma vez só.
 */

function acao(patch: Partial<AcaoCriatura> = {}): AcaoCriatura {
  return {
    id: "golpe",
    nome: "Golpe",
    acoes: 1,
    dano: "2d8+3",
    alcance: "Corpo a corpo",
    area: false,
    tipo: "ataque",
    nota: "",
    ...patch,
  };
}

function criatura(patch: Partial<CriaturaEncontro> = {}): CriaturaEncontro {
  return { ...criaturaDoMolde(3, "padrao", "Bicho", "c1"), ...patch };
}

/** Um grupo de três, com PV e CA típicos de 3º patamar. */
const GRUPO: AlvoDoGrupo[] = [
  { id: "1", nome: "Lyn", pv: 50, ca: 16 },
  { id: "2", nome: "Gis", pv: 70, ca: 15 },
  { id: "3", nome: "Rud", pv: 62, ca: 17 },
];

function pegar(avisos: Aviso[], id: string): Aviso | undefined {
  return avisos.find((a) => a.id === id);
}

describe("escalarFormula", () => {
  it("mexe na quantidade de dados e no fixo, nunca nas faces", () => {
    expect(escalarFormula("3d8+5", 1.6)).toBe("5d8+8");
    expect(escalarFormula("4d8", 0.5)).toBe("2d8");
  });

  it("nunca zera a fórmula: um dado é o piso", () => {
    expect(escalarFormula("2d6", 0.01)).toBe("1d6");
  });

  it("some com o fixo quando ele arredonda pra zero, em vez de escrever '+0'", () => {
    expect(escalarFormula("4d8+1", 0.25)).toBe("1d8");
  });
});

describe("chanceDeAcerto", () => {
  it("é a régua do d20, com 1 sempre errando e 20 sempre acertando", () => {
    expect(chanceDeAcerto(5, 15)).toBeCloseTo(0.55, 5); // precisa de 10+
    expect(chanceDeAcerto(0, 30)).toBe(0.05);
    expect(chanceDeAcerto(20, 5)).toBe(0.95);
  });
});

describe("avisarSobreCriatura — o que ele fala e quando cala", () => {
  it("criatura sem ações ganha a nota do orçamento fixo, e só ela", () => {
    const avisos = avisarSobreCriatura(criatura(), GRUPO);
    expect(pegar(avisos, "sem-acoes")).toBeDefined();
    expect(pegar(avisos, "orcamento")).toBeUndefined();
  });

  it("cala sobre o grupo quando não há grupo escolhido — não inventa um personagem médio", () => {
    const c = criatura({ acoes: [acao({ dano: "20d10" })] });
    const semGrupo = avisarSobreCriatura(c, []);
    expect(pegar(semGrupo, "golpe-unico")).toBeUndefined();
    expect(pegar(semGrupo, "acerto-baixo")).toBeUndefined();
    // ... mas o molde continua valendo, porque ele não depende de ninguém.
    expect(pegar(semGrupo, "orcamento")).toBeDefined();
  });

  it("aponta o dano fraco contra o molde e sugere uma fórmula que fecha a conta", () => {
    // 1d4 (2,5) × 3 Ações = 7,5 contra os 35 que o 3º patamar pede.
    const c = criatura({ acoes: [acao({ dano: "1d4" })] });
    const aviso = pegar(avisarSobreCriatura(c, GRUPO), "orcamento");
    expect(aviso).toBeDefined();
    expect(aviso!.texto).toContain("35");
    const corrigida = escalarFormula("1d4", 35 / 7.5);
    expect(aviso!.correcao).toEqual(
      expect.objectContaining({ alvo: "acao", acaoId: "golpe", valor: corrigida })
    );
    // A correção sugerida leva o turno pra perto do molde — que é o único
    // motivo de ela existir.
    expect(mediaFormula(corrigida) * 3).toBeGreaterThan(35 * 0.8);
  });

  it("não reclama de quem está dentro da faixa do molde", () => {
    // 2d8+3 (12) × 3 = 36, contra 35 do molde.
    const c = criatura({ acoes: [acao()] });
    expect(pegar(avisarSobreCriatura(c, GRUPO), "orcamento")).toBeUndefined();
  });

  it("avisa por NOME quem morre num golpe, e a correção tira essa pessoa do perigo", () => {
    const c = criatura({ acoes: [acao({ nome: "Mordida", dano: "12d10" })] });
    const aviso = pegar(avisarSobreCriatura(c, GRUPO), "golpe-unico");
    expect(aviso).toBeDefined();
    expect(aviso!.nivel).toBe("grave");
    expect(aviso!.texto).toContain("Lyn");
    expect(aviso!.texto).toContain("50 PV");

    const corrigida = (aviso!.correcao as { valor: string }).valor;
    expect(mediaFormula(corrigida)).toBeLessThan(50);
  });

  it("separa 'mata em média' de 'pode matar na rolagem alta'", () => {
    // 8d10: média 44 (ninguém do grupo cai em média), teto 80 (a Lyn cabe).
    const c = criatura({ acoes: [acao({ dano: "8d10" })] });
    const avisos = avisarSobreCriatura(c, GRUPO);
    expect(pegar(avisos, "golpe-unico")).toBeUndefined();
    const teto = pegar(avisos, "golpe-unico-teto");
    expect(teto).toBeDefined();
    expect(teto!.nivel).toBe("alerta");
  });

  it("reclama quando ela quase não acerta, e a correção sobe o bônus", () => {
    const c = criatura({ bonusAtaque: 0, acoes: [acao()] });
    const aviso = pegar(avisarSobreCriatura(c, GRUPO), "acerto-baixo");
    expect(aviso).toBeDefined();
    const nova = (aviso!.correcao as { valor: number }).valor;
    const chances = GRUPO.map((p) => chanceDeAcerto(nova, p.ca));
    const media = chances.reduce((s, x) => s + x, 0) / chances.length;
    expect(media).toBeGreaterThan(0.5);
    expect(media).toBeLessThan(0.75);
  });

  it("nota quando a CA do grupo deixou de contar", () => {
    const c = criatura({ bonusAtaque: 25, acoes: [acao()] });
    expect(pegar(avisarSobreCriatura(c, GRUPO), "acerto-alto")).toBeDefined();
  });

  it("mede a ação em área contra a reserva de PV do grupo inteiro", () => {
    const c = criatura({ acoes: [acao({ nome: "Sopro", dano: "6d8", area: true, tipo: "resistencia" })] });
    const aviso = pegar(avisarSobreCriatura(c, GRUPO), "area");
    expect(aviso).toBeDefined();
    // 27 de média × 3 alvos = 81, contra 182 de PV somado: 45%.
    expect(aviso!.texto).toContain("45%");
    expect(aviso!.texto).toContain(`CD ${criatura().cdResistencia}`);
  });

  it("só fala da CD quando alguma ação cobra teste E ela saiu do molde", () => {
    const molde = getMoldePorPatamar(3);
    const noMolde = criatura({ acoes: [acao({ tipo: "resistencia" })] });
    expect(pegar(avisarSobreCriatura(noMolde, GRUPO), "cd-fora-do-molde")).toBeUndefined();

    const fora = criatura({ cdResistencia: molde.cdResistencia + 4, acoes: [acao({ tipo: "resistencia" })] });
    expect(pegar(avisarSobreCriatura(fora, GRUPO), "cd-fora-do-molde")).toBeDefined();

    // Mesma CD fora do molde, mas nenhuma ação pede teste: silêncio.
    const semTeste = criatura({ cdResistencia: molde.cdResistencia + 4, acoes: [acao({ tipo: "ataque" })] });
    expect(pegar(avisarSobreCriatura(semTeste, GRUPO), "cd-fora-do-molde")).toBeUndefined();
  });

  it("põe o mais grave primeiro — é o que o Mestre lê antes de rolar Iniciativa", () => {
    const c = criatura({ bonusAtaque: 0, acoes: [acao({ dano: "12d10" })] });
    const avisos = avisarSobreCriatura(c, GRUPO);
    expect(avisos[0].nivel).toBe("grave");
  });

  it("uma criatura bem montada não gera aviso nenhum", () => {
    const c = criatura({ acoes: [acao()] });
    expect(avisarSobreCriatura(c, GRUPO)).toEqual([]);
  });
});
