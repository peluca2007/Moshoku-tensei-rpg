"use client";

import { useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Wand2, Swords, Compass, Circle, Lock, CheckCircle2, Plus, ZoomIn, ZoomOut, Maximize, Search } from "lucide-react";
import { useActiveCharacter, useCharacterStore } from "@/store/useCharacterStore";
import { canPurchaseAbility, canUnlockRank, getKnowledgeCount, getRankUnlockPaCost } from "@/store/selectors";
import { CATEGORY_LABELS, getTreeGroups, isTreeEmpty, TREES } from "@/data/trees";
import { AbilityDef, CharacterData, RANK_BONUS, RANK_REQUIREMENTS, RankName, TalentDef, Tree } from "@/lib/types";
import { CATEGORY_ACCENT, RANK_ACCENT } from "@/lib/rankColors";
import { layoutRadialTree, RadialInputNode, PositionedNode, RadialEdge } from "@/lib/radialLayout";
import { describeGrantedSkills } from "@/lib/treeSkills";
import { CastingBreakdown, IncantationBlock } from "@/components/AbilityDetail";

type NodeMeta =
  | { kind: "root"; label: string }
  | { kind: "category"; category: Tree["category"]; label: string }
  | { kind: "subgroup"; category: Tree["category"]; subgroup: string; label: string }
  | { kind: "tree"; tree: Tree; label: string }
  | { kind: "rank"; tree: Tree; rank: RankName; label: string };

const RING_SPACING = 100;
const CANVAS_PADDING = 100;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 2.5;

// Quanto o meio da curva de conexão "estufa" pra fora do anel (px), só estética.
const HYBRID_CURVE_BULGE = 30;

const TIER_ORDER: RankName[] = ["Principiante", "Intermediário", "Avançado", "Santo", "Rei", "Imperador"];

