<div align="center">

# Mushoku Tensei RPG

**Um sistema de RPG de mesa completo, o livro que o ensina e o site que o joga.**

[**Abrir o site →**](https://moshoku-tensei-rpg.vercel.app) · [O livro](https://moshoku-tensei-rpg.vercel.app/livro) · [Notas de versão](https://moshoku-tensei-rpg.vercel.app/novidades)

Instalável e **funciona inteiro sem internet**, porque mesa de RPG acontece em porão sem sinal.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Testes](https://img.shields.io/badge/testes-Vitest-3FB950)](src/store/selectors.test.ts)
[![Notas de versão](https://img.shields.io/badge/hist%C3%B3rico-notas%20de%20vers%C3%A3o-8B1E3F)](src/data/patchNotes.ts)
[![Uso](https://img.shields.io/badge/uso-f%C3%A3%20n%C3%A3o--comercial-6B7280)](#licença-e-créditos)

</div>

> [!NOTE]
> Homenagem de fã, sem fins comerciais. Não afiliado à Media Factory, ao Studio Bind ou aos autores da
> obra original.

---

## O que é

Um RPG de mesa ambientado no Mundo de Seis Faces, de *Mushoku Tensei*, e tudo o que a mesa usa para
jogá-lo:

| | |
| --- | --- |
| 📖 **O livro** | O livro de regras inteiro, lido em duas formas: **Livro** (páginas de tamanho fixo, duas colunas, virada de folha, busca, PDF) e **Contínuo** (rolagem, o padrão no celular). |
| 🧙 **A ficha** | Criação guiada (manual, roleta ou entrevista), cálculo de tudo o que deriva, descanso, condições, rolador, impressão em PDF e compartilhamento por link, arquivo ou QR. |
| 🌳 **As 19 árvores** | O mapa de progressão: cada escola de magia, estilo de combate e ofício, com os 7 patamares e as 632 habilidades e talentos. |
| 🛡️ **Ferramentas do Mestre** | Construtor de encontros com orçamento de dificuldade, simulador de combate (com a arena das batalhas), bestiário, iniciativa e comparador de builds. |
| 🛒 **A loja** | Os itens da Guilda, com disponibilidade, preço e revenda. |

O livro, a ficha, o mapa e a loja não são quatro produtos: são quatro leituras do mesmo `src/data/`.

---

## A premissa do sistema

**Não existe nível de personagem.** Você não sobe de nível; você estuda. O crescimento inteiro passa por uma
moeda só, os **Pontos de Aprimoramento (PA)**, que o Mestre entrega por sessão, missão ou arco, e que você
gasta em atributos, perícias ou nas **árvores**.

Cada árvore tem sete patamares: Principiante, Intermediário, Avançado, Santo, Rei, Imperador e Deus. Abrir um
patamar exige um número mínimo de **conhecimentos** (magias e talentos comprados) na mesma árvore: não dá
para comprar o topo, só escalá-lo.

Três decisões estruturam o resto:

**1. Largura é barata, profundidade é forte.** Abrir a segunda árvore custa mais que a primeira, a terceira
mais que a segunda, e a reserva de mana escala com o *maior* patamar de magia, não com quantas escolas você
abriu. Quem espalha assiste; quem vai fundo conjura.

**2. Cada escola prepara uma condição e cobra outra.** Água deixa **Molhado** e cobra **Congelado**; Terra
deixa **Atolado** e cobra **Soterrado**; Vento aplica **Desequilibrado** e cobra dano extra; Fogo cobra
**Em Chamas** na hora. Os três estilos de espada não têm condição de propósito: Deus da Espada é letalidade
pura, Deus do Norte é improviso, Deus da Água é contra-ataque.

**3. O cântico é mecânica, não decoração.** Recitar bem dá Vantagem, e o tamanho do encantamento escala com o
rank. O preço do bônus é tempo real de jogo.

---

## Rodando localmente

**Requisitos:** Node.js 20+ e npm.

```bash
git clone https://github.com/peluca2007/Moshoku-tensei-rpg.git
cd Moshoku-tensei-rpg
npm install
npm run dev
```

Abra <http://localhost:3000>. Não há banco de dados, variável de ambiente nem backend: as fichas moram no
`localStorage` do navegador e podem ser exportadas a qualquer momento (link, arquivo `.mtficha`, QR ou PDF).

### Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` · `npm start` | Build e servidor de produção |
| `npm test` | Testes (Vitest): fórmulas, regras, simulador, dados do livro |
| `npm run lint` · `npx tsc --noEmit` | ESLint e tipos |

**Conferem o livro e os dados** (rodam sem servidor):

| Comando | O que confere |
| --- | --- |
| `npm run check:livro` | Consistência entre os dados e o texto do livro |
| `npm run check:texto` | O texto de cada habilidade contra os campos dela |
| `npm run check:termos` | Toda condição, estado ou unidade citada está definida no livro |
| `npm run check:remissoes` | Toda remissão ("Cap. 4, §6") aponta para um lugar que existe |
| `npm run check:redundancia` | Habilidades que repetem um patamar anterior |
| `npm run check:arvores` · `check:progressao` · `check:sobrevivencia` | O balanço das árvores, por Ação e por patamar |
| `npm run check:midia` | As artes publicadas estão mapeadas e dentro do limite de tamanho |
| `npm run balancear` · `medir:regua` · `medir:orcamento` | O simulador mede o balanço, a régua do Apêndice C e o orçamento de encontro |

**Abrem um Chrome de verdade** (rodam contra `npm run dev` ou `npm start`; `BASE=http://localhost:3010` aponta outro servidor):

| Comando | O que confere |
| --- | --- |
| `npm run check:mobile` | Transbordo horizontal de 320 a 414 px |
| `npm run check:contraste` | Contraste WCAG AA, nos quatro temas |
| `npm run check:a11y` | Controle sem nome, campo sem rótulo, hierarquia de cabeçalhos |
| `npm run check:offline` | As rotas abrindo com o servidor morto (precisa de `npm run build`) |
| `npm run check:sumario` | O sumário do livro cita toda seção que existe, e só elas |
| `npm run revisar:livro` | Percorre o livro folheado página a página: título separado do texto, estouro, arte quebrada, tabela-torre, vãos. Grava as fotos em `.telas/revisao/` e o diário da diagramação em `public/livro/` |
| `npm run medir:folhear` | Quanto o modo Livro leva para abrir (rápido e com CPU 4× mais lenta) |
| `npm run tela <rota>` | Fotografa uma rota em qualquer largura e tema |

> [!IMPORTANT]
> Os checks que abrem um Chrome devem rodar **do mesmo lado em que o Chrome está**: dentro do WSL, um Chrome do
> Windows abre a porta de depuração do lado de lá e o script não a alcança. Aponte outro navegador com
> `CHROME=/caminho/do/chrome` se precisar.

---

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Capa, com a versão atual das notas |
| `/livro` | O livro de regras (Livro e Contínuo) |
| `/criar` | Criação de personagem: Manual, Roleta e Entrevista |
| `/ficha` | A ficha completa |
| `/personagens` | O roster de fichas salvas |
| `/arvores` | O mapa de progressão das 19 árvores |
| `/loja` | A loja da Guilda |
| `/mestre` | Painel do Mestre: as fichas do grupo lado a lado e a porta das ferramentas dele |
| `/encontros` | Construtor de criaturas e chefes, simulação contra o grupo e a arena das batalhas |
| `/iniciativa` · `/comparar` · `/sessao` | Rastreador de iniciativa, comparador de builds e registro de sessão |
| `/busca` | Busca global nos verbetes do livro |
| `/novidades` | Notas de versão, por fase e por área |

---

## Arquitetura

```
src/
├── data/          FONTE DE VERDADE: regras, números, conteúdo
│   ├── trees/     as 19 árvores e as tabelas de custo (shared.ts)
│   ├── races.ts · backgrounds.ts · skills.ts · shopItems.ts · bestiary.ts …
│   └── patchNotes.ts · fasesDasNotas.ts   o histórico, por versão e por fase
│
├── lib/           tipos e cálculos puros, sem React (rolagem, simulador de combate, encontros…)
├── store/         estado global (Zustand): o roster, a persistência e as migrações
│   └── selectors.ts   TODAS as fórmulas derivadas
├── components/
│   ├── book/      o livro: um arquivo por capítulo + o motor do modo Livro (folhear/)
│   └── …          ficha, criação, loja, árvores, encontros, notas de versão
└── app/           rotas (App Router)

public/sw.js       o service worker, escrito à mão: é ele que faz o site abrir sem rede
scripts/           os checks, as medições e as ferramentas de revisão do livro
```

### As três regras da base de código

**1. Um número, uma origem.** Nenhuma fórmula é reimplementada numa página. `selectors.ts` é o gargalo de
propósito: o livro nunca diverge da ficha porque os dois leem o mesmo `TREES` e o mesmo `getMaxHp`. Todo
custo em PA sai de uma função ou tabela exportada, nunca de um literal digitado na interface.

**2. Divergir da tabela exige justificar.** As tabelas de custo são o padrão sugerido, não a lei: uma magia
pode declarar `actions` ou `paCost` próprios, mas então o campo `costNote` é **obrigatório** e explica a
troca em uma frase. Sem a nota, um desvio é indistinguível de um erro de digitação.

**3. Ficha salva nunca é resetada.** `useCharacterStore` é a única coisa que escreve no `localStorage`.
Mudou o formato da ficha, ou o id de um item ou talento? Sobe a `version` e escreve a migração: já existem
fichas reais de mesa salvas.

```
src/data/*.ts  ──►  selectors.ts  ──►  componentes
   (regras)         (fórmulas)         (livro, ficha, árvores, loja)
                          ▲
                useCharacterStore  ──►  localStorage
                   (a sua ficha)
```

---

## Contribuindo

**O livro é a fonte.** Toda regra, magia, talento ou número nasce em `src/data/*.ts` **e** no texto
correspondente em `src/components/book/*.tsx`, nunca só num lugar. Se uma mudança na ficha expõe uma lacuna de
regra, a correção sai primeiro no livro e a ficha só reflete o que já está escrito lá. O site pode não ter
algo que o livro tem; o contrário, nunca.

Antes de abrir uma mudança: `npm test`, `npm run lint`, `npx tsc --noEmit -p .` e, se mexeu no livro,
`npm run check:livro`, `check:texto`, `check:termos` e `check:remissoes`. Mudou o texto ou a diagramação do
livro folheado? Rode também `npm run revisar:livro` e suba junto os `public/livro/diagramacao-*.json` que ela
regrava (é com eles que o modo Livro abre rápido).

Mudanças de regra entram nas notas de versão, em [`src/data/patchNotes.ts`](src/data/patchNotes.ts), a única
cópia. Cada bloco diz a sua área (regras, livro, encontros, site, desempenho ou bastidores), e as versões se
agrupam em fases em [`src/data/fasesDasNotas.ts`](src/data/fasesDasNotas.ts).

### Issues: como reportar

Este repositório trata **bug de código** e **desequilíbrio de regra** como duas coisas diferentes, com dois
formulários diferentes. Confundir os dois é o erro mais comum, e o que mais atrasa a correção.

> **A pergunta que separa os dois:** o site está fazendo o que o livro manda?
>
> - **Não** → o site errou. É **🐛 bug de código**.
> - **Sim, e o resultado ainda é absurdo** → o livro errou. É **⚖️ desequilíbrio de regra**.

| Template | Use quando | Exemplo |
| --- | --- | --- |
| 🐛 **Bug de código** | O site discorda do livro, quebra ou calcula errado | *"A ficha mostra 10 PA nas Vantagens de Resistência e 17 PA no total."* |
| ⚖️ **Desequilíbrio de regra** | A regra funciona como escrita e mesmo assim quebra a mesa | *"Um espadão já satura o 4d10 no Rei: a Maestria de Imperador não entrega nada."* |
| ✨ **Conteúdo novo** | Falta uma magia, item, criatura ou árvore | *"Vento não tem como tirar um aliado do corpo a corpo."* |
| 💬 **Discussions** | Você não entendeu uma regra | *"Manto de Touki soma com Postura de Água?"* |

Balanceamento não se decide por opinião, e sim por número. O livro traz duas réguas: o **Apêndice C** (quanto
cada árvore deve causar por turno em cada patamar) e o **Apêndice G** (PV, CA, bônus de ataque e CD esperados
por patamar). Uma issue que traz a conta escrita (`4d10 (média 22) × 5 + Força 8 + Rank 6 = 124 em 2 Ações`),
o JSON da ficha (`/ficha` → *Exportar*) e o que a proposta quebra costuma virar mudança no mesmo dia.

| Label | Significa |
| --- | --- |
| `bug` | O site discorda do livro |
| `balanceamento` | O livro discorda da mesa |
| `conteúdo` | Falta alguma coisa |
| `precisa-de-numero` | O caso é plausível, mas ninguém fez a conta ainda |
| `precisa-de-mesa` | A conta fecha, mas falta ver acontecer numa sessão real |
| `decisão-de-design` | Não é erro; é uma escolha que o dono do sistema precisa fazer |

---

## Licença e créditos

Projeto de fã, **não-comercial**, sem afiliação com os detentores dos direitos da obra. O repositório não
traz licença de código aberto: sem ela, o código e o texto continuam com o autor, e usar é com combinado.
As ilustrações do livro pertencem aos respectivos artistas e à obra original.

<div align="center">
<sub>Mushoku Tensei © Rifujin na Magonote · Media Factory · Studio Bind</sub>
</div>
