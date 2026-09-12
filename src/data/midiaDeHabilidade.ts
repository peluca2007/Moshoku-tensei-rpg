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
    src: "/absolute-zero.webp",
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
  "deus-da-agua-corpo/fluxo-verdadeiro": {
    src: "/300.webp",
    alt: "Uma lâmina azul cortando a água rasa sem levantar respingo, no movimento que a escola inteira persegue.",
  },
  "deus-da-agua-corpo/aparar": {
    src: "/parry da.webp",
    alt: "A lâmina desviando o golpe de lado em vez de bloqueá-lo de frente.",
  },
  "deus-da-agua-corpo/devolver": {
    src: "/reflitir ataque.webp",
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
  "deus-do-norte/aura-de-comando-norte": {
    src: "/67 aura.webp",
    alt: "Um espadachim parado no meio do salão, e todo mundo em volta já sabendo quem manda ali.",
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

  // --- Armas Pesadas -------------------------------------------------------
  /*
   * A maestria é "O CORPO É A ARMA" — 0.1.69.
   *
   * Ela recebe a luta desarmada, e não o gif de arma grande: pôr um machado na
   * maestria que existe justamente pra dizer que você não precisa de um é a
   * contradição mais visível que uma arte podia criar. O gif de arma pesada foi
   * pra uma habilidade da linha [Peso], onde é o que ele ilustra.
   */
  "armas-pesadas/maestria": {
    src: "/luta no soco.webp",
    alt: "A luta virando corpo a corpo, sem arma nenhuma, só punho e peso.",
  },
  "armas-pesadas/golpe-circular": {
    src: "/arma pesada.webp",
    alt: "Uma arma enorme girando em círculo e varrendo tudo em volta de uma vez.",
  },
  "armas-pesadas/agarrao": {
    src: "/agarrao.webp",
    alt: "As mãos fechando em volta do corpo do alvo e tirando dele a chance de sair.",
  },
  "armas-pesadas/sem-vergonha": {
    src: "/lutar bebado.gif",
    alt: "As mãos enfaixadas em guarda alta, o corpo bambo de propósito pra o golpe não ser lido.",
  },
  "armas-pesadas/punho-de-mineiro": {
    src: "/socos rapidos.gif",
    alt: "Punhos fechados vindo de baixo, rápido demais pra se contar quantos foram.",
  },

  // --- Vendaval ------------------------------------------------------------
  /*
   * A maestria de Vendaval é PASSO SEM PESO — 0.1.69.
   *
   * Ela é movimento, não corte, e recebe o arquivo que mostra um avanço. Os dois
   * gifs de corte foram pras duas habilidades que SÃO corte em área.
   */
  "vendaval/maestria": {
    src: "/vendava dash.gif",
    alt: "Um avanço instantâneo, o corpo já do outro lado antes de o ar fechar.",
  },
  "vendaval/redemoinho-de-aco": {
    src: "/vendaval.gif",
    alt: "O vento seguindo a lâmina em volta do corpo, levantando poeira em círculo.",
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
  "bardo-e-interacao/inspiracao": {
    src: "/passos-de-danca.webp",
    alt: "Uma dança curta e tímida, feita pra quem está olhando e não pra quem está lutando.",
  },
  "bardo-e-interacao/insulto-que-fica": {
    src: "/duelo-de-cancoes.jpg",
    alt: "Dois adversários frente a frente com um VERSUS entre eles, antes de a primeira farpa sair.",
  },
  "bardo-e-interacao/o-fim-da-cancao": {
    src: "/o-fim-da-cancao.webp",
    alt: "A última nota da música, e o silêncio pesado que vem logo atrás.",
  },

  // --- Navegação e Liderança -----------------------------------------------
  "navegacao-e-lideranca/maestria": {
    src: "/explorador.webp",
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
    src: "/invocacao-rapida.webp",
    alt: "Um círculo aberto às pressas, no meio da luta, sem tempo pro desenho completo.",
  },

  // --- Desintoxicação ------------------------------------------------------
  "desintoxicacao/peconha": {
    src: "/envenenar alguem.gif",
    alt: "O veneno entrando e se espalhando pelo corpo de quem foi atingido.",
  },
  /*
   * Purificação, e não Selar a Maldição — 0.1.70.
   *
   * As duas são regras opostas neste livro: Purificação REMOVE a aflição;
   * Selar a Maldição é o que se faz quando não se consegue removê-la, e a
   * deixa dormente por um ano. O arquivo diz "curar", e curar é remover.
   */
  "desintoxicacao/purificacao": {
    src: "/curar-maldicao.webp",
    alt: "A aflição saindo do corpo do alvo de vez, e não sendo apenas contida.",
  },
  "desintoxicacao/toque-do-fim": {
    src: "/amaldicoar alguem.gif",
    alt: "Um toque de dedos que planta no outro uma aflição que não vai embora.",
  },

  // --- Magia de Fogo -------------------------------------------------------
  "fogo/bola-de-fogo": {
    src: "/bola de fogo.webp",
    alt: "Uma esfera de chamas girando sobre si mesma antes de sair da mão.",
  },
  "fogo/lanca-de-fogo": {
    src: "/flecha de fogo.webp",
    alt: "Um projétil de fogo alongado cruzando o ar em linha reta.",
  },
  "fogo/clarao": {
    src: "/clarao.webp",
    alt: "Um estouro de luz branca tomando o quadro inteiro por um instante.",
  },
  "fogo/sopro": {
    src: "/Flamethrower.webp",
    alt: "Uma língua contínua de fogo saindo em cone e varrendo tudo à frente.",
  },
  "fogo/mar-de-chamas": {
    src: "/Burning Place.webp",
    alt: "Um terreno inteiro em chamas, sem um ponto livre pra pisar.",
  },
  /*
   * Chama do Êxodo — o nome canônico, ver `src/data/trees/fogo.ts`. As duas
   * artes são da MESMA magia (獄炎火弾 / Exodus Flame): a segunda foi pra
   * Explosão, que é o mesmo gesto num rank abaixo.
   */
  "fogo/tempestade-de-fogo": {
    src: "/Exodus Flame.webp",
    alt: "Uma bola de fogo do tamanho de uma casa se abrindo, com o conjurador saltando de dentro do clarão.",
  },
  "fogo/explosao": {
    src: "/ex flame.webp",
    alt: "O fogo se abrindo em onda a partir do ponto onde a magia tocou o chão.",
  },
  "fogo/flashover": {
    src: "/flame slice.webp",
    alt: "O instante antes: a ponta do cajado carregada, e o ar já ondulando de calor em volta.",
  },
  "fogo/corpo-de-fogo": {
    src: "/Corpo de Fogo.gif",
    alt: "O conjurador inteiro tomado pelas chamas, sem se queimar.",
  },
  "punho-de-fogo/maestria": {
    src: "/punho de fogo.gif",
    alt: "O punho pegando fogo no instante em que sai em direção ao alvo.",
  },

  // --- Magia de Terra ------------------------------------------------------
  "terra/bala-de-pedra": {
    src: "/Rock Bullet.webp",
    alt: "Uma pedra comprimida disparada como projétil.",
  },
  "terra/canhao-de-pedra": {
    src: "/Stone Cannon.webp",
    alt: "Um bloco de pedra lançado com força de cerco contra o alvo.",
  },
  "terra/fortaleza-rapida": {
    src: "/Earth Fortress.webp",
    alt: "Paredes de terra subindo do chão e fechando um abrigo em segundos.",
  },
  "terra/atoleiro": {
    src: "/atolado.gif",
    alt: "O chão firme virando lama e prendendo os pés de quem estava em cima.",
  },

  // --- Magia de Vento ------------------------------------------------------
  "vento/maestria": {
    src: "/Brisa.gif",
    alt: "O ar se movendo em volta da mão, ainda sem força pra machucar ninguém.",
  },
  "vento/empurrao": {
    src: "/Wind Blast.webp",
    alt: "Uma rajada compacta de ar batendo de frente e tirando o alvo do lugar.",
  },
  "vento/sopro-de-poeira": {
    src: "/Sand Cloud.webp",
    alt: "Uma nuvem de areia levantada do chão, fechando a visão de quem está dentro.",
  },
  "vento/estrondo-sonico": {
    src: "/Sonic Blast.webp",
    alt: "O ar estourando num anel de choque em volta do ponto de impacto.",
  },
  "vento/asas-emprestadas": {
    src: "/voar com vento.gif",
    alt: "O corpo saindo do chão, sustentado por uma corrente de ar por baixo.",
  },

  // --- Magia de Barreira ---------------------------------------------------
  "barreira/maestria": {
    src: "/barreira anti magia.gif",
    alt: "Um círculo de luz se fechando no ar e barrando a magia que vinha de fora.",
  },

  // --- Mais corpo a corpo --------------------------------------------------
  "armas-pesadas/investida-devastadora": {
    src: "/Investida Devastadora.gif",
    alt: "A corrida em linha reta terminando no impacto que derruba quem estava parado.",
  },
  "armas-pesadas/esmagar": {
    src: "/arma pesada machado grande.gif",
    alt: "Um machado enorme descendo com o peso do corpo inteiro atrás, sobre quem já está no chão.",
  },
  "deus-do-norte/tumulo-de-aco": {
    src: "/lutar no improviso.gif",
    alt: "A luta feita com o que tinha por perto, sem arma e sem escolher como.",
  },
  "desintoxicacao/estomago-de-ferro": {
    src: "/comer.gif",
    alt: "Alguém comendo sem hesitar o que envenenaria qualquer outro.",
  },
  // --- Casados por nome exato de habilidade (0.1.72) ------------------------
  /*
   * Tudo daqui pra baixo entrou pelo `npm run casar:midia`: o arquivo chegou
   * com o nome IDÊNTICO ao da habilidade, e o script casou os dois. O `alt`
   * continua escrito na mão — ele descreve a CENA, e a cena só se sabe abrindo
   * o arquivo no quadro do meio (`npm run folha --sem-uso`).
   */
  "armas-pesadas/arremesso": {
    src: "/Arremesso.gif",
    alt: "Um corpo saindo do chão e sendo jogado longe, ainda no ar.",
  },
  "armas-pesadas/cabecada": {
    src: "/cabecada.gif",
    alt: "A testa indo pra frente com o rosto fechado de raiva, sem arma nenhuma no quadro.",
  },
  "armas-pesadas/estrangular": {
    src: "/Estrangular.webp",
    alt: "A mão fechada na garganta de alguém no escuro, sem espaço pra um grito sair.",
  },
  "armas-pesadas/terremoto-pessoal": {
    src: "/Terremoto Pessoal.webp",
    alt: "Uma onda percorrendo o chão a partir do ponto onde o golpe caiu.",
  },
  "armas-pesadas/maos-grandes": {
    src: "/mao grandes.webp",
    alt: "Uma mão desproporcional, grande demais pro corpo que a carrega.",
  },
  "cavalaria-e-escudos/formacao": {
    src: "/formacao.webp",
    alt: "Seis figuras de pé, ombro a ombro, na mesma linha e sem uma fora do lugar.",
  },
  "furtividade-e-armadilhas/boticario": {
    src: "/boticario.gif",
    alt: "Uma boticária cobrindo o próprio nariz ao identificar o que tem no ar.",
  },
  "furtividade-e-armadilhas/duelista-de-rua": {
    src: "/Duelista de Rua.gif",
    alt: "Uma briga de rua de verdade, sem regra e sem plateia, no meio dos carros.",
  },
  "furtividade-e-armadilhas/nunca-preso": {
    src: "/Nunca Preso.gif",
    alt: "As mãos escorregando pra fora das algemas como se elas nunca tivessem fechado.",
  },
  "fogo/fagulha": {
    src: "/Fagulha.gif",
    alt: "Uma faísca única estourando no escuro, sem chama em volta ainda.",
  },
  "fogo/combustao-lenta": {
    src: "/combustao-lenta.gif",
    alt: "Alguma coisa queimando devagar, do lado de dentro, sem labareda visível.",
  },
  "fogo/sol-menor": {
    src: "/Sol Menor.webp",
    alt: "Uma figura dourada suspensa no céu, brilhando forte demais pra se olhar direto.",
  },
  "agua/lamina-de-gelo": {
    src: "/lamina-de-gelo.webp",
    alt: "Uma lâmina de gelo se formando do nada, fina e transparente na ponta.",
  },
  "agua/nevoa-densa": {
    src: "/nevoa-densa.gif",
    alt: "Uma silhueta sozinha no branco, a poucos metros e já quase invisível.",
  },
  "bardo-e-interacao/silencio-absoluto": {
    src: "/silencio-absoluto.webp",
    alt: "Uma sala forrada de espuma acústica, onde o som morre antes de voltar.",
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

/**
 * A arte do **Manto de Touki** (Cap. 4, §6) — 0.1.72.
 *
 * "Touki Concentrado" não é uma habilidade com `id` no livro: é uma das formas
 * do Touki, citada na prosa do Deus da Espada. Por isso ela entra como arte de
 * SEÇÃO, e não no mapa — que exige que toda chave exista como habilidade.
 */
export const ARTE_DO_TOUKI: MidiaDeHabilidade = {
  src: "/touki-concentrado.webp",
  alt: "A aura explodindo em volta do corpo, dourada e densa o bastante pra distorcer o que está atrás.",
};

/**
 * As duas técnicas de Touki que se COMPRAM com PT — Cap. 3, §2.
 *
 * Elas vivem numa tabela do capítulo, e não numa árvore: qualquer um com PT
 * usa as duas, venha de que escola vier. Por isso ficam fora do mapa, que só
 * aceita chave que exista como habilidade de árvore.
 */
export const ARTE_LAMINA_DE_TOUKI: MidiaDeHabilidade = {
  src: "/lamina-de-touki.webp",
  alt: "O fio da arma acendendo com a aura de quem a segura, do cabo até a ponta.",
};

export const ARTE_EXPLOSAO_DE_AURA: MidiaDeHabilidade = {
  src: "/explosao-de-aura.webp",
  alt: "A aura saindo de dentro pra fora de uma vez e empurrando tudo que estava perto.",
};

/** A arte do **Fio da Vida** (Cap. 4, §7) — o corpo a 0 PV, ainda não morto. */
export const ARTE_DO_FIO_DA_VIDA: MidiaDeHabilidade = {
  src: "/quase morrendo.webp",
  alt: "Uma personagem caída de lado no chão, ferida e quase sem consciência, ainda respirando.",
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
