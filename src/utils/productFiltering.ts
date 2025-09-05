// src/utils/productFiltering.ts

import { Product } from '@/types/ProductSchema';
import { getCategoryName } from '@/constants/categories';

export interface ProductFilters {
  search: string;
  category: string;
  priceRange: string;
  stockStatus: string;
}

export interface FilteredProductsResult {
  filteredProducts: Product[];
  totalCount: number;
  hasResults: boolean;
}

/**
 * Filters products based on the provided filter criteria
 */
export const filterProducts = (
  products: Product[],
  filters: ProductFilters
): FilteredProductsResult => {
  let filtered = [...products];

  // Search filter
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      getCategoryName(product.category).toLowerCase().includes(searchTerm)
    );
  }

  // Category filter
  if (filters.category && filters.category !== '' && filters.category !== 'all') {
    filtered = filtered.filter(product => product.category === filters.category);
  }

  // Price range filter
  if (filters.priceRange && filters.priceRange !== '' && filters.priceRange !== 'all') {
    filtered = filtered.filter(product => {
      const price = product.price;
      switch (filters.priceRange) {
        case '0-5000':
          return price >= 0 && price <= 5000;
        case '5001-15000':
          return price >= 5001 && price <= 15000;
        case '15001-30000':
          return price >= 15001 && price <= 30000;
        case '30001-50000':
          return price >= 30001 && price <= 50000;
        case '50001+':
          return price >= 50001;
        default:
          return true;
      }
    });
  }

  // Stock status filter
  if (filters.stockStatus && filters.stockStatus !== '' && filters.stockStatus !== 'all') {
    filtered = filtered.filter(product => {
      const stock = product.stock_quantity;
      switch (filters.stockStatus) {
        case 'in-stock':
          return stock > 5;
        case 'low-stock':
          return stock > 0 && stock <= 5;
        case 'out-of-stock':
          return stock === 0;
        default:
          return true;
      }
    });
  }

  return {
    filteredProducts: filtered,
    totalCount: filtered.length,
    hasResults: filtered.length > 0
  };
};

/**
 * Gets the stock status of a product
 */
export const getProductStockStatus = (product: Product): 'in-stock' | 'low-stock' | 'out-of-stock' => {
  const stock = product.stock_quantity;
  if (stock === 0) return 'out-of-stock';
  if (stock <= 5) return 'low-stock';
  return 'in-stock';
};

/**
 * Gets the stock status badge variant for UI display
 */
export const getStockStatusBadgeVariant = (status: 'in-stock' | 'low-stock' | 'out-of-stock') => {
  switch (status) {
    case 'in-stock':
      return 'default';
    case 'low-stock':
      return 'secondary';
    case 'out-of-stock':
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * Gets the stock status display text
 */
export const getStockStatusText = (status: 'in-stock' | 'low-stock' | 'out-of-stock') => {
  switch (status) {
    case 'in-stock':
      return 'In Stock';
    case 'low-stock':
      return 'Low Stock';
    case 'out-of-stock':
      return 'Out of Stock';
    default:
      return 'Unknown';
  }
};

/**
 * Sorts products by various criteria
 */
export const sortProducts = (
  products: Product[],
  sortBy: 'name' | 'price' | 'stock' | 'created_at' | 'category',
  sortOrder: 'asc' | 'desc' = 'asc'
): Product[] => {
  return [...products].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'stock':
        aValue = a.stock_quantity;
        bValue = b.stock_quantity;
        break;
      case 'created_at':
        aValue = new Date(a.created_at || '').getTime();
        bValue = new Date(b.created_at || '').getTime();
        break;
      case 'category':
        aValue = getCategoryName(a.category).toLowerCase();
        bValue = getCategoryName(b.category).toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Gets filter summary for display
 */
export const getFilterSummary = (filters: ProductFilters, totalProducts: number, filteredCount: number) => {
  const activeFilters = [];
  
  if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
  if (filters.category && filters.category !== 'all') activeFilters.push(`Category: ${getCategoryName(filters.category)}`);
  if (filters.priceRange && filters.priceRange !== 'all') {
    let priceText;
    if (filters.priceRange === '50001+') {
      priceText = '₦50,001+';
    } else {
      const [min, max] = filters.priceRange.split('-');
      priceText = `₦${parseInt(min).toLocaleString()} - ₦${parseInt(max).toLocaleString()}`;
    }
    activeFilters.push(`Price: ${priceText}`);
  }
  if (filters.stockStatus && filters.stockStatus !== 'all') {
    activeFilters.push(`Stock: ${getStockStatusText(filters.stockStatus as any)}`);
  }

  return {
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,
    summary: `${filteredCount} of ${totalProducts} products`,
    clearText: activeFilters.length > 0 ? `Clear ${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''}` : 'Clear filters'
  };
};
