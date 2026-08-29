import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { GENERATED_PARTS } from "@/lib/livroTex";

export const runtime = "nodejs";

const RAIZ = () => path.join(process.cwd(), "livro-tex");

/**
 * Monta o livro inteiro num ÚNICO arquivo .tex, pronto pra colar no Overleaf.
 *
 * Por que um arquivo só, e não um .zip da pasta livro-tex/: o Overleaf aceita
 * "New Project -> Blank" e colar um .tex, que é o caminho de menos atrito. A
 * classe vai embutida num `filecontents*` antes do `\documentclass` — o LaTeX
 * grava o moshoku.cls no disco dele na primeira passada e carrega em seguida,
 * então o download é literalmente autossuficiente.
 *
 * As partes de dados (as 18 árvores, tabelas, raças, loja) são geradas AGORA,
 * lendo src/data — não os arquivos versionados em livro-tex/gen/. Assim o .tex
 * baixado nunca fica atrás de uma mudança de regra que ainda não passou pelo
 * `npm run book:tex`.
 */
async function lerCapitulo(nome: string): Promise<string> {
  return readFile(path.join(RAIZ(), "capitulos", `${nome}.tex`), "utf-8");
}

function inlineFilecontents(nome: string, conteudo: string): string {
  return `\\begin{filecontents*}[overwrite]{${nome}}\n${conteudo.trimEnd()}\n\\end{filecontents*}\n`;
}

/**
 * Achata os caminhos dos `\input`.
 *
 * `filecontents` grava arquivos, mas NÃO cria diretórios: um
 * `\begin{filecontents*}{gen/arvores.tex}` falha no Overleaf, porque `gen/`
 * não existe no projeto em branco. Como o arquivo único é justamente pra não
 * exigir que ninguém monte a árvore de pastas na mão, tudo vira nome plano
 * (`gen/arvores` → `mt-gen-arvores`) e os `\input` são reescritos junto. Na
 * pasta livro-tex/ do repositório os caminhos com diretório continuam valendo
 * normalmente — esta transformação existe só na saída de arquivo único.
 */
const nomePlano = (caminho: string) => "mt-" + caminho.replace(/\//g, "-").replace(/\.tex$/, "");

function achatarInputs(tex: string): string {
  return tex.replace(/\\input\{(gen|capitulos)\/([\w-]+)\}/g, (_, dir, nome) =>
    `\\input{${nomePlano(`${dir}/${nome}`)}}`
  );
}

export async function GET() {
  try {
    const [cls, main] = await Promise.all([
      readFile(path.join(RAIZ(), "moshoku.cls"), "utf-8"),
      readFile(path.join(RAIZ(), "main.tex"), "utf-8"),
    ]);

    const gerados = GENERATED_PARTS.map((p) =>
      inlineFilecontents(`${nomePlano(`gen/${p.file}`)}.tex`, p.build())
    ).join("\n");

    const capitulos = await Promise.all(
      ["cap1", "cap2", "cap3", "cap4", "cap5", "apendices"].map(async (n) =>
        inlineFilecontents(
          `${nomePlano(`capitulos/${n}.tex`)}.tex`,
          achatarInputs(await lerCapitulo(n))
        )
      )
    );

    const documento = [
      "% =========================================================================",
      "%  Moshoku Tensei RPG — Livro de Regras — arquivo único, pronto pro Overleaf",
      `%  Gerado em ${new Date().toISOString().slice(0, 10)} a partir do sistema vivo.`,
      "%",
      "%  COMO USAR: crie um projeto em branco no Overleaf, cole este arquivo",
      "%  inteiro no main.tex e mude o compilador para LuaLaTeX (Menu -> Compiler).",
      "%  Compile duas vezes pro sumário fechar. Os blocos filecontents abaixo",
      "%  criam sozinhos a classe e os capítulos — não falta nenhum anexo.",
      "% =========================================================================",
      "",
      inlineFilecontents("moshoku.cls", cls),
      gerados,
      ...capitulos,
      achatarInputs(main),
    ].join("\n");

    return new NextResponse(documento, {
      status: 200,
      headers: {
        "Content-Type": "application/x-tex; charset=utf-8",
        "Content-Disposition": 'attachment; filename="moshoku-tensei-livro.tex"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Falha ao montar o livro em LaTeX:", err);
    return NextResponse.json(
      { error: "Falha ao montar o livro em LaTeX. A pasta livro-tex/ está presente?" },
      { status: 500 }
    );
  }
}
