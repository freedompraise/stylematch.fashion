// src/types/index.ts
export * from './VendorSchema';
export * from './ProductSchema';
export * from './OrderSchema';

// Re-export commonly used types
export type { VendorProfile, CreateVendorProfileInput, VerificationStatus } from './VendorSchema';
export type { Product, CreateProductInput, ProductFormValues } from './ProductSchema';
export type { Order, OrderStatus, CustomerInfo, CreateOrderInput } from './OrderSchema';

