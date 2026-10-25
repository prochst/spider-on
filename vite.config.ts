import { defineConfig } from "vitest/config";

export default defineConfig({
  // GitHub Pages serves the game from https://<user>.github.io/spider-on/
  base: "/spider-on/",
  test: {
    include: ["src/**/*.test.ts"],
  },
});
