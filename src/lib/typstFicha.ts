/**
 * Gera o código-fonte .typ da ficha em PDF a partir dos dados já calculados
 * da ficha (mesma lógica de src/store/selectors.ts). O layout segue o molde
 * enviado pelo usuário: pág. 1 identidade/atributos, pág. 2 combate/inventário,
 * pág. 3+ grimório em paisagem (9 cards por página, repete quantas vezes for
 * preciso pra caber todas as magias/talentos comprados).
 */

export interface FichaAttributeRow {
  short: string;
  label: string;
  value: number;
  /**
   * Cap. 1, §2: Vantagem permanente em todos os Testes de Resistência deste
   * atributo (2 PA). Marcada no PDF com um losango ao lado da sigla — é
   * informação de mesa, e quem joga com a folha impressa precisa vê-la.
   */
  saveAdvantage: boolean;
}

export interface FichaTreeRow {
  label: string;
  rank: string;
}

export interface FichaTreePillar {
  title: string;
  rows: FichaTreeRow[];
}

/**
 * Uma linha da tabela "ARMAS E ATAQUES MARCIAIS" do PDF.
 *
 * Até 2026-08-29 esta interface tinha SÓ `name`, e `weaponsTable` emitia
 * `[], [], [], []` nas outras quatro colunas — ou seja, o Dado Base, os degraus,
 * o acerto e o dano saíam permanentemente em branco no documento gerado, e a
 * descrição da arma não aparecia em lugar nenhum do PDF. Os campos abaixo são
 * exatamente os que o cabeçalho da tabela sempre prometeu.
 */
export interface FichaWeaponRow {
  name: string;
  /** Dado Base da arma, como está no inventário ("d8", "2d6"). */
  baseDie: string;
  /** Degraus acumulados na Escada de Dados e o dado já escalado ("+4 Santo → 2d10"). */
  steps: string;
  /** Bônus de acerto pronto pra rolar ("1d20+7"). */
  attack: string;
  /** Dano total já somado ("2d10+7 · méd. 18"). */
  damage: string;
  /** Texto livre do item, quando houver. */
  description: string;
  /**
   * Cap. 1, §4: o personagem é proficiente no grupo desta arma? (0.1.52)
   *
   * A ficha impressa precisa dizer isto porque a penalidade é INVISÍVEL no
   * número: Desvantagem no acerto não muda o "1d20+7" da coluna, e uma folha de
   * papel não recalcula nada na mesa. Sem a marca, o jogador com a ficha na mão
   * rolaria um dado a menos do que devia pelo resto da campanha.
   */
  proficient: boolean;
}

export interface FichaInventoryRow {
  text: string;
}

export interface FichaAbilityCard {
  name: string;
  signature: boolean;
  cost: string;
  time: string;
  range: string;
  effect: string;
}

export interface FichaSpellcastingRow {
  treeName: string;
  bc: string;
  cd: string;
}

export interface FichaPdfPayload {
  name: string;
  /**
   * A foto de perfil da ficha, como data URL (2026-09-04).
   *
   * A decisão que o PROGRESS.md deixou em aberto ("o PDF tem que decidir se
   * imprime a foto ou ignora") ficou em IMPRIMIR. O argumento contra era
   * privacidade — mas esta rota já recebe a ficha inteira pra compilar o
   * Typst, então a foto não abre um caminho novo: ela anda pelo mesmo que o
   * nome, os atributos e a lore já andam. E o PDF existe pra ser levado pra
   * mesa impresso, que é exatamente onde um retrato vale mais.
   *
   * A rota valida e grava o arquivo ao lado do `.typ`; o Typst referencia o
   * NOME do arquivo, nunca o data URL — um base64 de 30 KB dentro do
   * código-fonte estoura o compilador sem uma mensagem que ajude.
   */
  portrait?: string;
  raceName: string;
  backgroundName: string;
  gold: string;
  attributes: FichaAttributeRow[];
  maxHp: string;
  maxMp: string;
  maxPt: string;
  maxPp: string;
  /**
   * O que sobrou de cada reserva em jogo (2026-09-03). Antes o PDF imprimia só
   * o máximo, então a ficha impressa nascia sempre "cheia" e a mesa tinha que
   * anotar o valor real à mão por cima — a ficha do site mostra atual/máximo
   * desde sempre, e a exportada não mostrava.
   */
  currentHp: string;
  currentMp: string;
  currentPt: string;
  currentPp: string;
  armorClass: string;
  initiative: string;
  deslocamento: string;
  paSpent: string;
  /** Cap. 5, §2: Rank de Aventureiro na Guilda, com "(estimado)" quando o Mestre ainda não fixou um. */
  guildRank: string;
  /** Cap. 1, §8: a Árvore Inicial, que decide quais perícias vieram de graça. */
  startingTreeName: string;
  /** BC e CD por escola de magia desbloqueada (Cap. 1, seção 7) — cada árvore usa o próprio Rank. */
  spellcasting: FichaSpellcastingRow[];
  trees: FichaTreePillar[];
  traits: string[];
  /** Parágrafos de lore/anotações (já quebrados por parágrafo — ver buildFichaPayload). */
  lore: string[];
  weapons: FichaWeaponRow[];
  inventory: FichaInventoryRow[];
  abilityCards: FichaAbilityCard[];
}

