// src/stores/vendorStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import {
  getVendorProfile as getVendorProfileService,
  updateVendorProfile as updateVendorProfileService,
  createVendorProfile as createVendorProfileService
} from '@/services/vendorProfileService';
import { VendorProfile, CreateVendorProfileInput } from '@/types';

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  order: number;
}

interface OnboardingState {
  currentStep: number;
  steps: OnboardingStep[];
  isComplete: boolean;
  startedAt: number | null;
  completedAt: number | null;
}

interface VendorCache {
  profile: Partial<VendorProfile>;
  timestamp: number;
  ttl: number;
}

interface VendorState {
  // State
  user: User | null;
  vendor: VendorProfile | null;
  loading: boolean;
  error: Error | null;
  ready: boolean; // hydration complete
  
  // Onboarding state
  onboardingState: OnboardingState;
  
  // Cache state (persisted)
  vendorCache: VendorCache | null;
  lastVendorPath: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setVendor: (vendor: VendorProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setReady: (ready: boolean) => void;
  refreshVendor: () => Promise<VendorProfile | void>;
  updateVendorProfile: (updates: Partial<VendorProfile>, imageFile?: File) => Promise<void>;
  getVendorProfile: (force?: boolean) => Promise<VendorProfile | null>;
  createVendorProfile: (profile: CreateVendorProfileInput, imageFile?: File) => Promise<void>;
  clearCache: () => void;
  signOut: () => Promise<void>;
  storeLastVendorPath: (path: string) => void;
  getLastVendorPath: () => string | null;
  
  // Onboarding actions
  initializeOnboarding: () => void;
  completeOnboardingStep: (stepId: string) => void;
  setOnboardingStep: (stepNumber: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  getCurrentOnboardingStep: () => OnboardingStep | null;
  getNextOnboardingStep: () => OnboardingStep | null;
  getPreviousOnboardingStep: () => OnboardingStep | null;
  isOnboardingStepComplete: (stepId: string) => boolean;
  getOnboardingProgress: () => number;
}

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

const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Basic Profile',
    description: 'Set up your basic vendor profile information',
    completed: false,
    required: true,
    order: 1
  },
  {
    id: 'store',
    title: 'Store Details',
    description: 'Configure your store settings and branding',
    completed: false,
    required: true,
    order: 2
  },
  {
    id: 'verification',
    title: 'Identity Verification',
    description: 'Verify your identity to start selling',
    completed: false,
    required: true,
    order: 3
  },
  {
    id: 'payout',
    title: 'Payout Setup',
    description: 'Set up your payout information',
    completed: false,
    required: true,
    order: 4
  },
  {
    id: 'products',
    title: 'Add Products',
    description: 'Add your first products to start selling',
    completed: false,
    required: false,
    order: 5
  }
];

