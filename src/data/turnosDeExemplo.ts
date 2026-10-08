/**
 * "TRÊS TURNOS COM…" — os exemplos jogados das cinco árvores que a mesa não
 * entende de primeira (Cap. 3, decisão do autor D-2, 2026-10-08).
 *
 * O CLAUDE.md manda: regra difícil paga um exemplo jogado, e prosa sozinha não
 * conta como explicação. Cada exemplo ensina a UMA coisa que a mesa mais erra
 * naquela árvore, e para quando ensinou: não é um combate inteiro, é a mecânica
 * central funcionando, com os números das cartas.
 *
 * Os números vêm das cartas de `src/data/trees/*` no patamar dito. Se uma carta
 * citada mudar, o `check:numeros` (dado perto do nome da carta) avisa.
 */
export interface TurnoDeExemplo {
  rotulo: string;
  texto: string;
}

export interface ExemploJogado {
  treeId: string;
  /** Quem joga, e com o quê: o leitor precisa saber de onde sai cada número. */
  ficha: string;
  /** A regra que o exemplo ensina, numa frase. */
  ensina: string;
  turnos: TurnoDeExemplo[];
  /** O que o leitor deve levar pra mesa. */
  licao: string;
}

export const TURNOS_DE_EXEMPLO: ExemploJogado[] = [
  {
    treeId: "vendaval",
    ficha:
      "Kyra: Deus do Norte e Magia de Vento no Intermediário, Vendaval no 1º patamar, com uma lança (alcance 3 m). Deslocamento 12 m (9 + o Passo sem Peso). Comprou o truque do Vento e a Lâmina de Vento.",
    ensina: "A distância que você anda vira alcance do próximo golpe, e o golpe de longe derruba o equilíbrio.",
    turnos: [
      {
        rotulo: "Turno 1",
        texto:
          "Um mago inimigo recita atrás de dois bandidos, a 20 m. Kyra anda 9 m (1 Ação) e guarda 9 m de Distância Roubada. O golpe seguinte alcança 3 + 9 = 12 m: ela ataca o mago a 11 m, por cima dos bandidos, e acerta. Alvo a mais de 3 m: ele fica Desequilibrado — sem Reação e com metade do Deslocamento até o fim do próximo turno dele. Com a última Ação, Kyra solta a Rajada Curta (o truque do Vento): a Brisa, Maestria do Vento, dá um dado a mais contra alvo Desequilibrado, e o truque rola 2d6 + BC em vez de 1d6 + BC.",
      },
      {
        rotulo: "Turno do mago, e o 2 de Kyra",
        texto:
          "No turno dele, o mago ainda está Desequilibrado: anda só metade e não alcança a coluna onde queria se esconder, e não tem Reação pra nada. No fim desse turno a condição acaba. No turno 2 de Kyra, a Lâmina de Vento (2 Ações) sai sem o dado a mais — a não ser que ela ande e acerte o golpe estendido de novo antes.",
      },
      {
        rotulo: "O que zera",
        texto:
          "A Distância Roubada acaba no fim do turno, usada ou não. Andar depois do golpe não guarda nada pro turno seguinte; só no Intermediário do Vendaval o movimento de Reação passa a ficar guardado.",
      },
    ],
    licao: "Ande antes de bater, nunca depois. O Vendaval briga de longe com arma de perto.",
  },
  {
    treeId: "punho-de-fogo",
    ficha:
      "Dain: Lutador no Intermediário (Bônus +2), Magia de Fogo no Intermediário, Punho do Fogo no 1º patamar. O teto de Quebrantado dos socos dele é o maior Bônus de Rank entre Punho do Fogo e Lutador: 2.",
    ensina: "Primeiro acende, depois quebra: o soco só aplica Quebrantado em quem já está Em Chamas.",
    turnos: [
      {
        rotulo: "Soco 1",
        texto:
          "Ataque desarmado (1 Ação) num ogro, e acerta. ACENDA: o ogro fica Em Chamas. E, por ser o primeiro acerto de Dain nesse alvo no turno, a taxa básica do Lutador já aplica 1 acúmulo de Quebrantado.",
      },
      {
        rotulo: "Soco 2",
        texto:
          "O ogro já está Em Chamas, então QUEBRE: o soco aplica mais 1 Quebrantado. São 2, o teto: o ogro tem −2 na CA e −2 no dano de todos os ataques dele.",
      },
      {
        rotulo: "Centelha",
        texto:
          "Centelha do Iniciante (1 Ação e 1 PT), com Sobrecarga (+2 PM): dado de arma + 1d6 + 2d6 de fogo. O Quebrantado já está no teto e não sobe mais, mas o soco conta como tendo aplicado — é isso que, no Intermediário do Punho, faz o Em Chamas queimar na hora (Atiçar).",
      },
      {
        rotulo: "Turno do ogro",
        texto:
          "No início do turno dele, o Em Chamas cobra 1d8: a Propagação da Magia de Fogo de Dain vale pro fogo do soco. Se o ogro gastar a Ação inteira rolando no chão e apagar, o próximo soco de Dain tem que acender de novo antes de quebrar.",
      },
    ],
    licao: "Abra com soco comum e guarde a Centelha pro alvo que já queima. Contra quem é imune a fogo, o ciclo não começa.",
  },
  {
    treeId: "navegacao-e-lideranca",
    ficha: "Bruna: Tática no Intermediário (2 patamares em Navegação e Liderança), com uma lança e o talento Voz que Corrige. Ordem de Tiro: +2d6, até o dobro do patamar (4d6).",
    ensina: "A ordem não se perde: se ninguém acerta, apontar de novo aumenta o bônus.",
    turnos: [
      {
        rotulo: "Turno 1",
        texto:
          "Sem gastar Ação, Bruna aponta o ogro: ele fica Apontado, e o primeiro ataque que o acertar, de qualquer um do grupo, leva +2d6. O mago erra a Lança de Fogo. A guerreira também erra.",
      },
      {
        rotulo: "Turno 2",
        texto:
          "Ninguém acertou até o turno de Bruna, então ela aponta o mesmo ogro de novo: o bônus sobe pra 3d6. Ela mesma ataca com a lança (grupo Hastes) e, contra o alvo que ela apontou, soma o Bônus de Rank dela (+2) no acerto e no dano. Erra por um.",
      },
      {
        rotulo: "Turno 3",
        texto:
          "A guerreira ataca o ogro e erra; Bruna gasta a Reação na Voz que Corrige e a guerreira repete a rolagem. Acerta: dano da espada +3d6, e a Ordem se gasta. Se ninguém tivesse acertado, o próximo aponte iria a 4d6, o teto.",
      },
    ],
    licao: "Aponte sempre o mesmo alvo até alguém acertar; o bônus só cresce enquanto o grupo erra.",
  },
  {
    treeId: "invocacao",
    ficha:
      "Lia: Espíritos e Feras no 1º patamar (Bônus +1), com o Pacto do Cão de Caça. O cão tem PV 20 (10 × o Bônus de Rank dela + 1), CA 11, e morde com 2d6 usando o BC de Lia.",
    ensina: "O invocado age com 1 Ação dele; as Ações de Lia viram ordens específicas ou mordidas a mais (o Comando).",
    turnos: [
      {
        rotulo: "Antes da luta",
        texto:
          "Dez minutos de círculo e 3 PM, fora de combate: o cão chega e fica 1 hora. Na luta, sem círculo pronto, só o Chamado de Emergência (3 Ações e 7 PM) traria alguém, e com metade dos PV e do dano.",
      },
      {
        rotulo: "Turno 1",
        texto:
          "Ordem geral, de graça: \"ataque o mais próximo\". Mas Lia quer o bandido do arco no chão: ordem específica (1 Ação dela) — o cão usa a Ação dele pra morder e Derrubar em vez de causar dano. Acerta: o bandido fica Caído, e ataques corpo a corpo contra ele têm Vantagem.",
      },
      {
        rotulo: "Ainda no turno 1",
        texto:
          "Comando: Lia cede mais 1 Ação dela e o cão age outra vez, na hora — morde o bandido Caído, com Vantagem. O Comando aceita até 2 Ações por turno; Lia guarda a terceira e anda pra longe do corpo a corpo.",
      },
      {
        rotulo: "Turno 2",
        texto:
          "O cão leva 19 de dano e fica com 1 PV. Se cair, só volta depois de um Descanso Longo. Lia dá a ordem geral \"siga-me\" (grátis) e os dois recuam: um invocado vale mais vivo na próxima luta do que morto nesta.",
      },
    ],
    licao: "Conte as Ações: cada ordem específica e cada Ação do Comando sai das suas três. O invocado não é um segundo personagem; é um aliado que obedece — e é por ele que você luta.",
  },
  {
    treeId: "teorica",
    ficha: "Ruth: Magia Teórica no Intermediário. Conhece as cartas Muralha de Mana (3 PM, parede de 40 PV) e Selo de Rejeição (2 PM).",
    ensina: "Erguer segura corpo, Selar segura magia, e só uma das duas fica de pé por vez.",
    turnos: [
      {
        rotulo: "Turno 1",
        texto:
          "Quatro goblins correm pelo corredor. Ruth conjura a Muralha de Mana (2 Ações): uma parede de 40 PV nasce a 18 m dela e fecha o corredor. Os goblins batem na parede; a terceira Ação de Ruth é andar.",
      },
      {
        rotulo: "Turno 2",
        texto:
          "Atrás da parede, um xamã goblin começa a recitar uma Bola de Fogo — e magia atravessa Erguer. Ruth precisa de um Selo, que barra magia de rank Intermediário ou abaixo. Mas a parede é a sustentação dela: erguer o Selo de Rejeição derruba a Muralha.",
      },
      {
        rotulo: "A escolha",
        texto:
          "Ruth deixa a parede de pé (ela segura quatro corpos) e corre pra trás de uma coluna, onde a Bola de Fogo não a vê. A parede que também barra magia existe: é Erguer + Selar na mesma fórmula, a Frase Composta do Avançado.",
      },
    ],
    licao: "Antes de erguer, pergunte o que vem: corpo ou magia. A Teórica escolhe o problema que resolve, e o Avançado é o que deixa resolver os dois.",
  },
];

export function exemploDaArvore(treeId: string): ExemploJogado | undefined {
  return TURNOS_DE_EXEMPLO.find((e) => e.treeId === treeId);
}