/** Escapa `\` e `"` pra virar um literal de string Typst seguro — o resto do texto passa por dentro sem ser reinterpretado como marcação, porque a interpolação `#valor` insere strings como texto puro. */
function tstr(input: string): string {
  return `"${input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

const PREAMBLE = `
#set document(title: "Ficha de Personagem - Mushoku Tensei RPG")
#set text(font: "Libertinus Serif", size: 10pt, lang: "pt")
#set page(paper: "a4", margin: 1cm)

#let cor-principal = rgb("4A0E2E")
#let cor-fundo = rgb("FDF6E3")

#let section-title(title) = block(
  width: 100%, fill: cor-principal, inset: 6pt, radius: 2pt,
  text(weight: "bold", size: 11pt, fill: white)[#title]
)

// Cabeçalho GRUDADO no conteúdo dele.
//
// Sem isto, o "ARMAS E ATAQUES MARCIAIS" terminava a página 1 e a tabela dele
// começava a 2 — um título sozinho no pé da folha, que numa ficha impressa lê
// como seção vazia. O "breakable: false" empurra o par inteiro pra página
// seguinte quando ele não cabe.
//
// (O "block(sticky: true)", que seria mais elegante, COMPILA nesta versão do
// Typst e não faz nada: os dois PDFs saem byte a byte idênticos. Testado.)
#let secao(title, corpo) = block(breakable: false, width: 100%)[
  #section-title(title)
  #v(4pt)
  #corpo
]

#let field(label, value: "", width: 100%) = block(
  stroke: (bottom: 0.5pt + black), width: width, inset: (bottom: 4pt, top: 4pt),
  [#text(weight: "bold", size: 9pt)[#label] #text(size: 10pt, style: "italic")[#value]]
)

// ALTURA AUTOMÁTICA, e não fixa — 0.1.61.
//
// O relato da mesa foi "tem algumas coisas fora dos quadrados", e o que estava
// fora eram os VALORES: o 13 da Armadura, o +0 da Iniciativa, o 9m do
// Deslocamento, o número de cada atributo. Todos impressos logo ABAIXO da caixa
// que deveria contê-los.
//
// A conta explica: 4pt de inset em cima e embaixo, mais ~11pt da linha do
// rótulo (8pt), mais o #v(3pt), mais ~18pt da linha do valor (13pt) dão perto
// de 40pt de conteúdo — dentro de uma caixa declarada com 35, 36 ou 38pt de
// altura FIXA. O Typst não corta nem encolhe nesse caso: ele desenha a moldura
// no tamanho pedido e deixa o resto vazar por baixo.
//
// O "height: auto" faz a moldura seguir o conteúdo. As cinco caixas de uma mesma
// linha do grid continuam saindo do mesmo tamanho, porque o conteúdo delas tem
// a mesma forma — o que muda é que nenhuma mais mente sobre o próprio tamanho.
// O parâmetro "height" continua aceito pra quem quiser impor um piso.
// (Sem crase neste comentário de propósito: ele mora dentro de uma template
//  literal do TypeScript, e uma crase aqui fecha a string e quebra o arquivo.)
#let stat-box-filled(label, value, height: auto) = block(
  stroke: 1.5pt + black, radius: 4pt, width: 100%, height: height, inset: 5pt, fill: rgb("F5F5F5"),
  align(top + center)[
    #text(size: 8pt, weight: "bold")[#label]
    #v(3pt)
    #text(size: 13pt, weight: "bold", fill: cor-principal)[#value]
  ]
)

