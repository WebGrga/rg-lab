import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/btc-jev/api": {
        target: "https://btc-jev-signal.roko-experiments.workers.dev",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/btc-jev/, ""),
      },
    },
  },
});

