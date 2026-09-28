/**
 * OS QUATRO TEMAS DO SITE (2026-09-27).
 *
 * O autor: "quatro opções de temas — essa que tem agora, essa que tem agora só
 * que clara, e as duas antigas. O tema padrão vai ser o antigo, porque combina
 * mais com a temática de Mushoku".
 *
 * - **Pergaminho Noite** (padrão) e **Pergaminho**: o site como era antes da
 *   0.1.98 — pergaminho, vinho e dourado.
 * - **Livro Noite** e **Livro Dia**: o site vestindo o livro folheado (as cores
 *   de capítulo por seção, a letra gritada, a mesa quadriculada).
 *
 * O `<html>` carrega duas marcas, e todo o CSS pendura nelas:
 * - `dark` nos dois temas noite (o `dark:` do Tailwind e os `.dark …` do CSS
 *   continuam valendo sem mudar nada);
 * - `tema-livro` nos dois temas do livro (o bloco "O SITE NO ESTILO DO LIVRO"
 *   do globals.css, e o caos da ficha).
 *
 * O livro (/livro) tem a identidade dele nos quatro: tema é roupa do site.
 */
export const TEMAS = [
  { id: "pergaminho-noite", nome: "Pergaminho Noite", noite: true, livro: false },
  { id: "pergaminho", nome: "Pergaminho", noite: false, livro: false },
  { id: "livro-noite", nome: "Livro Noite", noite: true, livro: true },
  { id: "livro-dia", nome: "Livro Dia", noite: false, livro: true },
] as const;

export type TemaId = (typeof TEMAS)[number]["id"];

export const TEMA_PADRAO: TemaId = "pergaminho-noite";

/** O que o `next-themes` põe na classe do `<html>`: só o claro/escuro. */
export const CLASSE_DO_TEMA: Record<TemaId, string> = {
  "pergaminho-noite": "dark",
  pergaminho: "light",
  "livro-noite": "dark",
  "livro-dia": "light",
};

export function ehNoite(tema: string | undefined): boolean {
  return tema === "dark" || !!TEMAS.find((t) => t.id === tema)?.noite;
}

export function ehTemaDoLivro(tema: string | undefined): boolean {
  return !!TEMAS.find((t) => t.id === tema)?.livro;
}

/**
 * Roda no <head>, antes da primeira pintura e antes do script do `next-themes`
 * (que mora no <body>):
 * 1. quem tinha "dark"/"light" salvo, do tempo de dois temas, passa pro
 *    Pergaminho correspondente — o padrão novo;
 * 2. o `tema-livro` entra no `<html>` já no primeiro quadro, sem piscar o
 *    pergaminho antes do livro.
 * Constante do próprio código, sem nada vindo de fora.
 */
export const SCRIPT_TEMA_INICIAL = `try{var k="theme",t=localStorage.getItem(k);if(t==="dark"){t="pergaminho-noite";localStorage.setItem(k,t)}else if(t==="light"){t="pergaminho";localStorage.setItem(k,t)}if(t==="livro-noite"||t==="livro-dia")document.documentElement.classList.add("tema-livro")}catch(e){}`;
