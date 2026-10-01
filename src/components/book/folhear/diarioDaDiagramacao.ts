/**
 * O DIÁRIO DA DIAGRAMAÇÃO — 2026-10-01 (Tarefa 11).
 *
 * ## Por que existe
 *
 * Diagramar o modo Livro custa um layout do fluxo inteiro a cada passada que
 * escreve e depois mede: 4,4 s numa máquina rápida, ~30 s num notebook comum
 * (CPU 4× mais lenta). Mas o resultado depende só do HTML do livro, de uma ou
 * duas páginas por vez e das fontes — a página tem tamanho fixo. Abrir o livro
 * de novo refazia exatamente o mesmo trabalho.
 *
 * ## O que ele guarda: o ESTADO FINAL, não a sequência de mutações
 *
 * As passadas não só escrevem atributos: elas movem cartas e linhas de tabela,
 * criam calços, vinhetas, cópias de cabeçalho, e algumas desfazem o que outras
 * fizeram. Repetir a sequência é frágil. Então, durante a diagramação, um
 * MutationObserver só anota QUEM foi mexido; no fim, o diário guarda:
 *
 * - de cada elemento original que teve atributo mexido, o valor FINAL só
 *   desses atributos (um `src` que outra coisa pôs depois não é tocado);
 * - de cada pai original que teve filhos mexidos, a lista FINAL de filhos:
 *   nós originais pelo índice (a ordem do HTML antes da diagramação) e nós
 *   criados descritos por inteiro;
 * - a camada de selos do pé, que mora fora do fluxo.
 *
 * ## O que fica de fora
 *
 * Um pedaço do livro que muda sozinho — a Oficina de Fórmulas embutida diz
 * "Na ficha de Eris…" ou "Crie uma ficha…" conforme a ficha carregou ou não —
 * mudaria a impressão de uma abertura pra outra. Ele leva
 * `data-fora-do-diario`: o retrato conta o elemento, mas não entra nele. Só
 * serve pra pedaço que NÃO pesa na diagramação (a oficina embutida nem aparece
 * no modo Livro); se uma passada mexer lá dentro, o diário não é gravado.
 *
 * ## Como ele é usado
 *
 * A chave é uma impressão do fluxo ANTES da diagramação (estrutura e texto) e
 * uma ou duas páginas: mudou uma vírgula do livro, o diário velho não serve.
 * Ao reabrir, o diário é aplicado, a paginação é medida UMA vez (um layout em
 * vez de dezenas) e a assinatura — a coluna de cada título, carta, tabela e
 * figura — é comparada com a gravada. Se não bater (outra máquina
 * quebrando linha diferente, por exemplo), tudo é desfeito exatamente como
 * estava e a diagramação roda do zero.
 */

const VERSAO = 2;
/** A versão do motor (next.config.ts): passada ou CSS mudou, diário velho não vale. */
const MOTOR = process.env.VERSAO_DA_DIAGRAMACAO ?? "sem-versao";
/**
 * Desliga o uso do diário (a gravação continua). A revisão do livro liga isto:
 * ela tem que conferir a diagramação de verdade, não o diário.
 */
const DESLIGADO = "livro-folhear-diario-desligado";
const CHAVE = (porDupla: number) => `livro-folhear-diario:v${VERSAO}:${porDupla}`;
/** Acima disso o diário não vale o localStorage que ocupa. */
const TETO_DE_BYTES = 3_000_000;
const XHTML = "http://www.w3.org/1999/xhtml";

/** Um nó do diário: original (pelo índice), texto, ou elemento criado. */
type No = number | string | { t: string; ns?: string; a: [string, string][]; c: No[] };

export interface Diario {
  v: number;
  porDupla: number;
  motor: string;
  impressao: string;
  /** [índice, [[atributo, valor final ou null], ...]] */
  atributos: [number, [string, string | null][]][];
  /** [índice do pai, filhos finais] */
  filhos: [number, No[]][];
  /** A camada `.folhear-pes`, se houver. */
  pes: string | null;
  assinatura: string;
}

/**
 * Os elementos e textos do fluxo, na ordem do documento (o fluxo é o 0), e a
 * impressão deles. Comentários ficam de fora: são marcadores do React que não
 * pesam no layout, e o build de produção tem alguns a mais que o servidor de
 * desenvolvimento — sem eles, o diário gravado na revisão vale pros dois.
 */
