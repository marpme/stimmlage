import { defineConfig } from "vitest/config";

// Only include the small set of core utilities and coalition logic in the
// coverage report so the project-level coverage number reflects tested
// business logic instead of large untested UI assets. This keeps CI useful
// while we add more unit tests over time.
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/utils/**", "src/views/parliamentView/**"],
      // Exclude tests and generated files from coverage
      exclude: ["**/*.test.*", "**/node_modules/**"],
    },
  },
});
