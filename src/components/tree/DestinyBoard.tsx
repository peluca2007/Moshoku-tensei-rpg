"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Crown, Wand2, Swords, Compass, Circle, Lock, CheckCircle2, ZoomIn, ZoomOut, Maximize, Search } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { canPurchaseAbility, canUnlockRank, getKnowledgeCount, getRankUnlockPaCost } from "@/store/selectors";
import { CATEGORY_LABELS, getTreeGroups, isTreeEmpty, TREES } from "@/data/trees";
import { AbilityDef, CharacterData, RANK_BONUS, RANK_REQUIREMENTS, RANKS, RankName, TalentDef, Tree } from "@/lib/types";
import { CATEGORY_ACCENT, RANK_ACCENT } from "@/lib/rankColors";
import { layoutRadialTree, RadialInputNode } from "@/lib/radialLayout";
import { CastingBreakdown, IncantationBlock, RitualBadge } from "@/components/AbilityDetail";

type NodeMeta =
  | { kind: "root"; label: string }
  | { kind: "category"; category: Tree["category"]; label: string }
  | { kind: "subgroup"; category: Tree["category"]; subgroup: string; label: string }
  | { kind: "tree"; tree: Tree; label: string }
  | { kind: "rank"; tree: Tree; rank: RankName; label: string };

const RING_SPACING = 95;
const CANVAS_PADDING = 90;
const MIN_ZOOM = 0.12;
const MAX_ZOOM = 2.2;

function buildRankChain(tree: Tree, index: number): RadialInputNode<NodeMeta> | null {
  if (index >= RANKS.length) return null;
  const rank = RANKS[index];
  const next = buildRankChain(tree, index + 1);
  return {
    id: `${tree.id}::${rank}`,
    meta: { kind: "rank", tree, rank, label: tree.rankLabels?.[rank] ?? rank },
    children: next ? [next] : [],
  };
}

function buildDestinyTree(): RadialInputNode<NodeMeta> {
  const groups = getTreeGroups();
  const categories: Tree["category"][] = ["magia", "corpo", "utilidade"];

  const categoryNodes = categories.map((category) => {
    const subgroupNodes = groups
      .filter((g) => g.category === category)
      .map((g) => {
        const treeNodes = g.trees.map((tree) => ({
          id: tree.id,
          meta: { kind: "tree", tree, label: tree.name } as NodeMeta,
          children: [buildRankChain(tree, 0)!],
        }));
        return {
          id: `${category}::${g.subgroup}`,
          meta: { kind: "subgroup", category, subgroup: g.subgroup, label: g.subgroup } as NodeMeta,
          children: treeNodes,
        };
      });
    return {
      id: `cat::${category}`,
      meta: { kind: "category", category, label: CATEGORY_LABELS[category] } as NodeMeta,
      children: subgroupNodes,
    };
  });

  return { id: "root", meta: { kind: "root", label: "Aventureiro" }, children: categoryNodes };
}

function iconForCategory(category: Tree["category"]) {
  return category === "magia" ? Wand2 : category === "corpo" ? Swords : Compass;
}

function sizeForDepth(depth: number) {
  if (depth === 0) return 46;
  if (depth === 1) return 36;
  if (depth === 2) return 24;
  if (depth === 3) return 26;
  return 20;
}

