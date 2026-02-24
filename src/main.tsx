import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// --- Backend transport shim ---
// Rewrite cross-origin Supabase requests to same-origin /api/cloud/* so they
// go through the hosting proxy (Vite dev proxy, Vercel rewrites, _redirects).
// This avoids CORS / network failures in preview and deployed environments.
const SUPABASE_ORIGIN = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");

if (
  SUPABASE_ORIGIN &&
  typeof window !== "undefined" &&
  !(window as any).__lovable_fetch_patched
) {
  const _origFetch = window.fetch;
  window.fetch = function patchedFetch(
      input: RequestInfo | URL,
      init?: RequestInit
    ) {
      try {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : (input as Request).url;
        if (url.startsWith(SUPABASE_ORIGIN)) {
          const rewritten = "/api/cloud" + url.slice(SUPABASE_ORIGIN.length);
          if (typeof input === "string") {
            return _origFetch.call(this, rewritten, init);
          }
          const newReq = new Request(
            rewritten,
            input instanceof Request ? input : init
          );
          return _origFetch.call(this, newReq, init);
        }
      } catch {
        // Fall through to original fetch on any rewrite error
      }
      return _origFetch.call(this, input, init);
  };
  (window as any).__lovable_fetch_patched = true;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
