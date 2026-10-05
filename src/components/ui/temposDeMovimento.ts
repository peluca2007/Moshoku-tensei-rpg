import type { CSSProperties } from "react";

/** Ritmo da interface; ciclos narrativos do livro têm sua própria duração. */
export const MOVIMENTO = { resposta: 160, entrada: 280, celebracao: 480, curva: "cubic-bezier(.2,.7,.2,1)" } as const;
export const VARIAVEIS_MOVIMENTO = {
  "--mov-resposta": `${MOVIMENTO.resposta}ms`,
  "--mov-entrada": `${MOVIMENTO.entrada}ms`,
  "--mov-celebracao": `${MOVIMENTO.celebracao}ms`,
  "--mov-curva": MOVIMENTO.curva,
} as CSSProperties;
