import { InterviewOption } from "@/data/interview";

/**
 * Monta um rascunho de lore a partir das respostas da Entrevista (Via 3) — cada
 * `text` de resposta já é uma frase pronta de infância (ver `interview.ts`), só
 * agrupamos em parágrafos e fechamos com o Destino sorteado. É só um ponto de
 * partida: o jogador edita à vontade depois em /ficha (campo `lore`).
 */
export function buildInterviewLore(
  answers: InterviewOption[],
  raceName: string,
  backgroundName: string,
  /** "antecedente" = a Raça foi escolhida pelo jogador, não sorteada — o fecho muda de voz. */
  mode: "ambos" | "antecedente" = "ambos"
): string {
  const texts = answers.map((a) => a.text.trim()).filter(Boolean);
  if (texts.length === 0) return "";

  const groupCount = 3;
  const groupSize = Math.ceil(texts.length / groupCount);
  const paragraphs: string[] = [];
  for (let i = 0; i < texts.length; i += groupSize) {
    paragraphs.push(texts.slice(i, i + groupSize).join(" "));
  }

  paragraphs.push(
    mode === "antecedente"
      ? `${raceName} desde que nasceu — isso nunca esteve em jogo. O que essa infância decidiu foi o resto: o caminho de ${backgroundName}, e tudo que vem com ele.`
      : `Dessa infância nasceu a pessoa por trás da ficha: ${raceName}, seguindo o caminho de ${backgroundName} — o resto da história é o que vai acontecer na mesa.`
  );

  return paragraphs.join("\n\n");
}
