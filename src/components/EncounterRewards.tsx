"use client";
import { useState } from "react";
import { gerarLootDoEncontro, gerarRecompensaDoEncontro } from "@/lib/lootGenerator";
import { getSubArquetipo, recompensaDaCriatura } from "@/data/bestiary";
import { useBestiaryStore } from "@/store/useBestiaryStore";
import { tocarSeLigado } from "@/lib/tocadorDaArena";

export default function EncounterRewards({ tamanhoGrupo }: { tamanhoGrupo: number }) {
  const configuracao = useBestiaryStore((s) => s.configuracao);
  const configurar = useBestiaryStore((s) => s.configurarEncontro);
  const criaturas = useBestiaryStore((s) => s.criaturas);
  const selecionadas = useBestiaryStore((s) => s.selecionadas);
  const [copiado, setCopiado] = useState(false);
  const recompensa = configuracao.recompensa ?? { orcamento: 0, semente: configuracao.semente };
  /*
   * O espólio sai de QUEM foi derrotado (2026-09-23).
   *
   * Antes a tela sorteava dentro do catálogo inteiro, então um bando de lobos
   * podia largar uma poção de mana. Agora os sub-arquétipos das criaturas em
   * cena decidem o que o corpo deixa e quanto disso vem em moeda — um lobo não
   * carrega bolsa, um bandido carrega.
   */
  const emCena = criaturas.filter((c) => selecionadas.includes(c.id));
  const subArquetipos = emCena.map((c) => c.subArquetipo).filter((s): s is string => Boolean(s));
  /*
   * A conta do Apêndice G (2026-10-07): cada criatura vale base do patamar ×
   * papel × arquétipo × sub-arquétipo. O Mestre ainda pode escrever outro valor;
   * uma cena salva antes disso com orçamento acima de 0 continua com o dela.
   */
  const porCriatura = emCena.map((c) => ({
    nome: c.nome,
    quantidade: Math.max(0, c.quantidade),
    subArquetipo: c.subArquetipo,
    valor: recompensaDaCriatura({
      patamar: c.patamar,
      papel: c.papel,
      arquetipo: c.arquetipo,
      subArquetipo: c.subArquetipo,
      temImunidade: (c.imunidades ?? []).length > 0,
    }),
  }));
  const valorDoLivro = porCriatura.reduce((soma, c) => soma + c.valor * c.quantidade, 0);
  const manual = recompensa.manual ?? recompensa.orcamento > 0;
  const loot = manual
    ? gerarLootDoEncontro(recompensa.orcamento, recompensa.semente, subArquetipos)
    : gerarRecompensaDoEncontro(
        porCriatura.flatMap((c) => Array.from({ length: c.quantidade }, () => ({ valor: c.valor, subArquetipo: c.subArquetipo }))),
        recompensa.semente
      );
  const texto = [
    `Recompensa do encontro: ${loot.valorTotal} PO de valor total`,
    `${loot.moedas} PO em moedas`,
    ...loot.tralhas.map((i) => `• ${i.name} (${i.price} PO, vende a 100%): ${i.description}`),
    ...loot.itens.map((i) => `• ${i.name} (${i.price} PO, vende a 50%): ${i.description}`),
  ].join("\n");
  return <details className="mt-6 rounded-xl border border-parchment-300 p-4 dark:border-parchment-700">
    <summary className="cursor-pointer font-semibold">Recompensas</summary>
    <p className="mt-2 text-sm text-parchment-600 dark:text-parchment-400">{manual ? "Valor escrito pelo Mestre, no lugar da conta do livro." : "A conta do Apêndice G: cada criatura vale a base do patamar × papel × arquétipo × sub-arquétipo, e o sub-arquétipo decide quanto vem em moeda e quanto em espólio."} Os itens e preços são os da Loja da Guilda, e a escolha fica salva com a cena.</p>
    {!manual && porCriatura.length > 0 && <ul className="mt-2 space-y-0.5 text-xs text-parchment-600 dark:text-parchment-400">{porCriatura.map((c, indice) => <li key={`${c.nome}-${indice}`}>{c.nome}{c.quantidade > 1 ? ` ×${c.quantidade}` : ""}: {c.valor} PO{c.quantidade > 1 ? " cada" : ""}{c.subArquetipo ? ` · ${getSubArquetipo(c.subArquetipo)?.nome ?? c.subArquetipo}` : ""}</li>)}</ul>}
    <div className="my-3 flex flex-wrap items-end gap-3">
      <label className="text-sm">Valor (PO)<input aria-label="Valor da recompensa em PO" type="number" min={0} max={1000000} step={1} value={manual ? recompensa.orcamento : valorDoLivro} onChange={(e) => configurar({ recompensa: { ...recompensa, manual: true, orcamento: Math.min(1000000, Math.max(0, Math.trunc(Number(e.target.value) || 0))) } })} className="mt-1 block w-36 rounded-lg border border-parchment-300 bg-parchment-50 px-3 py-2 dark:border-parchment-700 dark:bg-parchment-950" /></label>
      {manual && <button type="button" onClick={() => configurar({ recompensa: { ...recompensa, manual: false, orcamento: 0 } })} className="rounded-lg border border-parchment-300 px-3 py-2 text-sm dark:border-parchment-700">Voltar à conta do livro</button>}
      <button type="button" onClick={() => { configurar({ recompensa: { ...recompensa, semente: recompensa.semente + 1 } }); tocarSeLigado("moedas"); }} className="rounded-lg border border-parchment-300 px-3 py-2 text-sm dark:border-parchment-700">Sortear outros itens</button>
    </div>
    <p className="text-sm font-semibold">{loot.moedas} PO em moedas</p>
    {tamanhoGrupo > 0 && <p className="text-xs text-parchment-600 dark:text-parchment-400">Divisão: {Math.floor(loot.moedas / tamanhoGrupo)} PO por personagem; {loot.moedas % tamanhoGrupo} PO no caixa do grupo.</p>}
    {/* Tralha e equipamento aparecem separados porque são vendidos por regras
        diferentes (Cap. 5, "Vender o que caiu"): a tralha pelo preço cheio, o
        resto pela metade. Numa pilha só, o grupo perde metade do que a tralha
        valia sem saber. */}
    {loot.tralhas.length > 0 && <>
      <p className="mt-3 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">Espólios — vendem pelo preço cheio</p>
      <ul className="mb-3 mt-1 space-y-2 text-sm">{loot.tralhas.map((i, indice) => <li key={`${i.id}-${indice}`}><strong>{i.name}</strong> · {i.price} PO<p className="text-xs text-parchment-600 dark:text-parchment-400">{i.description}</p></li>)}</ul>
    </>}
    {loot.itens.length > 0 && <>
      <p className="mt-3 text-2xs font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">Equipamento — revende pela metade</p>
      <ul className="mb-3 mt-1 space-y-2 text-sm">{loot.itens.map((i, indice) => <li key={`${i.id}-${indice}`}><strong>{i.name}</strong> · {i.price} PO<p className="text-xs text-parchment-600 dark:text-parchment-400">{i.description}</p></li>)}</ul>
    </>}
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(texto); setCopiado(true); } catch { setCopiado(false); } }} className="rounded-lg border border-parchment-300 px-3 py-2 text-sm dark:border-parchment-700">{copiado ? "Recompensa copiada" : "Copiar recompensa"}</button>
    <p className="mt-2 text-xs text-parchment-600 dark:text-parchment-400">A recompensa é uma preparação do mestre; não credita moedas nem itens nas fichas.</p>
  </details>;
}
