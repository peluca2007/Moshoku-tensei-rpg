<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Fluxo de trabalho: branch, PR e aprovação do autor

Desde 2026-09-24, nenhuma mudança entra direto na `main`.

1. Cada assunto ganha a sua branch: `feat/…`, `fix/…`, `chore/…` ou `docs/…`. Branches criadas
   pelo app do Claude podem manter o prefixo `claude/…`.
2. O trabalho termina num pull request para a `main`, com o que mudou, por quê e como foi testado.
3. **Quem aprova e faz o merge é o autor.** Agente nenhum faz merge do próprio PR.
4. Um PR trata de um assunto só e deve ser pequeno o bastante para ser revisado de uma vez.

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