#let resource-box-filled(label, max) = block(
  stroke: 2pt + cor-principal, radius: 6pt, width: 100%, height: auto, inset: 5pt, fill: cor-fundo,
  align(top + center)[
    #text(size: 9pt, weight: "bold", fill: cor-principal)[#label]
    #v(2pt)
    #text(size: 13pt, weight: "bold")[#max]
  ]
)

#let blank-lines(count, spacing: 18pt) = grid(
  columns: 1fr, row-gutter: spacing,
  ..range(count).map(i => line(length: 100%, stroke: 0.5pt + silver))
)

#let rank-field-filled(label, value) = block(
  stroke: (bottom: 0.5pt + silver), width: 100%, inset: (bottom: 2pt, top: 2pt),
  [#text(weight: "bold", size: 8pt)[#label] #text(size: 8pt)[#value]]
)

#let filled-line(value) = block(
  stroke: (bottom: 0.5pt + silver), width: 100%, inset: (bottom: 3pt, top: 3pt),
  text(size: 8.5pt)[#value]
)

#let lore-paragraph(value) = block(
  width: 100%, inset: (bottom: 6pt),
  text(size: 9pt)[#value]
)

#let ability-card(name, cost, time, range, effect) = block(
  stroke: 1.5pt + black, radius: 6pt, width: 100%, height: auto, inset: 8pt, breakable: false,
  [
    #text(weight: "bold", size: 10pt, fill: cor-principal)[#name] #h(1fr) #text(size: 7.5pt)[#cost]
    #v(3pt)
    #line(length: 100%, stroke: 0.5pt + silver)
    #v(4pt)
    #text(size: 7.5pt, style: "italic")[#time · #range]
    #v(5pt)
    #text(size: 7.5pt)[#effect]
  ]
)
`;

function attributesBlock(rows: FichaAttributeRow[]): string {
  // O losango entra na própria sigla ("VIG" -> "VIG ◆") pra não precisar mexer
  // na geometria da caixa nem abrir uma coluna nova numa ficha que já é apertada.
  const boxes = rows
    .map(
      (r) =>
        `stat-box-filled(${tstr(r.saveAdvantage ? `${r.short} ◆` : r.short)}, ${tstr(
          String(r.value)
        )})`
    )
    .join(",\n      ");
  const comVantagem = rows.filter((r) => r.saveAdvantage);
  const legenda = comVantagem.length
    ? `
    #v(3pt)
    #text(size: 7pt)[◆ Vantagem permanente em Testes de Resistência: ${comVantagem
        .map((r) => r.label)
        .join(", ")}]`
    : "";
  return `
  [
    #section-title("ATRIBUTOS")
    #v(4pt)
    #grid(
      columns: (1fr), gutter: 10pt,
      ${boxes}
    )${legenda}
  ]`;
}

/**
 * As reservas e os status — e o que vier junto, DENTRO do mesmo bloco.
 *
 * `rodape` entra dentro dos colchetes deste bloco, e não envolto em outros: em
 * Typst, `[...]` só abre conteúdo em modo de CÓDIGO. Envolver este bloco num
 * segundo `[...]` põe o de dentro em modo de marcação, onde `[` é só um
 * caractere — e a ficha sai com colchetes impressos na cara. Acontecido.
 */
function resourcesBlock(p: FichaPdfPayload, rodape = ""): string {
  return `
  [
    #section-title("RESERVAS VITAIS E COMBATE")
    #v(4pt)
    #grid(
      columns: (1fr, 1fr), gutter: 8pt,
      resource-box-filled("PONTOS DE VIDA (PV)", ${tstr(`${p.currentHp} / ${p.maxHp}`)}),
      resource-box-filled("PONTOS DE MANA (PM)", ${tstr(`${p.currentMp} / ${p.maxMp}`)}),
      resource-box-filled("PONTOS DE TOUKI (PT)", ${tstr(`${p.currentPt} / ${p.maxPt}`)}),
      resource-box-filled("PONTOS DE PREP. (PP)", ${tstr(`${p.currentPp} / ${p.maxPp}`)})
    )
    #v(8pt)
    #grid(
      columns: (1fr, 1fr, 1fr, 1fr, 1fr), gutter: 8pt,
      stat-box-filled("ARMADURA (CA)", ${tstr(p.armorClass)}),
      stat-box-filled("INICIATIVA", ${tstr(p.initiative)}),
      stat-box-filled("DESLOCAMENTO", ${tstr(p.deslocamento)}),
      stat-box-filled("PA GASTOS", ${tstr(p.paSpent)}),
      stat-box-filled("RANK DE GUILDA", ${tstr(p.guildRank)})
    )
    ${rodape}
  ]`;
}

/**
 * O bloco mais o espaço DEPOIS dele — e nada, quando o bloco é nada.
 *
 * Sem isto, uma seção que some (a de conjuração, numa ficha sem magia) deixa o
 * `#v(8pt)` dela pra trás, e a folha ganha um vão do tamanho de uma seção
 * ausente. Espaço entre coisas é do par, não de cada uma.
 */
