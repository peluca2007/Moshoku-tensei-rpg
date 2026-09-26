import {
  criarFormula,
  ESSENCIAS,
  FORMAS,
  LIMITES_TEORICOS,
  MEIOS,
  OPERADORES,
  RANKS_TEORICOS,
  type EssenciaId,
  type FormulaEscolha,
} from "@/lib/magiaTeorica";
import { BookTable } from "./BookUI";

/**
 * AS TABELAS DA MAGIA TEÓRICA, GERADAS DO MOTOR (2026-09-26).
 *
 * Decisão do autor a partir da revisão de design: o livro imprime as MESMAS
 * constantes que a Oficina e as cartas usam (src/lib/magiaTeorica.ts). Antes o
 * livro trazia três números e o resto morava no motor e numa proposta fora do
 * livro — a mesa não conseguia jogar a árvore sem o site. Mudou uma constante,
 * o livro, a Oficina e as cartas mudam juntos.
 */

const RANK_DA_FORMA: Record<keyof typeof FORMAS, string> = {
  circulo: "Principiante",
  quadrado: "Principiante",
  linha: "Principiante",
  triangulo: "Intermediário",
  estrela: "Avançado",
  espiral: "Santo",
};

const COMO_SE_APRENDE: Record<keyof typeof OPERADORES, string> = {
  projetar: "Maestria Principiante",
  expressar: "Maestria Principiante",
  conter: "Maestria Principiante",
  rejeitar: "Talento, 1 PA (Principiante)",
  expandir: "Maestria Intermediária",
  repetir: "Talento, 1 PA (Intermediário)",
};

const RANK_DO_MEIO: Record<keyof typeof MEIOS, string> = {
  gesto: "Principiante",
  ar: "Principiante",
  giz: "Principiante",
  pergaminho: "Principiante",
  pedra: "Santo",
};

const base: FormulaEscolha = {
  rank: "Principiante",
  potencia: "Principiante",
  essencia: "mana",
  operadores: ["projetar"],
  forma: "circulo",
  meio: "ar",
  gatilho: false,
  condicao: "entrada",
};

/** As peças: essências, ações e formas, com custo, efeito e onde se aprende. */
export function TabelasDasPecas() {
  return (
    <>
      <BookTable
        headers={["Essência (núcleo)", "Tipo de dano", "Como se aprende"]}
        rows={Object.values(ESSENCIAS).map((e) => [`${e.nome} · ${e.custo} PM`, e.tipo, e.origem])}
      />
      <BookTable
        headers={["Ação (operador)", "O que faz", "Como se aprende"]}
        rows={(Object.keys(OPERADORES) as (keyof typeof OPERADORES)[]).map((id) => [
          `${OPERADORES[id].nome} · ${OPERADORES[id].custo} PM`,
          OPERADORES[id].papel,
          COMO_SE_APRENDE[id],
        ])}
      />
      <BookTable
        headers={["Forma (contorno)", "Efeito", "A partir de"]}
        rows={(Object.keys(FORMAS) as (keyof typeof FORMAS)[]).map((id) => [
          `${FORMAS[id].nome} · ${FORMAS[id].custo} PM`,
          FORMAS[id].efeito,
          RANK_DA_FORMA[id],
        ])}
      />
    </>
  );
}

/** Os meios: onde a fórmula é desenhada, quanto leva e quanto dura. */
export function TabelaDosMeios() {
  return (
    <BookTable
      headers={["Meio", "Preparo · símbolos", "Dura no máximo"]}
      rows={(Object.keys(MEIOS) as (keyof typeof MEIOS)[]).map((id) => [
        `${MEIOS[id].nome}${RANK_DO_MEIO[id] !== "Principiante" ? ` (${RANK_DO_MEIO[id]})` : ""}`,
        `${MEIOS[id].preparo} · até ${MEIOS[id].maxSimbolos}`,
        MEIOS[id].duracaoMaxima,
      ])}
    />
  );
}

/** A potência: o que cada patamar entrega e quanto a mais custa. */
export function TabelaDaPotencia() {
  return (
    <BookTable
      headers={["Rank / potência", "+ PM", "Dados", "PV da estrutura", "Alcance", "Área", "Símbolos / PM por célula"]}
      rows={RANKS_TEORICOS.map((rank) => {
        const l = LIMITES_TEORICOS[rank];
        return [rank, `+${l.potencia}`, `${l.dados}d8`, String(l.pv), `${l.alcance} m`, `${l.area} m`, `${l.simbolos} / ${l.pm}`];
      })}
    />
  );
}

/** O que cada essência acrescenta a uma fronteira de Conter (os dados sobem com a potência). */
export function TabelaDosContatos() {
  return (
    <BookTable
      headers={["Essência na fronteira", "Efeito ao contato (potência Principiante)"]}
      rows={(Object.keys(ESSENCIAS) as EssenciaId[])
        .filter((e) => e !== "mana")
        .map((e) => [
          ESSENCIAS[e].nome,
          criarFormula({ ...base, essencia: e, operadores: ["conter"] }).efeitoDaEssencia ?? "—",
        ])}
    />
  );
}

/** As primeiras frases, com os números calculados pelo motor. */
export function TabelaDasPrimeirasFrases() {
  const frases: [string, Partial<FormulaEscolha>][] = [
    ["Mana + Projetar + Círculo", {}],
    ["Mana + Projetar + Linha", { forma: "linha" }],
    ["Mana + Expressar + Círculo", { operadores: ["expressar"] }],
    ["Mana + Conter + Quadrado", { operadores: ["conter"], forma: "quadrado" }],
    ["Mana + Conter + Círculo", { operadores: ["conter"] }],
  ];
  return (
    <BookTable
      headers={["Frase (Principiante, no ar)", "PM", "Resultado"]}
      rows={frases.map(([nome, e]) => {
        const r = criarFormula({ ...base, ...e });
        return [nome, String(r.pm), `${r.resumo} ${r.duracao === "instantânea" ? "Instantânea." : `Dura ${r.duracao}.`}`];
      })}
    />
  );
}
