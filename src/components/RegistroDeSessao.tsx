"use client";

import Link from "next/link";
import { Circle, Eraser, NotebookPen, Square } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { resumirSessao, useSessionLog } from "@/store/useSessionLog";

/**
 * O que a mesa mostrou, contado — 0.1.31.
 *
 * ## A pergunta que ele foi feito pra responder
 *
 * O `O-QUE-FALTA` pede contas que só saem no papel, e a do Vendaval é literal:
 * *"conte os ataques corpo a corpo que ACERTARAM o Vendaval e compare com o
 * outro da linha de frente"*. Ninguém faz isso com lápis no meio de uma sessão.
 *
 * A coluna **"Quem apanhou"** é exatamente essa conta, e ela sai de graça: na
 * ficha o dano já é aplicado pelos passos de ±PV, e um passo negativo É um
 * golpe levado. Duas sessões com o registro ligado dizem se o Vendaval alguma
 * vez apanha — que é a pergunta que a árvore inteira depende.
 *
 * (Até a 0.1.36 esses botões viviam no Modo Mesa, que era uma segunda ficha só
 * pra tê-los. A tela saiu, os botões foram pra ficha, e esta conta não mudou de
 * fonte — só de endereço.)
 *
 * ## O que ele NÃO sabe, e por que não finge saber
 *
 * Se um ataque acertou. O site vê a rolagem, não a CA do alvo — quem decide o
 * acerto é o Mestre, na cabeça dele. Uma coluna de "taxa de acerto" aqui seria
 * inventada. O que dá pra afirmar é quantas vezes cada coisa foi ROLADA, quantos
 * críticos caíram, e quanto dano cada personagem levou.
 */
export default function RegistroDeSessao() {
  const gravando = useSessionLog((s) => s.gravando);
  const eventos = useSessionLog((s) => s.eventos);
  const resumo = resumirSessao(eventos);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <PageHeader
        icon={NotebookPen}
        title="Registro de sessão"
        actions={
          <>
            <button
              type="button"
              onClick={() => useSessionLog.getState().alternarGravacao()}
              aria-pressed={gravando}
              className={`flex min-h-[2.25rem] items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold ${
                gravando
                  ? "border-rose-500 bg-rose-600 text-white"
                  : "border-parchment-300 text-parchment-700 hover:border-wine-400 dark:border-parchment-700 dark:text-parchment-200"
              }`}
            >
              {gravando ? <Square className="h-3.5 w-3.5" aria-hidden /> : <Circle className="h-3.5 w-3.5" aria-hidden />}
              {gravando ? "Parar" : "Gravar"}
            </button>
            {eventos.length > 0 && (
              <button
                type="button"
                onClick={() => useSessionLog.getState().limpar()}
                className="flex min-h-[2.25rem] items-center gap-1.5 rounded-full border border-parchment-300 px-3.5 text-xs font-semibold text-parchment-700 hover:border-wine-400 dark:border-parchment-700 dark:text-parchment-200"
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden /> Zerar
              </button>
            )}
          </>
        }
      >
        Ele conta sozinho o que já acontece: cada rolagem do rolador, assinada por quem está agindo, e cada
        golpe levado pelos passos de PV da{" "}
        <Link href="/ficha" className="font-semibold text-wine-700 underline dark:text-wine-300">ficha</Link>.
        Nenhuma digitação.
      </PageHeader>

      {eventos.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          hint={
            gravando
              ? "Está gravando. Role um dado ou mexa nos PV pelos botões da ficha e a contagem começa."
              : "Aperte Gravar antes da sessão. Enquanto está desligado, nada é registrado — e é assim que ele nasce, porque gravar por padrão transformaria toda partida numa coleta silenciosa."
          }
        >
          {gravando ? "Gravando, e ainda sem nada." : "O registro está desligado."}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          <div className="surface grid grid-cols-3 gap-2 rounded-2xl border border-parchment-300 bg-parchment-100/70 p-3 text-center dark:border-parchment-800 dark:bg-parchment-900/60">
            {[
              { valor: resumo.rolagens, rotulo: "rolagens" },
              { valor: resumo.criticos, rotulo: "críticos" },
              { valor: resumo.falhasCriticas, rotulo: "falhas críticas" },
            ].map((n) => (
              <div key={n.rotulo}>
                <p className="text-2xl font-black tabular-nums text-parchment-900 dark:text-parchment-50">
                  {n.valor}
                </p>
                <p className="text-2xs uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                  {n.rotulo}
                </p>
              </div>
            ))}
          </div>

          {resumo.danoPorPersonagem.length > 0 && (
            <section className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-3 dark:border-parchment-800 dark:bg-parchment-900/60">
              <h2 className="mb-1.5 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                Quem apanhou
              </h2>
              <ul className="space-y-1">
                {resumo.danoPorPersonagem.map((d) => (
                  <li key={d.nome} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate text-parchment-800 dark:text-parchment-200">{d.nome}</span>
                    <span className="shrink-0 tabular-nums text-parchment-700 dark:text-parchment-300">
                      <b>{d.total}</b> de dano em {d.golpes} {d.golpes === 1 ? "golpe" : "golpes"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-2xs leading-relaxed text-parchment-600 dark:text-parchment-400">
                É esta coluna que responde a pergunta do Vendaval — <i>ele alguma vez apanha?</i> — comparando
                com o outro da linha de frente. Duas sessões bastam.
              </p>
            </section>
          )}

          {resumo.usoPorRotulo.length > 0 && (
            <section className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-3 dark:border-parchment-800 dark:bg-parchment-900/60">
              <h2 className="mb-1.5 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                O que mais se repetiu
              </h2>
              <ul className="space-y-0.5">
                {resumo.usoPorRotulo.slice(0, 12).map((u) => (
                  <li key={u.rotulo} className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-parchment-800 dark:text-parchment-200">{u.rotulo}</span>
                    <span className="shrink-0 tabular-nums font-bold text-parchment-700 dark:text-parchment-300">
                      {u.vezes}×
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {resumo.rolagensPorAtor.length > 0 && (
            <section className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-3 dark:border-parchment-800 dark:bg-parchment-900/60">
              <h2 className="mb-1.5 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                Rolagens por quem estava agindo
              </h2>
              <ul className="space-y-0.5">
                {resumo.rolagensPorAtor.map((r) => (
                  <li key={r.ator} className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-parchment-800 dark:text-parchment-200">{r.ator}</span>
                    <span className="shrink-0 tabular-nums font-bold text-parchment-700 dark:text-parchment-300">
                      {r.vezes}×
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-2xs text-parchment-600 dark:text-parchment-400">
                Vem do tracker de iniciativa. Rolagem feita fora de combate não tem assinatura, e por isso
                não aparece aqui.
              </p>
            </section>
          )}

          <p className="text-2xs leading-relaxed text-parchment-600 dark:text-parchment-400">
            O registro <b>não sabe se um ataque acertou</b>: ele vê a rolagem, não a CA do alvo — quem decide
            o acerto é o Mestre. Uma taxa de acerto aqui seria número inventado. Tudo fica no seu aparelho, e{" "}
            <b>Zerar</b> apaga.
          </p>
        </div>
      )}
    </div>
  );
}
