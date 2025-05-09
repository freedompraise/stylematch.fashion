// order.ts

import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'Pending',
  'Confirmed',
  'Processing',
  'Delivered',
  'Cancelled',
  'Completed',
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  size: z.string(),
  color: z.string(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  status: orderStatusSchema,
  delivery_location: z.string(),
  delivery_date: z.string(), // ISO string
  total_amount: z.number().min(0),
  created_at: z.string(), // ISO string
  updated_at: z.string(), // ISO string
  customer_info: z.object({
    name: z.string(),
    phone: z.string(),
    email:z.string().email(),
    address: z.string(),
  }),
});
export type Order = z.infer<typeof orderSchema>;
