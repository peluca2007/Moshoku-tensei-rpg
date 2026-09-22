import { describe, expect, it, vi } from "vitest";
import type { CharacterData } from "./types";
import { aoIniciarRodada, autorizarAcao, executarAtaquePersonagem, montarFicha, novoAlvo, novoEstado, turnoPersonagem } from "./combatSim";
import { CombateLogger, criaturaDoMolde, simularEncontro } from "./encounterSim";
import { caDepoisDeAparar, guardaDoCorpo, reagirComFluxo } from "./combatReactions";
import { aproximar } from "./combatScenario";
import { pactosDeCombate, prepararInvocados } from "./combatSummons";
import { gerarLootDoEncontro } from "./lootGenerator";

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

function ladino() {
  return novoEstado(montarFicha(personagem({
    startingTreeId: "furtividade-e-armadilhas",
    unlockedRanks: [{ treeId: "furtividade-e-armadilhas", rank: "Principiante" }, { treeId: "furtividade-e-armadilhas", rank: "Intermediário" }],
    purchasedAbilities: [{ treeId: "furtividade-e-armadilhas", rank: "Principiante", kind: "ability", id: "primeiro-golpe" }],
  })));
}
function agua() {
  return novoEstado(montarFicha(personagem({
    startingTreeId: "deus-da-agua-corpo",
    unlockedRanks: [{ treeId: "deus-da-agua-corpo", rank: "Intermediário" }],
    purchasedAbilities: ["aparar", "devolver", "guarda-do-corpo"].map((id) => ({ treeId: "deus-da-agua-corpo", rank: id === "devolver" ? "Intermediário" : "Principiante", kind: "ability", id })),
  })));
}

