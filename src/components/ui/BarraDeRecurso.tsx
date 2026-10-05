"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./movimento.module.css";

export default function BarraDeRecurso({ atual, maximo, nome, entrada = false }: { atual: number; maximo: number; nome: string; entrada?: boolean }) {
  const barra = useRef<HTMLDivElement>(null);
  const tinta = useRef<HTMLSpanElement>(null);
  const anterior = useRef(atual);
  const proporcao = maximo > 0 ? Math.max(0, Math.min(1, atual / maximo)) : 0;
  useEffect(() => {
    const el = barra.current;
    const de = anterior.current;
    anterior.current = atual;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const animacoes: Animation[] = [];
    if (!entrada && tinta.current && de !== atual) animacoes.push(tinta.current.animate([{ transform: `scaleX(${maximo > 0 ? Math.max(0, Math.min(1, de / maximo)) : 0})` }, { transform: `scaleX(${proporcao})` }], { duration: 320, easing: "cubic-bezier(.2,.7,.2,1)" }));
    if (atual < de) {
      animacoes.push(el.animate([{ opacity: .45 }, { opacity: 1 }], { duration: 280 }));
      if (de - atual > maximo / 4) animacoes.push(el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "translateX(0)" }], { duration: 240 }));
    }
    if (entrada && tinta.current) animacoes.push(tinta.current.animate([{ transform: "scaleX(0)" }, { transform: `scaleX(${proporcao})` }], { duration: 420, easing: "ease-out" }));
    const cancelar = () => animacoes.forEach((a) => a.cancel());
    const io = new IntersectionObserver((entradas) => { if (!entradas[0].isIntersecting) cancelar(); });
    io.observe(el);
    window.addEventListener("beforeprint", cancelar);
    const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
    reduzido.addEventListener("change", cancelar);
    return () => { io.disconnect(); cancelar(); window.removeEventListener("beforeprint", cancelar); reduzido.removeEventListener("change", cancelar); };
  }, [atual, maximo, entrada, proporcao]);
  return <div ref={barra} className={styles.barra} data-recurso={nome.split(" ")[0]} role="progressbar" aria-label={nome} aria-valuemin={0} aria-valuemax={Math.max(0, maximo)} aria-valuenow={Math.max(0, Math.min(atual, maximo))}>
    <span ref={tinta} className={styles.tinta} style={{ "--proporcao": proporcao } as CSSProperties} />
  </div>;
}
