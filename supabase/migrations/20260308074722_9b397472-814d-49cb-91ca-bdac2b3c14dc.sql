
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Service role can manage settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.settings (key, value) VALUES ('auto_publish', 'true') ON CONFLICT (key) DO NOTHING;
