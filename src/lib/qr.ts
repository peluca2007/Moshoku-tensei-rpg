import qrcode from "qrcode-generator";

/**
 * O QR da ficha — 0.1.33.
 *
 * ## Por que ele existe
 *
 * Entre dois celulares na mesma mesa, o caminho mais curto não é link nem
 * arquivo: é apontar a câmera. Não passa por aplicativo de mensagem, não depende
 * de o link sobreviver inteiro, e não precisa de gerenciador de arquivos.
 *
 * ## Por que uma dependência, e não código próprio
 *
 * Um codificador de QR é Reed-Solomon, escolha de versão e oito máscaras
 * testadas por penalidade. Escrever isso à mão é a receita de um QR que DESENHA
 * mas não LÊ — e um QR que não lê é exatamente a "funcionalidade que mente" que
 * este projeto evita. `qrcode-generator` é a implementação de referência do
 * Kazuhiko Arase, sem dependências, e o erro dela seria o erro de milhares de
 * usos por aí, não um erro só nosso.
 *
 * ## Por que importado estaticamente, e não sob demanda
 *
 * `await import()` deixaria os ~10 KB fora do pacote inicial — e fora do cache
 * offline junto. O service worker guarda o HTML de cada rota e tudo que esse
 * HTML CITA (ver `public/sw.js`); um pedaço carregado só quando alguém aperta o
 * botão não é citado por HTML nenhum, e o QR seria a única parte da ficha que
 * para de funcionar no porão. Dez quilobytes é o preço de manter a promessa.
 */

/** Correção de erro `L` — a mais fraca, e a certa aqui: ela é o que faz caber mais dado no mesmo QR. */
const CORRECAO = "L" as const;

/*
 * UTF-8, e não o padrão da biblioteca.
 *
 * O modo byte do `qrcode-generator` usa, por padrão, uma conversão que só olha
 * o código do caractere — o que corrompe qualquer coisa fora do ASCII. Nosso
 * link é base64url puro e nunca teria acento, mas este componente é genérico:
 * o dia em que alguém passar um nome de personagem ou um texto qualquer, o QR
 * geraria e leria LIXO em vez de recusar.
 *
 * Achado por teste: "Peçonha · Água" ia e voltava como string vazia.
 *
 * A conversão é feita aqui com `TextEncoder` em vez de usar o
 * `stringToBytesFuncs["UTF-8"]` da própria biblioteca: aquele extra existe no
 * objeto do módulo CommonJS e NÃO chega pelo import de ESM, que é como este
 * projeto importa. Três linhas nossas custam menos que um caminho de importação
 * que funciona no teste e falha no navegador.
 */
qrcode.stringToBytes = (texto: string) => Array.from(new TextEncoder().encode(texto));

/**
 * Teto medido em 2026-09-10: 2.953 bytes é o máximo do QR versão 40 em modo
 * byte com correção L. Em fichas reais isso dá:
 *
 * | Personagem | Link    | Versão | Módulos |
 * | ---------- | ------- | ------ | ------- |
 * | 1 árvore   | ~1.086  | 23     | 109     |
 * | 2 árvores  | ~1.594  | 29     | 133     |
 * | 3 árvores  | ~2.058  | 33     | 149     |
 * | 4 árvores  | ~2.490  | 37     | 165     |
 * | 5 árvores  | ~2.990  | —      | não cabe |
 */
export const LIMITE_QR = 2953;

/**
 * Acima de quantos módulos o QR começa a exigir câmera perto e tela grande.
 *
 * Um QR de 165 módulos desenhado em 320px dá menos de 2 pixels por módulo. Ele
 * está tecnicamente correto e a câmera de um celular bom lê; a de um celular
 * velho, com a tela do outro celular meio suja, não lê — e a pessoa fica
 * tentando sem saber por quê. Daí o aviso.
 */
const MODULOS_DENSOS = 130;

export interface QrGerado {
  /** Matriz de módulos: `true` = escuro. */
  modulos: boolean[][];
  tamanho: number;
  /** O QR é grande o bastante pra dar trabalho de ler numa tela pequena. */
  denso: boolean;
}

