import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PATCH_NOTES } from "@/data/patchNotes";

/**
 * A CAPA (2026-09-23).
 *
 * O `/livro` abria com o `PageHeader` — o mesmo objeto que anuncia a loja, a
 * ficha e os encontros: faixa de arte, ícone num quadrado vinho, título, linha
 * de apoio. Funciona pra uma rota do site, e o livro é justamente a coisa que
 * NÃO é uma rota do site: ele é o produto, e o site é a interface dele. Aberto
 * daquele jeito, ele se apresentava como mais uma tela.
 *
 * Uma capa faz três coisas que um cabeçalho de rota não faz: centraliza (um
 * cabeçalho alinha à esquerda porque tem botões à direita), emoldura, e diz a
 * edição. Nada aqui é decoração à toa — a moldura dupla é o que transforma um
 * retângulo com foto em objeto impresso, e a edição é a informação que a mesa
 * pergunta ("essa é a versão que a gente jogou?").
 *
 * A arte entra DESFOCADA de propósito. `public/faixas/livro.jpg` tem 680×384,
 * a menor de todas as faixas (o `O-QUE-FALTA.md` pedia uma de 1600px), e numa
 * capa alta ela ficaria visivelmente borrada. Desfocada, ela deixa de ser foto
 * e vira atmosfera — deixando de depender de uma resolução que ela não tem.
 */
export default function BookCover() {
  const edicao = PATCH_NOTES[0]?.version;

  return (
    <header className="livro-capa relative isolate mb-8 overflow-hidden rounded-sm border border-gold-600/40 px-6 py-12 text-center sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/faixas/livro.jpg"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1024px"
          priority
          className="livro-capa-arte scale-110 object-cover object-[center_60%]"
        />
        {/* O mesmo raciocínio do véu do PageHeader: filtro depende de quão
            clara a arte é, véu não — ele garante o piso de luminância que o
            título precisa, qualquer que seja a arte que entre aqui amanhã.
            A 80% no claro a capa virava um retângulo liso acinzentado: o véu
            comia a arte inteira e sobrava menos atmosfera do que numa capa sem
            foto nenhuma. */}
        <div className="absolute inset-0 bg-parchment-50/62 dark:bg-parchment-950/70" />
      </div>

      <p className="text-2xs font-bold uppercase tracking-[0.4em] text-gold-700 sm:text-xs dark:text-gold-400">
        Livro de Regras
      </p>

      <h1 className="mt-4 text-balance font-display text-4xl font-black tracking-tight text-parchment-900 sm:text-6xl dark:text-parchment-50">
        Mushoku Tensei RPG
      </h1>

      <p
        aria-hidden
        className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-3 text-gold-600/70 sm:max-w-sm dark:text-gold-500/70"
      >
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-current" />
        <span className="h-1.5 w-1.5 rotate-45 bg-current" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-current" />
      </p>

      <p className="mt-5 font-display text-lg italic text-parchment-700 sm:text-xl dark:text-parchment-300">
        O Mundo de Seis Faces
      </p>

      {/* A porta pro livro folheado (/livro/folhear): páginas de tamanho fixo,
          duas colunas, virar página. Até ele substituir este /livro, é daqui
          que a mesa chega lá sem digitar o endereço. */}
      <Link
        href="/livro/folhear"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold-600/60 bg-parchment-50/70 px-5 py-2.5 text-sm font-semibold text-gold-800 shadow-sm transition hover:border-gold-500 hover:bg-gold-500/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 dark:bg-parchment-950/60 dark:text-gold-300"
      >
        <BookOpen className="h-4 w-4" aria-hidden />
        Folhear como livro
      </Link>

      {edicao && (
        <p className="mt-8 text-2xs uppercase tracking-[0.25em] text-parchment-600 dark:text-parchment-400">
          Edição {edicao}
        </p>
      )}
    </header>
  );
}
