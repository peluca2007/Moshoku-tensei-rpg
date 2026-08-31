export interface PatchNoteSection {
  heading: string;
  items: string[];
}

export interface PatchNote {
  version: string;
  date: string;
  title: string;
  sections: PatchNoteSection[];
}

/**
 * Histórico de mudanças de game design do sistema, mais recente primeiro.
 * Toda atualização relevante de regras/balanceamento entra aqui.
 */
export const PATCH_NOTES: PatchNote[] = [
  {
    version: "0.0.2",
    date: "2026-08-31",
    title: "Guarda Erguida",
    sections: [
      {
        heading: "Ações e Reações de Combate",
        items: [
          "Nova Ação Padrão — Defender/Absorver: em vez de tentar desviar, você foca em aguentar o golpe. O atacante ganha Vantagem na rolagem de acerto contra você, mas se acertado o dano é reduzido pela sua mitigação: (Vigor × 2) + Bônus de Rank do seu maior Estilo de Corpo.",
          "Bloquear com Escudo (Reação): ao ser atingido por um ataque físico que você veja, some a CA do seu escudo contra aquele ataque — se isso fizer o golpe errar, o dano é anulado por completo.",
          "Esquivar e Defender/Absorver agora protegem só o PRIMEIRO ataque que você sofrer na rodada. Qualquer outro ataque no mesmo turno acontece normalmente, sem os bônus de esquiva ou a redução de dano — concentrar-se em um golpe tem um preço.",
        ],
      },
      {
        heading: "Vida e Mana",
        items: [
          "PV Máximos agora escalam de forma mais contida nos primeiros patamares — o 1º patamar volta a ser uma fase de risco real, não um colchão de vida.",
          "PM Máximos ganham um teto nos dois primeiros patamares de magia (Principiante e Intermediário): bônus vindos de fora da árvore (PA avulso, antecedentes, sub-tabelas) não empurram mais um conjurador iniciante muito além do que a assinatura do próprio rank permite pagar. Talentos de reserva da árvore e bônus raciais escalares (Elfo, Migurd) continuam valendo por cima do teto. A partir do Avançado, o teto desaparece e a fórmula plena passa a valer até o Imperador.",
        ],
      },
      {
        heading: "Classe de Invocação",
        items: [
          "Invocar em combate sem um círculo já desenhado agora exige o talento Convocar sob Pressão: custa 6 Ações, e o invocado chega com metade dos PV e um degrau a menos no dado de dano.",
          "Convocação Aprimorada remove essa penalidade de emergência — invocação de combate por 4 Ações, sem perda de PV ou dano.",
          "Traço Rápido muda de função: agora deixa desenhar o círculo em 1 Ação pagando o dobro de PM, em vez de zerar o custo extra de invocar em combate.",
          "Nova linha de evolução do familiar: Pacto — Filhote Evolutivo (invocação inicial fraca) evolui para Forma Média (Intermediário) e depois Forma Suprema (Avançado), ganhando dano, PV, resistências e até uma magia menor própria.",
          "Vínculo Concentrado: abrir mão de manter vários Pactos e concentrar todo o PM de invocação em um único familiar concede dados de dano extras, mais PV por Bônus de Rank e Resistência a dano mágico.",
          "Chamado (a assinatura da árvore) deixa explícito que a invocação padrão exige círculo com 10 minutos de preparo fora de combate — a invocação de emergência agora é função exclusiva dos talentos acima.",
        ],
      },
      {
        heading: "Classe de Escudos",
        items: [
          "Nova linha de identidade — Puro Escudo: ao abrir mão de empunhar arma de dano (só escudo ou escudo grande), você desbloqueia versões Soberanas, mais fortes, das suas habilidades em todos os ranks, estendendo seus efeitos defensivos também a aliados adjacentes.",
          "Habilidades Soberanas exclusivas: Golpe de Escudo Soberano, Provocar Ódio Soberano, Aguentar Soberano, Escudo de Corpo Inteiro, Não Ele Soberano, Custe o Que Custar Soberano e O Muro Final Soberano.",
          "Sob Minha Guarda agora escala com o rank — protege 1 aliado no Principiante, 2 no Intermediário e 3 a partir do Avançado — em vez de já nascer com um alcance amplo.",
          "Interpor (Principiante) passa a somar +1 na CA com escudo, sem empilhar com magias de barreira.",
          "Ombro de Pedra sobe de +2 para +4 PV por patamar e ganha +1 PT Máximo.",
        ],
      },
      {
        heading: "Magia Combinada",
        items: [
          "Deixa de ser \"qualquer combinação que o Mestre aprove na hora\" e vira uma tabela oficial com 9 magias fixas — Magma, Gelo Tempestuoso, Relâmpago Santo, Barreira Incandescente, Tempestade de Cura, Pânico, Muralha de Espinhos, Nevasca Curativa e Meteoro — cada uma com PM, alcance, Ações e dano definidos.",
          "Cada combinação é comprada com PA e destravada pela Maestria \"Magia Combinada\" do rank Avançado, em vez de vir de graça ao alcançar os dois ranks das árvores-base.",
          "Combinações fora da tabela continuam possíveis pela regra de ouro do Mestre, agora como complemento, não como o caminho principal.",
        ],
      },
      {
        heading: "Nova Sub-árvore: Punho de Fogo",
        items: [
          "Árvore híbrida do Corpo (Fogo + Lutador), revelada só quando você alcança Rank Intermediário nas duas árvores-base.",
          "Golpes desarmados ganham dano ígneo extra e a chance de incendiar o alvo, evoluindo até o Imperador com explosão em área, imunidade a fogo e redução de CA em inimigos no calor do combate.",
        ],
      },
      {
        heading: "Criação de Personagem",
        items: [
          "O orçamento livre de atributos na criação passa de 4 para 2 pontos, e destravar os dois Defeitos (-1 e -2) agora libera 5 pontos para redistribuir, em vez de 7.",
          "Bônus de Raça e de Antecedente saem do orçamento da criação — não competem mais pelos pontos distribuídos, e são somados por fora do resultado final.",
          "A Roleta do Destino usa o mesmo orçamento de 2 pontos do modo manual, encerrando a vantagem extra de quem sorteia o personagem.",
          "O kit inicial de Tank/Defensor troca a Armadura Média (+3 CA) de graça por Armadura Leve (+1 CA) — CA alta agora exige investimento (armadura melhor, talentos de escudo, evolução de rank).",
          "No Mapa de Árvores, árvores híbridas (Vendaval, e agora Punho de Fogo) ficam ocultas até os pré-requisitos serem cumpridos, aparecendo com um conector próprio ligando-as às duas árvores de origem.",
        ],
      },
    ],
  },
];
