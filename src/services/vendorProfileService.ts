// src/services/vendorProfileService.ts
// VendorProfileService implementation (see docs/vendor-profile-service.spec.md)

import supabase from '@/lib/supabaseClient';
import { VendorProfile, CreateVendorProfileInput, PayoutInfo, VerificationStatus } from '@/types';
import { z } from 'zod';
import { VendorServiceError, NotFoundError, ValidationError, DatabaseError } from './errors/VendorServiceError';
import { getPublicIdFromUrl, deleteFromCloudinary } from '@/lib/cloudinary';

const createVendorProfileSchema = z.object({
  store_name: z.string().min(2, 'Store name required'),
  name: z.string().min(2, 'Owner name required'),
  bio: z.string().optional(),
  instagram_url: z.string().optional(),
  facebook_url: z.string().optional(),
  wabusiness_url: z.string().optional(),
  banner_image_url: z.string().optional(),
  phone: z.string().optional(),
  payout_info: z.any().optional(), // Payout info validation can be added if needed
  verification_status: z.enum(['pending', 'verified', 'rejected']),
  rejection_reason: z.string().optional(),
});

const updateVendorProfileSchema = z.object({
  store_name: z.string().min(2, 'Store name required').optional(),
  name: z.string().min(2, 'Owner name required').optional(),
  bio: z.string().optional(),
  instagram_url: z.string().optional(),
  facebook_url: z.string().optional(),
  wabusiness_url: z.string().optional(),
  banner_image_url: z.string().optional(),
  phone: z.string().optional(),
  payout_info: z.any().optional(),
  verification_status: z.enum(['pending', 'verified', 'rejected']).optional(),
  rejection_reason: z.string().optional(),
});

class VendorProfileService {
  async createVendorProfile(userId: string, profile: CreateVendorProfileInput): Promise<VendorProfile> {
    // Validate input
    const parsed = createVendorProfileSchema.safeParse(profile);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }
    // Insert into vendors table
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        user_id: userId,
        ...profile,
        isOnboarded: true, // Assume onboarding complete on creation
      })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') { // unique violation
        throw new ValidationError('Vendor profile already exists');
      }
      throw new DatabaseError(error.message);
    }
    if (!data) {
      throw new DatabaseError('Failed to create vendor profile');
    }
    return data as VendorProfile;
  }

  async getVendorProfile(userId: string, options?: { force?: boolean }): Promise<VendorProfile | null> {
    // Fetch from vendors table
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new DatabaseError(error.message);
    }
    return data as VendorProfile;
  }

  async updateVendorProfile(userId: string, updates: Partial<VendorProfile>): Promise<VendorProfile> {
    // Validate updates
    const parsed = updateVendorProfileSchema.safeParse(updates);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    // If there's a new banner image, delete the old one first
    if (updates.banner_image_url) {
      try {
        const currentProfile = await this.getVendorProfile(userId);
        if (currentProfile?.banner_image_url) {
          const publicId = getPublicIdFromUrl(currentProfile.banner_image_url);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        }
      } catch (error) {
        console.error('Error deleting old banner image:', error);
        // Continue with update even if image deletion fails
      }
    }

    // Update vendors table
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      // If update fails and we just uploaded a new image, try to delete it
      if (updates.banner_image_url) {
        try {
          const publicId = getPublicIdFromUrl(updates.banner_image_url);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        } catch (deleteError) {
          console.error('Error deleting image after failed update:', deleteError);
        }
      }
      throw new DatabaseError(error.message);
    }

    if (!data) {
      throw new DatabaseError('Failed to update vendor profile');
    }

    return data as VendorProfile;
  }

  async deleteVendorProfile(userId: string): Promise<void> {
    // Get current profile to delete image
    try {
      const currentProfile = await this.getVendorProfile(userId);
      if (currentProfile?.banner_image_url) {
        const publicId = getPublicIdFromUrl(currentProfile.banner_image_url);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    } catch (error) {
      console.error('Error deleting banner image during profile deletion:', error);
      // Continue with deletion even if image deletion fails
    }

    // Soft delete: set archived flag
    const { error } = await supabase
      .from('vendors')
      .update({ archived: true })
      .eq('user_id', userId);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  async verifyVendor(userId: string): Promise<VendorProfile> {
    // Set verification_status to 'verified', clear rejection_reason
    const { data, error } = await supabase
      .from('vendors')
      .update({ verification_status: 'verified', rejection_reason: null })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) {
      throw new DatabaseError(error.message);
    }
    if (!data) {
      throw new NotFoundError('Vendor not found');
    }
    // TODO: Trigger notification to vendor
    return data as VendorProfile;
  }

  async rejectVendor(userId: string, reason: string): Promise<VendorProfile> {
    // Set verification_status to 'rejected', store rejection_reason
    const { data, error } = await supabase
      .from('vendors')
      .update({ verification_status: 'rejected', rejection_reason: reason })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) {
      throw new DatabaseError(error.message);
    }
    if (!data) {
      throw new NotFoundError('Vendor not found');
    }
    // TODO: Trigger notification to vendor
    return data as VendorProfile;
  }

  async getPendingVendors(): Promise<VendorProfile[]> {
    // Return all vendors with 'pending' status
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('verification_status', 'pending')
      .eq('archived', false);
    if (error) {
      throw new DatabaseError(error.message);
    }
    return (data ?? []) as VendorProfile[];
  }

  async cleanupFailedCreation(imageUrl: string | null): Promise<void> {
    if (imageUrl) {
      try {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error cleaning up image after failed profile creation:', error);
        // Don't throw - this is best-effort cleanup
      }
    }
  }
}

export const vendorProfileService = new VendorProfileService();