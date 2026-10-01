import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@cafe/db": path.resolve(__dirname, "packages/db/src/index.ts"),
      "@cafe/shared": path.resolve(__dirname, "packages/shared/src/index.ts"),
    },
  },
  test: {
    globals: false,
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
