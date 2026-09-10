"use client";

import { useEffect, useState } from "react";

/**
 * `true` quando o navegador diz que não há rede.
 *
 * `navigator.onLine` **mente pra cima**: um celular no wi-fi de um hotel sem
 * internet do outro lado continua "online". Mentir pra cima é o lado certo de
 * errar aqui — o preço de um falso "online" é a pessoa tentar exportar um PDF e
 * receber um erro; o de um falso "offline" seria uma tarja permanente num site
 * que está funcionando perfeitamente.
 *
 * Começa em `false` e só é medido depois de montar, de propósito: o servidor
 * não tem `navigator`, e um valor diferente entre servidor e cliente é erro de
 * hidratação.
 *
 * Dois lugares leem isto e precisam ler a MESMA coisa: a tarja de
 * `SuporteOffline` e o `error.tsx`, que usa a resposta pra dizer se o que
 * aconteceu foi um defeito ou só falta de sinal.
 */
export function useRedeOffline(): boolean {
  const [offline, setOffline] = useState(false);

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

  return offline;
}
