// src/services/vendorDataService.ts
import supabase from '@/lib/supabaseClient';
import { Product, CreateProductInput } from '@/types/ProductSchema';
import { Order } from '@/types/OrderSchema';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from '@/lib/cloudinary';

export interface VendorStats {
  totalRevenue: number;
  totalOrders: number;
  recentOrders: Order[];
  averageOrderValue: number;
  lowStockProducts: number;
}

export interface ProductWithSales extends Product {
  sales: number;
}

class VendorDataService {
  private static instance: VendorDataService;

  private constructor() {}

  public static getInstance(): VendorDataService {
    if (!VendorDataService.instance) {
      VendorDataService.instance = new VendorDataService();
    }
    return VendorDataService.instance;
  }

  // Product operations
  async fetchProducts(vendorId: string, useCache: boolean = true, cachedProducts: Product[] = []): Promise<Product[]> {
    if (useCache && cachedProducts.length > 0) {
      return cachedProducts;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async createProduct(
    productData: CreateProductInput,
    vendorId: string,
    imageFile?: File
  ): Promise<Product> {
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      const productToCreate = {
        ...productData,
        vendor_id: vendorId,
        images: imageUrl ? [imageUrl] : [],
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productToCreate])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, updates: Partial<Product>, vendorId: string): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .eq('vendor_id', vendorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(product: Product, vendorId: string): Promise<void> {
    console.log('[VendorDataService] Starting deletion for product:', product.id);
    try {
      // If the product has images, delete them from Cloudinary
      if (product.images && product.images.length > 0) {
        console.log('[VendorDataService] Deleting images from Cloudinary...');
        const deletePromises = product.images.map((imageUrl) => {
          if (imageUrl) {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) {
              return deleteFromCloudinary(publicId);
            }
          }
          return Promise.resolve();
        });

        await Promise.all(deletePromises);
        console.log('[VendorDataService] Cloudinary images deleted.');
      }

      // After deleting images, delete the product from the database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('vendor_id', vendorId);

      if (error) throw error;
      console.log('[VendorDataService] Product deleted from database:', product.id);
    } catch (error) {
      console.error('[VendorDataService] Error deleting product:', error);
      throw error;
    }
  }

  // Order operations
  async fetchOrders(vendorId: string, useCache: boolean = true, cachedOrders: Order[] = []): Promise<Order[]> {
    console.log('[VendorDataService] fetchOrders called', { vendorId, useCache, cachedOrdersCount: cachedOrders.length });
    
    if (useCache && cachedOrders.length > 0) {
      console.log('[VendorDataService] Returning cached orders');
      return cachedOrders;
    }

    try {
      console.log('[VendorDataService] Fetching orders from database for vendor:', vendorId);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[VendorDataService] Supabase error:', error);
        throw error;
      }
      
      console.log('[VendorDataService] Orders fetched from database:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[VendorDataService] Error fetching orders:', error);
      throw error;
    }
  }

  async updateOrder(orderId: string, updates: Partial<Order>, vendorId: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .eq('vendor_id', vendorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async deleteOrder(orderId: string, vendorId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .eq('vendor_id', vendorId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Stats and analytics
  calculateVendorStats(products: Product[], orders: Order[]): VendorStats {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const lowStockProducts = products.filter(p => p.stock_quantity <= 5).length;
    
    const recentOrders = orders
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 10);

    return {
      totalRevenue,
      totalOrders,
      recentOrders,
      averageOrderValue,
      lowStockProducts
    };
  }

  getTopProducts(products: Product[], orders: Order[]): ProductWithSales[] {
    return products
      .map(product => ({
        ...product,
        sales: orders.filter(order => order.product_id === product.id).length
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }
}

export const vendorDataService = VendorDataService.getInstance();
export default vendorDataService;
