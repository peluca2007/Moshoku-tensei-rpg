/**
 * Foto de perfil e capa da ficha: como a imagem entra, e por que ela entra
 * reduzida.
 *
 * ## As decisões que o PROGRESS.md deixou em aberto, e como ficaram
 *
 * **Onde a imagem vive: dentro da ficha, em base64.** A alternativa era guardar
 * só uma URL, e ela custa caro demais: a ficha exportada deixaria de ser
 * autocontida, e "leve o arquivo da ficha pra outra máquina" viraria mentira —
 * a ficha chegaria do outro lado apontando pra um arquivo que não existe lá. A
 * ficha é um arquivo só; a foto entra nele.
 *
 * **Reduzir no cliente é obrigatório, e o teto é duro.** O `localStorage` tem
 * uns 5 MB por origem e guarda o roster INTEIRO. Uma foto de celular tem 3 a 8
 * MB: duas fichas e o roster morre — e morre do pior jeito, no meio de um
 * `setItem`, levando junto as fichas que já estavam salvas. Por isso nada aqui
 * confia no arquivo que chegou: ele é redesenhado num canvas dentro do lado
 * máximo, e depois comprimido em degraus de qualidade ATÉ caber no teto de
 * bytes. Se nem no último degrau couber, a função falha com uma frase que diz
 * o que fazer — em vez de gravar e estourar a cota depois.
 *
 * **A capa e a foto têm tetos diferentes** porque fazem trabalhos diferentes: a
 * foto aparece em 52px no roster e ~96px na ficha (512 é folga de retina de
 * sobra), a capa atravessa um cabeçalho de 1024px.
 *
 * ## O que NÃO vai junto
 *
 * O link de compartilhamento (`fichaLink.ts`) tira as duas imagens antes de
 * codificar. JPEG já é dado comprimido — o gzip do link não tira quase nada
 * dele —, então uma foto de 60 KB viraria ~80 000 caracteres de URL. Navegador,
 * Discord e WhatsApp cortam links muito antes disso, e o resultado seria um
 * link que parece pronto e chega quebrado. O arquivo `.mtficha`
 * (`fichaArquivo.ts`), que não tem esse teto, leva as duas.
 */

/** O teto de cada tipo de imagem da ficha. */
export const LIMITES_DE_IMAGEM = {
  // `curto` é o que vai nos botões. "Trocar foto de perfil" e "Remover foto de
  // perfil" ao lado de "Trocar capa" e "Remover capa" viram quatro botões de
  // largura desigual numa linha só; e com o rótulo longo cortado, os dois
  // "Remover" ficam idênticos lado a lado, o que é pior que longo.
  portrait: { ladoMaior: 512, maxBytes: 70 * 1024, rotulo: "foto de perfil", curto: "foto" },
  cover: { ladoMaior: 1200, maxBytes: 200 * 1024, rotulo: "capa", curto: "capa" },
} as const;

export type TipoDeImagem = keyof typeof LIMITES_DE_IMAGEM;

/**
 * Degraus de qualidade JPEG tentados, do melhor pro pior. Descer de qualidade é
 * sempre melhor que descer de tamanho: uma foto de rosto em 512px com qualidade
 * 0,5 continua legível, e a mesma foto em 256px não volta mais.
 */
export const DEGRAUS_DE_QUALIDADE = [0.82, 0.72, 0.62, 0.5, 0.4];

/**
 * Recusa o arquivo antes de decodificar. Um PNG de 40 MP trava a aba enquanto o
 * canvas o rasteriza, e o usuário não tem como saber que foi ele.
 */
const MAX_BYTES_DE_ENTRADA = 25 * 1024 * 1024;

/**
 * Orçamento total que o roster pode ocupar no `localStorage`.
 *
 * Conservador de propósito: a cota real gira em torno de 5 MB, mas ela é
 * compartilhada com o bestiário, a iniciativa e as macros, e o navegador não
 * avisa quando está perto. Bater neste número dá uma mensagem; bater na cota
 * de verdade perde ficha.
 */
const ORCAMENTO_DE_ARMAZENAMENTO = 4 * 1024 * 1024;

