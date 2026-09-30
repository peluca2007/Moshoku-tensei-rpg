import { describe, expect, it, vi } from "vitest";
import { CharacterData } from "./types";
import { acoesDe, consumirReacao, escolherSuporte, amortecerComBarro, reagirAFalhaAliada, aplicarDano, danoEsperado, executarAtaquePersonagem, montarFicha, novaAcao, novoAlvo, novoEstado, resolver } from "./combatSim";
import { CombateLogger, criaturaDoMolde, simularEncontro } from "./encounterSim";
import { EventoAtaque } from "./combatTrace";

function personagem(patch: Partial<CharacterData> = {}): CharacterData {
  return {
    id: "heroi", name: "Ari", lore: "", raceId: null, backgroundId: null, subtableEntryId: null,
    attributeBase: { forca: 4, agilidade: 7, vigor: 3, intelecto: 9, espirito: 2 },
    raceAttributeChoices: [], racialUpgrades: [], saveAdvantages: [], startingTreeId: "deus-da-espada",
    unlockedRanks: [{ treeId: "deus-da-espada", rank: "Principiante" }], purchasedAbilities: [],
    purchasedCombinedSpells: [], gold: 0,
    inventory: [{ id: "espada", name: "Espada Longa", baseDie: "d8", type: "arma", equipped: true }],
    skills: [], treeSkillChoices: [], proficiencies: [], weaponGroupChoices: [], bonusHp: 0, bonusMp: 0,
    currentHp: null, currentMp: null, currentPt: null, currentPp: null, overrides: {}, ...patch,
  };
}

