"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CloudOff, RefreshCw, TriangleAlert } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { useRedeOffline } from "@/lib/useRedeOffline";

/**
 * A tela de erro de execução — 0.1.18.
 *
 * Sem este arquivo, um erro em qualquer componente cai na tela padrão do
 * framework. Isso ficou pior depois da 0.1.15: **offline, aquela tela é
 * indistinguível de "faltou rede"**, e quem está numa mesa sem sinal não tem
 * como saber se acabou de perder a ficha.
 *
 * Por isso as duas coisas que esta página faz e a padrão não faz:
 *
 * 1. **Diz qual dos dois é.** Com a rede caída, o texto muda: o mais provável é
 *    que a página tenha pedido algo que só existe no servidor, e não que o site
 *    esteja quebrado. Com rede, assume o defeito sem rodeio.
 * 2. **Afirma que as fichas continuam no aparelho.** É a primeira pergunta de
 *    quem vê uma tela de erro no meio de uma sessão, e a resposta é sempre a
 *    mesma — elas vivem no `localStorage`, não nesta página.
 *
 * O `retry()` (que em versões anteriores do App Router se chamava `reset`) manda
 * o React montar o segmento de novo. Vale a tentativa: boa parte dos erros de
 * render vem de um estado que já mudou desde então.
 *
 * **Limite conhecido:** um erro dentro do próprio layout raiz (`ThemeProvider`,
 * `StoreHydration`) acontece ACIMA deste limite e continua caindo na tela do
 * framework. Cobri-lo pede um `global-error.tsx`, que reimplementa `<html>` e
 * `<body>` por fora do layout — dívida anotada, não esquecimento.
 */
export default function ErroDeExecucao({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const offline = useRedeOffline();

  useEffect(() => {
    // Não há serviço de telemetria neste projeto: o console é o único lugar
    // onde o erro real sobrevive pra quem for investigar depois.
    console.error("[erro de execução]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <PageHeader
        icon={offline ? CloudOff : TriangleAlert}
        title={offline ? "Sem sinal, e esta tela parou" : "Alguma coisa quebrou aqui"}
      >
        {offline
          ? "O aparelho está sem rede. O site inteiro funciona offline, então o mais provável é que esta tela tenha pedido algo que só existe no servidor."
          : "Um erro de execução interrompeu esta tela. Não é a sua ficha: é o código desta página."}
      </PageHeader>

      <EmptyState
        icon={offline ? CloudOff : TriangleAlert}
        hint={
          <>
            Suas fichas <strong>não</strong> foram perdidas. Elas ficam salvas no próprio aparelho e não
            dependem desta tela nem de internet — abrir <Link href="/personagens" className="font-semibold text-wine-700 underline underline-offset-2 dark:text-wine-300">Meus personagens</Link> mostra todas elas do mesmo jeito.
          </>
        }
      >
        {offline ? "Sem rede, e esta parte precisava dela." : "A página parou no meio."}
      </EmptyState>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={retry}
          className="lift inline-flex items-center gap-2 rounded-full border border-wine-500 bg-wine-600 px-4 py-2 text-sm font-semibold text-parchment-50 hover:bg-wine-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Tentar de novo
        </button>
        {[
          { href: "/personagens", label: "Meus personagens" },
          { href: "/ficha", label: "Ficha" },
          { href: "/livro", label: "Livro de Regras" },
          { href: "/", label: "Início" },
        ].map((rota) => (
          <Link
            key={rota.href}
            href={rota.href}
            className="lift rounded-full border border-parchment-300 bg-parchment-50/70 px-4 py-2 text-sm font-semibold text-parchment-700 hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:bg-parchment-900/60 dark:text-parchment-200 dark:hover:border-wine-600 dark:hover:text-wine-300"
          >
            {rota.label}
          </Link>
        ))}
      </div>

      {/*
        O `digest` é o único fio entre esta tela e o log do servidor: em
        produção a mensagem do erro é apagada de propósito (ela pode conter
        caminho de arquivo e dado interno), e sobra este código. Sem ele
        impresso, um relato de bug chega como "deu erro" e não há o que
        procurar do outro lado.
      */}
      {error.digest && (
        <p className="text-xs text-parchment-600 dark:text-parchment-400">
          Se for relatar isto, mande junto o código do erro: <code>{error.digest}</code>
        </p>
      )}
    </div>
  );
}
