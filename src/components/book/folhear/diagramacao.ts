import type { TocEntry } from "../BookToc";

/**
 * A matemática do livro folheado, separada do componente pra poder ser testada
 * sem navegador (a geometria) e lida sem React (a medição).
 *
 * ## Página de tamanho FIXO (2026-09-24, segunda versão)
 *
 * A primeira versão recalculava a página pro tamanho da tela e subia a letra
 * pra 16–18px — legível, mas lia como site. O autor pôs o Livro do Jogador de
 * D&D no AnyFlip do lado e a diferença era essa: livro de verdade tem página
 * de tamanho fixo, duas colunas, letra densa, e quem se adapta à tela é o
 * ZOOM, não a diagramação.
 *
 * Então a página agora é uma folha Carta (8,5 × 11 pol. a 96 dpi), diagramada
 * uma vez só, e o livro inteiro é escalado pra caber no palco. De brinde, o
 * número da página passa a ser o mesmo em qualquer aparelho: "página 42" volta
 * a ser um endereço que a mesa pode falar em voz alta.
 */

export const PAGINA = {
  largura: 816,
  altura: 1056,
  /** Margem lateral (a mesma dos dois lados: ver as colunas externas em globals.css). */
  margem: 60,
  topo: 62,
  /** Margem de baixo, onde moram o número e o rótulo da parte. */
  pe: 84,
  /** O vão entre as duas colunas de texto de uma página. */
  calha: 26,
  /** Corpo do texto — ~10pt, a densidade do livro impresso. */
  fonte: 13.6,
} as const;

/** A capa de couro que aparece em volta das folhas. */
export const CAPA = 12;

/** Degraus do zoom, multiplicando o "caber na tela". */
export const ZOOMS = [1, 1.35, 1.75, 2.25];

export interface Geometria {
  pagina: number;
  altura: number;
  margem: number;
  topo: number;
  pe: number;
  calha: number;
  fonte: number;
  porDupla: 1 | 2;
  /** A escala que faz o livro inteiro caber no palco. */
  escala: number;
  /** Largura e altura do livro sem escala (folhas + capa). */
  larguraDoLivro: number;
  alturaDoLivro: number;
}

/**
 * Uma ou duas páginas, e a escala que faz o livro caber no palco.
 * Nada aqui mexe no tamanho da
 * letra dentro da página: isso é o que mantém a diagramação idêntica em toda
 * tela.
 */
export function calcularGeometria(largura: number, altura: number): Geometria {
  // Espaço pras setas laterais (no desktop, também pro botão de dados).
  const lateral = largura >= 1100 ? 72 : largura >= 768 ? 48 : 8;
  const w = Math.max(200, largura - lateral * 2);
  const h = Math.max(200, altura - 16);

  const escalaDe = (paginas: number) =>
    Math.min(w / (paginas * PAGINA.largura + CAPA * 2), h / (PAGINA.altura + CAPA * 2));
  // Dupla sempre que ela custar pouco: se mostrar duas páginas encolhe o
  // livro menos de 20%, é livro aberto. Em tela baixa quem limita é a altura,
  // e aí uma página sairia do MESMO tamanho que duas, só com mesa vazia do
  // lado. Em pé (tablet, celular) a dupla encolheria pela metade: uma página.
  const porDupla: 1 | 2 = escalaDe(2) >= escalaDe(1) * 0.8 ? 2 : 1;
  const escala = Math.floor(escalaDe(porDupla) * 1000) / 1000;

  return {
    pagina: PAGINA.largura,
    altura: PAGINA.altura,
    margem: PAGINA.margem,
    topo: PAGINA.topo,
    pe: PAGINA.pe,
    calha: PAGINA.calha,
    fonte: PAGINA.fonte,
    porDupla,
    escala,
    larguraDoLivro: porDupla * PAGINA.largura + CAPA * 2,
    alturaDoLivro: PAGINA.altura + CAPA * 2,
  };
}

/** Largura de UMA coluna de texto, dentro da página. */
export function larguraDaColuna(g: Pick<Geometria, "pagina" | "margem" | "calha">): number {
  return (g.pagina - g.margem * 2 - g.calha) / 2;
}

export interface Rotulo {
  capitulo?: string;
  /** O id do capítulo (cap4) — a cor da página sai dele. */
  capituloId?: string;
  /** A árvore do catálogo que ocupa a página (fogo, deus-da-espada…): a cor e o kanji dela. */
  arvoreId?: string;
  arvoreNome?: string;
  /** A família da árvore (magia, corpo, utilidade): o caos de reserva de árvore sem tema próprio. */
  arvoreFamilia?: string;
  /** A raça dona da página (cada raça tem uma página inteira no Cap. 1): a cor e o kanji dela. */
  racaId?: string;
  racaNome?: string;
  secao?: string;
  /** Página de abertura (sumário, folha de rosto de capítulo): sem rótulo no rodapé. */
  abertura: boolean;
}

