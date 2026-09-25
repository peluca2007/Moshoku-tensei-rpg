import { RACES } from "@/data/races";
import FichaDeRaca, { QuadroDasRacas, VitrineDasRacas } from "./FichaDeRaca";
import AntecedentesIlustrados, { OlhosEmMovimento } from "./FichaDeAntecedente";
import { BACKGROUNDS, LAPLACE_TABLE, MIKO_TABLE, OLHO_TABLE } from "@/data/backgrounds";
import { RANK_BONUS, RANK_REQUIREMENTS, RANKS } from "@/lib/types";
import { DESINTOX_PA_COST, RANK_PA_COST } from "@/data/trees/shared";
import { SKILLS } from "@/data/skills";
import { STARTING_KITS } from "@/data/startingKits";
import { TREES } from "@/data/trees";
import { PA_POR_GRUPO, WEAPON_GROUPS } from "@/data/weaponGroups";
import { describeGrantedSkills, describeMasteryException } from "@/lib/treeSkills";
import { Aside, BookTable, ChapterTitle, FimDoCapitulo, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import { EscadaDePatamares } from "./Diagramas";

const SKILL_ATTRIBUTE_LABEL: Record<string, string> = {
  forca: "Força",
  agilidade: "Agilidade",
  vigor: "Vigor",
  intelecto: "Intelecto",
  espirito: "Espírito",
};

/**
 * Em quantas de 100 rolagens um antecedente sai: a largura da faixa do d100.
 * Gerado da faixa, e não escrito à mão, porque o texto "Laplace em 6" ficou
 * errado quando as faixas mudaram e ninguém lembrou de reescrever a frase.
 */
function chanceNoD100(id: string): number {
  const bg = BACKGROUNDS.find((b) => b.id === id);
  return bg ? bg.rollRange[1] - bg.rollRange[0] + 1 : 0;
}

/**
 * O preço mínimo de levar UMA árvore ao Imperador (Cap. 1, §8, pergunta 5):
 * os desbloqueios do 2º ao 6º patamar, mais os N conhecimentos mais baratos
 * que o Imperador exige (RANK_REQUIREMENTS). O custo de abertura do 1º patamar
 * fica fora, porque depende de qual árvore é a Inicial.
 *
 * Conhecimento de qualquer patamar da árvore conta (getKnowledgeCount), então
 * os mais baratos saem quase todos do Principiante e do Intermediário.
 */
function custoDeProfundidade(treeId: string): { desbloqueios: number; conhecimentos: number; total: number } {
  const tree = TREES.find((t) => t.id === treeId);
  if (!tree) return { desbloqueios: 0, conhecimentos: 0, total: 0 };
  let desbloqueios = 0;
  const custos: number[] = [];
  for (const r of tree.ranks) {
    if (r.rank === "Deus") continue;
    if (r.rank !== "Principiante") desbloqueios += r.unlockPaCostOverride ?? RANK_REQUIREMENTS[r.rank].paCost;
    for (const item of [...r.abilities, ...r.talents]) custos.push(item.paCost);
  }
  custos.sort((a, b) => a - b);
  const conhecimentos = custos
    .slice(0, RANK_REQUIREMENTS.Imperador.knowledgeRequired)
    .reduce((soma, c) => soma + c, 0);
  return { desbloqueios, conhecimentos, total: desbloqueios + conhecimentos };
}

export default function Chapter1() {
  return (
    <div className="space-y-8">
      <ChapterTitle
        id="cap1"
        numero="Capítulo 1"
        resumo="De onde vem cada número da ficha: atributos, Pontos de Aprimoramento, Ranks, perícias, raça e infância."
      >
        O Núcleo do Sistema
      </ChapterTitle>
      <P className="dropcap">
        Este sistema abandona a ideia tradicional de Níveis de Personagem. Aqui, você não sobe de nível
        automaticamente; o seu crescimento é orgânico, baseado no estudo, no treinamento e no acúmulo de
        Pontos de Aprimoramento (PA).
      </P>

      <Section>
        <SectionTitle id="cap1-1">1. Criação de Personagem e Atributos</SectionTitle>
        <P>
          O sistema utiliza 5 atributos principais que definem o bônus fixo que você soma nas suas rolagens
          de d20: <b>Força</b> (poder físico, carga e ataques com armas pesadas), <b>Agilidade</b> (reflexos,
          esquiva, furtividade e ataques precisos), <b>Vigor</b> (saúde, resistência a venenos, clima e
          cansaço), <b>Intelecto</b> (memória, conhecimento de magias e lógica) e <b>Espírito</b> (força de
          vontade, carisma, liderança e resistência mental).
        </P>
        <Aside title="Distribuindo seus Pontos Iniciais">
          <P>
            Ao criar o personagem, você recebe <b>2 Pontos</b> para distribuir livremente entre os 5
            atributos base. O valor máximo por atributo na criação é 4.
          </P>
          <P>
            <b>Bônus de Raça e Antecedente não entram neste orçamento.</b> Eles são empilhados por fora —
            você os recebe em cima do que distribuiu, não competem com seus 2 pontos. Um Ogro (+2 de
            Força) sai do ponto-buy com os mesmos 2 pontos que todo mundo, e termina o personagem com a
            Força que a Raça deu mais o que ele botou.
          </P>
          <P>
            <b>Sistema de Defeitos:</b> você pode reduzir atributos pra ganhar pontos extras. As regras são
            estritas: apenas um atributo pode ficar em -1 (ganha 1 Ponto Extra) e apenas um em -2 (ganha 2
            Pontos Extras). Nada desce abaixo de -2.
          </P>
          <P>
            Repare que o defeito <b>não cria pontos</b>: ele os empresta. Com os dois defeitos você distribui
            5 pontos, mas dois atributos ficam em -1 e -2, então a <b>soma dos seus cinco atributos base fecha
            em 2</b> de qualquer jeito. É essa soma — não cada atributo isolado — que a seção 2 usa pra cobrar
            PA por pontos comprados depois da criação. Consequência direta: <b>desfazer um defeito entra na
              mesma escada progressiva</b> que qualquer outro aumento (1, 1, 2, 2, 3, 3… PA). Você não pega -2
            na criação e sobe de volta de graça — e, como o custo sobe, recomprar os dois pontos do defeito
            grande custa mais que o primeiro ponto que você comprar.
          </P>
          <Warning title="Antes de largar o Vigor, leia isto">
            Vigor é o único atributo que não governa perícia nenhuma (seção 4), o que faz dele o alvo óbvio
            do Sistema de Defeitos. É de propósito que ele seja também o único cuja escala negativa é{" "}
            <b>desproporcional</b>: a Escala do Vigor (Cap. 4, §1) multiplica seus PV Máximos por{" "}
            <b>×0,75</b> em -1 e por <b>×0,40</b> em -2 — o primeiro ponto tira um quarto da sua vida, o
            segundo tira quase metade do que sobrou, e você fica com 40% da vida de um corpo comum — e ainda
            te dá Desvantagem em toda resistência de Vigor: veneno, doença, clima, fome, Exaustão e o Fio da
            Vida. Em -2, o Fio da Vida ainda perde o Bônus de Rank e vira Falha Crítica em 1 ou 2. Largar
            Força ou Intelecto custa um número na rolagem; largar Vigor custa o personagem.
          </Warning>
        </Aside>
        <Aside title="Os Dois Atributos do Mago">
          <P>
            <b>Intelecto</b> — a Precisão: define o quanto sua magia acerta e o quanto machuca.{" "}
            <b>Espírito</b> — a Reserva: define quanto de mana o corpo consegue armazenar. Isso vale para as
            <b> quatro escolas elementais</b> (Fogo, Água, Vento e Terra), que conjuram com Intelecto. As
            outras quatro — Cura, Barreira, Desintoxicação e Espíritos e Feras — conjuram com Espírito, e nelas
            um atributo só faz as duas coisas (veja o quadro abaixo).
          </P>
          <P>
            <b>Escolas de magia não concedem PM.</b> A sua reserva inteira é{" "}
            <b>(o maior entre o seu Espírito e 4) × Maior Bônus de Rank de magia, + 8</b> — recalculada
            sempre que o seu maior patamar de magia sobe. Não há bônus extra por número de escolas abertas.
            O &ldquo;maior entre Espírito e 4&rdquo; é invisível pra quem tem Espírito 4 ou mais; ele existe
            pro cirurgião do parágrafo abaixo (Cap. 4, §1).
          </P>
          <P>
            <b>Existe um teto nos dois primeiros patamares</b>, pra que bônus de fora da árvore não
            empurrem um conjurador iniciante além do que a assinatura do próprio rank permite pagar. A
            regra completa — quem entra no teto, quem não entra, e por que ele some no Avançado — está no{" "}
            <b>Cap. 4, §1</b>, junto da fórmula. Aqui basta saber que ela existe.
          </P>
          <P>
            Abrir oito escolas no 1º patamar não te dá mana nenhuma a mais. Subir <b>uma</b> escola até o
            Imperador multiplica tudo. É por isso que o mago que vai fundo conjura e o que espalha assiste.
          </P>
          <P>
            Existem dois magos legítimos: o cirurgião (Intelecto alto — poucos tiros, todos letais) e o
            reator (Espírito alto — bombardeia o dia inteiro sem cansar). Roxy Migurdia é o primeiro. Rudeus
            Greyrat é o segundo.
          </P>
        </Aside>
        <Warning title="O Preço do Espírito">
          <P>
            Cura, Barreira, Desintoxicação e Espíritos e Feras conjuram com <b>Espírito</b> — o mesmo atributo
            que enche a reserva. Quem estuda uma delas sobe um número só e recebe duas coisas: mira e mana. O
            elementalista precisa de dois atributos altos pra chegar no mesmo lugar, e isso custa PA no alto da
            escada progressiva.
          </P>
          <P>
            O livro <b>não corrige isso proibindo</b>. Corrige cobrando: as magias das quatro escolas de
            Espírito são <b>as mais caras em PM do livro inteiro</b>, patamar por patamar. A conta já vem feita
            nas cartas — você não soma nada na mesa —, e ela é <b>+1 PM por patamar da escola</b> sobre o que
            uma magia equivalente custaria numa escola elemental: +1 no Principiante, +6 no Imperador.
          </P>
          <P>
            O resultado é que os dois magos lançam <b>o mesmo número de magias por descanso</b>. O
            elementalista tem menos mana e gasta menos; o espiritualista tem muito mais mana e gasta muito
            mais. O que muda é o que cada um faz com o turno, e é isso que devia mudar.
          </P>
        </Warning>
      </Section>

      <Section>
        <SectionTitle id="cap1-2">2. Pontos de Aprimoramento (PA)</SectionTitle>
        <P>
          A progressão ocorre quando o Mestre recompensa os jogadores com PA após sessões, missões
          importantes ou arcos da história (como subir de Rank na Guilda). Ao criar o personagem, você
          recebe <b>3 PA iniciais</b>.
        </P>
        <P>
          <b>O ritmo:</b> <b>1 PA por sessão jogada</b>, igual para o grupo inteiro, e <b>+1 PA por marco</b> —
          fim de arco, missão importante, subida de Rank na Guilda —, mais ou menos um marco a cada três
          sessões. É o ritmo em que as tabelas do livro foram calibradas: cerca de 12 PA no 3º patamar e 24 no
          5º (Cap. 5, Dojos).
        </P>
        <BookTable
          headers={["Custo", "O que você recebe"]}
          rows={[
            ["1 PA", "2 Perícias à sua escolha."],
            ["1 PA", "3 Proficiências ou Línguas à sua escolha — qualquer personagem, de qualquer árvore."],
            ["2 PA", "+PV iguais a quatro vezes o seu maior Bônus de Rank (melhoria física permanente). No 1º patamar são só +4 PV: comprar atributo rende mais cedo, e esta compra é pra quem já tem patamar alto."],
            ["2 PA", "+PM iguais ao dobro do seu maior Bônus de Rank de magia (melhoria mágica permanente). NÃO RENDE NADA enquanto o seu maior patamar de magia for Principiante ou Intermediário — o teto de PM (Cap. 4, §1) corta todo extra avulso. Libera no Avançado; a ficha bloqueia a compra até lá."],
            ["1 / 1 / 2 / 2 / 3 / 3… PA", "+1 ponto de Atributo Base permanente (teto 8). PROGRESSIVO: as duas primeiras compras custam 1 PA cada, as duas seguintes 2 PA cada, e assim por diante. Medido pela soma dos cinco atributos, então desfazer um defeito custa o mesmo que qualquer outro aumento."],
            ["2 / 3 / 4 / 4 / 4 PA", "Vantagem permanente em TODOS os Testes de Resistência de 1 Atributo à sua escolha — uma vez por atributo, no máximo 5 compras (17 PA pelas cinco). PROGRESSIVO: cada compra custa 1 PA a mais que a anterior, com teto em 4. Marcada na ficha e no PDF."],
            ["Variável", "Magias, Técnicas e Talentos de Árvore — o custo escala com o Rank (tabela na seção 3)."],
          ]}
        />
        <Aside title="Por que essas duas melhorias escalam com o Bônus de Rank">
          <P>
            +PV e +PM da tabela acima não são um número fixo — eles crescem junto com o seu maior Bônus de
            Rank (Principiante +1, até Imperador +6). Um Principiante gastando 2 PA ganha pouco; um Imperador
            gastando os mesmos 2 PA ganha seis vezes mais. Isso evita que a compra vire golpe de sorte na
            criação e lixo de ficha no topo — ela sempre pesa a mesma fração do que você já é.
          </P>
          <P>
            Comparando com o talento de reserva que quase toda árvore de Magia e do Corpo vende (Braço de
            Ferro, Osso Duro, Pele de Pedra…): o talento rende mais por PA, mas se compra uma vez só e é
            travado no número de patamares de <i>uma</i> árvore. Esta compra rende menos por PA, se repete
            quantas vezes você quiser e não tem pré-requisito. No Imperador, uma compra de cada entrega o
            mesmo tanto — escolha pela trava, não pelo número.
          </P>
        </Aside>
        <Aside title="O Padrão das Reservas">
          <P>
            Todo talento de reserva é <b>uma compra só</b>, que cresce sozinha a cada patamar novo que você
            abre naquela árvore. Nas escolas de magia ele dá <b>+2 PM e +2 PV por patamar</b> (a Terra troca
            por +4 PV, na Pele de Pedra); no Corpo, <b>+4 PV por patamar</b> ou <b>+1 PT por patamar</b>. No
            1º patamar isso é pouco; no 6º é +12 PM e +12 PV, ou +24 PV, ou +6 PT, e a mesma compra de lá
            de trás passa a valer tudo isso sem você gastar mais nada.
          </P>
          <P>
            Isso existe pra que nenhuma escola dê mais vida de graça — escolas se diferenciam pela curva de
            progressão e pelas Maestrias, nunca por um talento genérico valer mais numa do que na outra.
          </P>
        </Aside>
        <Warning title="Atenção: magia não tem preço fixo">
          Comprar Zero Absoluto não pode custar o mesmo que comprar Bola de Água. Toda aquisição dentro de
          uma Árvore de Progressão usa a tabela de custos por Rank abaixo.
        </Warning>
      </Section>

      <Section>
        <SectionTitle id="cap1-3">3. A Regra de Desbloqueio de Ranks</SectionTitle>
        <EscadaDePatamares />
        <P>
          O mundo é dividido em 7 Ranks de Maestria (Principiante, Intermediário, Avançado, Santo, Rei,
          Imperador e Deus). Você só recebe permissão pra comprar o desbloqueio de um Rank quando já possuir
          o número mínimo de conhecimentos (magias e talentos comprados) daquela mesma árvore.
        </P>
        <BookTable
          headers={["Rank", "Custo de Desbloqueio", "Conhecimentos Exigidos", "Magia Comum", "Magia Assinatura ◆", "Talento"]}
          rows={RANKS.map((rank) =>
            // O Divino nunca é comprado (Cap. 1, §3): ele aparece na tabela para
            // fechar a escada, mas com "Narrativa" no lugar de todo custo. Até
            // 2026-09-03 esta tabela imprimia DUAS linhas "Deus" — a do map, com
            // o custo de RANK_REQUIREMENTS, e uma segunda escrita à mão dizendo
            // "Narrativa" — que se contradiziam uma à outra, no meio da seção
            // que existe justamente para explicar quanto cada rank custa.
            rank === "Deus"
              ? [rank, "Narrativa", "—", "—", "—", "—"]
              : [
                  rank,
                  // O Principiante nunca custa o valor da tabela: ele é a abertura
                  // da árvore, e a abertura tem preço próprio pela ORDEM (§8) — a 1ª
                  // é grátis, a 2ª 1 PA, e assim por diante. Até 2026-09-17 esta
                  // célula imprimia "1 PA" e contradizia o §8, o passo 5 do Comece
                  // Aqui e o próprio código: o jogador novo fechava a ficha com 2 ou
                  // com 3 PA livres dependendo da página que tivesse aberto.
                  rank === "Principiante" ? "Custo de Abertura (§8)" : `${RANK_REQUIREMENTS[rank].paCost} PA`,
                  String(RANK_REQUIREMENTS[rank].knowledgeRequired || "—"),
                  `${RANK_PA_COST.common[rank]} PA`,
                  `${RANK_PA_COST.signature[rank]} PA`,
                  `${RANK_PA_COST.talent[rank]} PA`,
                ]
          )}
        />
        <P className="text-sm">
          Esta é a tabela padrão, usada por Magia e pelo Corpo. Duas famílias fogem dela, e as duas fogem pra
          baixo: <b>Árvores de Utilidade</b> (tabela própria no Cap. 3, &ldquo;Sistemas Compartilhados&rdquo;)
          e a <b>Magia de Desintoxicação</b> (Cap. 2, &ldquo;A Escola Barata&rdquo;).
        </P>
        <SubTitle>A Escola Barata — Desintoxicação</SubTitle>
        <P>
          A Desintoxicação é a única escola do livro cujo trabalho principal acontece fora do combate e cujo
          alvo é sempre um problema que o Mestre criou. Ninguém compra Purgar esperando ganhar uma luta —
          compra pra que a campanha não pare quando alguém pisa no pântano errado. Cobrar dela o preço de uma
          escola de dano era fazer o jogador pagar Fogo por um seguro contra o roteiro.
        </P>
        <BookTable
          headers={["Rank", "Magia Comum", "Magia Assinatura ◆", "Talento", "(tabela padrão, pra comparar)"]}
          rows={RANKS.filter((r) => r !== "Deus").map((rank) => [
            rank,
            `${DESINTOX_PA_COST.common[rank]} PA`,
            `${DESINTOX_PA_COST.signature[rank]} PA`,
            `${DESINTOX_PA_COST.talent[rank]} PA`,
            `${RANK_PA_COST.common[rank]} / ${RANK_PA_COST.signature[rank]} / ${RANK_PA_COST.talent[rank]} PA`,
          ])}
        />
        <Aside title="Magia Assinatura ◆">
          Dentro de cada Rank existe uma magia que define aquele patamar — a que os magos daquele nível são
          reconhecidos por saber, marcada com o símbolo ◆ nas listas. Ela custa +1 PA a mais que uma magia
          comum do mesmo rank.
        </Aside>
        <Aside title="Maestrias não contam">
          Maestrias (as passivas automáticas ganhas de graça ao desbloquear um Rank) não contam como
          conhecimento. Apenas magias e talentos efetivamente comprados com PA contam pra tabela acima.
        </Aside>
        <Warning title="E o Rank Deus">
          O patamar Divino não possui custo mecânico de PA. Como habilidades divinas beiram a onipotência e
          reescrevem as leis da realidade, este Rank só pode ser alcançado através de intenso Roleplay e
          eventos lendários na narrativa, ditados inteiramente pela história e pelo Mestre.
        </Warning>
      </Section>

      <Section>
        <SectionTitle id="cap1-4">4. O Sistema de Testes e Perícias</SectionTitle>
        <P>
          Sempre que um jogador tentar uma ação com chance de falha, ele rolará 1d20 + o Atributo
          correspondente, contra uma <b>Classe de Dificuldade (CD)</b> que o Mestre escolhe nesta escada:
        </P>
        <BookTable
          headers={["Dificuldade", "CD", "Exemplo"]}
          rows={[
            ["Fácil", "8", "Escalar um muro baixo com apoios; lembrar o nome do rei do próprio reino."],
            ["Moderada", "12", "Arrombar uma fechadura comum; acalmar um cavalo assustado."],
            ["Difícil", "15", "Seguir um rastro de três dias na chuva; convencer um guarda desconfiado."],
            ["Muito Difícil", "18", "Escalar uma parede lisa de pedra; decifrar um selo arcano incompleto."],
            ["Heroica", "21", "Atravessar uma ponte de corda em plena tempestade; achar a única passagem segura num pântano que muda toda noite."],
            ["Lendária", "25", "Coisa de canção: saltar um desfiladeiro de armadura; escalar uma parede de gelo sem corda nem gancho."],
          ]}
        />
        <P>
          <b>A CD mede a tarefa, não o patamar do grupo.</b> A mesma muralha tem a mesma CD pro Principiante e
          pro Imperador — quem cresce é você, não a parede.
        </P>
        <P>
          <b>20 e 1 naturais fora do ataque.</b> Em teste de perícia, de atributo e de resistência, um{" "}
          <b>20 natural</b> é sucesso automático (se a tarefa for possível), e um <b>1 natural</b> é falha
          com uma complicação — a corda arrebenta, o guarda chama o sargento, a ferramenta quebra. A
          complicação nunca é dano extra nem morte; só uma regra que diga isso por escrito (como o Fio da
          Vida, Cap. 4) cobra mais que isso. Numa <b>Disputa</b> (Cap. 4, &ldquo;Testes Resistidos&rdquo;),
          cada lado soma o que somaria no teste normal — Vantagem por perícia, Bônus de Rank de Utilidade —,
          e não o atributo puro: numa queda de braço, quem tem Atletismo rola com Vantagem. Numa Disputa de
          corpo contra corpo (empurrar, derrubar, desarmar, se soltar), cada lado soma também metade do seu
          maior Bônus de Rank, arredondado pra cima. Na Disputa, o 20 e o 1 naturais não têm efeito
          especial: vale o total. Se esconder não é Disputa: tem CD fixa, 10 + Espírito de cada inimigo que
          possa te procurar (Cap. 4).
        </P>
        <List
          items={[
            <span key="a">
              <b>Compra Direta (1 PA = 2 Perícias):</b> ao gastar 1 PA, o jogador escolhe e adquire 2
              Perícias simultaneamente.
            </span>,
            <span key="b">
              <b>Proficiências e Línguas (1 PA = 3, exceto grupo de arma):</b> qualquer personagem, de qualquer árvore, a qualquer
              momento. São mais baratas que Perícias porque são mais estreitas — cobrem um instrumento, uma
              ferramenta, um tipo de arma ou um idioma, não um campo inteiro de ação.
            </span>,
            <span key="c">
              <b>Perícias de Árvore:</b> a sua <b>Árvore Inicial</b> ensina perícias sozinha, e elas já
              nascem na ficha. Regra completa no bloco abaixo.
            </span>,
          ]}
        />

        <Warning title="Perícias de Árvore — só a Árvore Inicial entrega">
          <P>
            <b>Toda árvore que pode ser Árvore Inicial ensina perícias</b> — as oito de Magia, as seis do
            Corpo e as três de Utilidade. As duas híbridas (Estilo Vendaval e Punho do Fogo) ficam de fora:
            nenhuma delas pode ser a primeira que você abre. As perícias entram na sua ficha{" "}
            <b>automaticamente</b>, sem gastar PA e sem você precisar pedir.
          </P>
          <P>
            A condição é uma só: <b>você recebe as perícias da árvore que for a sua Árvore Inicial</b> — a
            primeira que você abriu, aquela que também decidiu o seu kit. A tabela abaixo lista cada uma e o
            que ela ensina.
          </P>
          <P>
            O motivo é de ficção, não de balanço: a Árvore Inicial é onde você passou a infância e a
            adolescência. Uma árvore aberta depois te ensina <i>técnicas</i>, não <i>hábitos</i> — você já era
            alguém quando chegou nela. O guerreiro que aprende Magia de Fogo aos trinta anos aprende a
            conjurar; ele não vira estudioso de Arcanismo por isso.
          </P>
          <P>
            Quanto cada pilar ensina: <b>Magia, 1 perícia fixa + 1 à sua escolha entre 3</b>.{" "}
            <b>Corpo, 2 fixas</b>. <b>Utilidade, 2 fixas + 1 à sua escolha</b>, de uma lista curta — porque o
            Bônus de Rank delas cobre quatro ou cinco perícias, e ninguém fica treinado em todas (ver Cap. 3,
            &ldquo;A Árvore de Utilidade&rdquo;).
          </P>
          <P>
            <b>Perícia repetida não se perde.</b> Sempre que raça, antecedente ou Árvore Inicial derem uma
            perícia que você já tem, escolha outra perícia qualquer da lista no lugar. O Estudioso Precoce que
            abre uma escola elemental não perde o Arcanismo do antecedente: ganha outra perícia.
          </P>
          <P>
            <b>A única exceção do livro</b> é a Maestria de 1º patamar de Furtividade e Armadilhas: ela ensina
            Furtividade e Percepção mesmo a quem chegou depois. Como quem já tem essa árvore como Inicial
            receberia perícias que já possui, nesse caso ela entrega no lugar 3 Proficiências ou Línguas — o
            mesmo 1 PA de valor, pelo outro caminho.
          </P>
        </Warning>

        <BookTable
          headers={["Pilar", "Árvore", "Ensina, se for a sua Árvore Inicial"]}
          rows={TREES.filter((t) => !t.hiddenFromCreation).map((t) => [
            t.category === "magia" ? "Magia" : t.category === "corpo" ? "Corpo" : "Utilidade",
            t.name,
            [describeGrantedSkills(t) ?? "—", describeMasteryException(t)].filter(Boolean).join(" "),
          ])}
        />

        <Aside title="Perícia, Proficiência e Bônus de Rank são três coisas">
          <List
            items={[
              <span key="p">
                <b>Perícia</b> (as 20 da lista abaixo): um campo de ação. Ter uma dá <b>Vantagem</b> quando
                ela se encaixa perfeitamente na situação.
              </span>,
              <span key="pr">
                <b>Proficiência ou Língua:</b> uma ferramenta, um instrumento, um tipo de arma ou um idioma.
                Não dá Vantagem — dá a capacidade de usar aquilo sem penalidade, ou de entender o que está
                sendo dito. 1 PA compra três.
              </span>,
              <span key="ling">
                <b>Línguas de berço:</b> todo personagem fala a <b>Língua Humana (Comum)</b> e, se o seu povo
                tiver uma, a língua dele, anotadas na raça (seção 5) — o Migurd fala a Língua Migurd, que é telepática. Qualquer
                outra se compra como Proficiência. Sem a língua, você não entende o que é dito nem lê o que
                está escrito; gestos e tom de voz continuam valendo.
              </span>,
              <span key="ferr">
                <b>Ferramenta, instrumento e veículo sem proficiência:</b> o teste sai com <b>Desvantagem</b>.
                Sem a ferramenta na mão, o teste só acontece se o Mestre permitir, e com CD +5. A perícia e a
                ferramenta se somam, não se substituem: <b>Ofícios (Forja)</b> é o saber — dá Vantagem —, e a
                proficiência em Ferramentas de Ferreiro é a mão — tira a Desvantagem.
              </span>,
              <span key="br">
                <b>Bônus de Rank em perícia</b> (só nas árvores de Utilidade): um número somado ao teste. Ele
                soma nas perícias que aquela árvore cobre — mas <b>só naquelas que você realmente tem</b>. Se
                você nunca aprendeu a perícia, não existe teste treinado onde somar o bônus.
              </span>,
            ]}
          />
        </Aside>
        <Aside title="Vantagem por Perícia">
          <P>
            Sempre que você for realizar uma ação e possuir uma Perícia que se encaixe perfeitamente na
            situação, você recebe Vantagem: role 2d20, escolha o maior resultado, e só então some o bônus do
            Atributo Base.
          </P>
          <P>
            <b>Vantagem Absoluta:</b> alguns efeitos concedem Vantagem Absoluta — role 3d20 e escolha o
            maior. Desvantagem Absoluta funciona igual, mas escolhendo o menor.
          </P>
          <P>
            <b>Ajudar:</b> quem ajuda dá Vantagem. Se quem recebe <b>já tem Vantagem</b> — e é quase sempre o
            caso, porque o grupo entrega a tarefa a quem tem a perícia —, a ajuda vira <b>+2 no teste</b>, e
            esse +2 conta no Teto de Auxílio +6 (Cap. 4, §5). Fora de combate vale o mesmo, com uma condição:
            quem ajuda precisa ter <b>uma perícia ou proficiência que se aplique</b> à tarefa. Segurar a
            tocha do ladino não é ajudar a arrombar a fechadura.
          </P>
          <P>
            <b>Teste em grupo:</b> quando o grupo inteiro tenta a mesma coisa — atravessar o pântano sem
            afundar, passar pela guarda sem chamar atenção —, todos rolam e o grupo passa se{" "}
            <b>metade ou mais</b> passar. É o que impede que um Ogro de Agilidade −2 decida sozinho o destino
            de uma cena de furtividade.
          </P>
        </Aside>

        <SubTitle id="cap1-4-pericias">Lista Mestre de Perícias</SubTitle>
        <P>
          Vinte perícias, cada uma sob o atributo que a testa. Lista fechada — sem encaixe perfeito, o teste
          é só o Atributo puro. Vigor não governa nenhuma perícia: já é a reserva de PV e a resistência a
          veneno/clima/cansaço do Capítulo 4.
        </P>
        <BookTable
          headers={["Atributo", "Perícia", "Cobre"]}
          rows={SKILLS.map((s) => [SKILL_ATTRIBUTE_LABEL[s.attribute], s.name, s.description])}
        />
        <Aside title="Sobre nomes parecidos">
          Persuasão é o argumento sincero. Lábia é o oposto: rapidez de fala, pechincha de mercado, o papo
          que convence sem precisar ser verdadeiro. Um Antecedente ou traço que mencione &quot;Diplomacia&quot;
          se refere a Persuasão — o livro usa um nome só.
        </Aside>

        <SubTitle id="cap1-4-proficiencias">Proficiências: Armas, Escudos e Armaduras</SubTitle>
        <P>
          Saber usar uma arma não é sobre o quanto ela machuca — é sobre o que a mão aprendeu a fazer. Por
          isso a proficiência aqui é por <b>grupo de arma</b>, e não por faixa de dano: quem estudou espada
          sabe espada curta e espadão, e não sabe adaga. São ofícios diferentes.
        </P>
        <Aside title="Os Oito Grupos, e os Escudos">
          <BookTable
            headers={["Grupo", "O que o treino é", "Armas"]}
            rows={WEAPON_GROUPS.map((g) => [g.name, g.description, g.examples.join(", ")])}
          />
        </Aside>
        <SubTitle id="cap1-4-como-se-ganha">Como se ganha um grupo</SubTitle>
        <P>
          A regra é de uma linha: <b>você empunha o que estudou, ou o que pagou.</b>
        </P>
        <List
          items={[
            <span key="piso">
              <b>Desarmado e Improvisado</b> vem de graça pra todo personagem. Ninguém precisa de escola
              pra dar um soco ou quebrar um banco na cabeça de alguém — mas veja o aviso abaixo: de
              graça não quer dizer bom.
            </span>,
            <span key="arvore">
              <b>Os grupos de cada árvore que você abrir.</b> Diferente das Perícias de Árvore, esta vale
              por árvore <b>aberta</b>, não só pela Inicial: perícia é hábito, mas empunhar arma é treino,
              e é exatamente o que a árvore ensina — em qualquer ordem que você chegue nela.
            </span>,
            <span key="pa">
              <b>{PA_POR_GRUPO} PA compram um grupo novo</b>, a qualquer momento.
            </span>,
          ]}
        />
        <Warning title="Grupo de arma NÃO entra no pacote de três">
          <P>
            A regra geral desta seção é <b>1 PA compra três proficiências</b>, e ela vale pra língua,
            ferramenta, instrumento e veículo — coisas estreitas, que removem uma penalidade de uma
            situação.
          </P>
          <P>
            Grupo de arma não pertence ali. Uma <b>perícia</b> (1 PA compra duas) dá Vantagem quando se
            encaixa; um <b>grupo de arma</b> remove Desvantagem numa família inteira, pra sempre, em todo
            combate. Por isso ele custa <b>{PA_POR_GRUPO} PA cada, e sozinho</b> — o preço diz o que ele
            sempre valeu.
          </P>
        </Warning>
        <Warning title="Improvisado trava em d6 — e só o Deus do Norte escapa">
          <P>
            A arma improvisada <b>não sobe na Escada de Dados</b>. Um Imperador quebra a mesma cadeira que
            um Principiante quebra, e ela faz o mesmo estrago. Sem essa trava, o grupo gratuito seria a
            melhor arma do jogo no rank alto: qualquer um pegaria um banco de taverna e rolaria 3d10 sem
            ter estudado nada, contra o espadachim que pagou por cada degrau.
          </P>
          <P>
            O <b>Estilo Deus do Norte</b> é a única exceção, e é a identidade dele em número. A árvore diz
            que não existe arma proibida pra ele — <i>&ldquo;se dá pra empunhar, você é proficiente&rdquo;</i>
            — e aqui isso deixa de ser prosa: só ele escala improvisado como arma de verdade.
          </P>
        </Warning>
        <Aside title="Armaduras continuam por peso">
          <List
            items={[
              <span key="c">
                <b>Armadura leve:</b> todo personagem é proficiente.
              </span>,
              <span key="d">
                <b>Armadura média e pesada:</b> exigem proficiência específica de uma árvore (ex: Peso Não
                Atrapalha, do Suishin-ryū) ou 1 PA.
              </span>,
              <span key="peso">
                <b>O que o peso cobra, mesmo com proficiência.</b> <b>Leve:</b> soma toda a sua Agilidade na
                CA. <b>Média:</b> soma no máximo +2 de Agilidade. <b>Pesada:</b> não soma Agilidade nenhuma e
                dá Desvantagem em Furtividade. É isso que impede a pesada de ser simplesmente a melhor: ela
                protege mais quem tem pouca Agilidade, e rouba de quem tem muita.
              </span>,
              <span key="e">
                <b>Escudo não é armadura</b> — é o grupo <b>Escudos</b>, porque escudo se empunha, não se
                veste. Ele ocupa uma mão, e essa mão é parte do preço.
              </span>,
            ]}
          />
        </Aside>
        <Warning title="Penalidade de Não-Proficiência">
          <List
            items={[
              "Arma sem proficiência: Desvantagem no teste de acerto. O dano continua normal — a Escada de Dados nunca reduz.",
              "Escudo sem proficiência: +1 de CA em vez de +2. Erguer uma tábua na frente do corpo ajuda um pouco mesmo sem treino; só não é defender.",
              "Armadura sem proficiência: Desvantagem em todo teste de ataque (com arma ou com magia) e de Concentração, Desvantagem em Furtividade e Acrobacia, e Deslocamento -3m enquanto vestida.",
            ]}
          />
        </Warning>
        <Aside title="Arma que o livro não previu">
          O catálogo não conhece todo loot de campanha, e não deveria mesmo. Uma arma que não está em grupo
          nenhum é <b>sempre proficiente</b> até o Mestre dizer de que grupo ela é — um sistema que dá
          Desvantagem em silêncio porque não reconheceu um nome é pior que um que não dá nada.
        </Aside>

        <SubTitle id="cap1-4-kit">Equipamento Inicial e a Árvore Inicial</SubTitle>
        <P>
          Ninguém começa do zero. Ao criar seu personagem, abra <b>de graça</b> o 1º patamar de pelo menos uma
          árvore — sua Árvore Inicial. Ela é a sua 1ª árvore, e o Custo de Abertura da 1ª é zero (seção 8): os
          3 PA iniciais ficam inteiros pra comprar magias, técnicas, talentos, perícias ou atributos. A Árvore
          Inicial decide o kit abaixo, recebido de graça e além do dinheiro do Antecedente (seção 6): as duas
          coisas não competem entre si.
        </P>
        <BookTable
          headers={["Árvore Inicial", "Kit Inicial"]}
          rows={STARTING_KITS.map((kit) => [
            TREES.filter((t) => t.subgroup === kit.subgroup).map((t) => t.name).join(", "),
            kit.items.map((i) => i.name + (i.description ? ` (${i.description})` : "")).join(" · "),
          ])}
        />
        <Aside title="O kit não é a build">
          O kit inicial existe só pra ninguém chegar na primeira cena de mãos vazias. Ele não substitui
          comprar magias, técnicas ou talentos com PA, e pode ser vendido, trocado ou ignorado como qualquer
          outro item da mochila.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap1-5">5. Raças do Mundo de Seis Faces</SectionTitle>
        <P>
          O mundo é habitado por diversas raças com fisiologias e culturas vastamente diferentes. A sua
          linhagem determina traços genéticos e mecânicos — os detalhes de cada uma também aparecem direto na
          ficha ao selecioná-la.
        </P>
        <QuadroDasRacas />
        <Warning title="Sorteio ou escolha: as duas portas, e o preço de cada uma">
          <P>
            <b>O padrão do livro é sortear</b> — a raça e o Antecedente (seção 6) saem do d100, e você joga o
            que a vida te deu. As raças não são equilibradas entre si de propósito: um Superd e um Humano não
            valem a mesma coisa, e é essa desigualdade que faz a rolagem valer a pena. A raridade está na
            tabela: quanto mais forte, menos provável.
          </P>
          <P>
            <b>Escolher é permitido, e custa.</b> Se você quiser escolher a raça, o Antecedente, ou os dois,
            você começa com <b>2 PA em vez de 3</b>. É o preço de trocar a sorte por controle, e é o mesmo
            preço para escolher um ou os dois — o que se compra aqui é a decisão, não a quantidade.
          </P>
          <P>
            <b>A mesa decide uma vez, para todo mundo.</b> Um grupo em que metade sorteou e metade escolheu é
            um grupo em que metade pagou por algo que a outra metade levou de graça. Combine antes da primeira
            ficha: ou todo mundo rola, ou todo mundo pode escolher pagando 1 PA.
          </P>
        </Warning>
        <Aside title="Três formas de bônus racial, e por que elas são diferentes">
          <List
            items={[
              <span key="a">
                <b>Bônus de atributo</b> (a maioria das raças): entra multiplicado em tudo que importa — PV
                pelo Fator de Vigor, PM pelo Bônus de Rank, acerto e dano direto. <b>Nunca decai.</b>
              </span>,
              <span key="b">
                <b>Bônus fixo de PV</b> (
                {RACES.filter((r) => r.bonuses.maxHp)
                  .map((r) => `${r.name.split(" (")[0]} +${r.bonuses.maxHp}`)
                  .join(", ")}
                ): somado <i>depois</i> do Fator de Vigor (Cap. 4, §1). Vale muito no 1º patamar e pouco no
                Imperador — é um bônus de começo de campanha, de propósito. A CA fixa da Raça Dragão (
                {RACES.filter((r) => r.bonuses.armorClass)
                  .map((r) => `+${r.bonuses.armorClass}`)
                  .join(", ")}
                , das escamas) segue a mesma lógica: um número que não cresce com você.
              </span>,
              <span key="c">
                <b>Bônus escalar de PM</b> (Elfo ×2, Migurd ×3): multiplica o seu <b>Maior Bônus de Rank de
                magia</b>, então vale a mesma fração da reserva do 1º patamar ao Imperador. Em compensação,
                vale <b>zero</b> pra quem nunca abriu uma escola de magia — é mana, não vida.
              </span>,
            ]}
          />
          <P>
            Duas raças fogem do padrão de propósito. O <b>Humano</b> não recebe número nenhum fixo: recebe{" "}
            <b>+1 num atributo à escolha do jogador</b> — é a única raça do livro cujo bônus muda de ficha
            pra ficha, e é literalmente o que &ldquo;adaptabilidade&rdquo; significa. O <b>Povo Pequeno</b> é
            a única com uma <b>melhoria comprável</b> (Sombra Absoluta, 3 PA): não vem de graça, o jogador
            decide se investe.
          </P>
        </Aside>
        <VitrineDasRacas />
        {/* Uma página inteira por raça no livro folheado (ver FichaDeRaca). */}
        <div className="livro-racas space-y-4">
          {RACES.map((race, i) => (
            <FichaDeRaca key={race.id} race={race} ordem={i + 1} total={RACES.length} />
          ))}
        </div>
      </Section>

      <Section>
        <SectionTitle id="cap1-6">6. O Destino e a Infância (Antecedentes)</SectionTitle>
        <P>
          O que você fez nos seus primeiros 10 anos de vida define a fundação do seu corpo, sua mana e seu
          lugar no mundo. Durante a criação da ficha, role 1d100 (ou escolha em conjunto com o Mestre) pra
          descobrir sua origem e seu dinheiro inicial em Peças de Ouro (PO).
        </P>
        <AntecedentesIlustrados />

        <SubTitle id="cap1-6-laplace">Tabela do Fator Laplace (1d4)</SubTitle>
        <P>
          O Fator Laplace não é um pacote fixo — é uma linhagem antiga acordando, e ela não acorda igual em
          dois portadores. Quem tirar este Antecedente rola <b>1d4</b> aqui pra saber o que despertou. A
          mutação é permanente, e vem <i>além</i> da Conjuração Silenciosa inata e das duas Vantagens que o
          Antecedente já concede.
        </P>
        <BookTable
          headers={["1d4", "Mutação", "Efeito"]}
          rows={LAPLACE_TABLE.map((e) => [String(e.roll), e.name, e.traits.join(" ")])}
        />
        <Aside title="Laplace e Gênio não são a mesma coisa">
          <P>
            Os dois nascem conjurando em silêncio, e é aí que a semelhança termina. O <b>Fator Laplace</b>{" "}
            sofre as penalidades normais do método (metade dos dados, área reduzida em um terço) — ele apenas
            nunca precisou aprender. O <b>Gênio</b> não sofre nenhuma das duas, e é o único personagem do
            livro que conjura em silêncio com o feitiço inteiro.
          </P>
          <P>
            É de propósito que o mais raro seja o mais forte: Gênio sai em {chanceNoD100("genio")} de 100
            rolagens, Fator Laplace em {chanceNoD100("fator-laplace")}. Até 2026-08-29 estava invertido — o
            Laplace carregava +2 de Espírito, +8 PM e +6 PV fixos e era, com folga, o melhor resultado da
            tabela apesar de ser mais comum.
          </P>
        </Aside>

        <SubTitle id="cap1-6-miko">Tabela de Miko e Amaldiçoados (1d8)</SubTitle>
        <P>
          Na sociedade humana, as anomalias de mana que causam poderes são chamadas de Miko (Criança
          Abençoada) se o poder for útil, ou Noroi-ko (Criança Amaldiçoada) se for prejudicial. Existem
          apenas cerca de 10 Mikos em todo o mundo simultaneamente.
        </P>
        <BookTable
          headers={["1d8", "Tipo", "Efeito"]}
          rows={MIKO_TABLE.map((e) => [String(e.roll), e.name, e.traits.join(" ")])}
        />

        <SubTitle id="cap1-6-olho">Tabela de Olhos Demoníacos / Místicos (1d10)</SubTitle>
        <P>Cada olho possui regras estritas de economia de ação e custo de PM.</P>
        <OlhosEmMovimento />
        <BookTable
          headers={["1d10", "Olho Místico", "Mecânica"]}
          rows={OLHO_TABLE.map((e) => [String(e.roll), e.name, e.traits.join(" ")])}
        />
      </Section>

      <Section>
        <SectionTitle id="cap1-7">7. O Valor do Rank e o Bônus de Conjuração</SectionTitle>
        <P>
          O quão forte uma magia atinge o inimigo ou a dificuldade de esquivar de um golpe de espada não
          depende só da força bruta, mas da Maestria (o Rank) naquela escola específica.
        </P>
        <BookTable
          headers={["Rank na Árvore", "Bônus Numérico"]}
          rows={RANKS.map((r) => [r, `+${RANK_BONUS[r]}`])}
        />
        <Aside title="O Bônus Depende da Ação!">
          O Bônus Numérico é específico da árvore em uso no momento. Se você atacar com Magia de Água, usa
          seu Rank de Água; se logo depois usar Magia de Cura, usa o Rank de Cura — que pode ser bem
          diferente.
        </Aside>
        <SubTitle>O Bônus de Conjuração (BC)</SubTitle>
        <P>
          O número mais importante da ficha de um mago, e ele unifica as três fórmulas do sistema num único
          valor. <b>BC = atributo-chave da escola + Bônus do Rank naquela escola.</b> O atributo-chave vem
          impresso no topo de cada árvore (Cap. 3): <b>Intelecto</b> em Fogo, Água, Vento e Terra;{" "}
          <b>Espírito</b> em Cura, Barreira, Desintoxicação e Espíritos e Feras.
        </P>
        <List
          items={[
            "Acerto Mágico: 1d20 + BC (contra a CA do alvo)",
            "CD para resistir: 8 + BC (o alvo rola 1d20 + atributo de defesa)",
            "Dano Mágico: dados da magia + BC",
          ]}
        />
        <P className="text-sm">
          <b>Punho do Fogo:</b> a árvore híbrida do Corpo também escala as técnicas por BC, e nela{" "}
          <b>BC = o maior entre Força e Intelecto + Bônus de Rank no Punho do Fogo</b> — nunca o Rank da
          Magia de Fogo.
        </P>
        <SubTitle>As Fórmulas Marciais</SubTitle>
        <P>
          Guerreiros usam a mesma lógica, trocando o atributo pelo <b>atributo-chave da árvore</b> — impresso
          no topo dela, e sempre Força, Agilidade ou Vigor. O padrão do ataque com arma é <b>Força; ou
          Agilidade com os grupos Lâminas Curtas, Arcos e Bestas, Arremesso e Flexíveis</b>. Duas árvores
          fogem disso e dizem por quê. <b>Escudos e Fortificação</b> usa <b>Vigor</b>: ela vende aguentar, não
          acertar. O <b>Deus da Água (Suishin-ryū)</b> usa <b>Agilidade</b> mesmo empunhando espada — um grupo
          de Força —, porque o estilo inteiro é ler o golpe e chegar meio segundo antes dele; aparar, postura
          e contragolpe são timing, e timing é Agilidade.
        </P>
        <List
          items={[
            "Acerto Físico = 1d20 + Atributo + Bônus de Rank.",
            "CD de uma Técnica = 8 + Atributo + Bônus do Rank da Técnica.",
            "Dano Total = Dados da Arma + Atributo + Bônus de Rank.",
            "Qual Rank: numa técnica nomeada, o da árvore que a ensinou. Num ataque comum (sem técnica), o maior Rank entre as suas árvores do Corpo, ou +0 se você não tiver nenhuma (Cap. 3, \"A Árvore do Corpo — Sistemas Compartilhados\").",
          ]}
        />
      </Section>

      <Section>
        <SectionTitle id="cap1-8">8. Misturando Árvores (Multiclasse)</SectionTitle>
        <P>
          Este sistema não tem classes — nada impede você de ser Trovador de Bardo, Rastreador do Tático,
          Intermediário de Fogo e Principiante do Norte ao mesmo tempo. É intencional e é o coração do jogo.
          Sete perguntas, sete respostas:
        </P>
        <Aside title="1. Qual Bônus de Rank eu uso?">
          O da árvore que concedeu a habilidade, sempre. Exceção: quando uma regra genérica pedir seu Bônus
          de Rank sem dizer de qual árvore, use o maior que você possuir em qualquer uma — exceto no ataque
          comum com arma, que usa só as árvores do Corpo (seção 7). Um Imperador de Fogo sem árvore do Corpo
          ataca com espada somando +0, não +6.
        </Aside>
        <Aside title="2. Conhecimentos somam entre árvores?">
          Nunca. A contagem de conhecimentos pra desbloquear um patamar conta apenas magias, técnicas e
          talentos daquela mesma árvore.
        </Aside>
        <Aside title="3. Como somam PV, PT e PP?">
          <List
            items={[
              "PV: uma reserva só, calculada de uma vez. Os Dados de PV de TODAS as suas árvores entram no mesmo somatório do Cap. 4, §1 — abrir uma segunda árvore acrescenta dados novos à mesma conta, não uma segunda barra de vida.",
              "PM somam apenas das escolas de magia.",
              "PT: reserva única, mesmo com vários estilos marciais. PT = Vigor + Espírito + 1 por patamar em qualquer árvore do Corpo, desde o 1º (+2 por patamar em Cavalaria e Escudos) — detalhes no Cap. 3, \"Pontos de Touki\".",
              "PP: reserva única, mesmo com várias árvores de Utilidade. PP = Intelecto + o maior atributo-chave entre suas árvores de Utilidade, +1 por patamar 3º ou superior em qualquer uma delas. No Tático, cujo atributo-chave já é Intelecto, o segundo termo vira o Bônus de Rank — ver Cap. 3, \"Pontos de Preparação\".",
            ]}
          />
          Você nunca tem duas reservas do mesmo tipo.
        </Aside>
        <Aside title="4. Custo de Abertura">
          <P>Abrir uma árvore nova fica mais caro a cada árvore que você já tem:</P>
          <BookTable
            headers={["Árvore", "1ª", "2ª", "3ª", "4ª", "5ª"]}
            rows={[["Custo de abertura", "grátis", "1 PA", "2 PA", "3 PA", "4 PA"]]}
          />
          <P>
            <b>A primeira é de graça</b>, e por um motivo: ela é a sua Árvore Inicial, já escolhida na
            criação e já acompanhada de um kit (seção 4). Cobrar PA por ela seria cobrar duas vezes pela
            mesma coisa.
          </P>
          <P>
            Cada 1º patamar entrega uma Maestria gratuita — sem o Custo de Abertura, a jogada ótima seria
            abrir cinco árvores por 4 PA e colecionar cinco Maestrias sem nunca subir nenhuma. Agora isso
            custa <b>10 PA</b>, e continua sendo uma opção legítima — só não é mais de graça.
          </P>
        </Aside>
        <Aside title="5. Largura ou profundidade?">
          <P>
            <b>Profundidade custa cerca de {custoDeProfundidade("fogo").total} PA</b> na Magia de Fogo, fora a
            abertura — não os {custoDeProfundidade("fogo").desbloqueios} que a escada de desbloqueios sugere.
            Esses {custoDeProfundidade("fogo").desbloqueios} PA (1+2+2+3+3, do 2º ao 6º patamar) são só a
            porta; pra ter <i>direito</i> de comprá-los você precisa acumular{" "}
            {RANK_REQUIREMENTS.Imperador.knowledgeRequired} conhecimentos naquela mesma árvore (seção 3), e
            os {RANK_REQUIREMENTS.Imperador.knowledgeRequired} mais baratos custam outros{" "}
            {custoDeProfundidade("fogo").conhecimentos} PA — quase todo o Principiante e o Intermediário, a 1
            PA cada, e o resto a 2. Em troca: Bônus de Rank +6, seis Maestrias, e as magias que só existem lá
            em cima.
          </P>
          <P>
            <b>Largura custa 10 PA</b> por cinco árvores (Custo de Abertura 0+1+2+3+4, pergunta 4 acima) e
            entrega cinco Maestrias de 1º patamar, versatilidade e nenhum teto — mas trava seu Bônus de Rank
            em +1, o que significa errar mais, causar menos dano e ter CDs que qualquer coisa resiste.
          </P>
          <P>
            Ou seja: largura é <b>mais barata</b>, profundidade é <b>mais forte</b>. O sistema cobra pelos
            dois caminhos e não deixa nenhum ser simplesmente melhor — mas é bom saber qual dos dois está
            pedindo mais da sua ficha antes de escolher.
          </P>
        </Aside>
        <Aside title="6. E o Rank Deus?">
          Sempre narrativo e sempre de uma árvore. Ninguém no Mundo de Seis Faces jamais alcançou o patamar
          Deus em duas coisas ao mesmo tempo — o livro trata isso como impossível, não como difícil.
        </Aside>
        <Aside title="7. E se eu for fundo em duas árvores ao mesmo tempo?">
          Algumas combinações de Rank Intermediário ou superior revelam uma <b>árvore híbrida</b> que não existe
          pra ninguém que não cumpriu os dois pré-requisitos — hoje são duas, ambas no catálogo da Árvore do Corpo: o
          <b>Estilo Vendaval</b> (Deus do Norte + Magia de Vento, ambas no Avançado) e o <b>Punho do Fogo</b>
          (Lutador + Magia de Fogo, ambas no Intermediário). Nenhuma das duas aparece na escolha da Árvore Inicial, e o desbloqueio dela não é travado por código nenhum — o
          Mestre decide, do mesmo jeito que já decide a Raça Dragão e o Rank Deus.
        </Aside>
      </Section>

      <FimDoCapitulo id="cap1" />
    </div>
  );
}
