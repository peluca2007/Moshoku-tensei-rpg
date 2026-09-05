import { beforeEach, describe, expect, it } from "vitest";
import { useBestiaryStore } from "./useBestiaryStore";

/**
 * As gavetas do bestiário.
 *
 * O que está coberto aqui é o que dói se quebrar: um Mestre reorganiza as
 * pastas com trinta criaturas montadas dentro delas, e nenhuma operação de
 * arrumação pode custar uma criatura. As contas de simulação já têm os testes
 * de `encounterSim`; isto aqui é sobre não perder trabalho.
 */
function zerar() {
  useBestiaryStore.setState({ criaturas: [], pastas: [], selecionadas: [], grupo: [], chegada: null });
}

describe("pastas do bestiário", () => {
  beforeEach(zerar);

  it("cria criatura dentro da pasta escolhida, e sem pasta quando não há escolha", () => {
    const pasta = useBestiaryStore.getState().criarPasta("Goblins da estrada");
    const dentro = useBestiaryStore.getState().criar(2, "padrao", "Goblin", pasta);
    const fora = useBestiaryStore.getState().criar(2, "padrao", "Solto");

    const { criaturas } = useBestiaryStore.getState();
    expect(criaturas.find((c) => c.id === dentro)?.pastaId).toBe(pasta);
    expect(criaturas.find((c) => c.id === fora)?.pastaId).toBeUndefined();
  });

  // O medo do Mestre ao clicar na lixeira de uma pasta cheia. A lixeira come a
  // gaveta; o que estava dentro volta pra "Fora das pastas".
  it("apagar a pasta preserva as criaturas de dentro", () => {
    const pasta = useBestiaryStore.getState().criarPasta("Arco 2");
    useBestiaryStore.getState().criar(3, "chefe", "Dragão", pasta);
    useBestiaryStore.getState().criar(3, "padrao", "Lacaio", pasta);

    useBestiaryStore.getState().removerPasta(pasta);

    const { criaturas, pastas } = useBestiaryStore.getState();
    expect(pastas).toHaveLength(0);
    expect(criaturas).toHaveLength(2);
    expect(criaturas.every((c) => c.pastaId === undefined)).toBe(true);
  });

  it("mover criatura a leva pro fim da pasta de destino, e `null` a tira de todas", () => {
    const a = useBestiaryStore.getState().criarPasta("A");
    const b = useBestiaryStore.getState().criarPasta("B");
    const primeira = useBestiaryStore.getState().criar(1, "padrao", "Primeira", b);
    const viajante = useBestiaryStore.getState().criar(1, "padrao", "Viajante", a);

    useBestiaryStore.getState().moverCriatura(viajante, b);
    let { criaturas } = useBestiaryStore.getState();
    expect(criaturas.filter((c) => c.pastaId === b).map((c) => c.id)).toEqual([primeira, viajante]);

    useBestiaryStore.getState().moverCriatura(viajante, null);
    criaturas = useBestiaryStore.getState().criaturas;
    expect(criaturas.find((c) => c.id === viajante)?.pastaId).toBeUndefined();
  });

  // A seta troca com a vizinha DA MESMA PASTA — no array elas estão separadas
  // por uma criatura de outra gaveta, que não pode se mexer.
  it("reordenar respeita a pasta e não mexe em quem está fora dela", () => {
    const pasta = useBestiaryStore.getState().criarPasta("Covil");
    const um = useBestiaryStore.getState().criar(1, "padrao", "Um", pasta);
    const intruso = useBestiaryStore.getState().criar(1, "padrao", "Intruso");
    const dois = useBestiaryStore.getState().criar(1, "padrao", "Dois", pasta);

    useBestiaryStore.getState().reordenarCriatura(dois, -1);

    const ids = useBestiaryStore.getState().criaturas.map((c) => c.id);
    expect(ids.filter((id) => id !== intruso)).toEqual([dois, um]);
    expect(ids).toContain(intruso);
  });

  it("a criatura no fim da pasta não sai dela ao descer", () => {
    const pasta = useBestiaryStore.getState().criarPasta("Covil");
    const um = useBestiaryStore.getState().criar(1, "padrao", "Um", pasta);
    const dois = useBestiaryStore.getState().criar(1, "padrao", "Dois", pasta);

    useBestiaryStore.getState().reordenarCriatura(dois, 1);

    expect(useBestiaryStore.getState().criaturas.map((c) => c.id)).toEqual([um, dois]);
  });

  it("a cópia nasce na mesma pasta da original", () => {
    const pasta = useBestiaryStore.getState().criarPasta("Covil");
    const original = useBestiaryStore.getState().criar(1, "padrao", "Lobo", pasta);

    const copia = useBestiaryStore.getState().duplicar(original);

    expect(copia).not.toBeNull();
    expect(useBestiaryStore.getState().criaturas.find((c) => c.id === copia)?.pastaId).toBe(pasta);
  });

  // Um `.mtcriatura` carrega o `pastaId` do bestiário que o exportou, e aquele
  // id não significa nada aqui.
  it("importar descarta a pasta que veio no arquivo", () => {
    const pasta = useBestiaryStore.getState().criarPasta("Minha pasta");
    const semente = useBestiaryStore.getState().criar(1, "padrao", "Base", pasta);
    const base = useBestiaryStore.getState().criaturas.find((c) => c.id === semente)!;

    const solta = useBestiaryStore.getState().importarCriatura({ ...base, pastaId: "pasta_de_outro" });
    const dirigida = useBestiaryStore
      .getState()
      .importarCriatura({ ...base, pastaId: "pasta_de_outro" }, pasta);

    const { criaturas } = useBestiaryStore.getState();
    expect(criaturas.find((c) => c.id === solta)?.pastaId).toBeUndefined();
    expect(criaturas.find((c) => c.id === dirigida)?.pastaId).toBe(pasta);
  });

  it("marcar o lote não duplica quem já estava no encontro, e desmarcar só tira o lote", () => {
    const um = useBestiaryStore.getState().criar(1, "padrao", "Um");
    const dois = useBestiaryStore.getState().criar(1, "padrao", "Dois");
    // `criar` já entra selecionada; o lote inclui uma que já estava marcada.
    useBestiaryStore.getState().definirSelecaoDeVarias([um, dois], true);
    expect(useBestiaryStore.getState().selecionadas).toEqual([um, dois]);

    useBestiaryStore.getState().definirSelecaoDeVarias([dois], false);
    expect(useBestiaryStore.getState().selecionadas).toEqual([um]);
  });

  // A pasta importada é uma gaveta NOVA: nem o id dela nem os das criaturas
  // vêm do arquivo, senão reimportar o próprio backup colidiria com o que já
  // está no bestiário.
  it("importar pasta traz as criaturas com ids novos, todas dentro dela", () => {
    const existente = useBestiaryStore.getState().criarPasta("Já tinha");
    useBestiaryStore.getState().criar(1, "padrao", "Antiga", existente);

    const nova = useBestiaryStore.getState().importarPasta({
      nome: "Emboscada da estrada",
      cor: "vinho",
      emoji: "🏹",
      criaturas: [
        { nome: "Goblin", patamar: 1, papel: "lacaio", pv: 12, ca: 12, bonusAtaque: 3, danoPorTurno: 6, cdResistencia: 13, quantidade: 1, perigo: "", acoes: [] },
        { nome: "Bandido", patamar: 2, papel: "padrao", pv: 30, ca: 14, bonusAtaque: 5, danoPorTurno: 12, cdResistencia: 14, quantidade: 1, perigo: "", acoes: [] },
      ],
    });

    const { criaturas, pastas } = useBestiaryStore.getState();
    expect(nova).not.toBe(existente);
    expect(pastas).toHaveLength(2);
    expect(pastas[1]).toMatchObject({ nome: "Emboscada da estrada", cor: "vinho", emoji: "🏹", recolhida: false });
    const dentro = criaturas.filter((c) => c.pastaId === nova);
    expect(dentro.map((c) => c.nome)).toEqual(["Goblin", "Bandido"]);
    expect(new Set(criaturas.map((c) => c.id)).size).toBe(criaturas.length);
    // A pasta que já existia não perde nada.
    expect(criaturas.filter((c) => c.pastaId === existente)).toHaveLength(1);
  });

  // A tela precisa saber o que acabou de entrar pra abrir, expandir e rolar até
  // lá — sem isso, importar é um clique que não parece fazer nada.
  it("tudo que entra deixa uma chegada, e a marca muda a cada uma", () => {
    const primeira = useBestiaryStore.getState().criar(1, "padrao", "Uma");
    expect(useBestiaryStore.getState().chegada).toMatchObject({ tipo: "criatura", id: primeira });

    const marcaAnterior = useBestiaryStore.getState().chegada!.marca;
    const copia = useBestiaryStore.getState().duplicar(primeira)!;
    const depois = useBestiaryStore.getState().chegada!;
    expect(depois).toMatchObject({ tipo: "criatura", id: copia });
    expect(depois.marca).not.toBe(marcaAnterior);

    const pasta = useBestiaryStore.getState().criarPasta("Nova");
    expect(useBestiaryStore.getState().chegada).toMatchObject({ tipo: "pasta", id: pasta });

    useBestiaryStore.getState().limparChegada();
    expect(useBestiaryStore.getState().chegada).toBeNull();
  });

  it("mover pasta nas pontas não muda a ordem", () => {
    const a = useBestiaryStore.getState().criarPasta("A");
    const b = useBestiaryStore.getState().criarPasta("B");

    useBestiaryStore.getState().moverPasta(a, -1);
    expect(useBestiaryStore.getState().pastas.map((p) => p.id)).toEqual([a, b]);

    useBestiaryStore.getState().moverPasta(b, 1);
    expect(useBestiaryStore.getState().pastas.map((p) => p.id)).toEqual([a, b]);

    useBestiaryStore.getState().moverPasta(b, -1);
    expect(useBestiaryStore.getState().pastas.map((p) => p.id)).toEqual([b, a]);
  });
});