export interface Paginacao {
  /** Páginas com conteúdo. */
  total: number;
  /** Um por página. */
  rotulos: Rotulo[];
  /** id da âncora → página (base 0). */
  paginaDe: Record<string, number>;
}

/**
 * Onde a faixa de páginas começa na tela, e quanto a tela encolheu o livro.
 *
 * O livro é escalado com `transform`, então `getBoundingClientRect` devolve
 * pixels de TELA; a diagramação vive em pixels de PÁGINA. Toda medida passa
 * por aqui pra voltar pro sistema da página.
 */
export interface Regua {
  origem: number;
  k: number;
}

export function regua(faixa: HTMLElement): Regua {
  const r = faixa.getBoundingClientRect();
  return { origem: r.left, k: faixa.offsetWidth > 0 ? r.width / faixa.offsetWidth : 1 };
}

/**
 * Em que página está um elemento.
 *
 * Um bloco partido entre duas páginas devolve a união dos pedaços, e o `left`
 * da união é a página onde ele COMEÇA — que é a que interessa.
 */
export function paginaDoElemento(el: Element, r: Regua, g: Pick<Geometria, "pagina">): number {
  return Math.max(0, Math.floor((el.getBoundingClientRect().left - r.origem) / r.k / g.pagina));
}

/**
 * O que está dentro de um <details> fechado não existe pra leitura.
 *
 * O Chrome não esconde mais esse conteúdo com `display: none`: ele usa
 * `content-visibility: hidden` (pra busca da página achar texto lá dentro), e
 * aí os elementos respondem a `getBoundingClientRect` com posições de um
 * layout que ninguém vê. Contá-los quebrava a busca do lugar de leitura.
 */
export function visivel(el: Element): boolean {
  return !el.closest("details:not([open])");
}

/** Os blocos em que a leitura pode "estar": é por eles que o lugar é guardado. */
const SELETOR_BLOCOS = "h2, h3, h4, p, li, tr:not(.folhear-cabecalho-repetido), figure, .livro-caixa";

/**
 * O primeiro bloco (em ordem de leitura) que satisfaz `passou`.
 *
 * Busca binária: a ordem do DOM é a ordem das páginas, então `passou` é
 * monotônico e bastam ~12 medições num livro de milhares de blocos.
 */
export function primeiroBloco(fluxo: Element, passou: (el: Element) => boolean): Element | null {
  const lista = Array.from(fluxo.querySelectorAll<HTMLElement>(SELETOR_BLOCOS)).filter(
    (el) => el.offsetParent !== null && visivel(el)
  );
  let baixo = 0;
  let alto = lista.length - 1;
  let achado: Element | null = null;
  while (baixo <= alto) {
    const meio = (baixo + alto) >> 1;
    if (passou(lista[meio])) {
      achado = lista[meio];
      alto = meio - 1;
    } else {
      baixo = meio + 1;
    }
  }
  return achado;
}

/**
 * Caixa CURTA não se parte entre colunas; caixa LONGA pode.
 *
 * CSS não sabe dizer "evite partir, se for pequena": `break-inside: avoid` em
 * toda caixa empurraria cada caixa média pra coluna seguinte e deixaria meia
 * coluna em branco atrás dela. Então a primeira diagramação deixa o navegador
 * partir o que quiser, e aqui as caixas que saíram partidas mas cabem folgadas
 * numa coluna (menos de 40% da altura) ganham `folhear-inteira` e são
 * recompostas inteiras.
 */
export function segurarCaixasCurtas(fluxo: Element, g: Geometria, r: Regua): void {
  fluxo.querySelectorAll(".folhear-inteira").forEach((el) => el.classList.remove("folhear-inteira"));
  const limite = (g.altura - g.topo - g.pe) * 0.4;
  const partidas: Element[] = [];
  fluxo.querySelectorAll(".livro-caixa").forEach((el) => {
    if (!visivel(el)) return;
    const pedacos = el.getClientRects();
    if (pedacos.length < 2) return;
    let altura = 0;
    for (const p of pedacos) altura += p.height / r.k;
    if (altura < limite) partidas.push(el);
  });
  partidas.forEach((el) => el.classList.add("folhear-inteira"));
}

/**
 * Tabela larga demais pra coluna: aperta, em dois degraus.
 *
 * A coluna do livro tem ~340px, e tabela de cinco colunas (a do Vigor) não
 * cabe nem com a célula mais justa. O primeiro degrau diminui a letra SÓ
 * daquela tabela; o segundo deixa a palavra quebrar na borda da célula. Feio
 * é melhor que cortado — uma tabela invadindo a coluna vizinha é o defeito
 * que o plano proíbe.
 *
 * A largura é a do PRIMEIRO pedaço: uma tabela partida entre duas colunas
 * devolve a união dos pedaços.
 */
