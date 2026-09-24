import { describe, expect, it } from "vitest";
import { criaturaDaFicha, formulaDaAcao } from "./fichaComoCriatura";
import {
  mediaFormula,
  montarFicha,
  novaAcao,
  patamarDaFicha,
} from "./combatSim";
import { simularEncontro, usaAcoes } from "./encounterSim";
import { getArmorClass, getAttackBonus, getMaxHp, getSpellDC } from "@/store/selectors";
import { AttributeKey, CharacterData } from "./types";
import { getTreeById } from "@/data/trees";
import { ehCriaturaImportavel } from "./validarCriaturaImportada";

/**
 * A ficha do jogador entrando como inimigo.
 *
 * O que este teste protege é a promessa da conversão: o rival que entra como
 * criatura tem que bater e aguentar o MESMO que bateria e aguentaria como
 * personagem. Se estes números divergirem de `montarFicha`, o teste de 300
 * batalhas passa a medir um inimigo que não existe.
 */
const ZERO: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

function ficha(patch: Partial<CharacterData> = {}): CharacterData {
  return {
    id: "t",
    name: "Rival",
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { ...ZERO },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: null,
    unlockedRanks: [],
    purchasedAbilities: [],
    purchasedCombinedSpells: [],
    gold: 0,
    inventory: [],
    skills: [],
    treeSkillChoices: [],
    proficiencies: [],
    weaponGroupChoices: [],
    bonusHp: 0,
    bonusMp: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
    overrides: {},
    ...patch,
  };
}

/** Um espadachim de verdade: árvore do Corpo, dois patamares e as técnicas deles. */
function espadachim(): CharacterData {
  const tree = getTreeById("deus-da-espada");
  const compras = (tree?.ranks ?? [])
    .filter((r) => r.rank === "Principiante" || r.rank === "Intermediário")
    .flatMap((r) => r.abilities.map((a) => ({ kind: "ability" as const, treeId: "deus-da-espada", rank: r.rank, id: a.id })));
  return ficha({
    name: "Rival de Espada",
    attributeBase: { ...ZERO, forca: 6, vigor: 5, agilidade: 4 },
    startingTreeId: "deus-da-espada",
    unlockedRanks: [
      { treeId: "deus-da-espada", rank: "Principiante" },
      { treeId: "deus-da-espada", rank: "Intermediário" },
    ],
    purchasedAbilities: compras,
    portrait: "data:image/jpeg;base64,xx",
  });
}

let n = 0;
const novoId = () => `acao_${n++}`;

