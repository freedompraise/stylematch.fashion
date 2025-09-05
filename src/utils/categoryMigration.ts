// src/utils/categoryMigration.ts

import { normalizeCategory, LEGACY_CATEGORY_MAPPING } from '@/constants/categories';

/**
 * Migration utility to help normalize existing product categories
 * This should be used when migrating existing data to the new category system
 */

export interface ProductWithLegacyCategory {
  id: string;
  category: string;
  [key: string]: any;
}

/**
 * Normalizes a single product's category
 */
export const normalizeProductCategory = (product: ProductWithLegacyCategory): ProductWithLegacyCategory => {
  return {
    ...product,
    category: normalizeCategory(product.category)
  };
};

/**
 * Normalizes categories for an array of products
 */
export const normalizeProductCategories = (products: ProductWithLegacyCategory[]): ProductWithLegacyCategory[] => {
  return products.map(normalizeProductCategory);
};

/**
 * Gets a summary of category migration needed
 */
export const getCategoryMigrationSummary = (products: ProductWithLegacyCategory[]) => {
  const categoryCounts: Record<string, number> = {};
  const legacyCategories: Record<string, number> = {};
  
  products.forEach(product => {
    const currentCategory = product.category;
    const normalizedCategory = normalizeCategory(currentCategory);
    
    // Count current categories
    categoryCounts[currentCategory] = (categoryCounts[currentCategory] || 0) + 1;
    
    // Track legacy categories that will be changed
    if (currentCategory !== normalizedCategory) {
      legacyCategories[currentCategory] = (legacyCategories[currentCategory] || 0) + 1;
    }
  });
  
  return {
    totalProducts: products.length,
    uniqueCategories: Object.keys(categoryCounts).length,
    legacyCategories,
    migrationNeeded: Object.keys(legacyCategories).length > 0,
    categoryCounts
  };
};

/**
 * Validates that all categories in a product array are valid
 */
export const validateProductCategories = (products: ProductWithLegacyCategory[]): {
  valid: boolean;
  invalidProducts: ProductWithLegacyCategory[];
  invalidCategories: string[];
} => {
  const invalidProducts: ProductWithLegacyCategory[] = [];
  const invalidCategories = new Set<string>();
  
  products.forEach(product => {
    const normalizedCategory = normalizeCategory(product.category);
    if (normalizedCategory === 'tops' && !LEGACY_CATEGORY_MAPPING[product.category.toLowerCase()]) {
      // This means the category wasn't found in our valid categories
      invalidProducts.push(product);
      invalidCategories.add(product.category);
    }
  });
  
  return {
    valid: invalidProducts.length === 0,
    invalidProducts,
    invalidCategories: Array.from(invalidCategories)
  };
};

/**
 * Example usage for database migration
 */
export const migrateDatabaseCategories = async (products: ProductWithLegacyCategory[]) => {
  console.log('Starting category migration...');
  
  const summary = getCategoryMigrationSummary(products);
  console.log('Migration summary:', summary);
  
  if (!summary.migrationNeeded) {
    console.log('No migration needed - all categories are already valid');
    return products;
  }
  
  console.log('Migrating categories...');
  const migratedProducts = normalizeProductCategories(products);
  
  console.log('Migration completed');
  return migratedProducts;
};
