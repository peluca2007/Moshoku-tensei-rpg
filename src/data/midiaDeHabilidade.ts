/**
 * A ARTE DE CADA HABILIDADE — 0.1.68, ampliado em 0.1.69 e 0.1.74.
 *
 * ## O que é
 *
 * Um mapa de `treeId/abilityId` para um arquivo em `public/arte/`. Quando existe
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
 *
 * ## O caminho é `/arte/<arvore>/<habilidade>.<ext>` — 0.1.74
 *
 * Até a 0.1.73 os ~120 arquivos ficavam soltos na raiz de `public/`, com o nome
 * que tinham quando foram baixados: `300.webp`, `desarmar dn=deus do norte.jpg`,
 * `hazy cross dn.webp`. Conviviam ali com o ícone do PWA, o logo e a capa da
 * home, e todo script que varria a pasta precisava de uma lista de exceções
 * escrita à mão pra saber o que era arte e o que era cromo.
 *
 * Agora o disco espelha o livro: a pasta de uma árvore É o catálogo visual
 * dela, e o nome do arquivo é o `id` da habilidade. O que sobra na raiz de
 * `public/arte/` é caixa de entrada — arquivo recém-chegado, que o
 * `npm run check:midia` cobra e o `npm run casar:midia` arruma.
 *
 * Um arquivo pode ser citado por DUAS chaves (a provocação de Cavalaria e a do
 * Deus da Água são a mesma cena). Nesse caso ele mora na pasta da árvore que o
 * trouxe primeiro, e a segunda chave aponta pra lá — com um comentário
 * dizendo por quê, porque um caminho que não bate com a chave é exatamente o
 * tipo de coisa que alguém "conserta" por engano seis meses depois.
 */