/**
 * Cabe dentro do lado maior, mantendo a proporção — e nunca AUMENTA. Ampliar
 * não cria detalhe: só faz a mesma foto ocupar quatro vezes mais bytes.
 */
export function dimensoesReduzidas(
  largura: number,
  altura: number,
  ladoMaior: number
): { largura: number; altura: number } {
  const maior = Math.max(largura, altura);
  if (maior <= ladoMaior) return { largura, altura };
  const escala = ladoMaior / maior;
  return {
    largura: Math.max(1, Math.round(largura * escala)),
    altura: Math.max(1, Math.round(altura * escala)),
  };
}

/**
 * Quantos bytes um data URL ocupa no `localStorage`.
 *
 * Não é `dataUrl.length`: o `localStorage` guarda UTF-16, dois bytes por
 * caractere. Medir por caractere subestima o consumo pela metade, que é
 * exatamente o erro que faz a cota estourar antes da conta acusar.
 */
export function bytesNoArmazenamento(texto: string): number {
  return texto.length * 2;
}

/** Quanto o roster inteiro já ocupa hoje, medido no que está gravado. */
function bytesDoRoster(): number {
  if (typeof localStorage === "undefined") return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (!chave) continue;
    total += bytesNoArmazenamento(chave) + bytesNoArmazenamento(localStorage.getItem(chave) ?? "");
  }
  return total;
}

export class ImagemRecusada extends Error {}

/**
 * A imagem que chegou de FORA (JSON importado, link de outra pessoa) é
 * aproveitável?
 *
 * Duas coisas que este projeto não pode deixar passar, e as duas são sobre
 * conteúdo que outra pessoa escreveu:
 *
 * 1. **Só `data:image/`.** Um `portrait` apontando pra `https://…` faria o
 *    navegador de quem abre a ficha buscar aquele arquivo — entregando o IP
 *    dele a um servidor que ele nunca escolheu, toda vez que a ficha aparecesse
 *    na tela. A ficha é offline-first e continua sendo: ela carrega a imagem,
 *    não um endereço.
 * 2. **O teto de bytes.** `importCharacter` copia o JSON como veio. Um arquivo
 *    editado à mão com uma foto de 4 MB estouraria a cota do `localStorage` na
 *    primeira gravação, e levaria junto as fichas que já estavam lá.
 */
function ehImagemDeFichaValida(valor: unknown, tipo: TipoDeImagem): valor is string {
  if (typeof valor !== "string" || !valor.startsWith("data:image/")) return false;
  return bytesNoArmazenamento(valor) <= LIMITES_DE_IMAGEM[tipo].maxBytes;
}

/** A ficha sem nenhuma imagem que não passe em `ehImagemDeFichaValida`. */
export function comImagensSaneadas<T extends { portrait?: string; cover?: string }>(ficha: T): T {
  return {
    ...ficha,
    portrait: ehImagemDeFichaValida(ficha.portrait, "portrait") ? ficha.portrait : undefined,
    cover: ehImagemDeFichaValida(ficha.cover, "cover") ? ficha.cover : undefined,
  };
}

