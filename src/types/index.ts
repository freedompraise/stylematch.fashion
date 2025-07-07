import { User } from '@supabase/supabase-js';
import { VendorProfile } from './VendorSchema';

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

// Payout Form Data
export interface PayoutFormData {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  payout_mode: 'automatic' | 'manual';
  recipient_code?: string;
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

// Vendor Profile Service Types (see docs/vendor-profile-service.spec.md)

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface PayoutInfo {
  bank_name?: string;
  bank_code?: string;
  account_number?: string;
  recipient_code?: string;
  account_name?: string;
  payout_mode?: 'automatic' | 'manual';
  subaccount_code?: string;
}

export interface CreateVendorProfileInput {
  store_name: string;
  name: string;
  bio?: string;
  instagram_url?: string;
  facebook_url?: string;
  wabusiness_url?: string;
  banner_image_url?: string;
  phone?: string;
  payout_info?: PayoutInfo;
  verification_status: VerificationStatus;
  rejection_reason?: string;
}

export interface VerificationInfo {
  status: VerificationStatus;
  verified_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  reviewed_by?: string;
}

export interface VendorProfileService {
  createVendorProfile(userId: string, profile: CreateVendorProfileInput): Promise<VendorProfile>;
  getVendorProfile(userId: string, options?: { force?: boolean }): Promise<VendorProfile | null>;
  updateVendorProfile(userId: string, updates: Partial<VendorProfile>): Promise<VendorProfile>;
  deleteVendorProfile(userId: string): Promise<void>;
  verifyVendor(userId: string): Promise<VendorProfile>;
  rejectVendor(userId: string, reason: string): Promise<VendorProfile>;
  getPendingVendors(): Promise<VendorProfile[]>;
}

export type { VendorProfile } from "./VendorSchema"; 
export type { ProductWithSales } from "./ProductSchema";

export interface PaystackPayment {
  reference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  ip_address: string;
  metadata: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  log: {
    start_time: number;
    time_spent: number;
    attempts: number;
    errors: number;
    success: boolean;
    mobile: boolean;
    input: Array<{
      name: string;
      value: string;
    }>;
    history: Array<{
      type: string;
      message: string;
      time: number;
    }>;
  };
}
