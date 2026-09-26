import { arteDoLivro } from "./arteDasRacas";

/**
 * A PRANCHA: a arte que quebra o padrão da página (2026-09-25).
 *
 * Todo livro de RPG tem, de vez em quando, uma imagem que não respeita as
 * duas colunas — atravessa a página de margem a margem e dá fôlego entre um
 * bloco de regra e outro. É isso: no livro folheado a prancha corta a página
 * inteira (folhear.css); se ela não couber onde está e for empurrada pra
 * página seguinte deixando um buraco, a diagramação a devolve pra coluna
 * (acomodarPranchas, em diagramacao.ts).
 *
 * Entra pelo nome do arquivo, como as outras artes: `public/livro/pranchas/<id>`
 * (o id da árvore, pra fechar o catálogo dela, ou o id de uma seção). Sem o
 * arquivo, nada aparece.
 */
const LEGENDAS: Record<string, string> = {
  "deus-do-norte": "Um guerreiro de cabelo branco e poncho listrado, sorrindo no meio do salão.",
  "deus-da-agua-corpo": "Uma velha espadachim de cabelos brancos no meio de um corte que curva o ar em volta dela.",
  "punho-de-fogo": "Um lutador ruivo gritando, com o sol explodindo atrás dele.",
  arquearia: "Uma arqueira ajoelhada na neve, de arco puxado.",
  "cavalaria-e-escudos": "Um cavaleiro de armadura dourada, com o escudo erguido.",
  invocacao: "Um jovem deitado sobre uma criatura enorme de pelo ruivo.",
  teorica: "Um círculo mágico enorme, de anéis e glifos, aceso no chão.",
  "cap2-8": "Um estudante diante de folhas cobertas de diagramas de círculos e quadrados.",
  "cap3-triangulo": "Uma espadachim de cabelo azul sorrindo junto à janela.",
};

export default function Prancha({ id, arvore }: { id: string; arvore?: string }) {
  const arte = arteDoLivro("pranchas", id);
  if (!arte) return null;
  // Faixa de margem a margem (~700 px, 21:8) só pra arte larga e com
  // resolução pra isso; arte em pé ou pequena entra na coluna, inteira, no
  // formato dela — senão a faixa cortaria cabeças ou borraria a imagem.
  const proporcao = arte.largura && arte.altura ? arte.largura / arte.altura : 16 / 9;
  const faixa = proporcao >= 1.55 && (arte.largura ?? 0) >= 900;
  const aspecto = Math.min(1.6, Math.max(0.72, proporcao));
  return (
    <figure
      className={`livro-prancha my-4 overflow-hidden rounded-xl border border-parchment-300 dark:border-parchment-800 ${faixa ? "" : "livro-prancha-coluna"}`}
      style={faixa ? undefined : { aspectRatio: String(aspecto) }}
      data-prancha={id}
      // Na árvore, a prancha pinta a sombra com a cor da árvore.
      data-arvore={arvore}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- arte de página, impressa no papel. */}
      <img src={arte.src} alt={LEGENDAS[id] ?? ""} loading="lazy" decoding="async" className={faixa ? "aspect-[21/9] w-full object-cover" : "h-full w-full object-cover"} />
    </figure>
  );
}
