import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginImport from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  globalIgnores(["dist"]),

  // Configuración base recomendada
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    plugins: {
      react: fixupPluginRules(react),
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      import: fixupPluginRules(eslintPluginImport),
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2015,

        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
    settings: {
      react: {
        pragma: "React",
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["./tsconfig.app.json", "./tsconfig.json", "./tsconfig.node.json"],
          noWarnOnMultipleProjects: true,
        },
        // Configuración de alias directamente explicita en ESLint
        alias: {
          map: [["@", path.resolve(__dirname, "./src")]],
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".d.ts"],
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      // Reglas recomendadas de los plugins
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...eslintPluginImport.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,

      // Reglas personalizadas
      quotes: ["warn", "double"],
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-use-before-define": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "import/prefer-default-export": 0,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      // Permite extensiones explícitas (.tsx, .ts) en los imports si las usas
      "import/extensions": "off",
      "react/jsx-no-leaked-render": ["warn", { validStrategies: ["ternary"] }],

      // Muestra error cuando intentas importar librerías o módulos inexistentes
      "import/no-unresolved": "error",
    },
  },
]);
