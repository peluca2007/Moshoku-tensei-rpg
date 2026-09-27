import { ESSENCIAS, type EssenciaId, type VerboId } from "@/lib/magiaTeorica";

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

/** O traço de cada verbo, desenhado POR CIMA do núcleo. */
export function TracoOperador({ id }: { id: VerboId }) {
  switch (id) {
    case "lancar": return <path d="M0 68V-88M-24-63 0-88 24-63" />;
    case "sinalizar": return <path d="M-58-32Q-76 0-58 32M-79-51Q-108 0-79 51M58-32Q76 0 58 32M79-51Q108 0 79 51" />;
    case "erguer": return <path d="M-34-63H-65V63H-34M34-63H65V63H34" />;
    case "selar": return <path d="M-64-47 64 47M-64 47 64-47M-64-47V-24M64 47V24M-64 47H-42M64-47H42" />;
  }
}

export type CamadaDoGlifo = "todas" | "nucleo" | VerboId;

/** Núcleo e verbos compartilham a origem: cada verbo altera o mesmo glifo. */
export function GlifoComposto({ essencia, verbos, camada = "todas" }: {
  essencia: EssenciaId;
  verbos: VerboId[];
  camada?: CamadaDoGlifo;
}) {
  return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <g data-camada="nucleo" stroke={ESSENCIAS[essencia].cor} strokeWidth="4.5" opacity={camada === "todas" || camada === "nucleo" ? 1 : .15}>
      <TracoNucleo id={essencia} />
    </g>
    {verbos.map((id) => <g key={id} data-camada={id} opacity={camada === "todas" || camada === id ? 1 : .12}>
      <g stroke="#10212a" strokeWidth="8"><TracoOperador id={id} /></g>
      <g stroke="#f5d49a" strokeWidth="3"><TracoOperador id={id} /></g>
    </g>)}
  </g>;
}
