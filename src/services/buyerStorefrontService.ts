import supabase from '@/lib/supabaseClient';
import { VendorProfile, Product } from '@/types';

export async function getVendorBySlug(storeSlug: string): Promise<VendorProfile | null> {
 const { data, error } = await supabase
   .from('vendors')
   .select('*')
   .eq('store_slug', storeSlug)
   .single();
   
 if (error) {
   if (error.code === 'PGRST116') {
     return null;
   }
   throw new Error(`Failed to fetch vendor: ${error.message}`);
 }
 return data as VendorProfile;
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