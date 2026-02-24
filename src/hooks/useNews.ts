import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  time: string;
  date: string;
  author: string;
  authorRole: string;
  image: string;
  views: string;
  link?: string;
  source?: string;
}

function getRelativeTime(dateString: string | null): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function transformArticle(article: any): NewsArticle {
  return {
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
  };
}

const categoryMap: Record<string, string> = {
  tech: 'technology',
  science: 'science',
  world: 'world',
  business: 'business',
  entertainment: 'entertainment',
  sports: 'sports',
  politics: 'politics',
  health: 'health',
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function fetchViaEdgeFunction(category?: string, query?: string): Promise<NewsArticle[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') {
    params.set('category', category);
  }
  if (query) {
    params.set('q', query);
  }

  const url = `${SUPABASE_URL}/functions/v1/fetch-news?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Edge function returned ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Edge function failed');
  }

  return data.articles as NewsArticle[];
}

async function fetchViaDirectDB(category?: string, query?: string): Promise<NewsArticle[]> {
  let dbQuery = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(20);

  if (category && category !== 'all') {
    const mapped = categoryMap[category.toLowerCase()] || category;
    dbQuery = dbQuery.eq('category_slug', mapped);
  }

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('Direct DB error:', error);
    throw new Error('Failed to fetch news from database');
  }

  return (data || []).map(transformArticle);
}

async function fetchNews(category?: string, query?: string): Promise<NewsArticle[]> {
  // Primary: edge function (works around CORS/network issues)
  try {
    const articles = await fetchViaEdgeFunction(category, query);
    console.log(`Fetched ${articles.length} articles via edge function`);
    return articles;
  } catch (err) {
    console.warn('Edge function failed, falling back to direct DB:', err);
  }

  // Fallback: direct database query
  try {
    const articles = await fetchViaDirectDB(category, query);
    console.log(`Fetched ${articles.length} articles via direct DB`);
    return articles;
  } catch (err) {
    console.error('Both fetch methods failed:', err);
    throw err;
  }
}

const STALE_TIME = 10 * 60 * 1000;
const CACHE_TIME = 15 * 60 * 1000;

export function useNews(category?: string, query?: string) {
  return useQuery({
    queryKey: ['news', category || 'all', query],
    queryFn: () => fetchNews(category, query),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useFeaturedNews() {
  return useQuery({
    queryKey: ['news', 'world', undefined],
    queryFn: () => fetchNews('world'),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useCategoryNews(category: string) {
  return useQuery({
    queryKey: ['news', category, undefined],
    queryFn: () => fetchNews(category),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useSearchNews(query: string) {
  return useQuery({
    queryKey: ['news', undefined, query],
    queryFn: () => fetchNews(undefined, query),
    enabled: query.length > 0,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}
