"use client";

import { useMemo } from "react";
import {
  ARQUETIPOS_CRIATURA,
  NOME_DO_ATRIBUTO,
  type AtributoDaCriatura,
  fichaDeAtributos,
  getArquetipo,
  percepcaoPassiva,
  periciasDaCriatura,
  sinal,
} from "@/data/bestiary";
import { SKILLS } from "@/data/skills";
import type { CriaturaEncontro } from "@/lib/encounterSim";

/**
 * O BLOCO DO MONSTRO na tela — Apêndice G, "duas escolhas, a ficha inteira".
 *
 * ## Por que ele é um componente à parte
 *
 * O `CartaoCriatura` já é o arquivo mais longo da tela de encontros, e o que
 * falta nele não é espaço: é que o Mestre não conseguia responder "qual a Força
 * dele?" sem inventar. Isto aqui é a resposta, e ela é DERIVADA — o painel não
 * guarda atributo nenhum, ele calcula a partir de patamar + arquétipo, pelas
 * mesmas funções que imprimem a tabela do livro.
 *
 * ## A regra que o painel obedece
 *
 * Nada aqui pode existir fora do livro (CLAUDE.md). Cada linha deste painel tem
 * um parágrafo correspondente no Apêndice G, e as contas são as funções de
 * `bestiary.ts`, não uma segunda implementação. Se o Apêndice mudar, o painel
 * muda junto, porque não há número digitado aqui.
 *
 * ## Tamanho
 *
 * As categorias são as do Cap. 4, §3, e servem pra uma coisa só na mesa:
 * manobra genérica (empurrar, derrubar, desarmar) só alcança alvo até UMA
 * categoria acima da sua. É por isso que o campo existe mesmo parecendo sabor.
 */
const TAMANHOS = ["Pequeno", "Médio", "Grande", "Enorme", "Colossal"] as const;

const TIPOS_DE_DANO = [
  "cortante",
  "perfurante",
  "contundente",
  "ígneo",
  "frio",
  "elétrico",
  "radiante",
  "sônico",
  "veneno",
  "ácido",
  "psíquico",
] as const;

