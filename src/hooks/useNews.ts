import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fallbackArticles } from "@/data/fallbackNews";

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

// --- Cache helpers ---
function cacheKey(category?: string, query?: string): string {
  return `vionews:${category || 'all'}:${query || ''}`;
}

function saveToCache(key: string, articles: NewsArticle[]) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), articles }));
  } catch { /* quota exceeded, ignore */ }
}

function readFromCache(key: string): NewsArticle[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Accept cache up to 1 hour old
    if (Date.now() - parsed.ts > 3600000) return null;
    return parsed.articles as NewsArticle[];
  } catch {
    return null;
  }
}

// --- Fetch via same-origin proxy (no CORS issues) ---
async function fetchViaProxy(category?: string, query?: string): Promise<NewsArticle[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (query) params.set('q', query);

  const url = `/api/news/fetch-news?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
  });

  if (!response.ok) throw new Error(`Proxy returned ${response.status}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Proxy fetch failed');
  return data.articles as NewsArticle[];
}

// --- Fetch via direct edge function URL ---
async function fetchViaEdgeFunction(category?: string, query?: string): Promise<NewsArticle[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (query) params.set('q', query);

  const url = `${SUPABASE_URL}/functions/v1/fetch-news?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
  });

  if (!response.ok) throw new Error(`Edge function returned ${response.status}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Edge function failed');
  return data.articles as NewsArticle[];
}

// --- Fetch via direct DB ---
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
  if (error) throw new Error('Failed to fetch news from database');
  return (data || []).map(transformArticle);
}

// --- Get fallback articles filtered by category ---
function getFallbackArticles(category?: string, query?: string): NewsArticle[] {
  let articles = fallbackArticles;
  if (category && category !== 'all') {
    const mapped = categoryMap[category.toLowerCase()] || category;
    articles = articles.filter(a => a.categorySlug === mapped);
    // If no match for this category, return all
    if (articles.length === 0) articles = fallbackArticles;
  }
  if (query) {
    const q = query.toLowerCase();
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
    );
  }
  return articles;
}

// --- Main fetch with 5-layer resilience ---
async function fetchNews(category?: string, query?: string): Promise<NewsArticle[]> {
  const key = cacheKey(category, query);

  // 1) Same-origin proxy
  try {
    const articles = await fetchViaProxy(category, query);
    if (articles.length > 0) {
      saveToCache(key, articles);
      return articles;
    }
  } catch (err) {
    console.warn('Proxy fetch failed:', err);
  }

  // 2) Direct edge function
  try {
    const articles = await fetchViaEdgeFunction(category, query);
    if (articles.length > 0) {
      saveToCache(key, articles);
      return articles;
    }
  } catch (err) {
    console.warn('Edge function failed:', err);
  }

  // 3) Direct DB
  try {
    const articles = await fetchViaDirectDB(category, query);
    if (articles.length > 0) {
      saveToCache(key, articles);
      return articles;
    }
  } catch (err) {
    console.warn('Direct DB failed:', err);
  }

  // 4) localStorage cache
  const cached = readFromCache(key);
  if (cached && cached.length > 0) {
    console.log('Serving from cache');
    return cached;
  }

  // 5) Bundled fallback
  console.log('Serving fallback articles');
  return getFallbackArticles(category, query);
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
    retry: false, // We handle retries internally
  });
}

export function useFeaturedNews() {
  return useQuery({
    queryKey: ['news', 'world', undefined],
    queryFn: () => fetchNews('world'),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useCategoryNews(category: string) {
  return useQuery({
    queryKey: ['news', category, undefined],
    queryFn: () => fetchNews(category),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: false,
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
    retry: false,
  });
}

// Export for use in ArticlePage
export { fetchViaProxy, fetchViaEdgeFunction, fetchViaDirectDB, getFallbackArticles, readFromCache, cacheKey, saveToCache, transformArticle };