export interface Retrato {
  nos: Node[];
  impressao: string;
}

export const FORA_DO_DIARIO = "data-fora-do-diario";

export function retratar(fluxo: Element): Retrato {
  const nos: Node[] = [fluxo];
  const w = document.createTreeWalker(fluxo, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  // FNV-1a em duas sementes: colisão de 64 bits é coisa de outro universo.
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x5bd1e995;
  const mistura = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      a = Math.imul(a ^ c, 0x01000193);
      b = Math.imul(b ^ c, 0x5bd1e995);
    }
    a = Math.imul(a ^ 31, 0x01000193);
  };
  let n: Node | null = w.nextNode();
  while (n) {
    nos.push(n);
    if (n.nodeType === 1) {
      // As classes também: trocar `text-sm` por `text-base` muda a diagramação
      // sem mudar texto nenhum. As `folhear-*` o próprio livro liga e desliga
      // depois de pronto (a página visível, por exemplo), então ficam fora.
      const classes = (n as Element).getAttribute("class");
      mistura((n as Element).tagName + (classes ? classes.split(/\s+/).filter((c) => !c.startsWith("folhear-")).join(" ") : ""));
    } else mistura((n as Text).data);
    if (n.nodeType === 1 && (n as Element).hasAttribute(FORA_DO_DIARIO)) {
      // Pula o miolo: o próximo é o irmão seguinte, ou o de um ancestral.
      n = w.nextSibling();
      while (!n && w.parentNode()) n = w.nextSibling();
    } else n = w.nextNode();
  }
  return { nos, impressao: `${nos.length}.${(a >>> 0).toString(36)}.${(b >>> 0).toString(36)}` };
}

/** As peças que a assinatura confere (a mesma lista da régua `medir:folhear`). */
const PECAS = "h2, h3, h4, .livro-verbete, .livro-tabela, figure";

/**
 * A assinatura da diagramação: em que coluna (e portanto página) cai cada
 * título, carta, tabela e figura — o mesmo critério do `revisar:livro
 * --assinatura`. A altura dentro da coluna fica de fora de propósito: vídeo só
 * diz a própria altura quando os metadados chegam, e isso varia alguns pixels
 * de uma abertura pra outra mesmo sem diário (medido em 2026-10-01, na carta
 * logo abaixo da Maestria da Água).
 */
export function assinar(fluxo: Element, faixa: HTMLElement, pagina: number): string {
  const caixa = faixa.getBoundingClientRect();
  const k = faixa.offsetWidth > 0 ? caixa.width / faixa.offsetWidth : 1;
  return Array.from(fluxo.querySelectorAll(PECAS), (el) => {
    // O fiapo de borda que sobra no pé de uma coluna não conta, e o limiar é
    // em pixels de PÁGINA: em pixels de tela ele mudaria com a escala da
    // janela, e a mesma carta "mudaria de coluna" de um monitor pro outro.
    const q = Array.from(el.getClientRects()).find((r) => r.height / k > 2);
    // Pelo miolo do primeiro pedaço, não pela borda: a arte que sangra até a
    // borda da página começa exatamente na divisa entre colunas, e a escala
    // do livro (transform) faz a borda oscilar uma fração de pixel pra lá ou
    // pra cá entre uma abertura e outra.
    return q ? String(Math.floor(((q.left - caixa.left) / k + Math.min(q.width / k / 2, 40)) / (pagina / 2))) : "x";
  }).join(",");
}

/** A primeira peça (base 1) em que duas assinaturas discordam, ou 0. */
export function primeiraDiferenca(a: string, b: string): number {
  const x = a.split(",");
  const y = b.split(",");
  for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) return i + 1;
  return 0;
}

