"use client";

import { useEffect, useState } from "react";

/**
 * A bandeja de compartilhamento do sistema — a que abre WhatsApp, Discord,
 * Telegram e AirDrop sem sair da página.
 *
 * ## Por que ela importa aqui
 *
 * O relato que originou isto (2026-09-10) foi: "na hora de exportar/importar
 * ficha para celular é meio chatinho baixar o arquivo". Está certo, e o atrito
 * não é do site — é do celular: baixar um arquivo significa achá-lo depois num
 * gerenciador de arquivos que metade das pessoas nunca abriu. Copiar o link
 * melhora, mas ainda são dois passos e uma troca de aplicativo feita à mão.
 *
 * `navigator.share` colapsa tudo isso num toque: escolhe o contato e pronto.
 *
 * ## O que ela compartilha, e por quê
 *
 * O **link**, e não o arquivo. Um link termina com o amigo abrindo o site já na
 * tela de importar, com um toque; um arquivo termina com ele segurando um
 * `.mtficha` que nenhum aplicativo do telefone sabe abrir. O arquivo continua
 * existindo para o que só ele resolve — levar a foto e a capa junto, que não
 * cabem no link.
 *
 * ## Onde ela não existe
 *
 * Só em contexto seguro (HTTPS ou localhost), e nem todo navegador de desktop
 * tem. Por isso a detecção acontece DEPOIS de montar, e o botão simplesmente
 * não aparece onde não serve: um botão que erra ao ser tocado é pior que um
 * botão ausente, e o "Copiar link" ao lado continua sendo o caminho garantido.
 */
export function usePodeCompartilhar(): boolean {
  const [pode, setPode] = useState(false);

  // Depois de montar, e não durante o render: o servidor não tem `navigator`, e
  // decidir isso no render faria o HTML do servidor divergir do cliente.
  useEffect(() => {
    const checar = () => setPode(typeof navigator !== "undefined" && typeof navigator.share === "function");
    checar();
  }, []);

  return pode;
}

/**
 * `cancelado` não é erro: é a pessoa fechando a bandeja, e a tela não deve
 * piscar mensagem nenhuma por causa disso. O navegador sinaliza esse caso com
 * `AbortError`, e tratá-lo como falha faria o site acusar um problema toda vez
 * que alguém mudasse de ideia.
 */
export type ResultadoDeCompartilhar = "ok" | "cancelado" | "falhou";

export async function compartilhar(dados: { title: string; text?: string; url: string }): Promise<ResultadoDeCompartilhar> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return "falhou";
  try {
    await navigator.share(dados);
    return "ok";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelado";
    console.error("Falha ao compartilhar:", err);
    return "falhou";
  }
}
