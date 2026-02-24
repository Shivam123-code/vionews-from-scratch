import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const SUPABASE_URL = "https://astgtlzsojrtxmubezpt.supabase.co";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Proxy news edge-function calls so they don't return SPA HTML
      "/api/news": {
        target: SUPABASE_URL,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/news/, "/functions/v1"),
      },
      // Universal proxy for all Supabase services (auth, db, functions, storage)
      "/api/cloud": {
        target: SUPABASE_URL,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/cloud/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
