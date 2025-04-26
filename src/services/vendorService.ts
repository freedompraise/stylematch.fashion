import { SupabaseClient } from '@supabase/supabase-js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';

export interface VendorProfile {
  user_id: string;
  store_name: string;
  full_name: string;
  bio?: string;
  instagram_link?: string;
  facebook_link?: string;
  twitter_link?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  image_url?: string;
}

export async function createVendorProfile(
  supabase: SupabaseClient,
  profile: VendorProfile,
  imageFile?: File
): Promise<void> {
  let imageUrl: string | undefined;
  let uploadedImagePublicId: string | undefined;

  try {
    // Upload image if provided
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
      uploadedImagePublicId = getPublicIdFromUrl(imageUrl);
    }

    // Create vendor profile
    const { error: profileError } = await supabase
      .from('vendors')
      .insert([
        {
          ...profile,
          image_url: imageUrl,
        },
      ]);

    if (profileError) throw profileError;
  } catch (error) {
    // If profile creation fails and we uploaded an image, delete it
    if (uploadedImagePublicId) {
      await deleteFromCloudinary(uploadedImagePublicId);
    }
    throw error;
  }
}

export async function updateVendorProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<VendorProfile>,
  imageFile?: File
): Promise<void> {
  let imageUrl: string | undefined;
  let uploadedImagePublicId: string | undefined;
  let oldImagePublicId: string | undefined;

  try {
    // Get current profile to check for existing image
    const { data: currentProfile, error: fetchError } = await supabase
      .from('vendors')
      .select('image_url')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // If there's a new image, upload it
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
      uploadedImagePublicId = getPublicIdFromUrl(imageUrl);
      
      // If there was an old image, mark it for deletion
      if (currentProfile?.image_url) {
        oldImagePublicId = getPublicIdFromUrl(currentProfile.image_url);
      }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        ...updates,
        image_url: imageUrl,
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // If update was successful and there was an old image, delete it
    if (oldImagePublicId) {
      await deleteFromCloudinary(oldImagePublicId);
    }
  } catch (error) {
    // If update fails and we uploaded a new image, delete it
    if (uploadedImagePublicId) {
      await deleteFromCloudinary(uploadedImagePublicId);
    }
    throw error;
  }
} 