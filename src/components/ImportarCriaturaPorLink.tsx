"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Link2Off, Loader2, Skull } from "lucide-react";
import { useBestiaryStore } from "@/store/useBestiaryStore";
import { decodificarCriatura } from "@/lib/criaturaLink";
import { rotuloPatamar } from "@/data/bestiary";
import PageHeader from "@/components/ui/PageHeader";
import Surface from "@/components/ui/Surface";
import type { CriaturaEncontro } from "@/lib/encounterSim";

type Estado =
  | { fase: "lendo" }
  | { fase: "invalido" }
  | { fase: "confirmar"; criatura: Omit<CriaturaEncontro, "id"> }
  | { fase: "importada" };

/**
 * A tela que recebe uma criatura vinda de um link — irmã de
 * `ImportarFichaPorLink.tsx`, mesma razão de existir: um Mestre passando um
 * chefe pronto pra outro Mestre não deveria precisar de arquivo solto pra isso.
 *
 * Mesma cautela também: ela NÃO importa sozinha. Decodifica, mostra o que
 * chegou, e só grava no bestiário do visitante depois do clique.
 */
export default function ImportarCriaturaPorLink() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ fase: "lendo" });

  useEffect(() => {
    let vivo = true;
    decodificarCriatura(window.location.hash).then((criatura) => {
      if (!vivo) return;
      setEstado(criatura ? { fase: "confirmar", criatura } : { fase: "invalido" });
    });
    return () => {
      vivo = false;
    };
  }, []);

  function importar() {
    if (estado.fase !== "confirmar") return;
    useBestiaryStore.getState().importarCriatura(estado.criatura);
    setEstado({ fase: "importada" });
    router.push("/encontros");
  }

  const criatura = estado.fase === "confirmar" ? estado.criatura : null;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <PageHeader icon={Skull} title="Criatura compartilhada" faixa="/faixas/encontros.jpg" faixaPosition="center 60%">
        Outro Mestre te mandou uma criatura. Ela só entra no seu bestiário se você mandar.
      </PageHeader>

      {estado.fase === "lendo" && (
        <Surface className="flex items-center justify-center gap-2 p-8 text-sm text-parchment-600 dark:text-parchment-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Lendo o link…
        </Surface>
      )}

      {estado.fase === "invalido" && (
        <Surface level="sunken" className="flex flex-col items-center gap-3 p-8 text-center">
          <Link2Off className="h-9 w-9 text-parchment-400 dark:text-parchment-700" aria-hidden />
          <p className="font-display text-base font-bold text-parchment-800 dark:text-parchment-200">
            Este link não traz uma criatura.
          </p>
          <p className="max-w-sm text-xs text-parchment-600 dark:text-parchment-400">
            Ele pode ter sido cortado no caminho — aplicativos de mensagem às vezes quebram links longos em
            duas linhas. Peça pra reenviar, de preferência dentro de um bloco de código, ou peça o arquivo{" "}
            <code>.mtcriatura</code> e use o <b>Importar criatura</b> em{" "}
            <Link href="/encontros" className="text-wine-600 underline dark:text-wine-300">
              Encontros
            </Link>
            .
          </p>
        </Surface>
      )}

      {criatura && (
        <Surface level="raised" className="p-6">
          <p className="text-2xs font-black uppercase tracking-widest text-gold-700 dark:text-gold-400">
            Chegou pra você
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-parchment-900 dark:text-parchment-50">
            {criatura.nome || "Sem nome"}
          </h2>
          <p className="mt-1 text-sm text-parchment-600 dark:text-parchment-400">
            {rotuloPatamar(criatura.patamar)} · {criatura.papel} · {criatura.pv} PV · CA {criatura.ca} ·{" "}
            {criatura.acoes.length} {criatura.acoes.length === 1 ? "ação" : "ações"}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={importar}
              className="flex items-center gap-2 rounded-full bg-wine-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm ring-1 ring-gold-400/30 transition-all hover:-translate-y-0.5 hover:bg-wine-500 hover:shadow-md"
            >
              <Check className="h-4 w-4" /> Adicionar ao meu bestiário
            </button>
            <Link
              href="/encontros"
              className="flex items-center rounded-full border border-parchment-300 px-5 py-2.5 text-sm font-semibold text-parchment-700 transition-colors hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:text-parchment-200"
            >
              Agora não
            </Link>
          </div>

          <p className="mt-4 text-xs text-parchment-600 dark:text-parchment-400">
            A criatura entra como uma cópia sua: editar aqui não muda nada pra quem te mandou.
          </p>
        </Surface>
      )}
    </div>
  );
}
