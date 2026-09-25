import { normalizarAlinhado } from "@/lib/texto";

/*
 * O `normalizarAlinhado` de lib/texto, rápido o bastante pro livro inteiro.
 *
 * Aquele normaliza caractere por caractere (`.normalize()` + regex em cada
 * um), o que no texto do livro — mais de um milhão de caracteres — levava
 * segundos. Aqui a caixa baixa é nativa, e só os caracteres fora do ASCII
 * passam pela conta, uma vez cada, com o resultado guardado. O contrato é o
 * mesmo: a saída tem exatamente o tamanho da entrada, posição por posição.
 */
const trocas = new Map<string, string>();
function alinhar(texto: string): string {
  const baixo = texto.toLowerCase();
  if (baixo.length !== texto.length) return normalizarAlinhado(texto);
  return baixo.replace(FORA_DO_ASCII, (c) => {
    let t = trocas.get(c);
    if (t === undefined) {
      t = normalizarAlinhado(c);
      trocas.set(c, t);
    }
    return t;
  });
}

const FORA_DO_ASCII = /[^ -~]/g;

/**
 * BUSCA DENTRO DO LIVRO (2026-09-25, pedido do autor: "quando clico na lupa
 * ele vai no /busca; prefiro que mostre no livro onde está o que eu procuro").
 *
 * A busca do site (/busca) acha a FICHA de uma coisa e manda pra ela. Aqui a
 * pergunta é outra — "em que página do livro isto aparece?" —, e a resposta
 * só existe depois da diagramação. Então a busca corre no próprio texto
 * diagramado: cada parágrafo, item, célula e título do livro, com a página em
 * que caiu. O catálogo das árvores está aberto no modo Livro, então as 601
 * habilidades entram também.
 *
 * O texto normalizado (sem acento, sem caixa) é calculado uma vez e guardado;
 * cada tecla só compara strings.
 */

export interface Achado {
  el: Element;
  /** Página (base 0) em que o bloco começa. */
  pagina: number;
  antes: string;
  casou: string;
  depois: string;
  /** O achado é um título (seção, habilidade, árvore): vem primeiro na lista. */
  titulo: boolean;
}

/** Os blocos que a busca lê. Só os "folha": um <li> que tem <p> dentro é lido pelo <p>. */
const BLOCOS =
  "h2, h3, h4, p, li, td, dt, dd, blockquote, summary, .livro-verbete-nome, .livro-ficha-nome, .livro-raca-nome, " +
  // O efeito de uma habilidade que cita condição vira um <span> com botões dentro (ProsaComCondicoes).
  ".livro-verbete > span";
const TITULOS = "h2, h3, h4, summary, .livro-verbete-nome, .livro-ficha-nome, .livro-raca-nome";

interface Indice {
  blocos: { el: Element; texto: string; normal: string; titulo: boolean }[];
}

const indices = new WeakMap<Element, Indice>();

/** Esquece o índice (o texto mudou: abriu um <details>, trocou de modo). */
export function esquecerIndice(fluxo: Element): void {
  indices.delete(fluxo);
}

function indiceDe(fluxo: Element): Indice {
  const pronto = indices.get(fluxo);
  if (pronto) return pronto;
  const todos = Array.from(fluxo.querySelectorAll(BLOCOS));
  // Folha: nenhum outro bloco dentro dele (o texto seria contado duas vezes).
  // Uma passada só: cada bloco marca os ancestrais como "tem bloco dentro".
  const temBlocoDentro = new Set<Element>();
  for (const el of todos) {
    for (let p = el.parentElement; p && p !== fluxo && !temBlocoDentro.has(p); p = p.parentElement) temBlocoDentro.add(p);
  }
  const blocos: Indice["blocos"] = [];
  for (const el of todos) {
    if (temBlocoDentro.has(el)) continue;
    if (el.closest("details:not([open]), .folhear-cabecalho-repetido, [aria-hidden='true']")) continue;
    const texto = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!texto) continue;
    blocos.push({ el, texto, normal: alinhar(texto), titulo: el.matches(TITULOS) });
  }
  const indice = { blocos };
  indices.set(fluxo, indice);
  return indice;
}

