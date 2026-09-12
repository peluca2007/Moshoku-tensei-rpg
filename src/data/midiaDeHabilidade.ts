/**
 * A ARTE DE CADA HABILIDADE — 0.1.68, ampliado em 0.1.69.
 *
 * ## O que é
 *
 * Um mapa de `treeId/abilityId` para um arquivo em `public/`. Quando existe
 * arte, a habilidade a mostra — no livro, no catálogo de árvores e no detalhe
 * da ficha. Quando não existe, nada muda: a ausência é o caso comum e não pode
 * custar layout nenhum.
 *
 * ## Por que um mapa, e não um campo na habilidade
 *
 * Porque arte **não é regra**. `src/data/trees/*.ts` é a fonte de verdade do
 * sistema — o que o `check:livro`, o `check:texto` e o simulador leem. Um campo
 * `imagem` ali misturaria "o que esta magia faz" com "que arquivo ilustra ela",
 * e as duas coisas mudam por motivos completamente diferentes: a regra muda num
 * balanceamento, a arte muda quando alguém acha um arquivo melhor.
 *
 * Separado, este arquivo pode crescer até as 601 habilidades sem tocar numa
 * linha de regra.
 *
 * ## Vídeo, GIF e imagem
 *
 * Os três convivem. O tipo é decidido pela extensão, e não por um campo: `.webm`
 * vira `<video>` com `autoplay muted loop playsinline`, o resto vira `<img>`.
 * Um `.gif` é imagem pro navegador e anima sozinho.
 *
 * ## Nome de arquivo é ASCII — 0.1.69
 *
 * Todo arquivo citado aqui tem nome só com caracteres ASCII. Espaço tudo bem
 * (o navegador escapa sozinho), mas `ç`, `ã`, `Ó` e `◆` num caminho de URL
 * falham CALADOS em alguns servidores estáticos: a imagem some, ninguém vê
 * erro, e a página fica exatamente como era antes de existir arte. Os arquivos
 * que vieram com acento foram renomeados em disco na 0.1.69.
 */

export interface MidiaDeHabilidade {
  /** O caminho em `public/`, com a barra inicial. */
  src: string;
  /**
   * O que a arte mostra, pra quem não a vê.
   *
   * Não é o nome da magia — esse já está ao lado, e repeti-lo faz o leitor de
   * tela dizer a mesma coisa duas vezes. É a CENA.
   */
  alt: string;
}

/**
 * A chave é `treeId/abilityId`.
 *
 * As duas partes juntas porque `id` de habilidade só é único dentro da árvore:
 * há mais de uma "Investida" no livro, em árvores diferentes.
 *
 * O `abilityId` também aceita id de TALENTO (0.1.69) — dentro de uma árvore os
 * dois namespaces não colidem, e há talento que merece arte tanto quanto magia
 * (Marcha Forçada é o exemplo). Um teste trava a ausência de colisão.
 */
