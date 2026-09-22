import { describe, expect, it } from "vitest";
import { AlvoDoGrupo, Aviso, avisarSobreCriatura, chanceDeAcerto } from "./creatureAdvice";
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

  it("aponta o dano fraco contra o molde e sugere uma escala que fecha a conta", () => {
    // 1d4 (2,5) × 3 Ações = 7,5 contra os 35 que o 3º patamar pede.
    const c = criatura({ acoes: [acao({ dano: "1d4" })] });
    const aviso = pegar(avisarSobreCriatura(c, GRUPO), "orcamento");
    expect(aviso).toBeDefined();
    expect(aviso!.texto).toContain("35");
    const corrigida = 4.667;
    expect(aviso!.correcao).toEqual(
      expect.objectContaining({ alvo: "acao", acaoId: "golpe", campo: "escalaDano", valor: corrigida })
    );
    // A correção sugerida leva o turno pra perto do molde — que é o único
    // motivo de ela existir.
    expect(mediaFormula("1d4") * corrigida * 3).toBeGreaterThan(35 * 0.8);
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

    const corrigida = (aviso!.correcao as { valor: number }).valor;
    expect(mediaFormula("12d10") * corrigida).toBeLessThan(50);
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

/**
 * O AVISO DE IMUNIDADE — Cap. 4, §6 (0.1.90).
 *
 * O aviso mais caro de não ter. Uma criatura imune a ígneo contra um grupo de
 * magos de Fogo não é um encontro difícil: é um encontro impossível, e a mesa
 * leva vinte minutos rolando dados que não fazem nada antes de desconfiar.
 *
 * Ele é o primeiro aviso da tela que só existe porque o Bloco do Monstro
 * existe — e por isso tem teste: um aviso que dispara demais é pior que
 * nenhum, porque o Mestre aprende a ignorar o painel inteiro.
 */
describe("A Imunidade que apaga a jogada de alguém", () => {
  const fogueteiros: AlvoDoGrupo[] = [
    { id: "1", nome: "Lyn", pv: 50, ca: 16, tiposDeDano: ["ígneo"] },
    { id: "2", nome: "Gis", pv: 70, ca: 15, tiposDeDano: ["ígneo"] },
  ];

  it("grita quando o grupo inteiro só causa o que ela ignora", () => {
    const a = pegar(avisarSobreCriatura(criatura({ imunidades: ["ígneo"] }), fogueteiros), "imunidade-cega");
    expect(a?.nivel).toBe("grave");
    expect(a?.titulo).toMatch(/grupo inteiro/i);
  });

  it("e só alerta quando sobra alguém que alcança", () => {
    const misto = [...fogueteiros, { id: "3", nome: "Rud", pv: 62, ca: 17, tiposDeDano: ["cortante"] }];
    const a = pegar(avisarSobreCriatura(criatura({ imunidades: ["ígneo"] }), misto), "imunidade-cega");
    expect(a?.nivel).toBe("alerta");
    expect(a?.texto).toContain("Lyn");
    expect(a?.texto, "quem alcança não entra na lista").not.toContain("Rud");
  });

  it("cala quando ninguém depende daquele tipo", () => {
    const espadas: AlvoDoGrupo[] = [{ id: "1", nome: "Lyn", pv: 50, ca: 16, tiposDeDano: ["cortante"] }];
    expect(pegar(avisarSobreCriatura(criatura({ imunidades: ["ígneo"] }), espadas), "imunidade-cega")).toBeUndefined();
  });

  it("cala quando não dá pra saber o que o grupo causa", () => {
    // Silêncio é melhor que palpite: um aviso aqui mandaria o Mestre refazer um
    // encontro que estava certo.
    expect(pegar(avisarSobreCriatura(criatura({ imunidades: ["ígneo"] }), GRUPO), "imunidade-cega")).toBeUndefined();
  });

  it("cala sem grupo escolhido, e cala sem imunidade", () => {
    expect(pegar(avisarSobreCriatura(criatura({ imunidades: ["ígneo"] }), []), "imunidade-cega")).toBeUndefined();
    expect(pegar(avisarSobreCriatura(criatura({}), fogueteiros), "imunidade-cega")).toBeUndefined();
  });

  it("Resistência não dispara o aviso — a jogada continua existindo", () => {
    const a = pegar(avisarSobreCriatura(criatura({ resistencias: ["ígneo"] }), fogueteiros), "imunidade-cega");
    expect(a, "metade do dano ainda é dano").toBeUndefined();
  });
});
