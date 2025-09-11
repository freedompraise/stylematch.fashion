// src/types/VariantSchema.ts
import { z } from 'zod';

// Product Variant Schema
export const productVariantSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  sku: z.string().optional(),
  size_value: z.string().optional(),
  color_value: z.string().optional(),
  color_hex_code: z.string().optional(),
  stock_quantity: z.number().int().min(0),
  price: z.number().positive().optional(),
  is_available: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ProductVariant = z.infer<typeof productVariantSchema>;

// Product Attribute Schema
export const productAttributeSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  attribute_type: z.enum(['size', 'color']),
  attribute_value: z.string(),
  attribute_display_name: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ProductAttribute = z.infer<typeof productAttributeSchema>;

// Variant Image Schema
export const variantImageSchema = z.object({
  id: z.string().uuid(),
  variant_id: z.string().uuid(),
  image_url: z.string().url(),
  image_alt_text: z.string().optional(),
  sort_order: z.number().int().default(0),
  is_primary: z.boolean().default(false),
  created_at: z.string().datetime(),
});

export type VariantImage = z.infer<typeof variantImageSchema>;

// Attribute Configuration Schema
export const attributeConfigurationSchema = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid().optional(),
  category: z.string(),
  attribute_type: z.enum(['size', 'color']),
  configuration: z.record(z.any()), // JSONB
  is_active: z.boolean().default(true),
  is_global: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type AttributeConfiguration = z.infer<typeof attributeConfigurationSchema>;

// Color Palette Schema
export const colorPaletteSchema = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid().optional(),
  name: z.string(),
  hex_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  rgb_values: z.record(z.number()).optional(),
  category: z.string().optional(),
  is_standard: z.boolean().default(false),
  is_global: z.boolean().default(false),
  created_at: z.string().datetime(),
});

export type ColorPalette = z.infer<typeof colorPaletteSchema>;

// Extended Category Schema
export const extendedCategorySchema = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid().optional(),
  parent_category_id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
  is_global: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ExtendedCategory = z.infer<typeof extendedCategorySchema>;

// Configuration Interfaces
export interface SizeConfiguration {
  type: 'standard' | 'numeric' | 'custom' | 'mixed';
  sizes: string[];
  allowCustom: boolean;
  allowMultiple: boolean;
  sizeChart?: {
    url: string;
    description: string;
  };
  validation?: {
    minSize?: string;
    maxSize?: string;
    required: boolean;
  };
}

export interface ColorConfiguration {
  type: 'standard' | 'custom' | 'mixed';
  colors: ColorOption[];
  allowCustom: boolean;
  allowMultiple: boolean;
  requireHexCode: boolean;
}

export interface ColorOption {
  name: string;
  hexCode: string;
  displayName?: string;
  isStandard: boolean;
}

// Request/Response Interfaces
export interface CreateProductVariantRequest {
  product_id: string;
  sku?: string;
  size_value?: string;
  color_value?: string;
  color_hex_code?: string;
  stock_quantity: number;
  price?: number;
  is_available?: boolean;
  sort_order?: number;
}

export interface UpdateProductVariantRequest {
  sku?: string;
  size_value?: string;
  color_value?: string;
  color_hex_code?: string;
  stock_quantity?: number;
  price?: number;
  is_available?: boolean;
  sort_order?: number;
}

export interface CreateProductAttributeRequest {
  product_id: string;
  attribute_type: 'size' | 'color';
  attribute_value: string;
  attribute_display_name?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface BulkUpdateVariantsRequest {
  variants: Array<{
    id: string;
    updates: UpdateProductVariantRequest;
  }>;
}

// Enhanced Product with Variants
export interface ProductWithVariants {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  color: string;
  size: string;
  discount_price?: number;
  discount_start?: string;
  discount_end?: string;
  images?: string[];
  vendor_id: string;
  is_hottest_offer: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at?: string;
  updated_at?: string;
  // New variant fields
  variant_type: 'simple' | 'configurable';
  base_price?: number;
  has_variants: boolean;
  total_stock: number;
  min_variant_price?: number;
  max_variant_price?: number;
  // Variant data
  variants?: ProductVariant[];
  attributes?: {
    sizes: ProductAttribute[];
    colors: ProductAttribute[];
  };
}
