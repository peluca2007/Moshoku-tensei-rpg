"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Droplets, Shield, Swords, Coins, Sparkles, Target, Gem, Flame, Compass, Search, X, BookOpen, FileDown, FileJson, Loader2, RotateCcw, Plus, Undo2, Activity, Sprout, Dices, Link2, Check, Thermometer } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { useCharacterDerived } from "@/store/useCharacterDerived";
import { useDiceRollerStore } from "@/store/useDiceRollerStore";
import { getGuildRank, getPaSpent, isGuildRankEstimated, type GuildRank } from "@/store/selectors";
import { GUILD_RANK_ORDER } from "@/lib/types";
import { RACES, getRaceById } from "@/data/races";
import { BACKGROUNDS, SUBTABLES, getBackgroundById, getSubtableEntryById } from "@/data/backgrounds";
import { getTreeById, getTreeGroups } from "@/data/trees";
import TreeCrest from "./TreeCrest";
import { getStartingKit } from "@/data/startingKits";
import {
  AbilityDef,
  ATTRIBUTE_CREATION_POINTS,
  ATTRIBUTE_FLOOR,
  ATTRIBUTE_HARD_CAP,
  attributePaCostForPurchase,
  attributePaCostTotal,
  ATTRIBUTES,
  saveAdvantagePaCostForPurchase,
  saveAdvantagePaCostTotal,
  PurchasedAbility,
  RANK_BONUS,
  RANKS,
  RankName,
  TalentDef,
  Tree,
} from "@/lib/types";
import { RANK_COLORS, CATEGORY_ACCENT } from "@/lib/rankColors";
import { CATEGORY_LABELS } from "@/data/trees";
import CombinedSpellsSection from "./CombinedSpellsSection";
import InventorySection from "./InventorySection";
import LoreSection from "./LoreSection";
import RaceBackgroundDetails from "./RaceBackgroundDetails";
import SkillsSection from "./SkillsSection";
import { CastingBreakdown, IncantationBlock, RitualBadge } from "./AbilityDetail";
import { buildFichaPayload } from "@/lib/buildFichaPayload";
import { linkDaFicha } from "@/lib/fichaLink";
import { empacotarFicha } from "@/lib/fichaArquivo";
import DiceRoller from "./DiceRoller";
import EmptyState from "@/components/ui/EmptyState";
import ImagemDaFicha from "@/components/ui/ImagemDaFicha";
import RaceCrest from "./RaceCrest";

interface ResolvedAbility {
  kind: "ability" | "talent";
  rank: RankName;
  def: AbilityDef | TalentDef;
}

function resolveAbilities(tree: Tree, purchases: PurchasedAbility[]): ResolvedAbility[] {
  const resolved: ResolvedAbility[] = [];
  for (const purchase of purchases) {
    const rankDef = tree.ranks.find((r) => r.rank === purchase.rank);
    if (!rankDef) continue;
    const def =
      purchase.kind === "ability"
        ? rankDef.abilities.find((a) => a.id === purchase.id)
        : rankDef.talents.find((t) => t.id === purchase.id);
    if (def) resolved.push({ kind: purchase.kind, rank: purchase.rank, def });
  }
  return resolved;
}


