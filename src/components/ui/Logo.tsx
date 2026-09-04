import Image from "next/image";

/**
 * A marca do projeto.
 *
 * Ela muda uma coisa de arquitetura, não só de arte: **o "RPG" agora está
 * DENTRO do letreiro**. Até 0.1.5 ele era um `<span>` de texto ao lado da
 * imagem, em três lugares (nav, landing, rodapé), porque o logo da franquia não
 * trazia a palavra que este projeto acrescenta ao nome. Trazendo, o texto vira
 * repetição — e saiu.
 *
 * ## O fundo, e por que ele não existe mais (0.1.7)
 *
 * O arquivo original (`/logo-real.png`) é truecolor SEM canal alfa: fundo preto
 * sólido. Em 0.1.6 isso foi contornado com um cartucho escuro e
 * `mix-blend-mode: screen` — o preto sumia contra o cartucho, mas o cartucho
 * continuava sendo um retângulo visível em volta da marca, que é justamente o
 * que uma logo não pode ter.
 *
 * A correção foi no ARQUIVO, não no CSS: `scripts/logo-sem-fundo.mjs` gera
 * `/logo-real-alfa.png` com transparência real (alfa = max(R,G,B), e a cor
 * des-premultiplicada pra borda não carregar o preto que a compôs). Aqui não
 * sobrou truque nenhum — é uma imagem com alfa, solta na página.
 *
 * ## O filtro do tema claro
 *
 * O letreiro é creme e ouro: ele foi desenhado pra viver em fundo escuro, e
 * sobre pergaminho ele simplesmente some (conferido em print, lado a lado). No
 * claro ele passa por `brightness(.3) sepia(.5) saturate(2)`, que escurece o
 * creme até um marrom quente e puxa o ouro pro sépia — a silhueta é a mesma, a
 * temperatura é a da paleta, e o contraste volta. No escuro, nenhum filtro.
 */
export default function Logo({
  className = "",
  priority = false,
}: {
  /** Controle o tamanho por aqui (`h-*`). */
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-real-alfa.png"
      alt="Mushoku Tensei RPG"
      width={1535}
      height={1024}
      priority={priority}
      className={`w-auto [filter:brightness(0.3)_sepia(0.5)_saturate(2)] dark:[filter:none] ${className}`}
    />
  );
}
