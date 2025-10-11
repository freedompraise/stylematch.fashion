// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '@/services/authService';

export interface SignUpParams {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isVendorSignup: boolean;
  isAuthenticated: boolean;
  setVendorSignup: (isVendor: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<{ session: Session | null; shouldRedirectToOnboarding: boolean } | undefined>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      isVendorSignup: false,
      
      get isAuthenticated() {
        const state = get();
        return !state.loading && !!state.session;
      },
      
      setVendorSignup: (isVendor: boolean) => {
        set({ isVendorSignup: isVendor });
      },
      
      setSession: (session: Session | null) => {
        set({ 
          session, 
          user: session?.user ?? null,
          loading: false 
        });
      },
      
      setUser: (user: User | null) => {
        set({ user });
      },
      
      setLoading: (loading: boolean) => {
        set({ loading });
      },
      
      initializeAuth: async () => {
        try {
          const currentSession = await authService.getSession();
          set({ 
            session: currentSession, 
            user: currentSession?.user ?? null,
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
        }
      },
      
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });
          await authService.signIn(email, password);
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      
      signUp: async (params: SignUpParams) => {
        set({ isVendorSignup: true });
        return await authService.signUp(params);
      },
      
      signOut: async () => {
        await authService.signOut();
        set({ user: null, session: null, isVendorSignup: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        isVendorSignup: state.isVendorSignup 
      }),
    }
  )
);

export const initializeAuth = () => {
  useAuthStore.getState().initializeAuth();
  
  const { data: { subscription } } = authService.onAuthStateChange(
    (_event, session) => {
      useAuthStore.getState().setSession(session);
    }
  );
  
  return subscription;
};
