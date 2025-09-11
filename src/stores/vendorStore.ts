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
import {
  ProductVariant,
  ProductAttribute,
  AttributeConfiguration,
  ColorPalette,
  ExtendedCategory,
  CreateProductVariantRequest,
  UpdateProductVariantRequest,
  CreateProductAttributeRequest,
  BulkUpdateVariantsRequest,
  ProductWithVariants,
} from '@/types/VariantSchema';

const CACHE_TTL = 1000 * 60 * 500 //  5 hours

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
  
  // Variant system state
  productVariants: Record<string, ProductVariant[]>; // productId -> variants
  productAttributes: Record<string, ProductAttribute[]>; // productId -> attributes
  attributeConfigurations: Record<string, AttributeConfiguration[]>; // category -> configs
  colorPalettes: ColorPalette[];
  extendedCategories: ExtendedCategory[];
  variantsLoaded: boolean;
  configurationsLoaded: boolean;
  
  // Configuration cache timestamps
  configurationsCacheTimestamp: number;
  colorPalettesCacheTimestamp: number;
  extendedCategoriesCacheTimestamp: number;
  
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
  createVendorProfile: (userId: string, profile: CreateVendorProfileInput, imageFile?: File) => Promise<void>;
  clearVendorData: () => void;
  signOut: () => Promise<void>;
  storeLastVendorPath: (path: string) => void;
  getLastVendorPath: () => string | null;
  
  // Product actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>, imageFile?: File, currentProduct?: Product, removeImage?: boolean) => Promise<Product>;
  removeProduct: (id: string) => void;
  setProductsLoaded: (loaded: boolean) => void;
  fetchProducts: (useCache?: boolean) => Promise<Product[]>;
  createProduct: (
    productData: CreateProductInput,
    imageFile?: File
  ) => Promise<Product>;
  createProductWithVariants: (
    productData: CreateProductInput,
    variantsData: CreateProductVariantRequest[],
    imageFile?: File
  ) => Promise<{ product: Product; variants: ProductVariant[] }>;
  deleteProduct: (product: Product) => Promise<void>;
  softDeleteProduct: (productId: string, reason?: string, product?: Product) => Promise<void>;
  
  // Variant management actions
  fetchProductVariants: (productId: string, useCache?: boolean) => Promise<void>;
  createProductVariant: (variantData: CreateProductVariantRequest) => Promise<void>;
  createProductVariants: (variantsData: CreateProductVariantRequest[]) => Promise<void>;
  updateProductVariant: (variantId: string, updates: UpdateProductVariantRequest) => Promise<void>;
  deleteProductVariant: (variantId: string, productId: string) => Promise<void>;
  bulkUpdateVariants: (updates: BulkUpdateVariantsRequest) => Promise<void>;
  
  // Attribute management actions
  fetchProductAttributes: (productId: string) => Promise<void>;
  createProductAttribute: (attributeData: CreateProductAttributeRequest) => Promise<void>;
  updateProductAttribute: (attributeId: string, updates: Partial<ProductAttribute>) => Promise<void>;
  deleteProductAttribute: (attributeId: string, productId: string) => Promise<void>;
  
  // Configuration actions
  fetchAttributeConfigurations: (category: string, useCache?: boolean) => Promise<void>;
  fetchColorPalettes: (useCache?: boolean) => Promise<void>;
  fetchExtendedCategories: (useCache?: boolean) => Promise<void>;
  
  // Order actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
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
      
      // Variant system state
      productVariants: {},
      productAttributes: {},
      attributeConfigurations: {},
      colorPalettes: [],
      extendedCategories: [],
      variantsLoaded: false,
      configurationsLoaded: false,
      
      // Configuration cache timestamps
      configurationsCacheTimestamp: 0,
      colorPalettesCacheTimestamp: 0,
      extendedCategoriesCacheTimestamp: 0,
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
      
      createVendorProfile: async (userId: string, profile: CreateVendorProfileInput, imageFile?: File) => {
        const created = await createVendorProfileService(userId, profile, imageFile);
        set({ vendor: created, error: null });
        
        const cacheData: VendorCache = {
          profile: created,
          timestamp: Date.now(),
          routeAccessed: 'onboarding'
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
      
      updateProduct: async (id: string, updates: Partial<Product>, imageFile?: File, currentProduct?: Product, removeImage?: boolean) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        const updatedProduct = await vendorDataService.updateProduct(id, updates, vendor.user_id, imageFile, currentProduct, removeImage);
        set((state) => ({
          products: state.products.map(p => (p.id === id ? updatedProduct : p))
        }));
        return updatedProduct;
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

      createProduct: async (
        productData: CreateProductInput,
        imageFile?: File
      ) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const createdProduct = await vendorDataService.createProduct(
            productData,
            vendor.user_id,
            imageFile
          );
          set((state) => ({ products: [createdProduct, ...state.products] }));
          return createdProduct;
        } catch (error) {
          console.error('[VendorStore] Error creating product:', error);
          throw error;
        }
      },

      createProductWithVariants: async (
        productData: CreateProductInput,
        variantsData: CreateProductVariantRequest[],
        imageFile?: File
      ) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const { product, variants } = await vendorDataService.createProductWithVariants(
            productData,
            variantsData,
            vendor.user_id,
            imageFile
          );
          
          set((state) => ({
            products: [product, ...state.products],
            productVariants: {
              ...state.productVariants,
              [product.id]: variants
            }
          }));
          
          return { product, variants };
        } catch (error) {
          console.error('[VendorStore] Error creating product with variants:', error);
          throw error;
        }
      },

      deleteProduct: async (product: Product) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          await vendorDataService.deleteProduct(product, vendor.user_id);
          // The local state update is now handled optimistically in the component
        } catch (error) {
          console.error('[VendorStore] Error deleting product:', error);
          throw error;
        }
      },

      softDeleteProduct: async (productId: string, reason?: string, product?: Product) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          await vendorDataService.softDeleteProduct({ productId, reason }, vendor.user_id, product);
          set((state) => ({
            products: state.products.filter((p) => p.id !== productId),
          }));
        } catch (error) {
          console.error('[VendorStore] Error soft deleting product:', error);
          throw error;
        }
      },
      
      // Variant management actions
      fetchProductVariants: async (productId: string, useCache: boolean = true) => {
        const { vendor, productVariants } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const cachedVariants = productVariants[productId] || [];
          const variants = await vendorDataService.fetchProductVariants(productId, useCache, cachedVariants);
          set((state) => ({
            productVariants: {
              ...state.productVariants,
              [productId]: variants
            }
          }));
        } catch (error) {
          console.error('[VendorStore] Error fetching product variants:', error);
          throw error;
        }
      },
      
      createProductVariant: async (variantData: CreateProductVariantRequest) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const variant = await vendorDataService.createProductVariant(variantData);
          set((state) => ({
            productVariants: {
              ...state.productVariants,
              [variantData.product_id]: [
                ...(state.productVariants[variantData.product_id] || []),
                variant
              ]
            }
          }));
          
          // Update product totals
          await vendorDataService.updateProductTotals(variantData.product_id);
        } catch (error) {
          console.error('[VendorStore] Error creating product variant:', error);
          throw error;
        }
      },

      createProductVariants: async (variantsData: CreateProductVariantRequest[]) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const variants = await vendorDataService.createProductVariants(variantsData);
          
          // Group variants by product_id
          const variantsByProduct = variants.reduce((acc, variant) => {
            if (!acc[variant.product_id]) {
              acc[variant.product_id] = [];
            }
            acc[variant.product_id].push(variant);
            return acc;
          }, {} as Record<string, ProductVariant[]>);
          
          set((state) => {
            const newProductVariants = { ...state.productVariants };
            
            Object.entries(variantsByProduct).forEach(([productId, productVariants]) => {
              newProductVariants[productId] = [
                ...(newProductVariants[productId] || []),
                ...productVariants
              ];
            });
            
            return { productVariants: newProductVariants };
          });
          
          // Update product totals for all affected products
          const productIds = new Set(variants.map(v => v.product_id));
          await Promise.all(Array.from(productIds).map(id => vendorDataService.updateProductTotals(id)));
        } catch (error) {
          console.error('[VendorStore] Error creating product variants:', error);
          throw error;
        }
      },
      
      updateProductVariant: async (variantId: string, updates: UpdateProductVariantRequest) => {
        const { vendor, productVariants } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const updatedVariant = await vendorDataService.updateProductVariant(variantId, updates);
          
          // Find which product this variant belongs to
          let productId: string | null = null;
          for (const [pid, variants] of Object.entries(productVariants)) {
            if (variants.some(v => v.id === variantId)) {
              productId = pid;
              break;
            }
          }
          
          if (productId) {
            set((state) => ({
              productVariants: {
                ...state.productVariants,
                [productId]: state.productVariants[productId].map(v => 
                  v.id === variantId ? updatedVariant : v
                )
              }
            }));
            
            // Update product totals
            await vendorDataService.updateProductTotals(productId);
          }
        } catch (error) {
          console.error('[VendorStore] Error updating product variant:', error);
          throw error;
        }
      },
      
      deleteProductVariant: async (variantId: string, productId: string) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          await vendorDataService.deleteProductVariant(variantId);
          set((state) => ({
            productVariants: {
              ...state.productVariants,
              [productId]: state.productVariants[productId]?.filter(v => v.id !== variantId) || []
            }
          }));
          
          // Update product totals
          await vendorDataService.updateProductTotals(productId);
        } catch (error) {
          console.error('[VendorStore] Error deleting product variant:', error);
          throw error;
        }
      },
      
      bulkUpdateVariants: async (updates: BulkUpdateVariantsRequest) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const updatedVariants = await vendorDataService.bulkUpdateVariants(updates);
          
          // Update state with all updated variants
          set((state) => {
            const newProductVariants = { ...state.productVariants };
            
            updatedVariants.forEach(variant => {
              // Find which product this variant belongs to
              for (const [productId, variants] of Object.entries(newProductVariants)) {
                const variantIndex = variants.findIndex(v => v.id === variant.id);
                if (variantIndex !== -1) {
                  newProductVariants[productId][variantIndex] = variant;
                  break;
                }
              }
            });
            
            return { productVariants: newProductVariants };
          });
          
          // Update product totals for all affected products
          const productIds = new Set(updatedVariants.map(v => v.product_id));
          await Promise.all(Array.from(productIds).map(id => vendorDataService.updateProductTotals(id)));
        } catch (error) {
          console.error('[VendorStore] Error bulk updating variants:', error);
          throw error;
        }
      },
      
      // Attribute management actions
      fetchProductAttributes: async (productId: string) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const attributes = await vendorDataService.fetchProductAttributes(productId);
          set((state) => ({
            productAttributes: {
              ...state.productAttributes,
              [productId]: attributes
            }
          }));
        } catch (error) {
          console.error('[VendorStore] Error fetching product attributes:', error);
          throw error;
        }
      },
      
      createProductAttribute: async (attributeData: CreateProductAttributeRequest) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const attribute = await vendorDataService.createProductAttribute(attributeData);
          set((state) => ({
            productAttributes: {
              ...state.productAttributes,
              [attributeData.product_id]: [
                ...(state.productAttributes[attributeData.product_id] || []),
                attribute
              ]
            }
          }));
        } catch (error) {
          console.error('[VendorStore] Error creating product attribute:', error);
          throw error;
        }
      },
      
      updateProductAttribute: async (attributeId: string, updates: Partial<ProductAttribute>) => {
        const { vendor, productAttributes } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          const updatedAttribute = await vendorDataService.updateProductAttribute(attributeId, updates);
          
          // Find which product this attribute belongs to
          let productId: string | null = null;
          for (const [pid, attributes] of Object.entries(productAttributes)) {
            if (attributes.some(a => a.id === attributeId)) {
              productId = pid;
              break;
            }
          }
          
          if (productId) {
            set((state) => ({
              productAttributes: {
                ...state.productAttributes,
                [productId]: state.productAttributes[productId].map(a => 
                  a.id === attributeId ? updatedAttribute : a
                )
              }
            }));
          }
        } catch (error) {
          console.error('[VendorStore] Error updating product attribute:', error);
          throw error;
        }
      },
      
      deleteProductAttribute: async (attributeId: string, productId: string) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        try {
          await vendorDataService.deleteProductAttribute(attributeId);
          set((state) => ({
            productAttributes: {
              ...state.productAttributes,
              [productId]: state.productAttributes[productId]?.filter(a => a.id !== attributeId) || []
            }
          }));
        } catch (error) {
          console.error('[VendorStore] Error deleting product attribute:', error);
          throw error;
        }
      },
      
      // Configuration actions
      fetchAttributeConfigurations: async (category: string, useCache: boolean = true) => {
        const { vendor, attributeConfigurations, configurationsCacheTimestamp } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        // Check cache first
        if (useCache && 
            attributeConfigurations[category] && 
            Date.now() - configurationsCacheTimestamp < CACHE_TTL) {
          console.log('[VendorStore] Using cached attribute configurations for category:', category);
          return;
        }
        
        try {
          const configurations = await vendorDataService.fetchAttributeConfigurations(category, vendor.user_id);
          set((state) => ({
            attributeConfigurations: {
              ...state.attributeConfigurations,
              [category]: configurations
            },
            configurationsCacheTimestamp: Date.now()
          }));
        } catch (error) {
          console.error('[VendorStore] Error fetching attribute configurations:', error);
          throw error;
        }
      },
      
      fetchColorPalettes: async (useCache: boolean = true) => {
        const { vendor, colorPalettes, colorPalettesCacheTimestamp } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        // Check cache first
        if (useCache && 
            colorPalettes.length > 0 && 
            Date.now() - colorPalettesCacheTimestamp < CACHE_TTL) {
          console.log('[VendorStore] Using cached color palettes');
          return;
        }
        
        try {
          const palettes = await vendorDataService.fetchColorPalettes(vendor.user_id);
          set({ 
            colorPalettes: palettes,
            colorPalettesCacheTimestamp: Date.now()
          });
        } catch (error) {
          console.error('[VendorStore] Error fetching color palettes:', error);
          throw error;
        }
      },
      
      fetchExtendedCategories: async (useCache: boolean = true) => {
        const { vendor, extendedCategories, extendedCategoriesCacheTimestamp } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        // Check cache first
        if (useCache && 
            extendedCategories.length > 0 && 
            Date.now() - extendedCategoriesCacheTimestamp < CACHE_TTL) {
          console.log('[VendorStore] Using cached extended categories');
          return;
        }
        
        try {
          const categories = await vendorDataService.fetchExtendedCategories(vendor.user_id);
          set({ 
            extendedCategories: categories,
            extendedCategoriesCacheTimestamp: Date.now()
          });
        } catch (error) {
          console.error('[VendorStore] Error fetching extended categories:', error);
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
      
      updateOrder: async (id: string, updates: Partial<Order>) => {
        const { vendor } = get();
        if (!vendor?.user_id) throw new Error('No vendor profile');
        
        const updatedOrder = await vendorDataService.updateOrder(id, updates, vendor.user_id);
        set((state) => ({
          orders: state.orders.map(o => (o.id === id ? updatedOrder : o))
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
        console.log('[VendorStore] fetchOrders called', { 
          vendorId: vendor?.user_id, 
          useCache, 
          cachedOrdersCount: orders.length 
        });
        
        if (!vendor?.user_id) {
          console.error('[VendorStore] No vendor profile available');
          throw new Error('No vendor profile');
        }
        
        try {
          const fetchedOrders = await vendorDataService.fetchOrders(
            vendor.user_id, 
            useCache, 
            orders
          );
          console.log('[VendorStore] Orders fetched from service:', fetchedOrders.length);
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
        vendor: state.vendor,
        vendorCache: state.vendorCache,
        onboardingState: state.onboardingState,
        lastVendorPath: state.lastVendorPath,
        // Cache configurations for better performance
        attributeConfigurations: state.attributeConfigurations,
        colorPalettes: state.colorPalettes,
        extendedCategories: state.extendedCategories,
        configurationsCacheTimestamp: state.configurationsCacheTimestamp,
        colorPalettesCacheTimestamp: state.colorPalettesCacheTimestamp,
        extendedCategoriesCacheTimestamp: state.extendedCategoriesCacheTimestamp
      }),
    }
  )
);