export function ajustarTabelasLargas(fluxo: Element, g: Geometria, r: Regua): void {
  const degraus = ["folhear-tabela-justa", "folhear-tabela-apertada"];
  fluxo.querySelectorAll("table").forEach((t) => t.classList.remove(...degraus));
  // Tabela que atravessa a página (ver espalharTabelasEspremidas) tem a
  // largura da página inteira; as outras, a de uma coluna.
  const limite = (t: Element) =>
    (t.closest(".folhear-larga") ? g.pagina - g.margem * 2 : larguraDaColuna(g)) + 1;
  const larga = (t: Element) => (t.getClientRects()[0]?.width ?? 0) / r.k > limite(t);
  for (const degrau of degraus) {
    const largas = Array.from(fluxo.querySelectorAll("table")).filter((t) => visivel(t) && larga(t));
    if (largas.length === 0) return;
    largas.forEach((t) => t.classList.add(degrau));
  }
}

/**
 * Diagrama que não cabe numa coluna atravessa a página inteira.
 *
 * Os diagramas nasceram pro contínuo, com ~700px de largura; alguns (a Ordem
 * do Dano, com cinco cartões lado a lado) rolam de lado numa coluna de livro.
 * O impresso resolve isso pondo a figura larga no alto ou no pé da página, de
 * margem a margem — é o `column-span: all` da classe `folhear-larga`.
 */
export function ajustarFigurasLargas(fluxo: Element): void {
  fluxo.querySelectorAll(".folhear-larga").forEach((el) => el.classList.remove("folhear-larga"));
  const diagramas = Array.from(fluxo.querySelectorAll<HTMLElement>("figure.diagrama")).filter(visivel);
  diagramas.forEach((fig) => (fig.style.zoom = ""));
  /** Quanto o conteúdo mais largo do diagrama passa da largura que ele tem. */
  const sobra = (fig: HTMLElement) => {
    let pior = 1;
    fig.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) pior = Math.max(pior, el.scrollWidth / el.clientWidth);
    });
    return pior;
  };
  const largas = diagramas.filter((fig) => sobra(fig) > 1);
  largas.forEach((fig) => fig.classList.add("folhear-larga"));
  // Mesmo de margem a margem, alguns diagramas têm largura mínima maior que a
  // página (a Ordem do Dano, o Tiro Perfeito). Esses encolhem por inteiro,
  // proporcionais, em vez de cortar o último quadro fora da página.
  largas.forEach((fig) => {
    const s = sobra(fig);
    if (s > 1) fig.style.zoom = String(Math.max(0.6, Math.floor((1 / s) * 100) / 100));
  });
}

/**
 * Tabela espremida numa coluna atravessa a página inteira.
 *
 * Uma coluna de livro tem ~335px. Tabela de quatro colunas ou mais — a dos
 * Antecedentes, a do Vigor — cabia ali só virando torre: a coluna "Efeito"
 * com 90px e cada linha com vinte linhas de texto. O impresso resolve do
 * jeito de sempre: a tabela larga vai de margem a margem (`column-span: all`),
 * e o texto em volta continua em duas colunas acima e abaixo dela.
 *
 * Também atravessa a tabela de poucas colunas que ainda saiu com alguma linha
 * mais alta que sete linhas de texto. Não mexe em tabela dentro de caixa,
 * verbete ou catálogo de árvore: lá dentro ela não pode sair da caixa.
 */
export function espalharTabelasEspremidas(fluxo: Element, g: Geometria, r: Regua): void {
  fluxo
    .querySelectorAll(".livro-tabela.folhear-larga, .livro-caixa.folhear-larga")
    .forEach((el) => el.classList.remove("folhear-larga"));
  const alturaMaxima = g.fonte * 1.3 * 7;
  const espremidas = Array.from(fluxo.querySelectorAll<HTMLElement>(".livro-tabela")).filter((caixa) => {
    if (!visivel(caixa) || caixa.closest(".livro-arvore, .livro-verbete, .livro-maestria, .livro-catalogo-itens"))
      return false;
    // Tabela dentro de uma caixa de regra: se ela for espremida, quem
    // atravessa a página é a caixa inteira (a tabela não pode sair dela).
    const dentroDeCaixa = caixa.closest(".livro-caixa");
    if (dentroDeCaixa && dentroDeCaixa.closest(".livro-caixa .livro-caixa")) return false;
    const tabela = caixa.querySelector("table");
    if (!tabela) return false;
    const colunas = tabela.tHead?.rows[0]?.cells.length ?? tabela.rows[0]?.cells.length ?? 0;
    if (colunas >= 4) return true;
    return Array.from(tabela.tBodies[0]?.rows ?? []).some((tr) => tr.getBoundingClientRect().height / r.k > alturaMaxima);
  });
  espremidas.forEach((caixa) => (caixa.closest(".livro-caixa") ?? caixa).classList.add("folhear-larga"));
}

