import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        // PKCE flow: exchange the code for a session
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // Implicit flow: ensure session is detected/stored
          await supabase.auth.getSession();
        }

        if (!mounted) return;
        navigate("/admin", { replace: true });
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Failed to complete login");
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (error) {
    // Fallback to login, user can request a new link.
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
