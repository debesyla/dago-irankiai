import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL("./static-site", import.meta.url)),
  base: "/irankiai/asmens-kodai/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  plugins: [
    react(),
    {
      name: "copy-apache-config",
      closeBundle() {
        copyFileSync(
          fileURLToPath(new URL("./static-site/.htaccess", import.meta.url)),
          fileURLToPath(new URL("./build/.htaccess", import.meta.url)),
        );
      },
    },
  ],
  build: {
    outDir: fileURLToPath(new URL("./build", import.meta.url)),
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
