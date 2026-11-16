import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        localens: resolve(import.meta.dirname, "localens/index.html"),
        gamefinder: resolve(import.meta.dirname, "gamefinder/index.html"),
        momentumLab: resolve(import.meta.dirname, "momentum-lab/index.html"),
        calendogram: resolve(import.meta.dirname, "calendogram/index.html"),
      },
    },
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
