import { afterEach, describe, expect, it, vi } from "vitest";
import { compartilhar } from "./compartilharNativo";

const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");

function comShare(impl: ((d: unknown) => Promise<void>) | undefined) {
  Object.defineProperty(globalThis, "navigator", {
    value: impl ? { share: impl } : {},
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  if (original) Object.defineProperty(globalThis, "navigator", original);
  vi.restoreAllMocks();
});

const DADOS = { title: "Rudeus Greyrat", url: "https://exemplo/ficha/importar#g:abc" };

describe("compartilhar", () => {
  it("entrega os dados à bandeja do sistema", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    comShare(share);
    expect(await compartilhar(DADOS)).toBe("ok");
    expect(share).toHaveBeenCalledWith(DADOS);
  });

  /*
   * O caso que separa esta função de um `try/catch` qualquer.
   *
   * Fechar a bandeja é uma DECISÃO, não um defeito — e o navegador sinaliza
   * isso com um `AbortError`. Tratá-lo como falha faria a ficha acusar erro
   * toda vez que alguém abrisse o compartilhamento e mudasse de ideia, que é
   * uma coisa que acontece o tempo todo.
   */
  it("cancelar não é erro", async () => {
    comShare(() => Promise.reject(new DOMException("cancelado", "AbortError")));
    expect(await compartilhar(DADOS)).toBe("cancelado");
  });

  it("erro de verdade é erro", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    comShare(() => Promise.reject(new DOMException("sem permissão", "NotAllowedError")));
    expect(await compartilhar(DADOS)).toBe("falhou");
  });

  it("navegador sem a API devolve falhou, sem lançar", async () => {
    comShare(undefined);
    expect(await compartilhar(DADOS)).toBe("falhou");
  });
});