function comEspaco(bloco: string, pontos = 8, antes = false): string {
  if (bloco.trim() === "") return "";
  return antes ? `#v(8pt)
${bloco}` : `${bloco}
#v(${pontos}pt)
`;
}

function spellcastingBlock(rows: FichaSpellcastingRow[]): string {
  /*
   * Sem escola de magia, a seção inteira SOME — 0.1.51.
   *
   * Ela imprimia uma faixa de título e uma caixa dizendo "nenhuma escola
   * desbloqueada ainda", com a fórmula do BC dentro. Numa ficha de espadachim
   * isso é um lembrete de regra ocupando o lugar de algo que ele usa — e a
   * fórmula mora no Cap. 1, que é onde se procura por ela.
   */
  if (rows.length === 0) return "";
  const dataRows = rows
    .map((r) => `${tstr(r.treeName)}, ${tstr(r.bc)}, ${tstr(r.cd)}`)
    .join(",\n  ");
  return `
#secao("BÔNUS DE CONJURAÇÃO (BC) E CD")[
#table(
  columns: (2fr, 1fr, 1fr),
  stroke: 0.5pt + gray,
  align: (left, center, center),
  [*Escola*], [*BC*], [*CD*],
  ${dataRows}
)
]`;
}

function treesBlock(pillars: FichaTreePillar[]): string {
  /*
   * Só as árvores ABERTAS — 0.1.51.
   *
   * O bloco listava as dezenove e escrevia "—" nas que o personagem não tem.
   * Numa ficha de guerreiro isso são dezoito linhas de traço, e a única que
   * importa fica perdida no meio delas. A lista completa é referência, e
   * referência mora no livro; a ficha é o que VOCÊ tem.
   */
  const abertos = pillars
    .map((pilar) => ({ ...pilar, rows: pilar.rows.filter((r) => r.rank && r.rank.trim() !== "") }))
    .filter((pilar) => pilar.rows.length > 0);

  if (abertos.length === 0) {
    return `
#secao("ÁRVORES DE PROGRESSÃO")[
#block(stroke: 1pt + gray, radius: 4pt, inset: 10pt, width: 100%)[
  #text(size: 8pt, fill: gray)[Nenhuma árvore aberta ainda — abra a primeira em /arvores e ela aparece aqui.]
]
]`;
  }

  const columns = abertos
    .map((pillar) => {
      const rows = pillar.rows
        .map((r) => `rank-field-filled(${tstr(`${r.label}:`)}, ${tstr(r.rank)})`)
        .join(", ");
      return `grid(columns: 1fr, row-gutter: 4pt,
      text(weight: "bold", fill: cor-principal, size: 9pt)[${pillar.title}],
      ${rows}
    )`;
    })
    .join(",\n    ");

  return `
#secao("ÁRVORES DE PROGRESSÃO")[
#block(stroke: 1pt + gray, radius: 4pt, inset: 8pt, width: 100%)[
  #grid(
    columns: (${abertos.map(() => "1fr").join(", ")}), gutter: 15pt,
    ${columns}
  )
]
]`;
}

