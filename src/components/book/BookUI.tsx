import { ReactNode } from "react";
import Ornament from "@/components/ui/Ornament";
import { SUMARIO_DO_LIVRO } from "@/data/sumarioDoLivro";
import { ARTE_DAS_ABERTURAS } from "./arteDasAberturas";

/**
 * A FOLHA DE ROSTO DE CAPÍTULO (2026-09-23).
 *
 * Antes era um `<h2>` com a filigrana embaixo, no meio do fluxo: num scroll de
 * 87 mil pixels o capítulo novo chegava do mesmo jeito que uma seção qualquer,
 * só com a fonte maior. Num livro de papel você SABE que virou um capítulo
 * antes de ler uma palavra — a página muda de comportamento.
 *
 * O que faz essa página mudar de comportamento aqui: o respiro grande antes, o
 * número do capítulo em versalete entre dois filetes, o título sozinho na
 * largura inteira, a filigrana, e uma linha dizendo o que o capítulo cobre. A
 * linha não é enfeite — ela responde "é aqui que eu procuro isso?" sem obrigar
 * a descer até a primeira seção.
 *
 * A filigrana só aparece aqui (0.1.5): são oito capítulos, e o ornamento é o
 * que marca "começou coisa nova" pra quem rola rápido. Entre seções viraria
 * barulho — lá o divisor é o filete de CSS, sem arte.
 */
export function ChapterTitle({
  id,
  numero,
  resumo,
  children,
}: {
  id: string;
  numero?: string;
  resumo?: string;
  children: ReactNode;
}) {
  const arte = ARTE_DAS_ABERTURAS[id];
  /*
   * O número grande ("04") e o capítulo em kanji na vertical ("第四章") da
   * abertura no livro folheado — o jeito de um volume de light novel abrir
   * capítulo. Abertura é o prólogo (序章); os Apêndices, o apêndice (付録).
   */
  const n = Number(numero?.match(/\d+/)?.[0] ?? NaN);
  const kanji = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const numeroGrande = Number.isNaN(n) ? (id === "cap0" ? "00" : "Ap") : String(n).padStart(2, "0");
  const numeroKanji = Number.isNaN(n) ? (id === "cap0" ? "序章" : "付録") : `第${kanji[n] ?? n}章`;
  return (
    <header
      className="livro-abertura scroll-mt-24 text-center"
      data-num={numeroGrande}
      data-kanji={numeroKanji}
    >
      {/* A arte da abertura só aparece no livro folheado (ver folhear.css). */}
      {arte && (
        <figure aria-hidden className="livro-abertura-arte">
          {/* eslint-disable-next-line @next/next/no-img-element -- arte impressa no papel; carrega só no livro folheado. */}
          <img src={arte.src} alt="" loading="lazy" decoding="async" />
        </figure>
      )}
      {numero && (
        <p className="flex items-center justify-center gap-3 text-2xs font-bold uppercase tracking-[0.35em] text-gold-700 sm:text-xs dark:text-gold-400">
          <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-gold-600/60 sm:w-12" />
          {numero}
          <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-gold-600/60 sm:w-12" />
        </p>
      )}
      <h2
        id={id}
        /*
         * `text-balance` quebra o título em linhas de largura parecida em vez de
         * deixar uma palavra órfã na segunda — num título de capítulo, que é a
         * maior tipografia da página, uma órfã salta aos olhos.
         *
         * `scroll-mt-32` (e não 24): a âncora é o título, mas quem pula pra cá
         * pelo sumário precisa ver o número do capítulo acima dele, senão a
         * folha de rosto chega pela metade.
         */
        className="mt-3 scroll-mt-32 text-balance bg-gradient-to-br from-parchment-900 to-wine-800 bg-clip-text font-display text-3xl font-black tracking-tight text-transparent sm:text-5xl dark:from-parchment-50 dark:to-gold-200"
      >
        {children}
      </h2>
      <Ornament arte className="!my-5" />
      {resumo && (
        <p className="mx-auto max-w-[46ch] text-pretty text-sm italic leading-relaxed text-parchment-600 sm:text-base dark:text-parchment-400">
          {resumo}
        </p>
      )}
    </header>
  );
}

/**
 * O FÓLIO DE FIM DE CAPÍTULO (2026-09-23).
 *
 * Num livro o capítulo acaba: sobra papel em branco e o próximo começa na
 * folha seguinte. Aqui o capítulo simplesmente parava e o texto continuava —
 * quem estava rolando não tinha como saber que tinha terminado alguma coisa, e
 * quem queria só aquele capítulo não tinha onde parar.
 *
 * O próximo capítulo sai do `SUMARIO_DO_LIVRO`, não de um parâmetro: a ordem do
 * livro já mora lá, e repeti-la aqui seria mais um lugar pra esquecer de
 * atualizar quando um capítulo nascer no meio.
 */
