import Image from "next/image";

/**
 * O divisor de seção do livro (0.1.5).
 *
 * A filigrana chegou como PNG de traço PRETO sobre fundo BRANCO — não como SVG
 * e não com alfa. Solta na página ela seria um retângulo branco no meio do
 * pergaminho, e um retângulo branco gritando no tema escuro.
 *
 * O filtro abaixo resolve isso sem editor de imagem: `feColorMatrix` joga a
 * luminância no canal ALFA, invertida (a linha de alfa é `-0.33 -0.33 -0.33 0 1`,
 * então branco → 0,01 de opacidade e preto → 1), e o `feFlood`+`feComposite`
 * pinta o que sobrou de dourado. Ou seja: o fundo branco vira transparente e o
 * traço vira ouro, nos dois temas, a partir do arquivo como ele veio.
 *
 * `color-interpolation-filters="sRGB"` não é opcional: no padrão
 * (linearRGB) a conta de luminância acontece noutro espaço e o branco não
 * chega em zero — sobra um véu cinza visível em cima do pergaminho.
 *
 * As duas últimas linhas do filtro nasceram de um print (0.1.5): o ornamento
 * saiu com uma MOLDURA dourada em volta. A região padrão de um filtro SVG é 10%
 * MAIOR que o elemento, e lá fora o pixel é preto transparente (0,0,0,0) — que,
 * pela conta acima, vira alfa 1, ou seja, ouro chapado. A margem inteira pintava.
 * Travar a região em 100% do bbox e compor de novo `in` a SourceGraphic
 * (que só é opaca onde a imagem existe) corta os dois casos.
 */
export function OrnamentDefs() {
  return (
    <svg aria-hidden className="pointer-events-none absolute h-0 w-0" focusable="false">
      <defs>
        <filter id="tinta-para-ouro" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    -0.33 -0.33 -0.33 0 1"
            result="alfa"
          />
          <feFlood floodColor="#b8862e" />
          <feComposite operator="in" in2="alfa" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
        <filter id="tinta-para-ouro-claro" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    -0.33 -0.33 -0.33 0 1"
            result="alfa"
          />
          <feFlood floodColor="#e2ba5e" />
          <feComposite operator="in" in2="alfa" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Filete duplo com losango, e — quando `arte` — a filigrana no meio dele.
 * Sem `arte` é CSS puro (`.rule-ornate`), que é o que se quer entre seções
 * curtas: a filigrana toda seção vira barulho.
 */
export default function Ornament({ arte = false, className = "" }: { arte?: boolean; className?: string }) {
  if (!arte) {
    return (
      <div aria-hidden className={`rule-ornate my-8 ${className}`}>
        <span className="h-2 w-2 rotate-45 bg-current" />
      </div>
    );
  }

  return (
    <div aria-hidden className={`rule-ornate my-10 ${className}`}>
      <Image
        src="/ornamentos/divisor.png"
        alt=""
        width={678}
        height={452}
        /* h-10 saiu num print como uma mancha de 60px que ninguém lia como
           ornamento: a arte é larga (678×452), então a altura precisa ser
           generosa pra ela ter largura suficiente pra existir na página. */
        className="h-14 w-auto sm:h-20 [filter:url(#tinta-para-ouro)] dark:[filter:url(#tinta-para-ouro-claro)]"
      />
    </div>
  );
}