/**
 * TÍTULO NUNCA FICA SEPARADO DO TEXTO DELE.
 *
 * O CSS pede `break-after: avoid` em todo título, mas o Chrome só obedece
 * quando acha outro lugar pra quebrar — e desiste calado quando o que vem
 * depois é uma tabela, uma arte ou uma caixa que não cabem no resto da
 * coluna. Aí sobrava "3. Economia de Ações" sozinho no pé da página e o texto
 * na seguinte: o defeito que o autor apontou como obrigatório.
 *
 * Então, depois da diagramação, cada título é conferido: se o começo do que
 * vem depois dele caiu numa coluna mais à direita, o título vai junto
 * (`break-before: column`). Título que abre uma caixa, um verbete, uma tabela
 * ou uma árvore leva o bloco INTEIRO — empurrar só o título partiria a caixa.
 * Um empurrão pode criar outro caso mais adiante, por isso a conferência
 * repete até zerar (ver Folhear.tsx).
 *
 * @returns quantos blocos foram empurrados nesta passada
 */
const SELETOR_TITULOS = [
  "h3",
  "h4",
  ".livro-arvore-cabeca",
  ".livro-verbete > div:first-child",
  ":is(.livro-caixa, .livro-maestria, .livro-proficiencias) > p:first-child",
  ".livro-mecanica > div:first-child",
  ".livro-tabela thead",
].join(", ");

const BLOCOS_COM_TITULO =
  ".livro-caixa, .livro-maestria, .livro-proficiencias, .livro-mecanica, .livro-verbete, .livro-tabela, .livro-arvore";

/** `t` abre `bloco`? (cada passo do caminho é o primeiro filho) */
function abre(bloco: Element, t: Element): boolean {
  for (let n: Element | null = t; n && n !== bloco; n = n.parentElement) {
    if (n.parentElement?.firstElementChild !== n) return false;
  }
  return true;
}

/** O que vem depois de `t` na ordem de leitura, pulando o que não aparece. */
function seguinte(t: Element, fluxo: Element): Element | null {
  let n: Element | null = t;
  while (n && n !== fluxo) {
    let irmao = n.nextElementSibling;
    while (irmao && !Array.from(irmao.getClientRects()).some((r) => r.height > 1)) irmao = irmao.nextElementSibling;
    if (irmao) return irmao;
    n = n.parentElement;
  }
  return null;
}

