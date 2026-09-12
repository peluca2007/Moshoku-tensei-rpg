import { ReactNode } from "react";
import Ornament from "@/components/ui/Ornament";

/**
 * Título de capítulo — âncora com margem de rolagem pra não ficar atrás do
 * header/ToC fixo.
 *
 * A abertura de capítulo é a única hora em que a filigrana aparece (0.1.5): são
 * oito capítulos num documento de metros de scroll, e o ornamento é o que marca
 * "começou coisa nova" pra quem está rolando rápido. Entre seções ele viraria
 * barulho — lá o divisor é o filete de CSS, sem arte.
 */
export function ChapterTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <header className="scroll-mt-24">
      <h2
        id={id}
        /*
         * `text-balance` quebra o título em linhas de largura parecida em vez de
         * deixar uma palavra órfã na segunda — num título de capítulo, que é a
         * maior tipografia da página, uma órfã salta aos olhos.
         */
        className="scroll-mt-24 text-balance bg-gradient-to-br from-parchment-900 to-wine-800 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl dark:from-parchment-50 dark:to-gold-200"
      >
        {children}
      </h2>
      <Ornament arte className="!my-4" />
    </header>
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
    <div className="rounded-xl border border-l-[3px] border-wine-300/50 border-l-wine-500 bg-gradient-to-br from-parchment-200/70 to-parchment-100/50 p-3.5 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-wine-900 dark:border-l-wine-600 dark:from-wine-950/40 dark:to-wine-950/10">
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
    <div className="rounded-xl border border-l-[3px] border-gold-400/50 border-l-gold-500 bg-gradient-to-br from-gold-100/80 to-gold-100/40 p-3.5 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-gold-800 dark:border-l-gold-500 dark:from-gold-950/45 dark:to-gold-950/15">
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
    <div className="overflow-x-auto rounded-xl border border-parchment-300 shadow-sm dark:border-parchment-800">
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
