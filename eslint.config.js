import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", "legacy", "node_modules", "coverage"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // The codebase's resilience style: empty catch means "this failure is survivable".
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { args: "none", caughtErrors: "none", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      // `const self = this;` inside the audio scheduler closures is verbatim
      // from the artifact and deliberate; keep the split diff-able against it.
      "@typescript-eslint/no-this-alias": "off",
    },
  },
  {
    files: ["scripts/**/*.mjs", "eslint.config.js"],
    extends: [js.configs.recommended],
    languageOptions: { globals: { ...globals.node } },
  }
);
