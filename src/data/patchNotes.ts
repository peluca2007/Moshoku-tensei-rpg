export interface PatchNoteSection {
  heading: string;
  items: string[];
}

export interface PatchNote {
  version: string;
  date: string;
  title: string;
  sections: PatchNoteSection[];
}

/**
 * Histórico de mudanças de game design do sistema, mais recente primeiro.
 * Toda atualização relevante de regras/balanceamento entra aqui.
 */
export const PATCH_NOTES: PatchNote[] = [
  {
    version: "0.1.9",
    date: "2026-09-04",
    title: "Sem Arestas",
    sections: [
      {
        heading: "A faixa de convite estava mascarando a coisa errada",
        items: [
          "0.1.8 mascarou a IMAGEM e depois pôs um véu radial por cima dela. A arte sumia nas pontas como devia — mas o véu era um retângulo opaco, e era ELE que desenhava as duas linhas horizontais duras que faziam a seção parecer um bloco colado na página. Mascarar a arte não adianta enquanto a caixa de cor continuar lá.",
          "Agora arte e véu vivem dentro do mesmo elemento mascarado: os dois desaparecem juntos. No centro a faixa tem imagem e escurecimento suficientes pra segurar o texto; nas quatro bordas ela simplesmente deixa de existir. Os filetes dourados saíram junto — filete marca justamente a aresta que esta seção não quer ter.",
          "Para isso, `.faixa-arte` foi partida em duas: `.arte-ambiente` carrega só o tratamento de cor e `.faixa-arte` acrescenta a máscara de baixo. As duas andavam juntas numa classe só, e isso obrigava toda arte de ambiente a morrer do mesmo jeito — o que serve pro cabeçalho de rota, onde a borda inferior é aresta de card real, e não serve pra faixa que atravessa a página inteira.",
        ],
      },
      {
        heading: "A logo, de novo",
        items: [
          "Mais 30% sobre 0.1.8: h-48 sm:h-72 na landing, h-14 na barra, h-20 no rodapé.",
          "A faixa de convite ganhou respiro vertical (py-24 sm:py-32), que é o espaço de que o degradê precisa pra acontecer — máscara suave em caixa baixa vira máscara dura.",
        ],
      },
    ],
  },
  {
    version: "0.1.8",
    date: "2026-09-04",
    title: "Seis Portas",
    sections: [
      {
        heading: "A vitrine da landing dobrou",
        items: [
          "Eram três destinos — árvores, loja, livro — e metade do site continuava invisível pra quem chega: a ficha, o roster e o montador de encontros (que é onde o Mestre passa o tempo dele) só apareciam como texto numa lista de bullets embaixo. Agora são seis, cada um com a arte da própria rota, na ordem de uso: descobrir o sistema → fazer a ficha → equipar → guardar o grupo → o lado do Mestre → a referência.",
          "/criar fica de fora de propósito: ela já é o botão grande do topo, e repetir o CTA principal dentro da vitrine enfraquece os dois.",
          "Os cards de recursos caíram de quatro para três junto: \"Feito pra mesa de verdade\" descrevia o tracker e o montador de encontros, que agora têm card próprio — dizer a mesma coisa duas vezes na mesma página só ensina o leitor a pular a segunda.",
        ],
      },
      {
        heading: "A faixa de convite deixou de ser um recorte colado",
        items: [
          "Ela tinha duas camadas — a arte e um véu chapado — e o resultado era corte reto em cima e embaixo, laterais que simplesmente terminavam, e a tocha do grupo brilhando por trás da linha de texto.",
          "Agora são quatro, e nenhuma é enfeite: a arte tratada, uma máscara radial que faz a imagem morrer no pergaminho em vez de encostar numa borda, um véu em degradê (denso no meio onde o texto está, aberto nas pontas onde a arte pode aparecer) e os dois filetes dourados, a mesma aresta de luz que todo card elevado do site tem.",
        ],
      },
      {
        heading: "A logo cresceu, e a segunda faxina",
        items: [
          "A marca ficou 40% maior na landing, na barra e no rodapé. Ela tinha ficado tímida quando perdeu o cartucho — sem a moldura, o mesmo tamanho lê menor do que lia antes.",
          "public/logo-dark.svg apagado: era a variante de tema escuro do logo antigo, e desde que a marca virou logo-real-alfa.png nenhum componente o importava. O script que o gerava virou scripts/gerar-favicon.mjs e agora produz só o que ainda tem uso.",
          "logo-real.png (1,3 MB) saiu de public/ para assets-fonte/. Ele é matéria-prima de script, não asset de site: em public/ ficava servível em /logo-real.png — baixável por qualquer visitante e concorrendo por engano com a versão boa.",
        ],
      },
      {
        heading: "O favicon ainda é da marca antiga",
        items: [
          "src/app/icon.svg continua derivado de public/logo.svg — o letreiro velho. É o único lugar do site que ainda mostra a marca anterior, e sobrevive por razão técnica: favicon precisa ser vetorial pra ler num quadrado de 16px, e a marca nova é um PNG. Trocar exige rasterizar e recortar. Fica anotado como pendência declarada, não como esquecimento.",
        ],
      },
    ],
  },
  {
    version: "0.1.7",
    date: "2026-09-04",
    title: "A Ordem do Livro",
    sections: [
      {
        heading: "O Capítulo 2 estava na ordem errada",
        items: [
          "O capítulo rodava 1, 2, 6, 7, 3, 4, 5: \"Interromper uma Conjuração\" e \"Regras Gerais\" ficavam entre a §2 e a §3. A §6 abre dizendo \"uma magia de rank Santo custa 4 Ações\" — número que só a §3 estabelece, e que o leitor ainda não tinha visto.",
          "O sumário listava 1→7 corretamente, então clicar em \"3. Tempo de Conjuração\" fazia o leitor SUBIR na página. As duas seções foram para o fim, na ordem que o sumário sempre prometeu.",
        ],
      },
      {
        heading: "O Capítulo 4 numerava 8 seções; o sumário, 9",
        items: [
          "\"Reações e Ações Defensivas\" — a tabela com Ataque de Oportunidade, Esquivar, Defender e Bloquear com Escudo, que é regra central de combate — estava enterrada como subtítulo dentro da seção de Exaustão, Fome, Sede e Clima, entre \"Removendo Exaustão\" e \"Fome e Sede\".",
          "Virou seção própria, logo depois da Economia de Ações. As seções seguintes foram renumeradas de 5 a 9, e as 25 remissões cruzadas do livro inteiro (\"Cap. 4, §7\" e companhia, espalhadas por árvores, raças, loja, bestiário e antecedentes) foram corrigidas junto.",
        ],
      },
      {
        heading: "O Capítulo 3 apresentava três pilares e dava seção a dois",
        items: [
          "A abertura nomeia Magia, Corpo e Utilidade; o capítulo tinha seção de sistemas compartilhados para Corpo e Utilidade, e nada para a Magia. A razão era boa (os sistemas compartilhados da Magia são o Capítulo 2 inteiro), mas não estava escrita em lugar nenhum — quem rolava procurando concluía que faltava uma parte.",
          "Agora existe a seção-ponte, curta de propósito: ela aponta pro Capítulo 2, não repete ele em versão resumida. Este livro não tem duas fontes de nada.",
        ],
      },
      {
        heading: "O sumário virou teste",
        items: [
          "Nada disso quebrava tsc, eslint ou vitest: eram âncoras válidas apontando pro lugar errado. Um livro é uma ORDEM, e ordem precisa de teste.",
          "O `npm run check:livro` agora falha se um item do sumário não tem âncora na página, ou se aparece na página numa ordem diferente da do sumário. Conferido invertendo duas seções de propósito: ele pega os dois casos.",
        ],
      },
      {
        heading: "A logo perdeu o fundo",
        items: [
          "Em 0.1.6 ela ia ao ar dentro de um cartucho escuro com mix-blend-mode: screen — o preto sumia contra o cartucho, mas o cartucho continuava sendo um retângulo em volta da marca, que é justamente o que uma logo não pode ter.",
          "A correção foi no ARQUIVO: scripts/logo-sem-fundo.mjs decodifica o PNG com o zlib do próprio Node (zero dependências), calcula alfa = max(R,G,B) e des-premultiplica a cor. Sem esse segundo passo, cada pixel de borda carrega o preto que o compôs e a logo ganha um halo sujo sobre pergaminho. 15,5% do quadro é letreiro; o resto é transparente de verdade.",
          "No tema claro ela passa por brightness(.3) sepia(.5) saturate(2): o letreiro é creme e ouro, desenhado pra viver em fundo escuro, e sobre pergaminho ele simplesmente sumia.",
        ],
      },
    ],
  },
  {
    version: "0.1.6",
    date: "2026-09-04",
    title: "O Letreiro e a Faxina",
    sections: [
      {
        heading: "A logo nova, e o fim do \"RPG\" avulso",
        items: [
          "A marca virou /logo-real.png, e isso muda estrutura, não só arte: o \"RPG\" agora está DENTRO do letreiro. Até 0.1.5 ele era um texto ao lado da imagem em três lugares (nav, landing, rodapé), porque o logo da franquia não trazia a palavra que este projeto acrescenta ao nome. Trazendo, o texto virou repetição — e saiu dos três.",
          "Ela chegou como PNG sem canal alfa, com fundo preto sólido. Solta sobre o pergaminho seria um retângulo preto. A saída não foi gerar um arquivo por tema (que é o que logo.svg + logo-dark.svg precisavam ser): é `mix-blend-mode: screen` sobre um cartucho escuro. Screen com preto devolve o fundo intacto e com creme clareia — a mesma conta nos dois temas, sem editor de imagem.",
        ],
      },
      {
        heading: "As quatro rotas que faltavam ganharam arte",
        items: [
          "/ficha (a ficha na mesa, com vela, pena e tinteiro), /personagens (o salão da guilda), /iniciativa (uma escaramuça em floresta) e /criar (a mão desenhando um círculo mágico). Com elas, todas as sete rotas têm identidade visual própria.",
          "A landing ganhou uma faixa de convite antes do rodapé: a página terminava numa fileira de links de texto e nunca voltava a pedir a única coisa que quer de quem está lendo.",
          "O Superd Renegado do bestiário ganhou retrato próprio e parou de emprestar o da raça Superd.",
        ],
      },
      {
        heading: "O mapa parou de parecer de outro projeto",
        items: [
          "Os três pilares eram sky-600, rose-600 e emerald-600 — três primárias saturadas de biblioteca num site inteiro de pergaminho, vinho e ouro. O mapa é a página mais bonita do projeto e era a única que parecia ter vindo de outro. Viraram teal fundo, vinho e oliva: água, sangue e mata. A distinção entre os ramos continua igual; o que mudou foi a temperatura.",
          "O galho em que você investiu agora ACENDE: linha em opacidade cheia com brilho da cor do Rank, contra os 25% do que nunca foi tocado. Antes, uma árvore com quatro patamares comprados e uma que você nunca abriu tinham o mesmo peso na tela.",
        ],
      },
      {
        heading: "Gastar passou a ter instante",
        items: [
          "Comprar item e gastar PA eram instantâneos: o \"150 PO\" virava \"85 PO\" entre um quadro e outro, e nada dizia que você acabou de gastar 65. Agora a bolsa e o contador de PA contam até o novo valor — duração fixa de 420 ms, e não passo fixo, porque ir de 0 a 6 e de 0 a 3.400 tem que levar o mesmo tempo.",
          "O card do item comprado pulsa uma vez em dourado. Tudo respeita prefers-reduced-motion.",
        ],
      },
      {
        heading: "Faxina no repositório",
        items: [
          "Um git worktree inteiro do Claude estava commitado em .claude/worktrees/ — cópia completa do projeto, package-lock.json incluído, 30 arquivos rastreados. Saiu do índice e do disco; os markdowns do livro que moravam lá foram preservados fora do repositório.",
          "Os cinco SVGs do template do create-next-app (next, vercel, window, file, globe) nunca foram referenciados por uma linha de código. Removidos.",
          "O rodapé passou a citar o repositório no GitHub e o Discord do autor — o Discord como handle copiável, não como link: um convite discord.gg expira e viraria 404 no rodapé de todas as páginas.",
        ],
      },
      {
        heading: "Dois defeitos que o tsc aprovou e a tela reprovou",
        items: [
          "A página inteira quebrou ao abrir: CopyChip recebia o ícone como `icon: ComponentType`, e React recusa uma FUNÇÃO atravessando de Server pra Client Component. tsc e eslint passaram os dois. Agora o ícone entra como children, já construído.",
          "A logo subiu por cima do selo \"projeto de fã\" na landing: o componente era inline-flex, entrava no fluxo de linha do container centralizado, e mx-auto não centraliza caixa inline nenhuma.",
        ],
      },
    ],
  },
  {
    version: "0.1.5",
    date: "2026-09-04",
    title: "Três Níveis de Papel",
    sections: [
      {
        heading: "O site tinha UM card, repetido 23 vezes",
        items: [
          "A string do card (`rounded-2xl border border-parchment-300 bg-parchment-100/70 p-4 shadow-sm…`) estava copiada literalmente 23 vezes no JSX, e o botão vinho outras 23. Em ~11 mil linhas havia 36 `shadow-sm` e exatamente 1 `group-hover`: nada tinha relevo, nada reagia ao mouse, e uma tela cheia lia como uma lista de retângulos igualmente importantes.",
          "Agora existem três níveis de superfície, e o nível é gramática: `.surface-raised` anuncia (cabeçalho de rota, hero, total — ganha o fio dourado na aresta de cima), `.surface` contém (o card comum), `.surface-sunken` espera (campo, poço, estado vazio, com sombra pra dentro).",
          "As três compõem com as utilitárias de cor que já estavam no JSX — elas declaram profundidade e textura, não background-color. Por isso deu pra acrescentar a classe num card existente sem reescrever a linha dele.",
        ],
      },
      {
        heading: "Cada rota tem uma cara",
        items: [
          "/ficha, /loja, /encontros e /iniciativa eram estruturalmente a mesma página: h1 + ícone + grade. O novo PageHeader põe a arte de ambiente da rota atrás do título — a taverna da guilda na Loja, o covil de teia nos Encontros, o grimório à luz de vela no Livro, o céu estrelado nas Árvores.",
          "A arte é dessaturada, puxada pro âmbar da paleta e morre num degradê antes da borda de baixo: as artes chegaram em teal, azul e cinza, e nenhuma delas, crua, convive com texto por cima.",
          "Rota sem arte não fica esperando arte — o cabeçalho cai num degradê vinho→pergaminho e é o mesmo objeto.",
        ],
      },
      {
        heading: "O mapa de progressão ganhou céu",
        items: [
          "O tabuleiro era o objeto mais bonito do site rodando sobre um retângulo bege chapado. Agora tem campo estelar de fundo e vinheta radial fechando as quatro pontas.",
          "A mesma imagem serve aos dois temas com tratamentos opostos: no escuro ela aparece de verdade (passada pelo sépia, senão o azul frio briga com a paleta); no claro entra em `multiply` a 13% e vira mancha de tinta — uma carta celeste desenhada no pergaminho.",
          "O painel lateral era um parágrafo de instrução numa coluna de 340×700 vazia. Virou a legenda das três cores do mapa: a informação que faltava e o conteúdo que faltava, no mesmo lugar.",
        ],
      },
      {
        heading: "O livro virou livro",
        items: [
          "Capitular na abertura de cinco capítulos, e filigrana sob cada título de capítulo.",
          "A filigrana chegou como PNG de traço preto sobre fundo branco. Ela é convertida em ouro por um filtro SVG que joga a luminância no canal alfa: o fundo branco vira transparente e o traço vira ouro, nos dois temas, sem passar por editor de imagem.",
          "Filete duplo com losango entre seções e no rodapé, em CSS puro — filigrana toda seção viraria barulho.",
        ],
      },
      {
        heading: "O bestiário e a loja",
        items: [
          "As 6 criaturas prontas do Apêndice G ganharam retrato (`CriaturaPronta.icon`, em public/criaturas/<id>), com `check:livro` conferindo que cada arquivo existe. O Superd Renegado reaproveita o retrato da raça Superd — a criatura do Apêndice G é um membro renegado dessa mesma raça.",
          "Rank da loja passou a ter cor por letra (F→S, do frio ao quente, na mesma direção da escala de Rank das árvores). Vinte e um cards de arma com a mesma faixa vinho não separavam uma adaga de 6 PO de um artefato de Rank S.",
          "Item bloqueado não ganha mais um botão cinza do tamanho do card: a grade tinha 21 barras cinzas mortas, e elas eram o elemento mais pesado da tela. Bloqueio virou linha de estado; botão é só pra quem pode agir, e quem tem Rank mas não tem PO vê quanto falta.",
          "A sétima categoria (Equipamento de Aventura) finalmente tem ícone. A arte estava no repositório desde 0.1.4, solta na raiz de public/ com espaço no nome, a um diretório de distância da tabela que a procurava.",
        ],
      },
      {
        heading: "Estados vazios, rodapé e barra fixa",
        items: [
          "\"Nenhuma perícia ainda.\", \"Nenhuma magia ou talento comprado ainda.\", \"Nenhum item ainda.\" — três frases cinzas em sequência eram a primeira impressão de quem acabava de criar um personagem. Viraram poços com o ícone da seção grande e apagado, e a frase na voz do livro: o grimório está em branco, a mochila está vazia, o covil está vazio.",
          "Nenhuma rota do site terminava — elas paravam, e depois vinha pergaminho vazio até o fim do scroll. Agora há rodapé com navegação, versão e o disclaimer de fã, em todas as páginas.",
          "O disclaimer saiu da landing, onde ocupava o espaço logo abaixo do CTA. No lugar dele entrou a vitrine: as três coisas que o site tem e que uma lista de bullets não vende (o mapa, a loja, o livro), cada uma com a arte do próprio destino.",
          "A barra de navegação é fixa e translúcida com blur — a textura do body é `fixed`, e uma barra opaca cortaria a folha em duas. A rota atual ganhou filete dourado: antes o ativo era só negrito+vinho, a mesma diferença que o hover dá.",
          "Os números-herói da ficha (PV/PM/PT/PP/CA/Iniciativa) saíram de text-lg na sans de formulário pra display, pretos e tabulares.",
        ],
      },
      {
        heading: "Três defeitos que só o print pegou",
        items: [
          "O ornamento saía com uma moldura dourada: a região padrão de um filtro SVG é 10% maior que o elemento, e lá fora o pixel é preto transparente — que, pela conta do filtro, vira alfa 1, ou seja, ouro chapado na margem inteira.",
          "A linha \"19 sub-árvores\" da vitrine era invisível: elemento posicionado pinta acima de irmão não posicionado mesmo vindo antes no DOM, e a margem negativa enfiava o texto por baixo da imagem.",
          "A textura de fibra estava forte demais — exatamente o sintoma que o comentário dela no CSS descreve como erro. Caiu de 0,22 pra 0,10 no tema escuro.",
          "E um falso positivo que vale anotar: o print de 390px mostrava a página estourando pra fora da tela. O Chrome no Windows trava a largura mínima de janela em ~500px — o print era um recorte de uma janela de 500, e o layout em 500 está correto. `--window-size` abaixo disso mente.",
        ],
      },
    ],
  },
  {
    version: "0.1.4",
    date: "2026-09-03",
    title: "As Doze Raças Ganharam Cara",
    sections: [
      {
        heading: "Escolher raça deixou de ser uma lista suspensa",
        items: [
          "As 12 raças ganharam retrato (`Race.icon`, em public/racas/<id>). O arquivo se chama como o id da raça, então não existe tabela de mapeamento em lugar nenhum — mesma regra dos brasões de árvore e dos ícones da loja.",
          "O passo de raça da Criação Guiada era um <select> de doze linhas de texto: doze nomes que só quem já leu o Cap. 1 sabe diferenciar. Virou uma grade de retratos, com a raça escolhida marcada. Escolher raça é a primeira decisão de identidade da ficha, e agora a diferença entre um Superd e um Migurd chega antes da leitura.",
          "O retrato aparece também no card de Passivas (ficha e criação), no Cap. 1 do livro, no roster de /personagens e no instante em que a Roleta do Destino para — que é o momento em que o personagem nasce, e até aqui ele nascia como um nome.",
          "O card de /personagens era só nome e dois botões. O retrato da raça ocupa exatamente o lugar da foto de perfil que o roster ainda vai ganhar, e é o que dá pra mostrar hoje sem pedir upload nenhum.",
        ],
      },
      {
        heading: "As imagens pararam de ser servidas cruas",
        items: [
          "Os retratos chegaram com até 1,28 MB por arquivo. O componente de medalhão servia tudo sem otimização (uma decisão que fazia sentido quando só existiam SVGs e PNGs pequenos) — mandar um megabyte pro navegador desenhar um selo de 44px, não.",
          "Agora o `unoptimized` vale só pra SVG, que o otimizador do Next não processa mesmo. O resto passa pelo otimizador: o maior retrato caiu de 1,28 MB para 1,7 KB no tamanho em que é exibido.",
          "Terceira vez na mesma semana que um arquivo mentiu sobre o formato: duas raças chegaram como .png sendo WebP por dentro (antes disso, um brasão de árvore era PNG com extensão .svg e a textura de pergaminho era AVIF com extensão .png). Todos renomeados pro que realmente são.",
          "check:livro agora confere retrato de raça junto com brasão de árvore, ícone de loja e a arte fixa da interface, e imprime quantas das 12 raças têm retrato.",
        ],
      },
    ],
  },
  {
    version: "0.1.3",
    date: "2026-09-03",
    title: "O Site Ganhou Cara",
    sections: [
      {
        heading: "O mapa de árvores cabia numa moeda",
        items: [
          "O zoom inicial de /arvores era a constante 0,35 — sem relação nenhuma com o tamanho do visor nem do canvas, que cresce junto com o número de árvores. Num monitor comum o grafo inteiro virava uma bolinha no meio de um retângulo vazio de 800px: os brasões eram pontos de 3px e a primeira impressão da tela mais importante do site era a de uma página que não carregou.",
          "Agora o enquadramento é calculado do CONTEÚDO — diâmetro do grafo mais o raio de um nó da borda — contra o tamanho real do visor. O mapa nasce preenchendo a tela e cada árvore mostra o brasão dela legível.",
        ],
      },
      {
        heading: "A loja repetia a mesma frase doze vezes",
        items: [
          "As doze armas mundanas nascem de um mesmo molde e compartilham uma descrição só. A loja imprimia uma cópia dela em cada card — doze parágrafos idênticos empilhados, e as armas que TÊM algo próprio a dizer (Adaga de Prata, Lâmina Balanceada) afogadas no meio.",
          "A tela agora agrupa por categoria e detecta sozinha o texto que dois ou mais itens do grupo repetem: ele sobe pro cabeçalho, uma vez, e some dos cards. A regra é genérica — pega as doze armas de hoje e pega sozinha o próximo bloco que nascer do mesmo molde.",
          "Cada grupo ganhou a arte da categoria e a contagem de itens. Com o filtro em \"Todos\", os 85 itens deixaram de ser uma lista corrida sem divisão.",
        ],
      },
      {
        heading: "Pergaminho, paisagem e o logo consertado",
        items: [
          "O site inteiro passou a ter fundo de pergaminho de verdade: 60% no tema claro (onde a textura é o assunto) e 20% no escuro (onde ela só precisa quebrar o marrom chapado). As dez páginas pintavam um fundo sólido por cima do corpo, então nenhuma textura teria aparecido — isso saiu junto.",
          "A landing ganhou a paisagem do Mundo de Seis Faces atrás do herói, dissolvendo na textura por máscara em vez de terminar numa cor sólida, que deixava um degrau visível.",
          "O logo parou de dizer o nome duas vezes: ele É o título agora, com o h1 virando texto para leitor de tela e busca, e o \"RPG\" — a parte que este projeto acrescenta ao nome da franquia — ganhando linha própria.",
          "CORREÇÃO DO LOGO NO TEMA ESCURO: o preto do arquivo estava em dois lugares, e só um tinha sido trocado. Os quatro degradês das letras grandes terminam num <stop> sem cor — que é preto por padrão em SVG —, então \"Mus\", \"Te\" e \"u\" sumiam no fundo escuro, que é o tema padrão do site. Passava em toda verificação automática e só aparecia num print. O gerador agora exige os dois padrões e falha explicando se o logo mudar de estrutura.",
          "check:livro passou a conferir que TODA arte referenciada por caminho existe em disco: os 19 brasões, os ícones de categoria da loja, os dois logos, a paisagem e a textura. Caminho é texto, e nenhum tipo protege texto.",
        ],
      },
    ],
  },
  {
    version: "0.1.2",
    date: "2026-09-03",
    title: "O Que a Criatura Faz",
    sections: [
      {
        heading: "A ficha de monstro deixou de ser sete números soltos",
        items: [
          "A criatura de /encontros era PV, CA, ataque, dano por turno, CD, quantidade e uma linha de texto livre. Isso basta pra dizer se um encontro é justo e não basta pra NADA do que acontece na mesa: o Mestre sabia que a Wyvern mergulha, e tinha que inventar na hora quanto a mordida dela tira.",
          "Agora a criatura tem AÇÕES. Cada uma com nome, custo em Ações, fórmula de dano (\"4d8+5\", do jeito que se escreve numa ficha de monstro), alcance, se é em área, e se resolve contra a CA ou pedindo teste de resistência. Mais uma anotação livre pra condição, veneno ou gatilho.",
          "Criatura COM ações é resolvida com rolagem de verdade na simulação: três Ações por rodada, gastas no melhor dano médio por Ação — o mesmo critério que o motor já usava pro personagem —, com 1 natural errando, 20 natural rolando os dados de novo, área pegando todo mundo de pé e resistência cortando o dano pela metade.",
          "Criatura SEM ações continua no orçamento fixo do Apêndice G. Ele não foi aposentado: é ele que preserva a calibragem publicada da tabela e os números do playtest, e uma criatura montada em trinta segundos antes da sessão continua sendo uma criatura válida.",
          "As seis criaturas prontas do Apêndice G ganharam as ações delas, e o livro passou a imprimi-las. As fórmulas foram escritas pra que o turno de três Ações entregue o Dano por Turno do patamar: um teste trava essa igualdade com 15% de folga, então ligar as ações não invalidou nada do que já estava calibrado.",
        ],
      },
      {
        heading: "O site sugere ENQUANTO você digita o dano",
        items: [
          "A simulação responde depois do fato: monte tudo, clique, espere 300 batalhas. Isso fecha um encontro e não ajuda a escrever um monstro. O conselho novo é a outra ponta — sem rolagem nenhuma, ele recalcula a cada tecla.",
          "E ele é CONCRETO, porque é ancorado em duas coisas que o site já tem: o molde do Apêndice G e as fichas de verdade do grupo selecionado. Não \"está alto demais\", e sim \"Mordida tira 62 em média; Lyn (50 PV) cai num acerto só\" ou \"gastando as três Ações no melhor que ela tem, sai ~7,5 por rodada; o molde de 3º pede ~35 — suba pra 5d4\".",
          "Os avisos cobrem: o orçamento do turno contra o molde; quem do grupo morre num golpe (e quem PODE morrer na rolagem alta, que é outra conversa); a chance de acerto dela contra a CA real do grupo, nas duas pontas; o dano de uma ação em área medido contra a reserva de PV do grupo inteiro; e a CD fora do molde, mas só quando alguma ação cobra teste.",
          "Cada aviso traz, quando cabe, uma correção pronta com um botão — a fórmula já escalada, o bônus de ataque já calculado. Nada muda sozinho: o Apêndice G é uma régua, e régua não decide.",
          "Sem grupo escolhido, os avisos que dependem do grupo CALAM em vez de inventar um personagem médio. Um número tirado do nada seria pior que silêncio.",
          "16 testes novos só do conselheiro, travando quando cada aviso aparece, que ele cita um número conferível, e que a correção que ele oferece resolve o que ele apontou. 89 no total.",
        ],
      },
      {
        heading: "As dezenove árvores ganharam brasão, e o jogo ganhou logo",
        items: [
          "Cada árvore agora declara `icon` — e o arquivo se chama como o id dela, então o mapeamento nome→arquivo deixou de existir como tabela. /arvores desenha o brasão no nó do mapa e no painel lateral, /livro no cabeçalho de cada catálogo, a criação no seletor de Árvore Inicial, a ficha na Árvore Inicial e em cada grupo do Grimório, e /encontros no cartão de cada personagem do grupo.",
          "As imagens chegaram tortas e foram endireitadas: uma era cópia byte a byte de outra, quatro tinham espaço ou acento no nome, e uma se chamava .svg sendo PNG por dentro — o navegador engoliria, mas o formato mentia. Todas viraram public/arvores/<id da árvore>.<extensão>.",
          "Elas vêm em formatos e fundos diferentes (traço preto sem fundo, fundo branco, fundo preto, alfa), então todas passam pelo mesmo medalhão, com fundo claro fixo nos dois temas — é a única regra que faz o traço preto aparecer também no escuro, e ela mora num lugar só.",
          "O logo entrou na aba (favicon), na barra de navegação e no topo da landing. Como o letreiro é preto e os ornamentos são dourados, existe uma variante clara pro tema escuro — GERADA do original por script, junto com o favicon quadrado, porque logo copiado à mão é a próxima coisa a divergir.",
          "check:livro passou a conferir que o brasão de cada árvore existe mesmo em disco: `icon` é texto, e nada no TypeScript impede que ele aponte pra um arquivo que não existe.",
        ],
      },
    ],
  },
  {
    version: "0.1.1",
    date: "2026-09-03",
    title: "O Cenário Hipotético",
    sections: [
      {
        heading: "/encontros — montar a criatura e testá-la contra o grupo antes da sessão",
        items: [
          "O Apêndice G sempre teve o molde de criatura por patamar, e ele só existia como tabela impressa: o Mestre lia PV 150, CA 18, ~55 de dano e tinha que adivinhar o que isso faz contra OS CINCO PERSONAGENS dele. A tabela é calibrada contra um grupo genérico; nenhuma mesa tem um grupo genérico.",
          "Tela nova: escolha um patamar e um papel (Lacaio, Padrão, Chefe) e a criatura nasce com os números do Apêndice G preenchidos. Edite PV, CA, ataque, dano por turno, CD e quantidade à vontade — quando os números saem do molde, a tela diz que saíram e oferece recalibrar, em vez de impedir.",
          "As seis criaturas prontas do apêndice (Sapo-Lodo, Serpente-do-Pântano, Aranha, Wyvern, Ogro de Guerra, Superd Renegado) entram com um clique, já com a coluna \"o que a torna perigosa\".",
          "O GRUPO VEM DAS FICHAS DE VERDADE: marque quem entra entre as fichas de /personagens — as mesmas que o Mestre já importa dos JSONs dos jogadores. Nada de reinserir atributo nenhum.",
          "O botão roda o combate 300 vezes e devolve um veredito: Trivial, Fácil, Equilibrado, Perigoso ou Letal, com taxa de vitória, rodadas, quantos personagens caem, PV que sobra no grupo e quanto dano cada ficha causou.",
          "E A RECOMENDAÇÃO: quando o encontro não cai em Equilibrado, o site procura por busca binária a escala de PV e dano que o poria lá, e mostra \"PV 300 → 235, dano 55 → 43\" com a projeção. Um botão aplica. Quando NENHUMA escala resolve, ele diz isso — o problema é a composição do encontro, e uma escala fracionária só esconderia.",
          "A tela imprime, junto do veredito, a lista do que a simulação NÃO sabe (cura, condições, Reações, terreno, táticas). O motor mede o piso: o que aparece como Equilibrado tende a ser confortável na mesa, e o que aparece como Letal é letal mesmo.",
          "Botão pra mandar as criaturas direto pro tracker de /iniciativa, com a iniciativa já rolada.",
        ],
      },
      {
        heading: "O motor de simulação virou código compartilhado",
        items: [
          "O simulador de combate vivia inteiro dentro de scripts/simular-combate.mts. A tela que diz ao Mestre \"este encontro é justo\" precisa responder pelos MESMOS números que calibram o livro — duas cópias da mesma simulação divergem em silêncio, e a que diverge é sempre a que ninguém roda.",
          "O motor foi pra src/lib/combatSim.ts e o script passou a importá-lo. A refatoração é neutra: os 2.000 combates do relatório saem com todos os números idênticos aos de antes.",
          "A aleatoriedade agora é sempre injetada com semente. Um veredito sem semente não se confere: o Mestre que estranha os 82% precisa poder rodar de novo e receber 82%.",
          "O script perdeu uma função morta (construir) que nunca foi chamada por ninguém.",
        ],
      },
      {
        heading: "Apêndice G deixou de ser texto digitado à mão",
        items: [
          "Mesma cirurgia que a régua de dano do Apêndice C tinha recebido: as duas tabelas do Bestiário — o molde por patamar e as seis criaturas prontas — eram valores digitados dentro de Appendices.tsx, e são a régua contra a qual o Mestre monta todo inimigo do jogo.",
          "Agora vivem em src/data/bestiary.ts e o livro as imprime a partir dali. A tela de encontros lê os mesmos dados.",
          "A coluna \"Bônus de Resistência\" parou de ser digitada: o livro a define como metade do Bônus de Ataque arredondado pra cima, então ela é DERIVADA. Um teste trava que a derivação reproduz exatamente os seis valores que a tabela imprimia (+2, +2, +3, +4, +5, +6).",
          "A regra da rodada extra do chefe também virou função: rodadasDoChefe(). Ela estava escrita à mão em dois lugares, incluindo a ressalva de que grupos de três ou menos não a disparam — que o script ignorava.",
          "25 testes novos cobrindo os papéis, a escada do molde, a rodada do chefe, a reprodutibilidade da simulação e as cinco faixas do veredito. 60 no total.",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-09-03",
    title: "Duas Portas",
    sections: [
      {
        heading: "Magias Combinadas — rework completo",
        items: [
          "Elas eram uma tabela impressa e nada mais: nenhuma era comprável em lugar nenhum, o motor não sabia que existiam, a ficha não as guardava, e o PA que o livro dizia que elas custavam nunca saía de lugar nenhum.",
          "REQUISITO NOVO: cada combinação declara DUAS PORTAS, cada uma com o seu próprio rank. Meteoro exige Fogo no REI e Terra no AVANÇADO. Barreira Incandescente se contenta com Barreira Avançado e Fogo Intermediário. Não existe mais um \"Avançado nas duas\" genérico que abra as nove de uma vez.",
          "Os requisitos são DESIGUAIS de propósito: duas fichas que investiram fundo em escolas diferentes destravam Combinadas diferentes, e nenhuma destrava todas. Isso é o que faz a tabela ser uma lista de escolhas em vez de um bloco.",
          "ELAS CUSTAM PA de verdade agora — de 3 PA nas portas mais baixas a 8 PA no Meteoro — e o custo entra em getPaSpent junto com magia, atributo e perícia.",
          "Painel novo em /arvores: mostra as nove o tempo inteiro. As compradas, as abertas agora, e as trancadas COM AS PORTAS QUE FALTAM e quanto falta em cada uma. Uma Combinada aparece como disponível no instante em que a segunda porta abre.",
          "A Maestria do Avançado continua dando o DIREITO de aprender Magia Combinada. O que ela deixou de ser é a única condição.",
          "NA FICHA: as Combinadas compradas ganham seção própria no Grimório de /ficha, com PM, Ações, alcance, dano e as duas portas que as destravaram. Ficam separadas das árvores de propósito — uma Combinada não pertence a nenhuma das duas escolas que a geraram, e listar o Meteoro dentro de Fogo faria o jogador procurá-lo em Terra na metade das vezes.",
          "NO PDF: elas entram no mesmo bloco de cartas das magias, marcadas com ◇, e a linha de alcance mostra as duas árvores de origem. Na mesa elas se usam como qualquer outra magia; separá-las faria procurar em dois lugares.",
        ],
      },
      {
        heading: "Correções",
        items: [
          "TRÊS das nove magias apontavam para a árvore \"curar\", que nunca existiu — o id é \"cura\". O livro imprimia a coluna da árvore vazia nessas três, e nenhuma verificação pegava porque nada no código lia o campo. Um teste novo trava isso: toda porta de toda Combinada tem que apontar para uma árvore que existe.",
          "Migração v11 do persist: fichas antigas entram com a lista de Combinadas vazia.",
          "33 testes no total (eram 28), cinco deles cobrindo as duas portas, o PA e a compra duplicada.",
        ],
      },
    ],
  },
  {
    version: "0.0.9",
    date: "2026-09-03",
    title: "Ganhar Duas Vezes a Mesma Coisa",
    sections: [
      {
        heading: "Pontos de Touki entram no Padrão das Reservas",
        items: [
          "PT era a única das três reservas fora do Padrão do Cap. 1: PV e PM escalavam por patamar, PT vinha como número fixo. A consequência não era só inconsistência — era redundância. CINCO árvores tinham DOIS talentos de PT em patamares diferentes fazendo a mesma coisa com um número diferente: \"+2 PT Máximos\" no Intermediário, \"+3 PT Máximos\" no Avançado.",
          "Os sete talentos de reserva de PT agora rendem +1 PT POR PATAMAR seu naquela árvore, como os de PV e PM sempre renderam. Um talento só cobre a árvore inteira.",
          "Os três talentos que sobravam deixaram de ser tanque maior e viraram RECARGA: uma vez por combate, sem gastar Ação, recupere PT iguais ao seu Bônus de Rank. No Escudeiro, que gasta PT mais rápido que qualquer árvore, isso é o que faz a segunda metade da luta ainda ter um Escudeiro nela. No Deus da Espada, compra um segundo primeiro turno. No Vendaval, vem junto com 9 metros de deslocamento que contam para a Distância Roubada.",
        ],
      },
      {
        heading: "Estilo Vendaval — duas habilidades que só repetiam um patamar anterior",
        items: [
          "Mil Cortes no Vendaval (Rei) era o Redemoinho de Aço (Intermediário) com o raio 3× maior e o dado 2× maior, quatro patamares depois — o mesmo botão, mais caro. Agora o raio VEM da Distância Roubada do turno (3m a 12m): você não gira no lugar, atravessa o grupo e corta no caminho. Cada alvo que cair devolve 1 PT.",
          "Corte que o Vento Termina (Santo) era o Corte do Horizonte Curto (Avançado) com mais dado e mais Ação. Agora a segunda lâmina segue por toda a sua Distância Roubada — e se você não se moveu neste turno, ela não sai.",
        ],
      },
      {
        heading: "O chefe solo não sobrevivia a um grupo de cinco",
        items: [
          "A regra do Apêndice G era \"chefe único: dobre o PV e mantenha o dano\". Ela resolve a vida do chefe e ignora o problema real, que é economia de ação: cinco personagens agem quinze vezes por rodada, um chefe age três.",
          "Numa simulação de 2.000 combates, um grupo de 3º patamar derrubava o chefe de Elite (um patamar ACIMA deles) em 2,4 rodadas perdendo 0,7 personagem — e ainda vencia 59% contra um chefe DOIS patamares acima.",
          "Regra nova: o chefe ganha uma rodada inteira a cada dois personagens do grupo (mínimo 1). Um grupo de cinco enfrenta um chefe que age duas vezes por rodada. A curva virou o que devia ser: mesmo patamar 100% com uma baixa, um acima 70% com o grupo quase inteiro no chão, dois acima 0%.",
        ],
      },
      {
        heading: "npm run check:redundancia",
        items: [
          "Detector novo: compara toda habilidade, talento e Maestria com todas as outras da MESMA árvore, entre patamares diferentes, por sobreposição de vocabulário. Ele procura a progressão que não progride — \"ganho isso no 1º e ganho quase igual no 3º\" — que nenhum check de consistência pega, porque não há contradição nenhuma, só repetição.",
          "Achou 10 pares acima de 40%. Cinco eram escadas legítimas (Bala de Pedra → Canhão de Pedra), três eram os talentos de PT e dois eram o Vendaval. Ele ignora de propósito os talentos de reserva entre si: o Padrão das Reservas existe justamente pra que eles digam a mesma frase.",
        ],
      },
      {
        heading: "Correções",
        items: [
          "getPtPool lia só o campo de PT fixo e ignorava o novo campo escalar — os sete talentos convertidos estavam concedendo ZERO. Pego por um teste escrito junto com a mudança, antes de qualquer ficha ver.",
          "28 testes no total (eram 26).",
        ],
      },
    ],
  },
  {
    version: "0.0.8",
    date: "2026-09-03",
    title: "A Régua Agora Se Mede",
    sections: [
      {
        heading: "Apêndice C — a régua de dano saiu da prosa",
        items: [
          "A Tabela Comparativa de Dano por Turno — que o livro chama de \"a régua com que toda árvore futura deve ser medida\" — era 15 colunas × 6 linhas de valores digitados à mão dentro do texto. Era a única régua do livro que ninguém verificava, e ela já estava errada: o Sopro Podre caiu de 10d8 pra 6d8 no rework da 0.0.3 e a coluna da Desintoxicação continuou anunciando ~55 no 5º patamar, um número que a escola não alcança mais.",
          "A tabela virou dado (src/data/danoPorTurno.ts) e o Apêndice C passa a renderizá-la de lá. Os números continuam sendo calibragem humana — \"dano por turno\" embute Ações, número de alvos e o Touki do inimigo, e nada disso está nos dados de uma magia isolada.",
          "O que mudou é que agora existe um piso verificável: o check:livro compara cada célula com a média do maior golpe único daquele patamar, JÁ AMORTIZADA pelas Ações que ele custa (uma magia de 6 Ações entrega metade por turno — o próprio Apêndice C explica isso). Uma coluna pode ficar acima desse piso; nunca abaixo.",
          "As quatro colunas que o próprio livro diz não medirem dano — Cura, Desintoxicação, Barreira e Escudos — ficam marcadas como fora da régua e não são verificadas. Cobrar delas uma promessa que elas nunca fizeram seria inventar regra.",
          "A coluna do Vento no 3º patamar foi corrigida de ~30 para ~32, que é o que os dados entregam.",
        ],
      },
      {
        heading: "Testes — 35 fórmulas, zero cobertura",
        items: [
          "selectors.ts calcula TODO número da ficha (PV, PM, PT, PP, CA, BC e o PA gasto) em 35 funções puras, e não tinha um único teste. Duas das correções desta sessão foram exatamente do tipo que teste pega e revisão humana não: a ficha imprimia count × 2 PA enquanto o motor cobrava a escada progressiva, e perfectRecitationBonus lia um campo que nunca existiu no tipo.",
          "23 testes cobrindo PV Máximos e o Fator de Vigor, PM e o cap dos dois primeiros patamares, Pontos de Touki, os custos progressivos de PA, o Custo de Abertura de árvore, BC/CD por árvore e a Classe de Armadura.",
          "Cada expect cita a seção do livro que o justifica, então quando um quebra dá pra saber na hora se quebrou o código ou se a regra mudou. npm test.",
        ],
      },
      {
        heading: "Lint limpo pela primeira vez",
        items: [
          "Os quatro avisos que arrastavam há sessões foram resolvidos — e nenhum deles era um bug: os três hooks do Destiny Board estavam CERTOS como estavam, e adicionar as dependências que o linter pedia causaria loop (o mapa saltaria de volta ao centro sem parar, a câmera ficaria presa numa árvore). Cada um ganhou o disable com o motivo escrito.",
          "O quarto era o idioma de descartar uma chave por destructuring. O eslint passou a aceitar o prefixo _ para variável, argumento e erro capturado, que é a convenção que já diz isso.",
        ],
      },
    ],
  },
  {
    version: "0.0.7",
    date: "2026-09-03",
    title: "O Divino Não Se Compra",
    sections: [
      {
        heading: "Punho de Fogo — patamar Deus virou narrativo",
        items: [
          "O Punho de Fogo era a única das 19 árvores com um patamar Deus COMPRÁVEL: uma Maestria, um talento e três habilidades, custando PA como qualquer outro rank. Isso contradizia o Cap. 1, §3, que diz que o Divino \"não possui custo mecânico de PA\" e \"só pode ser alcançado através de intenso Roleplay e eventos lendários\".",
          "O conteúdo não foi jogado fora. A Aura do Alfa e Ômega, o Big Bang Marcial, a Ignição da Alma e o Julgamento de Prometeu viraram o corpo do quadro narrativo A AURA DO ALFA E DO ÔMEGA. O que se perdeu foi o preço em PA e a rolagem — que é exatamente o que o livro diz que o patamar Divino não tem.",
          "O Estilo Vendaval já tinha recebido o quadro narrativo dele na 0.0.6 (O Passo Que Não Termina). Agora as 19 árvores tratam o Divino do mesmo jeito, sem exceção.",
          "MIGRAÇÃO v10: uma ficha salva que já tivesse comprado no patamar Deus do Punho de Fogo perde essas compras e o desbloqueio do rank — e o PA volta a ficar disponível, em vez de sumir do total sem nada explicando por quê.",
        ],
      },
      {
        heading: "Correções",
        items: [
          "A tabela de custos do Cap. 1, §3 imprimia DUAS linhas \"Deus\": uma cobrando 4 PA (vinda de RANK_REQUIREMENTS) e outra, escrita à mão logo abaixo, dizendo \"Narrativa\". As duas se contradiziam no meio da seção que existe justamente para explicar quanto cada rank custa. É o mesmo bug de linha duplicada que a tabela de patamares do Cap. 3 tinha.",
          "O check:livro passou a tratar patamar Deus comprável como ERRO, não aviso — a decisão fica trancada, e a próxima árvore que tentar abrir exceção quebra o build.",
        ],
      },
    ],
  },
  {
    version: "0.0.6",
    date: "2026-09-03",
    title: "A Mão Não Envelhece",
    sections: [
      {
        heading: "Magia de Cura — o Rei deixou de ser um patamar morto",
        items: [
          "A escada de cura direta parava no Santo: Cura Radiante (10 PM, 20d8+BC contra Ferida Fresca) era a melhor magia de cura de um Santo, de um Rei E de um Imperador. O Rei ganhava Restauração e Milagre Menor — utilidade alta — mas curava exatamente o mesmo que o patamar anterior, num livro em que toda escola ofensiva ganha um número maior a cada rank.",
          "A Maestria do Rei (Golpe Divino) ganhou A MÃO NÃO ENVELHECE: toda magia de Cura sua rola +1d8 por rank de diferença entre o seu patamar e o rank da magia. No Rei, a Cura de 1º patamar rola +4d8 e a Cura Radiante rola +1d8 — é o que impede a sua magia mais barata de virar lixo de ficha.",
          "CORPO DE FERRO (Santo) dava +50 PV MÁXIMOS fixos: o único número solto da árvore. Não escalava (valia o mesmo no Santo e no Imperador) e usava a categoria errada — PV máximos não são gastos antes dos reais e não expiram, então a magia funcionava como cura permanente disfarçada de escudo. Agora são PV TEMPORÁRIOS iguais a 8 × o seu Bônus de Rank (32 no Santo, 48 no Imperador), e não acumulam com Vigor Emprestado.",
        ],
      },
      {
        heading: "Rank Deus do Estilo Vendaval",
        items: [
          "Era a única árvore do livro sem quadro do patamar Divino — e a ausência pesava mais nela, porque uma árvore híbrida já é um teto por definição.",
          "O PASSO QUE NÃO TERMINA: todo patamar do Vendaval apenas alarga o número da Distância Roubada (9m, 12m, um piso de 6). O Divino apaga o número — o espadachim não percorre a distância até o alvo, ele já a percorreu antes de decidir atacar. Nenhuma das duas escolas de origem reivindica o título: o Norte diz que é vento, o Vento diz que é esgrima.",
        ],
      },
      {
        heading: "Uma regra, uma redação",
        items: [
          "O teto de PM dos dois primeiros patamares estava escrito quase palavra por palavra em Cap. 1, §1 e Cap. 4, §1. Duas cópias da mesma regra é exatamente como nasceram as sete contradições corrigidas na 0.0.5. Agora a redação canônica vive no Cap. 4, §1 (junto da fórmula) e o Cap. 1 aponta pra lá.",
          "Cinco magias divergiam da tabela de Ações do próprio rank sem a nota que o Cap. 2 exige: Chamado, Retorno, Troca de Lugares e Corpo Emprestado (Invocação) e Santuário (Cura). Todas ganharam a justificativa — na Invocação, o custo em Ações não escala com o rank de propósito, porque o preparo acontece fora de combate e um gesto não fica mais lento porque o invocado ficou mais forte.",
        ],
      },
      {
        heading: "npm run check:livro",
        items: [
          "Substitui o check:magias por uma verificação de consistência entre os DADOS e o TEXTO do livro. As sete contradições da 0.0.5 nasceram todas do mesmo jeito: um número escrito à mão numa frase, e depois o dado mudou.",
          "Ele confere: a contagem de árvores citada na prosa contra TREES.length; que toda árvore declara Mecânica Central e tem quadro de Rank Deus (ou patamar Deus próprio); que a tag da mecânica aparece na Maestria de 1º patamar; que toda magia tem cântico; que o cântico respeita a faixa do rank; e que todo desvio da tabela de Ações carrega costNote.",
          "Na primeira execução ele achou 21 técnicas do Punho de Fogo sendo tratadas como magia sem cântico — o check antigo não as via porque olhava uma lista fixa de árvores. A regra correta ficou explícita: só as OITO ESCOLAS DE MAGIA recitam; técnica marcial que gasta PM é executada, não conjurada.",
        ],
      },
    ],
  },
  {
    version: "0.0.5",
    date: "2026-09-03",
    title: "Comece Aqui",
    sections: [
      {
        heading: "Novo capítulo de abertura",
        items: [
          "O livro ganhou um capítulo \"Comece Aqui\", antes do Capítulo 1: o que é o jogo, a ficha em seis números, um turno de combate, uma rodada jogada de ponta a ponta, criação em seis passos, e um índice de onde encontrar cada coisa.",
          "Ele existe porque o livro abria em \"o sistema utiliza 5 atributos principais\" — quem nunca jogou via uma decisão de ficha antes de saber o que é um turno. Cinco minutos de leitura, uma vez só.",
          "A rodada de exemplo mostra a Magia de Água preparando no 1º turno e cobrando em dobro no 2º, para ensinar a regra dos dois tempos com um caso concreto em vez de uma explicação.",
        ],
      },
      {
        heading: "Contradições de regra corrigidas",
        items: [
          "INTERRUPÇÃO DE CONJURAÇÃO: existiam duas regras conflitantes. O Cap. 2, §6 (novo na 0.0.4) usava CD 8 + metade do dano; o Cap. 4, §3 usava CD 10 + Bônus de Rank de quem acertou. Vale a do Cap. 4 — o próprio livro já explicava, desde 2026-08-29, por que a versão baseada em dano não sobrevive à progressão: o dano cresce sem teto e o teste trava em +11, então magia de 4 a 6 Ações ficaria impossível de conjurar nos patamares em que ela existe.",
          "SALVAÇÕES: o Cap. 4, §4 diz \"Duas Salvações por Combate\", mas Santuário Menor (Cura, Santo) citava \"Uma Salvação por Combate\". Corrigido para duas.",
          "A lista de formas de impedir uma morte passou de quatro para cinco — a Égide Lendária (item de Rank S) estava fora da contagem, apesar de o próprio item se declarar parte dela.",
          "CONTAGEM DE ÁRVORES: o livro dizia 17 ou 18 em seis lugares diferentes. São 19 desde que o Punho de Fogo entrou, na 0.0.2.",
          "A tabela de patamares do Cap. 3 renderizava uma linha 7 duplicada, com bônus +8 — valor que não existe em RANK_BONUS (o rank Deus é +7). Ofícios agora mostram \"—\" no 7º patamar, que é o correto: Ofício termina no sexto.",
          "A contagem de Escolas Formais e Ofícios estava errada (dizia seis Ofícios; são sete, e o Estilo Vendaval é Escola Formal).",
          "O Aside \"Por que o dobro, e por que 20\" (Cap. 4, §1) explicava uma fórmula que não existe mais: a constante é 14 e o multiplicador é 1,67 desde 2026-08-30. Reescrito com os valores reais e o motivo da mudança.",
        ],
      },
      {
        heading: "Site",
        items: [
          "\"Criar\" saiu da barra de navegação. Criar personagem não é um destino que se visita: é uma coisa que se faz a partir do roster, e /personagens já abre com o botão de criação ao lado das fichas existentes. A rota continua existindo e linkada da landing e do roster.",
        ],
      },
    ],
  },
  {
    version: "0.0.4",
    date: "2026-09-03",
    title: "O Cântico Tem Preço",
    sections: [
      {
        heading: "Recitação Perfeita — agora existe um piso",
        items: [
          "O Bônus de Recitação Perfeita deixa de ser automático. Uma magia cujo cântico for MAIS CURTO que o piso do rank dela não concede bônus nenhum, por melhor que você recite — a carta dela passa a dizer \"Sem bônus\".",
          "Motivo: uma auditoria das 149 magias do livro encontrou 55 com cântico abaixo do piso do próprio rank. Barreira, Cura, Desintoxicação, Invocação e Bardo estavam quase inteiras fora da escada. \"Não caias. Ainda não. Prontidão!\" tem 35 caracteres e pagava o mesmo que um cântico de 380 do rank Rei.",
          "50 cânticos foram reescritos para alcançar a faixa do próprio rank. Hoje 144 das 149 magias estão dentro da faixa; antes, 91.",
          "As 5 magias que continuam curtas são curtas DE PROPÓSITO e agora dizem isso: Prontidão, Rejeitar a Morte, Luz Absoluta, Lança de Plasma e Explosão Silenciosa. Todas de emergência, todas com nota de custo explicando a pressa — nelas a velocidade já é o benefício, e o livro parou de pagar as duas coisas.",
          "A regra se mede sozinha a partir da tabela de tamanho: escrever um cântico curto novo desliga o bônus dele automaticamente.",
        ],
      },
      {
        heading: "Novas regras de magia (Cap. 2)",
        items: [
          "INTERROMPER UMA CONJURAÇÃO — o Cap. 2 ganhou uma seção inteira sobre isso. (A CD publicada aqui estava errada e foi corrigida na 0.0.5: vale CD 10 + Bônus de Rank de quem te acertou, a mesma do Cap. 4, §3.) Falha: perde todas as Ações gastas e metade do PM da magia.",
          "Enquanto está Conjurando você é visível e audível (o Mestre informa o rank aparente pelo tamanho do cântico), pode se mover metade do Deslocamento, e não pode atacar, usar item nem usar Reação — usar Reação encerra a conjuração.",
          "Atordoado, Paralisado, Incapacitado, Surdo e Soterrado interrompem SEM teste. Congelado e Atolado não interrompem: você continua falando.",
          "Ritual não se interrompe pela metade — se perde inteiro: PM cheio e todo o tempo investido. Em troca, ritual conduzido em paz nunca exige teste.",
          "Tabela de formas deliberadas de interromper: bater forte, Vácuo Localizado (Vento), Selado e Anulação (Barreira), Corte de Braço (Deus da Espada).",
          "Nova seção \"Regras Gerais de Conjuração\": linha de visão, conjurar em corpo a corpo (permitido, sem penalidade), mãos livres, segurar magia pronta, quantas magias sustentar, ficar sem PM no meio, falha crítica e empilhamento de magias iguais.",
        ],
      },
      {
        heading: "Mecânica Central — as 19 árvores",
        items: [
          "Toda árvore passa a declarar a sua Mecânica Central num quadro no topo do catálogo: a tag, o que ela faz que nenhuma outra faz, o ciclo de jogo numerado, e — o que faltava — a fraqueza declarada.",
          "Nova seção do Cap. 3, \"Como Ler uma Árvore\", com as 19 mecânicas lado a lado em tabela, para ser lida ANTES de escolher a Árvore Inicial.",
          "A tag de cada árvore aparece entre colchetes na Maestria de 1º patamar dela, para você reconhecer a mecânica quando ela voltar: [Molhado], [Em Chamas], [Desequilibrado], [Atolado], [Ferida Fresca], [Rank contra Rank], [Selado / Fluxo Interrompido], [Pacto], [Letalidade], [Contra-ataque], [Improviso], [Quebrantado], [Sob Minha Guarda], [Marcado], [Calor], [Distância Roubada] e os três [Escopo] das árvores de Utilidade.",
          "Documentada a regra dos dois tempos: árvores que PREPARAM (Água, Terra, Vento, Lutador) contra árvores que COBRAM na hora (Fogo, Deus da Espada, Arquearia). Nenhuma é melhor — depende de quantos turnos a sua mesa joga.",
        ],
      },
      {
        heading: "Estilo Vendaval — mecânica nova",
        items: [
          "Era a única árvore do livro sem identidade própria: mobilidade solta, alcance estendido em três patamares diferentes e nenhuma regra ligando as duas coisas.",
          "Nova mecânica DISTÂNCIA ROUBADA: a distância que você percorreu na sua vez (até 9m) é somada ao alcance do seu próximo ataque corpo a corpo neste turno. Se ele acertar um alvo a mais de 3m, o alvo fica Desequilibrado.",
          "Ela escala pelos patamares em vez de aparecer do nada: no Intermediário, movimento feito com Reação também conta; no Avançado o teto sobe para 12m; no Rei ela soma em cima do alcance mínimo de 6m.",
          "Isso transforma os cinco \"ataques corpo a corpo à distância\" espalhados pela árvore em variações de uma regra só, e dá ao Vendaval um motivo mecânico para o excesso de reposicionamento que ele já comprava.",
        ],
      },
    ],
  },
  {
    version: "0.0.3",
    date: "2026-09-03",
    title: "A Profundidade Morreu",
    sections: [
      {
        heading: "Rework: Magia de Desintoxicação",
        items: [
          "A mecânica de Profundidade foi APAGADA. Aflições não têm mais um número de 1 a 5 que sobe sozinho com o relógio, e nenhuma magia move esse número pra cima ou pra baixo.",
          "Regra nova, uma linha: toda aflição tem um RANK (Principiante a Imperador), e um feitiço de Desintoxicação de rank X remove uma aflição de rank X ou inferior. Nada mais.",
          "Aflição não piora sozinha e não passa sozinha: ela continua cobrando o efeito dela (2d6 por hora, -1 atributo por semana) até alguém tratar. A urgência é o efeito, não um contador.",
          "A árvore virou a mais barata do livro em PA, com tabela própria (Cap. 1, \"A Escola Barata\"): Imperador custa 3 PA onde a tabela comum cobra 5, e Santo custa 2 onde ela cobra 3.",
          "Em troca do preço, a árvore foi nerfada de propósito. Sopro Podre cai de 10d8 para 6d8; Corrosão cai de 4d8 para 3d6 e não destrói mais CA permanentemente; Toque do Fim deixa de matar sozinho.",
          "Anular deixa de remover QUALQUER condição do jogo e passa a cobrir só as cinco da escola (Envenenado, Paralisado, Petrificado, Cego, Surdo), e só de origem tóxica — condição de golpe, elemento ou medo é Milagre Menor, na Cura.",
          "Estado Anulado (Santo) passa a gastar sua Reação e vale uma vez por rodada. Corpo Recusado perde a imunidade a veneno mágico. Nada Entra cai de 18m para 9m e vira Vantagem em vez de imunidade compartilhada.",
          "Sangria virou a única válvula de escape da escola: purga uma aflição de UM rank acima do seu alcance, ao custo de 3d6 irredutíveis. Substitui o talento A Mão que Não Erra, que foi removido.",
          "Sangue Trocado não reduz mais o rank da aflição ao transferi-la para você — é sacrifício, não atalho.",
          "Contra a Maré (Avançado) deixa de \"parar o relógio\" e passa a deixar aflições DORMENTES num raio de 9m: elas continuam lá, mas não cobram efeito enquanto você estiver de pé.",
        ],
      },
      {
        heading: "Identidade das Árvores",
        items: [
          "Nova condição SOTERRADO (Cap. 4, §5), a metade que faltava da identidade da Terra: Deslocamento 0, Preso, sem visão nem gesto, 2d10 de sufocamento por turno. Só pode ser aplicada a quem já está Atolado, Preso ou Caído.",
          "Terra virou uma escada de duas etapas igual à Água: Atolado prepara, Soterrado cobra. Cárcere, Prisão de Pedra e Sepultamento passam a aplicar Soterrado; a Maestria de Santo converte Atolado em Soterrado automaticamente.",
          "Água ganhou a regra geral que faltava: QUALQUER magia de frio sua deixa Congelado quem já estava Molhado e falhou no teste (Maestria do Avançado). Antes só Campo de Gelo fazia isso.",
          "Vento ganhou o pagamento que não tinha: toda magia de Vento rola um dado de dano a mais contra alvo Desequilibrado. Grito do Mundo e Lâmina do Horizonte passam a aplicar a condição — antes ela sumia nos dois últimos patamares.",
          "Fogo: toda magia da escola causa dano cheio contra alvo Em Chamas, sem metade em caso de sucesso no teste — a escola que não prepara nada e cobra na hora.",
          "As sete essências estão agora marcadas explicitamente nas Maestrias de 1º patamar: [Molhado], [Em Chamas], [Desequilibrado], [Atolado], [Letalidade], [Improviso] e [Contra-ataque].",
        ],
      },
      {
        heading: "Custos de PA",
        items: [
          "A compra de Atributo é oficialmente PROGRESSIVA no livro e na ficha: 1, 1, 2, 2, 3, 3… PA. O motor já cobrava assim; a tabela do Cap. 1 e o painel da ficha ainda anunciavam 2 PA fixos.",
          "A Vantagem em Testes de Resistência também: 2, 3, 4, 4, 4 PA (17 PA pelas cinco), em vez de 2 PA fixos por atributo.",
          "A ficha agora mostra quanto custa a PRÓXIMA compra, e não só o total já gasto.",
        ],
      },
      {
        heading: "Loja e Mundo",
        items: [
          "Os três venenos à venda passam a ser nomeados por rank (Principiante, Intermediário, Avançado) em vez de Profundidade 1/2/3. Preços e Ranks de Guilda exigidos não mudaram.",
          "Poção de Antídoto agora remove uma aflição de rank Principiante ou Intermediário, em vez de \"1 ponto de Profundidade\". O Antídoto Universal cobre qualquer rank até Imperador.",
          "A Doença da Pedra Mágica virou a única aflição de rank DEUS do livro — o teto que nenhum patamar jogável alcança.",
        ],
      },
    ],
  },
  {
    version: "0.0.2",
    date: "2026-08-31",
    title: "Guarda Erguida",
    sections: [
      {
        heading: "Ações e Reações de Combate",
        items: [
          "Nova Ação Padrão — Defender/Absorver: em vez de tentar desviar, você foca em aguentar o golpe. O atacante ganha Vantagem na rolagem de acerto contra você, mas se acertado o dano é reduzido pela sua mitigação: (Vigor × 2) + Bônus de Rank do seu maior Estilo de Corpo.",
          "Bloquear com Escudo (Reação): ao ser atingido por um ataque físico que você veja, some a CA do seu escudo contra aquele ataque — se isso fizer o golpe errar, o dano é anulado por completo.",
          "Esquivar e Defender/Absorver agora protegem só o PRIMEIRO ataque que você sofrer na rodada. Qualquer outro ataque no mesmo turno acontece normalmente, sem os bônus de esquiva ou a redução de dano — concentrar-se em um golpe tem um preço.",
        ],
      },
      {
        heading: "Vida e Mana",
        items: [
          "PV Máximos agora escalam de forma mais contida nos primeiros patamares — o 1º patamar volta a ser uma fase de risco real, não um colchão de vida.",
          "PM Máximos ganham um teto nos dois primeiros patamares de magia (Principiante e Intermediário): bônus vindos de fora da árvore (PA avulso, antecedentes, sub-tabelas) não empurram mais um conjurador iniciante muito além do que a assinatura do próprio rank permite pagar. Talentos de reserva da árvore e bônus raciais escalares (Elfo, Migurd) continuam valendo por cima do teto. A partir do Avançado, o teto desaparece e a fórmula plena passa a valer até o Imperador.",
        ],
      },
      {
        heading: "Classe de Invocação",
        items: [
          "Invocar em combate sem um círculo já desenhado agora exige o talento Convocar sob Pressão: custa 6 Ações, e o invocado chega com metade dos PV e um degrau a menos no dado de dano.",
          "Convocação Aprimorada remove essa penalidade de emergência — invocação de combate por 4 Ações, sem perda de PV ou dano.",
          "Traço Rápido muda de função: agora deixa desenhar o círculo em 1 Ação pagando o dobro de PM, em vez de zerar o custo extra de invocar em combate.",
          "Nova linha de evolução do familiar: Pacto — Filhote Evolutivo (invocação inicial fraca) evolui para Forma Média (Intermediário) e depois Forma Suprema (Avançado), ganhando dano, PV, resistências e até uma magia menor própria.",
          "Vínculo Concentrado: abrir mão de manter vários Pactos e concentrar todo o PM de invocação em um único familiar concede dados de dano extras, mais PV por Bônus de Rank e Resistência a dano mágico.",
          "Chamado (a assinatura da árvore) deixa explícito que a invocação padrão exige círculo com 10 minutos de preparo fora de combate — a invocação de emergência agora é função exclusiva dos talentos acima.",
        ],
      },
      {
        heading: "Classe de Escudos",
        items: [
          "Nova linha de identidade — Puro Escudo: ao abrir mão de empunhar arma de dano (só escudo ou escudo grande), você desbloqueia versões Soberanas, mais fortes, das suas habilidades em todos os ranks, estendendo seus efeitos defensivos também a aliados adjacentes.",
          "Habilidades Soberanas exclusivas: Golpe de Escudo Soberano, Provocar Ódio Soberano, Aguentar Soberano, Escudo de Corpo Inteiro, Não Ele Soberano, Custe o Que Custar Soberano e O Muro Final Soberano.",
          "Sob Minha Guarda agora escala com o rank — protege 1 aliado no Principiante, 2 no Intermediário e 3 a partir do Avançado — em vez de já nascer com um alcance amplo.",
          "Interpor (Principiante) passa a somar +1 na CA com escudo, sem empilhar com magias de barreira.",
          "Ombro de Pedra sobe de +2 para +4 PV por patamar e ganha +1 PT Máximo.",
        ],
      },
      {
        heading: "Magia Combinada",
        items: [
          "Deixa de ser \"qualquer combinação que o Mestre aprove na hora\" e vira uma tabela oficial com 9 magias fixas — Magma, Gelo Tempestuoso, Relâmpago Santo, Barreira Incandescente, Tempestade de Cura, Pânico, Muralha de Espinhos, Nevasca Curativa e Meteoro — cada uma com PM, alcance, Ações e dano definidos.",
          "Cada combinação é comprada com PA e destravada pela Maestria \"Magia Combinada\" do rank Avançado, em vez de vir de graça ao alcançar os dois ranks das árvores-base.",
          "Combinações fora da tabela continuam possíveis pela regra de ouro do Mestre, agora como complemento, não como o caminho principal.",
        ],
      },
      {
        heading: "Nova Sub-árvore: Punho de Fogo",
        items: [
          "Árvore híbrida do Corpo (Fogo + Lutador), revelada só quando você alcança Rank Intermediário nas duas árvores-base.",
          "Golpes desarmados ganham dano ígneo extra e a chance de incendiar o alvo, evoluindo até o Imperador com explosão em área, imunidade a fogo e redução de CA em inimigos no calor do combate.",
        ],
      },
      {
        heading: "Criação de Personagem",
        items: [
          "O orçamento livre de atributos na criação passa de 4 para 2 pontos, e destravar os dois Defeitos (-1 e -2) agora libera 5 pontos para redistribuir, em vez de 7.",
          "Bônus de Raça e de Antecedente saem do orçamento da criação — não competem mais pelos pontos distribuídos, e são somados por fora do resultado final.",
          "A Roleta do Destino usa o mesmo orçamento de 2 pontos do modo manual, encerrando a vantagem extra de quem sorteia o personagem.",
          "O kit inicial de Tank/Defensor troca a Armadura Média (+3 CA) de graça por Armadura Leve (+1 CA) — CA alta agora exige investimento (armadura melhor, talentos de escudo, evolução de rank).",
          "No Mapa de Árvores, árvores híbridas (Vendaval, e agora Punho de Fogo) ficam ocultas até os pré-requisitos serem cumpridos, aparecendo com um conector próprio ligando-as às duas árvores de origem.",
        ],
      },
    ],
  },
];
