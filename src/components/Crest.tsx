import Image from "next/image";

/**
 * Uma imagem de catálogo dentro de um medalhão padrão (2026-09-03).
 *
 * Nasceu como `TreeCrest`, para os brasões das dezenove árvores, e virou
 * genérica quando os ícones da loja chegaram com exatamente o mesmo problema:
 * arquivos de origens diferentes — SVG de traço preto sem fundo, PNG de fundo
 * branco, PNG de fundo PRETO, PNG com alfa, JPEG — que, soltos na página,
 * dariam um enquadramento diferente cada e sumiriam no tema escuro.
 *
 * A normalização é de APRESENTAÇÃO e mora aqui: fundo claro FIXO nos dois
 * temas (é o que faz traço preto aparecer no escuro), recorte quadrado, e o
 * anel acompanhando o tema. Trocar isso num lugar troca no site inteiro.
 *
 * `unoptimized` vale SÓ pra SVG, que o otimizador do Next não processa. Todo o
 * resto passa pelo otimizador de propósito: os retratos de raça chegaram com
 * até 1,28 MB por arquivo, e servir isso cru num medalhão de 44px seria mandar
 * o navegador baixar um megabyte pra desenhar um selo.
 */
export default function Crest({
  src,
  size = 32,
  className = "",
  rounded = "rounded-lg",
}: {
  /** Caminho em `public/`. */
  src: string;
  /** Lado do medalhão, em px. */
  size?: number;
  className?: string;
  rounded?: string;
}) {
  return (
    <span
      // Decorativo: o nome da coisa está sempre escrito ao lado, então repeti-lo
      // em alt faria o leitor de tela ler duas vezes.
      aria-hidden
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-parchment-100 ring-1 ring-parchment-300 dark:ring-parchment-700 ${rounded} ${className}`}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized={src.endsWith(".svg")}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
