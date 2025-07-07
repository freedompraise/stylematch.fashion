// VendorContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  getVendorProfile as getVendorProfileService,
  updateVendorProfile as updateVendorProfileService,
  createVendorProfile as createVendorProfileService
} from '@/services/vendorProfileService';
import { VendorProfile, CreateVendorProfileInput } from '@/types';
import { User } from '@supabase/supabase-js';

interface VendorContextType {
  user: User | null;
  vendor: VendorProfile | null;
  loading: boolean;
  error: Error | null;
  refreshVendor: () => Promise<VendorProfile | void>;
  updateVendorProfile: (updates: Partial<VendorProfile>, imageFile?: File) => Promise<void>;
  getVendorProfile: (force?: boolean) => Promise<VendorProfile | null>;
  createVendorProfile: (profile: CreateVendorProfileInput, imageFile?: File) => Promise<void>;
  clearCache: () => void;
  signOut: () => Promise<void>;
  ready: boolean; // hydration complete
}

const CACHE_TTL = 1000 * 60 * 5;
const VENDOR_CACHE_KEY = 'vendor_cache';
const LAST_VENDOR_PATH_KEY = 'last_vendor_path';

const VendorContext = createContext<VendorContextType | undefined>(undefined);

function getCacheSafeVendorProfile(profile: VendorProfile): Partial<VendorProfile> {
  const {
    user_id, store_name, name, bio, instagram_url, facebook_url,
    wabusiness_url, banner_image_url, verification_status,
    isOnboarded, onboarding_step, last_session_refresh, auth_metadata
  } = profile;
  return {
    user_id, store_name, name, bio, instagram_url, facebook_url,
    wabusiness_url, banner_image_url, verification_status,
    isOnboarded, onboarding_step, last_session_refresh, auth_metadata
  };
}

function storeLastVendorPath(path: string) {
  localStorage.setItem(LAST_VENDOR_PATH_KEY, path);
  console.log('[VendorContext] Stored last vendor path:', path);
}

function getLastVendorPath(): string | null {
  return localStorage.getItem(LAST_VENDOR_PATH_KEY);
}

function hydrateVendorFromCache(): VendorProfile | null {
  try {
    const raw = localStorage.getItem(VENDOR_CACHE_KEY);
    if (!raw) return null;
    const { profile, timestamp, ttl } = JSON.parse(raw);
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(VENDOR_CACHE_KEY);
      console.log('[VendorContext] Cache expired');
      return null;
    }
    console.log('[VendorContext] Hydrated from cache:', profile);
    return profile as VendorProfile;
  } catch (err) {
    console.error('[VendorContext] Error hydrating cache:', err);
    return null;
  }
}

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboardingRoute = location.pathname.startsWith('/vendor/onboarding');
  const isVendorRoute = location.pathname.startsWith('/vendor/');
  const { user, isAuthenticated, signOut: authSignOut } = useAuth();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [ready, setReady] = useState(false); // for RequireVendor

  // Store last vendor path on vendor route navigation
  useEffect(() => {
    if (vendor && vendor.verification_status === 'verified' && isVendorRoute && !isOnboardingRoute) {
      storeLastVendorPath(location.pathname);
    }
  }, [location.pathname, vendor, isVendorRoute, isOnboardingRoute]);

  const saveToCache = useCallback((profile: VendorProfile) => {
    const cacheData = {
      profile: getCacheSafeVendorProfile(profile),
      timestamp: Date.now(),
      ttl: CACHE_TTL
    };
    try {
      localStorage.setItem(VENDOR_CACHE_KEY, JSON.stringify(cacheData));
      console.log('[VendorContext] Saved to cache:', cacheData);
    } catch (err) {
      console.error('[VendorContext] Error saving cache:', err);
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(VENDOR_CACHE_KEY);
    setVendor(null);
    console.log('[VendorContext] Cache cleared');
  }, []);

  const fetchVendorFromDB = useCallback(async () => {
    if (!user?.id) return null;
    console.log('[VendorContext] Fetching vendor from DB...');
    try {
      const data = await getVendorProfileService(user.id);
      if (data) {
        setVendor(data);
        saveToCache(data);
        console.log('[VendorContext] Vendor fetched and saved:', data);
        return data;
      } else {
        setVendor(null);
        console.log('[VendorContext] No vendor found for user');
        return null;
      }
    } catch (err) {
      console.error('[VendorContext] Vendor fetch failed:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch vendor'));
      return null;
    }
  }, [user?.id, saveToCache]);

  // Main hydration effect
  useEffect(() => {
    setLoading(true);
    setReady(false);
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      setReady(true);
      return;
    }
    const cached = hydrateVendorFromCache();
    if (cached && cached.verification_status === 'verified') {
      setVendor(cached);
      setLoading(false);
      setReady(true);
      // If on onboarding, restore last vendor path
      if (isOnboardingRoute) {
        const lastPath = getLastVendorPath();
        if (lastPath && lastPath !== '/vendor/onboarding') {
          console.log('[VendorContext] Restoring last vendor path:', lastPath);
          navigate(lastPath, { replace: true });
        } else {
          navigate('/vendor/dashboard', { replace: true });
        }
      }
      return;
    }
    // If not verified or no cache, fetch from DB
    fetchVendorFromDB().then((fetched) => {
      setLoading(false);
      setReady(true);
      // If on onboarding and vendor is verified, always restore last path or dashboard
      if (isOnboardingRoute && fetched && fetched.verification_status === 'verified') {
        const lastPath = getLastVendorPath();
        if (lastPath && lastPath !== '/vendor/onboarding') {
          console.log('[VendorContext] (DB) Restoring last vendor path:', lastPath);
          navigate(lastPath, { replace: true });
        } else {
          navigate('/vendor/dashboard', { replace: true });
        }
        return;
      }
      // Fallback: if vendor is deleted mid-session
      if (!fetched && isVendorRoute && !isOnboardingRoute) {
        console.log('[VendorContext] Vendor missing mid-session, redirecting to onboarding');
        navigate('/vendor/onboarding', { replace: true });
      }
    });
  }, [isAuthenticated, user?.id, isOnboardingRoute]);

  const updateVendorProfile = useCallback(async (updates: Partial<VendorProfile>, imageFile?: File) => {
    if (!user?.id) throw new Error('No user ID');
    const updated = await updateVendorProfileService(user.id, updates, imageFile);
    setVendor(updated);
    saveToCache(updated);
    console.log('[VendorContext] Vendor updated:', updated);
  }, [user?.id, saveToCache]);

  const createVendorProfile = useCallback(async (profile: CreateVendorProfileInput, imageFile?: File) => {
    if (!user?.id) throw new Error('No user ID');
    const created = await createVendorProfileService(user.id, profile, imageFile);
    setVendor(created);
    saveToCache(created);
    console.log('[VendorContext] Vendor created:', created);
  }, [user?.id, saveToCache]);

  const signOut = async () => {
    clearCache();
    await authSignOut();
    console.log('[VendorContext] Signed out');
  };

  return (
    <VendorContext.Provider value={{
      user,
      vendor,
      loading,
      error,
      refreshVendor: fetchVendorFromDB,
      updateVendorProfile,
      getVendorProfile: fetchVendorFromDB,
      createVendorProfile,
      clearCache,
      signOut,
      ready
    }}>
      {children}
    </VendorContext.Provider>
  );
};

export function useVendor() {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error('useVendor must be used within a VendorProvider');
  return ctx;
}
