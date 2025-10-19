# StyleMatch Product Attributes Migration Specification

## Overview

This migration transforms the hardcoded size and color systems into a dynamic, category-aware, and scalable product attribute management system that supports multiple sizes per product, size-specific inventory, and enhanced color management.

---

## 1. Database Schema Changes

### 1.1 New Tables

#### Product Variants Table (Core Entity)

```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE, -- Vendor-generated SKU
  size_value VARCHAR(50),
  color_value VARCHAR(50),
  color_hex_code VARCHAR(7), -- For color variants
  stock_quantity INTEGER DEFAULT 0,
  price DECIMAL(10,2), -- Variant-specific price (optional)
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique combinations per product
  UNIQUE(product_id, size_value, color_value)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_available ON product_variants(is_available);
CREATE INDEX idx_product_variants_stock ON product_variants(stock_quantity);
```

#### Product Attributes Table (Configuration Reference)

```sql
CREATE TABLE product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_type VARCHAR(20) NOT NULL CHECK (attribute_type IN ('size', 'color')),
  attribute_value VARCHAR(100) NOT NULL,
  attribute_display_name VARCHAR(100), -- For custom display names
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(product_id, attribute_type, attribute_value)
);

CREATE INDEX idx_product_attributes_product_id ON product_attributes(product_id);
CREATE INDEX idx_product_attributes_type ON product_attributes(attribute_type);
CREATE INDEX idx_product_attributes_active ON product_attributes(is_active);
```

#### Attribute Configurations Table (Vendor-Specific)

```sql
CREATE TABLE attribute_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE, -- NULL for global configs
  category VARCHAR(50) NOT NULL,
  attribute_type VARCHAR(20) NOT NULL CHECK (attribute_type IN ('size', 'color')),
  configuration JSONB NOT NULL, -- Flexible configuration per category
  is_active BOOLEAN DEFAULT true,
  is_global BOOLEAN DEFAULT false, -- Global vs vendor-specific configs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Allow global configs (vendor_id = NULL) and vendor-specific configs
  UNIQUE(vendor_id, category, attribute_type)
);

CREATE INDEX idx_attribute_configs_vendor ON attribute_configurations(vendor_id);
CREATE INDEX idx_attribute_configs_category ON attribute_configurations(category);
CREATE INDEX idx_attribute_configs_type ON attribute_configurations(attribute_type);
CREATE INDEX idx_attribute_configs_global ON attribute_configurations(is_global);
```

#### Color Palette Table (Global + Vendor-Specific)

```sql
CREATE TABLE color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE, -- NULL for global colors
  name VARCHAR(100) NOT NULL,
  hex_code VARCHAR(7) NOT NULL, -- #RRGGBB format
  rgb_values JSONB, -- {"r": 255, "g": 0, "b": 0}
  category VARCHAR(50), -- Optional category-specific colors
  is_standard BOOLEAN DEFAULT false, -- Standard colors vs custom
  is_global BOOLEAN DEFAULT false, -- Global vs vendor-specific colors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Allow global colors (vendor_id = NULL) and vendor-specific colors
  UNIQUE(vendor_id, name, hex_code)
);

CREATE INDEX idx_color_palettes_vendor ON color_palettes(vendor_id);
CREATE INDEX idx_color_palettes_category ON color_palettes(category);
CREATE INDEX idx_color_palettes_standard ON color_palettes(is_standard);
CREATE INDEX idx_color_palettes_global ON color_palettes(is_global);
```

#### Product Variant Images Table

```sql
CREATE TABLE product_variant_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_alt_text VARCHAR(200),
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(variant_id, image_url)
);

CREATE INDEX idx_variant_images_variant ON product_variant_images(variant_id);
CREATE INDEX idx_variant_images_primary ON product_variant_images(is_primary);
```

#### Extended Categories Table

```sql
CREATE TABLE extended_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE, -- NULL for global extended categories (future vendor categories)
  parent_category_id VARCHAR(50) NOT NULL, -- References core category from constants
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  is_global BOOLEAN DEFAULT true, -- Initially all global, vendor-specific in future
  sort_order INTEGER DEFAULT 0,
  seo_title VARCHAR(200),
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique slugs per vendor/parent category
  UNIQUE(vendor_id, parent_category_id, slug)
);

CREATE INDEX idx_extended_categories_vendor ON extended_categories(vendor_id);
CREATE INDEX idx_extended_categories_parent ON extended_categories(parent_category_id);
CREATE INDEX idx_extended_categories_active ON extended_categories(is_active);
CREATE INDEX idx_extended_categories_global ON extended_categories(is_global);
```

