"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { RANKS, type RankName } from "@/lib/types";
import { identidadeVisualDaArvore } from "@/data/identidadeDasArvores";
import styles from "./movimento.module.css";

export default function MomentoDoPatamar({ arvore, rank, personagem }: { arvore: string; rank?: RankName; personagem: string }) {
  const selo = useRef<HTMLSpanElement>(null);
  const anterior = useRef(rank);
  const identidade = identidadeVisualDaArvore(arvore);
  useEffect(() => {
    let antes = anterior.current;
    anterior.current = rank;
    if (!rank) return;
    try {
      const chave = `mushoku-patamar-visto:${personagem}:${arvore}`;
      const salvo = sessionStorage.getItem(chave) as RankName | null;
      if (salvo && RANKS.includes(salvo)) antes = salvo;
      sessionStorage.setItem(chave, RANKS.indexOf(antes ?? rank) > RANKS.indexOf(rank) ? antes! : rank);
    } catch { /* Sem storage, a comparação vale durante esta visita. */ }
    if (!rank || !antes || RANKS.indexOf(rank) <= RANKS.indexOf(antes) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = selo.current;
    if (!el) return;
    let animacao: Animation | undefined;
    let entrou = false;
    const cancelar = () => animacao?.cancel();
    const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
    const io = new IntersectionObserver((entradas) => {
      if (!entradas[0].isIntersecting) { cancelar(); return; }
      if (entrou || reduzido.matches) return;
      entrou = true;
      animacao = el.animate([{ opacity: 0, transform: "scale(.85)" }, { opacity: .35, transform: "scale(1)", offset: .3 }, { opacity: 0, transform: "scale(1.06)" }], { duration: 480, easing: "ease-out" });
    });
    io.observe(el);
    reduzido.addEventListener("change", cancelar);
    window.addEventListener("beforeprint", cancelar);
    return () => { io.disconnect(); cancelar(); reduzido.removeEventListener("change", cancelar); window.removeEventListener("beforeprint", cancelar); };
  }, [rank, personagem, arvore]);
  return <span ref={selo} aria-hidden="true" className={styles.selo} style={{ "--cor-selo-dia": identidade?.corDia, "--cor-selo-noite": identidade?.corNoite } as CSSProperties}>{identidade?.kanji}</span>;
}
