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

export function useNews(category?: string, query?: string) {
  return useQuery({
    queryKey: ['news', category, query],
    queryFn: () => fetchNews(category, query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

export function useFeaturedNews() {
  return useQuery({
    queryKey: ['news', 'featured'],
    queryFn: () => fetchNews('world'),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useCategoryNews(category: string) {
  return useQuery({
    queryKey: ['news', 'category', category],
    queryFn: () => fetchNews(category),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useSearchNews(query: string) {
  return useQuery({
    queryKey: ['news', 'search', query],
    queryFn: () => fetchNews(undefined, query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
