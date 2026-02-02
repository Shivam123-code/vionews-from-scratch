import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const resolveAdmin = async (userId: string) => {
      try {
        const { data, error } = await supabase.rpc('is_admin', { _user_id: userId });
        if (error) return false;
        return data ?? false;
      } catch {
        return false;
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        
        if (user) {
          const isAdmin = await resolveAdmin(user.id);
          if (cancelled) return;
          setAuthState({ user, session, isAdmin, isLoading: false });
        } else {
          if (cancelled) return;
          setAuthState({ user: null, session: null, isAdmin: false, isLoading: false });
        }
      }
    );

    // THEN get current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      
      if (user) {
        const isAdmin = await resolveAdmin(user.id);
        if (cancelled) return;
        setAuthState({ user, session, isAdmin, isLoading: false });
      } else {
        if (cancelled) return;
        setAuthState({ user: null, session: null, isAdmin: false, isLoading: false });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Use a dedicated callback route to reliably finalize the session
        // before hitting protected routes.
        emailRedirectTo: `${window.location.origin}/admin/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...authState,
    signInWithMagicLink,
    signOut,
  };
}
