// src/constants/colors.ts

export interface ColorOption {
  value: string;
  label: string;
  hex?: string;
  description?: string;
}

// Basic colors
export const BASIC_COLORS: ColorOption[] = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'gray', label: 'Gray', hex: '#808080' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { value: 'cream', label: 'Cream', hex: '#FFFDD0' },
  { value: 'ivory', label: 'Ivory', hex: '#FFFFF0' },
  { value: 'tan', label: 'Tan', hex: '#D2B48C' },
];

// Primary colors
export const PRIMARY_COLORS: ColorOption[] = [
  { value: 'red', label: 'Red', hex: '#FF0000' },
  { value: 'blue', label: 'Blue', hex: '#0000FF' },
  { value: 'green', label: 'Green', hex: '#008000' },
  { value: 'yellow', label: 'Yellow', hex: '#FFFF00' },
  { value: 'orange', label: 'Orange', hex: '#FFA500' },
  { value: 'purple', label: 'Purple', hex: '#800080' },
  { value: 'pink', label: 'Pink', hex: '#FFC0CB' },
  { value: 'cyan', label: 'Cyan', hex: '#00FFFF' },
];

// Fashion colors
export const FASHION_COLORS: ColorOption[] = [
  { value: 'navy', label: 'Navy', hex: '#000080' },
  { value: 'maroon', label: 'Maroon', hex: '#800000' },
  { value: 'burgundy', label: 'Burgundy', hex: '#800020' },
  { value: 'wine', label: 'Wine', hex: '#722F37' },
  { value: 'coral', label: 'Coral', hex: '#FF7F50' },
  { value: 'salmon', label: 'Salmon', hex: '#FA8072' },
  { value: 'peach', label: 'Peach', hex: '#FFE5B4' },
  { value: 'mint', label: 'Mint', hex: '#98FB98' },
  { value: 'teal', label: 'Teal', hex: '#008080' },
  { value: 'turquoise', label: 'Turquoise', hex: '#40E0D0' },
  { value: 'lavender', label: 'Lavender', hex: '#E6E6FA' },
  { value: 'lilac', label: 'Lilac', hex: '#C8A2C8' },
  { value: 'magenta', label: 'Magenta', hex: '#FF00FF' },
  { value: 'fuchsia', label: 'Fuchsia', hex: '#FF1493' },
  { value: 'rose', label: 'Rose', hex: '#FF69B4' },
  { value: 'gold', label: 'Gold', hex: '#FFD700' },
  { value: 'silver', label: 'Silver', hex: '#C0C0C0' },
  { value: 'bronze', label: 'Bronze', hex: '#CD7F32' },
  { value: 'copper', label: 'Copper', hex: '#B87333' },
  { value: 'champagne', label: 'Champagne', hex: '#F7E7CE' },
];

// Earth tones
export const EARTH_TONES: ColorOption[] = [
  { value: 'olive', label: 'Olive', hex: '#808000' },
  { value: 'sage', label: 'Sage', hex: '#9CAF88' },
  { value: 'forest-green', label: 'Forest Green', hex: '#228B22' },
  { value: 'emerald', label: 'Emerald', hex: '#50C878' },
  { value: 'jade', label: 'Jade', hex: '#00A86B' },
  { value: 'khaki', label: 'Khaki', hex: '#F0E68C' },
  { value: 'camel', label: 'Camel', hex: '#C19A6B' },
  { value: 'mocha', label: 'Mocha', hex: '#967259' },
  { value: 'espresso', label: 'Espresso', hex: '#614051' },
  { value: 'charcoal', label: 'Charcoal', hex: '#36454F' },
  { value: 'slate', label: 'Slate', hex: '#708090' },
  { value: 'stone', label: 'Stone', hex: '#8B8680' },
];

// Pastel colors
export const PASTEL_COLORS: ColorOption[] = [
  { value: 'baby-blue', label: 'Baby Blue', hex: '#89CFF0' },
  { value: 'baby-pink', label: 'Baby Pink', hex: '#F4C2C2' },
  { value: 'mint-green', label: 'Mint Green', hex: '#98FB98' },
  { value: 'lavender-pink', label: 'Lavender Pink', hex: '#FBAED2' },
  { value: 'lemon-yellow', label: 'Lemon Yellow', hex: '#FFFACD' },
  { value: 'peach-pink', label: 'Peach Pink', hex: '#FFCCCB' },
  { value: 'sky-blue', label: 'Sky Blue', hex: '#87CEEB' },
  { value: 'powder-blue', label: 'Powder Blue', hex: '#B0E0E6' },
  { value: 'soft-green', label: 'Soft Green', hex: '#C1E1C1' },
  { value: 'pale-yellow', label: 'Pale Yellow', hex: '#FFFFE0' },
];

