import dts from "vite-plugin-dts";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isNodeBuild = mode === "node";

  return {
    cacheDir: ".vite-tests",
    plugins: [
      dts({
        insertTypesEntry: true,
      }),
    ],
    build: {
      emptyOutDir: !isNodeBuild,
      rollupOptions: isNodeBuild
        ? {
            external: [/^node:/],
          }
        : undefined,
      lib: {
        name: "UtilityBelt",
        formats: isNodeBuild ? ["es", "cjs"] : ["es", "cjs", "umd"],
        entry: resolve(__dirname, isNodeBuild ? "src/node.ts" : "src/index.ts"),
        fileName: (format) =>
          isNodeBuild ? `node.${format}.js` : `utility-belt.${format}.js`,
      },
    },
  };
});
