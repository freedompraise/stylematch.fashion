import { User } from '@supabase/supabase-js';

// Auth Types
export interface AuthSession {
  user: User | null;
  loading: boolean;
  expiresAt?: number | null;
  refreshToken?: string | null;
  accessToken?: string | null;
}

export type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  store_name?: string;
  name?: string;
};

export interface UserMetadata {
  full_name: string;
  store_name: string;
}

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
  wabusiness_link?: string;
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

