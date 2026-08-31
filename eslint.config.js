// Flat config — eslint-config-expo + Prettier.
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  {
    ignores: ["node_modules/**", ".expo/**", "dist/**", "web-build/**", "android/**", "ios/**"],
  },
  ...expoConfig,
  prettierRecommended,
  {
    rules: {
      "prettier/prettier": "warn",
    },
  },
]);