describe("defesas de Terra e Bardo aprovadas pelo autor", () => {
  function comCarta(treeId: string, id: string) {
    const estado = novoEstado(montarFicha(personagem({
      startingTreeId: treeId, unlockedRanks: [{ treeId, rank: "Principiante" }],
      purchasedAbilities: [{ treeId, rank: "Principiante", kind: "ability", id }],
    })));
    estado.reacaoDisponivel = true;
    return estado;
  }
  it("barro cobra PM e Reação, reduz antes de Resistência e não protege duas vezes", () => {
    const e = comCarta("terra", "couraca-de-barro");
    const pm = e.pm;
    expect(amortecerComBarro(e, 30, "cortante", () => 0)).toBe(30 - 1 - e.ficha.bc);
    expect(e.pm).toBe(pm - 2);
    expect(e.reacaoDisponivel).toBe(false);
    expect(amortecerComBarro(e, 30, "cortante", () => 0)).toBe(30);
  });
  it("a IA não transforma uma defesa de Reação em escudo lançado com Ações", () => {
    const e = comCarta("terra", "couraca-de-barro");
    expect(e.ficha.acoes.some((a) => a.nome === "Couraça de Barro")).toBe(true);
    expect(escolherSuporte(e, 3, [e])).toBeNull();
    e.ficha.acoes = [novaAcao({ nome: "Parede de Emergência", tipo: "escudo", reacao: true, formulaSuporte: "15", pm: 2 })];
    expect(escolherSuporte(e, 3, [e])).toBeNull();
  });
  it("barro não reage a fogo, dano sem tipo, cântico ou reserva insuficiente", () => {
    const e = comCarta("terra", "couraca-de-barro");
    const rng = vi.fn(() => 0);
    for (const tipo of ["ígneo", undefined]) expect(amortecerComBarro(e, 30, tipo, rng)).toBe(30);
    e.conjurando = { acao: e.ficha.ataqueBasico, acoesGastas: 1, acoesNesteTurno: 1 };
    expect(amortecerComBarro(e, 30, "cortante", rng)).toBe(30);
    e.conjurando = null;
    e.pm = 1;
    expect(amortecerComBarro(e, 30, "cortante", rng)).toBe(30);
    expect(rng).not.toHaveBeenCalled();
    expect(e.reacaoDisponivel).toBe(true);
  });
  it("Refrão rola uma vez, protege no máximo três e não soma PV Temporários", () => {
    const b = comCarta("bardo-e-interacao", "refrao-da-retomada");
    b.pp = 2;
    const aliados = [b, ...Array.from({ length: 3 }, () => novoEstado(montarFicha(personagem())))];
    aliados[3].pvTemp = 20;
    const rng = vi.fn(() => 0.5);
    reagirAFalhaAliada(aliados[1], aliados, rng);
    expect(aliados.map((a) => a.pvTemp)).toEqual([5, 5, 5, 20]);
    expect(b.pp).toBe(1);
    expect(rng).toHaveBeenCalledTimes(1);
    reagirAFalhaAliada(aliados[1], aliados, rng);
    expect(rng).toHaveBeenCalledTimes(1);
  });
  it("Refrão não dispara com falha própria, Bardo surpreso ou sem PP", () => {
    const b = comCarta("bardo-e-interacao", "refrao-da-retomada");
    const a = novoEstado(montarFicha(personagem()));
    const rng = vi.fn(() => 0.5);
    b.pp = 2;
    reagirAFalhaAliada(b, [b, a], rng);
    b.surpreso = true;
    reagirAFalhaAliada(a, [b, a], rng);
    b.surpreso = false;
    b.pp = 0;
    reagirAFalhaAliada(a, [b, a], rng);
    expect(rng).not.toHaveBeenCalled();
  });
  it("o ataque errado aciona Refrão, mas um acerto não gasta a reação", () => {
    const b = comCarta("bardo-e-interacao", "refrao-da-retomada");
    const a = novoEstado(montarFicha(personagem()));
    const alvo = novoAlvo({ nome: "Inimigo", pv: 100, ca: 1 });
    b.pp = 2;
    executarAtaquePersonagem(a, a.ficha.ataqueBasico, alvo, () => 0.5, undefined, [a, b]);
    expect(b.pp).toBe(2);
    executarAtaquePersonagem(a, a.ficha.ataqueBasico, alvo, () => 0, undefined, [a, b]);
    expect(b.pp).toBe(1);
    expect(a.pvTemp).toBe(2);
  });
  it("cobra alcance da falha e dos beneficiados quando há posições", () => {
    const b = comCarta("bardo-e-interacao", "refrao-da-retomada");
    const a = novoEstado(montarFicha(personagem()));
    const longe = novoEstado(montarFicha(personagem()));
    b.pp = 2;
    b.posicao = 0; a.posicao = 10; longe.posicao = 20;
    reagirAFalhaAliada(a, [a, b, longe], () => 0.5);
    expect(b.pp).toBe(2);
    a.posicao = 9;
    reagirAFalhaAliada(a, [a, b, longe], () => 0.5);
    expect(b.pp).toBe(1);
    expect(a.pvTemp).toBe(5);
    expect(longe.pvTemp).toBe(0);
  });
});