### 1.2 Products Table Updates

```sql
-- Add new columns to products table
ALTER TABLE products
ADD COLUMN variant_type VARCHAR(20) DEFAULT 'simple', -- 'simple', 'configurable'
ADD COLUMN base_price DECIMAL(10,2), -- Base price for simple products
ADD COLUMN has_variants BOOLEAN DEFAULT false,
ADD COLUMN total_stock INTEGER DEFAULT 0, -- Computed from variants
ADD COLUMN min_variant_price DECIMAL(10,2), -- Computed from variants
ADD COLUMN max_variant_price DECIMAL(10,2); -- Computed from variants

-- Update existing products to reflect new structure
UPDATE products SET
  variant_type = 'simple',
  has_variants = false,
  total_stock = stock_quantity,
  base_price = price,
  min_variant_price = price,
  max_variant_price = price;
```

### 1.3 Orders Table Updates (Future-Proofing)

```sql
-- Update orders to reference specific variants
ALTER TABLE order_items
ADD COLUMN variant_id UUID REFERENCES product_variants(id),
ADD COLUMN variant_sku VARCHAR(100),
ADD COLUMN variant_size VARCHAR(50),
ADD COLUMN variant_color VARCHAR(50);

-- Create index for variant-based order queries
CREATE INDEX idx_order_items_variant ON order_items(variant_id);
```

---

## 1.4 Architectural Improvements

### **Key Architectural Changes**

#### **1. Variant-Centric Model**

- **Before**: Attributes stored separately, complex queries to determine available combinations
- **After**: `product_variants` table represents actual sellable units with clear inventory tracking

#### **2. Vendor-Specific Configurations**

- **Before**: Global configurations only, no vendor customization
- **After**: Support for both global and vendor-specific attribute configurations
- **Benefit**: Allows vendors to have custom size charts, color palettes, and attribute rules

#### **3. Clear Separation of Concerns**

- **Configuration**: `product_attributes` table stores what attributes a product can have
- **Data**: `product_variants` table stores actual inventory and pricing per variant
- **Global Config**: `attribute_configurations` table defines available options per category
- **Vendor Config**: Vendor-specific overrides and customizations

#### **4. Future-Proofing for Marketplace Features**

- **Multi-vendor support**: Same product can be sold by different vendors with different variants
- **AI matching**: Structured variant data enables intelligent product recommendations
- **Analytics**: Clear variant tracking enables detailed sales analytics
- **Order fulfillment**: Direct variant-to-order relationship simplifies fulfillment

#### **5. Hybrid Category Management**

- **Core Categories**: Fast, reliable access to essential fashion categories
- **Global Extended Categories**: Business-managed seasonal/trending categories
- **Future Vendor Categories**: Vendor-specific subcategories (planned for future release)
- **Performance**: Core categories load instantly, extended categories load on-demand
- **Scalability**: Supports both simple and complex category hierarchies

### **Data Flow Architecture**

```
Product Creation Flow:
1. Vendor selects category → Loads global + vendor-specific attribute configs
2. Vendor defines available sizes/colors → Stored in product_attributes
3. Vendor creates variants → Stored in product_variants with inventory/pricing
4. System computes product totals → Updates product.total_stock, min/max prices

Order Processing Flow:
1. Customer selects variant → Order references specific variant_id
2. Inventory check → Direct query on product_variants.stock_quantity
3. Fulfillment → Clear variant identification for shipping
4. Analytics → Track sales per variant for insights
```

---

## 2. Configuration System

### 2.1 Category Management Strategy

**Architectural Decision**: Maintain **hybrid category management** for optimal performance and flexibility:

#### **Core Categories (Local Constants)**

- **Primary Categories**: Keep core fashion categories in `src/constants/categories.ts`
- **Performance**: Instant access, no database dependency
- **Stability**: Rarely change, version-controlled
- **Type Safety**: Full TypeScript support

#### **Extended Categories (Database)**

- **Global Extended Categories**: Business users can add seasonal/trending categories
- **International Categories**: Region-specific category variations
- **Category Metadata**: Rich descriptions, images, SEO data
- **Future Vendor Categories**: Vendor-specific subcategories (planned for future release)

#### **Implementation Strategy**

