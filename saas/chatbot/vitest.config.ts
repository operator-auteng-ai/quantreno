import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "."),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
