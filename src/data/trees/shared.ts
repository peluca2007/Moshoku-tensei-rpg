import { AbilityDef, RankName } from "@/lib/types";

/**
 * Cap. 2, seção 3: tempo de conjuração por rank, igual pra toda escola de
 * Magia. Imperador não tem versão Encurtada ("Impossível" no livro).
 *
 * ISTO É O PADRÃO SUGERIDO, NÃO A LEI (2026-09-02). Uma magia pode declarar a
 * própria `actions` e ignorar esta tabela — `invocacao.ts` sempre fez isso, e
 * agora ~25% do livro também faz. Um ritual Principiante que leva três turnos e
 * uma magia Imperador que sai em duas Ações (pagando o dobro de PM) são as duas
 * pontas legítimas do sistema: o rank mede o quanto a magia PODE fazer, não o
 * quanto ela demora. Toda divergência carrega um `costNote` explicando a troca.
 */
export const MAGIC_ACTIONS: Record<RankName, AbilityDef["actions"]> = {
  Principiante: { normal: 2, encurtada: 1, silenciosa: 1 },
  Intermediário: { normal: 2, encurtada: 1, silenciosa: 1 },
  Avançado: { normal: 3, encurtada: 2, silenciosa: 1 },
  Santo: { normal: 4, encurtada: 3, silenciosa: 2 },
  Rei: { normal: 5, encurtada: 4, silenciosa: 3 },
  Imperador: { normal: 6, silenciosa: 4 },
  Deus: { normal: 6, silenciosa: 4 },
};

/**
 * Cap. 1, seção 3: custo de PA por rank pra Magia Comum / Magia Assinatura ◆ /
 * Talento (mesma tabela pra Técnicas Formais).
 *
 * Também é PADRÃO SUGERIDO, não lei (2026-09-02). O PA mede o que a magia vale
 * na mão do jogador — utilidade, letalidade, flexibilidade —, não o patamar em
 * que ela aparece. Tempestade (Avançado) desliga a escola de Fogo inteira num
 * raio de 1 km e custa 4 PA, mais que a maioria das magias Santo; Clarão
 * (Principiante) é situacional demais pra cobrar o mesmo que uma magia de dano
 * do mesmo rank. Quem diverge desta tabela declara `costNote`.
 */
export const RANK_PA_COST = {
  common: { Principiante: 1, Intermediário: 1, Avançado: 2, Santo: 3, Rei: 4, Imperador: 5, Deus: 6 } as Record<RankName, number>,
  signature: { Principiante: 2, Intermediário: 2, Avançado: 3, Santo: 4, Rei: 5, Imperador: 6, Deus: 7 } as Record<RankName, number>,
  // Rei subiu de 3 pra 4 em 2026-08-28 (auditoria): era o único ponto
  // não-monotônico das três colunas — Santo e Rei custavam o mesmo, então o
  // patamar 5 saía de graça em relação ao 4. Agora acompanha a coluna comum.
  talent: { Principiante: 1, Intermediário: 1, Avançado: 2, Santo: 3, Rei: 4, Imperador: 4, Deus: 4 } as Record<RankName, number>,
};

/** Cap. 3, "Nota de Custo": tabela mais barata usada pelas três árvores de Utilidade. */
export const UTILITY_PA_COST = {
  talent: { Principiante: 1, Intermediário: 1, Avançado: 2, Santo: 2, Rei: 3, Imperador: 3, Deus: 3 } as Record<RankName, number>,
  signature: { Principiante: 2, Intermediário: 2, Avançado: 3, Santo: 3, Rei: 4, Imperador: 4, Deus: 4 } as Record<RankName, number>,
};

/**
 * Cap. 2, "A Escola Barata": tabela exclusiva da Magia de Desintoxicação
 * (2026-09-03).
 *
 * A Desintoxicação é a única escola do livro cujo trabalho principal acontece
 * FORA do combate e cujo alvo é sempre um problema que o Mestre criou — ninguém
 * compra Purgar esperando ganhar uma luta, compra pra que a campanha não pare
 * quando alguém pisa no pântano errado. Cobrar dela a mesma tabela de uma escola
 * de dano fazia o jogador pagar preço de Fogo por um seguro contra o roteiro.
 *
 * O rework de 2026-09-03 tirou poder da árvore (dano, imunidades gerais e
 * remoção universal de condição) e devolveu o valor em PREÇO: aqui o Imperador
 * custa 3 PA onde a tabela comum cobra 5, e o Santo custa 2 onde ela cobra 3.
 * A escola virou o investimento mais barato do livro — que é o único jeito
 * honesto de vender uma árvore que não te faz vencer, só te impede de perder.
 */
export const DESINTOX_PA_COST = {
  common: { Principiante: 1, Intermediário: 1, Avançado: 1, Santo: 2, Rei: 2, Imperador: 3, Deus: 4 } as Record<RankName, number>,
  signature: { Principiante: 1, Intermediário: 1, Avançado: 2, Santo: 2, Rei: 3, Imperador: 4, Deus: 5 } as Record<RankName, number>,
  talent: { Principiante: 1, Intermediário: 1, Avançado: 1, Santo: 2, Rei: 2, Imperador: 3, Deus: 3 } as Record<RankName, number>,
};
