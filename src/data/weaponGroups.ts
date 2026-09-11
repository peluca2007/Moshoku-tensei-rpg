/**
 * Cap. 1, §4: os GRUPOS DE ARMA — proficiência por tipo, não por dado (0.1.52).
 *
 * ## O que havia antes, e por que estava errado
 *
 * O livro dividia armas em "simples" (Dado Base até d6) e "marciais" (d8+), que
 * é vocabulário emprestado de outro sistema e, pior, uma régua que mede a coisa
 * errada. Ela produzia estes três absurdos:
 *
 * - A **Rapieira** (d6) era livre pra todo mundo, e a **Espada Longa** (d8) não.
 *   O mesmo personagem que não sabe segurar uma espada longa esgrimia rapieira
 *   sem penalidade nenhuma, porque o dado dela é menor.
 * - A **Adaga** (d4) e o **Espadão** (d10) estavam em categorias opostas, mas o
 *   **Arco Curto** (d6) e a **Espada Curta** (d6) estavam na mesma — como se
 *   puxar corda e trocar golpe fossem o mesmo ofício.
 * - Não existia "proficiente em espada mas não em adaga". A categoria não
 *   existia: proficiência de arma era uma faixa de dano, não um treino.
 *
 * ## O que existe agora
 *
 * Oito grupos por **tipo de arma**, mais os **Escudos** à parte (escudo não é
 * arma — é o único grupo que altera CA em vez de ataque). Você é proficiente
 * num GRUPO, e isso vale pra toda arma dele, do d4 ao d12.
 *
 * A penalidade não mudou, porque já estava certa: arma sem proficiência é
 * **Desvantagem no teste de acerto, dano normal** — a Escada de Dados nunca
 * reduz. Escudo sem proficiência dá **+1 CA em vez de +2**: erguer uma tábua na
 * frente do corpo ajuda um pouco mesmo sem treino, só não é defender.
 */

/** Os oito grupos de arma, mais Escudos. A ordem é a que a ficha e o livro imprimem. */
export const WEAPON_GROUP_IDS = [
  "espadas",
  "laminas-curtas",
  "machados-e-marretas",
  "hastes",
  "arcos-e-bestas",
  "arremesso",
  "flexiveis",
  "desarmado-e-improvisado",
  "escudos",
] as const;

export type WeaponGroupId = (typeof WEAPON_GROUP_IDS)[number];

export interface WeaponGroup {
  id: WeaponGroupId;
  name: string;
  /** Uma linha sobre o que o grupo ensina — o que o treino dele realmente é. */
  description: string;
  /** Armas de exemplo, pra mesa reconhecer o grupo sem decorar a lista. */
  examples: string[];
}

