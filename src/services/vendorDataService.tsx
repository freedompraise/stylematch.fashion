import React, { createContext, useContext, useState, useCallback } from 'react';
import supabase from '@/lib/supabaseClient';
import { Product, CreateProductInput, createProductInputSchema } from '@/types/ProductSchema';
import { Order } from '@/types/OrderSchema';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';

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
};

const VendorDataContext = createContext<VendorDataContextType | undefined>(undefined);

export const VendorDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

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

  // Bulk create products with image upload and validation
  const createProducts = async (
    productsToCreate: (CreateProductInput & { image: File })[]
  ): Promise<Product[]> => {
    const created: Product[] = [];
    const uploadedIds: string[] = [];
    for (const p of productsToCreate) {
      // 1) validate your _input_ shape
      const parsed = createProductInputSchema.parse({
        ...p,
        images: [],
      });
      // 2) upload
      let imageUrl: string;
      try {
        imageUrl = await uploadToCloudinary(p.image);
      } catch (err) {
        console.error('Image upload failed:', err);
        throw err;
      }
      const publicId = getPublicIdFromUrl(imageUrl);
      uploadedIds.push(publicId);
      // 3) insert row
      const { data: row, error } = await supabase
        .from('products')
        .insert([
          {
            ...parsed,
            images: [imageUrl],
          },
        ])
        .select()
        .single();
      if (error) {
        console.error('Error inserting product:', error);
        // roll back uploaded image
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

  const getVendorStats = async (userId: string) => {
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
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        recentOrders: recentOrders || [],
      };
    } catch (error) {
      throw error;
    }
  };

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