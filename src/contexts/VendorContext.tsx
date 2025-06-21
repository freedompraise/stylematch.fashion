// VendorContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  getVendorProfile as getVendorProfileService,
  updateVendorProfile as updateVendorProfileService,
  createVendorProfile as createVendorProfileService,
  deleteVendorProfile as deleteVendorProfileService,
  verifyVendor as verifyVendorService,
  rejectVendor as rejectVendorService
} from '@/services/vendorProfileService';
import { VendorProfile, CreateVendorProfileInput } from '@/types';
import { User } from '@supabase/supabase-js';

interface VendorContextType {
  user: User | null;
  vendor: VendorProfile | null;
  loading: boolean;
  restoring: boolean;
  error: Error | null;
  refreshVendor: () => Promise<void>;
  updateVendorProfile: (updates: Partial<VendorProfile>, imageFile?: File) => Promise<void>;
  getVendorProfile: (force?: boolean) => Promise<VendorProfile | null>;
  createVendorProfile: (profile: CreateVendorProfileInput, imageFile?: File) => Promise<void>;
  clearCache: () => void;
  signOut: () => Promise<void>;
}

// Utility: Only cache non-sensitive fields from the vendor profile
function getCacheSafeVendorProfile(profile: VendorProfile): Partial<VendorProfile> {
  // List of fields safe to cache
  const {
    user_id,
    store_name,
    name,
    bio,
    instagram_url,
    facebook_url,
    wabusiness_url,
    banner_image_url,
    verification_status,
    isOnboarded,
    onboarding_step,
    last_session_refresh,
    auth_metadata,
    // payout_info intentionally omitted
  } = profile;
  return {
    user_id,
    store_name,
    name,
    bio,
    instagram_url,
    facebook_url,
    wabusiness_url,
    banner_image_url,
    verification_status,
    isOnboarded,
    onboarding_step,
    last_session_refresh,
    auth_metadata,
  };
}

