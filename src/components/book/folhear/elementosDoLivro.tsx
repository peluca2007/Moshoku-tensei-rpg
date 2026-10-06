import type { CSSProperties } from "react";

/**
 * O GESTO DA ESCOLA NA PÁGINA (2026-10-05, pedidos do autor: "animações no
 * livro de fogo, água, vento, terra… o folhear é pra ser lindo"; depois, "dá
 * pra melhorar e deixar mais leve" e "leve em conta o que cada árvore
 * representa").
 *
 * Cada árvore conta a MECÂNICA dela num gesto curto, nas margens da página:
 * a Água molha e depois congela, a Terra ergue a mureta e depois soterra, a
 * Desintoxicação pinga três Doses e estoura na terceira, o Deus da Espada fica
 * parado e corta uma vez só. O texto da regra é o mesmo; o gesto é a mesma
 * ideia, sem palavras.
 *
 * LEVE (medido com CPU 4×, numa dupla aberta): a primeira versão gastava de
 * 108 a 400 ms de processador por segundo, porque as animações liam variáveis
 * e unidades de contêiner dentro dos keyframes, e o contêiner tinha máscara e
 * mistura de cor — tudo isso tira a animação da placa de vídeo. Agora:
 * - os keyframes só mexem em `transform` e `opacity`, com valores fixos em px
 *   da página nativa (816 × 1056, ver `diagramacao.ts`);
 * - o que varia por peça (posição, tamanho, ritmo, atraso) é estático, inline;
 * - nada de filtro, sombra animada, máscara no contêiner nem mistura de cor;
 * - poucas peças por página (de 3 a 9), e só nas duas páginas da dupla aberta.
 *
 * As receitas são desenhadas pra página da ESQUERDA (a borda de fora é a
 * esquerda); a da direita é espelhada no CSS (`data-lado="dir"`).
 */

/** Uma peça da receita: o nome do gesto (CSS), onde ela mora e o ritmo dela. */
interface Peca {
  p: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** Atraso em segundos (positivo: começa depois; negativo: já em andamento). */
  a?: number;
  /** Duração em segundos, quando difere da do gesto. */
  d?: number;
  t?: string;
}

const brasas = (n: number): Peca[] =>
  Array.from({ length: n }, (_, i) => i % 2
    ? { p: "brasa-alta", x: 12 + (i * 11) % 34, y: 1060, a: -i * 1.7, d: 8 + (i % 3) }
    : { p: "brasa", x: 90 + i * 97, y: 1060, a: -i * 1.1, d: 5 + (i % 3) });

