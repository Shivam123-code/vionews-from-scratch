
Goal: make the admin side and public site reliable in preview and production by removing the current backend transport failures, while keeping secure role-based access exactly server-validated (no client-side role trust).

1) What is actually broken (confirmed)
- Admin login/reset/session checks fail with `TypeError: Failed to fetch` when calling auth endpoints from browser (`signInWithPassword`, `resetPasswordForEmail`, `getSession`, RPC role check).
- Public news calls still hit fallback because `/api/news/fetch-news` currently returns HTML (SPA index), not JSON.
- Root cause is transport/routing in preview:
  - Direct backend domain calls can fail in this environment.
  - The current `/api/news/*` rewrite is not active in Vite preview, so requests are handled by SPA fallback.
- Role/RLS model is already correctly structured and secure:
  - roles are in `user_roles` (separate table),
  - admin checks use server-side functions (`is_admin` / `has_role`),
  - policies are PERMISSIVE and valid.

Do I know what the issue is? Yes.

2) Implementation strategy
I’ll implement a unified “preview-safe backend transport” so all SDK and fetch-based backend calls work through same-origin proxy in preview, while preserving current behavior for published environments.

```text
Browser code
  -> (preview only) rewrite backend-origin requests to /api/cloud/*
  -> Vite dev proxy forwards /api/cloud/* and /api/news/* to backend
  -> backend responds normally (auth/db/functions/storage)
```

3) File-by-file change plan

A) `vite.config.ts` (critical fix)
- Add `server.proxy` rules:
  - `/api/news/*` -> backend `/functions/v1/*` (so existing news proxy returns JSON, not HTML).
  - `/api/cloud/*` -> backend root `/*` (universal proxy for auth/db/functions/storage).
- Keep existing dev/HMR settings unchanged.

B) `src/main.tsx` (critical fix)
- Install a guarded global `fetch` proxy shim (preview-only):
  - Detect preview host (lovable preview domain).
  - Rewrite outgoing requests targeting `VITE_SUPABASE_URL` origin to `/api/cloud/...`.
  - Leave all non-backend requests untouched.
- Add an idempotent guard so HMR/StrictMode doesn’t patch fetch repeatedly.

Why this is key:
- It automatically fixes all SDK-based calls without editing the generated client file:
  - auth (`signInWithPassword`, `getSession`, password reset, callbacks),
  - DB reads/writes,
  - RPC role checks,
  - storage uploads,
  - function invokes (`generate-article`).

C) `src/hooks/useNews.ts`
- Keep resilient fallback chain, but harden proxy behavior:
  - validate response content-type and payload shape before trusting proxy response;
  - if proxy returns HTML or invalid JSON, fail fast to next layer.
- Prefer `/api/cloud/functions/v1/fetch-news` or keep `/api/news/fetch-news` once Vite proxy is added; ensure one canonical primary route.
- Reduce noisy console warnings and surface cleaner diagnostic logs.

D) `src/pages/ArticlePage.tsx`
- Keep current fallback logic.
- Add robust generation call behavior:
  - `supabase.functions.invoke("generate-article")` should work once fetch rewrite is active;
  - if still failing, show graceful toast and continue rendering available content (no blocking spinner dead-end).

E) `src/pages/AdminLogin.tsx` and `src/pages/ResetPassword.tsx`
- Add explicit network-error mapping:
  - convert low-level `Failed to fetch` into clear user message (“Connection issue to backend. Retrying may help.”).
- Keep secure server-side auth flow and existing redirects.
- No client-side admin shortcuts, no localStorage role checks.

F) `public/_redirects` and `vercel.json`
- Add `/api/cloud/*` rewrite before catch-all SPA rule.
- Keep existing `/api/news/*` rewrite for compatibility.
- Ensure ordering prevents fallback-to-index for API paths.

4) Security and architecture guarantees (no regressions)
- No role data moved to client.
- No hardcoded admin credentials.
- Continue using server-side role validation via `is_admin`.
- No schema changes needed for this fix.
- No edits to generated integration files (`src/integrations/supabase/client.ts`, `types.ts`, `.env`).

5) Validation checklist (end-to-end)
1. Admin login route:
   - open `/#/admin/login`,
   - sign in with admin credentials,
   - confirm no `Failed to fetch` toast.
2. Admin dashboard:
   - list articles loads,
   - edit/create/delete article works,
   - image upload works.
3. Password reset:
   - send reset email,
   - open reset link,
   - set new password successfully.
4. Public site:
   - homepage sections populated from live backend (not HTML proxy response),
   - category/search/article pages load correctly.
5. Article generation:
   - open article lacking full content,
   - generate content flow completes or gracefully falls back.
6. Network verification:
   - in preview, backend calls go through same-origin `/api/cloud/*` or valid proxied `/api/news/*`,
   - no API call returns SPA HTML payload.
7. Mobile check:
   - verify login and article flows on mobile viewport.

6) Rollout approach
- Phase 1: transport/proxy fixes (`vite.config.ts`, `main.tsx`, rewrites).
- Phase 2: hook/page hardening (`useNews`, `ArticlePage`, admin auth UX).
- Phase 3: end-to-end verification across admin + public pages and cleanup of residual warnings.

7) Expected outcome
- Admin side becomes usable in preview (login + CRUD + reset + role checks).
- Public side loads live content consistently instead of collapsing to fallback due transport errors.
- The app remains secure and stable with server-validated authorization.
