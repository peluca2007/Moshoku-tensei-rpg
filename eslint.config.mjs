import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // "const { [id]: _removed, ...rest } = obj" é o jeito idiomático de
      // remover uma chave sem mutar. A variável descartada existe só pra
      // nomear o que sai, e o "_" já é a convenção que diz isso.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Checkouts paralelos do Claude têm código e builds próprios. A revisão
    // desta main não deve entrar neles; o Git já ignora o mesmo diretório.
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
