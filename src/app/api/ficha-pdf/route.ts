import { NextRequest, NextResponse } from "next/server";
import { compile } from "typst";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildFichaTypstSource } from "@/lib/typstFicha";
import type { FichaPdfPayload } from "@/lib/typstFicha";

export const runtime = "nodejs";

/**
 * Tipos de imagem que o Typst lê e que este projeto aceita gravar em disco.
 * A lista é branca de propósito: o valor vem do cliente, e "qualquer coisa que
 * comece com data:image/" inclui SVG — que é um documento com script dentro,
 * não uma foto.
 */
const TIPOS_DE_RETRATO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Teto do retrato em disco. `imagemDaFicha.ts` já corta bem abaixo disto no cliente; aqui é o cinto. */
const MAX_BYTES_DO_RETRATO = 512 * 1024;

/**
 * Grava o retrato ao lado do `.typ` e devolve o NOME do arquivo, ou
 * `undefined` quando não há foto ou ela não passa na validação.
 *
 * Nunca lança: ficha sem foto é ficha válida, e derrubar a geração do PDF
 * inteiro por causa de um retrato estranho troca um problema pequeno
 * (documento sem imagem) por um grande (documento nenhum).
 */
async function retratoParaArquivo(dataUrl: string | undefined, dir: string): Promise<string | undefined> {
  if (!dataUrl) return undefined;
  // Sem a flag `s`: o `tsconfig` mira ES2017, e um data URL não tem quebra de
  // linha no meio do base64 — `.` já cobre tudo que pode aparecer aqui.
  const m = /^data:([\w/+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return undefined;
  const extensao = TIPOS_DE_RETRATO[m[1].toLowerCase()];
  if (!extensao) return undefined;
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length === 0 || bytes.length > MAX_BYTES_DO_RETRATO) return undefined;
  // Nome fixo: o cliente não escolhe nenhum pedaço do caminho, então não há
  // travessia possível nem colisão entre requisições (cada uma tem seu mkdtemp).
  const nome = `retrato.${extensao}`;
  await writeFile(path.join(dir, nome), bytes);
  return nome;
}

/** Gera o PDF da ficha via Typst. Recebe o payload já pronto (ver src/lib/buildFichaPayload.ts) — esta rota só monta o .typ e compila, sem repetir a lógica de derivação de status. */
export async function POST(request: NextRequest) {
  let body: FichaPdfPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body || typeof body.name !== "string") {
    return NextResponse.json({ error: "Payload de ficha inválido." }, { status: 400 });
  }

  const dir = await mkdtemp(path.join(tmpdir(), "ficha-pdf-"));
  const typPath = path.join(dir, "ficha.typ");
  const pdfPath = path.join(dir, "ficha.pdf");

  try {
    // O retrato chega como data URL e vira ARQUIVO ao lado do .typ, porque o
    // Typst referencia imagem por caminho. `retratoParaArquivo` é quem decide
    // se o que chegou é aproveitável — o corpo desta requisição é conteúdo que
    // o cliente montou, e ele vira um arquivo em disco.
    const retratoArquivo = await retratoParaArquivo(body.portrait, dir);
    const source = buildFichaTypstSource(body, retratoArquivo);
    await writeFile(typPath, source, "utf-8");
    await compile(typPath, pdfPath);
    const pdf = await readFile(pdfPath);

    const safeName = body.name.replace(/[^\p{L}\p{N}\- ]/gu, "").trim() || "ficha";

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Falha ao gerar PDF da ficha:", err);
    return NextResponse.json({ error: "Falha ao compilar o PDF da ficha." }, { status: 500 });
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