export const useVendorStore = create<VendorState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      vendor: null,
      loading: true,
      error: null,
      ready: false,
      onboardingState: {
        currentStep: 1,
        steps: defaultOnboardingSteps,
        isComplete: false,
        startedAt: null,
        completedAt: null
      },
      vendorCache: null,
      lastVendorPath: null,
      
      // Actions
      setUser: (user: User | null) => set({ user }),
      setVendor: (vendor: VendorProfile | null) => set({ vendor }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: Error | null) => set({ error }),
      setReady: (ready: boolean) => set({ ready }),
      
      storeLastVendorPath: (path: string) => {
        set({ lastVendorPath: path });
        console.log('[VendorStore] Stored last vendor path:', path);
      },
      
      getLastVendorPath: () => {
        return get().lastVendorPath;
      },
      
      refreshVendor: async () => {
        const { user } = get();
        if (!user?.id) return;
        
        console.log('[VendorStore] Fetching vendor from DB...');
        try {
          const data = await getVendorProfileService(user.id);
          if (data) {
            set({ vendor: data, error: null });
            // Save to cache
            const cacheData: VendorCache = {
              profile: getCacheSafeVendorProfile(data),
              timestamp: Date.now(),
              ttl: CACHE_TTL
            };
            set({ vendorCache: cacheData });
            console.log('[VendorStore] Vendor fetched and saved:', data);
            return data;
          } else {
            set({ vendor: null });
            console.log('[VendorStore] No vendor found for user');
            return null;
          }
        } catch (err) {
          console.error('[VendorStore] Vendor fetch failed:', err);
          const error = err instanceof Error ? err : new Error('Failed to fetch vendor');
          set({ error });
          return null;
        }
      },
      
      updateVendorProfile: async (updates: Partial<VendorProfile>, imageFile?: File) => {
        const { user } = get();
        if (!user?.id) throw new Error('No user ID');
        
        const updated = await updateVendorProfileService(user.id, updates, imageFile);
        set({ vendor: updated, error: null });
        
        // Save to cache
        const cacheData: VendorCache = {
          profile: getCacheSafeVendorProfile(updated),
          timestamp: Date.now(),
          ttl: CACHE_TTL
        };
        set({ vendorCache: cacheData });
        console.log('[VendorStore] Vendor updated:', updated);
      },
      
      getVendorProfile: async (force = false) => {
        const { user, vendor } = get();
        if (!user?.id) return null;
        
        if (!force && vendor) return vendor;
        
        const result = await get().refreshVendor();
        return result || null;
      },
      
      createVendorProfile: async (profile: CreateVendorProfileInput, imageFile?: File) => {
        const { user } = get();
        if (!user?.id) throw new Error('No user ID');
        
        const created = await createVendorProfileService(user.id, profile, imageFile);
        set({ vendor: created, error: null });
        
        // Save to cache
        const cacheData: VendorCache = {
          profile: getCacheSafeVendorProfile(created),
          timestamp: Date.now(),
          ttl: CACHE_TTL
        };
        set({ vendorCache: cacheData });
        console.log('[VendorStore] Vendor created:', created);
      },
      
      clearCache: () => {
        set({ vendorCache: null, vendor: null });
        console.log('[VendorStore] Cache cleared');
      },
      
      signOut: async () => {
        get().clearCache();
        set({ 
          user: null, 
          vendor: null, 
          error: null, 
          ready: false,
          lastVendorPath: null
        });
        console.log('[VendorStore] Signed out');
      },
      
      // Onboarding actions
      initializeOnboarding: () => {
        set((state) => ({
          onboardingState: {
            ...state.onboardingState,
            startedAt: Date.now(),
            currentStep: 1
          }
        }));
      },
      
      completeOnboardingStep: (stepId: string) => {
        set((state) => {
          const updatedSteps = state.onboardingState.steps.map(step =>
            step.id === stepId ? { ...step, completed: true } : step
          );
          
          const isComplete = updatedSteps.every(step => step.completed);
          
          return {
            onboardingState: {
              ...state.onboardingState,
              steps: updatedSteps,
              isComplete,
              completedAt: isComplete ? Date.now() : state.onboardingState.completedAt
            }
          };
        });
      },
      
      setOnboardingStep: (stepNumber: number) => {
        set((state) => ({
          onboardingState: {
            ...state.onboardingState,
            currentStep: stepNumber
          }
        }));
      },
      
      completeOnboarding: () => {
        set((state) => ({
          onboardingState: {
            ...state.onboardingState,
            isComplete: true,
            completedAt: Date.now()
          }
        }));
      },
      
      resetOnboarding: () => {
        set({
          onboardingState: {
            currentStep: 1,
            steps: defaultOnboardingSteps,
            isComplete: false,
            startedAt: null,
            completedAt: null
          }
        });
      },
      
      getCurrentOnboardingStep: () => {
        const { onboardingState } = get();
        return onboardingState.steps.find(step => step.order === onboardingState.currentStep) || null;
      },
      
      getNextOnboardingStep: () => {
        const { onboardingState } = get();
        const nextStep = onboardingState.steps.find(step => step.order === onboardingState.currentStep + 1);
        return nextStep || null;
      },
      
      getPreviousOnboardingStep: () => {
        const { onboardingState } = get();
        const prevStep = onboardingState.steps.find(step => step.order === onboardingState.currentStep - 1);
        return prevStep || null;
      },
      
      isOnboardingStepComplete: (stepId: string) => {
        const { onboardingState } = get();
        const step = onboardingState.steps.find(s => s.id === stepId);
        return step?.completed || false;
      },
      
      getOnboardingProgress: () => {
        const { onboardingState } = get();
        const completedSteps = onboardingState.steps.filter(step => step.completed).length;
        return Math.round((completedSteps / onboardingState.steps.length) * 100);
      },
    }),
    {
      name: 'vendor-storage',
      partialize: (state) => ({ 
        onboardingState: state.onboardingState,
        vendorCache: state.vendorCache,
        lastVendorPath: state.lastVendorPath,
        ready: state.ready
      }),
    }
  )
);

// Initialize vendor state
export const initializeVendor = async (user: User | null) => {
  const { setUser, setLoading, setReady, vendorCache } = useVendorStore.getState();
  
  setLoading(true);
  setReady(false);
  setUser(user);
  
  if (!user?.id) {
    setLoading(false);
    setReady(true);
    return;
  }
  
  // Check cache
  if (vendorCache && Date.now() - vendorCache.timestamp < vendorCache.ttl) {
    const cachedVendor = vendorCache.profile as VendorProfile;
    if (cachedVendor.verification_status === 'verified') {
      useVendorStore.getState().setVendor(cachedVendor);
      setLoading(false);
      setReady(true);
      return;
    }
  }
  
  // If not verified or no cache, fetch from DB
  await useVendorStore.getState().refreshVendor();
  setLoading(false);
  setReady(true);
};
