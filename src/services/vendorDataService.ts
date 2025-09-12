
// src/services/vendorDataService.ts
import supabase from '@/lib/supabaseClient';
import { Product, CreateProductInput, SoftDeleteProductInput } from '@/types/ProductSchema';
import { Order, OrderStatus} from '@/types/OrderSchema';
import {
  ProductVariant,
  ProductAttribute,
  VariantImage,
  AttributeConfiguration,
  ColorPalette,
  ExtendedCategory,
  CreateProductVariantRequest,
  UpdateProductVariantRequest,
  CreateProductAttributeRequest,
  BulkUpdateVariantsRequest,
  ProductWithVariants,
  SizeConfiguration,
  ColorConfiguration,
} from '@/types/VariantSchema';
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

  async createProductWithVariants(
    productData: CreateProductInput,
    variantsData: CreateProductVariantRequest[],
    vendorId: string,
    imageFile?: File
  ): Promise<{ product: Product; variants: ProductVariant[] }> {
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

      // Create product first
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productToCreate])
        .select()
        .single();

      if (productError) throw productError;

      // Create variants with the product ID
      const variantsWithProductId = variantsData.map(variant => ({
        ...variant,
        product_id: product.id
      }));

      const variants = await this.createProductVariants(variantsWithProductId);

      // Update product totals
      await this.updateProductTotals(product.id);

      return { product, variants };
    } catch (error) {
      console.error('Error creating product with variants:', error);
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

  // NEW: Get order with details (cache-aware)
  async getOrderWithDetails(orderId: string, useCache: boolean = true, cachedOrder: Order | null = null): Promise<Order> {
    if (useCache && cachedOrder) {
      return cachedOrder;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:vendor_id (
            store_name,
            payout_info
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order with details:', error);
      throw error;
    }
  }

  async verifyPayment(
    orderId: string, 
    status: 'verified' | 'rejected',
    vendorId: string
  ): Promise<Order> {
    try {
      const { data, error } = await supabase.rpc('verify_payment', {
        order_id: orderId,
        status: status,
        vendor_id: vendorId
      });

      if (error) throw error;

      if (data.payment_proof_urls && data.payment_proof_urls.length > 0) {
        console.log(`Cleaning up payment proof images for ${status} payment...`);
        try {
          await Promise.all(
            data.payment_proof_urls.map(async (url: string) => {
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

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // NEW: Update order status with proper validation
  async updateOrderStatus(orderId: string, status: OrderStatus, vendorId: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('vendor_id', vendorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
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

  // ===== VARIANT MANAGEMENT METHODS =====

  // Product Variants
  async fetchProductVariants(productId: string, useCache: boolean = true, cachedVariants: ProductVariant[] = []): Promise<ProductVariant[]> {
    if (useCache && cachedVariants.length > 0) {
      return cachedVariants;
    }

    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }
  }

  async createProductVariant(variantData: CreateProductVariantRequest): Promise<ProductVariant> {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([variantData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product variant:', error);
      throw error;
    }
  }

  async createProductVariants(variantsData: CreateProductVariantRequest[]): Promise<ProductVariant[]> {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert(variantsData)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error creating product variants:', error);
      throw error;
    }
  }

  async updateProductVariant(variantId: string, updates: UpdateProductVariantRequest): Promise<ProductVariant> {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', variantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product variant:', error);
      throw error;
    }
  }

  async deleteProductVariant(variantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product variant:', error);
      throw error;
    }
  }

  async bulkUpdateVariants(updates: BulkUpdateVariantsRequest): Promise<ProductVariant[]> {
    try {
      const updatePromises = updates.variants.map(({ id, updates: variantUpdates }) =>
        this.updateProductVariant(id, variantUpdates)
      );

      return await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error bulk updating variants:', error);
      throw error;
    }
  }

  // Product Attributes
  async fetchProductAttributes(productId: string): Promise<ProductAttribute[]> {
    try {
      const { data, error } = await supabase
        .from('product_attributes')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching product attributes:', error);
      throw error;
    }
  }

  async createProductAttribute(attributeData: CreateProductAttributeRequest): Promise<ProductAttribute> {
    try {
      const { data, error } = await supabase
        .from('product_attributes')
        .insert([attributeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product attribute:', error);
      throw error;
    }
  }

  async updateProductAttribute(attributeId: string, updates: Partial<ProductAttribute>): Promise<ProductAttribute> {
    try {
      const { data, error } = await supabase
        .from('product_attributes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', attributeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product attribute:', error);
      throw error;
    }
  }

  async deleteProductAttribute(attributeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_attributes')
        .delete()
        .eq('id', attributeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product attribute:', error);
      throw error;
    }
  }

  // Attribute Configurations
  async fetchAttributeConfigurations(category: string, vendorId?: string): Promise<AttributeConfiguration[]> {
    try {
      let query = supabase
        .from('attribute_configurations')
        .select('*')
        .eq('category', category)
        .eq('is_active', true);

      if (vendorId) {
        // Get vendor-specific configs first, then fallback to global
        const { data: vendorConfigs, error: vendorError } = await query
          .eq('vendor_id', vendorId)
          .order('is_global', { ascending: true });

        if (vendorError) throw vendorError;

        if (vendorConfigs && vendorConfigs.length > 0) {
          return vendorConfigs;
        }
      }

      // Fallback to global configurations
      const { data: globalConfigs, error: globalError } = await supabase
        .from('attribute_configurations')
        .select('*')
        .eq('category', category)
        .eq('is_global', true)
        .eq('is_active', true);

      if (globalError) throw globalError;
      return globalConfigs || [];
    } catch (error) {
      console.error('Error fetching attribute configurations:', error);
      throw error;
    }
  }

  async fetchColorPalettes(vendorId?: string): Promise<ColorPalette[]> {
    try {
      let query = supabase
        .from('color_palettes')
        .select('*')
        .eq('is_active', true)
        .order('is_global', { ascending: false });

      if (vendorId) {
        query = query.or(`vendor_id.eq.${vendorId},is_global.eq.true`);
      } else {
        query = query.eq('is_global', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching color palettes:', error);
      throw error;
    }
  }

  // Extended Categories
  async fetchExtendedCategories(vendorId?: string): Promise<ExtendedCategory[]> {
    try {
      let query = supabase
        .from('extended_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (vendorId) {
        query = query.or(`vendor_id.eq.${vendorId},is_global.eq.true`);
      } else {
        query = query.eq('is_global', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching extended categories:', error);
      throw error;
    }
  }

  // Enhanced Product Methods with Variants
  async fetchProductsWithVariants(vendorId: string, useCache: boolean = true, cachedProducts: ProductWithVariants[] = []): Promise<ProductWithVariants[]> {
    if (useCache && cachedProducts.length > 0) {
      return cachedProducts;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*),
          attributes:product_attributes(*)
        `)
        .eq('vendor_id', vendorId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products with variants:', error);
      throw error;
    }
  }

  // Helper method to compute product totals from variants
  async updateProductTotals(productId: string): Promise<void> {
    try {
      const variants = await this.fetchProductVariants(productId, false);
      
      if (variants.length === 0) return;

      const totalStock = variants.reduce((sum, variant) => sum + variant.stock_quantity, 0);
      const prices = variants.map(v => v.price).filter(Boolean) as number[];
      const minPrice = prices.length > 0 ? Math.min(...prices) : undefined;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : undefined;

      const { error } = await supabase
        .from('products')
        .update({
          total_stock: totalStock,
          min_variant_price: minPrice,
          max_variant_price: maxPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating product totals:', error);
      throw error;
    }
  }
}

export const vendorDataService = VendorDataService.getInstance();
export default vendorDataService;
