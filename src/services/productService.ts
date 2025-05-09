import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';
import supabase from '@/lib/supabaseClient';
import { createProductInputSchema, productSchema, CreateProductInput, Product } from '@/types/ProductSchema';

export async function createProducts(products: CreateProductInput[]): Promise<Product[]> {
  const createdProducts: Product[] = [];
  const uploadedImagePublicIds: string[] = [];

  try {
    for (const product of products) {
      const parsedProduct = createProductInputSchema.parse(product);
      const imageUrl = await uploadToCloudinary(new File([parsedProduct.images[0]], 'image.jpg'));
      const publicId = getPublicIdFromUrl(imageUrl);
      uploadedImagePublicIds.push(publicId);

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([{
          ...parsedProduct,
          images: [imageUrl],
          stock: parsedProduct.stock_quantity,
          vendor_id: parsedProduct.vendor_id,
        }])
        .select()
        .single();

      if (error) throw error;
      createdProducts.push(productSchema.parse(newProduct));
    }
    return createdProducts;
  } catch (error) {
    await Promise.all(uploadedImagePublicIds.map(publicId => deleteFromCloudinary(publicId)));
    throw error;
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<CreateProductInput>,
  newImageFiles?: File[],
  imagesToDelete?: string[]
): Promise<Product> {
  try {
    const parsedUpdates = createProductInputSchema.partial().parse(updates);
    const { data: currentProduct } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single();

    let finalImages = [...(currentProduct?.images || [])];

    if (imagesToDelete?.length) {
      await Promise.all(imagesToDelete.map(async (imageUrl) => {
        await deleteFromCloudinary(getPublicIdFromUrl(imageUrl));
      }));
      finalImages = finalImages.filter(img => !imagesToDelete.includes(img));
    }

    if (newImageFiles?.length) {
      const newUrls = await Promise.all(newImageFiles.map(file => uploadToCloudinary(file)));
      finalImages.push(...newUrls);
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        ...parsedUpdates,
        images: finalImages,
        ...(parsedUpdates.stock_quantity && { stock: parsedUpdates.stock_quantity })
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return productSchema.parse(updatedProduct);
  } catch (error) {
    throw error;
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    if (product?.images?.length) {
      await Promise.all(product.images.map(img => 
        deleteFromCloudinary(getPublicIdFromUrl(img))
      ));
    }
  } catch (error) {
    throw error;
  }
}

export async function getVendorProducts(vendorId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(product => productSchema.parse(product));
}

export async function getProduct(productId: string): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) throw error;
  return productSchema.parse(data);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(product => productSchema.parse(product));
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(product => productSchema.parse(product));
}

export async function updateProductStock(productId: string, quantity: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: quantity })
    .eq('id', productId);

  if (error) throw error;
}

export async function getHottestOffers(limit = 10): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_hottest_offer', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(product => productSchema.parse(product));
}