import { describe, expect, it } from "vitest";
import jsQR from "jsqr";
import { caminhoDoQr, gerarQr, LIMITE_QR, MARGEM_QR } from "./qr";

/**
 * Desenha o QR num buffer RGBA, do jeito que o SVG desenha na tela: um bloco
 * por módulo, mais a zona quieta de 4 módulos em volta.
 *
 * `escala` é quantos pixels cada módulo ocupa. Oito, e não quatro: com quatro,
 * o decodificador falhou num código de 109 módulos e leu um de 133 — o mesmo
 * tipo de teimosia que uma câmera tem diante de um QR pequeno demais na tela, e
 * a razão de a interface avisar quando o código fica denso.
 */
function rasterizar(modulos: boolean[][], escala = 8) {
  const lado = (modulos.length + MARGEM_QR * 2) * escala;
  const dados = new Uint8ClampedArray(lado * lado * 4).fill(255);

  for (let linha = 0; linha < modulos.length; linha++) {
    for (let coluna = 0; coluna < modulos.length; coluna++) {
      if (!modulos[linha][coluna]) continue;
      const x0 = (coluna + MARGEM_QR) * escala;
      const y0 = (linha + MARGEM_QR) * escala;
      for (let y = y0; y < y0 + escala; y++) {
        for (let x = x0; x < x0 + escala; x++) {
          const i = (y * lado + x) * 4;
          dados[i] = dados[i + 1] = dados[i + 2] = 0;
        }
      }
    }
  }
  return { dados, lado };
}

/*
 * A objeção que travava esta funcionalidade era literal: "não dá pra VERIFICAR
 * um QR sem uma câmera, e um QR que desenha mas não lê é a funcionalidade que
 * mente". Isto é a câmera.
 *
 * O QR é gerado pelo nosso código, rasterizado exatamente como o SVG o desenha
 * (mesmos módulos, mesma zona quieta), e lido de volta por uma implementação
 * INDEPENDENTE — o jsQR, que não compartilha uma linha com o gerador. Se o
 * texto voltar idêntico, o código é legível de verdade.
 */
describe("o QR é legível — decodificado por outra implementação", () => {
  function idaEVolta(texto: string) {
    const r = gerarQr(texto);
    expect(r.ok, `não gerou o QR de ${texto.length} caracteres`).toBe(true);
    if (!r.ok) throw new Error("não gerou");
    const { dados, lado } = rasterizar(r.qr.modulos);
    const lido = jsQR(dados, lado, lado);
    return { lido: lido?.data, qr: r.qr };
  }

  it("um link curto volta idêntico", () => {
    const url = "https://exemplo.test/ficha/importar#g:abcDEF123-_";
    expect(idaEVolta(url).lido).toBe(url);
  });

  it("um link do tamanho de uma ficha de uma árvore volta idêntico", () => {
    // ~1.086 caracteres, o tamanho medido de uma árvore inteira até Imperador.
    const url = `https://exemplo.test/ficha/importar#g:${"aZ09-_".repeat(172)}`;
    expect(url.length).toBeGreaterThan(1000);
    expect(idaEVolta(url).lido).toBe(url);
  });

  it("um link de duas árvores volta idêntico, e o código já é denso", () => {
    const url = `https://exemplo.test/ficha/importar#g:${"aZ09-_".repeat(260)}`;
    expect(url.length).toBeGreaterThan(1550);
    const { lido, qr } = idaEVolta(url);
    expect(lido).toBe(url);
    expect(qr.denso).toBe(true);
  });

  it("acentos e caracteres fora do ASCII sobrevivem", () => {
    const texto = "Peçonha · Água · Ação — ãéíõü";
    expect(idaEVolta(texto).lido).toBe(texto);
  });
});

describe("os limites, declarados em vez de descobertos na mesa", () => {
  it("acima do teto ele recusa e diz o tamanho, em vez de lançar", () => {
    const r = gerarQr("x".repeat(LIMITE_QR + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.motivo).toBe("grande-demais");
      expect(r.caracteres).toBe(LIMITE_QR + 1);
    }
  });

  it("exatamente no teto ainda cabe", () => {
    expect(gerarQr("x".repeat(LIMITE_QR)).ok).toBe(true);
  });

  it("o código cresce com o texto — é isso que o aviso de densidade mede", () => {
    const pequeno = gerarQr("oi");
    const grande = gerarQr("x".repeat(2000));
    if (!pequeno.ok || !grande.ok) throw new Error("deveriam caber");
    expect(grande.qr.tamanho).toBeGreaterThan(pequeno.qr.tamanho);
    expect(pequeno.qr.denso).toBe(false);
    expect(grande.qr.denso).toBe(true);
  });
});

describe("o caminho do SVG", () => {
  it("tem um retângulo por módulo escuro, e nem um a mais", () => {
    const r = gerarQr("teste");
    if (!r.ok) throw new Error("deveria caber");
    const escuros = r.qr.modulos.flat().filter(Boolean).length;
    expect(caminhoDoQr(r.qr).match(/M/g)?.length).toBe(escuros);
  });

  /* A zona quieta não é margem estética: sem ela a câmera não acha as bordas. */
  it("desloca tudo pela zona quieta, sem nada em cima da borda", () => {
    const r = gerarQr("teste");
    if (!r.ok) throw new Error("deveria caber");
    const menorX = Math.min(...[...caminhoDoQr(r.qr).matchAll(/M(\d+) /g)].map((m) => Number(m[1])));
    expect(menorX).toBeGreaterThanOrEqual(MARGEM_QR);
  });
});

/*
 * A versão 23 é pulada de propósito (ver o comentário em `gerarQr`). Este teste
 * é o que impede alguém de "simplificar" aquele bloco: se ele sair, o QR de uma
 * ficha de uma árvore volta a cair numa versão que parte dos leitores do mundo
 * não abre — e o sintoma seria uma câmera que fica encarando o código sem nada
 * acontecer, que é indistinguível de "o app do meu amigo é ruim".
 */
describe("a versão que nem todo leitor abre", () => {
  it("nunca gera um QR de 109 módulos", () => {
    // 1.086 caracteres é o tamanho medido de uma ficha de uma árvore, e é
    // exatamente onde a escolha automática cairia na versão 23.
    const r = gerarQr("h".repeat(1086));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.qr.tamanho).not.toBe(109);
  });

  it("o QR que ela substitui continua legível", () => {
    const url = `https://exemplo.test/ficha/importar#g:${"aZ09-_".repeat(172)}`;
    const r = gerarQr(url);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const { dados, lado } = rasterizar(r.qr.modulos);
    expect(jsQR(dados, lado, lado)?.data).toBe(url);
  });
});