export function segurarTitulos(fluxo: Element, g: Geometria, r: Regua): number {
  // Em que coluna (contando as duas de cada página) um retângulo está. Não
  // dá pra comparar só o `left`: o carimbo das caixas é torto e deslocado,
  // e sai uns pixels à esquerda do texto da mesma coluna.
  const coluna = (q: DOMRect) => {
    const x = (q.left - r.origem) / r.k + Math.min(q.width / r.k / 2, 40);
    const pagina = Math.floor(x / g.pagina);
    return pagina * 2 + (x - pagina * g.pagina > g.pagina / 2 ? 1 : 0);
  };
  const empurrar = new Set<Element>();
  fluxo.querySelectorAll(SELETOR_TITULOS).forEach((t) => {
    // A página de raça é uma página inteira de altura fixa: o título dela não
    // tem como ficar longe do texto, e a leitura japonesa à direita do nome
    // enganaria a conferência (ela mora na metade direita da página).
    if (!visivel(t) || t.closest(".livro-abertura, .folhear-sumario, .folhear-rosto, .folhear-colofao, .livro-raca")) return;
    const rt = t.getClientRects();
    if (rt.length === 0) return;
    const titulo = rt[rt.length - 1];
    const depois = seguinte(t, fluxo);
    if (!depois) return;
    const comeco = Array.from(depois.getClientRects()).find((r) => r.height > 1);
    if (!comeco || coluna(comeco) <= coluna(titulo)) return;
    // Antes de uma tabela ou figura que atravessa a página, empurrar o título
    // pra próxima COLUNA não adianta (a tabela está na próxima PÁGINA): o
    // título passa a atravessar a página também, e anda junto com ela. Se
    // ainda assim ficar pra trás, a próxima passada empurra — e empurrar algo
    // que atravessa a página é mandá-lo pra página seguinte.
    if (t.matches("h3, h4") && depois.matches(".folhear-larga, .livro-prancha:not(.livro-prancha-coluna, .folhear-prancha-coluna)") && !t.classList.contains("folhear-larga")) {
      t.classList.add("folhear-larga");
      empurrar.add(t);
      return;
    }
    const bloco = t.closest(BLOCOS_COM_TITULO);
    empurrar.add(bloco && abre(bloco, t) ? bloco : t);
  });
  // TABELA QUE ABRE NO PÉ DA COLUNA com o cabeçalho e uma ou duas linhas: é o
  // título órfão das tabelas. Ela desce inteira, pelos mesmos degraus.
  fluxo.querySelectorAll(".livro-tabela").forEach((caixa) => {
    if (!visivel(caixa) || caixa.closest(".livro-catalogo-itens")) return;
    const linhas = Array.from(caixa.querySelectorAll("tbody tr:not(.folhear-cabecalho-repetido)"));
    if (linhas.length < 4) return;
    const primeira = linhas[0].getClientRects()[0];
    if (!primeira) return;
    const c0 = coluna(primeira);
    let juntas = 0;
    for (const l of linhas) {
      const q = l.getClientRects()[0];
      if (!q || coluna(q) !== c0) break;
      juntas++;
    }
    if (juntas < 3) empurrar.add(caixa);
  });

  // Título empurrado leva o bloco seguinte junto: uma quebra própria do bloco
  // (a tabela que "descia inteira" do pé da coluna) separaria os dois de novo
  // — o subtítulo "As peças" da Teórica ficava sozinho por isso.
  empurrar.forEach((el) => {
    if (!el.matches("h3, h4")) return;
    const prox = seguinte(el, fluxo);
    if (!prox) return;
    empurrar.delete(prox);
    prox.classList.remove("folhear-empurra");
  });

  // Cada caso sobe um degrau por passada, e só conta como mudança se subiu:
  // 1) título antes de algo que atravessa a página passa a atravessar também;
  // 2) o bloco vai pra próxima coluna;
  // 3) se nem assim (a faixa curta abaixo de uma tabela de página inteira,
  //    onde a próxima coluna ainda é a mesma página), o bloco fica inteiro e
  //    anda junto pra próxima página.
  const alturaDaColuna = g.altura - g.topo - g.pe;
  const cabeNumaColuna = (el: Element) => {
    let altura = 0;
    for (const q of el.getClientRects()) altura += q.height / r.k;
    return altura < alturaDaColuna * 0.9;
  };
  /*
   * O último degrau: um CALÇO. Quando o bloco começa numa faixa curta logo
   * abaixo de algo que atravessa a página (a tabela de Vigor, por exemplo),
   * nenhuma quebra forçada funciona — o Chrome ignora quebra no começo de
   * uma faixa. Então entra um bloco vazio que ocupa o resto das duas colunas
   * da faixa, e o bloco começa inteiro na página seguinte. É o que o
   * diagramador faria à mão: deixar o pé da página em branco.
   */
  const topoDoFluxo = fluxo.getBoundingClientRect().top;
  const calcar = (el: Element) => {
    const q = el.getClientRects()[0];
    if (!q) return;
    const margem = parseFloat(getComputedStyle(el).marginTop) || 0;
    const inicioDaFaixa = (q.top - topoDoFluxo) / r.k - margem;
    const resto = alturaDaColuna - inicioDaFaixa;
    if (resto <= 0 || resto > alturaDaColuna * 0.5) return;
    const calco = document.createElement("div");
    calco.className = "folhear-calco";
    calco.setAttribute("aria-hidden", "true");
    calco.style.height = `${Math.ceil(resto * 2 + 2)}px`;
    el.before(calco);
    // O calço substitui a quebra: com as duas, o bloco pularia duas vezes.
    el.classList.remove("folhear-empurra");
    el.classList.add("folhear-calcado");
  };
  let mudou = 0;
  empurrar.forEach((el) => {
    const c = el.classList;
    if (el.matches("h3, h4") && c.contains("folhear-larga") && !c.contains("folhear-titulo-largo")) c.add("folhear-titulo-largo");
    else if (!c.contains("folhear-empurra")) {
      c.add("folhear-empurra");
      // Um empurrão de uma passada anterior DENTRO do bloco (o quadro da
      // mecânica de uma árvore, por exemplo) ficou velho: o bloco inteiro
      // mudou de lugar, e a quebra antiga separaria o título do resto (o
      // cabeçalho do Bardo ficava sozinho numa coluna vazia). Sai, e a
      // próxima passada confere de novo.
      el.querySelectorAll(".folhear-empurra").forEach((d) => d.classList.remove("folhear-empurra"));
    }
    else if (!c.contains("folhear-inteira") && cabeNumaColuna(el)) c.add("folhear-inteira", "folhear-segura");
    else if (!c.contains("folhear-calcado") && !c.contains("folhear-tentou-calco")) {
      c.add("folhear-tentou-calco");
      calcar(el);
    }
    else return;
    mudou++;
  });
  return mudou;
}

/**
 * A PRANCHA NÃO DEIXA BURACO.
 *
 * A prancha (a arte que atravessa a página) não se parte: se não couber no
 * resto da página, vai inteira pra seguinte — e o que vinha antes dela fica
 * sozinho no alto da página anterior, com um buraco embaixo. Quando isso
 * acontece (buraco maior que um quinto da página), ela volta pra coluna,
 * menor, e o texto preenche o lugar.
 *
 * @returns quantas pranchas voltaram pra coluna
 */
