/**
 * Cap. 1, §4: sugestões de Proficiências e Línguas. **1 PA compra três**, e
 * qualquer personagem de qualquer árvore pode comprar, a qualquer momento.
 *
 * Por que são mais baratas que Perícia (1 PA = 2): uma Perícia cobre um campo
 * inteiro de ação e concede Vantagem quando se encaixa. Uma proficiência cobre
 * UMA ferramenta, UM instrumento ou UM idioma, e não concede Vantagem — ela
 * remove a penalidade de não saber usar, ou destrava entender o que está sendo
 * dito. Três dessas valem o mesmo que duas daquelas.
 *
 * A lista é ABERTA: serve de sugestão no campo da ficha, não de trava. O Mestre
 * aprova qualquer proficiência que caiba no mundo, e o campo aceita texto livre.
 *
 * Revisão do livro (Cap. 1, §4): todo personagem já nasce falando a Língua
 * Humana (Comum) e a língua do seu povo, escritas nos traços da raça — essas
 * não se compram. Sem proficiência numa ferramenta, instrumento ou veículo, o
 * teste sai com Desvantagem; sem a ferramenta na mão, só com permissão do
 * Mestre e CD +5. Ofícios (perícia) é o saber e dá Vantagem; a ferramenta é a
 * mão e tira a Desvantagem.
 */
export interface ProficiencySuggestion {
  name: string;
  kind: "Língua" | "Ferramenta" | "Instrumento" | "Veículo" | "Jogo";
}

export const PROFICIENCY_SUGGESTIONS: ProficiencySuggestion[] = [
  // --- Línguas do Mundo de Seis Faces
  { name: "Língua Humana (Comum)", kind: "Língua" },
  { name: "Língua Élfica", kind: "Língua" },
  { name: "Língua Anã", kind: "Língua" },
  { name: "Língua Bestial", kind: "Língua" },
  { name: "Língua Demoníaca", kind: "Língua" },
  { name: "Língua Divina", kind: "Língua" },
  { name: "Língua Dragônica", kind: "Língua" },
  { name: "Língua do Oceano", kind: "Língua" },
  { name: "Língua Migurd (telepática)", kind: "Língua" },
  { name: "Escrita Antiga", kind: "Língua" },
  { name: "Gíria de Ladrão", kind: "Língua" },

  // --- Ferramentas
  { name: "Ferramentas de Ladrão", kind: "Ferramenta" },
  { name: "Kit de Falsificação", kind: "Ferramenta" },
  { name: "Kit de Disfarce", kind: "Ferramenta" },
  { name: "Kit de Herborista", kind: "Ferramenta" },
  { name: "Kit de Alquimista", kind: "Ferramenta" },
  { name: "Ferramentas de Ferreiro", kind: "Ferramenta" },
  { name: "Ferramentas de Carpinteiro", kind: "Ferramenta" },
  { name: "Ferramentas de Curtidor", kind: "Ferramenta" },
  { name: "Ferramentas de Joalheiro", kind: "Ferramenta" },
  { name: "Instrumentos de Navegação", kind: "Ferramenta" },
  { name: "Kit de Cartografia", kind: "Ferramenta" },
  { name: "Utensílios de Cozinha", kind: "Ferramenta" },

  // --- Instrumentos musicais
  { name: "Alaúde", kind: "Instrumento" },
  { name: "Flauta", kind: "Instrumento" },
  { name: "Tambor", kind: "Instrumento" },
  { name: "Lira", kind: "Instrumento" },
  { name: "Chifre de Guerra", kind: "Instrumento" },

  // --- Veículos e jogos
  { name: "Montaria", kind: "Veículo" },
  { name: "Carroça e Carruagem", kind: "Veículo" },
  { name: "Embarcação", kind: "Veículo" },
  { name: "Jogos de Tabuleiro", kind: "Jogo" },
  { name: "Jogos de Azar", kind: "Jogo" },
];
