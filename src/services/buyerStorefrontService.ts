import supabase from '@/lib/supabaseClient';
import { VendorProfile, Product } from '@/types';

export async function getVendorBySlug(slug: string): Promise<VendorProfile | null> {
  const { data, error } = await supabase
    .from('vendor_storefront_view')
    .select('*')
    .eq('store_slug', slug)
    .single();
  if (error) return null;
  return data as VendorProfile;
}

export async function getProductsByVendorSlug(slug: string): Promise<Product[]> {
  // First, get the vendor by slug
  const vendor = await getVendorBySlug(slug);
  if (!vendor) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendor.user_id)
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