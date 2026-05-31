import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fallbackArticles } from "@/data/fallbackNews";

export interface FaqItem { question: string; answer: string }

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
  allowIndexing?: boolean;
  faq?: FaqItem[];
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

// Map category slugs to normalized values
const categoryMap: Record<string, string> = {
  tech: 'technology',
  science: 'technology',
  entertainment: 'world',
  world: 'world',
  business: 'business',
  sports: 'sports',
  politics: 'politics',
};

// Map category slug to display name
export const categoryDisplayName: Record<string, string> = {
  world: 'World',
  technology: 'Technology',
  business: 'Business',
  politics: 'Politics',
  sports: 'Sports',
};

function normalizeCategorySlug(slug: string): string {
  return categoryMap[slug.toLowerCase()] || slug.toLowerCase();
}

export function transformArticle(article: any): NewsArticle {
  const rawSlug = article.category_slug || article.category?.toLowerCase() || 'world';
  const normalizedSlug = normalizeCategorySlug(rawSlug);
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt || '',
    content: article.content || '',
    category: categoryDisplayName[normalizedSlug] || article.category,
    categorySlug: normalizedSlug,
    time: getRelativeTime(article.published_at),
    date: formatDate(article.published_at),
    author: article.author || 'VioNews Staff',
    authorRole: article.author_role || 'Correspondent',
    image: article.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop',
    views: article.views || '0K',
    link: article.source_url,
    source: article.source_name,
    allowIndexing: article.allow_indexing !== false,
    faq: Array.isArray(article.faq) ? article.faq : undefined,
  };
}

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
    if (Date.now() - parsed.ts > 3600000) return null;
    return parsed.articles as NewsArticle[];
  } catch {
    return null;
  }
}

async function parseJsonResponse(response: Response, label: string): Promise<any> {
  if (!response.ok) throw new Error(`${label} returned ${response.status}`);
  const ct = response.headers.get('content-type') || '';
  if (ct.includes('text/html')) throw new Error(`${label} returned HTML instead of JSON`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || `${label} failed`);
  return data;
}

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

  const data = await parseJsonResponse(response, 'Proxy');
  return data.articles as NewsArticle[];
}

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

  const data = await parseJsonResponse(response, 'Edge function');
  return data.articles as NewsArticle[];
}

async function fetchViaDirectDB(category?: string, query?: string): Promise<NewsArticle[]> {
  let dbQuery = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(20);

  if (category && category !== 'all') {
    const mapped = normalizeCategorySlug(category);
    // Match both original and mapped slugs
    dbQuery = dbQuery.or(`category_slug.eq.${mapped},category_slug.eq.${category}`);
  }

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
  }

  const { data, error } = await dbQuery;
  if (error) throw new Error('Failed to fetch news from database');
  return (data || []).map(transformArticle);
}

function getFallbackArticles(category?: string, query?: string): NewsArticle[] {
  let articles = fallbackArticles;
  if (category && category !== 'all') {
    const mapped = normalizeCategorySlug(category);
    articles = articles.filter(a => a.categorySlug === mapped);
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

async function fetchNews(category?: string, query?: string): Promise<NewsArticle[]> {
  const key = cacheKey(category, query);

  try {
    const articles = await fetchViaProxy(category, query);
    if (articles.length > 0) { saveToCache(key, articles); return articles; }
  } catch (err) { console.warn('Proxy fetch failed:', err); }

  try {
    const articles = await fetchViaEdgeFunction(category, query);
    if (articles.length > 0) { saveToCache(key, articles); return articles; }
  } catch (err) { console.warn('Edge function failed:', err); }

  try {
    const articles = await fetchViaDirectDB(category, query);
    if (articles.length > 0) { saveToCache(key, articles); return articles; }
  } catch (err) { console.warn('Direct DB failed:', err); }

  const cached = readFromCache(key);
  if (cached && cached.length > 0) return cached;

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
    retry: false,
  });
}

export function useFeaturedNews() {
  return useQuery({
    queryKey: ['news', 'all', undefined],
    queryFn: () => fetchNews(),
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

export { fetchViaProxy, fetchViaEdgeFunction, fetchViaDirectDB, getFallbackArticles, readFromCache, cacheKey, saveToCache };
