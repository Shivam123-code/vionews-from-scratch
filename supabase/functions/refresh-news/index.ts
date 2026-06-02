import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsDataArticle {
  article_id: string;
  title: string;
  link: string;
  description: string | null;
  content: string | null;
  pubDate: string;
  image_url: string | null;
  source_name: string;
  creator: string[] | null;
  category: string[];
  country: string[];
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
}

const CATEGORIES = ['world', 'business', 'technology', 'politics', 'sports'];

const CATEGORY_DISPLAY: Record<string, string> = {
  world: 'World',
  business: 'Business',
  technology: 'Technology',
  politics: 'Politics',
  sports: 'Sports',
};

const AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const SYSTEM_PROMPT = `You are a senior news journalist at VioNews, a professional digital news platform for US readers. You write original, factual, engaging news articles.

STRICT RULES:
- Write 100% original content. NEVER copy sentences from any source material.
- Use the provided headline and summary ONLY as a reference for the topic.
- Write for a US English-speaking audience.
- Use journalistic tone: neutral, factual, professional.
- NEVER use these phrases: "As an AI", "According to our system", "In conclusion", "In summary", "It remains to be seen", "Only time will tell"
- Every article must read like it was written by a human journalist.
- Vary your opening sentence structure — do NOT start every article the same way.
- Write in third person. Do not address the reader directly.`;

function buildArticlePrompt(title: string, description: string, category: string): string {
  return `Write an original news article based on this topic reference:

TOPIC: ${title}
SUMMARY: ${description}
CATEGORY: ${category}

Write exactly 4 paragraphs (400-500 words total):
Paragraph 1: Key facts — what happened, who is involved, when, and where.
Paragraph 2: Background and context — why this is happening, relevant history.
Paragraph 3: Why this matters specifically to US readers — economic impact, policy implications, or cultural relevance to Americans.
Paragraph 4: Expert outlook — what analysts or officials expect to happen next, potential consequences.

Separate paragraphs with double newlines. Do NOT include any headings, bullet points, or markdown formatting. Just plain text paragraphs.`;
}

function buildSeoPrompt(title: string, description: string, category: string): string {
  return `Based on this news article topic, generate SEO metadata:

TOPIC: ${title}
SUMMARY: ${description}
CATEGORY: ${category}

Requirements:
- seo_title: Exactly 50-60 characters, keyword-rich, compelling for search results
- meta_description: Exactly 150-155 characters, includes primary keyword, compelling click-through
- slug: Lowercase, hyphenated, clean URL slug. Example format: openai-releases-gpt5-march-2025. NO numbers or special characters at the end. NO trailing hyphens.
- keywords: Array of exactly 5-7 relevant keywords/phrases for this article`;
}

function buildFaqPrompt(title: string, content: string, category: string): string {
  const body = (content || '').slice(0, 3000);
  return `You are a news editor writing a FAQ section for a news article.

TITLE: ${title}
CATEGORY: ${category}
ARTICLE:
${body}

Generate exactly 4 specific FAQs a reader would have after reading this article. Each answer must be 2-3 sentences (max 60 words), factual, and grounded in the article. Avoid generic questions.

Respond ONLY with valid JSON: {"faq":[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]}`;
}

function titlesSimilar(title1: string, title2: string): boolean {
  const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const words1 = normalize(title1);
  const words2 = normalize(title2);
  if (words1.length === 0 || words2.length === 0) return false;
  const overlap = words1.filter(w => words2.includes(w)).length;
  const similarity = overlap / Math.max(words1.length, words2.length);
  return similarity > 0.6;
}

