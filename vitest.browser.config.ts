import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.browser.test.tsx"],
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
      headless: true,
    },
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["**/*.test.*", "**/node_modules/**"],
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
});