export default function DestinyBoard({ initialFocusTreeId }: { initialFocusTreeId?: string }) {
  const destinyTree = useMemo(() => buildDestinyTree(), []);
  const { nodes, edges, maxRadius } = useMemo(() => layoutRadialTree(destinyTree, RING_SPACING), [destinyTree]);
  const posById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const canvasSize = maxRadius * 2 + CANVAS_PADDING * 2;
  const center = canvasSize / 2;

  const character = useActiveCharacter();
  const [selectedId, setSelectedId] = useState("root");
  const selected = posById.get(selectedId) ?? posById.get("root")!;

  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.4);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const recenter = () => {
    const el = viewportRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const nextZoom = 0.4;
    setZoom(nextZoom);
    setPan({ x: width / 2 - center * nextZoom, y: height / 2 - center * nextZoom });
  };

  useLayoutEffect(() => {
    recenter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize]);

  /** Deep-link vindo do livro de regras (`/arvores?arvore=<id>`) — centraliza direto na árvore em vez do centro genérico. */
  useLayoutEffect(() => {
    if (initialFocusTreeId) focusOnTree(initialFocusTreeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFocusTreeId]);

  function zoomBy(factor: number) {
    const el = viewportRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setZoom((prevZoom) => {
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * factor));
      setPan((prevPan) => {
        const focusX = (width / 2 - prevPan.x) / prevZoom;
        const focusY = (height / 2 - prevPan.y) / prevZoom;
        return { x: width / 2 - focusX * nextZoom, y: height / 2 - focusY * nextZoom };
      });
      return nextZoom;
    });
  }

  /** Busca rápida: seleciona uma árvore e centraliza o mapa nela, sem precisar navegar manualmente pelas 17 opções. */
  function focusOnTree(treeId: string) {
    const node = posById.get(treeId);
    const el = viewportRef.current;
    if (!node || !el) return;
    const { width, height } = el.getBoundingClientRect();
    const nextZoom = 0.7;
    setSelectedId(treeId);
    setZoom(nextZoom);
    setPan({ x: width / 2 - (center + node.x) * nextZoom, y: height / 2 - (center + node.y) * nextZoom });
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY),
    });
  }
  function handlePointerUp() {
    dragRef.current = null;
  }
  function handleWheel(e: React.WheelEvent) {
    zoomBy(e.deltaY < 0 ? 1.12 : 0.89);
  }

  const isRankUnlocked = (treeId: string, rank: RankName) =>
    character.unlockedRanks.some((r) => r.treeId === treeId && r.rank === rank);

  function edgeClassName(meta: NodeMeta): string {
    switch (meta.kind) {
      case "category":
      case "subgroup":
        return `${CATEGORY_ACCENT[meta.category].stroke} opacity-40`;
      case "tree":
        return `${CATEGORY_ACCENT[meta.tree.category].stroke} ${isTreeEmpty(meta.tree) ? "opacity-20" : "opacity-50"}`;
      case "rank":
        return isRankUnlocked(meta.tree.id, meta.rank)
          ? `${RANK_ACCENT[meta.rank].stroke} opacity-80`
          : "stroke-parchment-300 dark:stroke-parchment-700 opacity-25";
      default:
        return "stroke-parchment-400 opacity-30";
    }
  }

  function nodeVisual(meta: NodeMeta) {
    switch (meta.kind) {
      case "root":
        return { Icon: Crown, className: "bg-parchment-800 border-amber-300 text-amber-300 shadow-lg" };
      case "category":
        return {
          Icon: iconForCategory(meta.category),
          className: `${CATEGORY_ACCENT[meta.category].solidBg} border-white/80 text-white shadow-md dark:border-parchment-950`,
        };
      case "subgroup":
        return {
          Icon: Circle,
          className: `bg-parchment-50 dark:bg-parchment-900 ${CATEGORY_ACCENT[meta.category].text} ${CATEGORY_ACCENT[meta.category].border}`,
        };
      case "tree": {
        const empty = isTreeEmpty(meta.tree);
        return {
          Icon: iconForCategory(meta.tree.category),
          className: empty
            ? "bg-parchment-100 dark:bg-parchment-900 text-parchment-300 dark:text-parchment-700 border-parchment-300 dark:border-parchment-800"
            : `${CATEGORY_ACCENT[meta.tree.category].solidBg} text-white border-white/80 shadow dark:border-parchment-950`,
        };
      }
      case "rank": {
        const unlocked = isRankUnlocked(meta.tree.id, meta.rank);
        const accent = RANK_ACCENT[meta.rank];
        return {
          Icon: unlocked ? CheckCircle2 : Lock,
          className: unlocked
            ? `${accent.solidBg} text-white border-white shadow ${accent.glow} dark:border-parchment-950`
            : "bg-parchment-100 dark:bg-parchment-900 text-parchment-300 dark:text-parchment-700 border-parchment-300 dark:border-parchment-800",
        };
      }
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
      <div
        className="relative overflow-hidden rounded-2xl border border-parchment-300 bg-parchment-50 shadow-sm dark:border-parchment-800 dark:bg-parchment-950"
        style={{ height: 640 }}
      >
        <div
          ref={viewportRef}
          className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          <div
            style={{
              width: canvasSize,
              height: canvasSize,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
            className="relative"
          >
            <svg className="pointer-events-none absolute inset-0" width={canvasSize} height={canvasSize}>
              {edges.map((edge) => {
                const from = posById.get(edge.fromId);
                const to = posById.get(edge.toId);
                if (!from || !to) return null;
                return (
                  <line
                    key={`${edge.fromId}->${edge.toId}`}
                    x1={center + from.x}
                    y1={center + from.y}
                    x2={center + to.x}
                    y2={center + to.y}
                    strokeWidth={Math.max(1.5, 4 - edge.depth * 0.3)}
                    className={edgeClassName(to.meta)}
                  />
                );
              })}
            </svg>

            {nodes.map((node) => {
              const size = sizeForDepth(node.depth);
              const { Icon, className } = nodeVisual(node.meta)!;
              const isSelected = node.id === selectedId;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  aria-label={`Selecionar ${node.meta.label}`}
                  style={{ left: center + node.x, top: center + node.y, width: size, height: size }}
                  className={`absolute flex -tranparchment-x-1/2 -tranparchment-y-1/2 items-center justify-center rounded-full border-2 transition-transform hover:scale-110 ${className} ${
                    isSelected ? "ring-4 ring-white dark:ring-parchment-200" : ""
                  }`}
                >
                  <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border border-parchment-300 bg-parchment-100/90 px-2.5 py-1.5 shadow dark:border-parchment-700 dark:bg-parchment-800/90">
          <Search className="h-3.5 w-3.5 shrink-0 text-parchment-400" />
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) focusOnTree(e.target.value);
            }}
            className="max-w-[160px] bg-transparent text-xs text-parchment-600 outline-none dark:text-parchment-300 sm:max-w-none"
          >
            <option value="">Buscar árvore...</option>
            {TREES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => zoomBy(1.25)}
            aria-label="Aumentar zoom"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-parchment-300 bg-parchment-100/90 text-parchment-600 shadow hover:bg-parchment-50 dark:border-parchment-700 dark:bg-parchment-800/90 dark:text-parchment-300"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(0.8)}
            aria-label="Diminuir zoom"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-parchment-300 bg-parchment-100/90 text-parchment-600 shadow hover:bg-parchment-50 dark:border-parchment-700 dark:bg-parchment-800/90 dark:text-parchment-300"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={recenter}
            aria-label="Centralizar mapa"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-parchment-300 bg-parchment-100/90 text-parchment-600 shadow hover:bg-parchment-50 dark:border-parchment-700 dark:bg-parchment-800/90 dark:text-parchment-300"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>

      <DetailPanel meta={selected.meta} character={character} />
    </div>
  );
}

function PanelShell({
  title,
  subtitle,
  accentClass,
  children,
}: {
  title: string;
  subtitle?: string;
  accentClass?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="sticky top-4 h-fit max-h-[640px] overflow-y-auto rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60">
      <h3 className={`text-base font-bold ${accentClass ?? "text-parchment-900 dark:text-parchment-50"}`}>{title}</h3>
      {subtitle && <p className="mb-2 text-xs text-parchment-500 dark:text-parchment-400">{subtitle}</p>}
      <div className="mt-2 space-y-2 text-sm text-parchment-700 dark:text-parchment-300">{children}</div>
    </aside>
  );
}

function AbilityListItem({
  character,
  treeId,
  rank,
  kind,
  def,
}: {
  character: CharacterData;
  treeId: string;
  rank: RankName;
  kind: "ability" | "talent";
  def: AbilityDef | TalentDef;
}) {
  const owned = character.purchasedAbilities.some((a) => a.treeId === treeId && a.id === def.id);
  const check = canPurchaseAbility(character, treeId, rank, kind, def.id);
  const ability = kind === "ability" ? (def as AbilityDef) : undefined;
  const talent = kind === "talent" ? (def as TalentDef) : undefined;

  const actionLabel = ability
    ? ability.reaction
      ? "1 Reação"
      : ability.actions.normal === 0
        ? "Passivo"
        : `${ability.actions.normal} Ação${ability.actions.normal > 1 ? "ões" : ""}`
    : undefined;

  return (
    <div className="rounded-lg border border-parchment-300 bg-parchment-100/80 p-2.5 dark:border-parchment-800 dark:bg-parchment-950/50">
      <div className="mb-0.5 flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-parchment-900 dark:text-parchment-50">
          {ability?.signature && "◆ "}
          {def.name}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {ability && <RitualBadge ability={ability} />}
          {owned && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        </div>
      </div>
      <p className="text-xs text-parchment-500 dark:text-parchment-400">
        {kind === "ability" ? "Habilidade" : "Talento"} · {def.paCost} PA
        {ability &&
          ` · ${ability.pmCost !== undefined ? `${ability.pmCost} PM · ` : ""}${
            ability.ptCost !== undefined ? `${ability.ptCost} PT · ` : ""
          }${ability.ppCost !== undefined ? `${ability.ppCost} PP · ` : ""}${ability.range} · ${actionLabel}`}
      </p>
      {ability ? (
        <>
          <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-300">
            {ability.damage?.normal && <span className="font-medium">{ability.damage.normal}. </span>}
            {ability.effect}
          </p>
          <CastingBreakdown ability={ability} />
          <IncantationBlock ability={ability} />
        </>
      ) : (
        <p className="mt-1 text-xs text-parchment-600 dark:text-parchment-300">{talent?.description}</p>
      )}
      {!owned && (
        <>
          <button
            type="button"
            disabled={!check.ok}
            onClick={() => useCharacterStore.getState().purchaseAbility({ treeId, rank, kind, id: def.id })}
            className="mt-2 w-full rounded-lg bg-wine-600 px-2 py-1.5 text-xs font-semibold text-white transition-colors enabled:hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Comprar ({def.paCost} PA)
          </button>
          {!check.ok && check.reason && <p className="mt-1 text-[11px] text-rose-500">{check.reason}</p>}
        </>
      )}
    </div>
  );
}

function DetailPanel({ meta, character }: { meta: NodeMeta; character: CharacterData }) {
  if (meta.kind === "root") {
    return (
      <PanelShell title="Aventureiro">
        <p>
          Clique num ramo do círculo para explorar Magia, Corpo ou Utilidade. Arraste pra mover o mapa e use a
          roda do mouse (ou os botões) pra dar zoom.
        </p>
      </PanelShell>
    );
  }

  if (meta.kind === "category") {
    return (
      <PanelShell title={meta.label} accentClass={CATEGORY_ACCENT[meta.category].text}>
        <p>Um dos três grandes pilares do sistema. Continue seguindo a linha pra ver os subgrupos e árvores.</p>
      </PanelShell>
    );
  }

  if (meta.kind === "subgroup") {
    return (
      <PanelShell
        title={meta.label}
        subtitle={CATEGORY_LABELS[meta.category]}
        accentClass={CATEGORY_ACCENT[meta.category].text}
      >
        <p>Subgrupo de árvores relacionadas. Continue seguindo a linha pra ver cada árvore.</p>
      </PanelShell>
    );
  }

  if (meta.kind === "tree") {
    const empty = isTreeEmpty(meta.tree);
    const knowledge = getKnowledgeCount(character, meta.tree.id);
    return (
      <PanelShell
        title={meta.tree.name}
        subtitle={meta.tree.subgroup}
        accentClass={CATEGORY_ACCENT[meta.tree.category].text}
      >
        {empty ? (
          <p>Em Breve — conteúdo desta árvore ainda não foi escrito.</p>
        ) : (
          <>
            {meta.tree.tagline && <p className="italic text-parchment-500 dark:text-parchment-400">{meta.tree.tagline}</p>}
            {(meta.tree.keyAttributeLabel || meta.tree.resourceLabel) && (
              <p className="text-xs text-parchment-500 dark:text-parchment-400">
                {meta.tree.keyAttributeLabel && <>Atributo-chave: <span className="font-medium">{meta.tree.keyAttributeLabel}</span></>}
                {meta.tree.keyAttributeLabel && meta.tree.resourceLabel && " · "}
                {meta.tree.resourceLabel && <>Recurso: <span className="font-medium">{meta.tree.resourceLabel}</span></>}
              </p>
            )}
            <p>Conhecimentos adquiridos: {knowledge}. Continue seguindo a linha pra ver os ranks.</p>
          </>
        )}
      </PanelShell>
    );
  }

  // rank
  const accent = RANK_ACCENT[meta.rank];
  const unlocked = character.unlockedRanks.some((r) => r.treeId === meta.tree.id && r.rank === meta.rank);
  const requirement = RANK_REQUIREMENTS[meta.rank];
  const unlockPaCost = getRankUnlockPaCost(meta.tree.id, meta.rank);
  const unlockCheck = canUnlockRank(character, meta.tree.id, meta.rank);
  const rankDef = meta.tree.ranks.find((r) => r.rank === meta.rank);
  const items = rankDef
    ? [
        ...rankDef.talents.map((t) => ({ kind: "talent" as const, def: t as AbilityDef | TalentDef })),
        ...rankDef.abilities.map((a) => ({ kind: "ability" as const, def: a as AbilityDef | TalentDef })),
      ]
    : [];

  return (
    <PanelShell
      title={meta.label}
      subtitle={`${meta.tree.name} · Rank ${meta.rank} · Bônus +${RANK_BONUS[meta.rank]}`}
      accentClass={accent.text}
    >
      {rankDef?.mastery && (
        <div className="rounded-lg border border-gold-200 bg-gold-50/60 p-2.5 dark:border-gold-900 dark:bg-gold-950/30">
          <span className="text-sm font-semibold text-gold-700 dark:text-gold-400">
            ◈ Maestria: {rankDef.mastery.name}
          </span>
          <p className="mt-0.5 text-xs text-gold-900/80 dark:text-gold-200/80">{rankDef.mastery.description}</p>
          {!unlocked && <p className="mt-1 text-[11px] italic text-gold-700/70 dark:text-gold-400/70">Gratuita ao desbloquear o rank.</p>}
        </div>
      )}

      {!unlocked && (
        <>
          <p>
            Requer {requirement.knowledgeRequired} conhecimento(s) nesta árvore
            {meta.rank !== "Principiante" && " e o rank anterior desbloqueado"}. Custa {unlockPaCost} PA.
          </p>
          <button
            type="button"
            disabled={!unlockCheck.ok}
            onClick={() => useCharacterStore.getState().unlockRank(meta.tree.id, meta.rank)}
            className="w-full rounded-lg bg-parchment-900 px-3 py-2 text-sm font-semibold text-white transition-colors enabled:hover:bg-parchment-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-parchment-900"
          >
            Desbloquear ({unlockPaCost} PA)
          </button>
          {!unlockCheck.ok && unlockCheck.reason && <p className="text-xs text-rose-500">{unlockCheck.reason}</p>}
        </>
      )}

      {unlocked && items.length === 0 && <p>Em Breve — conteúdo deste rank ainda não foi escrito.</p>}

      {unlocked && items.length > 0 && (
        <div className="space-y-2">
          {items.map(({ kind, def }) => (
            <AbilityListItem
              key={def.id}
              character={character}
              treeId={meta.tree.id}
              rank={meta.rank}
              kind={kind}
              def={def}
            />
          ))}
        </div>
      )}
    </PanelShell>
  );
}