function cleanSlug(raw: string): string {
  let slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  slug = slug.replace(/(-\d+)+$/, '').replace(/-$/, '');
  slug = slug.replace(/-?\d{6,}-?/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return slug || 'article';
}

const SLUG_SUFFIXES = ['latest', 'update', 'report', 'recap', 'details', 'analysis', 'insight', 'brief', 'roundup', 'overview'];

function makeUniqueSlug(baseSlug: string, existingSlugs: Set<string>): string {
  if (!existingSlugs.has(baseSlug)) return baseSlug;
  for (const suffix of SLUG_SUFFIXES) {
    const candidate = `${baseSlug}-${suffix}`;
    if (!existingSlugs.has(candidate)) return candidate;
  }
  const fallback = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
  return fallback;
}

const LOCAL_NEWS_KEYWORDS = [
  // Generic local/municipal
  'city council', 'local council', 'parish', 'borough', 'ward',
  'municipal', 'county budget', 'road repairs', 'bin collection',
  'planning permission', 'town hall', 'zoning board', 'pothole',
  'local election', 'school board meeting',
  // Indian politics/legal
  'tehsildar', 'ex-tehsildar', 'dalal', 'jaishankar', 'bjp', 'aap',
  'congress party', 'modi', 'rupee', 'crore', 'lakh',
  'hc suspends', 'high court india', 'all-party meeting india',
  // Indian state politics
  'dmk', 'aiadmk', 'palaniswami', 'tamil nadu politics',
  'odisha', 'bandh', 'malkangiri', 'ashok leyland',
  'excise duty india', 'tamil nadu cm',
  // Nigerian/African local politics
  'apc', 'tinubu', 'north-west nigeria', 'kaduna',
  'nigerian politics', 'uba sani',
  // Local court/legal cases
  'bribery case', 'sentence suspended', 'ex-councillor', 'magistrate court',
  // Hyper-local US crime
  'cold case', 'sentencing delayed', 'local murder',
  'county court', 'district court ruling',
  // Product advertisements/sales
  '% off', 'spring sale', 'amazon sale', 'deal alert',
  'discount', 'price drop', 'buy now', 'limited time',
  'on sale', 'coupon',
];

function isHyperLocalNews(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return LOCAL_NEWS_KEYWORDS.some(kw => text.includes(kw));
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

async function callOpenRouter(apiKey: string, messages: { role: string; content: string }[], maxTokens: number, temperature: number): Promise<string> {
  const response = await fetch(AI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI gateway error (${response.status}): ${errText.substring(0, 100)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NEWSDATA_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openrouterApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let autoPublish = true;
    const { data: settingRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'auto_publish')
      .maybeSingle();
    if (settingRow) {
      autoPublish = settingRow.value === 'true';
    }

    const url = new URL(req.url);
    const requestedCategory = url.searchParams.get('category');
    const categoriesToFetch = requestedCategory ? [requestedCategory] : CATEGORIES;

    const { data: existingArticles } = await supabase
      .from('articles')
      .select('title, slug')
      .order('created_at', { ascending: false })
      .limit(500);
    const existingTitles = (existingArticles || []).map((a: any) => a.title);
    const existingSlugs = new Set((existingArticles || []).map((a: any) => a.slug));

    let totalInserted = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    for (const category of categoriesToFetch) {
      try {
        console.log(`Fetching ${category} news...`);

        const apiUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en&country=us,gb,au,ca,nz&category=${category}`;
        const response = await fetch(apiUrl);
        const data: NewsDataResponse = await response.json();

        if (!response.ok || data.status !== 'success') {
          console.error(`API error for ${category}:`, data);
          errors.push(`Failed to fetch ${category}`);
          continue;
        }

        if (!data.results || data.results.length === 0) {
          console.log(`No articles for ${category}`);
          continue;
        }

        for (const article of data.results) {
          if (!article.title || !article.description) continue;

          if (isHyperLocalNews(article.title, article.description || '')) {
            console.log(`Skipped hyper-local: ${article.title.substring(0, 50)}`);
            totalSkipped++;
            continue;
          }

          const isDuplicate = existingTitles.some(existing => titlesSimilar(existing, article.title));
          if (isDuplicate) {
            totalSkipped++;
            continue;
          }

          existingTitles.push(article.title);

          let generatedContent = '';
          let seoTitle = article.title.substring(0, 60);
          let metaDescription = (article.description || '').substring(0, 155);
          let slug = cleanSlug(article.title.substring(0, 80));
          let keywords: string[] = [category];
          let faq: { question: string; answer: string }[] = [];

          if (openrouterApiKey) {
            try {
              // Generate article content
              generatedContent = await callOpenRouter(
                openrouterApiKey,
                [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: buildArticlePrompt(article.title, article.description || '', CATEGORY_DISPLAY[category] || category) },
                ],
                2000,
                0.75
              );

              // Skip if AI-generated content is too short (under 300 words)
              if (generatedContent && wordCount(generatedContent) < 300) {
                console.log(`Skipped low-quality (${wordCount(generatedContent)} words): ${article.title.substring(0, 50)}`);
                totalSkipped++;
                continue;
              }

              // Generate SEO metadata
              const seoPrompt = `${buildSeoPrompt(article.title, article.description || '', CATEGORY_DISPLAY[category] || category)}\n\nRespond ONLY with a JSON object like: {"seo_title":"...","meta_description":"...","slug":"...","keywords":["...",..."]}`;
              const seoText = await callOpenRouter(
                openrouterApiKey,
                [{ role: 'user', content: seoPrompt }],
                500,
                0.3
              );

              try {
                const jsonMatch = seoText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const seoArgs = JSON.parse(jsonMatch[0]);
                  seoTitle = seoArgs.seo_title || seoTitle;
                  metaDescription = (seoArgs.meta_description || metaDescription).substring(0, 155);
                  slug = cleanSlug(seoArgs.slug || slug);
                  keywords = seoArgs.keywords || keywords;
                }
              } catch { /* use defaults */ }

              // Small delay to avoid rate limiting
              await new Promise(r => setTimeout(r, 500));

              // Generate FAQ
              try {
                const faqText = await callOpenRouter(
                  openrouterApiKey,
                  [{ role: 'user', content: buildFaqPrompt(article.title, generatedContent, CATEGORY_DISPLAY[category] || category) }],
                  900,
                  0.5
                );
                const faqMatch = faqText.match(/\{[\s\S]*\}/);
                if (faqMatch) {
                  const parsed = JSON.parse(faqMatch[0]);
                  if (Array.isArray(parsed.faq)) {
                    faq = parsed.faq
                      .filter((f: any) => f && typeof f.question === 'string' && typeof f.answer === 'string')
                      .slice(0, 4);
                  }
                }
              } catch (faqErr) {
                console.warn('FAQ generation error:', faqErr);
              }
              await new Promise(r => setTimeout(r, 500));
            } catch (aiErr) {
              console.warn('OpenRouter generation error:', aiErr);
            }
          }

          // Final content quality check
          const finalContent = generatedContent || article.description || '';
          const finalWc = wordCount(finalContent);
          
          // Skip articles under 300 words entirely
          if (finalWc < 300) {
            console.log(`Skipped final quality check (${finalWc} words): ${article.title.substring(0, 50)}`);
            totalSkipped++;
            continue;
          }

          // Determine indexing: 350+ words = indexable, 300-349 = noindex
          const allowIndexing = finalWc >= 350;
          // Articles between 300-349 words: publish but noindex
          const shouldPublish = autoPublish;

          slug = makeUniqueSlug(slug, existingSlugs);
          existingSlugs.add(slug);

          const articleRecord = {
            id: article.article_id,
            slug: slug,
            title: article.title,
            excerpt: (article.description || '').substring(0, 300),
            content: finalContent,
            category: CATEGORY_DISPLAY[category] || category,
            category_slug: category,
            published_at: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
            author: 'VioNews Staff',
            author_role: 'Correspondent',
            image_url: article.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop',
            source_name: article.source_name,
            source_url: article.link,
            source_reference: article.title,
            seo_title: seoTitle,
            meta_description: metaDescription,
            is_published: shouldPublish,
            allow_indexing: allowIndexing,
            keywords: keywords,
            faq: faq.length > 0 ? faq : null,
            views: `${Math.floor(Math.random() * 100) + 10}K`,
          };

          // Throttled insert: wait 3 minutes between inserts for natural pacing
          if (totalInserted > 0) {
            console.log(`Throttling: waiting 3 minutes before next insert...`);
            await new Promise(r => setTimeout(r, 180000));
          }

          const { error: insertError } = await supabase
            .from('articles')
            .upsert(articleRecord, { onConflict: 'id', ignoreDuplicates: false })
            .select();

          if (insertError) {
            console.error(`Insert error:`, insertError.message);
            errors.push(`DB error: ${insertError.message}`);
          } else {
            totalInserted++;
            console.log(`Inserted (${finalWc}w, indexable=${allowIndexing}): ${article.title.substring(0, 60)}...`);
          }
        }

        await new Promise(r => setTimeout(r, 500));
      } catch (catError) {
        console.error(`Error processing ${category}:`, catError);
        errors.push(`Error for ${category}: ${catError instanceof Error ? catError.message : 'Unknown'}`);
      }
    }

    const { error: cleanupError } = await supabase.rpc('cleanup_old_articles');
    if (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    } else {
      console.log('Cleaned up old articles');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Inserted ${totalInserted} articles, skipped ${totalSkipped} duplicates`,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error refreshing news:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