/** PV/PM/PT/PP: valor atual (gasto em jogo) editável, e o máximo — normalmente calculado, mas sobrescrevível pra itens/exceções que o site não modela. */
function ResourceCard({
  icon,
  label,
  tone,
  current,
  max,
  maxOverridden,
  onCurrentChange,
  onMaxChange,
  onResetMax,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  tone: string;
  current: number;
  max: number;
  maxOverridden: boolean;
  onCurrentChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  onResetMax: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="surface flex items-center gap-3 rounded-xl border border-parchment-300 bg-parchment-50/80 p-3 dark:border-parchment-800 dark:bg-parchment-900/70">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-inner ring-1 ring-black/5 ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-2xs font-bold uppercase tracking-widest text-parchment-600 dark:text-parchment-400">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          {/*
            PV, PM, PT e PP são os números que a mesa inteira olha — e estavam
            em `text-lg` na mesma sans dos rótulos de formulário ao redor, do
            mesmo tamanho de qualquer outro texto da ficha. Em display, pretos e
            grandes, a ficha passa a ter um primeiro lugar pra onde olhar.
          */}
          <input
            type="number"
            value={current}
            onChange={(e) => onCurrentChange(Number(e.target.value))}
            title="Valor atual — vai gastando/recuperando em jogo"
            className="tabular w-14 rounded bg-transparent font-display text-2xl font-black leading-tight text-parchment-900 outline-none focus:ring-2 focus:ring-wine-400 dark:text-parchment-50"
          />
          <span className="text-parchment-600 dark:text-parchment-400">/</span>
          <input
            type="number"
            value={max}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            title="Máximo calculado — edite pra sobrescrever (item, exceção de mesa, etc.)"
            className={`w-12 rounded bg-transparent text-sm font-semibold outline-none focus:ring-2 focus:ring-wine-400 ${
              maxOverridden ? "text-gold-600 dark:text-gold-400" : "text-parchment-600 dark:text-parchment-400"
            }`}
          />
          {maxOverridden && (
            <button
              type="button"
              onClick={onResetMax}
              title="Voltar ao valor calculado automaticamente"
              aria-label={`Voltar máximo de ${label} ao valor calculado`}
              className="text-parchment-400 hover:text-wine-500 dark:hover:text-wine-400"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      {extra}
    </div>
  );
}

/** CA/Iniciativa: um valor calculado, mas editável — sobrescreve quando você digita algo diferente. */
function EditableStatCard({
  icon,
  label,
  tone,
  value,
  overridden,
  onChange,
  onReset,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  tone: string;
  value: number;
  overridden: boolean;
  onChange: (value: number) => void;
  onReset: () => void;
  suffix?: string;
}) {
  return (
    <div className="surface flex items-center gap-3 rounded-xl border border-parchment-300 bg-parchment-50/80 p-3 dark:border-parchment-800 dark:bg-parchment-900/70">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-inner ring-1 ring-black/5 ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-2xs font-bold uppercase tracking-widest text-parchment-600 dark:text-parchment-400">
          {label}
        </p>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            title="Calculado — edite pra sobrescrever"
            className={`tabular w-16 rounded bg-transparent font-display text-2xl font-black leading-tight outline-none focus:ring-2 focus:ring-wine-400 ${
              overridden ? "text-gold-600 dark:text-gold-400" : "text-parchment-900 dark:text-parchment-50"
            }`}
          />
          {suffix && <span className="text-xs text-parchment-600 dark:text-parchment-400">{suffix}</span>}
          {overridden && (
            <button
              type="button"
              onClick={onReset}
              title="Voltar ao valor calculado automaticamente"
              aria-label={`Voltar ${label} ao valor calculado`}
              className="text-parchment-400 hover:text-wine-500 dark:hover:text-wine-400"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Dano de magia é texto livre ("2d8 + BC", "Vigor + 1d8 em PV"...) — não dá pra confiar num parser automático (ver PROGRESS.md). Em vez disso: sugere o primeiro NdM que achar no texto como ponto de partida, mas o campo fica sempre editável antes de rolar. */
function guessDiceFormula(text?: string): string {
  return text?.match(/\d{0,2}d\d{1,3}/i)?.[0] ?? "";
}

function AbilityQuickRoll({ label, hintText }: { label: string; hintText?: string }) {
  const requestDamageRoll = useDiceRollerStore((s) => s.requestDamageRoll);
  const [formula, setFormula] = useState(() => guessDiceFormula(hintText));
  const [modifier, setModifier] = useState(0);

  return (
    <div className="mt-2 flex items-center gap-1.5">
      <Dices className="h-3.5 w-3.5 shrink-0 text-parchment-400" />
      <input
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
        placeholder="ex: 2d8"
        title="Dado que você vai rolar pra esta magia — confira contra o texto acima antes de rolar"
        aria-label={`Dado pra rolar de ${label}`}
        className="w-20 rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 text-xs outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
      />
      <span className="text-xs text-parchment-400">+</span>
      <input
        type="number"
        value={modifier}
        onChange={(e) => setModifier(Number(e.target.value))}
        aria-label={`Modificador pra rolar de ${label}`}
        className="w-12 rounded-lg border border-parchment-300 bg-parchment-50 px-1.5 py-1 text-xs outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
      />
      <button
        type="button"
        onClick={() => formula.trim() && requestDamageRoll({ formula: formula.trim(), modifier, label })}
        disabled={!formula.trim()}
        title="Abrir o Rolador de Dados já com esse dado pronto pra rolar"
        className="flex items-center gap-1 rounded-full bg-wine-600 px-2 py-1 text-2xs font-semibold text-white transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Rolar
      </button>
    </div>
  );
}

function BonusInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex shrink-0 flex-col items-center text-3xs font-semibold uppercase text-parchment-600 dark:text-parchment-400">
      +PA
      <input
        type="number"
        min={0}
        step={12}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        title="Comprado com PA (Cap. 1: 2 PA = +12)"
        className="w-12 rounded border border-parchment-300 bg-parchment-50 px-1 text-center text-xs text-parchment-700 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-200"
      />
    </label>
  );
}

export default function CharacterSheet() {
  const character = useActiveCharacter();
  const canUndo = useCharacterStore((s) => (s.activeId ? (s.history[s.activeId]?.length ?? 0) > 0 : false));
  const {
    name,
    lore,
    portrait,
    cover,
    raceId,
    backgroundId,
    subtableEntryId,
    gold,
    startingTreeId,
    purchasedAbilities,
    purchasedCombinedSpells,
    unlockedRanks,
    attributeBase,
    saveAdvantages,
    skills,
    bonusHp,
    bonusMp,
    overrides,
  } = character;
  const paSpent = getPaSpent(character);
  const attributeSum = ATTRIBUTES.reduce((sum, { key }) => sum + (attributeBase[key] ?? 0), 0);
  const guildRank = getGuildRank(character);
  const guildRankEstimated = isGuildRankEstimated(character);
  const [grimoireQuery, setGrimoireQuery] = useState("");
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");
  const [linkState, setLinkState] = useState<"idle" | "copiado" | "erro">("idle");
  const [arquivoState, setArquivoState] = useState<"idle" | "loading" | "erro">("idle");
  const linkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (linkTimeoutRef.current) clearTimeout(linkTimeoutRef.current);
    },
    []
  );

  const {
    attributes,
    maxHp,
    maxMp,
    maxPt,
    maxPp,
    maxCalor,
    currentHp,
    currentMp,
    currentPt,
    currentPp,
    currentCalor,
    armorClass,
    initiative,
  } = useCharacterDerived();

  const race = getRaceById(raceId);
  const background = getBackgroundById(backgroundId);
  const startingTree = getTreeById(startingTreeId);
  const startingKit = startingTree ? getStartingKit(startingTree.subgroup) : undefined;
  const subtableOptions = background?.requiresSubtable ? SUBTABLES[background.requiresSubtable].entries : null;
  const chosenSubtable = background?.requiresSubtable
    ? getSubtableEntryById(background.requiresSubtable, subtableEntryId)
    : undefined;

  async function handleDownloadPdf() {
    setPdfState("loading");
    try {
      const payload = buildFichaPayload({
        character,
        race,
        background,
        subtable: chosenSubtable,
        attributes,
        maxHp,
        maxMp,
        maxPt,
        maxPp,
        armorClass,
        initiativeBonus: initiative.bonus,
      });
      const res = await fetch("/api/ficha-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`PDF request failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(name || "ficha").trim() || "ficha"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setPdfState("idle");
    } catch (err) {
      console.error("Falha ao baixar PDF da ficha:", err);
      setPdfState("error");
    }
  }

  /**
   * A ficha inteira num link, no clipboard.
   *
   * Assíncrono porque a codificação passa por `CompressionStream` (ver
   * `lib/fichaLink.ts`) — sem gzip, um Imperador vira um link de milhares de
   * caracteres que aplicativo de mensagem quebra em duas linhas.
   */
  async function handleCopiarLink() {
    try {
      await navigator.clipboard.writeText(await linkDaFicha(character));
      setLinkState("copiado");
      if (linkTimeoutRef.current) clearTimeout(linkTimeoutRef.current);
      linkTimeoutRef.current = setTimeout(() => setLinkState("idle"), 2200);
    } catch (err) {
      console.error("Falha ao copiar o link da ficha:", err);
      setLinkState("erro");
    }
  }

  /**
   * Baixa a ficha inteira num arquivo `.mtficha` — comprimido, e com a foto e a
   * capa dentro (`fichaArquivo.ts` explica o formato).
   *
   * Era um `.json` de texto puro, e isso parou de servir quando a ficha ganhou
   * imagem: base64 é texto, e uma ficha com foto e capa passava de 350 KB. O
   * arquivo novo reencoda as imagens pra um tamanho de compartilhamento e
   * comprime o resto — mesma ficha, cerca de um quinto do tamanho.
   */
  async function handleBaixarFicha() {
    setArquivoState("loading");
    try {
      const { blob, nomeDoArquivo } = await empacotarFicha(character);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeDoArquivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setArquivoState("idle");
    } catch {
      setArquivoState("erro");
    }
  }

  const abilitiesByTree = useMemo(() => {
    const grouped = new Map<string, PurchasedAbility[]>();
    for (const ability of purchasedAbilities) {
      const list = grouped.get(ability.treeId) ?? [];
      list.push(ability);
      grouped.set(ability.treeId, list);
    }
    return grouped;
  }, [purchasedAbilities]);

  const highestRankByTree = useMemo(() => {
    const map = new Map<string, RankName>();
    for (const { treeId, rank } of unlockedRanks) {
      const current = map.get(treeId);
      if (!current || RANKS.indexOf(rank) > RANKS.indexOf(current)) {
        map.set(treeId, rank);
      }
    }
    return map;
  }, [unlockedRanks]);

  /** Cap. 2, seção 5: Maestrias são cumulativas — cada Rank desbloqueado mantém a sua pra sempre, não só a do Rank mais alto (algumas Maestrias de patamar alto até citam "estende sua Maestria de Intermediário"). */
  const unlockedRanksByTree = useMemo(() => {
    const map = new Map<string, RankName[]>();
    for (const { treeId, rank } of unlockedRanks) {
      const list = map.get(treeId) ?? [];
      if (!list.includes(rank)) list.push(rank);
      map.set(treeId, list);
    }
    for (const list of map.values()) list.sort((a, b) => RANKS.indexOf(a) - RANKS.indexOf(b));
    return map;
  }, [unlockedRanks]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Cabeçalho */}
      <header className="surface-raised relative isolate overflow-hidden rounded-2xl border border-parchment-300/90 bg-parchment-50/90 p-4 sm:p-6 dark:border-parchment-700/80 dark:bg-parchment-900/80">
        {/*
          A ficha na mesa, atrás do nome do personagem (0.1.6). É a arte que
          mais fala do que a página faz: papel, vela, pena e tinteiro — e o
          letreiro do projeto impresso nela. Passa pelo mesmo `.faixa-arte` dos
          cabeçalhos de rota, então some antes de encostar nos campos editáveis.
        */}
        {cover ? (
          /*
            A CAPA da ficha, quando o jogador põe uma (0.1.12). Ela entra no
            lugar exato da arte padrão, e não em cima dela: duas imagens
            empilhadas atrás do mesmo texto brigariam por contraste, e a de
            baixo nunca apareceria inteira.

            É `<img>` e não `next/image` de propósito. A imagem é um data URL
            que já saiu do `imagemDaFicha` no tamanho final; o otimizador do
            Next não tem o que fazer com ela além de um round-trip pelo
            servidor — e mandar a foto do personagem de alguém pro servidor é
            justamente o que este projeto não faz.
          */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            aria-hidden
            className="capa-da-ficha absolute inset-0 -z-10 h-full w-full object-cover"
          />
        ) : (
          <Image
            src="/faixas/ficha.png"
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="faixa-arte -z-10 object-cover object-[center_30%]"
          />
        )}
        {/*
          O mesmo véu do `PageHeader`, pelo mesmo motivo — e aqui ele é mais
          necessário ainda: esta arte é uma FICHA impressa, com rótulos próprios
          ("Deus Protetor", "Classes de Magia"). Sem o véu, o texto da foto
          disputa leitura com os campos de verdade da ficha por cima dela, e o
          olho não sabe qual dos dois é para preencher.
        */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-parchment-50/72 dark:bg-parchment-950/55" aria-hidden />
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-wine-500/10 blur-3xl" aria-hidden />
        {/*
          O h1 da rota. O nome do personagem é um <input> editável, e input não
          é cabeçalho: sem isto `/ficha` era a única rota do site sem h1 — quem
          navega por cabeçalho num leitor de tela chegava numa página que não
          dizia o que era. Fica só para leitor porque o cabeçalho visual já é o
          nome, em corpo 30, logo abaixo.
        */}
        <h1 className="sr-only">{name ? `Ficha de ${name}` : "Ficha de personagem"}</h1>
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start">
          {/*
            A FOTO DE PERFIL. Sem foto o lugar não fica vazio: cai no brasão da
            raça, que já resolvia esse buraco desde 0.1.2 — e uma ficha sem foto
            continua sendo uma ficha completa, não uma ficha pela metade.
          */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-parchment-300/80 bg-parchment-100/80 shadow-sm dark:border-parchment-700/80 dark:bg-parchment-900/80 sm:h-24 sm:w-24">
              {portrait ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portrait}
                  alt={name ? `Retrato de ${name}` : "Retrato do personagem"}
                  className="h-full w-full object-cover"
                />
              ) : race ? (
                <RaceCrest race={race} size={96} rounded="rounded-none" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-parchment-400">
                  <Sprout className="h-7 w-7" />
                </span>
              )}
            </div>
          </div>
          <input
            value={name}
            onChange={(e) => useCharacterStore.getState().setName(e.target.value)}
            placeholder="Nome do personagem"
            aria-label="Nome do personagem"
            className="w-full min-w-0 rounded-lg bg-transparent font-display text-2xl font-black tracking-tight text-parchment-900 outline-none placeholder:text-parchment-300 focus:ring-2 focus:ring-wine-400 dark:text-parchment-50 dark:placeholder:text-parchment-700 sm:flex-1 sm:text-3xl"
          />
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={() => useCharacterStore.getState().undo()}
              disabled={!canUndo}
              title="Desfazer a última alteração nesta ficha"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-parchment-300 px-3.5 py-1.5 text-xs font-semibold text-parchment-600 shadow-sm transition-colors hover:bg-parchment-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900 sm:mt-1.5"
            >
              <Undo2 className="h-3.5 w-3.5" /> Desfazer
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfState === "loading"}
              title="Baixar a ficha completa em PDF (via Typst)"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-wine-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-1.5"
            >
              {pdfState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
              {pdfState === "loading" ? "Gerando..." : "Baixar PDF"}
            </button>
            <button
              type="button"
              onClick={handleBaixarFicha}
              disabled={arquivoState === "loading"}
              title="Baixar a ficha inteira num arquivo — com a foto e a capa dentro, comprimido"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-parchment-300 px-3.5 py-1.5 text-xs font-semibold text-parchment-600 shadow-sm transition-colors hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900 sm:mt-1.5"
            >
              {arquivoState === "loading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileJson className="h-3.5 w-3.5" />
              )}
              {arquivoState === "loading" ? "Preparando..." : "Baixar ficha"}
            </button>
            {/*
              O link é o caminho curto do que o JSON já fazia: até aqui, passar
              uma ficha adiante era exportar o arquivo, achar ele, mandar, o
              outro baixar e importar — cinco passos, uma vez por jogador, toda
              vez que alguém mudava alguma coisa. O montador de encontros
              depende de ter o grupo carregado, então esse atrito estava
              exatamente no caminho da funcionalidade mais cara do site.
            */}
            <button
              type="button"
              onClick={handleCopiarLink}
              title="Copiar um link com esta ficha inteira dentro — quem abrir escolhe se importa"
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors sm:mt-1.5 ${
                linkState === "copiado"
                  ? "border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300"
                  : "border-parchment-300 text-parchment-600 hover:bg-parchment-100 dark:border-parchment-700 dark:text-parchment-300 dark:hover:bg-parchment-900"
              }`}
            >
              {linkState === "copiado" ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Link copiado
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" /> Copiar link
                </>
              )}
            </button>
          </div>
        </div>
        {linkState === "erro" && (
          <p className="mt-1 text-xs text-wine-500 dark:text-wine-300">
            O navegador não deixou copiar. Isso costuma acontecer fora de HTTPS — exporte o JSON por
            enquanto.
          </p>
        )}
        {pdfState === "error" && (
          <p className="mt-1 text-xs text-wine-500 dark:text-wine-300">Não deu pra gerar o PDF agora. Tente de novo em instantes.</p>
        )}
        {arquivoState === "erro" && (
          <p className="mt-1 text-xs text-wine-500 dark:text-wine-300">Não deu pra montar o arquivo da ficha. Tente de novo.</p>
        )}
        {/*
          Os dois controles de imagem, juntos e embaixo — e não flutuando por
          cima da foto e da capa. Um botão que só aparece no hover da imagem
          funciona no mouse e desaparece no toque, que é onde metade da mesa
          abre o site.

          O aviso do link não é rodapé: a foto é a única coisa da ficha que o
          link NÃO leva, e quem descobre isso do outro lado não tem como saber
          por quê.
        */}
        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <ImagemDaFicha
            tipo="portrait"
            valorAtual={portrait}
            rotulo="Adicionar foto"
            onChange={(dataUrl) => useCharacterStore.getState().setPortrait(dataUrl)}
          />
          <ImagemDaFicha
            tipo="cover"
            valorAtual={cover}
            rotulo="Adicionar capa"
            onChange={(dataUrl) => useCharacterStore.getState().setCover(dataUrl)}
          />
          {(portrait || cover) && (
            <p className="w-full text-xs text-parchment-600 dark:text-parchment-400">
              Foto e capa ficam no seu navegador e vão junto em <b>Baixar ficha</b> — o arquivo leva as
              duas, reduzidas pra caber. O <b>link</b> vai sem elas: imagem não cabe numa URL.
            </p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <select
            value={raceId ?? ""}
            onChange={(e) => useCharacterStore.getState().setRace(e.target.value || null)}
            className="rounded-full border-0 bg-parchment-900/5 px-3 py-1 font-medium text-parchment-700 outline-none ring-1 ring-parchment-900/10 dark:bg-white/5 dark:text-parchment-200 dark:ring-white/10"
          >
            <option value="">Raça não definida</option>
            {RACES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={backgroundId ?? ""}
            onChange={(e) => useCharacterStore.getState().setBackground(e.target.value || null)}
            className="rounded-full border-0 bg-parchment-900/5 px-3 py-1 font-medium text-parchment-700 outline-none ring-1 ring-parchment-900/10 dark:bg-white/5 dark:text-parchment-200 dark:ring-white/10"
          >
            <option value="">Antecedente não definido</option>
            {BACKGROUNDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {subtableOptions && (
            <select
              value={subtableEntryId ?? ""}
              onChange={(e) => useCharacterStore.getState().setSubtableEntry(e.target.value || null)}
              className="rounded-full border-0 bg-gold-500/10 px-3 py-1 font-medium text-gold-600 outline-none ring-1 ring-gold-500/30 dark:text-gold-400"
            >
              <option value="">Escolher resultado...</option>
              {subtableOptions.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.roll}. {entry.name}
                </option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-1 rounded-full bg-gold-500/10 px-3 py-1 font-medium text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300">
            <Coins className="h-3.5 w-3.5" />
            <input
              type="number"
              value={gold}
              onChange={(e) => useCharacterStore.getState().setGold(Number(e.target.value))}
              className="w-14 bg-transparent outline-none"
            />
            PO
          </label>

          <span
            title="Só informativo — quem controla quanto PA você tem é o Mestre."
            className="flex items-center gap-1 rounded-full bg-gold-500/10 px-3 py-1 font-medium text-gold-600 ring-1 ring-gold-500/30 dark:text-gold-400"
          >
            <Gem className="h-3.5 w-3.5" /> {paSpent} PA gastos
          </span>

          <label
            title="Rank de Aventureiro na Guilda (Cap. 5, §2) é decisão do Mestre, não fórmula. Deixe em 'estimar por PA' pra só ver um chute inicial, ou fixe aqui o Rank que o Mestre decidiu."
            className="flex items-center gap-1 rounded-full bg-wine-500/10 px-3 py-1 font-medium text-wine-600 ring-1 ring-wine-500/30 dark:text-wine-300"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <select
              value={overrides.guildRank ?? ""}
              onChange={(e) =>
                useCharacterStore
                  .getState()
                  .setGuildRankOverride(e.target.value ? (e.target.value as GuildRank) : null)
              }
              className="bg-transparent outline-none"
            >
              <option value="">Rank {guildRank} (estimado)</option>
              {GUILD_RANK_ORDER.map((r) => (
                <option key={r} value={r}>
                  Fixar Rank {r}
                </option>
              ))}
            </select>
            {!guildRankEstimated && <span className="text-3xs uppercase tracking-wide">fixado</span>}
          </label>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar esquerda */}
        <aside className="space-y-4">
          <div className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 dark:border-parchment-800 dark:bg-parchment-900/60">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
              <Activity className="h-3.5 w-3.5 text-wine-500" /> Atributos
            </h2>
            <div className="grid grid-cols-5 gap-2 lg:grid-cols-3">
              {ATTRIBUTES.map(({ key, short, label }) => {
                const base = attributeBase[key] ?? 0;
                const final = attributes[key];
                return (
                  <div
                    key={key}
                    title={label}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-parchment-300 bg-parchment-50 p-2 transition-colors hover:border-wine-400 dark:border-parchment-700 dark:bg-parchment-800/80 dark:hover:border-wine-600"
                  >
                    <span className="text-3xs font-bold uppercase text-parchment-600 dark:text-parchment-400">
                      {short}
                    </span>
                    <input
                      type="number"
                      min={ATTRIBUTE_FLOOR}
                      max={ATTRIBUTE_HARD_CAP}
                      value={base}
                      onChange={(e) => useCharacterStore.getState().setAttribute(key, Number(e.target.value))}
                      className="w-12 bg-transparent text-center text-lg font-black text-parchment-900 outline-none dark:text-parchment-50"
                    />
                    {final !== base && (
                      <span className="text-3xs text-parchment-600 dark:text-parchment-400">Final {final >= 0 ? `+${final}` : final}</span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* O custo em PA de atributo é da SOMA dos cinco, não de cada um (Cap. 1, §2) — mostrar por atributo escondia o total e sugeria que subir de -2 até 4 era grátis. Bônus de Raça/Antecedente não entram na conta (são por fora do point-buy desde 2026-08-30). */}
            <p className="mt-2 text-2xs leading-snug text-parchment-600 dark:text-parchment-400">
              Soma {attributeSum} de {ATTRIBUTE_CREATION_POINTS} do point-buy (bônus de Raça/Antecedente não contam aqui)
              {attributeSum > ATTRIBUTE_CREATION_POINTS ? (
                <>
                  {" · "}
                  <span className="font-semibold text-gold-600 dark:text-gold-400">
                    {attributePaCostTotal(attributeSum - ATTRIBUTE_CREATION_POINTS)} PA
                  </span>{" "}
                  em {attributeSum - ATTRIBUTE_CREATION_POINTS} ponto(s) comprado(s) · o próximo custa{" "}
                  {attributePaCostForPurchase(attributeSum - ATTRIBUTE_CREATION_POINTS + 1)} PA
                </>
              ) : null}
            </p>

            {/* Cap. 1, §2: Vantagem permanente nos Testes de Resistência de um
                atributo, progressivo (2, 3, 4, 4, 4 PA). Fica colada nos atributos porque é a única
                compra do livro que se aplica a um atributo específico. */}
            <div className="mt-3 border-t border-parchment-300 pt-2 dark:border-parchment-800">
              <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
                Vantagem em Resistência
                <span className="ml-1 font-normal normal-case">
                  (a próxima custa {saveAdvantagePaCostForPurchase((saveAdvantages ?? []).length + 1)} PA — 2, 3, 4, 4, 4)
                </span>
              </p>
              <div className="flex flex-wrap gap-1">
                {ATTRIBUTES.map(({ key, short, label }) => {
                  const ativo = (saveAdvantages ?? []).includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      title={`Vantagem permanente em todos os Testes de Resistência de ${label} — ${ativo ? "já comprada" : `${saveAdvantagePaCostForPurchase((saveAdvantages ?? []).length + 1)} PA`}`}
                      aria-pressed={ativo}
                      onClick={() => useCharacterStore.getState().toggleSaveAdvantage(key)}
                      className={`rounded-lg px-2 py-1 text-2xs font-bold transition-colors ${
                        ativo
                          ? "bg-gold-600 text-white"
                          : "bg-parchment-200 text-parchment-600 hover:bg-parchment-300 dark:bg-parchment-800 dark:text-parchment-400 dark:hover:bg-parchment-700"
                      }`}
                    >
                      {short}
                    </button>
                  );
                })}
              </div>
              {(saveAdvantages ?? []).length > 0 && (
                <p className="mt-1 text-2xs text-gold-600 dark:text-gold-400">
                  {saveAdvantagePaCostTotal((saveAdvantages ?? []).length)} PA · rola 2d20 e escolhe o maior
                  nesses testes.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <ResourceCard
              icon={<Heart className="h-5 w-5 text-white" />}
              label="PV"
              tone="bg-wine-600"
              current={currentHp}
              max={maxHp}
              maxOverridden={overrides.maxHp !== undefined}
              onCurrentChange={(v) => useCharacterStore.getState().setCurrentHp(v)}
              onMaxChange={(v) => useCharacterStore.getState().setOverride("maxHp", v)}
              onResetMax={() => useCharacterStore.getState().setOverride("maxHp", null)}
              extra={<BonusInput value={bonusHp} onChange={(v) => useCharacterStore.getState().setBonusHp(v)} />}
            />
            <ResourceCard
              icon={<Droplets className="h-5 w-5 text-white" />}
              label="PM"
              tone="bg-wine-500"
              current={currentMp}
              max={maxMp}
              maxOverridden={overrides.maxMp !== undefined}
              onCurrentChange={(v) => useCharacterStore.getState().setCurrentMp(v)}
              onMaxChange={(v) => useCharacterStore.getState().setOverride("maxMp", v)}
              onResetMax={() => useCharacterStore.getState().setOverride("maxMp", null)}
              extra={<BonusInput value={bonusMp} onChange={(v) => useCharacterStore.getState().setBonusMp(v)} />}
            />
            {(maxPt > 0 || overrides.maxPt !== undefined) && (
              <ResourceCard
                icon={<Flame className="h-5 w-5 text-white" />}
                label="PT · Touki"
                tone="bg-gold-600"
                current={currentPt}
                max={maxPt}
                maxOverridden={overrides.maxPt !== undefined}
                onCurrentChange={(v) => useCharacterStore.getState().setCurrentPt(v)}
                onMaxChange={(v) => useCharacterStore.getState().setOverride("maxPt", v)}
                onResetMax={() => useCharacterStore.getState().setOverride("maxPt", null)}
              />
            )}
            {(maxPp > 0 || overrides.maxPp !== undefined) && (
              <ResourceCard
                icon={<Compass className="h-5 w-5 text-white" />}
                label="PP · Preparação"
                tone="bg-parchment-600"
                current={currentPp}
                max={maxPp}
                maxOverridden={overrides.maxPp !== undefined}
                onCurrentChange={(v) => useCharacterStore.getState().setCurrentPp(v)}
                onMaxChange={(v) => useCharacterStore.getState().setOverride("maxPp", v)}
                onResetMax={() => useCharacterStore.getState().setOverride("maxPp", null)}
              />
            )}
            {/*
              Calor só existe em Punho do Fogo — `maxCalor` já sai 0 de quem não
              tem a árvore (getMaxCalor lê o `heatCap` do rank mais alto ali), a
              mesma condição que PT/PP usam pra sumir da ficha de quem não tem
              Corpo/Utilidade aberto.
            */}
            {(maxCalor > 0 || overrides.maxCalor !== undefined) && (
              <ResourceCard
                icon={<Thermometer className="h-5 w-5 text-white" />}
                label="Calor · Punho do Fogo"
                tone="bg-wine-700"
                current={currentCalor}
                max={maxCalor}
                maxOverridden={overrides.maxCalor !== undefined}
                onCurrentChange={(v) => useCharacterStore.getState().setCurrentCalor(v)}
                onMaxChange={(v) => useCharacterStore.getState().setOverride("maxCalor", v)}
                onResetMax={() => useCharacterStore.getState().setOverride("maxCalor", null)}
              />
            )}
            <EditableStatCard
              icon={<Shield className="h-5 w-5 text-white" />}
              label="CA"
              tone="bg-parchment-700"
              value={armorClass}
              overridden={overrides.armorClass !== undefined}
              onChange={(v) => useCharacterStore.getState().setOverride("armorClass", v)}
              onReset={() => useCharacterStore.getState().setOverride("armorClass", null)}
            />
            <EditableStatCard
              icon={<Swords className="h-5 w-5 text-white" />}
              label="Iniciativa"
              tone="bg-gold-700"
              value={initiative.bonus}
              overridden={overrides.initiative !== undefined}
              onChange={(v) => useCharacterStore.getState().setOverride("initiative", v)}
              onReset={() => useCharacterStore.getState().setOverride("initiative", null)}
              suffix={initiative.hasAdvantage ? "(Vantagem)" : undefined}
            />
          </div>

          <div className="surface rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 text-sm dark:border-parchment-800 dark:bg-parchment-900/60">
            <h2 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-parchment-600 dark:text-parchment-400">
              <Sprout className="h-3.5 w-3.5 text-wine-500" /> Árvore Inicial
            </h2>
            <select
              value={startingTreeId ?? ""}
              onChange={(e) => {
                useCharacterStore.getState().setStartingTree(e.target.value || null);
              }}
              title="Desbloqueia o 1º patamar dela de graça e libera o kit de equipamento inicial (Cap. 1, seção 4)"
              className="w-full rounded-lg border border-parchment-300 bg-parchment-50 px-2 py-1.5 text-sm font-semibold text-parchment-800 outline-none dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-100"
            >
              <option value="">Nenhuma escolhida ainda</option>
              {getTreeGroups().map((group) => (
                <optgroup key={`${group.category}-${group.subgroup}`} label={`${CATEGORY_LABELS[group.category]} — ${group.subgroup}`}>
                  {group.trees.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {startingTree && (
              <div className="mt-2 flex items-center gap-2">
                <TreeCrest tree={startingTree} size={40} />
                <p className="text-xs italic text-parchment-600 dark:text-parchment-400">
                  {startingTree.tagline ?? startingTree.subgroup}
                </p>
              </div>
            )}
            {startingTree && startingKit && (
              <>
                <ul className="mt-2 space-y-0.5 text-xs text-parchment-600 dark:text-parchment-400">
                  {startingKit.items.map((item) => (
                    <li key={item.name}>· {item.name}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    for (const item of startingKit.items) useCharacterStore.getState().addItem(item);
                  }}
                  className="mt-2 flex items-center gap-1 rounded-lg bg-wine-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-wine-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Kit Inicial ao Inventário
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Corpo principal: Grimório */}
        <div className="space-y-4">
          <RaceBackgroundDetails race={race} background={background} subtable={chosenSubtable} />
          <SkillsSection race={race} background={background} skills={skills} />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-parchment-900 dark:text-parchment-50">
              <Sparkles className="h-5 w-5 text-wine-500" /> Grimório &amp; Habilidades
            </h2>
            {abilitiesByTree.size > 0 && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -tranparchment-y-1/2 text-parchment-400" />
                <input
                  value={grimoireQuery}
                  onChange={(e) => setGrimoireQuery(e.target.value)}
                  placeholder="Buscar magia, talento ou árvore..."
                  aria-label="Buscar no grimório"
                  className="w-56 rounded-full border border-parchment-300 bg-parchment-50 py-1.5 pl-8 pr-7 text-xs text-parchment-700 outline-none focus:ring-2 focus:ring-wine-400 dark:border-parchment-700 dark:bg-parchment-900 dark:text-parchment-200"
                />
                {grimoireQuery && (
                  <button
                    type="button"
                    onClick={() => setGrimoireQuery("")}
                    aria-label="Limpar busca"
                    className="absolute right-2 top-1/2 -tranparchment-y-1/2 text-parchment-400 hover:text-parchment-600 dark:hover:text-parchment-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {abilitiesByTree.size === 0 && (purchasedCombinedSpells ?? []).length === 0 && (
            <EmptyState
              icon={Sparkles}
              hint="Abra as Árvores de Progressão e desbloqueie um patamar — magias, talentos e técnicas caem aqui sozinhos."
            >
              O grimório está em branco.
            </EmptyState>
          )}

          {(() => {
            const query = grimoireQuery.trim().toLowerCase();
            const entries = Array.from(abilitiesByTree.entries()).flatMap(([treeId, purchases]) => {
              const tree = getTreeById(treeId);
              if (!tree) return [];
              const resolved = resolveAbilities(tree, purchases);
              const treeNameMatches = tree.name.toLowerCase().includes(query);
              const filtered = !query || treeNameMatches ? resolved : resolved.filter(({ def }) => def.name.toLowerCase().includes(query));
              if (query && filtered.length === 0) return [];
              return [{
                treeId,
                tree,
                resolved: filtered,
                highestRank: highestRankByTree.get(treeId),
                unlockedTreeRanks: unlockedRanksByTree.get(treeId) ?? [],
              }];
            });

            if (query && entries.length === 0) {
              return (
                <p className="rounded-xl border border-dashed border-parchment-300 p-6 text-center text-sm text-parchment-600 dark:border-parchment-700 dark:text-parchment-400">
                  Nada encontrado para “{grimoireQuery}”.
                </p>
              );
            }

            return entries.map(({ treeId, tree, resolved, highestRank, unlockedTreeRanks }) => {
              const masteries = unlockedTreeRanks
                .map((rank) => ({ rank, mastery: tree.ranks.find((r) => r.rank === rank)?.mastery }))
                .filter((m): m is { rank: RankName; mastery: NonNullable<typeof m.mastery> } => !!m.mastery);
              const accent = CATEGORY_ACCENT[tree.category];

              return (
                <div
                  key={treeId}
                  className={`rounded-2xl border-l-4 ${accent.border} border-y border-r border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-y-parchment-800 dark:border-r-parchment-800 dark:bg-parchment-900/60`}
                >
                  <h3 className="mb-3 flex flex-wrap items-center gap-2 text-base font-bold text-parchment-900 dark:text-parchment-50">
                    <TreeCrest tree={tree} size={32} />
                    {tree.name}
                    <span className={`rounded-full bg-parchment-900/5 px-2 py-0.5 text-3xs font-semibold uppercase tracking-wide ${accent.text} dark:bg-white/5`}>
                      {CATEGORY_LABELS[tree.category]}
                    </span>
                    {highestRank && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${RANK_COLORS[highestRank]}`}
                      >
                        {highestRank}
                      </span>
                    )}
                  </h3>

                {masteries.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {masteries.map(({ rank, mastery }) => (
                      <div
                        key={rank}
                        className="rounded-xl border border-gold-200 bg-gold-50/60 p-3 text-sm dark:border-gold-900 dark:bg-gold-950/30"
                      >
                        <span className="font-semibold text-gold-700 dark:text-gold-400">
                          ◈ Maestria ({rank}): {mastery.name}
                        </span>
                        <p className="mt-0.5 text-xs text-gold-900/80 dark:text-gold-200/80">
                          {mastery.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {resolved.map(({ kind, rank, def }) => (
                    <div
                      key={def.id}
                      className="surface rounded-xl border border-parchment-300 bg-parchment-100/80 p-3 dark:border-parchment-800 dark:bg-parchment-950/50"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <span className="font-semibold text-parchment-900 dark:text-parchment-50">
                          {kind === "ability" && (def as AbilityDef).signature && "◆ "}
                          {def.name}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          {kind === "ability" && <RitualBadge ability={def as AbilityDef} />}
                          <span
                            className={`rounded-full px-2 py-0.5 text-3xs font-semibold ring-1 ${RANK_COLORS[rank]}`}
                          >
                            {rank}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-parchment-600 dark:text-parchment-400">
                        {kind === "ability" ? "Habilidade" : "Talento"} · {def.paCost} PA
                        {kind === "ability" && (() => {
                          const ability = def as AbilityDef;
                          const pm = ability.pmCost !== undefined ? ` · ${ability.pmCost} PM` : "";
                          const pt = ability.ptCost !== undefined ? ` · ${ability.ptCost} PT` : "";
                          const pp = ability.ppCost !== undefined ? ` · ${ability.ppCost} PP` : "";
                          const actionLabel = ability.reaction
                            ? "1 Reação"
                            : ability.actions.normal === 0
                              ? "Passivo"
                              : `${ability.actions.normal} Ação${ability.actions.normal > 1 ? "ões" : ""}`;
                          return `${pm}${pt}${pp} · ${ability.range} · ${actionLabel}`;
                        })()}
                      </p>
                      {kind === "ability" ? (
                        <>
                          <p className="mt-1 text-sm text-parchment-700 dark:text-parchment-300">
                            {(def as AbilityDef).damage?.normal && (
                              <span className="font-medium">{(def as AbilityDef).damage!.normal}. </span>
                            )}
                            {(def as AbilityDef).effect}
                          </p>
                          <CastingBreakdown ability={def as AbilityDef} />
                          <IncantationBlock ability={def as AbilityDef} rank={rank} />
                          <AbilityQuickRoll
                            label={def.name}
                            hintText={(def as AbilityDef).damage?.normal ?? (def as AbilityDef).effect}
                          />
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-parchment-700 dark:text-parchment-300">
                          {(def as TalentDef).description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              );
            });
          })()}

          <CombinedSpellsSection query={grimoireQuery} />

          <InventorySection />
          <LoreSection lore={lore} />
        </div>
      </div>

      {/*
        Painel de regras rápidas.

        Este rodapé é `bg-parchment-900` nos DOIS temas — ele é escuro de
        propósito, e não por herdar o tema. Por isso os destaques aqui usam
        `wine-300` e não o `wine-400` do resto do site: medido, wine-400 sobre
        parchment-900 dá 4,01:1, logo abaixo do mínimo de 4,5:1 do WCAG AA pra
        texto de 14px. wine-300 no mesmo fundo dá 6,4:1.

        Como o painel não troca de cor com o tema, o erro também não trocava: a
        varredura de contraste de 0.1.12 achou isto no tema claro, mas ele
        estava igual no escuro desde sempre.
      */}
      <footer className="rounded-2xl border border-t-4 border-parchment-300 border-t-gold-500 bg-parchment-900 p-4 text-parchment-100 shadow-sm dark:border-parchment-800 dark:border-t-gold-600">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-parchment-400">
            <Target className="h-4 w-4" /> Regras Rápidas
          </h2>
          <Link
            href="/livro"
            className="flex items-center gap-1 text-xs font-medium text-wine-300 hover:text-wine-200"
          >
            <BookOpen className="h-3.5 w-3.5" /> Livro de regras completo
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="font-semibold text-wine-300">CD da Habilidade</span> = 8 + Atributo + Bônus do
            Rank ({Object.entries(RANK_BONUS).map(([r, b]) => `${r} +${b}`).join(", ")})
          </p>
          <p>
            <span className="font-semibold text-wine-300">Bônus de Ataque</span> = 1d20 + Atributo + Bônus do
            Rank
          </p>
          <p>
            <span className="font-semibold text-wine-300">Empilhamento</span> = bônus do mesmo tipo não somam
            (use o maior); teto de +5 vindo de aliados; máximo 5 Ações por turno (2 externas).
          </p>
          <p>
            <span className="font-semibold text-wine-300">Vantagem</span> = 2d20, escolha o maior (3d20 se
            Absoluta). Não empilha; Vantagem e Desvantagem se cancelam uma a uma.
          </p>
        </div>
      </footer>

      <DiceRoller />
    </div>
  );
}
