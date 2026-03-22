/// <reference types="vitest/config" />
export default [
  { extends: "./vitest.config.ts", name: "unit" },
  { extends: "./vitest.browser.config.ts", name: "browser" },
];
