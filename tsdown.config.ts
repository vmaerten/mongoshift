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
  // mongodb is a peer dep, others are runtime deps — keep them external.
  deps: {
    neverBundle: ["mongodb", "commander", "cli-table3"],
  },
});