describe("aberturas, ações e reações da cena", () => {
  it("Primeiro Golpe usa o maior Rank e exige abertura antes de gastar a rolagem", () => {
    const e = ladino();
    const a = e.ficha.acoes.find((a) => a.regra === "primeiro-golpe")!;
    expect(a.dano).toBe("6d6");
    const alvo = novoAlvo({ nome: "Alvo", pv: 200, ca: 1 });
    alvo.jaAgiu = true;
    const rng = vi.fn(() => .5);
    expect(autorizarAcao(e, a, alvo).legal).toBe(false);
    expect(executarAtaquePersonagem(e, a, alvo, rng)).toBe(0);
    expect(rng).not.toHaveBeenCalled();
    e.escondido = true;
    expect(executarAtaquePersonagem(e, a, alvo, rng)).toBe(41);
    expect(e.usouFurtivo).toBe(true);
    expect(e.usouPrimeiroGolpe).toBe(true);
    expect(e.escondido).toBe(false);
  });

  it("Furtivo é parcela própria e só entra uma vez por turno", () => {
    const e = ladino();
    const alvo = novoAlvo({ nome: "Alvo", pv: 300, ca: 1 });
    const log = new CombateLogger();
    executarAtaquePersonagem(e, e.ficha.ataqueBasico, alvo, () => .5, log);
    executarAtaquePersonagem(e, e.ficha.ataqueBasico, alvo, () => .5, log);
    expect(log.eventos[0].parcelas.some((p) => p.origem === "Dano Furtivo")).toBe(true);
    expect(log.eventos[1].parcelas.some((p) => p.origem === "Dano Furtivo")).toBe(false);
  });


  it("lê Primeiro Golpe e Passo Vazio da ficha e reabre o golpe uma vez", () => {
    const e = novoEstado(montarFicha(personagem({
      startingTreeId: "furtividade-e-armadilhas",
      unlockedRanks: [{ treeId: "furtividade-e-armadilhas", rank: "Intermediário" }],
      purchasedAbilities: ["primeiro-golpe", "passo-vazio"].map((id) => ({ treeId: "furtividade-e-armadilhas", rank: id === "primeiro-golpe" ? "Principiante" : "Intermediário", kind: "ability", id })),
    })));
    const alvo = novoAlvo({ nome: "Alvo", pv: 1000, ca: 1 });
    const log = new CombateLogger();
    turnoPersonagem(e, [alvo], () => .5, [], log);
    expect(log.eventos.filter((x) => x.acao === "Primeiro Golpe")).toHaveLength(2);
    expect(log.linhas.some((x) => x.includes("Passo Vazio"))).toBe(true);
    expect(e.usouPassoVazio).toBe(true);
    expect(log.eventos[0].parcelas.some((x) => x.origem === "Dano Furtivo")).toBe(true);
    expect(log.eventos[1].parcelas.some((x) => x.origem === "Dano Furtivo")).toBe(false);
  });

  it("com Sombra Longa tenta esconder-se de novo por 1 Ação contra Percepção", () => {
    const e = novoEstado(montarFicha(personagem({
      startingTreeId: "furtividade-e-armadilhas",
      unlockedRanks: [{ treeId: "furtividade-e-armadilhas", rank: "Intermediário" }],
      purchasedAbilities: [{ treeId: "furtividade-e-armadilhas", rank: "Intermediário", kind: "talent", id: "sombra-longa" }],
    })));
    const alvo = novoAlvo({ nome: "Alvo", pv: 1000, ca: 1, percepcaoPassiva: 10, jaAgiu: true });
    const log = new CombateLogger();
    turnoPersonagem(e, [alvo], () => .5, [], log);
    expect(log.linhas.filter((x) => x.includes("Se Esconder"))).toHaveLength(1);
    expect(log.eventos).toHaveLength(2);
    expect(log.eventos[0].parcelas.some((x) => x.origem === "Dano Furtivo")).toBe(true);
  });

  it("Surpreso tem uma Ação, sem reação, e termina no primeiro turno", () => {
    const e = novoEstado(montarFicha(personagem()));
    e.surpreso = true;
    aoIniciarRodada(e, true);
    expect(e.reacaoDisponivel).toBe(false);
    const log = new CombateLogger();
    turnoPersonagem(e, [novoAlvo({ nome: "Alvo", pv: 1000, ca: 1 })], () => .5, [], log);
    expect(log.eventos).toHaveLength(1);
    expect(e.surpreso).toBe(false);
    expect(e.jaAgiu).toBe(true);
  });

  it("Aparar vê o resultado, gasta reação só se puder evitar o golpe e permite Fluxo sem reação", () => {
    const e = agua(); e.posicao = 0; e.ca = 15; e.pt = 5;
    const inimigo = novoAlvo({ nome: "Inimigo", pv: 500, ca: 1 }); inimigo.posicao = 1.5;
    aoIniciarRodada(e, true);
    expect(caDepoisDeAparar(e, inimigo, 20, 22)).toBe(15);
    expect(e.reacaoDisponivel).toBe(true);
    expect(caDepoisDeAparar(e, inimigo, 12, 16)).toBe(17);
    expect(e.reacaoDisponivel).toBe(false);
    const log = new CombateLogger();
    expect(reagirComFluxo(e, inimigo, "2d6+4", 1, () => .5, log)).toBe(true);
    expect(e.pt).toBe(4);
    expect(e.fluxoRestante).toBe(1);
    expect(log.eventos).toHaveLength(1);
    expect(log.eventos[0].bonusDano).toBe(e.ficha.arma.damageBonus + 6);
    expect(log.eventos[0].acao).toBe("Fluxo + Devolver");
  });

  it("Fluxo não inventa adjacência nem excede seu limite", () => {
    const e = agua(); const inimigo = novoAlvo({ nome: "Inimigo", pv: 500, ca: 1 });
    aoIniciarRodada(e, true);
    expect(reagirComFluxo(e, inimigo, "1d6", 1, () => .5)).toBe(false);
    e.posicao = 0; inimigo.posicao = 1;
    expect(reagirComFluxo(e, inimigo, "1d6", 1, () => .5)).toBe(true);
    expect(reagirComFluxo(e, inimigo, "1d6", 1, () => .5)).toBe(true);
    expect(reagirComFluxo(e, inimigo, "1d6", 1, () => .5)).toBe(false);
  });

  it("Guarda do Corpo exige aliado adjacente, troca posição e consome reação", () => {
    const e = agua(); e.posicao = 0; e.ca = 20;
    const aliado = novoEstado(montarFicha(personagem())); aliado.posicao = 1; aliado.ca = 10;
    const inimigo = novoAlvo({ nome: "Inimigo", pv: 500, ca: 1 });
    aoIniciarRodada(e, true);
    expect(guardaDoCorpo(aliado, inimigo, [aliado, e])).toBe(e);
    expect(e.posicao).toBe(1); expect(aliado.posicao).toBe(0); expect(e.reacaoDisponivel).toBe(false);
  });

  it("mover respeita terreno difícil e Preso", () => {
    const a = novoAlvo({ nome: "A", pv: 20, ca: 10 }); a.posicao = 0; a.terrenoDificil = true;
    const b = novoAlvo({ nome: "B", pv: 20, ca: 10 }); b.posicao = 20;
    expect(aproximar(a, b, 1.5, 9)).toBe(true); expect(a.posicao).toBe(4.5);
    a.preso = true;
    expect(aproximar(a, b, 1.5, 9)).toBe(false); expect(a.posicao).toBe(4.5);
  });

  it("o cenário e os recibos repetem os mesmos resultados", () => {
    const criatura = criaturaDoMolde(1, "padrao", "Monstro", "monstro");
    const opts = { batalhas: 10, semente: 123, gerarLogs: true, cenario: { distancia: 9, terrenoDificil: true, criaturasUmPv: [criatura.id] } };
    const a = simularEncontro([personagem()], [criatura], opts);
    expect(a).toEqual(simularEncontro([personagem()], [criatura], opts));
    expect(a.logsExtremos).toHaveLength(10);
    expect(a.logsExtremos!.some((l) => l.linhas.some((s) => s.includes("aproximar")))).toBe(true);
    expect(a.logsExtremos!.every((l) => l.linhas.at(-1)?.includes(l.categoria))).toBe(true);
  });
});

