import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O pacote `typst` resolve o binário nativo certo pra cada SO em tempo de execução
  // (`import.meta.resolve("@typst-community/typst-<os>-<arch>")`, ver
  // node_modules/typst/dist/lib/getTypstPath.js) — como isso não é um import estático, o
  // rastreador de arquivos do Next (@vercel/nft) não enxerga essa dependência sozinho e a
  // função serverless de /api/ficha-pdf sobe na Vercel sem o binário, quebrando a exportação
  // de PDF em produção (funciona local porque o binário já está em node_modules). Isso força
  // o binário da plataforma instalada a entrar no bundle da rota.
  outputFileTracingIncludes: {
    "/api/ficha-pdf": ["./node_modules/@typst-community/typst-*/**/*"],
  },

  /**
   * O service worker não pode ser cacheado pelo HTTP (0.1.15).
   *
   * `/sw.js` é servido de `public/`, e a Vercel manda `public/` com um
   * `Cache-Control` longo — o que é certo pra uma imagem e catastrófico pro
   * worker. Um worker preso no cache do navegador é um site preso na versão
   * que ele guardou: o `?v=` da URL de registro pediria a versão nova, o cache
   * HTTP devolveria a velha, e o site continuaria servindo a release passada
   * pra sempre, sem nenhum sintoma além de "não atualiza".
   *
   * `Service-Worker-Allowed` está aqui porque o escopo é a raiz. Por padrão um
   * worker só controla a pasta em que ele mora — e como `/sw.js` mora na raiz
   * isso já bastaria hoje, mas o dia em que ele for servido de outro caminho é
   * exatamente o dia em que ninguém vai lembrar deste detalhe.
   *
   * Ver `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md`,
   * seção "Securing your application".
   */
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
