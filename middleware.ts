import { next } from "@vercel/edge";

export const config = {
  // Only intercept the five news category trees.
  // /api, _next/*, robots.txt, sitemap.xml, news-sitemap.xml all start with
  // neither a category name nor a slash-category pattern, so they never reach
  // this middleware. The CATEGORIES guard inside the handler is a second line
  // of defence for anything that slips through.
  matcher: [
    "/world/:path*",
    "/technology/:path*",
    "/business/:path*",
    "/politics/:path*",
    "/sports/:path*",
  ],
};

const SUPABASE_URL = "https://astgtlzsojrtxmubezpt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdGd0bHpzb2pydHhtdWJlenB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTM0NjksImV4cCI6MjA4NTYyOTQ2OX0.nLSRkAepvmnmfKuZZ_8CUF7yc5R9-ymmMhG3KEMXVZo";

const CATEGORIES = new Set(["world", "technology", "business", "politics", "sports"]);
const SITE_URL = "https://vionews.in";

const CATEGORY_DISPLAY: Record<string, string> = {
  world: "World",
  technology: "Technology",
  business: "Business",
  politics: "Politics",
  sports: "Sports",
};

// ---------------------------------------------------------------------------
// Shell cache — stores the RAW empty index.html only.
// Never cache a version that already has article content injected, or you
// will serve one article's metadata under a different article's URL.
// ---------------------------------------------------------------------------
let cachedShell: string | null = null;

async function getIndexHtml(request: Request): Promise<string> {
  if (cachedShell) return cachedShell;
  const res = await fetch(new URL("/index.html", request.url));
  cachedShell = await res.text();
  return cachedShell;
}

// ---------------------------------------------------------------------------
// HTML escaping
// ---------------------------------------------------------------------------
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Article row shape returned from Supabase
// ---------------------------------------------------------------------------
interface ArticleRow {
  slug: string;
  title: string;
  seo_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  category_slug: string;
  keywords: string[] | null;
  allow_indexing: boolean;
}

// ---------------------------------------------------------------------------
// Build all <head> tags for an article.
// React never reconciles <head> tags — zero hydration mismatch risk.
// useDocumentMeta in ArticlePage will overwrite these client-side, but
// Googlebot sees the correct values in the initial HTML response.
// ---------------------------------------------------------------------------
function buildArticleHeadTags(article: ArticleRow): string {
  const canonical = `${SITE_URL}/${article.category_slug}/${article.slug}`;
  const displayTitle = escapeHtml(article.seo_title || article.title);
  const description = escapeHtml(
    (article.meta_description || article.excerpt || article.title).substring(0, 155)
  );
  const image = article.image_url
    ? escapeHtml(article.image_url)
    : `${SITE_URL}/og-default.jpg`;
  const pubDate = article.published_at
    ? new Date(article.published_at).toISOString()
    : new Date().toISOString();
  const catName = CATEGORY_DISPLAY[article.category_slug] || article.category_slug;
  // allow_indexing defaults to true when null/undefined
  const robotsContent =
    article.allow_indexing !== false ? "index, follow" : "noindex, follow";

  // JSON-LD: NewsArticle schema.
  // safeJsonLd() is used instead of JSON.stringify() — see its comment for why.
  const newsArticleJsonLd = safeJsonLd({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.meta_description || article.excerpt || article.title,
    image: [article.image_url || `${SITE_URL}/og-default.jpg`],
    datePublished: pubDate,
    dateModified: pubDate,
    author: {
      "@type": "Person",
      name: "VioNews Staff",
      url: `${SITE_URL}/team`,
    },
    publisher: {
      "@type": "Organization",
      name: "VioNews",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
    keywords: Array.isArray(article.keywords)
      ? article.keywords.join(", ")
      : catName,
    articleSection: catName,
  });

  // JSON-LD: BreadcrumbList schema.
  const breadcrumbJsonLd = safeJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: catName,
        item: `${SITE_URL}/${article.category_slug}`,
      },
      { "@type": "ListItem", position: 3, name: article.title },
    ],
  });

  return [
    `<title>${displayTitle} | VioNews</title>`,
    // Core meta
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="robots" content="${robotsContent}" />`,
    // Open Graph
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${displayTitle}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:site_name" content="VioNews" />`,
    `<meta property="article:published_time" content="${pubDate}" />`,
    `<meta property="article:section" content="${escapeHtml(catName)}" />`,
    // Twitter Card
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${displayTitle}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    // Structured data
    `<script type="application/ld+json">${newsArticleJsonLd}</script>`,
    `<script type="application/ld+json">${breadcrumbJsonLd}</script>`,
  ].join("\n  ");
}

