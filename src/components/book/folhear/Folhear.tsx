"use client";

import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  House,
  Maximize2,
  Minimize2,
  Moon,
  ScrollText,
  Search,
  Sun,
  TableOfContents,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TocEntry } from "../BookToc";
import { FONTES_DO_LIVRO } from "./fontes";
import { type Achado, buscarNoLivro, esquecerIndice, limparRealce, realcar } from "./buscaNoLivro";
import { ARTE_DA_FOLHA_DE_ROSTO } from "../arteDasAberturas";
import {
  type Geometria,
  type Paginacao,
  type Rotulo,
  CAPA,
  ZOOMS,
  ajustarFigurasLargas,
  ajustarTabelasLargas,
  calcularGeometria,
  espalharTabelasEspremidas,
  esticarVitrines,
  limparCabecalhosRepetidos,
  medirPaginas,
  numeralDoCapitulo,
  paginaDoElemento,
  primeiroBloco,
  regua,
  repetirCabecalhos,
  rotuloDoCapitulo,
  segurarCaixasCurtas,
  segurarTitulos,
  soltarTitulos,
  limparCalcosInuteis,
} from "./diagramacao";

/**
 * O LIVRO FOLHEADO — o /livro aberto como livro impresso (2026-09-24).
 *
 * ## O que ele é
 *
 * Páginas de tamanho FIXO, em duas colunas, com o papel, a tipografia e as
 * caixas de um livro de RPG impresso — o Livro do Jogador de D&D foi a régua.
 * O livro inteiro é escalado pra caber na tela; quem precisa de letra maior
 * usa o zoom (botões, ou duplo clique na página). A diagramação é a mesma em
 * toda tela, então o número da página também é.
 *
 * ## Quem pagina é o navegador
 *
 * O texto vira colunas CSS aninhadas: as de FORA são as páginas (uma coluna
 * por página, com a altura da mancha), as de DENTRO são as duas colunas de
 * texto de cada página. O navegador parte parágrafo por linha, respeita
 * viúvas, órfãs e `break-*`, e tudo continua HTML vivo: seleção, Ctrl+F,
 * links, teclado, vídeo. O modo contínuo é o mesmo DOM com outra classe.
 *
 * ## O que o JavaScript faz
 *
 * 1. Mede o palco: uma página ou duas, e a escala que cabe.
 * 2. Depois que o navegador diagramou, descobre em que página caiu cada título
 *    — é daí que saem o rodapé e o sumário com número de página.
 * 3. Vira a folha (botão, teclado, roda, deslize, régua) e dá zoom.
 * 4. Guarda o bloco que você lia antes de qualquer recomposição e volta pra ele.
 */

type Modo = "livro" | "continuo";

/*
 * O modo mora no localStorage, que é um sistema externo ao React — por isso
 * `useSyncExternalStore`, igual ao `FontSizeToggle`. A `memoria` é a fonte
 * primária: numa aba anônima o localStorage pode recusar a escrita, e sem ela
 * o botão pararia de funcionar em vez de só deixar de lembrar.
 */
const CHAVE_MODO = "livro-folhear-modo";
const memoria: { modo?: Modo } = {};
const ouvintes = new Set<() => void>();

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function lerModo(): Modo {
  if (memoria.modo) return memoria.modo;
  try {
    const salvo = localStorage.getItem(CHAVE_MODO);
    if (salvo === "livro" || salvo === "continuo") return salvo;
  } catch {
    /* sem armazenamento: vale o padrão da tela */
  }
  // No celular o padrão é o contínuo: uma página de livro inteira numa tela de
  // bolso fica pequena demais, e na mesa o que se faz no telefone é CONSULTAR.
  return window.matchMedia("(min-width: 768px)").matches ? "livro" : "continuo";
}

function gravarModo(m: Modo) {
  memoria.modo = m;
  try {
    localStorage.setItem(CHAVE_MODO, m);
  } catch {
    /* fica só na memória desta aba */
  }
  ouvintes.forEach((o) => o());
}

/*
 * O PAPEL do livro — noite (padrão) ou dia —, escolhido à parte do tema do
 * site: o livro é um objeto, e um livro de capa preta não fica branco porque
 * o site está claro. Mesmo esquema de loja externa do modo.
 */
type Papel = "noite" | "dia";
const CHAVE_PAPEL = "livro-folhear-papel";
const memoriaDoPapel: { papel?: Papel } = {};

function lerPapel(): Papel {
  if (memoriaDoPapel.papel) return memoriaDoPapel.papel;
  try {
    const salvo = localStorage.getItem(CHAVE_PAPEL);
    if (salvo === "noite" || salvo === "dia") return salvo;
  } catch {
    /* sem armazenamento: vale o padrão */
  }
  return "noite";
}

function gravarPapel(p: Papel) {
  memoriaDoPapel.papel = p;
  try {
    localStorage.setItem(CHAVE_PAPEL, p);
  } catch {
    /* fica só na memória desta aba */
  }
  ouvintes.forEach((o) => o());
}

const DURACAO_VIRADA_MS = 460;

/*
 * "Voltar de onde parei". Com a página de tamanho fixo, o número da página é
 * o mesmo em qualquer tela — então guardar a página basta. Só vale quando o
 * livro abre sem link pra uma seção (o link sempre ganha).
 */
const CHAVE_PAGINA = "livro-folhear-pagina";

