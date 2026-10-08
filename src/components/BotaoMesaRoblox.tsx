"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Dices } from "lucide-react";
import Button from "./ui/Button";
import type { CharacterData } from "@/lib/types";
import { codigoDeMesa } from "@/lib/codigoDeMesa";

type Estado =
  | { tipo: "idle" }
  | { tipo: "copiado"; aviso: string | null }
  | { tipo: "erro"; motivo: string; codigo: string | null };

/**
 * "Copiar para a mesa Roblox" — copia o código de mesa desta ficha
 * (`lib/codigoDeMesa.ts`) para o mestre colar no painel da Mesa Moshoku.
 *
 * Componente próprio, e não mais um estado dentro da ficha: o botão segura o
 * próprio retorno e a ficha ganha só uma linha. Se a área de transferência
 * recusar, o código aparece num campo selecionável para copiar à mão.
 *
 * Quem usa passa `key={character.id}`: trocar de ficha recria o botão, e o
 * retorno da ficha anterior não aparece na nova.
 */
export default function BotaoMesaRoblox({ character }: { character: CharacterData }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "idle" });
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Cada tentativa tem um número; resposta de tentativa antiga (ou de outra ficha) é ignorada.
  const tentativa = useRef(0);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  async function copiar() {
    const minha = ++tentativa.current;
    if (timeout.current) clearTimeout(timeout.current);
    let texto: string | null = null;
    try {
      const resultado = codigoDeMesa(character);
      texto = resultado.texto;
      await navigator.clipboard.writeText(texto);
      if (minha !== tentativa.current) return;
      setEstado({ tipo: "copiado", aviso: resultado.avisos.length ? resultado.avisos.join(" ") : null });
      timeout.current = setTimeout(() => setEstado({ tipo: "idle" }), 2200);
    } catch (err) {
      if (minha !== tentativa.current) return;
      console.error("Falha ao copiar o código para a mesa:", err);
      setEstado({
        tipo: "erro",
        // Sem texto, a ficha não coube no formato da mesa; com texto, quem recusou foi a área de transferência.
        motivo: texto === null && err instanceof Error ? err.message : "A área de transferência recusou a cópia.",
        codigo: texto,
      });
    }
  }

  return (
    <>
      <Button
        variante={estado.tipo === "copiado" ? "confirmado" : "secundario"}
        onClick={copiar}
        title="Copiar o código desta ficha para colar no painel da Mesa Moshoku no Roblox"
      >
        {estado.tipo === "copiado" ? (
          <>
            <Check className="h-3.5 w-3.5" /> Código copiado
          </>
        ) : (
          <>
            <Dices className="h-3.5 w-3.5" /> Copiar para a mesa Roblox
          </>
        )}
      </Button>
      {estado.tipo === "erro" && (
        <span role="alert" className="basis-full text-xs text-wine-500 dark:text-wine-300">
          {estado.motivo}
          {estado.codigo && " Copie o código abaixo à mão:"}
        </span>
      )}
      {estado.tipo === "erro" && estado.codigo && (
        <textarea
          readOnly
          value={estado.codigo}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Código da ficha para a mesa Roblox"
          className="basis-full rounded-md border border-parchment-300 bg-transparent p-2 font-mono text-xs dark:border-parchment-700"
          rows={3}
        />
      )}
      {estado.tipo === "copiado" && estado.aviso && (
        <span className="basis-full text-xs text-parchment-600 dark:text-parchment-300">{estado.aviso}</span>
      )}
    </>
  );
}
