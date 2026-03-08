ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS source_reference text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS keywords text[];