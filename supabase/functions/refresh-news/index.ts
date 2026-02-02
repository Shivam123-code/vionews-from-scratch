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

// Categories to fetch
const CATEGORIES = ['world', 'business', 'entertainment', 'sports', 'science', 'technology'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NEWSDATA_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get optional category from request
    const url = new URL(req.url);
    const requestedCategory = url.searchParams.get('category');
    const categoriesToFetch = requestedCategory ? [requestedCategory] : CATEGORIES;

    let totalInserted = 0;
    let totalUpdated = 0;
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

        // Transform and upsert articles
        const articles = data.results.map((article: NewsDataArticle) => ({
          id: article.article_id,
          slug: article.article_id,
          title: article.title || 'Untitled',
          excerpt: article.description || article.content?.substring(0, 200) || '',
          content: article.content || article.description || '',
          category: article.category?.[0] || category,
          category_slug: (article.category?.[0] || category).toLowerCase().replace(/\s+/g, '-'),
          published_at: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
          author: article.creator?.[0] || article.source_name || 'VioNews',
          author_role: 'Correspondent',
          image_url: article.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop',
          source_name: article.source_name,
          source_url: article.link,
          views: `${Math.floor(Math.random() * 100) + 10}K`,
        }));

        // Upsert articles (insert or update on conflict)
        const { data: upsertData, error: upsertError } = await supabase
          .from('articles')
          .upsert(articles, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select();

        if (upsertError) {
          console.error(`Upsert error for ${category}:`, upsertError);
          errors.push(`DB error for ${category}: ${upsertError.message}`);
        } else {
          const count = upsertData?.length || 0;
          totalInserted += count;
          console.log(`Upserted ${count} articles for ${category}`);
        }

        // Small delay between categories to avoid rate limiting
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
        message: `Refreshed ${totalInserted} articles`,
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