```typescript
// src/constants/categories.ts - Core categories (unchanged)
export const CORE_CATEGORIES: Category[] = [
  { id: "dresses", name: "Dresses", slug: "dresses" },
  { id: "tops", name: "Tops", slug: "tops" },
  { id: "bottoms", name: "Bottoms", slug: "bottoms" },
  // ... existing categories
];

// src/services/categoryService.ts - Extended categories
export const getAllCategories = async (
  vendorId?: string
): Promise<Category[]> => {
  const coreCategories = CORE_CATEGORIES;
  const extendedCategories = await fetchExtendedCategories(vendorId);
  return [...coreCategories, ...extendedCategories];
};
```

### 2.2 Size Configurations

```typescript
// src/types/AttributeConfiguration.ts
interface SizeConfiguration {
  type: "standard" | "numeric" | "custom" | "mixed";
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

// Default configurations that extend existing categories
const DEFAULT_SIZE_CONFIGURATIONS: Record<string, SizeConfiguration> = {
  // These should align with existing categories in src/constants/categories.ts
  tops: {
    type: "standard",
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"],
    allowCustom: true,
    allowMultiple: true,
    sizeChart: {
      url: "/size-charts/tops",
      description: "Standard clothing sizes",
    },
  },
  bottoms: {
    type: "standard",
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"],
    allowCustom: true,
    allowMultiple: true,
  },
  shoes: {
    type: "numeric",
    sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    allowCustom: true,
    allowMultiple: true,
    validation: {
      minSize: "6",
      maxSize: "13",
      required: true,
    },
  },
  accessories: {
    type: "custom",
    sizes: ["One Size", "Small", "Medium", "Large"],
    allowCustom: true,
    allowMultiple: false,
  },
  jewelry: {
    type: "custom",
    sizes: ["Small", "Medium", "Large", "One Size"],
    allowCustom: true,
    allowMultiple: false,
  },
};
```

### 2.3 Color Configurations

```typescript
interface ColorConfiguration {
  type: "standard" | "custom" | "mixed";
  colors: ColorOption[];
  allowCustom: boolean;
  allowMultiple: boolean;
  requireHexCode: boolean;
}

interface ColorOption {
  name: string;
  hexCode: string;
  displayName?: string;
  isStandard: boolean;
}

// Default configurations that extend existing categories
const DEFAULT_COLOR_CONFIGURATIONS: Record<string, ColorConfiguration> = {
  // These should align with existing categories in src/constants/categories.ts
  clothing: {
    type: "standard",
    colors: [
      { name: "black", hexCode: "#000000", isStandard: true },
      { name: "white", hexCode: "#FFFFFF", isStandard: true },
      { name: "red", hexCode: "#FF0000", isStandard: true },
      { name: "blue", hexCode: "#0000FF", isStandard: true },
      { name: "green", hexCode: "#008000", isStandard: true },
      { name: "yellow", hexCode: "#FFFF00", isStandard: true },
      { name: "purple", hexCode: "#800080", isStandard: true },
      { name: "pink", hexCode: "#FFC0CB", isStandard: true },
      { name: "navy", hexCode: "#000080", isStandard: true },
      { name: "gray", hexCode: "#808080", isStandard: true },
    ],
    allowCustom: true,
    allowMultiple: true,
    requireHexCode: true,
  },
  shoes: {
    type: "standard",
    colors: [
      { name: "black", hexCode: "#000000", isStandard: true },
      { name: "white", hexCode: "#FFFFFF", isStandard: true },
      { name: "brown", hexCode: "#8B4513", isStandard: true },
      { name: "tan", hexCode: "#D2B48C", isStandard: true },
      { name: "gray", hexCode: "#808080", isStandard: true },
    ],
    allowCustom: true,
    allowMultiple: true,
    requireHexCode: true,
  },
};
```

### 2.4 Configuration Loading Strategy

```typescript
// src/services/attributeConfigurationService.ts
export const getAttributeConfiguration = async (
  category: string,
  attributeType: "size" | "color",
  vendorId?: string
): Promise<SizeConfiguration | ColorConfiguration> => {
  // 1. Try to load vendor-specific configuration
  if (vendorId) {
    const vendorConfig = await fetchVendorAttributeConfiguration(
      vendorId,
      category,
      attributeType
    );
    if (vendorConfig) return vendorConfig.configuration;
  }

  // 2. Try to load global configuration from database
  const globalConfig = await fetchGlobalAttributeConfiguration(
    category,
    attributeType
  );
  if (globalConfig) return globalConfig.configuration;

  // 3. Fallback to local constants
  if (attributeType === "size") {
    return (
      DEFAULT_SIZE_CONFIGURATIONS[category] ||
      DEFAULT_SIZE_CONFIGURATIONS.accessories
    );
  } else {
    return (
      DEFAULT_COLOR_CONFIGURATIONS[category] ||
      DEFAULT_COLOR_CONFIGURATIONS.clothing
    );
  }
};
```

