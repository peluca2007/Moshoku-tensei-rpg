import { describe, expect, it } from "vitest";
import { CONDICOES } from "@/data/condicoes";
import { TREES } from "@/data/trees";
import { condicoesCitadas, separarCondicoes } from "./condicoesNaProsa";

describe("reconhecer condição na prosa", () => {
  it("acha a condição citada pelo nome", () => {
    const p = separarCondicoes("O alvo fica Envenenado por 1 minuto.");
    expect(p.map((x) => x.texto)).toEqual(["O alvo fica ", "Envenenado", " por 1 minuto."]);
    expect("condicao" in p[1] && p[1].condicao.id).toBe("envenenado");
  });

  it("acha mais de uma na mesma frase", () => {
    expect(condicoesCitadas("Fica Preso e Caído.")).toEqual(["preso", "caido"]);
  });

  it("não repete o mesmo id", () => {
    expect(condicoesCitadas("Envenenado, e continua Envenenado.")).toEqual(["envenenado"]);
  });

  it("prefere o nome mais longo — Fluxo Interrompido não vira dois pedaços", () => {
    const p = separarCondicoes("A barreira aplica Fluxo Interrompido na área.");
    const achado = p.find((x) => "condicao" in x);
    expect(achado && "condicao" in achado && achado.condicao.id).toBe("fluxo-interrompido");
  });

  /*
   * A regra que define este reconhecedor: metade dos nomes de condição é
   * palavra comum do português, e o livro tem a convenção de capitalizar a
   * condição citada. Sem exigir a maiúscula, "a fonte do medo" e "preso ao
   * chão" virariam links — um glossário que acende em toda frase deixa de ser
   * glossário.
   */
  it("ignora a palavra comum em minúscula", () => {
    expect(condicoesCitadas("preso ao chão, marcado pela guerra, cego de raiva")).toEqual([]);
  });

  it("não casa dentro de outra palavra", () => {
    expect(condicoesCitadas("Cegonha Presunçosa Molhadura")).toEqual([]);
  });

  it("texto sem condição volta inteiro, num pedaço só", () => {
    const p = separarCondicoes("Causa 2d6 de dano.");
    expect(p).toEqual([{ texto: "Causa 2d6 de dano." }]);
  });

  it("texto vazio não quebra", () => {
    expect(separarCondicoes("")).toEqual([{ texto: "" }]);
    expect(condicoesCitadas("")).toEqual([]);
  });

  it("junta os pedaços de volta no texto original, sempre", () => {
    for (const tree of TREES) {
      for (const rank of tree.ranks) {
        for (const a of rank.abilities) {
          expect(separarCondicoes(a.effect).map((p) => p.texto).join(""), a.id).toBe(a.effect);
        }
      }
    }
  });
});

describe("o glossário e o livro", () => {
  it("nenhuma condição tem id repetido", () => {
    const ids = CONDICOES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda condição tem nome e efeito escritos", () => {
    for (const c of CONDICOES) {
      expect(c.nome.trim().length, c.id).toBeGreaterThan(0);
      expect(c.efeito.trim().length, c.id).toBeGreaterThan(20);
    }
  });

  /*
   * Verbete morto é verbete que ninguém lê: se nenhuma habilidade do livro
   * aplica a condição, ou ela foi esquecida na prosa, ou ela não deveria estar
   * no glossário. As exceções abaixo são condições que existem como REGRA de
   * capítulo (a barreira do Cap. 3, o Fluxo Interrompido) e não como efeito
   * citado por uma habilidade — elas são explicadas no próprio texto que as
   * cria.
   */
  it("toda condição do glossário é aplicada por alguma habilidade", () => {
    const citadas = new Set(
      TREES.flatMap((t) =>
        t.ranks.flatMap((r) => [
          ...r.abilities.flatMap((a) => condicoesCitadas(`${a.effect} ${a.name}`)),
          ...r.talents.flatMap((t2) => condicoesCitadas(`${t2.description} ${t2.name}`)),
          ...(r.mastery ? condicoesCitadas(r.mastery.description) : []),
        ])
      )
    );
    const orfas = CONDICOES.filter((c) => !citadas.has(c.id)).map((c) => c.id);
    expect(orfas).toEqual([]);
  });
});
