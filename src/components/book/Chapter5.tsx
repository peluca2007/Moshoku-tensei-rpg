import { Aside, BookTable, ChapterTitle, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";

export default function Chapter5() {
  return (
    <div className="space-y-8">
      <ChapterTitle id="cap5">Capítulo 5 — Entre Aventuras</ChapterTitle>
      <P>
        Nem toda sessão é masmorra. Este capítulo reúne os quatro sistemas que rodam entre combates — tempo
        livre, fama na Guilda, reputação com o mundo e o que dá pra fabricar com as próprias mãos — porque
        eles se usam com a mesma frequência que qualquer regra do Capítulo 4, mesmo fora da luta.
      </P>

      <Section>
        <SectionTitle id="cap5-1">1. Tempo Livre e Downtime</SectionTitle>
        <P>
          Toda campanha tem trechos sem masmorra: a viagem de volta, a estação chuvosa, o mês esperando uma
          audiência com o rei. Esta seção existe pra que esse tempo produza algo na ficha, sem virar
          burocracia.
        </P>
        <SubTitle>O Bloco de Tempo</SubTitle>
        <P>
          Downtime é contado em <b>blocos de 1 semana</b> — a mesma unidade que o Descanso Longo (Cap. 4) já
          usa pra curar todos os PV. No fim de cada semana livre, cada personagem escolhe <b>uma</b> atividade
          da lista abaixo.
        </P>
        <BookTable
          headers={["Atividade", "Efeito"]}
          rows={[
            ["Treinar", "Ganhe Vantagem no próximo teste de uma Perícia à escolha, ligada à sua Árvore Inicial ou a uma Perícia que você já tenha — dura até ser usado ou até 1 mês passar. Não concede PA."],
            ["Recuperar-se", "Como o Descanso Longo de uma semana (Cap. 4): todos os PV são restaurados, e mais 1 nível de Exaustão é removido além do normal."],
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
          Se uma aflição (Cap. 4, §7) estiver ativa em alguém do grupo, a Profundidade dela continua subindo
          normalmente durante o downtime — um bloco de &ldquo;Recuperar-se&rdquo; não pausa o relógio de um
          veneno ou de uma doença.
        </P>
      </Section>

      <Section>
        <SectionTitle id="cap5-2">2. A Guilda de Aventureiros</SectionTitle>
        <P>
          Toda cidade com mais de um poço tem uma sede da Guilda, e é lá que a maioria dos personagens deste
          livro começa. Esta seção formaliza o que até aqui era só referência narrativa: como funciona o
          Rank de Aventureiro, e o que ele realmente muda na mesa.
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
        <SubTitle>Subindo de Rank e Obrigações</SubTitle>
        <P>
          A promoção nunca é automática, mesmo depois do Mestre decidir que o feito foi grande o bastante:
          exige voltar à sede, ser avaliado, e — a partir de Rank C — pagar uma taxa de registro em PO.
        </P>
        <P>
          A partir de <b>Rank C</b>, recusar um contrato marcado como emergência sem justificativa perde
          Rank. A partir de <b>Rank A</b>, a morte do aventureiro em contrato é investigada formalmente pela
          sede.
        </P>
        <Aside title="Gancho pro Mestre">
          O Rank de Aventureiro é a ferramenta mais simples deste livro pra calibrar dificuldade sem inventar
          números: se o grupo é Rank D, o mural tem contratos de Rank D pra cima. Nenhuma tabela de
          dificuldade de monstro é necessária além disso.
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
            ["E", "Poção de Antídoto e Elixir de Foco; veneno de Profundidade 1."],
            ["D", "Encomenda de Encantamento nível Avançado (+1 no Dado de Arma ou na CA)."],
            ["C", "Poção Maior de Cura; veneno de Profundidade 2, com licença registrada."],
            ["B", "Encomenda de Encantamento nível Santo (dano elemental extra)."],
            ["A", "Encomenda de Encantamento nível Rei (ignora Resistência); veneno de Profundidade 3, sob vigilância da sede."],
            ["S", "Encomenda de Encantamento nível Imperador; a sede intermedia contato com um encantador de rank Deus pra um Item Mágico Único (seção 4 deste capítulo) — abre a porta, não garante o resultado."],
          ]}
        />
        <Aside title="Por que isso importa">
          Antes, um personagem rico conseguia qualquer item de Crafting cedo demais, só juntando PO. Agora o
          Rank de Aventureiro é o segundo portão — o dinheiro compra o item, mas só depois que a Guilda
          confia em você o bastante pra deixar você chegar perto dele.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap5-3">3. Reputação com Facções</SectionTitle>
        <P>
          Nem toda consequência de uma campanha cabe em PA ou em Rank de Aventureiro (seção 2 deste
          capítulo) — às vezes o que muda é quem abre a porta pra você. Reputação é uma escala narrativa de
          cinco degraus, uma por facção, movida pelo Mestre conforme os atos públicos do grupo.
        </P>
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
            "Tempo: 1 bloco de Downtime (seção 1 deste capítulo, atividade Estudar um Ofício ou Ritual) por item, salvo quando a tabela disser outro valor.",
            "Custo em materiais: metade do valor listado na coluna de Custo — a mesma proporção que a regra de Downtime já usa pra qualquer produção. O valor cheio da coluna é o preço de venda, não o de fabricação.",
            "Teste: role Ofícios (ou o teste do encantador) contra a CD da tabela ao fim do bloco. Sucesso: o item fica pronto. Falha: os materiais se perdem, mas o bloco de Downtime já foi gasto — tente de novo no próximo. Falha crítica (1 no dado): metade dos materiais é recuperável.",
          ]}
        />
        <SubTitle>Poções</SubTitle>
        <P>Uma poção reproduz o efeito de uma magia de Cura ou Desintoxicação já existente no livro, engarrafado.</P>
        <BookTable
          headers={["Poção", "CD de Ofícios", "Custo (venda / fabricação)", "Efeito"]}
          rows={[
            ["Poção Menor de Cura", "11", "15 PO / 8 PO", "Reproduz uma magia de Cura de rank Principiante ou Intermediário, sem precisar de mago presente."],
            ["Poção de Antídoto", "13", "25 PO / 13 PO", "Remove 1 ponto de Profundidade de uma única aflição (Cap. 4, §7)."],
            ["Poção Maior de Cura", "15", "60 PO / 30 PO", "Reproduz uma magia de Cura de rank Avançado ou Santo."],
            ["Elixir de Foco", "13", "40 PO / 20 PO", "Vantagem no próximo teste de resistência de Espírito — ajuda a resistir Trauma num momento específico."],
          ]}
        />
        <SubTitle>Venenos</SubTitle>
        <P>
          Fabricar veneno é produzir uma dose de uma aflição já catalogada no Cap. 4, §7 — a CD de Ofícios
          sobe junto com a Profundidade, porque manusear algo mais perigoso sem se envenenar no processo é
          mais difícil. Como aplicar a dose em alguém está no Cap. 4, §7, seção &ldquo;Aplicando um Veneno em
          Combate ou em Segredo&rdquo;.
        </P>
        <BookTable
          headers={["Profundidade", "Exemplo", "CD de Ofícios", "Custo (venda / fabricação)"]}
          rows={[
            ["1", "Baba de Sapo-Lodo", "10", "5 PO / 3 PO"],
            ["2", "Peçonha de Serpente-do-Pântano", "12", "20 PO / 10 PO"],
            ["3", "Fel de Wyvern", "14", "80 PO / 40 PO"],
            ["4+", "Praga do Continente Demônio", "16+", "Não está à venda — só se rouba, caça ou herda."],
          ]}
        />
        <Warning title="A lei e o veneno">
          Vender veneno de Profundidade 3 ou superior sem licença é crime em Millis e no Reino Asura — perde
          Reputação (seção 3 deste capítulo) com a facção local automaticamente.
        </Warning>
        <SubTitle>Encantamento de Arma e Armadura</SubTitle>
        <P>
          Encantar não é uma Perícia de Ofícios — é um serviço prestado por um mago que já alcançou o Rank
          exigido numa árvore compatível com o efeito (dano elemental pede a Magia daquele elemento;
          resistência e CA pedem Barreira; qualquer efeito genérico aceita Invocação). Um personagem só
          encanta os próprios itens se tiver esse Rank; caso contrário, é preciso encontrar e pagar um NPC
          encantador — o que normalmente é um gancho de campanha, não uma visita à loja.
        </P>
        <BookTable
          headers={["Efeito", "Rank exigido no encantador", "Tempo", "Custo em PO"]}
          rows={[
            ["+1 no Dado de Arma ou +1 na CA", "Avançado", "1 bloco", "150 PO"],
            ["Dano elemental extra (+1d6, tipo à escolha)", "Santo", "2 blocos", "300 PO"],
            ["Ignora Resistência a um tipo de dano", "Rei", "4 blocos", "600 PO"],
            ["+1 no Bônus de Rank pra fins de Dado de Arma", "Imperador", "8 blocos", "1500 PO"],
          ]}
        />
        <List
          items={[
            "Um item só carrega um encantamento por vez. Encantar de novo substitui o anterior — o efeito antigo não some primeiro para depois voltar; some pra sempre.",
            "O custo em PO acima já é o total (materiais + o trabalho do encantador) — não se aplica a divisão por metade do Downtime comum, porque não é o próprio personagem fazendo o trabalho manual.",
            "O item-base (a arma ou armadura sem encantamento) precisa existir e estar em posse do encantador durante todo o tempo listado — ele não trabalha à distância.",
            "Não existe teste de falha aqui: se o encantador tem o Rank exigido, tempo e PO cobrem o serviço inteiro. O único jeito de um encantamento falhar é o Mestre decidir que os materiais raros da campanha ainda não foram conseguidos — nesse caso, PO sozinho não compra o item.",
          ]}
        />
        <SubTitle>Itens Mágicos Únicos — O Anel de Teleporte como Prova de Conceito</SubTitle>
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
    </div>
  );
}
