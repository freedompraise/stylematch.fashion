import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0),
  category: z.string(),
  color: z.string(),
  size: z.string(),
  discount_price: z.number().positive().nullable(),
  discount_start: z.string().nullable(),
  discount_end: z.string().nullable(),
  images: z.array(z.string()).nullable(),
  vendor_id: z.string().uuid(),
  is_hottest_offer: z.boolean().default(false),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
});

export type Product = z.infer<typeof productSchema>;

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0),
  category: z.string(),
  color: z.string(),
  size: z.string(),
  discount_price: z.number().positive().optional(),
  discount_start: z.string().optional(),
  discount_end: z.string().optional(),
  images: z.array(z.string()).optional(),
  vendor_id: z.string().uuid(),
  is_hottest_offer: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const productsSchema = z.array(createProductSchema);
export type ProductFormValues = z.infer<typeof createProductSchema>;

export interface ProductWithSales extends Product {
  sales: number;
  sales_count?: number;
}