---

## 3. Service Layer Changes

### 3.1 New Service Functions

#### Product Variants Service

```typescript
// src/services/productVariantService.ts
interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  size_value?: string;
  color_value?: string;
  color_hex_code?: string;
  stock_quantity: number;
  price?: number;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface VariantImage {
  id: string;
  variant_id: string;
  image_url: string;
  image_alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

// Service functions to implement:
export const fetchProductVariants = async (productId: string): Promise<ProductVariant[]>
export const createProductVariant = async (variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>): Promise<ProductVariant>
export const updateProductVariant = async (variantId: string, updates: Partial<ProductVariant>): Promise<ProductVariant>
export const deleteProductVariant = async (variantId: string): Promise<void>
export const bulkUpdateVariants = async (updates: Array<{id: string, updates: Partial<ProductVariant>}>): Promise<ProductVariant[]>
```

#### Product Attributes Service

```typescript
// src/services/productAttributeService.ts
interface ProductAttribute {
  id: string;
  product_id: string;
  attribute_type: 'size' | 'color';
  attribute_value: string;
  attribute_display_name?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Service functions to implement:
export const fetchProductAttributes = async (productId: string): Promise<ProductAttribute[]>
export const createProductAttribute = async (attribute: Omit<ProductAttribute, 'id' | 'created_at' | 'updated_at'>): Promise<ProductAttribute>
export const updateProductAttribute = async (attributeId: string, updates: Partial<ProductAttribute>): Promise<ProductAttribute>
export const deleteProductAttribute = async (attributeId: string): Promise<void>
```

#### Attribute Configuration Service

```typescript
// src/services/attributeConfigurationService.ts
interface AttributeConfiguration {
  id: string;
  vendor_id?: string; // NULL for global configs
  category: string;
  attribute_type: 'size' | 'color';
  configuration: SizeConfiguration | ColorConfiguration;
  is_active: boolean;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

// Service functions to implement:
export const fetchGlobalAttributeConfigurations = async (): Promise<Record<string, AttributeConfiguration[]>>
export const fetchVendorAttributeConfigurations = async (vendorId: string): Promise<Record<string, AttributeConfiguration[]>>
export const updateVendorAttributeConfiguration = async (vendorId: string, category: string, attributeType: 'size' | 'color', configuration: SizeConfiguration | ColorConfiguration): Promise<AttributeConfiguration>
export const updateGlobalAttributeConfiguration = async (category: string, attributeType: 'size' | 'color', configuration: SizeConfiguration | ColorConfiguration): Promise<AttributeConfiguration>
```

#### Category Service

```typescript
// src/services/categoryService.ts
interface ExtendedCategory {
  id: string;
  vendor_id?: string; // NULL for global categories (vendor categories in future)
  parent_category_id: string; // References core category
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  is_global: boolean; // Initially all true, vendor-specific in future
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

// Service functions to implement (Phase 1 - Global Extended Categories Only):
export const getAllCategories = async (): Promise<Category[]> // Combines core + global extended
export const fetchGlobalExtendedCategories = async (): Promise<ExtendedCategory[]>
export const createGlobalExtendedCategory = async (category: Omit<ExtendedCategory, 'id' | 'vendor_id' | 'is_global' | 'created_at' | 'updated_at'>): Promise<ExtendedCategory>
export const updateGlobalExtendedCategory = async (categoryId: string, updates: Partial<ExtendedCategory>): Promise<ExtendedCategory>
export const deleteGlobalExtendedCategory = async (categoryId: string): Promise<void>
export const getCategoryHierarchy = async (parentCategoryId: string): Promise<ExtendedCategory[]>

// Future service functions (Phase 2 - Vendor Categories):
// export const fetchVendorExtendedCategories = async (vendorId: string): Promise<ExtendedCategory[]>
// export const createVendorExtendedCategory = async (vendorId: string, category: Omit<ExtendedCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ExtendedCategory>
```

### 3.2 Updated Store Functions

#### Vendor Store Updates

