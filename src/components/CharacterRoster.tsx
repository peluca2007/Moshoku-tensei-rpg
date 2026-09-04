"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, User, Check, Upload, Wand2, Heart, Droplets } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { getRaceById } from "@/data/races";
import RaceCrest from "./RaceCrest";
import { getBackgroundById } from "@/data/backgrounds";
import { getCurrentHp, getCurrentMp, getGuildRank, getMaxHp, getMaxMp, getPaSpent } from "@/store/selectors";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";
import { ACEITA_NA_IMPORTACAO, FichaIlegivel, lerArquivoDeFicha } from "@/lib/fichaArquivo";
import type { CharacterData } from "@/lib/types";

/**
 * A barra de PV/PM do card (0.1.12).
 *
 * Ela existe porque o roster era a única tela do site onde o estado do
 * personagem não aparecia: pra saber se o guerreiro do grupo estava com 4 de 62
 * PV era preciso ABRIR a ficha, uma por vez. Numa mesa isso acontece toda
 * rodada, e o Mestre é quem mais paga.
 *
 * O número vem junto com a barra de propósito. Barra sozinha comunica proporção
 * e esconde escala — "meio cheia" é a mesma imagem com 6 PV e com 60 —, e a
 * decisão de mesa ("dá pra aguentar mais um turno?") é sobre a escala.
 */
function BarraDeRecurso({
  icone: Icone,
  rotulo,
  atual,
  maximo,
  className,
}: {
  icone: typeof Heart;
  rotulo: string;
  atual: number;
  maximo: number;
  className: string;
}) {
  const fracao = maximo > 0 ? Math.max(0, Math.min(1, atual / maximo)) : 0;
  return (
    <div className="flex items-center gap-2">
      <Icone className="h-3.5 w-3.5 shrink-0 text-parchment-500 dark:text-parchment-400" aria-hidden />
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-parchment-300/70 dark:bg-parchment-800"
        role="meter"
        aria-valuenow={atual}
        aria-valuemin={0}
        aria-valuemax={maximo}
        aria-label={`${rotulo}: ${atual} de ${maximo}`}
      >
        <div className={`h-full rounded-full transition-[width] ${className}`} style={{ width: `${fracao * 100}%` }} />
      </div>
      <span className="w-16 shrink-0 text-right text-2xs font-semibold tabular-nums text-parchment-600 dark:text-parchment-300">
        {atual}/{maximo}
      </span>
    </div>
  );
}

