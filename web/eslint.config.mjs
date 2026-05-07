import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // React 19 / eslint-plugin-react-hooks 7 introduced strict purity rules
    // (`react-hooks/set-state-in-effect`, `react-hooks/purity`,
    // `react-hooks/refs`). They flag patterns that work today but the React
    // Compiler would prefer to rewrite. Demote to warnings so they surface in
    // editors without blocking CI; tighten back to errors as the codebase is
    // migrated.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  {
    files: ["**/*.config.{js,mjs,ts}", "**/*.config.*.{js,mjs,ts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default eslintConfig;
