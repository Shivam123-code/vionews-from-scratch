
-- Fix articles RLS: make SELECT policy PERMISSIVE (default) instead of RESTRICTIVE
DROP POLICY IF EXISTS "Articles are publicly readable" ON articles;
CREATE POLICY "Articles are publicly readable" ON articles FOR SELECT USING (true);

-- Fix admin policy to be permissive
DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
CREATE POLICY "Admins can manage articles" ON articles FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Fix service role policy to be permissive
DROP POLICY IF EXISTS "Service role can manage articles" ON articles;
CREATE POLICY "Service role can manage articles" ON articles FOR ALL USING (true) WITH CHECK (true);
