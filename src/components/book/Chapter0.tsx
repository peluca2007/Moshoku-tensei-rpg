import Link from "next/link";
import { Aside, BookTable, ChapterTitle, FimDoCapitulo, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import Prancha from "./Prancha";

/** Introdução curta às regras; os capítulos seguintes trazem os detalhes. */
export default function Chapter0() {
  return (
    <div className="space-y-8">
      <ChapterTitle
        id="cap0"
        numero="Abertura"
        resumo="A leitura de cinco minutos que basta pra sentar na mesa hoje. Nenhuma regra inteira — a forma de todas elas."
      >
        Comece Aqui
      </ChapterTitle>
      <P className="dropcap">
        Cinco minutos de leitura, e você joga. Este capítulo não tem nenhuma regra completa — ele tem a
        forma de todas elas. O resto do livro é referência: você consulta, não decora.
      </P>

      <Section>
        <SectionTitle id="cap0-1">1. O que é este jogo</SectionTitle>
        <P>
          Um RPG de mesa no Mundo de Seis Faces, de <i>Mushoku Tensei</i>. Um jogador conduz a história (o{" "}
          <b>Mestre</b>) e os outros interpretam um personagem cada. Quando alguém tenta algo que pode dar
          errado, rola <b>1d20</b>, soma um número da ficha, e compara com uma dificuldade. É isso.
        </P>
        <Aside title="A única coisa que torna este sistema diferente">
          <P>
            <b>Não existe nível de personagem.</b> Você não &ldquo;sobe de nível&rdquo; e recebe um pacote
            pronto. Você recebe <b>Pontos de Aprimoramento (PA)</b> do Mestre e gasta um por um, em qualquer
            ordem, no que quiser: um ponto de atributo, duas perícias, uma magia, um patamar novo de uma
            escola.
          </P>
          <P>
            A consequência prática é que <b>ninguém tem classe</b>. Um personagem é a soma do que estudou. Se
            você comprou magia de Fogo e treino de espada, você é as duas coisas — o sistema não tem uma
            palavra pra isso porque não precisa.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap0-2">2. A ficha em seis números</SectionTitle>
        <P>Tudo na sua ficha desce destes seis. Se você entender estes, entendeu a ficha.</P>
        <BookTable
          headers={["Número", "O que é", "Onde a regra completa está"]}
          rows={[
            ["Atributos", "Força, Agilidade, Vigor, Intelecto, Espírito. Somam direto na rolagem de d20.", "Cap. 1, §1"],
            ["PV", "Sua vida. A 0, você começa a morrer — mas não morre de imediato.", "Cap. 4, §1"],
            ["PM / PT / PP", "Combustível. PM é magia, PT é aura de guerreiro, PP é preparação. Quem estuda mais de um pilar carrega mais de uma reserva, nunca duas do mesmo tipo.", "Cap. 4, §1 · Cap. 3"],
            ["CA", "O quanto é difícil te acertar. 10 + Agilidade + armadura (a armadura média limita a Agilidade a +2; a pesada não soma Agilidade).", "Cap. 4, §1"],
            ["Bônus de Rank", "O quão bom você é numa escola específica. +1 no começo, +6 no topo.", "Cap. 1, §7"],
            ["PA", "A moeda do crescimento. Tudo que você compra sai daqui.", "Cap. 1, §2"],
          ]}
        />
        <Warning title="O Bônus de Rank é por árvore, não por personagem">
          Este é o erro nº 1 de quem vem de outros sistemas. Você não tem &ldquo;um nível&rdquo;: você tem um
          Rank <b>em cada escola que estudou</b>. Ao atacar com Magia de Água, soma o seu Rank de Água. Ao
          curar no turno seguinte, soma o seu Rank de Cura — que pode ser bem menor. A ficha tem vários
          números de rank ao mesmo tempo, e isso é normal.
        </Warning>
      </Section>

      <Section>
        <SectionTitle id="cap0-3">3. Um turno de combate</SectionTitle>
        <P>
          Rola-se Iniciativa (1d20 + Agilidade) uma vez, e a ordem vale a luta inteira. No seu turno você tem{" "}
          <b>3 Ações</b> pra gastar como quiser, e <b>1 Reação</b> por rodada pra usar fora do seu turno.
        </P>
        <List
          items={[
            <span key="a"><b>Andar</b> — 1 Ação, até 9 metros.</span>,
            <span key="b"><b>Atacar</b> — 1 Ação. Rola 1d20 + atributo + o maior Bônus de Rank entre suas árvores do Corpo (+0 se não tiver nenhuma) contra a CA do alvo. Técnica nomeada usa o Rank da árvore que a ensinou.</span>,
            <span key="c"><b>Conjurar</b> — de 2 a 6 Ações conforme o rank da magia: Principiante e Intermediário 2, Avançado e Santo 3, Rei e Imperador 4, e as seis Grandes Obras 5 ou 6 (Encurtada e Silenciosa custam menos, Cap. 2). Pode ser dividido entre turnos: do Avançado em diante, já passa de um turno se você também se mover.</span>,
            <span key="d"><b>Usar item, ajudar, se esconder, esquivar</b> — 1 Ação cada.</span>,
          ]}
        />
        <Aside title="Não existe ação bônus">
          Existem efeitos que a própria carta marca <b>&ldquo;sem gastar Ação&rdquo;</b>, sempre com um limite escrito.
          <b> Conjurar</b> sem gastar Ação só acontece nas fontes do quadro do Cap. 2, §2.
        </Aside>

        <SubTitle id="cap0-exemplo">Uma rodada, jogada de verdade</SubTitle>
        <P>
          Dois aventureiros contra dois lobos de gelo. Repare em quantas coisas acontecem sem ninguém
          consultar uma tabela.
        </P>
        <BookTable
          headers={["Quem", "O que faz", "A conta"]}
          rows={[
            [
              "Elina (Água, Intermediária)",
              "Conjura Flecha de Água no lobo da frente. Ele fica Molhado.",
              "2 Ações pra conjurar. 1d20 + BC 5 contra CA 13. Acerta: 1d8+5 de dano. Sobra 1 Ação, e ela recua 9 metros.",
            ],
            [
              "Borg (Deus do Norte, Principiante)",
              "Chuta areia no segundo lobo e ataca com o machado.",
              "O chute é o Improviso da Maestria (1 Ação, uma vez por combate): o lobo testa Agilidade com Desvantagem contra CD 8 + Força 3 + Rank 1 = 12, falha e fica Cego até o fim do próximo turno dele. Borg ataca com Vantagem (alvo Cego): 1d10 + 3 + 1.",
            ],
            [
              "Lobo (turno dele)",
              "O lobo Molhado avança e morde Borg.",
              "Nada acontece de especial — mas o lobo continua Molhado, e é isso que importa no próximo turno dela.",
            ],
            [
              "Rodada 2 — Elina",
              "Impacto de Gelo no lobo Molhado.",
              "O frio dobra contra Molhado: 1d8 + 5 vira 2d8 + 5, passe ele no teste ou não, e o lobo cai.",
            ],
          ]}
        />
        <Aside title="O que este exemplo mostra">
          <P>
            Elina não causou muito dano no primeiro turno — ela <b>preparou</b>. O dano veio no segundo, e
            veio dobrado. Isso não é uma tática esperta: é literalmente a mecânica central da Magia de Água,
            escrita no topo do catálogo dela (Cap. 3, &ldquo;Como Ler uma Árvore&rdquo;).
          </P>
          <P>
            Toda árvore deste livro tem uma dessas. Descobrir qual é a da sua é a coisa mais útil que você
            pode fazer antes da primeira sessão.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap0-4">4. Criando um personagem em seis passos</SectionTitle>
        <Prancha id="cap0-4" />
        <P>
          A versão curta. O Capítulo 1 tem cada passo por inteiro, e o site faz tudo isto pra você em{" "}
          <Link href="/criar" className="text-wine-600 underline decoration-dotted hover:text-wine-500 dark:text-wine-300">
            /criar
          </Link>
          .
        </P>
        <BookTable
          headers={["#", "Passo", "Detalhe"]}
          rows={[
            ["1", "Role a Raça (1d100)", "Humano, Elfo, Anão, Migurd, Ogro, Povo Pequeno, Raça Fera… Quanto mais forte, mais rara. Cada uma dá bônus por fora do seu orçamento de pontos; escolher em vez de rolar custa 1 PA (Cap. 1, §5)."],
            ["2", "Role o Antecedente (1d100)", "Sua infância. Decide perícias, traços e quanto ouro você começa com."],
            ["3", "Distribua 2 pontos de atributo", "Só dois. Você pode baixar um atributo a -1 e outro a -2 pra ganhar mais três — mas leia o aviso sobre o Vigor antes."],
            ["4", "Escolha a Árvore Inicial", "A mais importante das seis decisões: ela dá o seu kit grátis, as suas perícias iniciais, e define o que você faz numa luta."],
            ["5", "Gaste os PA iniciais", "Gaste os PA iniciais — 3, ou 2 se a mesa escolheu em vez de sortear. A Árvore Inicial abre de graça (Cap. 1, §8); os PA compram magias, técnicas, talentos, perícias ou atributos."],
            ["6", "Anote PV, PM, CA", "Ou deixe o site calcular. As fórmulas estão no Cap. 4, §1."],
          ]}
        />
        <Warning title="Antes do passo 4, leia a tabela das dezenove mecânicas">
          Está no Cap. 3, &ldquo;Como Ler uma Árvore&rdquo;. Ela mostra, lado a lado, o que cada árvore faz e{" "}
          <b>o que ela não faz</b>. É a única página do livro que vale ler inteira antes de fechar a ficha —
          escolher a Árvore Inicial pelo nome é o jeito mais comum de terminar com um personagem que não faz
          o que você queria.
        </Warning>
      </Section>

      <Section>
        <SectionTitle id="cap0-5">5. Onde está cada coisa</SectionTitle>
        <BookTable
          headers={["Se você quer…", "Vá para"]}
          rows={[
            ["Criar ou evoluir um personagem", "Cap. 1 — atributos, PA, ranks, perícias, raças, antecedentes"],
            ["Entender como magia funciona", "Cap. 2 — cânticos, tempo de conjuração, interrupção, combinações"],
            ["Escolher ou ler uma árvore", "Cap. 3 — as 19 mecânicas, Touki, PP, e o catálogo completo"],
            ["Resolver uma dúvida no meio de uma luta", "Cap. 4 — condições, ações, críticos, morte, exaustão"],
            ["Saber o que fazer entre aventuras", "Cap. 5 — descanso, guilda, reputação, fabricação, loja"],
            ["Uma resposta rápida para uma discussão de mesa", "Apêndice D — Ambiguidades Resolvidas"],
          ]}
        />
        <Aside title="Três atalhos que economizam sessão">
          <List
            items={[
              "O glossário de condições (Cap. 4, §2) é a página mais consultada do livro. Se uma habilidade diz 'fica Atolado', o que isso significa está lá, e só lá.",
              "Toda árvore declara, no topo do catálogo dela, o que ela concede de arma e armadura. É a primeira pergunta que a mesa faz e a mais chata de procurar.",
              "O Apêndice C tem quanto dano cada árvore deveria causar em cada patamar. Se o seu número está muito longe da coluna, alguma conta está errada.",
            ]}
          />
        </Aside>
      </Section>

      <FimDoCapitulo id="cap0" />
    </div>
  );
}
