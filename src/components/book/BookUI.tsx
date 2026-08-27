import { ReactNode } from "react";

/** Título de capítulo — âncora com margem de rolagem pra não ficar atrás do header/ToC fixo. */
export function ChapterTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h1
      id={id}
      className="scroll-mt-24 border-b border-parchment-300 pb-3 text-2xl font-black tracking-tight text-parchment-900 dark:border-parchment-800 dark:text-parchment-50"
    >
      {children}
    </h1>
  );
}

export function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-lg font-bold text-parchment-900 dark:text-parchment-50"
    >
      {children}
    </h2>
  );
}

export function SubTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="scroll-mt-24 text-base font-semibold text-parchment-800 dark:text-parchment-200"
    >
      {children}
    </h3>
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

/** Caixa de aviso/exceção — pros avisos mais "atenção" do livro (ex: "O que a Cura NÃO faz"). */
export function Warning({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
      {title && <p className="mb-1 font-semibold text-amber-800 dark:text-amber-300">{title}</p>}
      <div className="space-y-1.5 text-amber-950/80 dark:text-amber-100/80">{children}</div>
    </div>
  );
}

export function Quote({ children, attribution }: { children: ReactNode; attribution?: string }) {
  return (
    <blockquote className="border-l-2 border-parchment-300 pl-3 text-sm italic text-parchment-500 dark:border-parchment-700 dark:text-parchment-400">
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
