import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';
import { Product } from '@/types';
import supabase from '@/lib/supabaseClient';

export interface CreateProductInput {
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string[];
  color: string[];
  stock: number;
  discount_price?: number;
  discount_start?: Date;
  discount_end?: Date;
  is_hottest_offer?: boolean;
  image: File;
}

export async function createProducts(
  products: CreateProductInput[]
): Promise<Product[]> {
  const createdProducts: Product[] = [];
  const uploadedImagePublicIds: string[] = [];

  try {
    // Process each product sequentially
    for (const product of products) {
      // Upload the image
      const imageUrl = await uploadToCloudinary(product.image);
      const publicId = getPublicIdFromUrl(imageUrl);
      uploadedImagePublicIds.push(publicId);

      // Create the product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert([
          {
            vendor_id: product.vendor_id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            size: product.size,
            color: product.color,
            stock: product.stock,
            discount_price: product.discount_price,
            discount_start: product.discount_start,
            discount_end: product.discount_end,
            is_hottest_offer: product.is_hottest_offer,
            images: [imageUrl],
          },
        ])
        .select()
        .single();

      if (productError) throw productError;
      createdProducts.push(newProduct as Product);
    }

    return createdProducts;
  } catch (error) {
    // If any product creation fails, delete all uploaded images
    for (const publicId of uploadedImagePublicIds) {
      await deleteFromCloudinary(publicId);
    }
    throw error;
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<CreateProductInput>,
  newImageFiles?: File[],
  imagesToDelete?: string[]
): Promise<Product> {
  let uploadedImageUrls: string[] = [];
  let uploadedImagePublicIds: string[] = [];
  let deletedImagePublicIds: string[] = [];

  try {
    // Get current product to check for existing images
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    let finalImages = [...(currentProduct?.images || [])];

    // Delete specified images
    if (imagesToDelete?.length) {
      for (const imageUrl of imagesToDelete) {
        const publicId = getPublicIdFromUrl(imageUrl);
        await deleteFromCloudinary(publicId);
        deletedImagePublicIds.push(publicId);
        finalImages = finalImages.filter(img => img !== imageUrl);
      }
    }

    // Upload new images
    if (newImageFiles?.length) {
      for (const imageFile of newImageFiles) {
        const imageUrl = await uploadToCloudinary(imageFile);
        const publicId = getPublicIdFromUrl(imageUrl);
        uploadedImageUrls.push(imageUrl);
        uploadedImagePublicIds.push(publicId);
        finalImages.push(imageUrl);
      }
    }

    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        category: updates.category,
        size: updates.size,
        color: updates.color,
        stock: updates.stock,
        discount_price: updates.discount_price,
        discount_start: updates.discount_start,
        discount_end: updates.discount_end,
        is_hottest_offer: updates.is_hottest_offer,
        images: finalImages,
      })
      .eq('id', productId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedProduct as Product;
  } catch (error) {
    // If update fails and we uploaded new images, delete them
    for (const publicId of uploadedImagePublicIds) {
      await deleteFromCloudinary(publicId);
    }
    // If update fails and we deleted old images, we can't recover them
    throw error;
  }
}

export async function deleteProduct(
  productId: string
): Promise<void> {
  try {
    // Get product images before deletion
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    // Delete product from database
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (deleteError) throw deleteError;

    // Delete all product images from Cloudinary
    if (product?.images?.length) {
      for (const imageUrl of product.images) {
        const publicId = getPublicIdFromUrl(imageUrl);
        await deleteFromCloudinary(publicId);
      }
    }
  } catch (error) {
    throw error;
  }
}

export async function getVendorProducts(
  vendorId: string
): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return products as Product[];
}

export async function getProduct(
  productId: string
): Promise<Product> {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) throw error;
  return product as Product;
}

export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return products as Product[];
}

export async function searchProducts(
  searchTerm: string
): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return products as Product[];
}

export async function updateProductStock(
  productId: string,
  quantity: number
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ stock: quantity })
    .eq('id', productId);

  if (error) throw error;
}

export async function getHottestOffers(
  limit: number = 10
): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_hottest_offer', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return products as Product[];
} 