/**
 * Math.cos/Math.sin podem divergir no último bit entre SSR e hidratação —
 * arredondar a 2 casas evita mismatch, igual round2() em radialLayout.ts.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function getHybridParentTreeIds(tree: Tree): string[] {
  if (!tree.prerequisiteNote) return [];
  const allTrees = TREES.map((t) => t.name.toLowerCase());
  const lower = tree.prerequisiteNote.toLowerCase();
  return allTrees
    .filter((n) => lower.includes(n))
    .map((n) => TREES.find((t) => t.name.toLowerCase() === n)!.id)
    .filter(Boolean);
}

function getRequiredRankForHybrid(tree: Tree): RankName {
  if (!tree.prerequisiteNote) return "Avançado";
  const note = tree.prerequisiteNote.toLowerCase();
  if (note.includes("intermediário")) return "Intermediário";
  return "Avançado";
}

function getHighestUnlockedTier(treeId: string, character: CharacterData): RankName {
  const unlocked = character.unlockedRanks.filter(r => r.treeId === treeId);
  if (unlocked.length === 0) return "Principiante";
  return unlocked.reduce((max: RankName, r) =>
    TIER_ORDER.indexOf(r.rank) > TIER_ORDER.indexOf(max) ? r.rank : max
  , unlocked[0].rank);
}

function treeMeetsHybridPrereqs(tree: Tree, character: CharacterData): boolean {
  if (!tree.prerequisiteNote) return true;
  const parentIds = getHybridParentTreeIds(tree);
  const requiredRank = getRequiredRankForHybrid(tree);
  const requiredIndex = TIER_ORDER.indexOf(requiredRank);

  for (const pid of parentIds) {
    const highest = getHighestUnlockedTier(pid, character);
    if (TIER_ORDER.indexOf(highest) < requiredIndex) return false;
  }
  return true;
}

function isTierUnlocked(treeId: string, tier: RankName, character: CharacterData): boolean {
  return character.unlockedRanks.some(r => r.treeId === treeId && r.rank === tier);
}

function isTreeUnlocked(treeId: string, character: CharacterData): boolean {
  return character.unlockedRanks.some(r => r.treeId === treeId);
}



function buildRankChain(tree: Tree, index: number, character: CharacterData): RadialInputNode<NodeMeta> | null {
  if (index >= TIER_ORDER.length) return null;
  const rank = TIER_ORDER[index];
  const unlocked = isTierUnlocked(tree.id, rank, character);
  const reachable = index === 0 || isTierUnlocked(tree.id, TIER_ORDER[index - 1], character);
  if (!reachable && !unlocked) return null;
  const next = buildRankChain(tree, index + 1, character);
  return {
    id: `${tree.id}::${rank}`,
    meta: { kind: "rank", tree, rank, label: tree.rankLabels?.[rank] ?? rank },
    children: next ? [next] : [],
  };
}

function buildDestinyTree(character: CharacterData): RadialInputNode<NodeMeta> {
  const groups = getTreeGroups();
  const categories: Tree["category"][] = ["magia", "corpo", "utilidade"];

  // Árvores híbridas (prerequisiteNote) NÃO entram na hierarquia normal
  // categoria->subgrupo->árvore: elas não são filhas de nenhum subgrupo aqui.
  // Isso evita a "aresta salto" (subgrupo natural -> árvore reposicionada)
  // que atravessava o mapa. Elas são renderizadas à parte, flutuando fora do
  // anel principal e ligadas só pelo conector dourado às duas árvores-base —
  // ver o useMemo de hybridNodes/hybridEdges em DestinyBoard.
  const categoryNodes = categories.map((category) => {
    const subgroupNodes = groups
      .filter((g) => g.category === category)
      .map((g) => {
        const treeNodes = g.trees
          .filter((tree) => !tree.prerequisiteNote) // Hybrid trees rendered separately, not nested here
          .filter((tree) => !tree.hiddenFromCreation || isTreeUnlocked(tree.id, character))
          .map((tree) => ({
            id: tree.id,
            meta: { kind: "tree", tree, label: tree.name } as NodeMeta,
            children: [buildRankChain(tree, 0, character)!],
          }));

        if (treeNodes.length === 0) return null;

        return {
          id: `${category}::${g.subgroup}`,
          meta: { kind: "subgroup", category, subgroup: g.subgroup, label: g.subgroup } as NodeMeta,
          children: treeNodes,
        };
      })
      .filter((n): n is RadialInputNode<NodeMeta> => n !== null);
    if (subgroupNodes.length === 0) return null;
    return {
      id: `cat::${category}`,
      meta: { kind: "category", category, label: CATEGORY_LABELS[category] } as NodeMeta,
      children: subgroupNodes,
    };
  }).filter((n): n is RadialInputNode<NodeMeta> => n !== null);

  return { id: "root", meta: { kind: "root", label: "Aventureiro" }, children: categoryNodes };
}

function iconForCategory(category: Tree["category"]) {
  return category === "magia" ? Wand2 : category === "corpo" ? Swords : Compass;
}

function sizeForDepth(depth: number) {
  if (depth === 0) return 48;
  if (depth === 1) return 38;
  if (depth === 2) return 26;
  if (depth === 3) return 28;
  return 22;
}

interface HybridConnection {
  hybridId: string;
  parent1Id: string;
  parent2Id: string;
  parent1Tree: Tree;
  parent2Tree: Tree;
  hybridTree: Tree;
  isActive: boolean;
  requiredRank: RankName;
}

export default function DestinyBoard({ initialFocusTreeId }: { initialFocusTreeId?: string }) {
  const character = useActiveCharacter();
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "warning" } | null>(null);
  const animationsPlayedRef = useRef(false);
  const hybridAnimationsPlayedRef = useRef(false);

  useEffect(() => {
    animationsPlayedRef.current = true;
  }, []);

  useEffect(() => {
    hybridAnimationsPlayedRef.current = true;
  }, []);

  const showToast = (message: string, type: "info" | "success" | "warning" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const destinyTree = useMemo(() => buildDestinyTree(character), [character]);

  // Layout natural — nenhuma árvore normal é movida, então toda aresta
  // subgrupo->árvore continua curta e correta.
  const { nodes: baseNodes, edges: baseEdges, maxRadius: baseMaxRadius } = useMemo(
    () => layoutRadialTree(destinyTree, RING_SPACING),
    [destinyTree]
  );
  const basePosById = useMemo(() => new Map(baseNodes.map((n) => [n.id, n])), [baseNodes]);

  // Árvores híbridas flutuam FORA do anel principal (raio maior que qualquer
  // coisa do layout natural), no ângulo bissetor entre suas duas árvores-base
  // — que continuam exatamente onde estavam, então não existe aresta de
  // "salto" pra elas: a única ligação é o conector dourado desenhado à parte
  // (HybridConnectionLine) mais a corrente de ranks da própria híbrida, que
  // se estende radialmente pra fora a partir dela.
  const { nodes: hybridNodes, edges: hybridEdges, maxRadius: hybridMaxRadius } = useMemo(() => {
    const nodes: PositionedNode<NodeMeta>[] = [];
    const edges: RadialEdge[] = [];
    let maxR = baseMaxRadius;

    TREES.filter((t) => t.prerequisiteNote).forEach((hybrid) => {
      if (!treeMeetsHybridPrereqs(hybrid, character)) return;
      const parents = getHybridParentTreeIds(hybrid);
      if (parents.length !== 2) return;

      const p1 = TREES.find((t) => t.id === parents[0]);
      const p2 = TREES.find((t) => t.id === parents[1]);
      if (!p1 || !p2) return;

      const requiredRank = getRequiredRankForHybrid(hybrid);
      const p1Node = basePosById.get(`${p1.id}::${requiredRank}`);
      const p2Node = basePosById.get(`${p2.id}::${requiredRank}`);
      if (!p1Node || !p2Node) return;

      const angle1 = Math.atan2(p1Node.y, p1Node.x);
      const angle2 = Math.atan2(p2Node.y, p2Node.x);
      let diff = angle2 - angle1;
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;
      const bisector = angle1 + diff / 2;

      let radius = baseMaxRadius + RING_SPACING * 1.5;
      let depth = 3; // mesmo nível visual de uma árvore normal
      nodes.push({
        id: hybrid.id,
        meta: { kind: "tree", tree: hybrid, label: hybrid.name },
        x: round2(radius * Math.cos(bisector)),
        y: round2(radius * Math.sin(bisector)),
        depth,
      });

      let prevId = hybrid.id;
      for (let i = 0; i < TIER_ORDER.length; i++) {
        const rank = TIER_ORDER[i];
        const unlockedTier = isTierUnlocked(hybrid.id, rank, character);
        const reachableTier = i === 0 || isTierUnlocked(hybrid.id, TIER_ORDER[i - 1], character);
        if (!reachableTier && !unlockedTier) break;

        radius += RING_SPACING;
        depth += 1;
        const id = `${hybrid.id}::${rank}`;
        nodes.push({
          id,
          meta: { kind: "rank", tree: hybrid, rank, label: hybrid.rankLabels?.[rank] ?? rank },
          x: round2(radius * Math.cos(bisector)),
          y: round2(radius * Math.sin(bisector)),
          depth,
        });
        edges.push({ fromId: prevId, toId: id, depth });
        prevId = id;
      }

      maxR = Math.max(maxR, radius);
    });

    return { nodes, edges, maxRadius: maxR };
  }, [baseMaxRadius, basePosById, character]);

  const finalNodes = useMemo(() => [...baseNodes, ...hybridNodes], [baseNodes, hybridNodes]);
  const finalEdges = useMemo(() => [...baseEdges, ...hybridEdges], [baseEdges, hybridEdges]);
  const finalMaxRadius = Math.max(baseMaxRadius, hybridMaxRadius);
  const finalPosById = useMemo(() => new Map(finalNodes.map((n) => [n.id, n])), [finalNodes]);

  const canvasSize = finalMaxRadius * 2 + CANVAS_PADDING * 2;
  const center = canvasSize / 2;
  const [selectedId, setSelectedId] = useState("root");
  const selected = finalPosById.get(selectedId) ?? finalPosById.get("root")!;

  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.35);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const hybridConnections = useMemo((): HybridConnection[] => {
    const connections: HybridConnection[] = [];
    const hybridTrees = TREES.filter(t => t.prerequisiteNote);

    hybridTrees.forEach(hybrid => {
      const parents = getHybridParentTreeIds(hybrid);
      if (parents.length !== 2) return;

      const p1 = TREES.find(t => t.id === parents[0]);
      const p2 = TREES.find(t => t.id === parents[1]);
      if (!p1 || !p2) return;

      const requiredRank = getRequiredRankForHybrid(hybrid);
      const requiredIndex = TIER_ORDER.indexOf(requiredRank);

      const p1Highest = getHighestUnlockedTier(p1.id, character);
      const p2Highest = getHighestUnlockedTier(p2.id, character);
      const p1Index = TIER_ORDER.indexOf(p1Highest);
      const p2Index = TIER_ORDER.indexOf(p2Highest);

      const isActive = p1Index >= requiredIndex && p2Index >= requiredIndex;

      const parent1RankNodeId = `${p1.id}::${requiredRank}`;
      const parent2RankNodeId = `${p2.id}::${requiredRank}`;

      connections.push({
        hybridId: hybrid.id,
        parent1Id: parent1RankNodeId,
        parent2Id: parent2RankNodeId,
        parent1Tree: p1,
        parent2Tree: p2,
        hybridTree: hybrid,
        isActive,
        requiredRank,
      });
    });

    return connections;
  }, [character.unlockedRanks]);

  const recenter = () => {
    const el = viewportRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const nextZoom = 0.35;
    setZoom(nextZoom);
    setPan({ x: width / 2 - center * nextZoom, y: height / 2 - center * nextZoom });
  };

  useLayoutEffect(() => {
    recenter();
  }, [canvasSize]);

  useLayoutEffect(() => {
    if (initialFocusTreeId) focusOnTree(initialFocusTreeId);
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

  function focusOnTree(treeId: string) {
    const node = finalPosById.get(treeId);
    const el = viewportRef.current;
    if (!node || !el) return;
    const { width, height } = el.getBoundingClientRect();
    const nextZoom = 0.6;
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
    zoomBy(e.deltaY < 0 ? 1.15 : 0.87);
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

  function getNodeIconAndStyle(meta: NodeMeta, unlocked: boolean, canUnlock: boolean, isRank: boolean) {
    if (isRank) {
      if (canUnlock) {
        return { Icon: Plus, className: "bg-gold-500 border-gold-400 text-white shadow-lg animate-pulse-ring" };
      }
      if (unlocked) {
        const accent = RANK_ACCENT[(meta as { kind: "rank"; tree: Tree; rank: RankName; label: string }).rank];
        return { Icon: CheckCircle2, className: `${accent.solidBg} border-white text-white shadow ${accent.glow} dark:border-parchment-950` };
      }
      return { Icon: Lock, className: "bg-parchment-100 dark:bg-parchment-900 text-parchment-300 dark:text-parchment-700 border-parchment-300 dark:border-parchment-800" };
    }
    // For non-rank nodes (root, category, subgroup, tree), use existing visual
    return nodeVisual(meta);
  }

  // Curva suave em dois arcos de quadrática, passando exatamente pelos 3 pontos
  // (p1 -> híbrida -> p2), com o meio de cada arco puxado levemente pra fora do
  // anel (mesma direção radial) — dá o efeito de "ponte" arqueada entre as duas
  // árvores-base em vez de um zigue-zague reto.
  function HybridConnectionLine({ connection }: { connection: HybridConnection }) {
    if (!connection.isActive) return null;

    const p1Node = finalPosById.get(connection.parent1Id);
    const p2Node = finalPosById.get(connection.parent2Id);
    const hybridNode = finalPosById.get(connection.hybridId);
    if (!p1Node || !p2Node || !hybridNode) return null;

    const p1x = center + p1Node.x;
    const p1y = center + p1Node.y;
    const p2x = center + p2Node.x;
    const p2y = center + p2Node.y;
    const hx = center + hybridNode.x;
    const hy = center + hybridNode.y;

    const angleAt = (x: number, y: number) => Math.atan2(y - center, x - center);
    const radiusAt = (x: number, y: number) => Math.hypot(x - center, y - center);

    const bulgePoint = (aX: number, aY: number, bX: number, bY: number) => {
      const midAngle = (angleAt(aX, aY) + angleAt(bX, bY)) / 2;
      const midRadius = (radiusAt(aX, aY) + radiusAt(bX, bY)) / 2 + HYBRID_CURVE_BULGE;
      return { x: center + midRadius * Math.cos(midAngle), y: center + midRadius * Math.sin(midAngle) };
    };

    const ctrl1 = bulgePoint(p1x, p1y, hx, hy);
    const ctrl2 = bulgePoint(hx, hy, p2x, p2y);

    const hasAnimated = hybridAnimationsPlayedRef.current;

    return (
      <g filter="url(#connection-glow)">
        <motion.path
          d={`M ${p1x} ${p1y} Q ${ctrl1.x} ${ctrl1.y} ${hx} ${hy} Q ${ctrl2.x} ${ctrl2.y} ${p2x} ${p2y}`}
          stroke="#c9a86c"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="10,5"
          fill="none"
          opacity={0.8}
          initial={hasAnimated ? false : { pathLength: 0 }}
          animate={hasAnimated ? { pathLength: 1 } : { pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
        />
        <motion.circle
          cx={hx} cy={hy}
          r={6}
          fill="#c9a86c"
          opacity={0.9}
          initial={hasAnimated ? false : { scale: 0, opacity: 0 }}
          animate={hasAnimated ? { scale: 1, opacity: 0.9 } : { scale: 1, opacity: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1.5 }}
        />
      </g>
    );
  }


  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
      <div className="relative h-[75vh] min-h-[500px] overflow-hidden rounded-2xl border border-parchment-300 bg-parchment-50 shadow-sm dark:border-parchment-800 dark:bg-parchment-950">
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
            <svg className="absolute inset-0" width={canvasSize} height={canvasSize} style={{ pointerEvents: "none" }}>
              <defs>
                <linearGradient id="tier-locked-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8dcc8" />
                  <stop offset="100%" stopColor="#d4c4a8" />
                </linearGradient>
                <linearGradient id="connection-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c9a86c" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#f4e4b8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#c9a86c" stopOpacity="0.3" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {finalEdges.map((edge) => {
                const from = finalPosById.get(edge.fromId);
                const to = finalPosById.get(edge.toId);
                if (!from || !to) return null;
                return (
                  <motion.line
                    key={`${edge.fromId}->${edge.toId}`}
                    x1={center + from.x}
                    y1={center + from.y}
                    x2={center + to.x}
                    y2={center + to.y}
                    strokeWidth={Math.max(2, 5 - edge.depth * 0.4)}
                    className={edgeClassName(to.meta)}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: edge.depth * 0.05 }}
                  />
                );
              })}

              {hybridConnections.map(c => <HybridConnectionLine key={c.hybridId} connection={c} />)}
            </svg>

            {finalNodes.map((node) => {
                const size = sizeForDepth(node.depth);
                const isSelected = node.id === selectedId;
                const isRank = node.meta.kind === "rank";
                const rankMeta = isRank ? node.meta as { kind: "rank"; tree: Tree; rank: RankName; label: string } : null;
                const treeMeta = node.meta.kind === "tree" ? node.meta as { kind: "tree"; tree: Tree; label: string } : null;
                const unlocked = isRank ? isRankUnlocked(rankMeta!.tree.id, rankMeta!.rank) :
                                 treeMeta ? isTreeUnlocked(treeMeta.tree.id, character) : true;
                const reachable = isRank ? (TIER_ORDER.indexOf(rankMeta!.rank) === 0 || isRankUnlocked(rankMeta!.tree.id, TIER_ORDER[TIER_ORDER.indexOf(rankMeta!.rank) - 1])) : true;
                const canUnlock = isRank && !unlocked && reachable;

                const delay = animationsPlayedRef.current ? (node.depth * 0.06 + (isRank ? TIER_ORDER.indexOf(rankMeta!.rank) * 0.04 : 0)) : 0;
                const hasAnimated = animationsPlayedRef.current;
                const nodeLeft = center + node.x;
                const nodeTop = center + node.y;

                const { Icon, className } = getNodeIconAndStyle(node.meta, unlocked, canUnlock, isRank);

                return (
                  <AnimatePresence key={node.id} mode="wait">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setSelectedId(node.id);
                        if (isRank && !unlocked && reachable) {
                          showToast(`Clique em "Desbloquear" no painel lateral → ${rankMeta!.tree.name} • ${rankMeta!.rank}`, "info");
                        }
                      }}
                      aria-label={`Selecionar ${node.meta.label}`}
                      style={{ left: nodeLeft, top: nodeTop, width: size, height: size }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-2 transition-transform hover:scale-110 ${className} ${isSelected ? "ring-4 ring-white dark:ring-parchment-200" : ""} ${hasAnimated ? "animate-node-entrance" : ""}`}
                      exit={{ opacity: 0, scale: 0.5, y: -10 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay
                      }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
                    </motion.button>
                  </AnimatePresence>
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
            className="max-w-[180px] bg-transparent text-xs text-parchment-600 outline-none dark:text-parchment-300 sm:max-w-none"
          >
            <option value="">Buscar árvore...</option>
            {TREES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.prerequisiteNote ? `${t.name} ⭐` : t.name}
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

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-400"
              : toast.type === "warning"
              ? "bg-amber-600 text-white border-amber-400"
              : "bg-parchment-900 text-white border-parchment-600"
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <DetailPanel meta={selected.meta} showToast={showToast} />
    </div>
  );
}

function DetailPanel({ meta, showToast }: { meta: NodeMeta; showToast: (msg: string, type?: "info" | "success" | "warning") => void }) {
  const character = useActiveCharacter();

  const isRankUnlocked = (treeId: string, rank: RankName) =>
    character.unlockedRanks.some((r) => r.treeId === treeId && r.rank === rank);
  if (meta.kind === "root") {
    return (
      <PanelShell title="Aventureiro">
        <p className="text-parchment-700 dark:text-parchment-300">
          Clique num ramo do círculo para explorar Magia, Corpo ou Utilidade. Arraste pra mover o mapa e use a
          roda do mouse (ou os botões) pra dar zoom.
        </p>
      </PanelShell>
    );
  }

  if (meta.kind === "category") {
    return (
      <PanelShell title={meta.label} accentClass={CATEGORY_ACCENT[meta.category].text}>
        <p className="text-parchment-700 dark:text-parchment-300">Um dos três grandes pilares do sistema. Continue seguindo a linha pra ver os subgrupos e árvores.</p>
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
        <p className="text-parchment-700 dark:text-parchment-300">Subgrupo de árvores relacionadas. Continue seguindo a linha pra ver cada árvore.</p>
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
          <p className="text-parchment-600 dark:text-parchment-400">Em Breve — conteúdo desta árvore ainda não foi escrito.</p>
        ) : (
          <>
            {meta.tree.prerequisiteNote && (
              <motion.div
                className="rounded-lg border border-wine-300 bg-wine-50/60 p-2 text-xs text-wine-800 dark:border-wine-900 dark:bg-wine-950/30 dark:text-wine-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <b>Pré-requisito: </b> {meta.tree.prerequisiteNote}
              </motion.div>
            )}
            {meta.tree.tagline && (
              <p className="italic text-parchment-600 dark:text-parchment-400 my-3">{meta.tree.tagline}</p>
            )}
            {(meta.tree.keyAttributeLabel || meta.tree.resourceLabel) && (
              <p className="text-xs text-parchment-600 dark:text-parchment-400">
                {meta.tree.keyAttributeLabel && <>Atributo-chave: <span className="font-medium">{meta.tree.keyAttributeLabel}</span></>}
                {meta.tree.keyAttributeLabel && meta.tree.resourceLabel && " · "}
                {meta.tree.resourceLabel && <>Recurso: <span className="font-medium">{meta.tree.resourceLabel}</span></>}
              </p>
            )}
            {meta.tree.proficiencies && (
              <motion.div
                className="rounded-lg border border-parchment-400 bg-parchment-100 p-3 text-xs dark:border-parchment-700 dark:bg-parchment-900/70 mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="mb-1 font-bold uppercase tracking-wide text-wine-700 dark:text-wine-300">Proficiências</p>
                <p className="text-parchment-700 dark:text-parchment-300"><b>Armas e armaduras:</b> {meta.tree.proficiencies.armas}</p>
                {describeGrantedSkills(meta.tree) && (
                  <p className="mt-1 text-parchment-700 dark:text-parchment-300">
                    <b>Ensina:</b> {describeGrantedSkills(meta.tree)}
                    <span className="text-parchment-600 dark:text-parchment-400">(Só se for Árvore Inicial)</span>
                  </p>
                )}
                <p className="mt-1 text-parchment-700 dark:text-parchment-300"><b>Bônus de Rank:</b> {meta.tree.proficiencies.pericias}</p>
              </motion.div>
            )}
            <p className="text-parchment-600 dark:text-parchment-400">Conhecimentos: {knowledge}. Clique nos ranks abaixo para ver detalhes.</p>
          </>
        )}
      </PanelShell>
    );
  }

  const accent = RANK_ACCENT[meta.rank];
  const unlocked = isRankUnlocked(meta.tree.id, meta.rank);
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
        <motion.div
          className="rounded-lg border border-gold-200 bg-gold-50/60 p-3 dark:border-gold-900 dark:bg-gold-950/30 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-sm font-semibold text-gold-700 dark:text-gold-400">◈ Maestria: {rankDef.mastery.name}</span>
          <p className="mt-1 text-xs text-gold-900/80 dark:text-gold-200/80">{rankDef.mastery.description}</p>
          {!unlocked && <p className="mt-1 text-[11px] italic text-gold-700/70 dark:text-gold-400/70">Gratuita ao desbloquear o rank.</p>}
        </motion.div>
      )}

      {!unlocked && (
        <motion.div className="mb-4 p-3 rounded-lg bg-parchment-200 dark:bg-parchment-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-parchment-700 dark:text-parchment-300 mb-2">
            Requer {requirement.knowledgeRequired} conhecimento(s) nesta árvore
            {meta.rank !== "Principiante" && " e o rank anterior desbloqueado"}. Custa {unlockPaCost} PA.
          </p>
          <button
            type="button"
            disabled={!unlockCheck.ok}
            onClick={() => {
              useCharacterStore.getState().unlockRank(meta.tree.id, meta.rank);
              showToast(`${meta.tree.name} • ${meta.rank} desbloqueado!`, "success");
            }}
            className="w-full rounded-lg bg-parchment-900 px-3 py-2 text-sm font-semibold text-white transition-colors enabled:hover:bg-parchment-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-parchment-900"
          >
            Desbloquear ({unlockPaCost} PA)
          </button>
          {!unlockCheck.ok && unlockCheck.reason && <p className="mt-1 text-xs text-rose-500">{unlockCheck.reason}</p>}
        </motion.div>
      )}

      {unlocked && items.length === 0 && <p className="text-parchment-600 dark:text-parchment-400">Em Breve — conteúdo deste rank ainda não foi escrito.</p>}

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
              showToast={showToast}
            />
          ))}
        </div>
      )}
    </PanelShell>
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
    <motion.aside
      className="sticky top-4 h-fit max-h-[70vh] overflow-y-auto rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm dark:border-parchment-800 dark:bg-parchment-900/60"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <h3 className={`text-base font-bold ${accentClass ?? "text-parchment-900 dark:text-parchment-50"}`}>{title}</h3>
      {subtitle && <p className="mb-2 text-xs text-parchment-600 dark:text-parchment-400">{subtitle}</p>}
      <div className="mt-2 space-y-2 text-sm text-parchment-700 dark:text-parchment-300">{children}</div>
    </motion.aside>
  );
}

function AbilityListItem({
  character,
  treeId,
  rank,
  kind,
  def,
  showToast,
}: {
  character: CharacterData;
  treeId: string;
  rank: RankName;
  kind: "ability" | "talent";
  def: AbilityDef | TalentDef;
  showToast: (msg: string, type?: "info" | "success" | "warning") => void;
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
    <motion.div
      className="rounded-lg border border-parchment-300 bg-parchment-100/80 p-3 dark:border-parchment-800 dark:bg-parchment-950/50"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-parchment-900 dark:text-parchment-50">
          {ability?.signature && "◆ "}{def.name}
        </span>
        {owned && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
      </div>
      <p className="text-xs text-parchment-600 dark:text-parchment-400 mb-2">
        {kind === "ability" ? "Habilidade" : "Talento"} · {def.paCost} PA
        {ability &&
          ` · ${ability.pmCost !== undefined ? `${ability.pmCost} PM · ` : ""}${
            ability.ptCost !== undefined ? `${ability.ptCost} PT · ` : ""
          }${ability.ppCost !== undefined ? `${ability.ppCost} PP · ` : ""}${ability.range} · ${actionLabel}`}
      </p>
      {ability ? (
        <>
          <p className="text-xs text-parchment-600 dark:text-parchment-300 mb-2">
            {ability.damage?.normal && <span className="font-medium">{ability.damage.normal}. </span>}
            {ability.effect}
          </p>
          <CastingBreakdown ability={ability} />
          <IncantationBlock ability={ability} />
        </>
      ) : (
        <p className="text-xs text-parchment-600 dark:text-parchment-300">{talent?.description}</p>
      )}
      {!owned && (
        <motion.button
          type="button"
          disabled={!check.ok}
          onClick={() => {
            useCharacterStore.getState().purchaseAbility({ treeId, rank, kind, id: def.id });
            showToast(`${def.name} comprado!`, "success");
          }}
          className="mt-2 w-full rounded-lg bg-wine-600 px-2 py-1.5 text-xs font-semibold text-white transition-colors enabled:hover:bg-wine-500 disabled:cursor-not-allowed disabled:opacity-40"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Comprar ({def.paCost} PA)
        </motion.button>
      )}
      {!check.ok && check.reason && <p className="mt-1 text-[11px] text-rose-500">{check.reason}</p>}
    </motion.div>
  );
}