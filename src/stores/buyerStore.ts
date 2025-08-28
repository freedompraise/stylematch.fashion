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

interface BuyerState {
  // Cart state
  cart: CartItem[];
  
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
        preferences: state.preferences,
        browsingHistory: state.browsingHistory.slice(0, 50) // Only persist last 50 history items
      }),
    }
  )
);
