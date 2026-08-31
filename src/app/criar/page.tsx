import Link from "next/link";
import { ListChecks, Dices, ScrollText, Sparkles } from "lucide-react";

const OPTIONS = [
  {
    href: "/criar/manual",
    icon: ListChecks,
    title: "Via 1 — Manual",
    description: "Escolha tudo do zero: raça, antecedente, atributos, árvore inicial e perícias, passo a passo.",
  },
  {
    href: "/criar/roleta",
    icon: Dices,
    title: "Via 2 — Roleta do Destino",
    description:
      "Você escolhe só a Árvore Inicial e as Perícias. Raça, Antecedente e Atributos são sorteados na hora — a loteria do nascimento, sem enrolação.",
  },
  {
    href: "/criar/entrevista",
    icon: ScrollText,
    title: "Via 3 — A Entrevista (O Destino)",
    description:
      "Responda perguntas abstratas sobre uma infância. As respostas certas aumentam a chance de raças e antecedentes específicos — mas nunca a garantem.",
  },
];

export default function CriarPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-black text-parchment-900 dark:text-parchment-50">
          <Sparkles className="h-6 w-6 text-wine-500" /> Como seu personagem vai nascer?
        </h1>
        <p className="mt-2 text-sm text-parchment-600 dark:text-parchment-400">
          Três formas de criar uma ficha — todas terminam no mesmo lugar: uma ficha completa, livre pra editar
          depois como quiser.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {OPTIONS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col rounded-2xl border border-parchment-300 bg-parchment-100/70 p-5 shadow-sm transition-colors hover:border-wine-400 hover:bg-wine-50/60 dark:border-parchment-800 dark:bg-parchment-900/60 dark:hover:border-wine-600 dark:hover:bg-wine-950/30"
          >
            <Icon className="mb-3 h-8 w-8 text-wine-500" />
            <h2 className="mb-1 font-bold text-parchment-900 dark:text-parchment-50">{title}</h2>
            <p className="text-sm text-parchment-600 dark:text-parchment-400">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
