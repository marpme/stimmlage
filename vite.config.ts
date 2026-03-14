import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const staticallyServedModules = ["lastUpdated", "poll"];

const isStaticChunk = (name: string) => {
  return staticallyServedModules.includes(name);
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          d3: ["d3"],
          color: ["color"],
          dateFns: ["date-fns"],
          react: ["react"],
          "react-dom": ["react-dom"],
        },
        // Entry files
        entryFileNames: "assets/entry.js",
        // Dynamic import chunks
        chunkFileNames: (chunkInfo) =>
          `assets/${isStaticChunk(chunkInfo.name) ? "[name]" : "[hash]"}.js`,
        // Static assets (e.g., images, CSS)
        assetFileNames: "assets/[hash].[ext]",
      },
    },
  },
});
