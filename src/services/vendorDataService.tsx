// VendorDataProvider.tsx

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import { Product, CreateProductInput, createProductInputSchema } from '@/types/ProductSchema';
import { Order } from '@/types/OrderSchema';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';
import { VendorProfile } from '@/types/VendorSchema';

export type VendorDataContextType = {
  products: Product[];
  orders: Order[];
  fetchProducts: (vendorId: string, force?: boolean) => Promise<Product[]>;
  fetchOrders: (vendorId: string, force?: boolean) => Promise<Order[]>;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  createProducts: (products: (CreateProductInput & { image: File })[]) => Promise<Product[]>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  createOrder: (order: Partial<Order>) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  filterProducts: (criteria: (p: Product) => boolean) => Product[];
  filterOrders: (criteria: (o: Order) => boolean) => Order[];
  getVendorStats: (userId: string) => Promise<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: any[];
  }>;
  getProduct: (productId: string) => Promise<Product | undefined>;
  getProductsByCategory: (category: string) => Product[];
  searchProducts: (searchTerm: string) => Product[];
  getHottestOffers: (limit?: number) => Product[];
  getVendorProfile: (userId: string, force?: boolean) => Promise<VendorProfile | null>;
  createVendorProfile: (profile: VendorProfile, imageFile?: File) => Promise<void>;
  updateVendorProfile: (userId: string, updates: Partial<VendorProfile>, imageFile?: File) => Promise<void>;
  resetVendorData: () => void;
};

const VendorDataContext = createContext<VendorDataContextType | undefined>(undefined);

export const VendorDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [vendorProfileLoaded, setVendorProfileLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vendor_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setVendorProfile(parsed);
      setVendorProfileLoaded(true);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.id && !vendorProfileLoaded) {
        await getVendorProfile(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [vendorProfileLoaded]);

  const fetchProducts = useCallback(async (vendorId: string, force = false) => {
    if (productsLoaded && !force) return products;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setProducts(data as Product[]);
    setProductsLoaded(true);
    return data as Product[];
  }, [products, productsLoaded]);

  const fetchOrders = useCallback(async (vendorId: string, force = false) => {
    if (ordersLoaded && !force) return orders;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setOrders(data as Order[]);
    setOrdersLoaded(true);
    return data as Order[];
  }, [orders, ordersLoaded]);

  const getProduct = useCallback(async (productId: string) => {
    const cached = products.find(p => p.id === productId);
    if (cached) return cached;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    if (error) return undefined;
    return data as Product;
  }, [products]);

  const getProductsByCategory = useCallback((category: string) => {
    return products.filter(p => p.category === category);
  }, [products]);

  const searchProducts = useCallback((searchTerm: string) => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products]);

  const getHottestOffers = useCallback((limit = 10) => {
    return products.filter(p => p.is_hottest_offer).slice(0, limit);
  }, [products]);

  const getVendorProfile = useCallback(async (userId: string, force = false) => {
    if (!force && vendorProfile && vendorProfile.user_id === userId) {
      return vendorProfile;
    }
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    if (data && typeof data === 'object') {
      setVendorProfile(data as VendorProfile);
      setVendorProfileLoaded(true);
      localStorage.setItem('vendor_profile', JSON.stringify(data));
      return data as VendorProfile;
    }
    return null;
  }, [vendorProfile]);

  const createVendorProfile = useCallback(async (profile: VendorProfile, imageFile?: File) => {
    let imageUrl: string | undefined;
    let uploadedImagePublicId: string | undefined;
    try {
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
        uploadedImagePublicId = getPublicIdFromUrl(imageUrl);
      }
      const { error: profileError } = await supabase
        .from('vendors')
        .insert([{ ...profile, banner_image_url: imageUrl }]);
      if (profileError) throw profileError;
    } catch (error) {
      if (uploadedImagePublicId) {
        await deleteFromCloudinary(uploadedImagePublicId);
      }
      throw error;
    }
  }, []);

  const updateVendorProfile = useCallback(async (userId: string, updates: Partial<VendorProfile>, imageFile?: File) => {
    // Always send the full payout_info structure if present
    let fullUpdates = { ...updates };
    if (updates.payout_info) {
      // Ensure all required fields are present
      const { account_number, bank_code, bank_name, recipient_code, account_name } = updates.payout_info as any;
      fullUpdates.payout_info = {
        account_number: account_number || '',
        bank_code: bank_code || '',
        bank_name: bank_name || '',
        recipient_code: recipient_code || '',
        account_name: account_name || '',
      };
    }
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
        .update(fullUpdates)
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
  }, []);

  const createProducts = async (productsToCreate: (CreateProductInput & { image: File })[]) => {
    const created: Product[] = [];
    const uploadedIds: string[] = [];
    for (const p of productsToCreate) {
      const parsed = createProductInputSchema.parse({ ...p, images: [] });
      let imageUrl: string;
      try {
        imageUrl = await uploadToCloudinary(p.image);
      } catch (err) {
        throw err;
      }
      const publicId = getPublicIdFromUrl(imageUrl);
      uploadedIds.push(publicId);
      const { data: row, error } = await supabase
        .from('products')
        .insert([{ ...parsed, images: [imageUrl] }])
        .select()
        .single();
      if (error) {
        await deleteFromCloudinary(publicId).catch(console.error);
        throw error;
      }
      created.push(row as Product);
    }
    setProducts(prev => [...created, ...prev]);
    return created;
  };

  const createProduct = async (product: Partial<Product>) => {
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) throw error;
    setProducts(prev => [data as Product, ...prev]);
    return data as Product;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setProducts(prev => prev.map(p => (p.id === id ? (data as Product) : p)));
    return data as Product;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const createOrder = async (order: Partial<Order>) => {
    const { data, error } = await supabase.from('orders').insert([order]).select().single();
    if (error) throw error;
    setOrders(prev => [data as Order, ...prev]);
    return data as Order;
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setOrders(prev => prev.map(o => (o.id === id ? (data as Order) : o)));
    return data as Order;
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const filterProducts = (criteria: (p: Product) => boolean) => products.filter(criteria);
  const filterOrders = (criteria: (o: Order) => boolean) => orders.filter(criteria);

  const getVendorStats = useCallback(async (userId: string) => {
    if (!productsLoaded || !ordersLoaded) {
      await Promise.all([
        fetchProducts(userId),
        fetchOrders(userId)
      ]);
    }
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const recentOrders = orders.slice(0, 5);
    return { totalProducts, totalOrders, totalRevenue, recentOrders };
  }, [products, orders, productsLoaded, ordersLoaded, fetchProducts, fetchOrders]);

  const resetVendorData = useCallback(() => {
    setProducts([]);
    setOrders([]);
    setProductsLoaded(false);
    setOrdersLoaded(false);
    setVendorProfile(null);
    setVendorProfileLoaded(false);
    localStorage.removeItem('vendor_profile');
  }, []);

  return (
    <VendorDataContext.Provider
      value={{
        products,
        orders,
        fetchProducts,
        fetchOrders,
        createProduct,
        createProducts,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrder,
        deleteOrder,
        filterProducts,
        filterOrders,
        getVendorStats,
        getProduct,
        getProductsByCategory,
        searchProducts,
        getHottestOffers,
        getVendorProfile,
        createVendorProfile,
        updateVendorProfile,
        resetVendorData,
      }}
    >
      {children}
    </VendorDataContext.Provider>
  );
};

export function useVendorData() {
  const ctx = useContext(VendorDataContext);
  if (!ctx) throw new Error('useVendorData must be used within a VendorDataProvider');
  return ctx;
}