// Remove onboarding from VendorCache, and only cache non-sensitive fields
interface VendorCache {
  profile: Partial<VendorProfile>;
  timestamp: number;
  ttl: number;
}

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const VENDOR_CACHE_KEY = 'vendor_cache';

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut: authSignOut } = useAuth();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);

  // Debug: Log context state changes
  useEffect(() => {
    console.log('[VendorContext] user:', user);
  }, [user]);
  useEffect(() => {
    console.log('[VendorContext] vendor:', vendor);
  }, [vendor]);
  useEffect(() => {
    console.log('[VendorContext] loading:', loading);
  }, [loading]);
  useEffect(() => {
    if (error) console.error('[VendorContext] error:', error);
  }, [error]);

  // Cache Management
  const saveToCache = useCallback((data: { profile: VendorProfile; ttl: number }) => {
    try {
      const safeProfile = getCacheSafeVendorProfile(data.profile);
      const cacheData: VendorCache = {
        profile: safeProfile,
        timestamp: Date.now(),
        ttl: data.ttl
      };
      localStorage.setItem(VENDOR_CACHE_KEY, JSON.stringify(cacheData));
      console.log('[VendorContext] Saved to cache:', cacheData);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, []);

  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(VENDOR_CACHE_KEY);
      if (!cached) return null;
      const { profile, timestamp, ttl } = JSON.parse(cached) as VendorCache;
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(VENDOR_CACHE_KEY);
        console.log('[VendorContext] Cache expired, removed');
        return null;
      }
      console.log('[VendorContext] Loaded from cache:', { profile, timestamp, ttl });
      return { profile };
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(VENDOR_CACHE_KEY);
    setVendor(null);
    setError(null);
    console.log('[VendorContext] Cleared cache and vendor state');
  }, []);

  // Load vendor data
  const loadVendor = useCallback(async () => {
    console.log('[VendorContext] loadVendor called');
    if (!user?.id || isLoadingVendor) {
      console.log('[VendorContext] Skipping loadVendor: user?.id or isLoadingVendor falsey', user?.id, isLoadingVendor);
      return;
    }
    setIsLoadingVendor(true);
    try {
      const data = await getVendorProfileService(user.id);
      if (data) {
        setVendor(data);
        saveToCache({
          profile: data,
          ttl: CACHE_TTL
        });
        console.log('[VendorContext] Vendor loaded and set:', data);
      } else {
        setVendor(null);
        console.log('[VendorContext] No vendor found');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load vendor'));
      setVendor(null);
      console.error('[VendorContext] Error in loadVendor:', err);
    } finally {
      setIsLoadingVendor(false);
      setLoading(false);
    }
  }, [isLoadingVendor, saveToCache, user?.id]);

  const getVendorProfile = useCallback(async (force = false) => {
    console.log('[VendorContext] getVendorProfile called, force:', force);
    if (!user?.id) return null;
    if (!force && vendor) {
      return vendor;
    }
    try {
      const data = await getVendorProfileService(user.id);
      if (data) {
        setVendor(data);
        saveToCache({
          profile: data,
          ttl: CACHE_TTL
        });
        console.log('[VendorContext] Vendor profile fetched and set:', data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('[VendorContext] Error getting vendor profile:', error);
      return null;
    }
  }, [user?.id, vendor, saveToCache]);

  // Only call the service, do not handle Cloudinary logic here
  const updateVendorProfile = useCallback(async (updates: Partial<VendorProfile>, imageFile?: File) => {
    console.log('[VendorContext] updateVendorProfile called', updates, imageFile);
    if (!user?.id) throw new Error('No user ID available');
    try {
      const data = await updateVendorProfileService(user.id, updates, imageFile);
      setVendor(data);
      saveToCache({
        profile: data,
        ttl: CACHE_TTL
      });
      console.log('[VendorContext] Vendor profile updated:', data);
      return;
    } catch (error) {
      console.error('[VendorContext] Error updating vendor profile:', error);
      throw error;
    }
  }, [user?.id, saveToCache]);

  // Only call the service, do not handle Cloudinary logic here
  const createVendorProfile = useCallback(async (profile: CreateVendorProfileInput, imageFile?: File) => {
    console.log('[VendorContext] createVendorProfile called', profile, imageFile);
    if (!user?.id) throw new Error('No user ID available');
    try {
      const data = await createVendorProfileService(user.id, profile, imageFile);
      setVendor(data);
      saveToCache({
        profile: data,
        ttl: CACHE_TTL
      });
      console.log('[VendorContext] Vendor profile created:', data);
    } catch (error) {
      console.error('[VendorContext] Error creating vendor profile:', error);
      throw error;
    }
  }, [user?.id, saveToCache]);

  const signOut = async () => {
    clearCache();
    await authSignOut();
    console.log('[VendorContext] Signed out');
  };

  // Initialize vendor state when auth state changes
  useEffect(() => {
    console.log('[VendorContext] useEffect for auth state change', { isAuthenticated, user });
    setRestoring(true);
    if (!isAuthenticated) {
      setVendor(null);
      clearCache();
      setLoading(false);
      setRestoring(false);
      return;
    }
    if (user?.id) {
      const cached = loadFromCache();
      if (cached) {
        setVendor(cached.profile as VendorProfile);
        setLoading(false);
        setRestoring(false);
        console.log('[VendorContext] Used cached vendor profile');
        loadVendor();
        return;
      }
      loadVendor().finally(() => setRestoring(false));
    } else {
      setRestoring(false);
    }
  }, [isAuthenticated, user?.id, loadVendor, loadFromCache, clearCache]);

  const value = {
    user,
    vendor,
    loading,
    restoring,
    error,
    refreshVendor: () => loadVendor(),
    updateVendorProfile,
    getVendorProfile,
    createVendorProfile,
    clearCache,
    signOut
  };

  return (
    <VendorContext.Provider value={value}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
}
