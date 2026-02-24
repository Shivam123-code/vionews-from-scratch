

## Analysis

The core problem is that **direct database REST API calls from the browser preview are being blocked** at the network level. All requests to `astgtlzsojrtxmubezpt.supabase.co/rest/v1/articles` fail with `TypeError: Failed to fetch` — this is a network/CORS issue, not a database or RLS problem.

The `fetch-news` edge function **works perfectly** (confirmed: returns 20 articles with status 200). The solution is to route all news fetching through this edge function using a direct `fetch()` call instead of `supabase.from('articles')`.

Additionally, there's an RLS concern: all three policies on `articles` are **RESTRICTIVE** (Permissive: No). In PostgreSQL, if there are zero permissive policies, access is denied regardless of restrictive policies. This should be fixed to ensure direct queries work once the network issue is resolved.

## Plan

### 1. Fix RLS policies on `articles` table
Change the "Articles are publicly readable" SELECT policy from RESTRICTIVE to PERMISSIVE so that anonymous reads actually work:

```sql
DROP POLICY "Articles are publicly readable" ON articles;
CREATE POLICY "Articles are publicly readable" ON articles FOR SELECT USING (true);
```

Also fix the other policies to be permissive where needed.

### 2. Rewrite `src/hooks/useNews.ts` to use the edge function as primary, with direct DB as fallback

Replace `fetchNews()` to:
1. First try calling the `fetch-news` edge function via direct `fetch()` to `${VITE_SUPABASE_URL}/functions/v1/fetch-news?category=...&q=...`
2. If that fails, fall back to direct `supabase.from('articles')` query (which should now work with fixed RLS)
3. Keep the same `transformArticle` logic for the fallback path

### 3. Update `src/pages/ArticlePage.tsx` fallback query
Ensure the article page direct query also works with the fixed RLS, and add an edge function fallback there too if needed.

## Technical Details

- The edge function already has proper CORS headers (`Access-Control-Allow-Origin: *`)
- The edge function already transforms articles into the exact `NewsArticle` format
- 13,421 articles exist in the database
- The `fetch()` approach avoids issues with `supabase.functions.invoke()` URL parsing

