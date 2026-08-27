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
        <SectionTitle id="cap4-2">2. A Economia de Ações (As 3 Ações)</SectionTitle>
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
        <SectionTitle id="cap4-3">3. Regras de Empilhamento</SectionTitle>
        <P>
          Com dezessete árvores no jogo, um grupo bem construído consegue empilhar bônus até quebrar a
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
        <SectionTitle id="cap4-4">4. Críticos, Touki e o Fio da Vida</SectionTitle>
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
        <SectionTitle id="cap4-5">5. Sangrando e Morrendo</SectionTitle>
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
          aplicada por um aliado remove todas as Marcas da Morte instantaneamente e você acorda — mas com a
          condição Exaustão (Desvantagem em todos os testes de atributo) até fazer um Descanso Longo.
        </P>
        <BookTable
          headers={["Descanso", "Recupera"]}
          rows={[
            ["Curto (1-2 horas)", "25% de PM, PT e PP máximos (arredondado pra baixo). Não recupera PV nenhum."],
            ["Longo (8 horas de sono seguro)", "50% de PM, PT e PP; remove um nível de Exaustão; recupera PV = Vigor × (1d10+Vigor), mínimo 1."],
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
      </Section>
    </div>
  );
}
