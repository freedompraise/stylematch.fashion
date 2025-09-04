import { vi } from 'vitest'

export const mockUser = {
  id: "user-123",
  email: "test@example.com",
  created_at: "2024-01-01T00:00:00Z",
}

export const mockVendor = {
  id: "vendor-123",
  user_id: "user-123",
  store_name: "Test Store",
  store_slug: "test-store",
  name: "Test Owner",
  phone: "+1234567890",
  bio: "Test bio",
  verification_status: "pending",
  is_onboarded: false,
  created_at: "2024-01-01T00:00:00Z",
}

export const mockAuthStore = {
  user: mockUser,
  isAuthenticated: true,
  loading: false,
  session: { access_token: "test-token" },
  signIn: vi.fn(),
  signOut: vi.fn(),
  setError: vi.fn(),
  clearError: vi.fn(),
  setSession: vi.fn(),
}

export const mockVendorStore = {
  vendor: mockVendor,
  loading: false,
  error: null,
  products: [],
  orders: [],
  createVendorProfile: vi.fn(),
  updateVendorProfile: vi.fn(),
  fetchProducts: vi.fn(),
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
  fetchOrders: vi.fn(),
  updateOrder: vi.fn(),
  deleteOrder: vi.fn(),
  setError: vi.fn(),
  clearError: vi.fn(),
  setVendor: vi.fn(),
  setProducts: vi.fn(),
  setOrders: vi.fn(),
  setLoading: vi.fn(),
}

export const mockBuyerStore = {
  cart: [],
  wishlist: [],
  orders: [],
  loading: false,
  error: null,
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateCartItem: vi.fn(),
  clearCart: vi.fn(),
}

export const mockMarketplaceStore = {
  products: [],
  vendors: [],
  categories: [],
  searchQuery: "",
  filters: {},
  loading: false,
  error: null,
  setSearchQuery: vi.fn(),
  setFilters: vi.fn(),
  clearFilters: vi.fn(),
}

export const mockUIStore = {
  sidebarOpen: false,
  modalOpen: false,
  currentModal: null,
  theme: 'light',
  toggleSidebar: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  isModalOpen: vi.fn(),
}