export const RECEITA_DA_ARVORE: Record<string, Peca[]> = {
  // Em Chamas: cobra na hora, e continua cobrando — a brasa nunca para de subir.
  fogo: [{ p: "calor", x: 0, y: 880, w: 816, h: 176 }, ...brasas(6)],
  // Molhado → Congelado: a onda corre, e de tempos em tempos o gelo a toma.
  agua: [
    { p: "onda", x: 0, y: 1000, w: 1632, h: 60 },
    { p: "onda-funda", x: 0, y: 978, w: 1632, h: 54 },
    { p: "gelo", x: 0, y: 1030, w: 816, h: 26 },
    { p: "cristal", x: 14, y: 920, w: 36, h: 36 },
    { p: "cristal", x: 470, y: 1026, w: 26, h: 26, a: 0.25 },
    { p: "cristal", x: 640, y: 978, w: 34, h: 34, a: 0.5 },
  ],
  // Desequilibrado: a rajada passa e tira a folha do prumo.
  vento: [
    { p: "rajada", x: -320, y: 72, w: 300, h: 3 },
    { p: "rajada", x: -320, y: 96, w: 220, h: 2, a: 0.35 },
    { p: "rajada", x: -320, y: 1034, w: 320, h: 3, a: 3.5 },
    { p: "rajada", x: -320, y: 1046, w: 240, h: 2, a: 3.85 },
    { p: "folha-solta", x: 22, y: 180, w: 16, h: 10 },
    { p: "folha-solta", x: 20, y: 1036, w: 14, h: 9, a: 3.5 },
  ],
  // Atolado → Soterrado: a única que constrói — a mureta sobe; depois a areia cobre.
  terra: [
    { p: "pedra", x: 640, y: 1012, w: 52, h: 34 },
    { p: "pedra", x: 694, y: 1006, w: 44, h: 40, a: 0.3 },
    { p: "pedra", x: 740, y: 1014, w: 40, h: 32, a: 0.6 },
    { p: "pedra", x: 666, y: 976, w: 46, h: 30, a: 0.9 },
    { p: "manto", x: 622, y: 986, w: 190, h: 72 },
    { p: "areia", x: 652, y: -10, w: 4, h: 4 },
    { p: "areia", x: 684, y: -10, w: 3, h: 3, a: 0.5 },
    { p: "areia", x: 718, y: -10, w: 4, h: 4, a: 1 },
    { p: "areia", x: 750, y: -10, w: 3, h: 3, a: 1.5 },
  ],
  // Ferida Fresca: não é quanto, é QUANDO — o pulso bate duas vezes e espera.
  cura: [
    { p: "pulso", x: -70, y: 760, w: 200, h: 200 },
    { p: "pulso", x: -70, y: 760, w: 200, h: 200, a: 0.32 },
    { p: "luz", x: 26, y: 1060, w: 14, h: 14 },
    { p: "luz", x: 40, y: 1060, w: 10, h: 10, a: -4 },
    { p: "luz", x: 12, y: 1060, w: 12, h: 12, a: -7 },
  ],
  // Dose e Inversão: uma, duas, três Doses — e na terceira, o estouro.
  desintoxicacao: [
    { p: "poca", x: -20, y: 1032, w: 96, h: 28 },
    { p: "gota", x: 24, y: 690, w: 18, h: 26 },
    { p: "gota", x: 24, y: 690, w: 18, h: 26, a: 2 },
    { p: "gota", x: 24, y: 690, w: 18, h: 26, a: 4 },
    { p: "estouro", x: -32, y: 986, w: 120, h: 120 },
  ],
  // Três palavras: essência, verbo e forma se escrevem uma depois da outra — e acendem.
  teorica: [
    { p: "essencia", x: -120, y: 790, w: 340, h: 340 },
    { p: "verbo", x: -120, y: 790, w: 340, h: 340 },
    { p: "forma", x: -120, y: 790, w: 340, h: 340 },
  ],
  // Pacto: relações que agem sozinhas — dois espíritos em órbita, e um que vaga.
  invocacao: [
    { p: "orbita", x: 22, y: 420, w: 12, h: 12 },
    { p: "orbita", x: 22, y: 420, w: 9, h: 9, a: -4 },
    { p: "errante", x: 30, y: 940, w: 14, h: 14 },
  ],
  // Letalidade: quem se move primeiro — silêncio longo, um corte só.
  "deus-da-espada": [
    { p: "corte", x: -30, y: 1056, w: 700, h: 6 },
    { p: "rastro", x: -30, y: 1039, w: 700, h: 40 },
    { p: "lasca", x: 664, y: 1006, w: 5, h: 5, t: "a" },
    { p: "lasca", x: 664, y: 1006, w: 4, h: 4, t: "b" },
  ],
  // Contra-ataque: você não abre a luta — o golpe vem, e a resposta volta.
  "deus-da-agua-corpo": [
    { p: "onda-calma", x: 0, y: 1010, w: 1632, h: 50 },
    { p: "vem", x: -60, y: 880, w: 240, h: 240 },
    { p: "volta", x: -60, y: 880, w: 240, h: 240 },
  ],
  // Improviso: nenhuma arma proibida — adaga, pedra, bastão, o que estiver à mão.
  "deus-do-norte": [
    { p: "arremesso", x: 20, y: 958, w: 24, h: 6, t: "adaga" },
    { p: "arremesso", x: 20, y: 958, w: 11, h: 10, a: 3, t: "pedra" },
    { p: "arremesso", x: 20, y: 958, w: 34, h: 5, a: 6, t: "bastao" },
    { p: "poeira", x: 505, y: 935, w: 60, h: 30 },
    { p: "poeira", x: 505, y: 935, w: 60, h: 30, a: 3 },
    { p: "poeira", x: 505, y: 935, w: 60, h: 30, a: 6 },
  ],
  // Quebrantado: não mata rápido, desmonta — cada baque deixa mais uma rachadura.
  "armas-pesadas": [
    { p: "racha", x: 580, y: 940, w: 200, h: 110, t: "1" },
    { p: "racha", x: 580, y: 940, w: 200, h: 110, t: "2" },
    { p: "racha", x: 580, y: 940, w: 200, h: 110, t: "3" },
    { p: "baque", x: 600, y: 990, w: 140, h: 50 },
    { p: "baque", x: 600, y: 990, w: 140, h: 50, a: 2 },
    { p: "baque", x: 600, y: 990, w: 140, h: 50, a: 4 },
  ],
  // Sob Minha Guarda: o arco de proteção segura o golpe que era de outro.
  "cavalaria-e-escudos": [
    { p: "guarda", x: 40, y: 930, w: 736, h: 220 },
    { p: "projetil", x: -60, y: 905, w: 40, h: 3 },
    { p: "clarao", x: 150, y: 920, w: 140, h: 70 },
  ],
  // Distância Roubada: cada metro andado vira alcance — o arranque, e o corte lá na frente.
  vendaval: [
    { p: "arranque", x: -200, y: 1040, w: 180, h: 3 },
    { p: "arranque", x: -200, y: 1050, w: 140, h: 2, a: 0.08 },
    { p: "arranque", x: -200, y: 1032, w: 120, h: 2, a: 0.16 },
    { p: "meia-lua", x: 610, y: 935, w: 120, h: 120 },
  ],
  // Soco Aceso: o Fogo e o Lutador no mesmo soco — um-dois, faísca, pausa.
  "punho-de-fogo": [
    { p: "soco", x: -20, y: 800, w: 140, h: 140 },
    { p: "soco", x: -20, y: 800, w: 140, h: 140, a: 0.45 },
    { p: "faisca", x: 48, y: 868, w: 6, h: 6, t: "a" },
    { p: "faisca", x: 48, y: 868, w: 5, h: 5, t: "b" },
    { p: "faisca", x: 48, y: 868, w: 6, h: 6, t: "c" },
    { p: "faisca", x: 48, y: 868, w: 5, h: 5, a: 0.45, t: "a" },
    { p: "faisca", x: 48, y: 868, w: 6, h: 6, a: 0.45, t: "c" },
  ],
  // Marcado: a 90 metros — a mira acende no alto, e a flecha sobe pela margem até ela.
  arquearia: [
    { p: "mira", x: 4, y: 40, w: 56, h: 56 },
    { p: "flecha", x: 30, y: 1030, w: 4, h: 70 },
  ],
  // "Como eu entro?": no canto escuro, alguém abre os olhos.
  "furtividade-e-armadilhas": [
    { p: "sombra", x: -60, y: 930, w: 260, h: 140 },
    { p: "sombra", x: 300, y: 960, w: 220, h: 120, a: -6 },
    { p: "olho", x: 720, y: 1002, w: 12, h: 6 },
    { p: "olho", x: 740, y: 1002, w: 12, h: 6 },
  ],
  // Altera o que o inimigo SENTE: a melodia sobe, uma nota depois da outra.
  "bardo-e-interacao": [
    { p: "nota", x: 18, y: 1060, a: 0, t: "♪" },
    { p: "nota", x: 34, y: 1060, a: 0.6, t: "♫" },
    { p: "nota", x: 12, y: 1060, a: 1.2, t: "♩" },
    { p: "nota", x: 30, y: 1060, a: 1.8, t: "♪" },
  ],
  // Tempo e logística: a bússola gira, e a rota se traça ponto a ponto.
  "navegacao-e-lideranca": [
    { p: "bussola", x: -40, y: 900, w: 170, h: 170 },
    { p: "trilha", x: 150, y: 1040, w: 520, h: 2 },
    { p: "marco", x: 144, y: 1035, w: 12, h: 12 },
    { p: "marco", x: 314, y: 1035, w: 12, h: 12, a: 1.2 },
    { p: "marco", x: 484, y: 1035, w: 12, h: 12, a: 2.4 },
    { p: "marco", x: 654, y: 1035, w: 12, h: 12, a: 3.5 },
  ],
};

/** O mesmo atraso a cada visita, diferente entre páginas: na dupla, uma página nunca imita a outra. */
function deslocamento(pagina: number): number {
  return ((pagina * 7919) % 1000) / 1000;
}

export function ElementoDaFolha({ arvoreId, pagina, lado }: { arvoreId: string; pagina: number; lado: string }) {
  const receita = RECEITA_DA_ARVORE[arvoreId];
  if (!receita) return null;
  const extra = deslocamento(pagina) * 3;
  return (
    <span className="folhear-elemento" data-efeito={arvoreId} data-lado={lado} aria-hidden>
      {receita.map((peca, i) => {
        const estilo: CSSProperties = {
          left: peca.x,
          top: peca.y,
          width: peca.w,
          height: peca.h,
          animationDelay: `${((peca.a ?? 0) - extra).toFixed(2)}s`,
          animationDuration: peca.d ? `${peca.d}s` : undefined,
        };
        const texto = peca.p === "nota" ? peca.t : undefined;
        return <i key={i} data-p={peca.p} data-t={texto ? undefined : peca.t} style={estilo}>{texto}</i>;
      })}
    </span>
  );
}
