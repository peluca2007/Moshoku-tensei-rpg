"use client";

import { useEffect, useState } from "react";
import { caminhoDoSom, type Som, type Toque } from "./sonsDaArena";

/**
 * O tocador dos sons da arena — só navegador (usa `Audio` e `localStorage`).
 * A decisão de QUAL som tocar mora em `sonsDaArena.ts`, que é puro e testado;
 * aqui fica só o "como": preferência ligada/desligada, carregar e tocar.
 */

const CHAVE_DO_SOM = "arena-som";
const EVENTO_DO_SOM = "arena-som-mudou";

function lerPreferencia(): boolean {
  try { return localStorage.getItem(CHAVE_DO_SOM) === "ligado"; } catch { return false; }
}

/**
 * Som desligado por padrão: na mesa, com o celular de todo mundo aberto, som
 * que dispara sozinho assusta. A escolha fica no navegador de quem liga, e
 * todas as arenas abertas na página obedecem juntas.
 */
export function useSomDaArena(): [boolean, () => void] {
  const [ligado, setLigado] = useState(false);
  useEffect(() => {
    const sincronizar = () => setLigado(lerPreferencia());
    sincronizar();
    window.addEventListener(EVENTO_DO_SOM, sincronizar);
    return () => window.removeEventListener(EVENTO_DO_SOM, sincronizar);
  }, []);
  const alternar = () => {
    const proximo = !ligado;
    try { localStorage.setItem(CHAVE_DO_SOM, proximo ? "ligado" : "desligado"); } catch { /* sem armazenamento: vale só agora */ }
    setLigado(proximo);
    window.dispatchEvent(new Event(EVENTO_DO_SOM));
  };
  return [ligado, alternar];
}

/** Um `<audio>` por arquivo, criado só quando o som é ligado; cada toque é uma cópia, para poderem se sobrepor. */
const BASES = new Map<Som, HTMLAudioElement>();

function base(som: Som): HTMLAudioElement {
  let audio = BASES.get(som);
  if (!audio) {
    audio = new Audio(caminhoDoSom(som));
    audio.preload = "auto";
    BASES.set(som, audio);
  }
  return audio;
}

/** Agenda os toques do passo no mesmo relógio das animações; devolve quem cancela. */
export function tocar(toques: Toque[], velocidade: number): () => void {
  const timers: number[] = [];
  const tocando: HTMLAudioElement[] = [];
  for (const t of toques) {
    timers.push(window.setTimeout(() => {
      const audio = base(t.som).cloneNode(true) as HTMLAudioElement;
      audio.volume = 0.55;
      audio.playbackRate = velocidade > 2 ? 1.25 : 1;
      tocando.push(audio);
      audio.play().catch(() => { /* o navegador pode barrar antes de um toque do usuário */ });
      if (t.duracao) timers.push(window.setTimeout(() => audio.pause(), t.duracao / Math.min(velocidade, 2)));
    }, t.atraso / Math.min(velocidade, 2)));
  }
  return () => {
    timers.forEach((id) => clearTimeout(id));
    // Deixa terminar o que já soou; só evita que a cauda longa invada o passo seguinte.
    tocando.forEach((a) => { if (!a.paused && a.currentTime > 1.2) a.pause(); });
  };
}

/** Um som solto, fora da arena (as moedas das recompensas). Respeita a mesma chave de ligado/desligado. */
export function tocarSeLigado(som: Som): void {
  if (!lerPreferencia()) return;
  tocar([{ som, atraso: 0, duracao: 1500 }], 1);
}
