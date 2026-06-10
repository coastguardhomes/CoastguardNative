import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "192.168.18.100", // tu IP local
      port: 5173,
    },
  },
  build: {
    outDir: "dist",
  },
});
