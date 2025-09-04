// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModalState {
  isOpen: boolean;
  type: string;
  data?: any;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Modals
  modals: Record<string, ModalState>;
  
  // Toasts
  toasts: Toast[];
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Navigation
  currentRoute: string;
  breadcrumbs: Array<{ label: string; path: string }>;
  
  // Responsive
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Actions
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  
  // Sidebar actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  
  // Modal actions
  openModal: (type: string, data?: any) => void;
  closeModal: (type: string) => void;
  closeAllModals: () => void;
  isModalOpen: (type: string) => boolean;
  getModalData: (type: string) => any;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  clearLoadingState: (key: string) => void;
  isLoading: (key: string) => boolean;
  
  // Navigation actions
  setCurrentRoute: (route: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path: string }>) => void;
  addBreadcrumb: (breadcrumb: { label: string; path: string }) => void;
  clearBreadcrumbs: () => void;
  
  // Responsive actions
  setResponsiveState: (isMobile: boolean, isTablet: boolean, isDesktop: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: false,
      sidebarCollapsed: false,
      modals: {},
      toasts: [],
      globalLoading: false,
      loadingStates: {},
      currentRoute: '',
      breadcrumbs: [],
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      
      // Theme actions
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },
      
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
        get().setTheme(newTheme);
      },
      
      // Sidebar actions
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      
      toggleSidebar: () => {
        const { sidebarOpen } = get();
        set({ sidebarOpen: !sidebarOpen });
      },
      
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      
      toggleSidebarCollapsed: () => {
        const { sidebarCollapsed } = get();
        set({ sidebarCollapsed: !sidebarCollapsed });
      },
      
      // Modal actions
      openModal: (type: string, data?: any) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [type]: { isOpen: true, type, data }
          }
        }));
      },
      
      closeModal: (type: string) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [type]: { ...state.modals[type], isOpen: false }
          }
        }));
      },
      
      closeAllModals: () => {
        set((state) => ({
          modals: Object.keys(state.modals).reduce((acc, key) => ({
            ...acc,
            [key]: { ...state.modals[key], isOpen: false }
          }), {})
        }));
      },
      
      isModalOpen: (type: string) => {
        const { modals } = get();
        return modals[type]?.isOpen || false;
      },
      
      getModalData: (type: string) => {
        const { modals } = get();
        return modals[type]?.data;
      },
      
      // Toast actions
      addToast: (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = {
          ...toast,
          id,
          duration: toast.duration || 5000
        };
        
        set((state) => ({
          toasts: [...state.toasts, newToast]
        }));
        
        // Auto remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }
      },
      
      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }));
      },
      
      clearToasts: () => set({ toasts: [] }),
      
      // Loading actions
      setGlobalLoading: (loading: boolean) => set({ globalLoading: loading }),
      
      setLoadingState: (key: string, loading: boolean) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading
          }
        }));
      },
      
      clearLoadingState: (key: string) => {
        set((state) => {
          const newLoadingStates = { ...state.loadingStates };
          delete newLoadingStates[key];
          return { loadingStates: newLoadingStates };
        });
      },
      
      isLoading: (key: string) => {
        const { loadingStates } = get();
        return loadingStates[key] || false;
      },
      
      // Navigation actions
      setCurrentRoute: (route: string) => set({ currentRoute: route }),
      
      setBreadcrumbs: (breadcrumbs: Array<{ label: string; path: string }>) => {
        set({ breadcrumbs });
      },
      
      addBreadcrumb: (breadcrumb: { label: string; path: string }) => {
        set((state) => ({
          breadcrumbs: [...state.breadcrumbs, breadcrumb]
        }));
      },
      
      clearBreadcrumbs: () => set({ breadcrumbs: [] }),
      
      // Responsive actions
      setResponsiveState: (isMobile: boolean, isTablet: boolean, isDesktop: boolean) => {
        set({ isMobile, isTablet, isDesktop });
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        // Don't persist modals, toasts, loading states, or responsive state
      }),
    }
  )
);

// Initialize theme on app start
if (typeof window !== 'undefined') {
  // Apply initial theme
  const { theme } = useUIStore.getState();
  const root = document.documentElement;
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    const { theme } = useUIStore.getState();
    if (theme === 'system') {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  });
}
