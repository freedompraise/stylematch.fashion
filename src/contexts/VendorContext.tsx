// VendorContext.tsx

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabaseClient';
import { VendorProfile } from '@/types/VendorSchema';
import { useVendorData } from '@/services/vendorDataService';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface VendorContextType {
  vendor: VendorProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  user: User | null;
  refreshVendor: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

interface VendorCache {
  profile: VendorProfile;
  timestamp: number;
  ttl: number;
  onboarding: {
    step: string;
    data: any;
  };
  session: {
    lastRefresh: string;
    expiresAt: string;
  };
}

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const SESSION_REFRESH_THRESHOLD = 1000 * 60; // 1 minute before expiry
const VENDOR_CACHE_KEY = 'vendor_cache';

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  // Cache Management
  const saveToCache = useCallback((data: Partial<VendorCache>) => {
    const existing = localStorage.getItem(VENDOR_CACHE_KEY);
    const cache = existing ? JSON.parse(existing) : {};
    localStorage.setItem(VENDOR_CACHE_KEY, JSON.stringify({
      ...cache,
      ...data,
      timestamp: Date.now()
    }));
  }, []);

  const loadFromCache = useCallback(() => {
    const cached = localStorage.getItem(VENDOR_CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > data.ttl) {
      localStorage.removeItem(VENDOR_CACHE_KEY);
      return null;
    }
    return data;
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(VENDOR_CACHE_KEY);
  }, []);

  // Session Management
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (session) {
        setUser(session.user);
        setSessionExpiresAt(session.expires_at ? session.expires_at * 1000 : null);
        saveToCache({
          session: {
            lastRefresh: new Date().toISOString(),
            expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : ''
          }
        });
      }
    } catch (error) {
      toast({
        title: "Session Error",
        description: "Failed to refresh session. Please sign in again.",
        variant: "destructive"
      });
      await signOut();
    }
  }, [saveToCache]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setVendor(null);
      setSessionExpiresAt(null);
      clearCache();
      navigate('/auth');
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  }, [clearCache, navigate]);
  const loadVendor = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // Try cache first
      const cached = loadFromCache();
      if (cached?.profile) {
        setVendor(cached.profile);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        setVendor(data);
        saveToCache({
          profile: data,
          ttl: CACHE_TTL
        });
      } else {
        setVendor(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load vendor profile",
        variant: "destructive"
      });
      setVendor(null);
    }
    setLoading(false);
  }, [loadFromCache, saveToCache]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setSessionExpiresAt(session.expires_at ? session.expires_at * 1000 : null);
        await loadVendor(session.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setSessionExpiresAt(session.expires_at ? session.expires_at * 1000 : null);
        await loadVendor(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setVendor(null);
        clearCache();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadVendor, clearCache]);

  // Auto-refresh session
  useEffect(() => {
    if (sessionExpiresAt) {
      const timeUntilExpiry = sessionExpiresAt - Date.now();
      if (timeUntilExpiry > 0) {
        const refreshTimer = setTimeout(refreshSession, timeUntilExpiry - SESSION_REFRESH_THRESHOLD);
        return () => clearTimeout(refreshTimer);
      }
    }
  }, [sessionExpiresAt, refreshSession]);
  const getAccessToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const contextValue = useMemo(() => ({
    vendor,
    loading,
    isAuthenticated: !!user,
    isOnboarded: !!vendor?.onboarding_completed,
    user,
    refreshVendor: () => loadVendor(user?.id ?? ''),
    signOut,
    refreshSession,
    getAccessToken
  }), [vendor, loading, user, loadVendor, signOut, refreshSession, getAccessToken]);

  return (
    <VendorContext.Provider value={contextValue}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
}
