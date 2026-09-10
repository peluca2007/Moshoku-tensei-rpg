import { describe, expect, it } from "vitest";
import { acoesDe } from "./combatSim";
import { criaturaDaFicha } from "./fichaComoCriatura";
import { TREES, getTreeById } from "@/data/trees";
import { AttributeKey, CharacterData } from "./types";

/**
 * Quem pode errar — 0.1.35.
 *
 * ## O erro que este teste existe pra impedir de voltar
 *
 * O motor decide se uma técnica rola ataque procurando frases como "Ataque
 * mágico à distância" no texto dela. Ele procurava em `damage.normal`, e a
 * frase mora em `effect`. O resultado medido foi **zero** das 122 ações do
 * livro inteiro rolando ataque: todas caíam no ramo de teste de resistência,
 * que não consulta a CA do alvo e garante metade do dano até quando o alvo
 * passa no teste.
 *
 * A Classe de Armadura era decoração em toda simulação que este projeto já
 * rodou, e nenhuma técnica do livro errava. O erro não tinha como aparecer: ele
 * não quebra nada, não avisa nada, só devolve números plausíveis e errados —
 * exatamente o tipo de coisa que o playtest deste projeto existe pra não fazer.
 *
 * O teste abaixo é a única coisa que impede a linha de voltar a olhar o campo
 * errado.
 */

const ZERO: Record<AttributeKey, number> = {
  forca: 0,
  agilidade: 0,
  vigor: 0,
  intelecto: 0,
  espirito: 0,
};

/** Um personagem que comprou TUDO de uma árvore, pra varrer as técnicas dela. */
function comArvoreInteira(treeId: string): CharacterData {
  const tree = getTreeById(treeId);
  const compras = (tree?.ranks ?? []).flatMap((r) =>
    (r.abilities ?? []).map((a) => ({ kind: "ability" as const, treeId, rank: r.rank, id: a.id }))
  );
  return {
    id: "t",
    name: "Varredura",
    lore: "",
    raceId: null,
    backgroundId: null,
    subtableEntryId: null,
    attributeBase: { ...ZERO, forca: 5, intelecto: 5, agilidade: 4, vigor: 4 },
    raceAttributeChoices: [],
    racialUpgrades: [],
    saveAdvantages: [],
    startingTreeId: treeId,
    unlockedRanks: (tree?.ranks ?? []).map((r) => ({ treeId, rank: r.rank })),
    purchasedAbilities: compras,
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
    condicoes: [],
    descansosCurtos: 0,
    overrides: {},
  } as unknown as CharacterData;
}

describe("a rolagem de ataque é lida do campo certo", () => {
  it("existe pelo menos uma técnica que rola ataque — o número que era zero", () => {
    const total = TREES.reduce((n, t) => n + acoesDe(comArvoreInteira(t.id)).filter((a) => a.ataque).length, 0);
    // Dezessete, na medição de 2026-09-10. A asserção é "mais que zero" de
    // propósito: o livro ainda cresce, e travar o número exato só criaria um
    // teste que quebra quando alguém escreve uma magia nova.
    expect(total).toBeGreaterThan(0);
  });

  /*
   * As três magias abaixo dizem "Ataque mágico à distância" em toda letra. Se
   * alguma delas parar de rolar ataque, a leitura voltou pro campo errado.
   */
  it("as magias que o livro declara como ataque rolam ataque", () => {
    const fogo = acoesDe(comArvoreInteira("fogo"));
    const agua = acoesDe(comArvoreInteira("agua"));
    expect(fogo.find((a) => a.nome === "Bola de Fogo")?.ataque).toBe(true);
    expect(fogo.find((a) => a.nome === "Lança de Fogo")?.ataque).toBe(true);
    expect(agua.find((a) => a.nome === "Flecha de Água")?.ataque).toBe(true);
  });

  it("o que não é ataque continua não sendo — o ramo de resistência não sumiu", () => {
    const agua = acoesDe(comArvoreInteira("agua"));
    const semAtaque = agua.filter((a) => !a.ataque);
    expect(semAtaque.length).toBeGreaterThan(0);
  });

  /*
   * A conversão ficha→criatura lê `acao.ataque` em vez de reimplementar a
   * detecção. Este teste é o que garante que ela continue lendo, e não copiando
   * — duas cópias da mesma regra divergem em silêncio, e a que diverge é
   * sempre a que ninguém roda.
   */
  it("o rival montado a partir da ficha herda a mesma decisão", () => {
    let n = 0;
    const criatura = criaturaDaFicha(comArvoreInteira("fogo"), () => `a_${n++}`);
    // A Bola de Fogo não serve de sonda aqui: a conversão leva só as técnicas
    // mais fortes pra carta do rival, e uma magia de Principiante fica de fora.
    const lanca = criatura.acoes.find((a) => a.nome === "Lança de Fogo");
    expect(lanca?.tipo).toBe("ataque");
    const naoAtaque = criatura.acoes.find((a) => a.tipo === "resistencia");
    expect(naoAtaque, "o rival não pode virar só ataques").toBeTruthy();
  });
});
