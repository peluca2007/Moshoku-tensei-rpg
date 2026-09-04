import Link from "next/link";
import { ListChecks, Dices, ScrollText, Sparkles } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Surface from "@/components/ui/Surface";

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
      <PageHeader
        icon={Sparkles}
        title="Como seu personagem vai nascer?"
        faixa="/faixas/criar.jpg"
        faixaPosition="center 55%"
      >
        Três formas de criar uma ficha — todas terminam no mesmo lugar: uma ficha completa, livre pra
        editar depois como quiser.
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {OPTIONS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group block focus-visible:outline-none">
            <Surface level="raised" interactive className="flex h-full flex-col p-5">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-wine-600/10 text-wine-600 ring-1 ring-wine-500/25 transition-colors group-hover:bg-wine-600 group-hover:text-parchment-50 dark:bg-wine-500/15 dark:text-wine-300">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mb-1 font-display font-bold text-parchment-900 dark:text-parchment-50">{title}</h2>
              <p className="text-sm leading-relaxed text-parchment-600 dark:text-parchment-400">{description}</p>
            </Surface>
          </Link>
        ))}
      </div>
    </div>
  );
}
