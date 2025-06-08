// VendorDataProvider.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import supabase from '@/lib/supabaseClient';
import { Product, CreateProductInput, createProductInputSchema } from '@/types/ProductSchema';
import { Order } from '@/types/OrderSchema';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';
import { useVendor } from '@/contexts/VendorContext';

export type VendorDataContextType = {
  products: Product[];
  orders: Order[];
  fetchProducts: (force?: boolean) => Promise<Product[]>;
  fetchOrders: (force?: boolean) => Promise<Order[]>;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  createProducts: (products: (CreateProductInput & { image: File })[]) => Promise<Product[]>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  createOrder: (order: Partial<Order>) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  filterProducts: (criteria: (p: Product) => boolean) => Product[];
  filterOrders: (criteria: (o: Order) => boolean) => Order[];
  getVendorStats: () => Promise<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: any[];
  }>;
  getProduct: (productId: string) => Promise<Product | undefined>;
  getProductsByCategory: (category: string) => Product[];
  searchProducts: (searchTerm: string) => Product[];
  getHottestOffers: (limit?: number) => Product[];
  resetVendorData: () => void;
};

const VendorDataContext = createContext<VendorDataContextType | undefined>(undefined);

export const VendorDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { vendor } = useVendor();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const fetchProducts = useCallback(async (force = false) => {
    if (!vendor?.user_id) return [];
    if (productsLoaded && !force) return products;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendor.user_id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    setProducts(data as Product[]);
    setProductsLoaded(true);
    return data as Product[];
  }, [products, productsLoaded, vendor?.user_id]);

  const fetchOrders = useCallback(async (force = false) => {
    if (!vendor?.user_id) return [];
    if (ordersLoaded && !force) return orders;
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendor.user_id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    setOrders(data as Order[]);
    setOrdersLoaded(true);
    return data as Order[];
  }, [orders, ordersLoaded, vendor?.user_id]);

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

  const createProducts = async (productsToCreate: (CreateProductInput & { image: File })[]) => {
    if (!vendor?.user_id) throw new Error('No vendor ID available');
    
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
        .insert([{ ...parsed, images: [imageUrl], vendor_id: vendor.user_id }])
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
    if (!vendor?.user_id) throw new Error('No vendor ID available');
    
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, vendor_id: vendor.user_id }])
      .select()
      .single();
      
    if (error) throw error;
    setProducts(prev => [data as Product, ...prev]);
    return data as Product;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
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
    if (!vendor?.user_id) throw new Error('No vendor ID available');
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{ ...order, vendor_id: vendor.user_id }])
      .select()
      .single();
      
    if (error) throw error;
    setOrders(prev => [data as Order, ...prev]);
    return data as Order;
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
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

  const getVendorStats = useCallback(async () => {
    if (!vendor?.user_id) throw new Error('No vendor ID available');
    
    if (!productsLoaded || !ordersLoaded) {
      await Promise.all([
        fetchProducts(),
        fetchOrders()
      ]);
    }
    
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const recentOrders = orders.slice(0, 5);
    
    return { totalProducts, totalOrders, totalRevenue, recentOrders };
  }, [products, orders, productsLoaded, ordersLoaded, fetchProducts, fetchOrders, vendor?.user_id]);

  const resetVendorData = useCallback(() => {
    setProducts([]);
    setOrders([]);
    setProductsLoaded(false);
    setOrdersLoaded(false);
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
