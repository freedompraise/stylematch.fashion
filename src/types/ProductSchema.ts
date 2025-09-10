import { z } from 'zod';
import { getAllCategoryIds } from '@/constants/categories';

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0),
  category: z.enum(getAllCategoryIds() as [string, ...string[]]),
  color: z.string(),
  size: z.string(),
  discount_price: z.number().positive().nullable(),
  discount_start: z.string().nullable(),
  discount_end: z.string().nullable(),
  images: z.array(z.string()).nullable(),
  vendor_id: z.string().uuid(),
  is_hottest_offer: z.boolean().default(false),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().datetime().nullable(),
  deleted_by: z.string().uuid().nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
});

export type Product = z.infer<typeof productSchema>;

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  stock_quantity: z.number().min(0, "Stock must be positive"),
  category: z.string().min(1, "Category is required"),
  color: z.string(),
  size: z.string(),
  discount_price: z.number().positive().optional(),
  discount_start: z.string().optional(),
  discount_end: z.string().optional(),
  images: z.array(z.string()).optional(),
  is_hottest_offer: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const productsSchema = z.array(createProductSchema);
export type ProductFormValues = z.infer<typeof createProductSchema>;

export interface ProductWithSales extends Product {
  sales: number;
  sales_count?: number;
}

export interface SoftDeleteProductInput {
  productId: string;
  reason?: string;
}