function traitsBlock(traits: string[]): string {
  if (traits.length === 0) {
    return `
#secao("PERÍCIAS & TRAÇOS (RAÇA E ANTECEDENTE)")[
#block(stroke: 1pt + gray, radius: 4pt, inset: 8pt, width: 100%)[
  #text(size: 8pt, fill: gray)[Nenhuma raça/antecedente definido ainda.]
]]`;
  }
  const lines = traits.map((t) => `filled-line(${tstr(t)})`).join(",\n  ");
  return `
#secao("PERÍCIAS & TRAÇOS (RAÇA E ANTECEDENTE)")[
#block(stroke: 1pt + gray, radius: 4pt, inset: 8pt, width: 100%)[
  #grid(columns: 1fr, row-gutter: 5pt,
  ${lines}
  )
]]`;
}

function loreBlock(paragraphs: string[]): string {
  if (paragraphs.length === 0) {
    /*
     * Sem lore escrita, esta é a ÚLTIMA seção da parte retrato — e ela fechava
     * a folha com um aviso de uma linha, deixando meia página em branco morta
     * (0.1.51). Meia folha em branco não é erro de diagramação: é espaço que a
     * ficha tinha pra dar e não deu. Doze linhas pautadas transformam o vão em
     * lugar de escrever à mão na mesa, que é pra onde este PDF vai.
     */
    return `
#secao("LORE E ANOTAÇÕES")[
#block(stroke: 1pt + gray, radius: 4pt, inset: 12pt, width: 100%)[
  #text(size: 8pt, fill: gray)[Nada escrito ainda — anote aqui, ou edite em /ficha.]
  #v(8pt)
  #blank-lines(12, spacing: 17pt)
]]`;
  }
  // Sem breakable: false de propósito — ao contrário do ability-card, um texto de lore pode ser
  // longo o bastante pra precisar quebrar entre páginas, e isso é permitido por padrão em Typst.
  const paras = paragraphs.map((para) => `lore-paragraph(${tstr(para)})`).join(",\n  ");
  return `
#secao("LORE E ANOTAÇÕES")[
#block(stroke: 1pt + gray, radius: 4pt, inset: 10pt, width: 100%)[
  #grid(columns: 1fr, row-gutter: 2pt,
  ${paras}
  )
]]`;
}

function weaponsTable(weapons: FichaWeaponRow[]): string {
  // Sempre pelo menos 5 linhas: as que sobram saem em branco de propósito, pra
  // escrever à mão numa ficha impressa.
  const dataRowCount = Math.max(5, weapons.length + 1);
  const rows: string[] = [];
  for (let i = 0; i < dataRowCount; i++) {
    const w = weapons[i];
    rows.push(
      [
        // O losango vazio na frente do nome é a marca de "sem proficiência" —
        // mesma gramática do losango cheio que `attributesBlock` usa pra
        // Vantagem em Teste de Resistência, e por isso a mesa já sabe ler.
        w ? `${w.proficient ? "" : "◇ "}${w.name}` : "",
        w?.baseDie ?? "",
        w?.steps ?? "",
        w?.attack ?? "",
        w?.damage ?? "",
      ]
        .map(tstr)
        .join(", ")
    );
  }

  // A descrição não cabe numa célula de 28pt sem espremer as outras colunas, e
  // era justamente ela que sumia por completo do PDF. Vai como notas de rodapé
  // da tabela, uma linha por arma que tenha texto.
  const notas = weapons.filter((w) => w.description.trim().length > 0);

  // A legenda do losango vazio só existe quando há uma arma marcada — legenda de
  // símbolo ausente é ruído numa folha que já é densa.
  const legenda = weapons.some((w) => !w.proficient)
    ? `#(strong("◇") + ${tstr(" sem proficiência (Cap. 1, §4): ataque com Desvantagem. O dano não muda.")})`
    : "";

  /*
   * O parêntese depois do `#` não é estilo: é o que faz a soma acontecer.
   *
   * Estas linhas moram num bloco `[...]`, que é MARKUP. Ali, `#strong("x")`
   * fecha a expressão no fim da chamada — o ` + "texto"` que vinha depois volta
   * a ser texto comum, e o PDF imprime, literalmente, `◇ + " sem proficiência"`,
   * com o mais e as aspas. `#(a + b)` mantém tudo dentro de uma expressão só.
   *
   * O bug já existia antes de 0.1.52, na nota de rodapé das armas com
   * descrição — nunca tinha aparecido porque nenhuma arma do catálogo mundano
   * tem descrição própria, e só as seis especiais da loja têm.
   */
  const linhas = [
    ...(legenda ? [legenda] : []),
    ...notas.map((w) => `#(strong(${tstr(w.name)}) + ${tstr(` — ${w.description}`)})`),
  ];
  const notasBloco = linhas.length
    ? `
#v(3pt)
#block(width: 100%, inset: (x: 2pt))[
  #set text(size: 7.5pt)
  ${linhas.join("\n  #linebreak()\n  ")}
]`
    : "";

  return `
#secao("ARMAS E ATAQUES MARCIAIS")[
#table(
  columns: (2fr, 1fr, 1.2fr, 1fr, 2fr),
  // 24pt, e não 28: com o cabeçalho da seção grudado na tabela
  // (breakable: false), a diferença de 20pt decidia se ela cabia no pé da
  // primeira página ou pulava inteira pra segunda, deixando um vão do tamanho
  // dela. 24pt continuam sendo linha de escrever à mão.
  rows: (auto, ..range(${dataRowCount}).map(i => 24pt)),
  stroke: 0.5pt + gray,
  align: center + horizon,
  [*Arma / Manobra*], [*Dado Base*], [*Degraus (Rank)*], [*Acerto*], [*Dano Total (Dados + Bônus)*],
  ${rows.join(",\n  ")}
)${notasBloco}
]`;
}

