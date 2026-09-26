"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * A SEÇÃO DO SITE, como o capítulo do livro (branch de comparação, 2026-09-26).
 *
 * No livro folheado cada capítulo tem a sua cor. Aqui cada parte do site
 * ganha a cor de um capítulo, marcada em `<html data-secao>`; o globals.css
 * troca a paleta inteira por ela ("O SITE NO ESTILO DO LIVRO").
 */
const SECOES: [prefixo: string, secao: string][] = [
  ["/ficha", "ficha"],
  ["/criar", "ficha"],
  ["/arvores", "arvores"],
  ["/personagens", "personagens"],
  ["/comparar", "personagens"],
  ["/sessao", "mestre"],
  ["/mestre", "mestre"],
  ["/encontros", "mestre"],
  ["/iniciativa", "mestre"],
  ["/loja", "loja"],
  ["/livro", "livro"],
];

export default function SecaoDoSite() {
  const caminho = usePathname();
  useEffect(() => {
    const secao = SECOES.find(([p]) => caminho === p || caminho.startsWith(`${p}/`))?.[1] ?? "inicio";
    document.documentElement.dataset.secao = secao;
  }, [caminho]);
  return null;
}
