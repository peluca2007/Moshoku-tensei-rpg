"use client";

import { useEffect, useState } from "react";
import { Share, Plus, Smartphone, X } from "lucide-react";

/**
 * O evento que o Chrome dispara quando o site é instalável. Ele não está na
 * tipagem do DOM porque não é padrão — só existe em navegadores baseados em
 * Chromium, e é justamente por isso que o iOS precisa do outro caminho abaixo.
 */
interface EventoDeInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function estaInstalado(): boolean {
  if (typeof window === "undefined") return false;
  // `standalone` é a marca do iOS; o `display-mode` é o resto do mundo.
  const iOS = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iOS || window.matchMedia("(display-mode: standalone)").matches;
}

/**
 * Só o **Safari do iPhone/iPad** consegue adicionar à tela de início. Chrome e
 * Firefox no iOS são o WebKit por dentro, mas não expõem a opção — mandar a
 * instrução pra eles seria mandar a pessoa procurar um botão que não existe.
 */
function ehSafariDoIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  /*
   * O iPad moderno MENTE o user agent — 0.1.61.
   *
   * Desde o iPadOS 13 o Safari do iPad se apresenta como "Macintosh", e some
   * com a palavra "iPad" que este teste procurava. O resultado é que o botão de
   * instalar nunca aparecia num iPad, apesar de a instalação funcionar lá.
   *
   * O sinal que sobra é a combinação: plataforma de Mac COM tela de toque.
   * Nenhum Mac de verdade tem `maxTouchPoints > 1`.
   */
  const iPadMentindo = /macintosh/i.test(ua) && (navigator.maxTouchPoints ?? 0) > 1;
  const iOS = /iphone|ipad|ipod/i.test(ua) || iPadMentindo;
  const outroNavegador = /crios|fxios|edgios|opios/i.test(ua);
  return iOS && !outroNavegador;
}

/**
 * "Instalar o app" — 0.1.20.
 *
 * O site É instalável desde a 0.1.15: tem `manifest.ts`, os três ícones que o
 * `gerar-favicon.mjs` gera, as metas `appleWebApp` do layout e três atalhos de
 * tela inicial. O que faltava não era capacidade, era **descoberta**: instalar
 * dependia de a pessoa caçar "Adicionar à tela de início" no menu do navegador,
 * e quase ninguém sabe que isso existe.
 *
 * ## Dois caminhos, porque são duas plataformas diferentes
 *
 * - **Chromium** (Android, desktop): guarda o `beforeinstallprompt` e chama
 *   `prompt()` no clique. A instalação é de um toque.
 * - **iOS**: o Safari **nunca** dispara esse evento e não tem API de
 *   instalação. Lá o único caminho é a pessoa fazer à mão, e a única coisa que
 *   o site pode fazer é *ensinar* — daí a instrução ilustrada com o ícone real
 *   de Compartilhar do iOS, que é onde a opção mora.
 *
 * Some sozinho quando o app já está instalado: um botão "Instalar" dentro do
 * app instalado é a definição de ruído.
 */
export default function BotaoInstalar() {
  const [evento, setEvento] = useState<EventoDeInstalacao | null>(null);
  const [ensinarIOS, setEnsinarIOS] = useState(false);
  const [instrucaoAberta, setInstrucaoAberta] = useState(false);

  useEffect(() => {
    const decidir = () => {
      if (estaInstalado()) {
        setEvento(null);
        setEnsinarIOS(false);
        return;
      }
      setEnsinarIOS(ehSafariDoIOS());
    };
    decidir();

    const aoPoderInstalar = (e: Event) => {
      // Sem isto o Chrome mostra a barra de instalação DELE, e o site passa a
      // ter duas ofertas de instalação na tela ao mesmo tempo.
      e.preventDefault();
      if (!estaInstalado()) setEvento(e as EventoDeInstalacao);
    };
    const aoInstalar = () => {
      setEvento(null);
      setEnsinarIOS(false);
      setInstrucaoAberta(false);
    };

    window.addEventListener("beforeinstallprompt", aoPoderInstalar);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoPoderInstalar);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    // O evento é de uso único: depois de `prompt()`, chamá-lo de novo lança. O
    // botão sai da tela tenha a pessoa aceitado ou não — se recusou, oferecer
    // de novo no mesmo minuto é insistência.
    await evento.userChoice;
    setEvento(null);
  }

  if (evento) {
    return (
      <button
        type="button"
        onClick={instalar}
        className="lift mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-2xs font-bold text-gold-700 hover:bg-gold-500/20 dark:text-gold-300"
      >
        <Smartphone className="h-3.5 w-3.5" aria-hidden />
        Instalar como app
      </button>
    );
  }

  if (!ensinarIOS) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setInstrucaoAberta((v) => !v)}
        aria-expanded={instrucaoAberta}
        className="lift inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-2xs font-bold text-gold-700 hover:bg-gold-500/20 dark:text-gold-300"
      >
        <Smartphone className="h-3.5 w-3.5" aria-hidden />
        Instalar como app
      </button>

      {instrucaoAberta && (
        <div className="mt-2 max-w-xs rounded-xl border border-parchment-300 bg-parchment-50/80 p-3 text-xs text-parchment-700 dark:border-parchment-700 dark:bg-parchment-900/60 dark:text-parchment-300">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-parchment-800 dark:text-parchment-200">No iPhone, é à mão</p>
            <button
              type="button"
              onClick={() => setInstrucaoAberta(false)}
              aria-label="Fechar instrução"
              className="-m-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-parchment-600 hover:text-wine-600 dark:text-parchment-400"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
          <ol className="mt-1.5 space-y-1.5">
            <li className="flex items-center gap-1.5">
              <span className="font-bold">1.</span> Toque em
              <Share className="h-3.5 w-3.5 shrink-0 text-wine-600 dark:text-wine-300" aria-hidden />
              <span className="font-semibold">Compartilhar</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="font-bold">2.</span> Role e escolha
              <Plus className="h-3.5 w-3.5 shrink-0 text-wine-600 dark:text-wine-300" aria-hidden />
              <span className="font-semibold">Tela de Início</span>
            </li>
          </ol>
          <p className="mt-2 text-2xs text-parchment-600 dark:text-parchment-400">
            Instalado, o site abre sem barra de endereço, funciona sem internet e ganha três atalhos ao
            segurar o ícone: Ficha, Dados e Iniciativa.
          </p>
        </div>
      )}
    </div>
  );
}
