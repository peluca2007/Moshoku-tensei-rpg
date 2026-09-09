"use client";

import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { PATCH_NOTES } from "@/data/patchNotes";

/**
 * Liga o service worker e conta ao usuário o que está acontecendo (0.1.15).
 *
 * Três coisas, todas pequenas:
 *
 * 1. **Registra o `/sw.js`**, que é quem faz o site abrir sem internet.
 * 2. **Avisa quando a rede caiu** — porque o site continuar funcionando offline
 *    é ótimo, mas *parecer* que continua online é como o usuário descobre tarde
 *    demais que a exportação em PDF não vai sair.
 * 3. **Oferece a atualização** quando uma versão nova terminou de baixar.
 *
 * ## A versão vai na URL do worker
 *
 * `?v=0.1.15` sai daqui, do `PATCH_NOTES`, e não de uma constante própria — uma
 * segunda fonte de verdade pra versão seria uma que alguém esquece de subir, e
 * o sintoma disso é o pior possível: o site servindo a versão passada, do
 * cache, sem nada indicando que é a passada. Ver o cabeçalho de `public/sw.js`
 * pro que essa URL faz lá dentro.
 */
const VERSAO = PATCH_NOTES[0]?.version ?? "0";

export default function SuporteOffline() {
  const [offline, setOffline] = useState(false);
  const [temAtualizacao, setTemAtualizacao] = useState(false);

  /*
   * O estado da rede.
   *
   * `navigator.onLine` mente pra cima: um celular no wi-fi de um hotel sem
   * internet do outro lado continua "online". Mentir pra cima é o lado certo
   * de errar aqui — o preço de um falso "online" é o usuário tentar exportar um
   * PDF e receber um erro, e o de um falso "offline" seria uma tarja
   * permanente num site que está funcionando perfeitamente.
   */
  useEffect(() => {
    const atualizar = () => setOffline(!navigator.onLine);
    atualizar();
    window.addEventListener("online", atualizar);
    window.addEventListener("offline", atualizar);
    return () => {
      window.removeEventListener("online", atualizar);
      window.removeEventListener("offline", atualizar);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    /*
     * Em desenvolvimento o worker não entra — e mais: um que tenha sobrado de
     * uma sessão anterior é REMOVIDO.
     *
     * O `next dev` reescreve os chunks a cada edição, com URLs novas, e um
     * cache-primeiro em cima disso serve o JavaScript de dez minutos atrás
     * enquanto você jura que salvou o arquivo. É a categoria de bug em que se
     * perde uma tarde antes de desconfiar do cache — então nem chega a existir.
     */
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registros) => {
        for (const registro of registros) registro.unregister();
      });
      return;
    }

    let cancelado = false;

    navigator.serviceWorker
      .register(`/sw.js?v=${VERSAO}`, { scope: "/", updateViaCache: "none" })
      .then((registro) => {
        if (cancelado) return;

        // Uma versão nova já estava esperando desde antes desta aba abrir.
        if (registro.waiting) setTemAtualizacao(true);

        registro.addEventListener("updatefound", () => {
          const novo = registro.installing;
          if (!novo) return;
          novo.addEventListener("statechange", () => {
            /*
             * `installed` + já existir um controller = é uma ATUALIZAÇÃO, e não
             * a primeira instalação. Sem a segunda metade da condição, a
             * primeira visita de todas mostraria "nova versão disponível" pra
             * quem acabou de abrir o site pela primeira vez.
             */
            if (novo.state === "installed" && navigator.serviceWorker.controller) setTemAtualizacao(true);
          });
        });
      })
      .catch(() => {
        /*
         * Registro pode falhar por motivo legítimo e fora do nosso alcance —
         * aba anônima, service worker desligado na política do navegador. O
         * site inteiro funciona sem ele; só não funciona sem rede. Não há o que
         * dizer ao usuário aqui.
         */
      });

    return () => {
      cancelado = true;
    };
  }, []);

  /**
   * Manda o worker que está esperando assumir, e recarrega quando ele assumir.
   *
   * O recarregamento é ouvindo `controllerchange`, e não um `reload()` logo
   * depois do `postMessage`: o `skipWaiting` é assíncrono, e recarregar antes
   * dele terminar reabre a página no worker VELHO — o botão pareceria não ter
   * feito nada, e clicar de novo daria no mesmo.
   */
  function atualizarAgora() {
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    navigator.serviceWorker.getRegistration().then((registro) => {
      registro?.waiting?.postMessage("ASSUMIR_AGORA");
    });
  }

  if (!offline && !temAtualizacao) return null;

  return (
    /*
     * Uma faixa no fluxo da página, logo abaixo do menu — e NÃO uma tarja
     * flutuante.
     *
     * A primeira versão era `fixed` no rodapé, centralizada. Num print da
     * `/ficha` ela apareceu por cima do botão de rolar dados (`DiceRoller`,
     * `fixed bottom-5 right-5`), que é o controle mais usado do site inteiro,
     * e no `/arvores` ela dividiria o mesmo pixel e o mesmo `z-50` com o aviso
     * do `DestinyBoard`. O canto de baixo já tinha dois donos.
     *
     * No fluxo, ela empurra o conteúdo em vez de cobri-lo. O deslocamento
     * acontece só quando a rede cai ou volta — que é raro, e é justamente a
     * hora em que mexer na página é a forma de avisar.
     *
     * `print-hide` porque nada disto faz sentido numa ficha impressa; é a mesma
     * classe do rodapé.
     */
    <div className="print-hide border-b border-gold-500/30 bg-parchment-100/95 backdrop-blur-sm dark:border-gold-400/20 dark:bg-parchment-900/95">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        {offline ? (
          /*
           * O ícone é INLINE, e não um item de flex ao lado do parágrafo.
           * Como flex, com o texto quebrando em duas linhas no celular, ele
           * ficava sozinho na margem esquerda a meia tela de distância da
           * frase que ele ilustra — visto em print. Inline ele gruda na
           * primeira palavra e quebra junto com ela.
           */
          <p
            role="status"
            className="text-center text-xs font-semibold text-parchment-700 dark:text-parchment-300"
          >
            <CloudOff className="mr-1.5 inline h-4 w-4 align-[-3px] text-wine-600 dark:text-wine-400" aria-hidden />
            Sem internet — o site e as fichas continuam funcionando. Só o PDF precisa de sinal.
          </p>
        ) : null}

        {temAtualizacao ? (
          <p
            role="status"
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-xs font-semibold text-parchment-700 dark:text-parchment-300"
          >
            <span>Uma versão nova do site já baixou.</span>
            <button
              type="button"
              onClick={atualizarAgora}
              className="lift inline-flex items-center gap-1.5 rounded-full bg-wine-600 px-3 py-1.5 font-bold text-parchment-50 hover:bg-wine-700"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Atualizar
            </button>
          </p>
        ) : null}
      </div>
    </div>
  );
}
