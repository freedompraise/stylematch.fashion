// src/stores/vendorStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import {
  getVendorProfile as getVendorProfileService,
  updateVendorProfile as updateVendorProfileService,
  createVendorProfile as createVendorProfileService
} from '@/services/vendorProfileService';
import { vendorDataService, VendorStats, ProductWithSales } from '@/services/vendorDataService';
import { VendorProfile, CreateVendorProfileInput } from '@/types';
import { Product, CreateProductInput } from '@/types/ProductSchema';
import { Order } from '@/types/OrderSchema';

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
  profile: VendorProfile;
  timestamp: number;
  routeAccessed: string;
}

interface VendorState {
  // State
  vendor: VendorProfile | null;
  loading: boolean;
  error: Error | null;
  
  // Vendor business data
  products: Product[];
  orders: Order[];
  productsLoaded: boolean;
  ordersLoaded: boolean;
  
  // Onboarding state
  onboardingState: OnboardingState;
  
  // Cache state (persisted)
  vendorCache: VendorCache | null;
  lastVendorPath: string | null;
  
  // Actions
  setVendor: (vendor: VendorProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  loadVendorForRoute: (userId: string, route: string) => Promise<VendorProfile | null>;
  updateVendorProfile: (updates: Partial<VendorProfile>, imageFile?: File) => Promise<void>;
  createVendorProfile: (profile: CreateVendorProfileInput, imageFile?: File) => Promise<void>;
  clearVendorData: () => void;
  signOut: () => Promise<void>;
  storeLastVendorPath: (path: string) => void;
  getLastVendorPath: () => string | null;
  
  // Product actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setProductsLoaded: (loaded: boolean) => void;
  fetchProducts: (useCache?: boolean) => Promise<Product[]>;
  createProduct: (productData: CreateProductInput) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Order actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  removeOrder: (id: string) => void;
  setOrdersLoaded: (loaded: boolean) => void;
  fetchOrders: (useCache?: boolean) => Promise<Order[]>;
  deleteOrder: (orderId: string) => Promise<void>;
  
  // Stats and analytics
  calculateVendorStats: (products: Product[], orders: Order[]) => VendorStats;
  getTopProducts: (products: Product[], orders: Order[]) => ProductWithSales[];
  
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
      vendor: null,
      loading: false,
      error: null,
      products: [],
      orders: [],
      productsLoaded: false,
      ordersLoaded: false,
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
      setVendor: (vendor: VendorProfile | null) => {
        set({ vendor, error: null });
        console.log('[VendorStore] Vendor set:', vendor?.store_name);
      },
      
      setLoading: (loading: boolean) => {
        set({ loading });
      },
      
      setError: (error: Error | null) => {
        set({ error });
        console.error('[VendorStore] Error set:', error?.message);
      },
      
      loadVendorForRoute: async (userId: string, route: string) => {
        const { vendorCache } = get();
        
        // Check cache first
        if (vendorCache && 
            vendorCache.routeAccessed === route && 
            Date.now() - vendorCache.timestamp < CACHE_TTL) {
          set({ vendor: vendorCache.profile, error: null });
          console.log('[VendorStore] Using cached vendor data for route:', route);
          return vendorCache.profile;
        }
        
        set({ loading: true, error: null });
        console.log('[VendorStore] Loading vendor for route:', route);
        
        try {
          const data = await getVendorProfileService(userId);
          if (data) {
            set({ vendor: data, loading: false, error: null });
            
            // Cache with route info
            const cacheData: VendorCache = {
              profile: data,
              timestamp: Date.now(),
              routeAccessed: route
            };
            set({ vendorCache: cacheData });
            console.log('[VendorStore] Vendor loaded and cached for route:', route);
            return data;
          } else {
            set({ vendor: null, loading: false, error: null });
            console.log('[VendorStore] No vendor found for user');
            return null;
          }
        } catch (err) {
          console.error('[VendorStore] Vendor load failed:', err);
          const error = err instanceof Error ? err : new Error('Failed to load vendor');
          set({ error, loading: false });
          return null;
        }
      },
      
      updateVendorProfile: async (updates: Partial<VendorProfile>, imageFile?: File) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        const updated = await updateVendorProfileService(vendor.user_id, updates, imageFile);
        set({ vendor: updated, error: null });
        
        // Update cache
        const cacheData: VendorCache = {
          profile: updated,
          timestamp: Date.now(),
          routeAccessed: get().vendorCache?.routeAccessed || 'unknown'
        };
        set({ vendorCache: cacheData });
        console.log('[VendorStore] Vendor updated:', updated);
      },
      
      createVendorProfile: async (profile: CreateVendorProfileInput, imageFile?: File) => {
        const { vendorCache } = get();
        const userId = vendorCache?.profile.user_id;
        if (!userId) throw new Error('No user ID');
        
        const created = await createVendorProfileService(userId, profile, imageFile);
        set({ vendor: created, error: null });
        
        // Cache with current route
        const cacheData: VendorCache = {
          profile: created,
          timestamp: Date.now(),
          routeAccessed: get().vendorCache?.routeAccessed || 'onboarding'
        };
        set({ vendorCache: cacheData });
        console.log('[VendorStore] Vendor created:', created);
      },
      
