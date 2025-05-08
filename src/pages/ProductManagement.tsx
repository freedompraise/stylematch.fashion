import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from '@/contexts/SessionContext';
import { Product } from '@/types';
import * as productService from '@/services/productService';
import { FilterBar, FilterConfig, FilterValue } from '@/components/vendor/FilterBar';
import { QuickActions, productsQuickActions } from '@/components/vendor/QuickActions';
import { AddProductDialog } from '@/components/vendor/products/AddProductDialog';
import { ProductList } from '@/components/vendor/products/ProductList';

// Categories for dropdown
const categories = [
  'All Categories', 
  'Dresses', 
  'Tops', 
  'Bottoms', 
  'Accessories', 
  'Shoes', 
  'Outerwear'
];

// Filter configurations
const filterConfigs: FilterConfig[] = [
  {
    id: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'All Categories', value: '' },
      { label: 'Dresses', value: 'Dresses' },
      { label: 'Tops', value: 'Tops' },
      { label: 'Bottoms', value: 'Bottoms' },
      { label: 'Accessories', value: 'Accessories' },
    ],
  },
  {
    id: 'status',
    label: 'Stock Status',
    type: 'select',
    options: [
      { label: 'All Statuses', value: '' },
      { label: 'In Stock', value: 'In Stock' },
      { label: 'Low Stock', value: 'Low Stock' },
      { label: 'Out of Stock', value: 'Out of Stock' },
    ],
  },
  {
    id: 'price',
    label: 'Price Range',
    type: 'range',
    min: 0,
    max: 100,
    step: 10,
  },
];

const ProductManagement: React.FC = () => {
  const { toast } = useToast();
  const { session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterValue>({});

  // Load vendor's products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (session?.user?.id) {
          const vendorProducts = await productService.getVendorProducts(session.user.id);
          setProducts(vendorProducts);
        }
      } catch (error) {
        toast({
          title: "Error loading products",
          description: "Could not load your products. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [session?.user?.id]);

  // Handle filter changes
  const handleFilterChange = (filters: FilterValue) => {
    setActiveFilters(filters);
    
    // Apply filters to products
    let filteredProducts = [...products];
    
    // Apply category filter
    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category === filters.category
      );
    }
    
    // Apply status filter
    if (filters.status) {
      filteredProducts = filteredProducts.filter(
        product => product.stock <= 5 && product.stock > 0 ? 'Low Stock' : product.stock === 0 ? 'Out of Stock' : 'In Stock' === filters.status
      );
    }
    
    // Apply price range filter
    if (Array.isArray(filters.price)) {
      const [min, max] = filters.price as [number, number];
      filteredProducts = filteredProducts.filter(
        product => product.price >= min && product.price <= max
      );
    }
    
    // Apply search query
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(
        product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setProducts(filteredProducts);
  };

  // Handle search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Re-apply filters with new search query
    handleFilterChange(activeFilters);
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Product deleted",
        description: "Your product has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error deleting product",
        description: "Could not delete your product. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update product stock
  const handleUpdateStock = async (productId: string, quantity: number) => {
    try {
      await productService.updateProductStock(productId, quantity);
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: quantity } : p
      ));
      toast({
        title: "Stock updated",
        description: "Product stock has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error updating stock",
        description: "Could not update product stock. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle product added from dialog
  const handleProductAdded = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  return (
                <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <AddProductDialog onProductsAdded={(products) => handleProductAdded(products[0])} />
      </div>
      
      {/* Quick Actions */}
      <QuickActions actions={productsQuickActions} />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search products..." 
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <FilterBar
          filters={filterConfigs}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </div>
      
      {/* Products Table */}
      <ProductList 
        products={products} 
        onDeleteProduct={handleDeleteProduct} 
        onUpdateStock={handleUpdateStock}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

export default ProductManagement;
