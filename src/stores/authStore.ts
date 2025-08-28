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
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;
  isVendorSignup: boolean;
  
  // Computed
  isAuthenticated: boolean;
  
  // Actions
  setVendorSignup: (isVendor: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      loading: true,
      isVendorSignup: false,
      
      // Computed values
      get isAuthenticated() {
        return !!get().session;
      },
      
      // Actions
      setVendorSignup: (isVendor: boolean) => {
        set({ isVendorSignup: isVendor });
      },
      
      setSession: (session: Session | null) => {
        set({ session, user: session?.user ?? null });
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
          console.error('Error initializing auth:', error);
          set({ loading: false });
        }
      },
      
      signIn: async (email: string, password: string) => {
        try {
          await authService.signIn(email, password);
        } catch (error) {
          console.error('Error signing in:', error);
          throw error;
        }
      },
      
      signUp: async (params: SignUpParams) => {
        try {
          set({ isVendorSignup: true });
          await authService.signUp(params);
        } catch (error) {
          console.error('Error signing up:', error);
          throw error;
        }
      },
      
      signOut: async () => {
        try {
          await authService.signOut();
          set({ 
            user: null, 
            session: null, 
            isVendorSignup: false 
          });
        } catch (error) {
          console.error('Error signing out:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isVendorSignup: state.isVendorSignup 
      }),
    }
  )
);

// Initialize auth state on app start
export const initializeAuth = () => {
  const { initializeAuth } = useAuthStore.getState();
  initializeAuth();
  
  // Listen for auth changes
  const { data: { subscription } } = authService.onAuthStateChange(
    async (event, newSession) => {
      useAuthStore.getState().setSession(newSession);
      useAuthStore.getState().setLoading(false);
    }
  );
  
  return subscription;
};