export const WEAPON_GROUPS: WeaponGroup[] = [
  {
    id: "espadas",
    name: "Espadas",
    description:
      "A lâmina longa de gume, de uma ou duas mãos. O treino é de guarda, distância e fio — quem sabe espada longa sabe espadão, e é a mesma escola.",
    examples: ["Espada Curta", "Rapieira", "Espada Longa", "Espadão / Montante", "Katana"],
  },
  {
    id: "laminas-curtas",
    name: "Lâminas Curtas",
    description:
      "Punho fechado no cabo, alcance de um braço. Não é espada pequena: é outro ofício — corpo colado, ângulo escondido, e a mão que não segura a lâmina importa tanto quanto a que segura.",
    examples: ["Adaga", "Punhal", "Faca de Arremesso", "Kukri"],
  },
  {
    id: "machados-e-marretas",
    name: "Machados e Marretas",
    description:
      "Peso na ponta. O golpe não corta por fio, corta por inércia — e quem erra com um machado não recupera a guarda no mesmo tempo de quem erra com uma espada.",
    examples: ["Machado de Batalha", "Machadinha", "Martelo de Guerra", "Maça", "Foice de Guerra"],
  },
  {
    id: "hastes",
    name: "Hastes",
    description:
      "Alcance antes de tudo. Mantém o inimigo onde você quer e cobra caro de quem tenta entrar. É também o grupo do cajado de combate — o bastão do mago que aprendeu a usá-lo como arma.",
    examples: ["Lança", "Alabarda", "Cajado de Combate", "Naginata"],
  },
  {
    id: "arcos-e-bestas",
    name: "Arcos e Bestas",
    description:
      "Tiro tenso, a corda armazenando o golpe. Puxar arco é força de costas treinada; besta troca essa força por tempo de recarga. O treino de mira é o mesmo, e por isso andam juntos.",
    examples: ["Arco Curto", "Arco Longo", "Besta", "Besta Leve"],
  },
  {
    id: "arremesso",
    name: "Arremesso",
    description:
      "O que sai da mão e não volta. Peso, giro e leitura de vento — nada disso se aprende puxando corda, e é por isso que não é o mesmo grupo dos arcos.",
    examples: ["Funda", "Dardo", "Azagaia", "Machadinha de Arremesso"],
  },
  {
    id: "flexiveis",
    name: "Flexíveis",
    description:
      "Arma que não é rígida: chicote, corrente, foice presa a corda. A mais difícil de todas, porque a arma continua se movendo depois que você parou — e acerta quem a empunha com a mesma facilidade.",
    examples: ["Chicote", "Corrente de Combate", "Kusarigama"],
  },
  {
    id: "desarmado-e-improvisado",
    name: "Desarmado e Improvisado",
    description:
      "O punho, o cotovelo, o joelho — e a cadeira, a garrafa, a pedra do chão. Todo personagem nasce proficiente aqui: ninguém precisa de escola pra dar um soco ou quebrar um banco na cabeça de alguém.",
    examples: ["Ataque Desarmado", "Objeto Improvisado"],
  },
  {
    id: "escudos",
    name: "Escudos",
    description:
      "O único grupo que não ataca. Escudo não é armadura que se veste, é arma que se empunha: sem treino ele ocupa a mão e atrapalha; com treino ele é a diferença entre levar o golpe e não levar.",
    examples: ["Escudo", "Escudo Leve", "Pavês"],
  },
];

/** Busca rápida por id — a ficha e o livro consultam por id a toda hora. */
export const WEAPON_GROUP_BY_ID = new Map(WEAPON_GROUPS.map((g) => [g.id, g]));

export function weaponGroupName(id: WeaponGroupId): string {
  return WEAPON_GROUP_BY_ID.get(id)?.name ?? id;
}

/**
 * O ÚNICO grupo que todo personagem tem, antes de qualquer árvore.
 *
 * Quebrar uma cadeira na cabeça de alguém é instinto, não ofício — e por isso
 * ele é de graça. Mas ver `IMPROVISADO_NAO_ESCALA`: de graça não quer dizer bom.
 *
 * ## O que mudou em 0.1.62
 *
 * Até aqui, todo personagem ganhava este piso **mais um grupo à escolha**, e
 * cada árvore do Corpo dava mais um livre por cima. A mesa julgou frouxo, e
 * estava: com a regra geral de "1 PA compra três proficiências" valendo pra
 * grupo de arma, um personagem comprava três famílias inteiras de arma pelo
 * preço de metade de uma perícia.
 *
 * Agora é uma regra de uma linha: **você empunha o que estudou**. Grupo vem da
 * árvore aberta, ou custa `PA_POR_GRUPO`.
 */
export const GRUPO_BASE: WeaponGroupId = "desarmado-e-improvisado";

/**
 * Improvisado é de graça, e **trava em d6** — Cap. 3, §1 (0.1.62).
 *
 * A arma improvisada não sobe na Escada de Dados: um Imperador quebra a mesma
 * cadeira que um Principiante quebra, e ela faz o mesmo estrago. Sem esta trava,
 * o piso gratuito viraria a melhor arma do jogo no rank alto — qualquer um
 * pegaria um banco e rolaria 3d10 sem ter estudado nada.
 *
 * **O Deus do Norte é a única exceção, e é a identidade dele.** A árvore diz, em
 * letra, que não existe arma proibida pra ele — *"se dá pra empunhar, você é
 * proficiente"*. Aqui isso deixa de ser prosa e vira número: só ele escala
 * improvisado como arma de verdade.
 */
export const IMPROVISADO_NAO_ESCALA = true;

/** A árvore que escapa da trava acima. */
export const ARVORE_QUE_ESCALA_IMPROVISADO = "deus-do-norte";

