import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '@/services/authService';

// Define SignUpParams here as it's not exported from authService
export interface SignUpParams {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  isVendorSignup: boolean;
  setVendorSignup: (isVendor: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVendorSignup, setIsVendorSignup] = useState<boolean>(() => {
    try {
      const item = window.localStorage.getItem('isVendorSignup');
      return item ? JSON.parse(item) : false;
    } catch (error) {
      console.error('Failed to get isVendorSignup from localStorage', error);
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('isVendorSignup', JSON.stringify(isVendorSignup));
    } catch (error) {
      console.error('Failed to set isVendorSignup in localStorage', error);
    }
  }, [isVendorSignup]);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const currentSession = await authService.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (params: SignUpParams) => {
    try {
      setIsVendorSignup(true);
      await authService.signUp(params);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setIsVendorSignup(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!session,
    loading,
    isVendorSignup,
    setVendorSignup: setIsVendorSignup,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 