"use client";

import { useEffect, useRef, useState } from "react";
import { AREAS_DAS_NOTAS, type AreaDaNota } from "@/data/patchNotes";
import s from "./notas.module.css";

type Filtro = AreaDaNota | "tudo";
const CHAVE = "notas-filtro";

/**
 * O filtro por área da página Novidades. Ele só marca `data-filtro` na raiz:
 * quem esconde é o CSS (notas.module.css), e a página continua inteira no HTML
 * — busca do navegador e leitor de tela incluídos.
 *
 * Duas coisas que o CSS não faz: filtrando, as versões recolhidas das fases
 * antigas abrem (senão o filtro mostraria uma lista de títulos fechados); e um
 * link pra uma versão recolhida (os da lista "Na mesa") abre a versão antes de
 * rolar até ela.
 */
export default function FiltroDasNotas() {
  const ref = useRef<HTMLDivElement>(null);
  const [filtro, setFiltro] = useState<Filtro>("tudo");

  // O filtro de quem já esteve aqui volta (é conveniência; sem armazenamento, começa em "Tudo").
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE) as Filtro | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lê o armazenamento uma vez, depois de montar
      if (salvo && (salvo === "tudo" || AREAS_DAS_NOTAS.some((a) => a.id === salvo))) setFiltro(salvo);
    } catch {
      /* sem armazenamento: começa em "Tudo" */
    }
  }, []);

  useEffect(() => {
    const raiz = ref.current?.closest<HTMLElement>("[data-notas]");
    if (!raiz) return;
    raiz.dataset.filtro = filtro;
    raiz.querySelectorAll<HTMLDetailsElement>("details[data-recolhida]").forEach((d) => {
      if (filtro !== "tudo" && !d.open) {
        d.open = true;
        d.dataset.abertaPeloFiltro = "";
      } else if (filtro === "tudo" && d.dataset.abertaPeloFiltro !== undefined) {
        d.open = false;
        delete d.dataset.abertaPeloFiltro;
      }
    });
    try {
      localStorage.setItem(CHAVE, filtro);
    } catch {
      /* sem armazenamento: o filtro só não é lembrado */
    }
  }, [filtro]);

  useEffect(() => {
    const abrirAlvo = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const alvo = id ? document.getElementById(id) : null;
      if (!alvo) return;
      // Aberta pelo link, e não pelo filtro: voltar pra "Tudo" não a fecha.
      for (let d = alvo.closest("details"); d; d = d.parentElement?.closest("details") ?? null) {
        d.open = true;
        delete d.dataset.abertaPeloFiltro;
      }
      // Se o filtro esconde a versão pedida, volta pra "Tudo".
      if (alvo.offsetParent === null) setFiltro("tudo");
      requestAnimationFrame(() => alvo.scrollIntoView({ block: "start" }));
    };
    abrirAlvo();
    window.addEventListener("hashchange", abrirAlvo);
    return () => window.removeEventListener("hashchange", abrirAlvo);
  }, []);

  const escolher = (f: Filtro) => {
    setFiltro(f);
    ref.current?.scrollIntoView({ block: "start" });
  };

  return (
    <div ref={ref} className={s.filtro} role="toolbar" aria-label="Filtrar as notas por área">
      <p>Mostrar</p>
      <button type="button" className={s.tudo} aria-pressed={filtro === "tudo"} onClick={() => escolher("tudo")}>
        Tudo
      </button>
      {AREAS_DAS_NOTAS.map((a) => (
        <button key={a.id} type="button" data-area={a.id} aria-pressed={filtro === a.id} onClick={() => escolher(a.id)}>
          {a.nome}
        </button>
      ))}
    </div>
  );
}