```typescript
// src/stores/vendorStore.ts - New functions to add:
export const fetchProductVariants = async (productId: string, useCache = true): Promise<ProductVariant[]>
export const createProductVariant = async (variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>): Promise<ProductVariant>
export const updateProductVariant = async (variantId: string, updates: Partial<ProductVariant>): Promise<ProductVariant>
export const deleteProductVariant = async (variantId: string): Promise<void>
export const bulkUpdateVariants = async (updates: Array<{id: string, updates: Partial<ProductVariant>}>): Promise<ProductVariant[]>

// Updated existing functions:
export const createProduct = async (productData: CreateProductRequest): Promise<Product>
export const updateProduct = async (productId: string, updates: UpdateProductRequest): Promise<Product>
```

### 3.3 Type Definitions

#### Updated Product Types

```typescript
// src/types/ProductSchema.ts - Updates needed:
interface Product {
  // ... existing fields
  variant_type: "simple" | "configurable";
  base_price?: number;
  has_variants: boolean;
  total_stock: number;
  min_variant_price?: number;
  max_variant_price?: number;
  variants?: ProductVariant[];
  attributes?: {
    sizes: ProductAttribute[];
    colors: ProductAttribute[];
  };
}

interface CreateProductRequest {
  // ... existing fields
  variant_type: "simple" | "configurable";
  base_price?: number;
  variants?: Array<{
    sku?: string;
    size_value?: string;
    color_value?: string;
    color_hex_code?: string;
    stock_quantity: number;
    price?: number;
    images?: Array<{
      url: string;
      alt_text?: string;
      is_primary?: boolean;
    }>;
  }>;
  attributes?: {
    sizes?: string[];
    colors?: Array<{
      value: string;
      hex_code?: string;
    }>;
  };
}
```

---

## 4. Frontend Component Updates

### 4.1 Component Architecture Alignment

**Note**: All updates should follow StyleMatch's existing architecture patterns:

- Components should be vendor/user agnostic (except settings pages)
- Business logic belongs in services/stores, not components
- Use existing patterns from `AddProductDialog.tsx` and `EditProductDialog.tsx`
- Follow the established error handling and loading patterns

### 4.2 Required Component Updates

#### AddProductDialog.tsx Updates

- **Replace hardcoded arrays**: Remove hardcoded size/color arrays from `src/constants/categories.ts`
- **Dynamic attribute loading**: Load available sizes/colors from attribute configurations based on selected category
- **Multi-variant support**: Add UI for creating multiple variants (size + color combinations)
- **Variant management**: Allow setting stock quantity and pricing per variant
- **Image per variant**: Support uploading different images for different color variants
- **Form validation**: Update Zod schemas to handle variant data structure
- **Store integration**: Use new `createProduct` function that handles variants

#### EditProductDialog.tsx Updates

- **Variant editing**: Display and edit existing product variants
- **Attribute management**: Add/remove available sizes and colors for the product
- **Stock management**: Update stock quantities per variant
- **Pricing updates**: Modify pricing per variant
- **Image management**: Handle variant-specific images
- **Bulk operations**: Support bulk updates for multiple variants
- **Store integration**: Use updated `updateProduct` function

#### ProductImageUpload.tsx Updates

- **Variant context**: Accept variant information to associate images with specific variants
- **Multiple images**: Support multiple images per variant with primary image selection
- **Color-specific images**: Allow different images for different color variants
- **Image organization**: Better organization of images by variant

### 4.3 New Components to Create

#### ProductVariantSelector.tsx

- **Purpose**: Select and manage product variants (size + color combinations)
- **Props**: Category, available sizes/colors, selected variants, onChange callback
- **Features**: Multi-select, stock quantity input, pricing input per variant
- **Integration**: Use attribute configurations from service layer

#### AttributeConfigurationLoader.tsx

- **Purpose**: Load and manage attribute configurations for categories
- **Props**: Category, vendor ID (optional), onConfigLoad callback
- **Features**: Load global + vendor-specific configurations, merge and provide to parent
- **Integration**: Use `attributeConfigurationService`

#### VariantStockManager.tsx

- **Purpose**: Manage stock quantities across all variants
- **Props**: Variants array, onStockUpdate callback
- **Features**: Bulk stock updates, individual variant stock management
- **Integration**: Use `bulkUpdateVariants` from store

### 4.4 Configuration Integration

#### Category-Based Attribute Loading

- **Source**: Use existing `src/constants/categories.ts` as base
- **Enhancement**: Load additional attribute configurations from database
- **Fallback**: Use local constants when database configs are not available
- **Vendor Override**: Allow vendor-specific configurations to override global ones

#### Size and Color Management

