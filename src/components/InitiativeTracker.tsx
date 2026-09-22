"use client";

import { useId, useState } from "react";
import { Plus, X, Swords, RotateCcw, ChevronRight, Heart, Download } from "lucide-react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useInitiativeStore, type Combatant, type FichaDeCombate } from "@/store/useInitiativeStore";
import { getInitiative, getMaxHp } from "@/store/selectors";
import PageHeader from "@/components/ui/PageHeader";
import Surface from "@/components/ui/Surface";
import EmptyState from "@/components/ui/EmptyState";

function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

export default function InitiativeTracker() {
  const combatants = useInitiativeStore((s) => s.combatants);
  const round = useInitiativeStore((s) => s.round);
  const currentTurnId = useInitiativeStore((s) => s.currentTurnId);

  const rosterOrder = useCharacterStore((s) => s.order);
  const rosterCharacters = useCharacterStore((s) => s.characters);

  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState<number | "">("");
  const [maxHp, setMaxHp] = useState<number | "">("");
  const [importId, setImportId] = useState("");
  const [conditionDraft, setConditionDraft] = useState<Record<string, { name: string; duration: string }>>({});

  const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);

  function handleAddManual() {
    if (!name.trim()) return;
    useInitiativeStore.getState().addCombatant(name.trim(), Number(initiative) || 0, maxHp === "" ? undefined : Number(maxHp));
    setName("");
    setInitiative("");
    setMaxHp("");
  }

  function handleImport() {
    const character = rosterCharacters[importId];
    if (!character) return;
    const { bonus } = getInitiative(character);
    const roll = rollD20() + bonus;
    const hp = getMaxHp(character);
    useInitiativeStore.getState().addCombatant(character.name || "Sem nome", roll, hp);
    setImportId("");
  }

  function handleAddCondition(combatantId: string) {
    const draft = conditionDraft[combatantId];
    if (!draft?.name.trim()) return;
    const duration = draft.duration.trim() === "" ? undefined : Number(draft.duration);
    useInitiativeStore.getState().addCondition(combatantId, draft.name.trim(), duration);
    setConditionDraft((prev) => ({ ...prev, [combatantId]: { name: "", duration: "" } }));
  }

  // Os três rótulos de "Adicionar Combatente" eram <label> soltos: visíveis,
  // mas sem `for`, então não nomeavam campo nenhum pra um leitor de tela.
  const idNome = useId();
  const idIniciativa = useId();
  const idPv = useId();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <PageHeader
        icon={Swords}
        title="Tracker de Iniciativa"
        faixa="/faixas/iniciativa.jpg"
        faixaPosition="center 40%"
        actions={
          <>
            {/*
              A Rodada é o único número que muda sozinho enquanto o combate roda,
              e é o que a mesa inteira olha. Em `tabular-nums` ele para de mudar
              de largura ao virar de 9 pra 10 — a barra inteira dançava. */}
            <span className="tabular rounded-full bg-wine-600/15 px-3.5 py-1.5 text-sm font-black text-wine-700 ring-1 ring-wine-500/40 backdrop-blur-sm dark:text-wine-200">
              Rodada {round}
            </span>
            <button
              type="button"
              onClick={() => useInitiativeStore.getState().resetCombat()}
              className="flex items-center gap-1 rounded-lg border border-parchment-300 bg-parchment-50/80 px-3 py-1.5 text-sm font-medium text-parchment-700 backdrop-blur-sm transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:bg-parchment-900/70 dark:text-parchment-200 dark:hover:bg-parchment-900"
            >
              <RotateCcw className="h-4 w-4" /> Novo Combate
            </button>
          </>
        }
      >
        Ordene a mesa, marque quem já agiu e vire a rodada. O que entra aqui não toca a ficha de ninguém.
      </PageHeader>

      <Surface as="section" className="p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
          Adicionar Combatente
        </h2>
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[10rem]">
            <label htmlFor={idNome} className="mb-1 block text-xs text-parchment-600 dark:text-parchment-400">Nome</label>
            <input
              id={idNome}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Goblin Batedor"
              className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            />
          </div>
          <div>
            <label htmlFor={idIniciativa} className="mb-1 block text-xs text-parchment-600 dark:text-parchment-400">Iniciativa</label>
            <input
              id={idIniciativa}
              type="number"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-24 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            />
          </div>
          <div>
            <label htmlFor={idPv} className="mb-1 block text-xs text-parchment-600 dark:text-parchment-400">PV Máximo</label>
            <input
              id={idPv}
              type="number"
              value={maxHp}
              onChange={(e) => setMaxHp(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-24 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            />
          </div>
          <button
            type="button"
            onClick={handleAddManual}
            className="flex items-center gap-1 rounded-lg bg-wine-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-wine-500"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>

        {rosterOrder.length > 0 && (
          /* `flex-wrap` + `min-w-0`: a largura de um <select> é ditada pela opção
             mais longa dele, e `flex-1` não encolhe um item abaixo do conteúdo
             sem `min-w-0`. Em 360px — a largura da metade dos Androids — esta
             linha empurrava a página 41px pra fora. */
          <div className="flex flex-wrap items-center gap-2 border-t border-parchment-300 pt-3 dark:border-parchment-800">
            <select
              value={importId}
              onChange={(e) => setImportId(e.target.value)}
              className="min-w-0 flex-1 basis-48 rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            >
              <option value="">Importar da lista de personagens…</option>
              {rosterOrder.map((id) => (
                <option key={id} value={id}>
                  {rosterCharacters[id]?.name || "Sem nome"}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleImport}
              disabled={!importId}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-wine-500 px-3 py-1.5 text-sm font-medium text-wine-600 transition-colors hover:bg-wine-500/10 disabled:opacity-40 dark:text-wine-300"
            >
              <Download className="h-4 w-4" /> Rolar e Importar
            </button>
          </div>
        )}
      </Surface>

      {sorted.length === 0 ? (
        <EmptyState icon={Swords} hint="Adicione um NPC acima, ou importe uma ficha do grupo — a iniciativa dela é rolada na hora.">
          A mesa ainda não entrou em combate.
        </EmptyState>
      ) : (
        <>
          <button
            type="button"
            onClick={() => useInitiativeStore.getState().nextTurn()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-wine-600 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-wine-500"
          >
            Próximo Turno <ChevronRight className="h-5 w-5" />
          </button>

          <ul className="space-y-2">
            {sorted.map((c) => {
              const isCurrent = c.id === currentTurnId;
              const hpPct = c.maxHp ? Math.max(0, Math.min(100, ((c.currentHp ?? c.maxHp) / c.maxHp) * 100)) : null;
              const draft = conditionDraft[c.id] ?? { name: "", duration: "" };
              return (
                <li
                  key={c.id}
                  className={`rounded-2xl border p-3 shadow-sm transition-colors ${
                    isCurrent
                      ? "border-wine-500 bg-wine-50/70 ring-2 ring-wine-400/50 dark:border-wine-500 dark:bg-wine-950/40"
                      : "border-parchment-300 bg-parchment-100/70 dark:border-parchment-800 dark:bg-parchment-900/60"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment-900/5 text-sm font-black text-parchment-800 dark:bg-white/5 dark:text-parchment-100">
                      {c.initiative}
                    </span>
                    <span className="min-w-[6rem] flex-1 font-bold text-parchment-900 dark:text-parchment-50">
                      {c.name}
                      {isCurrent && (
                        <span className="ml-2 rounded-full bg-wine-500 px-2 py-0.5 text-3xs font-bold uppercase tracking-wide text-white">
                          Turno atual
                        </span>
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-rose-500" />
                      <input
                        type="number"
                        value={c.currentHp ?? 0}
                        onChange={(e) =>
                          useInitiativeStore.getState().updateCombatant(c.id, { currentHp: Number(e.target.value) })
                        }
                        className="w-14 rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 text-center text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                      />
                      <span className="text-xs text-parchment-400">/</span>
                      <input
                        type="number"
                        value={c.maxHp ?? 0}
                        onChange={(e) =>
                          useInitiativeStore.getState().updateCombatant(c.id, { maxHp: Number(e.target.value) })
                        }
                        className="w-14 rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 text-center text-sm dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
                      />
                      <ContadorDeDano combatente={c} />
                    </div>

                    <button
                      type="button"
                      onClick={() => useInitiativeStore.getState().removeCombatant(c.id)}
                      aria-label={`Remover ${c.name} do combate`}
                      className="ml-auto text-parchment-400 hover:text-rose-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {hpPct !== null && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-parchment-900/10 dark:bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all ${
                          hpPct > 50 ? "bg-emerald-500" : hpPct > 20 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                  )}

                  {c.ficha && <FichaDoMonstro ficha={c.ficha} />}

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {c.conditions.map((cond) => (
                      <span
                        key={cond.id}
                        className="flex items-center gap-1 rounded-full bg-gold-500/10 px-2 py-0.5 text-2xs font-medium text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300"
                      >
                        {cond.name}
                        {cond.duration !== undefined && <span className="opacity-70">({cond.duration})</span>}
                        <button
                          type="button"
                          onClick={() => useInitiativeStore.getState().removeCondition(c.id, cond.id)}
                          aria-label={`Remover condição ${cond.name} de ${c.name}`}
                          className="hover:text-rose-500"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={draft.name}
                      onChange={(e) =>
                        setConditionDraft((prev) => ({ ...prev, [c.id]: { ...draft, name: e.target.value } }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddCondition(c.id)}
                      placeholder="+ condição"
                      aria-label={`Nova condição para ${c.name}`}
                      className="w-24 rounded-full border border-dashed border-parchment-300 bg-transparent px-2 py-0.5 text-2xs outline-none focus:border-wine-400 dark:border-parchment-700"
                    />
                    <input
                      value={draft.duration}
                      onChange={(e) =>
                        setConditionDraft((prev) => ({ ...prev, [c.id]: { ...draft, duration: e.target.value } }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddCondition(c.id)}
                      placeholder="rodadas"
                      type="number"
                      aria-label={`Duração da condição em rodadas para ${c.name}`}
                      className="w-16 rounded-full border border-dashed border-parchment-300 bg-transparent px-2 py-0.5 text-2xs outline-none focus:border-wine-400 dark:border-parchment-700"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * Digitar o DANO, e não a vida que sobrou — pedido do autor (0.1.90).
 *
 * O rastreador já tinha os PV atuais editáveis, e isso obrigava o Mestre a
 * fazer a conta de cabeça no meio da mesa: "tinha 47, levou 13, então… 34".
 * Numa luta com seis criaturas, são seis subtrações por rodada, e a primeira
 * que sai errada ninguém percebe.
 *
 * Aqui ele digita 13 e aperta Enter. A vida cai sozinha.
 *
 * ## Por que dano é o padrão do Enter
 *
 * Porque numa mesa de RPG o botão apertado noventa por cento das vezes é o de
 * tirar vida. Curar existe (o botão +), mas quem cura costuma ser um jogador
 * anunciando um número — e aí o Mestre tem tempo de mirar o botão certo. Quem
 * causa dano está no meio de uma rodada.
 *
 * O valor nunca desce abaixo de 0: a 0 PV começa o Fio da Vida (Cap. 4, §7),
 * e vida negativa não é estado nenhum deste livro.
 */
function ContadorDeDano({ combatente }: { combatente: Combatant }) {
  const [valor, setValor] = useState("");

  function aplicar(sinalDoAjuste: 1 | -1) {
    const n = Math.abs(Number(valor));
    if (!Number.isFinite(n) || n === 0) return;
    const atual = combatente.currentHp ?? combatente.maxHp ?? 0;
    const teto = combatente.maxHp ?? Number.POSITIVE_INFINITY;
    const novo = Math.max(0, Math.min(teto, atual + sinalDoAjuste * n));
    useInitiativeStore.getState().updateCombatant(combatente.id, { currentHp: novo });
    setValor("");
  }

  return (
    <div className="ml-1 flex items-center gap-0.5">
      <input
        type="number"
        min={0}
        value={valor}
        placeholder="dano"
        aria-label={`Dano ou cura em ${combatente.name}`}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            aplicar(-1);
          }
        }}
        className="w-16 rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 text-center text-sm placeholder:text-2xs placeholder:text-parchment-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
      />
      <button
        type="button"
        onClick={() => aplicar(-1)}
        title="Tirar esse tanto de vida (Enter faz o mesmo)"
        aria-label={`Causar dano em ${combatente.name}`}
        className="rounded-lg border border-rose-400/50 px-1.5 py-1 text-sm font-bold leading-none text-rose-600 transition hover:bg-rose-100/60 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-950/40"
      >
        &minus;
      </button>
      <button
        type="button"
        onClick={() => aplicar(1)}
        title="Curar esse tanto"
        aria-label={`Curar ${combatente.name}`}
        className="rounded-lg border border-emerald-400/50 px-1.5 py-1 text-sm font-bold leading-none text-emerald-600 transition hover:bg-emerald-100/60 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
      >
        +
      </button>
    </div>
  );
}

/**
 * O Bloco do Monstro, na linha do combate — 0.1.90.
 *
 * Uma faixa densa e pequena, de propósito: ela fica ABERTA o tempo todo, porque
 * um painel que precisa de clique não é consultado no meio de uma rodada. São
 * os números que a mesa pergunta em voz alta e que o Mestre não tinha aqui:
 * "qual a CA dele?", "ele me vê?", "resiste a fogo?", "corre quanto?".
 *
 * Só criaturas têm ficha. Personagem que entra na iniciativa continua sem
 * nada aqui — a ficha dele é a ficha inteira, e ela mora na própria tela.
 */
function FichaDoMonstro({ ficha }: { ficha: FichaDeCombate }) {
  return (
    <div className="mt-2 rounded-lg border border-parchment-200 bg-parchment-50/70 px-2 py-1.5 text-3xs dark:border-parchment-800 dark:bg-parchment-950/40">
      {ficha.notasCombate?.map((nota, i) => <p key={i} className="mb-1">{nota}</p>)}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Dado rotulo="CA" valor={String(ficha.ca)} />
        {ficha.bonusAtaque !== undefined && <Dado rotulo="Ataque" valor={`${ficha.bonusAtaque >= 0 ? "+" : ""}${ficha.bonusAtaque}`} />}
        <Dado rotulo="CD" valor={String(ficha.cdResistencia)} dica="A CD que ela impõe. Menos 2 se a habilidade sai de um atributo que não é o Principal dela." />
        <Dado
          rotulo="Percep."
          valor={String(ficha.percepcao)}
          dica="Percepção passiva: a CD que alguém precisa bater na Furtividade pra ficar Escondido dela (Cap. 4, §3)."
        />
        <Dado
          rotulo="Rank"
          valor={`+${ficha.patamar}`}
          dica="O Bônus de Rank dela é o patamar. Use nas CDs de Concentração e do Fio da Vida de quem ela acertar."
        />
        <Dado rotulo="Desloc." valor={`${ficha.deslocamento} m`} />
        {ficha.tamanho && <Dado rotulo="Tam." valor={ficha.tamanho} />}
        <span className="flex items-center gap-1.5 text-parchment-600 dark:text-parchment-400">
          {ficha.atributos.map((a) => (
            <span key={a.rotulo}>
              <span className="opacity-60">{a.rotulo}</span> <b>{a.valor}</b>
            </span>
          ))}
        </span>
      </div>

      {(ficha.pericias.length > 0 ||
        ficha.resistencias.length > 0 ||
        ficha.imunidades.length > 0 ||
        ficha.sentido ||
        ficha.movimentoEspecial) && (
        <div className="mt-1 flex flex-col gap-0.5 text-parchment-600 dark:text-parchment-400">
          {ficha.pericias.length > 0 && (
            <span>
              <b className="text-parchment-700 dark:text-parchment-300">Vantagem em</b>{" "}
              {ficha.pericias.join(", ")}
            </span>
          )}
          {ficha.resistencias.length > 0 && (
            <span>
              <b className="text-parchment-700 dark:text-parchment-300">Resistência</b> (metade){" "}
              {ficha.resistencias.join(", ")}
            </span>
          )}
          {ficha.imunidades.length > 0 && (
            <span className="text-wine-600 dark:text-wine-300">
              <b>Imunidade</b> (zero) {ficha.imunidades.join(", ")}
            </span>
          )}
          {ficha.movimentoEspecial && (
            <span>
              <b className="text-parchment-700 dark:text-parchment-300">Movimento</b>{" "}
              {ficha.movimentoEspecial}
            </span>
          )}
          {ficha.sentido && (
            <span>
              <b className="text-parchment-700 dark:text-parchment-300">Sentido</b> {ficha.sentido}
            </span>
          )}
        </div>
      )}

      {ficha.acoes && ficha.acoes.length > 0 && (
        <div className="mt-2 border-t border-parchment-200 pt-1.5 dark:border-parchment-800">
          <span className="mb-1 block font-bold text-parchment-700 dark:text-parchment-300">Ações (3 por turno)</span>
          <div className="flex flex-col gap-1">
            {ficha.acoes.map((a, i) => (
              <div key={i} className="flex items-start gap-1.5 text-parchment-700 dark:text-parchment-300">
                <span className="mt-0.5 shrink-0 rounded bg-parchment-900/5 px-1 font-mono text-[9px] dark:bg-white/10">
                  {a.acoes}A
                </span>
                <div>
                  <b>{a.nome}</b>{" "}
                  {a.dano && <span className="font-mono text-wine-600 dark:text-wine-400">{a.dano}</span>}
                  {a.escalaDano && a.escalaDano !== 1 && (
                    <span className="ml-1 font-mono text-parchment-500 dark:text-parchment-400">×{a.escalaDano}</span>
                  )}
                  {a.area && <span className="ml-1 rounded bg-wine-500/10 px-1 text-[9px] font-semibold text-wine-700 dark:text-wine-300">área</span>}{" "}
                  {a.nota && <span className="opacity-80">{a.nota}</span>}
                  <p className="mt-0.5">
                    {a.alcance} · {a.tipo === "resistencia" ? `Resistência CD ${ficha.cdResistencia} (metade se passar)` : (a.bonusAtaque ?? ficha.bonusAtaque) !== undefined ? `Ataque ${((a.bonusAtaque ?? ficha.bonusAtaque) as number) >= 0 ? "+" : ""}${a.bonusAtaque ?? ficha.bonusAtaque} contra CA` : "Ataque contra CA"}
                    {a.desvantagemAtaque && " · Desvantagem por falta de proficiência"}
                  </p>
                  {(a.aplicaPreso || a.aplicaCaido || a.aplicaMolhado || a.aplicaVeneno) && <p>
                    Condições: {[a.aplicaPreso && "Preso", a.aplicaCaido && "Caído", a.aplicaMolhado && "Molhado", a.aplicaVeneno && "Envenenado"].filter(Boolean).join(", ")}.
                  </p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Dado({ rotulo, valor, dica }: { rotulo: string; valor: string; dica?: string }) {
  return (
    <span title={dica} className={dica ? "cursor-help" : undefined}>
      <span className="opacity-60">{rotulo}</span>{" "}
      <b className="text-parchment-800 dark:text-parchment-200">{valor}</b>
    </span>
  );
}
