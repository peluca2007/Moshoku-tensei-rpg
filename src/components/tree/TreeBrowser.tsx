"use client";

import { useSearchParams } from "next/navigation";
import { Sparkles, Gem } from "lucide-react";
import { useActiveCharacter } from "@/store/useCharacterStore";
import { getPaSpent } from "@/store/selectors";
import CombinedSpellsPanel from "./CombinedSpellsPanel";
import DestinyBoard from "./DestinyBoard";
import PageHeader from "@/components/ui/PageHeader";
import CountingNumber from "@/components/ui/CountingNumber";

export default function TreeBrowser() {
  const character = useActiveCharacter();
  const paSpent = getPaSpent(character);
  const searchParams = useSearchParams();
  const initialFocusTreeId = searchParams.get("arvore") ?? undefined;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <PageHeader
        icon={Sparkles}
        title="Árvores de Progressão"
        /* O mesmo céu que o mapa usa de fundo — o cabeçalho é a borda de cima
           do tabuleiro, não um objeto separado dele. */
        faixa="/texturas/ceu-arvores.png"
        actions={
          <span
            title="Só informativo — quem controla quanto PA você tem é o Mestre."
            className="flex items-center gap-1 rounded-full bg-gold-500/15 px-3 py-1 text-sm font-bold text-gold-700 ring-1 ring-gold-500/40 backdrop-blur-sm dark:text-gold-300"
          >
            <Gem className="h-4 w-4" /> <CountingNumber value={paSpent} /> PA gastos
          </span>
        }
      >
        Clique num ramo do círculo pra abrir Magia, Corpo ou Utilidade. Cada patamar comprado fica aceso no
        mapa e entra na ficha.
      </PageHeader>

      <DestinyBoard initialFocusTreeId={initialFocusTreeId} />

      <CombinedSpellsPanel />
    </div>
  );
}
