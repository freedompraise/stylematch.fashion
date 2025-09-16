// src/stores/buyerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface BuyerPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
}

interface BrowsingHistoryItem {
  id: string;
  productId: string;
  vendorSlug: string;
  timestamp: number;
  type: 'view' | 'search' | 'category';
  metadata?: Record<string, any>;
}

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  vendorSlug: string;
  vendorName: string;
  addedAt: number;
}

// TODO: WISHLIST VENDOR ACCESS IMPLEMENTATION
// Current implementation uses local storage only, limiting vendor analytics
// See docs/wishlist-vendor-access-spec.md for implementation plan
// 
// Required updates:
// 1. Add database integration for vendor analytics
// 2. Implement wishlist event tracking
// 3. Add vendor dashboard analytics widgets
// 4. Consider hybrid local/database storage approach

interface BuyerState {
  // Cart state
  cart: CartItem[];
  
  // Wishlist state
  wishlist: WishlistItem[];
  
  // Buyer preferences
  preferences: BuyerPreferences;
  
  // Browsing history
  browsingHistory: BrowsingHistoryItem[];
  
  // Actions
  // Cart actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  
  // Wishlist actions
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  
  // Preferences actions
  updatePreferences: (updates: Partial<BuyerPreferences>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  toggleNotification: (type: keyof BuyerPreferences['notifications']) => void;
  togglePrivacy: (type: keyof BuyerPreferences['privacy']) => void;
  
  // Browsing history actions
  addToHistory: (item: Omit<BrowsingHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  getRecentHistory: (limit?: number) => BrowsingHistoryItem[];
  getHistoryByType: (type: BrowsingHistoryItem['type']) => BrowsingHistoryItem[];
}

const defaultPreferences: BuyerPreferences = {
  theme: 'system',
  currency: 'USD',
  language: 'en',
  notifications: {
    email: true,
    push: false,
    sms: false,
  },
  privacy: {
    shareData: true,
    analytics: true,
  },
};

export const useBuyerStore = create<BuyerState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: [],
      wishlist: [],
      preferences: defaultPreferences,
      browsingHistory: [],
      
      // Cart actions
      addToCart: (item: CartItem) => {
        set((state) => {
          const idx = state.cart.findIndex(
            i => i.id === item.id && i.size === item.size && i.color === item.color
          );
          
          if (idx !== -1) {
            const updated = [...state.cart];
            updated[idx].quantity += item.quantity;
            return { cart: updated };
          }
          
          return { cart: [...state.cart, item] };
        });
      },
      
      removeFromCart: (id: string, size?: string, color?: string) => {
        set((state) => ({
          cart: state.cart.filter(i => 
            !(i.id === id && i.size === size && i.color === color)
          )
        }));
      },
      
      updateQuantity: (id: string, quantity: number, size?: string, color?: string) => {
        set((state) => ({
          cart: state.cart.map(i => 
            i.id === id && i.size === size && i.color === color 
              ? { ...i, quantity } 
              : i
          )
        }));
      },
      
      clearCart: () => {
        set({ cart: [] });
      },
      
      getTotal: () => {
        const { cart } = get();
        return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
      
      // Wishlist actions
      // TODO: Add database tracking for vendor analytics
      // Should call trackWishlistEvent(productId, 'added', userId) for vendor insights
      addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => {
        set((state) => {
          const exists = state.wishlist.some(w => w.productId === item.productId);
          if (exists) return state;
          
          const wishlistItem: WishlistItem = {
            ...item,
            addedAt: Date.now(),
          };
          
          // TODO: Track wishlist event in database for vendor analytics
          // trackWishlistEvent(item.productId, 'added', currentUserId);
          
          return { wishlist: [...state.wishlist, wishlistItem] };
        });
      },
      
      // TODO: Add database tracking for vendor analytics
      // Should call trackWishlistEvent(productId, 'removed', userId) for vendor insights
      removeFromWishlist: (productId: string) => {
        set((state) => {
          // TODO: Track wishlist event in database for vendor analytics
          // trackWishlistEvent(productId, 'removed', currentUserId);
          
          return {
            wishlist: state.wishlist.filter(item => item.productId !== productId)
          };
        });
      },
      
      isInWishlist: (productId: string) => {
        const { wishlist } = get();
        return wishlist.some(item => item.productId === productId);
      },
      
      clearWishlist: () => {
        set({ wishlist: [] });
      },
      
      // Preferences actions
      updatePreferences: (updates: Partial<BuyerPreferences>) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        }));
      },
      
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set((state) => ({
          preferences: { ...state.preferences, theme }
        }));
      },
      
      setCurrency: (currency: string) => {
        set((state) => ({
          preferences: { ...state.preferences, currency }
        }));
      },
      
      setLanguage: (language: string) => {
        set((state) => ({
          preferences: { ...state.preferences, language }
        }));
      },
      
      toggleNotification: (type: keyof BuyerPreferences['notifications']) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            notifications: {
              ...state.preferences.notifications,
              [type]: !state.preferences.notifications[type]
            }
          }
        }));
      },
      
      togglePrivacy: (type: keyof BuyerPreferences['privacy']) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            privacy: {
              ...state.preferences.privacy,
              [type]: !state.preferences.privacy[type]
            }
          }
        }));
      },
      
      // Browsing history actions
      addToHistory: (item: Omit<BrowsingHistoryItem, 'id' | 'timestamp'>) => {
        const historyItem: BrowsingHistoryItem = {
          ...item,
          id: `${item.productId}-${Date.now()}`,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          browsingHistory: [historyItem, ...state.browsingHistory.slice(0, 99)] // Keep last 100 items
        }));
      },
      
      clearHistory: () => {
        set({ browsingHistory: [] });
      },
      
      removeFromHistory: (id: string) => {
        set((state) => ({
          browsingHistory: state.browsingHistory.filter(item => item.id !== id)
        }));
      },
      
      getRecentHistory: (limit = 10) => {
        const { browsingHistory } = get();
        return browsingHistory.slice(0, limit);
      },
      
      getHistoryByType: (type: BrowsingHistoryItem['type']) => {
        const { browsingHistory } = get();
        return browsingHistory.filter(item => item.type === type);
      },
    }),
    {
      name: 'buyer-storage',
      partialize: (state) => ({ 
        cart: state.cart,
        wishlist: state.wishlist, // TODO: Consider hybrid local/database storage for vendor analytics
        preferences: state.preferences,
        browsingHistory: state.browsingHistory.slice(0, 50) // Only persist last 50 history items
      }),
    }
  )
);
