
// src/types/OrderSchema.ts
import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'pending',
  'payment_pending',
  'payment_verified',
  'payment_rejected',
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
  delivery_date: z.string().nullable(), // Date string from database, null until vendor sets it
  total_amount: z.number().int().min(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  customer_info: customerInfoSchema,
  // Manual payment fields
  payment_proof_urls: z.array(z.string()).optional(),
  transaction_reference: z.string().optional(),
  payment_status: z.enum(['pending', 'verified', 'rejected']).optional(),
  payment_verified_at: z.string().optional(),
  payment_verified_by: z.string().uuid().optional(),
  expires_at: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    price: z.number().int().min(0),
    size: z.string().optional(),
    color: z.string().optional(),
  })).optional(),
});

export type Order = z.infer<typeof orderSchema>;
export type CustomerInfo = z.infer<typeof customerInfoSchema>;

export const createOrderSchema = z.object({
  product_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  status: orderStatusSchema.optional(),
  delivery_location: z.string(),
  delivery_date: z.string().optional(), // ISO date string, optional for buyer input
  total_amount: z.number().int().min(0),
  customer_info: customerInfoSchema,
  // Manual payment fields
  payment_proof_urls: z.array(z.string()).optional(),
  transaction_reference: z.string().optional(),
  payment_status: z.enum(['pending', 'verified', 'rejected']).optional(),
  expires_at: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    price: z.number().int().min(0),
    size: z.string().optional(),
    color: z.string().optional(),
  })).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
