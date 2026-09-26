// O CAOS CONTROLADO do livro folheado (2026-09-25).
//
// Gera `public/livro/caos/<tema>.svg`: os motivos que ficam espalhados nas
// bordas das páginas — armas jogadas no Deus do Norte, brasas no Fogo, marcas
// de garra no Combate, círculos rúnicos na Magia. Cada arquivo tem TRÊS
// variantes lado a lado (816 px cada, o tamanho da página), e o livro escolhe
// uma por página (folhear.css), então duas páginas vizinhas nunca repetem.
//
// O SVG é só FORMA, em preto com transparência: o livro o usa como máscara e
// pinta com a cor da página (capítulo, árvore), então o mesmo arquivo serve
// no papel noite e no papel dia.
//
// Desenhado pra página da DIREITA (a borda de fora é a direita); a da
// esquerda usa o mesmo desenho espelhado. A mancha de texto (x 60–756,
// y 62–972) fica quase livre: o que entra nela entra muito apagado.
//
// Determinístico (semente por tema): rodar de novo dá o mesmo desenho.
// Uso: node scripts/gerar-caos.mjs

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = path.join(RAIZ, "public", "livro", "caos");
const W = 816;
const H = 1056;

// ── Os glifos da Magia Teórica, lidos do componente que os desenha ──────
// (src/components/book/FormulaGlyph.tsx). Mudou um símbolo lá, é só gerar de
// novo: o caos da árvore usa os mesmos traços que a oficina de fórmulas.
function lerGlifos() {
  const fonte = readFileSync(path.join(RAIZ, "src", "components", "book", "FormulaGlyph.tsx"), "utf8");
  const [nucleos, operadores] = fonte.split("export function TracoOperador");
  const casos = (trecho) => [...trecho.matchAll(/case "([a-z]+)": return <path d="([^"]+)" \/>/g)].map((m) => m[2]);
  return { nucleos: casos(nucleos), operadores: casos(operadores ?? "") };
}
const GLIFOS = lerGlifos();

