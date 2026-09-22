import { describe, expect, it } from "vitest";
import { criaturaDaFicha, formulaDaAcao } from "./fichaComoCriatura";
import {
  mediaFormula,
  montarFicha,
  novaAcao,
  patamarDaFicha,
} from "./combatSim";
import { simularEncontro, usaAcoes } from "./encounterSim";
import { getArmorClass, getMaxHp } from "@/store/selectors";
import { AttributeKey, CharacterData } from "./types";
import { getTreeById } from "@/data/trees";

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

  it("traz todas as ações ofensivas compatíveis e nomeia as que ainda não simula", () => {
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
    const convertiveis = derivada.acoes.filter((a) => a.tipo === "dano" && !a.reacao &&
      mediaFormula(formulaDaAcao(a, derivada.ataqueBasico.dano, derivada.bc)) > 0);
    expect(convertiveis.length).toBeGreaterThan(8);
    expect(doLivro).toHaveLength(convertiveis.length);
    const medias = doLivro.map((a) => mediaFormula(a.dano));
    expect([...medias].sort((x, y) => y - x)).toEqual(medias);
    const naoSimuladas = derivada.acoes.filter((a) => !convertiveis.some((outra) => outra.nome === a.nome));
    if (naoSimuladas.length > 0) {
      expect(criatura.perigo).toContain(naoSimuladas[0].nome);
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
