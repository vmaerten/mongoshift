import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
  },
  format: "esm",
  dts: true,
  clean: true,
  target: "node24",
  platform: "node",
  outDir: "dist",
  outputOptions: {
    entryFileNames: "[name].js",
    chunkFileNames: "[name]-[hash].js",
  },
  // mongodb is a peer dep; commander + cli-table3 are runtime deps kept external
  // to follow Node convention (let npm install + dedupe them on the user side).
  deps: {
    neverBundle: ["mongodb", "commander", "cli-table3"],
  },
});
