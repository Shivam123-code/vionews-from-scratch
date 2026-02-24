
## Objective
Make homepage/articles render even when browser cannot reach backend domain directly (current situation in your preview), so users never see empty sections.

## What I found
- Your data exists and backend function returns articles.
- Access policies are now permissive and not the blocker.
- In your preview session, every browser call to backend domain fails at network layer (`TypeError: Failed to fetch`) before response reaches app.
- Current fallback chain still relies on the same blocked domain, so it collapses to empty UI.

## Implementation plan

1) Add same-origin API proxy path (primary fix)
- Update hosting rewrites so frontend can call local paths instead of cross-origin backend URLs.
- Add proxy routes:
  - `/api/news/*` -> backend function endpoint
- Keep SPA rewrite rule after proxy rules.
- Files:
  - `public/_redirects`
  - `vercel.json`

2) Refactor news fetching to use the proxy first
- In `src/hooks/useNews.ts`:
  - Create single request helper that calls `/api/news/fetch-news?...` first.
  - Keep direct backend URL as secondary fallback.
  - Keep direct DB SDK as tertiary fallback.
- Remove hard dependency on cross-origin-only URL path as primary.
- Preserve current shape (`NewsArticle`) and existing query keys.

3) Add resilient offline/cache fallback so UI never goes blank
- In `src/hooks/useNews.ts`:
  - Save successful responses to `localStorage` by query key (`news:all`, `news:world`, etc.).
  - On all network failures, return cached data (with freshness metadata).
  - If no cache exists, return a bundled emergency seed list (`src/data/fallbackNews.ts`) so homepage sections still populate.
- This guarantees:
  - Breaking ticker has items
  - Featured block renders
  - Trending renders
  - Grid/category sections render something

4) Apply the same resilient strategy to article page
- In `src/pages/ArticlePage.tsx`:
  - Use the same proxy-first fetch helper for direct slug loads.
  - If network fails:
    - Try cached article lookup by slug from stored news payloads
    - Then emergency fallback dataset by slug
  - Keep existing AI full-content generation path unchanged.

5) Improve user-visible error behavior
- Replace hard failure states with “show cached content” states where possible.
- Keep subtle non-blocking notice when fallback data is shown (instead of empty cards).
- Ensure components that currently show “No articles available” receive fallback arrays from hook and continue rendering.

## Proposed data flow after fix
```text
UI hooks/pages
   -> same-origin proxy (/api/news/fetch-news)   [primary]
      -> Lovable Cloud backend function
   -> direct backend function URL                [secondary]
   -> direct DB SDK read                         [tertiary]
   -> localStorage cached payload                [quaternary]
   -> bundled emergency seed data                [last resort]
```

## File-level change list
- `src/hooks/useNews.ts`
  - Add proxy-first fetch path
  - Add cache read/write helpers
  - Add emergency fallback import
- `src/pages/ArticlePage.tsx`
  - Reuse resilient fetch helper and cache lookup by slug
- `src/data/fallbackNews.ts` (new)
  - Small curated list (12–20 records) in `NewsArticle` format
- `public/_redirects`
  - Add proxy route before SPA catch-all
- `vercel.json`
  - Add equivalent rewrite for `/api/news/:path*`

## Backend/database impact
- No new tables needed.
- No schema migration needed.
- Existing access policies already look correct for this public news use case.

## Validation checklist (end-to-end)
1. Homepage on preview: confirm all major sections render (breaking, featured, trending, latest, category blocks).
2. Disconnect/simulate failed backend calls: confirm cached/seed fallback still renders content (no blank sections).
3. Open an article from homepage and via direct URL: confirm article content loads (network, cache, then seed fallback).
4. Category page and search page: confirm they render fallback content instead of empty states.
5. Re-test on mobile viewport for layout integrity with fallback data.
