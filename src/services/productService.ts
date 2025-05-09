import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from '@/lib/cloudinary';
import supabase from '@/lib/supabaseClient';
import {
  createProductInputSchema,
  CreateProductInput,
productSchema,
  Product,
} from '@/types/ProductSchema';

export async function createProducts(
  products: (CreateProductInput & { image: File })[]
): Promise<Product[]> {
  const created: Product[] = [];
  const uploadedIds: string[] = [];

  for (const p of products) {
    // 1) validate your _input_ shape
    const { name, description, price, stock_quantity, category, color, size, discount_price, discount_start, discount_end, is_hottest_offer, vendor_id } =
      createProductInputSchema.parse({
        vendor_id: p.vendor_id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock_quantity: p.stock_quantity,
        category: p.category,
        color: p.color,
        size: p.size,
        discount_price: p.discount_price,
        discount_start: p.discount_start,
        discount_end: p.discount_end,
        images: [],                // we’ll overwrite below
        is_hottest_offer: p.is_hottest_offer,
      });

    // 2) upload
    let imageUrl: string;
    try {
      imageUrl = await uploadToCloudinary(p.image);
      console.log('Uploaded Image URL:', imageUrl);
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
          vendor_id,
          name,
          description,
          price,
          stock_quantity,
          category,
          color,
          size,
          discount_price,
          discount_start,
          discount_end,
          is_hottest_offer,
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

    // 4) push raw row as Product
    created.push(row as Product);
  }

  return created;
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