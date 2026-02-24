import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// --- Backend transport shim (with safe fallback) ---
// In some environments/domains, direct cross-origin requests to the backend can
// fail in the browser (CORS/network), surfacing as "Failed to fetch".
//
// We keep direct requests as the default (best performance), but if a request to
// the backend origin fails, we retry through a same-origin proxy path
// (/api/cloud/*). On Vercel this is handled via vercel.json rewrites; in dev it
// is handled via Vite proxy.
const SUPABASE_ORIGIN = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");

if (
  SUPABASE_ORIGIN &&
  typeof window !== "undefined" &&
  !(window as any).__lovable_fetch_patched
) {
  const _origFetch = window.fetch;

  const isEditorPreview = () => window.location.hostname.endsWith(".lovableproject.com");

  const getUrlString = (input: RequestInfo | URL) =>
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : (input as Request).url;

  const toProxyPath = (url: string) => "/api/cloud" + url.slice(SUPABASE_ORIGIN.length);

  window.fetch = function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = getUrlString(input);

    // Only touch calls that are going to the backend origin.
    if (!url.startsWith(SUPABASE_ORIGIN)) {
      return _origFetch.call(this, input as any, init);
    }

    // Editor preview needs proxy always.
    if (isEditorPreview()) {
      const rewritten = toProxyPath(url);
      if (typeof input === "string") return _origFetch.call(this, rewritten, init);
      const req = input instanceof Request ? input : new Request(url, init);
      return _origFetch.call(this, new Request(rewritten, req), init);
    }

    // Production/dev: try direct first, then fall back to proxy on network failure.
    const rewritten = toProxyPath(url);

    // Prepare retry-safe request clones.
    const directInput =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input
          : (input as Request).clone();

    const retryReq =
      typeof input === "string"
        ? null
        : input instanceof URL
          ? null
          : (input as Request).clone();

    return _origFetch
      .call(this, directInput as any, init)
      .catch((err: any) => {
        // If direct fetch fails (commonly TypeError: Failed to fetch), retry via proxy.
        try {
          if (typeof input === "string") return _origFetch.call(this, rewritten, init);
          if (input instanceof URL) return _origFetch.call(this, rewritten, init);
          if (retryReq) return _origFetch.call(this, new Request(rewritten, retryReq), init);
        } catch {
          // ignore and rethrow original error below
        }
        throw err;
      });
  };

  (window as any).__lovable_fetch_patched = true;
}


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
