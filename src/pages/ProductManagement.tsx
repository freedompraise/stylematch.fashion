import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from '@/contexts/SessionContext';
import { Product } from '@/types/ProductSchema';
import * as productService from '@/services/productService';
import { FilterBar, FilterConfig, FilterValue } from '@/components/vendor/FilterBar';
import { QuickActions, productsQuickActions } from '@/components/vendor/QuickActions';
import { AddProductDialog } from '@/components/vendor/products/AddProductDialog';
import { ProductList } from '@/components/vendor/products/ProductList';

const filterConfigs: FilterConfig[] = [
  {
    id: 'category',
    label: 'Category',
    type: 'select',
    options: [{ label: 'All Categories', value: '' }],
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterValue>({});

  useEffect(() => {
    if (!session?.user?.id) return;
  
    const loadProducts = async () => {
      try {
        const vendorProducts = await productService.getVendorProducts(session.user.id);
        if (!Array.isArray(vendorProducts)) {
          console.error('vendorProducts is not an array:', vendorProducts);
          return;
        }
        setAllProducts(vendorProducts);
        setProducts(vendorProducts);
      } catch (error) {
        console.error('Error loading products:', error); // Debug log
        toast({
          title: 'Error loading products',
          description: 'Could not load your products. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [session?.user?.id, toast]);
  
  const handleFilterChange = (filters: FilterValue) => {
    setActiveFilters(filters);

    let filtered = [...allProducts];

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(p => {
        const status =
          p.stock_quantity <= 5 && p.stock_quantity > 0
            ? 'Low Stock'
            : p.stock_quantity === 0
            ? 'Out of Stock'
            : 'In Stock';
        return status === filters.status;
      });
    }

    if (Array.isArray(filters.price)) {
      const [min, max] = filters.price;
      filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setProducts(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleFilterChange(activeFilters);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      const updated = allProducts.filter(p => p.id !== productId);
      setAllProducts(updated);
      setProducts(updated);
      toast({
        title: 'Product deleted',
        description: 'Your product has been deleted successfully.',
      });
    } catch {
      toast({
        title: 'Error deleting product',
        description: 'Could not delete your product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStock = async (productId: string, quantity: number) => {
    try {
      await productService.updateProductStock(productId, quantity);
      const updated = allProducts.map(p =>
        p.id === productId ? { ...p, stock_quantity: quantity } : p
      );
      setAllProducts(updated);
      handleFilterChange(activeFilters);
      toast({
        title: 'Stock updated',
        description: 'Product stock has been updated successfully.',
      });
    } catch {
      toast({
        title: 'Error updating stock',
        description: 'Could not update product stock. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleProductAdded = (product: Product) => {
    const updated = [product, ...allProducts];
    setAllProducts(updated);
    handleFilterChange(activeFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <AddProductDialog onProductsAdded={products => handleProductAdded(products[0])} />
      </div>

      {products.length > 0 && <QuickActions actions={productsQuickActions} />}

      {products.length > 0 && (
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
      )}
     
      <ProductList
        products={products}
        onDeleteProduct={handleDeleteProduct}
        loading={loading}
      />

      {products.length === 0 && !loading && (
        <div className="text-center text-muted-foreground">
          No products in the database. You can add one by clicking the button above.
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
