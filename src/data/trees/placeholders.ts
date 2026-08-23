import { Tree } from "@/lib/types";

/**
 * Árvores ainda sem conteúdo escrito (magias/técnicas/talentos). Aparecem
 * travadas como "Em Breve" no navegador — mesmo texto que já está no sumário
 * do livro. `ranks: []` é o sinal que a UI usa pra saber que está vazia.
 */
function placeholder(
  id: string,
  name: string,
  category: Tree["category"],
  subgroup: string,
  hpDieMax: number,
  rankLabels?: Tree["rankLabels"]
): Tree {
  return { id, name, category, subgroup, hpDieMax, rankLabels, ranks: [] };
}

export const PLACEHOLDER_TREES: Tree[] = [
  // Magia Ofensiva
  placeholder("fogo", "Magia de Fogo", "magia", "Magia Ofensiva", 4),
  placeholder("vento", "Magia de Vento", "magia", "Magia Ofensiva", 4),
  placeholder("terra", "Magia de Terra", "magia", "Magia Ofensiva", 4),

  // Cura e Suporte
  placeholder("cura", "Magia de Cura", "magia", "Cura e Suporte", 4),
  placeholder("barreira", "Barreira e Proteção", "magia", "Cura e Suporte", 4),

  // Invocação
  placeholder("invocacao", "Espíritos e Feras", "magia", "Invocação", 4),

  // Espadachim (Estilos Divinos, sem PM)
  placeholder("deus-da-espada", "Deus da Espada", "corpo", "Espadachim", 10),
  placeholder("deus-da-agua-corpo", "Deus da Água", "corpo", "Espadachim", 10),
  placeholder("deus-do-norte", "Deus do Norte", "corpo", "Espadachim", 10),

  // Guerreiro / Parrudice
  placeholder("armas-pesadas", "Armas Pesadas", "corpo", "Guerreiro / Parrudice", 10, {
    Principiante: "Briguento",
    Intermediário: "Combatente",
    Avançado: "Veterano",
    Santo: "Campeão",
    Rei: "Mestre de Guerra",
    Imperador: "Lenda Viva",
  }),

  // Tank / Defensor
  placeholder("cavalaria-e-escudos", "Cavalaria e Escudos", "corpo", "Tank / Defensor", 10, {
    Principiante: "Escudeiro",
    Intermediário: "Guarda",
    Avançado: "Protetor",
    Santo: "Guardião",
    Rei: "Muralha",
    Imperador: "Bastião",
  }),

  // Arqueiro
  placeholder("arquearia", "Arquearia", "corpo", "Arqueiro", 8, {
    Principiante: "Atirador",
    Intermediário: "Caçador",
    Avançado: "Franco-Atirador",
    Santo: "Olho de Águia",
    Rei: "Predador",
    Imperador: "Lenda da Flecha",
  }),

  // Batedor e Ladrão
  placeholder("furtividade-e-armadilhas", "Furtividade e Armadilhas", "utilidade", "Batedor e Ladrão", 6, {
    Principiante: "Gatuno",
    Intermediário: "Sombra",
    Avançado: "Especialista",
    Santo: "Mestre Espião",
    Rei: "Fantasma",
    Imperador: "Lenda Oculta",
  }),

  // Bardo
  placeholder("bardo-e-interacao", "Bardo e Interação", "utilidade", "Bardo", 6, {
    Principiante: "Aprendiz",
    Intermediário: "Artista",
    Avançado: "Trovador",
    Santo: "Virtuoso",
    Rei: "Maestro",
    Imperador: "Voz do Mundo",
  }),

  // Sobrevivência e Táticas
  placeholder("navegacao-e-lideranca", "Navegação e Liderança", "utilidade", "Sobrevivência e Táticas", 6, {
    Principiante: "Explorador",
    Intermediário: "Rastreador",
    Avançado: "Guia",
    Santo: "Estrategista",
    Rei: "Comandante",
    Imperador: "Senhor da Guerra",
  }),
];
