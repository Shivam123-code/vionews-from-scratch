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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        
        if (user) {
          // Check if user is admin using security definer function
          const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
          setAuthState({
            user,
            session,
            isAdmin: isAdmin ?? false,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isAdmin: false,
            isLoading: false,
          });
        }
      }
    );

    // THEN get current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      
      if (user) {
        const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
        setAuthState({
          user,
          session,
          isAdmin: isAdmin ?? false,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          isAdmin: false,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
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
