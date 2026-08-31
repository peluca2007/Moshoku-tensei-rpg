/**
 * Layout radial genérico (tipo "Destiny Board" do Albion Online): o nó raiz
 * fica no centro, cada nível de profundidade vira um anel mais distante, e
 * cada nó recebe uma fatia angular proporcional ao número de folhas que
 * carrega — assim um ramo com muito conteúdo ocupa mais espaço no círculo
 * do que um ramo vazio, sem overlap.
 */

export interface RadialInputNode<TMeta> {
  id: string;
  meta: TMeta;
  children: RadialInputNode<TMeta>[];
}

export interface PositionedNode<TMeta> {
  id: string;
  meta: TMeta;
  x: number;
  y: number;
  depth: number;
}

export interface RadialEdge {
  fromId: string;
  toId: string;
  depth: number;
}

export interface RadialLayoutResult<TMeta> {
  nodes: PositionedNode<TMeta>[];
  edges: RadialEdge[];
  maxRadius: number;
}

/**
 * Math.cos/Math.sin podem divergir no último bit entre o V8 do Node (SSR) e
 * do Chrome (hidratação), gerando um mismatch de hidratação no React.
 * Arredondar a 2 casas elimina a divergência e é precisão de sobra para px.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const leafCountCache = new WeakMap<RadialInputNode<unknown>, number>();

function countLeaves<TMeta>(node: RadialInputNode<TMeta>): number {
  const cached = leafCountCache.get(node);
  if (cached !== undefined) return cached;
  const count = node.children.length === 0 ? 1 : node.children.reduce((sum, c) => sum + countLeaves(c), 0);
  leafCountCache.set(node, count);
  return count;
}

export function layoutRadialTree<TMeta>(
  root: RadialInputNode<TMeta>, 
  ringSpacing = 110, 
  customPositions?: Map<string, { x: number; y: number }>,
  angleAdjustments?: Map<string, number>
): RadialLayoutResult<TMeta> {
  const nodes: PositionedNode<TMeta>[] = [];
  const edges: RadialEdge[] = [];
  let maxRadius = 0;

  function place(node: RadialInputNode<TMeta>, depth: number, angleStart: number, angleEnd: number) {
    let angle = (angleStart + angleEnd) / 2;
    
    // Aplicar ajuste de ângulo se houver
    if (angleAdjustments && angleAdjustments.has(node.id)) {
      angle += angleAdjustments.get(node.id)!;
    }

    const radius = depth * ringSpacing;
    maxRadius = Math.max(maxRadius, radius);
    
    let x = round2(radius * Math.cos(angle));
    let y = round2(radius * Math.sin(angle));
    
    // Se tem posição customizada, usa ela e calcula o ângulo visual para layout dos filhos
    let visualAngle = angle;
    if (customPositions && customPositions.has(node.id)) {
      const pos = customPositions.get(node.id)!;
      x = pos.x;
      y = pos.y;
      visualAngle = Math.atan2(y, x);
    }

    nodes.push({
      id: node.id,
      meta: node.meta,
      depth,
      x,
      y,
    });

    if (node.children.length === 0) return;
    const totalLeaves = node.children.reduce((sum, c) => sum + countLeaves(c), 0);
    let cursor = angleStart;
    const fullSpan = angleEnd - angleStart;
    for (const child of node.children) {
      const share = countLeaves(child) / totalLeaves;
      const childAngleStart = cursor;
      const childAngleEnd = cursor + share * fullSpan;
      
      // Se o pai tem posição customizada, usa o ângulo visual do pai para os filhos
      const childStart = customPositions && customPositions.has(node.id) 
        ? visualAngle - (fullSpan * share) / 2 
        : childAngleStart;
      const childEnd = customPositions && customPositions.has(node.id)
        ? visualAngle + (fullSpan * share) / 2
        : childAngleEnd;
      
      edges.push({ fromId: node.id, toId: child.id, depth: depth + 1 });
      place(child, depth + 1, childStart, childEnd);
      cursor = childAngleEnd;
    }
  }

  place(root, 0, 0, Math.PI * 2);
  return { nodes, edges, maxRadius };
}
