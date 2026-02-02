-- Create articles table to cache news
CREATE TABLE public.articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  author TEXT,
  author_role TEXT DEFAULT 'Correspondent',
  image_url TEXT,
  source_name TEXT,
  source_url TEXT,
  views TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for category queries
CREATE INDEX idx_articles_category_slug ON public.articles(category_slug);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_created_at ON public.articles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public read access (no login required)
CREATE POLICY "Articles are publicly readable"
  ON public.articles
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (for edge functions)
CREATE POLICY "Service role can manage articles"
  ON public.articles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_articles_updated_at();

-- Create function to clean old articles (older than 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_articles()
RETURNS void AS $$
BEGIN
  DELETE FROM public.articles 
  WHERE created_at < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;