export function acomodarPranchas(fluxo: Element, g: Geometria, r: Regua): number {
  const pranchas = Array.from(fluxo.querySelectorAll<HTMLElement>(".livro-prancha:not(.livro-prancha-coluna)")).filter(visivel);
  if (pranchas.length === 0) return 0;
  pranchas.forEach((el) => el.classList.remove("folhear-prancha-coluna"));
  const alturaDaColuna = g.altura - g.topo - g.pe;
  const topo = fluxo.getBoundingClientRect().top;
  const pagina = (x: number) => Math.floor((x - r.origem) / r.k / g.pagina);
  const voltam: HTMLElement[] = [];
  for (const el of pranchas) {
    const q = el.getBoundingClientRect();
    if ((q.top - topo) / r.k > 24) continue;
    // O que vem antes dela, na ordem de leitura.
    let antes: Element | null = el.previousElementSibling;
    for (let n: Element | null = el; !antes && n && n !== fluxo; n = n.parentElement) antes = n.parentElement?.previousElementSibling ?? null;
    const rs = antes ? Array.from(antes.getClientRects()).filter((x) => x.height > 1) : [];
    const ultimo = rs[rs.length - 1];
    if (!ultimo || pagina(ultimo.left) !== pagina(q.left) - 1) continue;
    const buraco = alturaDaColuna - (ultimo.bottom - topo) / r.k;
    if (buraco > alturaDaColuna * 0.2) voltam.push(el);
  }
  voltam.forEach((el) => el.classList.add("folhear-prancha-coluna"));
  return voltam.length;
}

/**
 * A VITRINE ESTICA ATÉ O PÉ DA PÁGINA.
 *
 * Um bloco de página inteira (as páginas de raça) sempre começa numa página
 * nova, e o texto que vem antes dele termina onde terminar: sobrava um buraco
 * de meia página, às vezes mais, antes da primeira raça. A vitrine
 * (`.livro-vitrine`) mora nesse lugar. Ela nasce com altura zero, e aqui ganha
 * a altura exata que falta até o pé da página — o CSS reorganiza o conteúdo
 * pelo tamanho que ela recebeu (consulta de contêiner). Com menos de ~150 px
 * sobrando ela não aparece: um pé de página curto em branco é normal.
 *
 * Roda por último, depois de tudo que mexe em onde as coisas caem: o que vem
 * depois da vitrine começa numa página nova de qualquer jeito, então esticá-la
 * não muda mais nada no livro.
 */
export function esticarVitrines(fluxo: Element, g: Geometria, r: Regua): void {
  const alturaDaColuna = g.altura - g.topo - g.pe;
  const vitrines = Array.from(fluxo.querySelectorAll<HTMLElement>(".livro-vitrine"));
  if (vitrines.length === 0) return;
  vitrines.forEach((el) => {
    el.classList.remove("folhear-vitrine-cheia", "folhear-vitrine-compacta", "folhear-vitrine-some");
    el.style.removeProperty("--altura-vitrine");
  });
  const topo = fluxo.getBoundingClientRect().top;
  // Lê tudo antes de escrever: cada escrita rediagramaria o livro.
  const medidas = vitrines.map((el) => alturaDaColuna - (el.getBoundingClientRect().top - topo) / r.k);
  vitrines.forEach((el, i) => {
    const resto = Math.floor(medidas[i]) - 2;
    // A vitrine de coluna (a das árvores) já nasce visível, com altura mínima: só cresce.
    // O fecho é uma ilustração: faixa baixa demais só mostraria um recorte.
    if (resto < (el.classList.contains("livro-fecho") ? 340 : 150)) return;
    el.style.setProperty("--altura-vitrine", `${resto}px`);
    el.classList.add("folhear-vitrine-cheia");
  });
  // O espaço mudou com o resto do livro (uma prancha nova antes, um texto
  // maior): se o conteúdo não coube, somem os nomes; se nem assim, a vitrine.
  const transborda = (el: HTMLElement) => el.scrollHeight > el.clientHeight + 2;
  const visiveis = vitrines.filter((el) => !el.classList.contains("livro-fecho") && (el.classList.contains("folhear-vitrine-cheia") || el.classList.contains("livro-vitrine-arvores")));
  visiveis.filter(transborda).forEach((el) => el.classList.add("folhear-vitrine-compacta"));
  visiveis.filter((el) => el.classList.contains("folhear-vitrine-compacta") && transborda(el)).forEach((el) => el.classList.add("folhear-vitrine-some"));
}