describe("invocações e recompensas", () => {
  function invocador() {
    return personagem({ startingTreeId: "invocacao", bonusMp: 40,
      unlockedRanks: [{ treeId: "invocacao", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "invocacao", rank: "Principiante", kind: "talent", id: "pacto-cao-de-caca" }],
    });
  }
  it("usa o pacto comprado, cobra PM do preparo e dá somente uma Ação ao invocado", () => {
    const c = invocador(); const dono = novoEstado(montarFicha(c)); const antes = dono.pm;
    expect(pactosDeCombate(c).map((p) => p.nome)).toEqual(["Cão de Caça"]);
    const [invocado] = prepararInvocados([c], [dono], { [c.id]: ["pacto-cao-de-caca"] });
    expect(dono.pm).toBe(antes - 3); expect(invocado.pv).toBe(10); expect(invocado.ca).toBe(11);
    expect(invocado.fioDaVida).toBe(false);
    const log = new CombateLogger();
    turnoPersonagem(invocado, [novoAlvo({ nome: "Alvo", pv: 1000, ca: 1 })], () => .5, [], log);
    expect(log.eventos).toHaveLength(1);
  });
  it("recusa pacto não comprado e preparo sem PM", () => {
    const c = invocador(); const dono = novoEstado(montarFicha(c));
    expect(() => prepararInvocados([c], [dono], { [c.id]: ["pacto-grifo"] })).toThrow("indisponível");
    dono.pm = 0;
    expect(() => prepararInvocados([c], [dono], { [c.id]: ["pacto-cao-de-caca"] })).toThrow("PM insuficiente");
  });
  it("invocados não inflam o total de PV restante e deixam seus próprios recibos", () => {
    const c = invocador();
    const criatura = criaturaDoMolde(1, "padrao", "Monstro", "m");
    const r = simularEncontro([c], [criatura], { batalhas: 10, gerarLogs: true, cenario: { invocadosPreparados: { [c.id]: ["pacto-cao-de-caca"] } } });
    expect(r.pvRestante).toBeLessThanOrEqual(1);
    expect(r.porPersonagem).toHaveLength(1);
    expect(r.logsExtremos!.some((l) => l.eventos!.some((e) => e.atacante.startsWith("Cão de Caça")))).toBe(true);
  });
  it("tesouro é reproduzível e nunca ultrapassa o orçamento do mestre", () => {
    for (const valor of [0, 1, 15, 150, 10000]) {
      const r = gerarLootDoEncontro(valor, 7);
      expect(r).toEqual(gerarLootDoEncontro(valor, 7));
      expect(r.moedas + r.itens.reduce((s, i) => s + i.price, 0)).toBe(valor);
      expect(r.itens.every((i) => i.id && i.description && i.price > 0)).toBe(true);
    }
    expect(() => gerarLootDoEncontro(-1, 0)).toThrow();
  });
});
