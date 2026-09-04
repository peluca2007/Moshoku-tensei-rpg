import type { LucideIcon } from "lucide-react";

/**
 * O que a ficha mostra antes de você comprar qualquer coisa (0.1.5).
 *
 * Uma ficha nova abria com "Nenhuma perícia ainda.", "Nenhuma magia ou talento
 * comprado ainda." e "Nenhum item ainda." — três frases cinzas, uma embaixo da
 * outra, e essa era a primeira impressão do site pra quem acabou de criar um
 * personagem. O print de 0.1.4 deixa isso constrangedor de ver.
 *
 * Aqui a mesma informação vira um poço (`.surface-sunken`, que já diz "aqui vai
 * entrar coisa" sem palavra nenhuma), com o ícone da seção grande e apagado
 * atrás, e a frase na voz do livro em vez da voz de um formulário vazio.
 */
export default function EmptyState({
  icon: Icon,
  children,
  hint,
  className = "",
}: {
  icon: LucideIcon;
  /** A frase principal — escreva na voz do livro, não na de um <input>. */
  children: React.ReactNode;
  /** Segunda linha, o "e agora?" — como sair desse estado. */
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`surface-sunken flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-parchment-300/80 bg-parchment-200/30 px-6 py-10 text-center dark:border-parchment-800/80 dark:bg-parchment-950/40 ${className}`}
    >
      <Icon className="h-9 w-9 text-parchment-400/70 dark:text-parchment-700" aria-hidden />
      <p className="font-display text-base font-bold text-parchment-700 dark:text-parchment-300">{children}</p>
      {hint ? <p className="max-w-sm text-xs text-parchment-600 dark:text-parchment-400">{hint}</p> : null}
    </div>
  );
}
