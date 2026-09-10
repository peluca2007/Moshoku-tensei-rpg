/**
 * Tira acento e caixa — quem busca "pericias" tem que achar "Perícias".
 *
 * Nasceu dentro do `BookToc`, que filtra o sumário do livro, e mudou pra cá em
 * 0.1.17, quando a busca global (`lib/busca.ts`) passou a precisar da mesma
 * regra. Duas cópias desta função é o jeito exato de um dia um dos dois
 * buscadores achar "Peçonha" por "peconha" e o outro não.
 *
 * Fica num módulo próprio, e não junto do índice de busca, porque o `/livro`
 * importa isto e não precisa do índice: colar as duas coisas no mesmo arquivo
 * faria o livro montar os ~750 documentos da busca só pra ter um `toLowerCase`.
 */
export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * O mesmo que `normalizar`, mas com o índice de cada caractere preservado.
 *
 * Existe pra UMA coisa: pintar de amarelo o pedaço que casou. O `normalizar`
 * comum decompõe "é" em dois caracteres antes de jogar o acento fora, então o
 * texto normalizado é MAIS CURTO que o original e a posição 12 de um não é a
 * posição 12 do outro — o realce sairia deslocado exatamente nas palavras
 * acentuadas, que em português são metade delas.
 *
 * Aqui cada caractere é normalizado sozinho e vira exatamente um caractere, o
 * que mantém as duas cadeias do mesmo tamanho, posição por posição.
 */
export function normalizarAlinhado(s: string): string {
  let saida = "";
  for (let i = 0; i < s.length; i++) {
    const n = s[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    saida += n.length === 0 ? " " : n[0];
  }
  return saida;
}
