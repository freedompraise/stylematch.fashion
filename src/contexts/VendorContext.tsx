// VendorContext.tsx

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabaseClient';
import { VendorProfile } from '@/types/VendorSchema';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';
import { AuthService } from '@/services/authService';
import { vendorProfileService } from '@/services/vendorProfileService';

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
  updateVendorProfile: (updates: Partial<VendorProfile>, imageFile?: File) => Promise<void>;
  getVendorProfile: (force?: boolean) => Promise<VendorProfile | null>;
  createVendorProfile: (profile: import('@/types').CreateVendorProfileInput) => Promise<void>;
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
const authService = new AuthService();

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [hasVendor, setHasVendor] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
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
      const authResult = await authService.refreshSession();
      if (!authResult.session) throw new Error('Failed to refresh session');
      
      setUser(authResult.session.user);
      setSessionExpiresAt(authResult.session.expires_at ? authResult.session.expires_at * 1000 : null);
      
      saveToCache({
        session: {
          lastRefresh: new Date().toISOString(),
          expiresAt: authResult.session.expires_at 
            ? new Date(authResult.session.expires_at * 1000).toISOString() 
            : ''
        }
      });
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
      await authService.signOut();
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

  // Load vendor data
  const loadVendor = useCallback(async (userId: string) => {
    if (!userId || isLoadingVendor) {
      console.log('Skipping vendor load:', { userId, isLoadingVendor });
      return;
    }

    console.log('Loading vendor for userId:', userId);
    setIsLoadingVendor(true);
    
    try {
      // Use vendorProfileService to fetch vendor profile
      const data = await vendorProfileService.getVendorProfile(userId);
      if (data) {
        setVendor(data);
        setHasVendor(true);
        setIsOnboarded(data.isOnboarded || false);
        saveToCache({
          profile: data,
          ttl: CACHE_TTL
        });
      } else {
        setVendor(null);
        setHasVendor(false);
        setIsOnboarded(false);
      }
    } catch (err) {
      console.error('Error in loadVendor:', err);
      setError(err instanceof Error ? err : new Error('Failed to load vendor'));
      setVendor(null);
      setHasVendor(false);
      setIsOnboarded(false);
    } finally {
      setIsLoadingVendor(false);
      setLoading(false);
    }
  }, [isLoadingVendor, saveToCache]);

  const getVendorProfile = useCallback(async (force = false) => {
    if (!user?.id) return null;
    if (!force && vendor) {
      return vendor;
    }
    try {
      // Use vendorProfileService to fetch vendor profile
      const data = await vendorProfileService.getVendorProfile(user.id);
      if (data) {
        setVendor(data);
        saveToCache({
          profile: data,
          ttl: CACHE_TTL
        });
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error getting vendor profile:', error);
      toast({
        title: "Error",
        description: "Failed to get vendor profile",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, vendor, saveToCache]);

  const updateVendorProfile = useCallback(async (updates: Partial<VendorProfile>, imageFile?: File) => {
    if (!user?.id) throw new Error('No user ID available');
    let imageUrl: string | undefined;
    let uploadedImagePublicId: string | undefined;
    let oldImagePublicId: string | undefined;
    try {
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
        uploadedImagePublicId = getPublicIdFromUrl(imageUrl);
        const currentProfile = await vendorProfileService.getVendorProfile(user.id);
        if (currentProfile?.banner_image_url) {
          oldImagePublicId = getPublicIdFromUrl(currentProfile.banner_image_url);
        }
      }
      const data = await vendorProfileService.updateVendorProfile(user.id, {
        ...updates,
        ...(imageUrl && { banner_image_url: imageUrl })
      });
      if (oldImagePublicId) {
        await deleteFromCloudinary(oldImagePublicId);
      }
      setVendor(data);
      saveToCache({
        profile: data,
        ttl: CACHE_TTL
      });
      toast({
        title: 'Success',
        description: 'Vendor profile updated successfully'
      });
      return;
    } catch (error) {
      if (uploadedImagePublicId) {
        await deleteFromCloudinary(uploadedImagePublicId);
      }
      throw error;
    }
  }, [user?.id, saveToCache]);

  // Add createVendorProfile method (fixed signature)
  const createVendorProfile = useCallback(async (profile) => {
    if (!user?.id) throw new Error('No user ID available');
    try {
      const data = await vendorProfileService.createVendorProfile(user.id, profile);
      setVendor(data);
      setHasVendor(true);
      setIsOnboarded(data.isOnboarded || false);
      saveToCache({
        profile: data,
        ttl: CACHE_TTL
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create vendor profile',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user?.id, saveToCache]);

  // Initialize auth state
  useEffect(() => {
    if (isInitialized) return;
    
    const initializeAuth = async () => {
      try {
        // First check cache
        const cached = loadFromCache();
        if (cached?.profile && cached?.session) {
          console.debug('Using cached vendor data');
          setVendor(cached.profile);
          setHasVendor(true);
          setIsOnboarded(cached.profile.isOnboarded || false);
          setLoading(false);
          return;
        }

        const session = await authService.getCurrentSession();
        
        if (session.user?.id) {
          setUser(session.user);
          setIsAuthenticated(true);
          setSessionExpiresAt(session.expiresAt);
          await loadVendor(session.user.id);
        } else {
          setIsAuthenticated(false);
          setVendor(null);
          setHasVendor(false);
          setIsOnboarded(false);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in initializeAuth:', err);
        setIsAuthenticated(false);
        setVendor(null);
        setHasVendor(false);
        setIsOnboarded(false);
        setLoading(false);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isInitialized, loadVendor, loadFromCache]);

  // Listen for auth state changes
  useEffect(() => {
    if (!isInitialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.debug('Auth state changed:', { event, userId: session?.user?.id });
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        if (!user || user.id !== session.user.id) {
          setIsAuthenticated(true);
          setUser(session.user);
          setSessionExpiresAt(session.expires_at ? session.expires_at * 1000 : null);
          await loadVendor(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
        setVendor(null);
        setHasVendor(false);
        setIsOnboarded(false);
        setSessionExpiresAt(null);
        clearCache();
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, loadVendor, user, clearCache]);

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
    const { accessToken } = await authService.getCurrentSession();
    return accessToken;
  }, []);

  const contextValue = useMemo(() => ({
    vendor,
    loading,
    isAuthenticated,
    isOnboarded,
    user,
    refreshVendor: () => loadVendor(user?.id ?? ''),
    signOut,
    refreshSession,
    getAccessToken,
    updateVendorProfile,
    getVendorProfile,
    createVendorProfile,
  }), [
    vendor,
    loading,
    isAuthenticated,
    isOnboarded,
    user,
    loadVendor,
    signOut,
    refreshSession,
    getAccessToken,
    updateVendorProfile,
    getVendorProfile,
    createVendorProfile,
  ]);

  return (
    <VendorContext.Provider value={contextValue}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  
  // Add debug log
  console.debug('VendorContext state:', {
    loading: context.loading,
    isAuthenticated: context.isAuthenticated,
    hasVendor: !!context.vendor,
    isOnboarded: context.isOnboarded
  });
  
  return context;
}
