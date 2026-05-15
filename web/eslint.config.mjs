import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "public/libarchive-worker.js",
    "public/libarchive.js/**",
    "public/pdf.worker.min.mjs",
  ]),
  {
    rules: {
      // Existing client-side preview components intentionally set local state
      // after async/browser API effects. Keep the rule off until those viewers
      // are refactored for the React compiler style.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;