// ── Sorte com semente ─────────────────────────────────────────────────────
function semente(texto) {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Primitivas (desenhadas em torno da origem, de pé) ─────────────────────
const P = {
  adaga: () =>
    `<path d="M0 -74 L6 -60 L6 -8 L-6 -8 L-6 -60 Z"/><rect x="-17" y="-8" width="34" height="6" rx="2"/><rect x="-3.5" y="-2" width="7" height="22"/><circle cy="24" r="5"/>`,
  espada: () =>
    `<path d="M0 -170 L8 -152 L8 -10 L-8 -10 L-8 -152 Z"/><path d="M-30 -12 H30 L26 -4 H-26 Z"/><rect x="-4" y="-4" width="8" height="34"/><circle cy="34" r="7"/>`,
  espadaQuebrada: () =>
    `<path d="M-8 -10 L-8 -70 L-2 -80 L1 -72 L5 -86 L8 -76 L8 -10 Z"/><path d="M-30 -12 H30 L26 -4 H-26 Z"/><rect x="-4" y="-4" width="8" height="34"/><circle cy="34" r="7"/><path d="M30 -140 L38 -118 L33 -100 L26 -112 Z"/>`,
  lanca: () => `<rect x="-2.5" y="-150" width="5" height="260"/><path d="M0 -196 L10 -160 L0 -148 L-10 -160 Z"/>`,
  martelo: () => `<rect x="-4" y="-40" width="8" height="130"/><path d="M-36 -64 H36 V-30 H-36 Z"/><rect x="-44" y="-58" width="8" height="22"/>`,
  machado: () => `<rect x="-4" y="-50" width="8" height="140"/><path d="M4 -58 C40 -70 58 -40 50 -4 C38 -18 22 -24 4 -22 Z"/>`,
  escudo: () =>
    `<path d="M-34 -40 H34 V-2 Q34 30 0 48 Q-34 30 -34 -2 Z"/><path d="M-24 -30 H24 V-4 Q24 20 0 34 Q-24 20 -24 -4 Z" fill-opacity="0" stroke="#000" stroke-opacity=".001"/>`,
  flecha: () =>
    `<rect x="-1.6" y="-80" width="3.2" height="150"/><path d="M0 -100 L8 -78 L-8 -78 Z"/><path d="M-1.6 52 L-12 70 L-12 82 L-1.6 66 Z M1.6 52 L12 70 L12 82 L1.6 66 Z"/>`,
  arco: () => `<path d="M-6 -90 Q60 0 -6 90" fill="none" stroke="#000" stroke-width="7"/><path d="M-6 -90 V90" stroke="#000" stroke-width="1.5"/>`,
  corrente: (n = 7) =>
    Array.from({ length: n }, (_, i) =>
      i % 2 === 0
        ? `<ellipse cy="${i * 17}" rx="7" ry="11" fill="none" stroke="#000" stroke-width="4"/>`
        : `<ellipse cy="${i * 17}" rx="3" ry="11" fill="none" stroke="#000" stroke-width="4"/>`
    ).join(""),
  chama: () =>
    `<path d="M0 -60 C20 -30 26 -12 16 6 C26 -2 26 -18 24 -26 C40 -6 36 28 0 42 C-36 28 -40 -6 -24 -26 C-26 -14 -20 0 -14 6 C-26 -12 -20 -34 0 -60 Z"/>`,
  brasa: () => `<path d="M0 -7 L5 0 L0 7 L-5 0 Z"/>`,
  faisca: () => `<path d="M0 -14 L2.6 -2.6 L14 0 L2.6 2.6 L0 14 L-2.6 2.6 L-14 0 L-2.6 -2.6 Z"/>`,
  gota: () => `<path d="M0 -24 C9 -10 14 -1 14 7 A14 14 0 1 1 -14 7 C-14 -1 -9 -10 0 -24 Z"/>`,
  onda: (n = 5) => {
    let d = "M0 0";
    for (let i = 0; i < n; i++) d += ` q 26 -20 52 0 t 52 0`;
    return `<path d="${d}" fill="none" stroke="#000" stroke-width="6" stroke-linecap="round"/>`;
  },
  rajada: () =>
    `<path d="M0 0 C90 -24 170 12 236 -12 C278 -28 268 -66 240 -60 C218 -55 222 -34 242 -36" fill="none" stroke="#000" stroke-width="6" stroke-linecap="round"/>`,
  rajadaCurta: () => `<path d="M0 0 C60 -14 110 8 160 -6" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/>`,
  rocha: (r) => {
    const n = 6;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + r() * 0.5;
      const raio = 22 + r() * 18;
      return `${(Math.cos(a) * raio).toFixed(1)} ${(Math.sin(a) * raio).toFixed(1)}`;
    });
    return `<path d="M${pts.join(" L")} Z"/>`;
  },
  rachadura: (r) => {
    let x = 0;
    let y = 0;
    let d = "M0 0";
    const galhos = [];
    for (let i = 0; i < 7; i++) {
      x += (r() - 0.5) * 34;
      y -= 22 + r() * 18;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      if (r() < 0.4) galhos.push(`M${x.toFixed(1)} ${y.toFixed(1)} l${((r() - 0.5) * 60).toFixed(1)} ${(-10 - r() * 30).toFixed(1)}`);
    }
    return `<path d="${d} ${galhos.join(" ")}" fill="none" stroke="#000" stroke-width="3.5" stroke-linejoin="bevel"/>`;
  },
  corte: () => `<path d="M0 0 Q130 -70 300 -30 Q130 -52 0 0 Z"/>`,
  garras: () =>
    [0, 1, 2].map((i) => `<path transform="translate(${i * 22} ${i * 16})" d="M0 0 Q70 -80 190 -110 Q76 -70 0 0 Z"/>`).join(""),
  respingo: (r) =>
    `<circle r="${14 + r() * 8}"/>` +
    Array.from({ length: 9 }, () => {
      const a = r() * Math.PI * 2;
      const d = 24 + r() * 40;
      return `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="${(1.5 + r() * 5).toFixed(1)}"/>`;
    }).join(""),
  circuloMagico: () => {
    const marcas = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return `M${(Math.cos(a) * 92).toFixed(1)} ${(Math.sin(a) * 92).toFixed(1)} L${(Math.cos(a) * (i % 3 ? 100 : 108)).toFixed(1)} ${(Math.sin(a) * (i % 3 ? 100 : 108)).toFixed(1)}`;
    }).join(" ");
    const tri = (rot) =>
      [0, 1, 2]
        .map((i) => {
          const a = rot + (i / 3) * Math.PI * 2;
          return `${(Math.cos(a) * 78).toFixed(1)} ${(Math.sin(a) * 78).toFixed(1)}`;
        })
        .join(" L");
    return `<g fill="none" stroke="#000"><circle r="112" stroke-width="3"/><circle r="92" stroke-width="2"/><circle r="30" stroke-width="2"/><path d="${marcas}" stroke-width="2.5"/><path d="M${tri(-Math.PI / 2)} Z M${tri(Math.PI / 2)} Z" stroke-width="2.5"/></g>`;
  },
  runa: (r) => {
    const tr = () => `${(r() * 20 - 10).toFixed(0)} ${(r() * 26 - 13).toFixed(0)}`;
    return `<path d="M${tr()} L${tr()} L${tr()} M${tr()} L${tr()}" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>`;
  },
  hexagono: () => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return `${(Math.cos(a) * 26).toFixed(1)} ${(Math.sin(a) * 26).toFixed(1)}`;
    });
    return `<path d="M${pts.join(" L")} Z" fill="none" stroke="#000" stroke-width="4"/>`;
  },
  folha: () => `<path d="M0 -30 C18 -16 18 14 0 30 C-18 14 -18 -16 0 -30 Z"/><path d="M0 30 L0 44" stroke="#000" stroke-width="3"/>`,
  cruz: () => `<path d="M-5 -18 H5 V-5 H18 V5 H5 V18 H-5 V5 H-18 V-5 H-5 Z"/>`,
  bolha: (r) => `<circle r="${(6 + r() * 12).toFixed(1)}" fill="none" stroke="#000" stroke-width="3"/>`,
  frasco: () =>
    `<path d="M-7 -40 H7 V-14 L26 22 Q30 34 18 36 H-18 Q-30 34 -26 22 L-7 -14 Z"/><rect x="-10" y="-48" width="20" height="8" rx="2"/>`,
  nota: () =>
    `<ellipse cx="-8" cy="20" rx="10" ry="7" transform="rotate(-20 -8 20)"/><rect x="0" y="-30" width="3.5" height="50"/><path d="M3.5 -30 Q24 -18 18 4 Q16 -10 3.5 -14 Z"/>`,
  pauta: () =>
    [0, 1, 2, 3, 4]
      .map((i) => `<path d="M0 ${i * 10} C120 ${i * 10 - 40} 240 ${i * 10 + 30} 380 ${i * 10 - 10}" fill="none" stroke="#000" stroke-width="1.6"/>`)
      .join(""),
  rosaDosVentos: () =>
    `<path d="M0 -90 L12 -12 L90 0 L12 12 L0 90 L-12 12 L-90 0 L-12 -12 Z"/><path d="M0 -50 L7 -7 L50 0 L7 7 L0 50 L-7 7 L-50 0 L-7 -7 Z" transform="rotate(45)"/><circle r="60" fill="none" stroke="#000" stroke-width="2.5"/>`,
  rota: () =>
    `<path d="M0 0 C60 -40 120 30 180 -10 S300 -40 340 20" fill="none" stroke="#000" stroke-width="4" stroke-dasharray="12 10" stroke-linecap="round"/><path d="M332 8 l20 20 m0 -20 l-20 20" stroke="#000" stroke-width="6" stroke-linecap="round"/>`,
  moeda: () => `<circle r="18"/><circle r="12" fill="none" stroke="#fff" stroke-opacity="0"/>`,
  anelDeCaneca: () => `<circle r="46" fill="none" stroke="#000" stroke-width="5" stroke-dasharray="210 14 40 9"/>`,
  d20: () =>
    `<g fill="none" stroke="#000" stroke-width="3.5" stroke-linejoin="round"><path d="M0 -40 L35 -20 L35 20 L0 40 L-35 20 L-35 -20 Z"/><path d="M0 -40 L-20 12 L20 12 Z M-35 -20 L-20 12 L-35 20 M35 -20 L20 12 L35 20 M-20 12 L0 40 L20 12"/></g>`,
  d6: () =>
    `<g fill="none" stroke="#000" stroke-width="3.5" stroke-linejoin="round"><path d="M0 -30 L28 -16 L0 -2 L-28 -16 Z M-28 -16 V18 L0 32 V-2 M28 -16 V18 L0 32"/></g><circle cx="0" cy="-16" r="3.5"/><circle cx="-14" cy="8" r="3"/><circle cx="14" cy="14" r="3"/>`,
  risquinhos: () =>
    `<g stroke="#000" stroke-width="4" stroke-linecap="round"><path d="M0 0 V38 M12 0 V38 M24 0 V38 M36 0 V38 M-6 30 L44 6"/></g>`,
  pegada: () => `<ellipse rx="9" ry="15"/><circle cx="-9" cy="-20" r="3.5"/><circle cx="-2" cy="-23" r="3.5"/><circle cx="6" cy="-21" r="3.5"/>`,
  pata: () => `<ellipse rx="16" ry="13" cy="6"/><circle cx="-18" cy="-14" r="6"/><circle cx="-6" cy="-22" r="6"/><circle cx="7" cy="-22" r="6"/><circle cx="19" cy="-14" r="6"/>`,
  fumaca: (r) =>
    Array.from({ length: 5 }, (_, i) => `<circle cx="${(i * 16 + r() * 8).toFixed(0)}" cy="${(-r() * 18).toFixed(0)}" r="${(12 + r() * 10).toFixed(0)}"/>`).join(""),
  impacto: () => {
    const raios = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r0 = 34;
      const r1 = i % 2 ? 64 : 84;
      return `M${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0).toFixed(1)} L${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)}`;
    }).join(" ");
    return `<g fill="none" stroke="#000" stroke-linecap="round"><circle r="24" stroke-width="5"/><path d="${raios}" stroke-width="5"/></g>`;
  },
  estrepe: () => `<path d="M0 -14 L4 0 L0 14 L-4 0 Z M-14 0 L0 4 L14 0 L0 -4 Z"/>`,
  glifo: (r) => {
    // Um glifo composto: o núcleo de uma essência e um ou dois operadores por cima.
    const nucleo = GLIFOS.nucleos[Math.floor(r() * GLIFOS.nucleos.length)];
    const ops = [...GLIFOS.operadores].sort(() => r() - 0.5).slice(0, 1 + Math.floor(r() * 2));
    return `<g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="${nucleo}" stroke-width="6"/>${ops.map((o) => `<path d="${o}" stroke-width="4"/>`).join("")}</g>`;
  },
  arcoDeCompasso: (r) =>
    `<circle r="${(150 + r() * 110).toFixed(0)}" fill="none" stroke="#000" stroke-width="1.6" stroke-dasharray="${r() < 0.5 ? "none" : "18 7 3 7"}"/>`,
  galho: (r) => {
    const partes = [];
    const cresce = (x, y, ang, tam, prof) => {
      if (prof === 0 || tam < 8) return;
      const x2 = x + Math.cos(ang) * tam;
      const y2 = y + Math.sin(ang) * tam;
      partes.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#000" stroke-width="${(prof * 1.3).toFixed(1)}" stroke-linecap="round"/>`);
      cresce(x2, y2, ang - 0.4 - r() * 0.3, tam * 0.72, prof - 1);
      cresce(x2, y2, ang + 0.35 + r() * 0.3, tam * 0.66, prof - 1);
    };
    cresce(0, 0, -Math.PI / 2 - 0.5, 90, 5);
    return partes.join("");
  },
};

