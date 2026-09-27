import {
  criarFormula,
  ESSENCIAS,
  FORMAS,
  MEIOS,
  POTENCIA,
  RANKS_TEORICOS,
  VERBOS,
  type EssenciaId,
  type FormaId,
  type FormulaEscolha,
  type VerboId,
} from "@/lib/magiaTeorica";
import { MAGIC_ACTIONS } from "@/data/trees/shared";
import { BookTable } from "./BookUI";

/**
 * AS TABELAS DA MAGIA TEÓRICA, GERADAS DO MOTOR (2026-09-26).
 *
 * O livro imprime as MESMAS constantes que o Laboratório e as cartas usam
 * (src/lib/magiaTeorica.ts). Mudou uma constante, o livro, o Laboratório e as
 * cartas mudam juntos. Desde "três palavras e uma conta" são três tabelas: as
 * palavras, a potência e onde se desenha.
 */

const base: FormulaEscolha = {
  rank: "Principiante",
  essencia: "mana",
  verbos: ["lancar"],
  forma: "circulo",
  meio: "ar",
  armada: false,
  gatilho: "entrada",
};

/** Os verbos e as formas — o que cada palavra faz e desde quando. */
export function TabelaDasPalavras() {
  return (
    <>
      <BookTable
        headers={["Verbo", "O que acontece"]}
        rows={(Object.keys(VERBOS) as VerboId[]).map((id) => [VERBOS[id].nome, VERBOS[id].papel])}
      />
      <BookTable
        headers={["Forma", "Desde", "O que muda"]}
        rows={(Object.keys(FORMAS) as FormaId[]).map((id) => [
          `${FORMAS[id].nome}${id === "circulo" ? " · 0" : " · +1"}`,
          FORMAS[id].desde,
          FORMAS[id].efeito,
        ])}
      />
    </>
  );
}

/** As essências: de onde vêm, o tipo do dano e o que fazem na parede. */
export function TabelaDasEssencias() {
  return (
    <BookTable
      headers={["Essência", "Lançar fere com", "Na parede de Erguer, quem encosta…"]}
      rows={(Object.keys(ESSENCIAS) as EssenciaId[]).map((e) => [
        `${ESSENCIAS[e].nome}${e === "mana" ? " · 0" : " · +1"}`,
        e === "vida" ? "cura, sem BC" : ESSENCIAS[e].tipo,
        e === "mana" ? "—" : (criarFormula({ ...base, essencia: e, verbos: ["erguer"] }).efeitoDaEssencia ?? "—"),
      ])}
    />
  );
}

/** A potência: a tabela de uma linha (por rank). O PM é também o número de d8. */
export function TabelaDaPotencia() {
  return (
    <BookTable
      headers={["Potência", "PM = dados", "Parede", "Alcance", "Tamanho", "Ações no ar"]}
      rows={RANKS_TEORICOS.map((rank) => {
        const p = POTENCIA[rank];
        return [rank, `${p.pm} · ${p.dados}d8`, `${p.pv} PV`, `${p.alcance} m`, `${p.tamanho} m`, String(MAGIC_ACTIONS[rank].normal)];
      })}
    />
  );
}

/** Onde se desenha: no ar, em giz ou em pedra. */
export function TabelaDosMeios() {
  return (
    <BookTable
      headers={["Onde", "Desde", "Preparo", "Ativar", "Dura"]}
      rows={(Object.keys(MEIOS) as (keyof typeof MEIOS)[]).map((id) => [
        MEIOS[id].nome,
        MEIOS[id].desde,
        MEIOS[id].preparo,
        MEIOS[id].ativacao,
        MEIOS[id].duracao,
      ])}
    />
  );
}

/** As primeiras frases, com os números calculados pelo motor. */
export function TabelaDasPrimeirasFrases() {
  const frases: Partial<FormulaEscolha>[] = [
    {},
    { forma: "linha" },
    { verbos: ["sinalizar"] },
    { verbos: ["erguer"], forma: "quadrado" },
    { verbos: ["selar"] },
  ];
  return (
    <BookTable
      headers={["Frase (Principiante)", "PM", "O que acontece"]}
      rows={frases.map((e) => {
        const f = { ...base, ...e };
        const r = criarFormula(f);
        return [r.leitura, String(r.pm), r.resumo];
      })}
    />
  );
}
