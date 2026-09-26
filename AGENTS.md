<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Fluxo de trabalho: direto na main

De 2026-09-24 a 2026-09-25 tudo passou por branch e PR aprovado pelo autor. Em 2026-09-25 o autor
decidiu voltar a trabalhar **direto na `main`**: commits pequenos, um assunto por commit, com a
mensagem dizendo o que mudou e por quê. Branch e PR continuam valendo quando o autor pedir, ou para um
experimento grande que ainda não deve chegar à `main`.

Antes de subir qualquer mudança no livro, rode `npm run revisar:livro` (ver `PLANO-LIVRO-DIGITAL.md`).

## Portas do servidor de desenvolvimento

Cada origem usa uma porta fixa. Assim, dois agentes rodam o site ao mesmo tempo sem derrubar o
servidor um do outro, e o autor sabe qual versão está vendo só de olhar a porta.

| Quem | Porta | Comando |
| --- | --- | --- |
| `main` (checkout principal) | 3000 | `npm run dev` |
| Branches do Claude | 3010 | `npm run dev:feature` |
| Branches do ChatGPT/Codex | 3020 | `npm run dev:gpt` |

Só roda uma branch por porta. Antes de subir outra branch na mesma porta, derrube o servidor
anterior. Senão a porta continua servindo o código antigo.
