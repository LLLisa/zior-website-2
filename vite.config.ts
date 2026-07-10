import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// In Docker the API runs in a sibling container (http://server:1953); on the
// host it's http://localhost:1953. docker-compose.yml sets API_PROXY_TARGET.
const API_TARGET = process.env.API_PROXY_TARGET || "http://localhost:1953";

// Paths the SPA dev server should hand off to the Express API.
const proxied = ["/api", "/auth", "/jftText", "/uploads"];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Bind all interfaces so the dev server is reachable from outside the
    // container; harmless when running directly on the host.
    host: true,
    // The browser-facing port. Docker publishes this as localhost:1953 (same
    // port as production); host mode (`npm run dev:host`) defaults to 5173 so
    // it doesn't clash with the API on 1953.
    port: Number(process.env.CLIENT_PORT) || 5173,
    proxy: Object.fromEntries(
      proxied.map((p) => [p, { target: API_TARGET, changeOrigin: true }]),
    ),
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
