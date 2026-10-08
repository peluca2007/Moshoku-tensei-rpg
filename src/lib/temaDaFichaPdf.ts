import { TEMA_PADRAO, TEMAS, type TemaId } from "./temas";

/** Cores do papel e da seção Ficha. Só valores locais entram no código Typst. */
export const PALETAS_DA_FICHA_PDF = {
  pergaminho: {
    papel: "FDF6E3", texto: "2B1810", caixa: "F7EEDA", principal: "4A0E2E",
    faixa: "4A0E2E", titulo: "FFFFFF", linha: "726040", secundaria: "726040",
  },
  "pergaminho-noite": {
    papel: "1A1210", texto: "EDE3D0", caixa: "2B1810", principal: "DD86A9",
    faixa: "4A0E2E", titulo: "EDE3D0", linha: "C7AE80", secundaria: "C7AE80",
  },
  "livro-dia": {
    papel: "F7F3EA", texto: "454852", caixa: "ECE6DA", principal: "21548B",
    faixa: "2F6FB3", titulo: "FFFFFF", linha: "565A66", secundaria: "565A66",
  },
  "livro-noite": {
    papel: "141418", texto: "E8E3D9", caixa: "1E1E24", principal: "5EB1FF",
    faixa: "284C6D", titulo: "E8E3D9", linha: "ACA79D", secundaria: "ACA79D",
  },
} satisfies Record<TemaId, Record<string, string>>;

/** Compatibilidade com os dois temas antigos; valor inválido usa o padrão do site. */
export function temaDaFichaPdf(tema: unknown): TemaId {
  if (tema === "dark") return "pergaminho-noite";
  if (tema === "light") return "pergaminho";
  return TEMAS.find(t => t.id === tema)?.id ?? TEMA_PADRAO;
}
