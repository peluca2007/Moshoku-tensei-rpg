# Arte para o livro — lista de pedidos

O livro folheado (`/livro/folhear`) é um **livro noturno**: página quase preta, letra gritada, uma cor
por capítulo, por árvore e por raça. Nele a arte de anime acende em cima do papel escuro, e **a arte é o
que mais pesa**. O livro ainda roda com as artes provisórias que o projeto tinha. Esta é a lista do que
falta. **Você pega, eu organizo e ligo no livro.**

## Como mandar

1. Salve o arquivo com o **nome exato** da tabela, na **pasta** indicada, dentro de `public/`.
2. Qualquer formato serve (JPG, PNG, WebP; vídeo em MP4 ou WebM). Eu converto e reduzo o peso.
3. Anote de onde veio (site e link) na coluna "fonte" desta lista. O projeto é de fã, sem fins lucrativos,
   mas o livro vai ter uma página de créditos, e arte de artista tem crédito.
4. Achou algo bom que não está na lista, ou não sabe o nome certo? Jogue em `public/livro/_entrada/`
   com qualquer nome. Eu abro cada uma antes de decidir onde entra; nunca decido pelo nome do arquivo.

**Tamanho mínimo:** o livro é mostrado grande e com zoom. Imagem pequena fica borrada, então vale mais uma
imagem boa do que três médias.

## Prioridade 1 — as doze raças (entram sozinhas)

Cada raça tem uma página inteira no Cap. 1, com um quadro grande reservado pra ilustração. **Não precisa
mexer em código:** salve o arquivo com o nome da tabela e recarregue o livro. A arte aparece no quadro da
página da raça e na vitrine das doze raças. Enquanto não chega, o quadro mostra o brasão, e no
`npm run dev` escreve o nome do arquivo que falta.

- **Pasta:** `public/livro/racas/` (crie a pasta).
- **Formato:** `.webp`, `.jpg`, `.png` ou `.avif`. O nome é **em minúsculas**, igual à tabela: o servidor
  diferencia maiúsculas.
- **Enquadramento:** o quadro é **deitado e largo**, mais ou menos 16:9 nas raças de texto curto e 3:1
  nas de texto longo (o quadro cede lugar aos traços). O livro recorta pelo centro e sobe um pouco (mira o
  terço de cima), então **o rosto no terço de cima**. Deixe calmos a **borda direita** (onde desce o nome
  em japonês) e o **canto de baixo à esquerda** (onde entra o carimbo da raridade).
- **Tamanho mínimo:** 1600 × 900.
- **Onde procurar:** Zerochan, Pixiv, Safebooru, Wallhaven, capturas do anime em pausa (Crunchyroll), a
  Wiki de Mushoku Tensei (Fandom) pra saber quem é de qual raça.

| Arquivo | Raça | Quem pode ser (sugestão) | O que buscar | Fonte |
| --- | --- | --- | --- | --- |
| `humano.webp` | Humano (Jinzoku) | Paul, Zenith ou o Rudeus adulto | `paul greyrat`, `rudeus greyrat adult` | |
| `elfo.webp` | Elfo (Erufu) | Elinalise Dragonroad | `elinalise dragonroad` | |
| `anao.webp` | Anão (Dowaafu) | Talhand | `talhand mushoku tensei` | |
| `hobbit.webp` | Povo Pequeno / Hobbit (Hobitto) | Qualquer hobbit/halfling de anime, ou um PNG de fantasia | `halfling anime art`, `hobbit fantasy art` | |
| `raca-fera.webp` | Raça Fera (Juuzoku) | Ghislaine, Rinia ou Pursena | `ghislaine dedoldia`, `rinia pursena` | |
| `celestial.webp` | Raça Celestial (Tenzoku) | Um guerreiro alado da Raça Celestial | `mushoku tensei heaven race`, `winged warrior anime` | |
| `oceano.webp` | Raça do Oceano (Kaizoku) | Um tritão ou sereia guerreira | `merfolk warrior anime`, `mushoku tensei sea race` | |
| `migurd.webp` | Migurd | Roxy Migurdia | `roxy migurdia` | |
| `superd.webp` | Superd | Ruijerd Superdia | `ruijerd superdia` | |
| `ogro.webp` | Ogro (Onizoku) | Um guerreiro oni | `oni warrior anime`, `mushoku tensei oni` | |
| `demonio-imortal.webp` | Demônio Imortal | Badigadi ou Atoferatofe | `badigadi`, `atofe mushoku tensei` | |
| `dragao.webp` | Raça Dragão (Ryuzoku) | Orsted, ou a Raça Dragão da lenda (Laplace) | `orsted mushoku tensei`, `laplace mushoku tensei` | |

## Prioridade 2 — aberturas e capa

