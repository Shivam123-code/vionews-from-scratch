

# VioNews Full SEO & Feature Overhaul Plan

This is a large, multi-phase plan covering SEO, content pipeline, design, and static pages. Given the scope, I recommend implementing it in batches across multiple messages.

---

## Critical Architecture Change: HashRouter to BrowserRouter

The site currently uses `HashRouter` (URLs like `/#/article/...`). **Google does not properly index hash-based URLs.** For any SEO to work, we must switch to `BrowserRouter`. The Vercel config already has a catch-all rewrite (`/((?!.*\\..*).*) -> /index.html`), so this will work on production.

---

## Phase 1: Database Schema Update

Add SEO columns to the `articles` table:

```sql
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_reference text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS keywords text[];
```

---

## Phase 2: Router + URL Structure

1. **Switch `HashRouter` to `BrowserRouter`** in `App.tsx`
2. **New route structure:**
   - `/` - Homepage
   - `/world`, `/technology`, `/business`, `/politics`, `/sports` - Category pages (clean URLs, not `/category/:slug`)
   - `/:category/:slug` - Article pages (e.g. `/technology/openai-gpt5-release`)
   - `/about`, `/contact`, `/privacy-policy`, `/terms-of-service`, `/disclaimer` - Static pages
   - `/admin/*` - Admin routes (unchanged)
3. **Update all `<Link>` references** throughout Header, Footer, cards, etc.

---

## Phase 3: Categories Consolidation

Reduce to 5 categories only: **World, Technology, Business, Politics, Sports**
- Update Header navigation
- Update Footer links
- Update category mappings in `useNews.ts`, `fetch-news`, `refresh-news`
- Map old categories: science -> technology, entertainment -> drop/redirect

---

## Phase 4: Auto-Fetch with AI Content Generation

Modify the `refresh-news` edge function to:
1. Fetch from NewsData.io across 5 categories every 30 min (update cron from 15 to 30 min)
2. **Deduplicate** by checking title similarity before insert
3. For each new article, call `generate-article` to produce original 400-500 word content with the 4-paragraph structure (key fact, background, US relevance, outlook)
4. Auto-generate `seo_title` (50-60 chars), `meta_description` (150-155 chars), clean `slug`, and `keywords` via AI tool calling
5. Store `source_reference` (original API title) and set `is_published = true`
6. Generate clean slugs: lowercase, hyphenated, no numbers/special chars at end

---

## Phase 5: Per-Page SEO Meta Tags

Since this is an SPA, we need **client-side meta tag injection**:

1. Create a `useDocumentMeta` hook that updates `<title>`, `<meta name="description">`, OG tags, Twitter cards, and canonical URL via `document.head` manipulation
2. **Article pages**: inject NewsArticle JSON-LD schema, OG/Twitter tags with article-specific data
3. **Category pages**: unique title/description per category
4. **Homepage**: default meta from index.html
5. **Static pages**: unique titles/descriptions

---

## Phase 6: Design Overhaul

Per the spec: dark navy header (`#0a0f1e`) + white content + electric blue accent (`#3b82f6`) + Inter font (drop Playfair Display):

1. Update CSS variables in `index.css`:
   - Header background: `#0a0f1e`
   - Primary color: `#3b82f6` (electric blue)
   - Font: Inter only (remove Playfair Display import for headers)
2. Update Header component styling
3. Add lightning bolt icon to "VioNews" logo
4. Clean up card designs for Verge/Axios aesthetic

---

## Phase 7: Static Pages

Create 5 new page components:
- `/about` - AboutPage.tsx
- `/contact` - ContactPage.tsx (form with name/email/message)
- `/privacy-policy` - PrivacyPolicyPage.tsx
- `/terms-of-service` - TermsPage.tsx  
- `/disclaimer` - DisclaimerPage.tsx

Update Footer links to point to these routes.

---

## Phase 8: Dynamic Sitemap & Robots.txt

Create a `generate-sitemap` edge function that:
1. Queries all published articles from DB
2. Generates `/sitemap.xml` with all article URLs + static pages
3. Generates `/news-sitemap.xml` (Google News format with `<news:publication_date>`, `<news:title>`, `<news:keywords>`)
4. Returns XML responses

Add Vercel rewrites:
```json
{ "source": "/sitemap.xml", "destination": "https://...supabase.co/functions/v1/generate-sitemap?type=main" },
{ "source": "/news-sitemap.xml", "destination": "https://...supabase.co/functions/v1/generate-sitemap?type=news" }
```

Update `robots.txt` to the simplified version requested.

---

## Phase 9: Article Page Enhancements

1. Add breadcrumb: Home > Category > Article Title
2. Add WhatsApp + Copy Link share buttons alongside Facebook/Twitter
3. Add "Related Articles" section (3 articles from same category) at bottom
4. Add social share buttons styling
5. Lazy load images with `loading="lazy"`

---

## Phase 10: Homepage Improvements

1. Category filter tabs on homepage
2. Show 8-12 latest articles in grid
3. Hero/featured article at top
4. Lazy load all images
5. Loading skeletons (already partially exists)

---

## Phase 11: Admin Dashboard Enhancements

1. Add "Trigger News Fetch" button (calls refresh-news function)
2. Add stats: articles today, articles by category
3. Add auto-publish toggle (updates a settings row or flag)
4. Already has: article CRUD, delete, search

---

## Implementation Order

Given scope, I recommend implementing across **4-5 messages**:

1. **Message 1**: DB migration + BrowserRouter switch + category consolidation + design overhaul
2. **Message 2**: Auto-fetch pipeline update (refresh-news with AI generation + SEO fields)
3. **Message 3**: Per-page SEO hooks + article/category page enhancements + static pages
4. **Message 4**: Dynamic sitemap edge function + robots.txt + admin enhancements
5. **Message 5**: Testing and polish

Shall I proceed with Message 1?

