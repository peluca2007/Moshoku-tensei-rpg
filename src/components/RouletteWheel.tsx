"use client";

import { useId, useState } from "react";
import { LucideIcon } from "lucide-react";

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 132;

function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return [CENTER + radius * Math.sin(rad), CENTER - radius * Math.cos(rad)] as const;
}

function slicePath(startAngle: number, endAngle: number) {
  const [x1, y1] = pointOnCircle(startAngle, RADIUS);
  const [x2, y2] = pointOnCircle(endAngle, RADIUS);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixHex(a: string, b: string, t: number) {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

const WHEEL_COLOR_A = "#4a0e2e"; // wine-600
const WHEEL_COLOR_B = "#b8862e"; // gold-500

/** Cor de cada fatia — varredura suave vinho→dourado→vinho ao redor do círculo, pra roleta ficar "linda" sem precisar de uma paleta de N cores distintas (o número dentro da fatia já identifica qual é qual). */
export function wheelSliceColor(index: number, total: number) {
  const t = index / total;
  const wave = t < 0.5 ? t * 2 : (1 - t) * 2;
  return mixHex(WHEEL_COLOR_A, WHEEL_COLOR_B, wave);
}

export interface WheelOption {
  id: string;
  label: string;
  /** Chance real (0–1) desse resultado sair — mostrada na legenda ao lado da roleta. */
  probability: number;
}

/** Aleatoriedade do giro (voltas extras + leve variação dentro da fatia) — gerada fora do render, no clique que dispara o giro, pra manter o componente puro. */
export interface SpinVariance {
  /** -1 a 1, deslocamento dentro da fatia sorteada (evita cair sempre no centro exato). */
  jitterUnit: number;
  /** Quantas voltas completas extras a roleta dá antes de parar (efeito de suspense). */
  extraSpins: number;
}

export function randomSpinVariance(): SpinVariance {
  return { jitterUnit: Math.random() * 2 - 1, extraSpins: 5 + Math.floor(Math.random() * 2) };
}

interface RouletteWheelProps {
  options: WheelOption[];
  /** Ícone parado no centro (não gira com a roleta) — identifica visualmente qual roleta é essa. */
  icon: LucideIcon;
  /** Incrementa a cada giro pra disparar a animação, mesmo se o resultado repetir. */
  spinToken: number;
  /** Id sorteado pra este giro — a roleta gira até apontar pra ele. */
  targetId: string | null;
  spinVariance: SpinVariance;
  /** Chamado quando a roleta termina de girar e para em cima do resultado. */
  onSettle: () => void;
}

/** Roleta visual — só decorativa: o sorteio real já aconteceu antes de girar (rollRandomRace/rollRandomBackground), isso aqui só aponta pro resultado com suspense. Cada fatia mostra só um número; o nome e a chance de cada opção vivem na WheelLegend ao lado. */
export default function RouletteWheel({ options, icon: Icon, spinToken, targetId, spinVariance, onSettle }: RouletteWheelProps) {
  const gradientId = useId();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [handledToken, setHandledToken] = useState(spinToken);

  // Cada novo spinToken é um giro novo — ajusta a rotação-alvo durante o
  // render (em vez de useEffect) pra não perder um frame antes da transição
  // CSS começar. Ver https://react.dev/learn/you-might-not-need-an-effect.
  if (spinToken !== handledToken) {
    setHandledToken(spinToken);
    const index = targetId != null ? options.findIndex((o) => o.id === targetId) : -1;
    if (index !== -1) {
      const sliceAngle = 360 / options.length;
      const desiredMod = (360 - (index * sliceAngle + sliceAngle / 2)) % 360;
      const currentMod = ((rotation % 360) + 360) % 360;
      const deltaMod = (desiredMod - currentMod + 360) % 360;
      const jitterMax = Math.max(sliceAngle / 2 - 4, 0) * 0.5;
      const jitter = spinVariance.jitterUnit * jitterMax;
      setIsSpinning(true);
      setRotation(rotation + spinVariance.extraSpins * 360 + deltaMod + jitter);
    }
  }

  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.propertyName !== "transform") return;
    setIsSpinning(false);
    onSettle();
  }

  const sliceAngle = 360 / options.length;
  const pegs = options.map((_, i) => pointOnCircle(i * sliceAngle, RADIUS + 8));

  return (
    <div className="relative mx-auto flex w-full max-w-[300px] shrink-0 flex-col items-center">
      {/* Brilho difuso atrás da roleta, só decorativo. */}
      <div className="absolute top-8 h-60 w-60 rounded-full bg-gold-500/20 blur-3xl" aria-hidden />

      {/* Ponteiro fixo — não gira junto com a roleta. */}
      <svg width={32} height={34} viewBox="0 0 28 30" className="absolute -top-2 left-1/2 z-20 -translate-x-1/2 drop-shadow-md" aria-hidden>
        <path d="M14 30 L2 8 A 12 12 0 1 1 26 8 Z" fill="#e2ba5e" stroke="#4a0e2e" strokeWidth={1.5} />
        <circle cx={14} cy={11} r={4} fill="#4a0e2e" />
      </svg>

      <div className="relative">
        <div
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? "transform 3.4s cubic-bezier(0.15, 0.65, 0.25, 1)" : "none",
          }}
          className="drop-shadow-xl"
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full" role="img" aria-label="Roleta do Destino">
            <defs>
              {options.map((option, i) => (
                <radialGradient key={option.id} id={`${gradientId}-${i}`} cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor={wheelSliceColor(i, options.length)} stopOpacity={0.72} />
                  <stop offset="100%" stopColor={wheelSliceColor(i, options.length)} />
                </radialGradient>
              ))}
            </defs>

            {options.map((option, i) => {
              const start = i * sliceAngle;
              const end = start + sliceAngle;
              const mid = start + sliceAngle / 2;
              const [lx, ly] = pointOnCircle(mid, RADIUS * 0.68);
              const numberRotation = mid > 90 && mid < 270 ? mid + 180 : mid;
              return (
                <g key={option.id}>
                  <path
                    d={slicePath(start, end)}
                    fill={`url(#${gradientId}-${i})`}
                    stroke="#fdf6e3"
                    strokeOpacity={0.35}
                    strokeWidth={1.5}
                  />
                  <text
                    x={lx}
                    y={ly}
                    fill="#fdf6e3"
                    fontSize={15}
                    fontWeight={800}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${numberRotation} ${lx} ${ly})`}
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}

            {/* Aro externo dourado com pinos, estilo roleta de sorte. */}
            <circle cx={CENTER} cy={CENTER} r={RADIUS + 3} fill="none" stroke="#e2ba5e" strokeWidth={3.5} />
            {pegs.map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r={3} fill="#fcf6e8" stroke="#b8862e" strokeWidth={1} />
            ))}
          </svg>
        </div>

        {/* Miolo fixo, não gira — identifica a roleta e evita que o texto do centro fique de cabeça pra baixo. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-400 bg-parchment-50 shadow-md dark:bg-parchment-900">
            <Icon className="h-7 w-7 text-wine-600 dark:text-wine-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Legenda ao lado da roleta: número (bate com o da fatia), nome por extenso, barra + porcentagem da chance real. Ordenada da mais comum pra mais rara — reforça "quanto mais forte, mais raro". */
export function WheelLegend({ options, highlightId }: { options: WheelOption[]; highlightId: string | null }) {
  const maxProbability = Math.max(...options.map((o) => o.probability), 0.0001);
  const sorted = [...options]
    .map((option, index) => ({ option, index }))
    .sort((a, b) => b.option.probability - a.option.probability);

  return (
    <ol className="w-full min-w-0 space-y-1">
      {sorted.map(({ option, index }) => {
        const isHit = option.id === highlightId;
        return (
          <li
            key={option.id}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
              isHit ? "bg-gold-500/15 ring-1 ring-gold-500/50" : ""
            }`}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-parchment-50 shadow-sm"
              style={{ backgroundColor: wheelSliceColor(index, options.length) }}
            >
              {index + 1}
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                isHit ? "font-bold text-wine-700 dark:text-wine-300" : "text-parchment-700 dark:text-parchment-300"
              }`}
              title={option.label}
            >
              {option.label}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="h-1.5 w-10 overflow-hidden rounded-full bg-parchment-300 dark:bg-parchment-700">
                <span
                  className="block h-full rounded-full bg-gold-500"
                  style={{ width: `${Math.max(6, (option.probability / maxProbability) * 100)}%` }}
                />
              </span>
              <span className="w-11 shrink-0 text-right text-xs font-semibold tabular-nums text-parchment-600 dark:text-parchment-400">
                {(option.probability * 100).toFixed(1)}%
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