/** Anota quem as passadas mexem; no fim, escreve o diário. */
export function gravar(fluxo: Element, retrato: Retrato) {
  const mexidos = new Map<Element, Set<string>>();
  const pais = new Set<Node>();
  // Texto mexido não cabe no diário (ele guarda atributos e filhos): se alguma
  // passada um dia fizer isso, o diário simplesmente não é gravado.
  let mexeuEmTexto = false;
  const deFora = (n: Node) => (n.nodeType === 1 ? (n as Element) : n.parentElement)?.parentElement?.closest(`[${FORA_DO_DIARIO}]`);
  const anotar = (rs: MutationRecord[]) => {
    for (const r of rs) {
      if (r.type === "attributes") {
        const el = r.target as Element;
        let s = mexidos.get(el);
        if (!s) mexidos.set(el, (s = new Set()));
        s.add(r.attributeName!);
      } else if (r.type === "childList") pais.add(r.target);
      else mexeuEmTexto = true;
    }
  };
  const mo = new MutationObserver(anotar);
  mo.observe(fluxo, { subtree: true, attributes: true, childList: true, characterData: true });

  return {
    /** Para de anotar e devolve o diário (sem a assinatura, que vem depois do layout). */
    terminar(porDupla: number): Omit<Diario, "assinatura"> | null {
      anotar(mo.takeRecords());
      mo.disconnect();
      if (mexeuEmTexto) return null;
      for (const el of mexidos.keys()) if (deFora(el)) return null;
      for (const pai of pais) if (pai.nodeType === 1 && (pai as Element).closest(`[${FORA_DO_DIARIO}]`)) return null;
      const indice = new Map<Node, number>();
      retrato.nos.forEach((n, i) => indice.set(n, i));

      const descrever = (n: Node): No | null => {
        const i = indice.get(n);
        if (i !== undefined) return i;
        if (n.nodeType === 3) return (n as Text).data;
        if (n.nodeType !== 1) return null;
        const el = n as Element;
        const c: No[] = [];
        el.childNodes.forEach((f) => {
          const d = descrever(f);
          if (d !== null) c.push(d);
        });
        return {
          t: el.localName,
          ...(el.namespaceURI && el.namespaceURI !== XHTML ? { ns: el.namespaceURI } : {}),
          a: Array.from(el.attributes, (x) => [x.name, x.value] as [string, string]),
          c,
        };
      };

      const atributos: Diario["atributos"] = [];
      mexidos.forEach((nomes, el) => {
        const i = indice.get(el);
        // Elemento criado pelas passadas: o atributo já vai na descrição dele.
        if (i === undefined || !fluxo.contains(el)) return;
        atributos.push([i, Array.from(nomes, (nome) => [nome, el.getAttribute(nome)] as [string, string | null])]);
      });
      const filhos: Diario["filhos"] = [];
      pais.forEach((pai) => {
        const i = indice.get(pai);
        if (i === undefined || !fluxo.contains(pai)) return;
        const lista: No[] = [];
        pai.childNodes.forEach((f) => {
          const d = descrever(f);
          if (d !== null) lista.push(d);
        });
        filhos.push([i, lista]);
      });
      return {
        v: VERSAO,
        porDupla,
        motor: MOTOR,
        impressao: retrato.impressao,
        atributos,
        filhos,
        pes: fluxo.parentElement?.querySelector(":scope > .folhear-pes")?.outerHTML ?? null,
      };
    },
    /** Desliga sem gravar (a diagramação foi interrompida). */
    abandonar() {
      mo.disconnect();
    },
  };
}

/**
 * Aplica o diário sobre o fluxo intocado. Devolve a função que desfaz tudo
 * (exatamente o estado de antes), ou null se o diário não casa com o fluxo.
 */