export const MIDIA_DE_HABILIDADE: Record<string, MidiaDeHabilidade> = {
  /*
   * A MAESTRIA de uma árvore usa a chave `treeId/maestria` — 0.1.68.
   *
   * A maestria não tem `id` próprio no livro (ela é um campo do patamar, não
   * uma entrada comprável), então a chave é fixa. Ela é o melhor lugar pra arte
   * que representa a ESCOLA inteira em vez de uma magia específica: é o que o
   * leitor vê primeiro ao abrir a árvore.
   */
  "agua/maestria": {
    src: "/waterfall.webm",
    alt: "Água caindo em volume, movendo-se sozinha — a escola inteira em uma cena.",
  },

  // --- Magia de Água -------------------------------------------------------
  "agua/bola-de-agua": {
    src: "/Bola-de-agua.webp",
    alt: "Uma esfera de água comprimida girando sobre a palma da mão.",
  },
  "agua/escudo-de-agua": {
    src: "/escudo-de-agua.webp",
    alt: "Uma parede curva de água erguida na frente do conjurador.",
  },
  "agua/canhao-de-agua": {
    src: "/water cannion.webm",
    alt: "Um jato de água comprimida disparado em linha reta.",
  },
  "agua/pilar-de-gelo": {
    src: "/ice pilar.webm",
    alt: "Uma coluna de gelo irrompendo do chão.",
  },
  "agua/respingos-de-agua": {
    src: "/water splash.webp",
    alt: "Água espalhando em todas as direções ao redor do ponto de impacto.",
  },
  "agua/enxurrada": {
    src: "/Flood-Flush.webp",
    alt: "Uma corrente de água varrendo o terreno à frente.",
  },
  "agua/quebra-de-gelo": {
    src: "/ice-smash.webp",
    alt: "Uma massa de gelo estilhaçando em cacos afiados.",
  },
  "agua/corte-de-gelo": {
    src: "/Icicle-Edge.webp",
    alt: "Uma lâmina de gelo atravessando o ar.",
  },
  "agua/campo-de-gelo": {
    src: "/Icicle-Field.webp",
    alt: "Estalactites de gelo brotando do solo por toda uma área.",
  },
  "agua/lanca-de-gelo": {
    src: "/Icicle-Break.webp",
    alt: "Uma lança de gelo perfurando e se partindo no impacto.",
  },
  "agua/nevasca": {
    src: "/Blizzard-Storm.webp",
    alt: "Uma tempestade de neve fechando a visão.",
  },
  "agua/tempestade": {
    src: "/squall.webm",
    alt: "Vento e chuva girando numa rajada fechada.",
  },
  "agua/cumulonimbus": {
    src: "/Cumulonimbus.webp",
    alt: "Uma nuvem de tempestade carregada, formando-se acima do campo.",
  },
  "agua/relampago": {
    src: "/Lightning.webp",
    alt: "Um raio caindo do céu carregado.",
  },
  "agua/zero-absoluto": {
    src: "/absolute-zero.gif",
    alt: "Tudo ao redor congelando de uma vez, até o ar parar.",
  },

  // --- Deus da Espada ------------------------------------------------------
  "deus-da-espada/maestria": {
    src: "/avancado de.webm",
    alt: "Um espadachim avançado encadeando cortes rápidos demais para se contar.",
  },
  "deus-da-espada/corte-de-braco": {
    src: "/Arm Chop de.webp",
    alt: "Um corte horizontal atravessando a altura do braço de quem vinha atacando.",
  },
  "deus-da-espada/leitura-de-abertura": {
    src: "/Prever o Golpe.gif",
    alt: "O espadachim parado, lendo o movimento do oponente antes do golpe sair.",
  },
  "deus-da-espada/espada-do-silencio": {
    src: "/Longsword of Silence de.webp",
    alt: "Um golpe desembainhado sem ruído nenhum, a lâmina já de volta na bainha.",
  },
  "deus-da-espada/espada-de-luz": {
    src: "/Longsword-of-Light-Ghislaine-using-Longsword-of-Light-in-the-Anime.webp",
    alt: "Um corte tão rápido que deixa um rastro de luz onde a lâmina passou.",
  },

  // --- Deus da Água (corpo) ------------------------------------------------
  "deus-da-agua-corpo/maestria": {
    src: "/deus da agua caracteristicas da.webp",
    alt: "A postura da escola: guarda baixa, peso centrado, esperando o outro vir.",
  },
  "deus-da-agua-corpo/aparar": {
    src: "/parry da.gif",
    alt: "A lâmina desviando o golpe de lado em vez de bloqueá-lo de frente.",
  },
  "deus-da-agua-corpo/devolver": {
    src: "/reflitir ataque.gif",
    alt: "O golpe recebido sendo devolvido no mesmo movimento em que foi aparado.",
  },
  "deus-da-agua-corpo/nada-passa": {
    src: "/nada toca vc.gif",
    alt: "Golpes chegando de todos os lados e nenhum encostando em quem defende.",
  },

  // --- Deus do Norte -------------------------------------------------------
  "deus-do-norte/forma-quadrupede": {
    src: "/Four Legged Form dn.webp",
    alt: "O lutador baixado sobre os quatro apoios, pronto pra saltar do chão.",
  },
  "deus-do-norte/arremesso-de-espada": {
    src: "/sword-throwing dn.webp",
    alt: "A espada deixando a mão em rotação, indo em direção ao alvo distante.",
  },
  "deus-do-norte/golpe-baixo": {
    src: "/Golpe Baixo.gif",
    alt: "Um golpe sujo, rápido e por baixo da guarda de quem esperava outra coisa.",
  },
  "deus-do-norte/passo-do-terreno": {
    src: "/improviso dn.webp",
    alt: "O lutador usando o que o terreno deu: terra, pedra e o que estava por perto.",
  },
  "deus-do-norte/cruz-nebulosa": {
    src: "/hazy cross dn.webp",
    alt: "Dois cortes cruzados tão rápidos que a figura some atrás do borrão.",
  },

  // --- Cavalaria e Escudos -------------------------------------------------
  "cavalaria-e-escudos/maestria": {
    src: "/escudeiro.webp",
    alt: "O escudeiro plantado à frente da linha, escudo erguido, sem sair do lugar.",
  },
  "cavalaria-e-escudos/escudo-erguido": {
    src: "/proteger escudo.gif",
    alt: "O escudo subindo a tempo de receber o golpe no lugar de quem estava atrás.",
  },
  "cavalaria-e-escudos/provocar-odio": {
    src: "/provocar odio.gif",
    alt: "O defensor chamando o inimigo pra si, tirando a atenção do resto do grupo.",
  },
  "cavalaria-e-escudos/provocar-odio-soberano": {
    src: "/provocar-odio-soberano.gif",
    alt: "Uma provocação que puxa todos os inimigos de uma vez pro mesmo ponto.",
  },
  "cavalaria-e-escudos/cavalgada": {
    src: "/em cima do cavalo.webp",
    alt: "A carga a cavalo, lança baixada, ganhando velocidade sobre o terreno aberto.",
  },
  "cavalaria-e-escudos/a-linha": {
    src: "/300.webp",
    alt: "Escudos encostados um no outro formando uma parede contínua de metal.",
  },

  // --- Armas Pesadas -------------------------------------------------------
  "armas-pesadas/maestria": {
    src: "/arma pesada.gif",
    alt: "Uma arma enorme sendo girada como se não pesasse nada nas mãos certas.",
  },
  "armas-pesadas/agarrao": {
    src: "/luta no soco.gif",
    alt: "A luta virando corpo a corpo, sem arma, no agarrão e no soco.",
  },

  // --- Vendaval ------------------------------------------------------------
  "vendaval/maestria": {
    src: "/vendaval.gif",
    alt: "O vento seguindo a lâmina, levantando poeira em volta de quem ataca.",
  },
  "vendaval/vendaval-de-aco": {
    src: "/vendaval 2.gif",
    alt: "Uma tempestade de cortes girando em volta do lutador, sem parar.",
  },

  // --- Arquearia -----------------------------------------------------------
  "arquearia/maestria": {
    src: "/arqueiro.gif",
    alt: "O arqueiro com a corda puxada até a face, escolhendo o momento do disparo.",
  },
  "arquearia/chuva-de-flechas": {
    src: "/chuva de fleshas.gif",
    alt: "Dezenas de flechas caindo juntas sobre a mesma área do campo.",
  },
  "arquearia/armadilha-de-caca": {
    src: "/armadilha-de-caca.gif",
    alt: "Uma armadilha disparando no chão e prendendo o que pisou nela.",
  },

  // --- Furtividade e Armadilhas --------------------------------------------
  "furtividade-e-armadilhas/maestria": {
    src: "/ataque furtivo.gif",
    alt: "A lâmina entrando pelas costas de quem nunca soube que havia alguém ali.",
  },
  "furtividade-e-armadilhas/passo-vazio": {
    src: "/pes-leves.gif",
    alt: "Passos que atravessam a sala sem fazer barulho nem levantar poeira.",
  },

  // --- Bardo e Interação ---------------------------------------------------
  "bardo-e-interacao/maestria": {
    src: "/bardo.gif",
    alt: "O bardo tocando pra plateia, medindo a sala pela reação dela.",
  },
  "bardo-e-interacao/o-fim-da-cancao": {
    src: "/o-fim-da-cancao.webp",
    alt: "A última nota da música, e o silêncio pesado que vem logo atrás.",
  },

  // --- Navegação e Liderança -----------------------------------------------
  "navegacao-e-lideranca/maestria": {
    src: "/explorador.gif",
    alt: "O explorador lendo o terreno à frente antes do grupo avançar.",
  },
  "navegacao-e-lideranca/marcha-forcada": {
    src: "/marcha-forcada.gif",
    alt: "O grupo marchando sem parar, cobrindo o dobro do caminho de um dia.",
  },
  "navegacao-e-lideranca/avante": {
    src: "/comandante.gif",
    alt: "O comandante à frente, dando a ordem que faz a linha inteira avançar.",
  },

  // --- Invocação -----------------------------------------------------------
  "invocacao/maestria": {
    src: "/invocacao.gif",
    alt: "Um círculo mágico se desenhando no chão e acendendo por inteiro.",
  },
  "invocacao/chamado": {
    src: "/invocacao-rapida.gif",
    alt: "Um círculo aberto às pressas, no meio da luta, sem tempo pro desenho completo.",
  },

  // --- Desintoxicação ------------------------------------------------------
  "desintoxicacao/peconha": {
    src: "/envenenar alguem.gif",
    alt: "O veneno entrando e se espalhando pelo corpo de quem foi atingido.",
  },
  "desintoxicacao/selar-a-maldicao": {
    src: "/curar-maldicao.gif",
    alt: "A maldição sendo congelada no corpo do alvo, parada mas ainda ali.",
  },
  "desintoxicacao/toque-do-fim": {
    src: "/amaldicoar alguem.gif",
    alt: "Um toque de dedos que planta no outro uma aflição que não vai embora.",
  },

  // --- Magia elemental -----------------------------------------------------
  "vento/maestria": {
    src: "/Brisa.gif",
    alt: "O ar se movendo em volta da mão, ainda sem força pra machucar ninguém.",
  },
  "terra/atoleiro": {
    src: "/atolado.gif",
    alt: "O chão firme virando lama e prendendo os pés de quem estava em cima.",
  },
  "fogo/corpo-de-fogo": {
    src: "/Corpo de Fogo.gif",
    alt: "O conjurador inteiro tomado pelas chamas, sem se queimar.",
  },
  "punho-de-fogo/maestria": {
    src: "/punho de fogo.gif",
    alt: "O punho pegando fogo no instante em que sai em direção ao alvo.",
  },
};

