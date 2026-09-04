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
        className="scroll-mt-24 text-3xl font-black tracking-tight text-parchment-900 sm:text-4xl dark:text-parchment-50"
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
      className="scroll-mt-24 text-xl font-bold text-parchment-900 sm:text-2xl dark:text-parchment-50"
    >
      {children}
    </h3>
  );
}

export function SubTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h4
      id={id}
      className="scroll-mt-24 text-lg font-semibold text-parchment-800 dark:text-parchment-200"
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
    <div className="rounded-xl border border-wine-200 bg-wine-50/60 p-3 text-sm dark:border-wine-900 dark:bg-wine-950/30">
      {title && <p className="mb-1 font-semibold text-wine-800 dark:text-wine-300">{title}</p>}
      <div className="space-y-1.5 text-wine-950/80 dark:text-wine-100/80">{children}</div>
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
    <div className="rounded-xl border border-gold-200 bg-gold-50/70 p-3 text-sm dark:border-gold-800 dark:bg-gold-950/40">
      {title && <p className="mb-1 font-semibold text-gold-800 dark:text-gold-200">{title}</p>}
      <div className="space-y-1.5 text-parchment-800 dark:text-gold-100/85">{children}</div>
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

export function BookTable({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-parchment-300 dark:border-parchment-800">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-parchment-100 dark:bg-parchment-900">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold text-parchment-600 dark:text-parchment-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-parchment-300 odd:bg-parchment-50 even:bg-parchment-100/60 dark:border-parchment-800 dark:odd:bg-parchment-950 dark:even:bg-parchment-900/40">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top text-parchment-700 dark:text-parchment-300">
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

export function Section({ children }: { children: ReactNode }) {
  return <section className="space-y-3">{children}</section>;
}
