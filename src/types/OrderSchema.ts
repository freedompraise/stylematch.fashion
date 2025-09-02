
// src/types/OrderSchema.ts
import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'pending',
  'confirmed', 
  'processing',
  'delivered',
  'cancelled',
  'completed',
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const customerInfoSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
});

export const orderSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  status: orderStatusSchema,
  delivery_location: z.string(),
  delivery_date: z.string(), // ISO date string
  total_amount: z.number().int().min(0),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  customer_info: customerInfoSchema,
});

export type Order = z.infer<typeof orderSchema>;
export type CustomerInfo = z.infer<typeof customerInfoSchema>;

export const createOrderSchema = z.object({
  product_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  status: orderStatusSchema.optional(),
  delivery_location: z.string(),
  delivery_date: z.string(), // ISO date string
  total_amount: z.number().int().min(0),
  customer_info: customerInfoSchema,
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