/**
 * A arte que ilustra o **Sistema de Dojo/Mestre** — 0.1.69.
 *
 * Fica fora do mapa de propósito: ela não pertence a habilidade nenhuma, e o
 * teste que garante que toda chave do mapa existe no livro a rejeitaria com
 * razão. Quem desenha a seção passa isto direto no `midia` do
 * `ArteDaHabilidade`.
 */
export const ARTE_DO_DOJO: MidiaDeHabilidade = {
  src: "/dojo deus da espada.webp",
  alt: "O pátio de um dojo de espada, com o mestre observando o treino dos alunos.",
};

/** A arte desta habilidade (ou talento), se houver. */
export function midiaDaHabilidade(treeId: string, abilityId: string): MidiaDeHabilidade | undefined {
  return MIDIA_DE_HABILIDADE[`${treeId}/${abilityId}`];
}

/** A arte que representa a ESCOLA inteira, mostrada na Maestria de 1º patamar. */
export function midiaDaMaestria(treeId: string): MidiaDeHabilidade | undefined {
  return MIDIA_DE_HABILIDADE[`${treeId}/maestria`];
}

/** `.webm` e `.mp4` são vídeo; o resto (incluindo `.gif`) é imagem. */
export function ehVideo(src: string): boolean {
  return /\.(webm|mp4)$/i.test(src);
}