| Arquivo | Pasta | O que é | Tamanho mínimo | Onde procurar | O que buscar | Fonte |
| --- | --- | --- | --- | --- | --- | --- |
| `abertura-cap0.jpg` … `abertura-cap5.jpg`, `abertura-apendices.jpg` | `public/livro/capitulos/` | A arte do alto da página de abertura de cada capítulo, de margem a margem, com o número grande e o kanji do capítulo por cima. **Arte de anime, colorida, sem texto e sem legenda**; o canto de cima à direita precisa ser mais calmo (é onde entra o kanji). Uma cena por capítulo; sugestões abaixo. Hoje os capítulos 1 e 3 e os Apêndices abrem sem arte. | 1600 × 900 (deitada) | Capturas do anime (Crunchyroll, em pausa, na maior resolução); Wallhaven; Zerochan; Pixiv; ArtStation; Safebooru | `mushoku tensei scenery`, `mushoku tensei wallpaper 4k`, o nome da cena | |
| `guarda.jpg` | `public/livro/capa/` | A prancha colorida de página inteira que abre o livro (hoje é a paisagem do vale). Arte **em pé**, bonita sozinha, de preferência com os personagens. | 1700 × 2200 (em pé) | Pixiv, Zerochan (arte oficial de volume ou de "key visual"), Wallhaven | `mushoku tensei key visual`, `mushoku tensei light novel illustration` | |
| `capa.jpg` | `public/livro/capa/` | A capa do livro, a primeira página. Arte em pé, com espaço vazio em cima pro título. | 1700 × 2200 (em pé) | Wallhaven, Pixiv, Zerochan (arte oficial de volume da light novel funciona muito bem) | `mushoku tensei key visual`, `mushoku tensei light novel cover` | |

**Cenas sugeridas para as aberturas** (troque à vontade, desde que combine com o capítulo):

| Capítulo | Cena |
| --- | --- |
| Comece Aqui | O grupo reunido, ou o Rudeus criança lendo o livro de magia. |
| Cap. 1 — O Núcleo do Sistema | O Paul treinando espada com o Rudeus no quintal. |
| Cap. 2 — As Leis da Magia | A Roxy ensinando magia, ou um círculo mágico aceso. |
| Cap. 3 — Árvores de Progressão | Os três estilos de espada: Ghislaine, Eris, um Deus do Norte. |
| Cap. 4 — Combate e Sobrevivência | Uma luta de verdade: Eris no meio do combate, ou o Rudeus contra o Orsted. |
| Cap. 5 — Entre Aventuras | Taverna, Guilda de Aventureiros ou o acampamento do Dead End. |
| Apêndices | O mapa do Mundo de Seis Faces. |

## Prioridade 3 — acabamento

| Arquivo | Pasta | O que é | Tamanho mínimo | Onde procurar | O que buscar | Fonte |
| --- | --- | --- | --- | --- | --- | --- |
| `livro.jpg` (substitui o atual) | `public/faixas/` | O livro mágico aberto com velas e runas roxas, que hoje abre o Capítulo 2 (até chegar a `abertura-cap2.jpg`). A atual tem só 680 × 384. A mesma imagem em resolução maior, ou outra parecida. | 1600 × 900 | Busca reversa da atual no Google Imagens ou TinEye; Freepik | `magic book open candles fantasy art` | |
| `sumario.jpg` | `public/livro/capa/` | A arte da página do sumário (hoje é a caverna de cristal, 736 × 368). Uma paisagem do mundo, deitada. | 1600 × 900 | Wallhaven, Zerochan | `mushoku tensei scenery` | |
| `mapa-do-mundo.jpg` | `public/livro/mapa/` | O mapa do Mundo de Seis Faces, pra página inteira do Apêndice. | 2400 × 1600 | Wiki de Mushoku Tensei (Fandom), Reddit r/mushokutensei, Pixiv | `mushoku tensei world map`, `six faced world map` | |
| `pagina-inteira-cap1.jpg` … `pagina-inteira-cap5.jpg` | `public/livro/capitulos/` | Ilustrações de página inteira, pra pôr entre capítulos, como as pranchas do livro impresso. Opcional: duas ou três já mudam o livro. | 1700 × 2200 (em pé) | Pixiv, ArtStation, Zerochan | nome do personagem + `mushoku tensei fanart` | |

## Prioridade 4 — vídeo e movimento

O livro já toca os vídeos curtos das habilidades. Pra página de abertura de um capítulo ganhar movimento,
o que serve é um **laço curto**:

| Arquivo | Pasta | O que é | Como |
| --- | --- | --- | --- |
| `abertura-cap2.mp4` (e dos outros capítulos, se achar) | `public/livro/videos/` | 3 a 8 segundos em laço, **sem áudio**, da mesma cena da abertura (um feitiço sendo conjurado, uma espada girando). | Corte o trecho de um vídeo do anime no Clipchamp (já vem no Windows) ou no ezgif.com. Exporte em 720p e deixe abaixo de 4 MB. |

## O que eu faço com cada coisa

- **Raças:** entram sozinhas pelo nome do arquivo (ver Prioridade 1). Eu só confiro o recorte.
- **Aberturas e capa:** arte sangrando de margem a margem no alto da página, com o número vazado e o kanji
  do capítulo por cima, e a sombra da cor do capítulo fora de registro.
- **Pranchas e mapa:** páginas inteiras entre os capítulos.
- **Vídeos:** tocam só quando a página está aberta, sem som, e param ao virar.
