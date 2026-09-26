"use client";

import dynamic from "next/dynamic";

/**
 * O que toda página tem, mas nenhuma precisa pra aparecer — 0.1.99.
 *
 * O rolador de dados e a hidratação das fichas salvas importam o store do
 * personagem, e o store importa as dezenove árvores (~380 KB de dados). Montados
 * direto no layout, eles punham as árvores no pacote de TODA página: a capa e
 * o livro esperavam baixar e ler as árvores antes de responder ao toque.
 *
 * Carregados aqui, com `ssr: false`, eles viram um pedaço à parte que chega
 * depois de a página já estar de pé. Nas páginas que usam o personagem (ficha,
 * árvores, criar…) o store já veio com a própria página, e o pedaço extra é
 * pequeno.
 */
const StoreHydration = dynamic(() => import("./StoreHydration"), { ssr: false });
const DiceRoller = dynamic(() => import("./DiceRoller"), { ssr: false });

export function HidratacaoTardia() {
  return <StoreHydration />;
}

export function RoladorTardio() {
  return <DiceRoller />;
}
