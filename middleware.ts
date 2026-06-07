import { next } from "@vercel/edge";

export const config = {
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

let cachedHtml: string | null = null;

async function getIndexHtml(request: Request): Promise<string> {
  if (cachedHtml) return cachedHtml;
  const res = await fetch(new URL("/index.html", request.url));
  cachedHtml = await res.text();
  return cachedHtml;
}

function injectCanonical(html: string, canonical: string): string {
  const tag = `<link rel="canonical" href="${canonical}" />`;
  return html.replace("</head>", `  ${tag}\n  </head>`);
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length === 0) return next();

  const [category, ...rest] = parts;
  if (!CATEGORIES.has(category)) return next();

  const lastSegment = rest[rest.length - 1] || "";
  if (lastSegment.includes(".")) return next();

  try {
    let html = await getIndexHtml(request);

    if (rest.length === 0) {
      // Category page — inject self-referencing canonical
      const canonical = `https://vionews.in/${category}`;
      html = injectCanonical(html, canonical);
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    }

    if (rest.length === 1) {
      // Article page — verify existence and inject article canonical
      const slug = rest[0];
      const apiUrl = `${SUPABASE_URL}/rest/v1/articles?select=id&slug=eq.${encodeURIComponent(
        slug
      )}&category_slug=eq.${encodeURIComponent(category)}&is_published=eq.true&limit=1`;

      const res = await fetch(apiUrl, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(2000),
      });

      if (res.ok) {
        const data = (await res.json()) as unknown[];
        if (Array.isArray(data) && data.length > 0) {
          const canonical = `https://vionews.in/${category}/${slug}`;
          html = injectCanonical(html, canonical);
          return new Response(html, {
            status: 200,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "public, max-age=60, s-maxage=300",
            },
          });
        }
        // Article not found → real 404
        return new Response(
          `<!doctype html><html><head><meta charset="utf-8"><title>404 — Article Not Found</title><meta name="robots" content="noindex, nofollow"></head><body><h1>404 — Article Not Found</h1><p>The article you requested does not exist.</p><p><a href="/">Return to homepage</a></p></body></html>`,
          {
            status: 404,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "public, max-age=60, s-maxage=60",
              "X-Robots-Tag": "noindex, nofollow",
            },
          }
        );
      }
    }

    // More than 2 path segments — pass through to SPA
    return next();
  } catch {
    // On any error, fall through to SPA — never break the site
  }

  return next();
}