- **Size Configurations**: Load from `attribute_configurations` table based on category
- **Color Palettes**: Load from `color_palettes` table (global + vendor-specific)
- **Custom Attributes**: Allow vendors to add custom sizes/colors beyond standard options
- **Validation**: Ensure custom attributes follow category-specific rules

---

## 5. Migration Strategy

### 5.1 Phase 1: Database Setup (Week 1)

1. Create new tables (product_variants, product_attributes, attribute_configurations, color_palettes, extended_categories)
2. Set up global attribute configurations
3. Populate global color palette table
4. Create database indexes and constraints
5. Set up global extended categories (vendor categories in future)

### 5.2 Phase 2: Service Layer Implementation (Week 2-3)

1. Create new service files (`productVariantService.ts`, `productAttributeService.ts`, `attributeConfigurationService.ts`, `categoryService.ts`)
2. Update existing `vendorDataService.ts` to handle variants
3. Add validation and business logic in services
4. Update store functions to use new services
5. Implement global extended category management (vendor categories in future)

### 5.3 Phase 3: Frontend Components (Week 4-5)

1. Update existing `AddProductDialog.tsx` and `EditProductDialog.tsx` to support variants
2. Create new components (`ProductVariantSelector.tsx`, `AttributeConfigurationLoader.tsx`, `VariantStockManager.tsx`)
3. Update `ProductImageUpload.tsx` for variant-specific images
4. Integrate with existing store patterns and error handling
5. Add admin UI for global extended category management (vendor category UI in future)

### 5.4 Phase 4: Data Migration (Week 6)

1. Migrate existing product sizes to new structure
2. Migrate existing product colors to new structure
3. Update product records with new fields
4. Validate data integrity

### 5.5 Phase 5: Testing & Optimization (Week 7-8)

1. Comprehensive testing of new features
2. Performance optimization
3. User acceptance testing
4. Documentation updates

### 5.6 Future Phases (Post-Launch)

#### Phase 6: Vendor Category Management (Future Release)

1. Enable vendor-specific extended categories
2. Add vendor category creation UI
3. Implement vendor category permissions and validation
4. Add vendor category analytics and reporting

#### Phase 7: Advanced Category Features (Future Release)

1. Category hierarchy management (subcategories of subcategories)
2. Category-based pricing rules
3. Category-specific SEO optimization
4. Category analytics and insights

---

## 6. Data Migration Scripts

### 6.1 Product Variants Migration

```sql
-- Step 1: Create variants for existing products
INSERT INTO product_variants (
  product_id,
  size_value,
  color_value,
  stock_quantity,
  price,
  is_available
)
SELECT
  id as product_id,
  COALESCE(size, 'One Size') as size_value,
  COALESCE(color, 'Default') as color_value,
  stock_quantity,
  price,
  true as is_available
FROM products
WHERE id IS NOT NULL;

-- Step 2: Create product attributes for existing products
INSERT INTO product_attributes (product_id, attribute_type, attribute_value, is_active)
SELECT DISTINCT
  id as product_id,
  'size' as attribute_type,
  COALESCE(size, 'One Size') as attribute_value,
  true as is_active
FROM products
WHERE size IS NOT NULL AND size != '';

INSERT INTO product_attributes (product_id, attribute_type, attribute_value, is_active)
SELECT DISTINCT
  id as product_id,
  'color' as attribute_type,
  COALESCE(color, 'Default') as attribute_value,
  true as is_active
FROM products
WHERE color IS NOT NULL AND color != '';

-- Step 3: Update products table with new structure
UPDATE products SET
  variant_type = 'simple',
  has_variants = true,
  total_stock = stock_quantity,
  base_price = price,
  min_variant_price = price,
  max_variant_price = price
WHERE id IS NOT NULL;
```

### 6.2 Global Attribute Configurations Setup

