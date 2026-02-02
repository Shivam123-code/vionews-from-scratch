import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const url = new URL(req.url);
    let category = url.searchParams.get('category') || '';
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Map frontend categories to database category slugs
    const categoryMap: Record<string, string> = {
      'tech': 'technology',
      'science': 'science',
      'world': 'world',
      'business': 'business',
      'entertainment': 'entertainment',
      'sports': 'sports',
      'politics': 'politics',
      'health': 'health',
    };
    
    // Apply category mapping
    if (category && categoryMap[category.toLowerCase()]) {
      category = categoryMap[category.toLowerCase()];
    }

    console.log(`Fetching news from database: category=${category}, query=${query}`);

    // Build query
    let dbQuery = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add category filter
    if (category && category !== 'all') {
      dbQuery = dbQuery.eq('category_slug', category);
    }

    // Add search filter
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
    }

    const { data: articles, error, count } = await dbQuery;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch news from database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform to frontend format
    const transformedArticles = (articles || []).map(article => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content || '',
      category: article.category,
      categorySlug: article.category_slug,
      time: getRelativeTime(article.published_at),
      date: formatDate(article.published_at),
      author: article.author || 'VioNews',
      authorRole: article.author_role || 'Correspondent',
      image: article.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop',
      views: article.views || '0K',
      link: article.source_url,
      source: article.source_name,
    }));

    console.log(`Fetched ${transformedArticles.length} articles from database`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        articles: transformedArticles,
        totalResults: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