      clearVendorData: () => {
        set({ 
          vendor: null, 
          error: null, 
          loading: false,
          products: [],
          orders: [],
          productsLoaded: false,
          ordersLoaded: false,
          vendorCache: null 
        });
        console.log('[VendorStore] Vendor data cleared');
      },
      
      signOut: async () => {
        get().clearVendorData();
        set({ 
          vendor: null, 
          error: null, 
          loading: false,
          lastVendorPath: null
        });
        console.log('[VendorStore] Signed out');
      },
      
      storeLastVendorPath: (path: string) => {
        set({ lastVendorPath: path });
        console.log('[VendorStore] Stored last vendor path:', path);
      },
      
      getLastVendorPath: () => {
        return get().lastVendorPath;
      },
      
      // Product actions
      setProducts: (products: Product[]) => {
        set({ products });
      },
      
      addProduct: (product: Product) => {
        set((state) => ({ products: [product, ...state.products] }));
      },
      
      updateProduct: (id: string, updates: Partial<Product>) => {
        set((state) => ({
          products: state.products.map(p => (p.id === id ? { ...p, ...updates } : p))
        }));
      },
      
      removeProduct: (id: string) => {
        set((state) => ({ products: state.products.filter(p => p.id !== id) }));
      },
      
      setProductsLoaded: (loaded: boolean) => {
        set({ productsLoaded: loaded });
      },

      fetchProducts: async (useCache: boolean = true) => {
        const { vendor, products } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const fetchedProducts = await vendorDataService.fetchProducts(
            vendor.user_id, 
            useCache, 
            products
          );
          set({ products: fetchedProducts, productsLoaded: true });
          return fetchedProducts;
        } catch (error) {
          console.error('[VendorStore] Error fetching products:', error);
          throw error;
        }
      },

      createProduct: async (productData: CreateProductInput) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const createdProduct = await vendorDataService.createProduct(productData, vendor.user_id);
          set((state) => ({ products: [createdProduct, ...state.products] }));
          return createdProduct;
        } catch (error) {
          console.error('[VendorStore] Error creating product:', error);
          throw error;
        }
      },

      deleteProduct: async (productId: string) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          await vendorDataService.deleteProduct(productId, vendor.user_id);
          set((state) => ({ products: state.products.filter(p => p.id !== productId) }));
        } catch (error) {
          console.error('[VendorStore] Error deleting product:', error);
          throw error;
        }
      },
      
      // Order actions
      setOrders: (orders: Order[]) => {
        set({ orders });
      },
      
      addOrder: (order: Order) => {
        set((state) => ({ orders: [order, ...state.orders] }));
      },
      
      updateOrder: (id: string, updates: Partial<Order>) => {
        set((state) => ({
          orders: state.orders.map(o => (o.id === id ? { ...o, ...updates } : o))
        }));
      },
      
      removeOrder: (id: string) => {
        set((state) => ({ orders: state.orders.filter(o => o.id !== id) }));
      },
      
      setOrdersLoaded: (loaded: boolean) => {
        set({ ordersLoaded: loaded });
      },

      fetchOrders: async (useCache: boolean = true) => {
        const { vendor, orders } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const fetchedOrders = await vendorDataService.fetchOrders(
            vendor.user_id, 
            useCache, 
            orders
          );
          set({ orders: fetchedOrders, ordersLoaded: true });
          return fetchedOrders;
        } catch (error) {
          console.error('[VendorStore] Error fetching orders:', error);
          throw error;
        }
      },

      deleteOrder: async (orderId: string) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          await vendorDataService.deleteOrder(orderId, vendor.user_id);
          set((state) => ({ orders: state.orders.filter(o => o.id !== orderId) }));
        } catch (error) {
          console.error('[VendorStore] Error deleting order:', error);
          throw error;
        }
      },
      
      // Stats and analytics
      calculateVendorStats: (products: Product[], orders: Order[]): VendorStats => {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const lowStockProducts = products.filter(p => p.stock_quantity <= 5).length;
        
        const recentOrders = orders
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10);

        return {
          totalRevenue,
          totalOrders,
          recentOrders,
          averageOrderValue,
          lowStockProducts
        };
      },

      getTopProducts: (products: Product[], orders: Order[]): ProductWithSales[] => {
        return products
          .map(product => ({
            ...product,
            sales: orders.filter(order => order.product_id === product.id).length
          }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);
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
        set((state) => ({
            onboardingState: {
              ...state.onboardingState,
            steps: state.onboardingState.steps.map(step =>
              step.id === stepId ? { ...step, completed: true } : step
            )
          }
        }));
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
        lastVendorPath: state.lastVendorPath
      }),
    }
  )
);
