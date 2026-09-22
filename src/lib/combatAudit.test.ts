import { describe, expect, it, vi } from "vitest";
import { CharacterData } from "./types";
import { aplicarDano, danoEsperado, executarAtaquePersonagem, montarFicha, novaAcao, novoAlvo, novoEstado, resolver } from "./combatSim";
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

describe("recibo do combate usa os valores que alteraram os PV", () => {
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
    const acao = novaAcao({ nome: "Frio", ataque: true, dano: "1d6 frio" });
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
});

describe("encontro com seleção de arma e auditoria", () => {
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
