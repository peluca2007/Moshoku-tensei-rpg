export interface IdentidadeVisualDaArvore {
  corNoite: string;
  corDia: string;
  kanji: string;
  selo: string;
}

function identidade(corNoite: string, kanji: string, selo: string): IdentidadeVisualDaArvore {
  return {
    corNoite,
    corDia: `color-mix(in oklab, ${corNoite} 56%, #000)`,
    kanji,
    selo,
  };
}

/**
 * A identidade que o livro já usa nas páginas de cada árvore.
 *
 * Mantê-la aqui não muda o livro: esta tabela só permite que a ficha vista a
 * mesma cor e o mesmo selo sem tentar ler CSS em tempo de execução.
 */
export const IDENTIDADE_DAS_ARVORES: Record<string, IdentidadeVisualDaArvore> = {
  fogo: identidade("#ff6f4a", "火魔術", "火"),
  agua: identidade("#5a9bff", "水魔術", "水"),
  vento: identidade("#8be28f", "風魔術", "風"),
  terra: identidade("#c89a6a", "土魔術", "土"),
  cura: identidade("#d4e157", "治癒魔術", "癒"),
  desintoxicacao: identidade("#c07dff", "解毒魔術", "解"),
  teorica: identidade("#78d5d0", "理論魔術", "式"),
  invocacao: identidade("#ff7ec4", "召喚魔術", "召"),
  "deus-da-espada": identidade("#ff4d6a", "剣神流", "剣"),
  "deus-da-agua-corpo": identidade("#4fc4ff", "水神流", "流"),
  "deus-do-norte": identidade("#a9bcd6", "北神流", "北"),
  "armas-pesadas": identidade("#e0a86a", "闘士", "闘"),
  "cavalaria-e-escudos": identidade("#7d8cff", "騎士道", "盾"),
  vendaval: identidade("#33d6b0", "疾風流", "嵐"),
  "punho-de-fogo": identidade("#ff9a3d", "炎拳", "拳"),
  arquearia: identidade("#a8c46a", "弓術", "弓"),
  "furtividade-e-armadilhas": identidade("#9d8df1", "隠密", "影"),
  "bardo-e-interacao": identidade("#ffab91", "吟遊詩人", "詩"),
  "navegacao-e-lideranca": identidade("#e3c88f", "統率", "導"),
};

export function identidadeVisualDaArvore(treeId: string): IdentidadeVisualDaArvore | undefined {
  return IDENTIDADE_DAS_ARVORES[treeId];
}
