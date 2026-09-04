import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * O cabeçalho de uma rota, com a arte de ambiente dela atrás (0.1.5).
 *
 * `/ficha`, `/loja`, `/encontros` e `/iniciativa` eram estruturalmente a mesma
 * página — h1 + ícone lilás + grade de cards — e o `PROGRESS.md` já anotava o
 * problema com todas as letras: "uma loja de guilda e uma ficha deveriam
 * *parecer* coisas diferentes". A faixa é o que faz isso em um componente só,
 * sem que cada rota invente um layout próprio.
 *
 * `faixa` é OPCIONAL de propósito: nem toda rota tem arte (e nenhuma deve
 * esperar por arte pra existir). Sem ela o cabeçalho cai num degradê
 * vinho→pergaminho, que é o mesmo objeto, só sem foto.
 *
 * O tratamento da arte — dessaturar, puxar pro âmbar, morrer num degradê antes
 * da borda de baixo — mora em `.faixa-arte` no globals.css, porque as artes
 * chegaram em teal, azul e cinza e nenhuma delas, crua, convive com texto por
 * cima.
 */
export default function PageHeader({
  icon: Icon,
  title,
  faixa,
  faixaPosition = "center",
  actions,
  children,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  /** Caminho em `public/faixas` (ou outra arte panorâmica). */
  faixa?: string;
  /**
   * `object-position` da arte — algumas têm o assunto fora do centro. Vai como
   * estilo inline, e não como classe: `object-${pos}` seria uma classe montada
   * em template literal, e o Tailwind não gera o que não consegue ler no texto
   * do arquivo — a regra sairia do build e a posição simplesmente não aplicaria.
   */
  faixaPosition?: string;
  /** Botões do canto direito (Desfazer, Importar, Rodada…). */
  actions?: ReactNode;
  /** Linha de apoio abaixo do título. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`surface-raised relative isolate mb-6 overflow-hidden rounded-2xl border border-parchment-300/90 bg-parchment-50/90 dark:border-parchment-700/80 dark:bg-parchment-900/80 ${className}`}
    >
      {faixa ? (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <Image
            src={faixa}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            style={{ objectPosition: faixaPosition }}
            className="faixa-arte object-cover"
          />
          {/*
            O VÉU que garante o contraste, e não é opcional (0.1.10).

            O filtro de `.faixa-arte` dessatura e escurece — o que funciona
            enquanto a arte é clara. O campo estelar de `/arvores` é quase
            PRETO, e escurecer um preto não faz nada: no tema claro, onde o
            título é `parchment-900`, o cabeçalho inteiro ficou texto escuro
            sobre fundo escuro. Ilegível, e invisível pra mim até eu forçar o
            tema claro num print — todos os anteriores tinham saído no escuro,
            porque o Chrome headless segue o tema do SO.

            Filtro depende de quão clara a arte é; véu não. Ele garante o piso
            de luminância que o texto precisa, qualquer que seja a imagem que
            entrar aqui amanhã.
          */}
          <div className="absolute inset-0 bg-parchment-50/72 dark:bg-parchment-950/45" />
        </div>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-wine-100/70 via-parchment-50/40 to-transparent dark:from-wine-950/60 dark:via-parchment-950/30"
          aria-hidden
        />
      )}

      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-parchment-900 drop-shadow-[0_1px_0_rgba(253,246,227,0.6)] dark:text-parchment-50 dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-3xl">
            {/*
              O ícone ganhou moldura. Solto, ele era um pictograma vinho de 24px
              perdido ao lado de um título — do mesmo tamanho e da mesma cor que
              os outros dez ícones de seção da página, sem hierarquia nenhuma.
            */}
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wine-600 text-parchment-50 shadow-md ring-1 ring-gold-400/50">
              <Icon className="h-5 w-5" />
            </span>
            {title}
          </h1>
          {children ? (
            <div className="mt-2 max-w-2xl text-sm text-parchment-700 dark:text-parchment-300">{children}</div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
