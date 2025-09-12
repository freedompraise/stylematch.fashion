// src/types/index.ts
export * from './VendorSchema';
export * from './ProductSchema';
export * from './OrderSchema';

// Re-export commonly used types
export type { VendorProfile, CreateVendorProfileInput, VerificationStatus } from './VendorSchema';
export type { Product, CreateProductInput, ProductFormValues } from './ProductSchema';
export type { Order, OrderStatus, CustomerInfo, CreateOrderInput } from './OrderSchema';

// Auth Types
export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  store_name?: string;
  name?: string;
}

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
  store_name: string;
  name: string;
  phone?: string;
  bio: string;
  instagram_link?: string;
  facebook_link?: string;
  wabusiness_link?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  store_image?: FileList;
}

// Payout Types
export interface PayoutFormData {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  payout_mode: 'automatic' | 'manual';
  subaccount_code?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}