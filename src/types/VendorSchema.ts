// src/types/VendorSchema.ts
import { z } from 'zod';

export const verificationStatusSchema = z.enum(['pending', 'verified', 'rejected']);

export const vendorSchema = z.object({
  user_id: z.string().uuid(),
  store_slug: z.string().max(50),
  name: z.string(),
  store_name: z.string(),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  banner_image_url: z.string().nullable(),
  instagram_url: z.string().nullable(),
  facebook_url: z.string().nullable(),
  wabusiness_url: z.string().nullable(),
  payout_info: z.record(z.any()).nullable(),
  isOnboarded: z.boolean().default(false),
  archived: z.boolean().default(false),
  verification_status: verificationStatusSchema.nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  email: z.string().email().nullable().optional(), // Added for storefront queries
});

export type VendorProfile = z.infer<typeof vendorSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export const createVendorProfileSchema = z.object({
  store_slug: z.string().max(50),
  name: z.string(),
  store_name: z.string(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  banner_image_url: z.string().optional(),
  instagram_url: z.string().optional(),
  facebook_url: z.string().optional(),
  wabusiness_url: z.string().optional(),
  payout_info: z.record(z.any()).optional(),
});

export type CreateVendorProfileInput = z.infer<typeof createVendorProfileSchema>;