import { describe, expect, it } from "vitest";
import { criaturaDaFicha, formulaDaAcao } from "./fichaComoCriatura";
import { mediaFormula, montarFicha, patamarDaFicha } from "./combatSim";
import { usaAcoes } from "./encounterSim";
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
    bonusHp: 0,
    bonusMp: 0,
    currentHp: null,
    currentMp: null,
    currentPt: null,
    currentPp: null,
    currentCalor: null,
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
  it("o mago bate com arma simples, sem o Bônus de Rank no golpe", () => {
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

    expect(criatura.acoes[0].nome).toBe("Ataque com arma simples");
    expect(criatura.acoes[0].dano).toBe(`${derivada.ataqueBasico.dano}+${derivada.bcSemRank}`);
    // O Bônus de Ataque da criatura (o d20) continua sendo o da árvore dela.
    expect(criatura.bonusAtaque).toBe(derivada.bc);
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

  it("traz no máximo 8 ações, as mais fortes, e diz quantas ficaram de fora", () => {
    const c = espadachim();
    const criatura = criaturaDaFicha(c, novoId);
    const doLivro = criatura.acoes.slice(1);

    expect(doLivro.length).toBeLessThanOrEqual(8);
    const medias = doLivro.map((a) => mediaFormula(a.dano));
    expect([...medias].sort((x, y) => y - x)).toEqual(medias);
    if (montarFicha(c).acoes.length > doLivro.length) {
      expect(criatura.perigo).toMatch(/ficaram de fora/);
    }
  });

  describe("a fórmula de uma ação", () => {
    const acaoBase = {
      nome: "Golpe",
      acoes: 1,
      pm: 0,
      pt: 0,
      dadosDeArma: 0,
      area: false,
      ataque: true,
      frio: false,
      fogo: false,
      aplicaMolhado: false,
    };

    it("mantém os dados próprios e o fixo do texto", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "3d6+2" }, 8, 5)).toBe("3d6+2");
    });

    // O livro escreve "+ BC" onde o Bônus de Combate entra, e cala onde não
    // entra. O cartão do Mestre segue a carta da habilidade, e não a
    // simplificação do motor (que soma BC em toda ação).
    it("soma o BC só onde o livro escreve BC", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "1d8 + BC (cortante) + 1d4 de frio" }, 8, 5)).toBe("1d8+1d4+5");
      expect(formulaDaAcao({ ...acaoBase, dano: "2d8 de frio" }, 8, 5)).toBe("2d8");
    });

    // "(24d12 contra alvo Molhado)" é o dano de OUTRO caso. Somado, virava um
    // cartão de 36d12.
    it("ignora o que está entre parênteses, que é condicional", () => {
      expect(formulaDaAcao({ ...acaoBase, dano: "12d12 de frio (24d12 contra alvo Molhado)" }, 8, 5)).toBe("12d12");
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
  });
});