export interface MidiaDeHabilidade {
  /** O caminho em `public/`, com a barra inicial — sempre `/arte/...`. */
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
    src: "/arte/agua/maestria.webm",
    alt: "Água caindo em volume, movendo-se sozinha — a escola inteira em uma cena.",
  },

  // --- Magia de Água -------------------------------------------------------
  "agua/bola-de-agua": {
    src: "/arte/agua/bola-de-agua.webp",
    alt: "Uma esfera de água comprimida girando sobre a palma da mão.",
  },
  /*
   * O `300.webp` NÃO está mais no livro — 0.1.74.
   *
   * Ele nasceu mapeado como a parede de escudos do filme (0.1.68), virou Fluxo
   * Verdadeiro quando alguém finalmente o abriu (0.1.71), e passou por Flecha
   * de Água. Três destinos, nenhum certo: a cena é uma maga conjurando água que
   * dispara do chão, e nenhuma habilidade do livro é exatamente isso.
   *
   * O arquivo saiu de `public/` junto com esta entrada. Se ele voltar um dia,
   * volta pra uma habilidade que a cena descreva — não pra preencher um vazio.
   */
  "agua/escudo-de-agua": {
    src: "/arte/agua/escudo-de-agua.webp",
    alt: "Uma parede curva de água erguida na frente do conjurador.",
  },
  "agua/canhao-de-agua": {
    src: "/arte/agua/canhao-de-agua.webm",
    alt: "Um jato de água comprimida disparado em linha reta.",
  },
  "agua/pilar-de-gelo": {
    src: "/arte/agua/pilar-de-gelo.webm",
    alt: "Uma coluna de gelo irrompendo do chão.",
  },
  "agua/respingos-de-agua": {
    src: "/arte/agua/respingos-de-agua.webp",
    alt: "Água espalhando em todas as direções ao redor do ponto de impacto.",
  },
  "agua/enxurrada": {
    src: "/arte/agua/enxurrada.webp",
    alt: "Uma corrente de água varrendo o terreno à frente.",
  },
  "agua/quebra-de-gelo": {
    src: "/arte/agua/quebra-de-gelo.webp",
    alt: "Uma massa de gelo estilhaçando em cacos afiados.",
  },
  "agua/corte-de-gelo": {
    src: "/arte/agua/corte-de-gelo.webp",
    alt: "Uma lâmina de gelo atravessando o ar.",
  },
  "agua/campo-de-gelo": {
    src: "/arte/agua/campo-de-gelo.webp",
    alt: "Estalactites de gelo brotando do solo por toda uma área.",
  },
  "agua/lanca-de-gelo": {
    src: "/arte/agua/lanca-de-gelo.webp",
    alt: "Uma lança de gelo perfurando e se partindo no impacto.",
  },
  "agua/nevasca": {
    src: "/arte/agua/nevasca.webp",
    alt: "Uma tempestade de neve fechando a visão.",
  },
  "agua/tempestade": {
    src: "/arte/agua/tempestade.webm",
    alt: "Vento e chuva girando numa rajada fechada.",
  },
  "agua/cumulonimbus": {
    src: "/arte/agua/cumulonimbus.webp",
    alt: "Uma nuvem de tempestade carregada, formando-se acima do campo.",
  },
  "agua/relampago": {
    src: "/arte/agua/relampago.webp",
    alt: "Um raio caindo do céu carregado.",
  },
  "agua/zero-absoluto": {
    src: "/arte/agua/zero-absoluto.webp",
    alt: "Tudo ao redor congelando de uma vez, até o ar parar.",
  },

  // --- Deus da Espada ------------------------------------------------------
  "deus-da-espada/maestria": {
    src: "/arte/deus-da-espada/maestria.webm",
    alt: "Um espadachim avançado encadeando cortes rápidos demais para se contar.",
  },
  "deus-da-espada/corte-de-braco": {
    src: "/arte/deus-da-espada/corte-de-braco.webp",
    alt: "Um corte horizontal atravessando a altura do braço de quem vinha atacando.",
  },
  "deus-da-espada/leitura-de-abertura": {
    src: "/arte/deus-da-espada/leitura-de-abertura.gif",
    alt: "O espadachim parado, lendo o movimento do oponente antes do golpe sair.",
  },
  "deus-da-espada/espada-do-silencio": {
    src: "/arte/deus-da-espada/espada-do-silencio.webp",
    alt: "Um golpe desembainhado sem ruído nenhum, a lâmina já de volta na bainha.",
  },
  "deus-da-espada/espada-de-luz": {
    src: "/arte/deus-da-espada/espada-de-luz.webp",
    alt: "Um corte tão rápido que deixa um rastro de luz onde a lâmina passou.",
  },
  "deus-da-espada/espada-emprestada": {
    src: "/arte/deus-da-espada/espada-emprestada.jpg",
    alt: "Duas lâminas desenhadas lado a lado, pra comparar a que se tinha com a que foi emprestada.",
  },

  // --- Deus da Água (corpo) ------------------------------------------------
  "deus-da-agua-corpo/maestria": {
    src: "/arte/deus-da-agua-corpo/maestria.webp",
    alt: "A postura da escola: guarda baixa, peso centrado, esperando o outro vir.",
  },
  /*
   * Fluxo Verdadeiro e Nada Passa ficaram SEM arte aqui — 0.1.74.
   *
   * O `300.webp` é magia de água conjurada, não postura de espadachim: foi pra
   * `agua/flecha-de-agua`. O `nada toca vc.gif` é uma barreira que trava o
   * golpe no ar antes de encostar — isso é o talento Nada Toca Você (Vento,
   * Imperador), e não a defesa por leitura de movimento do Deus da Água.
   *
   * A regra desta casa continua a mesma desde a 0.1.71: sem arte é melhor que
   * com a arte de outra escola.
   */
  "deus-da-agua-corpo/provocar": {
    /*
     * O arquivo de Cavalaria e Escudos, de propósito — 0.1.74.
     *
     * As duas árvores puxam o ódio do inimigo pra cima de si, e a cara de
     * deboche serve às duas igual. O arquivo mora na pasta de quem o trouxe
     * primeiro; duplicá-lo só pra fazer o caminho bater com a chave seria
     * pagar o dobro de download por um arquivo idêntico.
     */
    src: "/arte/cavalaria-e-escudos/provocar-odio.gif",
    alt: "Uma cara de deboche feita pra tirar do sério quem estava mirando outra pessoa.",
  },
  "deus-da-agua-corpo/nome-de-reidar": {
    src: "/arte/deus-da-agua-corpo/nome-de-reidar.jpg",
    alt: "Duas figuras de branco lado a lado, armadas, carregando o mesmo nome.",
  },
  "deus-da-agua-corpo/aparar": {
    src: "/arte/deus-da-agua-corpo/aparar.webp",
    alt: "A lâmina desviando o golpe de lado em vez de bloqueá-lo de frente.",
  },
  "deus-da-agua-corpo/devolver": {
    src: "/arte/deus-da-agua-corpo/devolver.webp",
    alt: "O golpe recebido sendo devolvido no mesmo movimento em que foi aparado.",
  },

  // --- Deus do Norte -------------------------------------------------------
  /*
   * A MAESTRIA do Norte é "Sobreviver é Vencer" — 0.1.74.
   *
   * O gif da briga de corredor (cabo de vassoura na mão, carteira de escola
   * usada como escudo) estava em Túmulo de Aço, que é outra coisa: enterrar
   * alguém sob escombros, com dano contundente e a condição Preso. O que a
   * cena mostra é a frase da maestria inteira — "se dá pra empunhar, você sabe
   * usar" —, e é aqui que ela abre a árvore.
   */
  "deus-do-norte/maestria": {
    src: "/arte/deus-do-norte/maestria.gif",
    alt: "Uma briga de corredor decidida com o que estava por perto: um cabo de vassoura na mão e uma carteira de escola virada de escudo.",
  },
  "deus-do-norte/tres-bainhas": {
    src: "/arte/deus-do-norte/tres-bainhas.gif",
    alt: "Um espadachim sacando uma espada em cada mão e prendendo a terceira entre os dentes.",
  },
  "deus-do-norte/forma-quadrupede": {
    src: "/arte/deus-do-norte/forma-quadrupede.webp",
    alt: "O lutador baixado sobre os quatro apoios, pronto pra saltar do chão.",
  },
  "deus-do-norte/arremesso-de-espada": {
    src: "/arte/deus-do-norte/arremesso-de-espada.webp",
    alt: "A espada deixando a mão em rotação, indo em direção ao alvo distante.",
  },
  "deus-do-norte/bala-de-lagrimas": {
    src: "/arte/deus-do-norte/bala-de-lagrimas.webp",
    alt: "Um close no olho de um lutador com algo alojado nele, e o rosto lavado de lágrima logo depois.",
  },
  "deus-do-norte/desarme": {
    src: "/arte/deus-do-norte/desarme.jpg",
    alt: "A arma saindo da mão do dono e indo parar longe, no traço a nanquim de um mangá.",
  },
  "deus-do-norte/golpe-baixo": {
    src: "/arte/deus-do-norte/golpe-baixo.gif",
    alt: "Um golpe sujo, rápido e por baixo da guarda de quem esperava outra coisa.",
  },
  "deus-do-norte/passo-do-terreno": {
    src: "/arte/deus-do-norte/passo-do-terreno.webp",
    alt: "O lutador usando o que o terreno deu: terra, pedra e o que estava por perto.",
  },
  "deus-do-norte/aura-de-comando-norte": {
    src: "/arte/deus-do-norte/aura-de-comando-norte.webp",
    alt: "Um espadachim parado no meio do salão, e todo mundo em volta já sabendo quem manda ali.",
  },
  "deus-do-norte/cruz-nebulosa": {
    src: "/arte/deus-do-norte/cruz-nebulosa.webp",
    alt: "Dois cortes cruzados tão rápidos que a figura some atrás do borrão.",
  },

  // --- Cavalaria e Escudos -------------------------------------------------
  "cavalaria-e-escudos/maestria": {
    src: "/arte/cavalaria-e-escudos/maestria.webp",
    alt: "O escudeiro plantado à frente da linha, escudo erguido, sem sair do lugar.",
  },
  "cavalaria-e-escudos/escudo-erguido": {
    src: "/arte/cavalaria-e-escudos/escudo-erguido.gif",
    alt: "O escudo subindo a tempo de receber o golpe no lugar de quem estava atrás.",
  },
  "cavalaria-e-escudos/provocar-odio": {
    src: "/arte/cavalaria-e-escudos/provocar-odio.gif",
    alt: "O defensor chamando o inimigo pra si, tirando a atenção do resto do grupo.",
  },
  "cavalaria-e-escudos/provocar-odio-soberano": {
    src: "/arte/cavalaria-e-escudos/provocar-odio-soberano.gif",
    alt: "Uma provocação que puxa todos os inimigos de uma vez pro mesmo ponto.",
  },
  "cavalaria-e-escudos/cavalgada": {
    src: "/arte/cavalaria-e-escudos/cavalgada.webp",
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
    src: "/arte/armas-pesadas/maestria.webp",
    alt: "A luta virando corpo a corpo, sem arma nenhuma, só punho e peso.",
  },
  "armas-pesadas/golpe-circular": {
    src: "/arte/armas-pesadas/golpe-circular.webp",
    alt: "Uma arma enorme girando em círculo e varrendo tudo em volta de uma vez.",
  },
  "armas-pesadas/agarrao": {
    src: "/arte/armas-pesadas/agarrao.webp",
    alt: "As mãos fechando em volta do corpo do alvo e tirando dele a chance de sair.",
  },
  "armas-pesadas/sem-vergonha": {
    src: "/arte/armas-pesadas/sem-vergonha.gif",
    alt: "As mãos enfaixadas em guarda alta, o corpo bambo de propósito pra o golpe não ser lido.",
  },
  "armas-pesadas/punho-de-mineiro": {
    src: "/arte/armas-pesadas/punho-de-mineiro.gif",
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
    src: "/arte/vendaval/maestria.gif",
    alt: "Um avanço instantâneo, o corpo já do outro lado antes de o ar fechar.",
  },
  "vendaval/redemoinho-de-aco": {
    src: "/arte/vendaval/redemoinho-de-aco.gif",
    alt: "O vento seguindo a lâmina em volta do corpo, levantando poeira em círculo.",
  },
  "vendaval/vendaval-de-aco": {
    src: "/arte/vendaval/vendaval-de-aco.gif",
    alt: "Uma tempestade de cortes girando em volta do lutador, sem parar.",
  },

  // --- Arquearia -----------------------------------------------------------
  "arquearia/maestria": {
    src: "/arte/arquearia/maestria.gif",
    alt: "O arqueiro com a corda puxada até a face, escolhendo o momento do disparo.",
  },
  "arquearia/chuva-de-flechas": {
    src: "/arte/arquearia/chuva-de-flechas.gif",
    alt: "Dezenas de flechas caindo juntas sobre a mesma área do campo.",
  },
  "arquearia/armadilha-de-caca": {
    src: "/arte/arquearia/armadilha-de-caca.gif",
    alt: "Uma armadilha disparando no chão e prendendo o que pisou nela.",
  },

  // --- Furtividade e Armadilhas --------------------------------------------
  "furtividade-e-armadilhas/maestria": {
    src: "/arte/furtividade-e-armadilhas/maestria.gif",
    alt: "A lâmina entrando pelas costas de quem nunca soube que havia alguém ali.",
  },
  /*
   * Passo Vazio ganhou o vídeo, e o gif foi pro Vento — 0.1.74.
   *
   * O gif mostra passos silenciosos, que é o talento Pés Leves (Vento,
   * Principiante): "+3m de Deslocamento, e você não deixa pegadas nem faz
   * ruído". Passo Vazio é outra coisa — você SOME do combate, não é alvo
   * válido e ninguém determina sua posição —, e é isso que o vídeo mostra.
   */
  "furtividade-e-armadilhas/passo-vazio": {
    src: "/arte/furtividade-e-armadilhas/passo-vazio.mp4",
    alt: "Alguém se encolhendo atrás do tronco de uma árvore no meio do parque, até ninguém mais saber onde ele está.",
  },
  "furtividade-e-armadilhas/leitura-de-cena": {
    src: "/arte/furtividade-e-armadilhas/leitura-de-cena.mp4",
    alt: "Um homem de terno parado numa sala alheia, lendo os detalhes em volta e já sabendo o que aconteceu ali.",
  },
  "furtividade-e-armadilhas/primeiro-golpe": {
    src: "/arte/furtividade-e-armadilhas/primeiro-golpe.gif",
    alt: "Um salto por trás em cima de quem ainda não tinha agido, e o rosto de quem percebeu tarde demais.",
  },
  "furtividade-e-armadilhas/veneno-refinado": {
    src: "/arte/furtividade-e-armadilhas/veneno-refinado.gif",
    alt: "Uma lâmina fina como agulha, afiada pra injetar e não pra cortar.",
  },
  "furtividade-e-armadilhas/o-dossie": {
    src: "/arte/furtividade-e-armadilhas/o-dossie.jpg",
    alt: "Um meme de três quadros em que alguém lembra, no meio da frase, o nome exato da jogada.",
  },
  "furtividade-e-armadilhas/a-mao-longa": {
    src: "/arte/furtividade-e-armadilhas/a-mao-longa.gif",
    alt: "Uma mão sozinha no escuro, longe de qualquer corpo, abrindo e fechando os dedos.",
  },

  // --- Bardo e Interação ---------------------------------------------------
  "bardo-e-interacao/maestria": {
    src: "/arte/bardo-e-interacao/maestria.gif",
    alt: "O bardo tocando pra plateia, medindo a sala pela reação dela.",
  },
  "bardo-e-interacao/inspiracao": {
    src: "/arte/bardo-e-interacao/inspiracao.webp",
    alt: "Uma dança curta e tímida, feita pra quem está olhando e não pra quem está lutando.",
  },
  /*
   * O VERSUS é do DUELO DE CANÇÕES, e não do Insulto que Fica — 0.1.74.
   *
   * A cena é um cartaz de batalha de rima: dois adversários, um VS no meio, a
   * plateia esperando. Isso é o talento que desafia alguém pra disputa
   * artística. Insulto que Fica é um golpe solto no meio da conversa — não tem
   * palco, não tem convite, e ficou sem arte até aparecer uma que seja dele.
   */
  "bardo-e-interacao/duelo-de-cancoes": {
    src: "/arte/bardo-e-interacao/duelo-de-cancoes.jpg",
    alt: "Dois adversários em cartaz de batalha, com um VERSUS entre eles, antes de a primeira rima sair.",
  },
  "bardo-e-interacao/cantiga-de-marcha": {
    src: "/arte/bardo-e-interacao/cantiga-de-marcha.webp",
    alt: "Três companheiros pequenos atravessando a estrada no mesmo passo, sem nenhum ficar pra trás.",
  },
  "bardo-e-interacao/cantiga-de-ninar": {
    src: "/arte/bardo-e-interacao/cantiga-de-ninar.webp",
    alt: "Um gato balançando um pêndulo na tela de uma televisão velha, embalando quem ficou olhando.",
  },
  "bardo-e-interacao/o-fim-da-cancao": {
    src: "/arte/bardo-e-interacao/o-fim-da-cancao.webp",
    alt: "A última nota da música, e o silêncio pesado que vem logo atrás.",
  },

  // --- Navegação e Liderança -----------------------------------------------
  "navegacao-e-lideranca/maestria": {
    src: "/arte/navegacao-e-lideranca/maestria.webp",
    alt: "O explorador lendo o terreno à frente antes do grupo avançar.",
  },
  "navegacao-e-lideranca/marcha-forcada": {
    src: "/arte/navegacao-e-lideranca/marcha-forcada.gif",
    alt: "O grupo marchando sem parar, cobrindo o dobro do caminho de um dia.",
  },
  "navegacao-e-lideranca/avante": {
    src: "/arte/navegacao-e-lideranca/avante.gif",
    alt: "O comandante à frente, dando a ordem que faz a linha inteira avançar.",
  },
  "navegacao-e-lideranca/emboscada-planejada": {
    src: "/arte/navegacao-e-lideranca/emboscada-planejada.webp",
    alt: "Um time inteiro caindo de uma vez num cerco que já estava montado antes de ele chegar.",
  },

  // --- Invocação -----------------------------------------------------------
  "invocacao/maestria": {
    src: "/arte/invocacao/maestria.gif",
    alt: "Um círculo mágico se desenhando no chão e acendendo por inteiro.",
  },
  "invocacao/evolucao-forma-media": {
    src: "/arte/invocacao/evolucao-forma-media.gif",
    alt: "Um filhote de fogo sumindo dentro de um clarão branco e saindo dele maior, de garras e chifre.",
  },
  /*
   * O id é `evolucao-forma-imortal`, e o nome no livro é "Evolução: Forma
   * Suprema" — o id ficou de uma versão anterior do talento. A arte segue o
   * id, que é o que a chave do mapa usa.
   */
  "invocacao/evolucao-forma-imortal": {
    src: "/arte/invocacao/evolucao-forma-imortal.gif",
    alt: "Três feras já no auge, lado a lado, ainda brilhando da evolução que acabou de terminar.",
  },
  "invocacao/pacto-golem-de-guerra": {
    src: "/arte/invocacao/pacto-golem-de-guerra.png",
    alt: "Um golem de pedra de olhos acesos saindo do escuro, e o rosto apavorado de quem o viu chegar.",
  },
  "invocacao/chamado": {
    src: "/arte/invocacao/chamado.webp",
    alt: "Um círculo aberto às pressas, no meio da luta, sem tempo pro desenho completo.",
  },

  // --- Desintoxicação ------------------------------------------------------
  "desintoxicacao/peconha": {
    src: "/arte/desintoxicacao/peconha.gif",
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
    src: "/arte/desintoxicacao/purificacao.webp",
    alt: "A aflição saindo do corpo do alvo de vez, e não sendo apenas contida.",
  },
  "desintoxicacao/toque-do-fim": {
    src: "/arte/desintoxicacao/toque-do-fim.gif",
    alt: "Um toque de dedos que planta no outro uma aflição que não vai embora.",
  },

  // --- Magia de Fogo -------------------------------------------------------
  "fogo/bola-de-fogo": {
    src: "/arte/fogo/bola-de-fogo.webp",
    alt: "Uma esfera de chamas girando sobre si mesma antes de sair da mão.",
  },
  "fogo/lanca-de-fogo": {
    src: "/arte/fogo/lanca-de-fogo.webp",
    alt: "Um projétil de fogo alongado cruzando o ar em linha reta.",
  },
  "fogo/clarao": {
    src: "/arte/fogo/clarao.webp",
    alt: "Um estouro de luz branca tomando o quadro inteiro por um instante.",
  },
  "fogo/sopro": {
    src: "/arte/fogo/sopro.webp",
    alt: "Uma língua contínua de fogo saindo em cone e varrendo tudo à frente.",
  },
  "fogo/mar-de-chamas": {
    src: "/arte/fogo/mar-de-chamas.webp",
    alt: "Um terreno inteiro em chamas, sem um ponto livre pra pisar.",
  },
  /*
   * Chama do Êxodo — o nome canônico, ver `src/data/trees/fogo.ts`. As duas
   * artes são da MESMA magia (獄炎火弾 / Exodus Flame): a segunda foi pra
   * Explosão, que é o mesmo gesto num rank abaixo.
   */
  "fogo/tempestade-de-fogo": {
    src: "/arte/fogo/tempestade-de-fogo.webp",
    alt: "Uma bola de fogo do tamanho de uma casa se abrindo, com o conjurador saltando de dentro do clarão.",
  },
  "fogo/explosao": {
    src: "/arte/fogo/explosao.webp",
    alt: "O fogo se abrindo em onda a partir do ponto onde a magia tocou o chão.",
  },
  "fogo/flashover": {
    src: "/arte/fogo/flashover.webp",
    alt: "O instante antes: a ponta do cajado carregada, e o ar já ondulando de calor em volta.",
  },
  "fogo/corpo-de-fogo": {
    src: "/arte/fogo/corpo-de-fogo.gif",
    alt: "O conjurador inteiro tomado pelas chamas, sem se queimar.",
  },
  "punho-de-fogo/maestria": {
    src: "/arte/punho-de-fogo/maestria.gif",
    alt: "O punho pegando fogo no instante em que sai em direção ao alvo.",
  },

  // --- Magia de Terra ------------------------------------------------------
  "terra/bala-de-pedra": {
    src: "/arte/terra/bala-de-pedra.webp",
    alt: "Uma pedra comprimida disparada como projétil.",
  },
  "terra/canhao-de-pedra": {
    src: "/arte/terra/canhao-de-pedra.webp",
    alt: "Um bloco de pedra lançado com força de cerco contra o alvo.",
  },
  "terra/fortaleza-rapida": {
    src: "/arte/terra/fortaleza-rapida.webp",
    alt: "Paredes de terra subindo do chão e fechando um abrigo em segundos.",
  },
  "terra/atoleiro": {
    src: "/arte/terra/atoleiro.gif",
    alt: "O chão firme virando lama e prendendo os pés de quem estava em cima.",
  },

  // --- Magia de Vento ------------------------------------------------------
  "vento/maestria": {
    src: "/arte/vento/maestria.gif",
    alt: "O ar se movendo em volta da mão, ainda sem força pra machucar ninguém.",
  },
  "vento/pes-leves": {
    src: "/arte/vento/pes-leves.gif",
    alt: "Passos que atravessam a sala sem fazer barulho nem levantar poeira.",
  },
  "vento/empurrao": {
    src: "/arte/vento/empurrao.webp",
    alt: "Uma rajada compacta de ar batendo de frente e tirando o alvo do lugar.",
  },
  "vento/sopro-de-poeira": {
    src: "/arte/vento/sopro-de-poeira.webp",
    alt: "Uma nuvem de areia levantada do chão, fechando a visão de quem está dentro.",
  },
  "vento/estrondo-sonico": {
    src: "/arte/vento/estrondo-sonico.webp",
    alt: "O ar estourando num anel de choque em volta do ponto de impacto.",
  },
  "vento/asas-emprestadas": {
    src: "/arte/vento/asas-emprestadas.gif",
    alt: "O corpo saindo do chão, sustentado por uma corrente de ar por baixo.",
  },
  /*
   * Veio do Deus da Água — 0.1.74. A cena é uma camada que trava o golpe no ar
   * antes de encostar; o talento do Vento diz exatamente isso, e o do Deus da
   * Água (Nada Passa) é defesa por leitura de movimento, não por barreira.
   */
  "vento/nada-toca-voce": {
    src: "/arte/vento/nada-toca-voce.gif",
    alt: "Uma figura cercada por uma corrente de ar que para tudo a um palmo do corpo.",
  },

  // --- Magia de Barreira ---------------------------------------------------
  "barreira/maestria": {
    src: "/arte/barreira/maestria.gif",
    alt: "Um círculo de luz se fechando no ar e barrando a magia que vinha de fora.",
  },

  // --- Mais corpo a corpo --------------------------------------------------
  "armas-pesadas/investida-devastadora": {
    src: "/arte/armas-pesadas/investida-devastadora.gif",
    alt: "A corrida em linha reta terminando no impacto que derruba quem estava parado.",
  },
  "armas-pesadas/esmagar": {
    src: "/arte/armas-pesadas/esmagar.gif",
    alt: "Um machado enorme descendo com o peso do corpo inteiro atrás, sobre quem já está no chão.",
  },
  "desintoxicacao/estomago-de-ferro": {
    src: "/arte/desintoxicacao/estomago-de-ferro.gif",
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
    src: "/arte/armas-pesadas/arremesso.gif",
    alt: "Um corpo saindo do chão e sendo jogado longe, ainda no ar.",
  },
  "armas-pesadas/cabecada": {
    src: "/arte/armas-pesadas/cabecada.gif",
    alt: "A testa indo pra frente com o rosto fechado de raiva, sem arma nenhuma no quadro.",
  },
  "armas-pesadas/estrangular": {
    src: "/arte/armas-pesadas/estrangular.webp",
    alt: "A mão fechada na garganta de alguém no escuro, sem espaço pra um grito sair.",
  },
  "armas-pesadas/terremoto-pessoal": {
    src: "/arte/armas-pesadas/terremoto-pessoal.webp",
    alt: "Uma onda percorrendo o chão a partir do ponto onde o golpe caiu.",
  },
  "armas-pesadas/maos-grandes": {
    src: "/arte/armas-pesadas/maos-grandes.webp",
    alt: "Uma mão desproporcional, grande demais pro corpo que a carrega.",
  },
  "cavalaria-e-escudos/formacao": {
    src: "/arte/cavalaria-e-escudos/formacao.webp",
    alt: "Seis figuras de pé, ombro a ombro, na mesma linha e sem uma fora do lugar.",
  },
  "furtividade-e-armadilhas/boticario": {
    src: "/arte/furtividade-e-armadilhas/boticario.gif",
    alt: "Uma boticária cobrindo o próprio nariz ao identificar o que tem no ar.",
  },
  "furtividade-e-armadilhas/duelista-de-rua": {
    src: "/arte/furtividade-e-armadilhas/duelista-de-rua.gif",
    alt: "Uma briga de rua de verdade, sem regra e sem plateia, no meio dos carros.",
  },
  "furtividade-e-armadilhas/nunca-preso": {
    src: "/arte/furtividade-e-armadilhas/nunca-preso.gif",
    alt: "As mãos escorregando pra fora das algemas como se elas nunca tivessem fechado.",
  },
  "fogo/fagulha": {
    src: "/arte/fogo/fagulha.gif",
    alt: "Uma faísca única estourando no escuro, sem chama em volta ainda.",
  },
  "fogo/combustao-lenta": {
    src: "/arte/fogo/combustao-lenta.gif",
    alt: "Alguma coisa queimando devagar, do lado de dentro, sem labareda visível.",
  },
  "fogo/sol-menor": {
    src: "/arte/fogo/sol-menor.webp",
    alt: "Uma figura dourada suspensa no céu, brilhando forte demais pra se olhar direto.",
  },
  "agua/lamina-de-gelo": {
    src: "/arte/agua/lamina-de-gelo.webp",
    alt: "Uma lâmina de gelo se formando do nada, fina e transparente na ponta.",
  },
  "agua/nevoa-densa": {
    src: "/arte/agua/nevoa-densa.gif",
    alt: "Uma silhueta sozinha no branco, a poucos metros e já quase invisível.",
  },
  "bardo-e-interacao/silencio-absoluto": {
    src: "/arte/bardo-e-interacao/silencio-absoluto.webp",
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
  src: "/arte/livro/dojo.webp",
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
  src: "/arte/livro/touki-concentrado.webp",
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
  src: "/arte/livro/lamina-de-touki.webp",
  alt: "O fio da arma acendendo com a aura de quem a segura, do cabo até a ponta.",
};

export const ARTE_EXPLOSAO_DE_AURA: MidiaDeHabilidade = {
  src: "/arte/livro/explosao-de-aura.webp",
  alt: "A aura saindo de dentro pra fora de uma vez e empurrando tudo que estava perto.",
};

/** A arte do **Fio da Vida** (Cap. 4, §7) — o corpo a 0 PV, ainda não morto. */
export const ARTE_DO_FIO_DA_VIDA: MidiaDeHabilidade = {
  src: "/arte/livro/fio-da-vida.webp",
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
