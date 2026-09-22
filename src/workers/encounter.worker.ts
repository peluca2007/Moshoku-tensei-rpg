import { gerarRelatorioEncontro, type PedidoRelatorio, type RespostaSimulacao } from "../lib/encounterReport";

const responder = (resposta: RespostaSimulacao) => self.postMessage(resposta);

self.onmessage = (evento: MessageEvent<PedidoRelatorio>) => {
  try {
    const relatorio = gerarRelatorioEncontro(evento.data, (mensagem) => responder({ tipo: "progresso", mensagem }));
    responder({ tipo: "resultado", relatorio });
  } catch (erro) {
    responder({ tipo: "erro", mensagem: erro instanceof Error ? erro.message : "Não foi possível simular este encontro." });
  }
};
