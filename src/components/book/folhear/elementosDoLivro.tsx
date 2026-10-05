import type { CSSProperties } from "react";

/**
 * O ELEMENTO VIVO NA PÁGINA (2026-10-05, pedido do autor: "animações no livro
 * de fogo, água, vento, terra… o folhear é pra ser lindo mesmo").
 *
 * Cada página de árvore, na dupla aberta do modo Livro, ganha o elemento da
 * escola nas bordas: brasa no Fogo, onda na Água, rajada no Vento, pedrisco na
 * Terra, e assim por diante. A camada mora na FOLHA (o papel atrás do texto),
 * nunca no fluxo: a diagramação e o diário não a enxergam. Uma máscara deixa
 * o efeito só nas margens e nos cantos, para que ele nunca passe por baixo de
 * uma linha que alguém esteja lendo de perto.
 *
 * Só as folhas da dupla aberta têm partículas: virou a página, as da dupla
 * velha somem e as da nova nascem já em movimento (atraso negativo). Sem
 * movimento, na impressão e no papel fora de vista, nada existe.
 */
export type EfeitoDoElemento =
  | "brasa" | "faisca" | "luz" | "bolha" | "nota"
  | "onda" | "fluxo"
  | "vento" | "folha" | "petala"
  | "terra" | "neve"
  | "runa" | "estrela"
  | "corte" | "brilho" | "fumaca";

export const EFEITO_DA_ARVORE: Record<string, EfeitoDoElemento> = {
  fogo: "brasa",
  agua: "onda",
  vento: "vento",
  terra: "terra",
  cura: "luz",
  desintoxicacao: "bolha",
  teorica: "runa",
  invocacao: "petala",
  "deus-da-espada": "corte",
  "deus-da-agua-corpo": "fluxo",
  "deus-do-norte": "neve",
  "armas-pesadas": "terra",
  "cavalaria-e-escudos": "brilho",
  vendaval: "vento",
  "punho-de-fogo": "faisca",
  arquearia: "folha",
  "furtividade-e-armadilhas": "fumaca",
  "bardo-e-interacao": "nota",
  "navegacao-e-lideranca": "estrela",
};

/** Quantas partículas cada efeito usa. Os desenhos inteiros (onda, runa, corte, brilho) são uma peça só. */
const QUANTAS: Record<EfeitoDoElemento, number> = {
  brasa: 14, faisca: 16, luz: 10, bolha: 10, nota: 7,
  onda: 2, fluxo: 2,
  vento: 10, folha: 9, petala: 9,
  terra: 10, neve: 16,
  runa: 1, estrela: 12,
  corte: 2, brilho: 1, fumaca: 6,
};

const GLIFO: Partial<Record<EfeitoDoElemento, string[]>> = {
  nota: ["♪", "♫", "♩"],
  neve: ["❄", "·", "✻"],
};

/** Pseudoaleatório fixo por página: o mesmo desenho a cada visita, diferente entre páginas. */
function sorteio(semente: number) {
  let s = semente * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function ElementoDaFolha({ arvoreId, pagina, lado }: { arvoreId: string; pagina: number; lado: string }) {
  const efeito = EFEITO_DA_ARVORE[arvoreId];
  if (!efeito) return null;
  const r = sorteio(pagina + 1);
  const n = QUANTAS[efeito];
  const glifos = GLIFO[efeito];
  return (
    <span className="folhear-elemento" data-efeito={efeito} data-lado={lado} aria-hidden>
      {Array.from({ length: n }, (_, i) => {
        const estilo = {
          "--x": `${(r() * 100).toFixed(1)}%`,
          "--y": `${(r() * 100).toFixed(1)}%`,
          "--atraso": `${(-r() * 12).toFixed(2)}s`,
          "--duracao": `${(0.75 + r() * 0.6).toFixed(2)}`,
          "--tamanho": `${(0.6 + r() * 0.8).toFixed(2)}`,
          "--deriva": `${((r() - 0.5) * 2).toFixed(2)}`,
        } as CSSProperties;
        return <i key={i} style={estilo}>{glifos ? glifos[i % glifos.length] : null}</i>;
      })}
    </span>
  );
}
