"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import "./movimentoDoSite.css";

/** Entradas únicas, apenas na tela; a navegação cancela o que ainda estiver tocando. */
export default function MovimentoDoSite() {
  const rota = usePathname();
  useEffect(() => {
    if (!["/arvores", "/loja", "/personagens", "/novidades", "/busca"].includes(rota)) return;
    const main = document.querySelector("main");
    if (!main) return;
    const vistos = new WeakSet<Element>();
    const observados = new Set<HTMLElement>();
    const animacoes = new Map<Element, Animation>();
    const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
    const cancelar = () => { animacoes.forEach((a) => a.cancel()); animacoes.clear(); };
    const io = new IntersectionObserver((entradas) => {
      let ordem = 0;
      for (const entrada of entradas) {
        const el = entrada.target as HTMLElement;
        if (!entrada.isIntersecting) { animacoes.get(el)?.cancel(); animacoes.delete(el); continue; }
        if (vistos.has(el)) continue;
        vistos.add(el);
        if (reduzido.matches) continue;
        const d = document.documentElement.classList.contains("tema-livro") ? 8 : 5;
        const animacao = el.animate([{ opacity: .65, transform: `translateY(${d}px)` }, { opacity: 1, transform: "translateY(0)" }], { duration: 280, delay: Math.min(ordem++ * 35, 140), easing: "cubic-bezier(.2,.7,.2,1)" });
        animacoes.set(el, animacao);
        void animacao.finished.then(() => animacoes.delete(el), () => {});
      }
    }, { threshold: .08 });
    const coletar = () => main.querySelectorAll<HTMLElement>(".surface, article, .grid > a, .grid > div[class*='rounded'], [data-movimento-cartao]").forEach((el) => {
      if (observados.has(el) || el.closest("[data-sem-movimento]")) return;
      // Uma peça entra uma vez; cartões internos não empilham animações.
      if (el.parentElement?.closest(".cartao-vivo")) return;
      observados.add(el);
      el.classList.add("cartao-vivo");
      io.observe(el);
    });
    coletar();
    const mutacoes = new MutationObserver(coletar);
    mutacoes.observe(main, { childList: true, subtree: true });
    reduzido.addEventListener("change", cancelar);
    window.addEventListener("beforeprint", cancelar);
    return () => { io.disconnect(); mutacoes.disconnect(); cancelar(); observados.forEach((el) => el.classList.remove("cartao-vivo")); reduzido.removeEventListener("change", cancelar); window.removeEventListener("beforeprint", cancelar); };
  }, [rota]);
  return null;
}
