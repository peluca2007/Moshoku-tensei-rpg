import { AttributeKey } from "@/lib/types";

export interface SkillDef {
  name: string;
  attribute: AttributeKey;
  /** O que a perícia cobre, pra quem tiver dúvida na hora de escolher. */
  description: string;
}

/**
 * Cap. 1, seção 4, "Lista Mestre de Perícias": lista FECHADA — vinte
 * perícias, cada uma sob o atributo que a testa. Vigor não governa nenhuma
 * (já é reserva de PV e resistência a veneno/clima/cansaço, Cap. 4).
 *
 * "Persuasão" é o único nome canônico pro argumento sincero — Antecedentes
 * ou traços antigos que mencionem "Diplomacia" se referem a ela.
 */
export const SKILLS: SkillDef[] = [
  { name: "Atletismo", attribute: "forca", description: "Escalar, nadar, arrombar, forçar, saltar." },

  { name: "Acrobacia", attribute: "agilidade", description: "Equilíbrio e esquiva acrobática." },
  { name: "Furtividade", attribute: "agilidade", description: "Esconder-se e mover-se sem ser notado." },
  { name: "Ladinagem", attribute: "agilidade", description: "Agilidade manual — bater carteira, soltar algemas, plantar um item." },

  { name: "Arcanismo", attribute: "intelecto", description: "Teoria mágica e itens encantados." },
  { name: "História", attribute: "intelecto", description: "Fatos do passado e linhagens." },
  { name: "Investigação", attribute: "intelecto", description: "Deduzir pistas e ligar evidências." },
  { name: "Medicina", attribute: "intelecto", description: "Primeiros socorros e diagnóstico físico." },
  { name: "Natureza", attribute: "intelecto", description: "Fauna, flora e clima." },
  { name: "Ofícios", attribute: "intelecto", description: "Um ofício manual específico, escolhido ao adquirir (Forja, Culinária, Alquimia, Carpintaria...)." },
  { name: "Religião", attribute: "intelecto", description: "Doutrina, templos e o Continente Divino." },

  { name: "Atuação", attribute: "espirito", description: "Performance, música, oratória de palco." },
  { name: "Enganação", attribute: "espirito", description: "Mentir e disfarçar intenção." },
  { name: "Intimidação", attribute: "espirito", description: "Impor medo." },
  { name: "Intuição", attribute: "espirito", description: "Perceber mentira e prever intenção." },
  { name: "Lábia", attribute: "espirito", description: "Convencer rápido, pechinchar, tagarelar." },
  { name: "Lidar com Animais", attribute: "espirito", description: "Acalmar e comandar animais." },
  { name: "Percepção", attribute: "espirito", description: "Notar detalhes com os sentidos." },
  { name: "Persuasão", attribute: "espirito", description: "Convencer com argumento sincero." },
  { name: "Sobrevivência", attribute: "espirito", description: "Rastrear, orientar-se e sobreviver no ermo." },
];

export function getSkillByName(name: string): SkillDef | undefined {
  return SKILLS.find((s) => s.name.toLowerCase() === name.toLowerCase());
}
