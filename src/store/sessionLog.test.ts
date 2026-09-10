import { beforeEach, describe, expect, it } from "vitest";
import { EventoDeSessao, resumirSessao, useSessionLog } from "./useSessionLog";

function ev(p: Partial<EventoDeSessao> & { tipo: EventoDeSessao["tipo"]; rotulo: string; valor: number }): EventoDeSessao {
  return { id: Math.random().toString(36), quando: Date.now(), ...p };
}

beforeEach(() => {
  useSessionLog.setState({ gravando: false, eventos: [] });
});

/*
 * A regra que protege a mesa: ele começa DESLIGADO e não grava nada até alguém
 * mandar. Gravar por padrão transformaria toda partida numa coleta silenciosa,
 * num site inteiro construído em cima de dado que não sai do aparelho.
 */
describe("a gravação é uma decisão", () => {
  it("nasce desligado e ignora o que chega", () => {
    expect(useSessionLog.getState().gravando).toBe(false);
    useSessionLog.getState().registrar({ tipo: "rolagem", rotulo: "Teste", valor: 14 });
    expect(useSessionLog.getState().eventos).toEqual([]);
  });

  it("ligado, grava — e desligado de novo, para", () => {
    useSessionLog.getState().alternarGravacao();
    useSessionLog.getState().registrar({ tipo: "rolagem", rotulo: "Teste", valor: 14 });
    expect(useSessionLog.getState().eventos).toHaveLength(1);

    useSessionLog.getState().alternarGravacao();
    useSessionLog.getState().registrar({ tipo: "rolagem", rotulo: "Outro", valor: 9 });
    expect(useSessionLog.getState().eventos).toHaveLength(1);
  });

  it("zerar apaga tudo, sem desligar a gravação", () => {
    useSessionLog.getState().alternarGravacao();
    useSessionLog.getState().registrar({ tipo: "rolagem", rotulo: "Teste", valor: 1 });
    useSessionLog.getState().limpar();
    expect(useSessionLog.getState().eventos).toEqual([]);
    expect(useSessionLog.getState().gravando).toBe(true);
  });

  it("cada evento ganha id próprio", () => {
    useSessionLog.getState().alternarGravacao();
    for (let i = 0; i < 50; i++) useSessionLog.getState().registrar({ tipo: "rolagem", rotulo: "x", valor: i });
    const ids = useSessionLog.getState().eventos.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("as contas do resumo", () => {
  it("conta rolagens, críticos e falhas críticas separadamente", () => {
    const r = resumirSessao([
      ev({ tipo: "rolagem", rotulo: "Ataque", valor: 20, critico: "sucesso" }),
      ev({ tipo: "rolagem", rotulo: "Ataque", valor: 1, critico: "falha" }),
      ev({ tipo: "rolagem", rotulo: "Teste", valor: 12, critico: null }),
      ev({ tipo: "dano", rotulo: "Rudeus", valor: 7 }),
    ]);
    expect(r.rolagens).toBe(3);
    expect(r.criticos).toBe(1);
    expect(r.falhasCriticas).toBe(1);
  });

  /*
   * A conta que existe pra responder a pergunta do Vendaval: "ele alguma vez
   * apanha?". Ela soma o dano LEVADO por personagem e conta os golpes, que é
   * exatamente o que o O-QUE-FALTA pede pra contar no papel.
   */
  it("soma o dano levado por personagem, do pior pro melhor", () => {
    const r = resumirSessao([
      ev({ tipo: "dano", rotulo: "Vendaval", valor: 4 }),
      ev({ tipo: "dano", rotulo: "Guerreiro", valor: 12 }),
      ev({ tipo: "dano", rotulo: "Guerreiro", valor: 9 }),
      ev({ tipo: "cura", rotulo: "Guerreiro", valor: 5 }),
    ]);
    expect(r.danoPorPersonagem).toEqual([
      { nome: "Guerreiro", total: 21, golpes: 2 },
      { nome: "Vendaval", total: 4, golpes: 1 },
    ]);
  });

  it("cura NÃO entra na conta de dano levado", () => {
    const r = resumirSessao([ev({ tipo: "cura", rotulo: "Eris", valor: 10 })]);
    expect(r.danoPorPersonagem).toEqual([]);
  });

  it("ordena o que mais se repetiu, e desempata por nome", () => {
    const r = resumirSessao([
      ev({ tipo: "rolagem", rotulo: "Bola de Fogo", valor: 1 }),
      ev({ tipo: "rolagem", rotulo: "Bola de Fogo", valor: 1 }),
      ev({ tipo: "rolagem", rotulo: "Zangar", valor: 1 }),
      ev({ tipo: "rolagem", rotulo: "Andar", valor: 1 }),
    ]);
    expect(r.usoPorRotulo).toEqual([
      { rotulo: "Bola de Fogo", vezes: 2 },
      { rotulo: "Andar", vezes: 1 },
      { rotulo: "Zangar", vezes: 1 },
    ]);
  });

  /* Rolagem fora de combate não tem de quem é a vez — e some da assinatura em
     vez de virar uma linha "undefined". */
  it("ignora rolagem sem ator na contagem por quem estava agindo", () => {
    const r = resumirSessao([
      ev({ tipo: "rolagem", rotulo: "a", valor: 1, ator: "Eris" }),
      ev({ tipo: "rolagem", rotulo: "b", valor: 1 }),
    ]);
    expect(r.rolagensPorAtor).toEqual([{ ator: "Eris", vezes: 1 }]);
  });

  it("registro vazio não inventa número nenhum", () => {
    const r = resumirSessao([]);
    expect(r).toEqual({
      rolagens: 0,
      criticos: 0,
      falhasCriticas: 0,
      danoPorPersonagem: [],
      usoPorRotulo: [],
      rolagensPorAtor: [],
    });
  });
});
