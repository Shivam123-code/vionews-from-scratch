import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  adminChecked: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    adminChecked: true,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    let checkSeq = 0;

    const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number): Promise<T> => {
      let timeoutId: number | undefined;
      const timeout = new Promise<T>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error("timeout")), ms);
      });
      try {
        return await Promise.race([Promise.resolve(promise), timeout]);
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
      }
    };

    const resolveAdmin = async (userId: string) => {
      try {
        // Never let admin check block the UI indefinitely.
        const { data, error } = await withTimeout(
          supabase.rpc('is_admin', { _user_id: userId }),
          7000
        );
        if (error) return false;
        return data ?? false;
      } catch {
        return false;
      }
    };

    const applySession = (session: Session | null) => {
      const user = session?.user ?? null;

      // Always resolve loading immediately once we know whether a session exists.
      // Admin check runs in background and updates `isAdmin/adminChecked` when done.
      setAuthState((prev) => ({
        ...prev,
        user,
        session,
        isLoading: false,
        isAdmin: user ? prev.isAdmin : false,
        adminChecked: user ? false : true,
      }));

      if (!user) return;

      const seq = ++checkSeq;
      void (async () => {
        const isAdmin = await resolveAdmin(user.id);
        if (cancelled || seq !== checkSeq) return;
        setAuthState((prev) => ({
          ...prev,
          isAdmin,
          adminChecked: true,
        }));
      })();
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return;
        applySession(session);
      }
    );

    // THEN get current session — with a safety timeout so isLoading never stays
    // true forever (e.g. if the network request hangs on a deployed domain).
    const sessionPromise = supabase.auth.getSession();

    withTimeout(sessionPromise, 8000)
      .then(({ data: { session } }) => {
        if (cancelled) return;
        applySession(session);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthState({ user: null, session: null, isAdmin: false, adminChecked: true, isLoading: false });
      });

    // Extra safety net: force isLoading=false after 10 s no matter what
    const safetyTimer = window.setTimeout(() => {
      if (cancelled) return;
      setAuthState((prev) => (prev.isLoading ? { ...prev, isLoading: false, adminChecked: true } : prev));
    }, 10000);

    return () => {
      cancelled = true;
      window.clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Use a dedicated callback route to reliably finalize the session
        // before hitting protected routes.
        emailRedirectTo: `${window.location.origin}/#/admin/callback`,
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