```sql
-- Insert global size configurations
INSERT INTO attribute_configurations (category, attribute_type, configuration, is_global)
VALUES
  ('tops', 'size', '{"type": "standard", "sizes": ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"], "allowCustom": true, "allowMultiple": true}', true),
  ('bottoms', 'size', '{"type": "standard", "sizes": ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"], "allowCustom": true, "allowMultiple": true}', true),
  ('shoes', 'size', '{"type": "numeric", "sizes": ["6", "7", "8", "9", "10", "11", "12", "13"], "allowCustom": true, "allowMultiple": true}', true),
  ('accessories', 'size', '{"type": "custom", "sizes": ["One Size", "Small", "Medium", "Large"], "allowCustom": true, "allowMultiple": false}', true);

-- Insert global color configurations
INSERT INTO attribute_configurations (category, attribute_type, configuration, is_global)
VALUES
  ('clothing', 'color', '{"type": "standard", "colors": [{"name": "black", "hexCode": "#000000", "isStandard": true}, {"name": "white", "hexCode": "#FFFFFF", "isStandard": true}, {"name": "red", "hexCode": "#FF0000", "isStandard": true}, {"name": "blue", "hexCode": "#0000FF", "isStandard": true}], "allowCustom": true, "allowMultiple": true, "requireHexCode": true}', true),
  ('shoes', 'color', '{"type": "standard", "colors": [{"name": "black", "hexCode": "#000000", "isStandard": true}, {"name": "white", "hexCode": "#FFFFFF", "isStandard": true}, {"name": "brown", "hexCode": "#8B4513", "isStandard": true}], "allowCustom": true, "allowMultiple": true, "requireHexCode": true}', true);
```

### 6.3 Global Color Palette Setup

```sql
-- Insert standard global colors
INSERT INTO color_palettes (name, hex_code, rgb_values, is_standard, is_global)
VALUES
  ('Black', '#000000', '{"r": 0, "g": 0, "b": 0}', true, true),
  ('White', '#FFFFFF', '{"r": 255, "g": 255, "b": 255}', true, true),
  ('Red', '#FF0000', '{"r": 255, "g": 0, "b": 0}', true, true),
  ('Blue', '#0000FF', '{"r": 0, "g": 0, "b": 255}', true, true),
  ('Green', '#008000', '{"r": 0, "g": 128, "b": 0}', true, true),
  ('Yellow', '#FFFF00', '{"r": 255, "g": 255, "b": 0}', true, true),
  ('Purple', '#800080', '{"r": 128, "g": 0, "b": 128}', true, true),
  ('Pink', '#FFC0CB', '{"r": 255, "g": 192, "b": 203}', true, true),
  ('Navy', '#000080', '{"r": 0, "g": 0, "b": 128}', true, true),
  ('Gray', '#808080', '{"r": 128, "g": 128, "b": 128}', true, true);
```

---

## 7. Rollback Plan

### 7.1 Database Rollback

- Keep existing size/color columns during migration
- Create rollback scripts to restore original structure
- Maintain data backup before migration

### 7.2 Application Rollback

- Feature flags for new attribute system
- Gradual rollout with fallback to old system
- Monitoring and alerting for issues

---

## 8. Success Metrics

### 8.1 Technical Metrics

- API response times for attribute operations
- Database query performance
- Error rates during migration
- Data integrity validation

### 8.2 Business Metrics

- Product creation completion rates
- Time to create products with multiple attributes
- User satisfaction with new attribute system
- Inventory management efficiency

---

## 9. Future Enhancements

### 9.1 Advanced Features

- Size recommendation engine
- Color trend analysis
- Bulk attribute management
- Attribute-based pricing rules
- Size chart integration
- Color matching algorithms

### 9.2 Integration Opportunities

- ERP system integration
- Inventory management systems
- Analytics and reporting
- Customer preference tracking

---

## 10. Implementation Checklist

### 10.1 Pre-Migration

- [ ] Backup existing database
- [ ] Review and approve migration plan
- [ ] Set up staging environment
- [ ] Create rollback procedures
- [ ] Notify stakeholders

### 10.2 Database Changes

- [ ] Create new tables
- [ ] Add indexes and constraints
- [ ] Update existing table structure
- [ ] Test database performance
- [ ] Validate data integrity

### 10.3 Service Layer Implementation

- [ ] Create new service files (`productVariantService.ts`, `productAttributeService.ts`, `attributeConfigurationService.ts`)
- [ ] Update existing `vendorDataService.ts` to handle variants
- [ ] Add validation logic in services
- [ ] Update store functions to use new services
- [ ] Test service functionality

### 10.4 Frontend Implementation

- [ ] Update existing `AddProductDialog.tsx` and `EditProductDialog.tsx`
- [ ] Create new components (`ProductVariantSelector.tsx`, `AttributeConfigurationLoader.tsx`, `VariantStockManager.tsx`)
- [ ] Update `ProductImageUpload.tsx` for variant support
- [ ] Integrate with existing store patterns
- [ ] Add admin UI for global extended category management
- [ ] Test user interface
- [ ] **Future**: Add vendor category creation UI (Phase 6)

### 10.5 Testing & Deployment