export default function CharacterRoster() {
  const router = useRouter();
  const order = useCharacterStore((s) => s.order);
  const characters = useCharacterStore((s) => s.characters);
  const activeId = useCharacterStore((s) => s.activeId);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openCharacter(id: string) {
    useCharacterStore.getState().setActiveCharacter(id);
    router.push("/ficha");
  }

  function createAndOpen() {
    useCharacterStore.getState().createCharacter();
    router.push("/ficha");
  }

  /**
   * Aceita o arquivo novo (`.mtficha`, comprimido e com as imagens dentro) E o
   * `.json` antigo. O formato é detectado pelo conteúdo, não pela extensão —
   * ficha de mesa não se abandona por causa de formato, e alguém vai ter um
   * JSON exportado semana passada guardado no Discord.
   */
  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportError(null);
    try {
      const data = await lerArquivoDeFicha(file);
      useCharacterStore.getState().importCharacter(data as CharacterData);
      router.push("/ficha");
    } catch (err) {
      setImportError(
        err instanceof FichaIlegivel ? err.message : "Não foi possível ler esse arquivo."
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <PageHeader
        icon={User}
        title="Meus Personagens"
        faixa="/faixas/personagens.jpg"
        faixaPosition="center 45%"
        actions={
          <>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACEITA_NA_IMPORTACAO}
            onChange={handleImportFile}
            className="hidden"
            /* Quem interage é o botão "Importar ficha" ao lado; este campo é só o
               mecanismo. Sem `aria-hidden` + `tabIndex={-1}` o leitor de tela
               anuncia um campo de arquivo sem nome, e o Tab para nele. */
            aria-hidden
            tabIndex={-1}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 rounded-lg border border-parchment-300 px-3 py-2 text-sm font-medium text-parchment-600 transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
          >
            <Upload className="h-4 w-4" /> Importar ficha
          </button>
          <Link
            href="/criar"
            className="flex items-center gap-1 rounded-lg border border-wine-400 px-3 py-2 text-sm font-medium text-wine-600 transition-colors hover:bg-wine-50 dark:border-wine-600 dark:text-wine-300 dark:hover:bg-wine-950/40"
            title="Escolha entre criação manual, roleta ou entrevista do destino"
          >
            <Wand2 className="h-4 w-4" /> Criar com Guia
          </Link>
          <button
            type="button"
            onClick={createAndOpen}
            className="flex items-center gap-1 rounded-lg bg-wine-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wine-500"
          >
            <Plus className="h-4 w-4" /> Criar Ficha
          </button>
          </>
        }
      >
        Cada ficha vive no seu navegador. Baixe o arquivo da ficha pra levar pra outra máquina — ou pro Mestre. Ele vai comprimido, com a foto e a capa dentro.
      </PageHeader>

      {importError && (
        <p className="mb-4 rounded-lg border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {importError}
        </p>
      )}

      {order.length === 0 && (
        <EmptyState icon={User} hint="Criar com Guia leva você pelas três vias — manual, Roleta do Destino ou a Entrevista.">
          Ninguém nasceu ainda.
        </EmptyState>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {order.map((id) => {
          const character = characters[id];
          if (!character) return null;
          const race = getRaceById(character.raceId);
          const background = getBackgroundById(character.backgroundId);
          const isActive = id === activeId;
          const isConfirming = confirmingId === id;

          return (
            <div
              key={id}
              className={`rounded-2xl border p-4 shadow-sm transition-colors ${
                isActive
                  ? "border-wine-400 bg-wine-50/60 dark:border-wine-500 dark:bg-wine-950/30"
                  : "border-parchment-300 bg-parchment-100/70 dark:border-parchment-800 dark:bg-parchment-900/60"
              }`}
            >
              {/*
                O retrato da raça no card (2026-09-03). Não é a foto de perfil
                que o roster ainda vai ganhar — é o que dá pra mostrar hoje sem
                pedir upload nenhum, e ocupa exatamente o lugar dela: um card de
                ficha que era só nome e dois botões passa a ter uma cara.
              */}
              <div className="mb-3 flex items-start gap-3">
                {/*
                  A FOTO do personagem quando existe; o brasão da raça quando
                  não (0.1.12). O brasão continua sendo o fallback e não um
                  degrau menor: ele resolve o card de quem nunca vai subir foto
                  nenhuma, que é a maioria de uma mesa.
                */}
                {character.portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={character.portrait}
                    alt={`Retrato de ${character.name || "personagem sem nome"}`}
                    width={52}
                    height={52}
                    className="h-[52px] w-[52px] shrink-0 rounded-xl border border-parchment-300/80 object-cover dark:border-parchment-700/80"
                  />
                ) : race ? (
                  <RaceCrest race={race} size={52} rounded="rounded-xl" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-parchment-900 dark:text-parchment-50">
                      {character.name || "Sem nome"}
                    </h2>
                    {isActive && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-wine-500/10 px-2 py-0.5 text-2xs font-semibold text-wine-600 dark:text-wine-300">
                        <Check className="h-3 w-3" /> Ativa
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-parchment-600 dark:text-parchment-400">
                    {race?.name ?? "Raça não definida"} · {background?.name ?? "Antecedente não definido"} ·{" "}
                    {getPaSpent(character)} PA gastos · Rank {getGuildRank(character)} na Guilda
                  </p>
                </div>
              </div>
              <div className="mb-3 space-y-1.5">
                <BarraDeRecurso
                  icone={Heart}
                  rotulo="PV"
                  atual={getCurrentHp(character)}
                  maximo={getMaxHp(character)}
                  className="bg-rose-500/80"
                />
                <BarraDeRecurso
                  icone={Droplets}
                  rotulo="PM"
                  atual={getCurrentMp(character)}
                  maximo={getMaxMp(character)}
                  className="bg-sky-500/80"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openCharacter(id)}
                  /* Era branco puro no tema escuro — o elemento mais claro de qualquer
                     tela do site, num botão secundário. Vinho é a cor de ação do
                     projeto e já é o que a landing e a loja usam. */
                  className="flex-1 rounded-lg bg-wine-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-wine-500 hover:shadow-md"
                >
                  Abrir Ficha
                </button>
                {isConfirming ? (
                  <button
                    type="button"
                    onClick={() => {
                      useCharacterStore.getState().deleteCharacter(id);
                      setConfirmingId(null);
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-500"
                  >
                    Confirmar?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(id)}
                    aria-label={`Apagar ${character.name || "personagem sem nome"}`}
                    className="rounded-lg border border-parchment-300 p-1.5 text-parchment-400 transition-colors hover:border-rose-300 hover:text-rose-500 dark:border-parchment-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
