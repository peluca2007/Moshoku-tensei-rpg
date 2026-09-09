import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, WifiOff } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Sem internet",
};

/**
 * A página que o service worker devolve quando não tem nem rede nem cache
 * (0.1.15).
 *
 * Ela existe pra cobrir UM caso, e é bom que seja pequeno: uma rota que não
 * está na lista de pré-cache do `public/sw.js` — uma URL antiga, um link de
 * fora, uma rota criada depois do último deploy que a pessoa visitou. As nove
 * rotas do site inteiro são guardadas na instalação, então chegar aqui já é
 * exceção.
 *
 * A alternativa era devolver `Response.error()` e deixar aparecer a tela de
 * dinossauro do navegador. Ela não distingue "esta rota não foi guardada" de "o
 * site saiu do ar", e — o que importa mais numa mesa — não diz que a ficha
 * continua ali, salva no aparelho. É a primeira coisa que a pessoa quer saber
 * quando a página não abre.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <PageHeader icon={WifiOff} title="Sem internet">
        Esta página específica não estava guardada no aparelho. O resto do site está.
      </PageHeader>

      <EmptyState
        icon={CloudOff}
        hint={
          <>
            Suas fichas <strong>não</strong> dependem de internet: elas ficam salvas no próprio aparelho e
            continuam inteiras. A exportação em PDF é a única coisa que precisa do servidor — ela volta
            quando o sinal voltar.
          </>
        }
      >
        O sinal sumiu, e esta rota não estava no bornal.
      </EmptyState>

      <nav aria-label="Rotas disponíveis sem internet" className="flex flex-wrap gap-2">
        {[
          { href: "/ficha", label: "Ficha" },
          { href: "/arvores", label: "Árvores" },
          { href: "/personagens", label: "Personagens" },
          { href: "/iniciativa", label: "Iniciativa" },
          { href: "/encontros", label: "Encontros" },
          { href: "/loja", label: "Loja" },
          { href: "/livro", label: "Livro de Regras" },
        ].map((rota) => (
          <Link
            key={rota.href}
            href={rota.href}
            className="lift rounded-full border border-parchment-300 bg-parchment-50/70 px-4 py-2 text-sm font-semibold text-parchment-700 hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:bg-parchment-900/60 dark:text-parchment-200 dark:hover:border-wine-600 dark:hover:text-wine-300"
          >
            {rota.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
