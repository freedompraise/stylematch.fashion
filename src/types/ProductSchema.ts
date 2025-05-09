
import { z } from 'zod';

export const createProductInputSchema = z.object({
  vendor_id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  stock_quantity: z.number().min(0),
  category: z.string().min(1),
  color: z.string().min(1),
  size: z.string().min(1),
  discount_price: z.number().optional(),
  discount_start: z.date().optional(),
  discount_end: z.date().optional(),
  images: z.array(z.string().url()).optional(),
  is_hottest_offer: z.boolean().default(false),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const productSchema = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  stock_quantity: z.number().min(0),
  category: z.string().min(1),
  color: z.string().min(1),
  size: z.string().min(1),
  discount_price: z.number().optional(),
  discount_start: z.date().optional(),
  discount_end: z.date().optional(),
  images: z.array(z.string().url()).optional(),
  is_hottest_offer: z.boolean().default(false),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Product = z.infer<typeof productSchema>;
