import { notFound } from "next/navigation";
import Semeador from "@/components/dev/Semeador";

/**
 * `/semente-dev` — a porta de entrada das verificações automáticas.
 *
 * Ela só existe em desenvolvimento. Em produção devolve 404: uma rota que
 * escreve fichas no `localStorage` de quem abre não tem o que fazer no site
 * publicado, mesmo sendo inofensiva — e um link vazado dela apagaria o roster
 * de alguém.
 *
 * O componente cliente explica o resto.
 */
export default function SementeDev() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Semeador />;
}