export default function BlocoDoMonstro({
  criatura,
  atualizar,
}: {
  criatura: CriaturaEncontro;
  atualizar: (patch: Partial<CriaturaEncontro>) => void;
}) {
  const arq = getArquetipo(criatura.arquetipo);
  const atributos = useMemo(
    () => fichaDeAtributos(criatura.patamar, criatura.arquetipo),
    [criatura.patamar, criatura.arquetipo]
  );
  const percepcao = percepcaoPassiva(criatura.patamar, criatura.arquetipo);
  const quantasPericias = periciasDaCriatura(criatura.patamar);
  const pericias = criatura.pericias ?? [];
  const deslocamento = criatura.deslocamento ?? arq?.deslocamento ?? 9;
  const sentido = criatura.sentido ?? arq?.sentido;

  function alternarPericia(nome: string) {
    const tem = pericias.includes(nome);
    atualizar({ pericias: tem ? pericias.filter((p) => p !== nome) : [...pericias, nome] });
  }

  function alternarDano(campo: "resistencias" | "imunidades", tipo: string) {
    const atual = criatura[campo] ?? [];
    const tem = atual.includes(tipo);
    atualizar({ [campo]: tem ? atual.filter((t) => t !== tipo) : [...atual, tipo] } as Partial<CriaturaEncontro>);
  }

  return (
    <div className="mt-3 rounded-xl border border-parchment-300 bg-parchment-50/60 p-3 dark:border-parchment-700 dark:bg-parchment-900/40">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-display text-2xs font-black uppercase tracking-[0.14em] text-gold-700 dark:text-gold-300">
          Bloco do Monstro
        </span>
        <span className="text-2xs text-parchment-500 dark:text-parchment-400">
          Apêndice G — tudo abaixo sai do patamar e do arquétipo
        </span>
      </div>

      {/* 1. O ARQUÉTIPO: a segunda das duas escolhas. */}
      <label className="block text-2xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
        Arquétipo
        <select
          value={criatura.arquetipo ?? ""}
          onChange={(e) => atualizar({ arquetipo: e.target.value || undefined })}
          className="mt-1 w-full rounded border border-parchment-300 bg-parchment-50 px-2 py-1 text-xs font-normal normal-case tracking-normal text-parchment-800 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
        >
          <option value="">Genérico (todos os atributos iguais)</option>
          {ARQUETIPOS_CRIATURA.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome} — {a.exemplo}
            </option>
          ))}
        </select>
      </label>

      {/* 2. Os cinco atributos, derivados. Nunca editáveis: editar aqui seria
          guardar derivado, e a próxima recalibragem apagaria em silêncio. */}
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {(Object.keys(NOME_DO_ATRIBUTO) as AtributoDaCriatura[]).map((k) => {
          const v = atributos[k];
          const principal = arq && NOME_DO_ATRIBUTO[k] === arq.principal;
          return (
            <div
              key={k}
              title={
                principal
                  ? `Atributo Principal: ela resiste a testes de ${NOME_DO_ATRIBUTO[k]} com Vantagem (Apêndice G).`
                  : `${NOME_DO_ATRIBUTO[k]} da criatura, derivado do patamar e do arquétipo.`
              }
              className={`rounded-lg border px-1 py-1.5 text-center ${
                principal
                  ? "border-gold-500/60 bg-gold-100/50 dark:border-gold-600/50 dark:bg-gold-950/30"
                  : "border-parchment-300 bg-parchment-100/60 dark:border-parchment-700 dark:bg-parchment-950/40"
              }`}
            >
              <div className="text-3xs font-semibold uppercase tracking-wide text-parchment-500 dark:text-parchment-400">
                {NOME_DO_ATRIBUTO[k].slice(0, 3)}
              </div>
              <div className="font-display text-sm font-black text-parchment-900 dark:text-parchment-50">
                {sinal(v)}
              </div>
            </div>
          );
        })}
      </div>
      {arq && (
        <p className="mt-1 text-3xs leading-relaxed text-parchment-500 dark:text-parchment-400">
          Resiste com <b>Vantagem</b> em testes de {arq.principal}. CD do que ela impõe:{" "}
          <b>{criatura.cdResistencia}</b>, ou <b>{criatura.cdResistencia - 2}</b> quando a habilidade sai de
          um atributo que não é o Principal dela.
        </p>
      )}

      {/* 3. Movimento e sentidos. */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="block text-2xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          Deslocamento
          <div className="mt-1 flex items-center gap-1">
            <input
              type="number"
              min={0}
              step={3}
              value={deslocamento}
              onChange={(e) => atualizar({ deslocamento: Number(e.target.value) })}
              className="w-full rounded border border-parchment-300 bg-parchment-50 px-2 py-1 text-xs font-normal text-parchment-800 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            />
            <span className="text-2xs font-normal normal-case text-parchment-500">m</span>
          </div>
        </label>
        <label className="block text-2xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          Tamanho
          <select
            value={criatura.tamanho ?? "Médio"}
            onChange={(e) => atualizar({ tamanho: e.target.value })}
            className="mt-1 w-full rounded border border-parchment-300 bg-parchment-50 px-2 py-1 text-xs font-normal normal-case tracking-normal text-parchment-800 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
          >
            {TAMANHOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div
          title="Percepção passiva = 10 + o Espírito dela, a mesma fórmula da regra de ficar Escondido (Cap. 4, §3). É a CD que o ladino precisa bater."
          className="rounded-lg border border-parchment-300 bg-parchment-100/60 px-2 py-1.5 dark:border-parchment-700 dark:bg-parchment-950/40"
        >
          <div className="text-3xs font-semibold uppercase tracking-wide text-parchment-500 dark:text-parchment-400">
            Percepção passiva
          </div>
          <div className="font-display text-sm font-black text-parchment-900 dark:text-parchment-50">
            {percepcao}
          </div>
        </div>
        <label className="block text-2xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          Movimento especial
          <input
            value={criatura.movimentoEspecial ?? ""}
            placeholder="voa 12 m…"
            onChange={(e) => atualizar({ movimentoEspecial: e.target.value || undefined })}
            className="mt-1 w-full rounded border border-parchment-300 bg-parchment-50 px-2 py-1 text-xs font-normal normal-case tracking-normal text-parchment-800 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
          />
        </label>
      </div>

      {sentido && (
        <p className="mt-2 rounded-lg border border-wine-500/25 bg-wine-50/50 px-2 py-1.5 text-3xs leading-relaxed text-parchment-700 dark:border-wine-400/20 dark:bg-wine-950/20 dark:text-parchment-300">
          <b>Sentido:</b> {sentido} — dentro desse alcance, ficar Escondido não funciona contra ela.
        </p>
      )}

      {/* 4. Perícias: Vantagem, nunca número — igual ao personagem (Cap. 1, §4). */}
      <div className="mt-3">
        <div className="mb-1 flex flex-wrap items-baseline gap-1.5 text-2xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          Perícias
          <span
            className={`font-normal normal-case tracking-normal ${
              pericias.length > quantasPericias
                ? "text-wine-600 dark:text-wine-300"
                : "text-parchment-500 dark:text-parchment-400"
            }`}
          >
            {pericias.length} de {quantasPericias} — o patamar dela dá {quantasPericias}, e cada uma é
            Vantagem, nunca um número
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {SKILLS.map((s) => {
            const tem = pericias.includes(s.name);
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => alternarPericia(s.name)}
                className={`rounded-full border px-2 py-0.5 text-3xs transition ${
                  tem
                    ? "border-gold-500/60 bg-gold-200/60 font-semibold text-parchment-900 dark:border-gold-600/50 dark:bg-gold-900/40 dark:text-parchment-50"
                    : "border-parchment-300 text-parchment-500 hover:border-parchment-400 dark:border-parchment-700 dark:text-parchment-400"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Resistência e Imunidade (Cap. 4, §6). A Imunidade avisa o preço. */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <ListaDeDano
          rotulo="Resistência (metade do dano)"
          nota="De graça quando a ficção pede."
          selecionados={criatura.resistencias ?? []}
          onAlternar={(t) => alternarDano("resistencias", t)}
        />
        <ListaDeDano
          rotulo="Imunidade (zero dano)"
          nota="CUSTA: conta como um patamar acima no Orçamento de Encontro."
          alerta={(criatura.imunidades ?? []).length > 0}
          selecionados={criatura.imunidades ?? []}
          onAlternar={(t) => alternarDano("imunidades", t)}
        />
      </div>
    </div>
  );
}

function ListaDeDano({
  rotulo,
  nota,
  selecionados,
  onAlternar,
  alerta,
}: {
  rotulo: string;
  nota: string;
  selecionados: string[];
  onAlternar: (tipo: string) => void;
  alerta?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 text-2xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
        {rotulo}
        <span
          className={`ml-1.5 font-normal normal-case tracking-normal ${
            alerta ? "text-wine-600 dark:text-wine-300" : "text-parchment-500 dark:text-parchment-400"
          }`}
        >
          {nota}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {TIPOS_DE_DANO.map((t) => {
          const tem = selecionados.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onAlternar(t)}
              className={`rounded-full border px-2 py-0.5 text-3xs capitalize transition ${
                tem
                  ? "border-wine-500/60 bg-wine-200/50 font-semibold text-parchment-900 dark:border-wine-400/40 dark:bg-wine-900/40 dark:text-parchment-50"
                  : "border-parchment-300 text-parchment-500 hover:border-parchment-400 dark:border-parchment-700 dark:text-parchment-400"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
