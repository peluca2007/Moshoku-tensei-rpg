import { describe, expect, it } from "vitest";
import {
  Acao,
  Alvo,
  acoesDe,
  danoEsperado,
  escolherAcao,
  makeRng,
  montarFicha,
  novoEstado,
  resolver,
} from "./combatSim";
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

/*
 * A conta da DECISÃO tem que bater com a conta da RESOLUÇÃO.
 *
 * `danoEsperado` é a previsão que a IA usa pra escolher; `resolver` é o que
 * acontece com os dados na mão. As duas nasceram separadas, e é assim que uma
 * IA passa a preferir a técnica errada sem ninguém notar — foi exatamente o que
 * aconteceu com os Dados de Arma, que a resolução rolava e a decisão contava
 * como zero.
 *
 * O teste roda a resolução alguns milhares de vezes e compara a média empírica
 * com a previsão. Não é um teste de fórmula: é um teste de CONCORDÂNCIA, e ele
 * quebra se qualquer uma das duas mudar sem a outra.
 */
describe("a previsão da IA bate com o que os dados devolvem", () => {
  function media(e: ReturnType<typeof novoEstado>, acao: Acao, ca: number, n = 8000): number {
    let total = 0;
    for (let semente = 1; semente <= n; semente++) {
      const rng = makeRng(semente);
      const alvo: Alvo = {
        nome: "boneco",
        pv: 1_000_000,
        ca,
        vivo: true,
        molhado: false,
        emChamas: 0,
        quebrantado: 0,
        preso: false,
        caido: false,
        envenenado: false,
        reacaoDisponivel: false,
        danoCausado: 0,
      };
      total += resolver(e, acao, alvo, rng);
    }
    return total / n;
  }

  const casos: { nome: string; arvore: string; ca: number }[] = [
    { nome: "magia de ataque contra CA baixa", arvore: "fogo", ca: 10 },
    { nome: "magia de ataque contra CA alta", arvore: "fogo", ca: 20 },
    { nome: "técnica de Dado de Arma", arvore: "deus-da-espada", ca: 15 },
  ];

  for (const caso of casos) {
    it(`${caso.nome}: previsão e média empírica se encontram`, () => {
      const e = novoEstado(montarFicha(comArvoreInteira(caso.arvore)));
      const alvoRef: Alvo = {
        nome: "ref",
        pv: 1,
        ca: caso.ca,
        vivo: true,
        molhado: false,
        emChamas: 0,
        quebrantado: 0,
        preso: false,
        caido: false,
        envenenado: false,
        reacaoDisponivel: false,
        danoCausado: 0,
      };
      const acao = escolherAcao(e, 3, alvoRef);
      const previsto = danoEsperado(e, acao, alvoRef);
      const empirico = media(e, acao, caso.ca);
      // 12% de folga: a previsão trata o d20 como uniforme e ignora efeitos de
      // segunda ordem (fogo, Molhado) que a resolução aplica. O que o teste
      // cobra é que as duas contas falem da mesma ação, não que sejam iguais
      // até a última casa.
      expect(Math.abs(previsto - empirico) / empirico, `${acao.nome}: previu ${previsto.toFixed(1)}, saiu ${empirico.toFixed(1)}`).toBeLessThan(0.12);
    });
  }

  /*
   * O defeito, dito na forma de asserção.
   *
   * Cinco das seis ações de dano do Deus da Espada multiplicam o dado da arma
   * em vez de trazer dados próprios, e `mediaDados` lê zero nelas. Enquanto a
   * IA escolhia por essa média, a árvore que o livro chama de maior dano do
   * jogo tinha as suas maiores técnicas invisíveis pra própria IA — a Espada de
   * Luz Verdadeira, que rola o dado da arma CINCO vezes, valia zero.
   *
   * Se esta asserção cair, a decisão voltou a ignorar os Dados de Arma.
   */
  it("a IA do Deus da Espada escolhe uma técnica de Dado de Arma", () => {
    const e = novoEstado(montarFicha(comArvoreInteira("deus-da-espada")));
    const alvo: Alvo = {
      nome: "ref",
      pv: 1,
      ca: 15,
      vivo: true,
      molhado: false,
      emChamas: 0,
      quebrantado: 0,
      preso: false,
      caido: false,
      envenenado: false,
      reacaoDisponivel: false,
      danoCausado: 0,
    };
    const escolhida = escolherAcao(e, 3, alvo);
    expect(
      escolhida.dadosDeArma,
      `escolheu ${escolhida.nome}, que não multiplica o dado da arma`
    ).toBeGreaterThan(0);
    // E o dano previsto tem que refletir isso: sem os Dados de Arma na conta, a
    // previsão desta técnica seria pouco mais que o bônus fixo.
    expect(danoEsperado(e, escolhida, alvo)).toBeGreaterThan(e.ficha.bc);
  });

  it("a previsão cai quando a CA sobe — senão a IA não estaria olhando pro alvo", () => {
    const e = novoEstado(montarFicha(comArvoreInteira("fogo")));
    const ref = (ca: number): Alvo => ({
      nome: "ref",
      pv: 1,
      ca,
      vivo: true,
      molhado: false,
      emChamas: 0,
      quebrantado: 0,
      preso: false,
      caido: false,
      envenenado: false,
      reacaoDisponivel: false,
      danoCausado: 0,
    });
    const acaoDeAtaque = acoesDe(comArvoreInteira("fogo")).find((a) => a.ataque)!;
    expect(danoEsperado(e, acaoDeAtaque, ref(25))).toBeLessThan(danoEsperado(e, acaoDeAtaque, ref(8)));
  });
});
