import type { RankName } from "@/lib/types";

/**
 * O MENU DE PREPARAÇÕES — Cap. 3, "Pontos de Preparação" (2026-09-27, Etapa 5).
 *
 * O fato livre ("gastando 1 PP, declare um fato sobre o passado") é a melhor
 * ideia do pilar de Utilidade e a maior fonte de briga: a mesa não sabe o que
 * um fato pode até discutir, e o livro precisa de quatro travas pra segurar.
 * Este menu é o meio-termo: as Preparações que a mesa mais pede, com custo e
 * efeito escritos, pra gastar PP sem negociar. O fato livre continua valendo,
 * como "outra coisa, com o Mestre".
 *
 * Toda Preparação obedece ao Domínio da árvore e ao Escopo da Maestria mais
 * alta dela — um Ladino Principiante não tem a chave do palácio. Nenhuma repete
 * o que uma carta ou talento da árvore já vende.
 */
export interface Preparacao {
  id: string;
  nome: string;
  /** PP gastos ao declarar. */
  pp: number;
  /** O patamar da árvore a partir do qual ela entra no menu. */
  desde: RankName;
  efeito: string;
}

export const PREPARACOES: Record<string, Preparacao[]> = {
  "furtividade-e-armadilhas": [
    { id: "fechadura-limada", nome: "Fechadura Limada", pp: 1, desde: "Principiante", efeito: "Uma porta, janela, baú ou cadeado mundano que você vê já está destrancado: você passou por aqui antes." },
    { id: "esconderijo-pronto", nome: "Esconderijo Pronto", pp: 1, desde: "Principiante", efeito: "Se ninguém te viu chegar, você começa o combate Escondido num ponto a até 9 m que já tinha escolhido." },
    { id: "na-mochila", nome: "Na Mochila, por Via das Dúvidas", pp: 1, desde: "Principiante", efeito: "Você tem um item mundano de até 10 PO que faz sentido pra cena: corda, pé de cabra, óleo, apito, um disfarce simples." },
    { id: "armadilha-deixada", nome: "Armadilha Deixada", pp: 1, desde: "Intermediário", efeito: "Um ponto do campo que você escolher já tem uma armadilha: quem entrar testa Agilidade (CD 8 + Agilidade + Bônus de Rank) ou sofre 2d6 e fica Caído. Uma por ambiente." },
    { id: "vigia-fora-do-posto", nome: "Vigia Fora do Posto", pp: 1, desde: "Intermediário", efeito: "Um guarda ou vigia comum não está no posto por 1 minuto: troca de turno, bebida, uma briga do outro lado do pátio." },
    { id: "chave-copiada", nome: "Chave Copiada", pp: 2, desde: "Avançado", efeito: "Você tem a chave — ou a senha — de um lugar dentro do seu Escopo." },
    { id: "passagem-escondida", nome: "Passagem Escondida", pp: 2, desde: "Avançado", efeito: "Existe um caminho escondido (telhado, esgoto, parede falsa) entre dois pontos da cena. Você e até Bônus de Rank aliados o usam sem teste." },
  ],
  "bardo-e-interacao": [
    { id: "rosto-conhecido", nome: "Rosto Conhecido", pp: 1, desde: "Principiante", efeito: "Alguém da cena já te viu se apresentar e gosta de você: Vantagem no primeiro teste social com ele." },
    { id: "boato-de-ontem", nome: "Boato de Ontem", pp: 1, desde: "Principiante", efeito: "Uma pessoa comum do lugar te contou algo verdadeiro ontem: o Mestre te dá uma informação útil sobre a cena." },
    { id: "carta-de-apresentacao", nome: "Carta de Apresentação", pp: 1, desde: "Principiante", efeito: "Você traz a recomendação de alguém respeitado: um guarda, porteiro ou funcionário comum deixa o grupo passar sem teste." },
    { id: "rumor-a-frente", nome: "Rumor à Frente", pp: 1, desde: "Intermediário", efeito: "Um boato sobre o grupo chegou antes de vocês. Escolha como a cena os recebe (temidos, bem-vindos ou ignorados): o primeiro teste social de cada um tem Vantagem ou Desvantagem conforme o boato." },
    { id: "amigo-na-multidao", nome: "Amigo na Multidão", pp: 1, desde: "Intermediário", efeito: "Num combate em lugar com gente, alguém que gosta de você atrapalha um inimigo: ele fica com Deslocamento 0 no primeiro turno dele." },
    { id: "segredo-sabido", nome: "Segredo Sabido", pp: 2, desde: "Avançado", efeito: "Você sabe um segredo menor de uma pessoa da cena (uma dívida, um amor, um medo): Vantagem em todo teste social contra ela até o fim da cena." },
    { id: "palco-montado", nome: "Palco Montado", pp: 2, desde: "Santo", efeito: "Um evento público (festa, julgamento, feira) acontece agora onde vocês estão, por sua causa: há multidão, e por 1 minuto todos olham pra onde você quiser." },
  ],
  "navegacao-e-lideranca": [
    { id: "suprimento-escondido", nome: "Suprimento Escondido", pp: 1, desde: "Principiante", efeito: "Há um esconderijo seu a até 1 hora de caminho: rações e água pra uma semana, e 20 flechas ou virotes." },
    { id: "terreno-visto-antes", nome: "Terreno Visto Antes", pp: 1, desde: "Principiante", efeito: "Você conhecia este lugar: no primeiro turno do combate, o grupo ignora terreno difícil, e cada aliado pode começar atrás de Cobertura Parcial." },
    { id: "montaria-descansada", nome: "Montaria Descansada", pp: 1, desde: "Principiante", efeito: "Montarias descansadas esperam o grupo no próximo posto: a viagem de hoje não conta pra Exaustão." },
    { id: "mensageiro-ja-enviado", nome: "Mensageiro Já Enviado", pp: 1, desde: "Intermediário", efeito: "Uma mensagem sua saiu ontem e chega hoje a um aliado ou autoridade dentro do seu Escopo." },
    { id: "rota-mais-curta", nome: "Rota Mais Curta", pp: 1, desde: "Intermediário", efeito: "A viagem até um destino dentro do seu Escopo leva metade do tempo." },
    { id: "posicao-tomada", nome: "Posição Tomada", pp: 2, desde: "Avançado", efeito: "Antes do combate, um aliado já está posicionado num ponto elevado ou atrás de Cobertura Superior à sua escolha." },
    { id: "hora-certa", nome: "Hora Certa", pp: 2, desde: "Santo", efeito: "O encontro acontece quando você escolheu (de noite, na chuva, na troca da guarda): o grupo rola Iniciativa com Vantagem." },
  ],
};