function inventoryBlock(items: FichaInventoryRow[]): string {
  const half = Math.ceil(items.length / 2);
  const left = items.slice(0, half);
  const right = items.slice(half);
  // 9, e não 6: a parte retrato acaba com folga na última folha, e linha de
  // inventário em branco é a que mais se usa numa mesa impressa.
  const rowsPerCol = Math.max(9, half, items.length - half);

  function column(list: FichaInventoryRow[]): string {
    const lines = list.map((i) => `filled-line(${tstr(i.text)})`);
    const padCount = Math.max(0, rowsPerCol - list.length);
    const padded = padCount > 0
      ? [...lines, `..range(${padCount}).map(i => block(stroke: (bottom: 0.5pt + silver), width: 100%, inset: (bottom: 3pt, top: 3pt))[#v(10pt)])`]
      : lines;
    return `grid(columns: 1fr, row-gutter: 6pt, ${padded.join(", ")})`;
  }

  return `
#secao("EQUIPAMENTO E INVENTÁRIO")[
#block(stroke: 1pt + gray, radius: 4pt, inset: 12pt, width: 100%)[
  #grid(
    columns: (1fr, 1fr), gutter: 20pt,
    ${column(left)},
    ${column(right)}
  )
]]`;
}

function abilityCardsPages(cards: FichaAbilityCard[]): string {
  if (cards.length === 0) {
    return `
#align(center)[#text(size: 10pt, fill: gray)[Nenhuma magia, técnica ou talento comprado ainda.]]`;
  }

  const CARDS_PER_PAGE = 9;
  const pages: string[] = [];
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    const chunk = cards.slice(i, i + CARDS_PER_PAGE);
    const cells = chunk
      .map(
        (c) =>
          `ability-card(${tstr(`${c.signature ? "◆ " : ""}${c.name}`)}, ${tstr(c.cost)}, ${tstr(c.time)}, ${tstr(c.range)}, ${tstr(c.effect)})`
      )
      .join(",\n  ");
    pages.push(`#grid(\n  columns: (1fr, 1fr, 1fr),\n  gutter: 12pt,\n  ${cells}\n)`);
  }

  return pages.join("\n\n#pagebreak()\n\n");
}

/**
 * @param retratoArquivo nome do arquivo de imagem já gravado ao lado do `.typ`
 *   (a rota é quem decodifica e grava). `undefined` = ficha sem foto, e o
 *   cabeçalho volta a ocupar a largura inteira.
 */
