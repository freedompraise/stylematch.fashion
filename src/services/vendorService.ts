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
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
      uploadedImagePublicId = getPublicIdFromUrl(imageUrl);
    }

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
    const { data: currentProfile, error: fetchError } = await supabase
      .from('vendors')
      .select('banner_image_url')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
      uploadedImagePublicId = getPublicIdFromUrl(imageUrl);
      
      if (currentProfile?.banner_image_url) {
        oldImagePublicId = getPublicIdFromUrl(currentProfile.banner_image_url);
      }
    }

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

    if (oldImagePublicId) {
      await deleteFromCloudinary(oldImagePublicId);
    }
  } catch (error) {
    if (uploadedImagePublicId) {
      await deleteFromCloudinary(uploadedImagePublicId);
    }
    throw error;
  }
}

export async function getVendorStats(supabase: SupabaseClient, userId: string) {
  try {
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', userId);

    if (productsError) throw productsError;

    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', userId);

    if (ordersError) throw ordersError;

    const { data: orders, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('vendor_id', userId);

    if (revenueError) throw revenueError;

    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

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
