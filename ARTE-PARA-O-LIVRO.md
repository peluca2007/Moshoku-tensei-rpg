# Arte para o livro — lista de pedidos

O livro folheado (`/livro/folhear`) tem a cara de um **artbook de light novel**: papel claro, arte
colorida e nítida, uma cor por capítulo. Ele ainda roda com as artes que o projeto tinha — e numa
identidade assim, **a arte é o que mais pesa**. Esta é a lista do que falta pra ele ficar no nível do Livro do Jogador. **Você pega, eu
organizo e ligo no livro.**

## Como mandar

1. Salve o arquivo com o **nome exato** da tabela, na **pasta** indicada, dentro de `public/`.
2. Qualquer formato serve (JPG, PNG, WebP; vídeo em MP4 ou WebM). Eu converto e reduzo o peso.
3. Anote de onde veio (site e link) na coluna "fonte" desta lista. O projeto é de fã, sem fins lucrativos,
   mas o livro vai ter uma página de créditos, e arte de artista tem crédito.
4. Achou algo bom que não está na lista, ou não sabe o nome certo? Jogue em `public/livro/_entrada/`
   com qualquer nome. Eu abro cada uma antes de decidir onde entra; nunca decido pelo nome do arquivo.

**Tamanho mínimo:** o livro é mostrado grande e com zoom. Imagem pequena fica borrada, então vale mais uma
imagem boa do que três médias.

## Prioridade 1 — o que mais muda a cara do livro

| Arquivo | Pasta | O que é | Tamanho mínimo | Onde procurar | O que buscar | Fonte |
| --- | --- | --- | --- | --- | --- | --- |
| `abertura-cap0.jpg` … `abertura-cap5.jpg`, `abertura-apendices.jpg` | `public/livro/capitulos/` | A arte do alto da página de abertura de cada capítulo, de margem a margem, com o número grande e o kanji do capítulo por cima. **Arte de anime, colorida, sem texto e sem legenda**; o canto de cima à direita precisa ser mais calmo (é onde entra o kanji). Uma cena por capítulo; sugestões abaixo. | 1600 × 900 (deitada) | Capturas do anime (Crunchyroll, em pausa, na maior resolução); Wallhaven; Zerochan; Pixiv; ArtStation; Safebooru | `mushoku tensei scenery`, `mushoku tensei wallpaper 4k`, o nome da cena | |
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

## Prioridade 2 — acabamento

| Arquivo | Pasta | O que é | Tamanho mínimo | Onde procurar | O que buscar | Fonte |
| --- | --- | --- | --- | --- | --- | --- |
| `livro.jpg` (substitui o atual) | `public/faixas/` | A arte do livro mágico aberto com velas, que abre o sumário. A atual tem só 680 × 384 (já estava no `O-QUE-FALTA.md`). A mesma imagem em resolução maior, ou outra parecida. | 1600 × 900 | Busca reversa da atual no Google Imagens ou TinEye; Freepik | `magic book open candles fantasy art` | |
| `mapa-do-mundo.jpg` | `public/livro/mapa/` | O mapa do Mundo de Seis Faces, pra página inteira do Apêndice. | 2400 × 1600 | Wiki de Mushoku Tensei (Fandom), Reddit r/mushokutensei, Pixiv | `mushoku tensei world map`, `six faced world map` | |
| `pagina-inteira-cap1.jpg` … `pagina-inteira-cap5.jpg` | `public/livro/capitulos/` | Ilustrações de página inteira, pra pôr entre capítulos, como as pranchas do livro impresso. Opcional: duas ou três já mudam o livro. | 1700 × 2200 (em pé) | Pixiv, ArtStation, Zerochan | nome do personagem + `mushoku tensei fanart` | |
| `marca-dagua.png` | `public/livro/ornamentos/` | Um emblema pra aparecer bem apagado no fundo de algumas páginas (como o "&" do D&D). PNG **com fundo transparente**, de uma cor só. | 1000 × 1000 | Freepik, rawpixel (domínio público), Wikimedia Commons | `fantasy emblem png transparent`, `heraldic crest png`, `magic circle png transparent` | |
| `cantoneira.png` | `public/livro/ornamentos/` | Um ornamento de canto (filigrana) pra moldura das páginas de abertura. PNG transparente. | 800 × 800 | Old Book Illustrations, rawpixel, Freepik | `vintage corner ornament png`, `filigree corner transparent` | |

## Prioridade 3 — vídeo e movimento

O livro já toca os vídeos curtos das habilidades. Pra página de abertura de um capítulo ganhar movimento,
o que serve é um **laço curto**:

| Arquivo | Pasta | O que é | Como |
| --- | --- | --- | --- |
| `abertura-cap2.mp4` (e dos outros capítulos, se achar) | `public/livro/videos/` | 3 a 8 segundos em laço, **sem áudio**, da mesma cena da abertura (um feitiço sendo conjurado, uma espada girando). | Corte o trecho de um vídeo do anime no Clipchamp (já vem no Windows) ou no ezgif.com. Exporte em 720p e deixe abaixo de 4 MB. |

## O que eu faço com cada coisa

- **Papel e couro:** entram direto como o papel e a capa de todas as páginas. É a mudança mais visível.
- **Aberturas e capa:** arte impressa no papel (a tinta se funde com a mancha do pergaminho), de margem a
  margem no alto da página.
- **Pranchas e mapa:** páginas inteiras entre os capítulos.
- **Vídeos:** tocam só quando a página está aberta, sem som, e param ao virar.
