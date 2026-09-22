"use client";

import { useState } from "react";
import { Bookmark, FolderOpen, Save, Trash2 } from "lucide-react";
import { useBestiaryStore } from "@/store/useBestiaryStore";
import { useCharacterStore } from "@/store/useCharacterStore";

const campo = "mt-1 block w-full rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 text-sm text-parchment-900 dark:border-parchment-700 dark:bg-parchment-950 dark:text-parchment-50";
const botao = "inline-flex items-center justify-center gap-2 rounded-lg border border-parchment-300 px-3 py-2 text-sm font-semibold text-parchment-700 hover:border-wine-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700 dark:text-parchment-200";

export default function EncounterScenes() {
  const cenas = useBestiaryStore((s) => s.cenas);
  const criaturas = useBestiaryStore((s) => s.criaturas);
  const selecionadas = useBestiaryStore((s) => s.selecionadas);
  const [nome, setNome] = useState("");
  const [notas, setNotas] = useState("");
  const [aberta, setAberta] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [excluida, setExcluida] = useState<(typeof cenas)[number] | null>(null);
  const temCriaturas = criaturas.some((c) => selecionadas.includes(c.id));

  function salvar(atualizar: boolean) {
    const id = useBestiaryStore.getState().salvarCena(nome, notas, atualizar ? aberta : undefined);
    if (id) {
      setAberta(id);
      setMensagem(`“${nome.trim()}” ${atualizar ? "atualizado" : "salvo"} neste navegador.`);
    }
  }

  return (
    <details className="mt-6 rounded-xl border border-parchment-300 bg-parchment-100/60 p-4 dark:border-parchment-800 dark:bg-parchment-900/50">
      <summary className="cursor-pointer font-bold text-parchment-900 dark:text-parchment-50">
        <Bookmark className="mr-2 inline h-4 w-4" aria-hidden /> Encontros salvos ({cenas.length})
      </summary>
      <p className="mt-3 text-xs text-parchment-600 dark:text-parchment-400">
        Guarde as criaturas, quantidades, grupo, armas e semente para outra sessão. Abrir restaura os números das criaturas salvas; as fichas dos jogadores usam seus valores atuais.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-parchment-700 dark:text-parchment-300">
          Nome do encontro
          <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} placeholder="Emboscada na estrada" />
        </label>
        <label className="text-xs font-semibold text-parchment-700 dark:text-parchment-300">
          Notas da cena
          <textarea className={campo} value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} maxLength={4000} placeholder="Objetivo, terreno, pistas e recompensas…" />
        </label>
      </div>
      <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-400">As notas são lembretes para a mesa; não alteram os cálculos.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={botao} disabled={!nome.trim() || !temCriaturas} onClick={() => salvar(false)}><Save className="h-4 w-4" /> Salvar novo encontro</button>
        {aberta && cenas.some((c) => c.id === aberta) && <button type="button" className={botao} disabled={!nome.trim() || !temCriaturas} onClick={() => salvar(true)}>Atualizar encontro aberto</button>}
      </div>
      {!temCriaturas && <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">Marque ao menos uma criatura para salvar o encontro.</p>}
      {cenas.length > 0 && <ul className="mt-4 space-y-2">
        {cenas.map((cena) => <li key={cena.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-parchment-300 p-3 dark:border-parchment-700">
          <div className="min-w-0 flex-1 basis-40">
            <p className="break-words text-sm font-semibold text-parchment-900 dark:text-parchment-50">{cena.nome}</p>
            <p className="text-xs text-parchment-600 dark:text-parchment-400">{cena.criaturas.reduce((n, c) => n + c.quantidade, 0)} criaturas · {cena.grupo.length} personagens · {new Date(cena.atualizadaEm).toLocaleDateString("pt-BR")}</p>
          </div>
          <button type="button" className={botao} aria-label={`Abrir encontro ${cena.nome}`} onClick={() => {
            if (!useBestiaryStore.getState().carregarCena(cena.id)) return;
            setAberta(cena.id); setNome(cena.nome); setNotas(cena.notas);
            const ausentes = cena.grupo.filter((id) => !useCharacterStore.getState().characters[id]).length;
            setMensagem(`“${cena.nome}” aberto.${ausentes ? ` ${ausentes} ficha(s) não estão mais no roster; escolha substitutos no grupo.` : ""}`);
          }}><FolderOpen className="h-4 w-4" /> Abrir</button>
          <button type="button" className={botao} aria-label={`Excluir encontro ${cena.nome}`} onClick={() => {
            setExcluida(cena); useBestiaryStore.getState().removerCena(cena.id); setMensagem(`“${cena.nome}” excluído. As criaturas continuam no bestiário.`);
          }}><Trash2 className="h-4 w-4" /></button>
        </li>)}
      </ul>}
      {mensagem && <p role="status" className="mt-3 text-sm text-parchment-700 dark:text-parchment-300">{mensagem}</p>}
      {excluida && <button type="button" className={`${botao} mt-2`} onClick={() => {
        useBestiaryStore.setState((s) => ({ cenas: [excluida, ...s.cenas.filter((c) => c.id !== excluida.id)] }));
        setMensagem(`“${excluida.nome}” restaurado.`); setExcluida(null);
      }}>Desfazer exclusão de {excluida.nome}</button>}
    </details>
  );
}
