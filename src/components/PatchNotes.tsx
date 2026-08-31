import { ScrollText } from "lucide-react";
import { PATCH_NOTES, type PatchNote } from "@/data/patchNotes";

function PatchNoteCard({ note }: { note: PatchNote }) {
  return (
    <article className="rounded-2xl border border-parchment-300 bg-parchment-50/70 p-5 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-parchment-300 pb-3 dark:border-parchment-800">
        <h3 className="text-lg font-black tracking-tight text-parchment-900 dark:text-parchment-50">
          {note.title}
        </h3>
        <span className="rounded-full bg-wine-600/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-wine-700 ring-1 ring-wine-500/30 dark:text-wine-300">
          v{note.version} — {note.date}
        </span>
      </header>

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
    </article>
  );
}

export default function PatchNotes() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <h2 className="mb-1 flex items-center gap-2 text-2xl font-black tracking-tight text-parchment-900 dark:text-parchment-50">
        <ScrollText className="h-6 w-6 text-wine-500" /> Patch Notes
      </h2>
      <p className="mb-6 text-sm text-parchment-600 dark:text-parchment-400">
        Todas as atualizações de design do sistema, mais recentes primeiro.
      </p>
      <div className="space-y-6">
        {PATCH_NOTES.map((note) => (
          <PatchNoteCard key={note.version} note={note} />
        ))}
      </div>
    </section>
  );
}