describe("recibo do combate usa os valores que alteraram os PV", () => {
  it.each([1, 2])("Inverter cobra %i Dose(s), sem BC, d20 ou resistência", (doses) => {
    const e = novoEstado(montarFicha(personagem()));
    const alvo = novoAlvo({ nome: "Envenenado", pv: 1000, ca: 999, bonusResistencia: 999, doses, envenenado: true });
    const acao = novaAcao({ nome: "Purgar", dano: "2d6 de dano de veneno por Dose invertida", inverteDose: "2d6" });
    const rng = vi.fn(() => 0);
    let recibo: EventoAtaque | undefined;
    expect(danoEsperado(e, acao, alvo)).toBe(7 * doses);
    expect(resolver(e, acao, alvo, rng, (ev) => { recibo = ev; })).toBe(2 * doses);
    expect(rng).toHaveBeenCalledTimes(2 * doses);
    expect(recibo?.teste).toBeUndefined();
    expect(recibo?.bonusDano).toBe(0);
    expect(alvo).toMatchObject({ doses: 0, envenenado: false });
  });
  it("Quebra automática não rola d20 nem crítico e dobra só o frio", () => {
    const e = novoEstado(montarFicha(personagem()));
    const alvo = novoAlvo({ nome: "Congelado", pv: 1000, ca: 999, congelado: true, molhado: true });
    const acao = novaAcao({ nome: "Quebra", ataque: true, frio: true, dano: "5d8 + BC (perfurante) + 2d6 de frio", bonusSeCongelado: "3d8" });
    const rng = vi.fn(() => 0.99);
    let recibo: EventoAtaque | undefined;
    expect(danoEsperado(e, acao, alvo)).toBe(63.5 + e.ficha.bc);
    expect(resolver(e, acao, alvo, rng, (ev) => { recibo = ev; })).toBe(112 + e.ficha.bc);
    expect(rng).toHaveBeenCalledTimes(10);
    expect(recibo?.teste).toBeUndefined();
    expect(recibo?.critico).toBe(false);
    expect(alvo.congelado).toBe(false);
  });
  it.each([false, true])("Molhado dobra a parcela fria, preservando dano físico e BC (crítico=%s)", (critico) => {
    const e = novoEstado(montarFicha(personagem()));
    const alvo = novoAlvo({ nome: "Molhado", pv: 1000, ca: 1, molhado: true });
    const acao = novaAcao({ nome: "Lança", ataque: true, frio: true, dano: "2d8 + BC (perfurante) + 1d8 de frio" });
    const rng = vi.fn(() => 0).mockReturnValueOnce(critico ? 0.99 : 0.5);
    expect(resolver(e, acao, alvo, rng)).toBe((critico ? 8 : 4) + e.ficha.bc);
    expect(rng).toHaveBeenCalledTimes(critico ? 7 : 4);
    expect(danoEsperado(e, acao, alvo)).toBeCloseTo(0.95 * (18 + e.ficha.bc) + 0.05 * 18);
  });
  it("resistência ao frio contra Molhado tem Desvantagem e arredonda depois da dobra", () => {
    const e = novoEstado(montarFicha(personagem()));
    const alvo = novoAlvo({ nome: "Molhado", pv: 1000, ca: 1, molhado: true, bonusResistencia: 999 });
    const acao = novaAcao({ nome: "Gelo", frio: true, dano: "2d8 + BC (perfurante) + 1d8 de frio" });
    const rng = vi.fn(() => 0);
    let recibo: EventoAtaque | undefined;
    expect(resolver(e, acao, alvo, rng, (ev) => { recibo = ev; })).toBe(Math.floor((4 + e.ficha.bc) / 2));
    expect(recibo?.teste?.ajuste).toBe("desvantagem");
    expect(rng).toHaveBeenCalledTimes(5);
  });
  it("fórmula que já inclui a dobra do frio não dobra novamente", () => {
    const e = novoEstado(montarFicha(personagem()));
    const acao = novaAcao({ nome: "Nova", dano: "6d8 de frio", frio: true, frioJaDobrado: true });
    const seco = novoAlvo({ nome: "Seco", pv: 1000, ca: 1, bonusResistencia: -100 });
    const molhado = { ...seco, molhado: true };
    expect(resolver(e, acao, seco, () => 0)).toBe(resolver(e, acao, molhado, () => 0));
    expect(danoEsperado(e, acao, seco)).toBe(danoEsperado(e, acao, molhado));
  });
  it.each([false, true])("usar Reação encerra o cântico sem devolver mana (extra=%s)", (extra) => {
    const e = novoEstado(montarFicha(personagem()));
    e.reacaoDisponivel = !extra;
    e.reacoesExtra = extra ? 1 : 0;
    e.conjurando = { acao: novaAcao({ nome: "Cântico", pm: 10 }), acoesGastas: 1, acoesNesteTurno: 1 };
    const pm = e.pm;
    expect(consumirReacao(e)).toBe(true);
    expect(e.conjurando).toBeNull();
    expect(e.pm).toBe(pm);
  });
  it("Reação indisponível não cancela o cântico", () => {
    const e = novoEstado(montarFicha(personagem()));
    e.reacaoDisponivel = false; e.reacoesExtra = 0;
    e.conjurando = { acao: novaAcao({ nome: "Cântico" }), acoesGastas: 1, acoesNesteTurno: 1 };
    expect(consumirReacao(e)).toBe(false);
    expect(e.conjurando).not.toBeNull();
  });
  it.each([4, 5, 6])("Dose Certa independe do recibo ao falhar por %i", (margem) => {
    const criar = () => {
      const e = novoEstado(montarFicha(personagem()));
      e.ficha.doseExtraEmFalhaGrave = true;
      return e;
    };
    const e = criar();
    const criarAlvo = () => novoAlvo({ nome: "Alvo", pv: 100, ca: 1, bonusResistencia: 8 + e.ficha.bc - 1 - margem });
    const sem = criarAlvo(), com = criarAlvo();
    const acao = novaAcao({ nome: "Veneno de teste", ataque: false, dano: "1d6", dosesNaFalha: 1 });
    const rngSem = vi.fn(() => 0), rngCom = vi.fn(() => 0);
    const danoSem = resolver(e, acao, sem, rngSem);
    const danoCom = resolver(criar(), acao, com, rngCom, () => {});
    expect(danoSem).toBe(danoCom);
    expect(sem).toEqual(com);
    expect(sem.doses).toBe(margem >= 5 ? 2 : 1);
    expect(rngSem).toHaveBeenCalledTimes(rngCom.mock.calls.length);
  });
  it("mostra o d20, degrau e dado real do ataque comum, sem sortear outra vez", () => {
    const e = novoEstado(montarFicha(personagem()));
    const alvo = novoAlvo({ nome: "Goblin", pv: 100, ca: 15 });
    const rng = vi.fn().mockReturnValueOnce(0.65).mockReturnValueOnce(0.5);
    const logger = new CombateLogger();
    expect(executarAtaquePersonagem(e, e.ficha.ataqueBasico, alvo, rng, logger)).toBe(11);
    expect(rng).toHaveBeenCalledTimes(2);
    expect(alvo.pv).toBe(89);
    const evento = logger.eventos[0];
    expect(evento.teste).toMatchObject({ dados: [14], bonus: 5, total: 19, defesa: 15 });
    expect(evento.arma).toMatchObject({ nome: "Espada Longa", baseDie: "d8", escalatedDie: "d10", steps: 1 });
    expect(evento.parcelas[0].rolagem.grupos).toEqual([{ faces: 10, resultados: [6] }]);
    expect(evento.aplicacao).toMatchObject({ perdaPv: 11, danoEfetivo: 11 });
    expect(logger.linhas[0]).toContain("Dano bruto: 6 + 5 de bônus = 11");
  });

  it("erro natural deixa recibo e não rola dano nem aplica bônus", () => {
    const e = novoEstado(montarFicha(personagem()));
    const alvo = novoAlvo({ nome: "Alvo", pv: 100, ca: 1 });
    const rng = vi.fn(() => 0);
    const logger = new CombateLogger();
    executarAtaquePersonagem(e, e.ficha.ataqueBasico, alvo, rng, logger);
    expect(rng).toHaveBeenCalledTimes(1);
    expect(alvo.pv).toBe(100);
    expect(logger.eventos[0]).toMatchObject({ acertou: false, bruto: 0, parcelas: [] });
    expect(logger.linhas[0]).toContain("dados de dano não rolados");
    expect(logger.linhas[0]).not.toContain("+ 5 de bônus = 0");
  });

  it("Quebrantado da ficha reduz CA e dano uma só vez, como na prévia da arma", () => {
    const ficha = montarFicha(personagem({ condicoes: [{ id: "quebrantado", acumulos: 2 }] }));
    const e = novoEstado(ficha);
    const alvo = novoAlvo({ nome: "Alvo", pv: 100, ca: 1 });
    const logger = new CombateLogger();
    expect(e.ca - e.quebrantado).toBe(ficha.ca);
    expect(danoEsperado(e, ficha.ataqueBasico, null)).toBe(8.5);
    expect(executarAtaquePersonagem(e, ficha.ataqueBasico, alvo, () => 0.5, logger)).toBe(9);
    expect(logger.eventos[0]).toMatchObject({ bruto: 11, aposModificadores: 9, aplicacao: { perdaPv: 9 } });
    expect(logger.linhas[0]).toContain("Quebrantado do atacante: −2");
  });

  it("critico repete todos os dados e preserva o fixo do teto uma única vez", () => {
    const e = novoEstado(montarFicha(personagem({
      unlockedRanks: [{ treeId: "deus-da-espada", rank: "Imperador" }],
      inventory: [{ id: "espada", name: "Espada Longa", baseDie: "4d12", type: "arma", equipped: true }],
    })));
    const rng = vi.fn(() => 0.5).mockReturnValueOnce(0.99);
    const logger = new CombateLogger();
    const alvo = novoAlvo({ nome: "Alvo", pv: 1000, ca: 999 });
    executarAtaquePersonagem(e, e.ficha.ataqueBasico, alvo, rng, logger);
    expect(logger.eventos[0]).toMatchObject({ critico: true, bonusDano: 10, bruto: 94 });
    expect(logger.eventos[0].parcelas.map((p) => p.rolagem.fixo)).toEqual([14, 0]);
    expect(rng).toHaveBeenCalledTimes(11);
    expect(alvo.pv).toBe(906);
    expect(danoEsperado(e, e.ficha.ataqueBasico, null)).toBe(56.5);
  });

  it("a arma sem proficiência causa desvantagem, sem reduzir os dados de dano", () => {
    const e = novoEstado(montarFicha(personagem({
      inventory: [{ id: "adaga", name: "Adaga / Punhal", baseDie: "d4", type: "arma", equipped: true }],
    })));
    const logger = new CombateLogger();
    const rng = vi.fn(() => 0.5).mockReturnValueOnce(0.15).mockReturnValueOnce(0.85);
    executarAtaquePersonagem(e, e.ficha.ataqueBasico, novoAlvo({ nome: "Alvo", pv: 100, ca: 1 }), rng, logger);
    expect(logger.eventos[0].teste).toMatchObject({ dados: [4, 18], natural: 4, ajuste: "desvantagem" });
    expect(logger.eventos[0].bruto).toBe(12);
    expect(logger.linhas[0]).toContain("sem proficiência");
  });

  it("mago multiclasse ataca com bônus da arma, não com o BC mágico", () => {
    const e = novoEstado(montarFicha(personagem({ startingTreeId: "agua", unlockedRanks: [
      { treeId: "agua", rank: "Imperador" }, { treeId: "deus-da-espada", rank: "Principiante" },
    ] })));
    const logger = new CombateLogger();
    executarAtaquePersonagem(e, e.ficha.ataqueBasico, novoAlvo({ nome: "Alvo", pv: 100, ca: 1 }), () => 0.5, logger);
    expect(e.ficha.bc).toBe(15);
    expect(logger.eventos[0]).toMatchObject({ bonusDano: 5, bruto: 11, teste: { bonus: 5 } });
  });

  it("dados extras de arma são independentes e metade de dado é registrada", () => {
    const e = novoEstado(montarFicha(personagem()));
    const alvo = novoAlvo({ nome: "Alvo", pv: 100, ca: 1 });
    const rng = vi.fn().mockReturnValueOnce(0.5).mockReturnValueOnce(0).mockReturnValueOnce(0.99);
    const eventos: EventoAtaque[] = [];
    expect(resolver(e, novaAcao({ nome: "Dois Dados", ataque: true, dadosDeArma: 2 }), alvo, rng, (ev) => eventos.push(ev))).toBe(16);
    expect(eventos[0].parcelas[0].rolagem.grupos).toEqual([{ faces: 10, resultados: [1, 10] }]);
    expect(resolver(e, novaAcao({ nome: "Metade", ataque: true, dadosDeArma: 0.5 }), alvo, () => 0.5)).toBe(8);
  });

  it("resistência, casca e excesso de dano fecham na perda real de PV", () => {
    const e = novoEstado(montarFicha(personagem()));
    const logger = new CombateLogger();
    const alvo = novoAlvo({ nome: "Alvo", pv: 3, ca: 1, pvTemp: 2, resistencias: ["frio"] });
    const acao = novaAcao({ nome: "Frio", ataque: true, dano: "1d6 + BC frio" });
    executarAtaquePersonagem(e, acao, alvo, () => 0.5, logger);
    expect(logger.eventos[0]).toMatchObject({ bruto: 9, aplicacao: { aposResistencia: 4, absorvidoTemporario: 2, perdaPv: 2, danoEfetivo: 2 } });
    const ev = logger.eventos[0];
    aplicarDano(alvo, 100, 1, undefined, false, "frio", ev);
    expect(ev.aplicacao?.perdaPv).toBe(1);
  });

  it("ligar o log não muda resultados, inclusive críticos em alvos já caídos", () => {
    const e = novoEstado(montarFicha(personagem()));
    const criarAlvo = () => novoAlvo({ nome: "Caído", pv: 0, ca: 1, fioDaVida: true, inconsciente: true });
    const sem = criarAlvo();
    const com = criarAlvo();
    executarAtaquePersonagem(e, e.ficha.ataqueBasico, sem, () => 0.99);
    executarAtaquePersonagem(e, e.ficha.ataqueBasico, com, () => 0.99, new CombateLogger());
    expect(com).toEqual(sem);
    expect(com.marcasDaMorte).toBe(2);
  });

  it("soma BC no dano somente quando a fórmula ou os Dados de Arma mandam", () => {
    const e = novoEstado(montarFicha(personagem()));
    const alvo = () => novoAlvo({ nome: "Alvo", pv: 100, ca: 1 });
    const semBc = novaAcao({ nome: "Sem BC", ataque: true, dano: "1d1" });
    const comBc = novaAcao({ nome: "Com BC", ataque: true, dano: "1d1 + BC" });
    const comArma = novaAcao({ nome: "Com arma", ataque: true, dadosDeArma: 1 });

    expect(resolver(e, semBc, alvo(), () => 0.5)).toBe(1);
    expect(resolver(e, comBc, alvo(), () => 0.5)).toBe(1 + e.ficha.bc);
    expect(resolver(e, comArma, alvo(), () => 0.5)).toBeGreaterThan(e.ficha.bc);
    expect(danoEsperado(e, semBc, null)).toBe(1);
    expect(danoEsperado(e, comBc, null)).toBe(1 + e.ficha.bc);
  });

  it("Concentrada aumenta também Dose, bônus condicional e dano por turno", () => {
    const comprar = (treeId: string, rank: CharacterData["unlockedRanks"][number]["rank"], id: string) =>
      acoesDe(personagem({
        startingTreeId: treeId,
        unlockedRanks: [{ treeId, rank }],
        purchasedAbilities: [{ treeId, rank, kind: "ability", id }],
      })).find((a) => a.nome.endsWith("(Concentrada)"))!;

    const purgar = comprar("desintoxicacao", "Principiante", "purgar");
    expect(purgar).toMatchObject({ dano: "3d6 de dano de veneno por Dose invertida", inverteDose: "3d6", somaBc: false });

    const quebra = comprar("agua", "Avançado", "quebra-de-gelo");
    expect(quebra.dano).toContain("8d8 + BC");
    expect(quebra.dano).toContain("3d6 de frio");
    expect(quebra.bonusSeCongelado).toBe("+5d8");

    const era = comprar("agua", "Rei", "era-glacial");
    expect(era.danoPorTurno).toBe("5d10 de frio por turno, por 3 turnos");
    expect(era.somaBcPorTurno).toBe(false);
  });
});

