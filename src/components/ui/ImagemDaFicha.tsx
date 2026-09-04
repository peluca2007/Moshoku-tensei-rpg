"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import {
  bytesNoArmazenamento,
  cabeNoOrcamento,
  ImagemRecusada,
  LIMITES_DE_IMAGEM,
  prepararImagem,
  type TipoDeImagem,
} from "@/lib/imagemDaFicha";

/**
 * O botão que troca a foto de perfil ou a capa da ficha.
 *
 * Um componente só para os dois porque a diferença entre eles é inteiramente
 * dado (`LIMITES_DE_IMAGEM[tipo]`) — o que muda é o lado máximo e o teto de
 * bytes, e nada disso é comportamento.
 *
 * O que ele não faz de propósito: gravar antes de saber que cabe. A ordem é
 * sempre reduzir → conferir o orçamento do `localStorage` → só então chamar o
 * `onChange`. Gravar primeiro e descobrir a cota depois é como se perde um
 * roster inteiro, porque o `setItem` que estoura é o que salva TODAS as fichas.
 */
export default function ImagemDaFicha({
  tipo,
  valorAtual,
  onChange,
  rotulo,
  className = "",
}: {
  tipo: TipoDeImagem;
  /** O data URL que já está na ficha, se houver — usado pra medir a troca. */
  valorAtual?: string;
  onChange: (dataUrl: string | null) => void;
  /** O que o botão diz quando não há imagem ainda. */
  rotulo: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const erroId = useId();

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErro(null);
    setOcupado(true);
    try {
      const { dataUrl, bytes } = await prepararImagem(file, tipo);
      const saem = valorAtual ? bytesNoArmazenamento(valorAtual) : 0;
      if (!cabeNoOrcamento(bytes, saem)) {
        setErro(
          "O armazenamento do navegador está quase cheio. Apague a imagem de outra ficha " +
            "(ou uma ficha inteira) antes de adicionar esta."
        );
        return;
      }
      onChange(dataUrl);
    } catch (err) {
      setErro(
        err instanceof ImagemRecusada
          ? err.message
          : "Não consegui preparar essa imagem. Tente outra."
      );
    } finally {
      setOcupado(false);
    }
  }

  const limite = LIMITES_DE_IMAGEM[tipo];

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={escolher}
          className="hidden"
          aria-hidden
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={ocupado}
          aria-describedby={erro ? erroId : undefined}
          title={`Máx. ${limite.ladoMaior}px de lado; a imagem é reduzida no seu navegador e nunca sai dele`}
          className="flex items-center gap-1.5 rounded-full border border-parchment-300 bg-parchment-50/90 px-3 py-1.5 text-xs font-semibold text-parchment-700 shadow-sm transition-colors hover:bg-parchment-100 disabled:cursor-wait disabled:opacity-60 dark:border-parchment-700 dark:bg-parchment-900/90 dark:text-parchment-200 dark:hover:bg-parchment-800"
        >
          {ocupado ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {ocupado ? "Preparando..." : valorAtual ? `Trocar ${limite.curto}` : rotulo}
        </button>
        {valorAtual && (
          <button
            type="button"
            onClick={() => {
              setErro(null);
              onChange(null);
            }}
            className="flex items-center gap-1.5 rounded-full border border-parchment-300 bg-parchment-50/90 px-3 py-1.5 text-xs font-semibold text-parchment-600 shadow-sm transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-parchment-700 dark:bg-parchment-900/90 dark:text-parchment-300"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remover {limite.curto}
          </button>
        )}
      </div>
      {erro && (
        <p id={erroId} role="alert" className="mt-2 max-w-md text-xs text-rose-600 dark:text-rose-300">
          {erro}
        </p>
      )}
    </div>
  );
}
