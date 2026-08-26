import { AbilityDef, RankName } from "@/lib/types";

/**
 * Cap. 2, seção 3: tempo de conjuração por rank, igual pra toda escola de
 * Magia. Imperador não tem versão Encurtada ("Impossível" no livro).
 */
export const MAGIC_ACTIONS: Record<RankName, AbilityDef["actions"]> = {
  Principiante: { normal: 2, encurtada: 1, silenciosa: 1 },
  Intermediário: { normal: 2, encurtada: 1, silenciosa: 1 },
  Avançado: { normal: 3, encurtada: 2, silenciosa: 1 },
  Santo: { normal: 4, encurtada: 3, silenciosa: 2 },
  Rei: { normal: 5, encurtada: 4, silenciosa: 3 },
  Imperador: { normal: 6, silenciosa: 4 },
};

/** Cap. 1, seção 3: custo de PA por rank pra Magia Comum / Magia Assinatura ◆ / Talento (mesma tabela pra Técnicas Formais). */
export const RANK_PA_COST = {
  common: { Principiante: 1, Intermediário: 1, Avançado: 2, Santo: 3, Rei: 4, Imperador: 5 } as Record<RankName, number>,
  signature: { Principiante: 2, Intermediário: 2, Avançado: 3, Santo: 4, Rei: 5, Imperador: 6 } as Record<RankName, number>,
  talent: { Principiante: 1, Intermediário: 1, Avançado: 2, Santo: 3, Rei: 3, Imperador: 4 } as Record<RankName, number>,
};

/** Cap. 3, "Nota de Custo": tabela mais barata usada pelas três árvores de Utilidade. */
export const UTILITY_PA_COST = {
  talent: { Principiante: 1, Intermediário: 1, Avançado: 2, Santo: 2, Rei: 3, Imperador: 3 } as Record<RankName, number>,
  signature: { Principiante: 2, Intermediário: 2, Avançado: 3, Santo: 3, Rei: 4, Imperador: 4 } as Record<RankName, number>,
};
