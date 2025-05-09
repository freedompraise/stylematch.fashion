import { SupabaseClient } from '@supabase/supabase-js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';
import { VendorProfile } from '@/types/VendorSchema';


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

    // Create vendor profile with correct column names
    const { error: profileError } = await supabase
      .from('vendors')
      .insert([
        {
          user_id: profile.user_id,
          store_name: profile.store_name,
          name: profile.name,
          bio: profile.bio,
          instagram_url: profile.instagram_url,
          facebook_url: profile.facebook_url,
          wabusiness_url: profile.wabusiness_url,
          phone: profile.phone,
          banner_image_url: imageUrl,
          payout_info: profile.payout_info,
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
      .select('banner_image_url')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // If there's a new image, upload it
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
      uploadedImagePublicId = getPublicIdFromUrl(imageUrl);
      
      // If there was an old image, mark it for deletion
      if (currentProfile?.banner_image_url) {
        oldImagePublicId = getPublicIdFromUrl(currentProfile.banner_image_url);
      }
    }

    // Update profile with correct column names
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        name: updates.name,
        store_name: updates.store_name,
        bio: updates.bio,
        instagram_url: updates.instagram_url,
        facebook_url: updates.facebook_url,
        wabusiness_url: updates.wabusiness_url,
        phone: updates.phone,
        banner_image_url: imageUrl,
        payout_info: updates.payout_info,
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

export async function getVendorStats(supabase: SupabaseClient, userId: string) {
  try {
    // Get total products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', userId);

    if (productsError) throw productsError;

    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', userId);

    if (ordersError) throw ordersError;

    // Get total revenue
    const { data: orders, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('vendor_id', userId)
      .eq('status', 'completed');

    if (revenueError) throw revenueError;

    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total_amount,
        customer:profiles(name, email)
      `)
      .eq('vendor_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentOrdersError) throw recentOrdersError;

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders
    };
  } catch (error) {
    throw error;
  }
}

export async function getVendorProfile(supabase: SupabaseClient, userId: string) {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
} 