function lerPaginaGuardada(): number | null {
  try {
    const n = Number(localStorage.getItem(CHAVE_PAGINA));
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export default function Folhear({
  toc,
  edicao,
  children,
}: {
  toc: TocEntry[];
  /** A versão do livro, pra folha de rosto ("Edição 0.1.96"). */
  edicao?: string;
  children: ReactNode;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const janela = useRef<HTMLDivElement>(null);
  const faixa = useRef<HTMLDivElement>(null);
  const fluxo = useRef<HTMLDivElement>(null);
  const fim = useRef<HTMLSpanElement>(null);
  const botaoIndice = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const modo = useSyncExternalStore<Modo | null>(assinar, lerModo, () => null);
  const papel = useSyncExternalStore<Papel>(assinar, lerPapel, () => "noite");

  const [tamanho, setTamanho] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(0);
  const [versao, setVersao] = useState(0);
  /*
   * As fontes do livro chegam depois do HTML. Diagramar antes delas é
   * trabalho jogado fora — cada diagramação do livro inteiro custa ~1 s — e a
   * página fica escondida até ficar pronta de qualquer jeito. Então a
   * primeira diagramação espera as fontes.
   */
  const [fontesProntas, setFontesProntas] = useState(false);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [dupla, setDupla] = useState(0);
  const [virada, setVirada] = useState<{ dir: "prox" | "ant"; chave: number } | null>(null);
  const [indiceAberto, setIndiceAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);

  const geo = useMemo<Geometria | null>(
    () => (modo === "livro" && tamanho ? calcularGeometria(tamanho.w, tamanho.h) : null),
    [modo, tamanho]
  );
  const porDupla = geo?.porDupla;
  const escalaVisual = geo ? geo.escala * ZOOMS[zoom] : 1;

  /*
   * Refs espelhando o estado, pros ouvintes de janela (teclado, roda) lerem o
   * valor atual sem serem reinstalados a cada página virada.
   */
  const alvo = useRef(0); // a dupla pra onde a leitura está indo: cliques rápidos somam
  const ancora = useRef<Element | null>(null); // o bloco que tem que continuar à vista
  const primeiraVez = useRef(true);
  const focoDoZoom = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const estado = useRef({ geo, paginacao, modo, zoom });
  useLayoutEffect(() => {
    estado.current = { geo, paginacao, modo, zoom };
  });

  const duplas = geo && paginacao ? Math.ceil(paginacao.total / geo.porDupla) : 1;

  /** Guarda o primeiro bloco da leitura atual, antes de qualquer recomposição. */
  const guardarAncora = useCallback(() => {
    const f = fluxo.current;
    const { geo: g, modo: m, paginacao: pg } = estado.current;
    if (!f) return;
    if (m === "livro") {
      // Antes da primeira diagramação não há lugar nenhum pra guardar — e uma
      // âncora "do topo" guardada aqui venceria o link que abriu a página.
      if (!g || !faixa.current || !pg) return;
      const pagina = alvo.current * g.porDupla;
      const r = regua(faixa.current);
      ancora.current = primeiroBloco(f, (el) => paginaDoElemento(el, r, g) >= pagina);
    } else {
      const topo = alturaDoTopo();
      ancora.current = primeiroBloco(f, (el) => el.getBoundingClientRect().bottom > topo);
    }
  }, []);

  // ── Tamanho do palco ────────────────────────────────────────────────────
  /*
   * Primeiro palpite SEM medir: no modo Livro o palco é a janela inteira menos
   * a barra e a régua (3rem cada, com a raiz presa em 16 px). Medir o palco
   * obrigaria o navegador a diagramar o livro inteiro sem a geometria — uma
   * diagramação jogada fora (~0,6 s). Com o palpite, a troca pro modo Livro e a
   * geometria entram no mesmo quadro. O ResizeObserver abaixo corrige se o
   * palpite errar (e acompanha a janela mudando de tamanho).
   */
  useLayoutEffect(() => {
    if (modo !== "livro") return;
    // A renderização extra é o ponto: ela entra no MESMO quadro da troca de
    // modo, antes da pintura, em vez de esperar o ResizeObserver medir.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTamanho((t) => t ?? { w: window.innerWidth, h: Math.max(0, window.innerHeight - 96) });
  }, [modo]);

  useEffect(() => {
    const el = palco.current;
    if (modo !== "livro" || !el) return;
    let ultimo = `${window.innerWidth}x${Math.max(0, window.innerHeight - 96)}`;
    const ro = new ResizeObserver(() => {
      const chave = `${el.clientWidth}x${el.clientHeight}`;
      if (chave === ultimo) return;
      ultimo = chave;
      setTamanho({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [modo]);

  // ── Fontes e <details> mudam a diagramação sem mudar o tamanho ─────────
  useEffect(() => {
    if (modo !== "livro") return;
    let vivo = true;
    performance.mark("folhear:montado");
    const aoCarregar = () => {
      performance.mark("folhear:fontes");
      if (!vivo) return;
      guardarAncora();
      setFontesProntas(true);
    };
    if (document.fonts) void document.fonts.ready.then(aoCarregar);
    else aoCarregar();
    const f = fluxo.current;
    // Vários <details> mudando juntos viram UMA recomposição, não uma por
    // details — e os que o próprio livro abriu (logo abaixo) não contam.
    let espera = 0;
    const aoAlternar = () => {
      if (togglesDoLivro.current > 0) {
        togglesDoLivro.current--;
        return;
      }
      clearTimeout(espera);
      espera = window.setTimeout(() => {
        guardarAncora();
        setVersao((v) => v + 1);
      }, 80);
    };
    f?.addEventListener("toggle", aoAlternar, true);
    return () => {
      vivo = false;
      clearTimeout(espera);
      f?.removeEventListener("toggle", aoAlternar, true);
    };
  }, [modo, guardarAncora]);

  /*
   * O catálogo das 19 árvores mora em <details> fechados no contínuo — lá,
   * abrir uma árvore é consultar. No livro impresso não existe "clique pra
   * abrir": o catálogo inteiro está impresso, página após página. Então no
   * modo Livro todo <details> abre (antes da diagramação, pra ela já medir o
   * livro completo), e volta a fechar no contínuo.
   */
  const togglesDoLivro = useRef(0);

  // Cada capítulo no fluxo ganha o id dele (a cor e o selo saem daí, no CSS).
  useLayoutEffect(() => {
    fluxo.current?.querySelectorAll(":scope > *").forEach((el) => {
      const id = el.querySelector(":scope > .livro-abertura h2[id]")?.id;
      if (id) (el as HTMLElement).dataset.capitulo = id;
    });
  }, []);

  // O leitor imersivo: no modo Livro, o menu e o rodapé do site somem.
  useEffect(() => {
    if (modo !== "livro") return;
    const html = document.documentElement;
    html.classList.add("livro-imersivo");
    return () => html.classList.remove("livro-imersivo");
  }, [modo]);
  useLayoutEffect(() => {
    const f = fluxo.current;
    if (!f) return;
    if (modo === "livro") {
      f.querySelectorAll<HTMLDetailsElement>("details:not([open])").forEach((d) => {
        d.setAttribute("data-folhear-aberto", "");
        d.open = true;
        togglesDoLivro.current++;
      });
    } else if (modo === "continuo") {
      f.querySelectorAll<HTMLDetailsElement>("details[data-folhear-aberto]").forEach((d) => {
        d.removeAttribute("data-folhear-aberto");
        d.open = false;
      });
    }
  }, [modo]);

  // Uma ou duas páginas: a PÁGINA é a mesma, a dupla que a contém é que muda.
  // Vem antes da diagramação, que lê o alvo já convertido.
  const porDuplaAnterior = useRef(porDupla);
  useLayoutEffect(() => {
    if (porDuplaAnterior.current && porDupla && porDuplaAnterior.current !== porDupla) {
      alvo.current = Math.floor((alvo.current * porDuplaAnterior.current) / porDupla);
    }
    porDuplaAnterior.current = porDupla;
  }, [porDupla]);

  // ── Diagramar: medir onde cada coisa caiu e voltar ao bloco guardado ───
  // Só a troca de UMA pra DUAS páginas mexe na diagramação; mudar a escala
  // (janela, zoom) não muda nada dentro da página.
  useLayoutEffect(() => {
    const f = fluxo.current;
    const fx = faixa.current;
    const j = janela.current;
    const g = estado.current.geo;
    if (!fontesProntas || !porDupla || !g || !f || !fx || !j || !fim.current) return;

    // Cada passo mede o próprio tempo (performance.measure "folhear:…"), pra
    // quem for otimizar a diagramação saber onde o tempo vai.
    const medir = <T,>(nome: string, passo: () => T): T => {
      const t0 = performance.now();
      const v = passo();
      performance.measure(`folhear:${nome}`, { start: t0, end: performance.now() });
      return v;
    };
    medir("soltar", () => soltarTitulos(f));
    medir("figuras", () => ajustarFigurasLargas(f));
    medir("tabelas-largas", () => espalharTabelasEspremidas(f, g, regua(fx)));
    medir("caixas", () => segurarCaixasCurtas(f, g, regua(fx)));
    medir("tabelas-apertar", () => ajustarTabelasLargas(f, g, regua(fx)));
    // Por último, porque tudo acima mexe em onde as coisas caem. Cada
    // empurrão pode criar outro caso adiante: repete até zerar.
    medir("titulos", () => {
      for (let passada = 0; passada < 8 && segurarTitulos(f, g, regua(fx)) > 0; passada++);
      // Calço que ficou fora do lugar sai, e a conferência roda de novo.
      for (let rodada = 0; rodada < 3 && limparCalcosInuteis(f, regua(fx)) > 0; rodada++) {
        for (let passada = 0; passada < 8 && segurarTitulos(f, g, regua(fx)) > 0; passada++);
      }
    });
    esquecerIndice(f);
    medir("cabecalhos", () => repetirCabecalhos(f));
    medir("vitrines", () => esticarVitrines(f, g, regua(fx)));
    const r = regua(fx);
    const p = medir("medir", () => medirPaginas(f, fim.current!, r, g, toc));
    const total = Math.ceil(p.total / porDupla);
    // A faixa cresce aqui mesmo, antes do React pintar: o scroll logo abaixo
    // precisa de largura pra chegar na dupla certa.
    fx.style.width = `${total * porDupla * g.pagina}px`;

    let destino = Math.min(alvo.current, total - 1);
    const guardada = ancora.current;
    ancora.current = null;
    // Na primeira diagramação manda o link (#cap4-6); depois, o bloco guardado.
    const alvoDoLink =
      primeiraVez.current && location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null;
    if (alvoDoLink && f.contains(alvoDoLink)) {
      destino = Math.floor(paginaDoElemento(alvoDoLink, r, g) / porDupla);
      destacar(alvoDoLink);
      // O navegador também "rola até o #": no modo Livro isso desceria a
      // janela do site. Quem mostra a seção aqui é a dupla.
      const aoTopo = () => window.scrollTo({ top: 0, behavior: "instant" });
      aoTopo();
      if (document.readyState !== "complete") window.addEventListener("load", aoTopo, { once: true });
    } else if (guardada && f.contains(guardada)) {
      destino = Math.floor(paginaDoElemento(guardada, r, g) / porDupla);
    } else if (primeiraVez.current) {
      const onde = lerPaginaGuardada();
      if (onde !== null) destino = Math.min(Math.floor(onde / porDupla), total - 1);
    }
    primeiraVez.current = false;
    alvo.current = destino;
    j.scrollTo({ left: destino * porDupla * g.pagina, behavior: "instant" });

    // Medir o layout e só então pintar a moldura é exatamente o caso de uso
    // do useLayoutEffect: sem isso o rodapé piscaria errado por um quadro.
    setPaginacao(p);
    setDupla(destino);
  }, [porDupla, versao, toc, fontesProntas]);

  /*
   * SÓ A DUPLA ABERTA SE MEXE (2026-09-25).
   *
   * O livro inteiro está no DOM: 245 páginas, com dezenas de diagramas
   * animados (alguns em laço infinito) e os vídeos das habilidades em
   * autoplay. Tudo isso rodava o tempo todo, fora da vista, e cada quadro de
   * animação obrigava o navegador a repintar a caixa de colunas gigante:
   * medido, ~1 s de trabalho a cada folha virada e a tela redesenhando sem
   * parar mesmo com o livro parado — as "travadinhas" que o autor sentiu.
   *
   * Agora um IntersectionObserver com a janela do livro como raiz marca o que
   * está na dupla aberta: diagrama fora dela fica sem animação (e, de brinde,
   * anima de novo quando a página abre), vídeo fora dela fica pausado.
   */
  useEffect(() => {
    const j = janela.current;
    const f = fluxo.current;
    if (modo !== "livro" || !j || !f || !paginacao) return;
    const alvos = Array.from(f.querySelectorAll<HTMLElement>(".diagrama, video"));
    alvos.forEach((el) => {
      if (el instanceof HTMLVideoElement) {
        el.autoplay = false;
        el.pause();
      }
    });
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          const el = e.target as HTMLElement;
          el.classList.toggle("folhear-visivel", e.isIntersecting);
          if (el instanceof HTMLVideoElement) {
            if (e.isIntersecting) void el.play().catch(() => {});
            else el.pause();
          }
        }
      },
      { root: j }
    );
    alvos.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      alvos.forEach((el) => {
        el.classList.remove("folhear-visivel");
        if (el instanceof HTMLVideoElement) {
          el.autoplay = true;
          void el.play().catch(() => {});
        }
      });
    };
  }, [modo, paginacao]);

  // Guarda a página a cada virada (a primeira da dupla aberta).
  useEffect(() => {
    if (modo !== "livro" || !paginacao || !porDupla) return;
    try {
      localStorage.setItem(CHAVE_PAGINA, String(dupla * porDupla));
    } catch {
      /* sem armazenamento: o livro só não lembra */
    }
  }, [modo, paginacao, porDupla, dupla]);

  // ── Voltar ao contínuo sem perder o lugar ───────────────────────────────
  useLayoutEffect(() => {
    if (modo !== "continuo") return;
    if (fluxo.current) limparCabecalhosRepetidos(fluxo.current);
    const guardada = ancora.current;
    ancora.current = null;
    if (!guardada) return;
    const topo = alturaDoTopo();
    window.scrollTo({ top: window.scrollY + guardada.getBoundingClientRect().top - topo - 16, behavior: "instant" });
  }, [modo]);

  // ── Zoom: o ponto clicado continua embaixo do cursor ───────────────────
  useLayoutEffect(() => {
    const p = palco.current;
    const foco = focoDoZoom.current;
    focoDoZoom.current = null;
    if (!p || !foco) return;
    const livro = p.querySelector<HTMLElement>(".folhear-dimensao");
    if (!livro) return;
    p.scrollLeft = foco.x * livro.offsetWidth - foco.px;
    p.scrollTop = foco.y * livro.offsetHeight - foco.py;
  }, [zoom]);

  const mudarZoom = useCallback((novo: number, ponto?: { clientX: number; clientY: number }) => {
    const n = Math.max(0, Math.min(ZOOMS.length - 1, novo));
    const p = palco.current;
    const livro = p?.querySelector<HTMLElement>(".folhear-dimensao");
    if (p && livro) {
      const pr = p.getBoundingClientRect();
      const lr = livro.getBoundingClientRect();
      const cx = ponto?.clientX ?? pr.left + pr.width / 2;
      const cy = ponto?.clientY ?? pr.top + pr.height / 2;
      focoDoZoom.current = {
        x: (cx - lr.left) / lr.width,
        y: (cy - lr.top) / lr.height,
        px: cx - pr.left,
        py: cy - pr.top,
      };
    }
    setZoom(n);
  }, []);

  // ── Virar ───────────────────────────────────────────────────────────────
  const irPara = useCallback((d: number, animar: boolean) => {
    const { geo: g, paginacao: pg } = estado.current;
    const j = janela.current;
    if (!g || !j) return;
    const ultimo = pg ? Math.ceil(pg.total / g.porDupla) - 1 : 0;
    const destino = Math.max(0, Math.min(ultimo, d));
    const de = alvo.current;
    if (destino === de) return;
    alvo.current = destino;
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const folheia = animar && !calmo && Math.abs(destino - de) === 1;
    if (folheia) setVirada({ dir: destino > de ? "prox" : "ant", chave: performance.now() });
    j.scrollTo({ left: destino * g.porDupla * g.pagina, behavior: "instant" });
    setDupla(destino);
  }, []);

  const irParaElemento = useCallback(
    (el: Element) => {
      const { geo: g, modo: m } = estado.current;
      if (m === "livro" && g && faixa.current) {
        irPara(Math.floor(paginaDoElemento(el, regua(faixa.current), g) / g.porDupla), false);
      } else {
        const topo = alturaDoTopo();
        window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - topo - 16, behavior: "smooth" });
      }
      destacar(el);
    },
    [irPara]
  );

  // A janela não rola pela mão (quem vira é o livro), mas o Ctrl+F do
  // navegador rola ela até o trecho achado — aí a dupla se realinha.
  useEffect(() => {
    const j = janela.current;
    if (modo !== "livro" || !j) return;
    let assentar = 0;
    const aoRolar = () => {
      clearTimeout(assentar);
      assentar = window.setTimeout(() => {
        const g = estado.current.geo;
        if (!g) return;
        const largura = g.pagina * g.porDupla;
        const d = Math.round(j.scrollLeft / largura);
        if (j.scrollLeft !== d * largura) j.scrollTo({ left: d * largura, behavior: "instant" });
        alvo.current = d;
        setDupla(d);
      }, 140);
    };
    j.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      j.removeEventListener("scroll", aoRolar);
      clearTimeout(assentar);
    };
  }, [modo]);

  // Ctrl+K no modo Livro abre a busca DENTRO do livro. O modal da busca do
  // site mora no menu, que está escondido — e ele mandaria pra fora do livro.
  useEffect(() => {
    if (modo !== "livro") return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      e.stopPropagation();
      setIndiceAberto(false);
      setBuscaAberta(true);
    };
    window.addEventListener("keydown", aoTeclar, true);
    return () => window.removeEventListener("keydown", aoTeclar, true);
  }, [modo]);

  // Teclado: setas e PageUp/PageDown viram; Home/End vão às pontas; +/- dão zoom.
  useEffect(() => {
    if (modo !== "livro") return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable='true']")) return;
      const acao: Record<string, () => void> = {
        ArrowRight: () => irPara(alvo.current + 1, true),
        PageDown: () => irPara(alvo.current + 1, true),
        ArrowLeft: () => irPara(alvo.current - 1, true),
        PageUp: () => irPara(alvo.current - 1, true),
        Home: () => irPara(0, false),
        End: () => irPara(Number.MAX_SAFE_INTEGER, false),
        "+": () => mudarZoom(estado.current.zoom + 1),
        "=": () => mudarZoom(estado.current.zoom + 1),
        "-": () => mudarZoom(estado.current.zoom - 1),
      };
      const fazer = acao[e.key];
      if (!fazer) return;
      e.preventDefault();
      fazer();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [modo, irPara, mudarZoom]);

  // Roda do mouse: sem zoom, um GESTO vira uma folha (a inércia do trackpad
  // manda dezenas de eventos por gesto). Com zoom, a roda passeia pela página.
  useEffect(() => {
    const p = palco.current;
    if (modo !== "livro" || !p) return;
    let gesto = false;
    let fimDoGesto = 0;
    const aoRodar = (e: WheelEvent) => {
      if (e.ctrlKey || estado.current.zoom > 0) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      e.preventDefault();
      if (!gesto && Math.abs(delta) >= 4) {
        gesto = true;
        irPara(alvo.current + (delta > 0 ? 1 : -1), true);
      }
      clearTimeout(fimDoGesto);
      fimDoGesto = window.setTimeout(() => (gesto = false), 220);
    };
    p.addEventListener("wheel", aoRodar, { passive: false });
    return () => {
      p.removeEventListener("wheel", aoRodar);
      clearTimeout(fimDoGesto);
    };
  }, [modo, irPara]);

  // Deslize com o dedo vira a folha (sem zoom; com zoom o dedo passeia).
  const toque = useRef<{ x: number; y: number } | null>(null);
  const aoTocar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" || zoom > 0) return;
    toque.current = { x: e.clientX, y: e.clientY };
  };
  const aoSoltar = (e: PointerEvent<HTMLDivElement>) => {
    const t = toque.current;
    toque.current = null;
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) irPara(alvo.current + (dx < 0 ? 1 : -1), true);
  };

  // Tela cheia
  useEffect(() => {
    const aoMudar = () => setTelaCheia(document.fullscreenElement === raiz.current);
    document.addEventListener("fullscreenchange", aoMudar);
    return () => document.removeEventListener("fullscreenchange", aoMudar);
  }, []);

  // O índice fecha no Esc e devolve o foco a quem o abriu.
  useEffect(() => {
    if (!indiceAberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setIndiceAberto(false);
      botaoIndice.current?.focus();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [indiceAberto]);

  /** Todo link interno do livro passa por aqui: no modo Livro, âncora vira dupla. */
  const aoClicar = (e: MouseEvent<HTMLDivElement>) => {
    // No livro impresso o catálogo não fecha: clicar no nome da árvore é ler.
    if (estado.current.modo === "livro" && (e.target as Element).closest?.(".folhear-fluxo summary")) {
      e.preventDefault();
      return;
    }
    const a = (e.target as Element).closest?.("a[href^='#']");
    if (!a) return;
    const id = decodeURIComponent(a.getAttribute("href")!.slice(1));
    if (!id) return;
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el || !fluxo.current?.contains(el)) {
      // O link aponta pra um capítulo que não está neste volume.
      router.push(`/livro#${id}`);
      return;
    }
    history.replaceState(null, "", `#${id}`);
    setIndiceAberto(false);
    irParaElemento(el);
  };

  const fecharBusca = useCallback(() => {
    limparRealce();
    setBuscaAberta(false);
  }, []);

  const trocarModo = (m: Modo) => {
    if (m === modo) return;
    guardarAncora();
    setPaginacao(null);
    setZoom(0);
    gravarModo(m);
  };

  const alternarTelaCheia = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void raiz.current?.requestFullscreen?.();
  };

  const livro = modo === "livro";
  const pronto = modo === "continuo" || (livro && paginacao !== null);
  const paginaInicial = geo ? dupla * geo.porDupla : 0;
  const rotuloAtual = paginacao?.rotulos[Math.min(paginaInicial + (geo?.porDupla ?? 1) - 1, paginacao.total - 1)];

  const variaveis = geo
    ? ({
        "--pagina": `${geo.pagina}px`,
        "--altura": `${geo.altura}px`,
        "--margem": `${geo.margem}px`,
        "--topo": `${geo.topo}px`,
        "--pe": `${geo.pe}px`,
        "--calha": `${geo.calha}px`,
        "--fonte": `${geo.fonte}px`,
        "--por-dupla": geo.porDupla,
        "--capa": `${CAPA}px`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      ref={raiz}
      className={`folhear livro-shell ${FONTES_DO_LIVRO}`}
      data-modo={modo ?? undefined}
      // O papel só vale no modo Livro; no contínuo manda o tema do site (senão o
      // escuro do papel vazaria pro texto do contínuo, que é claro no tema claro).
      data-papel={modo === "livro" ? papel : undefined}
      data-pronto={pronto ? "" : undefined}
      data-zoom={zoom > 0 ? "" : undefined}
      style={variaveis}
      onClick={aoClicar}
    >
      {/*
        A BARRA DO LIVRO. No modo Livro ela substitui o menu do site (que some:
        ver "leitor imersivo" no CSS), então carrega a volta pro site e o tema.
        Lados com a mesma largura, pra posição ficar no centro óptico da mesa.
      */}
      <div className="folhear-barra print-hide">
        <div className="folhear-barra-lado">
          {livro && (
            <>
              <Link href="/" className="folhear-botao inline-flex" aria-label="Voltar ao site" title="Voltar ao site">
                <House className="h-4 w-4" aria-hidden />
              </Link>
              <button
                type="button"
                className="folhear-botao inline-flex"
                aria-label="Buscar no livro (Ctrl+K)"
                title="Buscar no livro — Ctrl+K"
                aria-expanded={buscaAberta}
                aria-controls="folhear-busca"
                onClick={() => {
                  setIndiceAberto(false);
                  setBuscaAberta((v) => !v);
                }}
              >
                <Search className="h-4 w-4" aria-hidden />
              </button>
            </>
          )}
          <button
            ref={botaoIndice}
            type="button"
            className="folhear-botao inline-flex"
            aria-expanded={indiceAberto}
            aria-controls="folhear-indice"
            onClick={() => setIndiceAberto((v) => !v)}
          >
            <TableOfContents className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Índice</span>
          </button>
        </div>

        <div className="folhear-posicao" aria-live="polite">
          {livro && paginacao && geo ? (
            <>
              <span className="folhear-posicao-titulo">
                {rotuloAtual?.secao ?? rotuloAtual?.capitulo ?? "Sumário"}
              </span>
              <span className="folhear-posicao-paginas">
                {geo.porDupla === 2 && paginaInicial + 1 < paginacao.total
                  ? `páginas ${paginaInicial + 1}–${paginaInicial + 2}`
                  : `página ${paginaInicial + 1}`}{" "}
                de {paginacao.total}
              </span>
            </>
          ) : (
            <span className="folhear-posicao-titulo">Leitura contínua</span>
          )}
        </div>

        <div className="folhear-barra-lado justify-end">
          {livro && (
            <>
              <button
                type="button"
                className="folhear-botao inline-flex"
                onClick={() => mudarZoom(zoom - 1)}
                disabled={zoom === 0}
                aria-label="Afastar"
                title="Afastar (−)"
              >
                <ZoomOut className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className="folhear-botao inline-flex"
                onClick={() => mudarZoom(zoom + 1)}
                disabled={zoom === ZOOMS.length - 1}
                aria-label="Aproximar"
                title="Aproximar (+) — ou duplo clique na página"
              >
                <ZoomIn className="h-4 w-4" aria-hidden />
              </button>
              <BotaoPapel papel={papel} />
            </>
          )}
          <div className="folhear-alternador" role="group" aria-label="Modo de leitura">
            <button type="button" aria-pressed={livro} onClick={() => trocarModo("livro")} title="Livro aberto">
              <BookOpenText className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Livro</span>
            </button>
            <button type="button" aria-pressed={modo === "continuo"} onClick={() => trocarModo("continuo")} title="Leitura contínua">
              <ScrollText className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Contínuo</span>
            </button>
          </div>
          {livro && (
            <button
              type="button"
              className="folhear-botao hidden sm:inline-flex"
              onClick={alternarTelaCheia}
              aria-label={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
              title={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
            >
              {telaCheia ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
            </button>
          )}
        </div>
      </div>

      {/* ── A busca dentro do livro ─────────────────────────────────────── */}
      {livro && buscaAberta && geo && paginacao && (
        <PainelDeBusca
          fluxo={fluxo}
          paginaDe={(el) => (faixa.current ? paginaDoElemento(el, regua(faixa.current), geo) : 0)}
          rotulos={paginacao.rotulos}
          aoIr={(el) => irParaElemento(el)}
          aoFechar={fecharBusca}
        />
      )}

      {/* ── O índice, com a página de cada seção ──────────────────────── */}
      {indiceAberto && (
        <div className="folhear-indice-fundo print-hide" onClick={() => setIndiceAberto(false)}>
          <aside id="folhear-indice" className="folhear-indice" aria-label="Índice" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-2xs font-bold uppercase tracking-[0.3em] text-gold-700 dark:text-gold-400">Índice</p>
              <button
                type="button"
                className="folhear-botao inline-flex"
                aria-label="Fechar o índice"
                onClick={() => {
                  setIndiceAberto(false);
                  botaoIndice.current?.focus();
                }}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <Sumario toc={toc} paginaDe={livro ? paginacao?.paginaDe : undefined} autoFoco />
          </aside>
        </div>
      )}

      {/* ── A mesa: o livro aberto em cima, as setas dos lados ────────── */}
      <div className="folhear-mesa">
        {livro && (
          <button
            type="button"
            className="folhear-seta print-hide"
            data-lado="ant"
            onClick={() => irPara(alvo.current - 1, true)}
            disabled={dupla === 0}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-8 w-8" aria-hidden />
          </button>
        )}

        <div ref={palco} className="folhear-palco">
          <div
            className="folhear-dimensao"
            style={geo ? { width: geo.larguraDoLivro * escalaVisual, height: geo.alturaDoLivro * escalaVisual } : undefined}
          >
            <div
              className="folhear-livro"
              data-por-dupla={geo?.porDupla}
              style={geo ? { transform: `scale(${escalaVisual})` } : undefined}
              onDoubleClick={(e) => {
                if (!livro || (e.target as Element).closest("a, button, summary, input")) return;
                mudarZoom(zoom > 0 ? 0 : 2, e);
              }}
            >
              <div
                ref={janela}
                className="folhear-janela"
                onPointerDown={aoTocar}
                onPointerUp={aoSoltar}
                onPointerCancel={() => (toque.current = null)}
              >
                <div ref={faixa} className="folhear-faixa">
                  {livro && geo && paginacao && <Folhas geo={geo} paginacao={paginacao} duplas={duplas} toc={toc} />}

                  <div
                    ref={fluxo}
                    className={livro ? "folhear-fluxo" : "folhear-continuo livro-pagina surface"}
                  >
                    <Guarda />
                    <FolhaDeRosto edicao={edicao} />
                    <Sumario toc={toc} paginaDe={paginacao?.paginaDe} abertura />
                    {children}
                    <Colofao edicao={edicao} />
                    <span ref={fim} aria-hidden className="folhear-fim" />
                  </div>
                </div>
              </div>

              {livro && paginacao && geo && (
                <Abas
                  toc={toc}
                  paginaDe={paginacao.paginaDe}
                  paginaAtual={paginaInicial + geo.porDupla - 1}
                  aoEscolher={(id) => {
                    const el = document.getElementById(id);
                    if (el) irParaElemento(el);
                  }}
                />
              )}

              {livro && virada && geo && (
                <div
                  key={virada.chave}
                  aria-hidden
                  className="folhear-virada"
                  data-dir={virada.dir}
                  data-unica={geo.porDupla === 1 ? "" : undefined}
                  style={{ "--virada-ms": `${DURACAO_VIRADA_MS}ms` } as CSSProperties}
                  onAnimationEnd={(e) => {
                    if (e.target === e.currentTarget) setVirada(null);
                  }}
                >
                  <div className="folhear-virada-face">
                    <div className="folhear-virada-texto" />
                  </div>
                  <div className="folhear-virada-face" data-verso="">
                    <div className="folhear-virada-texto" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {livro && (
          <button
            type="button"
            className="folhear-seta print-hide"
            data-lado="prox"
            onClick={() => irPara(alvo.current + 1, true)}
            disabled={dupla >= duplas - 1}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-8 w-8" aria-hidden />
          </button>
        )}
      </div>

      {/* ── A régua: folhear rápido até qualquer ponto ─────────────────── */}
      {livro && paginacao && geo && duplas > 1 && (
        <div className="folhear-regua print-hide">
          <input
            type="range"
            min={0}
            max={duplas - 1}
            value={dupla}
            onChange={(e) => irPara(Number(e.target.value), false)}
            aria-label="Folhear até a página"
            aria-valuetext={`Página ${paginaInicial + 1} de ${paginacao.total}`}
          />
        </div>
      )}
    </div>
  );
}

/**
 * As folhas: o papel de cada página, o rodapé (número e capítulo) e a marca
 * de aba impressa na borda de fora — como o índice de dedo de um livro de
 * consulta, que se vê de lado com o livro fechado.
 *
 * Elas moram na mesma faixa do texto e rolam junto: o número da página 12
 * está sempre embaixo do texto da página 12.
 */
function Folhas({
  geo,
  paginacao,
  duplas,
  toc,
}: {
  geo: Geometria;
  paginacao: Paginacao;
  duplas: number;
  toc: TocEntry[];
}) {
  const total = duplas * geo.porDupla;
  return (
    <div aria-hidden className="folhear-folhas">
      {Array.from({ length: total }, (_, k) => {
        const r = paginacao.rotulos[k];
        const lado = geo.porDupla === 1 ? (k % 2 === 0 ? "dir" : "esq") : k % 2 === 0 ? "esq" : "dir";
        const capitulo = (r?.capitulo ?? "").split(" · ")[0];
        const nome = r?.arvoreNome ?? r?.racaNome;
        const parte = !r || r.abertura ? "" : nome ? `${capitulo} — ${nome}` : (r.capitulo ?? "").replace(" · ", " — ");
        const indice = r?.capituloId ? toc.findIndex((c) => c.id === r.capituloId) : -1;
        return (
          <div
            key={k}
            className="folhear-folha"
            data-lado={lado}
            data-pagina={k}
            data-capitulo={r?.capituloId}
            data-arvore={r?.arvoreId}
            data-raca={r?.racaId}
            style={{
              left: k * geo.pagina,
              // A guarda é a prancha colorida: pintada na folha, que vai de
              // borda a borda — dentro das colunas, a arte não passaria da mancha.
              backgroundImage: k === 0 ? `url(${ARTE_DA_FOLHA_DE_ROSTO.src})` : undefined,
            }}
          >
            {k >= 2 && indice >= 0 && (
              <>
                <span className="folhear-marca" style={{ "--aba-i": indice } as CSSProperties} />
                {/* O kanji do capítulo (ou da árvore), enorme e quase apagado no
                    canto de fora. Vem do CSS (--selo), junto com a cor. */}
                <span className="folhear-marca-dagua" />
              </>
            )}
            {/* A guarda e a folha de rosto não levam número, como no impresso. */}
            {k >= 2 && k < paginacao.total && (
              <span className="folhear-rodape">
                <span className="folhear-rodape-numero">{k + 1}</span>
                {parte && <span className="folhear-rodape-parte">{parte}</span>}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * AS ABAS — o índice de dedo, saindo da borda das folhas.
 *
 * Cada capítulo tem uma aba da cor dele; a do capítulo aberto sai mais.
 * Clicar leva ao capítulo — o jeito mais rápido de pular do Combate pro
 * Bestiário no meio da sessão. A cor da aba é a cor que o capítulo usa por
 * dentro (definida uma vez só, no folhear.css, por id de capítulo).
 */
function Abas({
  toc,
  paginaDe,
  paginaAtual,
  aoEscolher,
}: {
  toc: TocEntry[];
  paginaDe: Record<string, number>;
  paginaAtual: number;
  aoEscolher: (id: string) => void;
}) {
  let atual = 0;
  toc.forEach((c, i) => {
    const p = paginaDe[c.id];
    if (p !== undefined && p <= paginaAtual) atual = i;
  });
  return (
    <nav className="folhear-abas print-hide" aria-label="Capítulos">
      {toc.map((c, i) => {
        const numeral = i === 0 ? "0" : c.label.startsWith("Apênd") ? "Ap" : numeralDoCapitulo(c.label);
        return (
          <button
            key={c.id}
            type="button"
            className="folhear-aba"
            data-capitulo={c.id}
            data-atual={i === atual ? "" : undefined}
            onClick={() => aoEscolher(c.id)}
            aria-label={c.label}
            aria-current={i === atual ? "true" : undefined}
            title={c.label}
          >
            <span>{numeral}</span>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * A GUARDA — uma ilustração colorida de página inteira, como as pranchas que
 * abrem um volume de light novel. A arte é pintada na folha da página 1 (ver
 * Folhas); aqui fica a página no fluxo, com a legenda no pé. Só no modo Livro.
 */
function Guarda() {
  return (
    <section className="folhear-guarda" aria-label={ARTE_DA_FOLHA_DE_ROSTO.alt}>
      <p className="folhear-guarda-legenda">O Mundo de Seis Faces</p>
    </section>
  );
}

/** A FOLHA DE ROSTO: título, subtítulo e edição, no branco. Só no modo Livro. */
function FolhaDeRosto({ edicao }: { edicao?: string }) {
  return (
    <section className="folhear-rosto" aria-label="Folha de rosto">
      <p className="folhear-rosto-selo">Livro de Regras</p>
      <h1 className="folhear-rosto-titulo">
        Mushoku Tensei <span>RPG</span>
      </h1>
      <p className="folhear-rosto-sub">O Mundo de Seis Faces</p>
      <p className="folhear-rosto-nota">
        Um sistema de RPG de mesa para jogar no mundo de <i>Mushoku Tensei</i>.
      </p>
      {edicao && <p className="folhear-rosto-edicao">Edição {edicao}</p>}
    </section>
  );
}

/**
 * O COLOFÃO — a última página, a que diz como o livro foi feito e de quem é.
 *
 * O aviso de projeto de fã é o mesmo do rodapé do site: no modo Livro o
 * rodapé some, e o aviso não pode sumir junto. Só existe no modo Livro.
 */
function Colofao({ edicao }: { edicao?: string }) {
  return (
    <section className="folhear-colofao" aria-label="Colofão">
      <p className="folhear-colofao-selo">Colofão</p>
      <p>
        <b>Mushoku Tensei RPG — Livro de Regras</b>
        {edicao && <>, edição {edicao}</>}.
      </p>
      <p>
        Composto em Literata, Fraunces, Barlow e Barlow Condensed; os kanji, na fonte japonesa do seu aparelho. Diagramado
        pelo próprio navegador, página a página, a partir do mesmo texto do site: o que está impresso aqui é
        o que está na ficha.
      </p>
      <p>
        Projeto de fã, sem fins lucrativos e sem vínculo com Rifujin na Magonote, a editora ou qualquer
        detentor dos direitos de <i>Mushoku Tensei</i>. Todo o sistema de regras aqui é uma criação homebrew
        original, feita só pra jogar com amigos — nomes e ambientação da obra original são usados apenas como
        inspiração e referência.
      </p>
      <p className="folhear-colofao-fim" aria-hidden>
        ◆
      </p>
    </section>
  );
}

/**
 * O sumário com número de página — a primeira página do volume, e o índice.
 *
 * No modo contínuo ele some da abertura (página não existe lá) e, no índice,
 * aparece sem números.
 */
function Sumario({
  toc,
  paginaDe,
  abertura = false,
  autoFoco = false,
}: {
  toc: TocEntry[];
  paginaDe?: Record<string, number>;
  abertura?: boolean;
  autoFoco?: boolean;
}) {
  const primeiro = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (autoFoco) primeiro.current?.focus();
  }, [autoFoco]);

  const pagina = (id: string) => (paginaDe && paginaDe[id] !== undefined ? paginaDe[id] + 1 : null);
  return (
    <nav aria-label={abertura ? "Sumário deste volume" : "Índice"} className={abertura ? "folhear-sumario" : "folhear-sumario-lista"}>
      {abertura && (
        <header className="folhear-sumario-topo">
          <p className="folhear-sumario-selo">Sumário</p>
        </header>
      )}
      <ol className="folhear-sumario-capitulos">
        {toc.map((cap, i) => (
          <li key={cap.id} data-capitulo={cap.id}>
            <a ref={i === 0 ? primeiro : undefined} href={`#${cap.id}`} className="folhear-entrada" data-nivel="capitulo">
              <span className="folhear-entrada-numero">{numeralDoCapitulo(cap.label)}</span>
              <span className="folhear-entrada-titulo">{rotuloDoCapitulo(cap.label, false)}</span>
              <span aria-hidden className="folhear-entrada-pontos" />
              <span className="folhear-entrada-pagina">{pagina(cap.id)}</span>
            </a>
            {cap.children && (
              <ol>
                {cap.children.map((s) => {
                  const sub = s.label.startsWith("—");
                  return (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="folhear-entrada" data-nivel={sub ? "sub" : "secao"}>
                        <span className="folhear-entrada-titulo">{sub ? s.label.replace(/^—\s*/, "") : s.label}</span>
                        <span aria-hidden className="folhear-entrada-pontos" />
                        <span className="folhear-entrada-pagina">{pagina(s.id)}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            )}
          </li>
        ))}
      </ol>
      {abertura && (
        <figure aria-hidden className="folhear-sumario-arte">
          {/* O livro mágico que ficava aqui abre o Capítulo 2 (arteDasAberturas.ts). */}
          {/* eslint-disable-next-line @next/next/no-img-element -- arte impressa no papel, sem otimização de tamanho. */}
          <img src="/faixas/encontros.jpg" alt="" width={736} height={368} />
        </figure>
      )}
    </nav>
  );
}

/** Papel noite ou dia — o do livro, não o do site. */
function BotaoPapel({ papel }: { papel: Papel }) {
  const noite = papel === "noite";
  return (
    <button
      type="button"
      className="folhear-botao hidden sm:inline-flex"
      onClick={() => gravarPapel(noite ? "dia" : "noite")}
      aria-label={noite ? "Livro claro" : "Livro escuro"}
      title={noite ? "Livro claro" : "Livro escuro"}
    >
      {noite ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}

/** O último termo buscado, pra reabrir o painel onde ele estava. */
let ultimoTermo = "";

/**
 * O PAINEL DE BUSCA do livro: procura no texto diagramado e mostra a página
 * de cada achado. Clicar vira o livro até lá e pinta o termo na página.
 *
 * Fica aberto enquanto se clica nos resultados (é assim que se percorre
 * "todas as vezes que o livro fala em Molhado"), sem escurecer o livro atrás.
 */
function PainelDeBusca({
  fluxo,
  paginaDe,
  rotulos,
  aoIr,
  aoFechar,
}: {
  fluxo: React.RefObject<HTMLDivElement | null>;
  paginaDe: (el: Element) => number;
  rotulos: Rotulo[];
  aoIr: (el: Element) => void;
  aoFechar: () => void;
}) {
  const [termo, setTermo] = useState(() => ultimoTermo);
  const [resultado, setResultado] = useState<{ achados: Achado[]; total: number }>(() =>
    ultimoTermo && fluxo.current ? buscarNoLivro(fluxo.current, ultimoTermo, paginaDe) : { achados: [], total: 0 }
  );
  const [escolhido, setEscolhido] = useState<Element | null>(null);
  const espera = useRef(0);
  const campo = useRef<HTMLInputElement>(null);

  const procurar = (t: string) => {
    const f = fluxo.current;
    if (!f) return;
    ultimoTermo = t;
    setResultado(buscarNoLivro(f, t, paginaDe));
    setEscolhido(null);
    realcar(f, t);
  };

  // Ao abrir: foco no campo, e o realce da última busca de volta.
  useEffect(() => {
    campo.current?.focus();
    campo.current?.select();
    if (ultimoTermo && fluxo.current) realcar(fluxo.current, ultimoTermo);
    return () => clearTimeout(espera.current);
  }, [fluxo]);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  const ir = (a: Achado) => {
    setEscolhido(a.el);
    if (fluxo.current) realcar(fluxo.current, termo, a.el);
    aoIr(a.el);
  };

  const onde = (p: number) => {
    const r = rotulos[p];
    return r?.arvoreNome ?? r?.racaNome ?? r?.secao ?? r?.capitulo ?? "";
  };

  let aviso: string;
  if (termo.trim().length < 2) {
    aviso = "Digite ao menos duas letras. A busca procura no texto inteiro do livro, catálogo das árvores incluso.";
  } else if (resultado.total === 0) {
    aviso = "Nada no livro com esse termo.";
  } else {
    const mais = resultado.total > resultado.achados.length ? ` — mostrando ${resultado.achados.length}` : "";
    aviso = `${resultado.total} trecho${resultado.total > 1 ? "s" : ""}${mais}`;
  }

  return (
    <aside id="folhear-busca" className="folhear-busca print-hide" role="search" aria-label="Buscar no livro">
      <div className="folhear-busca-topo">
        <Search className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        <input
          ref={campo}
          type="search"
          value={termo}
          placeholder="Buscar no livro…"
          aria-label="Termo da busca"
          onChange={(e) => {
            const t = e.target.value;
            setTermo(t);
            clearTimeout(espera.current);
            espera.current = window.setTimeout(() => procurar(t), 140);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && resultado.achados[0]) ir(resultado.achados[0]);
          }}
        />
        <button type="button" className="folhear-botao inline-flex" aria-label="Fechar a busca" onClick={aoFechar}>
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <p className="folhear-busca-conta" aria-live="polite">
        {aviso}
      </p>

      <ol className="folhear-busca-lista">
        {resultado.achados.map((a, i) => (
          <li key={i}>
            <button
              type="button"
              className="folhear-busca-item"
              data-titulo={a.titulo ? "" : undefined}
              data-escolhido={escolhido === a.el ? "" : undefined}
              onClick={() => ir(a)}
            >
              <span className="folhear-busca-pagina">{a.pagina + 1}</span>
              <span className="min-w-0">
                <span className="folhear-busca-onde">{onde(a.pagina)}</span>
                <span className="folhear-busca-trecho">
                  {a.antes}
                  <mark>{a.casou}</mark>
                  {a.depois}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {termo.trim().length >= 2 && (
        <Link href={`/busca?q=${encodeURIComponent(termo.trim())}`} className="folhear-busca-site">
          Buscar no site inteiro →
        </Link>
      )}
    </aside>
  );
}

/** A altura do que cobre o topo da janela no modo contínuo: o nav e a barra. */
function alturaDoTopo() {
  const barra = document.querySelector(".folhear-barra")?.getBoundingClientRect().bottom ?? 0;
  return Math.max(0, barra);
}

/** O título que você pediu acende por um instante: "é aqui". */
function destacar(el: Element) {
  el.classList.remove("folhear-destaque");
  // Força o reinício da animação quando o mesmo título é pedido duas vezes.
  void (el as HTMLElement).offsetWidth;
  el.classList.add("folhear-destaque");
  window.setTimeout(() => el.classList.remove("folhear-destaque"), 1600);
}
