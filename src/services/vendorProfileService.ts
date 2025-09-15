import supabase from '@/lib/supabaseClient';
import { VendorProfile, CreateVendorProfileInput } from '@/types';
import { z } from 'zod';
import { VendorServiceError, NotFoundError, ValidationError, DatabaseError } from './errors/VendorServiceError';
import { getPublicIdFromUrl, deleteFromCloudinary, uploadStoreBanner } from '@/lib/cloudinary';
import { generateUniqueSlug } from '@/lib/utils';

const createVendorProfileSchema = z.object({
  store_name: z.string().min(2, 'Store name required'),
  name: z.string().min(2, 'Owner name required'),
  bio: z.string().optional(),
  instagram_url: z.string().optional(),
  facebook_url: z.string().optional(),
  wabusiness_url: z.string().optional(),
  banner_image_url: z.string().optional(),
  phone: z.string().optional(),
  payout_info: z.any().optional(),
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
});

export async function checkSlugExists(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('vendors')
    .select('store_slug')
    .eq('store_slug', slug)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw new DatabaseError(`Failed to check slug existence: ${error.message}`);
  }
  
  return !!data;
}

export async function createVendorProfile(userId: string, profile: CreateVendorProfileInput, imageFile?: File): Promise<VendorProfile> {
  const parsed = createVendorProfileSchema.safeParse(profile);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
  }
  
  let imageUrl: string | undefined;
  try {
    if (imageFile) {
      imageUrl = await uploadStoreBanner(imageFile);
    }
    
    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    if (existingVendor) {
      throw new ValidationError('Vendor profile already exists');
    }
    
    const storeSlug = await generateUniqueSlug(profile.store_name, checkSlugExists);
    
    const { error: userError } = await supabase.auth.updateUser({
      data: { is_vendor: true }
    });
    if (userError) {
      throw new DatabaseError('Failed to update user vendor status');
    }
    
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        user_id: userId,
        store_slug: storeSlug,
        ...profile,
        ...(imageUrl && { banner_image_url: imageUrl }),
        isOnboarded: true,
        verification_status: 'verified', // tempoariliy save each vendor as verified
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      await supabase.auth.updateUser({ data: { is_vendor: false } });
      throw new DatabaseError(error.message);
    }
    if (!data) {
      throw new DatabaseError('Failed to create vendor profile');
    }
    
    return data as VendorProfile;
  } catch (error) {
    if (imageUrl) {
      await cleanupFailedCreation(imageUrl);
    }
    throw error;
  }
}

export async function getVendorProfile(userId: string): Promise<VendorProfile | null> {
  console.log('[VendorProfileService] Fetching vendor for user:', userId);
  
  try {
    // Try the standard query first
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('[VendorProfileService] Error fetching vendor:', error);
      if (error.code === 'PGRST116') {
        console.log('[VendorProfileService] No vendor found (PGRST116)');
        return null;
      }
      
      // If we get a 406 error, try a different approach
      if (error.code === '406') {
        console.log('[VendorProfileService] Got 406 error, trying alternative query...');
        const { data: altData, error: altError } = await supabase
          .from('vendors')
          .select('user_id, store_name, store_slug, name, bio, instagram_url, facebook_url, wabusiness_url, phone, banner_image_url, payout_info, isOnboarded, verification_status, archived, created_at, updated_at')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (altError) {
          console.error('[VendorProfileService] Alternative query also failed:', altError);
          throw new DatabaseError(altError.message);
        }
        
        if (altData) {
          console.log('[VendorProfileService] Vendor found with alternative query:', altData);
          return altData as VendorProfile;
        }
        
        console.log('[VendorProfileService] No vendor found with alternative query');
        return null;
      }
      
      throw new DatabaseError(error.message);
    }
    
    console.log('[VendorProfileService] Vendor found:', data);
    return data as VendorProfile;
  } catch (err) {
    console.error('[VendorProfileService] Unexpected error:', err);
    throw err;
  }
}


export async function updateVendorProfile(userId: string, updates: Partial<VendorProfile>, imageFile?: File): Promise<VendorProfile> {
  const parsed = updateVendorProfileSchema.safeParse(updates);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
  }
  let imageUrl: string | undefined;
  let uploadedImagePublicId: string | undefined;
  let oldImagePublicId: string | undefined;
  try {
    if (imageFile) {
      imageUrl = await uploadStoreBanner(imageFile);
      uploadedImagePublicId = getPublicIdFromUrl(imageUrl);
      const currentProfile = await getVendorProfile(userId);
      if (currentProfile?.banner_image_url) {
        oldImagePublicId = getPublicIdFromUrl(currentProfile.banner_image_url);
      }
    }
    
    let updatedData = { ...updates };
    if (updates.store_name) {
      const newSlug = await generateUniqueSlug(updates.store_name, checkSlugExists);
      updatedData.store_slug = newSlug;
    }
    
    const { data, error } = await supabase
      .from('vendors')
      .update({
        ...updatedData,
        ...(imageUrl && { banner_image_url: imageUrl }),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    if (oldImagePublicId) {
      await deleteFromCloudinary(oldImagePublicId);
    }
    if (error) {
      if (uploadedImagePublicId) {
        await deleteFromCloudinary(uploadedImagePublicId);
      }
      throw new DatabaseError(error.message);
    }
    if (!data) {
      throw new DatabaseError('Failed to update vendor profile');
    }
    return data as VendorProfile;
  } catch (error) {
    if (uploadedImagePublicId) {
      await deleteFromCloudinary(uploadedImagePublicId);
    }
    throw error;
  }
}

export async function deleteVendorProfile(userId: string): Promise<void> {
  try {
    const currentProfile = await getVendorProfile(userId);
    if (currentProfile?.banner_image_url) {
      const publicId = getPublicIdFromUrl(currentProfile.banner_image_url);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }
  } catch (error) {
    console.error('Error deleting banner image during profile deletion:', error);
  }
  const { error } = await supabase
    .from('vendors')
    .update({ archived: true })
    .eq('user_id', userId);
  if (error) {
    throw new DatabaseError(error.message);
  }
}

export async function verifyVendor(userId: string): Promise<VendorProfile> {
  const { data, error } = await supabase
    .from('vendors')
    .update({ verification_status: 'verified' })
    .eq('user_id', userId)
    .select()
    .single();
  if (error) {
    throw new DatabaseError(error.message);
  }
  if (!data) {
    throw new NotFoundError('Vendor not found');
  }
  return data as VendorProfile;
}

export async function rejectVendor(userId: string, reason: string): Promise<VendorProfile> {
  const { data, error } = await supabase
    .from('vendors')
    .update({ verification_status: 'rejected' })
    .eq('user_id', userId)
    .select()
    .single();
  if (error) {
    throw new DatabaseError(error.message);
  }
  if (!data) {
    throw new NotFoundError('VendorProfile not found');
  }
  return data as VendorProfile;
}

export async function getPendingVendors(): Promise<VendorProfile[]> {
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

export async function cleanupFailedCreation(imageUrl: string | null): Promise<void> {
  if (imageUrl) {
    try {
      const publicId = getPublicIdFromUrl(imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    } catch (error) {
      console.error('Error cleaning up image after failed profile creation:', error);
    }
  }
}