import { ESSENCIAS, type EssenciaId, type OperadorId } from "@/lib/magiaTeorica";

export function TracoNucleo({ id }: { id: EssenciaId }) {
  switch (id) {
    case "mana": return <path d="M0-50 39 0 0 50-39 0ZM-12 0H12" />;
    case "fogo": return <path d="M0-53 46 35H-46ZM-24 49H24" />;
    case "agua": return <path d="M-48-24Q-24-48 0-24T48-24M-48 3Q-24-21 0 3T48 3M-48 30Q-24 6 0 30T48 30" />;
    case "vento": return <path d="M-51-20H21Q51-20 43-42T17-43M-42 5H45M-51 30H13Q42 30 32 49T8 45" />;
    case "terra": return <path d="M-30-38H48L29 38H-49ZM-41 7H37" />;
    case "som": return <path d="M-37-27V27M-14-47V47M10-27Q36 0 10 27M29-45Q65 0 29 45" />;
    case "vida": return <path d="M0 52V-49M0 7Q-33 8-36-24 0-25 0 7ZM0-5Q33-4 36-36 0-37 0-5ZM-21 40H21" />;
  }
}

export function TracoOperador({ id }: { id: OperadorId }) {
  switch (id) {
    case "projetar": return <path d="M0 68V-88M-24-63 0-88 24-63" />;
    case "expressar": return <path d="M-58-32Q-76 0-58 32M-79-51Q-108 0-79 51M58-32Q76 0 58 32M79-51Q108 0 79 51" />;
    case "conter": return <path d="M-34-63H-65V63H-34M34-63H65V63H34" />;
    case "rejeitar": return <path d="M-64-47 64 47M-64 47 64-47M-64-47V-24M64 47V24M-64 47H-42M64-47H42" />;
    case "expandir": return <path d="M-91 0H91M-69-20-91 0-69 20M69-20 91 0 69 20" />;
    case "repetir": return <path d="M-51-62A80 80 0 1 0 76-24M76-24 50-30M76-24 79-50" />;
  }
}

export type CamadaDoGlifo = "todas" | "nucleo" | OperadorId;

const INSCRICOES: Record<OperadorId, { x: number; y: number }> = {
  projetar: { x: 12, y: 63 },
  expressar: { x: 85, y: -57 },
  conter: { x: -64, y: -75 },
  rejeitar: { x: 69, y: 57 },
  expandir: { x: 90, y: 25 },
  repetir: { x: -50, y: -75 },
};

/** Núcleo e operadores compartilham a origem: cada ação altera o mesmo glifo. */
export function GlifoComposto({ essencia, operadores, camada = "todas" }: {
  essencia: EssenciaId;
  operadores: OperadorId[];
  camada?: CamadaDoGlifo;
}) {
  return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <g data-camada="nucleo" stroke={ESSENCIAS[essencia].cor} strokeWidth="4.5" opacity={camada === "todas" || camada === "nucleo" ? 1 : .15}>
      <TracoNucleo id={essencia} />
    </g>
    {operadores.map((id, indice) => <g key={id} data-camada={id} opacity={camada === "todas" || camada === id ? 1 : .12}>
      <g stroke="#10212a" strokeWidth="8"><TracoOperador id={id} /></g>
      <g stroke="#f5d49a" strokeWidth="3"><TracoOperador id={id} /></g>
      <text x={INSCRICOES[id].x} y={INSCRICOES[id].y} textAnchor="middle" dominantBaseline="middle" fill="#f5d49a" stroke="#10212a" strokeWidth="3" paintOrder="stroke" fontSize="12" fontFamily="Georgia, serif">{indice + 1}</text>
    </g>)}
  </g>;
}
