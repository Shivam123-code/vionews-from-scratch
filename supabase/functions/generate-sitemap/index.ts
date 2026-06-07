import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://vionews.in';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/world', priority: '0.8', changefreq: 'hourly' },
  { loc: '/technology', priority: '0.8', changefreq: 'hourly' },
  { loc: '/business', priority: '0.8', changefreq: 'hourly' },
  { loc: '/politics', priority: '0.8', changefreq: 'hourly' },
  { loc: '/sports', priority: '0.8', changefreq: 'hourly' },
  { loc: '/about', priority: '0.3', changefreq: 'monthly' },
  { loc: '/team', priority: '0.4', changefreq: 'monthly' },
  { loc: '/faq', priority: '0.4', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.3', changefreq: 'monthly' },
  { loc: '/privacy-policy', priority: '0.2', changefreq: 'monthly' },
  { loc: '/terms-of-service', priority: '0.2', changefreq: 'monthly' },
  { loc: '/disclaimer', priority: '0.2', changefreq: 'monthly' },
];

/**
 * Fix mojibake: UTF-8 smart quotes/dashes that were decoded as Latin-1.
 * e.g. the RIGHT SINGLE QUOTATION MARK (U+2019, bytes E2 80 99) gets
 * stored/served as the 3-character sequence â€™ when interpreted as Latin-1.
 */
function fixEncoding(str: string): string {
  return str
    // â€™  →  '  (right single quote U+2019)
    .replace(/â€™/g, "'")
    // â€˜  →  '  (left single quote U+2018)
    .replace(/â€˜/g, "'")
    // â€œ  →  "  (left double quote U+201C)
    .replace(/â€œ/g, '"')
    // â€  →  "  (right double quote U+201D — note: bare â€ with trailing non-ASCII)
    .replace(/â€(?=[^˜œ™\u2018\u2019\u201c\u201d]|$)/g, '"')
    // â€"  →  –  (en dash U+2013)
    .replace(/â€"/g, '-')
    // â€"  →  —  (em dash U+2014)
    .replace(/â€"/g, '-')
    // â€¦  →  …  (ellipsis U+2026)
    .replace(/â€¦/g, '...')
    // Catch-all: strip remaining Ã/â sequences that are unrecognised mojibake
    .replace(/[Ã][^\s]/g, '')
    .trim();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'main';

    if (type === 'news') {
      // News sitemap: only articles from last 48 hours
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: articles } = await supabase
        .from('articles')
        .select('slug, category_slug, category, seo_title, title, published_at, keywords')
        .eq('is_published', true)
        .gte('published_at', cutoff)
        .order('published_at', { ascending: false });

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
      xml += `  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

      for (const a of (articles || [])) {
        // Use category_slug from DB; fall back to lowercased category display name
        const catSlug = (a.category_slug || (a.category || '').toLowerCase()).trim();
        const articleUrl = `${SITE_URL}/${catSlug}/${a.slug}`;
        const pubDate = a.published_at ? new Date(a.published_at).toISOString() : new Date().toISOString();
        // Fix encoding BEFORE XML-escaping; use the full title — never truncate
        const rawTitle = (a.seo_title || a.title || '').trim();
        const title = escapeXml(fixEncoding(rawTitle));
        const keywords = (a.keywords || []).join(', ');

        xml += `  <url>\n`;
        xml += `    <loc>${escapeXml(articleUrl)}</loc>\n`;
        xml += `    <news:news>\n`;
        xml += `      <news:publication>\n`;
        xml += `        <news:name>VioNews</news:name>\n`;
        xml += `        <news:language>en</news:language>\n`;
        xml += `      </news:publication>\n`;
        xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
        xml += `      <news:title>${title}</news:title>\n`;
        if (keywords) {
          xml += `      <news:keywords>${escapeXml(keywords)}</news:keywords>\n`;
        }
        xml += `    </news:news>\n`;
        xml += `  </url>\n`;
      }

      xml += `</urlset>`;

      return new Response(xml, {
        headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }

    // Main sitemap
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, category_slug, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}${page.loc}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Article pages
    for (const a of (articles || [])) {
      const articleUrl = `${SITE_URL}/${a.category_slug}/${a.slug}`;
      const lastmod = a.published_at ? new Date(a.published_at).toISOString().split('T')[0] : '';

      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(articleUrl)}</loc>\n`;
      if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch (error) {
    console.error('Sitemap error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
