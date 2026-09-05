/**
 * Gzip + base64url, sem saber o que está compactando.
 *
 * ## Por que isto virou seu próprio arquivo
 *
 * `fichaArquivo.ts` e `fichaLink.ts` tinham cada um a própria cópia destas
 * quatro funções — foram escritas juntas, na mesma tarde, pra resolver o mesmo
 * problema (ficha grande demais pro Discord, ficha grande demais pra URL). Isso
 * era sustentável enquanto só existia UM tipo de coisa pra empacotar. A criatura
 * do Mestre (`criaturaArquivo.ts`, `criaturaLink.ts`) precisa exatamente do
 * mesmo gzip e do mesmo alfabeto de URL — nenhuma imagem, nenhuma regra
 * específica de ficha —, e copiar a cópia pela terceira vez é o sinal de que a
 * coisa duplicada nunca foi "arquivo de ficha": sempre foi "bytes comprimidos
 * num alfabeto seguro pra nome de arquivo e pra URL".
 *
 * O que fica de FORA de propósito: qualquer marca de formato (`MTF1`, `g:`,
 * `j:`...) e qualquer validação de forma (`attributeBase`, `papel`...). Isso é
 * dado do CONTEÚDO — cada chamador sabe o que está empacotando, este arquivo
 * não sabe e não precisa saber.
 */

export async function comprimirTexto(texto: string): Promise<Uint8Array<ArrayBuffer> | null> {
  if (typeof CompressionStream === "undefined") return null;
  const stream = new Blob([texto]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// `Uint8Array<ArrayBuffer>`, e não `Uint8Array`: o TS 5 tipa o genérico como
// `ArrayBufferLike`, e `BlobPart` recusa uma view que POSSA estar sobre um
// `SharedArrayBuffer`. Amarrar o parâmetro ao buffer comum compila sem `as` —
// e é verdade, porque quem chama sempre monta o array do zero.
export async function descomprimirBytes(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

export function bytesParaBase64Url(bytes: Uint8Array): string {
  let binario = "";
  // `String.fromCharCode(...bytes)` estoura a pilha em ficha/criatura grande —
  // o limite de argumentos de uma chamada é dezenas de milhares, e um
  // Imperador passa disso. O laço é feio e não estoura.
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlParaBytes(texto: string): Uint8Array<ArrayBuffer> {
  const base64 = texto.replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}