// ── Composição ────────────────────────────────────────────────────────────
//
// Cada variante tem UM motivo herói — grande, sangrando pra fora da borda —
// e coadjuvantes espalhados pela margem. O que invade a mancha de texto é
// apagado pela própria arte (a máscara `mancha`, com borda macia): o herói
// pode atravessar a página como fantasma sem brigar com a leitura. O rodapé
// (número e nome do capítulo) também fica apagado.

// Um cipó subindo: talo ondulado e folhas alternadas (Cura).
P.cipo = (comprimento = 600) => {
  let d = "M0 0";
  const folhas = [];
  for (let y = 0, i = 0; y > -comprimento; y -= 30, i++) {
    const x = Math.sin(i * 0.9) * 14;
    d += ` L${x.toFixed(1)} ${(y - 30).toFixed(1)}`;
    if (i % 2 === 0) {
      const lado = i % 4 === 0 ? 1 : -1;
      folhas.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${lado * 55}) scale(0.8)">${P.folha()}</g>`);
    }
  }
  return `<path d="${d}" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/>${folhas.join("")}`;
};

// O arco de aparar do Deus da Água: duas curvas largas, uma dentro da outra.
P.aparar = () =>
  `<path d="M0 0 C70 -110 220 -130 320 -40" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round"/><path d="M40 10 C100 -70 210 -86 290 -20" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>`;

