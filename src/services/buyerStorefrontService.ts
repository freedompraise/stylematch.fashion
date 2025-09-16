import supabase from '@/lib/supabaseClient';
import { VendorProfile, Product } from '@/types';
import { CreateOrderInput, Order } from '@/types/OrderSchema';
import { uploadPaymentProof, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';

export async function getVendorBySlug(storeSlug: string): Promise<VendorProfile | null> {
 // Try the view first
 const { data: viewData, error: viewError } = await supabase
   .from('vendor_storefront_view')
   .select('*')
   .eq('store_slug', storeSlug)
   .single();
   
 if (!viewError && viewData) {
   return viewData as VendorProfile;
 }
 
 // If view fails, fallback to RPC function
 console.log('[BuyerStorefrontService] View query failed, trying RPC function:', viewError?.message);
 
 const { data: rpcData, error: rpcError } = await supabase.rpc('get_vendor_storefront', {
   slug: storeSlug
 });
   
 if (rpcError) {
   console.error('[BuyerStorefrontService] RPC function also failed:', rpcError.message);
   throw new Error(`Failed to fetch vendor: ${rpcError.message}`);
 }
 
 if (!rpcData || rpcData.length === 0) {
   return null;
 }
 
 return rpcData[0] as VendorProfile;
}

// Helper function to debug vendor issues - checks vendor status without strict filtering
export async function getVendorStatus(storeSlug: string): Promise<{
  exists: boolean;
  archived: boolean;
  isOnboarded: boolean;
  verificationStatus: string;
  storeName?: string;
} | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select('store_name, archived, "isOnboarded", verification_status')
    .eq('store_slug', storeSlug)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return { exists: false, archived: false, isOnboarded: false, verificationStatus: 'not_found' };
    }
    throw new Error(`Failed to fetch vendor status: ${error.message}`);
  }
  
  return {
    exists: true,
    archived: data.archived,
    isOnboarded: data.isOnboarded,
    verificationStatus: data.verification_status,
    storeName: data.store_name
  };
}

export async function getProductsByVendorSlug(slug: string): Promise<Product[]> {
  const vendor = await getVendorBySlug(slug);
  if (!vendor) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendor.user_id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as Product[];
}

export async function createOrder(order: any) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getVendorSubaccountBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_vendor_subaccount', { slug });
  if (error || !data) return null;
  return data.subaccount_code || null;
}

export async function getOrderById(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (error || !data) throw new Error('Order not found.');
  return data;
}

// NEW: Enhanced order creation with payment proof and proper error handling
export async function createOrderWithPaymentProof(
  orderData: CreateOrderInput,
  paymentProofFiles: File[]
): Promise<Order> {
  let uploadedUrls: string[] = [];
  
  try {
    // Step 1: Upload payment proofs first
    if (paymentProofFiles.length > 0) {
      const tempOrderId = `temp-${Date.now()}`;
      uploadedUrls = await Promise.all(
        paymentProofFiles.map(file => uploadPaymentProof(file, tempOrderId))
      );
    }
    
    // Step 2: Create order with RPC (includes inventory validation)
    const { data, error } = await supabase.rpc('create_order_with_payment_proof', {
      order_data: orderData,
      payment_proof_urls: uploadedUrls
    });
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    // CRITICAL: Cleanup uploaded images on failure
    console.error('Error creating order with payment proof:', error);
    
    if (uploadedUrls.length > 0) {
      console.log('Cleaning up uploaded payment proof images...');
      try {
        await Promise.all(
          uploadedUrls.map(async (url) => {
            const publicId = getPublicIdFromUrl(url);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          })
        );
        console.log('Successfully cleaned up payment proof images');
      } catch (cleanupError) {
        console.error('Error cleaning up payment proof images:', cleanupError);
      }
    }
    
    throw error;
  }
}

// NEW: Get order status for buyers
export async function getOrderStatus(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (error) throw error;
  return data;
}

// NEW: Get order history for buyers using proper schema
export async function getOrderHistory(customerEmail: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .contains('customer_info', { email: customerEmail })
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Share functionality
export function shareProduct(product: Product, vendor: VendorProfile, method: 'native' | 'copy' | 'social' = 'native') {
  const url = window.location.href;
  const title = product.name;
  const text = `Check out this ${product.name} from ${vendor.store_name} on StyleMatch!`;
  
  if (method === 'native' && navigator.share) {
    return navigator.share({
      title,
      text,
      url,
    });
  }
  
  if (method === 'copy') {
    return navigator.clipboard.writeText(url).then(() => {
      return Promise.resolve('Link copied to clipboard!');
    });
  }
  
  // Social sharing
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  
  const socialUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };
  
  return socialUrls;
}

// Get vendor contact method for "Chat Now" functionality
export function getVendorContactMethod(vendor: VendorProfile): {
  method: 'whatsapp' | 'phone' | 'instagram' | 'facebook' | null;
  url: string;
  label: string;
} {
  // Priority order: WhatsApp > Phone > Instagram > Facebook
  if (vendor.wabusiness_url) {
    return {
      method: 'whatsapp',
      url: vendor.wabusiness_url,
      label: 'Chat on WhatsApp'
    };
  }
  
  if (vendor.phone) {
    return {
      method: 'phone',
      url: `tel:${vendor.phone}`,
      label: 'Call Now'
    };
  }
  
  if (vendor.instagram_url) {
    return {
      method: 'instagram',
      url: vendor.instagram_url,
      label: 'Message on Instagram'
    };
  }
  
  if (vendor.facebook_url) {
    return {
      method: 'facebook',
      url: vendor.facebook_url,
      label: 'Message on Facebook'
    };
  }
  
  return {
    method: null,
    url: '',
    label: 'Contact Vendor'
  };
}

// Rating system functions
export async function getProductRatings(productIds: string[]): Promise<Record<string, {
  average_rating: number;
  review_count: number;
}>> {
  if (productIds.length === 0) return {};
  
  const { data, error } = await supabase
    .from('product_ratings')
    .select('product_id, average_rating, review_count')
    .in('product_id', productIds);
  
  if (error) {
    console.error('Error fetching product ratings:', error);
    return {};
  }
  
  const ratingsMap: Record<string, { average_rating: number; review_count: number }> = {};
  data?.forEach(rating => {
    ratingsMap[rating.product_id] = {
      average_rating: parseFloat(rating.average_rating) || 0,
      review_count: rating.review_count || 0
    };
  });
  
  return ratingsMap;
}

export async function getProductReviews(productId: string, limit: number = 5): Promise<{
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  user_id: string;
}[]> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, rating, review_text, created_at, user_id')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
  
  return data || [];
}