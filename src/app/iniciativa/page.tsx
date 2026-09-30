import type { Metadata } from "next";
import InitiativeTracker from "@/components/InitiativeTracker";

export const metadata: Metadata = {
  title: "Tracker de Iniciativa",
  description: "A ordem da mesa, rodada a rodada, com PV e condições de cada combatente.",
};

export default function IniciativaPage() {
  return (
    <div>
      <InitiativeTracker />
    </div>
  );
}