/**
 * O que custa comprar um grupo de arma com PA — Cap. 1, §4 (0.1.62).
 *
 * ## Por que 2, e por que fora do pacote de proficiências
 *
 * A regra geral do livro é "1 PA compra **três** proficiências", e ela vale pra
 * língua, ferramenta, instrumento e veículo — coisas estreitas, que removem uma
 * penalidade de uma situação. Grupo de arma tinha entrado nesse mesmo pacote, e
 * o resultado era comprar três famílias inteiras de arma por 1 PA.
 *
 * Ele não pertence ali. Uma perícia (1 PA = 2) dá Vantagem quando se encaixa;
 * um grupo de arma remove Desvantagem em **toda uma família**, pra sempre, em
 * **todo combate**. Dois PA o põem acima da perícia, que é onde ele estava o
 * tempo todo sem que o preço dissesse isso.
 */
export const PA_POR_GRUPO = 2;

/**
 * Os grupos que se pode COMPRAR com PA — todos menos o piso, que já vem.
 *
 * Escudos entra: desde 0.1.62 não existe mais escolha gratuita, e o que fazia
 * dele um caso especial era justamente ser gratuito. Pagando 2 PA como
 * qualquer outro, não há razão pra proibir quem quer aprender a se defender.
 */
export const GRUPOS_COMPRAVEIS: WeaponGroupId[] = WEAPON_GROUPS.filter(
  (g) => g.id !== GRUPO_BASE
).map((g) => g.id);

/**
 * De que grupo é cada arma do catálogo.
 *
 * A chave é o NOME exato do preset (`WEAPON_PRESETS`) ou do item de loja. Armas
 * de campanha escritas à mão no inventário não estão aqui — e a ficha trata
 * "não sei de que grupo é" como **proficiente**, nunca como penalidade: o
 * Mestre é quem decide o grupo de um loot que o livro não previu, e um sistema
 * que dá Desvantagem em silêncio por não reconhecer um nome é pior que um que
 * não dá nada. Ver `grupoDaArma`.
 */
const GRUPO_POR_ARMA: Record<string, WeaponGroupId> = {
  // Espadas
  "Espada Curta": "espadas",
  Rapieira: "espadas",
  "Espada Longa": "espadas",
  "Espadão / Montante": "espadas",
  Katana: "espadas",
  "Lâmina Balanceada": "espadas",
  "Espada-Fantasma": "espadas",
  "Espada Corta-Aço": "espadas",

  // Lâminas Curtas
  "Adaga / Punhal": "laminas-curtas",
  "Adaga de Prata": "laminas-curtas",
  "Faca de Arremesso": "laminas-curtas",

  // Machados e Marretas
  Machadinha: "machados-e-marretas",
  "Machado de Batalha": "machados-e-marretas",
  "Martelo de Guerra": "machados-e-marretas",
  "Foice de Guerra": "machados-e-marretas",
  "Machado Sanguessedento": "machados-e-marretas",

  // Hastes
  "Alabarda / Lança": "hastes",
  "Cajado de Combate": "hastes",
  "Lança Persecutora": "hastes",

  // Arcos e Bestas
  "Arco Curto": "arcos-e-bestas",
  "Arco Longo": "arcos-e-bestas",
  Besta: "arcos-e-bestas",

  // Arremesso
  "Funda / Dardo": "arremesso",
  Azagaia: "arremesso",

  // Flexíveis
  Chicote: "flexiveis",
  "Corrente de Combate": "flexiveis",

  // Desarmado e Improvisado
  "Objeto Improvisado": "desarmado-e-improvisado",
  "Ataque Desarmado": "desarmado-e-improvisado",

  // Escudos
  Escudo: "escudos",
};

/**
 * O grupo de uma arma pelo nome, ou `null` quando o catálogo não a conhece.
 *
 * `null` significa "o Mestre decide", e quem consome trata como proficiente —
 * ver a nota em `GRUPO_POR_ARMA`. A comparação ignora caixa e espaço de sobra
 * porque o campo de inventário é texto livre digitado à mão.
 */
export function grupoDaArma(nome: string): WeaponGroupId | null {
  const limpo = nome.trim();
  if (GRUPO_POR_ARMA[limpo]) return GRUPO_POR_ARMA[limpo];
  const alvo = limpo.toLocaleLowerCase("pt-BR");
  for (const [chave, grupo] of Object.entries(GRUPO_POR_ARMA)) {
    if (chave.toLocaleLowerCase("pt-BR") === alvo) return grupo;
  }
  return null;
}