/*
 * O TAMANHO de cada primitiva (raio aproximado, em escala 1): é o que impede
 * uma coisa de cair em cima da outra. Primitiva sem raio (fios, arcos de
 * compasso, cipó) não disputa espaço.
 */
const RAIO = new Map([
  [P.adaga, 45], [P.espada, 100], [P.espadaQuebrada, 90], [P.lanca, 120], [P.martelo, 70], [P.machado, 70],
  [P.escudo, 45], [P.flecha, 55], [P.arco, 85], [P.corrente, 60], [P.chama, 42], [P.brasa, 8], [P.faisca, 14],
  [P.gota, 22], [P.onda, 120], [P.rajada, 120], [P.rajadaCurta, 70], [P.rocha, 32], [P.rachadura, 80],
  [P.corte, 140], [P.garras, 120], [P.respingo, 45], [P.circuloMagico, 112], [P.runa, 14], [P.hexagono, 26],
  [P.folha, 28], [P.cruz, 18], [P.bolha, 12], [P.frasco, 42], [P.nota, 28], [P.pauta, 180], [P.rosaDosVentos, 88],
  [P.rota, 160], [P.moeda, 18], [P.anelDeCaneca, 48], [P.d20, 40], [P.d6, 32], [P.risquinhos, 26], [P.pegada, 16],
  [P.pata, 24], [P.fumaca, 45], [P.impacto, 80], [P.estrepe, 14], [P.galho, 140], [P.glifo, 80], [P.aparar, 150],
]);

function compor(nome, receita) {
  const variantes = [0, 1, 2].map((v) => {
    const r = semente(`${nome}-${v}`);
    const rnd = (a, b) => a + r() * (b - a);
    const itens = [];
    const ocupado = [];
    const livre = (x, y, raio) => ocupado.every((o) => Math.hypot(o.x - x, o.y - y) > (o.raio + raio) * 0.82);
    /*
     * Põe uma primitiva na página da direita, girada e em escala.
     * `onde` é um ponto fixo (o motivo herói) ou um sorteador (os
     * coadjuvantes da margem): o sorteador tenta até achar um lugar livre, e
     * se não achar, a peça fica de fora — melhor uma a menos do que uma em
     * cima da outra (o autor achou o caos amontoado, 2026-09-25).
     *
     * Ponto fixo muito na borda de fora é puxado pra dentro, pra se ver mais
     * da peça do que da sangria.
     */
    const por = (prim, onde, { rot = rnd(0, 360), esc = 1, forte = 0.95, arg } = {}) => {
      const raio = (RAIO.get(prim) ?? 0) * esc;
      let x, y;
      if (typeof onde === "function") {
        let achou = false;
        for (let t = 0; t < 18 && !achou; t++) {
          [x, y] = onde();
          achou = livre(x, y, raio);
        }
        if (!achou) return;
      } else {
        [x, y] = onde;
        if (x > 780) x = 780 + (x - 780) * 0.45;
      }
      if (raio) ocupado.push({ x, y, raio });
      const conteudo = typeof prim === "function" ? prim(arg ?? r) : prim;
      itens.push(
        `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${esc.toFixed(2)})" fill-opacity="${forte}" stroke-opacity="${forte}">${conteudo}</g>`
      );
    };
    /** Um sorteador de pontos na margem de fora, entre duas alturas. */
    const naMargem = (y0 = 140, y1 = 900) => () => [rnd(766, 800), rnd(y0, y1)];
    receita({ v, r, rnd, por, naMargem });
    return `<g clip-path="url(#pagina)" transform="translate(${v * W} 0)"><g mask="url(#mancha)">${itens.join("")}</g></g>`;
  });
  const defs = `<defs>
<clipPath id="pagina"><rect width="${W}" height="${H}"/></clipPath>
<filter id="borra" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="16"/></filter>
<mask id="mancha" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="#fff"/>
<rect x="58" y="60" width="700" height="914" fill="#3a3a3a" filter="url(#borra)"/>
<rect x="430" y="982" width="360" height="46" fill="#555" filter="url(#borra)"/>
</mask></defs>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 3}" height="${H}" viewBox="0 0 ${W * 3} ${H}">${defs}${variantes.join("")}</svg>`;
  writeFileSync(path.join(SAIDA, `${nome}.svg`), svg);
  return svg.length;
}

