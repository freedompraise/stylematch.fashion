import { z } from 'zod';

export const createProductInputSchema = z.object({
  vendor_id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  stock_quantity: z.number().min(0, "Stock must be positive"),
  category: z.string().min(1, "Category is required"),
  color: z.array(z.string().min(1)).min(1, "At least one color required"),
  size: z.array(z.string().min(1)).min(1, "At least one size required"),
  discount_price: z.number().optional(),
  discount_start: z.date().optional(),
  discount_end: z.date().optional(),
  images: z.array(z.string().url()).optional(),
  is_hottest_offer: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const productsSchema = z.array(createProductInputSchema);
export type ProductFormValues = z.infer<typeof productsSchema>;

export const productSchema = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  stock_quantity: z.number().min(0),
  category: z.string().min(1),
  color: z.union([z.string(), z.array(z.string())]).transform(val => 
    typeof val === 'string' ? [val] : val
  ),
  size: z.union([z.string(), z.array(z.string())]).transform(val => 
    typeof val === 'string' ? [val] : val
  ),
  discount_price: z.number().nullable().optional(),
  discount_start: z.string().nullable().optional().transform(val => 
    val ? new Date(val) : undefined
  ),
  discount_end: z.string().nullable().optional().transform(val => 
    val ? new Date(val) : undefined
  ),
  images: z.array(z.string().url()).optional(),
  is_hottest_offer: z.boolean().default(false),
  created_at: z.string().transform(val => new Date(val)),
  updated_at: z.string().transform(val => new Date(val)),
});

export type Product = z.infer<typeof productSchema>;

export interface ProductWithSales extends Product {
  sales: number;
  sales_count?: number;
}
