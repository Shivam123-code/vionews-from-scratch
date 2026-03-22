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

// Only these 5 categories
const CATEGORIES = ['world', 'business', 'technology', 'politics', 'sports'];

const CATEGORY_DISPLAY: Record<string, string> = {
  world: 'World',
  business: 'Business',
  technology: 'Technology',
  politics: 'Politics',
  sports: 'Sports',
};

// AI prompt for generating original article content + SEO fields
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

// Check title similarity using simple word overlap
function titlesSimilar(title1: string, title2: string): boolean {
  const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const words1 = normalize(title1);
  const words2 = normalize(title2);
  if (words1.length === 0 || words2.length === 0) return false;
  const overlap = words1.filter(w => words2.includes(w)).length;
  const similarity = overlap / Math.max(words1.length, words2.length);
  return similarity > 0.6;
}

// Clean slug: lowercase, hyphenated, no trailing numbers/special chars
function cleanSlug(raw: string): string {
  let slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  // Remove trailing numbers
  slug = slug.replace(/-?\d+$/, '').replace(/-$/, '');
  return slug || 'article';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NEWSDATA_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check auto_publish setting
    let autoPublish = true;
    const { data: settingRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'auto_publish')
      .maybeSingle();
    if (settingRow) {
      autoPublish = settingRow.value === 'true';
    }

    // Get optional category from request
    const url = new URL(req.url);
    const requestedCategory = url.searchParams.get('category');
    const categoriesToFetch = requestedCategory ? [requestedCategory] : CATEGORIES;

    // Fetch recent titles from DB for deduplication
    const { data: existingArticles } = await supabase
      .from('articles')
      .select('title')
      .order('created_at', { ascending: false })
      .limit(200);
    const existingTitles = (existingArticles || []).map((a: any) => a.title);

    let totalInserted = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    for (const category of categoriesToFetch) {
      try {
        console.log(`Fetching ${category} news...`);

        const apiUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en&category=${category}`;
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

          // Deduplication: check title similarity
          const isDuplicate = existingTitles.some(existing => titlesSimilar(existing, article.title));
          if (isDuplicate) {
            totalSkipped++;
            continue;
          }

          // Add to existing titles to prevent duplicates within this batch
          existingTitles.push(article.title);

          // Generate AI content + SEO fields
          let generatedContent = '';
          let seoTitle = article.title.substring(0, 60);
          let metaDescription = (article.description || '').substring(0, 155);
          let slug = cleanSlug(article.title.substring(0, 80));
          let keywords: string[] = [category];

          if (geminiApiKey) {
            try {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

              // Generate article content
              const contentRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    role: 'user',
                    parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildArticlePrompt(article.title, article.description || '', CATEGORY_DISPLAY[category] || category)}` }]
                  }],
                  generationConfig: { maxOutputTokens: 2000, temperature: 0.75 },
                }),
              });

              if (contentRes.ok) {
                const contentData = await contentRes.json();
                generatedContent = contentData.candidates?.[0]?.content?.parts?.[0]?.text || '';
              } else {
                const errText = await contentRes.text();
                console.warn(`Gemini content generation failed (${contentRes.status}):`, errText.substring(0, 100));
              }

              // Generate SEO metadata
              const seoPrompt = `${buildSeoPrompt(article.title, article.description || '', CATEGORY_DISPLAY[category] || category)}\n\nRespond ONLY with a JSON object like: {"seo_title":"...","meta_description":"...","slug":"...","keywords":["...",..."]}`;
              const seoRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    role: 'user',
                    parts: [{ text: seoPrompt }]
                  }],
                  generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
                }),
              });

              if (seoRes.ok) {
                const seoData = await seoRes.json();
                const seoText = seoData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                try {
                  // Extract JSON from response (may be wrapped in markdown code block)
                  const jsonMatch = seoText.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const seoArgs = JSON.parse(jsonMatch[0]);
                    seoTitle = (seoArgs.seo_title || seoTitle).substring(0, 60);
                    metaDescription = (seoArgs.meta_description || metaDescription).substring(0, 155);
                    slug = cleanSlug(seoArgs.slug || slug);
                    keywords = seoArgs.keywords || keywords;
                  }
                } catch { /* use defaults */ }
              } else {
                await seoRes.text();
              }

              // Small delay to avoid rate limiting
              await new Promise(r => setTimeout(r, 500));
            } catch (aiErr) {
              console.warn('Gemini generation error:', aiErr);
            }
          }

          // Build article record
          const articleRecord = {
            id: article.article_id,
            slug: slug,
            title: article.title,
            excerpt: (article.description || '').substring(0, 300),
            content: generatedContent || article.description || '',
            category: CATEGORY_DISPLAY[category] || category,
            category_slug: category,
            published_at: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
            author: 'VioNews Staff',
            author_role: 'Correspondent',
            image_url: article.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop',
            source_name: article.source_name,
            source_url: article.link,
            source_reference: article.title, // Store only original headline
            seo_title: seoTitle,
            meta_description: metaDescription,
            is_published: autoPublish,
            keywords: keywords,
            views: `${Math.floor(Math.random() * 100) + 10}K`,
          };

          const { error: insertError } = await supabase
            .from('articles')
            .upsert(articleRecord, { onConflict: 'id', ignoreDuplicates: false })
            .select();

          if (insertError) {
            console.error(`Insert error:`, insertError.message);
            errors.push(`DB error: ${insertError.message}`);
          } else {
            totalInserted++;
            console.log(`Inserted: ${article.title.substring(0, 60)}...`);
          }
        }

        // Delay between categories
        await new Promise(r => setTimeout(r, 500));
      } catch (catError) {
        console.error(`Error processing ${category}:`, catError);
        errors.push(`Error for ${category}: ${catError instanceof Error ? catError.message : 'Unknown'}`);
      }
    }

    // Clean up old articles (older than 7 days)
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
