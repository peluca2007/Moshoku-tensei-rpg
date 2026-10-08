/**
 * As manobras de gasto do Touki (Cap. 3, §2 do pilar do Corpo).
 *
 * Moram aqui, e não escritas na tabela, porque duas peças do livro as mostram:
 * a tabela e o diagrama "Um turno de Touki". Uma fonte só, pra que o custo do
 * diagrama nunca discorde do da tabela.
 */
export interface ManobraDeTouki {
  pt: number;
  nome: string;
  /** O que a manobra custa em economia de ação, pra legenda do diagrama. */
  acao: string;
  efeito: string;
}

export const MANOBRAS_DE_TOUKI: ManobraDeTouki[] = [
  { pt: 1, nome: "Touki Concentrado", acao: "sem Ação", efeito: "Sem Ação, uma vez por turno. Até o fim do seu turno, some seu Bônus de Rank ao dano de todos os seus ataques." },
  { pt: 1, nome: "Touki Endurecido", acao: "Reação", efeito: "1 Reação, ao ser atingido. Reduza o dano daquele golpe no dobro do seu Bônus de Rank." },
  { pt: 1, nome: "Lâmina de Touki", acao: "sem Ação", efeito: "Sem Ação. Por 1 minuto, sua arma corpo a corpo corta pedra e aço, conta como mágica e ignora Resistência a cortante/perfurante." },
  { pt: 2, nome: "Golpe Estendido", acao: "1 Ação", efeito: "1 Ação. Clarão da lâmina que atinge um alvo a até 9m. Dano de arma normal." },
  { pt: 2, nome: "Aguentar", acao: "Reação", efeito: "1 Reação. Ao sofrer dano que te levaria a 0 PV, fica com 1 PV em vez disso. Uma vez por combate." },
  { pt: 3, nome: "Explosão de Aura", acao: "1 Ação", efeito: "1 Ação. Criaturas a 3m fazem teste de Força (CD 8 + Força + Rank) ou são arremessadas 4,5m e ficam Caídas." },
];

export function manobraDeTouki(nome: string): ManobraDeTouki {
  const m = MANOBRAS_DE_TOUKI.find((x) => x.nome === nome);
  if (!m) throw new Error(`Touki: a manobra "${nome}" não existe.`);
  return m;
}