export function aplicar(diario: Diario, fluxo: Element, retrato: Retrato): (() => void) | null {
  const { nos } = retrato;
  const fora = (i: number) => !Number.isInteger(i) || i < 0 || i >= nos.length;
  if (diario.atributos.some(([i]) => fora(i) || nos[i].nodeType !== 1)) return null;
  if (diario.filhos.some(([i]) => fora(i))) return null;

  // O que vai ser desfeito, lido ANTES de mexer.
  const antesAtributos = diario.atributos.map(([i, pares]) => {
    const el = nos[i] as Element;
    return [el, pares.map(([nome]) => [nome, el.getAttribute(nome)] as [string, string | null])] as const;
  });
  const antesFilhos = diario.filhos.map(([i]) => [nos[i], Array.from(nos[i].childNodes)] as const);

  let invalido = false;
  const criar = (d: No): Node => {
    if (typeof d === "number") {
      if (fora(d)) invalido = true;
      return nos[d] ?? document.createTextNode("");
    }
    if (typeof d === "string") return document.createTextNode(d);
    const el = d.ns ? document.createElementNS(d.ns, d.t) : document.createElement(d.t);
    for (const [nome, valor] of d.a) el.setAttribute(nome, valor);
    for (const f of d.c) el.appendChild(criar(f));
    return el;
  };
  const listas = diario.filhos.map(([i, lista]) => [nos[i], lista.map(criar)] as const);
  if (invalido) return null;

  for (const [pai, lista] of listas) {
    // Os comentários do pai (marcadores do React) continuam lá, no fim.
    const comentarios = Array.from(pai.childNodes).filter((n) => n.nodeType === 8);
    (pai as Element).replaceChildren(...lista, ...comentarios);
  }
  for (const [i, pares] of diario.atributos) {
    const el = nos[i] as Element;
    for (const [nome, valor] of pares) {
      if (valor === null) el.removeAttribute(nome);
      else el.setAttribute(nome, valor);
    }
  }
  const faixa = fluxo.parentElement;
  faixa?.querySelector(":scope > .folhear-pes")?.remove();
  if (diario.pes && faixa) faixa.insertAdjacentHTML("beforeend", diario.pes);

  return () => {
    faixa?.querySelector(":scope > .folhear-pes")?.remove();
    for (const [pai, lista] of antesFilhos) (pai as Element).replaceChildren(...lista);
    for (const [el, pares] of antesAtributos) {
      for (const [nome, valor] of pares) {
        if (valor === null) el.removeAttribute(nome);
        else el.setAttribute(nome, valor);
      }
    }
  };
}

/*
 * O DIÁRIO QUE VEM COM O LIVRO. A revisão (`npm run revisar:livro`) grava o
 * diário de cada geometria em `public/livro/diagramacao-<1|2>.json`, então a
 * primeira visita também abre sem diagramar — se a impressão bater com o livro
 * publicado (o JSON ficou velho? é ignorado) e se a conferência passar neste
 * navegador (medido em 2026-10-01: passa em Chrome 152 e 154, em janelas de
 * 1280 a 1920 px e densidade 1 e 2). Não bateu, a diagramação roda inteira e
 * este navegador grava o diário dele.
 */
const doLivro = new Map<number, Promise<void>>();
const prontosDoLivro = new Map<number, Diario | null>();

/** Baixa o diário do livro pra uma geometria (uma vez por página aberta). */
export function buscarDiarioDoLivro(porDupla: number): Promise<void> {
  let busca = doLivro.get(porDupla);
  if (!busca) {
    busca = fetch(`/livro/diagramacao-${porDupla}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Diario>) : null))
      .catch(() => null)
      .then((d) => void prontosDoLivro.set(porDupla, d && d.v === VERSAO && d.motor === MOTOR && d.porDupla === porDupla ? d : null));
    doLivro.set(porDupla, busca);
  }
  return busca;
}

/** O diário do livro, se já chegou e casa com o livro intocado. */
export function diarioDoLivro(porDupla: number, impressao: string): Diario | null {
  if (diarioDesligado()) return null;
  const d = prontosDoLivro.get(porDupla);
  return d && d.impressao === impressao ? d : null;
}

/** Já há diário deste navegador pra esta geometria (de qualquer versão do livro)? */
export function temDiarioProprio(porDupla: number): boolean {
  try {
    return diarioDesligado() || localStorage.getItem(CHAVE(porDupla)) !== null;
  } catch {
    return false;
  }
}

export function diarioDesligado(): boolean {
  try {
    return localStorage.getItem(DESLIGADO) === "1";
  } catch {
    return false;
  }
}

export function lerDiario(porDupla: number, impressao: string): Diario | null {
  if (diarioDesligado()) return null;
  try {
    const bruto = localStorage.getItem(CHAVE(porDupla));
    if (!bruto) return null;
    const d = JSON.parse(bruto) as Diario;
    return d.v === VERSAO && d.motor === MOTOR && d.porDupla === porDupla && d.impressao === impressao ? d : null;
  } catch {
    return null;
  }
}

export function guardarDiario(d: Diario): void {
  try {
    const bruto = JSON.stringify(d);
    if (bruto.length * 2 > TETO_DE_BYTES) return;
    localStorage.setItem(CHAVE(d.porDupla), bruto);
  } catch {
    // Sem espaço ou sem localStorage: o livro só não abre mais rápido da próxima vez.
  }
}

export function esquecerDiario(porDupla: number): void {
  try {
    localStorage.removeItem(CHAVE(porDupla));
  } catch {
    // nada a fazer
  }
}