/** A versão do QR a partir do número de módulos: todo QR tem `4 × versão + 17` de lado. */
function versaoDe(modulos: number): number {
  return (modulos - 17) / 4;
}

export type ResultadoQr = { ok: true; qr: QrGerado } | { ok: false; motivo: "grande-demais"; caracteres: number };

/**
 * Monta a matriz do QR, ou explica por que não deu.
 *
 * Devolve resultado em vez de lançar porque "não cabe" é um estado NORMAL —
 * uma ficha de cinco árvores passa do teto, e a tela precisa dizer isso em vez
 * de quebrar.
 */
export function gerarQr(texto: string): ResultadoQr {
  if (texto.length > LIMITE_QR) return { ok: false, motivo: "grande-demais", caracteres: texto.length };

  // Versão 0 = "escolha a menor que couber". A biblioteca também lança quando
  // não cabe, e o teto acima existe pra que a resposta seja a nossa, com o
  // número de caracteres junto.
  let g = qrcode(0, CORRECAO);
  g.addData(texto, "Byte");
  g.make();

  /*
   * A VERSÃO 23 É PULADA. Não é superstição — é medição.
   *
   * Varrendo as 40 versões contra um decodificador independente (o jsQR, no
   * teste ao lado), 39 voltam com o texto idêntico e UMA não volta: a 23, com
   * 109 módulos. Ela falha em qualquer escala de renderização, de 4 a 10 pixels
   * por módulo, o que descarta "ficou pequeno demais".
   *
   * Nosso código gera a 23 corretamente até onde dá pra afirmar — o gerador é a
   * implementação de referência do formato. O problema mora no decodificador. E
   * é aí que isto deixa de ser curiosidade: o jsQR é o leitor por trás de boa
   * parte dos scanners de QR que rodam em navegador. Um código que ele não lê é
   * um código que uma parte real das câmeras do mundo não lê.
   *
   * Custa quatro módulos a mais escolher a 24. Custa uma ficha que não passa
   * insistir na 23.
   *
   * Se um dia o jsQR corrigir isso, este bloco pode sair — e o teste de ida e
   * volta continua sendo quem responde.
   */
  // `as const` porque a tipagem da biblioteca enumera as versões uma a uma
  // (`TypeNumber`), e um `number` solto não encaixa.
  const VERSAO_QUE_NEM_TODO_LEITOR_ABRE = 23 as const;
  if (versaoDe(g.getModuleCount()) === VERSAO_QUE_NEM_TODO_LEITOR_ABRE) {
    g = qrcode(24, CORRECAO);
    g.addData(texto, "Byte");
    g.make();
  }

  const tamanho = g.getModuleCount();
  const modulos: boolean[][] = [];
  for (let linha = 0; linha < tamanho; linha++) {
    const atual: boolean[] = [];
    for (let coluna = 0; coluna < tamanho; coluna++) atual.push(g.isDark(linha, coluna));
    modulos.push(atual);
  }

  return { ok: true, qr: { modulos, tamanho, denso: tamanho > MODULOS_DENSOS } };
}

/**
 * A matriz virando um `path` de SVG — um só, com um retângulo por módulo escuro.
 *
 * Um `<rect>` por módulo daria até 27 mil elementos num QR grande, e o
 * navegador desenha isso de forma perceptivelmente lenta num celular. Um path
 * único desenha na mesma velocidade em qualquer tamanho.
 *
 * A margem de 4 módulos (a "zona quieta") não é enfeite: sem ela, a câmera não
 * acha as bordas do código e a leitura simplesmente não acontece.
 */
export const MARGEM_QR = 4;

export function caminhoDoQr(qr: QrGerado): string {
  const partes: string[] = [];
  for (let linha = 0; linha < qr.tamanho; linha++) {
    for (let coluna = 0; coluna < qr.tamanho; coluna++) {
      if (qr.modulos[linha][coluna]) {
        partes.push(`M${coluna + MARGEM_QR} ${linha + MARGEM_QR}h1v1h-1z`);
      }
    }
  }
  return partes.join("");
}
