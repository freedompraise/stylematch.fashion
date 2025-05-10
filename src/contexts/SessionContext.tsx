import { createContext, useContext, useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Session } from '@/types';
import supabase from '@/lib/supabaseClient';

interface SessionContextType {
  session: Session;
  supabase: SupabaseClient;
  signOutAndClear: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(["[supabase] session", session]);
      setSession({
        user: session?.user ?? null,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession({
        user: session?.user ?? null,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOutAndClear = async () => {
    await supabase.auth.signOut();
    setSession({ user: null, loading: false });
  };

  return (
    <SessionContext.Provider value={{ session, supabase, signOutAndClear }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
