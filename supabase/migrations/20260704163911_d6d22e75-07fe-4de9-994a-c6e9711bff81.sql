SELECT cron.unschedule('cleanup-old-articles-daily');

CREATE OR REPLACE FUNCTION public.cleanup_old_articles()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Disabled: articles are retained indefinitely for SEO value.
  RETURN;
END;
$function$;