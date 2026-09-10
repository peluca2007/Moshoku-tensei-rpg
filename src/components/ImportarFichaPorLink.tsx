"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, UserPlus } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { decodificarFicha } from "@/lib/fichaLink";
import { FalhaDeLink } from "@/lib/diagnosticoDeLink";
import LinkQueFalhou from "@/components/LinkQueFalhou";
import { getRaceById } from "@/data/races";
import { getBackgroundById } from "@/data/backgrounds";
import PageHeader from "@/components/ui/PageHeader";
import Surface from "@/components/ui/Surface";

type Estado =
  | { fase: "lendo" }
  | { fase: "falhou"; falha: FalhaDeLink }
  | { fase: "confirmar"; ficha: Omit<import("@/lib/types").CharacterData, "id"> }
  | { fase: "importada" };

/**
 * A tela que recebe uma ficha vinda de um link.
 *
 * Ela NÃO importa sozinha. O link chegou de outra pessoa, e uma página que
 * grava no `localStorage` do visitante só por ele ter clicado é uma página que
 * pode encher o roster de alguém com fichas que ele não pediu. Então: decodifica,
 * mostra de quem é, e espera o clique.
 *
 * A leitura acontece num `useEffect` porque o dado mora no FRAGMENTO da URL
 * (`#...`), que nunca chega ao servidor — o componente é obrigatoriamente de
 * cliente, e no primeiro render do servidor não existe ficha nenhuma pra
 * mostrar.
 */
export default function ImportarFichaPorLink() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ fase: "lendo" });

  /*
   * A leitura acontece num efeito porque o dado mora no FRAGMENTO da URL, que
   * nunca chega ao servidor — no primeiro render do servidor não existe ficha
   * nenhuma pra mostrar.
   */
  useEffect(() => {
    let vivo = true;
    decodificarFicha(window.location.hash).then((r) => {
      if (!vivo) return;
      setEstado(r.ok ? { fase: "confirmar", ficha: r.conteudo } : { fase: "falhou", falha: r });
    });
    return () => {
      vivo = false;
    };
  }, []);

  /** Segunda chance: o fragmento colado à mão, já recolhido por `LinkQueFalhou`. */
  function lerColado(fragmento: string) {
    setEstado({ fase: "lendo" });
    decodificarFicha(fragmento).then((r) =>
      setEstado(r.ok ? { fase: "confirmar", ficha: r.conteudo } : { fase: "falhou", falha: r })
    );
  }

  function importar() {
    if (estado.fase !== "confirmar") return;
    useCharacterStore.getState().importCharacter(estado.ficha as import("@/lib/types").CharacterData);
    setEstado({ fase: "importada" });
    router.push("/ficha");
  }

  const ficha = estado.fase === "confirmar" ? estado.ficha : null;
  const raca = ficha ? getRaceById(ficha.raceId) : null;
  const antecedente = ficha ? getBackgroundById(ficha.backgroundId) : null;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <PageHeader icon={UserPlus} title="Ficha compartilhada" faixa="/faixas/personagens.jpg" faixaPosition="center 45%">
        Alguém te mandou um personagem. Ele só entra no seu navegador se você mandar.
      </PageHeader>

      {estado.fase === "lendo" && (
        <Surface className="flex items-center justify-center gap-2 p-8 text-sm text-parchment-600 dark:text-parchment-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Lendo o link…
        </Surface>
      )}

      {estado.fase === "falhou" && (
        <LinkQueFalhou falha={estado.falha} oQue="ficha" aoTentarDeNovo={lerColado} />
      )}

      {ficha && (
        <Surface level="raised" className="p-6">
          <p className="text-2xs font-black uppercase tracking-widest text-gold-700 dark:text-gold-400">
            Chegou pra você
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-parchment-900 dark:text-parchment-50">
            {ficha.name || "Sem nome"}
          </h2>
          <p className="mt-1 text-sm text-parchment-600 dark:text-parchment-400">
            {raca?.name ?? "Raça não definida"} · {antecedente?.name ?? "Antecedente não definido"} ·{" "}
            {ficha.purchasedAbilities?.length ?? 0}{" "}
            {(ficha.purchasedAbilities?.length ?? 0) === 1 ? "conhecimento" : "conhecimentos"} ·{" "}
            {ficha.unlockedRanks?.length ?? 0}{" "}
            {(ficha.unlockedRanks?.length ?? 0) === 1 ? "patamar" : "patamares"}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={importar}
              className="flex items-center gap-2 rounded-full bg-wine-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm ring-1 ring-gold-400/30 transition-all hover:-translate-y-0.5 hover:bg-wine-500 hover:shadow-md"
            >
              <Check className="h-4 w-4" /> Adicionar ao meu roster
            </button>
            <Link
              href="/personagens"
              className="flex items-center rounded-full border border-parchment-300 px-5 py-2.5 text-sm font-semibold text-parchment-700 transition-colors hover:border-wine-400 hover:text-wine-600 dark:border-parchment-700 dark:text-parchment-200"
            >
              Agora não
            </Link>
          </div>

          <p className="mt-4 text-xs text-parchment-600 dark:text-parchment-400">
            A ficha entra como uma cópia sua: editar aqui não muda nada pra quem te mandou.
          </p>
        </Surface>
      )}
    </div>
  );
}
