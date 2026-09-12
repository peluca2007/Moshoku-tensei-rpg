import type { TocEntry } from "@/components/book/BookToc";

/**
 * O SUMÁRIO DO LIVRO — a lista de tudo que o `/livro` tem, por seção.
 *
 * ## Por que ele saiu da página
 *
 * Ele nasceu dentro de `src/app/livro/page.tsx`, e ali era só o sumário
 * lateral. Virou dado compartilhado em 0.1.60 porque a BUSCA passou a
 * precisar dele, e por um buraco concreto: quem procurava "Dojo" recebia
 * *"Nada no livro fala em Dojo"* — e o Dojo é a §5 do Cap. 5.
 *
 * O índice da busca cobria habilidade, talento, maestria, magia combinada,
 * árvore, item, raça, antecedente, perícia e criatura. Ou seja: tudo que é uma
 * FICHA de alguma coisa. As regras que não são ficha de nada — o Dado de Arma,
 * o Touki, a Preparação em Etapas, os Grupos de Arma, os Dojos, o Fio da Vida —
 * eram invisíveis, e são metade do livro.
 *
 * ## O que ele garante
 *
 * Duas coisas ao mesmo tempo, e é por isso que a fonte única importa: o sumário
 * lateral do `/livro` e a busca descrevem sempre o mesmo livro. O
 * `npm run check:sumario` já cobra que esta lista cite toda seção existente e só
 * as que existem; indexá-la aqui faz essa garantia valer pra busca de graça.
 */
export const SUMARIO_DO_LIVRO: TocEntry[] = [
  {
    id: "cap0",
    label: "Comece Aqui",
    children: [
      { id: "cap0-1", label: "1. O que é este jogo" },
      { id: "cap0-2", label: "2. A ficha em seis números" },
      { id: "cap0-3", label: "3. Um turno de combate" },
      { id: "cap0-exemplo", label: "— Uma rodada jogada" },
      { id: "cap0-4", label: "4. Criando um personagem" },
      { id: "cap0-5", label: "5. Onde está cada coisa" },
    ],
  },
  {
    id: "cap1",
    label: "Cap. 1 — O Núcleo do Sistema",
    children: [
      { id: "cap1-1", label: "1. Criação e Atributos" },
      { id: "cap1-2", label: "2. Pontos de Aprimoramento" },
      { id: "cap1-3", label: "3. Desbloqueio de Ranks" },
      { id: "cap1-4", label: "4. Testes e Perícias" },
      { id: "cap1-4-proficiencias", label: "— Proficiências e Grupos de Arma" },
      { id: "cap1-4-kit", label: "— Equipamento Inicial" },
      { id: "cap1-5", label: "5. Raças" },
      { id: "cap1-6", label: "6. Destino e Infância" },
      { id: "cap1-7", label: "7. Valor do Rank e BC" },
      { id: "cap1-8", label: "8. Multiclasse" },
    ],
  },
  {
    id: "cap2",
    label: "Cap. 2 — As Leis da Magia",
    children: [
      { id: "cap2-1", label: "1. Categorias da Magia" },
      { id: "cap2-2", label: "2. Encantamentos" },
      { id: "cap2-2-recitacao", label: "— Recitação Perfeita" },
      { id: "cap2-2-cantico-curto", label: "— Cântico Curto (sem bônus)" },
      { id: "cap2-3", label: "3. Tempo de Conjuração" },
      { id: "cap2-4", label: "4. Combinações entre Árvores" },
      { id: "cap2-5", label: "5. Maestrias" },
      { id: "cap2-6", label: "6. Interromper uma Conjuração" },
      { id: "cap2-7", label: "7. Regras Gerais de Conjuração" },
    ],
  },
  {
    id: "cap3",
    label: "Cap. 3 — Árvores de Progressão",
    children: [
      { id: "cap3-como-ler", label: "Como Ler uma Árvore" },
      { id: "cap3-mecanicas", label: "— As 19 Mecânicas" },
      { id: "cap3-mapa", label: "O Mapa Completo" },
      { id: "cap3-magia", label: "Árvore da Magia" },
      { id: "cap3-corpo", label: "Árvore do Corpo" },
      { id: "cap3-dado-arma", label: "— 1. O Dado de Arma" },
      { id: "cap3-touki", label: "— 2. Touki" },
      { id: "cap3-preparacao", label: "— 3. O Tiro Perfeito" },
      { id: "cap3-triangulo", label: "— 4. Triângulo dos Estilos" },
      { id: "cap3-utilidade", label: "Árvore de Utilidade" },
      { id: "cap3-todas", label: "Todas as Sub-árvores" },
    ],
  },
  {
    id: "cap4",
    label: "Cap. 4 — Combate e Sobrevivência",
    children: [
      { id: "cap4-1", label: "1. Cálculos Vitais" },
      { id: "cap4-condicoes", label: "2. Glossário de Condições" },
      { id: "cap4-3-acoes", label: "3. Economia de Ações" },
      { id: "cap4-duas-armas", label: "— Duas armas, uma em cada mão" },
      { id: "cap4-reacoes-combate", label: "4. Reações e Ações Defensivas" },
      { id: "cap4-4", label: "5. Empilhamento" },
      { id: "cap4-5", label: "6. Críticos e Touki" },
      { id: "cap4-6", label: "7. Sangrando e Morrendo" },
      { id: "cap4-aflicoes", label: "8. Aflições do Mundo de Seis Faces" },
      { id: "cap4-8", label: "9. Exaustão, Fome, Sede e Clima" },
    ],
  },
  {
    id: "cap5",
    label: "Cap. 5 — Entre Aventuras",
    children: [
      { id: "cap5-1", label: "1. Tempo Livre e Downtime" },
      { id: "cap5-2", label: "2. A Guilda de Aventureiros" },
      { id: "cap5-3", label: "3. Reputação com Facções" },
      { id: "cap5-4", label: "4. Crafting e Alquimia" },
      { id: "cap5-5", label: "5. Dojos e Mestres" },
      { id: "cap5-5-quem", label: "— Quem pode ensinar" },
      { id: "cap5-5-provacao", label: "— A provação" },
      { id: "cap5-5-dilema", label: "— O Dilema de Recompensa" },
      { id: "cap5-5-limites", label: "— Os limites" },
      { id: "cap5-5-exemplos", label: "— Quatro mestres prontos" },
    ],
  },
  {
    id: "apendices",
    label: "Apêndices",
    children: [
      { id: "apendice-a", label: "A. Ficha de Exemplo" },
      { id: "apendice-b", label: "B. Molde p/ Novas Escolas" },
      { id: "apendice-c", label: "C. Dano por Turno" },
      { id: "apendice-d", label: "D. Ambiguidades Resolvidas" },
      { id: "apendice-e", label: "E. Viagem entre Continentes" },
      { id: "apendice-f", label: "F. Cerco e Batalha em Exército" },
      { id: "apendice-g", label: "G. Bestiário" },
      { id: "apendice-g-chefe", label: "— O multiplicador do Chefe" },
    ],
  },
];
