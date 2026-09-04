"use client";

import { useSyncExternalStore } from "react";
import { ALargeSmall } from "lucide-react";

/**
 * O tamanho da letra do site inteiro, em três degraus.
 *
 * ## Por que existe, já que o navegador tem essa opção
 *
 * Tem, e ela é a certa — mas ela só funciona sobre medidas em `rem`, e o site
 * tinha 68 legendas escritas em pixel cravado. Isso foi corrigido junto com
 * este componente (`--text-2xs`/`--text-3xs` no `globals.css`), então aumentar
 * a fonte no navegador passou a aumentar TUDO.
 *
 * O botão existe porque a mesa é presencial: alguém passa o celular pro
 * vizinho ler a ficha, e ninguém vai abrir as configurações do Chrome no meio
 * de um combate. É o mesmo argumento do botão de tema, que também duplica uma
 * preferência que o sistema operacional já tem.
 *
 * ## O degrau é multiplicador, não pixel
 *
 * `fontSize` da `<html>` é escrito em porcentagem, e não em px, justamente pra
 * NÃO atropelar quem já aumentou a letra no navegador: 112,5% de uma raiz de
 * 20px continua sendo maior que 112,5% de uma raiz de 16px. Cravar `18px` aqui
 * DIMINUIRIA a fonte de quem mais precisa dela.
 */
const DEGRAUS = [
  { id: "padrao", rotulo: "Padrão", escala: "100%" },
  { id: "grande", rotulo: "Grande", escala: "112.5%" },
  { id: "maior", rotulo: "Maior", escala: "125%" },
] as const;

type DegrauId = (typeof DEGRAUS)[number]["id"];

const CHAVE_TAMANHO = "mushoku-tensei-fonte";

/**
 * O script que aplica a escolha ANTES da primeira pintura.
 *
 * Sem ele a página nasce no tamanho padrão e salta pro tamanho escolhido no
 * primeiro efeito — o mesmo flash que o `next-themes` evita com a mesma
 * técnica. Vai como string porque precisa ser síncrono no `<head>`, antes de
 * qualquer React.
 */
export const SCRIPT_TAMANHO_INICIAL = `(function(){try{var e=localStorage.getItem(${JSON.stringify(
  CHAVE_TAMANHO
)});var m={padrao:"100%",grande:"112.5%",maior:"125%"};if(e&&m[e])document.documentElement.style.fontSize=m[e];}catch(_){}})();`;

/**
 * Uma lojinha externa em vez de `useState` + `useEffect`.
 *
 * A escolha vive no `localStorage`, que é um sistema externo ao React: lê-la
 * num efeito e jogá-la num estado faz o componente renderizar duas vezes toda
 * montagem (e o lint do projeto reprova, com razão). `useSyncExternalStore`
 * lê direto da fonte e ainda resolve a hidratação de graça — o servidor não
 * tem `localStorage`, então ele responde "padrão" e o cliente corrige.
 */
const ouvintes = new Set<() => void>();

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

function lerEscolha(): DegrauId {
  try {
    const salvo = localStorage.getItem(CHAVE_TAMANHO) as DegrauId | null;
    if (salvo && DEGRAUS.some((d) => d.id === salvo)) return salvo;
  } catch {
    /* navegador sem armazenamento */
  }
  return "padrao";
}

function gravarEscolha(id: DegrauId) {
  const degrau = DEGRAUS.find((d) => d.id === id) ?? DEGRAUS[0];
  document.documentElement.style.fontSize = degrau.escala;
  try {
    localStorage.setItem(CHAVE_TAMANHO, id);
  } catch {
    /* sem armazenamento: a escolha vale só nesta sessão */
  }
  for (const ouvinte of ouvintes) ouvinte();
}

export default function FontSizeToggle() {
  const atual = useSyncExternalStore(assinar, lerEscolha, () => "padrao" as DegrauId);

  const indice = DEGRAUS.findIndex((d) => d.id === atual);
  const proximo = DEGRAUS[(indice + 1) % DEGRAUS.length];

  return (
    <button
      type="button"
      onClick={() => gravarEscolha(proximo.id)}
      title={`Tamanho da letra: ${DEGRAUS[indice].rotulo}. Clique para ${proximo.rotulo}.`}
      aria-label={`Tamanho da letra: ${DEGRAUS[indice].rotulo}. Mudar para ${proximo.rotulo}.`}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-parchment-600 transition-colors hover:bg-wine-600/10 hover:text-wine-600 dark:text-parchment-400 dark:hover:bg-wine-400/10 dark:hover:text-wine-400"
    >
      <ALargeSmall className="h-4 w-4" aria-hidden />
      {/* O degrau atual também sai em texto, pra quem navega por leitor de tela
          saber em que ponto está sem depender do ícone. */}
      <span className="sr-only">{DEGRAUS[indice].rotulo}</span>
    </button>
  );
}
