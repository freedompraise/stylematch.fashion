import { User } from '@supabase/supabase-js';

// Auth Types
export interface Session {
  user: User | null;
  loading: boolean;
}

export interface UserMetadata {
  full_name: string;
  store_name: string;
}

// Vendor Types
export interface VendorProfile {
  id?: string;
  user_id: string;
  store_name: string;
  full_name: string;
  bio?: string;
  instagram_link?: string;
  facebook_link?: string;
  twitter_link?: string;
  bank_name?: string;
  account_number?: number;
  account_name?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Product Types
export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string[];
  color: string[];
  images: string[];
  stock: number;
  created_at: string;
  updated_at: string;
}

// Order Types
export interface Order {
  id: string;
  customer_id: string;
  vendor_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: Address;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Address Type
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

// Form Types
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  store_name: string;
  name: string;
}

export interface OnboardingFormValues {
  bio: string;
  instagram_link?: string;
  facebook_link?: string;
  twitter_link?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  store_image?: FileList;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Cloudinary Types
export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

// UI Types
export interface ToastMessage {
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// Route Types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  isProtected: boolean;
} 