/**
 * Os achados, em ordem de leitura, títulos primeiro.
 *
 * @param paginaDe  a página em que um elemento está (vem da régua do livro)
 */
export function buscarNoLivro(
  fluxo: Element,
  termo: string,
  paginaDe: (el: Element) => number,
  limite = 120
): { achados: Achado[]; total: number } {
  const alvo = alinhar(termo.trim());
  if (alvo.trim().length < 2) return { achados: [], total: 0 };
  const achados: Achado[] = [];
  let total = 0;
  for (const b of indiceDe(fluxo).blocos) {
    const i = b.normal.indexOf(alvo);
    if (i < 0) continue;
    total++;
    if (achados.length >= limite * 3) continue;
    const ini = Math.max(0, i - 48);
    const fim = Math.min(b.texto.length, i + alvo.length + 72);
    achados.push({
      el: b.el,
      pagina: paginaDe(b.el),
      antes: (ini > 0 ? "…" : "") + b.texto.slice(ini, i),
      casou: b.texto.slice(i, i + alvo.length),
      depois: b.texto.slice(i + alvo.length, fim) + (fim < b.texto.length ? "…" : ""),
      titulo: b.titulo,
    });
  }
  achados.sort((a, b) => Number(b.titulo) - Number(a.titulo) || a.pagina - b.pagina);
  return { achados: achados.slice(0, limite), total };
}

/*
 * O REALCE, com a Custom Highlight API: pinta o termo no texto sem tocar no
 * DOM (nenhum <mark> inserido, então a diagramação não muda nem um pixel).
 * Onde o navegador não tem a API, a busca continua funcionando — só não pinta.
 */
type ComRealce = { highlights: Map<string, unknown> };
type ConstrutorDeRealce = new (...ranges: Range[]) => unknown;

function api(): { registro: ComRealce; Realce: ConstrutorDeRealce } | null {
  const css = (globalThis as { CSS?: Partial<ComRealce> }).CSS;
  const Realce = (globalThis as { Highlight?: ConstrutorDeRealce }).Highlight;
  if (!css?.highlights || !Realce) return null;
  return { registro: css as ComRealce, Realce };
}

function faixas(raiz: Node, alvo: string, maximo: number): Range[] {
  const saida: Range[] = [];
  const andador = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let n = andador.nextNode() as Text | null; n && saida.length < maximo; n = andador.nextNode() as Text | null) {
    if (n.parentElement?.closest("details:not([open]), [aria-hidden='true']")) continue;
    const normal = alinhar(n.data);
    for (let i = normal.indexOf(alvo); i >= 0 && saida.length < maximo; i = normal.indexOf(alvo, i + alvo.length)) {
      const r = document.createRange();
      r.setStart(n, i);
      r.setEnd(n, i + alvo.length);
      saida.push(r);
    }
  }
  return saida;
}

/** Pinta todas as ocorrências no livro, e com mais força as do bloco escolhido. */
export function realcar(fluxo: Element, termo: string, atual?: Element): void {
  const a = api();
  if (!a) return;
  const alvo = alinhar(termo.trim());
  if (alvo.trim().length < 2) {
    limparRealce();
    return;
  }
  a.registro.highlights.set("busca-livro", new a.Realce(...faixas(fluxo, alvo, 3000)));
  if (atual) a.registro.highlights.set("busca-livro-atual", new a.Realce(...faixas(atual, alvo, 50)));
  else a.registro.highlights.delete("busca-livro-atual");
}

export function limparRealce(): void {
  const a = api();
  if (!a) return;
  a.registro.highlights.delete("busca-livro");
  a.registro.highlights.delete("busca-livro-atual");
}
