// src/stores/marketplaceStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getVendorBySlug, getProductsByVendorSlug } from '@/services/buyerStorefrontService';
import { VendorProfile, Product } from '@/types';

interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  size?: string[];
  color?: string[];
  brand?: string[];
  rating?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'name' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
  parentId?: string;
  children?: Category[];
}

interface MarketplaceState {
  // Current vendor/storefront
  currentVendor: VendorProfile | null;
  vendorSlug: string | null;
  
  // Listings and products
  listings: Product[];
  categories: Category[];
  
  // Filtering and search
  filters: ProductFilters;
  searchQuery: string;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  // Actions
  // Vendor/storefront actions
  setVendorSlug: (slug: string) => void;
  setCurrentVendor: (vendor: VendorProfile | null) => void;
  
  // Listings actions
  setListings: (listings: Product[]) => void;
  addListing: (listing: Product) => void;
  updateListing: (id: string, updates: Partial<Product>) => void;
  removeListing: (id: string) => void;
  
  // Categories actions
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  
  // Filtering actions
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // Pagination actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setTotalItems: (total: number) => void;
  
  // Loading and error actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Data fetching actions
  fetchVendorData: (slug: string) => Promise<void>;
  refresh: () => Promise<void>;
  
  // Computed values
  filteredListings: () => Product[];
  paginatedListings: () => Product[];
}

const defaultFilters: ProductFilters = {
  sortBy: 'newest',
  sortOrder: 'desc',
  inStock: true,
};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentVendor: null,
      vendorSlug: null,
      listings: [],
      categories: [],
      filters: defaultFilters,
      searchQuery: '',
      loading: true,
      error: null,
      currentPage: 1,
      itemsPerPage: 12,
      totalItems: 0,
      
      // Actions
      setVendorSlug: (slug: string) => set({ vendorSlug: slug }),
      
      setCurrentVendor: (vendor: VendorProfile | null) => set({ currentVendor: vendor }),
      
      setListings: (listings: Product[]) => set({ listings }),
      
      addListing: (listing: Product) => {
        set((state) => ({
          listings: [...state.listings, listing],
          totalItems: state.totalItems + 1
        }));
      },
      
      updateListing: (id: string, updates: Partial<Product>) => {
        set((state) => ({
          listings: state.listings.map(listing => 
            listing.id === id ? { ...listing, ...updates } : listing
          )
        }));
      },
      
      removeListing: (id: string) => {
        set((state) => ({
          listings: state.listings.filter(listing => listing.id !== id),
          totalItems: Math.max(0, state.totalItems - 1)
        }));
      },
      
      setCategories: (categories: Category[]) => set({ categories }),
      
      addCategory: (category: Category) => {
        set((state) => ({
          categories: [...state.categories, category]
        }));
      },
      
      updateCategory: (id: string, updates: Partial<Category>) => {
        set((state) => ({
          categories: state.categories.map(category => 
            category.id === id ? { ...category, ...updates } : category
          )
        }));
      },
      
      removeCategory: (id: string) => {
        set((state) => ({
          categories: state.categories.filter(category => category.id !== id)
        }));
      },
      
      setFilters: (filters: Partial<ProductFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          currentPage: 1 // Reset to first page when filters change
        }));
      },
      
      clearFilters: () => {
        set({ filters: defaultFilters, currentPage: 1 });
      },
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
      },
      
      clearSearch: () => {
        set({ searchQuery: '', currentPage: 1 });
      },
      
      setCurrentPage: (page: number) => set({ currentPage: page }),
      
      setItemsPerPage: (itemsPerPage: number) => {
        set({ itemsPerPage, currentPage: 1 });
      },
      
      setTotalItems: (total: number) => set({ totalItems: total }),
      
      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string | null) => set({ error }),
      
      fetchVendorData: async (slug: string) => {
        set({ loading: true, error: null, vendorSlug: slug });
        
        try {
          const vendor = await getVendorBySlug(slug);
          if (!vendor) {
            set({ error: 'Vendor not found', loading: false, currentVendor: null });
            return;
          }
          
          set({ currentVendor: vendor });
          
          const products = await getProductsByVendorSlug(slug);
          set({ 
            listings: products, 
            totalItems: products.length,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch vendor data', 
            loading: false 
          });
        }
      },
      
      refresh: async () => {
        const { vendorSlug } = get();
        if (vendorSlug) {
          await get().fetchVendorData(vendorSlug);
        }
      },
      
      // Computed values
      filteredListings: () => {
        const { listings, filters, searchQuery } = get();
        
        let filtered = [...listings];
        
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query)
          );
        }
        
        // Category filter
        if (filters.category) {
          filtered = filtered.filter(product => product.category === filters.category);
        }
        
        // Price range filter
        if (filters.priceRange) {
          filtered = filtered.filter(product => 
            product.price >= filters.priceRange!.min && 
            product.price <= filters.priceRange!.max
          );
        }
        
        // Size filter
        if (filters.size && filters.size.length > 0) {
          filtered = filtered.filter(product => {
            if (Array.isArray(product.size)) {
              return product.size.some(size => filters.size!.includes(size));
            } else if (typeof product.size === 'string') {
              return filters.size!.includes(product.size);
            }
            return false;
          });
        }
        
        // Color filter
        if (filters.color && filters.color.length > 0) {
          filtered = filtered.filter(product => {
            if (Array.isArray(product.color)) {
              return product.color.some(color => filters.color!.includes(color));
            } else if (typeof product.color === 'string') {
              return filters.color!.includes(product.color);
            }
            return false;
          });
        }
        
        // Brand filter - removed as brand doesn't exist in Product type
        // Rating filter - removed as rating doesn't exist in Product type
        
        // In stock filter
        if (filters.inStock !== undefined) {
          filtered = filtered.filter(product => 
            filters.inStock ? (product.stock_quantity || 0) > 0 : true
          );
        }
        
        // Sorting
        if (filters.sortBy) {
          filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;
            
            switch (filters.sortBy) {
              case 'price':
                aValue = a.price;
                bValue = b.price;
                break;
              case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
              case 'rating':
                aValue = 0; // Rating not available in Product type
                bValue = 0;
                break;
              case 'newest':
                aValue = new Date(a.created_at || 0);
                bValue = new Date(b.created_at || 0);
                break;
              case 'popular':
                aValue = 0; // Sales count not available in Product type
                bValue = 0;
                break;
              default:
                return 0;
            }
            
            if (filters.sortOrder === 'desc') {
              return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            } else {
              return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            }
          });
        }
        
        return filtered;
      },
      
      paginatedListings: () => {
        const { currentPage, itemsPerPage } = get();
        const filtered = get().filteredListings();
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
      },
    }),
    {
      name: 'marketplace-storage',
      partialize: (state) => ({ 
        filters: state.filters,
        searchQuery: state.searchQuery,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage,
        // Don't persist vendor data, listings, or loading states
      }),
    }
  )
);
