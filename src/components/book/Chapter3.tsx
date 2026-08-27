import Link from "next/link";
import { TREES, CATEGORY_LABELS } from "@/data/trees";
import { RANK_BONUS, RANKS } from "@/lib/types";
import { Aside, BookTable, ChapterTitle, List, P, Quote, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import TreeCatalog from "./TreeCatalog";

export default function Chapter3() {
  const rankLabelTrees = TREES.filter((t) => t.rankLabels);

  return (
    <div className="space-y-8">
      <ChapterTitle id="cap3">Capítulo 3 — As Árvores de Progressão</ChapterTitle>
      <P>
        Não existem classes engessadas ou papéis que limitam suas escolhas. O sistema funciona através de
        Árvores de Progressão, divididas em três grandes pilares: a <b>Árvore da Magia</b> (feitiços de
        ataque, suporte e invocação — recurso PM), a <b>Árvore do Corpo</b> (os três Estilos Divinos de
        esgrima, mais armas pesadas, escudos e arquearia — recurso PT) e a <b>Árvore de Utilidade</b> (os
        especialistas em mundo — funciona por perícia, posicionamento e usos por descanso).
      </P>
      <Warning title="O catálogo completo está logo abaixo, seção 'Todas as Sub-árvores'">
        Este capítulo primeiro cobre as regras <i>compartilhadas</i> entre árvores do mesmo pilar, e termina
        com o catálogo completo de magias, talentos, técnicas e Maestrias das 17 sub-árvores — o mesmo dado
        que alimenta a ficha, então nunca diverge dela. Prefere navegar visualmente? O{" "}
        <Link href="/arvores" className="text-wine-600 underline decoration-dotted hover:text-wine-500 dark:text-wine-400">
          mapa de Árvores
        </Link>{" "}
        mostra o mesmo conteúdo ligado ao progresso do seu personagem.
      </Warning>

      <Section>
        <SectionTitle id="cap3-mapa">O Mapa Completo das Árvores</SectionTitle>
        <P>
          O sistema comporta dezessete sub-árvores. Nenhuma delas é uma classe: você compra Ranks em quantas
          quiser, na ordem que quiser, e seu personagem é simplesmente a soma do que ele estudou. Clique no
          nome de qualquer sub-árvore na tabela abaixo pra abrir ela direto no mapa.
        </P>
        <BookTable
          headers={["Pilar", "Sub-árvore", "Atributo-chave", "Recurso", "Identidade em uma linha"]}
          rows={TREES.map((t) => [
            t.category === "magia" ? "Magia" : t.category === "corpo" ? "Corpo" : "Utilidade",
            <Link
              key={t.id}
              href={`/arvores?arvore=${t.id}`}
              className="text-wine-600 underline decoration-dotted hover:text-wine-500 dark:text-wine-400"
            >
              {t.name}
            </Link>,
            t.keyAttributeLabel ?? "—",
            t.resourceLabel ?? "—",
            t.tagline ?? "",
          ])}
        />
        <Aside title="Escolas Formais e Ofícios">
          <P>
            As sete escolas de magia e os três Estilos Divinos são <b>Escolas Formais</b>: têm mestres vivos,
            sedes, hierarquia e títulos reconhecidos no mundo inteiro — usam os nomes canônicos de rank
            (Principiante → Imperador) e conferem status social. As demais seis são <b>Ofícios</b> aprendidos
            na estrada, sem diploma: mecanicamente idênticos (mesmo Bônus de Rank, mesmos custos de PA,
            mesma contagem de conhecimentos), mas os nomes dos patamares mudam.
          </P>
        </Aside>
        <BookTable
          headers={["Patamar", "Bônus", ...rankLabelTrees.map((t) => t.name)]}
          rows={RANKS.map((rank, i) => [
            String(i + 1),
            `+${RANK_BONUS[rank]}`,
            ...rankLabelTrees.map((t) => t.rankLabels?.[rank] ?? rank),
          ]).concat([["7", "+8", ...rankLabelTrees.map(() => "—")]])}
        />
        <Aside title="Ofícios não têm patamar Deus">
          O sétimo degrau existe só nas Escolas Formais, e mesmo lá é narrativo. Um Ofício termina no sexto
          patamar.
        </Aside>
        <Aside title="Quem veste Touki">
          Toda sub-árvore da Árvore do Corpo desbloqueia o Touki no terceiro patamar — inclusive Arquearia,
          inclusive Escudos. A única exceção é o Estilo Deus da Espada, que desperta a aura no segundo
          patamar (a doutrina inteira dele é velocidade). As árvores de Magia e de Utilidade nunca recebem
          Touki nem Pontos de Touki, por mais alto que seja o rank.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap3-corpo">A Árvore do Corpo — Sistemas Compartilhados</SectionTitle>
        <P>
          Antes de qualquer estilo específico, três sistemas governam todos os guerreiros: o Dado de Arma, o
          Touki e o Triângulo dos Estilos.
        </P>
        <Aside title="Espadachim ou Guerreiro">
          Apenas quem estudou uma das Três Grandes Escolas — Deus da Espada, Deus da Água e Deus do Norte —
          é chamado de Espadachim. Todos os outros, mesmo empunhando espada, são apenas Guerreiros.
        </Aside>

        <SubTitle id="cap3-dado-arma">1. O Dado de Arma e a Escalada de Maestria</SubTitle>
        <P>
          O dano de um guerreiro vem da arma, não do corpo. Conforme você sobe de Rank num estilo, o Dado
          Base sobe degraus nesta escada:
        </P>
        <P>
          <code className="rounded bg-parchment-100 px-2 py-1 text-xs dark:bg-parchment-800">
            d4 → d6 → d8 → d10 → d12 → 2d8 → 2d10 → 2d12 → 3d10 → 3d12 → 4d10
          </code>
        </P>
        <BookTable
          headers={["Rank no Estilo", "Degraus Ganhos", "Espada Curta (d6) vira", "Espada Longa (d8) vira"]}
          rows={[
            ["Principiante", "+1", "d8", "d10"],
            ["Intermediário", "+2", "d10", "d12"],
            ["Avançado", "+3", "d12", "2d8"],
            ["Santo", "+4", "2d8", "2d10"],
            ["Rei", "+5", "2d10", "2d12"],
            ["Imperador", "+6", "2d12", "3d10"],
          ]}
        />
        <P>
          Fórmula de dano marcial: <b>Dado de Arma (escalado) + Força + Bônus do Rank</b>. Qual Rank conta
          depende do tipo de ataque, e a regra tem exatamente dois casos — nunca um terceiro:
        </P>
        <List
          items={[
            <span key="comum">
              <b>Ataque comum (golpe simples, sem nome, sem técnica):</b> use o <b>maior</b> Rank que você
              tiver entre todas as suas árvores do Corpo. Um personagem com Norte Santo e Espada Principiante
              rola os degraus do Norte Santo (o maior dos dois) em qualquer golpe comum, não importa com qual
              arma.
            </span>,
            <span key="tecnica">
              <b>Técnica nomeada (qualquer habilidade comprada de uma árvore específica):</b> use sempre o
              Rank <b>daquela árvore que concedeu a técnica</b>, mesmo que seja menor que o seu maior Rank
              geral. O mesmo personagem usando a Espada de Luz (técnica do Deus da Espada) rola só os degraus
              do Rank Principiante — é por isso que ela sai fraca na mão dele, apesar do Norte Santo.
            </span>,
          ]}
        />
        <P>
          A mesma lógica dos dois casos vale pra <b>qualquer</b> talento ou regra do livro que mencione
          &ldquo;seu Bônus de Rank&rdquo; sem dizer de qual árvore: se a regra foi concedida por uma árvore
          específica, é o Rank daquela árvore; se for uma regra genérica do sistema (não amarrada a nenhuma
          árvore), use o maior Rank que você tiver em qualquer árvore.
        </P>

        <SubTitle id="cap3-touki">2. Touki (Aura de Batalha)</SubTitle>
        <P>
          O Touki é uma camada de mana que o guerreiro veste sobre o próprio corpo — endurece a pele como
          aço, reforça o fio da lâmina e amplifica força, velocidade e reflexos. Rank Avançado é o mais alto
          que alguém alcança sem Touki: do Santo em diante, todo guerreiro veste aura.
        </P>
        <Aside title="Pontos de Touki (PT) — as duas reservas">
          <P>
            <b>PT Menor</b> — do 1º patamar em diante: PT iguais ao seu Vigor (mínimo 1). Não é aura, é
            fôlego — paga técnicas, e nada mais.
          </P>
          <P>
            <b>PT Pleno</b> — a partir do 3º patamar (2º no Deus da Espada): a reserva passa a ser Espírito +
            Vigor, e você desbloqueia o Manto de Touki e as manobras de gasto abaixo. <b>Crescimento:</b> +1
            PT por patamar que já tenha PT Pleno em qualquer árvore do Corpo — o 2º patamar do Deus da Espada
            já conta pra essa soma (é o único caso do livro em que o PT Pleno começa antes do 3º patamar, e a
            exceção vale exatamente pra essa conta também, não só pro desbloqueio do Manto). Cavalaria e
            Escudos concede +2 por patamar em vez de +1, por gastar PT mais rápido que qualquer outra árvore.
          </P>
          <List
            items={[
              "PT são recuperados integralmente em um Descanso Curto.",
              "PT não podem ser convertidos em PM, nem PM em PT.",
              "Um personagem com Ranks em mais de um estilo marcial usa uma reserva única de PT.",
            ]}
          />
        </Aside>
        <P>
          <b>O Manto de Touki (passivo, gratuito, independente de PT)</b> — a partir do Rank Avançado,
          enquanto consciente e não Exausto: +CA igual à metade do Bônus de Rank (arred. pra cima); Redução
          contra projéteis mundanos igual ao dobro do Bônus de Rank (e nunca sofre crítico deles); ataques
          desarmados e com objetos improvisados contam como mágicos. <b>O Manto não consome PT e continua
          ativo mesmo com a reserva de PT em 0</b> — ele é vestido pelo Rank, não comprado com o recurso; só
          PT paga as manobras de gasto da tabela abaixo, nunca a existência do Manto em si.
        </P>
        <BookTable
          headers={["Custo", "Manobra", "Efeito"]}
          rows={[
            ["1 PT", "Touki Concentrado", "Sem Ação. Até o fim do turno, some seu Bônus de Rank ao dano de novo e reduza todo dano físico recebido pelo mesmo valor."],
            ["1 PT", "Lâmina de Touki", "Sem Ação. Por 1 minuto, sua arma corta pedra e aço, conta como mágica e ignora Resistência a cortante/perfurante."],
            ["2 PT", "Golpe Estendido", "1 Ação. Clarão da lâmina que atinge um alvo a até 9m. Dano de arma normal."],
            ["2 PT", "Aguentar", "1 Reação. Ao sofrer dano que te levaria a 0 PV, fica com 1 PV em vez disso. Uma vez por combate."],
            ["3 PT", "Explosão de Aura", "1 Ação. Criaturas a 3m fazem teste de Força (CD 8 + Força + Rank) ou são arremessadas 4,5m e ficam Caídas."],
          ]}
        />

        <SubTitle id="cap3-triangulo">3. O Triângulo dos Estilos</SubTitle>
        <Quote attribution="Lema do Estilo Deus da Espada">A vitória é de quem se move primeiro.</Quote>
        <BookTable
          headers={["Estilo", "Filosofia", "Vence contra", "Perde para"]}
          rows={[
            ["Deus da Espada", "Velocidade e agressão; matar em um golpe. Sem defesa, sem contra-ataque.", "Deus do Norte", "Deus da Água"],
            ["Deus da Água", "Defesa e contragolpe. Deixa o inimigo atacar e devolve.", "Deus da Espada", "Deus do Norte"],
            ["Deus do Norte", "Sobreviver e vencer por qualquer meio. Truques, terreno, improviso.", "Deus da Água", "Deus da Espada"],
          ]}
        />
        <Aside title="Regra da Vantagem de Estilo">
          Quando você luta contra um praticante do estilo que o seu contra-ataca, e ambos possuem Rank
          naqueles estilos: você rola com Vantagem em todas as Disputas contra ele, e as Reações defensivas
          dele falham automaticamente contra sua primeira Ação de cada turno. Se o Rank dele for dois ou
          mais acima do seu, a vantagem se anula — treino bruto supera a tabela de tipos.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap3-utilidade">A Árvore de Utilidade — Sistemas Compartilhados</SectionTitle>
        <P>
          O terceiro pilar não compete em dano — um Lenda Oculta não bate mais forte que um Norte
          Principiante. O que a Utilidade faz é decidir as <b>condições</b> em que a luta, a negociação ou o
          roubo acontecem.
        </P>
        <List
          items={[
            <span key="1"><b>Sem Escada de Dados:</b> árvores de Utilidade não recebem degraus no Dado de Arma.</span>,
            <span key="2"><b>Sem Touki, nunca:</b> nenhum patamar de Utilidade concede Manto de Touki nem PT.</span>,
            <span key="3">
              <b>O Rank soma só nas Perícias que a sua árvore cobre</b> — nunca em todas as Perícias do jogo,
              exatamente como o BC é somado só ao dano do elemento de um mago, não ao de qualquer magia:
            </span>,
          ]}
        />
        <BookTable
          headers={["Árvore", "Perícias cobertas pelo Bônus de Rank"]}
          rows={[
            ["Ladino (Furtividade e Armadilhas)", "Furtividade, Ladinagem, Percepção, Acrobacia, Enganação (disfarce)."],
            ["Bardo e Interação", "Atuação, Persuasão, Intuição, História."],
            ["Tático (Navegação e Liderança)", "Sobrevivência, Natureza, Investigação, Percepção (rastreio)."],
          ]}
        />
        <P>
          Duas árvores de Utilidade cobrem <b>Percepção</b> (Ladino, num sentido; Tático, noutro). Se você
          tiver Rank em ambas, use o <b>maior</b> Bônus de Rank entre as duas — nunca some os dois juntos, e
          nunca use os dois pra dobrar a vantagem no mesmo teste.
        </P>

        <SubTitle id="cap3-pp">Pontos de Preparação (PP)</SubTitle>
        <P>
          Magos gastam PM pra fazer algo acontecer agora. Guerreiros gastam PT pra aguentar o que está
          acontecendo agora. A Utilidade gasta um recurso que nenhum dos dois tem: PP serve pra declarar que
          algo <i>já aconteceu antes</i>.
        </P>
        <Aside title="Pontos de Preparação">
          <P>
            PP Máximos = Intelecto + o atributo-chave da sua árvore (mínimo 1), +1 por patamar a partir do
            terceiro. Ladino usa Agilidade, Bardo usa Espírito, Tático usa Intelecto. Com mais de uma árvore
            de Utilidade, a reserva é única — use o maior atributo-chave. Recupera-se tudo em Descanso Longo.
          </P>
        </Aside>
        <P>
          Gastando 1 PP, você declara em voz alta um fato sobre o passado que passa a ser verdade no jogo.
          Cinco condições: (1) precisa caber no seu Escopo; (2) precisa caber no seu Domínio; (3) é sempre
          pretérito; (4) custa 2 PP se resolver o obstáculo central da cena; (5) o Mestre não pode negar, mas
          pode anexar uma complicação.
        </P>

        <SubTitle id="cap3-faixas">As Três Faixas</SubTitle>
        <P>
          A solução pra três árvores não virarem &ldquo;a mesma pessoa com roupa diferente&rdquo;: dividir o passado em
          três domínios que não se tocam, cada um travado numa faixa exclusiva de combate.
        </P>
        <BookTable
          headers={["", "Ladino", "Bardo", "Tático"]}
          rows={[
            ["Atributo-chave", "Agilidade", "Espírito", "Intelecto"],
            ["Domínio da Preparação", "Coisas e lugares.", "Pessoas e reputação.", "Tempo e logística."],
            ["Exemplo de fato", "“Essa fechadura eu já limei.”", "“O capitão da guarda me deve um favor.”", "“O suprimento deles acabou anteontem.”"],
            ["Faixa exclusiva", "Dano Furtivo.", "Estado emocional.", "Economia de ação."],
            ["A pergunta dele", "Como eu entro?", "Quem eu convenço?", "Onde e quando isso acontece?"],
          ]}
        />
        <Aside title="A Regra da Faixa">
          Nenhuma habilidade pode invadir a faixa de outra árvore de Utilidade — um talento que dê Dano
          Furtivo a um Bardo, ou que deixe um Ladino conceder uma Ação, está errado. A Faixa vale só entre
          Ladino, Bardo e Tático; árvores do Corpo e de Magia cruzam essas linhas livremente.
        </Aside>
        <Aside title="Nota de Custo — Utilidade é mais barata">
          <BookTable
            headers={["Patamar", "Talento", "Técnica Assinatura ◆"]}
            rows={[
              ["1º e 2º", "1 PA", "2 PA"],
              ["3º e 4º", "2 PA", "3 PA"],
              ["5º e 6º", "3 PA", "4 PA"],
            ]}
          />
        </Aside>

        <SubTitle id="cap3-utilidade-combate">As Três Árvores em Combate</SubTitle>
        <P>
          A pergunta que todo jogador de Utilidade faz na terceira sessão é &ldquo;e eu, faço o quê?&rdquo;.
          Aqui está a resposta, lado a lado.
        </P>
        <BookTable
          headers={["Turno", "Ladino", "Bardo", "Tático"]}
          rows={[
            ["Antes", "Já sabotou o ambiente.", "Já sabe o que cada um quer.", "Já escolheu o terreno."],
            ["1º", "Primeiro Golpe — seu pico de dano do combate inteiro.", "Canção de Guerra — e ela dura o resto da luta de graça.", "Primeiro a Ver — o grupo age antes e na ordem que você quis."],
            ["2º", "Ponto Cego — derruba a viga, tranca os reforços.", "Insulto que Fica — puxa o inimigo mais perigoso para longe do mago.", "Manobra — reposiciona três aliados sem gastar as Ações deles."],
            ["3º", "Veneno, roubo do item-chave, Dano Furtivo.", "Coro — pavor, fúria ou devoção em 18 metros.", "Avante — Ação extra para o grupo inteiro."],
            ["4º", "Passo Vazio e reposicionamento.", "Sustenta, inspira, mantém todos de pé.", "Foco de Fogo e leitura da ordem de Iniciativa."],
            ["Nunca", "Trocar golpes na linha de frente.", "Ficar ao alcance de quem ele provocou.", "Achar que precisa causar dano."],
          ]}
        />
        <P>
          <b>A régua honesta:</b> contra um Norte Imperador batendo 81 por turno, os três juntos talvez somem
          30 de dano direto na luta inteira. E ainda assim eles são a razão de o combate ter começado com o
          grupo em cima do telhado, os reforços trancados do lado de fora, metade dos inimigos apavorados, e o
          chefe já sabendo que perdeu.
        </P>
        <P>
          <b>O teste do Apêndice B, aplicado às três:</b> cada árvore precisa ter, no patamar alto, ao menos
          uma habilidade que um mago Imperador não replica com magia nenhuma. Não Estive Aqui derrota
          adivinhação divina. A História Oficial decide o que o mundo acredita. A Guerra Já Acabou cancela um
          confronto antes de ele existir. Zero Absoluto não te consegue um informante, não te dá reputação, e
          não impede que o exército chegue.
        </P>
        <Aside title="Para o Mestre: como recompensar os três">
          <P>
            Dano é fácil de medir — está na ficha, em números. O valor da Utilidade não está, e por isso é
            fácil um Mestre esquecer de recompensá-lo. Três hábitos resolvem isso:
          </P>
          <List
            items={[
              "Narre a ausência do problema. Se o Ladino sabotou os reforços, diga em voz alta que eles não vieram — não deixe o efeito passar em silêncio.",
              "Dê PA por Preparação bem usada, do mesmo jeito que se dá por dano bem causado. A régua é a mesma: fez a mesa avançar, mereceu.",
              "Cobre a complicação que você mesmo anexou. Se o Mestre disse que o informante viu o Ladino, esse informante precisa aparecer de novo — e virar problema, mais cedo ou mais tarde.",
            ]}
          />
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap3-todas">Todas as Sub-árvores — Catálogo Completo</SectionTitle>
        <P>
          Magias, talentos, técnicas e Maestrias de cada uma das 17 sub-árvores, rank por rank. Clique no
          nome de uma árvore pra abrir o catálogo dela.
        </P>
        {(["magia", "corpo", "utilidade"] as const).map((category) => (
          <div key={category} className="space-y-3">
            <h3 className="scroll-mt-24 text-base font-bold text-wine-700 dark:text-wine-400" id={`cap3-todas-${category}`}>
              {CATEGORY_LABELS[category]}
            </h3>
            {TREES.filter((t) => t.category === category).map((tree) => (
              <details key={tree.id} className="rounded-xl border border-parchment-300 bg-parchment-100/60 dark:border-parchment-800 dark:bg-parchment-900/40" id={`arvore-${tree.id}`}>
                <summary className="scroll-mt-24 cursor-pointer list-none rounded-xl p-3 hover:bg-parchment-200/50 dark:hover:bg-parchment-800/50">
                  <span className="font-bold text-parchment-900 dark:text-parchment-50">{tree.name}</span>
                  <span className="ml-2 text-xs text-parchment-500 dark:text-parchment-400">{tree.subgroup}</span>
                  {tree.tagline && (
                    <span className="mt-0.5 block text-xs italic text-parchment-500 dark:text-parchment-400">{tree.tagline}</span>
                  )}
                </summary>
                <div className="border-t border-parchment-300 p-3 dark:border-parchment-800">
                  <TreeCatalog tree={tree} />
                </div>
              </details>
            ))}
          </div>
        ))}
      </Section>
    </div>
  );
}
