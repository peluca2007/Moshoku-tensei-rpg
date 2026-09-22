import { compararBuilds, type PedidoComparacao, type RespostaComparacao } from "../lib/buildComparison";

self.onmessage = (evento: MessageEvent<PedidoComparacao>) => {
  let resposta: RespostaComparacao;
  try {
    resposta = { tipo: "resultado", resultado: compararBuilds(evento.data) };
  } catch (erro) {
    resposta = { tipo: "erro", mensagem: erro instanceof Error ? erro.message : "Não foi possível comparar estas fichas." };
  }
  self.postMessage(resposta);
};