export function buildFichaTypstSource(p: FichaPdfPayload, retratoArquivo?: string): string {
  return `${PREAMBLE}

// ==========================================
// FICHA: IDENTIDADE, PROGRESSÃO, COMBATE E INVENTÁRIO
// Flui livremente por quantas páginas retrato forem necessárias — sem
// quebra de página forçada entre seções, pra nunca sobrar uma página quase
// vazia só porque uma caixa não coube por pouco no fim da anterior.
// ==========================================

#align(center)[
  #text(size: 20pt, weight: "bold", fill: cor-principal)[MUSHOKU TENSEI RPG] \\
  #text(size: 10pt, style: "italic")[Ficha de Personagem]
]
#v(6pt)

#grid(
  columns: ${retratoArquivo ? "(auto, 1fr)" : "(1fr,)"},
  gutter: 10pt,
  ${
    retratoArquivo
      ? `block(
    radius: 4pt,
    clip: true,
    stroke: 0.6pt + cor-principal,
    image(${tstr(retratoArquivo)}, width: 27mm, height: 27mm, fit: "cover")
  ),`
      : ""
  }
  [
    #grid(
      columns: (2fr, 1fr, 1.5fr, 1fr),
      gutter: 10pt,
      field("Personagem:", value: ${tstr(p.name)}),
      field("Raça:", value: ${tstr(p.raceName)}),
      field("Antecedente:", value: ${tstr(p.backgroundName)}),
      field("Ouro (PO):", value: ${tstr(p.gold)})
    )
    #v(6pt)
    // "Destino / Sub-tabela" saiu em 0.1.61, a pedido da mesa: a sub-tabela é
    // sorteada uma vez na criação (Cap. 1, §6) e depois vira traço de
    // personagem, não número de consulta — na ficha impressa ela ocupava meia
    // linha pra mostrar um travessão na maioria das vezes. A Árvore Inicial
    // ficou com a largura inteira, que é o que ela precisava.
    #grid(
      columns: (1fr,),
      field("Árvore Inicial:", value: ${tstr(p.startingTreeName)})
    )
  ]
)
#v(10pt)

// O BC/CD mora DENTRO da coluna da direita, e não numa faixa própria — 0.1.51.
//
// A coluna dos atributos tem cinco caixas; a das reservas acaba logo depois da
// fileira de status. Isso deixava um buraco de uns 120pt ao lado de INT e ESP, e
// empurrava tudo que vinha depois pra baixo — a ponto de a tabela de armas não
// caber mais na primeira página. A tabela de conjuração é pequena e cabe
// exatamente ali.
#grid(
  columns: (1fr, 2.5fr),
  gutter: 15pt,
  ${attributesBlock(p.attributes)},
  ${resourcesBlock(p, comEspaco(spellcastingBlock(p.spellcasting), 0, true))}
)
#v(8pt)

${treesBlock(p.trees)}
#v(8pt)

${traitsBlock(p.traits)}
#v(8pt)

${weaponsTable(p.weapons)}
#v(10pt)

${inventoryBlock(p.inventory)}
#v(10pt)

#secao("VÍNCULOS, PACTOS E PROTEGIDOS")[
  #block(stroke: 1pt + gray, radius: 4pt, inset: 8pt, width: 100%)[
    #text(size: 8pt, fill: gray)[Anote aqui: criaturas com Pacto (Invocação), aliados "Sob Minha Guarda" (Escudos), ou contatos/tropas (Bardo/Tático).]
    #v(6pt)
    #blank-lines(4, spacing: 16pt)
  ]
]
#v(10pt)

${loreBlock(p.lore)}

// ==========================================
// MAGIAS E HABILIDADES (DEITADA) — sempre começa em página nova por causa
// da mudança de orientação; pagina sozinha em quantas páginas precisar.
// ==========================================
#pagebreak()
#set page(flipped: true, margin: 1cm)

#align(center)[
  #text(size: 16pt, weight: "bold", fill: cor-principal)[GRIMÓRIO E ARSENAL DE TÉCNICAS] \\
  #text(size: 9pt, style: "italic", fill: gray)[${tstr(p.name)} — magias, técnicas marciais, talentos e preparações]
]
#v(10pt)

${abilityCardsPages(p.abilityCards)}
`;
}