- [ ] Unit testing
- [ ] Integration testing
- [ ] User acceptance testing
- [ ] Performance testing
- [ ] Production deployment
- [ ] Post-deployment monitoring

---

## 11. Risk Assessment

### 11.1 High Risk

- Data loss during migration
- Performance degradation
- User experience disruption
- API compatibility issues

### 11.2 Medium Risk

- Increased complexity
- Training requirements
- Third-party integration issues
- Timeline delays

### 11.3 Low Risk

- Minor UI adjustments
- Documentation updates
- Feature flag management
- Monitoring setup

---

## 12. Architectural Summary & Benefits

### **Critical Architectural Improvements**

#### **1. Variant-Centric Data Model**

- **Core Entity**: `product_variants` represents actual sellable units
- **Clear Inventory**: Each variant has explicit stock quantity and pricing
- **Order Fulfillment**: Direct variant-to-order relationship eliminates ambiguity
- **Analytics Ready**: Structured data enables detailed sales insights

#### **2. Vendor-Specific Customization**

- **Global Configurations**: Standard attribute options for all vendors
- **Vendor Overrides**: Custom size charts, color palettes, and attribute rules
- **Marketplace Flexibility**: Supports diverse vendor needs while maintaining consistency
- **Scalable**: Easy to add new vendors with unique requirements

#### **3. Clear Separation of Concerns**

- **Configuration Layer**: What attributes are available (product_attributes, attribute_configurations)
- **Data Layer**: Actual inventory and pricing (product_variants)
- **Global Standards**: Marketplace-wide consistency (global configurations)
- **Vendor Customization**: Individual vendor preferences (vendor-specific configurations)

#### **4. Future-Proofing for Marketplace Evolution**

- **Multi-Vendor Support**: Same product can be sold by different vendors
- **AI-Driven Features**: Structured variant data enables intelligent recommendations
- **Advanced Analytics**: Detailed tracking of variant performance
- **Integration Ready**: Clean APIs for ERP, inventory management, and third-party systems

### **Business Impact**

#### **For Vendors**

- **Flexible Product Creation**: Support for complex product variations
- **Accurate Inventory Management**: Real-time stock tracking per variant
- **Custom Branding**: Vendor-specific size charts and color palettes
- **Pricing Flexibility**: Different prices for different variants
- **Better Analytics**: Understand which variants sell best

#### **For Customers**

- **Accurate Availability**: See exactly what's in stock
- **Better Search**: Filter by specific sizes and colors
- **Clear Pricing**: Transparent pricing per variant
- **Improved Experience**: Faster checkout with variant selection

#### **For StyleMatch Platform**

- **Scalable Architecture**: Supports growth without major rewrites
- **Data-Driven Decisions**: Rich analytics for business optimization
- **Marketplace Features**: Foundation for advanced marketplace functionality
- **Competitive Advantage**: Modern, flexible product management system

### **Technical Benefits**

#### **Database Performance**

- **Optimized Queries**: Direct variant lookups instead of complex joins
- **Efficient Indexing**: Strategic indexes for common query patterns
- **Scalable Storage**: Normalized structure prevents data duplication

#### **API Design**

- **RESTful Endpoints**: Clear, predictable API structure
- **Bulk Operations**: Efficient handling of multiple variants
- **Flexible Responses**: Rich data for frontend consumption

#### **Developer Experience**

- **Clear Data Model**: Obvious relationships and responsibilities
- **Type Safety**: Strong TypeScript interfaces
- **Maintainable Code**: Separation of concerns reduces complexity

## 13. Conclusion

This revised migration specification addresses critical architectural concerns while providing a comprehensive roadmap for transforming StyleMatch's product attribute system. The variant-centric approach, vendor-specific configurations, and clear separation of concerns create a robust foundation for a modern fashion marketplace.

**Key Success Factors:**

- **Variant-Centric Model**: Represents actual sellable units clearly
- **Vendor Flexibility**: Supports both global standards and custom requirements
- **Future-Proofing**: Architecture supports advanced marketplace features
- **Performance**: Optimized for scale and efficiency
- **Developer Experience**: Clear, maintainable, and extensible design

The new system will enable StyleMatch to:

- Support complex product variations with accurate inventory tracking
- Provide vendors with flexible, customizable product management
- Deliver superior customer experiences with precise availability and pricing
- Scale efficiently as the marketplace grows
- Integrate advanced features like AI-driven recommendations and analytics

By following this specification, StyleMatch will have a world-class product attribute system that can evolve with the business and provide a competitive advantage in the fashion marketplace space.
