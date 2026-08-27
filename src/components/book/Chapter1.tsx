import { RACES } from "@/data/races";
import { BACKGROUNDS, MIKO_TABLE, OLHO_TABLE } from "@/data/backgrounds";
import { RANK_BONUS, RANK_REQUIREMENTS, RANKS } from "@/lib/types";
import { RANK_PA_COST } from "@/data/trees/shared";
import { SKILLS } from "@/data/skills";
import { STARTING_KITS } from "@/data/startingKits";
import { TREES } from "@/data/trees";
import { Aside, BookTable, ChapterTitle, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";

const SKILL_ATTRIBUTE_LABEL: Record<string, string> = {
  forca: "Força",
  agilidade: "Agilidade",
  vigor: "Vigor",
  intelecto: "Intelecto",
  espirito: "Espírito",
};

export default function Chapter1() {
  return (
    <div className="space-y-8">
      <ChapterTitle id="cap1">Capítulo 1 — O Núcleo do Sistema</ChapterTitle>
      <P>
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
            Ao criar o personagem, você recebe 4 Pontos para distribuir livremente entre os 5 atributos base.
            O valor máximo por atributo na criação é 4.
          </P>
          <P>
            <b>Sistema de Defeitos:</b> você pode reduzir atributos pra ganhar pontos extras. As regras são
            estritas: apenas um atributo pode ficar em -1 (ganha 1 Ponto Extra) e apenas um em -2 (ganha 2
            Pontos Extras).
          </P>
        </Aside>
        <Aside title="Os Dois Atributos do Mago">
          <P>
            <b>Intelecto</b> — a Precisão: define o quanto sua magia acerta e o quanto machuca.{" "}
            <b>Espírito</b> — a Reserva: define quanto de mana o corpo consegue armazenar.
          </P>
          <P>
            Sempre que você alcançar um patamar numérico novo em qualquer escola de magia, além dos PM da
            escola, você ganha PM adicionais iguais ao seu Espírito — a <b>Reserva Inata</b>. Ela é ganha uma
            vez por degrau, no máximo seis vezes na vida (a primeira vez que alcança um 1º patamar de magia,
            ganha; a primeira vez que alcança um 2º, ganha de novo — abrir o 1º patamar de sete escolas
            diferentes rende uma Reserva Inata, não sete).
          </P>
          <P>
            Existem dois magos legítimos: o cirurgião (Intelecto alto — poucos tiros, todos letais) e o
            reator (Espírito alto — bombardeia o dia inteiro sem cansar). Roxy Migurdia é o primeiro. Rudeus
            Greyrat é o segundo.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap1-2">2. Pontos de Aprimoramento (PA)</SectionTitle>
        <P>
          A progressão ocorre quando o Mestre recompensa os jogadores com PA após sessões, missões
          importantes ou arcos da história (como subir de Rank na Guilda). Ao criar o personagem, você
          recebe <b>3 PA iniciais</b>.
        </P>
        <BookTable
          headers={["Custo", "O que você recebe"]}
          rows={[
            ["1 PA", "2 Perícias à sua escolha."],
            ["1 PA", "Desbloqueia 1 Técnica Marcial ou 1 Talento de rank baixo."],
            ["2 PA", "+12 PV Máximos (melhoria física permanente)."],
            ["2 PA", "+12 PM Máximos (melhoria mágica permanente)."],
            ["2 PA", "Aumenta 1 ponto em qualquer Atributo Base permanentemente (limite de 8)."],
            ["3 PA", "Vantagem permanente em todos os Testes de Resistência de 1 Atributo à sua escolha."],
            ["Variável", "Magias e Talentos de Árvore — o custo escala com o Rank."],
          ]}
        />
        <Aside title="O Padrão das Reservas">
          <P>
            Todo talento de árvore que compra reserva vale o mesmo, custe onde custar: 1 PA = +6 PM Máximos
            ou +8 PV Máximos, comprável tantas vezes quantos forem os seus patamares naquela árvore. Isso
            existe pra que nenhuma escola dê mais vida de graça — escolas se diferenciam pela curva de
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
        <P>
          O mundo é dividido em 7 Ranks de Maestria (Principiante, Intermediário, Avançado, Santo, Rei,
          Imperador e Deus). Você só recebe permissão pra comprar o desbloqueio de um Rank quando já possuir
          o número mínimo de conhecimentos (magias e talentos comprados) daquela mesma árvore.
        </P>
        <BookTable
          headers={["Rank", "Custo de Desbloqueio", "Conhecimentos Exigidos", "Magia Comum", "Magia Assinatura ◆", "Talento"]}
          rows={RANKS.map((rank) => [
            rank,
            `${RANK_REQUIREMENTS[rank].paCost} PA`,
            String(RANK_REQUIREMENTS[rank].knowledgeRequired || "—"),
            `${RANK_PA_COST.common[rank]} PA`,
            `${RANK_PA_COST.signature[rank]} PA`,
            `${RANK_PA_COST.talent[rank]} PA`,
          ]).concat([["Deus", "Narrativa", "13", "—", "—", "—"]])}
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
          correspondente.
        </P>
        <List
          items={[
            <span key="a">
              <b>Compra Direta (1 PA = 2 Perícias):</b> ao gastar 1 PA, o jogador escolhe e adquire 2
              Perícias simultaneamente.
            </span>,
            <span key="b">
              <b>Perícias de Árvore:</b> certas árvores de progressão e talentos concedem perícias
              específicas como bônus por treinar aquele estilo.
            </span>,
          ]}
        />
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

        <SubTitle id="cap1-4-proficiencias">Proficiências: Armas e Armaduras</SubTitle>
        <P>
          Toda árvore do Corpo já concede proficiência com o que ela usa — várias Maestrias de 1º patamar
          dizem isso explicitamente. Faltava o padrão, pra quando nenhuma árvore ainda cobriu aquele
          equipamento.
        </P>
        <Aside title="O Padrão">
          <List
            items={[
              <span key="a">
                <b>Armas simples</b> (Dado Base até d6): todo personagem é proficiente, sem exceção.
              </span>,
              <span key="b">
                <b>Armas marciais</b> (Dado Base d8+): exigem proficiência do 1º patamar de uma árvore do
                Corpo, ou de um talento específico.
              </span>,
              <span key="c">
                <b>Armadura leve:</b> todo personagem é proficiente.
              </span>,
              <span key="d">
                <b>Armadura média/pesada e escudos:</b> exigem proficiência específica (ex: Escudeiro, Peso
                Não Atrapalha do Suishin-ryū).
              </span>,
            ]}
          />
        </Aside>
        <Warning title="Penalidade de Não-Proficiência">
          <List
            items={[
              "Arma sem proficiência: Desvantagem no teste de acerto. O dano continua normal — a Escada de Dados nunca reduz.",
              "Armadura sem proficiência: Desvantagem em Furtividade e Acrobacia, e Deslocamento -3m enquanto vestida.",
            ]}
          />
        </Warning>

        <SubTitle id="cap1-4-kit">Equipamento Inicial e a Árvore Inicial</SubTitle>
        <P>
          Ninguém começa do zero. Ao criar seu personagem, desbloqueie o 1º patamar de pelo menos uma árvore
          — sua Árvore Inicial — com parte dos seus 3 PA iniciais. Ela decide o kit abaixo, recebido de graça
          e além do dinheiro do Antecedente (seção 6): as duas coisas não competem entre si.
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
          O mundo é habitado por diversas raças com fisiologias e culturas vastamente diferentes. Escolha
          sua linhagem pra determinar traços genéticos e mecânicos — os detalhes de cada uma também aparecem
          direto na ficha ao selecionar a raça.
        </P>
        <div className="space-y-2.5">
          {RACES.map((race) => (
            <div key={race.id} className="rounded-xl border border-parchment-300 bg-parchment-100/60 p-3 text-sm dark:border-parchment-800 dark:bg-parchment-900/40">
              <p className="font-semibold text-parchment-900 dark:text-parchment-50">{race.name}</p>
              <p className="mt-0.5 text-parchment-600 dark:text-parchment-400">{race.description}</p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-parchment-700 dark:text-parchment-300">
                {race.traits.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
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
        <BookTable
          headers={["d100", "Antecedente", "Efeito", "Dinheiro Inicial"]}
          rows={BACKGROUNDS.map((bg) => [
            `${String(bg.rollRange[0]).padStart(2, "0")}-${String(bg.rollRange[1]).padStart(2, "0")}`,
            bg.name,
            [
              ...(bg.fixedSkills ?? []).map((s) => `Perícia: ${s}`),
              ...(bg.bonusSkillChoices ? [`${bg.bonusSkillChoices} Perícias à escolha`] : []),
              ...bg.traits,
            ].join(" · ") || "—",
            `${bg.startingGold} PO`,
          ])}
        />

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
          rows={RANKS.map((r) => [r, `+${RANK_BONUS[r]}`]).concat([["Deus", "+8"]])}
        />
        <Aside title="O Bônus Depende da Ação!">
          O Bônus Numérico é específico da árvore em uso no momento. Se você atacar com Magia de Água, usa
          seu Rank de Água; se logo depois usar Magia de Cura, usa o Rank de Cura — que pode ser bem
          diferente.
        </Aside>
        <SubTitle>O Bônus de Conjuração (BC)</SubTitle>
        <P>
          O número mais importante da ficha de um mago, e ele unifica as três fórmulas do sistema num único
          valor. <b>BC = Intelecto + Bônus do Rank naquela escola.</b>
        </P>
        <List
          items={[
            "Acerto Mágico: 1d20 + BC (contra a CA do alvo)",
            "CD para resistir: 8 + BC (o alvo rola 1d20 + atributo de defesa)",
            "Dano Mágico: dados da magia + BC",
          ]}
        />
        <SubTitle>As Fórmulas Marciais</SubTitle>
        <P>Guerreiros usam a mesma lógica, trocando o atributo:</P>
        <List
          items={[
            "Acerto Físico = 1d20 + Força (ou Agilidade, para armas leves) + Bônus do Rank da Técnica.",
            "CD de uma Técnica = 8 + Força (ou Agilidade) + Bônus do Rank da Técnica.",
            "Dano Total = Dados da Arma + Atributo + Bônus do Rank da Técnica.",
          ]}
        />
      </Section>

      <Section>
        <SectionTitle id="cap1-8">8. Misturando Árvores (Multiclasse)</SectionTitle>
        <P>
          Este sistema não tem classes — nada impede você de ser Trovador de Bardo, Rastreador do Tático,
          Intermediário de Fogo e Principiante do Norte ao mesmo tempo. É intencional e é o coração do jogo.
          Seis perguntas, seis respostas:
        </P>
        <Aside title="1. Qual Bônus de Rank eu uso?">
          O da árvore que concedeu a habilidade, sempre. Exceção: quando uma regra genérica pedir seu Bônus
          de Rank sem dizer de qual árvore, use o maior que você possuir em qualquer uma.
        </Aside>
        <Aside title="2. Conhecimentos somam entre árvores?">
          Nunca. A contagem de conhecimentos pra desbloquear um patamar conta apenas magias, técnicas e
          talentos daquela mesma árvore.
        </Aside>
        <Aside title="3. Como somam PV, PT e PP?">
          <List
            items={[
              "PV somam de todas as árvores.",
              "PM somam apenas das escolas de magia.",
              "PT: reserva única, mesmo com vários estilos marciais. PT = Espírito + Vigor, +1 por patamar marcial 3º ou superior (contando todas as árvores do Corpo).",
              "PP: reserva única, mesmo com várias árvores de Utilidade. PP = Intelecto + o maior atributo-chave entre suas árvores de Utilidade, +1 por patamar 3º ou superior em qualquer uma delas.",
            ]}
          />
          Você nunca tem duas reservas do mesmo tipo.
        </Aside>
        <Aside title="4. Custo de Abertura">
          <P>Abrir uma árvore nova fica mais caro a cada árvore que você já tem:</P>
          <BookTable
            headers={["Árvore", "1ª", "2ª", "3ª", "4ª", "5ª"]}
            rows={[["Custo de abertura", "1 PA", "2 PA", "3 PA", "4 PA", "5 PA"]]}
          />
          <P>
            Cada 1º patamar entrega uma Maestria gratuita — sem o Custo de Abertura, a jogada ótima seria
            abrir cinco árvores por 5 PA e colecionar cinco Maestrias sem nunca subir nenhuma. Agora isso
            custa 15 PA, e continua sendo uma opção legítima — só não é mais de graça.
          </P>
        </Aside>
        <Aside title="5. Largura ou profundidade?">
          Ir fundo numa árvore custa 12 PA até o Imperador e entrega Bônus de Rank +6, seis Maestrias e
          magias de patamar alto. Ir largo entrega muitas Maestrias de 1º patamar, versatilidade e nenhum
          teto. O sistema cobra pelos dois caminhos, mas não deixa que largura seja simplesmente melhor.
        </Aside>
        <Aside title="6. E o Rank Deus?">
          Sempre narrativo e sempre de uma árvore. Ninguém no Mundo de Seis Faces jamais alcançou o patamar
          Deus em duas coisas ao mesmo tempo — o livro trata isso como impossível, não como difícil.
        </Aside>
      </Section>
    </div>
  );
}