export function FimDoCapitulo({ id }: { id: string }) {
  const i = SUMARIO_DO_LIVRO.findIndex((c) => c.id === id);
  const atual = SUMARIO_DO_LIVRO[i];
  const proximo = i >= 0 ? SUMARIO_DO_LIVRO[i + 1] : undefined;
  if (!atual) return null;

  // "Cap. 1 — O Núcleo do Sistema" → "Cap. 1". Quem não tem travessão (Comece
  // Aqui, Apêndices) fica com o nome inteiro, que já é curto.
  const folio = proximo ? atual.label.split(" — ")[0] : "Fim do Livro";

  return (
    <footer className="print-hide pt-4 text-center">
      <p
        aria-hidden
        className="flex items-center justify-center gap-3 text-2xs font-bold uppercase tracking-[0.3em] text-parchment-500 dark:text-parchment-500"
      >
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-parchment-400/50 sm:w-20" />
        {folio}
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-parchment-400/50 sm:w-20" />
      </p>

      {proximo && (
        <a
          href={`#${proximo.id}`}
          className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-parchment-300 bg-parchment-100/80 px-4 py-2 text-xs font-semibold text-parchment-700 transition-colors hover:border-gold-500/60 hover:text-wine-700 dark:border-parchment-800 dark:bg-parchment-900/60 dark:text-parchment-300 dark:hover:text-gold-200"
        >
          <span className="truncate">{proximo.label}</span>
          <span aria-hidden>→</span>
        </a>
      )}
    </footer>
  );
}

/*
 * Escala tipográfica aberta em 2026-08-28. Era 2xl / lg / base — três degraus
 * quase colados num documento de cinco capítulos e sete apêndices, então
 * capítulo, seção e subseção pareciam o mesmo nível e o sumário era a única
 * forma de saber onde você estava. Agora 4xl / 2xl / lg dá orientação local
 * sem depender do sumário.
 */
export function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="livro-secao-titulo scroll-mt-24 text-xl font-bold text-parchment-900 sm:text-2xl dark:text-parchment-50"
    >
      {children}
    </h3>
  );
}

/**
 * Subtítulo de seção.
 *
 * Ganhou peso em 0.1.56 porque ele estava PERDENDO a disputa com o texto: um
 * `<b>` dentro de uma caixa de regra chamava mais atenção que o título da
 * subseção que a continha, e num documento longo isso desmonta a hierarquia
 * inteira — o leitor para de conseguir dizer, de relance, o que é título e o
 * que é ênfase.
 *
 * A correção é de fonte, não de tamanho: a display serifada é a mesma dos
 * títulos de capítulo e de seção, então o subtítulo passa a pertencer àquela
 * família em vez de parecer um parágrafo em negrito. O respiro acima é o que
 * separa uma subseção nova do fim da anterior.
 */
export function SubTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h4
      id={id}
      className="mt-2 scroll-mt-24 font-display text-lg font-bold text-parchment-900 sm:text-xl dark:text-parchment-100"
    >
      {children}
    </h4>
  );
}

export function P({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`leading-relaxed text-parchment-700 dark:text-parchment-300 ${className}`}>{children}</p>;
}

/** Caixa de regra/nota — equivalente às caixas indentadas (`#####`) do livro original. */
export function Aside({ title, children }: { title?: string; children: ReactNode }) {
  return (
    /*
     * O fundo é PERGAMINHO tingido de vinho, e não `wine-50` — 0.1.65.
     *
     * `wine-50` é #fbeef3: um rosa FRIO, e quase branco (lab L=97). Num site
     * inteiro de pergaminho quente (#fdf6e3) ele não lia como "caixa de regra",
     * lia como retângulo branco sujo — foi exatamente essa a queixa da mesa.
     *
     * Agora a caixa é mais ESCURA que a página, não mais clara. É assim que uma
     * caixa de destaque se comporta em papel: ela afunda, não flutua.
     */
    <div className="livro-caixa rounded-xl border border-l-[3px] border-wine-300/50 border-l-wine-500 bg-gradient-to-br from-parchment-200/70 to-parchment-100/50 p-3.5 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-wine-900 dark:border-l-wine-600 dark:from-wine-950/40 dark:to-wine-950/10">
      {title && <p className="mb-1 font-semibold text-wine-800 dark:text-wine-300">{title}</p>}
      {/* `max-w-[74ch]`: a caixa usa a largura inteira de propósito (ela é
          consultada, não lida em fluxo), mas o TEXTO dentro dela continua sendo
          texto — sem medida, uma nota de regra longa atravessa 760px numa linha
          só, que é pior de ler do que o corpo do livro que ela comenta. */}
      <div className="max-w-[74ch] space-y-1.5 text-wine-950/80 dark:text-wine-100/80">{children}</div>
    </div>
  );
}

