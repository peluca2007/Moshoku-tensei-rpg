import { Aside, BookTable, ChapterTitle, List, P, Section, SectionTitle, SubTitle, Warning } from "./BookUI";

export default function Chapter4() {
  return (
    <div className="space-y-8">
      <ChapterTitle id="cap4">Capítulo 4 — O Combate e a Sobrevivência</ChapterTitle>
      <P>Quando a diplomacia falha e as espadas são desembainhadas, o sistema adota um combate rápido, letal e tático.</P>

      <Section>
        <SectionTitle id="cap4-1">1. Cálculos Vitais</SectionTitle>
        <P>
          PV e PM não são calculados só na criação — eles crescem toda vez que você desbloqueia um Rank novo
          em qualquer árvore. As fórmulas abaixo são as que valem sempre, do 1º patamar ao Imperador; a ficha
          recalcula os dois números automaticamente a cada Rank novo.
        </P>
        <Aside title="PV Máximos = Constituição Base + Progressão + Vitalidade">
          <List
            items={[
              <span key="cb"><b>Constituição Base = 10 + (Vigor × 3)</b>, mínimo 13. É o corpo com que você nasceu, antes de qualquer treino.</span>,
              <span key="pg">
                <b>Progressão =</b> a soma de <b>todos</b> os dados de PV que suas árvores concederam, <b>dobrada</b>. No 1º patamar da sua Árvore Inicial, use sempre o valor <b>máximo</b> do dado (é o único dado rolado com garantia de máximo no livro); em qualquer outro patamar, de qualquer árvore, use a <b>média</b> do dado.
              </span>,
              <span key="vt"><b>Vitalidade = Vigor × Maior Bônus de Rank × 4.</b> O corpo endurecido pelo treino — um Imperador (Bônus +6) com Vigor 6 carrega 144 PV só disto.</span>,
            ]}
          />
        </Aside>
        <Aside title="PM Máximos = (Espírito × Maior Bônus de Rank de Magia × 2) + 8">
          <P>
            Uma fórmula só, e mais nada. <b>Escolas de magia não concedem PM nenhum</b> — a reserva inteira
            vem do seu Espírito e de quão fundo você foi numa escola. Árvores do Corpo e de Utilidade
            concedem <b>0 PM, sempre</b>, mesmo em rank Imperador — em troca, o Corpo recebe PT (Cap. 3).
          </P>
        </Aside>
        <List
          items={[
            <span key="ca"><b>Classe de Armadura (CA):</b> Base 10 + Agilidade. Cresce com armaduras, talentos e habilidades defensivas.</span>,
            <span key="ini"><b>Iniciativa:</b> 1d20 + Agilidade.</span>,
            <span key="desl"><b>Deslocamento:</b> 9 metros, exceto onde a raça indicar outro valor.</span>,
          ]}
        />
        <Aside title="Por que a fórmula é essa, e não uma soma simples">
          <P>
            Com uma fórmula ingênua (só somar os dados), um Norte de Vigor 5 chegava ao Imperador com pouco
            mais de 70 PV, contra um Imperador da Espada causando perto de 130 de dano por turno — o combate
            acabava antes de o segundo personagem agir. Dobrar a Progressão e multiplicar a Vitalidade pelo
            Bônus de Rank resolve isso: o mesmo Norte chega ao Imperador com mais de 220 PV, e o combate dura
            de duas a três rodadas em qualquer patamar — tempo pro curandeiro agir e pro Escudos se interpor.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-condicoes">2. Glossário de Condições</SectionTitle>
        <Warning title="Toda condição usada no livro está aqui, com número — nenhuma fica só no nome">
          Dezenas de magias e técnicas aplicam uma condição pelo nome (&ldquo;o alvo fica Amedrontado&rdquo;)
          sem repetir o efeito toda vez — é aqui, e só aqui, que cada uma delas tem sua definição completa.
          Se uma habilidade específica alterar o efeito padrão, a habilidade sempre vence.
        </Warning>
        <BookTable
          headers={["Condição", "Efeito"]}
          rows={[
            ["Agarrado", "Deslocamento reduzido a 0. Desvantagem em ataques contra qualquer criatura que não seja quem te agarrou. Termina se quem te agarrou for incapacitado, ou gastando 1 Ação num teste de Força ou Agilidade (Disputa) contra quem segura."],
            ["Amedrontado", "Desvantagem em testes de atributo e em ataques enquanto a fonte do medo estiver visível. Não pode se mover voluntariamente pra mais perto dela."],
            ["Atolado", "Deslocamento reduzido à metade nesse terreno; gastar o dobro de Deslocamento pra sair dele. Não afeta ataques nem testes."],
            ["Atordoado", "Perde todas as Ações e a Reação até o fim do próximo turno. Ataques contra você têm Vantagem, e você falha automaticamente em testes de resistência de Força e Agilidade."],
            ["Caído", "Desvantagem em qualquer ataque que você faça. Ataques corpo a corpo contra você têm Vantagem; ataques à distância contra você têm Desvantagem. Levantar-se custa metade do seu Deslocamento."],
            ["Cego", "Falha automaticamente em qualquer teste que dependa de visão. Seus ataques têm Desvantagem; ataques contra você têm Vantagem."],
            ["Congelado", "Deslocamento reduzido a 0 e Desvantagem em testes de resistência de Agilidade, até quebrar o gelo (1 Ação, teste de Força CD 8 + BC de quem congelou) ou sofrer dano de fogo."],
            ["Desequilibrado", "Deslocamento reduzido à metade, não pode usar mais de uma Reação por rodada, e sofre Desvantagem em ataques de oportunidade. Dura até o fim do próximo turno do alvo, salvo instrução contrária da habilidade."],
            ["Em Chamas", "No início de cada um dos seus turnos, sofre 1d6 de dano ígneo (ou o valor que a habilidade que ateou o fogo especificar). Apaga submergindo em água, ficando Molhado, ou gastando 1 Ação inteira rolando no chão (teste de Agilidade CD 10)."],
            ["Envenenado", "Desvantagem em ataques e em testes de atributo enquanto durar."],
            ["Incapacitado", "Não pode tomar Ações nem Reações. Mais severo que Atordoado: não termina sozinho no fim do turno — só quando a fonte específica disser como remover."],
            ["Marcado", "Quem te marcou sabe seu PV aproximado, suas resistências e se você veste Touki, e ignora Cobertura parcial ao te atacar. Dura até ser removido pela habilidade que o concedeu, ou até você ficar fora do alcance dela por um Descanso Longo inteiro."],
            ["Molhado", "Dano de frio contra você é dobrado. Desvantagem em testes de resistência contra magias de gelo de quem te molhou. Fogo aplicado a um alvo Molhado evapora a água em vez de acender."],
            ["Paralisado", "Incapaz de agir e de se mover; falha automaticamente em testes de resistência de Força e Agilidade. Ataques corpo a corpo contra você são críticos automáticos se o atacante estiver adjacente."],
            ["Petrificado", "Vira pedra (ou material equivalente): Incapacitado, imune a veneno e doença, e Resistência a todo dano enquanto durar. Reverter exige a fonte específica que petrificou, ou magia de rank igual ou superior."],
            ["Preso", "Deslocamento reduzido a 0. Ataques contra você têm Vantagem; seus ataques têm Desvantagem. Solta-se gastando 1 Ação num teste (Atributo e CD definidos por quem prendeu)."],
            ["Quebrantado", "Acumulável: cada acúmulo dá −1 na CA e −1 no dano de todos os seus ataques, até o máximo do Bônus de Rank de quem aplicou. Não é ferimento — magia de Cura não remove. Some com um Descanso Curto, ou dura até o fim do combate, o que vier primeiro."],
            ["Surdo", "Falha automaticamente em testes que dependam de audição. Não consegue usar Conjuração Padrão nem Encurtada (exigem cântico verbal) — só Conjuração Silenciosa continua funcionando pra você."],
          ]}
        />
      </Section>

      <Section>
        <SectionTitle id="cap4-3-acoes">3. A Economia de Ações (As 3 Ações)</SectionTitle>
        <P>
          No seu turno você possui 3 Ações, além de 1 Reação (usada fora do seu turno, em situações
          específicas). Não existe ação bônus neste sistema — tudo é medido em Ações.
        </P>
        <List
          items={[
            <span key="andar"><b>Andar (1 Ação):</b> mova-se até o Deslocamento. Gastando as 3 Ações, corra o triplo da distância.</span>,
            <span key="atacar"><b>Atacar com Arma (1 Ação):</b> um golpe corpo a corpo ou um projétil disparado.</span>,
            <span key="conjurar"><b>Conjurar Magia (custo variável):</b> consulte a Tabela de Tempo de Conjuração (Cap. 2). O rank da magia dita quantas Ações ela custa.</span>,
            <span key="item"><b>Usar Item (1 Ação):</b> beber uma poção, aplicar curativo, sacar uma arma da bainha.</span>,
            <span key="interagir"><b>Interagir / Ajudar / Se Esconder (1 Ação):</b> abrir uma porta, dar cobertura a um aliado, buscar esconderijo.</span>,
          ]}
        />
        <Aside title="A Regra de Ouro: Conjuração Contínua e Dividida">
          <P>
            Magias poderosas exigem mais Ações do que você tem num turno — o sistema permite dividir o
            cântico. Exemplo: gaste 1 Ação recitando neste turno, 1 Ação andando pra trás de uma árvore, 1
            Ação recitando de novo; no próximo turno, gaste mais 2 Ações e finalmente solte a magia.
          </P>
          <P>
            <b>Perda de Foco:</b> pra manter a mana canalizada, você é obrigado a gastar pelo menos 1 Ação
            por turno recitando. Se passar um turno inteiro sem dedicar nenhuma Ação, a magia falha, a mana
            se perde, e você recomeça do zero.
          </P>
          <P>
            <b>Interrupção:</b> se sofrer dano enquanto conjura, faça um teste de Espírito (CD 10 ou metade
            do dano sofrido, o que for maior). Falhar significa perder o cântico e o PM investido.
          </P>
        </Aside>
        <Aside title="Testes Resistidos (Disputas)">
          Nem todo conflito envolve uma CD estática. Empurrar um inimigo de um penhasco, disputar uma queda
          de braço, arrancar um item das mãos de alguém: ambos rolam 1d20 + Atributo puro. Quem tirar o
          maior total vence. Em empate, a situação se mantém inalterada.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-4">4. Regras de Empilhamento</SectionTitle>
        <P>
          Com dezoito árvores no jogo, um grupo bem construído consegue empilhar bônus até quebrar a
          matemática. Estas regras impedem isso sem tirar a graça da combinação.
        </P>
        <Aside title="Bônus do mesmo tipo não somam">
          Se dois efeitos seus dão bônus ao mesmo número (CA, acerto, dano, deslocamento), use apenas o
          maior. <b>Exceção:</b> bônus concedidos por aliados diferentes que gastaram Ações somam
          normalmente — o Bardo cantando e o Tático apontando o alvo estão os dois trabalhando; ambos contam.
        </Aside>
        <Aside title="Teto de Auxílio +5">
          Nenhum personagem recebe mais de +5 somados em bônus numéricos vindos de habilidades de aliados no
          mesmo turno. Acima disso, o excedente é ignorado.
        </Aside>
        <Aside title="Teto de Ações: 5, no máximo 2 externas">
          Nenhum personagem age mais de 5 vezes num turno, e no máximo 2 dessas Ações podem vir de fontes
          externas (Avante, Antecipação, Comando). Sem esta regra, um Norte Imperador (4 Ações) com um
          Tático Comandante na mesa chega a 7 Ações por turno, e o combate deixa de existir.
        </Aside>
        <Aside title="Uma Salvação por Combate">
          O livro tem quatro formas de impedir que alguém morra — Aguentar (Touki), Rejeitar a Morte (Cura),
          Sem Baixas (Tático) e Custe o Que Custar (Escudos). Cada criatura só pode ser salva por um desses
          efeitos por combate; a segunda tentativa, de qualquer fonte, falha e não consome o recurso de quem
          tentou.
        </Aside>
        <Aside title="Vantagem é binária">
          Vantagem não empilha: dez fontes de Vantagem continuam sendo 2d20. Vantagem Absoluta (3d20) só vem
          de efeitos que digam explicitamente &ldquo;Absoluta&rdquo; — não existe 4d20 neste jogo. Vantagem e
          Desvantagem se cancelam uma a uma; Vantagem Absoluta contra Desvantagem simples resulta em
          Vantagem simples.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-5">5. Críticos, Touki e o Fio da Vida</SectionTitle>
        <List
          items={[
            <span key="20"><b>20 Natural (Crítico):</b> acerta automaticamente, independente da CA ou resistência do inimigo. Role os dados de dano duas vezes e some os bônus fixos uma vez só.</span>,
            <span key="1"><b>1 Natural (Falha Crítica):</b> você erra pateticamente. O Mestre tem controle total sobre o seu destino.</span>,
          ]}
        />
        <P>
          O Touki não gasta PM — consome Pontos de Touki (PT), e é desbloqueado no terceiro patamar de
          qualquer árvore do Corpo (regras completas no Capítulo 3).
        </P>
        <Aside title="Por que magos temem espadachins">
          Um espadachim de rank Santo cruza 9 metros e decapita um mago antes que ele termine o segundo
          verso de uma magia Avançada. É por isso que a escola de Água investe tanto em barreiras, terreno
          difícil e empurrões — cada metro de distância é um verso a mais recitado vivo.
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-6">6. Sangrando e Morrendo</SectionTitle>
        <P>
          Magia de cura pode fechar feridas, mas ressurreição beira o mito divino. Se seus Pontos de Vida
          chegarem a 0, você cai Inconsciente e entra em estado de Morte.
        </P>
        <SubTitle>O Teste do Fio da Vida</SubTitle>
        <P>No início de cada um dos seus turnos a 0 PV, role 1d20 + Vigor contra CD 10:</P>
        <List
          items={[
            "Sucesso: você estabiliza temporariamente — não está morto, mas continua desacordado.",
            "Falha: você recebe 1 Marca da Morte.",
            "Falha Crítica (1 Natural): você recebe 2 Marcas da Morte.",
          ]}
        />
        <P>
          Se acumular <b>3 Marcas da Morte</b>, você morre permanentemente. Qualquer magia de cura ou poção
          aplicada por um aliado remove todas as Marcas da Morte instantaneamente e você acorda — mas
          acordar do Fio da Vida cobra um preço: você volta com <b>1 nível de Exaustão</b> (seção 8 deste
          capítulo) até fazer um Descanso Longo.
        </P>

        <SubTitle id="cap4-cicatrizes">Cicatrizes de Quase-Morte</SubTitle>
        <Warning title="Quando a Morte Quase Ganha">
          <P>
            Toda vez que você acumular <b>2 Marcas da Morte</b> antes de ser resgatado, o corpo guarda a
            lembrança mesmo depois de curado. Além da Exaustão de sempre, role 1d6 na tabela abaixo (ou
            escolha, com o Mestre) e ganhe a Cicatriz <b>permanentemente</b>. Se tirar uma que já tem, ela
            atinge outro membro ou sentido, à escolha do Mestre.
          </P>
          <BookTable
            headers={["d6", "Cicatriz"]}
            rows={[
              ["1", "Braço Perdido: Desvantagem em testes de Força e em Atletismo. Não consegue usar armas de duas mãos, nem empunhar arma e escudo ao mesmo tempo."],
              ["2", "Perna Manca: Deslocamento −3m, permanente."],
              ["3", "Olho Perdido: Desvantagem em Percepção e em qualquer ataque à distância além do alcance curto."],
              ["4", "Voz Quebrada: não consegue mais usar Conjuração Silenciosa (Cap. 2). Desvantagem em Atuação e Persuasão."],
              ["5", "Mão Trêmula: Desvantagem em Ladinagem, em Ofícios manuais e em Iniciativa."],
              ["6", "A Sombra Não Sai: nenhuma penalidade de combate, mas Desvantagem em testes de resistência de Espírito contra Medo — o corpo lembra de ter morrido, mesmo que a mente negue."],
            ]}
          />
          <P>
            A única cura conhecida é <i>Corpo Íntegro</i> (Cura, Rank Imperador) — ela relê o corpo por
            inteiro e apaga a Cicatriz junto com qualquer outra sequela física. Fora disso, ela é permanente:
            nenhum Descanso, magia de rank inferior ou poção a remove. É o preço de ter quase morrido, e ele
            pesa na ficha pelo resto da campanha — não só naquela sessão.
          </P>
        </Warning>

        <BookTable
          headers={["Descanso", "Recupera"]}
          rows={[
            ["Curto (1 a 2 horas)", "Metade dos seus PM e PT máximos, arredondado pra baixo. Não recupera PV nem PP."],
            ["Longo (8 horas de sono seguro)", "Todos os PM, PT e PP; remove 1 nível de Exaustão; recupera PV iguais ao seu Vigor + 1d8 (mínimo 2)."],
          ]}
        />
        <Warning title="A Carne Não Fecha Sozinha">
          <P>Um corte não some porque você dormiu. As três únicas formas de recuperar PV de verdade:</P>
          <List
            items={[
              "Magia de Cura — rápida, cara em PM, do rank certo pro tipo de ferimento.",
              "Poções — caras em dinheiro, limitadas em estoque.",
              "Repouso longo — uma semana inteira em cama, em lugar seguro, devolve todos os PV.",
            ]}
          />
          <P>
            Um grupo sem curandeiro não perde combates — perde a campanha: vence a primeira luta, sangra na
            segunda, e na terceira decide voltar pra cidade porque o guerreiro está com um terço da vida e
            não existe descanso que resolva.
          </P>
        </Warning>

        <SubTitle id="cap4-trauma">Trauma de Combate</SubTitle>
        <Aside title="Quando o Corpo Sobrevive mas a Mente Cobra a Conta">
          <P>
            Sobreviver não é sair ileso. Sempre que você chegar a <b>0 PV</b>, testemunhar a morte de um
            aliado a até 9 metros, ou matar alguém que implorava por clemência, ganhe <b>1 ponto de Trauma</b>{" "}
            — a critério do Mestre, sem precisar contar cada goblin da estrada.
          </P>
          <P>
            <b>Efeito, por ponto de Trauma acumulado:</b> Desvantagem em testes de Espírito feitos{" "}
            <b>fora de combate</b> (persuasão calma, negociação, criar confiança, dormir sem pesadelo).
            Trauma não afeta nada dentro do combate — na hora da luta, o corpo simplesmente age.
          </P>
          <P>
            <b>Removendo Trauma:</b> gaste uma semana de Downtime na atividade Recuperar-se acompanhado de
            alguém de confiança, ou resolva a causa de frente na narrativa — voltar ao lugar, encarar quem
            sobrou, fazer as pazes com o que aconteceu. Cada semana ou cada cena assim resolvida remove{" "}
            <b>1 ponto</b>. Sem isso, o Trauma não passa sozinho: não existe teste de resistência nem
            Descanso Longo que apague o que aconteceu.
          </P>
          <P>
            Isto não é um sistema de sanidade: não há loucura, não há tabela de fobias, e não há perda de
            controle do personagem. É só o lembrete mecânico de que continuar lutando tem custo.
          </P>
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-aflicoes">7. Aflições do Mundo de Seis Faces</SectionTitle>
        <P>
          Toda aflição tem uma Profundidade de 1 a 5 que sobe sozinha enquanto ninguém trata, e um mago de
          Desintoxicação só purga o que estiver dentro do Bônus de Rank dele. Venenos agudos sobem 1 de
          Profundidade por hora; doenças, maldições e petrificações sobem 1 por dia. Nada disso cai sozinho.
        </P>

        <SubTitle>Venenos</SubTitle>
        <BookTable
          headers={["Aflição", "Prof.", "Origem", "Efeito"]}
          rows={[
            ["Baba de Sapo-Lodo", "1", "Pântanos do Continente Central", "Envenenado por 1 hora. A primeira coisa que um aventureiro novato pega."],
            ["Espinho da Rosa-Preta", "1", "Planta cultivada em Asura", "Sono profundo em 10 minutos. Não causa dano."],
            ["Peçonha de Serpente-do-Pântano", "2", "Serpentes grandes", "2d6 por hora e Desvantagem em Vigor. Mata um camponês em cinco horas."],
            ["Toxina de Aranha Gigante", "2", "Cavernas, ruínas", "Paralisia progressiva: -3m de Deslocamento por hora, cumulativo até 0."],
            ["Fel de Wyvern", "3", "Feras voadoras do Continente Demônio", "4d8 por dia. Cega em 48 horas."],
            ["Sombra Líquida", "4", "Assassinos profissionais", "Sem sintoma por três dias. No quarto, o coração para."],
          ]}
        />

        <SubTitle>Aplicando um Veneno em Combate ou em Segredo</SubTitle>
        <P>
          A tabela acima diz o que um veneno faz depois de estar ativo. Esta seção diz como ele entra no
          corpo de alguém — porque isso é o que a mesa realmente precisa resolver, e o que faltava aqui.
        </P>
        <BookTable
          headers={["Via de aplicação", "Custo", "Como funciona"]}
          rows={[
            [
              "Untar uma arma",
              "1 Ação",
              "Uma dose cobre uma arma corpo a corpo ou até 3 munições de longe. A dose se gasta no primeiro acerto que causar dano — acertos seguintes já saem limpos, a menos que unte de novo.",
            ],
            [
              "Ingestão",
              "Nenhum custo em Ação — é preparado fora de cena",
              "A dose vai em comida ou bebida. Exige oportunidade e, normalmente, um teste de Enganação ou Furtividade oposto à Percepção do alvo pra passar despercebida.",
            ],
            [
              "Inalação",
              "1 Ação pra romper um frasco ou saquinho em área",
              "Afeta todo mundo sem proteção respiratória num raio de 4,5m. Vento forte ou uma porta fechada dispersa a nuvem em 1 rodada.",
            ],
          ]}
        />
        <P>
          Em qualquer via, a vítima só é afetada se sofrer dano da arma untada, ingerir a dose ou respirar a
          nuvem. Nesse momento ela faz um <b>teste de resistência de Vigor</b> contra <b>CD 8 + (2 × a
          Profundidade do veneno)</b> — veneno é exposição direta e ativa, por isso a CD é mais alta que a de
          contágio passivo de uma doença (mais adiante, nas Regras de Mesa desta seção). Sucesso: a aflição
          some por completo, sem efeito nenhum. Falha: a aflição começa exatamente na Profundidade listada na
          tabela e sobe sozinha a partir daí, 1 ponto por hora.
        </P>
        <Aside title="Exemplo rápido">
          Um Ladino unta a adaga com Peçonha de Serpente-do-Pântano (Profundidade 2) e acerta um golpe surpresa.
          A vítima faz Vigor contra CD 12 (8 + 2×2). Se falhar, já entra Envenenada na Profundidade 2 — 2d6 por
          hora e Desvantagem em Vigor — e esse relógio corre até alguém tratar com Desintoxicação ou um
          Antídoto (Cap. 5, §4).
        </Aside>

        <SubTitle>Doenças</SubTitle>
        <BookTable
          headers={["Aflição", "Prof.", "Contágio", "Efeito"]}
          rows={[
            ["Febre de Estrada", "1", "Água parada", "1 nível de Exaustão. A mais comum do mundo."],
            ["Podridão de Ferida", "2", "Ferimento não tratado", "PV máximos caem 5 por dia."],
            ["Tosse Cinzenta", "2", "Ar, entre pessoas", "Desvantagem em tudo que exija fôlego."],
            ["Peste dos Portos", "3", "Ratos, carga, navios", "3d6 por dia e contagia 1d4 pessoas próximas por dia."],
            ["Febre de Mana", "3", "Esgotar PM a zero repetidamente", "PM máximos caem 10% por dia."],
            ["Praga do Continente Demônio", "4", "Contato com terreno corrompido", "Pele endurece e racha. -1 em todos os atributos por semana, cumulativo."],
          ]}
        />

        <SubTitle>Maldições e Transformações</SubTitle>
        <BookTable
          headers={["Aflição", "Prof.", "Origem", "Efeito"]}
          rows={[
            ["Marca do Sepulcro", "3", "Profanar um túmulo", "Não recupera PV por meio nenhum enquanto durar. Nem magia."],
            ["Olhar de Basilisco", "4", "A criatura", "Petrificação em 4 turnos."],
            ["Fome Vermelha", "4", "Mordida de certos mortos-vivos", "1 nível de Exaustão por dia que não some. Ao chegar a 6, vira o que o mordeu."],
            ["Nome Roubado", "5", "Pactos mal fechados", "Ninguém consegue lembrar quem você é. Só um Imperador desfaz."],
          ]}
        />

        <Warning title="O Teto — Doença da Pedra Mágica (Profundidade 6)">
          A carne vira minério, devagar, começando pelas extremidades. Nenhum patamar deste livro alcança
          Profundidade 6 — um Imperador de Desintoxicação consegue Selar a Maldição e congelar o avanço, e é
          só isso que o mundo tem a oferecer. O grimório de rank Deus que curaria isso existe, catalogado no
          Grande Templo de Millis, e ninguém consegue ler o primeiro verso.
        </Warning>

        <Aside title="Regras de Mesa">
          <List
            items={[
              "Definindo a Profundidade: se a aflição não estiver na tabela, use 1 (incômodo), 2 (perigoso), 3 (grave), 4 (fatal) ou 5 (lendário).",
              "Diagnóstico (Cura, 1º patamar) diz de que categoria é o problema. Paladar (Desintoxicação, 1º patamar) diz exatamente qual e a Profundidade.",
              "Cura não trata nada desta seção, em rank nenhum — fecha o ferimento por onde a coisa entrou, e só. Desintoxicação, na direção oposta, também não trata dano físico: ela remove a causa (veneno, doença, maldição, petrificação), mas não fecha o corte — a carne continua aberta até Cura, uma poção ou repouso cuidarem dela.",
              "Contágio: se uma aflição contagiosa estiver ativa no grupo ao fim de um Descanso Longo, cada personagem que dormiu perto faz teste de Vigor (CD 8 + Profundidade atual).",
              "Ritmo: uma aflição de Profundidade 2 pegada no primeiro dia de viagem chega a 5 em três dias — é esse relógio, não o combate, que cria a urgência de uma campanha longa.",
            ]}
          />
        </Aside>
      </Section>

      <Section>
        <SectionTitle id="cap4-8">8. Exaustão, Fome, Sede e Clima Extremo</SectionTitle>
        <P>
          O sistema já usa a condição Exaustão em dezenas de talentos, doenças e maldições sem nunca fechar
          o que ela faz de fato. Esta seção fecha essa conta.
        </P>
        <Warning title="Exaustão Tem 6 Níveis, e Eles Empilham">
          <BookTable
            headers={["Nível", "Penalidade"]}
            rows={[
              ["1", "Desvantagem em testes de atributo e em rolagens de ataque."],
              ["2", "Deslocamento reduzido à metade."],
              ["3", "Desvantagem em testes de resistência."],
              ["4", "PV Máximos reduzidos à metade."],
              ["5", "Deslocamento reduzido a 0."],
              ["6", "Morte — a menos que a fonte diga o contrário (Fome Vermelha, seção 7 deste capítulo, transforma em vez de matar)."],
            ]}
          />
          <P>
            Os efeitos <b>somam</b>: no Nível 3, você já soma a Desvantagem de atributo e de ataque do Nível
            1 com a de resistência deste nível, além de andar na metade da velocidade.
          </P>
          <P>
            <b>Removendo Exaustão:</b> um Descanso Longo remove 1 nível, desde que a causa não esteja mais
            ativa (você comeu, bebeu, saiu do frio). Se a causa continuar, o nível não cai. Magia específica
            de Cura (<i>Mão que Acalma</i>) remove 1 nível de Exaustão de origem <b>física</b> — ferimento,
            trauma, ter acordado do Fio da Vida — a qualquer momento, mas nunca a de fome, sede, frio ou
            marcha forçada: isso não é ferimento, é privação, e só sai resolvendo a causa.
          </P>
        </Warning>

        <SubTitle id="cap4-fome-sede">Fome e Sede</SubTitle>
        <List
          items={[
            "Fome: ficar um dia inteiro sem nenhuma refeição dá 1 nível de Exaustão ao anoitecer. Comer qualquer refeição, por menor que seja, zera essa contagem — mas não remove a Exaustão que já acumulou.",
            "Sede: mais urgente. Ficar sem beber água por mais de algumas horas em clima ameno, ou desde o início em calor extremo, dá 1 nível de Exaustão a cada 4 horas depois da primeira falta.",
            "Ração de aventureiro (item comum, poucas moedas de cobre por dia) resolve as duas ao mesmo tempo — é por isso que toda caravana carrega mais ração do que ouro.",
          ]}
        />

        <SubTitle id="cap4-clima">Clima Extremo</SubTitle>
        <P>
          Calor ou frio além do que roupas comuns aguentam — deserto ao meio-dia, nevasca, altitude alta —
          força um teste de Vigor a cada poucas horas de exposição. O Mestre define a CD pela severidade: 8
          para desconfortável, 14 para perigoso, 18 para letal. Falha: 1 nível de Exaustão. Equipamento
          adequado (manto, abrigo, magia de proteção) dá Vantagem no teste ou remove a necessidade dele por
          completo, a critério do Mestre.
        </P>
        <Aside title="Por que isso é leve de propósito">
          Fome, sede e clima não são o ponto da campanha — são o relógio de fundo que torna uma travessia
          longa real sem virar planilha. Numa masmorra de um dia, ignore a seção inteira. Numa travessia de
          duas semanas pela Grande Floresta sem suprimentos, ela decide se o grupo chega ao destino em pé ou
          arrastando um Nível 4.
        </Aside>
      </Section>
    </div>
  );
}
