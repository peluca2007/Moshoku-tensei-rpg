import { Aside, BookTable, ChapterTitle, FimDoCapitulo, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";
import Prancha from "./Prancha";
import ShopCatalog from "./ShopCatalog";
import ArteDaHabilidade from "./ArteDaHabilidade";
import { ARTE_DO_DOJO } from "@/data/midiaDeHabilidade";
import { LIMITES, MARCA_DO_MESTRE, PROVACOES, RECOMPENSA_POR_PATAMAR } from "@/data/dojos";

export default function Chapter5() {
  return (
    <div className="space-y-8">
      <ChapterTitle
        id="cap5"
        numero="Capítulo 5"
        resumo="O jogo fora da luta: descanso, Guilda, Loja, Reputação com facções, crafting e o treino num Dojo."
      >
        Entre Aventuras
      </ChapterTitle>
      <P className="dropcap">
        Nem toda sessão é masmorra. Entre aventuras, o grupo usa o tempo livre, a Guilda, a reputação, a
        fabricação de itens e os Dojos para se preparar para o que vem.
      </P>

      <Section>
        <SectionTitle id="cap5-1">1. Tempo Livre e Downtime</SectionTitle>
        <P>
          Cada semana livre pode produzir um resultado concreto na ficha.
        </P>
        <SubTitle>O Bloco de Tempo</SubTitle>
        <P>
          Downtime é contado em <b>blocos de 1 semana</b> — a mesma unidade da Convalescença (Cap. 4), a semana de cama que cura todos os PV. No fim de cada semana livre, cada personagem escolhe <b>uma</b> atividade
          da lista abaixo.
        </P>
        <P>
          Toda semana em lugar seguro traz as noites de sono junto, seja qual for a atividade: PM, PT e PP
          voltam inteiros, e a Exaustão cuja causa já acabou vai embora (Descanso Longo, Cap. 4). <b>Os PV são
          a exceção</b> — todos só voltam em Recuperar-se, que é a Convalescença; nas outras atividades, cada
          noite devolve só o que um Descanso Longo devolve.
        </P>
        <BookTable
          headers={["Atividade", "Efeito"]}
          rows={[
            ["Treinar", "Ganhe Vantagem no próximo teste de uma Perícia à escolha, ligada à sua Árvore Inicial ou a uma Perícia que você já tenha — dura até ser usado ou até 1 mês passar. Não concede PA."],
            ["Recuperar-se", "Convalescença (Cap. 4): todos os PV são restaurados. Se a semana foi passada acompanhado de alguém de confiança, remove 1 ponto de Trauma (Cap. 4) — 2 pontos se alguém gastar a própria semana em Vigiar as Costas por você."],
            ["Trabalhar", "Ganhe PO igual a 2d6 × seu maior Bônus de Rank (mínimo 2d6), pelo seu Ofício, sua fama ou um trabalho comum da cidade."],
            ["Cultivar um Contato", "Anote um NPC nomeado e uma cidade ou facção. Da próxima vez que precisar de uma informação ou um favor pequeno, o Mestre pode deixar esse contato resolver — sem PP, sem teste."],
            ["Estudar um Ofício ou Ritual", "Com a Perícia de Ofícios ligada ao que quer fazer, produza um item mundano ou prepare os materiais de um ritual que já pode conjurar. O Mestre define o custo em PO — normalmente metade do preço de mercado."],
            ["Vigiar as Costas do Grupo", "Sem efeito próprio, mas concede a outro personagem Vantagem na atividade dele nesta semana."],
          ]}
        />
        <Warning title="Downtime Não Compra Progressão">
          Nenhuma atividade acima concede PA, magia, talento ou Rank — isso só vem de jogar a campanha (Cap.
          1, seção 2). Downtime existe pra que o tempo entre aventuras pareça vivido, não pra virar uma
          segunda forma de subir de patamar sem risco.
        </Warning>
        <SubTitle>Downtime Interrompido</SubTitle>
        <P>
          Se uma aflição (Cap. 4, §8) estiver ativa em alguém do grupo, ela continua cobrando o efeito dela
          normalmente durante o downtime — um bloco de &ldquo;Recuperar-se&rdquo; trata ferimento, não trata
          veneno nem doença. Só um feitiço de Desintoxicação do rank certo, ou uma poção adequada, encerram isso.
        </P>
      </Section>

      <Section>
        <SectionTitle id="cap5-2">2. A Guilda de Aventureiros</SectionTitle>
        <Prancha id="cap5-2" />
        <P>
          Toda cidade com mais de um poço tem uma sede da Guilda, e é lá que a maioria dos personagens deste
          livro começa. O Rank de Aventureiro determina quais contratos e itens a Guilda oferece.
        </P>
        <SubTitle>O Rank Não É o Patamar</SubTitle>
        <P>
          <b>O Rank de Aventureiro (F a S) mede reputação, não poder de combate.</b> Ele não aparece em
          nenhuma fórmula deste livro, não dá bônus de ataque, e não é igual ao Rank das suas Árvores de
          Progressão. Um Deus da Espada desconhecido que nunca aceitou um contrato formal pode ser Rank F. Um
          grupo de Rank A pode ter só um patamar Avançado cada — a diferença é que eles já resolveram cem
          contratos e a Guilda sabe o nome deles.
        </P>
        <BookTable
          headers={["Rank", "Feito representativo (não é checklist)", "O que muda"]}
          rows={[
            ["F", "Recém-registrado — ainda não fez nada que a sede saiba.", "Só pega contrato de mural público, sem escolta nem garantia."],
            ["E", "Sobreviveu ao trabalho de rotina algumas vezes.", "Escolta de caravana, extermínio de pragas, entrega em estrada segura."],
            ["D", "Resolveu algo fora da cidade-sede sem apoio da Guilda.", "Aceita contratos fora da cidade-sede. Pagamento sobe; a Guilda cobra 10% de taxa de intermediação."],
            ["C", "Liderou outros aventureiros num contrato e todos voltaram.", "Pode liderar um grupo de Ranks inferiores — e responde por eles se algo sair errado. Acesso ao arquivo de bestas da sede local."],
            ["B", "Resolveu algo que chegou aos ouvidos de um nobre ou general.", "Contratos de nobreza e de guerra pequena passam pela sua mesa. Seu nome aparece em relatórios que sobem pra capital."],
            ["A", "Fez algo que virou boato em mais de uma cidade.", "Reconhecido em qualquer continente que tenha Guilda. Recusar um contrato regional exige justificativa formal."],
            ["S", "Fez algo que devia ter sido impossível.", "Menos de dez vivos por continente, normalmente. Contratado direto por reinos e Guildas de outras nações — vira assunto de história, não de mural."],
          ]}
        />
        <Aside title="A tabela é exemplo, não fórmula">
          Não existe PA, teste ou compra que suba o Rank de Aventureiro — ao contrário do Rank das suas
          Árvores, essa decisão nunca sai de uma conta. <b>O Mestre fala quando o personagem sobe</b>, olhando
          pro que o grupo <i>fez</i> publicamente, não pro que gastou na ficha: um Deus da Espada que resolveu
          tudo em segredo pode morrer Rank F — ele é forte, só não é famoso. Os &ldquo;feitos representativos&rdquo;
          acima são só uma régua de bolso pro Mestre calibrar o tamanho do que já rolou, não uma lista pra
          marcar.
        </Aside>
        <Aside title="Todo personagem começa Rank F">
          Recém-registrado na Guilda, sem história nenhuma. A ficha mostra F até o Mestre registrar outro Rank.
        </Aside>
        <SubTitle>Subindo de Rank e Obrigações</SubTitle>
        <P>
          A promoção nunca é automática, mesmo depois do Mestre decidir que o feito foi grande o bastante:
          exige voltar à sede, ser avaliado, e — a partir de Rank C — pagar uma taxa de registro: <b>50 PO</b>{" "}
          pra C, <b>150 PO</b> pra B, <b>400 PO</b> pra A e <b>1.000 PO</b> pra S.
        </P>
        <P>
          A partir de <b>Rank C</b>, recusar um contrato marcado como emergência sem justificativa perde
          Rank. A partir de <b>Rank A</b>, a morte do aventureiro em contrato é investigada formalmente pela
          sede.
        </P>
        <Aside title="Gancho pro Mestre">
          Todo contrato do mural leva duas etiquetas. O <b>Rank exigido</b> é fama: o grupo só aceita
          contratos até o próprio Rank de Aventureiro. O <b>Perigo</b> é o patamar sugerido pra quem vai
          encarar, e a Guilda diz isso ao grupo antes de ele assinar. Calibre o Perigo pelo patamar do grupo,
          nunca pelo Rank — o Deus da Espada Rank F só pega contrato de F, mas nada impede que um contrato
          de F venha etiquetado com Perigo de Santo.
        </Aside>

        <SubTitle>A Loja da Guilda</SubTitle>
        <P>
          Rank de Aventureiro não é só fama — é a credencial que abre a porta do que a Guilda deixa você
          comprar ou encomendar. Cada Rank libera o próximo andar do catálogo da seção 4 deste capítulo;
          abaixo do seu Rank, o item simplesmente não está à venda ali, por mais PO que você tenha.
        </P>
        <BookTable
          headers={["Rank mínimo", "O que a Guilda libera"]}
          rows={[
            ["F", "Poção Menor de Cura, equipamento mundano comum."],
            ["E", "Poção de Antídoto e Elixir de Foco; veneno de rank Principiante."],
            ["D", "Poção de Vigor Passageiro; encomenda de Encantamento nível Avançado (+1 degrau na Escada de Dados da arma, ou +1 na CA da armadura)."],
            ["C", "Poção Maior de Cura e Poção de Antídoto Forte; veneno de rank Intermediário, com licença registrada."],
            ["B", "Poção Régia de Cura; encomenda de Encantamento nível Santo (dano elemental extra)."],
            ["A", "Elixir de Regeneração; encomenda de Encantamento nível Rei (ignora Resistência); veneno de rank Avançado, sob vigilância da sede."],
            ["S", "Poção Imperial de Cura e Égide Lendária; Antídoto Universal; encomenda de Encantamento nível Imperador; a sede intermedia contato com um encantador de rank Deus pra um Item Mágico Único (seção 4 deste capítulo) — abre a porta, não garante o resultado."],
          ]}
        />
        <Aside title="Por que isso importa">
          A Guilda exige reputação além de PO para liberar os itens mais raros.
        </Aside>

        <SubTitle id="cap5-2-fora-da-guilda">O que a Guilda não vende</SubTitle>
        <P>
          Nem tudo que existe no Mundo de Seis Faces tem prateleira. O catálogo abaixo traz o mundo
          inteiro, em três disponibilidades:
        </P>
        <BookTable
          headers={["Disponibilidade", "Onde se consegue", "Preço"]}
          rows={[
            [
              "Guilda F–S",
              "À venda na sede, respeitando o Rank mínimo da tabela acima.",
              "O da tabela.",
            ],
            [
              "Fora da Guilda",
              "Existe, e não na vitrine: cai de criatura, vem de contrato, de contrabando ou do mercado negro. O Mestre decide quando aparece.",
              "O da tabela — alguém paga esse valor, só não é a Guilda que vende.",
            ],
            [
              "Relíquia",
              "Só pela história. Uma Lança Genuína de Superd, o Olho da Previsão ou a Armadura Zariff chegam pelas mãos de alguém, nunca por uma rolagem de tesouro.",
              "Nenhum. Não se compra, não se vende, não se avalia.",
            ],
          ]}
        />
        <Aside title="Por que relíquia não tem preço">
          Porque um preço serve pra duas coisas, e as duas quebram. Se ela pode ser comprada, basta juntar
          PO — e um item que fecha a campanha vira questão de paciência. Se ela pode ser vendida, o grupo que
          achar UMA nunca mais precisa de dinheiro: o maior preço do resto do livro é 2.000 PO, e trabalhar
          uma semana inteira no Downtime rende 2d6 × Bônus de Rank. A relíquia fica fora da conta justamente
          pra que a conta continue existindo.
        </Aside>

        <SubTitle id="cap5-2-vender">Vender o que caiu</SubTitle>
        <P>
          A Guilda e os mercadores não são seus amigos: eles querem lucro. Três regras, e elas valem pra
          tudo que o grupo tirar do campo:
        </P>
        <BookTable
          headers={["O que você está vendendo", "Quanto rende", "Por quê"]}
          rows={[
            [
              "Espólio (presa, casco, gema esgotada, pano amaldiçoado)",
              "100% do preço",
              "É matéria-prima, e o ferreiro, o alquimista e o bruxo consomem isso mais rápido do que aparece. Tem demanda, então tem preço justo.",
            ],
            [
              "Arma, armadura, poção, veneno e ferramenta",
              "50% do preço",
              "O lojista precisa de margem, e equipamento de bandido morto ainda vai ser limpo, afiado e legalizado antes de voltar pra vitrine.",
            ],
            [
              "Relíquia",
              "Não se vende",
              "Não tem preço (acima). Ela troca de mão por acordo, dívida ou favor — e isso é cena, não transação.",
            ],
          ]}
        />
        <Aside title="O ciclo que isso cria">
          <P>
            Espólio vendendo a 100% e equipamento a 50% não é detalhe de contabilidade: é o que faz caçar
            valer mais que saquear. Um grupo que limpa um acampamento de bandidos sai com cinco espadas
            que rendem metade; o mesmo grupo, caçando a criatura certa, sai com presas e cascos que rendem
            tudo.
          </P>
          <P>
            E quando a relíquia aparece, ela não muda a planilha do grupo — muda a história dele, porque a
            única coisa que dá pra fazer com ela é usá-la ou entregá-la a alguém que a queira muito.
          </P>
        </Aside>

        <SubTitle>Catálogo da Loja</SubTitle>
        <ShopCatalog />
      </Section>

      <Section>
        <SectionTitle id="cap5-3">3. Reputação com Facções</SectionTitle>
        <P>
          Nem toda consequência de uma campanha cabe em PA ou em Rank de Aventureiro (seção 2 deste
          capítulo) — às vezes o que muda é quem abre a porta pra você. Reputação é uma escala narrativa de
          cinco degraus, uma por facção, movida pelo Mestre conforme os atos públicos do grupo.
        </P>
        <Aside title="Guilda ou Reputação — qual eu uso?">
          As duas medem &ldquo;quão bem o mundo te trata&rdquo;, mas em escalas diferentes: a <b>Guilda</b> (seção 2) é
          uma fama profissional única, a mesma em qualquer cidade que tenha uma sede. <b>Reputação</b> é por
          facção específica — dá pra ser Aliado do Reino Asura e Inimigo da Igreja de Millis ao mesmo tempo,
          e nenhuma das duas mexe na outra.
        </Aside>
        <BookTable
          headers={["Nível", "O que significa, em qualquer facção"]}
          rows={[
            ["Inimigo (-2)", "A facção age ativamente contra o grupo, sempre que puder fazer isso sem custo alto pra ela."],
            ["Desconfiado (-1)", "Portas se fecham por precaução. Nenhum ataque direto, mas nenhuma ajuda também."],
            ["Neutro (0)", "Ponto de partida padrão — a facção nem sabe quem vocês são, ou sabe e não se importa."],
            ["Respeitado (+1)", "Contratos, favores e informação ficam mais fáceis de conseguir dentro do território da facção."],
            ["Aliado (+2)", "A facção arrisca recursos reais pelo grupo — tropas, magos, dinheiro."],
          ]}
        />
        <SubTitle>As Três Facções deste Livro</SubTitle>
        <BookTable
          headers={["Nível", "Reino Asura", "Igreja de Millis", "Deuses Demônios"]}
          rows={[
            ["Inimigo", "Mandado de captura ativo — a guarda ataca de vista.", "Excomungado. Templos recusam cura, abrigo e água.", "Marcado como inimigo pela Imperatriz Kishirika."],
            ["Desconfiado", "Vigiados: espiões da coroa relatam cada movimento em Ars.", "Sacerdotes recusam bênção e informação, mas não interferem.", "Tolerados, desde que fiquem fora do território de um clã específico."],
            ["Neutro", "Só mais um grupo de aventureiros no registro da capital.", "Nenhum templo conhece o grupo pelo nome.", "O grupo é estrangeiro — cuidado padrão, nada pessoal."],
            ["Respeitado", "Acesso à corte menor; contratos diretos, sem passar pela Guilda.", "Curas gratuitas em templos menores; acesso à biblioteca de um mosteiro.", "Um clã garante passagem segura pelo seu território."],
            ["Aliado", "Audiência com a coroa por pedido; tropas reais em campanhas regionais.", "O Grande Templo de Millis abre arquivos restritos.", "A Imperatriz Kishirika reconhece o grupo."],
          ]}
        />
        <Aside title="Como o Mestre move o marcador">
          Não existe fórmula. Reputação sobe ou desce por atos públicos, não por PA gasto ou sessões jogadas.
          Mude só um degrau por vez, e só quando o ato for grande o bastante pra virar boato ou registro
          oficial.
        </Aside>
        <Aside title="Facções não são unânimes">
          &ldquo;Reino Asura&rdquo; e &ldquo;Igreja de Millis&rdquo; têm política interna — nada impede um
          personagem de ser Aliado de uma ala e Inimigo de outra dentro da mesma facção nominal.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap5-4">4. Crafting e Alquimia</SectionTitle>
        <SubTitle>Como Funciona o Crafting</SubTitle>
        <P>
          Quatro perguntas resolvem qualquer fabricação desta seção: quem pode fazer, quanto tempo leva,
          quanto custa em materiais e o que acontece se o teste falhar. As respostas são sempre as mesmas
          quatro regras abaixo — as tabelas de Poções, Venenos e Encantamentos só preenchem os números.
        </P>
        <List
          items={[
            "Quem: qualquer personagem com a Perícia de Ofícios (especializada em Alquimia, pra Poções e Venenos) ligada ao item. Encantamento é diferente — exige um encantador vivo no Rank de árvore listado na tabela, não a Perícia de Ofícios.",
            "Até onde: a tabela de Poções diz o patamar que cada receita exige (Cura pras poções de cura, Desintoxicação pros antídotos) — o alquimista precisa de um patamar igual ou superior àquele. Receita marcada com — não exige patamar nenhum, só a Perícia. Um veneno de rank X exige um patamar igual ou superior a X em Desintoxicação, ou material colhido de uma criatura daquele porte. Sem isso, a receita simplesmente não é legível — não é uma CD mais alta, é um teste que você não pode tentar.",
            "Tempo: 1 bloco de Downtime (seção 1 deste capítulo, atividade Estudar um Ofício ou Ritual) por item, salvo quando a tabela disser outro valor.",
            "Custo em materiais: metade do valor listado na coluna de Custo — a mesma proporção que a regra de Downtime já usa pra qualquer produção. O valor cheio da coluna é o preço de venda, não o de fabricação.",
            "Teste (Poções e Venenos; Encantamento não tem teste): role Ofícios contra a CD da tabela ao fim do bloco. Sucesso: o item fica pronto. Falha: metade dos materiais é recuperável, mas o bloco de Downtime já foi gasto — tente de novo no próximo. Falha crítica (os dois d20 mostram 1): perdem-se todos os materiais, e se era veneno você se expõe à dose (teste de resistência de Vigor, Cap. 4, §8).",
          ]}
        />
        <Aside title="Por que a receita exige Rank">
          O Rank limita a fabricação aos itens que o personagem já entende, mesmo quando ele tem PO e perícia.
        </Aside>
        <SubTitle>Poções</SubTitle>
        <P>
          <b>Poção não é magia.</b> Cada uma tem um efeito fixo, escrito na tabela, e nunca copia um feitiço,
          um ritual ou uma Reação. Beber uma, ou fazer um aliado adjacente beber, é Usar Item (1 Ação, Cap. 4).
          Por não ser magia, a Ferida Fresca não dobra os dados dela — e nenhuma poção apaga Ferimento Crítico.
        </P>
        <BookTable
          headers={["Poção", "CD de Ofícios · receita", "Custo (venda / fabricação)", "Efeito"]}
          rows={[
            ["Poção Menor de Cura", "11 · Cura Principiante", "15 PO / 8 PO", "Cura 1d8 + 2 PV."],
            ["Poção de Antídoto", "13 · Desintoxicação Principiante", "25 PO / 13 PO", "Remove um veneno ou uma doença de rank Principiante (Cap. 4, §8). Contra ranks acima disso, não faz nada — é uma dose, não um mago."],
            ["Poção Maior de Cura", "15 · Cura Avançado", "60 PO / 30 PO", "Cura 3d8 + 3 PV."],
            ["Elixir de Foco", "13 · —", "40 PO / 20 PO", "Por 1 cena, ignore a Desvantagem que o Trauma impõe (Cap. 4) — o gole antes de uma negociação que não pode dar errado."],
            ["Poção de Vigor Passageiro", "14 · —", "45 PO / 23 PO", "Vantagem no próximo teste de resistência de Vigor — contra um veneno, uma doença ou o frio que está chegando."],
            ["Poção de Antídoto Forte", "16 · Desintoxicação Intermediário", "120 PO / 60 PO", "Remove um veneno ou uma doença de rank Intermediário ou inferior (Cap. 4, §8)."],
            ["Poção Régia de Cura", "17 · Cura Rei", "120 PO / 60 PO", "Cura 5d8 + 4 PV."],
            ["Elixir de Regeneração", "18 · —", "200 PO / 100 PO", "Remove 2 níveis de Exaustão de quem bebe (Cap. 4, §9) — não cura PV nem PM, só o cansaço acumulado. Não remove Exaustão cuja causa ainda esteja ativa: quem não comeu continua com fome."],
            ["Antídoto Universal", "19 · Desintoxicação Santo", "800 PO / 400 PO", "Remove um veneno ou uma doença de rank Santo ou inferior (Cap. 4, §8). Nunca toca maldição nem transformação: essas continuam exigindo alguém que conjure Desintoxicação."],
            ["Poção Imperial de Cura", "20 · Cura Imperador", "400 PO / 200 PO", "Cura 5d8 + 6 PV e remove toda a Exaustão de origem física (ferimento, trauma, ter acordado do Fio da Vida) — nunca a de fome, sede, frio ou marcha forçada."],
          ]}
        />
        <SubTitle>Venenos</SubTitle>
        <P>
          Fabricar veneno é produzir uma dose de uma aflição já catalogada no Cap. 4, §8 — a CD de Ofícios
          sobe junto com o rank, porque manusear algo mais perigoso sem se envenenar no processo é
          mais difícil. Como aplicar a dose em alguém está no Cap. 4, §8, seção &ldquo;Aplicando um Veneno em
          Combate ou em Segredo&rdquo;.
        </P>
        <BookTable
          headers={["Rank", "Exemplo", "CD de Ofícios", "Custo (venda / fabricação)"]}
          rows={[
            ["Principiante", "Baba de Sapo-Lodo", "10", "5 PO / 3 PO"],
            ["Intermediário", "Peçonha de Serpente-do-Pântano", "12", "20 PO / 10 PO"],
            ["Avançado", "Fel de Wyvern", "14", "80 PO / 40 PO"],
            ["Santo+", "Sombra Líquida", "16+", "Não está à venda — só se rouba, caça ou herda."],
          ]}
        />
        <Warning title="A lei e o veneno">
          Vender veneno de rank Avançado ou superior sem licença é crime em Millis e no Reino Asura — perde
          Reputação (seção 3 deste capítulo) com a facção local automaticamente.
        </Warning>
        <SubTitle>Encantamento de Arma e Armadura</SubTitle>
        <P>
          Encantar não é uma Perícia de Ofícios — é um serviço prestado por um mago que já alcançou o Rank
          exigido numa árvore compatível com o efeito (dano elemental pede a Magia daquele elemento;
          resistência e CA pedem Magia Teórica; qualquer efeito genérico aceita Invocação). Um personagem só
          encanta os próprios itens se tiver esse Rank; caso contrário, é preciso pagar um NPC encantador. A
          Guilda intermedeia o encantador a partir do Rank D (seção 2 deste capítulo); fora dela, achar um é
          gancho de campanha.
        </P>
        <BookTable
          headers={["Efeito", "Rank exigido no encantador", "Tempo", "Custo em PO"]}
          rows={[
            ["+1 degrau na Escada de Dados (arma, Cap. 3) ou +1 na CA (armadura — o +1 entra no valor da própria armadura: +3 vira +4)", "Avançado", "1 bloco", "150 PO"],
            ["Dano elemental extra (+1d6, tipo à escolha)", "Santo", "2 blocos", "300 PO"],
            ["Ignora Resistência a um tipo de dano", "Rei", "4 blocos", "600 PO"],
            ["+1 degrau na Escada de Dados (arma), somado ao do Avançado; se o item tem o encantamento Santo, o dano elemental dele passa a 2d6", "Imperador", "8 blocos", "1500 PO"],
          ]}
        />
        <List
          items={[
            "Um item carrega no máximo um encantamento de cada nível (Avançado, Santo, Rei e Imperador), e todos somam. Encantar de novo no mesmo nível substitui o anterior daquele nível — o efeito antigo não some primeiro para depois voltar; some pra sempre. Uma espada com Avançado e Imperador sobe dois degraus da Escada.",
            "O custo em PO acima já é o total (materiais + o trabalho do encantador) — não se aplica a divisão por metade do Downtime comum, porque não é o próprio personagem fazendo o trabalho manual.",
            "O item-base (a arma ou armadura sem encantamento) precisa existir e estar em posse do encantador durante todo o tempo listado — ele não trabalha à distância.",
            "Não existe teste de falha aqui: se o encantador tem o Rank exigido, tempo e PO cobrem o serviço inteiro. O único jeito de um encantamento falhar é o Mestre decidir que os materiais raros da campanha ainda não foram conseguidos — nesse caso, PO sozinho não compra o item.",
          ]}
        />
        <SubTitle>Itens Mágicos Únicos — o Anel de Teleporte</SubTitle>
        <P>
          Nem todo item mágico cabe numa tabela de preço. Alguns são artefatos: peças únicas cuja fabricação
          é evento de campanha, não compra de ficha — exatamente como o Rank Deus.
        </P>
        <Aside title="O Anel de Teleporte">
          <P>
            <b>O que faz:</b> teleporta o portador — e quem ele tocar — pra um de até três destinos gravados,
            sem custo de PM, sem teste. Depois de usado, precisa de 1 semana pra recarregar.
          </P>
          <P>
            <b>Por que não está na tabela acima:</b> exige um encantador de Invocação de rank Deus, materiais
            que só existem em circunstâncias específicas da campanha, e é irrepetível — gravar um novo
            destino exige voltar ao mesmo encantador. Trate a fabricação como o final de um arco inteiro.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap5-5">5. Dojos e Mestres — a progressão que não se compra</SectionTitle>
        <Prancha id="cap5-5" />
        <P>
          Todo o resto deste livro se compra com PA. Isso funciona, e tem um preço que só aparece depois de
          umas vinte sessões: <b>o mundo deixa de importar para a ficha</b>. Dá pra jogar a campanha inteira
          numa taverna e progredir igual a quem atravessou o continente.
        </P>
        <P>
          Certos nós das árvores são <b>fechados a chave</b>, e a chave é uma pessoa. Não tem preço em PA,
          não tem downtime que resolva, não tem loja que venda. Você encontra o mestre, ou não abre.
        </P>
        <ArteDaHabilidade midia={ARTE_DO_DOJO} />

        <SubTitle id="cap5-5-quem">Quem pode ensinar</SubTitle>
        <List
          items={[
            <span key="p">
              <b>Patamar do aluno</b> é o maior patamar dele em qualquer árvore — mesmo que a árvore que o
              mestre abre ainda nem exista na ficha. É esse número que conta aqui e na tabela do Dilema, mais
              abaixo.
            </span>,
            <span key="a">
              <b>Dois patamares acima</b> do aluno, no mínimo. Quem está um patamar acima é um colega com
              mais estrada: pode dar conselho, não pode abrir a mente de ninguém.
            </span>,
            <span key="b">
              <b>Divindades ignoram a escada.</b> Um Deus não está dois patamares acima de você — ele está
              fora da contagem.
            </span>,
            <span key="c">
              <b>Salto de patente vale por dois.</b> Um Imperador ensinando um Rei conta, mesmo sendo um só
              patamar: o que mede aqui é o título, e a distância entre esses dois é maior que a distância
              entre dois patamares quaisquer lá embaixo.
            </span>,
          ]}
        />

        <SubTitle id="cap5-5-provacao">A provação, e o que faz uma ser boa</SubTitle>
        <P>
          A provação não é uma missão difícil — é uma missão que <b>tira dos jogadores aquilo em que eles
          são bons</b>. O Deus do Arco não pediu que o arqueiro atirasse melhor: ele obrigou o espadachim e
          o mago a atirar. É dali que a sessão tira o que ela tem de memorável, e é por isso que o
          critério de aprovação nunca deveria ser &ldquo;matou o monstro&rdquo;.
        </P>
        <Aside title="Concluir a provação abre a árvore de graça">
          O desbloqueio não custa PA nenhum, e isso é de propósito: o preço já foi pago em sessão. O que
          vem depois é o Dilema.
        </Aside>

        <SubTitle id="cap5-5-dilema">O Dilema de Recompensa</SubTitle>
        <P>
          Cada jogador escolhe <b>uma</b> das três portas. A escolha é individual: dois personagens podem
          sair do mesmo dojo com recompensas diferentes.
        </P>
        {/* Três colunas, e não quatro: a de "A Marca do Mestre" dizia "sempre
            disponível" nas três linhas. Coluna com o mesmo valor em toda linha não
            é informação — é uma coluna. E era ela que empurrava a tabela pra fora
            da tela num celular de 390px. A Marca está na lista logo abaixo. */}
        <BookTable
          headers={["Patamar do aluno", "PA travados na árvore nova", "PA livre"]}
          rows={RECOMPENSA_POR_PATAMAR.map((r) => [
            `${r.patamares[0]}–${r.patamares[r.patamares.length - 1]}`,
            `${r.travados} PA`,
            `${r.livre} PA`,
          ])}
        />
        <P className="text-sm">
          A <b>Marca do Mestre</b> é a terceira porta, e está disponível em qualquer patamar.
        </P>
        <List
          items={[
            <span key="t">
              <b>PA travados</b> só podem ser gastos na árvore que a provação abriu. Se o personagem
              abandonar a árvore, aquele PA morre com ela — é o preço de ter escolhido o número maior.
            </span>,
            <span key="l">
              <b>PA livre</b> vale menos em quantidade e mais por unidade: ele vai onde você já tem Bônus de
              Rank, e é ali que um PA rende de verdade.
            </span>,
            <span key="m">
              <b>{MARCA_DO_MESTRE.nome}:</b> {MARCA_DO_MESTRE.texto}
            </span>,
          ]}
        />
        <Warning title="Por que o travado nunca passa do dobro do livre">
          O limite de dois para um mantém a escolha entre PA travado e livre relevante em qualquer patamar.
        </Warning>

        <SubTitle id="cap5-5-limites">Os limites</SubTitle>
        <List items={LIMITES.map((l, i) => <span key={i}>{l}</span>)} />
        <Warning title="A trava tem que ter uma válvula">
          Um nó fechado a chave só é bom enquanto a chave existe. Se o Mestre trava uma árvore e nunca
          coloca o dojo no mundo, o jogador não está jogando um sistema de exploração — está esperando.
          <b> Regra de bolso: nenhuma trava sem pelo menos um rumor plantado na mesma sessão em que o
          jogador esbarra nela.</b> O rumor pode ser falso, o dojo pode estar a um continente de distância,
          o mestre pode estar morto e ter deixado um discípulo. O que não pode é o silêncio.
        </Warning>

        <SubTitle id="cap5-5-exemplos">Quatro mestres prontos</SubTitle>
        {PROVACOES.map((p) => (
          <Aside key={p.id} title={`${p.nome} — abre ${p.abre}`}>
            <P>
              <b>Patente:</b> {p.patenteDoMestre}
            </P>
            <P>
              <b>A quebra:</b> {p.quebra}
            </P>
            <P>
              <b>A provação:</b> {p.provacao}
            </P>
            <P>
              <b>Regra da casa:</b> {p.regraDaCasa}
            </P>
            <P>
              <b>Critério:</b> {p.criterio}
            </P>
          </Aside>
        ))}
      </Section>

      <FimDoCapitulo id="cap5" />
    </div>
  );
}