describe("ficha como criatura", () => {
  it("copia os números derivados da ficha, e não os do molde do Apêndice G", () => {
    const c = espadachim();
    const derivada = montarFicha(c);

    const criatura = criaturaDaFicha(c, novoId);

    expect(criatura.nome).toBe("Rival de Espada");
    expect(criatura.pv).toBe(getMaxHp(c));
    expect(criatura.ca).toBe(getArmorClass(c));
    expect(criatura.bonusAtaque).toBe(derivada.bc);
    expect(criatura.patamar).toBe(patamarDaFicha(c));
    expect(criatura.quantidade).toBe(1);
    // "Padrão": um indivíduo que joga um turno de 3 Ações. Chefe daria a
    // rodada extra do Apêndice G, que é outra coisa.
    expect(criatura.papel).toBe("padrao");
    expect(criatura.portrait).toBe("data:image/jpeg;base64,xx");
  });

  it("cria chefe da ficha com PV dobrados e preserva suas defesas e reservas", () => {
    const c = espadachim();
    const derivada = montarFicha(c);
    const chefe = criaturaDaFicha(c, novoId, "chefe");
    expect(chefe.papel).toBe("chefe");
    expect(chefe.pv).toBe(derivada.pvMax * 2);
    expect(chefe.ca).toBe(derivada.ca);
    expect(chefe.bonusResistencia).toBe(derivada.resistencia);
    expect(chefe.bonusIniciativa).toBe(derivada.iniciativa);
    expect(chefe.deslocamento).toBe(derivada.deslocamento);
    expect(chefe.perfilDeFicha?.reservas).toMatchObject({ pm: derivada.pmMax, pt: derivada.ptMax });
  });

  it("usa o bônus e a CD da árvore que ensinou a magia, mesmo num chefe multiclasse", () => {
    const c = ficha({
      startingTreeId: "deus-da-espada",
      attributeBase: { ...ZERO, forca: 7, intelecto: 2 },
      unlockedRanks: [
        { treeId: "deus-da-espada", rank: "Intermediário" },
        { treeId: "agua", rank: "Principiante" },
      ],
      purchasedAbilities: [{ treeId: "agua", rank: "Principiante", kind: "ability", id: "impacto-de-gelo" }],
    });
    const criatura = criaturaDaFicha(c, novoId, "chefe");
    const gelo = criatura.acoes.find((a) => a.nome === "Impacto de Gelo");
    expect(gelo).toMatchObject({
      bonusAtaque: getAttackBonus(c, "agua", "intelecto"),
      cdResistencia: getSpellDC(c, "agua", "intelecto"),
      pmCost: 2,
      alcance: "18 metros",
    });
    expect(gelo?.bonusAtaque).not.toBe(criatura.bonusAtaque);
  });

  it("leva o perfil completo pelo formato de exportação da criatura", () => {
    const chefe = criaturaDaFicha(espadachim(), novoId, "chefe");
    const exportado = JSON.parse(JSON.stringify(chefe));
    expect(ehCriaturaImportavel(exportado)).toBe(true);
    expect(exportado.perfilDeFicha.arvores).toHaveLength(1);
    expect(exportado.perfilDeFicha.habilidades.length).toBeGreaterThan(0);
    expect(exportado.acoes.some((a: { ptCost?: number }) => a.ptCost)).toBe(true);
    exportado.perfilDeFicha.reservas.pt = "sem limite";
    expect(ehCriaturaImportavel(exportado)).toBe(false);
  });

  it("Água aplica Molhado, gelo só dobra contra Molhado e Fogo acende Em Chamas", () => {
    const agua = ficha({
      startingTreeId: "agua",
      unlockedRanks: [{ treeId: "agua", rank: "Principiante" }],
      purchasedAbilities: ["bola-de-agua", "impacto-de-gelo"].map((id) =>
        ({ treeId: "agua", rank: "Principiante" as const, kind: "ability" as const, id })),
    });
    const acoesAgua = criaturaDaFicha(agua, novoId).acoes;
    expect(acoesAgua.find((a) => a.nome === "Bola de Água")).toMatchObject({ aplicaMolhado: true });
    expect(acoesAgua.find((a) => a.nome === "Impacto de Gelo")).toMatchObject({ aplicaMolhado: false, frio: true });

    const fogo = ficha({
      startingTreeId: "fogo",
      unlockedRanks: [{ treeId: "fogo", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "fogo", rank: "Principiante", kind: "ability", id: "bola-de-fogo" }],
    });
    expect(criaturaDaFicha(fogo, novoId).acoes.find((a) => a.nome === "Bola de Fogo"))
      .toMatchObject({ fogo: true, aplicaEmChamas: true });
  });

  it("Fogo respeita as cartas: Lança não incendeia e Sopro só incendeia na falha", () => {
    const c = ficha({
      startingTreeId: "fogo", unlockedRanks: [{ treeId: "fogo", rank: "Intermediário" }],
      purchasedAbilities: ["lanca-de-fogo", "explosao", "sopro", "chuva-de-brasas"].map((id) =>
        ({ treeId: "fogo", rank: "Intermediário" as const, kind: "ability" as const, id })),
    });
    const acoes = criaturaDaFicha(c, novoId).acoes;
    expect(acoes.find((a) => a.nome === "Lança de Fogo")).toMatchObject({ fogo: true, aplicaEmChamas: undefined });
    expect(acoes.find((a) => a.nome === "Explosão")).toMatchObject({ fogo: undefined, aplicaEmChamas: undefined });
    expect(acoes.find((a) => a.nome === "Sopro")).toMatchObject({ fogo: true, aplicaEmChamas: true, emChamasSoNaFalha: true });
    expect(acoes.find((a) => a.nome === "Chuva de Brasas")).toMatchObject({ dano: "", aplicaEmChamas: true, emChamasSoNaFalha: true });

    const sopro = acoes.find((a) => a.nome === "Sopro")!;
    const rival = criaturaDaFicha(c, novoId);
    const resistente = ficha({ id: "resiste-fogo", bonusHp: 1000, attributeBase: { ...ZERO, agilidade: 100, vigor: 100 } });
    const falha = ficha({ id: "falha-fogo", bonusHp: 1000, attributeBase: { ...ZERO, agilidade: -100, vigor: -100 } });
    const rodar = (alvo: CharacterData) => simularEncontro([alvo], [{ ...rival, id: "piromante", pv: 1000, acoes: [sopro] }],
      { batalhas: 10, semente: 19, maxRodadas: 1, gerarLogs: true }).logsExtremos?.flatMap((l) => l.eventos ?? []) ?? [];
    expect(rodar(resistente).some((e) => e.acao === "Sopro" && e.notas.includes("Aplica Em Chamas."))).toBe(false);
    expect(rodar(falha).some((e) => e.acao === "Sopro" && e.notas.includes("Aplica Em Chamas."))).toBe(true);
    const brasas = acoes.find((a) => a.nome === "Chuva de Brasas")!;
    const chuva = simularEncontro([falha], [{ ...rival, id: "piromante-brasas", pv: 1000, acoes: [brasas] }],
      { batalhas: 10, semente: 19, maxRodadas: 1, gerarLogs: true });
    expect(chuva.logsExtremos?.some((l) => l.eventos?.some((e) =>
      e.acao === "Chuva de Brasas" && e.notas.includes("Aplica Em Chamas.")))).toBe(true);
  });

  it("um muro que só causa dano ao atravessar fica como regra manual, sem ataque imediato", () => {
    const c = ficha({
      startingTreeId: "fogo", unlockedRanks: [{ treeId: "fogo", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "fogo", rank: "Principiante", kind: "ability", id: "muro-de-chamas" }],
    });
    const rival = criaturaDaFicha(c, novoId);
    expect(rival.acoes.some((a) => a.nome === "Muro de Chamas")).toBe(false);
    expect(rival.perfilDeFicha?.habilidades.some((h) => h.nome === "Muro de Chamas")).toBe(true);
  });

  it("converte condições de falha explícitas das técnicas de resistência", () => {
    const escudo = ficha({
      startingTreeId: "cavalaria-e-escudos",
      attributeBase: { ...ZERO, vigor: 15 },
      unlockedRanks: [{ treeId: "cavalaria-e-escudos", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "cavalaria-e-escudos", rank: "Principiante", kind: "ability", id: "golpe-de-escudo" }],
    });
    const convertidoEscudo = criaturaDaFicha(escudo, novoId);
    expect(convertidoEscudo.acoes.find((a) => a.nome === "Golpe de Escudo"))
      .toMatchObject({ tipo: "resistencia", aplicaCaido: true });
    const golpe = convertidoEscudo.acoes.find((a) => a.nome === "Golpe de Escudo")!;
    const heroi = ficha({ id: "alvo-do-escudo", bonusHp: 1000 });
    const resultado = simularEncontro([heroi], [{ ...convertidoEscudo, id: "escudeiro", pv: 1000, acoes: [golpe] }],
      { batalhas: 10, semente: 12, maxRodadas: 2, gerarLogs: true });
    expect(resultado.logsExtremos?.some((l) => l.eventos?.some((e) => e.notas.includes("Aplica Caído.")))).toBe(true);
    const terra = ficha({
      startingTreeId: "terra",
      unlockedRanks: [{ treeId: "terra", rank: "Intermediário" }],
      purchasedAbilities: [{ treeId: "terra", rank: "Intermediário", kind: "ability", id: "terremoto-menor" }],
    });
    expect(criaturaDaFicha(terra, novoId).acoes.find((a) => a.nome === "Terremoto Menor")?.aplicaCaido).toBe(true);
  });

  it("o relatório executa Molhado, frio dobrado e Em Chamas", () => {
    const agua = ficha({
      startingTreeId: "agua", attributeBase: { ...ZERO, intelecto: 20 },
      unlockedRanks: [{ treeId: "agua", rank: "Principiante" }],
      purchasedAbilities: ["bola-de-agua", "impacto-de-gelo"].map((id) =>
        ({ treeId: "agua", rank: "Principiante" as const, kind: "ability" as const, id })),
    });
    const baseAgua = criaturaDaFicha(agua, novoId);
    const heroi = ficha({ id: "alvo-elemental", bonusHp: 1000 });
    const bola = baseAgua.acoes.find((a) => a.nome === "Bola de Água")!;
    const gelo = baseAgua.acoes.find((a) => a.nome === "Impacto de Gelo")!;
    const molhar = simularEncontro([heroi], [{ ...baseAgua, id: "rival-agua", pv: 1000, acoes: [bola] }],
      { batalhas: 10, semente: 5, maxRodadas: 2, gerarLogs: true });
    expect(molhar.logsExtremos?.some((l) => l.eventos?.some((e) => e.notas.includes("Aplica Molhado e apaga Em Chamas.")))).toBe(true);
    const congelar = simularEncontro([heroi], [{ ...baseAgua, id: "rival-gelo", pv: 1000, acoes: [gelo] }],
      { batalhas: 10, semente: 5, maxRodadas: 2, gerarLogs: true,
        cenario: { participantes: { "alvo-elemental": { molhado: true } } } });
    expect(congelar.logsExtremos?.some((l) => l.eventos?.some((e) => e.notas.includes("Frio contra Molhado: dano ×2 na parcela fria")))).toBe(true);
    const eventoFrio = congelar.logsExtremos?.flatMap((l) => l.eventos ?? [])
      .find((e) => e.acao === "Impacto de Gelo" && e.notas.includes("Frio contra Molhado: dano ×2 na parcela fria"));
    expect(eventoFrio).toBeDefined();
    if (eventoFrio) {
      const rolagem = eventoFrio.parcelas[0].rolagem;
      const resistiu = eventoFrio.teste!.total >= eventoFrio.teste!.defesa;
      const frioRolado = rolagem.grupos[gelo.indicesFrio![0]].resultados.reduce((s, dado) => s + dado, 0);
      expect(eventoFrio.aposModificadores).toBe(resistiu
        ? Math.floor((rolagem.total + frioRolado) / 2)
        : rolagem.total + frioRolado);
    }

    const fogo = ficha({ startingTreeId: "fogo", attributeBase: { ...ZERO, intelecto: 20 },
      unlockedRanks: [{ treeId: "fogo", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "fogo", rank: "Principiante", kind: "ability", id: "bola-de-fogo" }] });
    const baseFogo = criaturaDaFicha(fogo, novoId);
    const queimar = simularEncontro([heroi], [{ ...baseFogo, id: "rival-fogo", pv: 1000,
      acoes: baseFogo.acoes.filter((a) => a.nome === "Bola de Fogo") }],
    { batalhas: 10, semente: 5, maxRodadas: 2, gerarLogs: true });
    expect(queimar.logsExtremos?.some((l) => l.eventos?.some((e) => e.notas.includes("Aplica Em Chamas.")))).toBe(true);
    const secar = simularEncontro([heroi], [{ ...baseFogo, id: "rival-fogo", pv: 1000,
      acoes: baseFogo.acoes.filter((a) => a.nome === "Bola de Fogo") }],
    { batalhas: 10, semente: 5, maxRodadas: 2, gerarLogs: true,
      cenario: { participantes: { "alvo-elemental": { molhado: true } } } });
    expect(secar.logsExtremos?.some((l) => l.eventos?.some((e) =>
      e.notas.includes("Fogo evapora Molhado; alvo não pega fogo.") && !e.notas.includes("Aplica Em Chamas.")))).toBe(true);
  });

  it("o Deus da Água convertido usa Fluxo quando o herói erra corpo a corpo", () => {
    const c = ficha({
      startingTreeId: "deus-da-agua-corpo",
      unlockedRanks: [{ treeId: "deus-da-agua-corpo", rank: "Principiante" }],
      attributeBase: { ...ZERO, forca: 5, agilidade: 3 },
    });
    const convertido = criaturaDaFicha(c, novoId, "chefe");
    expect(convertido.perfilDeFicha?.fluxo?.usosPorRodada).toBeGreaterThan(0);
    const chefe = { ...convertido, id: "mestre-da-agua", ca: 100, pv: 1000 };
    const heroi = ficha({ id: "heroi-corpo-a-corpo", bonusHp: 1000 });
    const resultado = simularEncontro([heroi], [chefe], { batalhas: 10, semente: 44, maxRodadas: 3, gerarLogs: true });
    expect(resultado.logsExtremos?.some((l) => l.eventos?.some((e) => e.acao === "Fluxo"))).toBe(true);
  });

  it("Aparar da ficha transforma acerto em erro e permite o Fluxo", () => {
    const c = ficha({
      startingTreeId: "deus-da-agua-corpo",
      unlockedRanks: [{ treeId: "deus-da-agua-corpo", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "deus-da-agua-corpo", rank: "Principiante", kind: "ability", id: "aparar" }],
    });
    const convertido = criaturaDaFicha(c, novoId, "chefe");
    expect(convertido.perfilDeFicha?.aparar).toMatchObject({ bonusCA: 1, alcance: 1.5 });
    const heroi = ficha({ id: "atacante", bonusHp: 1000 });
    const ca = montarFicha(heroi).arma.attackBonus + 11;
    const chefe = { ...convertido, id: "aparador", ca, pv: 1000 };
    const resultado = simularEncontro([heroi], [chefe], { batalhas: 80, semente: 311, maxRodadas: 8, gerarLogs: true });
    const eventos = resultado.logsExtremos?.flatMap((log) => log.eventos ?? []) ?? [];
    expect(eventos.some((e) => e.acertou === false && e.notas.some((nota) => nota.startsWith("Aparar:")))).toBe(true);
    expect(eventos.some((e) => e.acao === "Fluxo")).toBe(true);
  });

  it("o invocador chefe prepara um Pacto, paga PM e o invocado age no encontro", () => {
    const c = ficha({
      startingTreeId: "invocacao", unlockedRanks: [{ treeId: "invocacao", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "invocacao", rank: "Principiante", kind: "talent", id: "pacto-cao-de-caca" }],
    });
    const convertido = criaturaDaFicha(c, novoId, "chefe");
    const pactos = convertido.perfilDeFicha?.pactos;
    expect(pactos?.opcoes.some((p) => p.id === "pacto-cao-de-caca")).toBe(true);
    expect(pactos?.preparados).toContain("pacto-cao-de-caca");
    const arquivo = JSON.parse(JSON.stringify(convertido));
    expect(ehCriaturaImportavel(arquivo)).toBe(true);
    arquivo.perfilDeFicha.pactos.opcoes[0].quantidade = 1000000;
    expect(ehCriaturaImportavel(arquivo)).toBe(false);
    const chefe = { ...convertido, id: "invocador", pv: 1000 };
    const heroi = ficha({ id: "alvo-do-pacto", bonusHp: 1000 });
    const resultado = simularEncontro([heroi], [chefe], { batalhas: 10, semente: 28, maxRodadas: 3, gerarLogs: true });
    expect(resultado.logsExtremos?.some((l) => l.linhas.some((linha) => linha.includes("preparou") && linha.includes("PM")))).toBe(true);
    expect(resultado.logsExtremos?.some((l) => l.eventos?.some((e) => e.atacante.includes("Cão") || e.atacante.includes("Caça")))).toBe(true);
  });

  it("Chamado de Emergência invoca no combate e o Pacto age a partir da próxima rodada", () => {
    const c = ficha({
      startingTreeId: "invocacao", unlockedRanks: [{ treeId: "invocacao", rank: "Principiante" }],
      purchasedAbilities: [
        { treeId: "invocacao", rank: "Principiante", kind: "ability", id: "chamado" },
        { treeId: "invocacao", rank: "Principiante", kind: "talent", id: "pacto-cao-de-caca" },
      ],
    });
    const convertido = criaturaDaFicha(c, novoId);
    expect(convertido.perfilDeFicha?.pactos?.emergencia).toMatchObject({ custoBase: 7, semPenalidade: false });
    const perfil = convertido.perfilDeFicha!;
    const rival = { ...convertido, id: "invocador-emergencia", pv: 1000,
      perfilDeFicha: { ...perfil, pactos: { ...perfil.pactos!, preparados: [] } } };
    const heroi = ficha({ id: "alvo-emergencia", bonusHp: 1000, attributeBase: { ...ZERO, agilidade: -100 } });
    const resultado = simularEncontro([heroi], [rival], { batalhas: 10, semente: 19, maxRodadas: 2, gerarLogs: true });
    expect(resultado.logsExtremos?.some((l) => l.linhas.some((linha) =>
      linha.includes("usa Chamado de Emergência") && linha.includes("7 PM")))).toBe(true);
    expect(resultado.logsExtremos?.some((l) => l.eventos?.some((e) => e.atacante.includes("Cão de Caça")))).toBe(true);
  });

  it("Convocação Aprimorada chama em 1 Ação e deixa o invocador atacar no mesmo turno", () => {
    const c = ficha({
      startingTreeId: "invocacao", unlockedRanks: [{ treeId: "invocacao", rank: "Avançado" }],
      purchasedAbilities: [
        { treeId: "invocacao", rank: "Principiante", kind: "ability", id: "chamado" },
        { treeId: "invocacao", rank: "Principiante", kind: "talent", id: "invocacao-de-emergencia" },
        { treeId: "invocacao", rank: "Avançado", kind: "talent", id: "convocacao-aprimorada" },
        { treeId: "invocacao", rank: "Principiante", kind: "talent", id: "pacto-cao-de-caca" },
      ],
    });
    const convertido = criaturaDaFicha(c, novoId);
    expect(convertido.perfilDeFicha?.pactos?.emergencia).toMatchObject({ acoes: 1, custoBase: 4 });
    const perfil = convertido.perfilDeFicha!;
    const rival = { ...convertido, id: "convocador", pv: 1000,
      perfilDeFicha: { ...perfil, pactos: { ...perfil.pactos!, preparados: [] } } };
    const heroi = ficha({ id: "alvo-convocacao", bonusHp: 1000, attributeBase: { ...ZERO, agilidade: -100 } });
    const resultado = simularEncontro([heroi], [rival], { batalhas: 10, semente: 34, maxRodadas: 1, gerarLogs: true });
    expect(resultado.logsExtremos?.some((l) => l.linhas.some((linha) =>
      linha.includes("Chamado de Emergência (1 Ação, 4 PM)")))).toBe(true);
    expect(resultado.logsExtremos?.some((l) => l.eventos?.some((e) => e.atacante === rival.nome))).toBe(true);
  });

  it("a Serpente invocada exige Vigor para aplicar Envenenado", () => {
    const c = ficha({
      startingTreeId: "invocacao", attributeBase: { ...ZERO, espirito: 14 },
      unlockedRanks: [{ treeId: "invocacao", rank: "Intermediário" }],
      purchasedAbilities: [{ treeId: "invocacao", rank: "Intermediário", kind: "talent", id: "pacto-serpente-de-nevoa" }],
    });
    const chefe = criaturaDaFicha(c, novoId, "chefe");
    const serpente = chefe.perfilDeFicha?.pactos?.opcoes.find((p) => p.id === "pacto-serpente-de-nevoa");
    expect(serpente?.cdVeneno).toBe(8 + 14 + 2);
    expect(chefe.perfilDeFicha?.pactos?.preparados).toContain("pacto-serpente-de-nevoa");
    const heroi = ficha({ id: "alvo-da-serpente", bonusHp: 1000 });
    const resultado = simularEncontro([heroi], [{ ...chefe, id: "invocador-serpente", pv: 1000 }],
      { batalhas: 10, semente: 29, maxRodadas: 3, gerarLogs: true });
    expect(resultado.logsExtremos?.some((l) => l.eventos?.some((e) =>
      e.atacante.includes("Serpente") && e.notas.includes("Aplica Envenenado.") &&
      e.notas.some((nota) => nota.startsWith("Vigor contra veneno:"))))).toBe(true);
  });

  it("um chefe curandeiro gasta PM para curar um aliado ferido", () => {
    const c = ficha({
      startingTreeId: "cura", attributeBase: { ...ZERO, espirito: 12, agilidade: 30 },
      unlockedRanks: [{ treeId: "cura", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "cura", rank: "Principiante", kind: "ability", id: "cura" }],
    });
    const curandeiro = criaturaDaFicha(c, novoId, "chefe");
    expect(curandeiro.acoes.find((a) => a.nome === "Cura")).toMatchObject({ tipo: "cura", formulaSuporte: expect.stringContaining("1d8") });
    const aliado = { ...criaturaDaFicha(ficha({ name: "Guarda" }), novoId), id: "guarda", pv: 80 };
    const heroi = ficha({ id: "heroi-lento", bonusHp: 1000, attributeBase: { ...ZERO, agilidade: -100 } });
    const resultado = simularEncontro([heroi], [{ ...curandeiro, id: "curandeiro", pv: 1000 }, aliado], {
      batalhas: 10, semente: 31, maxRodadas: 1, gerarLogs: true,
      cenario: { criaturasUmPv: ["guarda"] },
    });
    expect(resultado.logsExtremos?.some((l) => l.linhas.some((linha) =>
      linha.includes("usa Cura em Guarda") && linha.includes("cura:")))).toBe(true);
    expect(resultado.logsExtremos?.some((l) => l.linhas.some((linha) => linha.includes("gasta") && linha.includes("PM em Cura")))).toBe(true);
  });

  it("uma magia de 4 Ações entra em cântico e sai no turno seguinte", () => {
    const c = ficha({
      startingTreeId: "agua", attributeBase: { ...ZERO, intelecto: 20 },
      unlockedRanks: [{ treeId: "agua", rank: "Imperador" }],
      purchasedAbilities: [{ treeId: "agua", rank: "Imperador", kind: "ability", id: "zero-absoluto" }],
    });
    const rival = criaturaDaFicha(c, novoId);
    const magia = rival.acoes.find((a) => a.nome === "Zero Absoluto");
    expect(magia).toMatchObject({ acoes: 4, pmCost: 20 });
    const heroi = ficha({ id: "alvo-do-cantico", bonusHp: 1000, attributeBase: { ...ZERO, agilidade: -100 } });
    const resultado = simularEncontro([heroi], [{ ...rival, id: "mago", pv: 1000,
      acoes: [rival.acoes[0], magia!] }], { batalhas: 10, semente: 17, maxRodadas: 2, gerarLogs: true });
    expect(resultado.logsExtremos?.some((l) => l.linhas.some((linha) => linha.includes("inicia o cântico de Zero Absoluto")))).toBe(true);
    expect(resultado.logsExtremos?.some((l) => l.linhas.some((linha) => linha.includes("conclui o cântico de Zero Absoluto")))).toBe(true);
    expect(resultado.logsExtremos?.some((l) => l.eventos?.some((e) => e.acao === "Zero Absoluto"))).toBe(true);
  });

  it("desconta recursos do rival e deixa de usar a técnica quando acabam", () => {
    const convertido = criaturaDaFicha(espadachim(), novoId, "chefe");
    const rival = {
      ...convertido, id: "rival-recursos", pv: 1000,
      perfilDeFicha: { ...convertido.perfilDeFicha!, reservas: { pm: 2, pt: 0, pp: 0 } },
      acoes: [convertido.acoes[0], {
        ...convertido.acoes[0], id: "especial", nome: "Técnica limitada", dano: "10d8",
        pmCost: 2, acoes: 1,
      }],
    };
    const heroi = ficha({ id: "alvo", name: "Alvo", bonusHp: 1000 });
    const resultado = simularEncontro([heroi], [rival], { batalhas: 10, semente: 23, maxRodadas: 4, gerarLogs: true });
    expect(resultado.logsExtremos?.length).toBeGreaterThan(0);
    for (const log of resultado.logsExtremos ?? []) {
      expect(log.linhas.filter((linha) => linha.includes("gasta 2 PM em Técnica limitada"))).toHaveLength(1);
    }
  });

  // Nenhuma árvore declara "Atacar com Arma" como habilidade — é regra do
  // Cap. 4. Sem ele, o guerreiro convertido pareceria não saber bater.
  it("o ataque comum vem sempre, e vem primeiro", () => {
    const criatura = criaturaDaFicha(espadachim(), novoId);

    expect(criatura.acoes[0].nome).toMatch(/^Ataque com/);
    expect(mediaFormula(criatura.acoes[0].dano)).toBeGreaterThan(0);
    expect(usaAcoes({ ...criatura, id: "x" })).toBe(true);
  });

  // `combatSim.resolver` faz a mesma distinção: a Escada de Dados e o Bônus de
  // Rank no golpe são exclusivos da Árvore do Corpo (Cap. 3). Somar o BC cheio
  // aqui daria ao mago convertido o braço de um espadachim.
  it("o mago bate sem estilo, e por isso sem o Bônus de Rank no golpe", () => {
    const mago = ficha({
      name: "Maga de Água",
      attributeBase: { ...ZERO, intelecto: 6, espirito: 4 },
      startingTreeId: "agua",
      unlockedRanks: [
        { treeId: "agua", rank: "Principiante" },
        { treeId: "agua", rank: "Intermediário" },
      ],
    });
    const derivada = montarFicha(mago);
    expect(derivada.bcSemRank).toBeLessThan(derivada.bc);

    const criatura = criaturaDaFicha(mago, novoId);

    // "golpe sem estilo" substituiu "arma simples" em 0.1.60: a regra é a
    // mesma (Cap. 3 — sem árvore do Corpo, sem Bônus de Rank), mas "arma
    // simples" deixou de ser uma categoria do livro na 0.1.52.
    expect(criatura.acoes[0].nome).toBe("Ataque com golpe sem estilo");
    expect(criatura.acoes[0].dano).toBe(`${derivada.ataqueBasico.dano}+${derivada.bcSemRank}`);
    // A criatura mantém o bônus geral das técnicas, mas o golpe tem o seu próprio.
    expect(criatura.bonusAtaque).toBe(derivada.bc);
    expect(criatura.acoes[0].bonusAtaque).toBe(derivada.arma.attackBonus);
  });

  it("o espadachim soma o BC cheio no golpe comum", () => {
    const c = espadachim();
    const derivada = montarFicha(c);

    const criatura = criaturaDaFicha(c, novoId);

    expect(criatura.acoes[0].dano).toBe(`${derivada.ataqueBasico.dano}+${derivada.bc}`);
  });

  it("uma ficha sem nenhuma habilidade comprada ainda entra batendo", () => {
    const cru = ficha({ attributeBase: { ...ZERO, forca: 4, vigor: 3 } });

    const criatura = criaturaDaFicha(cru, novoId);

    expect(criatura.acoes).toHaveLength(1);
    expect(criatura.danoPorTurno).toBeGreaterThan(0);
    expect(criatura.patamar).toBeGreaterThanOrEqual(1);
  });

  it("Ladino convertido mantém Dano Furtivo e só usa Primeiro Golpe numa abertura por combate", () => {
    const ladino = ficha({
      id: "ladino",
      name: "Rival Ladino",
      startingTreeId: "furtividade-e-armadilhas",
      attributeBase: { ...ZERO, agilidade: 7, vigor: 4 },
      unlockedRanks: [{ treeId: "furtividade-e-armadilhas", rank: "Intermediário" }],
      purchasedAbilities: [{ treeId: "furtividade-e-armadilhas", rank: "Principiante", kind: "ability", id: "primeiro-golpe" }],
    });
    const convertido = { ...criaturaDaFicha(ladino, novoId), id: "rival" };
    const primeiro = convertido.acoes.find((a) => a.regra === "primeiro-golpe");
    expect(convertido.dadosFurtivos).toBe(2);
    expect(primeiro).toMatchObject({ tipo: "ataque", bonusAtaque: montarFicha(ladino).arma.attackBonus });
    expect(primeiro?.dano).toContain("6d6");

    const heroi = ficha({ id: "heroi", name: "Herói", bonusHp: 300 });
    const resultado = simularEncontro([heroi], [convertido], {
      batalhas: 10, semente: 42, gerarLogs: true,
      cenario: { participantes: { rival: { escondido: true } } },
    });
    const logs = resultado.logsExtremos ?? [];
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some((l) => l.eventos?.some((e) => e.acao === "Primeiro Golpe"))).toBe(true);
    for (const log of logs) {
      expect(log.eventos?.filter((e) => e.acao === "Primeiro Golpe")).toHaveLength(1);
      expect(log.eventos?.some((e) => e.acao === "Primeiro Golpe" && e.parcelas.some((p) => p.origem === "Dano Furtivo"))).toBe(true);
    }
  });

  it("Ladino convertido não usa Primeiro Golpe depois de perder a abertura", () => {
    const ladino = ficha({
      id: "ladino-sem-abertura", startingTreeId: "furtividade-e-armadilhas",
      unlockedRanks: [{ treeId: "furtividade-e-armadilhas", rank: "Principiante" }],
      purchasedAbilities: [{ treeId: "furtividade-e-armadilhas", rank: "Principiante", kind: "ability", id: "primeiro-golpe" }],
    });
    const rival = { ...criaturaDaFicha(ladino, novoId), id: "rival" };
    const heroi = ficha({ id: "heroi-rapido", bonusHp: 300,
      attributeBase: { ...ZERO, agilidade: 100 },
    });
    const resultado = simularEncontro([heroi], [rival], { batalhas: 10, semente: 91, gerarLogs: true });
    expect(resultado.logsExtremos?.every((log) => !log.eventos?.some((e) => e.acao === "Primeiro Golpe"))).toBe(true);
  });

  it("Passo Vazio da ficha reabre Primeiro Golpe do rival uma única vez", () => {
    const ladino = ficha({
      id: "ladino-passo", startingTreeId: "furtividade-e-armadilhas",
      unlockedRanks: [{ treeId: "furtividade-e-armadilhas", rank: "Intermediário" }],
      purchasedAbilities: [
        { treeId: "furtividade-e-armadilhas", rank: "Principiante", kind: "ability", id: "primeiro-golpe" },
        { treeId: "furtividade-e-armadilhas", rank: "Intermediário", kind: "ability", id: "passo-vazio" },
      ],
    });
    const rival = { ...criaturaDaFicha(ladino, novoId), id: "rival" };
    expect(rival.temPassoVazio).toBe(true);
    const heroi = ficha({ id: "heroi-resistente", bonusHp: 1000 });
    const resultado = simularEncontro([heroi], [rival], {
      batalhas: 10, semente: 42, gerarLogs: true,
      cenario: { participantes: { rival: { escondido: true } } },
    });
    const logs = resultado.logsExtremos ?? [];
    expect(logs.length).toBeGreaterThan(0);
    for (const log of logs) {
      expect(log.eventos?.filter((e) => e.acao === "Primeiro Golpe")).toHaveLength(2);
      expect(log.linhas.filter((linha) => linha.includes("Passo Vazio"))).toHaveLength(1);
    }
  });

  it("preserva arma, degraus acima do teto e bônus no ataque do rival", () => {
    const c = ficha({
      startingTreeId: "deus-da-espada",
      attributeBase: { ...ZERO, forca: 4 },
      unlockedRanks: [{ treeId: "deus-da-espada", rank: "Imperador" }],
      inventory: [{ id: "arma", type: "arma", name: "Espadão / Montante", baseDie: "4d12", equipped: true }],
    });
    const arma = montarFicha(c).arma;
    const ataque = criaturaDaFicha(c, novoId).acoes[0];
    expect(ataque.dano).toBe(`5d12+14+${arma.damageBonus}`);
    expect(ataque.bonusAtaque).toBe(arma.attackBonus);
    expect(ataque.nota).toContain("4d12 → 5d12+14");
  });

  it("não empresta o bônus mágico nem esconde a falta de proficiência no golpe", () => {
    const c = ficha({
      startingTreeId: "agua",
      attributeBase: { ...ZERO, forca: 3, intelecto: 9 },
      unlockedRanks: [{ treeId: "agua", rank: "Imperador" }],
      inventory: [{ id: "arma", type: "arma", name: "Espadão / Montante", baseDie: "d10", equipped: true }],
    });
    const criatura = criaturaDaFicha(c, novoId);
    expect(criatura.bonusAtaque).toBeGreaterThan(3);
    expect(criatura.acoes[0]).toMatchObject({ dano: "1d10+3", bonusAtaque: 3, desvantagemAtaque: true });
  });

  it("traz ações ofensivas de até 4 Ações e preserva as demais no perfil", () => {
    const tree = getTreeById("agua")!;
    const c = ficha({
      startingTreeId: tree.id,
      unlockedRanks: tree.ranks.map((r) => ({ treeId: tree.id, rank: r.rank })),
      purchasedAbilities: tree.ranks.flatMap((r) => r.abilities.map((a) => ({
        kind: "ability" as const, treeId: tree.id, rank: r.rank, id: a.id,
      }))),
    });
    const criatura = criaturaDaFicha(c, novoId);
    const doLivro = criatura.acoes.slice(1);

    const derivada = montarFicha(c);
    const gatilhosDeCena = new Set(tree.ranks.flatMap((r) => r.abilities)
      .filter((a) => /a quem atravess|a quem tocar|quem (?:te )?atingir|a quem começar o turno/i.test(a.damage?.normal ?? ""))
      .map((a) => a.name));
    const convertiveis = derivada.acoes.filter((a) => a.tipo === "dano" && !a.reacao && a.acoes <= 4 &&
      !gatilhosDeCena.has(a.nome) &&
      mediaFormula(formulaDaAcao(a, derivada.ataqueBasico.dano, derivada.bc)) > 0);
    expect(convertiveis.length).toBeGreaterThan(8);
    expect(doLivro).toHaveLength(convertiveis.length);
    const medias = doLivro.map((a) => mediaFormula(a.dano));
    expect([...medias].sort((x, y) => y - x)).toEqual(medias);
    const naoSimuladas = derivada.acoes.filter((a) => !convertiveis.some((outra) => outra.nome === a.nome));
    if (naoSimuladas.length > 0) {
      expect(criatura.perfilDeFicha?.habilidades.some((h) => h.nome === naoSimuladas[0].nome)).toBe(true);
    }
  });

  describe("a fórmula de uma ação", () => {
    const acaoBase = novaAcao({ nome: "Golpe", ataque: true });

    it("mantém os dados próprios e o fixo do texto", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "3d6+2" }, 8, 5)).toBe("3d6+2");
    });

    // O livro escreve "+ BC" onde o Bônus de Combate entra, e cala onde não
    // entra. O cartão do Mestre segue a carta da habilidade, e não a
    // simplificação do motor (que soma BC em toda ação).
    it("soma o BC só onde o livro escreve BC", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "1d8 + BC (cortante) + 1d4 de frio" }, 8, 5)).toBe("1d8+1d4+5 (cortante, frio)");
      expect(formulaDaAcao({ ...acaoBase, dano: "2d8 de frio" }, 8, 5)).toBe("2d8 (frio)");
    });

    // "(24d12 contra alvo Molhado)" é o dano de OUTRO caso. Somado, virava um
    // cartão de 36d12.
    it("ignora o que está entre parênteses, que é condicional", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "12d12 de frio (24d12 contra alvo Molhado)" }, 8, 5)).toBe("12d12 (frio)");
    });

    // Oito técnicas do livro multiplicam o Dado de Arma em vez de trazer dados
    // próprios; sem traduzir isso, elas somariam zero.
    it("troca “Dados de Arma” pelo dado real da ficha e soma o Bônus de Combate", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "+2 Dados de Arma", dadosDeArma: 2 }, 8, 5)).toBe("2d8+5");
      expect(formulaDaAcao({ ...acaoBase, dano: "3d6 + 1 Dado de Arma", dadosDeArma: 1 }, 10, 4)).toBe("3d6+1d10+4");
    });

    it("uma ação sem dado nenhum não vira dano inventado", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "empurra o alvo 3 metros" }, 8, 5)).toBe("");
    });

    it("multiplica todos os dados e o fixo da arma, sem perder o excesso de degraus", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "+2 Dados de Arma", dadosDeArma: 2 }, "5d12+14", 5)).toBe("10d12+33");
    });

    it("não converte meia parcela de arma em cinco dados por acidente", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "Metade do Dado de Arma", dadosDeArma: 0.5 }, "1d8", 5)).toBe("");
    });
  });
});