/**
 * Tira os calços que ficaram no lugar errado.
 *
 * O calço é medido pro layout da hora em que entrou; um empurrão posterior
 * (outro título, outra tabela) pode mudar tudo antes dele, e aí ele cai no
 * topo de uma coluna — uma coluna inteira em branco — ou vaza pra coluna
 * seguinte. Esses saem, e o bloco que eles empurravam volta a ser conferido
 * do zero na próxima rodada, com a medida nova.
 *
 * @returns quantos calços saíram
 */
export function limparCalcosInuteis(fluxo: Element, r: Regua): number {
  const topo = fluxo.getBoundingClientRect().top;
  let saiu = 0;
  fluxo.querySelectorAll(".folhear-calco").forEach((calco) => {
    // Vazar uns pixels pra página seguinte é o esperado (é o que empurra o
    // bloco); inútil é o calço que já começa no topo de uma coluna.
    const primeiro = calco.getClientRects()[0];
    if (!primeiro || (primeiro.top - topo) / r.k >= 8) return;
    const seguinte = calco.nextElementSibling;
    seguinte?.classList.remove("folhear-calcado", "folhear-inteira", "folhear-segura", "folhear-empurra");
    calco.remove();
    saiu++;
  });
  return saiu;
}

/** Tira os empurrões antes de uma nova diagramação (outra geometria, outro texto). */
export function soltarTitulos(fluxo: Element): void {
  fluxo.querySelectorAll(".folhear-empurra").forEach((el) => el.classList.remove("folhear-empurra"));
  fluxo.querySelectorAll(".folhear-titulo-largo").forEach((el) => el.classList.remove("folhear-titulo-largo", "folhear-larga"));
  fluxo.querySelectorAll(".folhear-segura").forEach((el) => el.classList.remove("folhear-segura", "folhear-inteira"));
  fluxo.querySelectorAll(".folhear-calcado, .folhear-tentou-calco").forEach((el) => el.classList.remove("folhear-calcado", "folhear-tentou-calco"));
  fluxo.querySelectorAll(".folhear-calco").forEach((el) => el.remove());
}

const CLASSE_CABECALHO = "folhear-cabecalho-repetido";

/**
 * O cabeçalho da tabela repetido no alto de cada coluna em que ela continua.
 *
 * Uma tabela de condições que continua na coluna seguinte sem dizer o que é
 * cada coluna obriga o leitor a voltar. O Chrome repete o `<thead>` dentro de
 * colunas desde que ele seja inquebrável (o CSS garante); onde o navegador não
 * repete, o livro repete: uma cópia da linha de cabeçalho (escondida do leitor
 * de tela, que já ouviu o original) entra antes da primeira linha de cada
 * coluna nova.
 *
 * Em LOTE, e não linha a linha: ler a posição depois de cada inserção faria o
 * navegador rediagramar o livro inteiro a cada cópia.
 */
export function repetirCabecalhos(fluxo: Element): void {
  // A coluna de uma linha é o `left` do retângulo dela: duas linhas na mesma
  // coluna têm o mesmo `left`, e a coluna seguinte começa mais à direita.
  const coluna = (el: Element) => Math.round(el.getBoundingClientRect().left);
  for (let passada = 0; passada < 4; passada++) {
    const remover: Element[] = [];
    const inserir: { corpo: HTMLTableSectionElement; cabecalho: HTMLTableRowElement; antes: HTMLTableRowElement }[] = [];

    fluxo.querySelectorAll("table").forEach((tabela) => {
      // O catálogo de itens vira verbetes no livro (sem cabeçalho de tabela).
      if (!visivel(tabela) || tabela.closest(".livro-catalogo-itens")) return;
      const cabecalho = tabela.tHead?.rows[0];
      const corpo = tabela.tBodies[0];
      if (!cabecalho || !corpo) return;
      if (tabela.tHead!.getClientRects().length > 1) {
        corpo.querySelectorAll(`.${CLASSE_CABECALHO}`).forEach((el) => remover.push(el));
        return;
      }
      let anterior = coluna(cabecalho);
      let vemDeCopia = false;
      for (const linha of Array.from(corpo.rows)) {
        const c = coluna(linha);
        if (linha.classList.contains(CLASSE_CABECALHO)) {
          if (c <= anterior) remover.push(linha);
          else {
            vemDeCopia = true;
            anterior = c;
          }
          continue;
        }
        if (c > anterior + 2 && !vemDeCopia) inserir.push({ corpo, cabecalho, antes: linha });
        vemDeCopia = false;
        anterior = c;
      }
    });

    if (remover.length === 0 && inserir.length === 0) return;
    remover.forEach((el) => el.remove());
    for (const { corpo, cabecalho, antes } of inserir) {
      const copia = cabecalho.cloneNode(true) as HTMLTableRowElement;
      copia.className = CLASSE_CABECALHO;
      copia.setAttribute("aria-hidden", "true");
      corpo.insertBefore(copia, antes);
    }
  }
}

