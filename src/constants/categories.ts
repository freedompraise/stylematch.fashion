// src/constants/categories.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

// Main fashion categories for StyleMatch
export const FASHION_CATEGORIES: Category[] = [
  {
    id: 'dresses',
    name: 'Dresses',
    slug: 'dresses',
    description: 'All types of dresses'
  },
  {
    id: 'tops',
    name: 'Tops',
    slug: 'tops',
    description: 'Shirts, blouses, t-shirts, and other tops'
  },
  {
    id: 'bottoms',
    name: 'Bottoms',
    slug: 'bottoms',
    description: 'Pants, skirts, shorts, and other bottom wear'
  },
  {
    id: 'outerwear',
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Jackets, coats, blazers, and outer layers'
  },
  {
    id: 'shoes',
    name: 'Shoes',
    slug: 'shoes',
    description: 'All types of footwear'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Bags, jewelry, belts, and other accessories'
  },
  {
    id: 'activewear',
    name: 'Activewear',
    slug: 'activewear',
    description: 'Sportswear and athletic clothing'
  },
  {
    id: 'underwear',
    name: 'Underwear & Lingerie',
    slug: 'underwear',
    description: 'Intimate wear and undergarments'
  }
];

// Helper functions for category management
export const getCategoryById = (id: string): Category | undefined => {
  return FASHION_CATEGORIES.find(category => category.id === id);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return FASHION_CATEGORIES.find(category => category.slug === slug);
};

export const getCategoryName = (id: string): string => {
  const category = getCategoryById(id);
  return category?.name || id;
};

export const getCategoryOptions = () => {
  return FASHION_CATEGORIES.map(category => ({
    value: category.id,
    label: category.name
  }));
};

// For backward compatibility with existing data
export const LEGACY_CATEGORY_MAPPING: Record<string, string> = {
  'clothing': 'tops', // Map generic 'clothing' to 'tops' as default
};

export const normalizeCategory = (category: string): string => {
  // Handle legacy categories
  if (LEGACY_CATEGORY_MAPPING[category.toLowerCase()]) {
    return LEGACY_CATEGORY_MAPPING[category.toLowerCase()];
  }
  
  // Return the category if it exists in our list
  const normalizedCategory = category.toLowerCase();
  const exists = FASHION_CATEGORIES.some(cat => cat.id === normalizedCategory);
  
  return exists ? normalizedCategory : 'tops'; // Default to 'tops' if not found
};

// Category validation
export const isValidCategory = (category: string): boolean => {
  return FASHION_CATEGORIES.some(cat => cat.id === category.toLowerCase());
};

// Get all category IDs as array
export const getAllCategoryIds = (): string[] => {
  return FASHION_CATEGORIES.map(category => category.id);
};

// Get all category names as array
export const getAllCategoryNames = (): string[] => {
  return FASHION_CATEGORIES.map(category => category.name);
};