describe("encontro com seleção de arma e auditoria", () => {
  it.each(["ataque", "resistencia"] as const)("Couraça mantém resultados com e sem log contra %s", (tipo) => {
    const c = personagem({ startingTreeId: "terra", unlockedRanks: [{ treeId: "terra", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "terra", rank: "Principiante", kind: "ability", id: "couraca-de-barro" }] });
    const monstro = { ...criaturaDoMolde(1, "padrao", "Teste", "teste"), acoes: [{
      id: "golpe", nome: "Golpe", acoes: 1, dano: "1d6+2 (cortante)", alcance: "Corpo a corpo", area: false, tipo, nota: "",
    }] };
    const opcoes = { batalhas: 30, semente: 31, maxRodadas: 8 };
    const sem = simularEncontro([c], [monstro], opcoes);
    const com = simularEncontro([c], [monstro], { ...opcoes, gerarLogs: true });
    expect({ ...com, logsExtremos: undefined }).toEqual({ ...sem, logsExtremos: undefined });
    const usou = com.logsExtremos!.some((log) => log.eventos?.some((e) => e.notas.some((n) => n.startsWith("Couraça de Barro:"))));
    expect(usou).toBe(tipo === "ataque");
  });
  it("o replay preserva resultado e arma escolhida, com eventos dos dois lados", () => {
    const c = personagem({ inventory: [
      { id: "espada", name: "Espada Longa", baseDie: "d8", type: "arma", equipped: true },
      { id: "montante", name: "Espadão / Montante", baseDie: "d10", type: "arma", equipped: false },
    ] });
    const monstro = { ...criaturaDoMolde(2, "padrao", "Monstro", "monstro"), quantidade: 2, acoes: [{
      id: "mordida", nome: "Mordida", acoes: 1, dano: "1d6+2", alcance: "Corpo a corpo", area: false, tipo: "ataque" as const, nota: "",
    }] };
    const opcoes = { batalhas: 10, semente: 31, maxRodadas: 8, armasPorPersonagem: { heroi: "montante" } };
    const sem = simularEncontro([c], [monstro], opcoes);
    const com = simularEncontro([c], [monstro], { ...opcoes, gerarLogs: true });
    expect({ ...com, logsExtremos: undefined }).toEqual({ ...sem, logsExtremos: undefined });
    const eventos = com.logsExtremos!.flatMap((log) => log.eventos ?? []);
    expect(eventos.some((ev) => ev.arma?.nome === "Espadão / Montante")).toBe(true);
    expect(eventos.some((ev) => ev.acao === "Mordida" && ev.teste)).toBe(true);
    expect(eventos.every((ev) => ev.rodada! >= 1)).toBe(true);
    for (const log of com.logsExtremos!) {
      const novamente = simularEncontro([c], [monstro], { ...opcoes, batalhas: 1, semente: log.seed, gerarLogs: true });
      expect(novamente.logsExtremos![0].eventos).toEqual(log.eventos);
    }
  });

  it("uma arma ignorada do inventário não muda resultados determinísticos", () => {
    const c = personagem();
    const mochila = { ...c, inventory: [...c.inventory, { id: "super", name: "Espadão / Montante", baseDie: "5d12", type: "arma" as const, equipped: false }] };
    const monstro = criaturaDoMolde(2, "padrao", "Monstro", "monstro");
    const opcoes = { batalhas: 5, semente: 78 };
    expect(simularEncontro([c], [monstro], opcoes)).toEqual(simularEncontro([mochila], [monstro], opcoes));
  });
});