/**
 * Caixa de aviso/exceção — pros avisos mais "atenção" do livro (ex: "O que a
 * Cura NÃO faz"). Usa `gold-*` da paleta do projeto; até 2026-08-28 usava
 * `amber-*`, que é o padrão do Tailwind e não pertence à identidade
 * pergaminho/vinho/dourado — era a única cor do livro fora da paleta.
 */
export function Warning({ title, children }: { title?: string; children: ReactNode }) {
  return (
    // Mesma razão da caixa acima: `gold-50` (#fcf6e8) é quase indistinguível do
    // fundo da página. O `gold-100` tem pigmento suficiente pra a caixa existir.
    <div className="livro-caixa livro-aviso rounded-xl border border-l-[3px] border-gold-400/50 border-l-gold-500 bg-gradient-to-br from-gold-100/80 to-gold-100/40 p-3.5 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-gold-800 dark:border-l-gold-500 dark:from-gold-950/45 dark:to-gold-950/15">
      {title && <p className="mb-1 font-semibold text-gold-800 dark:text-gold-200">{title}</p>}
      <div className="max-w-[74ch] space-y-1.5 text-parchment-800 dark:text-gold-100/85">{children}</div>
    </div>
  );
}

export function Quote({ children, attribution }: { children: ReactNode; attribution?: string }) {
  return (
    <blockquote className="border-l-2 border-parchment-300 pl-3 text-sm italic text-parchment-600 dark:border-parchment-700 dark:text-parchment-400">
      {children}
      {attribution && <footer className="mt-1 not-italic text-xs">— {attribution}</footer>}
    </blockquote>
  );
}

/**
 * A tabela do livro — o elemento mais frequente dele, depois do parágrafo.
 *
 * Três decisões de 0.1.55, todas pra que a tabela pareça de livro e não de
 * planilha:
 *
 * - **Cabeçalho em versalete dourado.** Maiúsculas pequenas com entreletra
 *   aberta separam o cabeçalho do corpo sem precisar de uma régua ou de um
 *   fundo pesado, e o dourado é a cor que o resto do livro já usa pra "isto
 *   não é texto corrido".
 * - **Primeira coluna em destaque.** Numa tabela de regra, a primeira coluna é
 *   quase sempre a CHAVE — o rank, o atributo, a magia — e é por ela que o
 *   olho procura. Dar peso a ela transforma a varredura vertical numa lista.
 * - **Zebra mais discreta.** A anterior alternava dois tons próximos que, no
 *   tema escuro, viravam listras sem informação. Agora só as linhas pares
 *   recebem um véu, e a borda faz o resto do trabalho.
 */
export function BookTable({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="livro-tabela overflow-x-auto rounded-xl border border-parchment-300 shadow-sm dark:border-parchment-800">
      {/*
        `min-w-[320px]`, e não 420: o mínimo antigo era maior que a tela de um
        celular de 390px, então TODA tabela do livro rolava de lado — inclusive as
        de três colunas curtas, que caberiam inteiras. `min-width` é piso, não
        largura: a tabela que precisa de mais continua empurrando e rolando, como
        sempre. O que muda é que as pequenas param de rolar à toa.
      */}
      <table className="w-full min-w-[320px] border-collapse bg-parchment-50/60 text-left text-sm dark:bg-parchment-950/40">
        <thead>
          <tr className="border-b border-gold-500/30 bg-parchment-100 dark:bg-parchment-900">
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-[0.7rem] font-bold uppercase tracking-wider text-gold-700 dark:text-gold-300"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-parchment-300/70 even:bg-parchment-200/30 dark:border-parchment-800/70 dark:even:bg-parchment-950/40"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 align-top ${
                    j === 0
                      ? "font-semibold text-parchment-900 dark:text-parchment-100"
                      : "text-parchment-700 dark:text-parchment-300"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-parchment-700 dark:text-parchment-300">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Uma seção do livro.
 *
 * A classe `livro-prosa` é o que liga a MEDIDA DE LINHA (globals.css): ela
 * limita parágrafos e listas a 68 caracteres, e deixa tabela, caixa de regra e
 * citação com a largura inteira. Sem ela, o corpo do livro ficava com ~120
 * caracteres por linha numa janela de 1280 — o olho perde a linha ao voltar
 * pra esquerda, e a leitura vira um esforço que a pessoa sente sem nomear.
 */
export function Section({ children }: { children: ReactNode }) {
  return <section className="livro-prosa space-y-3">{children}</section>;
}
