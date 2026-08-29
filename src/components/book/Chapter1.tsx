import { RACES } from "@/data/races";
import { BACKGROUNDS, LAPLACE_TABLE, MIKO_TABLE, OLHO_TABLE } from "@/data/backgrounds";
import { RANK_BONUS, RANK_REQUIREMENTS, RANKS, SAVE_ADVANTAGE_PA_COST } from "@/lib/types";
import { RANK_PA_COST } from "@/data/trees/shared";
import { SKILLS } from "@/data/skills";
import { STARTING_KITS } from "@/data/startingKits";
import { TREES } from "@/data/trees";
import { describeGrantedSkills, describeMasteryException } from "@/lib/treeSkills";
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
            Pontos Extras). Nada desce abaixo de -2.
          </P>
          <P>
            Repare que o defeito <b>não cria pontos</b>: ele os empresta. Com os dois defeitos você distribui
            7 pontos, mas dois atributos ficam em -1 e -2, então a <b>soma dos seus cinco atributos fecha em
            4</b> de qualquer jeito. É essa soma — não cada atributo isolado — que a seção 2 usa pra cobrar
            PA por pontos comprados depois da criação. Consequência direta: <b>desfazer um defeito custa os
            mesmos 2 PA por ponto</b> que qualquer outro aumento. Você não pega -2 na criação e sobe de volta
            de graça.
          </P>
          <Warning title="Antes de largar o Vigor, leia isto">
            Vigor é o único atributo que não governa perícia nenhuma (seção 4), o que faz dele o alvo óbvio
            do Sistema de Defeitos. É de propósito que ele seja também o único cuja escala negativa é{" "}
            <b>desproporcional</b>: a Escala do Vigor (Cap. 4, §1) multiplica seus PV Máximos por{" "}
            <b>×0,75</b> em -1 e por <b>×0,40</b> em -2 — o primeiro ponto tira um quarto da sua vida, o
            segundo tira quase metade do que sobrou — e ainda te dá Desvantagem em toda resistência de Vigor:
            veneno, doença, clima, fome, Exaustão e o Fio da Vida. Largar Força ou Intelecto custa um número
            na rolagem; largar Vigor custa o personagem.
          </Warning>
        </Aside>
        <Aside title="Os Dois Atributos do Mago">
          <P>
            <b>Intelecto</b> — a Precisão: define o quanto sua magia acerta e o quanto machuca.{" "}
            <b>Espírito</b> — a Reserva: define quanto de mana o corpo consegue armazenar.
          </P>
          <P>
            <b>Escolas de magia não concedem PM.</b> A sua reserva inteira é{" "}
            <b>(o maior entre o seu Espírito e 4) × Maior Bônus de Rank de magia, + 8</b> — recalculada
            sempre que o seu maior patamar de magia sobe. Não há bônus extra por número de escolas abertas.
            O &ldquo;maior entre Espírito e 4&rdquo; é invisível pra quem tem Espírito 4 ou mais; ele existe
            pro cirurgião do parágrafo abaixo (Cap. 4, §1).
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
            ["1 PA", "3 Proficiências ou Línguas à sua escolha — qualquer personagem, de qualquer árvore."],
            ["2 PA", "+PV iguais a quatro vezes o seu maior Bônus de Rank (melhoria física permanente)."],
            ["2 PA", "+PM iguais ao dobro do seu maior Bônus de Rank de magia (melhoria mágica permanente)."],
            ["2 PA", "+1 ponto de Atributo Base permanente (teto 8) — medido pela soma dos cinco, então desfazer um defeito custa o mesmo."],
            [`${SAVE_ADVANTAGE_PA_COST} PA`, "Vantagem permanente em TODOS os Testes de Resistência de 1 Atributo à sua escolha — uma vez por atributo, então no máximo 5 compras. Marcada na ficha e no PDF."],
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
            Comparando com o talento de reserva que doze árvores vendem (Braço de Ferro, Osso Duro, Pele de
            Pedra…): o talento rende mais por PA, mas é travado no número de patamares de <i>uma</i> árvore.
            Esta compra rende menos por PA e não tem teto nem pré-requisito. As duas entregam o mesmo tanto
            por compra — escolha pela trava, não pelo número.
          </P>
        </Aside>
        <Aside title="O Padrão das Reservas">
          <P>
            Todo talento de árvore que compra reserva vale exatamente o mesmo, custe onde custar: 1 PA = +2
            PM por patamar seu naquela árvore, ou +4 PV por patamar seu naquela árvore — comprável tantas
            vezes quantos forem os seus patamares. No 1º patamar isso é +2 PM ou +4 PV, e é pouco; no 6º é
            +12 PM ou +24 PV, e vale a compra. Isso
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
          ]).concat([["Deus", "Narrativa", "—", "—", "—", "—"]])}
        />
        <P className="text-sm">
          Esta é a tabela padrão, usada por Magia e pelo Corpo. <b>Árvores de Utilidade são mais baratas</b> —
          ver a tabela própria delas no Cap. 3, &ldquo;Sistemas Compartilhados&rdquo;.
        </P>
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
              <b>Proficiências e Línguas (1 PA = 3):</b> qualquer personagem, de qualquer árvore, a qualquer
              momento. São mais baratas que Perícias porque são mais estreitas — cobrem um instrumento, uma
              ferramenta, um tipo de arma ou um idioma, não um campo inteiro de ação.
            </span>,
            <span key="c">
              <b>Perícias de Árvore:</b> a sua <b>Árvore Inicial</b> ensina perícias sozinha, e elas já
              nascem na ficha. Regra completa no bloco abaixo.
            </span>,
          ]}
        />

        <Warning title="Perícias de Árvore — as 18 ensinam, e só a Árvore Inicial entrega">
          <P>
            <b>TODAS as dezoito árvores deste livro ensinam perícias</b> — as oito de Magia, as sete do Corpo
            e as três de Utilidade, sem exceção. Não existe árvore que não ensine nada. Elas entram na sua
            ficha <b>automaticamente</b>, sem gastar PA e sem você precisar pedir.
          </P>
          <P>
            A condição é uma só: <b>você recebe as perícias da árvore que for a sua Árvore Inicial</b> — a
            primeira que você abriu, aquela que também decidiu o seu kit. A tabela abaixo lista as dezoito e
            o que cada uma ensina.
          </P>
          <P>
            O motivo é de ficção, não de balanço: a Árvore Inicial é onde você passou a infância e a
            adolescência. Uma árvore aberta depois te ensina <i>técnicas</i>, não <i>hábitos</i> — você já era
            alguém quando chegou nela. O guerreiro que aprende Magia de Fogo aos trinta anos aprende a
            conjurar; ele não vira estudioso de Arcanismo por isso.
          </P>
          <P>
            Cada árvore ensina <b>duas perícias fixas</b>. As três de Utilidade ensinam ainda{" "}
            <b>uma à sua escolha</b>, de uma lista curta — porque o Bônus de Rank delas cobre quatro ou cinco
            perícias, e ninguém fica treinado em todas (ver Cap. 3, &ldquo;A Árvore de Utilidade&rdquo;).
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
          rows={TREES.map((t) => [
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
        <Aside title="Três formas de bônus racial, e por que elas são diferentes">
          <List
            items={[
              <span key="a">
                <b>Bônus de atributo</b> (a maioria das raças): entra multiplicado em tudo que importa — PV
                pelo Fator de Vigor, PM pelo Bônus de Rank, acerto e dano direto. <b>Nunca decai.</b>
              </span>,
              <span key="b">
                <b>Bônus fixo de PV</b> (só o Anão, +10): somado <i>depois</i> do Fator de Vigor (Cap. 4,
                §1). Vale muito no 1º patamar e pouco no Imperador — é um bônus de começo de campanha, de
                propósito.
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
            É de propósito que o mais raro seja o mais forte: Gênio sai em 2 de 100 rolagens, Fator Laplace
            em 6. Até 2026-08-29 estava invertido — o Laplace carregava +2 de Espírito, +8 PM e +6 PV fixos e
            era, com folga, o melhor resultado da tabela apesar de ser três vezes mais comum.
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
          rows={RANKS.map((r) => [r, `+${RANK_BONUS[r]}`]).concat([["Deus", "—"]])}
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
          Sete perguntas, sete respostas:
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
              "PV: uma reserva só, calculada de uma vez. Os Dados de PV de TODAS as suas árvores entram no mesmo somatório do Cap. 4, §1 — abrir uma segunda árvore acrescenta dados novos à mesma conta, não uma segunda barra de vida.",
              "PM somam apenas das escolas de magia.",
              "PT: reserva única, mesmo com vários estilos marciais. Resumo: PT Pleno = Espírito + Vigor, +1 por patamar com Pleno já desbloqueado (contando todas as árvores do Corpo) — fórmula completa, incluindo o PT Menor de antes do Pleno e a exceção do Cavalaria e Escudos, no Cap. 3, \"Pontos de Touki\".",
              "PP: reserva única, mesmo com várias árvores de Utilidade. PP = Intelecto + o maior atributo-chave entre suas árvores de Utilidade, +1 por patamar 3º ou superior em qualquer uma delas. No Tático, cujo atributo-chave já é Intelecto, o segundo termo vira o Bônus de Rank — ver Cap. 3, \"Pontos de Preparação\".",
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
          <P>
            <b>Profundidade custa 34 PA</b>, não 12. Os 12 PA são só os desbloqueios (1+1+2+2+3+3); pra ter
            <i>direito</i> de comprá-los você precisa acumular 10 conhecimentos naquela mesma árvore (seção
            3), e os 10 mais baratos possíveis custam outros 22 PA — dois de cada patamar, a 1, 1, 2, 3 e 4
            PA. Em troca: Bônus de Rank +6, seis Maestrias, e as magias que só existem lá em cima.
          </P>
          <P>
            <b>Largura custa 15 PA</b> por cinco árvores (Custo de Abertura 1+2+3+4+5, pergunta 4 abaixo) e
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
          Algumas combinações de Rank Avançado ou superior revelam uma <b>árvore híbrida</b> que não existe
          pra ninguém que não cumpriu os dois pré-requisitos — o Estilo Vendaval (Cap. 3, catálogo da Árvore
          do Corpo) é a primeira: emerge de já dominar o Estilo Deus do Norte e a Magia de Vento. Ela não
          aparece na escolha da Árvore Inicial, e o desbloqueio dela não é travado por código nenhum — o
          Mestre decide, do mesmo jeito que já decide a Raça Dragão e o Rank Deus.
        </Aside>
      </Section>
    </div>
  );
}
