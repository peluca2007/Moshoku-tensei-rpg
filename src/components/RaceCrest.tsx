import { Race } from "@/lib/types";
import Crest from "./Crest";

/**
 * O retrato de uma raça. Igual ao `TreeCrest`: toda a apresentação vive em
 * `Crest`, porque as três coleções de arte do site — brasões de árvore, ícones
 * de loja e retratos de raça — chegaram com a mesma mistura de formatos e
 * fundos, e resolver isso três vezes seria garantir que as três divergissem.
 */
export default function RaceCrest({
  race,
  size = 32,
  className = "",
  rounded = "rounded-lg",
}: {
  race: Pick<Race, "icon" | "name">;
  size?: number;
  className?: string;
  rounded?: string;
}) {
  if (!race.icon) return null;
  return <Crest src={race.icon} size={size} className={className} rounded={rounded} />;
}
