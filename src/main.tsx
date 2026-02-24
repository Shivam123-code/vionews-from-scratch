import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// --- Preview-safe backend transport shim ---
// In preview environments, rewrite requests to the Supabase domain
// through a same-origin proxy to avoid CORS / network failures.
const SUPABASE_ORIGIN = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");

if (
  SUPABASE_ORIGIN &&
  typeof window !== "undefined" &&
  !(window as any).__lovable_fetch_patched
) {
  const isPreview =
    window.location.hostname.includes("lovable.app") ||
    window.location.hostname === "localhost";

  if (isPreview) {
    const _origFetch = window.fetch;
    window.fetch = function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
      try {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
        if (url.startsWith(SUPABASE_ORIGIN)) {
          const rewritten = "/api/cloud" + url.slice(SUPABASE_ORIGIN.length);
          if (typeof input === "string") {
            return _origFetch.call(this, rewritten, init);
          }
          // For Request objects, create a new one with the rewritten URL
          const newReq = new Request(rewritten, input instanceof Request ? input : init);
          return _origFetch.call(this, newReq, init);
        }
      } catch {
        // If anything goes wrong with rewriting, fall through to original
      }
      return _origFetch.call(this, input, init);
    };
    (window as any).__lovable_fetch_patched = true;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
