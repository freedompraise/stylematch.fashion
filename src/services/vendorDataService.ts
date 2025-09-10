// src/services/vendorDataService.ts
import supabase from '@/lib/supabaseClient';
import { Product, CreateProductInput, SoftDeleteProductInput } from '@/types/ProductSchema';
import { Order } from '@/types/OrderSchema';
import {
  uploadProductImage,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from '@/lib/cloudinary';
import { ProductDeletionError } from './errors/VendorServiceError';

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
        .eq('is_deleted', false)
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
        imageUrl = await uploadProductImage(imageFile);
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

  async updateProduct(productId: string, updates: Partial<Product>, vendorId: string, imageFile?: File, currentProduct?: Product, removeImage?: boolean): Promise<Product> {
    try {
      let newImages: string[] | null = null;
      let uploadedImagePublicIds: string[] = [];
      let oldImagePublicIds: string[] = [];

      if (imageFile) {
        // Handle new image upload
        try {
          const imageUrl = await uploadProductImage(imageFile);
          const uploadedImagePublicId = getPublicIdFromUrl(imageUrl);
          
          if (uploadedImagePublicId) {
            uploadedImagePublicIds.push(uploadedImagePublicId);
          }

          if (currentProduct?.images && currentProduct.images.length > 0) {
            oldImagePublicIds = currentProduct.images
              .map(img => getPublicIdFromUrl(img))
              .filter(Boolean) as string[];
          }

          newImages = [imageUrl];
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error('Failed to upload image');
        }
      } else if (removeImage) {
        // Handle image removal without uploading new image
        console.log('[VendorDataService] Removing image from product');
        if (currentProduct?.images && currentProduct.images.length > 0) {
          oldImagePublicIds = currentProduct.images
            .map(img => getPublicIdFromUrl(img))
            .filter(Boolean) as string[];
        }
        newImages = []; // Set to empty array to remove all images
      }

      const updateData = {
        ...updates,
        ...(newImages !== null && { images: newImages }),
        updated_at: new Date().toISOString()
      };

      // Handle Cloudinary image deletion with proper logging
      if (oldImagePublicIds.length > 0) {
        console.log('[VendorDataService] Deleting old images from Cloudinary:', oldImagePublicIds);
        try {
          await Promise.all(oldImagePublicIds.map(publicId => deleteFromCloudinary(publicId)));
          console.log('[VendorDataService] Successfully deleted old images from Cloudinary');
        } catch (deleteError) {
          console.error('[VendorDataService] Error deleting old images from Cloudinary:', deleteError);
          // Don't throw here to avoid breaking the product update, but log the error properly
        }
      }

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .eq('vendor_id', vendorId)
        .eq('is_deleted', false)
        .select()
        .single();

      if (error) {
        if (uploadedImagePublicIds.length > 0) {
          try {
            await Promise.all(uploadedImagePublicIds.map(publicId => deleteFromCloudinary(publicId)));
          } catch (cleanupError) {
            console.warn('Error cleaning up uploaded images:', cleanupError);
          }
        }
        throw error;
      }

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

  async softDeleteProduct(input: SoftDeleteProductInput, vendorId: string, product?: Product): Promise<void> {
    const { productId, reason } = input;

    try {
      // Handle Cloudinary image deletion with proper logging
      if (product?.images && product.images.length > 0) {
        console.log('[VendorDataService] Starting Cloudinary deletion for product:', productId);
        console.log('[VendorDataService] Product images:', product.images);
        
        const oldImagePublicIds = product.images
          .map(img => {
            const publicId = getPublicIdFromUrl(img);
            console.log('[VendorDataService] Extracted public ID from URL:', img, '->', publicId);
            return publicId;
          })
          .filter(Boolean) as string[];

        console.log('[VendorDataService] Public IDs to delete:', oldImagePublicIds);

        if (oldImagePublicIds.length > 0) {
          console.log('[VendorDataService] Attempting to delete', oldImagePublicIds.length, 'images from Cloudinary');
          
          // Don't swallow errors - let them bubble up
          await Promise.all(oldImagePublicIds.map(async (publicId) => {
            console.log('[VendorDataService] Deleting image with public ID:', publicId);
            await deleteFromCloudinary(publicId);
            console.log('[VendorDataService] Successfully deleted image:', publicId);
          }));
          
          console.log('[VendorDataService] All Cloudinary images deleted successfully');
        } else {
          console.log('[VendorDataService] No valid public IDs found for deletion');
        }
      } else {
        console.log('[VendorDataService] No images to delete for product:', productId);
      }

      const { error } = await supabase
        .from('products')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: vendorId,
          images: null
        })
        .eq('id', productId)
        .eq('vendor_id', vendorId)
        .eq('is_deleted', false);

      if (error) {
        throw new ProductDeletionError('Failed to delete product', error);
      }
    } catch (error) {
      console.error('[VendorDataService] Error soft deleting product:', error);
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
