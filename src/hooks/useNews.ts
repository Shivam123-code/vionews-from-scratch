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

interface NewsResponse {
  success: boolean;
  articles: NewsArticle[];
  totalResults?: number;
  hasMore?: boolean;
  error?: string;
}

async function fetchNews(category?: string, query?: string): Promise<NewsArticle[]> {
  const params: Record<string, string> = {};
  if (category && category !== 'all') {
    params.category = category;
  }
  if (query) {
    params.q = query;
  }

  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `fetch-news?${queryString}` : 'fetch-news';

  const { data, error } = await supabase.functions.invoke<NewsResponse>(url);

  if (error) {
    console.error('Error fetching news:', error);
    throw new Error('Failed to fetch news');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Failed to fetch news');
  }

  return data.articles;
}

// Cache configuration - 10 minutes stale time to reduce API calls
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
  // Use the same queryKey as useCategoryNews('world') to share cache
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
