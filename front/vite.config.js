import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-dom") || id.includes("react")) return "vendor-react";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("socket.io-client")) return "vendor-realtime";
          if (id.includes("zustand") || id.includes("@react-oauth")) return "vendor-state";
          return "vendor";
        },
      },
    },
  },
});
