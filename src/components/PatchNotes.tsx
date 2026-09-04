import { ScrollText } from "lucide-react";
import { PATCH_NOTES, type PatchNote } from "@/data/patchNotes";

function NoteBody({ note }: { note: PatchNote }) {
  return (
    <div className="space-y-4">
      {note.sections.map((section) => (
        <div key={section.heading}>
          <h4 className="mb-1.5 text-sm font-bold uppercase tracking-wide text-gold-700 dark:text-gold-400">
            {section.heading}
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-parchment-700 dark:text-parchment-300">
            {section.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function VersionBadge({ note }: { note: PatchNote }) {
  return (
    <span className="shrink-0 rounded-full bg-wine-600/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-wine-700 ring-1 ring-wine-500/30 dark:text-wine-300">
      v{note.version} — {note.date}
    </span>
  );
}

/** Quantas linhas de mudança a versão traz — dá escala à entrada sem obrigar a abrir. */
function itemCount(note: PatchNote): number {
  return note.sections.reduce((n, s) => n + s.items.length, 0);
}

export default function PatchNotes() {
  const [latest, ...older] = PATCH_NOTES;
  if (!latest) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <h2 className="mb-1 flex items-center gap-2 text-2xl font-black tracking-tight text-parchment-900 dark:text-parchment-50">
        <ScrollText className="h-6 w-6 text-wine-500" /> Patch Notes
      </h2>
      <p className="mb-6 text-sm text-parchment-600 dark:text-parchment-400">
        Todas as atualizações de design do sistema, mais recentes primeiro. A versão atual vem aberta; as
        anteriores ficam recolhidas.
      </p>

      {/* A versão atual, sempre aberta: é a única que a mesa precisa ler pra jogar hoje. */}
      <article className="rounded-2xl border-2 border-wine-400 bg-parchment-50/80 p-5 shadow-sm dark:border-wine-800 dark:bg-parchment-900/60">
        <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-parchment-300 pb-3 dark:border-parchment-800">
          <h3 className="flex flex-wrap items-center gap-2 text-lg font-black tracking-tight text-parchment-900 dark:text-parchment-50">
            <span className="rounded-full bg-wine-600 px-2 py-0.5 text-3xs font-bold uppercase tracking-wider text-white">
              Atual
            </span>
            {latest.title}
          </h3>
          <VersionBadge note={latest} />
        </header>
        <NoteBody note={latest} />
      </article>

      {/* O histórico. Recolhido de propósito: são centenas de linhas que só
          importam pra quem está reconstituindo por que uma regra mudou. */}
      {older.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
            Versões anteriores
          </p>
          {older.map((note) => (
            <details
              key={note.version}
              className="group rounded-2xl border border-parchment-300 bg-parchment-50/60 dark:border-parchment-800 dark:bg-parchment-900/40"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2 rounded-2xl p-4 hover:bg-parchment-200/50 dark:hover:bg-parchment-800/40">
                <span className="font-bold text-parchment-900 dark:text-parchment-50">
                  {note.title}
                  <span className="ml-2 text-xs font-normal text-parchment-600 dark:text-parchment-400">
                    {itemCount(note)} mudanças
                  </span>
                </span>
                <VersionBadge note={note} />
              </summary>
              <div className="border-t border-parchment-300 p-5 dark:border-parchment-800">
                <NoteBody note={note} />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