/** Tira as cópias de cabeçalho — no modo contínuo a tabela é uma só. */
export function limparCabecalhosRepetidos(fluxo: Element): void {
  fluxo.querySelectorAll(`.${CLASSE_CABECALHO}`).forEach((el) => el.remove());
}

/**
 * Depois que o navegador diagramou: quantas páginas deu, e o que cada uma diz
 * no rodapé.
 */
export function medirPaginas(fluxo: Element, fim: Element, r: Regua, g: Geometria, toc: TocEntry[]): Paginacao {
  const pagina = (el: Element) => paginaDoElemento(el, r, g);
  const total = pagina(fim) + 1;

  const paginaDe: Record<string, number> = {};
  const eventos: {
    pagina: number;
    capitulo?: string;
    capituloId?: string;
    secao?: string;
    arvoreId?: string;
    arvoreNome?: string;
    arvoreFamilia?: string;
  }[] = [];
  for (const cap of toc) {
    const el = document.getElementById(cap.id);
    if (!el || !fluxo.contains(el)) continue;
    paginaDe[cap.id] = pagina(el);
    eventos.push({ pagina: paginaDe[cap.id], capitulo: rotuloDoCapitulo(cap.label, true), capituloId: cap.id });
    for (const s of cap.children ?? []) {
      const es = document.getElementById(s.id);
      if (!es || !fluxo.contains(es) || !visivel(es)) continue;
      paginaDe[s.id] = pagina(es);
      if (!s.label.startsWith("—")) eventos.push({ pagina: paginaDe[s.id], secao: s.label });
    }
  }

  // As árvores do catálogo: cada uma "toma" as páginas dela até a próxima.
  fluxo.querySelectorAll<HTMLElement>(".livro-arvore[data-arvore]").forEach((el) => {
    if (!visivel(el)) return;
    const nome = el.querySelector(".livro-arvore-cabeca > span > span:first-child")?.textContent ?? undefined;
    eventos.push({ pagina: pagina(el), arvoreId: el.dataset.arvore, arvoreNome: nome, arvoreFamilia: el.dataset.categoria });
  });

  // As raças: uma página cada, e a página toma a cor e o kanji da raça.
  const racas = new Map<number, { id?: string; nome?: string }>();
  fluxo.querySelectorAll<HTMLElement>(".livro-raca[data-raca]").forEach((el) => {
    racas.set(pagina(el), { id: el.dataset.raca, nome: el.querySelector(".livro-raca-nome")?.textContent ?? undefined });
  });

  const aberturas = new Set<number>();
  fluxo.querySelectorAll(".folhear-fantasma, .folhear-capa, .folhear-guarda, .folhear-rosto, .folhear-sumario, .livro-abertura, .folhear-colofao").forEach((el) => aberturas.add(pagina(el)));

  // `sort` é estável: capítulo e primeira seção na mesma página mantêm a
  // ordem do sumário, e o capítulo zera a seção antes de ela entrar.
  eventos.sort((a, b) => a.pagina - b.pagina);
  const rotulos: Rotulo[] = [];
  let capitulo: string | undefined;
  let capituloId: string | undefined;
  let secao: string | undefined;
  let arvoreId: string | undefined;
  let arvoreNome: string | undefined;
  let arvoreFamilia: string | undefined;
  let i = 0;
  for (let p = 0; p < total; p++) {
    while (i < eventos.length && eventos[i].pagina <= p) {
      const e = eventos[i++];
      if (e.capitulo) {
        capitulo = e.capitulo;
        capituloId = e.capituloId;
        secao = undefined;
        arvoreId = arvoreNome = arvoreFamilia = undefined;
      } else if (e.arvoreId) {
        arvoreId = e.arvoreId;
        arvoreNome = e.arvoreNome;
        arvoreFamilia = e.arvoreFamilia;
      } else {
        secao = e.secao;
      }
    }
    const raca = racas.get(p);
    rotulos.push({
      capitulo,
      capituloId,
      arvoreId,
      arvoreNome,
      arvoreFamilia,
      racaId: raca?.id,
      racaNome: raca?.nome,
      secao,
      abertura: aberturas.has(p),
    });
  }

  return { total, rotulos, paginaDe };
}

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** "Cap. 4 — Combate e Sobrevivência" → "Capítulo 4 · Combate e Sobrevivência" (ou só o título). */
export function rotuloDoCapitulo(label: string, comNumero: boolean): string {
  const m = label.match(/^Cap\.\s*(\d+)\s*—\s*(.+)$/);
  if (!m) return label;
  return comNumero ? `Capítulo ${m[1]} · ${m[2]}` : m[2];
}

/** "Cap. 4 — …" → "IV". Abertura e Apêndices ficam com o losango, como no índice lateral. */
export function numeralDoCapitulo(label: string): string {
  const m = label.match(/^Cap\.\s*(\d+)/);
  return m ? (ROMANOS[Number(m[1]) - 1] ?? m[1]) : "◆";
}