// Metallic colors
export const METALLIC_COLORS: ColorOption[] = [
  { value: 'gold-metallic', label: 'Gold Metallic', hex: '#FFD700' },
  { value: 'silver-metallic', label: 'Silver Metallic', hex: '#C0C0C0' },
  { value: 'rose-gold', label: 'Rose Gold', hex: '#E8B4B8' },
  { value: 'copper-metallic', label: 'Copper Metallic', hex: '#B87333' },
  { value: 'bronze-metallic', label: 'Bronze Metallic', hex: '#CD7F32' },
  { value: 'platinum', label: 'Platinum', hex: '#E5E4E2' },
  { value: 'gunmetal', label: 'Gunmetal', hex: '#2C3539' },
];

// Pattern/Print colors
export const PATTERN_COLORS: ColorOption[] = [
  { value: 'multicolor', label: 'Multicolor', description: 'Multiple colors' },
  { value: 'striped', label: 'Striped', description: 'Striped pattern' },
  { value: 'polka-dot', label: 'Polka Dot', description: 'Polka dot pattern' },
  { value: 'floral', label: 'Floral', description: 'Floral pattern' },
  { value: 'geometric', label: 'Geometric', description: 'Geometric pattern' },
  { value: 'animal-print', label: 'Animal Print', description: 'Animal print pattern' },
  { value: 'tie-dye', label: 'Tie Dye', description: 'Tie dye pattern' },
  { value: 'gradient', label: 'Gradient', description: 'Gradient color' },
  { value: 'ombre', label: 'Ombre', description: 'Ombre effect' },
  { value: 'marble', label: 'Marble', description: 'Marble pattern' },
];

// All colors combined
export const ALL_COLORS: ColorOption[] = [
  ...BASIC_COLORS,
  ...PRIMARY_COLORS,
  ...FASHION_COLORS,
  ...EARTH_TONES,
  ...PASTEL_COLORS,
  ...METALLIC_COLORS,
  ...PATTERN_COLORS,
];

// Helper functions
export const getColorOptions = (): ColorOption[] => {
  return ALL_COLORS;
};

// Color contrast helper function
export const getContrastColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export const getColorByValue = (value: string): ColorOption | undefined => {
  return ALL_COLORS.find(color => color.value === value);
};

export const getColorLabel = (value: string): string => {
  const color = getColorByValue(value);
  return color?.label || value;
};

export const getColorHex = (value: string): string | undefined => {
  const color = getColorByValue(value);
  return color?.hex;
};

export const getColorDescription = (value: string): string | undefined => {
  const color = getColorByValue(value);
  return color?.description;
};

// Color validation
export const isValidColor = (color: string): boolean => {
  return ALL_COLORS.some(c => c.value === color);
};

// Get colors by category (for potential future use)
export const getColorsByCategory = (category: 'basic' | 'primary' | 'fashion' | 'earth' | 'pastel' | 'metallic' | 'pattern'): ColorOption[] => {
  switch (category) {
    case 'basic':
      return BASIC_COLORS;
    case 'primary':
      return PRIMARY_COLORS;
    case 'fashion':
      return FASHION_COLORS;
    case 'earth':
      return EARTH_TONES;
    case 'pastel':
      return PASTEL_COLORS;
    case 'metallic':
      return METALLIC_COLORS;
    case 'pattern':
      return PATTERN_COLORS;
    default:
      return ALL_COLORS;
  }
};

// Search colors by name
export const searchColors = (query: string): ColorOption[] => {
  const lowercaseQuery = query.toLowerCase();
  return ALL_COLORS.filter(color => 
    color.label.toLowerCase().includes(lowercaseQuery) ||
    color.value.toLowerCase().includes(lowercaseQuery) ||
    (color.description && color.description.toLowerCase().includes(lowercaseQuery))
  );
};
