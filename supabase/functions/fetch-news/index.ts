const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NEWSDATA_API_KEY');
    if (!apiKey) {
      console.error('NEWSDATA_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'News API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const category = url.searchParams.get('category') || '';
    const query = url.searchParams.get('q') || '';
    const page = url.searchParams.get('page') || '';

    // Build NewsData.io API URL - focusing on world/international news
    let apiUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en`;
    
    // Add category filter if provided
    if (category && category !== 'all') {
      apiUrl += `&category=${category}`;
    } else {
      // Default to world news categories
      apiUrl += `&category=world,politics,business,technology,science,entertainment,sports`;
    }

    // Add search query if provided
    if (query) {
      apiUrl += `&q=${encodeURIComponent(query)}`;
    }

    // Add pagination
    if (page) {
      apiUrl += `&page=${page}`;
    }

    console.log('Fetching news from NewsData.io');

    const response = await fetch(apiUrl);
    const data: NewsDataResponse = await response.json();

    if (!response.ok || data.status !== 'success') {
      console.error('NewsData.io API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch news' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform articles to our format
    const articles = data.results?.map((article, index) => ({
      id: article.article_id || `news-${index}`,
      slug: article.article_id || `news-${index}`,
      title: article.title || 'Untitled',
      excerpt: article.description || article.content?.substring(0, 200) || '',
      content: article.content || article.description || '',
      category: article.category?.[0] || 'World',
      categorySlug: (article.category?.[0] || 'world').toLowerCase().replace(/\s+/g, '-'),
      time: getRelativeTime(article.pubDate),
      date: formatDate(article.pubDate),
      author: article.creator?.[0] || article.source_name || 'VioNews',
      authorRole: 'Correspondent',
      image: article.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop',
      views: `${Math.floor(Math.random() * 100) + 10}K`,
      link: article.link,
      source: article.source_name,
    })) || [];

    console.log(`Fetched ${articles.length} articles`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        articles,
        nextPage: data.nextPage,
        totalResults: data.totalResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
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
