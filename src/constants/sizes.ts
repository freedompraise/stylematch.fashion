// src/constants/sizes.ts

export interface SizeOption {
  value: string;
  label: string;
  description?: string;
}

export interface SizeCategory {
  categoryId: string;
  sizes: SizeOption[];
  hasCustomSizes?: boolean;
  customSizePlaceholder?: string;
}

// Universal sizing system
export const UNIVERSAL_SIZES: SizeOption[] = [
  { value: 'xs', label: 'XS', description: 'Extra Small' },
  { value: 's', label: 'S', description: 'Small' },
  { value: 'm', label: 'M', description: 'Medium' },
  { value: 'l', label: 'L', description: 'Large' },
  { value: 'xl', label: 'XL', description: 'Extra Large' },
  { value: 'xxl', label: 'XXL', description: '2X Large' },
  { value: 'xxxl', label: '3XL', description: '3X Large' },
  { value: '4xl', label: '4XL', description: '4X Large' },
  { value: '5xl', label: '5XL', description: '5X Large' },
];

// US Women's clothing sizes
export const US_WOMENS_SIZES: SizeOption[] = [
  { value: '0', label: '0' },
  { value: '2', label: '2' },
  { value: '4', label: '4' },
  { value: '6', label: '6' },
  { value: '8', label: '8' },
  { value: '10', label: '10' },
  { value: '12', label: '12' },
  { value: '14', label: '14' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
  { value: '20', label: '20' },
  { value: '22', label: '22' },
];

// US Men's clothing sizes
export const US_MENS_SIZES: SizeOption[] = [
  { value: '28', label: '28' },
  { value: '30', label: '30' },
  { value: '32', label: '32' },
  { value: '34', label: '34' },
  { value: '36', label: '36' },
  { value: '38', label: '38' },
  { value: '40', label: '40' },
  { value: '42', label: '42' },
  { value: '44', label: '44' },
  { value: '46', label: '46' },
  { value: '48', label: '48' },
  { value: '50', label: '50' },
];

// US Shoe sizes (Women)
export const US_WOMENS_SHOE_SIZES: SizeOption[] = [
  { value: '5', label: '5' },
  { value: '5.5', label: '5.5' },
  { value: '6', label: '6' },
  { value: '6.5', label: '6.5' },
  { value: '7', label: '7' },
  { value: '7.5', label: '7.5' },
  { value: '8', label: '8' },
  { value: '8.5', label: '8.5' },
  { value: '9', label: '9' },
  { value: '9.5', label: '9.5' },
  { value: '10', label: '10' },
  { value: '10.5', label: '10.5' },
  { value: '11', label: '11' },
  { value: '11.5', label: '11.5' },
  { value: '12', label: '12' },
];

// US Shoe sizes (Men)
export const US_MENS_SHOE_SIZES: SizeOption[] = [
  { value: '6', label: '6' },
  { value: '6.5', label: '6.5' },
  { value: '7', label: '7' },
  { value: '7.5', label: '7.5' },
  { value: '8', label: '8' },
  { value: '8.5', label: '8.5' },
  { value: '9', label: '9' },
  { value: '9.5', label: '9.5' },
  { value: '10', label: '10' },
  { value: '10.5', label: '10.5' },
  { value: '11', label: '11' },
  { value: '11.5', label: '11.5' },
  { value: '12', label: '12' },
  { value: '12.5', label: '12.5' },
  { value: '13', label: '13' },
  { value: '13.5', label: '13.5' },
  { value: '14', label: '14' },
  { value: '15', label: '15' },
];

// European shoe sizes (Universal)
export const EU_SHOE_SIZES: SizeOption[] = [
  { value: '34', label: '34' },
  { value: '35', label: '35' },
  { value: '36', label: '36' },
  { value: '37', label: '37' },
  { value: '38', label: '38' },
  { value: '39', label: '39' },
  { value: '40', label: '40' },
  { value: '41', label: '41' },
  { value: '42', label: '42' },
  { value: '43', label: '43' },
  { value: '44', label: '44' },
  { value: '45', label: '45' },
  { value: '46', label: '46' },
  { value: '47', label: '47' },
];

// Extended shoe sizes for special cases
export const EXTENDED_SHOE_SIZES: SizeOption[] = [
  { value: '47+', label: '47+', description: '47 and above' },
];

// Bra sizes
export const BRA_SIZES: SizeOption[] = [
  { value: '32A', label: '32A' },
  { value: '32B', label: '32B' },
  { value: '32C', label: '32C' },
  { value: '32D', label: '32D' },
  { value: '34A', label: '34A' },
  { value: '34B', label: '34B' },
  { value: '34C', label: '34C' },
  { value: '34D', label: '34D' },
  { value: '34DD', label: '34DD' },
  { value: '36A', label: '36A' },
  { value: '36B', label: '36B' },
  { value: '36C', label: '36C' },
  { value: '36D', label: '36D' },
  { value: '36DD', label: '36DD' },
  { value: '38A', label: '38A' },
  { value: '38B', label: '38B' },
  { value: '38C', label: '38C' },
  { value: '38D', label: '38D' },
  { value: '38DD', label: '38DD' },
  { value: '40B', label: '40B' },
  { value: '40C', label: '40C' },
  { value: '40D', label: '40D' },
  { value: '40DD', label: '40DD' },
];

// Ring sizes
export const RING_SIZES: SizeOption[] = [
  { value: '4', label: '4' },
  { value: '4.5', label: '4.5' },
  { value: '5', label: '5' },
  { value: '5.5', label: '5.5' },
  { value: '6', label: '6' },
  { value: '6.5', label: '6.5' },
  { value: '7', label: '7' },
  { value: '7.5', label: '7.5' },
  { value: '8', label: '8' },
  { value: '8.5', label: '8.5' },
  { value: '9', label: '9' },
  { value: '9.5', label: '9.5' },
  { value: '10', label: '10' },
  { value: '10.5', label: '10.5' },
  { value: '11', label: '11' },
];

// One size fits all
export const ONE_SIZE: SizeOption[] = [
  { value: 'one-size', label: 'One Size', description: 'One Size Fits All' },
];

// No size applicable
export const NO_SIZE: SizeOption[] = [
  { value: 'no-size', label: 'No Size', description: 'Size not applicable' },
];

// Helper function to remove duplicate sizes
const removeDuplicateSizes = (sizes: SizeOption[]): SizeOption[] => {
  const seen = new Set<string>();
  return sizes.filter(size => {
    if (seen.has(size.value)) {
      return false;
    }
    seen.add(size.value);
    return true;
  });
};

// Category-specific size configurations
export const SIZE_CATEGORIES: SizeCategory[] = [
  {
    categoryId: 'dresses',
    sizes: removeDuplicateSizes([...UNIVERSAL_SIZES, ...US_WOMENS_SIZES]),
    hasCustomSizes: true,
    customSizePlaceholder: 'e.g., 2T, 4T, 6T (for kids)'
  },
  {
    categoryId: 'tops',
    sizes: removeDuplicateSizes([...UNIVERSAL_SIZES, ...US_WOMENS_SIZES, ...US_MENS_SIZES]),
    hasCustomSizes: true,
    customSizePlaceholder: 'e.g., 2T, 4T, 6T (for kids)'
  },
  {
    categoryId: 'bottoms',
    sizes: removeDuplicateSizes([...UNIVERSAL_SIZES, ...US_WOMENS_SIZES, ...US_MENS_SIZES]),
    hasCustomSizes: true,
    customSizePlaceholder: 'e.g., 28x32, 30x34 (waist x length)'
  },
  {
    categoryId: 'outerwear',
    sizes: removeDuplicateSizes([...UNIVERSAL_SIZES, ...US_WOMENS_SIZES, ...US_MENS_SIZES]),
    hasCustomSizes: true,
    customSizePlaceholder: 'e.g., 2T, 4T, 6T (for kids)'
  },
  {
    categoryId: 'shoes',
    sizes: removeDuplicateSizes([...US_WOMENS_SHOE_SIZES, ...US_MENS_SHOE_SIZES, ...EU_SHOE_SIZES, ...EXTENDED_SHOE_SIZES]),
    hasCustomSizes: true,
    customSizePlaceholder: 'e.g., 47+ (extended sizes)'
  },
  {
    categoryId: 'accessories',
    sizes: removeDuplicateSizes([...ONE_SIZE, ...RING_SIZES]),
    hasCustomSizes: true,
    customSizePlaceholder: 'e.g., Small, Medium, Large (for bags)'
  },
  {
    categoryId: 'activewear',
    sizes: removeDuplicateSizes([...UNIVERSAL_SIZES, ...US_WOMENS_SIZES, ...US_MENS_SIZES]),
    hasCustomSizes: true,
    customSizePlaceholder: 'e.g., 2T, 4T, 6T (for kids)'
  },
  {
    categoryId: 'underwear',
    sizes: removeDuplicateSizes([...UNIVERSAL_SIZES, ...US_WOMENS_SIZES, ...US_MENS_SIZES, ...BRA_SIZES]),
    hasCustomSizes: true,
    customSizePlaceholder: 'e.g., 2T, 4T, 6T (for kids)'
  }
];

// Helper functions
export const getSizesForCategory = (categoryId: string): SizeOption[] => {
  const sizeCategory = SIZE_CATEGORIES.find(sc => sc.categoryId === categoryId);
  return sizeCategory?.sizes || UNIVERSAL_SIZES;
};

export const getSizeCategoryConfig = (categoryId: string): SizeCategory | undefined => {
  return SIZE_CATEGORIES.find(sc => sc.categoryId === categoryId);
};

export const hasCustomSizes = (categoryId: string): boolean => {
  const config = getSizeCategoryConfig(categoryId);
  return config?.hasCustomSizes || false;
};

export const getCustomSizePlaceholder = (categoryId: string): string => {
  const config = getSizeCategoryConfig(categoryId);
  return config?.customSizePlaceholder || 'Enter custom size';
};

export const getSizeOptions = (categoryId: string) => {
  const sizes = getSizesForCategory(categoryId);
  return sizes.map(size => ({
    value: size.value,
    label: size.label,
    description: size.description
  }));
};

// Size validation
export const isValidSize = (size: string, categoryId: string): boolean => {
  const sizes = getSizesForCategory(categoryId);
  return sizes.some(s => s.value === size);
};

// Get size label by value
export const getSizeLabel = (sizeValue: string, categoryId: string): string => {
  const sizes = getSizesForCategory(categoryId);
  const size = sizes.find(s => s.value === sizeValue);
  return size?.label || sizeValue;
};

// Get size description by value
export const getSizeDescription = (sizeValue: string, categoryId: string): string | undefined => {
  const sizes = getSizesForCategory(categoryId);
  const size = sizes.find(s => s.value === sizeValue);
  return size?.description;
};
