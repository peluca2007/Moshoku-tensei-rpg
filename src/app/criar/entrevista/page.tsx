import type { Metadata } from "next";
import CreationInterview from "@/components/CreationInterview";

export const metadata: Metadata = {
  title: "A Entrevista",
  description: "Crie o personagem respondendo perguntas sobre quem ele é.",
};

export default function CriarEntrevistaPage() {
  return (
    <div>
      <CreationInterview />
    </div>
  );
}
