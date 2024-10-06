import dts from "vite-plugin-dts";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: resolve(__dirname, "docs"),
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      name: "UtilityBelt",
      fileName: "utility-belt",
      entry: resolve(__dirname, "src/index.ts"),
    },
  },
});
