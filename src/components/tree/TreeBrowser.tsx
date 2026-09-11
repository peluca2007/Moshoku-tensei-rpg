"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Gem, List, Compass } from "lucide-react";
import { useActiveCharacter } from "@/store/useCharacterStore";
import { getPaSpent } from "@/store/selectors";
import CombinedSpellsPanel from "./CombinedSpellsPanel";
import DestinyBoard from "./DestinyBoard";
import ListaDeArvores from "./ListaDeArvores";
import PageHeader from "@/components/ui/PageHeader";
import CountingNumber from "@/components/ui/CountingNumber";

type Modo = "mapa" | "lista";

/** 640px é o `sm` do Tailwind — o mesmo corte que o resto do site já usa. */
const CONSULTA = "(max-width: 639px)";

function assinarTelaPequena(aoMudar: () => void): () => void {
  const mql = window.matchMedia(CONSULTA);
  mql.addEventListener("change", aoMudar);
  return () => mql.removeEventListener("change", aoMudar);
}

function ehTelaPequena(): boolean {
  return window.matchMedia(CONSULTA).matches;
}

/**
 * A tela de árvores, em dois modos — 0.1.43.
 *
 * O mapa radial era o único jeito de navegar, em qualquer tela. Num celular
 * isso são dezenove árvores e seis patamares cada, espremidos em 390px e
 * alcançados por pinça e arrasto. O relato que gerou esta mudança foi do autor,
 * num aparelho de verdade: *"achei bem ruim navegar pelas árvores"* — e nenhum
 * script tinha como dizer isso, porque `check:mobile` mede transbordo e alvo de
 * toque, e os dois passavam.
 *
 * O padrão vem da LARGURA e acompanha ela ao vivo: lista abaixo de 640px, mapa
 * acima. O botão fica visível nos dois, porque a largura é um palpite sobre o
 * aparelho e não sobre a pessoa — quem quiser o mapa no celular toca e tem, e a
 * escolha dela passa a vencer o palpite.
 */
export default function TreeBrowser() {
  const character = useActiveCharacter();
  const paSpent = getPaSpent(character);
  const searchParams = useSearchParams();
  const initialFocusTreeId = searchParams.get("arvore") ?? undefined;

  /*
   * O modo padrão vem da LARGURA, e a escolha explícita vence.
   *
   * `useSyncExternalStore` em vez de medir num `useEffect`: o efeito daria um
   * render a mais em toda visita de celular (o mapa monta, mede, joga fora e
   * monta a lista), e o mapa é o componente mais caro do site. Aqui o servidor
   * responde "tela grande" e o cliente corrige na primeira leitura, sem
   * `setState` em cascata.
   *
   * `escolhido` é null até alguém tocar no botão — é o que faz a preferência da
   * pessoa vencer o palpite sobre o aparelho sem apagá-lo antes da hora.
   */
  const telaPequena = useSyncExternalStore(assinarTelaPequena, ehTelaPequena, () => false);
  const [escolhido, setEscolhido] = useState<Modo | null>(null);
  // Um link com ?arvore=... quer o mapa focado naquela árvore: a lista não sabe
  // focar, e mandar a pessoa pro modo errado desperdiçaria o link.
  const modo: Modo = escolhido ?? (initialFocusTreeId ? "mapa" : telaPequena ? "lista" : "mapa");
  const setModo = useCallback((m: Modo) => setEscolhido(m), []);

  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "warning" } | null>(null);
  const showToast = (message: string, type: "info" | "success" | "warning" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

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
        {modo === "mapa"
          ? "Toque num ramo do círculo pra abrir Magia, Corpo ou Utilidade. Cada patamar comprado fica aceso no mapa e entra na ficha."
          : "Pilar, árvore, patamar — três toques até qualquer habilidade. Cada compra entra na ficha na hora."}
      </PageHeader>

      {/*
        O alternador. Dois botões visíveis em vez de um interruptor: "Mapa" e
        "Lista" dizem o que vão entregar, e um interruptor rotulado "modo lista"
        obriga a pessoa a lembrar em qual estado ele está.
      */}
      <div
        role="group"
        aria-label="Como ver as árvores"
        className="mb-3 inline-flex rounded-full border border-parchment-300 bg-parchment-100/70 p-0.5 dark:border-parchment-800 dark:bg-parchment-900/60"
      >
        {([
          { id: "mapa" as const, rotulo: "Mapa", Icone: Compass },
          { id: "lista" as const, rotulo: "Lista", Icone: List },
        ]).map(({ id, rotulo, Icone }) => (
          <button
            key={id}
            type="button"
            onClick={() => setModo(id)}
            aria-pressed={modo === id}
            className={`flex min-h-[2.25rem] items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-colors ${
              modo === id
                ? "bg-wine-600 text-white"
                : "text-parchment-600 hover:text-wine-600 dark:text-parchment-400 dark:hover:text-wine-300"
            }`}
          >
            <Icone className="h-3.5 w-3.5" aria-hidden /> {rotulo}
          </button>
        ))}
      </div>

      {modo === "mapa" ? (
        <DestinyBoard initialFocusTreeId={initialFocusTreeId} />
      ) : (
        <ListaDeArvores showToast={showToast} />
      )}

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`area-segura-fundo-8 fixed left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "border-emerald-400 bg-emerald-600 text-white"
              : toast.type === "warning"
                ? "border-amber-400 bg-amber-600 text-white"
                : "border-parchment-600 bg-parchment-900 text-white"
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <CombinedSpellsPanel />
    </div>
  );
}