// ---------------------------------------------------------------------------
// Serialize an object as JSON-LD safe for embedding inside a <script> tag.
// JSON.stringify alone does NOT escape </script>, which the HTML parser
// treats as the end of the script block — breaking the page and creating
// a potential XSS vector with scraped content that can contain anything.
// Replacing </ with <\/ is valid JSON (the slash is not a special character)
// and safe HTML (the HTML parser no longer sees </script>).
// ---------------------------------------------------------------------------
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\//g, "<\\/");
}

// ---------------------------------------------------------------------------
// Strip shell's placeholder <title> then inject tags before </head>.
// Stripping first prevents duplicate <title> tags in the response.
// ---------------------------------------------------------------------------
function injectIntoHead(html: string, tags: string): string {
  const withoutTitle = html.replace(/<title>[^<]*<\/title>/i, "");
  return withoutTitle.replace("</head>", `  ${tags}\n</head>`);
}

// ---------------------------------------------------------------------------
// 410 Gone page — permanent removal signal to Google.
// Google drops 410s faster than 404s. Cache aggressively at the CDN edge.
// ---------------------------------------------------------------------------
const GONE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Content Removed | VioNews</title>
  <meta name="robots" content="noindex, nofollow" />
</head>
<body>
  <h1>410 — Content Permanently Removed</h1>
  <p>This article has been permanently removed from VioNews.</p>
  <p><a href="/">Return to VioNews homepage</a></p>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Middleware entry point
// ---------------------------------------------------------------------------
export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length === 0) return next();

  const [category, ...rest] = parts;
  if (!CATEGORIES.has(category)) return next();

  // Skip asset requests (e.g. /world/favicon.ico). Only meaningful when there
  // IS a sub-path; category-only routes like /world have rest=[] and are fine.
  if (rest.length > 0 && rest[rest.length - 1].includes(".")) return next();

  try {
    // ── Category page (/world, /sports, etc.) ──────────────────────────────
    if (rest.length === 0) {
      const html = await getIndexHtml(request);
      const catName = CATEGORY_DISPLAY[category] || category;
      const canonical = `${SITE_URL}/${category}`;
      const tags = [
        `<title>${catName} News | VioNews</title>`,
        `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
        `<meta name="robots" content="index, follow" />`,
      ].join("\n  ");
      return new Response(injectIntoHead(html, tags), {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    }

    // ── Article page (/world/some-slug) ────────────────────────────────────
    if (rest.length === 1) {
      const slug = rest[0];

      // Fetch full article metadata — used for head injection
      const apiUrl =
        `${SUPABASE_URL}/rest/v1/articles` +
        `?select=slug,title,seo_title,meta_description,excerpt,image_url,published_at,category_slug,keywords,allow_indexing` +
        `&slug=eq.${encodeURIComponent(slug)}` +
        `&category_slug=eq.${encodeURIComponent(category)}` +
        `&is_published=eq.true` +
        `&limit=1`;

      const res = await fetch(apiUrl, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(2000),
      });

      if (res.ok) {
        const data = (await res.json()) as ArticleRow[];

        if (Array.isArray(data) && data.length > 0) {
          // Article exists — inject full <head> and serve the SPA shell.
          // React hydrates normally on top; Googlebot sees real metadata immediately.
          const html = await getIndexHtml(request);
          const tags = buildArticleHeadTags(data[0]);
          return new Response(injectIntoHead(html, tags), {
            status: 200,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "public, max-age=60, s-maxage=300",
            },
          });
        }

        // Article not in DB → 410 Gone.
        // INVARIANT: this branch is only reachable when res.ok === true AND
        // data is a confirmed empty array. Timeouts throw (caught → next()),
        // non-2xx responses skip this block (res.ok is false → next()).
        // Never move this outside the `if (res.ok)` guard.
        // Long CDN cache is correct — permanently removed content stays gone.
        return new Response(GONE_HTML, {
          status: 410,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
            "X-Robots-Tag": "noindex, nofollow",
          },
        });
      }
    }

    // More than one path segment or Supabase fetch failed — fall through to SPA
    return next();
  } catch {
    // On any error fall through to SPA — never break the live site
    return next();
  }
}
