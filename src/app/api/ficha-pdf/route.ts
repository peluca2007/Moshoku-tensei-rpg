import { NextRequest, NextResponse } from "next/server";
import { compile } from "typst";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildFichaTypstSource } from "@/lib/typstFicha";
import type { FichaPdfPayload } from "@/lib/typstFicha";

export const runtime = "nodejs";

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
    const source = buildFichaTypstSource(body);
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
