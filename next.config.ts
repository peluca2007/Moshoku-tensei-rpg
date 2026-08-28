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
};

export default nextConfig;
