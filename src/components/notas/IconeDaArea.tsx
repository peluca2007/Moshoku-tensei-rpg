import { BookOpen, ScrollText, Swords, PanelsTopLeft, Gauge, Wrench } from "lucide-react";
import type { AreaDaNota } from "@/data/patchNotes";

const icones = { regras: ScrollText, livro: BookOpen, encontros: Swords, site: PanelsTopLeft, desempenho: Gauge, bastidores: Wrench };
/** O nome escrito acompanha o ícone em todas as áreas. */
export default function IconeDaArea({ area }: { area: AreaDaNota }) {
  const Icone = icones[area];
  return <Icone aria-hidden="true" size={14} />;
}