// ── Os temas (página da direita: a borda de fora é x = 816) ──────────────
const TEMAS = {
  // Capítulos
  cap0: ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.d20, [800, 90], { esc: 3.2 });
      por(P.d20, [778, 360], { esc: 1.6 });
      por(P.d6, [806, 580], { esc: 1.9 });
    } else if (v === 1) {
      por(P.d20, [740, 1030], { esc: 3.4 });
      por(P.d6, [300, 1062], { esc: 2 });
      por(P.d20, [812, 700], { esc: 1.4 });
    } else {
      por(P.d6, [812, 430], { esc: 2.3 });
      por(P.d20, [792, 170], { esc: 1.5 });
    }
    for (let i = 0; i < 4; i++) por(P.faisca, naMargem(), { esc: rnd(1, 1.8) });
  },
  cap1: ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.d20, [812, 60], { esc: 3 });
      por(P.risquinhos, [150, 1030], { rot: -6, esc: 2 });
      por(P.d6, [792, 480], { esc: 1.7 });
    } else if (v === 1) {
      por(P.risquinhos, [790, 300], { rot: 84, esc: 2.2 });
      por(P.d20, [790, 1010], { esc: 2.9 });
      por(P.d6, [330, 1066], { esc: 1.4 });
    } else {
      por(P.d6, [806, 640], { esc: 2.4 });
      por(P.risquinhos, [796, 150], { rot: 92, esc: 1.6 });
    }
    for (let i = 0; i < 3; i++) por(P.faisca, naMargem(), { esc: rnd(0.9, 1.5) });
  },
  cap2: ({ v, rnd, por, naMargem }) => {
    const [x, y, esc] = v === 0 ? [830, 70, 2.7] : v === 1 ? [790, 1060, 2.9] : [836, 560, 1.9];
    por(P.circuloMagico, [x, y], { rot: rnd(0, 60), esc, forte: 0.85 });
    for (let i = 0; i < (v === 2 ? 4 : 5); i++) por(P.runa, naMargem(), { esc: rnd(1.3, 2) });
    for (let i = 0; i < 5; i++) por(P.faisca, naMargem(), { esc: rnd(0.8, 1.6) });
  },
  cap3: ({ v, rnd, por, naMargem }) => {
    if (v === 0) por(P.galho, [826, 560], { rot: -58, esc: 2.3, forte: 0.85 });
    else if (v === 1) por(P.galho, [690, 1086], { rot: 4, esc: 2.5, forte: 0.85 });
    else por(P.galho, [826, 220], { rot: -80, esc: 1.8, forte: 0.85 });
    for (let i = 0; i < (v === 2 ? 3 : 4); i++) por(P.folha, naMargem(), { esc: rnd(0.9, 1.5) });
  },
  cap4: ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.garras, [540, -40], { rot: 34, esc: 2.4 });
      por(P.respingo, [800, 400], { esc: 2.4 });
      por(P.respingo, [772, 640], { esc: 1.2 });
      por(P.rachadura, [806, 1076], { rot: -10, esc: 2.4 });
    } else if (v === 1) {
      por(P.garras, [460, 1090], { rot: -30, esc: 2.4 });
      por(P.respingo, [790, 820], { esc: 2.6 });
      por(P.rachadura, [806, -10], { rot: 180, esc: 2.2 });
    } else {
      por(P.respingo, [806, 520], { esc: 2 });
    }
    for (let i = 0; i < 4; i++) por(P.gota, naMargem(), { rot: rnd(150, 210), esc: rnd(0.7, 1.3) });
  },
  cap5: ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.anelDeCaneca, [760, 96], { esc: 2.6, forte: 0.8 });
      for (let i = 0; i < 5; i++) por(P.moeda, () => [rnd(740, 850), rnd(200, 330)], { esc: rnd(1.1, 1.5) });
      por(P.rota, [70, 1048], { rot: -3, esc: 1.6 });
    } else if (v === 1) {
      por(P.anelDeCaneca, [300, 1060], { esc: 2.4, forte: 0.8 });
      for (let i = 0; i < 4; i++) por(P.moeda, () => [rnd(700, 850), rnd(960, 1080)], { esc: rnd(1.1, 1.6) });
      por(P.rota, [800, 150], { rot: 92, esc: 1.4 });
    } else {
      por(P.anelDeCaneca, [812, 600], { esc: 1.7, forte: 0.8 });
      for (let i = 0; i < 4; i++) por(P.moeda, naMargem(), { esc: rnd(1, 1.4) });
    }
  },
  apendices: ({ v, rnd, por }) => {
    if (v === 1) {
      for (let i = 0; i < 4; i++) por(P.pata, [120 + i * 110, i % 2 ? 1040 : 1076], { rot: 90 + rnd(-8, 8), esc: 1.6 });
      por(P.garras, [806, 500], { rot: 100, esc: 2 });
    } else {
      const n = v === 2 ? 3 : 6;
      for (let i = 0; i < n; i++) por(P.pata, [i % 2 ? 790 : 828, 900 - i * 130], { rot: rnd(-10, 10), esc: 1.7 });
      if (v === 0) por(P.garras, [540, -34], { rot: 40, esc: 2.2 });
    }
  },

  // Famílias: a árvore sem tema próprio (uma nova, ou uma renomeada) cai aqui.
  "familia-magia": ({ v, rnd, por, naMargem }) => {
    por(P.circuloMagico, v === 1 ? [800, 1050] : [830, 70], { rot: rnd(0, 60), esc: 2.3, forte: 0.8 });
    for (let i = 0; i < 4; i++) por(i % 2 ? P.faisca : P.runa, naMargem(), { esc: rnd(1, 1.7) });
  },
  "familia-corpo": ({ v, rnd, por, naMargem }) => {
    por(P.corte, v === 1 ? [150, 1060] : [300, 56], { rot: v === 1 ? -12 : 12, esc: 2.5 });
    por(P.rachadura, [806, v === 1 ? -10 : 1076], { rot: v === 1 ? 180 : -8, esc: 2 });
    for (let i = 0; i < 4; i++) por(P.faisca, naMargem(), { esc: rnd(1, 1.6) });
  },
  "familia-utilidade": ({ v, rnd, por, naMargem }) => {
    por(P.rosaDosVentos, v === 1 ? [790, 1010] : [806, 90], { rot: rnd(-10, 10), esc: 2.3, forte: 0.85 });
    if (v !== 2) por(P.rota, [70, 1048], { rot: -3, esc: 1.5 });
    for (let i = 0; i < 4; i++) por(i % 2 ? P.estrepe : P.pegada, naMargem(), { esc: rnd(1.1, 1.5) });
  },

  // Árvores de Magia
  fogo: ({ v, rnd, por }) => {
    if (v === 0) {
      [[380, 1.6], [470, 2.1], [560, 1.8], [650, 2.6], [740, 3.1], [830, 2.4]].forEach(([x, esc]) =>
        por(P.chama, [x + rnd(-12, 12), 1070], { rot: rnd(-8, 8), esc })
      );
      for (let i = 0; i < 12; i++) por(P.brasa, () => [rnd(740, 850), rnd(260, 980)], { esc: rnd(1.2, 2.3) });
    } else if (v === 1) {
      [260, 420, 580, 740, 880].forEach((y) => por(P.chama, [836, y + rnd(-20, 20)], { rot: -90 + rnd(-10, 10), esc: rnd(1.7, 2.5) }));
      for (let i = 0; i < 8; i++) por(P.brasa, () => [rnd(700, 800), rnd(200, 1000)], { esc: rnd(1.2, 2) });
    } else {
      [[700, 2.2], [800, 2.8]].forEach(([x, esc]) => por(P.chama, [x, 1070], { rot: rnd(-8, 8), esc }));
      for (let i = 0; i < 5; i++) por(P.brasa, () => [rnd(740, 850), rnd(500, 980)], { esc: rnd(1.1, 2) });
    }
  },
  agua: ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      [[1008, 0.9], [1040, 0.7], [1072, 0.5]].forEach(([y, forte], i) => por(P.onda, [40 + i * 26, y], { rot: 0, esc: 1.3, forte, arg: 7 }));
      for (let i = 0; i < 5; i++) por(P.gota, naMargem(), { rot: rnd(-10, 10), esc: rnd(1.2, 2) });
    } else if (v === 1) {
      [[18, 0.8], [46, 0.55]].forEach(([y, forte], i) => por(P.onda, [60 + i * 40, y], { rot: 0, esc: 1.3, forte, arg: 7 }));
      por(P.gota, [806, 620], { rot: 0, esc: 3.4 });
      for (let i = 0; i < 4; i++) por(P.gota, naMargem(700, 1000), { rot: rnd(-10, 10), esc: rnd(1, 1.6) });
    } else {
      por(P.onda, [400, 1046], { rot: 0, esc: 1.1, arg: 4 });
      for (let i = 0; i < 4; i++) por(P.gota, naMargem(), { rot: 0, esc: rnd(1, 1.6) });
    }
  },
  vento: ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.rajada, [236, 30], { rot: -3, esc: 2.4 });
      for (let i = 0; i < 3; i++) por(P.rajadaCurta, () => [rnd(560, 760), rnd(70, 140)], { rot: rnd(-8, 8), esc: 1.5 });
    } else if (v === 1) {
      por(P.rajada, [120, 1046], { rot: 2, esc: 2.4 });
      for (let i = 0; i < 3; i++) por(P.rajadaCurta, () => [rnd(360, 640), rnd(995, 1080)], { rot: rnd(-6, 6), esc: 1.4 });
    } else {
      por(P.rajada, [440, 24], { rot: -2, esc: 1.6 });
    }
    for (let i = 0; i < (v === 2 ? 3 : 4); i++) por(P.folha, naMargem(), { esc: rnd(1, 1.5) });
  },
  terra: ({ v, rnd, por }) => {
    if (v === 0) {
      for (let i = 0; i < 7; i++) por(P.rocha, () => [rnd(560, 860), rnd(1000, 1096)], { esc: rnd(1.3, 2.5) });
      por(P.rachadura, [806, 1000], { rot: -8, esc: 2.6 });
      por(P.rachadura, [520, 1070], { rot: 22, esc: 1.5 });
    } else if (v === 1) {
      for (let i = 0; i < 6; i++) por(P.rocha, () => [rnd(60, 520), rnd(1010, 1096)], { esc: rnd(1.2, 2.2) });
      por(P.rachadura, [806, -10], { rot: 180, esc: 2.4 });
    } else {
      for (let i = 0; i < 5; i++) por(P.rocha, () => [rnd(700, 860), rnd(1010, 1096)], { esc: rnd(1.2, 2) });
      por(P.rachadura, [812, 900], { rot: -4, esc: 1.9 });
    }
  },
  cura: ({ v, rnd, por, naMargem }) => {
    if (v === 0) por(P.cipo, [810, 1080], { rot: 0, esc: 1.25, arg: 820 });
    else if (v === 1) por(P.cipo, [-10, 1052], { rot: 90, esc: 1.15, arg: 700 });
    else por(P.cipo, [812, 440], { rot: 0, esc: 1.1, arg: 400 });
    for (let i = 0; i < 5; i++) por(i % 2 ? P.faisca : P.cruz, naMargem(), { rot: 0, esc: rnd(1, 1.6) });
  },
  desintoxicacao: ({ v, rnd, por, naMargem }) => {
    if (v === 0) por(P.frasco, [790, 116], { rot: 18, esc: 2.8 });
    else if (v === 1) por(P.frasco, [720, 1030], { rot: -12, esc: 2.6 });
    for (let i = 0; i < (v === 2 ? 10 : 11); i++) por(P.bolha, naMargem(v === 0 ? 260 : 120, 980), { esc: rnd(1.2, 2) });
  },
  // A Magia Teórica (que substituiu a Barreira em 2026-09-25): uma FRASE de
  // glifos compostos escrita na borda, ligada por um fio com nós, e os arcos
  // de compasso de quem constrói a fórmula à mão.
  teorica: ({ v, rnd, por }) => {
    const n = v === 2 ? 2 : 4;
    const vertical = v !== 1;
    const pontos = Array.from({ length: n }, (_, i) =>
      vertical ? [806, 170 + i * (680 / n) + rnd(0, 40)] : [140 + i * (430 / n) + rnd(0, 30), 1040]
    );
    const fio = pontos.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(0)} ${y.toFixed(0)}`).join(" ");
    por(`<path d="${fio}" fill="none" stroke="#000" stroke-width="3" stroke-dasharray="3 8" stroke-linecap="round"/>`, [0, 0], { rot: 0, forte: 0.8 });
    for (const [x, y] of pontos) por(P.glifo, [x, y], { rot: rnd(-12, 12), esc: vertical ? rnd(0.8, 0.95) : 0.62 });
    por(P.arcoDeCompasso, v === 1 ? [880, 1100] : [900, -40], { rot: 0, esc: 1.6, forte: 0.6 });
    if (v === 0) por(P.arcoDeCompasso, [900, -40], { rot: 0, esc: 2.3, forte: 0.4 });
  },
  invocacao: ({ v, rnd, por }) => {
    const [x, y, esc] = v === 0 ? [830, 64, 3] : v === 1 ? [760, 1070, 3.2] : [836, 560, 2];
    por(P.circuloMagico, [x, y], { rot: rnd(0, 60), esc, forte: 0.9 });
    por(P.corrente, v === 1 ? [806, 180] : [806, v === 2 ? 700 : 240], { rot: rnd(-8, 8), esc: 1.6, arg: 16 });
    if (v === 1) por(P.corrente, [770, 520], { rot: rnd(-8, 8), esc: 1.3, arg: 10 });
  },

  // Árvores do Corpo
  "deus-da-espada": ({ v, rnd, por }) => {
    if (v === 0) {
      por(P.corte, [300, 64], { rot: 12, esc: 2.8 });
      por(P.corte, [430, 26], { rot: 18, esc: 2, forte: 0.55 });
      por(P.espada, [806, 540], { rot: 14, esc: 1.9 });
    } else if (v === 1) {
      por(P.corte, [150, 1066], { rot: -12, esc: 2.6 });
      por(P.corte, [300, 1034], { rot: -18, esc: 1.8, forte: 0.55 });
      por(P.espada, [812, 300], { rot: 172, esc: 1.7 });
    } else {
      por(P.corte, [520, 44], { rot: 20, esc: 2 });
      por(P.espada, [806, 720], { rot: 8, esc: 1.5 });
    }
    por(P.faisca, [rnd(700, 790), rnd(150, 300)], { esc: 1.6 });
  },
  "deus-da-agua-corpo": ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.aparar, [520, 110], { rot: -4, esc: 1.8 });
      por(P.espada, [806, 560], { rot: -30, esc: 1.6 });
    } else if (v === 1) {
      por(P.aparar, [300, 1010], { rot: 180, esc: 1.8 });
      por(P.espada, [812, 330], { rot: 210, esc: 1.5 });
    } else {
      por(P.aparar, [560, 90], { rot: 0, esc: 1.3 });
    }
    for (let i = 0; i < 5; i++) por(P.gota, naMargem(), { rot: rnd(-20, 20), esc: rnd(1, 1.5) });
  },
  // O exemplo do autor: armas jogadas. O Norte luta com o que estiver à mão.
  "deus-do-norte": ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.lanca, [640, 70], { rot: 64, esc: 2.4 });
      por(P.espadaQuebrada, [800, 390], { rot: 160, esc: 2 });
      por(P.corrente, [806, 520], { rot: -12, esc: 1.5, arg: 16 });
      por(P.martelo, [760, 1030], { rot: -40, esc: 1.7 });
      for (let i = 0; i < 3; i++) por(P.adaga, naMargem(640, 940), { rot: rnd(0, 360), esc: 1.5 });
      for (let i = 0; i < 3; i++) por(P.estrepe, () => [rnd(90, 420), rnd(1010, 1080)], { esc: 1.5 });
    } else if (v === 1) {
      por(P.machado, [786, 116], { rot: 145, esc: 2.3 });
      por(P.lanca, [250, 1072], { rot: -82, esc: 2.2 });
      por(P.corrente, [812, 300], { rot: 6, esc: 1.3, arg: 12 });
      for (let i = 0; i < 4; i++) por(P.adaga, naMargem(520, 960), { rot: rnd(0, 360), esc: 1.5 });
    } else {
      // Três adagas atiradas contra a parede, quase na mesma inclinação.
      for (let i = 0; i < 3; i++) por(P.adaga, [rnd(790, 830), 240 + i * 170 + rnd(-30, 30)], { rot: 118 + rnd(-6, 6), esc: 1.7 });
      por(P.espadaQuebrada, [770, 1030], { rot: -24, esc: 1.7 });
    }
  },
  "armas-pesadas": ({ v, por }) => {
    if (v === 0) {
      por(P.martelo, [780, 116], { rot: 140, esc: 3 });
      por(P.rachadura, [806, 1070], { rot: -5, esc: 3 });
      por(P.impacto, [760, 1020], { rot: 0, esc: 1.8, forte: 0.7 });
    } else if (v === 1) {
      por(P.machado, [770, 1000], { rot: -35, esc: 3 });
      por(P.rachadura, [806, -10], { rot: 180, esc: 2.6 });
      por(P.impacto, [812, 90], { rot: 0, esc: 2, forte: 0.7 });
    } else {
      por(P.martelo, [806, 560], { rot: 100, esc: 2 });
      por(P.rachadura, [812, 1070], { rot: 0, esc: 1.8 });
    }
  },
  "cavalaria-e-escudos": ({ v, rnd, por }) => {
    if (v === 0) {
      por(P.escudo, [800, 126], { rot: 12, esc: 3.2 });
      por(P.lanca, [806, 640], { rot: 172, esc: 2.2 });
      por(P.lanca, [300, 1074], { rot: 84, esc: 1.6 });
    } else if (v === 1) {
      por(P.escudo, [780, 1010], { rot: -10, esc: 3 });
      por(P.lanca, [812, 360], { rot: 10, esc: 2 });
      por(P.lanca, [790, 380], { rot: -14, esc: 2, forte: 0.7 });
    } else {
      por(P.escudo, [812, 560], { rot: rnd(-10, 10), esc: 2.2 });
    }
  },
  vendaval: ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.rajada, [260, 28], { rot: -3, esc: 2.2 });
      por(P.corte, [620, 116], { rot: 30, esc: 1.8 });
    } else if (v === 1) {
      por(P.rajada, [120, 1046], { rot: 2, esc: 2.2 });
      por(P.corte, [680, 980], { rot: -30, esc: 1.8 });
    } else {
      por(P.rajada, [460, 22], { rot: -2, esc: 1.5 });
    }
    for (let i = 0; i < 3; i++) por(P.adaga, naMargem(), { rot: 120 + rnd(-10, 10), esc: 1.2 });
    for (let i = 0; i < 3; i++) por(P.rajadaCurta, naMargem(), { rot: rnd(-10, 10), esc: 1.2 });
  },
  "punho-de-fogo": ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.impacto, [800, 96], { rot: 0, esc: 2.8 });
      [380, 560, 740].forEach((y) => por(P.chama, [840, y], { rot: -90 + rnd(-8, 8), esc: rnd(1.6, 2.2) }));
    } else if (v === 1) {
      por(P.impacto, [780, 1020], { rot: 0, esc: 3 });
      [120, 260, 400].forEach((x) => por(P.chama, [x, 1074], { rot: rnd(-8, 8), esc: rnd(1.5, 2.1) }));
    } else {
      por(P.impacto, [812, 560], { rot: 0, esc: 2 });
    }
    for (let i = 0; i < 7; i++) por(P.brasa, naMargem(), { esc: rnd(1.1, 2) });
  },
  arquearia: ({ v, rnd, por }) => {
    // Saraivada: as flechas cravadas na borda na mesma inclinação.
    const n = v === 2 ? 5 : 10;
    const inclina = v === 1 ? 212 : 148;
    for (let i = 0; i < n; i++) por(P.flecha, [rnd(798, 836), 150 + i * (760 / n) + rnd(-20, 20)], { rot: inclina + rnd(-4, 4), esc: 1.5 });
    if (v === 1) por(P.arco, [760, 1030], { rot: 70, esc: 2.2 });
  },

  // Árvores de Utilidade
  "furtividade-e-armadilhas": ({ v, rnd, por }) => {
    if (v === 0) {
      // Pegadas atravessando a página na ponta dos pés: apagadas sobre o texto.
      for (let i = 0; i < 12; i++) {
        const t = i / 11;
        por(P.pegada, [100 + t * 720 + (i % 2 ? 14 : -14), 1080 - t * 440], { rot: 52 + rnd(-6, 6), esc: 1.4 });
      }
      por(P.fumaca, [790, 70], { rot: 0, esc: 2.4, forte: 0.6 });
    } else if (v === 1) {
      for (let i = 0; i < 5; i++) por(P.pegada, [i % 2 ? 790 : 822, 960 - i * 100], { rot: rnd(-8, 8), esc: 1.5 });
      por(P.fumaca, [740, 1040], { rot: 0, esc: 2.6, forte: 0.6 });
    } else {
      for (let i = 0; i < 5; i++) por(P.pegada, [i % 2 ? 792 : 822, 800 - i * 110], { rot: rnd(-8, 8), esc: 1.4 });
    }
    for (let i = 0; i < (v === 2 ? 2 : 4); i++) por(P.estrepe, () => [rnd(80, 420), rnd(1010, 1086)], { esc: 1.5 });
  },
  "bardo-e-interacao": ({ v, rnd, por, naMargem }) => {
    if (v === 0) {
      por(P.pauta, [200, 24], { rot: -3, esc: 2, forte: 0.7 });
      for (let i = 0; i < 5; i++) por(P.nota, () => [rnd(260, 800), rnd(0, 60)], { rot: rnd(-15, 15), esc: rnd(1.4, 2) });
    } else if (v === 1) {
      por(P.pauta, [60, 1036], { rot: -2, esc: 2, forte: 0.7 });
      for (let i = 0; i < 5; i++) por(P.nota, () => [rnd(80, 600), rnd(1000, 1070)], { rot: rnd(-15, 15), esc: rnd(1.4, 2) });
    }
    for (let i = 0; i < 4; i++) por(P.nota, naMargem(), { rot: rnd(-20, 20), esc: rnd(1.5, 2.2) });
  },
  "navegacao-e-lideranca": ({ v, rnd, por }) => {
    if (v === 0) {
      por(P.rosaDosVentos, [806, 96], { rot: rnd(-8, 8), esc: 2.6, forte: 0.85 });
      por(P.rota, [60, 1048], { rot: -3, esc: 1.8 });
    } else if (v === 1) {
      por(P.rosaDosVentos, [790, 1010], { rot: rnd(-8, 8), esc: 2.8, forte: 0.85 });
      por(P.rota, [806, 150], { rot: 95, esc: 1.6 });
    } else {
      por(P.rosaDosVentos, [812, 560], { rot: rnd(-8, 8), esc: 1.8, forte: 0.85 });
    }
  },
};

mkdirSync(SAIDA, { recursive: true });
let total = 0;
for (const [nome, receita] of Object.entries(TEMAS)) total += compor(nome, receita);
console.log(`${Object.keys(TEMAS).length} temas, ${Math.round(total / 1024)} KB em public/livro/caos/`);