async function decodificar(file: File): Promise<ImageBitmap> {
  // `imageOrientation` é o que impede a foto de celular entrar deitada: o JPEG
  // guarda a rotação no EXIF, e um canvas cru desenha os pixels como estão.
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

function paraJpeg(canvas: HTMLCanvasElement, qualidade: number): string {
  return canvas.toDataURL("image/jpeg", qualidade);
}

interface ImagemPreparada {
  dataUrl: string;
  bytes: number;
  largura: number;
  altura: number;
  qualidade: number;
}

/**
 * Lê o arquivo escolhido e devolve um data URL que cabe no teto do tipo.
 *
 * Lança `ImagemRecusada` com uma frase pronta pra tela quando não dá — nunca
 * devolve uma imagem maior que o teto "só desta vez".
 */
export async function prepararImagem(file: File, tipo: TipoDeImagem): Promise<ImagemPreparada> {
  const limite = LIMITES_DE_IMAGEM[tipo];

  if (!file.type.startsWith("image/")) {
    throw new ImagemRecusada("Isso não é uma imagem. Escolha um JPG, PNG ou WebP.");
  }
  if (file.size > MAX_BYTES_DE_ENTRADA) {
    throw new ImagemRecusada(
      `A imagem tem ${(file.size / 1024 / 1024).toFixed(1)} MB. O limite de entrada é 25 MB — ` +
        `abra ela em qualquer editor e salve menor antes.`
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await decodificar(file);
  } catch {
    throw new ImagemRecusada("Não consegui abrir essa imagem — o arquivo pode estar corrompido.");
  }

  try {
    const { largura, altura } = dimensoesReduzidas(bitmap.width, bitmap.height, limite.ladoMaior);
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ImagemRecusada("Este navegador não deixou desenhar a imagem.");

    // Fundo branco antes de desenhar: JPEG não tem transparência, e um PNG com
    // alfa desenhado direto sai com o fundo PRETO — que é o pior resultado
    // possível pra um retrato.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, largura, altura);
    ctx.drawImage(bitmap, 0, 0, largura, altura);

    for (const qualidade of DEGRAUS_DE_QUALIDADE) {
      const dataUrl = paraJpeg(canvas, qualidade);
      const bytes = bytesNoArmazenamento(dataUrl);
      if (bytes <= limite.maxBytes) return { dataUrl, bytes, largura, altura, qualidade };
    }

    throw new ImagemRecusada(
      `Não consegui deixar essa ${limite.rotulo} abaixo de ${Math.round(limite.maxBytes / 1024)} KB ` +
        `nem no menor grau de qualidade. Recorte a imagem antes (menos detalhe fino, menos bytes).`
    );
  } finally {
    bitmap.close();
  }
}

/**
 * Reencoda um data URL que JÁ está na ficha, num tamanho menor.
 *
 * Serve ao arquivo de compartilhamento (`fichaArquivo.ts`): a capa guardada tem
 * 1200px porque atravessa o cabeçalho de quem criou a ficha, e o arquivo que vai
 * pro Mestre não precisa disso. Diferente de `prepararImagem`, aqui a entrada
 * não é um arquivo escolhido pela pessoa — é uma imagem que já passou por todas
 * as checagens uma vez.
 *
 * Se algo falhar, devolve o data URL ORIGINAL em vez de lançar: um arquivo maior
 * é um problema pequeno, e uma exportação que morre é um problema grande.
 */
export async function reduzirDataUrl(
  dataUrl: string,
  limite: { ladoMaior: number; maxBytes: number }
): Promise<string> {
  try {
    const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob());
    try {
      const { largura, altura } = dimensoesReduzidas(bitmap.width, bitmap.height, limite.ladoMaior);
      const canvas = document.createElement("canvas");
      canvas.width = largura;
      canvas.height = altura;
      const ctx = canvas.getContext("2d");
      if (!ctx) return dataUrl;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, largura, altura);
      ctx.drawImage(bitmap, 0, 0, largura, altura);
      for (const qualidade of DEGRAUS_DE_QUALIDADE) {
        const menor = paraJpeg(canvas, qualidade);
        if (bytesNoArmazenamento(menor) <= limite.maxBytes) {
          // Só troca se de fato ficou menor: uma foto que já era pequena não
          // ganha nada em ser reencodada, e reencodar JPEG duas vezes só perde.
          return menor.length < dataUrl.length ? menor : dataUrl;
        }
      }
      return dataUrl;
    } finally {
      bitmap.close();
    }
  } catch {
    return dataUrl;
  }
}

/**
 * A imagem cabe no que sobra do orçamento do `localStorage`?
 *
 * `bytesQueSaem` é o tamanho da imagem que ela vai SUBSTITUIR — trocar uma foto
 * por outra do mesmo tamanho não consome nada a mais, e recusar isso seria
 * prender o usuário na primeira foto que ele escolheu.
 */
export function cabeNoOrcamento(bytesQueEntram: number, bytesQueSaem = 0): boolean {
  return bytesDoRoster() - bytesQueSaem + bytesQueEntram <= ORCAMENTO_DE_ARMAZENAMENTO;
}
