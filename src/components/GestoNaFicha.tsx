"use client";
import { useEffect, useRef, useState } from "react";
import { GestoDaEscola } from "./GestoDaEscola";

/** A compra aguarda o painel visível. Ao sair, imprimir ou reduzir movimento, encerra. */
export default function GestoNaFicha({ arvoreId }: { arvoreId: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [tocando, setTocando] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)");
    let iniciou = false;
    let encerrado = reduzir.matches;
    let fim: ReturnType<typeof setTimeout> | undefined;
    const encerrar = () => { encerrado = true; setTocando(false); if (fim) clearTimeout(fim); };
    const io = new IntersectionObserver(([entrada]) => {
      if (encerrado) return;
      if (!entrada.isIntersecting) { if (iniciou) encerrar(); return; }
      if (iniciou || reduzir.matches) return;
      iniciou = true;
      setTocando(true);
      fim = setTimeout(encerrar, 30000);
    });
    io.observe(el);
    reduzir.addEventListener("change", encerrar);
    window.addEventListener("beforeprint", encerrar);
    return () => { io.disconnect(); if (fim) clearTimeout(fim); reduzir.removeEventListener("change", encerrar); window.removeEventListener("beforeprint", encerrar); };
  }, []);
  return <span ref={ref} className="pointer-events-none absolute inset-0" aria-hidden data-gesto-na-ficha onAnimationEnd={() => requestAnimationFrame(() => { if (ref.current && !ref.current.getAnimations({ subtree: true }).some(a => a.playState === "running")) setTocando(false); })}>{tocando && <GestoDaEscola arvoreId={arvoreId} modo="painel" />}</span>;
}
