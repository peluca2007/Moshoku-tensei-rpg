import type { Metadata } from "next";
import EncounterBuilder from "@/components/EncounterBuilder";

export const metadata: Metadata = {
  title: "Encontros",
  description: "Monte criaturas, simule a luta centenas de vezes e assista às batalhas na arena.",
};

export default function EncontrosPage() {
  return <EncounterBuilder />;
}
