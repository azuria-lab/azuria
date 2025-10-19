import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      jsdoc,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      
      // JSDoc rules for documentation quality
      "jsdoc/check-alignment": "warn",
      "jsdoc/check-param-names": "warn",
      "jsdoc/check-tag-names": "warn",
      "jsdoc/check-types": "warn",
      "jsdoc/require-description": "off", // Optional: enable for stricter docs
      "jsdoc/require-param": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-param-type": "off", // TypeScript handles types
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-description": "warn",
      "jsdoc/require-returns-type": "off", // TypeScript handles types
      "jsdoc/valid-types": "warn",
      
      // TypeScript strict rules
  "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-non-null-assertion": "warn",
      
      // React best practices
  "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      
      // General code quality
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      
      // Import/export rules
      "no-duplicate-imports": "error",
      "sort-imports": ["error", {
        "ignoreCase": true,
        "ignoreDeclarationSort": true,
        "ignoreMemberSort": false
      }],
      
      // Performance
      "no-unused-expressions": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
    },
  settings: {},
  }
  ,
  // Test files: allow console statements and 'any' to keep tests expressive
  {
    files: [
      "src/__tests__/**/*.{ts,tsx}",
      "tests/**/*.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/*.test.{ts,tsx}"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }]
    }
  }
);

